const assert = require('node:assert/strict');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const { PassThrough } = require('node:stream');
const { startFileClipboard } = require('../file-clipboard-transport.cjs');

async function run() {
  const runtimeRoot = path.resolve(__dirname, '..');
  const source = 'C:\\Synthetic tests\\árvíz [1]; $name.dxf';
  let child, calls=0, events=[];
  function spawnProcess(executable, args, options) {
    assert.equal(executable, path.join(runtimeRoot,'native','file-clipboard.exe'));
    assert.deepEqual(args,[source]); assert.equal(options.windowsHide,true);
    assert(!options.shell); assert.deepEqual(options.stdio,['pipe','pipe','pipe']);
    assert.equal(options.cwd,runtimeRoot); calls++;
    child = new EventEmitter(); child.stdout=new PassThrough();
    child.stdin=new PassThrough(); child.stderr=new PassThrough();
    child.kill=()=>{child.killed=true;return true;};
    return child;
  }
  const start=()=>startFileClipboard(source,value=>events.push(value),{runtimeRoot,spawnProcess});
  let ready=start(); child.stdout.write('{"type":"rea'); child.stdout.write('dy"}\n');
  let task=await ready; child.stdout.write('{"type":"receipt","format":"paste","effect":2}\n');
  assert.deepEqual(events,[{type:'receipt',format:'paste',effect:2}]);
  task.stop(); child.emit('exit',0); assert.equal(events.length,1,'Normal stop cannot emit a failure');
  for(const payload of ['not json\n','null\n','[]\n','x'.repeat(4097)]) {
    ready=start(); child.stdout.write(payload); await assert.rejects(ready,/Invalid/);
    child.emit('exit',0);
    ready=start(); child.stdout.write('{"type":"ready"}\n'); task=await ready;
    const before=events.length; child.stdout.write(payload);
    assert.equal(events.length,before+1); assert.equal(events.at(-1).type,'error');
    child.emit('exit',0); assert.equal(events.length,before+1,'Invalid output reports one failure, not a retry');
  }
  ready=start(); child.emit('error',new Error('denied')); await assert.rejects(ready,/denied/);
  ready=start(); child.stdout.write('{"type":"ready"}\n'); task=await ready;
  child.emit('exit',1); assert.equal(events.at(-1).type,'error'); task.stop();
  console.log(JSON.stringify({passed:true,fixedExecutable:true,oneUnicodePathArgument:true,noShell:true,boundedOutput:true,
    malformedBeforeAndAfterReady:true,helperFailureReported:true,noRealProcessOrClipboard:true,calls}));
}
run().catch(error=>{console.error(error);process.exitCode=1;});
