import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "../Sidebar/Sidebar";
import StationPanel from "../StationPanel/StationPanel";
import DynamicPanel from "../DynamicPanel/DynamicPanel";
import Legend from "../Map/Legend";
import { loadStations, loadAllBoundaries, loadDynamicIndex } from "../../utils/dataLoader";
import { isOperational, DEFAULT_BASEMAP } from "../../utils/constants";

const MapView = dynamic(() => import("../Map/MapView"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-ps-ice text-ps-blue">
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
    selectedUses: [],
    selectedAttribute: "normal_capacity_mcm",
    showCritical: true,
    showNonCritical: true,
};

const MIN_DYNAMIC_PX = 180;
const MAX_DYNAMIC_FRAC = 0.85;
const DEFAULT_DYNAMIC_FRAC = 0.5;
const HANDLE_PX = 14;

export default function MainDashboard() {
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

    useEffect(() => {
        const el = mainRef.current;
        if (!el) return;
        // Seed synchronously from the DOM so we don't depend on the
        // ResizeObserver firing before the user clicks "Dynamic Info".
        const h0 = el.getBoundingClientRect().height;
        if (h0 > 0) setMainHeight(h0);
        if (typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver(([entry]) => {
            setMainHeight(entry.contentRect.height);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // When the dynamic panel opens, start with a sensible default height.
    // Read the current <main> height directly from the ref rather than from
    // state, so we don't get stuck at 0 if the ResizeObserver hasn't fired yet.
    useEffect(() => {
        if (!dynamicStation) {
            setDynamicHeight(0);
            return;
        }
        const measured =
            mainRef.current?.getBoundingClientRect().height || mainHeight || 0;
        if (measured <= 0) return;
        setDynamicHeight((h) =>
            h > 0 ? h : Math.round(measured * DEFAULT_DYNAMIC_FRAC)
        );
    }, [dynamicStation, mainHeight]);

    // Clamp on viewport resize. Also acts as a safety net: if a prior render
    // left dynamicHeight at 0 while the panel is open, this restores it.
    useEffect(() => {
        if (!dynamicStation || mainHeight <= 0) return;
        const maxH = Math.round(mainHeight * MAX_DYNAMIC_FRAC);
        const minH = Math.min(MIN_DYNAMIC_PX, Math.round(mainHeight * 0.2));
        setDynamicHeight((h) => {
            const base = h > 0 ? h : Math.round(mainHeight * DEFAULT_DYNAMIC_FRAC);
            return Math.max(minH, Math.min(base, maxH));
        });
    }, [mainHeight, dynamicStation]);

    const update = (k, v) => setOptions((prev) => ({ ...prev, [k]: v }));

    const filteredStations = useMemo(() => {
        return stations.filter((s) => {
            const op = isOperational(s.status);
            if (options.overview === "current" && !op) return false;
            if (options.overview === "future" && op) return false;
            if (!options.showCritical && s.is_critical) return false;
            if (!options.showNonCritical && !s.is_critical) return false;
            if (
                options.selectedCountries.length > 0 &&
                !options.selectedCountries.includes(s.country)
            )
                return false;
            if (
                options.selectedUses.length > 0 &&
                !options.selectedUses.includes(s.main_use)
            )
                return false;
            return true;
        });
    }, [stations, options]);

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
            const mh = mainHeightRef.current;
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
        if (mainHeight > 0) {
            setDynamicHeight(Math.round(mainHeight * DEFAULT_DYNAMIC_FRAC));
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-ps-ice">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 rounded-full border-2 border-ps-blue/30 border-t-ps-blue animate-spin" />
                    <p
                        className="mt-5 text-[20px] font-light text-ps-charcoal"
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
            <div className="h-screen w-screen flex items-center justify-center bg-ps-ice p-6">
                <div className="max-w-xl bg-white rounded-ps-lg p-8 shadow-ps-3">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-ps-red font-semibold">
                        Error
                    </div>
                    <h2
                        className="mt-1 text-[24px] font-light text-ps-charcoal"
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

    const mapHeight = dynamicStation
        ? Math.max(mainHeight - dynamicHeight - HANDLE_PX, 160)
        : mainHeight;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-ps-ice">
            <Sidebar
                options={options}
                update={update}
                summaryOpen={summaryOpen}
                onOpenSummary={() => setSummaryOpen((v) => !v)}
            />

            <main ref={mainRef} className="flex-1 flex flex-col relative min-w-0 min-h-0">
                <div
                    className="relative flex-shrink-0"
                    style={{
                        height: dynamicStation ? mapHeight : "100%",
                        transition: isDragging ? "none" : "height 180ms ease",
                    }}
                >
                    <MapView
                        stations={filteredStations}
                        boundaries={boundaries}
                        spatialUnit={options.spatialUnit}
                        selectedAttribute={options.selectedAttribute}
                        selectedStation={selectedStation}
                        onStationClick={(s) => setSelectedStation(s)}
                        basemap={basemap}
                        onBasemapChange={setBasemap}
                        onScaleChange={setScaleRange}
                        summaryVisible={summaryOpen}
                    />

                    {/* Floating stats strip */}
                    <div
                        className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-ps-md px-4 py-3 z-[400]"
                        style={{ boxShadow: "0 5px 9px 0 rgba(0,0,0,0.12)" }}
                    >
                        <div className="text-[10px] uppercase tracking-[0.1em] text-ps-bodyGray font-semibold">
                            {options.overview === "current" ? "Operational" : "Planned / Other"}
                        </div>
                        <div className="mt-0.5 flex items-baseline gap-2">
                            <div
                                className="text-[26px] font-light text-ps-charcoal leading-none"
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
                                const mh = mainHeightRef.current;
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
