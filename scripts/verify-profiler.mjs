import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {buildIndex,readRecord,serialize,windowRecords} from '../src/lib/profiler/core.mjs';
const path=process.argv[2],output=process.argv[3];
if(!path)throw new Error('Usage: node scripts/verify-profiler.mjs <raw capture path> [report.json]');
const bytes=await readFile(path),buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
const before=performance.now(),index=buildIndex(buffer);
const report={file:path,sha256:createHash('sha256').update(bytes).digest('hex'),decoder:'observed44byte-littleendian',meta:index.meta,decodeMilliseconds:performance.now()-before,samples:[]};
// Independently use Node Buffer field readers at selected raw positions to compare browser DataView extraction.
for(const row of [0,361149,361629,389739,2428122,index.meta.records-1]){
  if(row>=index.meta.records)continue;
  const r=serialize(index,row,true),offset=row*44;
  assert.equal(r.startTick,bytes.readBigUInt64LE(offset).toString());
  assert.equal(r.endTick,bytes.readBigUInt64LE(offset+8).toString());
  assert.equal(r.payload,bytes.readBigUInt64LE(offset+16).toString());
  assert.equal(r.cpu,bytes.readUInt16LE(offset+40));assert.equal(r.type,bytes.readUInt16LE(offset+42));report.samples.push(r);
}
if(index.meta.records===6027863&&index.meta.bytes===265225972){
  assert.equal(index.meta.selectedRecords,206010);assert.equal(index.meta.reversals,192);assert.equal(index.meta.invalid,0);
  assert.equal(index.origin,28059873933n);assert.equal(index.last,48415316507n);
  assert.deepEqual(index.meta.pairSummary['4/13293701/24'],{entries:290,exits:361,pairs:290,noExactExit:71,duplicateExit:0});
  assert.deepEqual(index.meta.pairSummary['5/13293700/24'],{entries:20139,exits:20174,pairs:20133,noExactExit:35,duplicateExit:6});
  const entry=readRecord(index.view,361629),exit=readRecord(index.view,389739);
  assert.equal(entry.endTick,exit.startTick);assert.equal(entry.endTick-entry.startTick,3395163n);
  const microRows=windowRecords(index,entry.startTick,entry.startTick+1000n,{cpus:[4]});
  assert.ok(microRows.includes(361629));report.captureAssertions='Passed known capture counts, endpoints, microsecond window inclusion and exact duration.';
}
if(output)await writeFile(output,JSON.stringify(report,null,2));
console.log(JSON.stringify({records:index.meta.records,selectedRecords:index.meta.selectedRecords,sha256:report.sha256,pairSummary:index.meta.pairSummary,assertions:report.captureAssertions||'Generic field comparisons passed',milliseconds:report.decodeMilliseconds},null,2));
