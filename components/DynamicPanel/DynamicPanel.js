import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { scaleLinear, scaleTime } from "d3-scale";
import { line as d3Line, curveMonotoneX } from "d3-shape";
import { extent, bisector } from "d3-array";
import { loadDynamicSeries } from "../../utils/dataLoader";
import { formatNumber } from "../../utils/constants";
import { useTheme } from "../Theme/ThemeProvider";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

// Series colors live in the theme (theme.chart.series[key]); they are merged
// in at render so a theme switch recolors the charts.
const METRICS = [
    { key: "area_km2",            label: "Surface Area",    unit: "km²" },
    { key: "elevation_m",         label: "Water Elevation", unit: "m"   },
    { key: "changed_storage_mcm", label: "Storage Change",  unit: "MCM" },
];

const CHART_HEIGHT = 200;
const CHART_MARGIN = { top: 12, right: 20, bottom: 26, left: 56 };
const BRUSH_HEIGHT = 44;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const timeBisector = bisector((d) => d._t).left;

function parseSeries(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
        .map((r) => {
            const t = r.time ? new Date(r.time) : null;
            if (!t || Number.isNaN(t.getTime())) return null;
            return {
                _t: t,
                time: r.time,
                area_km2: Number.isFinite(r.area_km2) ? r.area_km2 : null,
                elevation_m: Number.isFinite(r.elevation_m) ? r.elevation_m : null,
                changed_storage_mcm: Number.isFinite(r.changed_storage_mcm)
                    ? r.changed_storage_mcm
                    : null,
            };
        })
        .filter(Boolean);
}

