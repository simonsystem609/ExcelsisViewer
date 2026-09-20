#include "dxf_thumbnail_core.h"
#include "generated-runtime-integrity.h"

#include <bcrypt.h>
#include <objidl.h>
#include <shlobj.h>
#include <shobjidl.h>
#include <thumbcache.h>

#include <algorithm>
#include <array>
#include <atomic>
#include <cstdint>
#include <cstring>
#include <cwchar>
#include <new>
#include <mutex>
#include <string>
#include <vector>

namespace {

constexpr wchar_t kProviderClsidText[] = L"{5A957B88-4A4F-4D58-90A1-D0BFBC2E2939}";
constexpr wchar_t kProviderName[] = L"Excelsis Document Thumbnail Provider";
constexpr wchar_t kThumbnailInterfaceText[] = L"{E357FCCD-A995-4576-B01F-234630154E96}";
constexpr std::array<const wchar_t*, 3> kExtensions = {L".dxf", L".dwg", L".pdf"};
constexpr GUID kProviderClsid = {
    0x5a957b88, 0x4a4f, 0x4d58, {0x90, 0xa1, 0xd0, 0xbf, 0xbc, 0x2e, 0x29, 0x39}};
constexpr GUID kInitializeWithStreamIid = {
    0xb824b49d, 0x22ac, 0x4161, {0xac, 0x8a, 0x99, 0x16, 0xe8, 0xfa, 0x3f, 0x7f}};
constexpr GUID kThumbnailProviderIid = {
    0xe357fccd, 0xa995, 0x4576, {0xb0, 0x1f, 0x23, 0x46, 0x30, 0x15, 0x4e, 0x96}};

HMODULE g_module = nullptr;
std::atomic<long> g_objectCount{0};
std::atomic<long> g_lockCount{0};

bool SameGuid(REFIID left, const GUID& right) {
  return InlineIsEqualGUID(left, right) != FALSE;
}

HRESULT ReadStream(IStream* stream, std::vector<std::uint8_t>* data) {
  if (stream == nullptr || data == nullptr) return E_POINTER;
  STATSTG stat{};
  HRESULT result = stream->Stat(&stat, STATFLAG_NONAME);
  if (FAILED(result)) return result;
  if (stat.cbSize.QuadPart <= 0) return HRESULT_FROM_WIN32(ERROR_BAD_FORMAT);
  if (stat.cbSize.QuadPart > static_cast<ULONGLONG>(excelsis::thumbnail::kMaxInputBytes)) {
    return HRESULT_FROM_WIN32(ERROR_FILE_TOO_LARGE);
  }

  LARGE_INTEGER origin{};
  result = stream->Seek(origin, STREAM_SEEK_SET, nullptr);
  if (FAILED(result)) return result;
  data->resize(static_cast<std::size_t>(stat.cbSize.QuadPart));
  std::size_t offset = 0;
  while (offset < data->size()) {
    const ULONG chunk = static_cast<ULONG>(std::min<std::size_t>(data->size() - offset, 1024u * 1024u));
    ULONG bytesRead = 0;
    result = stream->Read(data->data() + offset, chunk, &bytesRead);
    if (FAILED(result)) return result;
    if (bytesRead == 0) return HRESULT_FROM_WIN32(ERROR_HANDLE_EOF);
    offset += bytesRead;
  }
  return S_OK;
}

bool StartsWith(
    const std::vector<std::uint8_t>& data,
    const char* signature,
    std::size_t signatureLength) {
  return data.size() >= signatureLength &&
      std::equal(signature, signature + signatureLength, data.begin());
}

HRESULT ReadFileBytes(const std::wstring& path, std::vector<std::uint8_t>* data) {
  if (data == nullptr) return E_POINTER;
  HANDLE file = CreateFileW(
      path.c_str(),
      GENERIC_READ,
      FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
      nullptr,
      OPEN_EXISTING,
      FILE_ATTRIBUTE_NORMAL,
      nullptr);
  if (file == INVALID_HANDLE_VALUE) return HRESULT_FROM_WIN32(GetLastError());
  LARGE_INTEGER size{};
  if (!GetFileSizeEx(file, &size)) {
    const HRESULT result = HRESULT_FROM_WIN32(GetLastError());
    CloseHandle(file);
    return result;
  }
  if (size.QuadPart <= 0 ||
      size.QuadPart > static_cast<LONGLONG>(excelsis::thumbnail::kMaxInputBytes)) {
    CloseHandle(file);
    return HRESULT_FROM_WIN32(ERROR_FILE_TOO_LARGE);
  }
  data->resize(static_cast<std::size_t>(size.QuadPart));
  std::size_t offset = 0;
  while (offset < data->size()) {
    const DWORD chunk = static_cast<DWORD>(
        std::min<std::size_t>(data->size() - offset, 1024u * 1024u));
    DWORD bytesRead = 0;
    if (!ReadFile(file, data->data() + offset, chunk, &bytesRead, nullptr)) {
      const HRESULT result = HRESULT_FROM_WIN32(GetLastError());
      CloseHandle(file);
      return result;
    }
    if (bytesRead == 0) {
      CloseHandle(file);
      return HRESULT_FROM_WIN32(ERROR_HANDLE_EOF);
    }
    offset += bytesRead;
  }
  CloseHandle(file);
  return S_OK;
}

std::uint16_t ReadUint16(const std::uint8_t* value) {
  return static_cast<std::uint16_t>(value[0]) |
      (static_cast<std::uint16_t>(value[1]) << 8);
}

std::uint32_t ReadUint32(const std::uint8_t* value) {
  return static_cast<std::uint32_t>(value[0]) |
      (static_cast<std::uint32_t>(value[1]) << 8) |
      (static_cast<std::uint32_t>(value[2]) << 16) |
      (static_cast<std::uint32_t>(value[3]) << 24);
}

HRESULT LoadBmpThumbnail(
    const std::wstring& path,
    UINT expectedPixels,
    HBITMAP* bitmap) {
  if (bitmap == nullptr) return E_POINTER;
  std::vector<std::uint8_t> source;
  HRESULT result = ReadFileBytes(path, &source);
  if (FAILED(result)) return result;
  if (source.size() < 54 || source[0] != 'B' || source[1] != 'M') {
    return HRESULT_FROM_WIN32(ERROR_BAD_FORMAT);
  }
  const std::uint32_t pixelOffset = ReadUint32(source.data() + 10);
  const std::int32_t width = static_cast<std::int32_t>(ReadUint32(source.data() + 18));
  const std::int32_t signedHeight = static_cast<std::int32_t>(ReadUint32(source.data() + 22));
  const std::uint16_t planes = ReadUint16(source.data() + 26);
  const std::uint16_t bits = ReadUint16(source.data() + 28);
  const std::uint32_t compression = ReadUint32(source.data() + 30);
  const std::int32_t height = signedHeight < 0 ? -signedHeight : signedHeight;
  if (width <= 0 || height <= 0 ||
      static_cast<UINT>(width) != expectedPixels ||
      static_cast<UINT>(height) != expectedPixels ||
      planes != 1 || bits != 32 || compression != BI_RGB) {
    return HRESULT_FROM_WIN32(ERROR_BAD_FORMAT);
  }
  const std::size_t rowBytes = static_cast<std::size_t>(width) * 4u;
  const std::size_t pixelBytes = rowBytes * static_cast<std::size_t>(height);
  if (pixelOffset > source.size() || pixelBytes > source.size() - pixelOffset) {
    return HRESULT_FROM_WIN32(ERROR_BAD_FORMAT);
  }
  BITMAPINFO info{};
  info.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
  info.bmiHeader.biWidth = width;
  info.bmiHeader.biHeight = -height;
  info.bmiHeader.biPlanes = 1;
  info.bmiHeader.biBitCount = 32;
  info.bmiHeader.biCompression = BI_RGB;
  void* destination = nullptr;
  HDC screen = GetDC(nullptr);
  HBITMAP loaded = CreateDIBSection(
      screen, &info, DIB_RGB_COLORS, &destination, nullptr, 0);
  ReleaseDC(nullptr, screen);
  if (loaded == nullptr || destination == nullptr) {
    if (loaded != nullptr) DeleteObject(loaded);
    return HRESULT_FROM_WIN32(GetLastError());
  }
  const std::uint8_t* pixels = source.data() + pixelOffset;
  if (signedHeight < 0) {
    std::memcpy(destination, pixels, pixelBytes);
  } else {
    auto* output = static_cast<std::uint8_t*>(destination);
    for (std::int32_t row = 0; row < height; ++row) {
      std::memcpy(
          output + static_cast<std::size_t>(row) * rowBytes,
          pixels + static_cast<std::size_t>(height - row - 1) * rowBytes,
          rowBytes);
    }
  }
  *bitmap = loaded;
  return S_OK;
}

HRESULT WriteFileBytes(
    const std::wstring& path,
    const std::vector<std::uint8_t>& data) {
  HANDLE file = CreateFileW(
      path.c_str(),
      GENERIC_WRITE,
      0,
      nullptr,
      CREATE_NEW,
      FILE_ATTRIBUTE_TEMPORARY,
      nullptr);
  if (file == INVALID_HANDLE_VALUE) return HRESULT_FROM_WIN32(GetLastError());
  std::size_t offset = 0;
  while (offset < data.size()) {
    const DWORD chunk = static_cast<DWORD>(
        std::min<std::size_t>(data.size() - offset, 1024u * 1024u));
    DWORD bytesWritten = 0;
    if (!WriteFile(file, data.data() + offset, chunk, &bytesWritten, nullptr)) {
      const HRESULT result = HRESULT_FROM_WIN32(GetLastError());
      CloseHandle(file);
      return result;
    }
    if (bytesWritten == 0) {
      CloseHandle(file);
      return HRESULT_FROM_WIN32(ERROR_WRITE_FAULT);
    }
    offset += bytesWritten;
  }
  CloseHandle(file);
  return S_OK;
}

std::wstring ParentDirectory(const std::wstring& path) {
  const std::size_t slash = path.find_last_of(L"\\/");
  return slash == std::wstring::npos ? std::wstring() : path.substr(0, slash);
}

HRESULT Sha256File(
    const std::wstring& filePath,
    std::array<std::uint8_t, 32>* digest) {
  if (digest == nullptr) return E_POINTER;
  HANDLE file = CreateFileW(
      filePath.c_str(),
      GENERIC_READ,
      FILE_SHARE_READ,
      nullptr,
      OPEN_EXISTING,
      FILE_ATTRIBUTE_NORMAL | FILE_FLAG_SEQUENTIAL_SCAN,
      nullptr);
  if (file == INVALID_HANDLE_VALUE) return HRESULT_FROM_WIN32(GetLastError());

  BCRYPT_ALG_HANDLE algorithm = nullptr;
  BCRYPT_HASH_HANDLE hash = nullptr;
  std::vector<std::uint8_t> hashObject;
  HRESULT result = E_FAIL;
  if (BCryptOpenAlgorithmProvider(
          &algorithm,
          BCRYPT_SHA256_ALGORITHM,
          nullptr,
          0) != 0) {
    CloseHandle(file);
    return E_FAIL;
  }
  DWORD objectBytes = 0;
  DWORD hashBytes = 0;
  DWORD returnedBytes = 0;
  if (BCryptGetProperty(
          algorithm,
          BCRYPT_OBJECT_LENGTH,
          reinterpret_cast<PUCHAR>(&objectBytes),
          sizeof(objectBytes),
          &returnedBytes,
          0) != 0 ||
      BCryptGetProperty(
          algorithm,
          BCRYPT_HASH_LENGTH,
          reinterpret_cast<PUCHAR>(&hashBytes),
          sizeof(hashBytes),
          &returnedBytes,
          0) != 0 ||
      hashBytes != digest->size()) {
    BCryptCloseAlgorithmProvider(algorithm, 0);
    CloseHandle(file);
    return E_FAIL;
  }
  hashObject.resize(objectBytes);
  if (BCryptCreateHash(
          algorithm,
          &hash,
          hashObject.data(),
          static_cast<ULONG>(hashObject.size()),
          nullptr,
          0,
          0) == 0) {
    std::vector<std::uint8_t> buffer(1024 * 1024);
    result = S_OK;
    while (true) {
      DWORD bytesRead = 0;
      if (!ReadFile(
              file,
              buffer.data(),
              static_cast<DWORD>(buffer.size()),
              &bytesRead,
              nullptr)) {
        result = HRESULT_FROM_WIN32(GetLastError());
        break;
      }
      if (bytesRead == 0) break;
      if (BCryptHashData(hash, buffer.data(), bytesRead, 0) != 0) {
        result = E_FAIL;
        break;
      }
    }
    if (SUCCEEDED(result) &&
        BCryptFinishHash(
            hash,
            digest->data(),
            static_cast<ULONG>(digest->size()),
            0) != 0) {
      result = E_FAIL;
    }
  }
  if (hash != nullptr) BCryptDestroyHash(hash);
  BCryptCloseAlgorithmProvider(algorithm, 0);
  CloseHandle(file);
  return result;
}

HRESULT VerifyRuntimeIntegrity(const std::wstring& resourcesDirectory) {
  static std::once_flag once;
  static HRESULT verificationResult = E_FAIL;
  std::call_once(once, [&]() {
    verificationResult = S_OK;
    for (std::size_t index = 0;
         index < kExpectedRuntimeFileCount;
         ++index) {
      std::array<std::uint8_t, 32> actual{};
      verificationResult = Sha256File(
          resourcesDirectory + L"\\" +
              kExpectedRuntimeFiles[index].relative_path,
          &actual);
      if (FAILED(verificationResult) ||
          !std::equal(
              actual.begin(),
              actual.end(),
              kExpectedRuntimeFiles[index].sha256)) {
        verificationResult = HRESULT_FROM_WIN32(ERROR_DATA_CHECKSUM_ERROR);
        break;
      }
    }
  });
  return verificationResult;
}

HRESULT TemporaryDirectory(std::wstring* directoryPath) {
  if (directoryPath == nullptr) return E_POINTER;
  std::array<wchar_t, MAX_PATH + 1> tempDirectory{};
  const DWORD directoryLength = GetTempPathW(
      static_cast<DWORD>(tempDirectory.size()), tempDirectory.data());
  if (directoryLength == 0 || directoryLength >= tempDirectory.size()) {
    return HRESULT_FROM_WIN32(GetLastError());
  }
  std::array<wchar_t, MAX_PATH + 1> temporaryFile{};
  if (GetTempFileNameW(tempDirectory.data(), L"EVT", 0, temporaryFile.data()) == 0) {
    return HRESULT_FROM_WIN32(GetLastError());
  }
  if (!DeleteFileW(temporaryFile.data()) ||
      !CreateDirectoryW(temporaryFile.data(), nullptr)) {
    return HRESULT_FROM_WIN32(GetLastError());
  }
  *directoryPath = temporaryFile.data();
  return S_OK;
}

void CleanupTemporaryDirectory(const std::wstring& directoryPath) {
  WIN32_FIND_DATAW entry{};
  HANDLE search = FindFirstFileW((directoryPath + L"\\*").c_str(), &entry);
  if (search != INVALID_HANDLE_VALUE) {
    do {
      if (std::wcscmp(entry.cFileName, L".") == 0 ||
          std::wcscmp(entry.cFileName, L"..") == 0 ||
          (entry.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)) {
        continue;
      }
      DeleteFileW((directoryPath + L"\\" + entry.cFileName).c_str());
    } while (FindNextFileW(search, &entry));
    FindClose(search);
  }
  RemoveDirectoryW(directoryPath.c_str());
}

HRESULT CopyConverterRuntime(
    const std::wstring& sourceConverter,
    const std::wstring& destinationDirectory,
    std::wstring* isolatedConverter) {
  if (isolatedConverter == nullptr) return E_POINTER;
  const std::wstring sourceDirectory = ParentDirectory(sourceConverter);
  const std::size_t separator = sourceConverter.find_last_of(L"\\/");
  const std::wstring converterName = separator == std::wstring::npos
      ? sourceConverter
      : sourceConverter.substr(separator + 1);
  *isolatedConverter = destinationDirectory + L"\\" + converterName;
  if (!CopyFileW(
          sourceConverter.c_str(),
          isolatedConverter->c_str(),
          FALSE)) {
    return HRESULT_FROM_WIN32(GetLastError());
  }

  WIN32_FIND_DATAW entry{};
  HANDLE search = FindFirstFileW((sourceDirectory + L"\\*.dll").c_str(), &entry);
  if (search == INVALID_HANDLE_VALUE) return HRESULT_FROM_WIN32(GetLastError());
  HRESULT result = S_OK;
  do {
    if (entry.dwFileAttributes & (FILE_ATTRIBUTE_DIRECTORY |
                                  FILE_ATTRIBUTE_REPARSE_POINT)) {
      continue;
    }
    if (!CopyFileW(
            (sourceDirectory + L"\\" + entry.cFileName).c_str(),
            (destinationDirectory + L"\\" + entry.cFileName).c_str(),
            FALSE)) {
      result = HRESULT_FROM_WIN32(GetLastError());
      break;
    }
  } while (FindNextFileW(search, &entry));
  if (SUCCEEDED(result) && GetLastError() != ERROR_NO_MORE_FILES) {
    result = HRESULT_FROM_WIN32(GetLastError());
  }
  FindClose(search);
  return result;
}

HRESULT RunConverter(
    const std::wstring& processGuard,
    const std::wstring& converter,
    const std::wstring& input,
    const std::wstring& output,
    const std::wstring& sandboxDirectory) {
  std::wstring command =
      L"\"" + processGuard + L"\""
      L" --memory-mib 512"
      L" --active-processes 1"
      L" --cpu-seconds 30"
      L" --timeout-ms 30000"
      L" --sandbox appcontainer"
      L" --sandbox-rw \"" + sandboxDirectory + L"\""
      L" --output \"" + output + L"\""
      L" --output-max-mib 64"
      L" -- \"" + converter + L"\""
      L" -v0 -y -o \"" + output + L"\" \"" + input + L"\"";
  std::vector<wchar_t> commandLine(command.begin(), command.end());
  commandLine.push_back(L'\0');
  STARTUPINFOW startup{};
  startup.cb = sizeof(startup);
  PROCESS_INFORMATION process{};
  const std::wstring workingDirectory = ParentDirectory(converter);
  if (!CreateProcessW(
          processGuard.c_str(),
          commandLine.data(),
          nullptr,
          nullptr,
          FALSE,
          CREATE_NO_WINDOW,
          nullptr,
          workingDirectory.c_str(),
          &startup,
          &process)) {
    return HRESULT_FROM_WIN32(GetLastError());
  }
  const DWORD waitResult = WaitForSingleObject(process.hProcess, 35000);
  if (waitResult == WAIT_TIMEOUT) {
    TerminateProcess(process.hProcess, ERROR_TIMEOUT);
    WaitForSingleObject(process.hProcess, 5000);
  }
  DWORD exitCode = ERROR_GEN_FAILURE;
  GetExitCodeProcess(process.hProcess, &exitCode);
  CloseHandle(process.hThread);
  CloseHandle(process.hProcess);
  if (waitResult != WAIT_OBJECT_0) {
    return HRESULT_FROM_WIN32(waitResult == WAIT_TIMEOUT ? ERROR_TIMEOUT : GetLastError());
  }
  return exitCode == 0 ? S_OK : HRESULT_FROM_WIN32(exitCode);
}

HRESULT RenderDwgThumbnail(
    const std::vector<std::uint8_t>& data,
    UINT pixels,
    HBITMAP* bitmap) {
  std::array<wchar_t, 32768> modulePath{};
  const DWORD moduleLength = GetModuleFileNameW(
      g_module, modulePath.data(), static_cast<DWORD>(modulePath.size()));
  if (moduleLength == 0 || moduleLength >= modulePath.size()) {
    return HRESULT_FROM_WIN32(GetLastError());
  }
  const std::wstring shellDirectory = ParentDirectory(modulePath.data());
  const std::wstring resourcesDirectory = ParentDirectory(shellDirectory);
  const std::wstring converter =
      resourcesDirectory + L"\\third_party\\libredwg\\dwg2dxf.exe";
  const std::wstring processGuard =
      resourcesDirectory + L"\\native\\process-guard.exe";
  HRESULT integrityResult = VerifyRuntimeIntegrity(resourcesDirectory);
  if (FAILED(integrityResult)) return integrityResult;
  if (GetFileAttributesW(converter.c_str()) == INVALID_FILE_ATTRIBUTES ||
      GetFileAttributesW(processGuard.c_str()) == INVALID_FILE_ATTRIBUTES) {
    return HRESULT_FROM_WIN32(ERROR_FILE_NOT_FOUND);
  }

  std::wstring temporaryDirectory;
  HRESULT result = TemporaryDirectory(&temporaryDirectory);
  if (FAILED(result)) return result;
  const std::wstring inputPath = temporaryDirectory + L"\\input.dwg";
  const std::wstring outputPath = temporaryDirectory + L"\\output.dxf";
  std::wstring isolatedConverter;
  result = CopyConverterRuntime(
      converter,
      temporaryDirectory,
      &isolatedConverter);
  if (FAILED(result)) {
    CleanupTemporaryDirectory(temporaryDirectory);
    return result;
  }
  result = WriteFileBytes(inputPath, data);
  if (SUCCEEDED(result)) {
    result = RunConverter(
        processGuard,
        isolatedConverter,
        inputPath,
        outputPath,
        temporaryDirectory);
  }
  std::vector<std::uint8_t> converted;
  if (SUCCEEDED(result)) result = ReadFileBytes(outputPath, &converted);
  if (SUCCEEDED(result)) {
    result = excelsis::thumbnail::RenderDxfThumbnail(
        converted.data(), converted.size(), pixels, bitmap);
  }
  CleanupTemporaryDirectory(temporaryDirectory);
  return result;
}

HRESULT RenderPdfThumbnail(
    const std::vector<std::uint8_t>& data,
    UINT pixels,
    HBITMAP* bitmap,
    WTS_ALPHATYPE* alphaType) {
  std::array<wchar_t, 32768> modulePath{};
  const DWORD moduleLength = GetModuleFileNameW(
      g_module, modulePath.data(), static_cast<DWORD>(modulePath.size()));
  if (moduleLength == 0 || moduleLength >= modulePath.size()) {
    return HRESULT_FROM_WIN32(GetLastError());
  }
  const std::wstring shellDirectory = ParentDirectory(modulePath.data());
  const std::wstring resourcesDirectory = ParentDirectory(shellDirectory);
  const std::wstring installDirectory = ParentDirectory(resourcesDirectory);
  const std::wstring executable = installDirectory + L"\\ExcelsisView.exe";
  const std::wstring processGuard =
      resourcesDirectory + L"\\native\\process-guard.exe";
  HRESULT integrityResult = VerifyRuntimeIntegrity(resourcesDirectory);
  if (FAILED(integrityResult)) return integrityResult;
  if (GetFileAttributesW(executable.c_str()) == INVALID_FILE_ATTRIBUTES ||
      GetFileAttributesW(processGuard.c_str()) == INVALID_FILE_ATTRIBUTES) {
    return HRESULT_FROM_WIN32(ERROR_FILE_NOT_FOUND);
  }

  std::wstring temporaryDirectory;
  HRESULT result = TemporaryDirectory(&temporaryDirectory);
  if (FAILED(result)) return result;
  const std::wstring inputPath = temporaryDirectory + L"\\input.pdf";
  const std::wstring outputPath = temporaryDirectory + L"\\output.bmp";
  result = WriteFileBytes(inputPath, data);
  if (SUCCEEDED(result)) {
    std::wstring command =
        L"\"" + processGuard + L"\""
        L" --memory-mib 1536"
        L" --active-processes 16"
        L" --cpu-seconds 60"
        L" --timeout-ms 30000"
        L" --sandbox none"
        L" --output \"" + outputPath + L"\""
        L" --output-max-mib 64"
        L" -- \"" + executable + L"\""
        L" --pdf-thumbnail-input=\"" + inputPath + L"\""
        L" --pdf-thumbnail-output=\"" + outputPath + L"\""
        L" --pdf-thumbnail-size=" + std::to_wstring(pixels);
    std::vector<wchar_t> commandLine(command.begin(), command.end());
    commandLine.push_back(L'\0');
    STARTUPINFOW startup{};
    startup.cb = sizeof(startup);
    PROCESS_INFORMATION process{};
    if (!CreateProcessW(
            processGuard.c_str(),
            commandLine.data(),
            nullptr,
            nullptr,
            FALSE,
            CREATE_NO_WINDOW,
            nullptr,
            installDirectory.c_str(),
            &startup,
            &process)) {
      result = HRESULT_FROM_WIN32(GetLastError());
    } else {
      const DWORD waitResult = WaitForSingleObject(process.hProcess, 35000);
      if (waitResult == WAIT_TIMEOUT) {
        TerminateProcess(process.hProcess, ERROR_TIMEOUT);
        WaitForSingleObject(process.hProcess, 5000);
      }
      DWORD exitCode = ERROR_GEN_FAILURE;
      GetExitCodeProcess(process.hProcess, &exitCode);
      CloseHandle(process.hThread);
      CloseHandle(process.hProcess);
      if (waitResult != WAIT_OBJECT_0) {
        result = HRESULT_FROM_WIN32(
            waitResult == WAIT_TIMEOUT ? ERROR_TIMEOUT : GetLastError());
      } else if (exitCode != 0) {
        result = HRESULT_FROM_WIN32(exitCode);
      }
    }
  }
  if (SUCCEEDED(result)) {
    result = LoadBmpThumbnail(outputPath, pixels, bitmap);
    if (SUCCEEDED(result)) *alphaType = WTSAT_RGB;
  }
  CleanupTemporaryDirectory(temporaryDirectory);
  return result;
}

class ThumbnailProvider final : public IInitializeWithStream, public IThumbnailProvider {
 public:
  ThumbnailProvider() { ++g_objectCount; }

