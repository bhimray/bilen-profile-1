import test from 'node:test';
import assert from 'node:assert/strict';
import {createFrameQueue} from '../src/lib/profiler/frame-queue.mjs';

function clock(){
  let now=0,next=0;const jobs=new Map();
  return {setTimer(fn,delay){const id=next++;jobs.set(id,{at:now+delay,fn});return id;},
    clearTimer(id){jobs.delete(id);},advance(time){
      while(true){const item=[...jobs].filter(([,job])=>job.at<=time).sort((a,b)=>a[1].at-b[1].at)[0];
        if(!item)break;const [id,job]=item;jobs.delete(id);now=job.at;job.fn();}now=time;
    },get now(){return now;},get size(){return jobs.size;}};
}
test('60 Hz playback requests cannot postpone a pending 30 ms refresh',()=>{
  const time=clock(),paints=[],queue=createFrameQueue(()=>paints.push(time.now),time);
  for(let ms=0;ms<=160;ms+=16){time.advance(ms);queue.request();}
  time.advance(200);
  assert.deepEqual(paints,[30,62,94,126,158,190]);
});
test('one queued callback coalesces repeated requests without losing next frame',()=>{
  const time=clock();let paints=0;const queue=createFrameQueue(()=>paints++,time);
  queue.request();queue.request();queue.request(0);assert.equal(time.size,1);
  time.advance(30);assert.equal(paints,1);assert.equal(queue.pending,false);
  queue.request(0);time.advance(30);assert.equal(paints,2);
});
test('cancel accepts timer ID zero and cancels work when replacing capture',()=>{
  const time=clock();let paints=0;const queue=createFrameQueue(()=>paints++,time);
  queue.request();assert.equal(queue.pending,true);queue.cancel();
  time.advance(100);assert.equal(paints,0);assert.equal(queue.pending,false);
});
