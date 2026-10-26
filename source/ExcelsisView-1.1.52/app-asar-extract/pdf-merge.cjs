// Main-owned file identities; renderer submits only ordered opaque IDs/rotations.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const {Worker,isMainThread,parentPort,workerData}=require('node:worker_threads');
const MAX_FILES=64,MAX_FILE_BYTES=64*1024*1024,MAX_TOTAL_BYTES=256*1024*1024,MAX_PAGES=2000;
const key=p=>path.resolve(p).toLowerCase();
const identity=s=>`${s.dev}:${s.ino}:${s.size}:${s.mtimeMs}:${s.ctimeMs}`;
async function inspect(file){
 const stat=await fs.lstat(file);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.size<5||stat.size>MAX_FILE_BYTES)throw Error('Each merge input must be a regular PDF file no larger than 64 MiB.');
 return stat;
}
async function preparePdfMerge(paths){
 if(!Array.isArray(paths)||paths.length<2||paths.length>MAX_FILES)throw Error('Select 2 to 64 PDF files from the same folder.');
 const files=[],seen=new Set();let directory=null,total=0;
 for(const input of paths){
  if(typeof input!=='string'||path.extname(input).toLowerCase()!=='.pdf')throw Error('Merge accepts PDF files only.');
  const requested=path.resolve(input);await inspect(requested);
  const real=await fs.realpath(requested),parent=await fs.realpath(path.dirname(real));
  if(directory&&key(directory)!==key(parent))throw Error('All selected PDFs must be in the same folder.');
  directory=parent;const stat=await inspect(real),fileIdentity=`${stat.dev}:${stat.ino}`;
  if(seen.has(key(real))||seen.has(fileIdentity))throw Error('The same PDF was selected more than once.');
  seen.add(key(real));seen.add(fileIdentity);total+=stat.size;
  if(total>MAX_TOTAL_BYTES)throw Error('The selected PDFs exceed the 256 MiB merge limit.');
  files.push({id:crypto.randomUUID(),path:real,name:path.basename(real),modified:stat.mtimeMs,identity:identity(stat)});
 }
 files.sort((a,b)=>a.modified-b.modified||a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'}));
 return{directory,files,busy:false,savedPath:null};
}
async function readMergeFile(job,id){
 const file=job.files.find(f=>f.id===id);if(!file)throw Error('This file is not part of the merge selection.');
 const handle=await fs.open(file.path,'r');
 try{
  const before=await handle.stat();if(!before.isFile()||identity(before)!==file.identity)throw Error('A selected PDF changed. Close this dialog and select the files again.');
  const bytes=await handle.readFile();if(identity(await handle.stat())!==file.identity)throw Error('A selected PDF changed while reading.');
  if(bytes.subarray(0,5).toString('ascii')!=='%PDF-')throw Error('A selected file is not a valid PDF.');
  return bytes;
 }finally{await handle.close();}
}
function validateOrder(job,order){
 if(!Array.isArray(order)||order.length!==job.files.length)throw Error('The merge order must include every selected PDF exactly once.');
 const seen=new Set();for(const item of order){if(!item||!job.files.some(f=>f.id===item.id)||seen.has(item.id)||![0,90,180,270].includes(item.rotation))throw Error('Invalid merge order or page rotation.');seen.add(item.id);}return order;
}
function mergeInWorker(inputs){return new Promise((resolve,reject)=>{
 const worker=new Worker(__filename,{workerData:{inputs},resourceLimits:{maxOldGenerationSizeMb:512}});
 const timer=setTimeout(()=>{worker.terminate();reject(Error('Merge timed out. Try fewer or smaller PDFs.'));},120000);
 worker.once('message',message=>{clearTimeout(timer);if(message.error)reject(Error(message.error));else resolve(Buffer.from(message.bytes));});
 worker.once('error',e=>{clearTimeout(timer);reject(e);});worker.once('exit',code=>{clearTimeout(timer);if(code)reject(Error('The PDF merge worker could not finish.'));});
 });}
async function savePdfMerge(job,order){
 if(job.busy||job.savedPath)throw Error('This merge is already running or saved.');validateOrder(job,order);job.busy=true;
 try{
  const inputs=[];for(const item of order)inputs.push({bytes:await readMergeFile(job,item.id),rotation:item.rotation});
  const output=await mergeInWorker(inputs);if(output.length>MAX_TOTAL_BYTES)throw Error('The merged PDF exceeds the output size limit.');
  if(key(await fs.realpath(job.directory))!==key(job.directory))throw Error('The source folder changed while merging.');
  for(const file of job.files)if(identity(await inspect(file.path))!==file.identity)throw Error('A selected PDF changed while merging. No output was saved.');
  for(let number=1;number<=10000;number++){
   const target=path.join(job.directory,number===1?'Merged.pdf':`Merged (${number}).pdf`);let handle;
   try{handle=await fs.open(target,'wx');}catch(error){if(error.code==='EEXIST')continue;throw error;}
   try{await handle.writeFile(output);await handle.sync();}catch(error){await handle.close();await fs.unlink(target).catch(()=>{});throw error;} // only the exact new, exclusively-created incomplete output
   await handle.close();job.savedPath=target;return{path:target,name:path.basename(target),bytes:output.length};
  }
  throw Error('Too many existing Merged PDF names in this folder.');
 }finally{job.busy=false;}
}
if(!isMainThread&&workerData?.inputs){(async()=>{
 const{PDFDocument,degrees}=await import(pathToFileURL(path.join(__dirname,'modules/3dpdf/vendor/pdf-edit/pdf-export-runtime.mjs')).href);
 const output=await PDFDocument.create();let count=0;
 for(const input of workerData.inputs){const source=await PDFDocument.load(input.bytes,{updateMetadata:false});count+=source.getPageCount();if(count>MAX_PAGES)throw Error('The merge exceeds the 2,000-page limit.');const pages=await output.copyPages(source,source.getPageIndices());for(const page of pages){page.setRotation(degrees((page.getRotation().angle+input.rotation)%360));output.addPage(page);}}
 if(!count)throw Error('The selected PDFs contain no pages.');const bytes=await output.save();parentPort.postMessage({bytes},[bytes.buffer]);
 })().catch(error=>parentPort.postMessage({error:/encrypted/i.test(error.message)?'An encrypted PDF cannot be merged. Save an unlocked copy first.':`Could not merge these PDFs: ${error.message}`}));}
module.exports={preparePdfMerge,readMergeFile,savePdfMerge,validateOrder,MAX_FILES};
