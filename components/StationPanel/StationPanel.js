import React from "react";
import { USE_LABEL, formatNumber } from "../../utils/constants";
import UseIcon from "../icons/UseIcon";
import { useTheme } from "../Theme/ThemeProvider";

function Row({ label, value }) {
    if (value == null || value === "") return null;
    return (
        <div className="flex items-start justify-between gap-4 py-2 border-b border-line-soft last:border-0">
            <span className="text-[12px] uppercase tracking-[0.08em] text-ps-bodyGray font-medium">
                {label}
            </span>
            <span className="text-[14px] text-ps-charcoal font-medium text-right">
                {value}
            </span>
        </div>
    );
}

export default function StationPanel({ station, onClose, onDynamicInfo, hasDynamic }) {
    const { theme } = useTheme();
    if (!station) return null;
    const color = theme.data.use[station.main_use] || theme.data.useFallback;
    const title =
        station.reservoir_name || station.station_name || station.dam_name || "Station";
    return (
        // Desktop: floating card top-right. Below lg: bottom sheet capped at
        // 45% so the flown-to marker (map center) stays visible above it.
        <div className="absolute top-4 right-4 w-[360px] max-h-[calc(100%-2rem)] overflow-y-auto bg-panel rounded-ps-lg z-[1100] shadow-pop animate-[panel-in_var(--dur-2)_ease] max-lg:top-auto max-lg:inset-x-0 max-lg:bottom-0 max-lg:w-auto max-lg:max-h-[45%] max-lg:rounded-b-none">
            <div
                className="relative p-5 pr-14 text-white rounded-t-ps-lg"
                style={{
                    background: `linear-gradient(135deg, ${color} 0%, ${theme.stationHeaderTo} 140%)`,
                }}
            >
                <button
                    type="button"
                    className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-black/25 text-white flex items-center justify-center cursor-pointer hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 transition-colors"
                    aria-label="Close"
                    onClick={onClose}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                            d="M6 6 18 18 M18 6 6 18"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
                <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.12em] opacity-90">
                    {station.is_critical ? "Critical Station" : "Non-critical Station"}
                </div>
                <h2
                    className="mt-1 text-[22px] leading-[1.2] font-light font-display"
                    style={{ letterSpacing: "-0.1px" }}
                >
                    {title}
                </h2>
                <div className="mt-3 flex items-center gap-2 text-[13px] opacity-95">
                    <UseIcon use={station.main_use} size={16} />
                    <span>{USE_LABEL[station.main_use] || station.main_use || "Unknown use"}</span>
                    <span className="mx-1 opacity-50">·</span>
                    <span>{station.country || "—"}</span>
                </div>
            </div>

            <div className="p-5 max-lg:pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
                <Row label="Status" value={station.status} />
                <Row label="Commission Year" value={station.commission_year} />
                <Row label="Dam Name" value={station.dam_name} />
                <Row label="Second Use" value={station.second_use} />
                <Row
                    label="Normal Capacity"
                    value={
                        station.normal_capacity_mcm != null
                            ? `${formatNumber(station.normal_capacity_mcm)} MCM`
                            : null
                    }
                />
                <Row
                    label="Normal Area"
                    value={
                        station.normal_area_km2 != null
                            ? `${formatNumber(station.normal_area_km2)} km²`
                            : null
                    }
                />
                <Row
                    label="Dam Height"
                    value={
                        station.dam_height_m != null ? `${formatNumber(station.dam_height_m)} m` : null
                    }
                />
                <Row
                    label="Water Head"
                    value={
                        station.water_head_m != null ? `${formatNumber(station.water_head_m)} m` : null
                    }
                />
                <Row
                    label="Power"
                    value={station.power_mw != null ? `${formatNumber(station.power_mw)} MW` : null}
                />
                <Row
                    label="Coordinates"
                    value={`${formatNumber(station.latitude, 3)}, ${formatNumber(
                        station.longitude,
                        3
                    )}`}
                />

                {hasDynamic && (
                    <button
                        className="ps-btn w-full mt-5"
                        onClick={onDynamicInfo}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M3 17 9 11 13 15 21 7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        Dynamic Info
                    </button>
                )}
                {!hasDynamic && station.is_critical && (
                    <p className="mt-5 text-[12px] text-ps-bodyGray italic">
                        Dynamic data not available for this station.
                    </p>
                )}
            </div>
        </div>
    );
}