  ThumbnailProvider(const ThumbnailProvider&) = delete;
  ThumbnailProvider& operator=(const ThumbnailProvider&) = delete;

  IFACEMETHODIMP QueryInterface(REFIID iid, void** object) override {
    if (object == nullptr) return E_POINTER;
    *object = nullptr;
    if (SameGuid(iid, IID_IUnknown) || SameGuid(iid, kInitializeWithStreamIid)) {
      *object = static_cast<IInitializeWithStream*>(this);
    } else if (SameGuid(iid, kThumbnailProviderIid)) {
      *object = static_cast<IThumbnailProvider*>(this);
    } else {
      return E_NOINTERFACE;
    }
    AddRef();
    return S_OK;
  }

  IFACEMETHODIMP_(ULONG) AddRef() override {
    return static_cast<ULONG>(InterlockedIncrement(&references_));
  }

  IFACEMETHODIMP_(ULONG) Release() override {
    const ULONG references = static_cast<ULONG>(InterlockedDecrement(&references_));
    if (references == 0) delete this;
    return references;
  }

  IFACEMETHODIMP Initialize(IStream* stream, DWORD) override {
    if (stream == nullptr) return E_INVALIDARG;
    if (initialized_) return HRESULT_FROM_WIN32(ERROR_ALREADY_INITIALIZED);
    initialized_ = true;
    try {
      // Explorer may cache this COM object long after GetThumbnail returns.
      // Retaining its original IStream also retains the backing file handle,
      // which is especially visible on network shares: a folder can remain
      // undeletable until Explorer evicts the provider.  Copy the bounded
      // input now and never AddRef the caller-owned stream.
      return ReadStream(stream, &data_);
    } catch (const std::bad_alloc&) {
      data_.clear();
      return E_OUTOFMEMORY;
    } catch (...) {
      data_.clear();
      return E_FAIL;
    }
  }

