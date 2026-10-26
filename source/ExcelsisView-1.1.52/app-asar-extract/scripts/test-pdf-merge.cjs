const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const{preparePdfMerge,readMergeFile,savePdfMerge,validateOrder}=require('../pdf-merge.cjs');
async function run(){
 const root=await fs.mkdtemp(path.join(require('node:os').tmpdir(),'excelsis-merge-model-'));
 const{PDFDocument,degrees}=require('pdf-lib');
 async function input(name,text,mtime,rotation=0){const d=await PDFDocument.create(),p=d.addPage([300,400]);p.drawText(text,{x:25,y:350});p.setRotation(degrees(rotation));const file=path.join(root,name);await fs.writeFile(file,await d.save());await fs.utimes(file,mtime,mtime);return file;}
 const newer=await input('A newer.pdf','NEWER',200000),older=await input('Z older.pdf','OLDER',100000,90);
 const hash=async f=>crypto.createHash('sha256').update(await fs.readFile(f)).digest('hex');const before=await Promise.all([newer,older].map(hash));
 const job=await preparePdfMerge([newer,older]);assert.equal(job.files[0].name,'Z older.pdf');
 const other=path.join(root,'other');await fs.mkdir(other);const otherPdf=path.join(other,'Other.pdf');await fs.copyFile(older,otherPdf);
 await assert.rejects(preparePdfMerge([older,otherPdf]),/same folder/);await assert.rejects(preparePdfMerge([older]),/2 to 64/);await assert.rejects(preparePdfMerge([older,older]),/more than once/);
 await assert.rejects(readMergeFile(job,'../outside'),/not part/);
 assert.throws(()=>validateOrder(job,[{id:job.files[0].id,rotation:45}]),/exactly once/);
 const order=job.files.map(f=>({id:f.id,rotation:0}));assert.throws(()=>validateOrder(job,[order[0],order[0]]),/Invalid/);
 const preserved=Buffer.from('EXISTING FILE MUST STAY');await fs.writeFile(path.join(root,'Merged.pdf'),preserved);
 const otherJob=await preparePdfMerge([older,newer]);
 const results=await Promise.all([savePdfMerge(job,[{id:job.files[1].id,rotation:180},{id:job.files[0].id,rotation:90}]),savePdfMerge(otherJob,otherJob.files.map(f=>({id:f.id,rotation:0})))]);
 assert.equal(new Set(results.map(r=>r.path)).size,2);assert.deepEqual(new Set(results.map(r=>r.name)),new Set(['Merged (2).pdf','Merged (3).pdf']));assert.deepEqual(await fs.readFile(path.join(root,'Merged.pdf')),preserved);
 const merged=await PDFDocument.load(await fs.readFile(results[0].path));assert.equal(merged.getPageCount(),2);assert.deepEqual(merged.getPages().map(p=>p.getRotation().angle),[180,180]);
 assert.deepEqual(await Promise.all([newer,older].map(hash)),before);
 await assert.rejects(savePdfMerge(job,order),/already/);
 const changed=await preparePdfMerge([older,newer]);await fs.utimes(newer,300000,300000);await assert.rejects(savePdfMerge(changed,changed.files.map(f=>({id:f.id,rotation:0}))),/changed/);
 const broken=path.join(root,'Broken.pdf');await fs.writeFile(broken,'%PDF-not really a PDF');const invalid=await preparePdfMerge([older,broken]);await assert.rejects(savePdfMerge(invalid,invalid.files.map(f=>({id:f.id,rotation:0}))),/Could not merge/);
 console.log(JSON.stringify({passed:true,oldestFirst:true,sameFolderOnly:true,opaqueIds:true,reorderRotation:true,exclusiveCollisionRace:true,inputsUnchanged:true,changedInputRefused:true,invalidPdfRefused:true,evidence:root}));
}
run().catch(e=>{console.error(e);process.exitCode=1;});
