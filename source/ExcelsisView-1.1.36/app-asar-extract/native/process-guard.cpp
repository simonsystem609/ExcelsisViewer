#ifndef _WIN32_WINNT
#define _WIN32_WINNT 0x0A00
#endif

#include <windows.h>
#include <sddl.h>
#include <userenv.h>

#include <algorithm>
#include <cerrno>
#include <cstdio>
#include <cstdint>
#include <cwchar>
#include <cwctype>
#include <string>
#include <vector>

namespace {

constexpr DWORD kGuardError = 125;
constexpr DWORD kTimeoutExit = 124;
constexpr DWORD kOutputLimitExit = 126;

enum class SandboxMode {
  kAppContainer,
  kNone,
};

using CreateAppContainerProfileFn = HRESULT (WINAPI*)(
    PCWSTR,
    PCWSTR,
    PCWSTR,
    PSID_AND_ATTRIBUTES,
    DWORD,
    PSID*);
using DeleteAppContainerProfileFn = HRESULT (WINAPI*)(PCWSTR);
using GetAppContainerFolderPathFn = HRESULT (WINAPI*)(PCWSTR, PWSTR*);

struct SandboxMapping {
  std::wstring sourceRoot;
  std::wstring sandboxRoot;
  bool writeBack;
};

int guardFailure(const wchar_t* stage, std::uint64_t code) {
  std::fwprintf(
      stderr,
      L"Excelsis process guard failed at %ls (error %llu).\n",
      stage,
      static_cast<unsigned long long>(code));
  return static_cast<int>(kGuardError);
}

bool parseUnsigned(const wchar_t* text, std::uint64_t* value) {
  if (!text || !*text) return false;
  wchar_t* end = nullptr;
  errno = 0;
  const unsigned long long parsed = std::wcstoull(text, &end, 10);
  if (errno != 0 || !end || *end != L'\0') return false;
  *value = parsed;
  return true;
}

std::wstring quoteArgument(const std::wstring& argument) {
  if (argument.empty()) return L"\"\"";
  if (argument.find_first_of(L" \t\n\v\"") == std::wstring::npos) return argument;

  std::wstring quoted = L"\"";
  std::size_t backslashes = 0;
  for (const wchar_t character : argument) {
    if (character == L'\\') {
      ++backslashes;
      continue;
    }
    if (character == L'"') {
      quoted.append(backslashes * 2 + 1, L'\\');
      quoted.push_back(L'"');
      backslashes = 0;
      continue;
    }
    quoted.append(backslashes, L'\\');
    backslashes = 0;
    quoted.push_back(character);
  }
  quoted.append(backslashes * 2, L'\\');
  quoted.push_back(L'"');
  return quoted;
}

std::wstring buildCommandLine(const std::vector<std::wstring>& arguments) {
  std::wstring commandLine;
  for (const std::wstring& argument : arguments) {
    if (!commandLine.empty()) commandLine.push_back(L' ');
    commandLine += quoteArgument(argument);
  }
  return commandLine;
}

std::wstring absolutePath(const std::wstring& input) {
  const DWORD required = GetFullPathNameW(input.c_str(), 0, nullptr, nullptr);
  if (!required) return {};
  std::vector<wchar_t> buffer(required);
  const DWORD written = GetFullPathNameW(
      input.c_str(),
      static_cast<DWORD>(buffer.size()),
      buffer.data(),
      nullptr);
  if (!written || written >= buffer.size()) return {};
  return std::wstring(buffer.data(), written);
}

std::wstring comparablePath(std::wstring input) {
  std::replace(input.begin(), input.end(), L'/', L'\\');
  while (input.size() > 3 && input.back() == L'\\') input.pop_back();
  std::transform(input.begin(), input.end(), input.begin(), [](wchar_t character) {
    return static_cast<wchar_t>(std::towlower(character));
  });
  return input;
}

bool pathIsInside(const std::wstring& root, const std::wstring& candidate) {
  const std::wstring normalizedRoot = comparablePath(root);
  const std::wstring normalizedCandidate = comparablePath(candidate);
  if (normalizedCandidate == normalizedRoot) return true;
  return normalizedCandidate.size() > normalizedRoot.size() &&
      normalizedCandidate.compare(0, normalizedRoot.size(), normalizedRoot) == 0 &&
      normalizedCandidate[normalizedRoot.size()] == L'\\';
}

std::wstring directoryName(const std::wstring& filePath) {
  const std::size_t separator = filePath.find_last_of(L"\\/");
  if (separator == std::wstring::npos) return {};
  if (separator == 2 && filePath.size() >= 3 && filePath[1] == L':') {
    return filePath.substr(0, 3);
  }
  return filePath.substr(0, separator);
}

bool addSandboxDirectory(
    std::vector<std::wstring>* directories,
    const std::wstring& rawPath) {
  const std::wstring resolved = absolutePath(rawPath);
  if (resolved.empty()) return false;
  const DWORD attributes = GetFileAttributesW(resolved.c_str());
  if (attributes == INVALID_FILE_ATTRIBUTES ||
      !(attributes & FILE_ATTRIBUTE_DIRECTORY) ||
      (attributes & FILE_ATTRIBUTE_REPARSE_POINT)) {
    return false;
  }
  const std::wstring comparable = comparablePath(resolved);
  const auto duplicate = std::find_if(
      directories->begin(),
      directories->end(),
      [&](const std::wstring& existing) {
        return comparablePath(existing) == comparable;
      });
  if (duplicate == directories->end()) directories->push_back(resolved);
  return true;
}

DWORD ensureDirectory(const std::wstring& directoryPath) {
  if (CreateDirectoryW(directoryPath.c_str(), nullptr)) return ERROR_SUCCESS;
  const DWORD error = GetLastError();
  if (error != ERROR_ALREADY_EXISTS) return error;
  const DWORD attributes = GetFileAttributesW(directoryPath.c_str());
  return attributes != INVALID_FILE_ATTRIBUTES &&
      (attributes & FILE_ATTRIBUTE_DIRECTORY) &&
      !(attributes & FILE_ATTRIBUTE_REPARSE_POINT)
    ? ERROR_SUCCESS
    : ERROR_DIRECTORY;
}

DWORD copyDirectoryTree(
    const std::wstring& sourceRoot,
    const std::wstring& destinationRoot) {
  const DWORD sourceAttributes = GetFileAttributesW(sourceRoot.c_str());
  if (sourceAttributes == INVALID_FILE_ATTRIBUTES ||
      !(sourceAttributes & FILE_ATTRIBUTE_DIRECTORY) ||
      (sourceAttributes & FILE_ATTRIBUTE_REPARSE_POINT)) {
    return ERROR_DIRECTORY;
  }
  DWORD result = ensureDirectory(destinationRoot);
  if (result != ERROR_SUCCESS) return result;

  WIN32_FIND_DATAW entry{};
  HANDLE search = FindFirstFileW((sourceRoot + L"\\*").c_str(), &entry);
  if (search == INVALID_HANDLE_VALUE) {
    const DWORD error = GetLastError();
    return error == ERROR_FILE_NOT_FOUND ? ERROR_SUCCESS : error;
  }
  do {
    if (std::wcscmp(entry.cFileName, L".") == 0 ||
        std::wcscmp(entry.cFileName, L"..") == 0) {
      continue;
    }
    if (entry.dwFileAttributes & FILE_ATTRIBUTE_REPARSE_POINT) {
      result = ERROR_REPARSE_TAG_INVALID;
      break;
    }
    const std::wstring sourcePath = sourceRoot + L"\\" + entry.cFileName;
    const std::wstring destinationPath =
        destinationRoot + L"\\" + entry.cFileName;
    if (entry.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) {
      result = copyDirectoryTree(sourcePath, destinationPath);
    } else if (!CopyFileW(
                   sourcePath.c_str(),
                   destinationPath.c_str(),
                   FALSE)) {
      result = GetLastError();
    }
    if (result != ERROR_SUCCESS) break;
  } while (FindNextFileW(search, &entry));
  if (result == ERROR_SUCCESS) {
    const DWORD error = GetLastError();
    if (error != ERROR_NO_MORE_FILES) result = error;
  }
  FindClose(search);
  return result;
}

std::wstring translatedSandboxPath(
    const std::wstring& candidate,
    const std::vector<SandboxMapping>& mappings) {
  if (candidate.empty()) return candidate;
  const bool driveAbsolute =
      candidate.size() >= 3 &&
      std::iswalpha(candidate[0]) &&
      candidate[1] == L':' &&
      (candidate[2] == L'\\' || candidate[2] == L'/');
  const bool uncAbsolute =
      candidate.size() >= 3 &&
      (candidate[0] == L'\\' || candidate[0] == L'/') &&
      candidate[1] == candidate[0];
  if (!driveAbsolute && !uncAbsolute) return candidate;
  const std::wstring resolved = absolutePath(candidate);
  if (resolved.empty()) return candidate;
  for (const SandboxMapping& mapping : mappings) {
    if (!pathIsInside(mapping.sourceRoot, resolved)) continue;
    return mapping.sandboxRoot + resolved.substr(mapping.sourceRoot.size());
  }
  return candidate;
}

}  // namespace

