const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const project=path.resolve(__dirname,'..');
if(!process.versions.electron){const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;delete env.NODE_OPTIONS;require('node:child_process').spawn(require('electron'),[__filename],{cwd:project,windowsHide:true,stdio:'inherit',env}).on('exit',c=>process.exitCode=c??1);}
else run().catch(e=>{console.error(e);require('electron').app.exit(1);});
async function run(){
 const{app,BrowserWindow,dialog}=require('electron'),{PDFDocument}=require('pdf-lib');
 const root=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'excelsis-merge-ui-'));app.setPath('appData',path.join(root,'profile'));app.setAppPath(project);
 const errors=[];dialog.showErrorBox=(title,message)=>errors.push(message);dialog.showSaveDialog=()=>{throw Error('Merge must never request a save location');};
 const Module=require('node:module'),main=new Module(path.join(project,'main.cjs'),module);main.filename=path.join(project,'main.cjs');main.paths=Module._nodeModulePaths(project);
 main._compile(fs.readFileSync(main.filename,'utf8').replaceAll('new BrowserWindow({','new BrowserWindow({show:false,').replaceAll('webPreferences: {','webPreferences: {offscreen:true,').replaceAll('findOpenArgs(process.argv.slice(1))','findOpenArgs([])')+'\nmodule.exports.__test={pdfMergeJobs,assertTrustedSender};',main.filename);
 const delay=ms=>new Promise(r=>setTimeout(r,ms));async function wait(fn,label){const end=Date.now()+30000;while(Date.now()<end){if(await fn())return;await delay(60);}throw Error('Timeout '+label);}
 await app.whenReady();await wait(()=>BrowserWindow.getAllWindows().length,'launcher');
 async function input(name,text,time){const d=await PDFDocument.create();d.addPage([300,400]).drawText(text,{x:35,y:340,size:24});const file=path.join(root,name);fs.writeFileSync(file,await d.save());fs.utimesSync(file,time,time);return file;}
 const newer=await input('A - Latest drawing.pdf','NEWER DRAWING',200000),older=await input('Z - Original drawing.pdf','OLDER DRAWING',100000);
 const installer=fs.readFileSync(path.join(project,'build/installer.nsh'),'utf8');assert.match(installer,/ExcelsisView\.MergePDFs" "MultiSelectModel" "Document"/);
 const command=installer.split('\n').find(l=>l.includes('ExcelsisView.MergePDFs\\command'));
 assert.match(command,/ExcelsisView\.exe.*--merge-pdf \$\\"%1\$\\"/);
 const marker=command.match(/--merge-pdf/)[0];
 const invoke=file=>app.emit('second-instance',{},[process.execPath,marker,file]);
 invoke(newer);await delay(80);invoke(older);
 await wait(()=>main.exports.__test.pdfMergeJobs.size===1,'per-file Explorer invocations aggregated');
 let win=BrowserWindow.getAllWindows().find(w=>w.excelsisModuleName==='pdf-merge');let ev=c=>win.webContents.executeJavaScript(c);
 await wait(()=>ev('!!document.getElementById("save")&&!document.getElementById("save").disabled'),'thumbnails');
 assert.match(await ev('document.querySelector(".name").textContent'),/Original/);
 assert.equal(await ev('document.querySelectorAll(".file").length'),2);
 await ev('document.getElementById("cancel").click();true');await wait(()=>main.exports.__test.pdfMergeJobs.size===0,'Cancel closes');assert(!fs.existsSync(path.join(root,'Merged.pdf')));
 invoke(newer);await wait(()=>errors.length===1,'one-file selection explanation');assert.match(errors[0],/2 to 64/);
 const originalBytes=fs.readFileSync(older);fs.writeFileSync(path.join(root,'Merged.pdf'),originalBytes);
 invoke(newer);invoke(older);await wait(()=>main.exports.__test.pdfMergeJobs.size===1,'fresh merge burst');win=BrowserWindow.getAllWindows().find(w=>w.excelsisModuleName==='pdf-merge');
 await wait(()=>ev('!!document.getElementById("save")&&!document.getElementById("save").disabled'),'second preview');
 await ev('document.querySelector(".file .controls button:last-of-type").click();const s=document.querySelector(".file select");s.value="90";s.dispatchEvent(new Event("change",{bubbles:true}));true');
 assert.match(await ev('document.querySelector(".name").textContent'),/Latest/);
 await ev('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');await delay(150);fs.writeFileSync(path.join(root,'merge-dialog.png'),(await win.webContents.capturePage(undefined,{stayHidden:true})).toPNG());
 await ev('document.getElementById("save").click();true');await wait(()=>ev('!document.getElementById("open").hidden'),'one-click save');
 const output=path.join(root,'Merged (2).pdf');assert(fs.existsSync(output));assert.deepEqual(fs.readFileSync(path.join(root,'Merged.pdf')),originalBytes);
 const merged=await PDFDocument.load(fs.readFileSync(output));assert.equal(merged.getPageCount(),2);assert.equal(merged.getPage(0).getRotation().angle,90);
 const text=await ev(`(async()=>{const p=await import('./vendor/pdfjs/pdf.min.mjs'),t=p.getDocument({data:new Uint8Array(${JSON.stringify([...fs.readFileSync(output)])}),isEvalSupported:false});const d=await t.promise;try{return(await(await d.getPage(1)).getTextContent()).items.map(i=>i.str).join(' ')}finally{await t.destroy()}})()`);assert.match(text,/NEWER DRAWING/);
 const api=main.exports.__test;assert.throws(()=>api.assertTrustedSender({sender:win.webContents,senderFrame:{}},['pdf-merge']),/Untrusted/);
 const result={passed:true,registeredCommand:true,explorerPerFileBurst:true,oldestModifiedFirst:true,cancelNoOutput:true,oneFileExplained:true,reorderAndRotation:true,automaticSameFolderSave:true,existingOutputPreserved:true,noSaveDialog:true,evidence:root};fs.writeFileSync(path.join(root,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));app.exit(0);
}
