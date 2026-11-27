import test from 'node:test';
import assert from 'node:assert/strict';
import {waveformLanes,waveformGeometry} from '../src/lib/profiler/waveform.mjs';
const origin=9007199254740993000n;
const event=(a,b)=>({startTick:String(origin+a),endTick:String(origin+b)});
test('progressive replay hides entry until its actual start tick',()=>{
  assert.equal(waveformGeometry(event(100n,200n),origin,origin+1000n,origin+99n),null);
  const g=waveformGeometry(event(100n,200n),origin,origin+1000n,origin+100n);
  assert.equal(g.hasStart,true);assert.equal(g.left,g.right);assert.equal(g.hasEnd,false);
});
test('horizontal segment grows to cursor without revealing the exit',()=>{
  const g=waveformGeometry(event(100n,200n),origin,origin+1000n,origin+150n);
  assert.equal(g.left,.1);assert.equal(g.right,.15);assert.equal(g.hasEnd,false);assert.equal(g.growing,true);
  assert.equal(g.rawEnd,origin+200n);
});
test('exit appears exactly at raw end tick and rewinding removes it',()=>{
  const complete=waveformGeometry(event(100n,200n),origin,origin+1000n,origin+200n);
  assert.equal(complete.hasEnd,true);assert.equal(complete.growing,false);assert.equal(complete.right,.2);
  const rewind=waveformGeometry(event(100n,200n),origin,origin+1000n,origin+199n);
  assert.equal(rewind.hasEnd,false);assert.equal(rewind.right,.199);
});
test('future interval stays absent and full-trace mode remains available',()=>{
  assert.equal(waveformGeometry(event(200n,201n),origin,origin+1000n,origin+100n),null);
  assert.equal(waveformGeometry(event(200n,201n),origin,origin+1000n).hasEnd,true);
});
test('waveforms preserve one-tick edges above Number precision',()=>{
  const g=waveformGeometry(event(1n,2n),origin,origin+1000n);
  assert.equal(g.left,.001);assert.equal(g.right,.002);assert.equal(g.rawEnd-g.rawStart,1n);
});
test('clipping never invents start or end transitions',()=>{
  let g=waveformGeometry(event(0n,2000n),origin+100n,origin+1000n);
  assert.equal(g.hasStart,false);assert.equal(g.hasEnd,false);assert.equal(g.left,0);assert.equal(g.right,1);
  g=waveformGeometry(event(0n,500n),origin+100n,origin+1000n);assert.equal(g.hasEnd,true);
  assert.equal(waveformGeometry(event(2000n,3000n),origin,origin+1000n),null);
});
test('points and invalid raw intervals remain distinguishable',()=>{
  assert.equal(waveformGeometry(event(1n,1n),origin,origin+100n).point,true);
  const g=waveformGeometry(event(3n,1n),origin,origin+100n);assert.equal(g.invalid,true);assert.equal(g.hasEnd,false);
});
test('each CPU stream source and type has a separate stable lane',()=>{
  const lanes=[{key:'4/12/24',cpu:4,stream:12,source:24,types:{21:2,22:2}},{key:'5/13/24',cpu:5,stream:13,source:24,types:{21:2}}];
  assert.deepEqual(waveformLanes(lanes,[21,22]).map(r=>r.key),['4/12/24/21','4/12/24/22','5/13/24/21']);
  assert.deepEqual(waveformLanes(lanes,[22]).map(r=>r.key),['4/12/24/22']);
});
