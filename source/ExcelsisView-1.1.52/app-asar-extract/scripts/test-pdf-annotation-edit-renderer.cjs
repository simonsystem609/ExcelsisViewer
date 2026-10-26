// Hidden real renderer; synthetic PDFs only. FreeText annotations placed over
// whited-out page text, and labels left by older cover-and-add saves, must
// edit cleanly in place without exposing the hidden originals.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const project=path.resolve(__dirname,'..');
if(!process.versions.electron){
  const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;delete env.NODE_OPTIONS;
  const child=require('node:child_process').spawn(require('electron'),[__filename,...process.argv.slice(2)],{cwd:project,windowsHide:true,stdio:'inherit',env});
  child.on('exit',code=>process.exitCode=code??1);
}else run().catch(error=>{console.error(error);require('electron').app.exit(1);});
async function run(){
  const {app,BrowserWindow}=require('electron');
  const root=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'excelsis-pdf-annotation-'));
  app.setPath('appData',path.join(root,'profile'));app.setAppPath(project);
  const Module=require('node:module'),main=new Module(path.join(project,'main.cjs'),module);
  main.filename=path.join(project,'main.cjs');main.paths=Module._nodeModulePaths(project);
  const editorPath=path.join(project,'modules/3dpdf/pdf-editor.mjs');
  const marker='  return {\n    attachEntry:';
  const instrumented=fs.readFileSync(editorPath,'utf8').replace(marker,
    '  globalThis.__editorTest={entries:()=>getEntries(),selected:()=>selectedObject,objects:()=>[...objects.values()],materializeNative,selectObject,exportBytes};\n'+marker);
  assert(instrumented.includes('__editorTest'));
  const mainSource=fs.readFileSync(main.filename,'utf8').replaceAll('new BrowserWindow({','new BrowserWindow({ show:false,')
    .replaceAll('webPreferences: {','webPreferences: { offscreen: true,')
    .replaceAll('findOpenArgs(process.argv.slice(1))', 'findOpenArgs([])')
    .replace('const body = await fs.readFile(requestedPath);',`let body=await fs.readFile(requestedPath);if(requestedPath===${JSON.stringify(editorPath)})body=Buffer.from(${JSON.stringify(instrumented)});`)
    .replace('"Content-Length": String(stat.size)','"Content-Length": String(body.length)');
  main._compile(mainSource+'\nmodule.exports.__test={create3dPdfWindow,fileSetForFile,viewerWorkspaces};',main.filename);
  const {PDFDocument,PDFName,PDFNumber,PDFOperator,PDFString,PDFHexString,PDFDict,PDFArray,StandardFonts,degrees,rgb}=require('pdf-lib');

  // FreeText annotations over a white ink cover, as other PDF tools save them.
  const annotated=await PDFDocument.create(),page=annotated.addPage([400,500]),ctx=annotated.context;
  const helvetica=await annotated.embedFont(StandardFonts.Helvetica);
  page.drawText('COVERED',{x:60,y:400,size:12,font:helvetica,color:rgb(.5,.5,.5)});
  page.drawText('VISIBLE',{x:60,y:300,size:12,font:helvetica});
  const helv=ctx.register(ctx.obj({Type:'Font',Subtype:'Type1',BaseFont:'Helvetica',Encoding:'WinAnsiEncoding'}));
  const form=(content,width,height,resources)=>ctx.register(ctx.stream(content,{Type:'XObject',Subtype:'Form',BBox:[0,0,width,height],...(resources?{Resources:resources}:{})}));
  const annots=[];
  annots.push(ctx.register(ctx.obj({Type:'Annot',Subtype:'Ink',F:4,Rect:[56,395,126,413],C:[1,1,1],BS:{W:17},
    InkList:[[60,404,122,404]],AP:{N:form('1 1 1 RG 17 w 1 J 4 9 m 66 9 l S',70,18)}})));
  function freeText(text,x,y,width){
    const popupRef=ctx.nextRef(),ref=ctx.register(ctx.obj({Type:'Annot',Subtype:'FreeText',IT:'FreeTextTypewriter',F:4,
      Rect:[x,y,x+width,y+16],Contents:PDFString.of(text),DA:PDFString.of('/Helv 10.5 Tf 0 0.467 0.831 rg'),C:[0,0.467,0.831],Popup:popupRef,
      AP:{N:form(`/Tx BMC q BT /Helv 10.5 Tf 0 0.467 0.831 rg 2 4 Td (${text}) Tj ET Q EMC`,width,16,{Font:{Helv:helv}})}}));
    ctx.assign(popupRef,ctx.obj({Type:'Annot',Subtype:'Popup',F:28,Open:false,Parent:ref,Rect:[x+width,y,x+width+120,y+60]}));
    annots.push(ref,popupRef);return ref;
  }
  const labelRef=freeText('NEW LABEL',58,396,82),dropRef=freeText('DROP ME',200,200,70);
  page.node.set(PDFName.of('Annots'),ctx.obj(annots));
  const annotatedFile=path.join(root,'Annotated.pdf');fs.writeFileSync(annotatedFile,await annotated.save());

  // Older Viewer cover-and-add: original vertical label, a padded raster cover
  // patch that baked part of the old glyphs (red here), then the newer label.
  const legacy=await PDFDocument.create(),legacyPage=legacy.addPage([400,500]);
  const legacyFont=await legacy.embedFont(StandardFonts.Helvetica);
  legacyPage.drawLine({start:{x:323,y:150},end:{x:323,y:260},thickness:.8,color:rgb(.45,.45,.45)});
  legacyPage.drawText('8(x2)',{x:320,y:180,size:13,font:legacyFont,color:rgb(.53,.53,.53),rotate:degrees(90)});
  const [pw,ph]=[57,102],pixels=Buffer.alloc(pw*ph*3,255);
  for(let y=30;y<70;y++)for(let x=12;x<38;x++)pixels.set([220,0,0],(y*pw+x)*3);
  const patchRef=legacy.context.register(legacy.context.flateStream(pixels,{Type:'XObject',Subtype:'Image',Width:pw,Height:ph,ColorSpace:'DeviceRGB',BitsPerComponent:8}));
  const patchName=legacyPage.node.newXObject('OldPatch',patchRef);
  legacyPage.pushOperators(PDFOperator.of('q'),PDFOperator.of('cm',[19,0,0,34,305,178].map(PDFNumber.of)),PDFOperator.of('Do',[patchName]),PDFOperator.of('Q'));
  legacyPage.drawText('9(x2)',{x:320,y:180,size:13,font:legacyFont,color:rgb(.53,.53,.53),rotate:degrees(90)});
  const legacyFile=path.join(root,'Legacy.pdf');fs.writeFileSync(legacyFile,await legacy.save());

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
    await wait(()=>handle.webContents.executeJavaScript('!!globalThis.__editorTest?.entries().some(e=>e.nativeObjects?.length)&&!globalThis.excelsisDocumentSession.status().busy'),'native objects');
    return handle;
  }
  const natives=handle=>handle.webContents.executeJavaScript('__editorTest.entries()[0].nativeObjects.filter(n=>n.kind==="text").map(n=>({text:n.text,annotation:!!n.annotation,hitClass:n.hitElement?.className}))');
  async function rewrite(handle,needle,text){
    const wc=handle.webContents,ev=code=>wc.executeJavaScript(code);
    const point=await ev(`(()=>{const n=__editorTest.entries()[0].nativeObjects.find(n=>n.kind==='text'&&n.text.includes(${JSON.stringify(needle)}));if(!n)throw Error('Native label not found');n.hitElement.scrollIntoView({block:'center'});const r=n.hitElement.getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}})()`);
    wc.focus();for(const clickCount of [1,2]){wc.sendInputEvent({type:'mouseDown',button:'left',clickCount,...point});wc.sendInputEvent({type:'mouseUp',button:'left',clickCount,...point});}
    await wait(()=>ev('!!document.querySelector(".pdf-inline-text-editor")'),'in-place editor');
    await ev(`(()=>{const input=document.querySelector(".pdf-inline-text-editor");input.select();return true})()`);
    for(const key of text)wc.sendInputEvent({type:'char',keyCode:key});
    wc.sendInputEvent({type:'keyDown',keyCode:'ENTER'});wc.sendInputEvent({type:'keyUp',keyCode:'ENTER'});
    await wait(()=>ev('!document.querySelector(".pdf-inline-text-editor")'),'committed inline edit');
    assert.equal(await ev('__editorTest.selected().text'),text);
  }
  async function exportCopy(handle,name){
    const encoded=await handle.webContents.executeJavaScript(`(async()=>{const bytes=await __editorTest.exportBytes();let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(text)})()`);
    const output=path.join(root,name);fs.writeFileSync(output,Buffer.from(encoded,'base64'));return output;
  }
  // Pixel classes inside a region of a saved copy rendered by the bundled PDF.js.
  const inspect=(handle,file,region,annotations=true)=>handle.webContents.executeJavaScript(`(async()=>{const p=await import('./vendor/pdfjs/pdf.min.mjs');const t=p.getDocument({data:new Uint8Array(${JSON.stringify([...fs.readFileSync(file)])}),isEvalSupported:false});const d=await t.promise;try{const page=await d.getPage(1),v=page.getViewport({scale:4}),[x1,y1,x2,y2]=${JSON.stringify(region)},a=v.convertToViewportPoint(x1,y2),b=v.convertToViewportPoint(x2,y1),c=document.createElement('canvas');c.width=Math.ceil(b[0]-a[0]);c.height=Math.ceil(b[1]-a[1]);const g=c.getContext('2d');await page.render({canvasContext:g,canvas:c,viewport:v,annotationMode:${annotations?'p.AnnotationMode.ENABLE':'p.AnnotationMode.DISABLE'},transform:[1,0,0,1,-a[0],-a[1]]}).promise;const px=g.getImageData(0,0,c.width,c.height).data;let red=0,blue=0,gray=0;for(let i=0;i<px.length;i+=4){const [r,gr,bl]=[px[i],px[i+1],px[i+2]];if(r>150&&gr<90&&bl<90)red++;else if(bl>150&&r<80)blue++;else if(r<200&&Math.abs(r-gr)<25&&Math.abs(r-bl)<25)gray++;}return{red,blue,gray,text:(await page.getTextContent()).items.map(i=>i.str).join(' '),annotations:(await page.getAnnotations()).map(n=>({subtype:n.subtype,text:(n.textContent||[]).join('|')}))}}finally{await t.destroy()}})()`);
  const report={passed:true,evidence:root};

  const win=await open(annotatedFile),evaluate=code=>win.webContents.executeJavaScript(code);
  let found=await natives(win);
  assert.deepEqual(found.filter(n=>n.annotation).map(n=>n.text).sort(),['DROP ME','NEW LABEL'],'FreeText annotations are editable text');
  assert(found.filter(n=>n.annotation).every(n=>n.hitClass.includes('native-annotation')),'Annotation hits sit above page text');
  assert(!found.some(n=>n.text.includes('COVERED')),'Page text hidden under a white cover is not offered through it');
  assert(found.some(n=>!n.annotation&&n.text.includes('VISIBLE')),'Uncovered page text stays editable');
  await rewrite(win,'NEW LABEL','S235');
  assert.equal(await evaluate('__editorTest.selected().color'),'#0077d4','The annotation keeps its colour');
  await evaluate(`(async()=>{const n=__editorTest.entries()[0].nativeObjects.find(n=>n.annotation&&n.text==='DROP ME');const objects=await __editorTest.materializeNative(n);__editorTest.selectObject(objects[0]);return true})()`);
  win.webContents.focus();win.webContents.sendInputEvent({type:'keyDown',keyCode:'Delete'});win.webContents.sendInputEvent({type:'keyUp',keyCode:'Delete'});
  await wait(()=>evaluate('__editorTest.objects().some(o=>o.native?.annotation&&o.deleted)'),'annotation deleted');
  const annotatedCopy=await exportCopy(win,'Annotated-edited.pdf');
  const saved=await PDFDocument.load(fs.readFileSync(annotatedCopy)),savedAnnots=saved.getPage(0).node.lookup(PDFName.of('Annots'),PDFArray);
  const dicts=[...Array(savedAnnots.size()).keys()].map(i=>({ref:savedAnnots.get(i),dict:savedAnnots.lookup(i,PDFDict)}));
  const subtype=d=>d.dict.get(PDFName.of('Subtype')).decodeText?.()??String(d.dict.get(PDFName.of('Subtype'))).slice(1);
  assert.deepEqual(dicts.map(subtype).sort(),['FreeText','Ink','Popup'],'Deleting an annotation also removes its popup');
  const label=dicts.find(d=>subtype(d)==='FreeText');
  assert.equal(label.ref.objectNumber,labelRef.objectNumber,'The edited annotation is updated in place');
  assert(!dicts.some(d=>d.ref.objectNumber===dropRef.objectNumber));
  assert.equal(label.dict.lookup(PDFName.of('Contents')).decodeText(),'S235');
  assert(label.dict.lookup(PDFName.of('AP'),PDFDict).get(PDFName.of('N')),'A fresh appearance is written');
  const annotatedPixels=await inspect(win,annotatedCopy,[56,392,160,416]);
  assert.match(annotatedPixels.text,/COVERED/,'Page content under the annotation is left untouched');
  assert.deepEqual(annotatedPixels.annotations.filter(n=>n.subtype==='FreeText').map(n=>n.text),['S235']);
  assert(annotatedPixels.blue>40,'The edited annotation renders in its colour');
  assert(annotatedPixels.gray<10,`The covered original stays hidden: ${annotatedPixels.gray}`);
  const reopened=await open(annotatedCopy);found=await natives(reopened);
  assert(found.some(n=>n.annotation&&n.text==='S235')&&!found.some(n=>n.text.includes('COVERED')),'The saved annotation stays editable');
  Object.assign(report,{freeTextEdited:true,freeTextDeleted:true,coveredTextHidden:true,annotatedPixels});

  const old=await open(legacyFile),oldEval=code=>old.webContents.executeJavaScript(code);
  found=await natives(old);
  assert.equal(found.filter(n=>/\(x2\)/.test(n.text)).length,1,'Overlapping old and new runs form one label');
  assert(await oldEval('__editorTest.entries()[0].nativeObjects.find(n=>n.text.includes("(x2)")).legacyPatchedText'),'The old cover patch is recognised');
  await rewrite(old,'(x2)','S235');
  const legacyColor=await oldEval('__editorTest.selected().color'),channels=[1,3,5].map(i=>parseInt(legacyColor.slice(i,i+2),16));
  assert(channels.every(c=>c>0x70&&c<0xa8)&&Math.max(...channels)-Math.min(...channels)<16,`The label keeps its own grey, not the patch colour: ${legacyColor}`);
  const background=await oldEval(`(async()=>{const o=__editorTest.selected(),im=new Image();im.src=o.patchDataUrl;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height).data;let red=0,gray=0;for(let i=0;i<d.length;i+=4){if(d[i]>150&&d[i+1]<90&&d[i+2]<90)red++;else if(d[i]<200&&Math.abs(d[i]-d[i+1])<25)gray++;}return{red,gray,covers:o.patchBounds.x<=305.5&&o.patchBounds.x+o.patchBounds.width>=323.5}})()`);
  assert.equal(background.red,0,'Glyphs baked into the old cover patch are removed');
  assert(background.covers,'The replacement covers the whole old patch');
  assert(background.gray>0,'Vector lines under the label survive');
  const legacyCopy=await exportCopy(old,'Legacy-edited.pdf'),legacyPixels=await inspect(old,legacyCopy,[300,172,330,220]);
  assert.match(legacyPixels.text,/S235/);assert.doesNotMatch(legacyPixels.text,/[89]\(x2\)/);
  assert.equal(legacyPixels.red,0,'No old patch pixels remain after saving');
  assert(legacyPixels.gray>100,'The new label and the leader line render');
  Object.assign(report,{legacyPatchedLabel:true,background,legacyPixels});
  fs.writeFileSync(path.join(root,'result.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  app.exit(0);
}
