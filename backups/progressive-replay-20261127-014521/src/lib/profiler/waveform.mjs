import { tickFraction, typeLabel } from './core.mjs';

/** One stable waveform per CPU / stream / source / type; never collapse raw duplicates. */
export function waveformLanes(lanes, types) {
  return lanes.flatMap(lane => Object.keys(lane.types).map(Number).sort((a,b)=>a-b)
    .filter(type=>types.includes(type)).map(type=>({...lane,
      key:`${lane.key}/${type}`, parentKey:lane.key, type, typeLabel:typeLabel(type)})));
}

/** Clip only drawing geometry, with exact BigInt boundaries. No scheduler state is inferred. */
export function waveformGeometry(event, start, end) {
  const a=BigInt(event.startTick), b=BigInt(event.endTick);
  const invalid=b<a, extent=invalid?a:b;
  if(a>end||extent<start)return null;
  const clippedStart=a<start?start:a, clippedEnd=extent>end?end:extent;
  return {left:tickFraction(clippedStart,start,end),right:tickFraction(clippedEnd,start,end),
    hasStart:a>=start&&a<=end,hasEnd:!invalid&&b>=start&&b<=end,
    point:a===extent,invalid,rawStart:a,rawEnd:b};
}