  IFACEMETHODIMP GetThumbnail(UINT pixels, HBITMAP* bitmap, WTS_ALPHATYPE* alphaType) override {
    if (bitmap == nullptr || alphaType == nullptr) return E_POINTER;
    *bitmap = nullptr;
    *alphaType = WTSAT_UNKNOWN;
    if (!initialized_ || data_.empty()) return E_UNEXPECTED;
    try {
      HRESULT result = S_OK;
      if (StartsWith(data_, "%PDF-", 5)) {
        result = RenderPdfThumbnail(data_, pixels, bitmap, alphaType);
      } else if (StartsWith(data_, "AC10", 4)) {
        result = RenderDwgThumbnail(data_, pixels, bitmap);
        if (SUCCEEDED(result)) *alphaType = WTSAT_RGB;
      } else {
        result = excelsis::thumbnail::RenderDxfThumbnail(
            data_.data(), data_.size(), pixels, bitmap);
        if (SUCCEEDED(result)) *alphaType = WTSAT_RGB;
      }
      return result;
    } catch (const std::bad_alloc&) {
      return E_OUTOFMEMORY;
    } catch (...) {
      return E_FAIL;
    }
  }

 private:
  ~ThumbnailProvider() { --g_objectCount; }

  volatile LONG references_ = 1;
  bool initialized_ = false;
  std::vector<std::uint8_t> data_;
};

class ClassFactory final : public IClassFactory {
 public:
  ClassFactory() { ++g_objectCount; }

