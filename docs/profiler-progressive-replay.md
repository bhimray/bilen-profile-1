# Progressive waveform replay

Enable **Draw as time advances** (on by default), choose **Waveforms**, then **Play** or **Replay from start**. With the checkbox off, complete recorded intervals are shown for static inspection. Compact intervals and the density overview remain complete reference views.

For a raw interval with start `a`, end `b`, and shared cursor `c`:

```
c < a      → do not draw the record
a <= c < b → draw the start edge and a horizontal segment ending at c
c >= b     → draw the completed interval, including its end edge
```

More exactly, the drawing helper uses:

```
visibleEnd = min(windowEnd, cursorTick)
leftTick = max(rawStartTick, windowStart)
rightTick = min(rawEndTick, visibleEnd)
showStart = windowStart <= rawStartTick <= visibleEnd
showEnd = windowStart <= rawEndTick <= visibleEnd
pixel = leftMargin + Number(tick - windowStart) / Number(windowEnd - windowStart) * plotWidth
```

Future records are omitted, not moved. The leading dot identifies an unfinished line; it is not an extra event. A closing edge is never drawn at the cursor before the raw end is reached. Rewinding or exact stepping redraws the historical view at that same cursor tick. Zero-duration and invalid records retain their existing distinctions. Duplicate rows are not merged. Raw ticks, payloads, pairing, decoding, exports and the inferred default tick-rate calibration are unchanged.

The browser requests a new frame at each available `requestAnimationFrame` opportunity, with one query/render cycle in flight at a time. The previous 80 ms throttle and extra 30 ms scheduling delay have been removed from playback. An unchanged context window reuses its record result and diagnostic plots; only the duration-plot cursor moves. Raw table and cursor-active list DOM are rebuilt only when their record sets change. Lens records are still queried for each committed cursor frame, and both timelines, numeric clock, active rows and magnifier commit together. Context cache invalidates when boundaries, filters, calibration or chart width change, and when a new file is loaded.

This targets smoother rendering but does not guarantee 60 fps: browser workload, visible record count and hardware determine frame rate. It is replay of recorded events, not new live acquisition. Fast playback can cross multiple raw edges in one display frame; edges retain their exact recorded times. Slow playback, pause, single-tick steps and numeric tick entry remain available for microsecond analysis. The inspection table and count/duration diagnostics remain full recorded reference data for their selected window; the progressive reveal applies to waveform drawings.

All progressive boundary comparisons and clipping use BigInt. Only local drawing coordinates use Number. No synthetic clock, time smoothing, event timestamp interpolation, invented execution state or CPU utilization calculation is added.

Changed files: `src/lib/profiler/waveform.mjs`, `src/lib/profiler/dashboard.mjs`, `src/pages/profiler.astro`, `tests/waveform.test.mjs`. This documentation is `docs/profiler-progressive-replay.md`.

Validation: `node --test tests/profiler.test.mjs tests/waveform.test.mjs tests/frame-queue.test.mjs`, then `npm run build`. Added tests cover hidden future starts, the growing segment, exact end tick, rewinding and full-trace mode.
