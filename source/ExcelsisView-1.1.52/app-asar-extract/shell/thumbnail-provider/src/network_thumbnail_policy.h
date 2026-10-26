#pragma once

#include <windows.h>
#include <initializer_list>

// Explorer owns Thumbs.db, independently of IThumbnailProvider source streams.
// Touch only this user's network-cache storage policy; never thumbnail display.
namespace excelsis::network_thumbnails {
constexpr wchar_t kPolicyPath[] = L"Software\\Policies\\Microsoft\\Windows\\Explorer";
constexpr wchar_t kPolicyValue[] = L"DisableThumbsDBOnNetworkFolders";
constexpr wchar_t kOwnerPath[] = L"Software\\ExcelsisView\\NetworkThumbnailCachePolicy";
constexpr DWORD kPending = 0, kOwned = 1, kRestored = 2, kExternalChange = 3;

struct Key {
  HKEY handle = nullptr;
  ~Key() { if (handle) RegCloseKey(handle); }
};
struct Value { bool present = false; bool enabled = false; FILETIME stamp{}; };
struct Ownership { bool present = false; DWORD state = kPending; FILETIME stamp{}; };

inline LONG ReadValue(HKEY root, Value* value) {
  *value = {};
  Key key;
  LONG result = RegOpenKeyExW(root, kPolicyPath, 0, KEY_QUERY_VALUE, &key.handle);
  if (result == ERROR_FILE_NOT_FOUND || result == ERROR_PATH_NOT_FOUND) return ERROR_SUCCESS;
  if (result != ERROR_SUCCESS) return result;
  DWORD type = 0, bytes = sizeof(DWORD), data = 0;
  result = RegQueryValueExW(key.handle, kPolicyValue, nullptr, &type, reinterpret_cast<BYTE*>(&data), &bytes);
  if (result == ERROR_FILE_NOT_FOUND) return ERROR_SUCCESS;
  if (result != ERROR_SUCCESS && result != ERROR_MORE_DATA) return result;
  value->present = true;
  value->enabled = result == ERROR_SUCCESS && type == REG_DWORD && bytes == sizeof(DWORD) && data == 1;
  return RegQueryInfoKeyW(key.handle, nullptr, nullptr, nullptr, nullptr, nullptr, nullptr,
      nullptr, nullptr, nullptr, nullptr, &value->stamp);
}

inline LONG ReadOwnership(Ownership* owner) {
  *owner = {};
  Key key;
  LONG result = RegOpenKeyExW(HKEY_CURRENT_USER, kOwnerPath, 0, KEY_QUERY_VALUE, &key.handle);
  if (result == ERROR_FILE_NOT_FOUND || result == ERROR_PATH_NOT_FOUND) return ERROR_SUCCESS;
  if (result != ERROR_SUCCESS) return result;
  owner->present = true;
  DWORD schema = 0, previousAbsent = 0, bytes = sizeof(DWORD);
  result = RegGetValueW(key.handle, nullptr, L"Schema", RRF_RT_REG_DWORD, nullptr, &schema, &bytes);
  if (result != ERROR_SUCCESS || schema != 1) return ERROR_INVALID_DATA;
  bytes = sizeof(DWORD);
  result = RegGetValueW(key.handle, nullptr, L"PreviousValueAbsent", RRF_RT_REG_DWORD, nullptr, &previousAbsent, &bytes);
  if (result != ERROR_SUCCESS || previousAbsent != 1) return ERROR_INVALID_DATA;
  bytes = sizeof(DWORD);
  result = RegGetValueW(key.handle, nullptr, L"State", RRF_RT_REG_DWORD, nullptr, &owner->state, &bytes);
  if (result != ERROR_SUCCESS || owner->state > kExternalChange) return ERROR_INVALID_DATA;
  if (owner->state == kOwned) {
    bytes = sizeof(FILETIME);
    result = RegGetValueW(key.handle, nullptr, L"PolicyKeyStamp", RRF_RT_REG_BINARY, nullptr, &owner->stamp, &bytes);
    if (result != ERROR_SUCCESS || bytes != sizeof(FILETIME)) return ERROR_INVALID_DATA;
  }
  return ERROR_SUCCESS;
}

inline LONG Record(DWORD state, const FILETIME* stamp = nullptr) {
  Key key;
  LONG result = RegCreateKeyExW(HKEY_CURRENT_USER, kOwnerPath, 0, nullptr, 0,
      KEY_SET_VALUE, nullptr, &key.handle, nullptr);
  if (result != ERROR_SUCCESS) return result;
  const DWORD one = 1;
  for (const wchar_t* name : {L"Schema", L"PreviousValueAbsent"}) {
    result = RegSetValueExW(key.handle, name, 0, REG_DWORD, reinterpret_cast<const BYTE*>(&one), sizeof(one));
    if (result != ERROR_SUCCESS) return result;
  }
  if (stamp) {
    result = RegSetValueExW(key.handle, L"PolicyKeyStamp", 0, REG_BINARY,
        reinterpret_cast<const BYTE*>(stamp), sizeof(*stamp));
    if (result != ERROR_SUCCESS) return result;
  }
  return RegSetValueExW(key.handle, L"State", 0, REG_DWORD,
      reinterpret_cast<const BYTE*>(&state), sizeof(state));
}

inline bool SameStamp(const FILETIME& a, const FILETIME& b) {
  return a.dwLowDateTime == b.dwLowDateTime && a.dwHighDateTime == b.dwHighDateTime;
}

inline HRESULT Configure(bool apply, bool* changed) {
  if (!changed) return E_POINTER;
  *changed = false;
  // Serialize installer/startup calls in this Windows session. A timeout or
  // inaccessible mutex fails closed, without making a policy change.
  struct Lock {
    HANDLE handle = CreateMutexW(nullptr, FALSE, L"Local\\ExcelsisView.NetworkThumbnailPolicy.v1");
    bool held = false;
    ~Lock() { if (held) ReleaseMutex(handle); if (handle) CloseHandle(handle); }
  } lock;
  if (!lock.handle) return HRESULT_FROM_WIN32(GetLastError());
  const DWORD waited = WaitForSingleObject(lock.handle, 5000);
  lock.held = waited == WAIT_OBJECT_0 || waited == WAIT_ABANDONED;
  if (!lock.held) return HRESULT_FROM_WIN32(waited == WAIT_TIMEOUT ? ERROR_TIMEOUT : GetLastError());
  Value machine, current;
  Ownership owner;
  LONG result = ReadValue(HKEY_LOCAL_MACHINE, &machine);
  if (result != ERROR_SUCCESS) return HRESULT_FROM_WIN32(result);
  result = ReadValue(HKEY_CURRENT_USER, &current);
  if (result != ERROR_SUCCESS) return HRESULT_FROM_WIN32(result);
  result = ReadOwnership(&owner);
  if (result != ERROR_SUCCESS) return HRESULT_FROM_WIN32(result);
  // A configured machine policy is never overridden or restored by this app.
  if (machine.present) return apply
      ? HRESULT_FROM_WIN32(ERROR_ACCESS_DISABLED_BY_POLICY) : S_OK;

  if (owner.present && owner.state == kOwned) {
    if (!current.enabled || !SameStamp(current.stamp, owner.stamp)) {
      // Any observable policy-key write retires ownership conservatively.
      // Windows can optimize away identical writes; these have no observable
      // timestamp change and cannot be distinguished from an unchanged value.
      result = Record(kExternalChange);
      if (result != ERROR_SUCCESS) return HRESULT_FROM_WIN32(result);
      return apply && !current.enabled ? HRESULT_FROM_WIN32(ERROR_ACCESS_DISABLED_BY_POLICY) : S_OK;
    }
    if (apply) return S_OK;
    Key key;
    result = RegOpenKeyExW(HKEY_CURRENT_USER, kPolicyPath, 0, KEY_SET_VALUE, &key.handle);
    if (result != ERROR_SUCCESS) return HRESULT_FROM_WIN32(result);
    Value rechecked;
    result = ReadValue(HKEY_CURRENT_USER, &rechecked);
    if (result != ERROR_SUCCESS) return HRESULT_FROM_WIN32(result);
    result = ReadValue(HKEY_LOCAL_MACHINE, &machine);
    if (result != ERROR_SUCCESS) return HRESULT_FROM_WIN32(result);
    if (machine.present || !rechecked.enabled || !SameStamp(rechecked.stamp, owner.stamp)) {
      return HRESULT_FROM_WIN32(Record(kExternalChange));
    }
    // Remove this one value only, restoring the recorded original absence.
    result = RegDeleteValueW(key.handle, kPolicyValue);
    if (result != ERROR_SUCCESS) return HRESULT_FROM_WIN32(result);
    *changed = true;
    return HRESULT_FROM_WIN32(Record(kRestored));
  }
  if (!apply) return S_OK; // No app ownership means nothing to restore.
  if (current.present) return current.enabled ? S_OK : HRESULT_FROM_WIN32(ERROR_ACCESS_DISABLED_BY_POLICY);
  if (owner.present && owner.state != kRestored) return HRESULT_FROM_WIN32(ERROR_ACCESS_DISABLED_BY_POLICY);

  // Existing values of any type are left untouched, so only absence needs a
  // rollback record. Commit that record before changing Windows policy.
  result = Record(kPending);
  if (result != ERROR_SUCCESS) return HRESULT_FROM_WIN32(result);
  Value rechecked;
  result = ReadValue(HKEY_CURRENT_USER, &rechecked);
  if (result != ERROR_SUCCESS) return HRESULT_FROM_WIN32(result);
  if (rechecked.present) {
    Record(kExternalChange);
    return rechecked.enabled ? S_OK : HRESULT_FROM_WIN32(ERROR_ACCESS_DISABLED_BY_POLICY);
  }
  result = ReadValue(HKEY_LOCAL_MACHINE, &machine);
  if (result != ERROR_SUCCESS || machine.present) {
    Record(kExternalChange);
    return HRESULT_FROM_WIN32(result == ERROR_SUCCESS ? ERROR_ACCESS_DISABLED_BY_POLICY : result);
  }
  Key key;
  result = RegCreateKeyExW(HKEY_CURRENT_USER, kPolicyPath, 0, nullptr, 0,
      KEY_SET_VALUE | KEY_QUERY_VALUE, nullptr, &key.handle, nullptr);
  if (result != ERROR_SUCCESS) {
    Record(kRestored); // No value was written; a later startup may safely retry.
    return HRESULT_FROM_WIN32(result);
  }
  const DWORD one = 1;
  result = RegSetValueExW(key.handle, kPolicyValue, 0, REG_DWORD,
      reinterpret_cast<const BYTE*>(&one), sizeof(one));
  if (result != ERROR_SUCCESS) {
    Record(kRestored);
    return HRESULT_FROM_WIN32(result);
  }
  result = ReadValue(HKEY_CURRENT_USER, &current);
  if (result != ERROR_SUCCESS || !current.enabled) return HRESULT_FROM_WIN32(ERROR_WRITE_FAULT);
  *changed = true;
  result = Record(kOwned, &current.stamp);
  if (result != ERROR_SUCCESS) {
    // Failed ownership persistence: roll back only if nothing changed since
    // our write, rather than leaving an untracked automatic policy change.
    Value after;
    if (ReadValue(HKEY_CURRENT_USER, &after) == ERROR_SUCCESS && after.enabled && SameStamp(after.stamp, current.stamp)) {
      if (RegDeleteValueW(key.handle, kPolicyValue) == ERROR_SUCCESS) Record(kRestored);
    }
  }
  return HRESULT_FROM_WIN32(result);
}
} // namespace excelsis::network_thumbnails
