// Real Chromium print compositor, intercepted before any Windows printer job.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const project=path.resolve(__dirname,'..');
if(!process.versions.electron){const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;delete env.NODE_OPTIONS;require('node:child_process').spawn(require('electron'),[__filename],{cwd:project,windowsHide:true,stdio:'inherit',env}).on('exit',c=>process.exitCode=c??1);}
else run().catch(e=>{console.error(e);require('electron').app.exit(1);});
async function run(){
 const {app,BrowserWindow}=require('electron'),{PDFDocument,rgb,degrees}=require('pdf-lib');
 const root=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'excelsis-print-'));
 app.setPath('appData',path.join(root,'profile'));app.setAppPath(project);
 const records=[];let printFailure;
 app.on('web-contents-created',(_event,wc)=>{
  wc.getPrintersAsync=async()=>[{name:'INTERCEPTED',displayName:'Offline print proof',isDefault:true}];
  wc.print=(options,callback)=>{(async()=>{
   assert.equal(options.scaleFactor,100);assert.equal(options.margins.marginType,'none');assert.equal(options.deviceName,'INTERCEPTED');
   const pdf=await wc.printToPDF({pageSize:options.pageSize,landscape:options.landscape,preferCSSPageSize:true,printBackground:true,margins:{top:0,bottom:0,left:0,right:0}});
   const file=path.join(root,`Print-${records.length+1}.pdf`);fs.writeFileSync(file,pdf);
   const parsed=await PDFDocument.load(pdf),sizes=parsed.getPages().map(p=>p.getSize());
   const pixels=await wc.executeJavaScript(`(async()=>{const p=await import('./vendor/pdfjs/pdf.min.mjs');const t=p.getDocument({data:new Uint8Array(${JSON.stringify([...pdf])}),isEvalSupported:false});const d=await t.promise;const result=[];for(let n=1;n<=d.numPages;n++){const pg=await d.getPage(n),v=pg.getViewport({scale:1}),c=document.createElement('canvas');c.width=Math.ceil(v.width);c.height=Math.ceil(v.height);const x=c.getContext('2d');await pg.render({canvas:c,canvasContext:x,viewport:v}).promise;const b=x.getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=-1,y1=-1;for(let y=0;y<c.height;y++)for(let z=0;z<c.width;z++){const i=(y*c.width+z)*4;if(b[i]<40&&b[i+1]<80&&b[i+2]>180){x0=Math.min(x0,z);x1=Math.max(x1,z);y0=Math.min(y0,y);y1=Math.max(y1,y);}}result.push({width:x1-x0+1,height:y1-y0+1,x:x0,y:y0});}await t.destroy();return result})()`);
   records.push({options,sizes,pixels,file});callback(true);
  })().catch(e=>{printFailure=e;callback(false,e.message);});};
 });
 const Module=require('node:module'),main=new Module(path.join(project,'main.cjs'),module);main.filename=path.join(project,'main.cjs');main.paths=Module._nodeModulePaths(project);
 main._compile(fs.readFileSync(main.filename,'utf8').replaceAll('new BrowserWindow({','new BrowserWindow({show:false,').replaceAll('findOpenArgs(process.argv.slice(1))','findOpenArgs([])')+'\nmodule.exports.__test={queueBatchPrint,findBatchPrintArgs,createBatchPrintWindow};',main.filename);
 const api=main.exports.__test,delay=ms=>new Promise(r=>setTimeout(r,ms));
 async function wait(fn,label){const end=Date.now()+45000;while(Date.now()<end){if(printFailure)throw printFailure;if(await fn())return;await delay(60);}throw Error('Timeout '+label);}
 await app.whenReady();await wait(()=>BrowserWindow.getAllWindows().length,'launcher');
 const mm=72/25.4;
 async function fixture(name,pages){const d=await PDFDocument.create();for(const [w,h,rotate=0]of pages){const p=d.addPage([w*mm,h*mm]);p.drawRectangle({x:(w-100)/2*mm,y:(h-50)/2*mm,width:100*mm,height:50*mm,color:rgb(0,0,1)});if(rotate)p.setRotation(degrees(rotate));}const file=path.join(root,name);fs.writeFileSync(file,await d.save());return file;}
 const portrait=await fixture('Portrait.pdf',[[210,297]]),rotated=await fixture('Rotated.pdf',[[210,297,90]]),mixed=await fixture('Mixed.pdf',[[210,297],[420,297]]);
 async function printUI(file,scaleMode,viaBatch=false){
  const before=records.length;
  let win;if(viaBatch){const args=await api.findBatchPrintArgs(['app.exe','--batch-print',file]);assert.deepEqual(args,[file]);api.queueBatchPrint(args);await wait(()=>BrowserWindow.getAllWindows().some(w=>w.excelsisModuleName==='batch-print'),'single-file Explorer batch');win=BrowserWindow.getAllWindows().find(w=>w.excelsisModuleName==='batch-print');}
  else win=api.createBatchPrintWindow([file],{mode:'single'});
  const ev=c=>win.webContents.executeJavaScript(c);await wait(()=>ev('!!document.getElementById("printBtn")&&!document.getElementById("printBtn").disabled'),'print preview');
  await ev(`(()=>{for(const [id,value]of Object.entries(${JSON.stringify({scaleMode,qualityDpi:'150',orientation:'auto',paperSize:'A4',margins:'minimum'})})){const e=document.getElementById(id);e.value=value;e.dispatchEvent(new Event('change',{bubbles:true}));}document.getElementById('printBtn').click();return true})()`);
  await wait(()=>records.length===before+1,'intercepted output');await wait(()=>ev('!document.getElementById("printBtn").disabled'),'print completed');win.destroy();return records.at(-1);
 }
 const actual=await printUI(portrait,'actual',true);assert.equal(actual.options.landscape,false);assert.equal(actual.sizes.length,1);assert(Math.abs(actual.sizes[0].width-210*mm)<1);assert(Math.abs(actual.pixels[0].width-100*mm)<2,'Actual size must remain 100 mm');
 const landscape=await printUI(rotated,'actual');assert.equal(landscape.options.landscape,true);assert(landscape.sizes[0].width>landscape.sizes[0].height);assert(Math.abs(landscape.pixels[0].width-50*mm)<2);assert(Math.abs(landscape.pixels[0].height-100*mm)<2);
 const fit=await printUI(mixed,'fit');assert.equal(fit.sizes.length,2);assert.equal(fit.options.landscape,false);assert(Math.abs(fit.pixels[0].width-100*mm*200/210)<2,'Fit margins applied once');assert(Math.abs(fit.pixels[1].height-100*mm*Math.min(287/420,200/297))<2,'Mixed landscape fitted once then rotated');
 const result={passed:true,physicalPrinterUsed:false,singleFileBatch:true,actualMillimeters:true,rotatedLandscape:true,mixedOrientation:true,singleFitScale:true,records,evidence:root};fs.writeFileSync(path.join(root,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));app.exit(0);
}
