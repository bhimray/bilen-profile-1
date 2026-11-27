# SCALEXIO profiler dashboard

Implemented in `C:\Users\rayyu\Downloads\BhimDocs\bilen-profile-1`.

## Open the dashboard

From this project, run `npm run dev`, then open the printed local URL with `/profiler` appended (normally `http://127.0.0.1:4321/profiler`). Use **Open profiler capture** to select:

```
C:\Users\rayyu\OneDrive\Desktop\UTD\dSPACE\Project\ECU_RealTime_Control_Performance\results\SCALEXIO\Profile_2026_11_24_23_25_03
```

The extensionless binary is read into a Web Worker using `File.arrayBuffer()`. It is not copied into `public`, uploaded, or written back. All file records remain available by original file row; CPU 4 and CPU 5 are indexed for timelines. The synthetic demo is explicitly identified and uses absolute timestamps above 2^53 to exercise integer precision.

## Files and responsibilities

| File | Purpose |
| --- | --- |
| `src/pages/profiler.astro` | Standalone `/profiler` page and controls |
| `src/styles/profiler.css` | Dashboard styling; no remote assets required |
| `src/lib/profiler/core.mjs` | Exact byte extraction, integer arithmetic, indices, pairing and window queries |
| `src/lib/profiler/decode.worker.mjs` | Background decode, SHA-256, filters, overview bins, raw pages, edge stepping and CSV |
| `src/lib/profiler/dashboard.mjs` | D3 brush/axes, Canvas timelines, Observable Plot charts, playback and shared cursor |
| `tests/profiler.test.mjs` | Precision, query, pairing, duplicate and worker tests |
| `scripts/verify-profiler.mjs` | Actual-capture verification and SHA-256 report |
| `docs/profiler-validation.json` | Verification results for the supplied capture |
| `package.json`, `package-lock.json` | Added exact versions of `@observablehq/plot` and `d3` |

The actual decoder and worker source are also shown in the page's **Decoder, timestamp math and analysis limits** disclosure. They are imported from the implemented modules, so the displayed source follows the implementation.

## Binary extraction: observed layout

This layout was inferred from the capture and checked against existing extraction and native screenshots. It is **not a vendor-certified file-format specification**. A multiple of 44 bytes alone is not proof that an arbitrary file uses this format.

Every record is exactly 44 bytes, with little-endian unsigned fields:

| Byte offset | Width | Field | Interpretation status |
| --- | --- | --- | --- |
| 0 | u64 | startTick | Raw timestamp field |
| 8 | u64 | endTick | Raw timestamp field |
| 16 | u64 | payload | Opaque parameter; decimal and hex retained |
| 24 | u32 | sequence | Observed sequence field |
| 28 | u32 | headerWord | Uninterpreted; value 1042676 in this file |
| 32 | u32 | stream | Raw identifier |
| 36 | u16 | source | Raw identifier |
| 38 | u16 | user | Raw identifier |
| 40 | u16 | cpu | CPU field; screenshot supports CPU 4/5 assignment |
| 42 | u16 | type | Raw event code |

The implemented reader (`core.mjs: readRecord`) uses:

```js
const base = row * 44;
const startTick = view.getBigUint64(base, true);
const endTick = view.getBigUint64(base + 8, true);
const payload = view.getBigUint64(base + 16, true);
const sequence = view.getUint32(base + 24, true);
const headerWord = view.getUint32(base + 28, true);
const stream = view.getUint32(base + 32, true);
const source = view.getUint16(base + 36, true);
const user = view.getUint16(base + 38, true);
const cpu = view.getUint16(base + 40, true);
const type = view.getUint16(base + 42, true);
```

`true` selects little endian. All three u64 fields are `BigInt`, never converted to a JavaScript Number for storage. The raw inspector and CSV serialize them as decimal strings. **Import CSV tick columns as text** in Excel or other tools that otherwise round long integers. Original bytes, byte offset and 1-based file row are available in the inspector.

## Timestamp math and exactness

`R` is the user-selected integer ticks per second. The default `R = 1,000,000,000` is an **inferred scale of 1 ns per tick**, supported by existing timing comparisons. It is not an independently calibrated hardware clock. Resolution, precision, and physical clock accuracy are different properties.

```
originTick = minimum startTick among retained CPU 4/5 records
relativeTicks = tick - originTick                  // BigInt, exact
relativeSeconds = relativeTicks / R                // display conversion
elapsedTicks = endTick - startTick                 // BigInt, exact
elapsedMicroseconds = elapsedTicks * 1,000,000 / R  // display conversion
```

