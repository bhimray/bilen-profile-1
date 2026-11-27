import { buildIndex, readRecord, windowRecords, serialize, laneKey, matches } from './core.mjs';
let index;
self.onmessage = async ({ data: message }) => {
  const { id, action } = message;
  try {
    if (action === 'load') {
      const buffer = await message.file.arrayBuffer();
      index = buildIndex(buffer, progress => self.postMessage({ action: 'progress', progress }));
      if (globalThis.crypto?.subtle) {
        const digest = await crypto.subtle.digest('SHA-256', buffer);
        index.meta.sha256 = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
      } else index.meta.sha256 = null;
      self.postMessage({ id, result: index.meta });
    } else if (!index) throw new Error('Load a capture first.');
    else if (action === 'overview') {
      const bins = 1000, span = index.last - index.origin + 1n;
      const counts = { 4: new Uint32Array(bins), 5: new Uint32Array(bins) };
      for (const row of index.sorted) {
        const r = readRecord(index.view, row);
        if (!matches(r, message.filters)) continue;
        const bin = Number((r.startTick - index.origin) * BigInt(bins) / span);
        counts[r.cpu][Math.min(bin, bins - 1)]++;
      }
      self.postMessage({ id, result: { counts, bins } });
    } else if (action === 'query') {
      const start = BigInt(message.start), end = BigInt(message.end), cursor = BigInt(message.cursor);
      const rows = windowRecords(index, start, end, message.filters), pageSize = 100;
      const offset = Math.max(0, Math.min(message.offset || 0, Math.max(0, Math.ceil(rows.length / pageSize) - 1) * pageSize));
      // No arbitrary record sampling: dense windows become count bins. Raw table still contains every record.
      let density = null, events = [];
      if (rows.length > 18000) {
        const bins = 1200, span = end - start + 1n, lanes = new Map();
        for (const row of rows) {
          const r = readRecord(index.view, row), key = laneKey(r);
          if (!lanes.has(key)) lanes.set(key, new Uint32Array(bins));
          const position = r.startTick < start ? 0n : r.startTick - start;
          lanes.get(key)[Math.min(bins - 1, Number(position * BigInt(bins) / span))]++;
        }
        density = { bins, lanes: [...lanes].map(([key, counts]) => ({ key, counts })) };
      } else events = rows.map(row => serialize(index, row));
      const summaries = new Map();
      for (const row of rows) {
        const r = readRecord(index.view, row), key = `${laneKey(r)}/${r.type}`;
        let item = summaries.get(key);
        if (!item) { item = { lane: laneKey(r), cpu: r.cpu, source: r.source, type: r.type, count: 0 }; summaries.set(key, item); }
        item.count++;
      }
      // Cursor-active records use half-open durations; point records match the exact tick only.
      const activeRows = windowRecords(index, cursor, cursor, message.filters).filter(row => {
        const r = readRecord(index.view, row);
        return r.endTick === r.startTick ? r.startTick === cursor : r.startTick <= cursor && cursor < r.endTick;
      });
      self.postMessage({ id, result: { events, density, total: rows.length, offset,
        page: rows.slice(offset, offset + pageSize).map(row => serialize(index, row)),
        active: activeRows.slice(0, 100).map(row => serialize(index, row)), activeTotal: activeRows.length,
        summaries: [...summaries.values()] } });
    } else if (action === 'record') {
      const row = Number(message.row) - 1;
      if (!Number.isInteger(row) || row < 0 || row >= index.meta.records) throw new Error('Raw record row is out of range.');
      self.postMessage({ id, result: serialize(index, row, true) });
    } else if (action === 'step') {
      const cursor = BigInt(message.cursor), direction = message.direction;
      // Include both interval starts and ends; simultaneous edges remain inspectable in raw rows.
      let chosen = null;
      for (const row of index.sorted) {
        const r = readRecord(index.view, row);
        if (!matches(r, message.filters)) continue;
        for (const tick of [r.startTick, r.endTick]) {
          if (direction > 0 && tick > cursor && (chosen === null || tick < chosen)) chosen = tick;
          if (direction < 0 && tick < cursor && (chosen === null || tick > chosen)) chosen = tick;
        }
      }
      self.postMessage({ id, result: String(chosen ?? cursor) });
    } else if (action === 'export') {
      const rows = windowRecords(index, BigInt(message.start), BigInt(message.end), message.filters);
      const fields = ['row','byteOffset','startTick','endTick','durationTicks','payload','sequence','headerWord','stream','source','user','cpu','type','typeLabel','sourceLabel','pairingReason','counterpartRow'];
      const csv = [fields.join(',')];
      const quote = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
      for (const row of rows) {
        const r = serialize(index, row); r.pairingReason = r.pairing.reason; r.counterpartRow = r.pairing.counterpart;
        csv.push(fields.map(field => quote(r[field])).join(','));
      }
      self.postMessage({ id, result: csv.join('\r\n') });
    } else throw new Error(`Unknown action ${action}`);
  } catch (error) { self.postMessage({ id, error: error.message }); }
};
