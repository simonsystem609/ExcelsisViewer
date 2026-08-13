#include <windows.h>

#include <objidl.h>
#include <shobjidl.h>
#include <thumbcache.h>

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <fstream>
#include <iterator>
#include <string>
#include <vector>

namespace {

constexpr GUID kProviderClsid = {
    0x5a957b88, 0x4a4f, 0x4d58, {0x90, 0xa1, 0xd0, 0xbf, 0xbc, 0x2e, 0x29, 0x39}};
constexpr GUID kInitializeWithStreamIid = {
    0xb824b49d, 0x22ac, 0x4161, {0xac, 0x8a, 0x99, 0x16, 0xe8, 0xfa, 0x3f, 0x7f}};
constexpr GUID kThumbnailProviderIid = {
    0xe357fccd, 0xa995, 0x4576, {0xb0, 0x1f, 0x23, 0x46, 0x30, 0x15, 0x4e, 0x96}};
constexpr std::size_t kMaxInputBytes = 32u * 1024u * 1024u;

using DllGetClassObjectFunction = HRESULT(__stdcall*)(REFCLSID, REFIID, void**);
using DllRegistrationFunction = HRESULT(__stdcall*)();

void Fail(const char* message) {
  std::fprintf(stderr, "thumbnail test failed: %s\n", message);
  std::exit(1);
}

void Check(bool condition, const char* message) {
  if (!condition) Fail(message);
}

class TrackingStream final : public IStream {
 public:
  TrackingStream(IStream* inner, bool* destroyed)
      : inner_(inner), destroyed_(destroyed) {
    Check(inner_ != nullptr && destroyed_ != nullptr, "tracking stream construction");
  }

  HRESULT STDMETHODCALLTYPE QueryInterface(REFIID iid, void** object) override {
    if (object == nullptr) return E_POINTER;
    *object = nullptr;
    if (InlineIsEqualGUID(iid, IID_IUnknown) ||
        InlineIsEqualGUID(iid, IID_ISequentialStream) ||
        InlineIsEqualGUID(iid, IID_IStream)) {
      *object = static_cast<IStream*>(this);
      AddRef();
      return S_OK;
    }
    return E_NOINTERFACE;
  }

  ULONG STDMETHODCALLTYPE AddRef() override {
    return static_cast<ULONG>(InterlockedIncrement(&references_));
  }

  ULONG STDMETHODCALLTYPE Release() override {
    const ULONG references = static_cast<ULONG>(InterlockedDecrement(&references_));
    if (references == 0) delete this;
    return references;
  }

  HRESULT STDMETHODCALLTYPE Read(void* value, ULONG bytes, ULONG* read) override {
    return inner_->Read(value, bytes, read);
  }
  HRESULT STDMETHODCALLTYPE Write(const void* value, ULONG bytes, ULONG* written) override {
    return inner_->Write(value, bytes, written);
  }
  HRESULT STDMETHODCALLTYPE Seek(LARGE_INTEGER move, DWORD origin, ULARGE_INTEGER* position) override {
    return inner_->Seek(move, origin, position);
  }
  HRESULT STDMETHODCALLTYPE SetSize(ULARGE_INTEGER size) override { return inner_->SetSize(size); }
  HRESULT STDMETHODCALLTYPE CopyTo(
      IStream* destination,
      ULARGE_INTEGER bytes,
      ULARGE_INTEGER* read,
      ULARGE_INTEGER* written) override {
    return inner_->CopyTo(destination, bytes, read, written);
  }
  HRESULT STDMETHODCALLTYPE Commit(DWORD flags) override { return inner_->Commit(flags); }
  HRESULT STDMETHODCALLTYPE Revert() override { return inner_->Revert(); }
  HRESULT STDMETHODCALLTYPE LockRegion(ULARGE_INTEGER offset, ULARGE_INTEGER bytes, DWORD type) override {
    return inner_->LockRegion(offset, bytes, type);
  }
  HRESULT STDMETHODCALLTYPE UnlockRegion(ULARGE_INTEGER offset, ULARGE_INTEGER bytes, DWORD type) override {
    return inner_->UnlockRegion(offset, bytes, type);
  }
  HRESULT STDMETHODCALLTYPE Stat(STATSTG* stat, DWORD flags) override { return inner_->Stat(stat, flags); }
  HRESULT STDMETHODCALLTYPE Clone(IStream** stream) override { return inner_->Clone(stream); }

