import React, { useEffect, useMemo, useState } from "react";
import {
    MAIN_USES,
    USE_LABEL,
    NUMERIC_ATTRIBUTES,
    SUMMARY_CLASSES,
    formatNumber,
} from "../../utils/constants";
import UseIcon from "../icons/UseIcon";
import { useTheme } from "../Theme/ThemeProvider";

const SIZE_MIN = 22;
const SIZE_MAX = 44;

function CriticalSwatch({ size, label, color = "var(--ink-3)" }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <div
                className="rounded-full border-2 border-white"
                style={{
                    width: size,
                    height: size,
                    background: color,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
                }}
            />
            <span className="text-[10px] text-ps-bodyGray">{label}</span>
        </div>
    );
}

export default function Legend({
    attributeKey,
    attributeRange,
    usesInView,
    hasCritical,
    hasNonCritical,
    summaryVisible,
}) {
    const [open, setOpen] = useState(true);
    const { theme } = useTheme();

    // Phones start with the legend collapsed — expanded it covers most of the
    // map. One-time on mount; the user's toggle wins afterwards.
    useEffect(() => {
        if (window.matchMedia("(max-width: 1023px)").matches) setOpen(false);
    }, []);
    const attrMeta = NUMERIC_ATTRIBUTES.find((a) => a.key === attributeKey);
    const attrLabel = attrMeta?.label || attributeKey;
    const summaryMode = attrMeta?.summary === "sum" ? "sum" : "count";

    const uses = useMemo(() => {
        const set = new Set(usesInView || []);
        return MAIN_USES.filter((u) => set.has(u));
    }, [usesInView]);

    const midValue =
        Number.isFinite(attributeRange?.min) && Number.isFinite(attributeRange?.max)
            ? (attributeRange.min + attributeRange.max) / 2
            : null;

    return (
        <div
            className="absolute bottom-6 left-4 z-[400] glass-panel rounded-ps-md overflow-hidden shadow-float"
            style={{
                width: open ? "min(260px, calc(100vw - 2rem))" : "auto",
            }}
        >
            <button
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-panel-soft transition"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
            >
                <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="5" width="4" height="4" rx="1" fill={theme.tokens.accent} />
                        <rect x="9" y="5" width="12" height="2" rx="1" fill={theme.tokens.ink2} />
                        <rect x="3" y="11" width="4" height="4" rx="1" fill={theme.tokens.accent2} />
                        <rect x="9" y="11" width="12" height="2" rx="1" fill={theme.tokens.ink2} />
                        <rect x="3" y="17" width="4" height="4" rx="1" fill={theme.data.use.Irrigation} />
                        <rect x="9" y="17" width="12" height="2" rx="1" fill={theme.tokens.ink2} />
                    </svg>
                    <span className="text-[12px] uppercase tracking-[0.1em] font-semibold text-ps-charcoal">
                        Legend
                    </span>
                </div>
                <span className="text-ps-bodyGray text-[14px]">{open ? "–" : "+"}</span>
            </button>

            {open && (
                <div
                    className="px-4 pb-4 space-y-4 overflow-y-auto overflow-x-hidden"
                    style={{ maxHeight: "60vh" }}
                >
                    {/* Summary bars — only while Summary mode is on */}
                    {summaryVisible && (
                        <div>
                            <div className="text-[10px] uppercase tracking-[0.08em] text-ps-bodyGray font-semibold">
                                Summary Bars
                            </div>
                            <p className="mt-1 text-[11px] text-ps-bodyGray leading-snug">
                                Bar height = {summaryMode} of {attrLabel}.
                            </p>
                            <div className="mt-2 space-y-1.5">
                                {SUMMARY_CLASSES.map((c) => (
                                    <div key={c.key} className="flex items-center gap-2">
                                        <span
                                            className="flex-none w-3 h-3 rounded-[2px]"
                                            style={{ background: theme.data.summary[c.key] }}
                                        />
                                        <span className="text-[12px] text-ps-charcoal">
                                            {c.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Station type */}
                    <div>
                        <div className="text-[10px] uppercase tracking-[0.08em] text-ps-bodyGray font-semibold">
                            Station Type
                        </div>
                        <div className="mt-2 space-y-2">
                            {hasCritical && (
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-none w-8 h-8 flex items-center justify-center">
                                        <div
                                            className="ps-legend-pulse w-3.5 h-3.5 rounded-full border-2 border-white"
                                            style={{ background: "var(--ink-3)" }}
                                        />
                                    </div>
                                    <div>
                                        <div className="text-[13px] text-ps-charcoal font-medium leading-tight">
                                            Critical
                                        </div>
                                        <div className="text-[11px] text-ps-bodyGray leading-tight">
                                            Pulsing ring
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasNonCritical && (
                                <div className="flex items-center gap-3">
                                    <div className="flex-none w-8 h-8 flex items-center justify-center">
                                        <div
                                            className="w-3.5 h-3.5 rounded-full border-2 border-white"
                                            style={{
                                                background: "var(--ink-3)",
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <div className="text-[13px] text-ps-charcoal font-medium leading-tight">
                                            Non-critical
                                        </div>
                                        <div className="text-[11px] text-ps-bodyGray leading-tight">
                                            No ring
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Size scale (critical only) */}
                    {hasCritical && (
                        <div>
                            <div className="text-[10px] uppercase tracking-[0.08em] text-ps-bodyGray font-semibold">
                                Size = {attrLabel}
                            </div>
                            {Number.isFinite(attributeRange?.min) ? (
                                <>
                                    <div className="mt-3 flex items-end justify-between px-2">
                                        <CriticalSwatch
                                            size={SIZE_MIN}
                                            label={formatNumber(attributeRange.min)}
                                        />
                                        <CriticalSwatch
                                            size={(SIZE_MIN + SIZE_MAX) / 2}
                                            label={formatNumber(midValue)}
                                        />
                                        <CriticalSwatch
                                            size={SIZE_MAX}
                                            label={formatNumber(attributeRange.max)}
                                        />
                                    </div>
                                    <p className="mt-2 text-[11px] text-ps-bodyGray">
                                        Applies to critical stations. Non-critical dots stay a
                                        fixed size.
                                    </p>
                                </>
                            ) : (
                                <p className="mt-2 text-[11px] text-ps-bodyGray italic">
                                    No {attrLabel} values in view.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Use colors */}
                    {uses.length > 0 && (
                        <div>
                            <div className="text-[10px] uppercase tracking-[0.08em] text-ps-bodyGray font-semibold">
                                Main Use (color)
                            </div>
                            <div className="mt-2 space-y-1.5">
                                {uses.map((u) => (
                                    <div key={u} className="flex items-center gap-2">
                                        <span
                                            className="flex-none w-3 h-3 rounded-full"
                                            style={{ background: theme.data.use[u] }}
                                        />
                                        <span className="flex-none text-ps-bodyGray">
                                            <UseIcon use={u} size={12} />
                                        </span>
                                        <span className="text-[12px] text-ps-charcoal">
                                            {USE_LABEL[u] || u}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
