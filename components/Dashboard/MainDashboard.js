import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "../Sidebar/Sidebar";
import StationPanel from "../StationPanel/StationPanel";
import DynamicPanel from "../DynamicPanel/DynamicPanel";
import SummaryView from "../Summary/SummaryView";
import { loadStations, loadAllBoundaries, loadDynamicIndex } from "../../utils/dataLoader";
import { isOperational } from "../../utils/constants";

const MapView = dynamic(() => import("../Map/MapView"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-[#0b0d10] text-[#53b1ff]">
            <div className="text-center">
                <div className="inline-block h-10 w-10 rounded-full border-2 border-[#53b1ff]/40 border-t-[#53b1ff] animate-spin" />
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

    const hasDynamic = (s) =>
        s && s.is_critical && (dynamicIndex[String(s.SEAWEA_ID)] || dynamicIndex[s.SEAWEA_ID]);

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
                    <p className="mt-1 text-[13px] text-ps-bodyGray">Parsing stations and boundaries…</p>
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

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-ps-ice">
            <Sidebar
                options={options}
                update={update}
                onOpenSummary={() => setSummaryOpen(true)}
            />

            <main className="flex-1 flex flex-col relative min-w-0">
                <div
                    className={`relative transition-all duration-300 ${
                        dynamicStation ? "h-1/2" : "h-full"
                    }`}
                >
                    <MapView
                        stations={filteredStations}
                        boundaries={boundaries}
                        spatialUnit={options.spatialUnit}
                        selectedAttribute={options.selectedAttribute}
                        selectedStation={selectedStation}
                        onStationClick={(s) => setSelectedStation(s)}
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
                    <div className="h-1/2 min-h-0">
                        <DynamicPanel
                            station={dynamicStation}
                            onClose={() => setDynamicStation(null)}
                        />
                    </div>
                )}
            </main>

            <SummaryView
                open={summaryOpen}
                onClose={() => setSummaryOpen(false)}
                stations={filteredStations}
                boundaries={boundaries}
                spatialUnit={options.spatialUnit}
                selectedAttribute={options.selectedAttribute}
            />
        </div>
    );
}