For this capture, `originTick = 28059873933` and the largest CPU 4/5 end tick is `48415316507`. Relative time starts at the earliest CPU 4/5 event, not the MAT recording origin and not necessarily the start of the hardware experiment. No wall-clock epoch or MAT alignment offset is invented.

The sample controller TaskEntry at **raw row 361630** has:

```
startTick = 28213226854
endTick   = 28216622017
elapsed   = 3395163 ticks = 3395.163 µs = 3.395163 ms  (at default R)
relative start = (28213226854 - 28059873933) / 1e9
               = 0.153352921 s
```

Its exact counterpart is TaskExit raw row 389740, whose start tick is 28216622017.

Exact decimal seeking parses strings with integer numerator/denominator arithmetic. A time between raw ticks is rejected rather than silently rounded. Focusing either cursor field pauses playback; typed drafts are protected from pending chart refreshes until you submit with Go or Enter. Full raw-tick input and stepping remain available regardless of display formatting. Fixed decimal readouts truncate beyond the displayed number of fractional digits; the full raw integer tick remains authoritative.

Drawing must map time onto pixels:

```js
fraction = Number(tick - windowStart) / Number(windowEnd - windowStart);
pixelX = left + fraction * plotWidth;
```

Subtraction happens **before** Number conversion. Windows larger than `Number.MAX_SAFE_INTEGER` ticks are rejected by the coordinate helper. Pixel positions are floating point approximations; the data and query boundaries remain exact integer ticks. A mouse click is converted back using rounding to the nearest tick, so mouse precision is limited by ticks per pixel. For example, a 100 µs window across 800 pixels represents 125 ns per pixel; clicking cannot uniquely resolve every ns. Use a 1 µs/100 ns lens, exact tick entry, or set **Step · raw ticks** to 1.

For overview bins and dense timeline bins, integer arithmetic assigns a record start to a bin:

```
bin = floor((startTick - originTick) * binCount / (lastTick - originTick + 1))
```

The overview uses 1,000 bins per CPU, with heights normalized separately to each CPU's maximum bin count. The main/lens timeline switches to 1,200 bins **only if a query contains more than 18,000 records**; density intensity is normalized separately to each lane's maximum count. An interval that began before that window and continues into it is assigned to the first bin. This is a **count display**, not measured CPU load, time occupancy, or a reconstructed execution interval. Individual timelines have a minimum mark width of 1 pixel for visibility; their numerical duration is not expanded.

## Querying, ordering and pairing

The file is never reordered or modified. A separate index is sorted by start tick, then original row for ties. The capture has 192 start-tick reversals in original file order. A prefix maximum of end ticks ensures long intervals are included when their starts precede the inspection window.

Window tables and CSV include closed-overlap records:

```
startTick <= windowEnd && max(startTick, endTick) >= windowStart
```

Invalid negative intervals are flagged; no negative duration is fabricated. Cursor-active records use half-open `[startTick, endTick)` containment; an end edge itself is excluded from that interval. Zero-length records appear active only at their exact tick. The table includes boundary events intentionally, so adjacent window exports can overlap at their shared boundary.

Task pairing is evaluated only for codes 21 and 22:

```
same CPU && same stream && same source
&& TaskEntry.endTick === TaskExit.startTick
&& exactly one entry and one exit at that endpoint
```

This exact endpoint rule is a **decoder hypothesis checked against this capture**, not a complete scheduler reconstruction. Duplicate endpoint records are retained and flagged as ambiguous. A result of “No exact counterpart endpoint” means no counterpart under that rule; it does not prove a real invocation had no entry. Unrelated preceding type 106 events are never substituted as task entries.

The displayed TaskEntry interval is its own raw `startTick` to `endTick` whether or not an exact exit match exists. Its duration is elapsed time, which may include interruptions/preemption. There is no calculation of verified idle time, CPU utilization, or exclusive CPU execution time.

## Labels and assumptions

