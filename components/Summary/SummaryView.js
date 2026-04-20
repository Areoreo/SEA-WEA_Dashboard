import React, { useEffect, useMemo, useState } from "react";
import { assignFeature } from "../../utils/geoUtils";
import {
    COUNTRY_COLORS,
    BASIN_COLORS,
    NUMERIC_ATTRIBUTES,
    formatNumber,
} from "../../utils/constants";

function Bar3D({ label, value, maxValue, color, critical, total, delay }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 40 + delay);
        return () => clearTimeout(t);
    }, [delay]);

    const pct = maxValue > 0 ? Math.max(0.03, value / maxValue) : 0;
    const heightPx = Math.round(260 * pct);

    return (
        <div className="flex flex-col items-center gap-3 min-w-[92px]">
            <div className="relative h-[280px] w-[56px] flex items-end justify-center">
                {/* floor shadow */}
                <div
                    className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-[72px] h-[10px] rounded-full"
                    style={{
                        background:
                            "radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 70%)",
                        opacity: mounted ? 1 : 0,
                        transition: "opacity 600ms ease",
                    }}
                />
                <div
                    className="relative"
                    style={{
                        width: 56,
                        height: mounted ? heightPx : 0,
                        transition: "height 900ms cubic-bezier(0.22, 1, 0.36, 1)",
                        transitionDelay: `${delay}ms`,
                        transformStyle: "preserve-3d",
                    }}
                >
                    {/* front face */}
                    <div
                        className="absolute inset-0 rounded-t-[4px]"
                        style={{
                            background: `linear-gradient(180deg, ${color} 0%, ${shade(
                                color,
                                -20
                            )} 100%)`,
                            boxShadow: "inset 0 -2px 0 rgba(255,255,255,0.25)",
                        }}
                    />
                    {/* top face */}
                    <div
                        className="absolute left-0 right-0"
                        style={{
                            top: -10,
                            height: 20,
                            background: `linear-gradient(180deg, ${shade(color, 18)} 0%, ${color} 100%)`,
                            transform: "skewX(-45deg) translateX(10px)",
                            transformOrigin: "bottom left",
                            borderTopLeftRadius: 2,
                            borderTopRightRadius: 2,
                        }}
                    />
                    {/* right face */}
                    <div
                        className="absolute top-0 bottom-0"
                        style={{
                            right: -10,
                            width: 20,
                            background: `linear-gradient(90deg, ${shade(color, -15)} 0%, ${shade(
                                color,
                                -35
                            )} 100%)`,
                            transform: "skewY(-45deg) translateY(10px)",
                            transformOrigin: "bottom left",
                        }}
                    />
                    {/* critical overlay fill — cyan top segment */}
                    {critical > 0 && total > 0 && (
                        <div
                            className="absolute left-0 right-0 bottom-0 rounded-t-[2px]"
                            style={{
                                height: `${(critical / total) * 100}%`,
                                background:
                                    "linear-gradient(180deg, rgba(30,174,219,0.9) 0%, rgba(0,112,204,0.85) 100%)",
                                boxShadow: "inset 0 -2px 0 rgba(255,255,255,0.35)",
                                transition: "opacity 600ms ease",
                                opacity: mounted ? 1 : 0,
                                transitionDelay: `${delay + 200}ms`,
                            }}
                        />
                    )}
                </div>
            </div>
            <div className="text-center">
                <div
                    className="text-[20px] font-light text-ps-charcoal leading-none"
                    style={{ letterSpacing: "-0.1px" }}
                >
                    {formatNumber(value)}
                </div>
                <div className="mt-1 text-[12px] uppercase tracking-[0.08em] text-ps-bodyGray">
                    {label}
                </div>
                {total != null && (
                    <div className="mt-1 text-[11px] text-ps-bodyGray">
                        {critical} critical · {total - critical} non-critical
                    </div>
                )}
            </div>
        </div>
    );
}

