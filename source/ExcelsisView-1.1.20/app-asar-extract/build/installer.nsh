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
  ${EndIf}
!macroend