  IFACEMETHODIMP QueryInterface(REFIID iid, void** object) override {
    if (object == nullptr) return E_POINTER;
    *object = nullptr;
    if (!SameGuid(iid, IID_IUnknown) && !SameGuid(iid, IID_IClassFactory)) return E_NOINTERFACE;
    *object = static_cast<IClassFactory*>(this);
    AddRef();
    return S_OK;
  }

  IFACEMETHODIMP_(ULONG) AddRef() override {
    return static_cast<ULONG>(InterlockedIncrement(&references_));
  }

  IFACEMETHODIMP_(ULONG) Release() override {
    const ULONG references = static_cast<ULONG>(InterlockedDecrement(&references_));
    if (references == 0) delete this;
    return references;
  }

  IFACEMETHODIMP CreateInstance(IUnknown* outer, REFIID iid, void** object) override {
    if (object == nullptr) return E_POINTER;
    *object = nullptr;
    if (outer != nullptr) return CLASS_E_NOAGGREGATION;
    ThumbnailProvider* provider = new (std::nothrow) ThumbnailProvider();
    if (provider == nullptr) return E_OUTOFMEMORY;
    const HRESULT result = provider->QueryInterface(iid, object);
    provider->Release();
    return result;
  }

  IFACEMETHODIMP LockServer(BOOL lock) override {
    if (lock) {
      ++g_lockCount;
    } else if (g_lockCount.load() > 0) {
      --g_lockCount;
    }
    return S_OK;
  }