 private:
  ~TrackingStream() {
    inner_->Release();
    *destroyed_ = true;
  }

  volatile LONG references_ = 1;
  IStream* inner_ = nullptr;
  bool* destroyed_ = nullptr;
};

IStream* CreateTrackingStream(const std::vector<std::uint8_t>& bytes, bool* destroyed) {
  HGLOBAL memory = GlobalAlloc(GMEM_MOVEABLE, bytes.size());
  Check(memory != nullptr, "stream allocation");
  void* destination = GlobalLock(memory);
  Check(destination != nullptr, "stream lock");
  if (!bytes.empty()) std::memcpy(destination, bytes.data(), bytes.size());
  GlobalUnlock(memory);
  IStream* inner = nullptr;
  HRESULT result = CreateStreamOnHGlobal(memory, TRUE, &inner);
  Check(SUCCEEDED(result) && inner != nullptr, "stream creation");
  return new TrackingStream(inner, destroyed);
}

IThumbnailProvider* CreateProvider(
    DllGetClassObjectFunction getClassObject,
    const std::vector<std::uint8_t>& bytes,
    HRESULT* initializeResult = nullptr) {
  IClassFactory* factory = nullptr;
  HRESULT result = getClassObject(kProviderClsid, IID_IClassFactory, reinterpret_cast<void**>(&factory));
  Check(SUCCEEDED(result) && factory != nullptr, "class factory creation");
  IThumbnailProvider* provider = nullptr;
  result = factory->CreateInstance(nullptr, kThumbnailProviderIid, reinterpret_cast<void**>(&provider));
  factory->Release();
  Check(SUCCEEDED(result) && provider != nullptr, "provider creation");

  IInitializeWithStream* initializer = nullptr;
  result = provider->QueryInterface(kInitializeWithStreamIid, reinterpret_cast<void**>(&initializer));
  Check(SUCCEEDED(result) && initializer != nullptr, "stream initializer query");
  bool sourceStreamDestroyed = false;
  IStream* stream = CreateTrackingStream(bytes, &sourceStreamDestroyed);
  result = initializer->Initialize(stream, STGM_READ);
  initializer->Release();
  stream->Release();
  Check(sourceStreamDestroyed, "provider retained Explorer's source stream");
  if (initializeResult != nullptr) {
    *initializeResult = result;
  } else {
    Check(SUCCEEDED(result), "provider initialization");
  }
  return provider;
}

struct PixelStats {
  std::size_t darkPixels = 0;
  std::size_t nonWhitePixels = 0;
  int minX = 100000;
  int minY = 100000;
  int maxX = -1;
  int maxY = -1;
};

PixelStats InspectBitmap(HBITMAP bitmap, int expectedSize) {
  BITMAP description{};
  Check(GetObjectW(bitmap, sizeof(description), &description) == sizeof(description), "bitmap description");
  Check(description.bmWidth == expectedSize && std::abs(description.bmHeight) == expectedSize, "bitmap dimensions");
  BITMAPINFO info{};
  info.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
  info.bmiHeader.biWidth = expectedSize;
  info.bmiHeader.biHeight = -expectedSize;
  info.bmiHeader.biPlanes = 1;
  info.bmiHeader.biBitCount = 32;
  info.bmiHeader.biCompression = BI_RGB;
  std::vector<std::uint32_t> pixels(static_cast<std::size_t>(expectedSize) * expectedSize);
  HDC dc = GetDC(nullptr);
  Check(GetDIBits(dc, bitmap, 0, expectedSize, pixels.data(), &info, DIB_RGB_COLORS) == expectedSize, "bitmap pixels");
  ReleaseDC(nullptr, dc);
  PixelStats stats;
  for (int y = 0; y < expectedSize; ++y) {
    for (int x = 0; x < expectedSize; ++x) {
      const std::uint32_t pixel = pixels[static_cast<std::size_t>(y) * expectedSize + x];
      const int blue = pixel & 0xff;
      const int green = (pixel >> 8) & 0xff;
      const int red = (pixel >> 16) & 0xff;
      if (red < 250 || green < 250 || blue < 250) ++stats.nonWhitePixels;
      if (red < 80 && green < 80 && blue < 80) {
        ++stats.darkPixels;
        stats.minX = std::min(stats.minX, x);
        stats.minY = std::min(stats.minY, y);
        stats.maxX = std::max(stats.maxX, x);
        stats.maxY = std::max(stats.maxY, y);
      }
    }
  }
  return stats;
}

void WriteBitmap(HBITMAP bitmap, int size, const wchar_t* outputPath) {
  if (outputPath == nullptr || outputPath[0] == L'\0') return;
  BITMAPINFOHEADER info{};
  info.biSize = sizeof(BITMAPINFOHEADER);
  info.biWidth = size;
  info.biHeight = size;
  info.biPlanes = 1;
  info.biBitCount = 32;
  info.biCompression = BI_RGB;
  info.biSizeImage = static_cast<DWORD>(size * size * 4);
  std::vector<std::uint32_t> pixels(static_cast<std::size_t>(size) * size);
  BITMAPINFO bitmapInfo{};
  bitmapInfo.bmiHeader = info;
  HDC dc = GetDC(nullptr);
  Check(GetDIBits(dc, bitmap, 0, size, pixels.data(), &bitmapInfo, DIB_RGB_COLORS) == size, "smoke bitmap pixels");
  ReleaseDC(nullptr, dc);
  BITMAPFILEHEADER fileHeader{};
  fileHeader.bfType = 0x4d42;
  fileHeader.bfOffBits = sizeof(BITMAPFILEHEADER) + sizeof(BITMAPINFOHEADER);
  fileHeader.bfSize = fileHeader.bfOffBits + info.biSizeImage;
  HANDLE file = CreateFileW(
      outputPath, GENERIC_WRITE, 0, nullptr, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, nullptr);
  Check(file != INVALID_HANDLE_VALUE, "smoke bitmap output");
  DWORD written = 0;
  Check(WriteFile(file, &fileHeader, sizeof(fileHeader), &written, nullptr) != FALSE &&
      written == sizeof(fileHeader), "smoke bitmap header write");
  Check(WriteFile(file, &info, sizeof(info), &written, nullptr) != FALSE &&
      written == sizeof(info), "smoke bitmap info write");
  Check(WriteFile(file, pixels.data(), info.biSizeImage, &written, nullptr) != FALSE &&
      written == info.biSizeImage, "smoke bitmap data write");
  CloseHandle(file);
}

std::vector<std::uint8_t> Bytes(const char* text) {
  return std::vector<std::uint8_t>(text, text + std::strlen(text));
}

std::vector<std::uint8_t> Bytes(const std::string& text) {
  return std::vector<std::uint8_t>(text.begin(), text.end());
}

void TestGeometry(DllGetClassObjectFunction getClassObject, const wchar_t* outputPath) {
  const auto source = Bytes(
      "0\nSECTION\n2\nENTITIES\n"
      "0\nLWPOLYLINE\n70\n1\n10\n0\n20\n0\n10\n100\n20\n0\n10\n100\n20\n50\n10\n0\n20\n50\n"
      "0\nCIRCLE\n10\n50\n20\n25\n40\n12\n"
      "0\nARC\n10\n50\n20\n25\n40\n20\n50\n15\n51\n165\n"
      "0\nENDSEC\n0\nEOF\n");
  IThumbnailProvider* provider = CreateProvider(getClassObject, source);
  HBITMAP bitmap = nullptr;
  WTS_ALPHATYPE alpha = WTSAT_UNKNOWN;
  const HRESULT result = provider->GetThumbnail(256, &bitmap, &alpha);
  provider->Release();
  Check(SUCCEEDED(result) && bitmap != nullptr, "geometry render");
  Check(alpha == WTSAT_RGB, "opaque thumbnail alpha declaration");
  const PixelStats stats = InspectBitmap(bitmap, 256);
  WriteBitmap(bitmap, 256, outputPath);
  DeleteObject(bitmap);
  Check(stats.darkPixels > 300, "geometry pixel count");
  Check(stats.maxX - stats.minX > 180 && stats.maxY - stats.minY > 80, "fit-to-bounds coverage");
}

void TestBlockInsert(DllGetClassObjectFunction getClassObject) {
  const auto source = Bytes(
      "0\nSECTION\n2\nBLOCKS\n"
      "0\nBLOCK\n2\nDEMO\n10\n0\n20\n0\n"
      "0\nLINE\n10\n0\n20\n0\n11\n20\n21\n0\n"
      "0\nLINE\n10\n20\n20\n0\n11\n20\n21\n10\n"
      "0\nENDBLK\n0\nENDSEC\n"
      "0\nSECTION\n2\nENTITIES\n"
      "0\nINSERT\n2\nDEMO\n10\n10\n20\n20\n50\n30\n70\n3\n44\n30\n"
      "0\nENDSEC\n0\nEOF\n");
  IThumbnailProvider* provider = CreateProvider(getClassObject, source);
  HBITMAP bitmap = nullptr;
  WTS_ALPHATYPE alpha = WTSAT_UNKNOWN;
  const HRESULT result = provider->GetThumbnail(192, &bitmap, &alpha);
  provider->Release();
  Check(SUCCEEDED(result) && bitmap != nullptr, "block insert render");
  const PixelStats stats = InspectBitmap(bitmap, 192);
  DeleteObject(bitmap);
  Check(stats.darkPixels > 100, "block insert pixel count");
  Check(stats.maxX - stats.minX > 130, "insert array expansion");
}

void TestBinaryRejection(DllGetClassObjectFunction getClassObject) {
  const auto source = Bytes("AutoCAD Binary DXF\r\n");
  IThumbnailProvider* provider = CreateProvider(getClassObject, source);
  HBITMAP bitmap = nullptr;
  WTS_ALPHATYPE alpha = WTSAT_UNKNOWN;
  const HRESULT result = provider->GetThumbnail(128, &bitmap, &alpha);
  provider->Release();
  Check(FAILED(result) && bitmap == nullptr, "binary DXF rejection");
}

void TestInputLimit(DllGetClassObjectFunction getClassObject) {
  std::vector<std::uint8_t> source(kMaxInputBytes + 1u, static_cast<std::uint8_t>(' '));
  HRESULT result = S_OK;
  IThumbnailProvider* provider = CreateProvider(getClassObject, source, &result);
  provider->Release();
  Check(result == HRESULT_FROM_WIN32(ERROR_FILE_TOO_LARGE), "input byte limit");
}

void TestEntityLimit(DllGetClassObjectFunction getClassObject) {
  std::string source = "0\nSECTION\n2\nENTITIES\n";
  for (int index = 0; index <= 30000; ++index) {
    source += "0\nPOINT\n10\n" + std::to_string(index) + "\n20\n0\n";
  }
  source += "0\nENDSEC\n0\nEOF\n";
  IThumbnailProvider* provider = CreateProvider(getClassObject, Bytes(source));
  HBITMAP bitmap = nullptr;
  WTS_ALPHATYPE alpha = WTSAT_UNKNOWN;
  const HRESULT result = provider->GetThumbnail(128, &bitmap, &alpha);
  provider->Release();
  Check(FAILED(result) && bitmap == nullptr, "entity expansion limit");
}

void TestInsertExpansionLimit(DllGetClassObjectFunction getClassObject) {
  const auto source = Bytes(
      "0\nSECTION\n2\nBLOCKS\n"
      "0\nBLOCK\n2\nDENSE\n10\n0\n20\n0\n"
      "0\nCIRCLE\n10\n0\n20\n0\n40\n1\n"
      "0\nENDBLK\n0\nENDSEC\n"
      "0\nSECTION\n2\nENTITIES\n"
      "0\nINSERT\n2\nDENSE\n10\n0\n20\n0\n70\n64\n71\n64\n44\n3\n45\n3\n"
      "0\nENDSEC\n0\nEOF\n");
  IThumbnailProvider* provider = CreateProvider(getClassObject, source);
  HBITMAP bitmap = nullptr;
  WTS_ALPHATYPE alpha = WTSAT_UNKNOWN;
  const HRESULT result = provider->GetThumbnail(128, &bitmap, &alpha);
  provider->Release();
  Check(FAILED(result) && bitmap == nullptr, "insert render-point limit");
}

void TestRecursiveInsertWorkLimit(DllGetClassObjectFunction getClassObject) {
  const auto source = Bytes(
      "0\nSECTION\n2\nBLOCKS\n"
      "0\nBLOCK\n2\nEMPTY\n10\n0\n20\n0\n"
      "0\nENDBLK\n"
      "0\nBLOCK\n2\nFAN\n10\n0\n20\n0\n"
      "0\nINSERT\n2\nEMPTY\n10\n0\n20\n0\n70\n64\n71\n64\n"
      "0\nENDBLK\n0\nENDSEC\n"
      "0\nSECTION\n2\nENTITIES\n"
      "0\nINSERT\n2\nFAN\n10\n0\n20\n0\n70\n64\n71\n64\n"
      "0\nENDSEC\n0\nEOF\n");
  IThumbnailProvider* provider = CreateProvider(getClassObject, source);
  HBITMAP bitmap = nullptr;
  WTS_ALPHATYPE alpha = WTSAT_UNKNOWN;
  const HRESULT result = provider->GetThumbnail(128, &bitmap, &alpha);
  provider->Release();
  Check(result == HRESULT_FROM_WIN32(ERROR_FILE_TOO_LARGE) && bitmap == nullptr,
      "recursive insert work limit");
}

void TestExtremeAngleNormalization(DllGetClassObjectFunction getClassObject) {
  const auto source = Bytes(
      "0\nSECTION\n2\nENTITIES\n"
      "0\nARC\n10\n0\n20\n0\n40\n10\n50\n1000000000\n51\n-1000000000\n"
      "0\nELLIPSE\n10\n25\n20\n0\n11\n10\n21\n0\n40\n0.5\n"
      "41\n1000000000\n42\n-1000000000\n"
      "0\nENDSEC\n0\nEOF\n");
  IThumbnailProvider* provider = CreateProvider(getClassObject, source);
  HBITMAP bitmap = nullptr;
  WTS_ALPHATYPE alpha = WTSAT_UNKNOWN;
  const HRESULT result = provider->GetThumbnail(128, &bitmap, &alpha);
  provider->Release();
  Check(SUCCEEDED(result) && bitmap != nullptr, "extreme angle render");
  const PixelStats stats = InspectBitmap(bitmap, 128);
  DeleteObject(bitmap);
  Check(stats.darkPixels > 20, "extreme angle pixel count");
}

void TestMalformedInput(DllGetClassObjectFunction getClassObject) {
  auto source = Bytes("0\nSECTION\n2\nENTITIES\n0\nLINE\n10\n0\n20\n0\n0\nENDSEC\n0\nEOF\n");
  source[source.size() / 2] = 0;
  IThumbnailProvider* provider = CreateProvider(getClassObject, source);
  HBITMAP bitmap = nullptr;
  WTS_ALPHATYPE alpha = WTSAT_UNKNOWN;
  const HRESULT result = provider->GetThumbnail(128, &bitmap, &alpha);
  provider->Release();
  Check(FAILED(result) && bitmap == nullptr, "embedded NUL rejection");
}

void TestPdfThumbnailWhenRequested(DllGetClassObjectFunction getClassObject) {
  std::vector<wchar_t> path(32768);
  const DWORD length = GetEnvironmentVariableW(
      L"EXCELSIS_PDF_THUMBNAIL_TEST_FILE",
      path.data(),
      static_cast<DWORD>(path.size()));
  if (length == 0) return;
  Check(length < path.size(), "PDF thumbnail test path length");
  std::ifstream sourceFile(path.data(), std::ios::binary);
  Check(sourceFile.good(), "PDF thumbnail test source open");
  const std::vector<std::uint8_t> source(
      (std::istreambuf_iterator<char>(sourceFile)),
      std::istreambuf_iterator<char>{});
  Check(!source.empty(), "PDF thumbnail test source bytes");
  IThumbnailProvider* provider = CreateProvider(getClassObject, source);
  HBITMAP bitmap = nullptr;
  WTS_ALPHATYPE alpha = WTSAT_UNKNOWN;
  const HRESULT result = provider->GetThumbnail(192, &bitmap, &alpha);
  provider->Release();
  Check(SUCCEEDED(result) && bitmap != nullptr, "bundled PDF thumbnail render");
  Check(alpha == WTSAT_RGB, "bundled PDF thumbnail alpha");
  const PixelStats stats = InspectBitmap(bitmap, 192);
  DeleteObject(bitmap);
  Check(stats.nonWhitePixels > 50, "bundled PDF thumbnail content");
}

std::wstring ReadRegistryString(HKEY root, const wchar_t* path, const wchar_t* name) {
  wchar_t value[512]{};
  DWORD bytes = sizeof(value);
  const LONG result = RegGetValueW(root, path, name, RRF_RT_REG_SZ, nullptr, value, &bytes);
  Check(result == ERROR_SUCCESS, "registry string read");
  return value;
}

std::wstring ReadRegistryStringOrEmpty(HKEY root, const wchar_t* path, const wchar_t* name) {
  wchar_t value[512]{};
  DWORD bytes = sizeof(value);
  const LONG result = RegGetValueW(root, path, name, RRF_RT_REG_SZ, nullptr, value, &bytes);
  if (result == ERROR_FILE_NOT_FOUND || result == ERROR_PATH_NOT_FOUND) return L"";
  Check(result == ERROR_SUCCESS, "optional registry string read");
  return value;
}

void TestRegistration(HMODULE module) {
  const auto registerServer = reinterpret_cast<DllRegistrationFunction>(
      GetProcAddress(module, "DllRegisterServer"));
  const auto unregisterServer = reinterpret_cast<DllRegistrationFunction>(
      GetProcAddress(module, "DllUnregisterServer"));
  Check(registerServer != nullptr && unregisterServer != nullptr, "registration exports");

  wchar_t testPath[160]{};
  swprintf_s(testPath, L"Software\\ExcelsisView\\ThumbnailProviderTest-%lu", GetCurrentProcessId());
  HKEY testRoot = nullptr;
  DWORD disposition = 0;
  Check(RegCreateKeyExW(
      HKEY_CURRENT_USER,
      testPath,
      0,
      nullptr,
      REG_OPTION_NON_VOLATILE,
      KEY_ALL_ACCESS,
      nullptr,
      &testRoot,
      &disposition) == ERROR_SUCCESS, "test registry root");
  Check(RegOverridePredefKey(HKEY_CURRENT_USER, testRoot) == ERROR_SUCCESS, "registry override");

  constexpr wchar_t kDxfAssociationPath[] =
      L"Software\\Classes\\SystemFileAssociations\\.dxf\\ShellEx\\{E357FCCD-A995-4576-B01F-234630154E96}";
  constexpr wchar_t kDwgAssociationPath[] =
      L"Software\\Classes\\SystemFileAssociations\\.dwg\\ShellEx\\{E357FCCD-A995-4576-B01F-234630154E96}";
  constexpr wchar_t kPdfAssociationPath[] =
      L"Software\\Classes\\SystemFileAssociations\\.pdf\\ShellEx\\{E357FCCD-A995-4576-B01F-234630154E96}";
  constexpr wchar_t kClsidPath[] = L"Software\\Classes\\CLSID\\{5A957B88-4A4F-4D58-90A1-D0BFBC2E2939}";
  constexpr wchar_t kPreviousClsid[] = L"{11111111-2222-3333-4444-555555555555}";
  HKEY association = nullptr;
  Check(RegCreateKeyExW(
      HKEY_CURRENT_USER,
      kDxfAssociationPath,
      0,
      nullptr,
      REG_OPTION_NON_VOLATILE,
      KEY_ALL_ACCESS,
      nullptr,
      &association,
      &disposition) == ERROR_SUCCESS, "test association key");
  Check(RegSetValueExW(
      association,
      nullptr,
      0,
      REG_SZ,
      reinterpret_cast<const BYTE*>(kPreviousClsid),
      sizeof(kPreviousClsid)) == ERROR_SUCCESS, "test previous provider");
  RegCloseKey(association);

  Check(SUCCEEDED(registerServer()), "provider registration");
  Check(ReadRegistryString(HKEY_CURRENT_USER, kDxfAssociationPath, nullptr) ==
      L"{5A957B88-4A4F-4D58-90A1-D0BFBC2E2939}", "DXF provider association");
  Check(ReadRegistryString(HKEY_CURRENT_USER, kDwgAssociationPath, nullptr) ==
      L"{5A957B88-4A4F-4D58-90A1-D0BFBC2E2939}", "DWG provider association");
  Check(ReadRegistryString(HKEY_CURRENT_USER, kPdfAssociationPath, nullptr) ==
      L"{5A957B88-4A4F-4D58-90A1-D0BFBC2E2939}", "PDF provider association");
  Check(ReadRegistryString(HKEY_CURRENT_USER, kClsidPath, L"PreviousThumbnailProvider.dxf") ==
      kPreviousClsid, "previous provider preservation");
  const std::wstring inproc = ReadRegistryString(
      HKEY_CURRENT_USER,
      L"Software\\Classes\\CLSID\\{5A957B88-4A4F-4D58-90A1-D0BFBC2E2939}\\InprocServer32",
      nullptr);
  Check(inproc.find(L"ExcelsisDxfThumbnailProvider.dll") != std::wstring::npos, "registered module path");

  Check(SUCCEEDED(unregisterServer()), "provider unregistration");
  Check(ReadRegistryString(HKEY_CURRENT_USER, kDxfAssociationPath, nullptr) ==
      kPreviousClsid, "previous provider restoration");
  Check(ReadRegistryStringOrEmpty(HKEY_CURRENT_USER, kDwgAssociationPath, nullptr).empty(),
      "DWG provider cleanup");
  Check(ReadRegistryStringOrEmpty(HKEY_CURRENT_USER, kPdfAssociationPath, nullptr).empty(),
      "PDF provider cleanup");
  HKEY deletedClsid = nullptr;
  Check(RegOpenKeyExW(HKEY_CURRENT_USER, kClsidPath, 0, KEY_READ, &deletedClsid) == ERROR_FILE_NOT_FOUND,
      "provider CLSID cleanup");

  Check(RegOverridePredefKey(HKEY_CURRENT_USER, nullptr) == ERROR_SUCCESS, "registry override restore");
  RegCloseKey(testRoot);
  Check(RegDeleteTreeW(HKEY_CURRENT_USER, testPath) == ERROR_SUCCESS, "test registry cleanup");
}

}  // namespace