function formatMonth(d) {
    if (!d) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatDay(d) {
    if (!d) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
    ).padStart(2, "0")}`;
}

function summarize(series, key) {
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let n = 0;
    let last = null;
    for (const r of series) {
        const v = r[key];
        if (v == null || !Number.isFinite(v)) continue;
        if (v < min) min = v;
        if (v > max) max = v;
        sum += v;
        n += 1;
        last = v;
    }
    if (n === 0) return null;
    return { min, max, avg: sum / n, last, count: n };
}

function niceExtent(series, key) {
    let min = Infinity;
    let max = -Infinity;
    for (const r of series) {
        const v = r[key];
        if (v == null || !Number.isFinite(v)) continue;
        if (v < min) min = v;
        if (v > max) max = v;
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
    if (min === max) {
        const pad = Math.abs(min) > 0 ? Math.abs(min) * 0.1 : 1;
        return [min - pad, max + pad];
    }
    const pad = (max - min) * 0.08;
    return [min - pad, max + pad];
}

/* ------------------------------------------------------------------ */
/* Hook: measure container width                                       */
/* ------------------------------------------------------------------ */

function useContainerWidth() {
    const ref = useRef(null);
    const [w, setW] = useState(0);
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el || typeof ResizeObserver === "undefined") return;
        setW(el.getBoundingClientRect().width);
        const ro = new ResizeObserver(([entry]) => {
            setW(entry.contentRect.width);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    return [ref, w];
}

/* ------------------------------------------------------------------ */
/* Chart — one metric                                                  */
/* ------------------------------------------------------------------ */

function MetricChart({ metric, series, xDomain, hoverIdx, onHover, onLeave }) {
    const [wrapRef, width] = useContainerWidth();
    const { theme } = useTheme();
    const chart = theme.chart;

    const stats = useMemo(() => summarize(series, metric.key), [series, metric.key]);
    const yExtent = useMemo(() => niceExtent(series, metric.key), [series, metric.key]);

    const ready = width > 0 && series.length > 0 && yExtent != null;

    const plotW = Math.max(0, width - CHART_MARGIN.left - CHART_MARGIN.right);
    const plotH = Math.max(0, CHART_HEIGHT - CHART_MARGIN.top - CHART_MARGIN.bottom);

    const xScale = useMemo(() => {
        if (!ready) return null;
        return scaleTime().domain(xDomain).range([0, plotW]);
    }, [ready, xDomain, plotW]);

    const yScale = useMemo(() => {
        if (!ready) return null;
        return scaleLinear().domain(yExtent).range([plotH, 0]).nice();
    }, [ready, yExtent, plotH]);

    // Build path only over points within xDomain and with defined values.
    const pathD = useMemo(() => {
        if (!ready) return "";
        const gen = d3Line()
            .defined((d) => d[metric.key] != null && Number.isFinite(d[metric.key]))
            .x((d) => xScale(d._t))
            .y((d) => yScale(d[metric.key]))
            .curve(curveMonotoneX);
        const sub = series.filter(
            (d) => d._t >= xDomain[0] && d._t <= xDomain[1]
        );
        return gen(sub) || "";
    }, [ready, series, xDomain, xScale, yScale, metric.key]);

    const yTicks = useMemo(() => (yScale ? yScale.ticks(4) : []), [yScale]);
    const xTicks = useMemo(() => (xScale ? xScale.ticks(6) : []), [xScale]);

    // Hovered point (by shared index)
    const hoverPoint = useMemo(() => {
        if (!ready || hoverIdx == null) return null;
        const d = series[hoverIdx];
        if (!d) return null;
        if (d._t < xDomain[0] || d._t > xDomain[1]) return null;
        const v = d[metric.key];
        if (v == null || !Number.isFinite(v)) return { x: xScale(d._t), y: null, v: null, d };
        return { x: xScale(d._t), y: yScale(v), v, d };
    }, [ready, hoverIdx, series, xDomain, xScale, yScale, metric.key]);

    const handleMove = useCallback(
        (evt) => {
            if (!ready) return;
            const rect = evt.currentTarget.getBoundingClientRect();
            const px = evt.clientX - rect.left - CHART_MARGIN.left;
            if (px < 0 || px > plotW) {
                onLeave();
                return;
            }
            const t = xScale.invert(px);
            // find nearest full-series index (not filtered) so crosshair stays
            // synced across all charts
            let i = timeBisector(series, t, 1);
            if (i >= series.length) i = series.length - 1;
            const prev = series[i - 1];
            const cur = series[i];
            if (prev && cur) {
                i = t - prev._t < cur._t - t ? i - 1 : i;
            } else if (!cur) {
                i = i - 1;
            }
            onHover(i);
        },
        [ready, plotW, xScale, series, onHover, onLeave]
    );

    return (
        <section
            className="bg-panel rounded-ps-md border border-ps-divider overflow-hidden shadow-ps-1"
            aria-labelledby={`metric-${metric.key}`}
        >
            <header className="flex items-start justify-between gap-4 px-5 pt-4 pb-2">
                <div className="min-w-0">
                    <h3
                        id={`metric-${metric.key}`}
                        className="text-[22px] font-light text-ps-charcoal leading-tight font-display"
                        style={{ letterSpacing: "0.1px" }}
                    >
                        {metric.label}
                        <span className="ml-2 text-[13px] text-ps-bodyGray font-normal">
                            {metric.unit}
                        </span>
                    </h3>
                </div>
                {stats && (
                    <dl className="flex items-start gap-5 text-right shrink-0">
                        <Stat label="Latest" value={stats.last} unit={metric.unit} accent />
                        <Stat label="Avg" value={stats.avg} unit={metric.unit} />
                        <Stat label="Min" value={stats.min} unit={metric.unit} />
                        <Stat label="Max" value={stats.max} unit={metric.unit} />
                    </dl>
                )}
            </header>

            <div ref={wrapRef} className="w-full" style={{ height: CHART_HEIGHT }}>
                {ready ? (
                    <svg
                        width={width}
                        height={CHART_HEIGHT}
                        onMouseMove={handleMove}
                        onMouseLeave={onLeave}
                        style={{
                            display: "block",
                            cursor: "crosshair",
                            fontFamily: "var(--font-data)",
                        }}
                    >
                        <g transform={`translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`}>
                            {/* Horizontal grid */}
                            {yTicks.map((t, i) => (
                                <g key={i} transform={`translate(0,${yScale(t)})`}>
                                    <line x2={plotW} stroke={chart.grid} strokeWidth={1} />
                                    <text
                                        x={-10}
                                        dy="0.32em"
                                        textAnchor="end"
                                        fill={chart.tick}
                                        fontSize={11}
                                    >
                                        {formatNumber(t, 1)}
                                    </text>
                                </g>
                            ))}

                            {/* X axis baseline */}
                            <line
                                x1={0}
                                x2={plotW}
                                y1={plotH}
                                y2={plotH}
                                stroke={chart.axis}
                                strokeWidth={1}
                            />

                            {/* X ticks */}
                            {xTicks.map((t, i) => (
                                <g
                                    key={i}
                                    transform={`translate(${xScale(t)},${plotH})`}
                                >
                                    <line y2={4} stroke={chart.axis} />
                                    <text
                                        y={16}
                                        textAnchor="middle"
                                        fill={chart.tick}
                                        fontSize={11}
                                    >
                                        {formatMonth(t)}
                                    </text>
                                </g>
                            ))}

                            {/* Zero reference for storage change */}
                            {metric.key === "changed_storage_mcm" &&
                                yScale.domain()[0] < 0 &&
                                yScale.domain()[1] > 0 && (
                                    <line
                                        x1={0}
                                        x2={plotW}
                                        y1={yScale(0)}
                                        y2={yScale(0)}
                                        stroke={chart.zeroLine}
                                        strokeDasharray="3 3"
                                    />
                                )}

                            {/* Line — themes with lineGlow get a soft blurred
                                under-stroke (double stroke, no SVG filter, so
                                brush drags stay cheap) */}
                            {chart.lineGlow && (
                                <path
                                    d={pathD}
                                    fill="none"
                                    stroke={metric.color}
                                    strokeWidth={7}
                                    strokeOpacity={0.28}
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                />
                            )}
                            <path
                                d={pathD}
                                fill="none"
                                stroke={metric.color}
                                strokeWidth={2}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />

                            {/* Crosshair */}
                            {hoverPoint && (
                                <g pointerEvents="none">
                                    {chart.lineGlow && (
                                        <line
                                            x1={hoverPoint.x}
                                            x2={hoverPoint.x}
                                            y1={0}
                                            y2={plotH}
                                            stroke={chart.crosshair}
                                            strokeWidth={5}
                                            strokeOpacity={0.25}
                                        />
                                    )}
                                    <line
                                        x1={hoverPoint.x}
                                        x2={hoverPoint.x}
                                        y1={0}
                                        y2={plotH}
                                        stroke={chart.crosshair}
                                        strokeWidth={1}
                                    />
                                    {hoverPoint.y != null && (
                                        <circle
                                            cx={hoverPoint.x}
                                            cy={hoverPoint.y}
                                            r={4}
                                            fill={metric.color}
                                            stroke={chart.dotRing}
                                            strokeWidth={2}
                                        />
                                    )}
                                </g>
                            )}
                        </g>

                        {/* Tooltip */}
                        {hoverPoint && (
                            <ChartTooltip
                                width={width}
                                x={hoverPoint.x + CHART_MARGIN.left}
                                y={
                                    hoverPoint.y != null
                                        ? hoverPoint.y + CHART_MARGIN.top
                                        : CHART_MARGIN.top
                                }
                                metric={metric}
                                point={hoverPoint}
                            />
                        )}
                    </svg>
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-[12px] text-ps-bodyGray">
                        {series.length === 0
                            ? "No data"
                            : width === 0
                            ? ""
                            : "No valid values"}
                    </div>
                )}
            </div>
        </section>
    );
}

function ChartTooltip({ width, x, y, metric, point }) {
    const { theme } = useTheme();
    const chart = theme.chart;
    const boxW = 170;
    const boxH = 54;
    // Flip to the other side near the right edge
    const flipped = x + boxW + 14 > width;
    const bx = flipped ? x - boxW - 10 : x + 10;
    const by = Math.max(4, Math.min(y - boxH / 2, CHART_HEIGHT - boxH - 4));
    return (
        <g pointerEvents="none" transform={`translate(${bx},${by})`}>
            <rect
                width={boxW}
                height={boxH}
                rx={12}
                ry={12}
                fill={chart.tooltipBg}
                stroke={chart.tooltipBorder}
                style={{ filter: "drop-shadow(0 5px 9px rgba(0,0,0,0.16))" }}
            />
            <text x={12} y={18} fontSize={11} fill={chart.tooltipInk2} fontWeight={500}>
                {formatDay(point.d._t)}
            </text>
            <text x={12} y={40} fontSize={15} fill={chart.tooltipInk} fontWeight={500}>
                {point.v == null ? "—" : `${formatNumber(point.v, 2)} ${metric.unit}`}
            </text>
        </g>
    );
}

/* ------------------------------------------------------------------ */
/* Stat cell                                                           */
/* ------------------------------------------------------------------ */

function Stat({ label, value, unit, accent }) {
    const display = value == null || !Number.isFinite(value) ? "—" : formatNumber(value, 2);
    return (
        <div className="min-w-0">
            <dt className="text-[10px] uppercase tracking-[0.1em] text-ps-bodyGray font-semibold">
                {label}
            </dt>
            <dd
                className={`mt-0.5 text-[15px] ${
                    accent ? "text-ps-blue font-medium" : "text-ps-charcoal"
                } font-data tabular-nums whitespace-nowrap`}
            >
                {display}
                {accent && value != null && Number.isFinite(value) && (
                    <span className="ml-1 text-[10px] text-ps-bodyGray font-normal">
                        {unit}
                    </span>
                )}
            </dd>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Brush — bottom time-range selector (shared across charts)            */
/* ------------------------------------------------------------------ */

function TimeBrush({ series, fullDomain, domain, onChange, onReset }) {
    const [wrapRef, width] = useContainerWidth();
    const { theme } = useTheme();
    const chart = theme.chart;
    const ready = width > 0 && series.length > 0;

    const plotW = Math.max(0, width - CHART_MARGIN.left - CHART_MARGIN.right);
    const plotH = BRUSH_HEIGHT - 18;

    const xScale = useMemo(() => {
        if (!ready) return null;
        return scaleTime().domain(fullDomain).range([0, plotW]);
    }, [ready, fullDomain, plotW]);

    // Background sparkline (area_km2 if present, else first defined)
    const sparkPath = useMemo(() => {
        if (!ready) return "";
        const key = METRICS.find((m) => series.some((d) => d[m.key] != null))?.key;
        if (!key) return "";
        const [lo, hi] = extent(series, (d) => d[key]);
        if (lo == null || hi == null || lo === hi) return "";
        const y = scaleLinear()
            .domain([lo, hi])
            .range([plotH, 2]);
        const gen = d3Line()
            .defined((d) => d[key] != null && Number.isFinite(d[key]))
            .x((d) => xScale(d._t))
            .y((d) => y(d[key]))
            .curve(curveMonotoneX);
        return gen(series) || "";
    }, [ready, series, xScale, plotH]);

    const x0 = ready ? xScale(domain[0]) : 0;
    const x1 = ready ? xScale(domain[1]) : 0;

    const dragRef = useRef(null);

    const startDrag = (mode) => (e) => {
        if (!ready) return;
        e.preventDefault();
        e.stopPropagation();
        const svg = e.currentTarget.ownerSVGElement;
        const rect = svg.getBoundingClientRect();
        const originX = e.clientX;
        const orig0 = xScale(domain[0]);
        const orig1 = xScale(domain[1]);
        dragRef.current = { mode, originX, orig0, orig1, rect };
        const onMove = (ev) => {
            const s = dragRef.current;
            if (!s) return;
            const dx = ev.clientX - s.originX;
            let a = s.orig0;
            let b = s.orig1;
            if (s.mode === "left") a = Math.min(Math.max(0, s.orig0 + dx), s.orig1 - 6);
            else if (s.mode === "right")
                b = Math.max(Math.min(plotW, s.orig1 + dx), s.orig0 + 6);
            else {
                const w = s.orig1 - s.orig0;
                a = Math.min(Math.max(0, s.orig0 + dx), plotW - w);
                b = a + w;
            }
            onChange([xScale.invert(a), xScale.invert(b)]);
        };
        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            dragRef.current = null;
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    const handleBgClick = (e) => {
        if (!ready) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const px = e.clientX - rect.left - CHART_MARGIN.left;
        const w = x1 - x0;
        let a = Math.min(Math.max(0, px - w / 2), plotW - w);
        let b = a + w;
        onChange([xScale.invert(a), xScale.invert(b)]);
    };

    return (
        <div className="bg-panel rounded-ps-md border border-ps-divider px-0 pt-2 pb-1">
            <div className="flex items-center justify-between px-5 pb-1">
                <div className="text-[10px] uppercase tracking-[0.1em] text-ps-bodyGray font-semibold">
                    Time Range
                </div>
                <button
                    type="button"
                    onClick={onReset}
                    className="text-[11px] text-ps-darkLink hover:text-ps-linkHover transition-colors"
                >
                    Reset
                </button>
            </div>
            <div ref={wrapRef} className="w-full" style={{ height: BRUSH_HEIGHT }}>
                {ready && (
                    <svg
                        width={width}
                        height={BRUSH_HEIGHT}
                        style={{ display: "block", fontFamily: "var(--font-data)" }}
                        onMouseDown={handleBgClick}
                    >
                        <g transform={`translate(${CHART_MARGIN.left},4)`}>
                            <rect
                                x={0}
                                y={0}
                                width={plotW}
                                height={plotH}
                                fill={chart.brushTrack}
                                rx={6}
                            />
                            <path
                                d={sparkPath}
                                fill="none"
                                stroke={chart.brushSpark}
                                strokeWidth={1}
                            />
                            {/* Selection */}
                            <rect
                                x={x0}
                                y={0}
                                width={Math.max(0, x1 - x0)}
                                height={plotH}
                                fill={chart.brushAccent}
                                fillOpacity={0.12}
                                stroke={chart.brushAccent}
                                strokeWidth={1}
                                style={{ cursor: "grab" }}
                                onMouseDown={startDrag("move")}
                            />
                            {/* Left handle */}
                            <rect
                                x={x0 - 4}
                                y={-2}
                                width={8}
                                height={plotH + 4}
                                rx={2}
                                fill={chart.brushAccent}
                                style={{ cursor: "ew-resize" }}
                                onMouseDown={startDrag("left")}
                            />
                            {/* Right handle */}
                            <rect
                                x={x1 - 4}
                                y={-2}
                                width={8}
                                height={plotH + 4}
                                rx={2}
                                fill={chart.brushAccent}
                                style={{ cursor: "ew-resize" }}
                                onMouseDown={startDrag("right")}
                            />
                            {/* Labels */}
                            <text
                                x={0}
                                y={plotH + 14}
                                fontSize={10}
                                fill={chart.tick}
                            >
                                {formatDay(fullDomain[0])}
                            </text>
                            <text
                                x={plotW}
                                y={plotH + 14}
                                fontSize={10}
                                fill={chart.tick}
                                textAnchor="end"
                            >
                                {formatDay(fullDomain[1])}
                            </text>
                        </g>
                    </svg>
                )}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Main panel                                                          */
/* ------------------------------------------------------------------ */

export default function DynamicPanel({ station, onClose }) {
    const rootRef = useRef(null);
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [raw, setRaw] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeKeys, setActiveKeys] = useState(() => METRICS.map((m) => m.key));
    const [hoverIdx, setHoverIdx] = useState(null);
    const [domain, setDomain] = useState(null);

    useEffect(() => {
        if (!station) return;
        let alive = true;
        setLoading(true);
        setError(null);
        setRaw(null);
        setHoverIdx(null);
        setDomain(null);
        loadDynamicSeries(station.SEAWEA_ID)
            .then((s) => {
                if (!alive) return;
                setRaw(s || []);
                setLoading(false);
            })
            .catch((e) => {
                if (!alive) return;
                setError(e.message || "Failed to load dynamic data");
                setLoading(false);
            });
        return () => {
            alive = false;
        };
    }, [station?.SEAWEA_ID]);

    const series = useMemo(() => parseSeries(raw), [raw]);

    const fullDomain = useMemo(() => {
        if (series.length === 0) return null;
        return [series[0]._t, series[series.length - 1]._t];
    }, [series]);

    // Initialize domain once we have data
    useEffect(() => {
        if (fullDomain && !domain) setDomain(fullDomain);
    }, [fullDomain, domain]);

    const onHover = useCallback((i) => setHoverIdx(i), []);
    const onLeave = useCallback(() => setHoverIdx(null), []);

    const toggle = (key) => {
        setActiveKeys((prev) => {
            if (prev.includes(key)) {
                if (prev.length === 1) return prev;
                return prev.filter((k) => k !== key);
            }
            return METRICS.map((m) => m.key).filter(
                (k) => k === key || prev.includes(k)
            );
        });
    };

    const title =
        station?.reservoir_name ||
        station?.station_name ||
        station?.dam_name ||
        "Station";

    // Merge theme series colors into the metric configs at render.
    const metrics = useMemo(
        () => METRICS.map((m) => ({ ...m, color: theme.chart.series[m.key] })),
        [theme]
    );
    const visibleMetrics = metrics.filter((m) => activeKeys.includes(m.key));

    return (
        <div
            ref={rootRef}
            className="h-full w-full flex flex-col bg-page border-t border-ps-divider"
        >
            {/* Header */}
            <div className="flex-shrink-0 bg-panel border-b border-ps-divider">
                <div className="flex items-center gap-5 px-6 py-3">
                    <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase tracking-[0.12em] text-ps-bodyGray font-semibold">
                            Dynamic Time Series
                        </div>
                        <h2
                            className="mt-0.5 text-[22px] font-light text-ps-charcoal leading-tight truncate font-display"
                            style={{ letterSpacing: "0.1px" }}
                            title={title}
                        >
                            {title}
                        </h2>
                    </div>

                    {fullDomain && (
                        <div className="hidden md:flex flex-col items-end text-right">
                            <div className="text-[10px] uppercase tracking-[0.1em] text-ps-bodyGray font-semibold">
                                Period
                            </div>
                            <div className="text-[13px] text-ps-charcoal font-data tabular-nums">
                                {formatMonth(fullDomain[0])} — {formatMonth(fullDomain[1])}
                                <span className="ml-2 text-ps-bodyGray">
                                    · {series.length} pts
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                        {metrics.map((m) => {
                            const on = activeKeys.includes(m.key);
                            return (
                                <button
                                    key={m.key}
                                    type="button"
                                    onClick={() => toggle(m.key)}
                                    aria-pressed={on}
                                    title={on ? `Hide ${m.label}` : `Show ${m.label}`}
                                    className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-[12px] font-medium transition-all duration-[180ms] ease-ps ${
                                        on
                                            ? "bg-panel border-ps-mute text-ps-charcoal hover:bg-ps-cyan hover:text-on-accent hover:border-on-accent"
                                            : "bg-transparent border-ps-divider text-ps-bodyGray hover:text-ps-charcoal"
                                    }`}
                                    style={
                                        on
                                            ? {
                                                  boxShadow: "none",
                                              }
                                            : undefined
                                    }
                                >
                                    <span
                                        className="h-2 w-2 rounded-full"
                                        style={{
                                            background: on ? m.color : "transparent",
                                            border: on
                                                ? "none"
                                                : "1px solid var(--line-strong)",
                                        }}
                                    />
                                    {m.label}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close dynamic panel"
                        className="flex-shrink-0 h-9 w-9 rounded-full border border-ps-divider bg-panel text-ps-charcoal flex items-center justify-center transition-all duration-[180ms] ease-ps hover:bg-ps-cyan hover:text-on-accent hover:border-on-accent"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path
                                d="M2 2L12 12M12 2L2 12"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                {!mounted || loading ? (
                    <div className="h-full min-h-[200px] flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block h-8 w-8 rounded-full border-2 border-ps-blue/30 border-t-ps-blue animate-spin" />
                            <p className="mt-3 text-[12px] text-ps-bodyGray">
                                Loading time series…
                            </p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="h-full flex items-center justify-center p-6">
                        <div className="max-w-md text-center">
                            <div className="text-[10px] uppercase tracking-[0.12em] text-ps-red font-semibold">
                                Error
                            </div>
                            <p className="mt-1 text-[14px] text-ps-charcoal">{error}</p>
                        </div>
                    </div>
                ) : series.length === 0 ? (
                    <div className="h-full flex items-center justify-center p-6">
                        <p className="text-[13px] text-ps-bodyGray italic">
                            No dynamic records available for this station.
                        </p>
                    </div>
                ) : (
                    <div className="p-5 space-y-4">
                        <div className="grid gap-4 grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
                            {visibleMetrics.map((m) => (
                                <MetricChart
                                    key={m.key}
                                    metric={m}
                                    series={series}
                                    xDomain={domain || fullDomain}
                                    hoverIdx={hoverIdx}
                                    onHover={onHover}
                                    onLeave={onLeave}
                                />
                            ))}
                        </div>
                        {fullDomain && domain && (
                            <TimeBrush
                                series={series}
                                fullDomain={fullDomain}
                                domain={domain}
                                onChange={setDomain}
                                onReset={() => setDomain(fullDomain)}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
