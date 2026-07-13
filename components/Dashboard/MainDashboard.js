import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "../Sidebar/Sidebar";
import StationPanel from "../StationPanel/StationPanel";
import DynamicPanel from "../DynamicPanel/DynamicPanel";
import Legend from "../Map/Legend";
import { loadStations, loadAllBoundaries, loadDynamicIndex } from "../../utils/dataLoader";
import { isOperational, isFutureStatus, DEFAULT_BASEMAP } from "../../utils/constants";
import { assignFeature } from "../../utils/geoUtils";
import { useTheme } from "../Theme/ThemeProvider";

const MapView = dynamic(() => import("../Map/MapView"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-transparent text-ps-blue">
            <div className="text-center">
                <div className="inline-block h-10 w-10 rounded-full border-2 border-ps-blue/30 border-t-ps-blue animate-spin" />
                <p className="mt-4 text-sm font-light tracking-wide">Loading map…</p>
            </div>
        </div>
    ),
});

const DEFAULT_OPTIONS = {
    overview: "current",
    spatialUnit: "basins",
    selectedCountries: [],
    selectedBasins: [],
    selectedUses: [],
    selectedAttribute: "normal_capacity_mcm",
    showCritical: true,
    showNonCritical: true,
};

const MIN_DYNAMIC_PX = 180;
const MIN_MAP_PX = 180;
const MAX_DYNAMIC_FRAC = 0.95;
const HANDLE_PX = 14;

// Read <main>'s live pixel height. Pref DOM over React state so we are
// not blocked on a ResizeObserver tick that may not have landed yet.
function readMainHeight(el, fallback = 0) {
    if (!el) return fallback;
    const h = el.getBoundingClientRect().height;
    return h > 0 ? h : fallback;
}

