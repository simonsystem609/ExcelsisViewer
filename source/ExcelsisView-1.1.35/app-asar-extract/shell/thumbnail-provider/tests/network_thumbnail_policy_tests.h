#pragma once

#include "../src/network_thumbnail_policy.h"

// Run the real DLL export against process-local HKCU/HKLM redirections. No real
// Windows policy, Explorer cache, network share or document is changed.
void TestNetworkThumbnailPolicy(HMODULE module) {
  namespace policy = excelsis::network_thumbnails;
  using Install = HRESULT(__stdcall*)(BOOL, LPCWSTR);
  const auto install = reinterpret_cast<Install>(GetProcAddress(module, "DllInstall"));
  Check(install != nullptr, "network policy export");
  wchar_t testPath[180]{};
  swprintf_s(testPath, L"Software\\ExcelsisView\\NetworkPolicyTest-%lu-%llu",
      GetCurrentProcessId(), static_cast<unsigned long long>(GetTickCount64()));
  HKEY root = nullptr, user = nullptr, machine = nullptr;
  DWORD disposition = 0;
  Check(RegCreateKeyExW(HKEY_CURRENT_USER, testPath, 0, nullptr, 0, KEY_ALL_ACCESS,
      nullptr, &root, &disposition) == ERROR_SUCCESS && disposition == REG_CREATED_NEW_KEY, "unique policy test root");
  Check(RegCreateKeyExW(root, L"User", 0, nullptr, 0, KEY_ALL_ACCESS, nullptr, &user, nullptr) == ERROR_SUCCESS, "test user hive");
  Check(RegCreateKeyExW(root, L"Machine", 0, nullptr, 0, KEY_ALL_ACCESS, nullptr, &machine, nullptr) == ERROR_SUCCESS, "test machine hive");
  Check(RegOverridePredefKey(HKEY_CURRENT_USER, user) == ERROR_SUCCESS, "redirect policy user hive");
  Check(RegOverridePredefKey(HKEY_LOCAL_MACHINE, machine) == ERROR_SUCCESS, "redirect policy machine hive");

  const auto reset = [&]() {
    for (HKEY hive : {user, machine}) {
      const LONG result = RegDeleteTreeW(hive, L"Software");
      Check(result == ERROR_SUCCESS || result == ERROR_FILE_NOT_FOUND, "reset isolated policy fixture");
    }
  };
  const auto set = [&](HKEY hive, const wchar_t* name, DWORD type, const void* data, DWORD bytes) {
    policy::Key key;
    Check(RegCreateKeyExW(hive, policy::kPolicyPath, 0, nullptr, 0, KEY_ALL_ACCESS,
        nullptr, &key.handle, nullptr) == ERROR_SUCCESS, "fixture policy key");
    Check(RegSetValueExW(key.handle, name, 0, type, static_cast<const BYTE*>(data), bytes) == ERROR_SUCCESS, "fixture policy value");
  };
  const auto dword = [&](HKEY hive, const wchar_t* name, DWORD value) {
    set(hive, name, REG_DWORD, &value, sizeof(value));
  };
  const auto read = [&](HKEY hive) {
    policy::Value value;
    Check(policy::ReadValue(hive, &value) == ERROR_SUCCESS, "read fixture policy");
    return value;
  };
  const auto owner = [&]() {
    policy::Ownership value;
    Check(policy::ReadOwnership(&value) == ERROR_SUCCESS, "read fixture ownership");
    return value;
  };
  const auto configure = [&](bool apply) { return install(apply ? TRUE : FALSE, L"network-thumbnail-cache"); };
  Check(install(TRUE, nullptr) == E_INVALIDARG, "null policy command rejected");
  Check(install(TRUE, L"arbitrary-command") == E_INVALIDARG, "unknown policy command rejected");
  Check(SUCCEEDED(configure(false)) && !read(user).present && !owner().present, "unowned absent uninstall is inert");

  dword(user, L"DisableThumbnails", 0);
  dword(user, L"DisableThumbnailsOnNetworkFolders", 0);
  Check(SUCCEEDED(configure(true)) && read(user).enabled && owner().state == policy::kOwned, "automatic apply and ownership");
  const FILETIME firstStamp = read(user).stamp;
  Check(SUCCEEDED(configure(true)) && policy::SameStamp(firstStamp, read(user).stamp), "startup is idempotent");
  Check(SUCCEEDED(configure(false)) && !read(user).present && owner().state == policy::kRestored, "restore original absence");
  for (const wchar_t* name : {L"DisableThumbnails", L"DisableThumbnailsOnNetworkFolders"}) {
    DWORD value = 99, bytes = sizeof(value);
    Check(RegGetValueW(user, policy::kPolicyPath, name, RRF_RT_REG_DWORD, nullptr, &value, &bytes) == ERROR_SUCCESS && value == 0,
        "thumbnail display settings preserved");
  }
  Check(SUCCEEDED(configure(false)) && SUCCEEDED(configure(true)) && read(user).enabled, "uninstall/reinstall lifecycle");

  for (DWORD existing : {0u, 1u, 2u}) {
    reset(); dword(user, policy::kPolicyValue, existing);
    const FILETIME stamp = read(user).stamp;
    Check((existing == 1) == SUCCEEDED(configure(true)), "existing policy result");
    Check(!owner().present && SUCCEEDED(configure(false)), "existing policy never claimed");
    Check(read(user).present && policy::SameStamp(stamp, read(user).stamp), "existing DWORD preserved byte-for-byte");
  }
  for (DWORD type : {REG_SZ, REG_BINARY, REG_QWORD}) {
    reset(); const wchar_t custom[] = L"existing-policy-data";
    set(user, policy::kPolicyValue, type, custom, sizeof(custom));
    const FILETIME stamp = read(user).stamp;
    Check(FAILED(configure(true)) && SUCCEEDED(configure(false)) && !owner().present, "unrecognized policy type left unowned");
    Check(policy::SameStamp(stamp, read(user).stamp), "unrecognized policy untouched");
  }
  for (DWORD existing : {0u, 1u}) {
    reset(); dword(machine, policy::kPolicyValue, existing);
    const FILETIME stamp = read(machine).stamp;
    Check(FAILED(configure(true)), "machine policy respected without assuming HKLM policy precedence");
    Check(SUCCEEDED(configure(false)) && !read(user).present && !owner().present, "machine policy no HKCU mutation");
    Check(policy::SameStamp(stamp, read(machine).stamp), "machine policy untouched");
  }

  reset(); Check(SUCCEEDED(configure(true)), "external-change setup");
  dword(user, policy::kPolicyValue, 0);
  Check(FAILED(configure(true)) && owner().state == policy::kExternalChange, "later user value never overridden");
  Check(SUCCEEDED(configure(false)) && read(user).present && !read(user).enabled, "later user value never removed");
  reset(); Check(SUCCEEDED(configure(true)), "external-removal setup");
  { policy::Key key;
    Check(RegOpenKeyExW(user, policy::kPolicyPath, 0, KEY_SET_VALUE, &key.handle) == ERROR_SUCCESS, "fixture removal key");
    Check(RegDeleteValueW(key.handle, policy::kPolicyValue) == ERROR_SUCCESS, "fixture external removal");
  }
  Check(FAILED(configure(true)) && !read(user).present, "later user absence never recreated");

  for (bool rewriteSameValue : {true, false}) {
    reset(); Check(SUCCEEDED(configure(true)), "policy-refresh setup");
    const FILETIME before = read(user).stamp;
    Sleep(10); // Ensure the registry key's write timestamp advances.
    dword(user, rewriteSameValue ? policy::kPolicyValue : L"AnotherPolicy", 1);
    const bool observable = !policy::SameStamp(before, read(user).stamp);
    Check(rewriteSameValue || observable, "a changed policy key has a different timestamp");
    Check(SUCCEEDED(configure(true)) && owner().state == (observable ? policy::kExternalChange : policy::kOwned),
        "observable policy refresh retires ownership; identical no-op writes are indistinguishable");
    Check(SUCCEEDED(configure(false)) && read(user).present == observable, "restore only observably unchanged owned policy");
  }
  reset(); Check(SUCCEEDED(configure(true)), "later machine policy setup");
  dword(machine, policy::kPolicyValue, 0);
  Check(FAILED(configure(true)) && SUCCEEDED(configure(false)) && read(user).enabled, "later machine policy prevents automatic mutation");
  reset(); Check(policy::Record(policy::kPending) == ERROR_SUCCESS, "incomplete ownership fixture");
  Check(FAILED(configure(true)) && !read(user).present, "incomplete ownership fails closed");
  reset(); { policy::Key key;
    Check(RegCreateKeyExW(user, policy::kOwnerPath, 0, nullptr, 0, KEY_ALL_ACCESS, nullptr, &key.handle, nullptr) == ERROR_SUCCESS,
        "corrupt ownership fixture");
  }
  Check(FAILED(configure(true)) && !read(user).present, "corrupt ownership fails closed");

  Check(RegOverridePredefKey(HKEY_LOCAL_MACHINE, nullptr) == ERROR_SUCCESS, "restore machine hive");
  Check(RegOverridePredefKey(HKEY_CURRENT_USER, nullptr) == ERROR_SUCCESS, "restore user hive");
  RegCloseKey(machine); RegCloseKey(user); RegCloseKey(root);
  Check(RegDeleteTreeW(HKEY_CURRENT_USER, testPath) == ERROR_SUCCESS, "remove isolated test registry keys");
  std::puts("Network thumbnail policy: isolated apply/preserve/restore/refresh tests passed.");
}
