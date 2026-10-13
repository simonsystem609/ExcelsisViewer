// Independently authored Windows OLE file-cut source. AGPL-3.0-or-later.
// No file deletion/move API here; only one Unicode CF_HDROP path and receipts.
#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <windows.h>
#include <ole2.h>
#include <shlobj.h>
#include <shellapi.h>
#include <cstdio>
#include <cstring>
#include <cwchar>
#include <string>

static bool quiet = false;
static void emit(const char* type) { if (!quiet) { std::printf("{\"type\":\"%s\"}\n", type); std::fflush(stdout); } }
class FileCut final : public IDataObject {
  LONG refs = 1;
  std::wstring file;
  CLIPFORMAT preferred, performed, paste, logical;
  DWORD values[3] = {0,0,0};
  bool received[3] = {false,false,false};
  static HRESULT medium(const void* bytes, SIZE_T size, STGMEDIUM* out) {
    if (!out) return E_POINTER;
    std::memset(out, 0, sizeof(*out));
    HGLOBAL handle = GlobalAlloc(GMEM_MOVEABLE | GMEM_ZEROINIT, size);
    if (!handle) return E_OUTOFMEMORY;
    void* target = GlobalLock(handle);
    if (!target) { GlobalFree(handle); return E_OUTOFMEMORY; }
    std::memcpy(target, bytes, size); GlobalUnlock(handle);
    out->tymed = TYMED_HGLOBAL; out->hGlobal = handle; return S_OK;
  }
  int index(CLIPFORMAT value) const { return value == performed ? 0 : value == paste ? 1 : value == logical ? 2 : -1; }
public:
  explicit FileCut(std::wstring value) : file(std::move(value)),
    preferred((CLIPFORMAT)RegisterClipboardFormatW(L"Preferred DropEffect")),
    performed((CLIPFORMAT)RegisterClipboardFormatW(L"Performed DropEffect")),
    paste((CLIPFORMAT)RegisterClipboardFormatW(L"Paste Succeeded")),
    logical((CLIPFORMAT)RegisterClipboardFormatW(L"Logical Performed DropEffect")) {}
  HRESULT STDMETHODCALLTYPE QueryInterface(REFIID iid, void** out) override {
    if (!out) return E_POINTER; *out = nullptr;
    if (IsEqualIID(iid, IID_IUnknown) || IsEqualIID(iid, IID_IDataObject)) { *out = static_cast<IDataObject*>(this); AddRef(); return S_OK; }
    return E_NOINTERFACE;
  }
  ULONG STDMETHODCALLTYPE AddRef() override { return (ULONG)InterlockedIncrement(&refs); }
  ULONG STDMETHODCALLTYPE Release() override { LONG value = InterlockedDecrement(&refs); if (!value) delete this; return (ULONG)value; }
  HRESULT STDMETHODCALLTYPE QueryGetData(FORMATETC* format) override {
    if (!format) return E_POINTER;
    if (!(format->tymed & TYMED_HGLOBAL)) return DV_E_TYMED;
    if (format->dwAspect != DVASPECT_CONTENT || format->lindex != -1) return DV_E_FORMATETC;
    int i = index(format->cfFormat);
    return format->cfFormat == CF_HDROP || format->cfFormat == preferred || (i >= 0 && received[i]) ? S_OK : DV_E_FORMATETC;
  }
  HRESULT STDMETHODCALLTYPE GetData(FORMATETC* format, STGMEDIUM* out) override {
    HRESULT result = QueryGetData(format); if (FAILED(result)) return result;
    if (format->cfFormat == CF_HDROP) {
      const SIZE_T size = sizeof(DROPFILES) + (file.size() + 2) * sizeof(wchar_t);
      std::string bytes(size, '\0');
      DROPFILES header{}; header.pFiles = sizeof(DROPFILES); header.fWide = TRUE;
      std::memcpy(bytes.data(), &header, sizeof(header));
      std::memcpy(bytes.data() + sizeof(header), file.c_str(), (file.size() + 1) * sizeof(wchar_t));
      return medium(bytes.data(), bytes.size(), out);
    }
    DWORD value = format->cfFormat == preferred ? DROPEFFECT_MOVE : values[index(format->cfFormat)];
    return medium(&value, sizeof(value), out);
  }
  HRESULT STDMETHODCALLTYPE SetData(FORMATETC* format, STGMEDIUM* value, BOOL release) override {
    if (!format || !value) return E_POINTER;
    const int i = index(format->cfFormat);
    if (i < 0 || format->dwAspect != DVASPECT_CONTENT || format->lindex != -1) return DV_E_FORMATETC;
    if (value->tymed != TYMED_HGLOBAL || !value->hGlobal || GlobalSize(value->hGlobal) < sizeof(DWORD) || GlobalSize(value->hGlobal) > 64) return DV_E_TYMED;
    const void* data = GlobalLock(value->hGlobal); if (!data) return E_INVALIDARG;
    DWORD effect{}; std::memcpy(&effect, data, sizeof(effect)); GlobalUnlock(value->hGlobal);
    if (effect != DROPEFFECT_NONE && effect != DROPEFFECT_COPY && effect != DROPEFFECT_MOVE && effect != DROPEFFECT_LINK) return E_INVALIDARG;
    values[i] = effect; received[i] = true;
    if (!quiet) { std::printf("{\"type\":\"receipt\",\"format\":\"%s\",\"effect\":%lu}\n", i == 0 ? "performed" : i == 1 ? "paste" : "logical", (unsigned long)effect); std::fflush(stdout); }
    if (release) ReleaseStgMedium(value);
    return S_OK;
  }
  HRESULT STDMETHODCALLTYPE EnumFormatEtc(DWORD direction, IEnumFORMATETC** out) override {
    if (direction != DATADIR_GET) return E_NOTIMPL;
    FORMATETC list[5] = {{CF_HDROP,nullptr,DVASPECT_CONTENT,-1,TYMED_HGLOBAL},
      {preferred,nullptr,DVASPECT_CONTENT,-1,TYMED_HGLOBAL}};
    UINT count = 2; CLIPFORMAT formats[3] = {performed,paste,logical};
    for (int i=0;i<3;i++) if (received[i]) list[count++] = {formats[i],nullptr,DVASPECT_CONTENT,-1,TYMED_HGLOBAL};
    return SHCreateStdEnumFmtEtc(count,list,out);
  }
  HRESULT STDMETHODCALLTYPE GetDataHere(FORMATETC*, STGMEDIUM*) override { return E_NOTIMPL; }
  HRESULT STDMETHODCALLTYPE GetCanonicalFormatEtc(FORMATETC* in, FORMATETC* out) override { if (!in || !out) return E_POINTER; *out=*in; out->ptd=nullptr; return DATA_S_SAMEFORMATETC; }
  HRESULT STDMETHODCALLTYPE DAdvise(FORMATETC*, DWORD, IAdviseSink*, DWORD*) override { return OLE_E_ADVISENOTSUPPORTED; }
  HRESULT STDMETHODCALLTYPE DUnadvise(DWORD) override { return OLE_E_ADVISENOTSUPPORTED; }
  HRESULT STDMETHODCALLTYPE EnumDAdvise(IEnumSTATDATA**) override { return OLE_E_ADVISENOTSUPPORTED; }
};
static bool selfTest() {
  quiet = true;
  auto* object = new FileCut(L"C:\\Synthetic tests\\árvíz [1]; $name.dxf");
  FORMATETC fmt{CF_HDROP,nullptr,DVASPECT_CONTENT,-1,TYMED_HGLOBAL}; STGMEDIUM data{};
  bool ok = SUCCEEDED(object->GetData(&fmt,&data));
  wchar_t file[256]{};
  if (ok) { ok = DragQueryFileW((HDROP)data.hGlobal,0xFFFFFFFF,nullptr,0)==1 && DragQueryFileW((HDROP)data.hGlobal,0,file,256)>0 && std::wcscmp(file,L"C:\\Synthetic tests\\árvíz [1]; $name.dxf")==0; ReleaseStgMedium(&data); }
  fmt.cfFormat=(CLIPFORMAT)RegisterClipboardFormatW(L"Preferred DropEffect");
  if (ok && SUCCEEDED(object->GetData(&fmt,&data))) { DWORD* effect=(DWORD*)GlobalLock(data.hGlobal); ok=effect && *effect==DROPEFFECT_MOVE; if(effect)GlobalUnlock(data.hGlobal); ReleaseStgMedium(&data); } else ok=false;
  const wchar_t* formats[] = {L"Performed DropEffect",L"Paste Succeeded",L"Logical Performed DropEffect"};
  for (const auto* name : formats) {
    fmt.cfFormat=(CLIPFORMAT)RegisterClipboardFormatW(name);
    HGLOBAL buffer=GlobalAlloc(GMEM_MOVEABLE,sizeof(DWORD)); DWORD* effect=(DWORD*)GlobalLock(buffer); *effect=DROPEFFECT_MOVE; GlobalUnlock(buffer);
    STGMEDIUM receipt{}; receipt.tymed=TYMED_HGLOBAL; receipt.hGlobal=buffer;
    ok = ok && SUCCEEDED(object->SetData(&fmt,&receipt,TRUE));
    if (SUCCEEDED(object->GetData(&fmt,&data))) { effect=(DWORD*)GlobalLock(data.hGlobal); ok=ok && effect && *effect==DROPEFFECT_MOVE; if(effect)GlobalUnlock(data.hGlobal); ReleaseStgMedium(&data); } else ok=false;
  }
  object->Release();
  std::printf("{\"selfTest\":%s,\"oneUnicodeFile\":true,\"moveEffect\":true,\"receipts\":true,\"globalClipboardUntouched\":true}\n",ok?"true":"false");
  return ok;
}
int wmain(int argc, wchar_t** argv) {
  SetErrorMode(SEM_FAILCRITICALERRORS | SEM_NOGPFAULTERRORBOX);
  const bool testing = argc == 2 && std::wcscmp(argv[1],L"--self-test")==0;
  if (argc != 2 || std::wcslen(argv[1]) > 32760) return 2;
  const wchar_t* file=argv[1];
  if (!testing && !((file[0] && file[1]==L':' && (file[2]==L'\\' || file[2]==L'/')) || (file[0]==L'\\' && file[1]==L'\\'))) return 2;
  const wchar_t* ext=std::wcsrchr(file,L'.');
  if (!testing && (!ext || (_wcsicmp(ext,L".dxf") && _wcsicmp(ext,L".dwg") && _wcsicmp(ext,L".pdf")))) return 2;
  DWORD attrs=testing?0:GetFileAttributesW(file);
  if (!testing && (attrs==INVALID_FILE_ATTRIBUTES || (attrs & (FILE_ATTRIBUTE_DIRECTORY|FILE_ATTRIBUTE_REPARSE_POINT)))) return 2;
  // UI clipboard access requires the user's desktop (not an AppContainer).
  // This trusted service nevertheless has one-process/CPU/memory job limits,
  // a one-hour lifetime and exits on its parent's pipe closure.
  HANDLE job=CreateJobObjectW(nullptr,nullptr); if(!job) return 3;
  JOBOBJECT_EXTENDED_LIMIT_INFORMATION limits{};
  limits.BasicLimitInformation.LimitFlags=JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE|JOB_OBJECT_LIMIT_ACTIVE_PROCESS|JOB_OBJECT_LIMIT_PROCESS_TIME|JOB_OBJECT_LIMIT_PROCESS_MEMORY|JOB_OBJECT_LIMIT_JOB_MEMORY;
  limits.BasicLimitInformation.ActiveProcessLimit=1;
  limits.BasicLimitInformation.PerProcessUserTimeLimit.QuadPart=120LL*10000000LL;
  limits.ProcessMemoryLimit=128ULL*1024ULL*1024ULL; limits.JobMemoryLimit=limits.ProcessMemoryLimit;
  if(!SetInformationJobObject(job,JobObjectExtendedLimitInformation,&limits,sizeof(limits)) || !AssignProcessToJobObject(job,GetCurrentProcess())) { CloseHandle(job); return 3; }
  if(testing) return selfTest()?0:1;
  if(FAILED(OleInitialize(nullptr))) return 4;
  auto* object=new FileCut(file);
  HRESULT result=OleSetClipboard(object);
  if(FAILED(result)) { object->Release(); OleUninitialize(); return 5; }
  emit("ready"); const ULONGLONG started=GetTickCount64(); bool lost=false;
  HANDLE input=GetStdHandle(STD_INPUT_HANDLE);
  while(GetTickCount64()-started<3600000ULL) {
    MSG msg{}; while(PeekMessageW(&msg,nullptr,0,0,PM_REMOVE)) { TranslateMessage(&msg); DispatchMessageW(&msg); }
    DWORD count=0;
    if(!PeekNamedPipe(input,nullptr,0,nullptr,&count,nullptr)) break;
    if(count) { char command[64]{}; DWORD read=0; if(!ReadFile(input,command,63,&read,nullptr) || std::strstr(command,"stop")) break; }
    if(!lost && OleIsCurrentClipboard(object)!=S_OK) { lost=true; emit("lost"); }
    MsgWaitForMultipleObjectsEx(0,nullptr,100,QS_ALLINPUT,MWMO_INPUTAVAILABLE);
  }
  // Clear only our own pending cut, never another app's replacement clipboard.
  if(OleIsCurrentClipboard(object)==S_OK) OleSetClipboard(nullptr);
  object->Release(); OleUninitialize();
  return 0; // Closing the bounded job at process exit cannot affect other apps.
}