export default function MainDashboard() {
    const { theme, themeId } = useTheme();
    const [options, setOptions] = useState(DEFAULT_OPTIONS);
    const [stations, setStations] = useState([]);
    const [boundaries, setBoundaries] = useState(null);
    const [dynamicIndex, setDynamicIndex] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStation, setSelectedStation] = useState(null);
    const [dynamicStation, setDynamicStation] = useState(null);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [basemap, setBasemap] = useState(DEFAULT_BASEMAP);
    const [scaleRange, setScaleRange] = useState({ min: null, max: null });

    const mainRef = useRef(null);
    const handleRef = useRef(null);
    const [mainHeight, setMainHeight] = useState(0);
    const [dynamicHeight, setDynamicHeight] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    // Refs mirror the state so the drag listeners (attached once via effect)
    // always read the freshest values without needing to re-bind.
    const mainHeightRef = useRef(0);
    const dynamicHeightRef = useRef(0);
    useEffect(() => {
        mainHeightRef.current = mainHeight;
    }, [mainHeight]);
    useEffect(() => {
        dynamicHeightRef.current = dynamicHeight;
    }, [dynamicHeight]);

    useEffect(() => {
        let alive = true;
        Promise.all([loadStations(), loadAllBoundaries(), loadDynamicIndex()])
            .then(([s, b, d]) => {
                if (!alive) return;
                setStations(s);
                setBoundaries(b);
                setDynamicIndex(d || {});
                setLoading(false);
            })
            .catch((e) => {
                if (!alive) return;
                console.error(e);
                setError(e.message || "Failed to load data");
                setLoading(false);
            });
        return () => {
            alive = false;
        };
    }, []);

    // Seed mainHeight synchronously from layout (useLayoutEffect ensures the
    // DOM is measured before any child that depends on it paints).
    useLayoutEffect(() => {
        const el = mainRef.current;
        if (!el) return;
        const h0 = el.getBoundingClientRect().height;
        if (h0 > 0) setMainHeight(h0);
        if (typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver(([entry]) => {
            setMainHeight(entry.contentRect.height);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // Default: the dynamic panel claims the full remaining height with the
    // map collapsing to MIN_MAP_PX — matches the user intent that the charts
    // occupy the whole panel area when "Dynamic Info" is opened.
    useEffect(() => {
        if (!dynamicStation) {
            setDynamicHeight(0);
            return;
        }
        const measured = readMainHeight(mainRef.current, mainHeight);
        if (measured <= 0) return;
        const target = Math.max(MIN_DYNAMIC_PX, measured - MIN_MAP_PX - HANDLE_PX);
        setDynamicHeight((h) => (h > 0 ? h : target));
    }, [dynamicStation, mainHeight]);

    // Clamp on viewport resize. Also self-heals if state ever slipped to 0.
    useEffect(() => {
        if (!dynamicStation || mainHeight <= 0) return;
        const maxH = Math.round(mainHeight * MAX_DYNAMIC_FRAC);
        const minH = Math.min(MIN_DYNAMIC_PX, Math.round(mainHeight * 0.2));
        const fallback = Math.max(minH, mainHeight - MIN_MAP_PX - HANDLE_PX);
        setDynamicHeight((h) => {
            const base = h > 0 ? h : fallback;
            return Math.max(minH, Math.min(base, maxH));
        });
    }, [mainHeight, dynamicStation]);

    // Each theme names its own default basemap (Mission Control → dark
    // tiles); the manual BasemapToggle still overrides within a theme.
    useEffect(() => {
        setBasemap(theme.map.defaultBasemap);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [themeId]);

    const update = (k, v) => setOptions((prev) => ({ ...prev, [k]: v }));

    // Stations carry no basin field — derive each station's basin once (point in
    // polygon against the basin boundaries) so the "Basins" spatial unit can
    // filter by region the same way "Countries" filters by `s.country`.
    const stationBasins = useMemo(() => {
        if (!boundaries?.basins) return null;
        const map = new Map();
        for (const s of stations) {
            if (!Number.isFinite(s.longitude) || !Number.isFinite(s.latitude)) continue;
            map.set(
                s.SEAWEA_ID,
                assignFeature(s.longitude, s.latitude, boundaries.basins, "basin")
            );
        }
        return map;
    }, [stations, boundaries]);

    const filteredStations = useMemo(() => {
        return stations.filter((s) => {
            if (options.overview === "current" && !isOperational(s.status)) return false;
            if (options.overview === "future" && !isFutureStatus(s.status)) return false;
            if (!options.showCritical && s.is_critical) return false;
            if (!options.showNonCritical && !s.is_critical) return false;
            // Region filter follows the active spatial unit: basins when
            // "Basins" is selected, country otherwise.
            if (options.spatialUnit === "basins") {
                if (options.selectedBasins.length > 0) {
                    const basin = stationBasins ? stationBasins.get(s.SEAWEA_ID) : null;
                    if (!basin || !options.selectedBasins.includes(basin)) return false;
                }
            } else if (
                options.selectedCountries.length > 0 &&
                !options.selectedCountries.includes(s.country)
            ) {
                return false;
            }
            if (
                options.selectedUses.length > 0 &&
                !options.selectedUses.includes(s.main_use)
            )
                return false;
            return true;
        });
    }, [stations, options, stationBasins]);

    const usesInView = useMemo(
        () => Array.from(new Set(filteredStations.map((s) => s.main_use).filter(Boolean))),
        [filteredStations]
    );
    const hasCritical = useMemo(
        () => filteredStations.some((s) => s.is_critical),
        [filteredStations]
    );
    const hasNonCritical = useMemo(
        () => filteredStations.some((s) => !s.is_critical),
        [filteredStations]
    );

    const hasDynamic = (s) =>
        s && s.is_critical && (dynamicIndex[String(s.SEAWEA_ID)] || dynamicIndex[s.SEAWEA_ID]);

    // --- Dragging the dynamic panel top edge ---
    // Native DOM listener attached once via effect (not a React synthetic
    // onPointerDown) so the drag is not susceptible to stale closures or to
    // the surrounding Leaflet map re-targeting pointer events. All mutable
    // inputs (heights) are read through refs to stay fresh without re-binding.
    useEffect(() => {
        const handleEl = handleRef.current;
        if (!handleEl || !dynamicStation) return;

        let startY = 0;
        let startH = 0;

        const onMove = (ev) => {
            // Prefer the live DOM measurement — mainHeightRef (state mirror)
            // can lag the first layout and would otherwise block the drag.
            const mh = readMainHeight(mainRef.current, mainHeightRef.current);
            if (mh <= 0) return;
            const dy = ev.clientY - startY;
            const maxH = Math.round(mh * MAX_DYNAMIC_FRAC);
            const minH = MIN_DYNAMIC_PX;
            const next = Math.max(minH, Math.min(startH - dy, maxH));
            setDynamicHeight(next);
        };

        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
            setIsDragging(false);
        };

        const onDown = (ev) => {
            if (ev.button != null && ev.button !== 0) return;
            ev.preventDefault();
            ev.stopPropagation();
            startY = ev.clientY;
            startH = dynamicHeightRef.current;
            setIsDragging(true);
            document.body.style.userSelect = "none";
            document.body.style.cursor = "ns-resize";
            // Dual bind pointer + mouse for maximum browser/touch coverage.
            window.addEventListener("pointermove", onMove);
            window.addEventListener("pointerup", onUp);
            window.addEventListener("pointercancel", onUp);
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
        };

        handleEl.addEventListener("pointerdown", onDown);
        handleEl.addEventListener("mousedown", onDown);

        return () => {
            handleEl.removeEventListener("pointerdown", onDown);
            handleEl.removeEventListener("mousedown", onDown);
            onUp();
        };
    }, [dynamicStation]);

    const resetDynamicHeight = () => {
        const mh = readMainHeight(mainRef.current, mainHeight);
        if (mh > 0) {
            setDynamicHeight(Math.max(MIN_DYNAMIC_PX, mh - MIN_MAP_PX - HANDLE_PX));
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-transparent">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 rounded-full border-2 border-ps-blue/30 border-t-ps-blue animate-spin" />
                    <p
                        className="mt-5 text-[20px] font-light text-ps-charcoal font-display"
                        style={{ letterSpacing: "-0.1px" }}
                    >
                        Loading SEA-WEA Atlas
                    </p>
                    <p className="mt-1 text-[13px] text-ps-bodyGray">
                        Parsing stations and boundaries…
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-transparent p-6">
                <div className="max-w-xl bg-panel rounded-ps-lg p-8 shadow-ps-3">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-ps-red font-semibold">
                        Error
                    </div>
                    <h2
                        className="mt-1 text-[24px] font-light text-ps-charcoal font-display"
                        style={{ letterSpacing: "-0.1px" }}
                    >
                        Could not load data
                    </h2>
                    <p className="mt-3 text-[14px] text-ps-bodyGray break-all">{error}</p>
                    <button className="ps-btn mt-6" onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const effectiveMain = mainHeight || readMainHeight(mainRef.current, 0);
    const mapHeight = dynamicStation
        ? Math.max(effectiveMain - dynamicHeight - HANDLE_PX, MIN_MAP_PX)
        : effectiveMain;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-transparent">
            <Sidebar
                options={options}
                update={update}
                summaryOpen={summaryOpen}
                onOpenSummary={() => setSummaryOpen((v) => !v)}
            />

            <main ref={mainRef} className="flex-1 flex flex-col relative min-w-0 min-h-0">
                <div
                    className="relative flex-shrink-0"
                    data-basemap={basemap}
                    style={{
                        height: dynamicStation ? mapHeight : "100%",
                        transition: isDragging ? "none" : "height 180ms ease",
                    }}
                >
                    <MapView
                        stations={filteredStations}
                        boundaries={boundaries}
                        spatialUnit={options.spatialUnit}
                        selectedCountries={options.selectedCountries}
                        selectedBasins={options.selectedBasins}
                        selectedAttribute={options.selectedAttribute}
                        selectedStation={selectedStation}
                        onStationClick={(s) => setSelectedStation(s)}
                        basemap={basemap}
                        onBasemapChange={setBasemap}
                        onScaleChange={setScaleRange}
                        summaryVisible={summaryOpen}
                    />

                    {/* Floating stats strip */}
                    <div className="absolute top-4 left-4 glass-panel rounded-ps-md px-4 py-3 z-[400] shadow-overlay">
                        <div className="text-[10px] uppercase tracking-[0.1em] text-ps-bodyGray font-semibold">
                            {options.overview === "current"
                                ? "Operational"
                                : "Planned / Under construction"}
                        </div>
                        <div className="mt-0.5 flex items-baseline gap-2">
                            <div
                                className="text-[26px] font-light text-ps-charcoal leading-none font-data tabular-nums"
                                style={{ letterSpacing: "-0.1px" }}
                            >
                                {filteredStations.length.toLocaleString()}
                            </div>
                            <div className="text-[12px] text-ps-bodyGray">stations shown</div>
                        </div>
                        <div className="mt-1 text-[11px] text-ps-bodyGray">
                            {filteredStations.filter((s) => s.is_critical).length} critical ·{" "}
                            {filteredStations.filter((s) => !s.is_critical).length} non-critical
                        </div>
                    </div>

                    <Legend
                        attributeKey={options.selectedAttribute}
                        attributeRange={scaleRange}
                        usesInView={usesInView}
                        hasCritical={hasCritical}
                        hasNonCritical={hasNonCritical}
                        summaryVisible={summaryOpen}
                    />

                    {selectedStation && (
                        <StationPanel
                            station={selectedStation}
                            onClose={() => setSelectedStation(null)}
                            onDynamicInfo={() => {
                                setDynamicStation(selectedStation);
                            }}
                            hasDynamic={!!hasDynamic(selectedStation)}
                        />
                    )}
                </div>

                {dynamicStation && (
                    <>
                        {/* Drag handle — PS editorial: quiet ice-mist bar with a
                            cyan active state. Native listeners attached via
                            effect in handleRef. */}
                        <div
                            ref={handleRef}
                            role="separator"
                            aria-orientation="horizontal"
                            aria-label="Resize dynamic info panel"
                            aria-valuenow={dynamicHeight}
                            tabIndex={0}
                            onDoubleClick={resetDynamicHeight}
                            onKeyDown={(e) => {
                                const step = e.shiftKey ? 48 : 16;
                                const mh = readMainHeight(
                                    mainRef.current,
                                    mainHeightRef.current
                                );
                                const maxH = Math.round(mh * MAX_DYNAMIC_FRAC);
                                if (e.key === "ArrowUp") {
                                    e.preventDefault();
                                    setDynamicHeight((h) =>
                                        Math.min(maxH, (h || 0) + step)
                                    );
                                } else if (e.key === "ArrowDown") {
                                    e.preventDefault();
                                    setDynamicHeight((h) =>
                                        Math.max(MIN_DYNAMIC_PX, (h || 0) - step)
                                    );
                                } else if (e.key === "Home") {
                                    e.preventDefault();
                                    resetDynamicHeight();
                                }
                            }}
                            title="Drag to resize · double-click to reset · arrow keys when focused"
                            style={{
                                height: HANDLE_PX,
                                touchAction: "none",
                                userSelect: "none",
                                cursor: "ns-resize",
                            }}
                            className={`group flex-shrink-0 border-y border-ps-divider flex items-center justify-center relative z-[600] transition-colors duration-[180ms] ease-ps outline-none focus-visible:ring-2 focus-visible:ring-ps-blue ${
                                isDragging
                                    ? "bg-ps-cyan"
                                    : "bg-ps-ice hover:bg-ps-cyan/30"
                            }`}
                        >
                            <div
                                className={`h-[3px] w-20 rounded-pill transition-colors duration-[180ms] ease-ps ${
                                    isDragging
                                        ? "bg-white"
                                        : "bg-ps-mute group-hover:bg-ps-blue"
                                }`}
                            />
                        </div>
                        <div
                            style={{
                                height: dynamicHeight,
                                transition: isDragging
                                    ? "none"
                                    : "height 180ms cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                            className="flex-shrink-0 min-h-0 overflow-hidden"
                        >
                            <DynamicPanel
                                station={dynamicStation}
                                onClose={() => setDynamicStation(null)}
                            />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