- CPU 4 / stream 13293701 / source 24: controller Periodic Task 2.
- CPU 5 / stream 13293700 / source 24: plant Periodic Task 1.
- Types 10/11: InterruptEntry/InterruptExit, following the native screenshot's type legend.
- Types 21/22: TaskEntry/TaskExit, following the native screenshot.
- Type 20: “Task Registration (provisional code)”. The screenshot's registration numeric code was clipped; do not treat it as a task release event.
- Type 23: “Overrun (provisional)”. The raw code remains shown.
- Source 17 on CPU 4: raw source 17, unmapped. Its 44 paired short intervals are not relabeled as controller work.
- Source 1 and source 4: unmapped numeric sources. Native screenshots show kernel activity but do not establish every numeric source mapping.
- Types 100/106/203 and any other unmapped types: unknown, with numeric code retained. CPU 0 is outside the two timelines but any raw row can still be inspected.

Update explicit mappings in `core.mjs` only when native profiler metadata supplies evidence. Labels do not alter timestamps, queries, or pairing.

## Synchronization and playback

One BigInt cursor drives context/lens red lines, the magnifying rectangle, duration-chart cursor, raw lens table and cursor-active list. One frame captures cursor, context/lens boundaries, tick rate and filters. Worker results commit together. Stale results are discarded when a later request supersedes them. Inspector selection is explicitly separate: a chosen raw record stays selected while you move the cursor, until another record is selected. Its exact tick offset from the shared cursor is displayed. Selecting a table row, active record or counterpart preserves your inspection cursor; Seek start/end moves it explicitly. Timeline mark selection and jumping to a raw file row seek to that record's start.

Playback advances the cursor using:

```
deltaTicks = round(elapsedBrowserMilliseconds * R * playbackSpeed / 1000)
cursor = playbackStartTick + deltaTicks
```

This rounding applies only to the animation cursor. Event timestamps are never interpolated. Browser repaint is not a real-time acquisition system: a fast playback can skip over tiny events between frames. They remain available by pausing, stepping to the next/previous distinct raw start/end edge, or entering an exact tick. Very slow speeds are supplied for microsecond inspection.

The overview rectangle sets the context interval and cursor to its midpoint. The outlined rectangle in the context timeline shows the lens interval. The lens follows the shared cursor. Timeline clicks seek/select; wheel zoom changes window width around the cursor. **Follow cursor** recenters the context when playback leaves it. If turned off, an off-screen cursor remains off-screen intentionally.

Observable Plot draws exact window event counts and individual TaskEntry elapsed-duration dots. No line connects durations, so no runtime between observed events is implied. At >18,000 context records, the dot view asks you to narrow the window; the raw table remains complete in the lens. Raw tables show 100 records per page, in start-time order. All simultaneous records remain separately selectable.

CSV export covers the current lens with the same filters, includes every overlap record without sampling, and exports exact tick strings plus derived elapsed ticks. A separate JSON sidecar records file SHA-256 (if browser crypto is available), layout, calibration, cursor, boundaries, filters and assumptions. The browser may ask to allow the second download. Raw captures are not persisted across reloads.

## Validation

```
node --test tests/profiler.test.mjs
node scripts/verify-profiler.mjs "C:\path\to\Profile_file" "docs\profiler-validation.json"
npm run build
```

The supplied capture SHA-256 is:

```
3bd0ad242091887f025a23f72318132340a61d94f53a2c6ad791d52f98a3c6b6
```

Verified: 265,225,972 bytes, 6,027,863 records; CPU 4: 4,198, CPU 5: 201,812; 206,010 retained; 192 file-order timestamp reversals; no negative intervals.

| CPU / stream / source | Entries | Exits | Unique pairs | Exits without endpoint | Ambiguous duplicate exits |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4 / 13293701 / 24 | 290 | 361 | 290 | 71 | 0 |
| 5 / 13293700 / 24 | 20,139 | 20,174 | 20,133 | 35 | 6 |
| 4 / 13293701 / 17 | 44 | 44 | 44 | 0 | 0 |

The verifier independently compares DataView extraction with Node Buffer readers at selected raw rows, checks known capture counts, verifies the 3.395163 ms example and microsecond-window inclusion, and generates a reproducible report. These tests establish consistency of this decoder's implementation with the observed layout. They do not certify the proprietary format, establish completeness of the original capture, calibrate the hardware clock, or supply missing scheduler semantics.

Browser checks performed with the explicitly labeled synthetic demo: both CPUs, exact single-tick movement above 2^53, 1 µs lens, event inspector and original bytes, filtering, next-edge stepping and slow playback. Actual-capture decoding was verified by the same core module from Node. Automated actual-file selection in Chrome was blocked by the extension's file-URL permission; the ordinary user-operated file picker remains available.

Package APIs follow the official documentation: https://observablehq.com/plot/getting-started and https://d3js.org/d3-brush.
