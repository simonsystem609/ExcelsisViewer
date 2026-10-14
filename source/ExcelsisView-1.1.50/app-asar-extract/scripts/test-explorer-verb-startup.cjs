// Cold-start Explorer Document verbs: one process per selected PDF. The primary
// instance queues its own file before slow startup checks, while the other files
// arrive as second instances; one window must receive the whole selection.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const project=path.resolve(__dirname,'..');
if(!process.versions.electron){
 const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;delete env.NODE_OPTIONS;
 (async()=>{for(const mode of['merge','batch']){
  const code=await new Promise(resolve=>require('node:child_process').spawn(require('electron'),[__filename,mode],{cwd:project,windowsHide:true,stdio:'inherit',env}).on('exit',c=>resolve(c??1)));
  if(code){process.exitCode=code;return;}
 }})();
}
else run(process.argv.at(-1)).catch(e=>{console.error(e);require('electron').app.exit(1);});
async function run(mode){
 assert(['merge','batch'].includes(mode));
 const{app,BrowserWindow,dialog}=require('electron'),{PDFDocument}=require('pdf-lib');
 const root=fs.mkdtempSync(path.join(require('node:os').tmpdir(),`excelsis-verb-startup-${mode}-`));
 app.setPath('appData',path.join(root,'profile'));app.setAppPath(project);
 const errors=[];dialog.showErrorBox=(_title,message)=>errors.push(message);
 // A quit (e.g. after a one-file "Select 2 to 64" error) must fail, not exit 0.
 let done=false;app.on('will-quit',event=>{if(done)return;event.preventDefault();console.error(`App quit before receiving the whole selection: ${JSON.stringify(errors)}`);app.exit(1);});
 const delay=ms=>new Promise(r=>setTimeout(r,ms));
 async function wait(fn,label){const end=Date.now()+30000;while(Date.now()<end){if(await fn())return;await delay(60);}throw Error('Timeout '+label);}
 async function input(name,time){const d=await PDFDocument.create();d.addPage([300,400]).drawText(name,{x:30,y:340,size:20});const file=path.join(root,name);fs.writeFileSync(file,await d.save());fs.utimesSync(file,time,time);return file;}
 // Paths with spaces arrive intact through the quoted "%1" command.
 const files=[await input('B second drawing.pdf',200000),await input('A first drawing.pdf',100000),await input('C third drawing.pdf',300000)];
 const marker=mode==='merge'?'--merge-pdf':'--batch-print';
 let release;globalThis.__slowStartup=new Promise(r=>{release=r;});globalThis.__startupArgs=[marker,files[0]];
 let source=fs.readFileSync(path.join(project,'main.cjs'),'utf8');
 const swap=(from,to)=>{assert.equal(source.split(from).length-1,1,`main.cjs no longer contains exactly one: ${from}`);source=source.replace(from,to);};
 swap('explorerVerb = routeMergeArgs(process.argv.slice(1));','explorerVerb = routeMergeArgs(globalThis.__startupArgs);');
 swap('const batchPrintPaths = await findBatchPrintArgs(process.argv.slice(1));','const batchPrintPaths = await findBatchPrintArgs(globalThis.__startupArgs);');
 // Integrity hashing of the installed runtime can outlast the burst window.
 swap('if (!pdfThumbnailRequest) await verifyExternalRuntimeIntegrity();','if (!pdfThumbnailRequest) { await verifyExternalRuntimeIntegrity(); await globalThis.__slowStartup; }');
 source=source.replaceAll('new BrowserWindow({','new BrowserWindow({show:false,').replaceAll('webPreferences: {','webPreferences: {offscreen:true,').replaceAll('findOpenArgs(process.argv.slice(1))','findOpenArgs([])');
 const Module=require('node:module'),main=new Module(path.join(project,'main.cjs'),module);main.filename=path.join(project,'main.cjs');main.paths=Module._nodeModulePaths(project);
 main._compile(source+'\nmodule.exports.__test={pdfMergeJobs,batchPrintJobs};',main.filename);
 const api=main.exports.__test,jobs=()=>mode==='merge'?api.pdfMergeJobs:api.batchPrintJobs;
 await app.whenReady();
 const invoke=file=>app.emit('second-instance',{},[process.execPath,marker,file]);
 await delay(100);invoke(files[1]);
 await delay(1700); // The first burst timer has fired and waits for startup checks.
 invoke(files[2]); // A straggler re-arms the burst before startup finishes.
 await delay(700);
 assert.deepEqual(errors,[],'No error dialog while the selection is still arriving');
 assert.equal(jobs().size,0,'No verb window opens before startup checks finish');
 assert.equal(BrowserWindow.getAllWindows().length,0,'No window (or launcher) before startup checks finish');
 release();
 await wait(()=>jobs().size===1,'one window for the whole selection');
 await delay(2500); // Any split remainder would have opened by now.
 assert.equal(jobs().size,1,'The selection was split into several windows');
 assert.deepEqual(errors,[],'No error dialog for a valid multi-file selection');
 assert(!BrowserWindow.getAllWindows().some(w=>w.excelsisModuleName==='launcher'),'Explorer verbs never fall back to the launcher');
 const job=[...jobs().values()][0];
 const names=job.files.map(f=>f.name);
 if(mode==='merge')assert.deepEqual(names,['A first drawing.pdf','B second drawing.pdf','C third drawing.pdf'],'Oldest modified first');
 else assert.deepEqual([...names].sort(),['A first drawing.pdf','B second drawing.pdf','C third drawing.pdf']);
 done=true;
 console.log(JSON.stringify({passed:true,mode,coldStartPrimaryFile:true,secondInstanceDuringStartup:true,stragglerRearm:true,windowsWaitForStartup:true,singleWindow:true,noLauncher:true,files:names,evidence:root}));
 app.exit(0);
}
