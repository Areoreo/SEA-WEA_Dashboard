import React, { useEffect, useMemo, useState } from "react";
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
    Legend,
} from "recharts";

const METRICS = [
    { key: "area_km2", label: "Area (km²)", color: "#53b1ff" },
    { key: "elevation_m", label: "Elevation (m)", color: "#1eaedb" },
    { key: "changed_storage_mcm", label: "Storage Δ (MCM)", color: "#0070cc" },
];

function MetricToggle({ label, color, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center gap-2 rounded-pill px-3 py-1 text-[13px] font-medium transition border"
            style={{
                background: active ? color : "#fff",
                color: active ? "#fff" : "#1f1f1f",
                borderColor: active ? "transparent" : "#e4e7eb",
            }}
        >
            <span
                className="h-2.5 w-2.5 rounded-full inline-block"
                style={{ background: color }}
            />
            {label}
        </button>
    );
}

export default function DynamicPanel({ station, onClose }) {
    const [series, setSeries] = useState(null);
    const [loading, setLoading] = useState(true);
    const [active, setActive] = useState(["area_km2", "elevation_m", "changed_storage_mcm"]);

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

    const chartData = useMemo(
        () =>
            (series || []).map((r) => ({
                time: r.time,
                area_km2: r.area_km2,
                elevation_m: r.elevation_m,
                changed_storage_mcm: r.changed_storage_mcm,
            })),
        [series]
    );

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

    const toggle = (k) =>
        setActive((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

    return (
        <div className="h-full w-full bg-white border-t border-[#eceff3] flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 border-b border-[#eceff3]">
                <div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-ps-blue font-semibold">
                        Dynamic Info
                    </div>
                    <h3
                        className="text-[18px] font-light text-ps-charcoal"
                        style={{ letterSpacing: "-0.1px" }}
                    >
                        {station.reservoir_name || station.station_name || station.dam_name}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    {METRICS.map((m) => (
                        <MetricToggle
                            key={m.key}
                            label={m.label}
                            color={m.color}
                            active={active.includes(m.key)}
                            onClick={() => toggle(m.key)}
                        />
                    ))}
                    <button
                        className="h-9 w-9 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-ps-charcoal flex items-center justify-center ml-2"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-[1fr_280px] flex-1 overflow-hidden">
                <div className="p-4">
                    {loading ? (
                        <div className="h-full w-full flex items-center justify-center text-ps-bodyGray">
                            Loading time series…
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="h-full w-full flex items-center justify-center text-ps-bodyGray">
                            No dynamic data for this station.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid stroke="#eef1f5" strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="time"
                                    tick={{ fontSize: 11, fill: "#6b6b6b" }}
                                    minTickGap={30}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: "#6b6b6b" }}
                                    width={60}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 12,
                                        border: "none",
                                        boxShadow: "0 5px 14px rgba(0,0,0,0.14)",
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                {METRICS.filter((m) => active.includes(m.key)).map((m) => (
                                    <Line
                                        key={m.key}
                                        type="monotone"
                                        dataKey={m.key}
                                        stroke={m.color}
                                        strokeWidth={2}
                                        dot={false}
                                        name={m.label}
                                        isAnimationActive
                                        animationDuration={700}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
                <div className="p-4 border-l border-[#eceff3] overflow-y-auto bg-[linear-gradient(180deg,#ffffff,#f5f7fa)]">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-ps-bodyGray font-semibold">
                        Statistics
                    </div>
                    {!summary ? (
                        <p className="mt-3 text-[13px] text-ps-bodyGray">—</p>
                    ) : (
                        METRICS.map((m) => {
                            const s = summary[m.key];
                            if (!s) return null;
                            return (
                                <div key={m.key} className="mt-4">
                                    <div className="flex items-center gap-2 text-[13px] font-medium text-ps-charcoal">
                                        <span
                                            className="h-2.5 w-2.5 rounded-full inline-block"
                                            style={{ background: m.color }}
                                        />
                                        {m.label}
                                    </div>
                                    <div className="mt-1 grid grid-cols-3 gap-2 text-[12px] text-ps-bodyGray">
                                        <div>
                                            <div className="text-[10px] uppercase">Min</div>
                                            <div className="text-ps-charcoal font-medium text-[13px]">
                                                {formatNumber(s.min)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase">Avg</div>
                                            <div className="text-ps-charcoal font-medium text-[13px]">
                                                {formatNumber(s.avg)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase">Max</div>
                                            <div className="text-ps-charcoal font-medium text-[13px]">
                                                {formatNumber(s.max)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    {series && (
                        <p className="mt-5 text-[11px] text-ps-bodyGray">
                            {series.length} observations
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
