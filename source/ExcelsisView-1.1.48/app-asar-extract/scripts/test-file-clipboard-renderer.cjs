// Hidden real renderer/main IPC; fake clipboard, recoverable synthetic moves.
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const project=path.resolve(__dirname,'..');
if(!process.versions.electron){
  const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;delete env.NODE_OPTIONS;
  const child=require('node:child_process').spawn(require('electron'),[__filename],{cwd:project,windowsHide:true,stdio:'inherit',env});
  child.on('exit',code=>{process.exitCode=code??1;});
}else run().catch(error=>{console.error(error);require('electron').app.exit(1);});
async function run(){
  const {app,BrowserWindow,dialog}=require('electron'),sync=require('node:fs');
  const root=sync.mkdtempSync(path.join(require('node:os').tmpdir(),'excelsis-cut-ui-'));
  const destination=path.join(root,'pasted');sync.mkdirSync(destination);
  app.setPath('appData',path.join(app.getPath('appData'),path.basename(root)));app.setAppPath(project);
  const drawing=path.join(root,'Drawing.dxf'),dwg=path.join(root,'Drawing.dwg'),pdf=path.join(root,'Drawing.pdf');
  const text='0\nSECTION\n2\nENTITIES\n0\nLINE\n8\nTEST\n10\n0\n20\n0\n11\n40\n21\n20\n0\nENDSEC\n0\nEOF\n';
  sync.writeFileSync(drawing,text);sync.writeFileSync(dwg,'synthetic DWG original bytes');
  let conversion=drawing;
  require('../dwg-converter.cjs').convertedDxfPath=async()=>conversion;
  const transfers=[],answers=[],prompts=[];
  require('../file-clipboard-transport.cjs').startFileClipboard=async(file,onEvent)=>{
    const record={file,onEvent,stopped:false};transfers.push(record);return {stop:()=>{record.stopped=true;}};
  };
  dialog.showMessageBox=async(win,options)=>{
    assert(win instanceof BrowserWindow);assert.equal(options.title,'Save before Cut');
    assert.deepEqual(options.buttons,['Save and Cut','Discard changes and Cut','Cancel']);assert.equal(options.defaultId,0);assert.equal(options.cancelId,2);
    assert(answers.length,'Unexpected prompt');prompts.push(options);return {response:answers.shift()};
  };
  let denySave=false;
  const write=fs.writeFile;
  fs.writeFile=async(file,...args)=>{if(denySave&&file===drawing)throw new Error('Synthetic denied save');return write(file,...args);};
  fs.unlink=async()=>{throw new Error('No real file removal is permitted by this renderer test');};
  const Module=require('node:module'),main=new Module(path.join(project,'main.cjs'),module);
  main.filename=path.join(project,'main.cjs');main.paths=module.paths;
  main._compile(sync.readFileSync(main.filename,'utf8').replaceAll('new BrowserWindow({','new BrowserWindow({ show: false,')+
    '\nmodule.exports.__test={createDxfWindow,create3dPdfWindow,fileSetForFile,viewerWorkspaces,clipboardCuts};\n',main.filename);
  const doc=await require('pdf-lib').PDFDocument.create();doc.addPage([300,400]).drawText('Synthetic cut test');await fs.writeFile(pdf,await doc.save());
  const api=main.exports.__test,delay=ms=>new Promise(r=>setTimeout(r,ms));
  const evaluate=(win,code)=>win.webContents.executeJavaScript(code);
  async function wait(check,label){const end=Date.now()+20000;while(Date.now()<end){if(await check())return;await delay(60);}throw new Error('Timed out: '+label);}
  const click=(win,id)=>evaluate(win,`document.getElementById(${JSON.stringify(id)}).click();true`);
  const status=win=>evaluate(win,'globalThis.excelsisDocumentSession.status()');
  await app.whenReady();await wait(()=>BrowserWindow.getAllWindows().length,'launcher');for(const win of BrowserWindow.getAllWindows())win.hide();
  async function open(file,kind){
    const set=await api.fileSetForFile(file,kind==='pdf'?'3dpdf':'dxf');
    const win=kind==='pdf'?api.create3dPdfWindow(set):api.createDxfWindow(set,kind);
    win.webContents.setBackgroundThrottling(false);
    await wait(async()=>{try{const value=await status(win);return value?.ready&&value.path===file&&!value.busy;}catch{return false;}},'load '+kind);
    await evaluate(win,'globalThis.alert=()=>{};true');return win;
  }
  async function cutReady(win,id,file){await click(win,id);await wait(()=>api.clipboardCuts.isLocked(file),'cut pending');await wait(()=>evaluate(win,`document.getElementById(${JSON.stringify(id)}).textContent==='Cancel Cut'`),'read-only marker');}
  const dxf=await open(drawing,'dxf');
  await click(dxf,'rotateBtn');await wait(async()=>(await status(dxf)).dirty,'dirty DXF');
  answers.push(2);await click(dxf,'cutFileBtn');await wait(()=>prompts.length===1,'cancel prompt');await wait(()=>evaluate(dxf,"document.getElementById('cutFileBtn').dataset.cutBusy!=='true'"),'canceled request');
  assert.equal(transfers.length,0);assert((await status(dxf)).dirty);assert.equal(await fs.readFile(drawing,'utf8'),text);
  denySave=true;answers.push(0);await click(dxf,'cutFileBtn');await wait(()=>prompts.length===2,'save failure prompt');await wait(()=>evaluate(dxf,"document.getElementById('cutFileBtn').dataset.cutBusy!=='true'"),'failed save request');
  assert.equal(transfers.length,0);assert((await status(dxf)).dirty);denySave=false;
  answers.push(0);await cutReady(dxf,'cutFileBtn',drawing);
  assert(!(await status(dxf)).dirty);const saved=await fs.readFile(drawing,'utf8');assert.notEqual(saved,text);
  assert.deepEqual(await evaluate(dxf,"['renameFileBtn','deleteFileBtn','saveMenuBtn','saveAsBtn','rotateBtn','scaleBtn'].map(id=>document.getElementById(id).disabled)"),[true,true,true,true,true,true]);
  assert.match(await evaluate(dxf,`window.dxfApp.writeFile(${JSON.stringify(drawing)},'invalid').then(()=>'',e=>e.message)`),/read-only/);
  await click(dxf,'cutFileBtn');await wait(()=>!api.clipboardCuts.isLocked(drawing),'cancel cut');assert.equal((await status(dxf)).path,drawing);
  await click(dxf,'rotateBtn');await wait(async()=>(await status(dxf)).dirty,'discard edit');answers.push(1);await cutReady(dxf,'cutFileBtn',drawing);
  assert(!(await status(dxf)).dirty);assert.equal(await fs.readFile(drawing,'utf8'),saved);
  const movedDrawing=path.join(destination,path.basename(drawing));await fs.rename(drawing,movedDrawing);await transfers.at(-1).onEvent({type:'receipt',format:'paste',effect:2});
  await wait(()=>api.viewerWorkspaces.getState(dxf.webContents).count===0,'empty DXF session');assert(!dxf.isDestroyed());
  assert.equal(await evaluate(dxf,"document.getElementById('fileName').textContent"),'No file open');
  conversion=movedDrawing;const liveDxf=await open(movedDrawing,'dxf');assert.equal(liveDxf.nativeWindow||liveDxf,dxf);assert.equal(api.viewerWorkspaces.getState(dxf.webContents).count,1);
  const dwgWin=await open(dwg,'dwg');await cutReady(dwgWin,'cutFileBtn',dwg);
  const movedDwg=path.join(destination,path.basename(dwg));await fs.rename(dwg,movedDwg);await transfers.at(-1).onEvent({type:'receipt',format:'logical',effect:2});
  await wait(()=>api.viewerWorkspaces.getState(dwgWin.webContents).count===0,'empty DWG session');assert(!dwgWin.isDestroyed());assert.equal(await fs.readFile(movedDrawing,'utf8'),saved);
  const pdfWin=await open(pdf,'pdf');
  await wait(()=>evaluate(pdfWin,"!!document.querySelector('.pdf-editor-layer')"),'PDF annotation layer');
  await click(pdfWin,'pdfAddText');
  await evaluate(pdfWin,"(()=>{const layer=document.querySelector('.pdf-editor-layer'),r=layer.getBoundingClientRect();layer.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,clientX:r.left+80,clientY:r.top+160,pointerId:1}));const text=document.getElementById('pdfObjectText');text.value='UNSAVED CUT TEST';text.dispatchEvent(new Event('input',{bubbles:true}));text.blur();return true})()");
  await wait(async()=>(await status(pdfWin)).dirty,'dirty PDF');answers.push(0);await cutReady(pdfWin,'pdfCutFile',pdf);
  assert(!(await status(pdfWin)).dirty);
  await transfers.at(-1).onEvent({type:'receipt',format:'paste',effect:1});await wait(()=>!api.clipboardCuts.isLocked(pdf),'copy not move');assert.equal((await status(pdfWin)).path,pdf);assert(!pdfWin.isDestroyed());
  await cutReady(pdfWin,'pdfCutFile',pdf);const movedPdf=path.join(destination,path.basename(pdf));await fs.rename(pdf,movedPdf);await transfers.at(-1).onEvent({type:'receipt',format:'paste',effect:2});
  await wait(()=>api.viewerWorkspaces.getState(pdfWin.webContents).count===0,'empty PDF session');assert(!pdfWin.isDestroyed());const livePdf=await open(movedPdf,'pdf');assert.equal(livePdf.nativeWindow||livePdf,pdfWin);
  const secondary=path.join(root,'Secondary.dxf');await fs.writeFile(secondary,text);
  const child=api.createDxfWindow(await api.fileSetForFile(secondary,'dxf'),'dxf');child.webContents.setBackgroundThrottling(false);
  await wait(async()=>{try{const value=await status(child);return value?.ready&&!value.busy;}catch{return false;}},'child ready');
  const childId=api.viewerWorkspaces.getState(dxf.webContents).folders.flatMap(folder=>folder.files).find(file=>file.path===secondary).id;
  await api.viewerWorkspaces.action(dxf.webContents,'select',childId);await cutReady(child,'cutFileBtn',secondary);
  const otherId=api.viewerWorkspaces.getState(dxf.webContents).folders.flatMap(folder=>folder.files).find(file=>file.path===movedDrawing).id;
  await api.viewerWorkspaces.action(dxf.webContents,'select',otherId);
  await fs.rename(secondary,path.join(destination,'Secondary.dxf'));await transfers.at(-1).onEvent({type:'receipt',format:'paste',effect:2});
  await wait(()=>api.viewerWorkspaces.getState(dxf.webContents).count===1,'only moved child removed');
  assert.equal((await status(liveDxf)).path,movedDrawing);assert(!dxf.isDestroyed());assert.equal(answers.length,0);
  const teapot=path.join(root,'Synthetic teapot.pdf');
  require('node:child_process').execFileSync(path.resolve(project,'../../prc/nanoprc/build/nano_prc_teapot_write.exe'),
    [path.join(root,'Synthetic teapot.prc'),teapot],{windowsHide:true,cwd:root,stdio:'pipe'});
  const three=await open(teapot,'pdf');
  await wait(()=>evaluate(three,"!document.getElementById('cv').hidden"),'native 3D PDF viewport');
  const threeId=api.viewerWorkspaces.getState(pdfWin.webContents).folders.flatMap(folder=>folder.files).find(file=>file.path===teapot).id;
  await api.viewerWorkspaces.action(pdfWin.webContents,'select',threeId);
  const threeBytes=await fs.readFile(teapot);await cutReady(three,'pdfCutFile',teapot);
  assert.match(await evaluate(three,`window.pdfApp.writeFile(${JSON.stringify(teapot)},'invalid').then(()=>'',e=>e.message)`),/read-only/);
  const movedThree=path.join(destination,'Synthetic teapot.pdf');await fs.rename(teapot,movedThree);
  await transfers.at(-1).onEvent({type:'receipt',format:'paste',effect:2});
  await wait(()=>api.viewerWorkspaces.getState(pdfWin.webContents).count===1,'only moved 3D PDF removed');
  assert.deepEqual(await fs.readFile(movedThree),threeBytes);assert.equal((await status(livePdf)).path,movedPdf);assert(!pdfWin.isDestroyed());
  const report={passed:true,allModules:true,saveBeforeCut:true,discardBeforeCut:true,cancelPreservesDirty:true,failedSaveDoesNotCut:true,
    readOnlyPending:true,mainWritesBlocked:true,cancelCut:true,copyKeepsView:true,moveClosesOnlyFile:true,emptySessionStaysOpen:true,
   reopenPastedLocation:true,childCutPreservesOtherTabs:true,switchDuringCutSafe:true,threeDimensionalPdf:true,dwgOriginalNotCache:true,realClipboardUntouched:true,realDeletionNeverRun:true,prompts:prompts.length,evidence:root};
  await fs.writeFile(path.join(root,'result.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));app.exit(0);
}
