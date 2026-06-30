import React from "react";
import {
    MAIN_USES,
    USE_COLORS,
    USE_LABEL,
    COUNTRIES,
    BASINS,
    BASIN_LABEL,
    NUMERIC_ATTRIBUTES,
} from "../../utils/constants";
import UseIcon from "../icons/UseIcon";

function SectionTitle({ children }) {
    return (
        <h3
            className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ps-bodyGray mt-6 mb-2"
            style={{ letterSpacing: "0.08em" }}
        >
            {children}
        </h3>
    );
}

function Toggle({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 text-[14px] font-medium rounded-pill px-4 py-2 transition-all duration-200 border-2 ${
                active
                    ? "bg-ps-blue text-white border-transparent shadow-ps-2"
                    : "bg-white text-ps-charcoal border-[#e4e7eb] hover:border-ps-blue"
            }`}
        >
            {children}
        </button>
    );
}

function Chip({ active, onClick, color, children, icon }) {
    return (
        <button
            onClick={onClick}
            className={`group inline-flex items-center gap-2 rounded-pill px-3 py-[6px] text-[13px] font-medium border transition-all duration-150 ${
                active
                    ? "text-white border-transparent shadow-ps-1"
                    : "bg-white text-ps-charcoal border-[#e4e7eb] hover:border-ps-blue"
            }`}
            style={active ? { backgroundColor: color || "#0070cc" } : {}}
        >
            {icon && (
                <span
                    className="inline-flex items-center justify-center"
                    style={{ color: active ? "#fff" : color || "#0070cc" }}
                >
                    {icon}
                </span>
            )}
            <span>{children}</span>
        </button>
    );
}

export default function Sidebar({ options, update, summaryOpen, onOpenSummary }) {
    const toggleUse = (use) => {
        const next = options.selectedUses.includes(use)
            ? options.selectedUses.filter((u) => u !== use)
            : [...options.selectedUses, use];
        update("selectedUses", next);
    };
    const toggleCountry = (c) => {
        const next = options.selectedCountries.includes(c)
            ? options.selectedCountries.filter((x) => x !== c)
            : [...options.selectedCountries, c];
        update("selectedCountries", next);
    };
    const toggleBasin = (b) => {
        const next = options.selectedBasins.includes(b)
            ? options.selectedBasins.filter((x) => x !== b)
            : [...options.selectedBasins, b];
        update("selectedBasins", next);
    };
    const byBasin = options.spatialUnit === "basins";

    return (
        <aside
            className="h-full w-[320px] shrink-0 bg-white border-r border-[#eceff3] overflow-y-auto"
            style={{ boxShadow: "0 5px 9px 0 rgba(0,0,0,0.06)" }}
        >
            <div className="p-6">
                <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.15em] text-ps-blue">
                    SEA-WEA
                </div>
                <h1
                    className="text-[26px] leading-[1.2] font-light text-ps-charcoal"
                    style={{ letterSpacing: "-0.1px" }}
                >
                    Reservoir & Hydropower Atlas
                </h1>
                <p className="mt-2 text-[13px] text-ps-bodyGray leading-relaxed">
                    Southeast Asia water-energy infrastructure — critical and non-critical
                    stations across five countries.
                </p>
            </div>

            <div className="px-6 pb-6">
                <SectionTitle>Time Horizon</SectionTitle>
                <div className="flex gap-2">
                    <Toggle
                        active={options.overview === "current"}
                        onClick={() => update("overview", "current")}
                    >
                        Current
                    </Toggle>
                    <Toggle
                        active={options.overview === "future"}
                        onClick={() => update("overview", "future")}
                    >
                        Future
                    </Toggle>
                </div>
                <p className="mt-2 text-[12px] text-ps-bodyGray">
                    {options.overview === "current"
                        ? "Showing operational stations only."
                        : "Showing planned, under-construction, and non-operational stations."}
                </p>

                <SectionTitle>Spatial Unit</SectionTitle>
                <div className="flex gap-2">
                    <Toggle
                        active={options.spatialUnit === "basins"}
                        onClick={() => update("spatialUnit", "basins")}
                    >
                        Basins
                    </Toggle>
                    <Toggle
                        active={options.spatialUnit === "countries"}
                        onClick={() => update("spatialUnit", "countries")}
                    >
                        Countries
                    </Toggle>
                </div>
                <p className="mt-2 text-[12px] text-ps-bodyGray">
                    {byBasin
                        ? "Map shows basin boundaries — filter stations by basin below."
                        : "Map shows country boundaries — filter stations by country below."}
                </p>

                <SectionTitle>Stations</SectionTitle>
                <div className="space-y-2">
                    <label className="flex items-center justify-between text-[14px] text-ps-charcoal">
                        <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-ps-cyan inline-block" />
                            Critical
                        </span>
                        <input
                            type="checkbox"
                            checked={options.showCritical}
                            onChange={(e) => update("showCritical", e.target.checked)}
                            className="h-4 w-4 accent-ps-blue"
                        />
                    </label>
                    <label className="flex items-center justify-between text-[14px] text-ps-charcoal">
                        <span className="flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 rounded-full inline-block"
                                style={{ background: "#6b6b6b" }}
                            />
                            Non-critical
                        </span>
                        <input
                            type="checkbox"
                            checked={options.showNonCritical}
                            onChange={(e) => update("showNonCritical", e.target.checked)}
                            className="h-4 w-4 accent-ps-blue"
                        />
                    </label>
                </div>

                {byBasin ? (
                    <>
                        <SectionTitle>Basins</SectionTitle>
                        <div className="flex flex-wrap gap-2">
                            {BASINS.map((b) => (
                                <Chip
                                    key={b}
                                    active={options.selectedBasins.includes(b)}
                                    onClick={() => toggleBasin(b)}
                                    color="#0070cc"
                                >
                                    {BASIN_LABEL[b] || b}
                                </Chip>
                            ))}
                        </div>
                        <p className="mt-2 text-[12px] text-ps-bodyGray">
                            {options.selectedBasins.length === 0
                                ? "All basins shown."
                                : `Filter: ${options.selectedBasins.length} selected.`}
                        </p>
                    </>
                ) : (
                    <>
                        <SectionTitle>Countries</SectionTitle>
                        <div className="flex flex-wrap gap-2">
                            {COUNTRIES.map((c) => (
                                <Chip
                                    key={c}
                                    active={options.selectedCountries.includes(c)}
                                    onClick={() => toggleCountry(c)}
                                    color="#0070cc"
                                >
                                    {c}
                                </Chip>
                            ))}
                        </div>
                        <p className="mt-2 text-[12px] text-ps-bodyGray">
                            {options.selectedCountries.length === 0
                                ? "All countries shown."
                                : `Filter: ${options.selectedCountries.length} selected.`}
                        </p>
                    </>
                )}

                <SectionTitle>Main Use Types</SectionTitle>
                <div className="flex flex-wrap gap-2">
                    {MAIN_USES.map((u) => (
                        <Chip
                            key={u}
                            active={options.selectedUses.includes(u)}
                            onClick={() => toggleUse(u)}
                            color={USE_COLORS[u]}
                            icon={<UseIcon use={u} size={14} />}
                        >
                            {USE_LABEL[u] || u}
                        </Chip>
                    ))}
                </div>

                <SectionTitle>Size Attribute</SectionTitle>
                <select
                    value={options.selectedAttribute}
                    onChange={(e) => update("selectedAttribute", e.target.value)}
                    className="w-full bg-white border border-[#cccccc] rounded-ps-sm py-2 px-3 text-[14px] text-ps-charcoal focus:outline-none focus:ring-2 focus:ring-ps-blue"
                >
                    {NUMERIC_ATTRIBUTES.map((a) => (
                        <option key={a.key} value={a.key}>
                            {a.label}
                        </option>
                    ))}
                </select>
                <p className="mt-2 text-[12px] text-ps-bodyGray">
                    Marker size scales to this attribute.
                </p>

                <div className="mt-8">
                    <button
                        className="ps-btn w-full"
                        onClick={onOpenSummary}
                        aria-pressed={!!summaryOpen}
                        aria-label={summaryOpen ? "Hide summary" : "Show summary"}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="10" width="4" height="11" rx="1" fill="currentColor" />
                            <rect x="10" y="5" width="4" height="16" rx="1" fill="currentColor" />
                            <rect x="17" y="13" width="4" height="8" rx="1" fill="currentColor" />
                        </svg>
                        {summaryOpen ? "Hide Summary" : "Summary"}
                    </button>
                    <p className="mt-2 text-[12px] text-ps-bodyGray">
                        Overlays a 3D bar plot at each basin centroid — critical,
                        non-critical, and unknown. Sums capacity / area / installed
                        power; counts stations for dam height / length / water head.
                    </p>
                </div>
            </div>
        </aside>
    );
}
