import React, { useEffect, useMemo, useRef, useState } from "react";
import { loadDynamicSeries } from "../../utils/dataLoader";
import { formatNumber } from "../../utils/constants";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

const METRICS = [
    { key: "area_km2", label: "Area", unit: "km²", color: "#53b1ff" },
    { key: "elevation_m", label: "Elevation", unit: "m", color: "#1eaedb" },
    { key: "changed_storage_mcm", label: "Storage Δ", unit: "MCM", color: "#0070cc" },
];

// When the panel is narrow we wrap to a second (or third) row instead of
// squashing each chart horizontally.
const MIN_CHART_WIDTH = 360;

function Stat({ label, value, unit }) {
    return (
        <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-ps-bodyGray">
                {label}
            </div>
            <div className="text-ps-charcoal font-medium text-[13px]">
                {formatNumber(value)}
                {unit && <span className="text-ps-bodyGray font-normal ml-1">{unit}</span>}
            </div>
        </div>
    );
}

function MetricChart({ metric, data, panelHeight, columns, summary }) {
    // Each row fills its share of the scroll-area height. Header (~76px) +
    // outer p-4 padding (32px) + inter-row gap (16px) eats into the budget.
    const rows = Math.ceil(METRICS.length / columns);
    const available = Math.max(220, panelHeight - 108);
    const perRow = (available - (rows - 1) * 16) / rows;
    // Card chrome: p-4 (32 vertical) + title row (~28) + mb-2 (8).
    const chartHeight = Math.max(160, perRow - 68);

    return (
        <div className="bg-white rounded-ps-md border border-[#eceff3] p-4 flex flex-col min-w-0">
            <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                    <span
                        className="h-2.5 w-2.5 rounded-full inline-block"
                        style={{ background: metric.color }}
                    />
                    <div
                        className="text-[15px] font-medium text-ps-charcoal"
                        style={{ letterSpacing: "-0.1px" }}
                    >
                        {metric.label}
                    </div>
                    <div className="text-[11px] text-ps-bodyGray">{metric.unit}</div>
                </div>
                {summary && (
                    <div className="flex items-center gap-3">
                        <Stat label="Min" value={summary.min} />
                        <Stat label="Avg" value={summary.avg} />
                        <Stat label="Max" value={summary.max} />
                    </div>
                )}
            </div>
            <div style={{ width: "100%", height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 6, right: 14, left: 0, bottom: 0 }}
                        syncId="dynamic-info"
                    >
                        <CartesianGrid stroke="#eef1f5" strokeDasharray="3 3" />
                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 11, fill: "#6b6b6b" }}
                            minTickGap={40}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "#6b6b6b" }}
                            width={56}
                            domain={["auto", "auto"]}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: 12,
                                border: "none",
                                boxShadow: "0 5px 14px rgba(0,0,0,0.14)",
                                fontSize: 12,
                            }}
                            formatter={(v) => [
                                `${formatNumber(v)} ${metric.unit}`,
                                metric.label,
                            ]}
                        />
                        <Line
                            type="monotone"
                            dataKey={metric.key}
                            stroke={metric.color}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive
                            animationDuration={600}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default function DynamicPanel({ station, onClose, containerRef }) {
    const [series, setSeries] = useState(null);
    const [loading, setLoading] = useState(true);
    const [size, setSize] = useState({ w: 0, h: 0 });
    const selfRef = useRef(null);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setSeries(null);
        loadDynamicSeries(station.SEAWEA_ID)
            .then((data) => {
                if (alive) {
                    setSeries(data || []);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (alive) {
                    setSeries([]);
                    setLoading(false);
                }
            });
        return () => {
            alive = false;
        };
    }, [station.SEAWEA_ID]);

    // Track inner size to pick columns & chart height.
    useEffect(() => {
        const el = selfRef.current;
        if (!el || typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize({ w: width, h: height });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const summary = useMemo(() => {
        if (!series || series.length === 0) return null;
        const s = {};
        for (const m of METRICS) {
            const vals = series.map((r) => r[m.key]).filter((v) => Number.isFinite(v));
            if (vals.length === 0) continue;
            s[m.key] = {
                min: Math.min(...vals),
                max: Math.max(...vals),
                avg: vals.reduce((a, b) => a + b, 0) / vals.length,
                n: vals.length,
            };
        }
        return s;
    }, [series]);

    // Determine column count: widest layout first, wrap when width falls below
    // the threshold times the number of charts per row.
    const columns = useMemo(() => {
        const w = size.w || 800;
        if (w >= MIN_CHART_WIDTH * 3 + 48) return 3;
        if (w >= MIN_CHART_WIDTH * 2 + 32) return 2;
        return 1;
    }, [size.w]);

    return (
        <div
            ref={selfRef}
            className="h-full w-full bg-[linear-gradient(180deg,#ffffff,#f5f7fa)] border-t border-[#eceff3] flex flex-col"
        >
            <div className="flex items-center justify-between px-6 py-3 border-b border-[#eceff3] bg-white">
                <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-ps-blue font-semibold">
                        Dynamic Info
                    </div>
                    <h3
                        className="text-[18px] font-light text-ps-charcoal truncate"
                        style={{ letterSpacing: "-0.1px" }}
                    >
                        {station.reservoir_name || station.station_name || station.dam_name}
                    </h3>
                </div>
                <div className="flex items-center gap-3">
                    {series && series.length > 0 && (
                        <span className="text-[11px] text-ps-bodyGray">
                            {series.length} observations · hover any chart to sync
                        </span>
                    )}
                    <button
                        className="h-9 w-9 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-ps-charcoal flex items-center justify-center"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
                {loading ? (
                    <div className="h-full w-full flex items-center justify-center text-ps-bodyGray">
                        Loading time series…
                    </div>
                ) : !series || series.length === 0 ? (
                    <div className="h-full w-full flex items-center justify-center text-ps-bodyGray">
                        No dynamic data for this station.
                    </div>
                ) : (
                    <div
                        className="grid gap-4"
                        style={{
                            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                        }}
                    >
                        {METRICS.map((m) => (
                            <MetricChart
                                key={m.key}
                                metric={m}
                                data={series}
                                panelHeight={size.h}
                                columns={columns}
                                summary={summary?.[m.key]}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