int wmain(int argc, wchar_t** argv) {
  if (argc < 2 || argc > 3) {
    std::fwprintf(stderr, L"usage: thumbnail_provider_tests.exe <provider.dll> [smoke.bmp]\n");
    return 2;
  }
  HMODULE module = LoadLibraryW(argv[1]);
  Check(module != nullptr, "provider DLL load");
  const auto getClassObject = reinterpret_cast<DllGetClassObjectFunction>(
      GetProcAddress(module, "DllGetClassObject"));
  Check(getClassObject != nullptr, "DllGetClassObject export");
  TestGeometry(getClassObject, argc == 3 ? argv[2] : nullptr);
  TestBlockInsert(getClassObject);
  TestBinaryRejection(getClassObject);
  TestInputLimit(getClassObject);
  TestEntityLimit(getClassObject);
  TestInsertExpansionLimit(getClassObject);
  TestRecursiveInsertWorkLimit(getClassObject);
  TestExtremeAngleNormalization(getClassObject);
  TestMalformedInput(getClassObject);
  TestPdfThumbnailWhenRequested(getClassObject);
  TestRegistration(module);
  Check(FreeLibrary(module) != FALSE, "provider DLL unload");
  std::puts("Explorer thumbnail provider tests passed.");
  return 0;
}
