# Waveform animation

The `/profiler` page defaults to **Timeline style → Waveforms**. **Compact intervals** restores the earlier presentation. Both context and magnifier use the same playback, cursor, zoom, filters and raw-record inspector.

Each row is a unique CPU / stream / source / event type. A raised waveform section spans that individual record's `startTick` to `endTick`. This does not assert CPU busy/idle or reconstruct scheduler states. Dashed background makes no state assertion. No synthetic clock, uniform time slots, smoothing, merging or timestamp resampling is used.

Start triangles appear only where the actual start tick is visible. End triangles appear only where the actual end tick is visible. A span continuing beyond the view remains open at that boundary instead of drawing a false transition there. Labels contain the raw row, event code and raw payload where space permits. Unknown type/source labels stay unknown. Duplicate and overlapping records are retained independently; inspect their individual rows in the raw table where marks overlap.

The waveform renderer uses exactly:

```
left = Number(max(startTick, windowStart) - windowStart) / Number(windowEnd - windowStart)
right = Number(min(endTick, windowEnd) - windowStart) / Number(windowEnd - windowStart)
pixel = labelWidth + fraction * plotWidth
```

All clipping and timestamp comparisons use BigInt. Conversion to Number happens only for local drawing coordinates, using the existing safe-range guard. Narrow intervals may be subpixel and must be inspected numerically or zoomed further. Zero-duration records have coincident edges. Invalid negative intervals are flagged, rather than assigned a negative pulse duration.

The same red cursor crosses both CPUs. Intervals containing `[startTick, endTick)` at that cursor receive brighter outlines/fills. Playback animates the cursor; raw interval endpoints do not move. Clicking a waveform seeks to the nearest raw tick under the mouse and selects a nearby record without snapping to its start. Exact input/stepping is available when mouse pixel resolution is insufficient.

More than 18,000 records retains the existing, explicitly labeled density mode. Density is not a synthesized waveform. Zoom into a shorter context/magnifier window to see individual waveform intervals. The raw table and exports remain complete.

Waveform panels scroll vertically to expose all CPU/source/type rows. Wheel scrolling moves through rows; Ctrl+wheel zooms time. Scroll position is retained across playback frames and cursor steps. Compact mode retains plain-wheel time zoom. Existing raw extraction, exact endpoint pairing, tick-rate assumption, counts, exports and SHA-256 calculations are unchanged. The default 1 ns/tick calibration remains inferred, not hardware-certified.

Files changed: `src/pages/profiler.astro`, `src/lib/profiler/dashboard.mjs`, `src/styles/profiler.css`. Files added: `src/lib/profiler/waveform.mjs`, `tests/waveform.test.mjs`, `docs/profiler-waveforms.md`.

Validate with `node --test tests/profiler.test.mjs tests/waveform.test.mjs` and `npm run build`.

## Playback freeze correction

The old refresh scheduler canceled and restarted its 30 ms timer on every playback request. Browser animation frames arriving about every 16 ms could postpone the plot refresh indefinitely: the button showed Pause while the cursor stayed frozen. Refresh requests now share a pending timer without postponing it, and playback waits for the current render/query to complete before scheduling another cursor position. All views still commit the same cursor frame. Raw events, timestamps and decoding are unchanged.

The new module is src/lib/profiler/frame-queue.mjs. Regression coverage is tests/frame-queue.test.mjs; a simulated 60 Hz request stream must render at 30, 62, 94, 126, 158 and 190 ms instead of starving. Run node --test tests/profiler.test.mjs tests/waveform.test.mjs tests/frame-queue.test.mjs (20 tests).

For visible real-data playback: select your capture, choose Waveforms, set Context window to 50 ms (Full capture may show density), enable Follow cursor, choose playback speed and press Play. The red cursor and interval highlights animate; the recorded waveform edges retain their actual time positions.