function shade(hex, percent) {
    const h = hex.replace("#", "");
    const num = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    let r = (num >> 16) + Math.round((percent / 100) * 255);
    let g = ((num >> 8) & 0xff) + Math.round((percent / 100) * 255);
    let b = (num & 0xff) + Math.round((percent / 100) * 255);
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default function SummaryView({
    open,
    onClose,
    stations,
    boundaries,
    spatialUnit,
    selectedAttribute,
}) {
    const [metric, setMetric] = useState("count");
    const [attr, setAttr] = useState(selectedAttribute);
    useEffect(() => setAttr(selectedAttribute), [selectedAttribute]);

    const groups = useMemo(() => {
        if (!open || !boundaries) return [];
        const isCountry = spatialUnit === "countries";
        const fc = isCountry ? boundaries.countries : boundaries.basins;
        const labelKey = isCountry ? "country" : "basin";
        const colorMap = isCountry ? COUNTRY_COLORS : BASIN_COLORS;
        const agg = {};
        for (const f of fc.features) {
            const label = f.properties[labelKey];
            agg[label] = {
                label,
                color: colorMap[label] || "#9aa5b1",
                count: 0,
                critical: 0,
                attrSum: 0,
            };
        }
        for (const s of stations) {
            let label = isCountry
                ? s.country
                : assignFeature(s.longitude, s.latitude, fc, labelKey);
            if (!label || !agg[label]) {
                if (!agg["Other"]) {
                    agg["Other"] = { label: "Other", color: "#9aa5b1", count: 0, critical: 0, attrSum: 0 };
                }
                label = "Other";
            }
            agg[label].count += 1;
            if (s.is_critical) agg[label].critical += 1;
            if (Number.isFinite(s[attr])) agg[label].attrSum += s[attr];
        }
        return Object.values(agg)
            .filter((g) => g.count > 0)
            .sort((a, b) => (metric === "count" ? b.count - a.count : b.attrSum - a.attrSum));
    }, [open, boundaries, spatialUnit, stations, attr, metric]);

    if (!open) return null;

    const getValue = (g) => (metric === "count" ? g.count : g.attrSum);
    const maxVal = Math.max(1, ...groups.map(getValue));
    const total = groups.reduce((acc, g) => acc + g.count, 0);
    const criticalTotal = groups.reduce((acc, g) => acc + g.critical, 0);
    const attrTotal = groups.reduce((acc, g) => acc + g.attrSum, 0);
    const attrLabel = NUMERIC_ATTRIBUTES.find((a) => a.key === attr)?.label || attr;

    return (
        <div
            className="fixed inset-0 z-[1000] bg-black/55 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-ps-lg w-[min(1080px,96vw)] max-h-[92vh] overflow-y-auto"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.45)" }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] flex items-center justify-center text-ps-charcoal text-lg"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ✕
                </button>

                <div className="p-8 pb-6">
                    <div className="text-[11px] uppercase tracking-[0.15em] font-semibold text-ps-blue">
                        Summary
                    </div>
                    <h2
                        className="mt-1 text-[32px] font-light text-ps-charcoal leading-[1.15]"
                        style={{ letterSpacing: "-0.1px" }}
                    >
                        {spatialUnit === "countries"
                            ? "Stations by Country"
                            : "Stations by Basin"}
                    </h2>
                    <p className="mt-2 text-[14px] text-ps-bodyGray">
                        Aggregated on real{" "}
                        {spatialUnit === "countries" ? "country" : "basin"} boundaries across the
                        research region.
                    </p>

                    {/* Top stats */}
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        <StatBlock label="Total Stations" value={total} />
                        <StatBlock
                            label="Critical"
                            value={criticalTotal}
                            accent="#1eaedb"
                            hint={total > 0 ? `${Math.round((criticalTotal / total) * 100)}%` : null}
                        />
                        <StatBlock
                            label={attrLabel}
                            value={formatNumber(attrTotal)}
                            accent="#0070cc"
                        />
                    </div>

                    {/* Controls */}
                    <div className="mt-6 flex items-center gap-3 flex-wrap">
                        <div className="inline-flex rounded-pill bg-[#f1f5f9] p-1">
                            <button
                                className={`px-4 py-1.5 rounded-pill text-[13px] font-medium transition ${
                                    metric === "count"
                                        ? "bg-white text-ps-charcoal shadow-ps-1"
                                        : "text-ps-bodyGray"
                                }`}
                                onClick={() => setMetric("count")}
                            >
                                Station Count
                            </button>
                            <button
                                className={`px-4 py-1.5 rounded-pill text-[13px] font-medium transition ${
                                    metric === "attr"
                                        ? "bg-white text-ps-charcoal shadow-ps-1"
                                        : "text-ps-bodyGray"
                                }`}
                                onClick={() => setMetric("attr")}
                            >
                                Attribute Sum
                            </button>
                        </div>
                        {metric === "attr" && (
                            <select
                                value={attr}
                                onChange={(e) => setAttr(e.target.value)}
                                className="bg-white border border-[#cccccc] rounded-ps-sm py-1.5 px-3 text-[13px] text-ps-charcoal focus:outline-none focus:ring-2 focus:ring-ps-blue"
                            >
                                {NUMERIC_ATTRIBUTES.map((a) => (
                                    <option key={a.key} value={a.key}>
                                        {a.label}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                <div className="px-8 pb-8">
                    <div className="rounded-ps-lg bg-[linear-gradient(180deg,#ffffff_0%,#f5f7fa_100%)] p-6 border border-[#eceff3]">
                        <div className="flex items-end gap-8 pt-6 pb-4 overflow-x-auto">
                            {groups.map((g, i) => (
                                <Bar3D
                                    key={g.label}
                                    label={g.label}
                                    value={getValue(g)}
                                    maxValue={maxVal}
                                    color={g.color}
                                    critical={g.critical}
                                    total={metric === "count" ? g.count : null}
                                    delay={i * 80}
                                />
                            ))}
                        </div>
                        <div className="mt-6 flex items-center gap-4 text-[12px] text-ps-bodyGray">
                            <div className="inline-flex items-center gap-2">
                                <span
                                    className="h-2 w-4 rounded-sm inline-block"
                                    style={{ background: "linear-gradient(180deg,#1eaedb,#0070cc)" }}
                                />
                                Critical share
                            </div>
                            <div className="inline-flex items-center gap-2">
                                <span className="h-2 w-4 rounded-sm bg-[#cfd9e3] inline-block" />
                                Non-critical
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBlock({ label, value, accent, hint }) {
    return (
        <div className="rounded-ps-md bg-[#f8fafc] border border-[#eceff3] p-4">
            <div className="text-[11px] uppercase tracking-[0.1em] text-ps-bodyGray font-medium">
                {label}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
                <div
                    className="text-[28px] font-light leading-none"
                    style={{ color: accent || "#1f1f1f", letterSpacing: "-0.1px" }}
                >
                    {typeof value === "number" ? value.toLocaleString() : value}
                </div>
                {hint && <div className="text-[12px] text-ps-bodyGray">{hint}</div>}
            </div>
        </div>
    );
}
