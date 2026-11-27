import test from 'node:test';
import assert from 'node:assert/strict';
import {RECORD_BYTES,buildIndex,readRecord,windowRecords,serialize,decimalToTicks,formatTicks,tickFraction,tickAtFraction} from '../src/lib/profiler/core.mjs';

function fixture(records){
  const buffer=new ArrayBuffer(records.length*44),v=new DataView(buffer);
  records.forEach((r,i)=>{const o=i*44;v.setBigUint64(o,r.a,true);v.setBigUint64(o+8,r.b,true);v.setBigUint64(o+16,r.payload??18446744073709551615n,true);v.setUint32(o+24,r.seq??i,true);v.setUint32(o+28,1042676,true);v.setUint32(o+32,r.stream??13293701,true);v.setUint16(o+36,r.source??24,true);v.setUint16(o+38,65535,true);v.setUint16(o+40,r.cpu??4,true);v.setUint16(o+42,r.type??21,true);});return buffer;
}
const origin=9007199254740993000n;
test('all raw fields retain exact u64 and unsigned widths',()=>{
  const r=readRecord(new DataView(fixture([{a:origin,b:origin+1000n,seq:4294967295}])),0);
  assert.equal(r.startTick,origin);assert.equal(r.endTick-origin,1000n);assert.equal(r.payload,18446744073709551615n);
  assert.equal(r.sequence,4294967295);assert.equal(r.user,65535);assert.equal(r.byteOffset,0);assert.equal(r.row,1);
});
test('no truncated or empty capture accepted',()=>{assert.throws(()=>buildIndex(new ArrayBuffer(43)));assert.throws(()=>buildIndex(new ArrayBuffer(0)));});
test('separate sorted index preserves original rows and detects reversals',()=>{
  const i=buildIndex(fixture([{a:origin+10n,b:origin+20n},{a:origin,b:origin+30n}]));
  assert.deepEqual([...i.sorted],[1,0]);assert.equal(i.meta.reversals,1);assert.equal(serialize(i,1).row,2);
});
test('query retains long interval beginning before inspection window',()=>{
  const i=buildIndex(fixture([{a:origin,b:origin+10000n},{a:origin+500n,b:origin+501n}]));
  assert.deepEqual(windowRecords(i,origin+999n,origin+1000n),[0]);
  assert.deepEqual(windowRecords(i,origin+500n,origin+501n),[0,1]);
});
test('unique exact endpoint matches within CPU/stream/source only',()=>{
  const i=buildIndex(fixture([{a:origin,b:origin+1000n,type:21},{a:origin+1000n,b:origin+1001n,type:22},{a:origin+1000n,b:origin+1001n,type:22,cpu:5}]));
  assert.equal(serialize(i,0).pairing.counterpart,2);assert.equal(serialize(i,1).pairing.counterpart,1);assert.equal(serialize(i,2).pairing.counterpart,null);
});
test('duplicate endpoints rejected without deleting raw rows',()=>{
  const i=buildIndex(fixture([{a:origin,b:origin+10n},{a:origin,b:origin+10n},{a:origin+10n,b:origin+11n,type:22}]));
  assert.equal(i.sorted.length,3);assert.match(serialize(i,2).pairing.reason,/Duplicate/);assert.equal(serialize(i,2).pairing.counterpart,null);
});
test('absent endpoint not repaired using preceding unrelated event',()=>{
  const i=buildIndex(fixture([{a:origin,b:origin+1n,type:106,source:1},{a:origin+20n,b:origin+21n,type:22}]));
  assert.match(serialize(i,1).pairing.reason,/No exact/);
});
test('invalid interval flagged without negative fabricated duration',()=>{const i=buildIndex(fixture([{a:origin+10n,b:origin}]));assert.equal(i.meta.invalid,1);assert.equal(serialize(i,0).durationTicks,null);});
test('filters do not cross CPU, lane or type',()=>{
  const i=buildIndex(fixture([{a:origin,b:origin+10n},{a:origin,b:origin+10n,cpu:5},{a:origin,b:origin+10n,type:106}]));
  assert.deepEqual(windowRecords(i,origin,origin+10n,{cpus:[4],types:[21]}),[0]);
  assert.equal(windowRecords(i,origin,origin+10n,{cpus:[]}).length,0);
});
test('exact decimal seeking, including microseconds and one ns',()=>{
  assert.equal(decimalToTicks('0.000001',1000000000n),1000n);assert.equal(decimalToTicks('0.000000001',1000000000n),1n);
  assert.equal(decimalToTicks('-0.05',1000000000n),-50000000n);assert.throws(()=>decimalToTicks('0.0000000001',1000000000n),/between/);
  assert.throws(()=>decimalToTicks('1e-6',1000000000n));assert.equal(formatTicks(1001n,1000000000n),'0.000001001');
});
test('local coordinate conversion preserves ns differences above 2^53 absolute ticks',()=>{
  assert.equal(tickFraction(origin+1n,origin,origin+1000n),.001);
  assert.equal(tickAtFraction(.001,origin,origin+1000n),origin+1n);
  assert.throws(()=>tickFraction(origin,origin,origin+9007199254740992n),/Zoom/);
});
test('full bytes included in inspector serialization; raw offsets exact',()=>{
  const buffer=fixture([{a:origin,b:origin+1000n},{a:origin+2000n,b:origin+3000n}]),i=buildIndex(buffer),r=serialize(i,1,true);
  assert.equal(r.rawHex.split(' ').length,44);assert.equal(r.byteOffset,44);assert.equal(r.startTick,String(origin+2000n));assert.equal(r.payload,'18446744073709551615');
});