 private:
  ~ClassFactory() { --g_objectCount; }
  volatile LONG references_ = 1;
};

HRESULT SetStringValue(HKEY key, const wchar_t* name, const wchar_t* value) {
  const DWORD bytes = static_cast<DWORD>((wcslen(value) + 1u) * sizeof(wchar_t));
  return HRESULT_FROM_WIN32(RegSetValueExW(
      key, name, 0, REG_SZ, reinterpret_cast<const BYTE*>(value), bytes));
}

HRESULT CreateKey(HKEY root, const wchar_t* path, HKEY* key) {
  DWORD disposition = 0;
  return HRESULT_FROM_WIN32(RegCreateKeyExW(
      root, path, 0, nullptr, REG_OPTION_NON_VOLATILE, KEY_READ | KEY_WRITE,
      nullptr, key, &disposition));
}

HRESULT RegisterProvider() {
  std::array<wchar_t, 32768> modulePath{};
  const DWORD pathLength = GetModuleFileNameW(g_module, modulePath.data(), static_cast<DWORD>(modulePath.size()));
  if (pathLength == 0 || pathLength >= modulePath.size()) return HRESULT_FROM_WIN32(GetLastError());

  wchar_t clsidPath[256]{};
  swprintf_s(clsidPath, L"Software\\Classes\\CLSID\\%s", kProviderClsidText);
  HKEY clsidKey = nullptr;
  HRESULT result = CreateKey(HKEY_CURRENT_USER, clsidPath, &clsidKey);
  if (FAILED(result)) return result;
  result = SetStringValue(clsidKey, nullptr, kProviderName);
  wchar_t inprocPath[320]{};
  swprintf_s(inprocPath, L"%s\\InprocServer32", clsidPath);
  HKEY inprocKey = nullptr;
  if (SUCCEEDED(result)) result = CreateKey(HKEY_CURRENT_USER, inprocPath, &inprocKey);
  if (SUCCEEDED(result)) result = SetStringValue(inprocKey, nullptr, modulePath.data());
  if (SUCCEEDED(result)) result = SetStringValue(inprocKey, L"ThreadingModel", L"Apartment");
  if (inprocKey != nullptr) RegCloseKey(inprocKey);
  for (const wchar_t* extension : kExtensions) {
    if (FAILED(result)) break;
    wchar_t associationPath[320]{};
    swprintf_s(
        associationPath,
        L"Software\\Classes\\SystemFileAssociations\\%s\\ShellEx\\%s",
        extension,
        kThumbnailInterfaceText);
    wchar_t previousValueName[96]{};
    swprintf_s(previousValueName, L"PreviousThumbnailProvider%s", extension);
    wchar_t currentProvider[64]{};
    DWORD currentBytes = sizeof(currentProvider);
    const LONG currentResult = RegGetValueW(
        HKEY_CURRENT_USER,
        associationPath,
        nullptr,
        RRF_RT_REG_SZ,
        nullptr,
        currentProvider,
        &currentBytes);
    if (currentResult == ERROR_SUCCESS &&
        _wcsicmp(currentProvider, kProviderClsidText) != 0) {
      result = SetStringValue(clsidKey, previousValueName, currentProvider);
    } else if (currentResult == ERROR_FILE_NOT_FOUND ||
        currentResult == ERROR_PATH_NOT_FOUND) {
      result = SetStringValue(clsidKey, previousValueName, L"");
    } else if (currentResult != ERROR_SUCCESS) {
      result = HRESULT_FROM_WIN32(currentResult);
    }
    HKEY associationKey = nullptr;
    if (SUCCEEDED(result)) result = CreateKey(HKEY_CURRENT_USER, associationPath, &associationKey);
    if (SUCCEEDED(result)) result = SetStringValue(associationKey, nullptr, kProviderClsidText);
    if (associationKey != nullptr) RegCloseKey(associationKey);

  }
  if (clsidKey != nullptr) RegCloseKey(clsidKey);
  if (FAILED(result)) return result;

  HKEY approvedKey = nullptr;
  result = CreateKey(
      HKEY_CURRENT_USER,
      L"Software\\Microsoft\\Windows\\CurrentVersion\\Shell Extensions\\Approved",
      &approvedKey);
  if (SUCCEEDED(result)) result = SetStringValue(approvedKey, kProviderClsidText, kProviderName);
  if (approvedKey != nullptr) RegCloseKey(approvedKey);
  SHChangeNotify(SHCNE_ASSOCCHANGED, SHCNF_IDLIST, nullptr, nullptr);
  return result;
}

void UnregisterProvider() {
  wchar_t clsidPath[256]{};
  swprintf_s(clsidPath, L"Software\\Classes\\CLSID\\%s", kProviderClsidText);
  for (const wchar_t* extension : kExtensions) {
    wchar_t associationPath[320]{};
    swprintf_s(
        associationPath,
        L"Software\\Classes\\SystemFileAssociations\\%s\\ShellEx\\%s",
        extension,
        kThumbnailInterfaceText);
    wchar_t previousValueName[96]{};
    swprintf_s(previousValueName, L"PreviousThumbnailProvider%s", extension);
    wchar_t currentProvider[64]{};
    wchar_t previousProvider[64]{};
    DWORD previousBytes = sizeof(previousProvider);
    RegGetValueW(
        HKEY_CURRENT_USER,
        clsidPath,
        previousValueName,
        RRF_RT_REG_SZ,
        nullptr,
        previousProvider,
        &previousBytes);
    DWORD valueBytes = sizeof(currentProvider);
    if (RegGetValueW(
            HKEY_CURRENT_USER,
            associationPath,
            nullptr,
            RRF_RT_REG_SZ,
            nullptr,
            currentProvider,
            &valueBytes) == ERROR_SUCCESS &&
        _wcsicmp(currentProvider, kProviderClsidText) == 0) {
      if (previousProvider[0] != L'\0') {
        HKEY associationKey = nullptr;
        if (SUCCEEDED(CreateKey(HKEY_CURRENT_USER, associationPath, &associationKey))) {
          const HRESULT restoreResult = SetStringValue(associationKey, nullptr, previousProvider);
          RegCloseKey(associationKey);
          if (FAILED(restoreResult)) RegDeleteTreeW(HKEY_CURRENT_USER, associationPath);
        } else {
          RegDeleteTreeW(HKEY_CURRENT_USER, associationPath);
        }
      } else {
        RegDeleteTreeW(HKEY_CURRENT_USER, associationPath);
      }
    }

  }

  RegDeleteTreeW(HKEY_CURRENT_USER, clsidPath);
  HKEY approvedKey = nullptr;
  if (RegOpenKeyExW(
          HKEY_CURRENT_USER,
          L"Software\\Microsoft\\Windows\\CurrentVersion\\Shell Extensions\\Approved",
          0,
          KEY_SET_VALUE,
          &approvedKey) == ERROR_SUCCESS) {
    RegDeleteValueW(approvedKey, kProviderClsidText);
    RegCloseKey(approvedKey);
  }
  SHChangeNotify(SHCNE_ASSOCCHANGED, SHCNF_IDLIST, nullptr, nullptr);
}

}  // namespace

