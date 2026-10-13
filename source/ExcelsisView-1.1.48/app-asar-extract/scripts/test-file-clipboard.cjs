const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { createFileClipboard } = require('../file-clipboard.cjs');
async function run() {
  const root = await fs.mkdtemp(path.join(require('node:os').tmpdir(), 'excelsis-file-cut-'));
  const target = path.join(root,'destination'); await fs.mkdir(target);
  let receipt, currentPath, token=1, unlinkCalls=0, moved=[], states=[], stops=0, clock=0;
  const io = { ...fs, unlink: async (...args) => {
    assert.equal(args.length,1); assert.equal(args[0],currentPath); unlinkCalls++;
    // Even the unoptimized-move test is recoverable, never real deletion.
    await fs.rename(args[0],path.join(target,'unoptimized-'+path.basename(args[0])));
  } };
  const options = { io, intervalMs:60000, now:()=>clock,
    assertCurrent(owner,file) { assert.equal(owner,7); assert.equal(file,currentPath); return token; },
    transport:async (file,onEvent)=>{assert.equal(file,currentPath);receipt=onEvent;return {stop:()=>stops++};},
    onMoved:async file=>moved.push(file), onState:async state=>states.push(state) };
  const service=createFileClipboard(options);
  for(const ext of ['dxf','dwg','pdf']) {
    currentPath=path.join(root,'Unicode árvíz [1].'+ext); await fs.writeFile(currentPath,'bytes-'+ext);
    await service.start(7,currentPath); assert(service.isLocked(currentPath));
    await fs.rename(currentPath,path.join(target,path.basename(currentPath)));
    await service.poll(); assert(service.isLocked(currentPath),'Disappearance alone is not a move receipt');
    await receipt({type:'receipt',format:'paste',effect:2});
    assert(!service.isLocked(currentPath)); assert.equal(moved.at(-1),currentPath);
    assert.equal(await fs.readFile(path.join(target,path.basename(currentPath)),'utf8'),'bytes-'+ext);
  }
  currentPath=path.join(root,'original.dxf'); await fs.writeFile(currentPath,'preserve bytes');
  await service.start(7,currentPath);
  await receipt({type:'receipt',format:'performed',effect:2});
  assert.equal(unlinkCalls,0,'Performed MOVE alone must not delete');
  await receipt({type:'receipt',format:'paste',effect:2});
  assert.equal(unlinkCalls,1); assert.equal(await fs.readFile(path.join(target,'unoptimized-original.dxf'),'utf8'),'preserve bytes');
  await fs.writeFile(currentPath,'copy source'); await service.start(7,currentPath);
  await receipt({type:'receipt',format:'paste',effect:1});
  assert(!service.isLocked(currentPath)); assert.equal(unlinkCalls,1); assert.equal(await fs.readFile(currentPath,'utf8'),'copy source');
  await service.start(7,currentPath); await receipt({type:'lost'}); clock=6000; await service.poll();
  assert(!service.isLocked(currentPath)); assert.equal(await fs.readFile(currentPath,'utf8'),'copy source');
  await service.start(7,currentPath);
  await assert.rejects(service.cancel(9,currentPath),/Only/);
  await service.cancel(7,currentPath); assert.equal(states.at(-1).phase,'canceled');
  let offline=false;
  const network=createFileClipboard({...options,io:{...io,
    lstat:async file=>{if(offline)throw Object.assign(new Error('offline'),{code:'ENOENT'});return fs.lstat(file);},
    readdir:async folder=>{if(offline)throw Object.assign(new Error('share offline'),{code:'ENOENT'});return fs.readdir(folder);},
  }});
  await network.start(7,currentPath); offline=true; await receipt({type:'receipt',format:'paste',effect:2});
  assert(network.isLocked(currentPath),'Offline NAS cannot be mistaken for a successful move');
  await network.cancel(7,currentPath); offline=false;
  let failures=0;
  const failure=createFileClipboard({...options,io:{...fs,unlink:async()=>{failures++;throw Object.assign(new Error('delete denied'),{code:'EACCES'});}}});
  await failure.start(7,currentPath); await receipt({type:'receipt',format:'performed',effect:2});await receipt({type:'receipt',format:'paste',effect:2});
  assert.equal(failures,1);assert.equal(states.at(-1).phase,'error');assert.equal(await fs.readFile(currentPath,'utf8'),'copy source');
  await service.start(7,currentPath); await fs.writeFile(currentPath,'external change that must survive');
  await receipt({type:'receipt',format:'paste',effect:2}); assert.equal(states.at(-1).phase,'error'); assert.equal(unlinkCalls,1);
  const directory=path.join(root,'folder.dxf');await fs.mkdir(directory);
  currentPath=directory;await assert.rejects(service.start(7,directory),/regular file/);
  currentPath=path.join(root,'original.dxf');
  const badStart=createFileClipboard({...options,transport:async()=>{throw new Error('clipboard busy');}});
  await assert.rejects(badStart.start(7,currentPath),/clipboard busy/);assert(!badStart.isLocked(currentPath));
  // A cancel while the filesystem check is waiting must invalidate that
  // check before it can call unlink. Replacement cuts cannot revive it.
  let releaseStat, waitStat=false, raceUnlinks=0;
  const race=createFileClipboard({...options,io:{...fs,
    lstat:async file=>{if(waitStat){await new Promise(resolve=>releaseStat=resolve);}return fs.lstat(file);},
    unlink:async()=>{raceUnlinks++;throw new Error('Canceled check attempted removal');},
  }});
  await race.start(7,currentPath); await receipt({type:'receipt',format:'performed',effect:2});
  waitStat=true; const delayed=receipt({type:'receipt',format:'paste',effect:2});
  await new Promise(resolve=>setImmediate(resolve)); assert.equal(typeof releaseStat,'function');
  await race.cancel(7,currentPath); waitStat=false; releaseStat(); await delayed;
  assert.equal(raceUnlinks,0); assert.equal(await fs.readFile(currentPath,'utf8'),'external change that must survive');
  await race.start(7,currentPath);
  const staleReceipt=receipt; await race.start(7,currentPath);
  await staleReceipt({type:'receipt',format:'paste',effect:2});
  assert(race.isLocked(currentPath),'Old receipts cannot finish a replacement cut');
  await race.cancel(7,currentPath);
  // Failure/COPY/LINK feedback must override a move hint even if someone
  // else has moved the path. This source never retries/removes anything.
  for(const effect of [0,1,4]) {
    await service.start(7,currentPath);
    await fs.rename(currentPath,path.join(target,'failed-'+effect+'.dxf'));
    await receipt({type:'receipt',format:'logical',effect});
    assert.equal(states.at(-1).phase,'canceled'); assert.equal(unlinkCalls,1);
    await fs.rename(path.join(target,'failed-'+effect+'.dxf'),currentPath);
  }
  // Once the exact, confirmed removal is in flight, Cancel/new Cut must
  // refuse rather than claim cancellation. The adapter remains recoverable.
  let releaseMove;
  const completing=createFileClipboard({...options,io:{...fs,unlink:async file=>{
    await new Promise(resolve=>releaseMove=resolve);
    await fs.rename(file,path.join(target,'completing.dxf'));
  }}});
  await completing.start(7,currentPath); await receipt({type:'receipt',format:'performed',effect:2});
  const completion=receipt({type:'receipt',format:'paste',effect:2});
  await new Promise(resolve=>setTimeout(resolve,30)); assert.equal(typeof releaseMove,'function');
  await assert.rejects(completing.cancel(7,currentPath),/finishing/);
  await assert.rejects(completing.start(7,currentPath),/completing/);
  releaseMove(); await completion; assert.equal(states.at(-1).phase,'moved');
  await fs.rename(path.join(target,'completing.dxf'),currentPath);
  // A shutdown arriving during an optimized-move check must wait for that
  // check, close the view, and never report that the missing original stayed.
  let releaseRead, holdRead=false;
  const ending=createFileClipboard({...options,io:{...fs,lstat:async file=>{
    if(holdRead) await new Promise(resolve=>releaseRead=resolve);
    return fs.lstat(file);
  }}});
  await ending.start(7,currentPath); await fs.rename(currentPath,path.join(target,'ending.dxf'));
  holdRead=true; const optimized=receipt({type:'receipt',format:'paste',effect:2});
  await new Promise(resolve=>setImmediate(resolve)); const shutdown=receipt({type:'error'});
  holdRead=false; releaseRead(); await Promise.all([optimized,shutdown]);
  assert.equal(states.at(-1).phase,'moved');
  await fs.rename(path.join(target,'ending.dxf'),currentPath);
  await service.dispose();
  console.log(JSON.stringify({passed:true,allFormats:true,optimizedMove:true,dualReceiptRequired:true,noDisappearanceOnlyClose:true,copyCancelKeepsSource:true,clipboardReplacement:true,
    nasOfflineNotMoved:true,unlinkFailureStops:true,externalChangesProtected:true,noDirectoryRemoval:true,onePathUnlinkOnly:true,cancelRaceSafe:true,staleReceiptsIgnored:true,
    removalInFlightProtected:true,helperShutdownRaceSafe:true,failedPasteOverridesHint:true,realClipboardUntouched:true,recoverableAdapters:true,evidence:root,stops}));
}
run().catch(error=>{console.error(error);process.exitCode=1;});