test('worker query, exact edge stepping, active intervals, CSV and dense tables',async()=>{
  let respond;globalThis.self={postMessage:message=>{if(message.id)respond(message);}};
  await import('../src/lib/profiler/decode.worker.mjs');
  let id=0;const call=(action,fields={})=>new Promise(resolve=>{respond=resolve;self.onmessage({data:{id:++id,action,...fields}});});
  const buffer=fixture([{a:origin,b:origin+1000n},{a:origin+1000n,b:origin+1001n,type:22},{a:origin+1000n,b:origin+1000n,type:106}]);
  await call('load',{file:{arrayBuffer:async()=>buffer}});
  let result=await call('query',{start:String(origin),end:String(origin+1001n),cursor:String(origin+1000n)});
  assert.equal(result.result.total,3);assert.equal(result.result.activeTotal,2); // old interval excluded at end; exit + point active
  assert.equal((await call('step',{cursor:String(origin),direction:1})).result,String(origin+1000n));
  assert.equal((await call('step',{cursor:String(origin+1001n),direction:-1})).result,String(origin+1000n));
  const csv=await call('export',{start:String(origin),end:String(origin+1001n)});
  assert.equal(csv.result.split('\r\n').length,4);assert.ok(csv.result.includes(String(origin)));assert.ok(csv.result.includes('18446744073709551615'));
  const dense=fixture(Array.from({length:18001},(_,i)=>({a:origin+BigInt(i),b:origin+BigInt(i)+1000n,type:106})));
  await call('load',{file:{arrayBuffer:async()=>dense}});
  result=await call('query',{start:String(origin),end:String(origin+20000n),cursor:String(origin),offset:18000});
  assert.equal(result.result.total,18001);assert.equal(result.result.events.length,0);assert.equal(result.result.page.length,1);
  assert.equal(result.result.density.lanes[0].counts.reduce((a,b)=>a+b,0),18001);
  const overview=await call('overview');assert.equal(overview.result.counts[4].reduce((a,b)=>a+b,0),18001);
  const bad=await call('record',{row:0});assert.match(bad.error,/out of range/);
});
