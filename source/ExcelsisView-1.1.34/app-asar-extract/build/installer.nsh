!include "LogicLib.nsh"
!include "x64.nsh"

!macro customInstall
  ${IfNot} ${RunningX64}
    MessageBox MB_ICONSTOP "ExcelsisView requires 64-bit Windows."
    Abort
  ${EndIf}

  ${If} ${FileExists} "$WINDIR\Sysnative\regsvr32.exe"
    StrCpy $R1 "$WINDIR\Sysnative\regsvr32.exe"
  ${Else}
    StrCpy $R1 "$SYSDIR\regsvr32.exe"
  ${EndIf}
  ExecWait '"$R1" /s "$INSTDIR\resources\shell\ExcelsisDxfThumbnailProvider.dll"' $R0
  ${If} $R0 != 0
    MessageBox MB_ICONSTOP "Windows Explorer thumbnail registration failed (code $R0)."
    Abort
  ${EndIf}

  WriteRegStr HKLM "Software\Classes\SystemFileAssociations\.pdf\shell\ExcelsisView.BatchPrint" "MUIVerb" "Batch print with ExcelsisView"
  ; Network cache storage only: thumbnail display is left enabled. Normal app
  ; startup repeats this for the actual user if setup used another admin account.
  ExecWait '"$R1" /s /n /i:network-thumbnail-cache "$INSTDIR\resources\shell\ExcelsisDxfThumbnailProvider.dll"' $R0
  ${If} $R0 != 0
    MessageBox MB_ICONEXCLAMATION|MB_OK "Windows network thumbnail caching could not be configured (code $R0). Existing user/admin policies were preserved. ExcelsisView will retry for your user when it starts." /SD IDOK
  ${EndIf}
  WriteRegStr HKLM "Software\Classes\SystemFileAssociations\.pdf\shell\ExcelsisView.BatchPrint" "Icon" "$\"$INSTDIR\resources\build\icon-file-pdf.ico$\",0"
  WriteRegStr HKLM "Software\Classes\SystemFileAssociations\.pdf\shell\ExcelsisView.BatchPrint" "MultiSelectModel" "Player"
  WriteRegStr HKLM "Software\Classes\SystemFileAssociations\.pdf\shell\ExcelsisView.BatchPrint\command" "" "$\"$INSTDIR\ExcelsisView.exe$\" --batch-print %*"
!macroend

!macro customUnInstall
  DeleteRegKey HKLM "Software\Classes\SystemFileAssociations\.pdf\shell\ExcelsisView.BatchPrint"
  ${If} ${RunningX64}
    ${If} ${FileExists} "$WINDIR\Sysnative\regsvr32.exe"
      StrCpy $R1 "$WINDIR\Sysnative\regsvr32.exe"
    ${Else}
      StrCpy $R1 "$SYSDIR\regsvr32.exe"
    ${EndIf}
    ExecWait '"$R1" /u /s "$INSTDIR\resources\shell\ExcelsisDxfThumbnailProvider.dll"' $R0
    ; Preserve ownership during upgrades; only a real uninstall restores an
    ; unchanged policy created by Viewer for the invoking Windows user.
    ${IfNot} ${isUpdated}
      ExecWait '"$R1" /s /u /n /i:network-thumbnail-cache "$INSTDIR\resources\shell\ExcelsisDxfThumbnailProvider.dll"' $R0
      ${If} $R0 != 0
        MessageBox MB_ICONEXCLAMATION|MB_OK "The network thumbnail cache setting could not be restored (code $R0). Windows policies were left in place." /SD IDOK
      ${EndIf}
    ${EndIf}
  ${EndIf}
!macroend
