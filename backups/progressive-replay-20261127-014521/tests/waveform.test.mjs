import test from 'node:test';
import assert from 'node:assert/strict';
import {waveformLanes,waveformGeometry} from '../src/lib/profiler/waveform.mjs';
const origin=9007199254740993000n;
const event=(a,b)=>({startTick:String(origin+a),endTick:String(origin+b)});
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
