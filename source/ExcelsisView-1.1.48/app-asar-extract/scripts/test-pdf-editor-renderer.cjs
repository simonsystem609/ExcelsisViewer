// Hidden real renderer; synthetic default and optional owner-authorized PDF
// samples passed on the command line. Never saves to a sample's original path.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const project=path.resolve(__dirname,'..');
if(!process.versions.electron){
  const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;delete env.NODE_OPTIONS;
  const child=require('node:child_process').spawn(require('electron'),[__filename,...process.argv.slice(2)],{cwd:project,windowsHide:true,stdio:'inherit',env});
  child.on('exit',code=>process.exitCode=code??1);
}else run().catch(error=>{console.error(error);require('electron').app.exit(1);});
async function run(){
  const {app,BrowserWindow}=require('electron');
  const root=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'excelsis-pdf-editor-'));
  app.setPath('appData',path.join(root,'profile'));app.setAppPath(project);
  const Module=require('node:module'),main=new Module(path.join(project,'main.cjs'),module);
  main.filename=path.join(project,'main.cjs');main.paths=Module._nodeModulePaths(project);
  const editorPath=path.join(project,'modules/3dpdf/pdf-editor.mjs');
  const marker='  return {\n    attachEntry:';
  const instrumented=fs.readFileSync(editorPath,'utf8').replace(marker,
    '  globalThis.__editorTest={entries:()=>getEntries(),selected:()=>selectedObject,objects:()=>[...objects.values()],materializeNative,selectObject,beginRewriteText,exportBytes,setReadOnly};\n'+marker);
  assert(instrumented.includes('__editorTest'));
  const mainSource=fs.readFileSync(main.filename,'utf8').replaceAll('new BrowserWindow({','new BrowserWindow({ show:false,')
    .replaceAll('findOpenArgs(process.argv.slice(1))', 'findOpenArgs([])')
    .replace('const body = await fs.readFile(requestedPath);',`let body=await fs.readFile(requestedPath);if(requestedPath===${JSON.stringify(editorPath)})body=Buffer.from(${JSON.stringify(instrumented)});`)
    .replace('"Content-Length": String(stat.size)','"Content-Length": String(body.length)');
  main._compile(mainSource+'\nmodule.exports.__test={create3dPdfWindow,fileSetForFile,viewerWorkspaces};',main.filename);
  const {PDFDocument,rgb}=require('pdf-lib');
  const doc=await PDFDocument.create(),page=doc.addPage([400,500]);
  page.drawText('ORIGINAL TEXT',{x:40,y:420,size:16});
  page.drawRectangle({x:40,y:40,width:130,height:40,color:rgb(.2,.4,.8)});
  const file=path.join(root,'Synthetic.pdf');fs.writeFileSync(file,await doc.save());
  const api=main.exports.__test,delay=ms=>new Promise(r=>setTimeout(r,ms));
  async function wait(check,label){const end=Date.now()+30000;while(Date.now()<end){if(await check())return;await delay(70);}throw Error('Timeout: '+label);}
  await app.whenReady();await wait(()=>BrowserWindow.getAllWindows().length,'launcher');BrowserWindow.getAllWindows().forEach(w=>w.hide());
  let nativeWindow;
  async function open(file){
    const handle=api.create3dPdfWindow(await api.fileSetForFile(file,'3dpdf'));
    handle.webContents.on('console-message',details=>{if(details.level==='error'||details.level===3)console.error('PDF renderer:',details.message);});
    nativeWindow ||= handle.nativeWindow||handle;handle.webContents.setBackgroundThrottling(false);
    const snapshot=api.viewerWorkspaces.getState(nativeWindow.webContents);
    const entry=snapshot.folders.flatMap(f=>f.files).find(f=>f.path===file);
    await api.viewerWorkspaces.action(nativeWindow.webContents,'select',entry.id);
    try { await wait(()=>handle.webContents.executeJavaScript('!!globalThis.__editorTest?.entries().some(e=>e.nativeObjects?.length)'), 'native objects'); }
    catch(error){console.error(await handle.webContents.executeJavaScript("({status:document.getElementById('stats')?.textContent,debug:!!globalThis.__editorTest,session:globalThis.excelsisDocumentSession?.status()})"));throw error;}
    return handle;
  }
  const win=await open(file),evaluate=code=>win.webContents.executeJavaScript(code);
  const click=id=>evaluate(`document.getElementById(${JSON.stringify(id)}).click();true`);
  await evaluate(`(async()=>{const n=__editorTest.entries()[0].nativeObjects.find(n=>n.text==='ORIGINAL TEXT');const o=(await __editorTest.materializeNative(n))[0];await __editorTest.beginRewriteText(o,{focusToolbar:false});return true})()`);
  await evaluate(`(()=>{const input=document.getElementById('pdfObjectText');input.focus();input.value='CHANGED TEXT';input.setSelectionRange(3,3);input.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
  assert.equal(await evaluate("document.getElementById('pdfObjectText').selectionStart"),3,'Typing does not reset the caret');
  const anchor=await evaluate('(()=>{const o=__editorTest.selected();return [o.bounds.x+o.textInsetX,o.bounds.y+o.bounds.height-o.baselineOffset]})()');
  await evaluate(`(()=>{const input=document.getElementById('pdfFontSize');input.focus();input.value='18.25';input.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
  assert.equal(await evaluate("document.getElementById('pdfFontSize').value"),'18.25');
  assert.deepEqual(await evaluate('(()=>{const o=__editorTest.selected();return [o.bounds.x+o.textInsetX,o.bounds.y+o.bounds.height-o.baselineOffset]})()'),anchor,'Size changes preserve the baseline');
  await evaluate(`(()=>{const input=document.getElementById('pdfFontSize');input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
  assert.equal(await evaluate('__editorTest.selected().fontSize'),18.25,'An incomplete number does not change the font size');
  await evaluate(`(()=>{const input=document.getElementById('pdfFontSize');input.value='18.25';input.blur();const c=document.getElementById('pdfObjectColor');c.value='#2255cc';c.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
  assert.equal(await evaluate('__editorTest.selected().color'),'#2255cc');
  assert.equal(await evaluate("document.getElementById('pdfSelectionProperties').hidden"),false);
  await click('pdfCloseProperties');
  async function draw(tool,x,y,w,h){
    await click(tool);
    await evaluate(`(()=>{const e=__editorTest.entries()[0],layer=e.editorLayer,v=e.displayViewport,r=layer.getBoundingClientRect();layer.setPointerCapture=()=>{};layer.hasPointerCapture=()=>false;const a=v.convertToViewportPoint(${x},${y}),b=v.convertToViewportPoint(${x+w},${y+h});for(const [type,p]of [['pointerdown',a],['pointermove',b],['pointerup',b]])layer.dispatchEvent(new PointerEvent(type,{bubbles:true,button:0,pointerId:9,clientX:r.left+p[0],clientY:r.top+p[1]}));return true})()`);
  }
  await draw('pdfAddRectangle',220,300,80,40);
  assert.equal(await evaluate('__editorTest.selected().shape'),'rectangle');
  await evaluate(`(()=>{const f=document.getElementById('pdfShapeFill');f.checked=true;f.dispatchEvent(new Event('change',{bubbles:true}));const c=document.getElementById('pdfObjectColor');c.value='#20aa55';c.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
  assert.equal(await evaluate('__editorTest.selected().filled'),true);
  assert.equal(await evaluate('__editorTest.selected().color'),'#20aa55');
  await draw('pdfAddEllipse',220,220,80,50);assert.equal(await evaluate('__editorTest.selected().shape'),'ellipse');
  await draw('pdfWhiteout',38,38,135,45);assert.equal(await evaluate('__editorTest.selected().kind'),'whiteout');
  assert.equal(await evaluate("document.getElementById('pdfObjectOpacity').disabled"),true);
  const count=await evaluate('__editorTest.objects().filter(o=>!o.removed).length');
  await click('pdfUndo');assert.equal(await evaluate('__editorTest.objects().filter(o=>!o.removed).length'),count-1);
  await click('pdfRedo');assert.equal(await evaluate('__editorTest.objects().filter(o=>!o.removed).length'),count);
  await evaluate('__editorTest.setReadOnly(true);true');
  assert(await evaluate("['pdfAddText','pdfAddRectangle','pdfAddEllipse','pdfWhiteout'].every(id=>document.getElementById(id).disabled)"));
  await evaluate('__editorTest.setReadOnly(false);true');
  async function exportCopy(handle,name){
    const encoded=await handle.webContents.executeJavaScript(`(async()=>{const bytes=await __editorTest.exportBytes();let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(text)})()`);
    const output=path.join(root,name);fs.writeFileSync(output,Buffer.from(encoded,'base64'));return output;
  }
  const output=await exportCopy(win,'Edited.pdf');
  const extracted=await evaluate(`(async()=>{const p=await import('./vendor/pdfjs/pdf.min.mjs');const t=p.getDocument({data:new Uint8Array(${JSON.stringify([...fs.readFileSync(output)])}),isEvalSupported:false});const d=await t.promise;try{return(await(await d.getPage(1)).getTextContent()).items.map(i=>i.str).join(' ')}finally{await t.destroy()}})()`);
  assert.match(extracted,/CHANGED TEXT/);assert.doesNotMatch(extracted,/ORIGINAL TEXT/);
  await evaluate('__editorTest.selectObject(__editorTest.objects().find(o=>o.kind==="text"));true');
  await wait(()=>evaluate('!globalThis.excelsisDocumentSession.status().busy'), 'idle editor before screenshot');
  await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');await delay(180);
  const frame=await win.webContents.capturePage(undefined,{stayHidden:true});fs.writeFileSync(path.join(root,'editor-ui.png'),frame.toPNG());
  const report={passed:true,caretStable:true,decimalDrafts:true,baselineStable:true,textColour:true,rectangle:true,ellipse:true,whiteout:true,undoRedo:true,readOnly:true,nativeOriginalRemoved:true,samples:[],evidence:root};
  for(const [index,sample]of process.argv.slice(2).filter(s=>/\.pdf$/i.test(s)).entries()){
    const before=crypto.createHash('sha256').update(fs.readFileSync(sample)).digest('hex'),handle=await open(path.resolve(sample));
    const start=Date.now();
    await handle.webContents.executeJavaScript(`(async()=>{const n=__editorTest.entries()[0].nativeObjects.find(n=>n.kind==='text'&&n.text.trim().length>2&&n.bounds.width>5);if(!n)throw Error('No native text on first page');const o=(await __editorTest.materializeNative(n))[0];await __editorTest.beginRewriteText(o,{focusToolbar:false});o.text='TEST1';return true})()`);
    const copy=await exportCopy(handle,`Sample-${index+1}-edited.pdf`);
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(sample)).digest('hex'),before);
    report.samples.push({index:index+1,edited:true,originalUnchanged:true,editAndExportMs:Date.now()-start,copy});
  }
  fs.writeFileSync(path.join(root,'result.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  app.exit(0);
}
