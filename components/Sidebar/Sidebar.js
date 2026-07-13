import React from "react";
import {
    MAIN_USES,
    USE_LABEL,
    COUNTRIES,
    BASINS,
    BASIN_LABEL,
    NUMERIC_ATTRIBUTES,
} from "../../utils/constants";
import UseIcon from "../icons/UseIcon";
import ThemeSwitcher from "../Theme/ThemeSwitcher";
import { useTheme } from "../Theme/ThemeProvider";

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
            className={`chip flex-1 text-[14px] font-medium rounded-pill px-4 py-2 transition-all duration-200 border-2 ${
                active
                    ? "bg-ps-blue text-on-accent border-transparent shadow-ps-2"
                    : "bg-panel text-ps-charcoal border-line hover:border-ps-blue"
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
            className={`chip group inline-flex items-center gap-2 rounded-pill px-3 py-[6px] text-[13px] font-medium border transition-all duration-150 ${
                active
                    ? "text-on-accent border-transparent shadow-ps-1"
                    : "bg-panel text-ps-charcoal border-line hover:border-ps-blue"
            }`}
            style={active ? { backgroundColor: color || "var(--accent)" } : {}}
        >
            {icon && (
                <span
                    className="inline-flex items-center justify-center"
                    style={{
                        color: active ? "var(--on-accent)" : color || "var(--accent)",
                    }}
                >
                    {icon}
                </span>
            )}
            <span>{children}</span>
        </button>
    );
}

export default function Sidebar({
    options,
    update,
    summaryOpen,
    onOpenSummary,
    open,
    onClose,
    mobileHidden,
}) {
    const { theme } = useTheme();
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
        // Below lg the aside leaves the flex flow and becomes an off-canvas
        // drawer (opened by the hamburger in MainDashboard); at lg+ every
        // max-lg: class is inert, so the desktop column is byte-identical.
        <aside
            id="sidebar-drawer"
            aria-hidden={mobileHidden || undefined}
            className={`h-full w-[320px] shrink-0 bg-panel border-r border-line-soft overflow-y-auto shadow-ps-1 max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-[1200] max-lg:max-w-[86vw] max-lg:transition-transform max-lg:duration-200 max-lg:ease-ps ${
                open ? "" : "max-lg:-translate-x-full max-lg:pointer-events-none"
            }`}
        >
            <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="lg:hidden absolute top-4 right-4 h-9 w-9 rounded-full border border-line bg-panel text-ps-charcoal flex items-center justify-center"
            >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                        d="M2 2L12 12M12 2L2 12"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                </svg>
            </button>
            <div className="p-6">
                <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.15em] text-ps-blue">
                    SEA-WEA
                </div>
                <h1
                    className="text-[26px] leading-[1.2] font-light text-ps-charcoal font-display"
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
                        : "Showing planned and under-construction stations only."}
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
                            <span className="h-2.5 w-2.5 rounded-full inline-block bg-ink-2" />
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
                                    color={theme.tokens.accent}
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
                                    color={theme.tokens.accent}
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
                            color={theme.data.use[u]}
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
                    className="w-full bg-panel border border-line-strong rounded-ps-sm py-2 px-3 text-[16px] lg:text-[14px] text-ps-charcoal focus:outline-none focus:ring-2 focus:ring-ps-blue"
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

                <SectionTitle>Appearance</SectionTitle>
                <ThemeSwitcher />
            </div>
        </aside>
    );
}
