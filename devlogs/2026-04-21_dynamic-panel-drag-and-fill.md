# 2026-04-21 — DynamicPanel drag fix & full-fill default height

## Problem

After the earlier fix that made `DynamicPanel` render its charts, two issues remained:

1. The drag separator could be grabbed (it turned cyan via `isDragging`) but
   dragging never changed the panel's height — `aria-valuenow` stayed at `492`
   no matter how far the cursor moved.
2. The opened panel defaulted to ~492 px while the remaining space in `<main>`
   was ~906 px on a 1080 p viewport. The map was collapsed to its 160 px floor
   and ~318 px of vertical space was simply empty below the charts.

## Root cause

Both symptoms traced back to `mainHeight` **state** being 0 at the moments it
mattered, even though `mainRef.current.getBoundingClientRect().height` was
already ~984 px:

- `dynamicHeight` was seeded via the ref (→ 492 = 0.5 × 984), so the panel
  opened.
- `mapHeight = Math.max(mainHeight − dynamicHeight − HANDLE_PX, 160)` used the
  *state*, so with `mainHeight = 0` it evaluated to `Math.max(−506, 160) = 160`
  — the map's minimum.
- The drag handler bailed on `if (mainHeightRef.current <= 0) return`, because
  `mainHeightRef` mirrors the same zeroed state. Pointer events fired but
  `setDynamicHeight` was never called.

In short: the ResizeObserver tick that was supposed to promote `mainHeight`
from 0 → 984 had not landed yet, and every consumer of the value was reading
state instead of the live DOM.

## Fix

### `components/Dashboard/MainDashboard.js`

- `useLayoutEffect` (in place of `useEffect`) to seed `mainHeight` synchronously
  after layout, so no consumer ever sees state = 0 in the same frame that
  `dynamicStation` flips true.
- New helper `readMainHeight(el, fallback)` reads the live bounding-rect
  height and falls back to state — used everywhere height is consumed:
  - the drag `onMove` closure,
  - the arrow-key `onKeyDown` handler,
  - `resetDynamicHeight`,
  - the render-time `mapHeight` calculation (`effectiveMain`).
  Result: drag, keyboard resize, and the map-vs-panel split all work on the
  first open, independent of ResizeObserver timing.
- Dropped `DEFAULT_DYNAMIC_FRAC = 0.5`. Default now targets
  `mainHeight − MIN_MAP_PX − HANDLE_PX` so the dynamic panel claims the full
  remaining area and the map collapses to a clean `MIN_MAP_PX = 180`.
- `MAX_DYNAMIC_FRAC` raised `0.85 → 0.95` so the user can still drag *down*
  from the fill default (otherwise the default would sit above the clamp
  ceiling).
- Map floor raised `160 → MIN_MAP_PX (180)` for a single source of truth.

### `components/DynamicPanel/DynamicPanel.js`

Diagnostic instrumentation removed now that the render path is healthy:

- All `console.log` / `console.warn` / `console.error` calls in
  `useContainerWidth`, MOUNT/UNMOUNT, root-size observer, `loadDynamicSeries`,
  `parseSeries`, `fullDomain`, and the render-branch log.
- `useContainerWidth(tag)` simplified to `useContainerWidth()` (tag was only
  used by the logs).
- The `data-dp-branch` debug attribute on the root `<div>`.
- The entire "watch our own rendered size" diagnostic effect.

## Expected behavior

- Clicking **Dynamic Info** on a critical station: the map shrinks to 180 px,
  the 14 px separator appears below it, and the dynamic panel fills the rest
  of `<main>` (~906 px on a 1080 p viewport).
- Dragging the separator up/down resizes the panel between
  `MIN_DYNAMIC_PX = 180` and `0.95 × mainHeight`.
- Double-click on the separator resets to the fill default.
- Arrow keys nudge by 16 px (48 px with Shift) when the separator is focused.

## Files touched

- `components/Dashboard/MainDashboard.js`
- `components/DynamicPanel/DynamicPanel.js`