int wmain(int argc, wchar_t** argv) {
  if (argc == 2 && std::wcscmp(argv[1], L"--self-test-child") == 0) return 0;
  if (argc == 2 && std::wcscmp(argv[1], L"--self-test-appcontainer") == 0) {
    HANDLE token = nullptr;
    if (!OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &token)) return 1;
    DWORD isAppContainer = 0;
    DWORD returnedBytes = 0;
    const BOOL queried = GetTokenInformation(
        token,
        TokenIsAppContainer,
        &isAppContainer,
        sizeof(isAppContainer),
        &returnedBytes);
    DWORD capabilitiesBytes = 0;
    GetTokenInformation(
        token,
        TokenCapabilities,
        nullptr,
        0,
        &capabilitiesBytes);
    std::vector<unsigned char> capabilitiesStorage(capabilitiesBytes);
    const BOOL capabilitiesQueried = capabilitiesBytes > 0 &&
        GetTokenInformation(
            token,
            TokenCapabilities,
            capabilitiesStorage.data(),
            capabilitiesBytes,
            &capabilitiesBytes);
    CloseHandle(token);
    if (!queried || !isAppContainer || !capabilitiesQueried) return 1;
    const auto* capabilities =
        reinterpret_cast<const TOKEN_GROUPS*>(capabilitiesStorage.data());
    return capabilities->GroupCount == 0 ? 0 : 1;
  }
  if (argc == 3 &&
      (std::wcscmp(argv[1], L"--self-test-read") == 0 ||
       std::wcscmp(argv[1], L"--self-test-deny-read") == 0)) {
    const bool expectDenied =
        std::wcscmp(argv[1], L"--self-test-deny-read") == 0;
    HANDLE file = CreateFileW(
        argv[2],
        GENERIC_READ,
        FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
        nullptr,
        OPEN_EXISTING,
        FILE_ATTRIBUTE_NORMAL,
        nullptr);
    if (file != INVALID_HANDLE_VALUE) {
      CloseHandle(file);
      return expectDenied ? 1 : 0;
    }
    return expectDenied && GetLastError() == ERROR_ACCESS_DENIED ? 0 : 1;
  }
  if (argc == 3 && std::wcscmp(argv[1], L"--self-test-sleep-ms") == 0) {
    std::uint64_t delay = 0;
    if (!parseUnsigned(argv[2], &delay) || delay > 60000) return kGuardError;
    Sleep(static_cast<DWORD>(delay));
    return 0;
  }

  std::uint64_t memoryMiB = 1024;
  std::uint64_t activeProcesses = 1;
  std::uint64_t cpuSeconds = 180;
  std::uint64_t timeoutMs = 180000;
  std::uint64_t outputMaxMiB = 0;
  std::wstring outputPath;
  SandboxMode sandboxMode = SandboxMode::kAppContainer;
  std::vector<std::wstring> sandboxReadOnlyDirectories;
  std::vector<std::wstring> sandboxReadWriteDirectories;
  int executableIndex = -1;

  for (int index = 1; index < argc; ++index) {
    const std::wstring option = argv[index];
    if (option == L"--") {
      executableIndex = index + 1;
      break;
    }
    if (index + 1 >= argc) return kGuardError;
    if (option == L"--output") {
      outputPath = argv[++index];
      continue;
    }
    if (option == L"--sandbox") {
      const std::wstring value = argv[++index];
      if (value == L"appcontainer") sandboxMode = SandboxMode::kAppContainer;
      else if (value == L"none") sandboxMode = SandboxMode::kNone;
      else return kGuardError;
      continue;
    }
    if (option == L"--sandbox-ro") {
      if (!addSandboxDirectory(&sandboxReadOnlyDirectories, argv[++index])) {
        return kGuardError;
      }
      continue;
    }
    if (option == L"--sandbox-rw") {
      if (!addSandboxDirectory(&sandboxReadWriteDirectories, argv[++index])) {
        return kGuardError;
      }
      continue;
    }
    std::uint64_t value = 0;
    if (!parseUnsigned(argv[++index], &value)) return kGuardError;
    if (option == L"--memory-mib") memoryMiB = value;
    else if (option == L"--active-processes") activeProcesses = value;
    else if (option == L"--cpu-seconds") cpuSeconds = value;
    else if (option == L"--timeout-ms") timeoutMs = value;
    else if (option == L"--output-max-mib") outputMaxMiB = value;
    else return kGuardError;
  }

  if (executableIndex < 0 || executableIndex >= argc ||
      memoryMiB < 64 || memoryMiB > 16384 ||
      activeProcesses < 1 || activeProcesses > 64 ||
      cpuSeconds < 1 || cpuSeconds > 3600 ||
      timeoutMs < 100 || timeoutMs > 3600000 ||
      (outputPath.empty() != (outputMaxMiB == 0)) ||
      outputMaxMiB > 4096 ||
      (sandboxMode == SandboxMode::kAppContainer &&
       sandboxReadWriteDirectories.empty())) {
    return kGuardError;
  }

  const std::wstring executablePath = absolutePath(argv[executableIndex]);
  if (executablePath.empty() ||
      GetFileAttributesW(executablePath.c_str()) == INVALID_FILE_ATTRIBUTES) {
    return kGuardError;
  }
  if (sandboxMode == SandboxMode::kAppContainer) {
    const bool executableIsGranted = std::any_of(
        sandboxReadOnlyDirectories.begin(),
        sandboxReadOnlyDirectories.end(),
        [&](const std::wstring& root) { return pathIsInside(root, executablePath); }) ||
      std::any_of(
        sandboxReadWriteDirectories.begin(),
        sandboxReadWriteDirectories.end(),
        [&](const std::wstring& root) { return pathIsInside(root, executablePath); });
    if (!executableIsGranted) return kGuardError;
  }

  HANDLE job = CreateJobObjectW(nullptr, nullptr);
  if (!job) return kGuardError;

  JOBOBJECT_EXTENDED_LIMIT_INFORMATION limits{};
  limits.BasicLimitInformation.LimitFlags =
      JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE |
      JOB_OBJECT_LIMIT_ACTIVE_PROCESS |
      JOB_OBJECT_LIMIT_PROCESS_TIME |
      JOB_OBJECT_LIMIT_PROCESS_MEMORY |
      JOB_OBJECT_LIMIT_JOB_MEMORY;
  limits.BasicLimitInformation.ActiveProcessLimit = static_cast<DWORD>(activeProcesses);
  limits.BasicLimitInformation.PerProcessUserTimeLimit.QuadPart =
      static_cast<LONGLONG>(cpuSeconds * 10000000ULL);
  const SIZE_T memoryBytes = static_cast<SIZE_T>(memoryMiB * 1024ULL * 1024ULL);
  limits.ProcessMemoryLimit = memoryBytes;
  limits.JobMemoryLimit = memoryBytes;
  if (!SetInformationJobObject(
          job,
          JobObjectExtendedLimitInformation,
          &limits,
          sizeof(limits))) {
    CloseHandle(job);
    return kGuardError;
  }

  std::wstring profileName;
  bool profileCreated = false;
  PSID appContainerSid = nullptr;
  DeleteAppContainerProfileFn deleteAppContainerProfile = nullptr;
  std::vector<SandboxMapping> sandboxMappings;
  std::vector<unsigned char> attributeStorage;
  LPPROC_THREAD_ATTRIBUTE_LIST attributeList = nullptr;
  SECURITY_CAPABILITIES capabilities{};
  const std::wstring executableDirectory = directoryName(executablePath);
  std::wstring sandboxExecutablePath = executablePath;
  std::wstring sandboxOutputPath = outputPath;
  std::wstring currentDirectory = executableDirectory;

  auto cleanupSandbox = [&]() {
    if (attributeList) {
      DeleteProcThreadAttributeList(attributeList);
      attributeList = nullptr;
    }
    if (appContainerSid) {
      if (profileCreated && !profileName.empty()) {
        deleteAppContainerProfile(profileName.c_str());
      }
      FreeSid(appContainerSid);
      appContainerSid = nullptr;
    }
  };

  DWORD creationFlags = CREATE_SUSPENDED | CREATE_NO_WINDOW;
  if (sandboxMode == SandboxMode::kAppContainer) {
    HMODULE userEnvironmentLibrary = LoadLibraryW(L"userenv.dll");
    if (!userEnvironmentLibrary) {
      CloseHandle(job);
      return guardFailure(L"load userenv.dll", GetLastError());
    }
    const auto createAppContainerProfile =
        reinterpret_cast<CreateAppContainerProfileFn>(GetProcAddress(
            userEnvironmentLibrary,
            "CreateAppContainerProfile"));
    deleteAppContainerProfile =
        reinterpret_cast<DeleteAppContainerProfileFn>(GetProcAddress(
            userEnvironmentLibrary,
            "DeleteAppContainerProfile"));
    const auto getAppContainerFolderPath =
        reinterpret_cast<GetAppContainerFolderPathFn>(GetProcAddress(
            userEnvironmentLibrary,
            "GetAppContainerFolderPath"));
    if (!createAppContainerProfile ||
        !deleteAppContainerProfile ||
        !getAppContainerFolderPath) {
      CloseHandle(job);
      return guardFailure(L"resolve AppContainer APIs", GetLastError());
    }
    profileName =
        L"local.excelsis.view.parser." +
        std::to_wstring(GetCurrentProcessId()) + L"." +
        std::to_wstring(GetTickCount64());
    HRESULT profileResult = createAppContainerProfile(
        profileName.c_str(),
        L"ExcelsisView native parser",
        L"Temporary least-privilege native parser profile",
        nullptr,
        0,
        &appContainerSid);
    if (SUCCEEDED(profileResult)) {
      profileCreated = true;
    }
    if (FAILED(profileResult) || !appContainerSid) {
      CloseHandle(job);
      return guardFailure(
          L"CreateAppContainerProfile",
          static_cast<std::uint64_t>(profileResult));
    }

    PWSTR appContainerFolder = nullptr;
    LPWSTR appContainerSidString = nullptr;
    if (!ConvertSidToStringSidW(appContainerSid, &appContainerSidString)) {
      cleanupSandbox();
      CloseHandle(job);
      return guardFailure(L"ConvertSidToStringSid", GetLastError());
    }
    const HRESULT folderResult = getAppContainerFolderPath(
        appContainerSidString,
        &appContainerFolder);
    LocalFree(appContainerSidString);
    if (FAILED(folderResult) || !appContainerFolder) {
      cleanupSandbox();
      CloseHandle(job);
      return guardFailure(
          L"GetAppContainerFolderPath",
          static_cast<std::uint64_t>(folderResult));
    }
    const std::wstring sandboxRoot =
        std::wstring(appContainerFolder) + L"\\ExcelsisRun";
    CoTaskMemFree(appContainerFolder);
    DWORD copyResult = ensureDirectory(sandboxRoot);
    if (copyResult != ERROR_SUCCESS) {
      cleanupSandbox();
      CloseHandle(job);
      return guardFailure(L"create AppContainer work directory", copyResult);
    }
    for (std::size_t index = 0;
         index < sandboxReadOnlyDirectories.size();
         ++index) {
      SandboxMapping mapping{
        sandboxReadOnlyDirectories[index],
        sandboxRoot + L"\\ro-" + std::to_wstring(index),
        false,
      };
      copyResult = copyDirectoryTree(mapping.sourceRoot, mapping.sandboxRoot);
      if (copyResult != ERROR_SUCCESS) {
        cleanupSandbox();
        CloseHandle(job);
        return guardFailure(L"copy read-only sandbox input", copyResult);
      }
      sandboxMappings.push_back(std::move(mapping));
    }
    for (std::size_t index = 0;
         index < sandboxReadWriteDirectories.size();
         ++index) {
      SandboxMapping mapping{
        sandboxReadWriteDirectories[index],
        sandboxRoot + L"\\rw-" + std::to_wstring(index),
        true,
      };
      copyResult = copyDirectoryTree(mapping.sourceRoot, mapping.sandboxRoot);
      if (copyResult != ERROR_SUCCESS) {
        cleanupSandbox();
        CloseHandle(job);
        return guardFailure(L"copy read-write sandbox input", copyResult);
      }
      sandboxMappings.push_back(std::move(mapping));
    }
    sandboxExecutablePath = translatedSandboxPath(
        executablePath,
        sandboxMappings);
    sandboxOutputPath = translatedSandboxPath(outputPath, sandboxMappings);
    currentDirectory = directoryName(sandboxExecutablePath);

    SIZE_T attributeBytes = 0;
    InitializeProcThreadAttributeList(nullptr, 1, 0, &attributeBytes);
    if (!attributeBytes) {
      cleanupSandbox();
      CloseHandle(job);
      return guardFailure(L"size process attribute list", GetLastError());
    }
    attributeStorage.resize(attributeBytes);
    attributeList = reinterpret_cast<LPPROC_THREAD_ATTRIBUTE_LIST>(
        attributeStorage.data());
    if (!InitializeProcThreadAttributeList(attributeList, 1, 0, &attributeBytes)) {
      attributeList = nullptr;
      cleanupSandbox();
      CloseHandle(job);
      return guardFailure(L"initialize process attribute list", GetLastError());
    }
    capabilities.AppContainerSid = appContainerSid;
    capabilities.Capabilities = nullptr;
    capabilities.CapabilityCount = 0;
    capabilities.Reserved = 0;
    if (!UpdateProcThreadAttribute(
            attributeList,
            0,
            PROC_THREAD_ATTRIBUTE_SECURITY_CAPABILITIES,
            &capabilities,
            sizeof(capabilities),
            nullptr,
            nullptr)) {
      cleanupSandbox();
      CloseHandle(job);
      return guardFailure(L"set sandbox process attributes", GetLastError());
    }
    creationFlags |= EXTENDED_STARTUPINFO_PRESENT;
  }

  std::vector<std::wstring> childArguments;
  childArguments.reserve(static_cast<std::size_t>(argc - executableIndex));
  for (int index = executableIndex; index < argc; ++index) {
    childArguments.push_back(
        sandboxMode == SandboxMode::kAppContainer
          ? translatedSandboxPath(argv[index], sandboxMappings)
          : std::wstring(argv[index]));
  }
  if (childArguments.empty()) {
    cleanupSandbox();
    CloseHandle(job);
    return kGuardError;
  }
  childArguments.front() = sandboxExecutablePath;
  std::wstring commandLine = buildCommandLine(childArguments);
  std::vector<wchar_t> mutableCommandLine(commandLine.begin(), commandLine.end());
  mutableCommandLine.push_back(L'\0');

  STARTUPINFOEXW startup{};
  startup.StartupInfo.cb = sizeof(startup);
  startup.StartupInfo.dwFlags = STARTF_USESHOWWINDOW;
  startup.StartupInfo.wShowWindow = SW_HIDE;
  startup.lpAttributeList = attributeList;
  PROCESS_INFORMATION process{};
  const BOOL created = CreateProcessW(
      sandboxExecutablePath.c_str(),
      mutableCommandLine.data(),
      nullptr,
      nullptr,
      FALSE,
      creationFlags,
      nullptr,
      currentDirectory.empty() ? nullptr : currentDirectory.c_str(),
      &startup.StartupInfo,
      &process);
  if (attributeList) {
    DeleteProcThreadAttributeList(attributeList);
    attributeList = nullptr;
  }
  if (!created) {
    const DWORD createError = GetLastError();
    cleanupSandbox();
    CloseHandle(job);
    return guardFailure(L"CreateProcess", createError);
  }

  if (!AssignProcessToJobObject(job, process.hProcess)) {
    TerminateProcess(process.hProcess, kGuardError);
    WaitForSingleObject(process.hProcess, 5000);
    CloseHandle(process.hThread);
    CloseHandle(process.hProcess);
    cleanupSandbox();
    CloseHandle(job);
    return kGuardError;
  }

  if (ResumeThread(process.hThread) == static_cast<DWORD>(-1)) {
    TerminateJobObject(job, kGuardError);
    WaitForSingleObject(process.hProcess, 5000);
    CloseHandle(process.hThread);
    CloseHandle(process.hProcess);
    cleanupSandbox();
    CloseHandle(job);
    return kGuardError;
  }
  CloseHandle(process.hThread);

  const ULONGLONG deadline = GetTickCount64() + timeoutMs;
  DWORD waitResult = WAIT_TIMEOUT;
  bool outputExceeded = false;
  while (true) {
    const ULONGLONG now = GetTickCount64();
    if (now >= deadline) break;
    const ULONGLONG remaining = deadline - now;
    const DWORD slice = static_cast<DWORD>(remaining < 100 ? remaining : 100);
    waitResult = WaitForSingleObject(process.hProcess, slice);
    if (waitResult != WAIT_TIMEOUT) break;
    if (!sandboxOutputPath.empty()) {
      WIN32_FILE_ATTRIBUTE_DATA attributes{};
      if (GetFileAttributesExW(
              sandboxOutputPath.c_str(),
              GetFileExInfoStandard,
              &attributes)) {
        ULARGE_INTEGER size{};
        size.HighPart = attributes.nFileSizeHigh;
        size.LowPart = attributes.nFileSizeLow;
        if (size.QuadPart > outputMaxMiB * 1024ULL * 1024ULL) {
          outputExceeded = true;
          break;
        }
      }
    }
  }
  DWORD exitCode = kGuardError;
  if (outputExceeded) {
    TerminateJobObject(job, kOutputLimitExit);
    WaitForSingleObject(process.hProcess, 5000);
    exitCode = kOutputLimitExit;
  } else if (waitResult == WAIT_TIMEOUT) {
    TerminateJobObject(job, kTimeoutExit);
    WaitForSingleObject(process.hProcess, 5000);
    exitCode = kTimeoutExit;
  } else if (waitResult == WAIT_OBJECT_0) {
    if (!GetExitCodeProcess(process.hProcess, &exitCode)) exitCode = kGuardError;
  }

  if (exitCode == 0 && sandboxMode == SandboxMode::kAppContainer) {
    for (const SandboxMapping& mapping : sandboxMappings) {
      if (!mapping.writeBack) continue;
      const DWORD copyResult = copyDirectoryTree(
          mapping.sandboxRoot,
          mapping.sourceRoot);
      if (copyResult != ERROR_SUCCESS) {
        exitCode = kGuardError;
        break;
      }
    }
  }

  CloseHandle(process.hProcess);
  cleanupSandbox();
  CloseHandle(job);
  return static_cast<int>(exitCode);
}