BOOL WINAPI DllMain(HINSTANCE instance, DWORD reason, LPVOID) {
  if (reason == DLL_PROCESS_ATTACH) {
    g_module = instance;
    DisableThreadLibraryCalls(instance);
  }
  return TRUE;
}

extern "C" __declspec(dllexport) HRESULT __stdcall DllCanUnloadNow() {
  return g_objectCount.load() == 0 && g_lockCount.load() == 0 ? S_OK : S_FALSE;
}

extern "C" __declspec(dllexport) HRESULT __stdcall DllGetClassObject(
    REFCLSID clsid,
    REFIID iid,
    void** object) {
  if (object == nullptr) return E_POINTER;
  *object = nullptr;
  if (!InlineIsEqualGUID(clsid, kProviderClsid)) return CLASS_E_CLASSNOTAVAILABLE;
  ClassFactory* factory = new (std::nothrow) ClassFactory();
  if (factory == nullptr) return E_OUTOFMEMORY;
  const HRESULT result = factory->QueryInterface(iid, object);
  factory->Release();
  return result;
}

extern "C" __declspec(dllexport) HRESULT __stdcall DllRegisterServer() {
  return RegisterProvider();
}

extern "C" __declspec(dllexport) HRESULT __stdcall DllUnregisterServer() {
  UnregisterProvider();
  return S_OK;
}
