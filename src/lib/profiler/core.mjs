/** Observed SCALEXIO capture layout. This is not a vendor-certified decoder. */
export const RECORD_BYTES = 44;
export const LAYOUT = [
  ['startTick', 0, 'u64'], ['endTick', 8, 'u64'], ['payload', 16, 'u64'],
  ['sequence', 24, 'u32'], ['headerWord', 28, 'u32'], ['stream', 32, 'u32'],
  ['source', 36, 'u16'], ['user', 38, 'u16'], ['cpu', 40, 'u16'], ['type', 42, 'u16'],
];
export const TYPE_LABELS = {
  10: 'InterruptEntry', 11: 'InterruptExit', 20: 'Task Registration (provisional code)',
  21: 'TaskEntry', 22: 'TaskExit', 23: 'Overrun (provisional)',
};
export function typeLabel(code) { return TYPE_LABELS[code] || `Unknown type ${code}`; }
export function sourceLabel(cpu, source, stream) {
  if (source === 24 && cpu === 4 && stream === 13293701) return 'Periodic Task 2 · controller';
  if (source === 24 && cpu === 5 && stream === 13293700) return 'Periodic Task 1 · plant';
  return `Source ${source} · unmapped`;
}
export function laneKey(r) { return `${r.cpu}/${r.stream}/${r.source}`; }
export function readRecord(view, row) {
  const base = row * RECORD_BYTES;
  const record = { row: row + 1, byteOffset: base };
  for (const [name, offset, kind] of LAYOUT) {
    record[name] = kind === 'u64' ? view.getBigUint64(base + offset, true)
      : kind === 'u32' ? view.getUint32(base + offset, true) : view.getUint16(base + offset, true);
  }
  return record;
}
export function buildIndex(buffer, progress = () => {}) {
  if (buffer.byteLength === 0 || buffer.byteLength % RECORD_BYTES !== 0)
    throw new Error(`File size must be a nonzero multiple of ${RECORD_BYTES} bytes. No bytes were skipped.`);
  const view = new DataView(buffer), count = buffer.byteLength / RECORD_BYTES;
  const rows = [], lanes = new Map(), cpuCounts = {}, typeCounts = {}, headers = new Set();
  let origin = null, last = null, previous = null, reversals = 0, invalid = 0;
  for (let row = 0; row < count; row++) {
    const base = row * RECORD_BYTES, cpu = view.getUint16(base + 40, true);
    const a = view.getBigUint64(base, true), b = view.getBigUint64(base + 8, true);
    const code = view.getUint16(base + 42, true);
    cpuCounts[cpu] = (cpuCounts[cpu] || 0) + 1;
    typeCounts[code] = (typeCounts[code] || 0) + 1;
    headers.add(view.getUint32(base + 28, true));
    if (previous !== null && a < previous) reversals++;
    previous = a;
    if (b < a) invalid++;
    if (cpu !== 4 && cpu !== 5) continue;
    const record = readRecord(view, row), key = laneKey(record);
    let lane = lanes.get(key);
    if (!lane) {
      lane = { key, cpu, stream: record.stream, source: record.source,
        label: sourceLabel(cpu, record.source, record.stream), count: 0, types: {} };
      lanes.set(key, lane);
    }
    lane.count++; lane.types[code] = (lane.types[code] || 0) + 1;
    rows.push(row);
    if (origin === null || a < origin) origin = a;
    const extent = b > a ? b : a;
    if (last === null || extent > last) last = extent;
    if (row % 262144 === 0) progress(row / count);
  }
  if (origin === null) throw new Error('No CPU 4 or CPU 5 records found in the observed layout.');
  // Raw file order is preserved by row IDs; only this separate search index is sorted.
  rows.sort((i, j) => {
    const a = view.getBigUint64(i * RECORD_BYTES, true), b = view.getBigUint64(j * RECORD_BYTES, true);
    return a < b ? -1 : a > b ? 1 : i - j;
  });
  const sorted = Uint32Array.from(rows), prefixEnd = new BigUint64Array(rows.length);
  let maximum = 0n;
  rows.forEach((row, i) => {
    const a = view.getBigUint64(row * RECORD_BYTES, true), b = view.getBigUint64(row * RECORD_BYTES + 8, true);
    if (a > maximum) maximum = a;
    if (b > maximum) maximum = b;
    prefixEnd[i] = maximum;
  });
  const pairing = new Map(), groups = new Map();
  for (const row of rows) {
    const r = readRecord(view, row);
    if (r.type !== 21 && r.type !== 22) continue;
    const key = `${laneKey(r)}/${r.type === 21 ? r.endTick : r.startTick}`;
    let group = groups.get(key);
    if (!group) { group = { entries: [], exits: [] }; groups.set(key, group); }
    group[r.type === 21 ? 'entries' : 'exits'].push(row);
  }
  const pairSummary = {};
  for (const group of groups.values()) {
    const duplicate = group.entries.length > 1 || group.exits.length > 1;
    const exact = !duplicate && group.entries.length === 1 && group.exits.length === 1;
    for (const row of [...group.entries, ...group.exits]) {
      const r = readRecord(view, row), key = laneKey(r);
      pairing.set(row, { reason: exact ? 'Unique exact endpoint' : duplicate ? 'Duplicate endpoint: ambiguous' : 'No exact counterpart endpoint',
        counterpart: exact ? (r.type === 21 ? group.exits[0] : group.entries[0]) + 1 : null });
      if (!pairSummary[key]) pairSummary[key] = { entries: 0, exits: 0, pairs: 0, noExactExit: 0, duplicateExit: 0 };
      const summary = pairSummary[key];
      if (r.type === 21) summary.entries++;
      else { summary.exits++; if (exact) summary.pairs++; else if (duplicate) summary.duplicateExit++; else summary.noExactExit++; }
    }
  }
  return { view, sorted, prefixEnd, pairing, origin, last,
    meta: { records: count, selectedRecords: rows.length, bytes: buffer.byteLength,
      origin: String(origin), last: String(last), cpuCounts, typeCounts, headers: [...headers],
      reversals, invalid, lanes: [...lanes.values()].sort((a, b) => a.cpu - b.cpu || a.source - b.source || a.stream - b.stream), pairSummary } };
}
export function matches(r, filters = {}) {
  return (!filters.cpus || filters.cpus.includes(r.cpu)) &&
    (!filters.lanes || filters.lanes.includes(laneKey(r))) &&
    (!filters.types || filters.types.includes(r.type));
}
export function lowerBound(index, tick) {
  let a = 0, b = index.sorted.length;
  while (a < b) {
    const mid = (a + b) >>> 1;
    if (index.view.getBigUint64(index.sorted[mid] * RECORD_BYTES, true) < tick) a = mid + 1;
    else b = mid;
  }
  return a;
}
/** Closed inspection window: includes boundary events; durations remain end-start. */
export function windowRecords(index, start, end, filters = {}) {
  let first = 0, hi = index.sorted.length;
  while (first < hi) {
    const mid = (first + hi) >>> 1;
    if (index.prefixEnd[mid] < start) first = mid + 1; else hi = mid;
  }
  const result = [];
  for (let i = first; i < index.sorted.length; i++) {
    const row = index.sorted[i], r = readRecord(index.view, row);
    if (r.startTick > end) break;
    const extent = r.endTick > r.startTick ? r.endTick : r.startTick;
    if (extent >= start && matches(r, filters)) result.push(row);
  }
  return result;
}
export function serialize(index, row, hex = false) {
  const r = readRecord(index.view, row);
  const result = { ...r, lane: laneKey(r), typeLabel: typeLabel(r.type), sourceLabel: sourceLabel(r.cpu, r.source, r.stream),
    durationTicks: r.endTick >= r.startTick ? String(r.endTick - r.startTick) : null,
    pairing: index.pairing.get(row) || { reason: 'Not evaluated for this event type', counterpart: null } };
  for (const name of ['startTick', 'endTick', 'payload']) result[name] = String(r[name]);
  if (hex) result.rawHex = Array.from(new Uint8Array(index.view.buffer, row * RECORD_BYTES, RECORD_BYTES), b => b.toString(16).padStart(2, '0')).join(' ');
  return result;
}
export function decimalToTicks(text, ticksPerSecond) {
  if (!/^-?\d+(\.\d{0,18})?$/.test(text.trim())) throw new Error('Enter a plain decimal time (up to 18 fractional digits).');
  const negative = text.trim().startsWith('-');
  const [whole, fraction = ''] = text.trim().replace(/^-/, '').split('.');
  const denominator = 10n ** BigInt(fraction.length);
  const numerator = (BigInt(whole) * denominator + BigInt(fraction || '0')) * ticksPerSecond;
  if (numerator % denominator !== 0n) throw new Error('Time falls between raw ticks. Enter an exact representable time.');
  return (negative ? -1n : 1n) * numerator / denominator;
}
export function formatTicks(ticks, rate, digits = 9) {
  const sign = ticks < 0n ? '-' : '', value = ticks < 0n ? -ticks : ticks;
  const places = 10n ** BigInt(digits);
  // Display truncation only; full tick is always separately available.
  return `${sign}${value / rate}.${((value % rate) * places / rate).toString().padStart(digits, '0')}`;
}
/** Convert only a local difference, never a large absolute timestamp, to a plot coordinate. */
export function tickFraction(tick, start, end) {
  const span = end - start;
  if (span <= 0n) throw new Error('Plot window must contain at least one tick.');
  if (span > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Zoom in: window exceeds exact integer plot-coordinate range.');
  return Number(tick - start) / Number(span);
}
export function tickAtFraction(fraction, start, end) {
  if (end - start > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Window exceeds safe coordinate range.');
  return start + BigInt(Math.round(Math.max(0, Math.min(1, fraction)) * Number(end - start)));
}
