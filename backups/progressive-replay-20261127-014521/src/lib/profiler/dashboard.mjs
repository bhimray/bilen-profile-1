import * as d3 from 'd3';
import * as Plot from '@observablehq/plot';
import { RECORD_BYTES, LAYOUT, typeLabel, decimalToTicks, formatTicks, tickFraction, tickAtFraction } from './core.mjs';
import coreSource from './core.mjs?raw';
import workerSource from './decode.worker.mjs?raw';
import { waveformLanes, waveformGeometry } from './waveform.mjs';
import { createFrameQueue } from './frame-queue.mjs';

const $ = id => document.getElementById(id);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const colors = {10:'#a78bfa',11:'#d4b9ff',20:'#95a5be',21:'#52c8ff',22:'#55dfb7',23:'#ff967c'};
const color = code => colors[code] || '#e5bf72';
let worker, requestID = 0, pending = new Map(), meta, fileName = '', rate = 1000000000n;
let cursor = 0n, contextStart = 0n, contextEnd = 1n, lensWidth = 100000n, pageOffset = 0;
let selected = null, contextData, lensData, playing = false, playAnchor = null;
let revision = 0, busy = false, dirty = false, updatingBrush = false, brushAPI, overviewScale;
const renderQueue=createFrameQueue(()=>{void refresh();});
let lastPaint = 0;
let overviewRevision = 0;
const cursorDrafts = new Set();
function status(text, error = false) { $('status').textContent = text; $('status').classList.toggle('error', error); }
function fail(error) { pause(); status(error.message || String(error), true); }
function rpc(action, fields = {}) {
  return new Promise((resolve, reject) => {
    const id = ++requestID; pending.set(id, {resolve, reject}); worker.postMessage({id, action, ...fields});
  });
}
function startWorker() {
  if (worker) worker.terminate();
  for (const promise of pending.values()) promise.reject(new Error('Capture replaced.'));
  pending.clear();
  worker = new Worker(new URL('./decode.worker.mjs', import.meta.url), { type: 'module' });
  worker.onmessage = ({data}) => {
    if (data.action === 'progress') { status(`Decoding raw records… ${Math.round(data.progress * 100)}%`); return; }
    const item = pending.get(data.id); if (!item) return;
    pending.delete(data.id);
    if (data.error) item.reject(new Error(data.error)); else item.resolve(data.result);
  };
  worker.onerror = event => { for (const item of pending.values()) item.reject(new Error(event.message)); pending.clear(); fail(new Error(event.message)); };
}
function filters() {
  const selected = kind => [...document.querySelectorAll(`input[data-filter="${kind}"]:checked`)].map(input => input.value);
  return {cpus:selected('cpu').map(Number), lanes:selected('lane'), types:selected('type').map(Number)};
}
function boundedWindow(center, width) {
  const origin = BigInt(meta.origin), last = BigInt(meta.last);
  width = width < 1n ? 1n : width;
  if (width >= last - origin) return [origin, last > origin ? last : origin + 1n];
  let start = center - width / 2n, end = start + width;
  if (start < origin) { start = origin; end = start + width; }
  if (end > last) { end = last; start = end - width; }
  return [start, end];
}
function clampCursor(tick) { return tick < BigInt(meta.origin) ? BigInt(meta.origin) : tick > BigInt(meta.last) ? BigInt(meta.last) : tick; }
function setCursor(tick, {follow = true} = {}) {
  if (!meta) return;
  cursorDrafts.clear();
  cursor = clampCursor(tick); pageOffset = 0;
  if (follow && $('follow').checked && (cursor < contextStart || cursor > contextEnd))
    [contextStart, contextEnd] = boundedWindow(cursor, contextEnd - contextStart);
  schedule();
}
function schedule() { revision++; dirty = true; renderQueue.request(); }
async function refresh() {
  if (!meta || busy || !dirty) return;
  dirty = false; busy = true;
  const version = revision;
  const [lensStart, lensEnd] = boundedWindow(cursor, lensWidth);
  const frame = { cursor, contextStart, contextEnd, lensStart, lensEnd, rate, filters:filters() };
  try {
    const [context, lens] = await Promise.all([
      rpc('query', {start:String(frame.contextStart),end:String(frame.contextEnd),cursor:String(frame.cursor),filters:frame.filters}),
      rpc('query', {start:String(lensStart),end:String(lensEnd),cursor:String(frame.cursor),filters:frame.filters,offset:pageOffset}),
    ]);
    if (version !== revision) return;
    contextData = context; lensData = lens;
    // Commit the complete frame together; no view displays an older cursor against newer data.
    if (!cursorDrafts.has('cursor-seconds')) $('cursor-seconds').value = formatTicks(cursor - BigInt(meta.origin), rate, 12);
    if (!cursorDrafts.has('cursor-tick')) $('cursor-tick').value = String(cursor);
    $('clock').textContent = `T + ${formatTicks(cursor - BigInt(meta.origin),rate,12)} s | raw ${cursor} | rate ${rate} ticks/s`;
    $('selection-info').textContent = selected ? `Selected file row ${selected.row} · CPU ${selected.cpu} · type ${selected.type}` : 'No selected event';
    if (selected && $('selected-cursor')) {
      const delta = frame.cursor-BigInt(selected.startTick);
      $('selected-cursor').textContent = `Shared cursor ${frame.cursor}; ${delta} ticks relative to this record's start. Selection stays fixed while cursor moves.`;
    }
    drawTimeline('context', context, frame.contextStart, frame.contextEnd, frame, true);
    $('context-note').textContent = context.density
      ? `DENSITY MODE · ${context.total.toLocaleString()} records. Color intensity is count per bin, normalized separately per lane. These are not task durations or CPU load. Narrow the context to see individual events.`
      : `${context.total.toLocaleString()} individual raw records. Blue outline = magnified interval; red line = shared cursor. ${$('timeline-style').value==='waveform'?'Each waveform row has one CPU / stream / source / type. Raised sections show raw record intervals; dashed background is unasserted, not idle.':'Task intervals / interrupts / other types use separate subtracks in each lane.'}`;
    drawTimeline('lens', lens, lensStart, lensEnd, frame, false);
    drawCounts(context); drawDurations(context, frame);
    drawRows(lens); drawActive(lens);
    updateBrush();
    $('render-note').textContent = `Lens ${lensStart} … ${lensEnd} ticks | ${formatTicks(lensEnd-lensStart,rate,12)} s | ${lens.total.toLocaleString()} records. ` +
      (lens.density ? 'DENSITY MODE: counts of interval starts, with continuing intervals placed in first bin. Zoom in for individual marks. Raw rows remain complete.' : 'Individual raw intervals and edges. Minimum visible mark is 1 pixel; inspect numeric duration for subpixel events.');
    lastPaint = performance.now();
  } catch (error) { fail(error); }
  finally { busy = false; if (dirty) renderQueue.request(0); }
}
function metrics() {
  $('integrity').innerHTML = [
    [meta.records.toLocaleString(), 'raw records / full file'], [meta.selectedRecords.toLocaleString(), 'CPU 4 + CPU 5 records'],
    [meta.reversals, 'start-tick reversals in file order'], [meta.invalid, 'records with end < start'],
    [meta.headers.join(', '), 'raw header word values'],
  ].map(([value,label])=>`<div class="metric"><strong>${escape(value)}</strong>${label}</div>`).join('') +
  `<p>SHA-256<br><code style="overflow-wrap:anywhere">${meta.sha256 || 'Unavailable in this browser'}</code></p>` +
  '<p>Other CPUs remain accessible by raw row. Timelines index CPU 4 and CPU 5 only.</p>' +
  Object.entries(meta.pairSummary).map(([key,s])=>`<div class="pair-audit">CPU / stream / source ${key}<br>${s.entries} entries · ${s.exits} exits<br>${s.pairs} unique exact pairs<br>${s.noExactExit} exits without exact endpoint<br>${s.duplicateExit} exits with duplicate endpoint</div>`).join('');
}
function buildFilters() {
  const check = (kind,value,label) => `<label class="filter-check"><input type="checkbox" data-filter="${kind}" value="${escape(value)}" checked />${escape(label)}</label>`;
  const types = [...new Set(meta.lanes.flatMap(lane=>Object.keys(lane.types).map(Number)))].sort((a,b)=>a-b);
  $('filters').innerHTML = `<fieldset><legend>CPU</legend>${[4,5].map(cpu=>check('cpu',cpu,`CPU ${cpu} · ${cpu===4?'controller':'plant'}`)).join('')}</fieldset>` +
    `<fieldset><legend>Source / stream</legend>${meta.lanes.map(lane=>check('lane',lane.key,`CPU ${lane.cpu} · ${lane.label} · stream ${lane.stream}`)).join('')}</fieldset>`+
    `<fieldset><legend>Event type</legend>${types.map(code=>check('type',code,`${code} · ${typeLabel(code)}`)).join('')}</fieldset>`;
  $('type-legend').innerHTML = types.map(code=>`<span><i style="background:${color(code)}"></i>${code} ${escape(typeLabel(code))}</span>`).join('');
  $('filters').onchange = () => { pause(); pageOffset = 0; drawOverview().catch(fail); schedule(); };
}
async function load(file, synthetic = false) {
  renderQueue.cancel();
  pause(); meta = null; revision++; selected = null; busy = false; dirty = false; cursorDrafts.clear();
  $('filename').textContent = file.name; fileName = file.name;
  $('details').innerHTML = '<p>Select a mark or raw table row.</p>';
  status(`Reading ${file.size.toLocaleString()} bytes locally…`); startWorker();
  try {
    meta = await rpc('load', {file});
    cursor = BigInt(meta.origin); contextStart = cursor; contextEnd = BigInt(meta.last);
    if (contextEnd <= contextStart) contextEnd = contextStart + 1n;
    pageOffset = 0; metrics(); buildFilters();
    for (const id of ['play','previous','next','reset','export']) $(id).disabled = false;
    await drawOverview(); schedule();
    status(`${synthetic?'SYNTHETIC DEMO · ':''}${file.name} · ${meta.records.toLocaleString()} records decoded as ${RECORD_BYTES}-byte little-endian records. Raw data stays in this browser.`);
  } catch (error) { fail(error); }
}
async function drawOverview() {
  if (!meta) return;
  const version = ++overviewRevision;
  const snapshot = meta, data = await rpc('overview',{filters:filters()});
  if (snapshot !== meta || version !== overviewRevision) return;
  const root = $('overview'); root.replaceChildren();
  const width = root.clientWidth || 800, left = 58, right = width-18;
  overviewScale = d3.scaleLinear().domain([0, Number(BigInt(meta.last)-BigInt(meta.origin))]).range([left,right]);
  const svg = d3.select(root).append('svg').attr('viewBox',`0 0 ${width} 126`).attr('role','img').attr('aria-label','CPU record density overview with adjustable context window');
  for (const [cpu,baseline,fill] of [[4,48,'#52c8ff'],[5,92,'#55dfb7']]) {
    const counts = data.counts[cpu], max = d3.max(counts)||1;
    svg.append('text').attr('x',0).attr('y',baseline-12).attr('fill','#a8bdd4').attr('font-size',12).text(`CPU ${cpu}`);
    counts.forEach((count,i)=>{if(count) svg.append('rect').attr('x',left+(right-left)*i/data.bins).attr('y',baseline-32*count/max).attr('width',Math.max(.5,(right-left)/data.bins)).attr('height',32*count/max).attr('fill',fill).attr('opacity',.8);});
  }
  const seconds = Number(rate);
  svg.append('g').attr('transform','translate(0,100)').call(d3.axisBottom(overviewScale).ticks(6).tickFormat(tick=>`${(tick/seconds).toFixed(3)} s`));
  brushAPI = d3.brushX().extent([[left,5],[right,94]]).on('brush end', event=>{
    if (updatingBrush || !event.sourceEvent || !event.selection) return;
    pause();
    const origin = BigInt(meta.origin), span = BigInt(meta.last)-origin;
    contextStart = origin + BigInt(Math.round(overviewScale.invert(event.selection[0])));
    contextEnd = origin + BigInt(Math.round(overviewScale.invert(event.selection[1])));
    if (contextEnd <= contextStart) contextEnd = contextStart+1n;
    cursor = clampCursor(contextStart+(contextEnd-contextStart)/2n); pageOffset=0;
    $('context-width').value='full'; schedule();
  });
  svg.append('g').attr('class','brush').call(brushAPI); updateBrush();
}
function updateBrush() {
  if (!brushAPI || !overviewScale || !meta) return;
  updatingBrush=true;
  d3.select('#overview .brush').call(brushAPI.move,[overviewScale(Number(contextStart-BigInt(meta.origin))),overviewScale(Number(contextEnd-BigInt(meta.origin)))]);
  updatingBrush=false;
}
function visibleLanes(frame) { return meta.lanes.filter(lane=>frame.filters.cpus.includes(lane.cpu)&&frame.filters.lanes.includes(lane.key)); }
function drawTimeline(id,data,start,end,frame,isContext) {
  const root=$(id),savedScrollTop=root.scrollTop; root.replaceChildren();
  const waveform=$('timeline-style').value==='waveform'&&!data.density;
  root.classList.toggle('waveform-view',waveform);
  const width=Math.max(380,root.clientWidth), labelWidth=Math.min(245,width*.34), right=width-16;
  const sources=visibleLanes(frame);
  const lanes=waveform?waveformLanes(sources,frame.filters.types):sources;
  const eventKey=e=>waveform?`${e.lane}/${e.type}`:e.lane;
  const rowHeight=waveform?66:54, top=12, height=Math.max(84,lanes.length*rowHeight+top);
  const canvas=document.createElement('canvas'); canvas.width=width*devicePixelRatio;canvas.height=height*devicePixelRatio;
  canvas.style.height=`${height}px`;root.append(canvas);
  const ctx=canvas.getContext('2d');ctx.scale(devicePixelRatio,devicePixelRatio);
  const x=tick=>labelWidth+tickFraction(tick,start,end)*(right-labelWidth);
  const laneIndex=new Map(lanes.map((lane,i)=>[lane.key,i]));
  ctx.font='11px "IBM Plex Mono",monospace';
  lanes.forEach((lane,i)=>{
    const y=top+i*rowHeight;
    ctx.fillStyle=lane.cpu===4?'#14283b':'#122e34';ctx.fillRect(0,y,width,rowHeight-4);
    ctx.fillStyle=lane.cpu===4?'#76ccff':'#68e3bd';ctx.fillText(`CPU ${lane.cpu} / source ${lane.source}`,8,y+17);
    ctx.fillStyle='#a0b4ca';ctx.font='10px system-ui';
    ctx.fillText(`${lane.label.includes('controller')?'Controller':lane.label.includes('plant')?'Plant':'Unmapped'} · stream ${lane.stream}`,8,y+34);ctx.font='11px monospace';
    if(waveform){ctx.fillStyle=color(lane.type);ctx.fillText(`${lane.type} ${lane.typeLabel}`,8,y+51);}
  });
  ctx.save();ctx.beginPath();ctx.rect(labelWidth,0,right-labelWidth,height);ctx.clip();
  for(let i=0;i<=8;i++){ctx.strokeStyle='#314358';ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(labelWidth+(right-labelWidth)*i/8,0);ctx.lineTo(labelWidth+(right-labelWidth)*i/8,height);ctx.stroke();}ctx.globalAlpha=1;
  if(waveform){
    for(let i=0;i<lanes.length;i++){
      ctx.strokeStyle='#63758a';ctx.globalAlpha=.5;ctx.setLineDash([3,5]);ctx.beginPath();
      ctx.moveTo(labelWidth,top+i*rowHeight+45);ctx.lineTo(right,top+i*rowHeight+45);ctx.stroke();
    }ctx.setLineDash([]);ctx.globalAlpha=1;
  }
  if(data.density){
    for(const lane of data.density.lanes){
      const li=laneIndex.get(lane.key);if(li===undefined)continue;
      const max=d3.max(lane.counts)||1;
      lane.counts.forEach((count,i)=>{if(!count)return;ctx.fillStyle=`rgba(83,193,247,${.18+.82*count/max})`;ctx.fillRect(labelWidth+i*(right-labelWidth)/data.density.bins,top+li*rowHeight+6,Math.max(.7,(right-labelWidth)/data.density.bins),32);});
    }
  }else{
    for(const event of data.events){
      const li=laneIndex.get(eventKey(event));if(li===undefined)continue;
      if(waveform){
        const geometry=waveformGeometry(event,start,end);if(!geometry)continue;
        const px=labelWidth+geometry.left*(right-labelWidth),pxEnd=labelWidth+geometry.right*(right-labelWidth);
        const y=top+li*rowHeight,high=y+16,low=y+45;
        const active=geometry.rawStart===geometry.rawEnd ? frame.cursor===geometry.rawStart
          : geometry.rawStart<=frame.cursor&&frame.cursor<geometry.rawEnd;
        ctx.strokeStyle=selected?.row===event.row?'#fff':color(event.type);ctx.lineWidth=active?2.5:1.5;
        ctx.fillStyle=color(event.type);ctx.globalAlpha=active ? .3 : .12;
        ctx.fillRect(px,high,Math.max(1,pxEnd-px),low-high);ctx.globalAlpha=1;
        ctx.beginPath();
        if(geometry.hasStart){ctx.moveTo(px,low);ctx.lineTo(px,high);}else ctx.moveTo(px,high);
        ctx.lineTo(pxEnd,high);if(geometry.hasEnd)ctx.lineTo(pxEnd,low);ctx.stroke();
        // Raw start/end edge markers. Subpixel widths do not change the raw duration.
        if(geometry.hasStart){ctx.beginPath();ctx.moveTo(px,high-5);ctx.lineTo(px-3,high-10);ctx.lineTo(px+3,high-10);ctx.closePath();ctx.fill();}
        if(geometry.hasEnd){ctx.beginPath();ctx.moveTo(pxEnd,low+5);ctx.lineTo(pxEnd-3,low+10);ctx.lineTo(pxEnd+3,low+10);ctx.closePath();ctx.fill();}
        if(pxEnd-px>80){
          const text=`row ${event.row} · ${event.type} · p=${event.payload}`;
          ctx.save();ctx.beginPath();ctx.rect(px+4,high,Math.max(0,pxEnd-px-8),low-high);ctx.clip();
          ctx.fillStyle='#e4effb';ctx.font='11px monospace';ctx.fillText(text,px+6,high+19);ctx.restore();
        }
        if(geometry.invalid){ctx.fillStyle='#ff7b6b';ctx.fillText('×',px,high-2);}
        continue;
      }
      const a=BigInt(event.startTick),b=BigInt(event.endTick),px=x(a<start?start:a),pxEnd=x(b>end?end:b);
      // Event subtracks separate task intervals, interrupts, and other event types.
      const sub=event.type===21||event.type===22?0:event.type===10||event.type===11?1:2;
      const y=top+li*rowHeight+8+sub*12;
      ctx.fillStyle=color(event.type);ctx.globalAlpha=event.type===22||event.type===11?1:.82;
      if(event.type===21||event.type===10){ctx.fillRect(px,y,Math.max(1,pxEnd-px),7);}
      else {ctx.fillRect(px,y-1,Math.max(1,pxEnd-px),8);}
      if(selected?.row===event.row){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(px-2,y-3,Math.max(4,pxEnd-px+4),12);}
    }ctx.globalAlpha=1;
  }
  if(isContext){
    const a=x(frame.lensStart),b=x(frame.lensEnd);
    ctx.fillStyle='#99d9ff12';ctx.fillRect(a,1,Math.max(2,b-a),height-2);
    ctx.strokeStyle='#92d9ff';ctx.lineWidth=1.5;ctx.strokeRect(a,1,Math.max(2,b-a),height-2);
  }
  const cursorX=x(frame.cursor);ctx.strokeStyle='#ff8c77';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(cursorX,0);ctx.lineTo(cursorX,height);ctx.stroke();ctx.restore();
  const duration=end-start,unit=duration<=rate/100n?{factor:1000000,name:'µs'}:{factor:1000,name:'ms'};
  const scale=d3.scaleLinear().domain([0,Number(duration)*unit.factor/Number(rate)]).range([labelWidth,right]);
  const svg=d3.select(root).append('svg').attr('viewBox',`0 0 ${width} 34`);
  svg.append('g').call(d3.axisBottom(scale).ticks(5).tickFormat(t=>`${d3.format('.8~g')(t)} ${unit.name}`));
  svg.append('text').attr('x',8).attr('y',19).attr('fill','#8eabc6').attr('font-size',10).text(`from tick ${start}`);
  root.scrollTop=savedScrollTop;
  canvas.onclick=event=>{
    pause();const rect=canvas.getBoundingClientRect(),px=(event.clientX-rect.left)*width/rect.width,py=(event.clientY-rect.top)*height/rect.height;
    if(px<labelWidth)return;
    const tick=tickAtFraction((px-labelWidth)/(right-labelWidth),start,end),li=Math.floor((py-top)/rowHeight);
    const candidates=data.events.filter(e=>laneIndex.get(eventKey(e))===li && x(BigInt(e.startTick))<=px+5&&x(BigInt(e.endTick))>=px-5);
    if(candidates.length){
      candidates.sort((a,b)=>Math.min(Math.abs(x(BigInt(a.startTick))-px),Math.abs(x(BigInt(a.endTick))-px))-Math.min(Math.abs(x(BigInt(b.startTick))-px),Math.abs(x(BigInt(b.endTick))-px))||a.row-b.row);
      inspect(candidates[0].row,{seek:false}).catch(fail);
      setCursor(tick);
    }else setCursor(tick);
  };
  canvas.onwheel=event=>{
    if(waveform&&!event.ctrlKey&&!event.metaKey)return;
    event.preventDefault();pause();const factor=event.deltaY>0?2:0.5;
    let widthTicks=BigInt(Math.max(1,Math.round(Number(end-start)*factor)));
    if(isContext){[contextStart,contextEnd]=boundedWindow(frame.cursor,widthTicks);$('context-width').value='full';}
    else {lensWidth=widthTicks;$('lens-width').selectedIndex=-1;pageOffset=0;}
    schedule();
  };
  canvas.title=`${data.total} records. ${data.density?'Density overview; zoom to see raw edges.':'Click a mark for exact raw values. Overlapping marks can be selected separately in the raw table.'}`;
}
function plotStyle(width,height){return {width:Math.max(250,width),height,style:{background:'transparent',color:'#a9bed4',fontSize:'11px'},marginLeft:55,marginRight:20};}
function drawCounts(data){
  const target=$('counts'),rows=[];
  for(const item of data.summaries){
    const key=`CPU ${item.cpu} · ${item.type} ${typeLabel(item.type)}`;
    const found=rows.find(row=>row.label===key);
    if(found)found.count+=item.count;else rows.push({label:key,count:item.count,cpu:item.cpu});
  }
  target.replaceChildren();
  if(!rows.length){target.textContent='No records selected.';return;}
  target.append(Plot.plot({...plotStyle(target.clientWidth,Math.max(220,rows.length*28)),marginLeft:165,x:{label:'Records',grid:true},y:{label:null},color:{domain:[4,5],range:['#52c8ff','#55dfb7']},marks:[Plot.barX(rows,{x:'count',y:'label',fill:'cpu',tip:true}),Plot.ruleX([0])]}));
}
function drawDurations(data,frame){
  const target=$('durations');target.replaceChildren();
  if(data.density){target.textContent='Context is in density mode. Narrow the context window to display individual task intervals.';return;}
  const events=data.events.filter(e=>e.type===21&&e.durationTicks!==null).map(e=>({...e,x:Number(BigInt(e.startTick)-frame.contextStart)/Number(frame.rate),y:Number(BigInt(e.durationTicks))*1e6/Number(frame.rate)}));
  const plot=Plot.plot({...plotStyle(target.clientWidth,220),x:{domain:[0,Number(frame.contextEnd-frame.contextStart)/Number(frame.rate)],label:'Seconds from context start',grid:true},y:{label:'Elapsed µs',grid:true},color:{domain:[4,5],range:['#52c8ff','#55dfb7']},marks:[Plot.dot(events,{x:'x',y:'y',fill:'cpu',r:3,tip:true,title:e=>`Raw row ${e.row}\nCPU ${e.cpu}\n${e.startTick} … ${e.endTick}\n${e.y} µs`}),Plot.ruleX([Number(frame.cursor-frame.contextStart)/Number(frame.rate)],{stroke:'#ff8c77'})]});
  target.append(plot);
  plot.onclick=event=>{pause();const rect=plot.getBoundingClientRect();const fraction=(event.clientX-rect.left-55)/(rect.width-75);setCursor(tickAtFraction(fraction,frame.contextStart,frame.contextEnd));};
}
function elapsed(event){return event.durationTicks===null?'Invalid':formatTicks(BigInt(event.durationTicks)*1000000n,rate,6);}
function drawRows(data){
  $('raw-rows').innerHTML=data.page.map(e=>`<tr data-row="${e.row}" class="${selected?.row===e.row?'selected':''}" tabindex="0"><td>${e.row}</td><td>${e.cpu} / ${e.stream} / ${e.source}</td><td>${e.type} ${escape(e.typeLabel)}</td><td>${e.startTick}</td><td>${e.endTick}</td><td>${elapsed(e)}</td><td>${escape(e.pairing.reason)}</td></tr>`).join('');
  $('page-info').textContent=`${data.total?data.offset+1:0}–${Math.min(data.offset+100,data.total)} of ${data.total.toLocaleString()} raw records in lens. Payload and full bytes available by selecting a row.`;
  $('page-back').disabled=data.offset===0;$('page-next').disabled=data.offset+100>=data.total;
  for(const row of $('raw-rows').children){row.onclick=()=>inspect(Number(row.dataset.row)).catch(fail);row.onkeydown=event=>{if(event.key==='Enter')row.click();};}
}
function drawActive(data){
  $('active').innerHTML=data.active.length?data.active.map(e=>`<button class="chip" data-row="${e.row}">CPU ${e.cpu} · source ${e.source} · ${escape(e.typeLabel)} · row ${e.row}</button>`).join(''):'No retained CPU 4/5 record contains this exact tick under the selected filters. This does not prove either CPU is idle.';
  if(data.activeTotal>100)$('active').append(` Showing first 100 of ${data.activeTotal}; narrow filters for the remainder.`);
  $('active').querySelectorAll('button').forEach(button=>button.onclick=()=>inspect(Number(button.dataset.row)).catch(fail));
}
async function inspect(row,{seek=false}={}){
  pause();const event=await rpc('record',{row});selected=event;
  $('row-number').value=String(row);
  const fields={ 'Raw file row (1-based)':event.row,'Byte offset (0-based)':event.byteOffset,'Start tick · u64':event.startTick,'End tick · u64':event.endTick,
    'Elapsed ticks · end − start':event.durationTicks??'Invalid: end < start','Elapsed µs · converted':elapsed(event),'Payload · u64':event.payload,
    'Payload · hexadecimal':`0x${BigInt(event.payload).toString(16)}`,'Sequence · u32':event.sequence,'Header word · u32':event.headerWord,
    'Stream · u32':event.stream,'Source · u16':`${event.source} · ${event.sourceLabel}`,'User · u16':event.user,'CPU · u16':event.cpu,
    'Type · u16':`${event.type} · ${event.typeLabel}`,'Task pairing rule result':event.pairing.reason,'Counterpart file row':event.pairing.counterpart??'None under the exact endpoint rule'};
  $('details').innerHTML=`<p id="selected-cursor"></p><dl>${Object.entries(fields).map(([key,value])=>`<dt>${escape(key)}</dt><dd>${escape(value)}</dd>`).join('')}</dl><div class="detail-actions"><button id="goto-start">Seek start</button><button id="goto-end">Seek end</button><button id="focus-event">Fit event</button>${event.pairing.counterpart?'<button id="goto-pair">Inspect counterpart</button>':''}</div><h3>44 original bytes</h3><pre>${event.rawHex}</pre><p>TaskEntry interval is drawn directly from its own start/end. An exit without a unique matching endpoint is a decoder pairing result; it does not prove a real task exit occurred without entry.</p>`;
  $('goto-start').onclick=()=>setCursor(BigInt(event.startTick));$('goto-end').onclick=()=>setCursor(BigInt(event.endTick));
  $('focus-event').onclick=()=>{lensWidth=BigInt(event.durationTicks||'0')*12n/10n;if(lensWidth<100n)lensWidth=100n;$('lens-width').selectedIndex=-1;setCursor((BigInt(event.startTick)+BigInt(event.endTick))/2n);};
  if(event.pairing.counterpart)$('goto-pair').onclick=()=>inspect(event.pairing.counterpart).catch(fail);
  if(seek)setCursor(BigInt(event.startTick));else schedule();
}
function pause(){playing=false;playAnchor=null;$('play').textContent='Play';}
function animate(now){
  if(!playing)return;
  if(!playAnchor)playAnchor={now,tick:cursor};
  // Playback scheduling uses the wall clock only to move the raw-tick cursor; it never changes event times.
  const elapsedMilliseconds=now-playAnchor.now,speed=Number($('speed').value);
  const delta=BigInt(Math.round(elapsedMilliseconds*Number(rate)*speed/1000));
  if(!busy&&!dirty&&!renderQueue.pending&&now-lastPaint>=80){setCursor(playAnchor.tick+delta);if(cursor>=BigInt(meta.last)){pause();return;}}
  requestAnimationFrame(animate);
}
function bind(id,event,handler){$(id).addEventListener(event,async e=>{try{await handler(e);}catch(error){fail(error);}});}
for (const [id,button] of [['cursor-seconds','seek-seconds'],['cursor-tick','seek-tick']]) {
  bind(id,'focus',()=>{pause();cursorDrafts.add(id);});
  bind(id,'input',()=>{pause();cursorDrafts.add(id);});
  bind(id,'keydown',event=>{if(event.key==='Enter')$(button).click();});
}
bind('capture','change',e=>{const file=e.target.files?.[0];if(file)return load(file);});
bind('play','click',()=>{if(!meta)return;if(playing)pause();else{if(cursor>=BigInt(meta.last))cursor=BigInt(meta.origin);playing=true;playAnchor=null;$('play').textContent='Pause';requestAnimationFrame(animate);}});
bind('speed','change',()=>{playAnchor=null;});
for(const [id,direction]of[['previous',-1],['next',1]])bind(id,'click',async()=>{if(!meta)return;pause();setCursor(BigInt(await rpc('step',{cursor:String(cursor),direction,filters:filters()})));});
bind('seek-seconds','click',()=>{if(!meta)return;pause();setCursor(BigInt(meta.origin)+decimalToTicks($('cursor-seconds').value,rate));});
bind('seek-tick','click',()=>{if(!meta)return;pause();if(!/^\d+$/.test($('cursor-tick').value.trim()))throw new Error('Raw tick must be an unsigned integer.');setCursor(BigInt($('cursor-tick').value));});
for(const [id,direction]of[['minus-tick',-1n],['plus-tick',1n]])bind(id,'click',()=>{if(!meta)return;pause();const step=BigInt($('step-ticks').value);if(step<1n)throw new Error('Step must be at least 1 tick.');setCursor(cursor+direction*step);});
bind('context-width','change',()=>{if(!meta)return;pause();[contextStart,contextEnd]=$('context-width').value==='full'?[BigInt(meta.origin),BigInt(meta.last)]:boundedWindow(cursor,decimalToTicks($('context-width').value,rate));schedule();});
bind('lens-width','change',()=>{if(!meta)return;pause();lensWidth=decimalToTicks($('lens-width').value,rate);pageOffset=0;schedule();});
bind('timeline-style','change',()=>{pause();if(meta)schedule();});
bind('reset','click',()=>{pause();contextStart=BigInt(meta.origin);contextEnd=BigInt(meta.last);$('context-width').value='full';schedule();});
bind('apply-rate','click',()=>{pause();const value=BigInt($('tick-rate').value);if(value<=0n||value>1000000000000n)throw new Error('Tick rate must be 1 … 10^12 ticks per second.');rate=value;if(meta){awaitOverview();schedule();if(selected)inspect(selected.row).catch(fail);}});
function awaitOverview(){drawOverview().catch(fail);}
bind('clear-filters','click',()=>{document.querySelectorAll('[data-filter]').forEach(input=>input.checked=true);if(meta){drawOverview().catch(fail);schedule();}});
bind('page-back','click',()=>{pageOffset=Math.max(0,pageOffset-100);schedule();});bind('page-next','click',()=>{pageOffset+=100;schedule();});
bind('row-form','submit',e=>{e.preventDefault();if(meta)return inspect(Number($('row-number').value),{seek:true});});
function download(text,name,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
bind('export','click',async()=>{
  if(!meta)return;pause();const [start,end]=boundedWindow(cursor,lensWidth),selection=filters(),exportCursor=cursor,exportRate=rate;
  const identity={fileName,bytes:meta.bytes,sha256:meta.sha256};
  const csv=await rpc('export',{start:String(start),end:String(end),filters:selection});
  download(csv,`${fileName}_ticks_${start}_${end}.csv`,'text/csv');
  download(JSON.stringify({...identity,recordBytes:RECORD_BYTES,layout:'observed, little endian; not vendor-certified',tickRate:String(exportRate),tickRateStatus:'user-selected; default inferred 1e9',originTick:meta.origin,cursorTick:String(exportCursor),windowStart:String(start),windowEnd:String(end),filters:selection,windowRule:'closed overlap; cursor-active uses half-open intervals',pairingRule:'unique TaskEntry.endTick == TaskExit.startTick within CPU/stream/source; duplicates rejected',smoothing:false,resampling:false,matAlignment:false},null,2),`${fileName}_selection.json`,'application/json');
});
bind('demo','click',()=>{
  const records=[],origin=9007199254740993000n;
  for(let i=0;i<400;i++){
    const cpu=i%2?4:5,start=origin+BigInt(i)*100000n,end=start+(cpu===4?35000n:8000n);
    records.push({start,end,cpu,source:24,type:21},{start:end,end:end+1n,cpu,source:24,type:22});
    if(i%7===0)records.push({start:start+2000n,end:start+2200n,cpu,source:1,type:10},{start:start+2200n,end:start+2201n,cpu,source:1,type:11});
    if(i%13===0)records.push({start:start+1000n,end:start+1001n,cpu,source:17,type:106});
  }
  const buffer=new ArrayBuffer(records.length*RECORD_BYTES),view=new DataView(buffer);
  records.forEach((r,i)=>{const offset=i*RECORD_BYTES;view.setBigUint64(offset,r.start,true);view.setBigUint64(offset+8,r.end,true);view.setBigUint64(offset+16,BigInt(i),true);view.setUint32(offset+24,i,true);view.setUint32(offset+28,1042676,true);view.setUint32(offset+32,r.cpu===4?13293701:13293700,true);view.setUint16(offset+36,r.source,true);view.setUint16(offset+40,r.cpu,true);view.setUint16(offset+42,r.type,true);});
  return load(new File([buffer],'SYNTHETIC_precision_demo.bin'),true);
});
let resizeTimer;new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(meta){drawOverview().catch(fail);schedule();}},200);}).observe($('context'));
$('methods').innerHTML=`<h3>Observed binary layout</h3><pre>${escape(LAYOUT.map(([name,offset,type])=>`${String(offset).padStart(2)}  ${type.padEnd(3)}  ${name}`).join('\n'))}</pre><h3>Exact extraction and processing code</h3><p>The following is the actual decoder module bundled into this page.</p><pre>${escape(coreSource)}</pre><h3>Worker queries, density bins and export</h3><pre>${escape(workerSource)}</pre><h3>What is derived</h3><ul><li>Elapsed ticks = endTick − startTick. Negative intervals are flagged.</li><li>Seconds = ticks / ticksPerSecond; relative seconds = (tick − earliest CPU4/5 start tick) / ticksPerSecond. All subtraction and matching use BigInt.</li><li>Pixel positions convert a local tick difference to Number. Mouse locations round to the nearest tick; pixel selection does not establish subpixel precision. Use exact tick entry and single-tick stepping to inspect finer times.</li><li>Dense windows (&gt;18,000 records) display start-count bins, explicitly labeled. No records are discarded from paged tables or CSV exports. A continuing interval is counted in the first density bin.</li><li>Source 24 task labels and event types 10/11/21/22 follow your native profiler screenshot. Code 20 registration mapping and code 23 overrun mapping remain provisional. Other source/type values stay unmapped.</li><li>Exact endpoint pairing is a decoder hypothesis, not a reconstruction of all scheduler states. No CPU utilization, verified idle time, or CPU-only execution time is inferred.</li><li>Playback advances the shared cursor from elapsed browser time and chosen speed, rounded to raw ticks. The trace timestamps are never altered. Every view commits one cursor frame together.</li></ul>`;
