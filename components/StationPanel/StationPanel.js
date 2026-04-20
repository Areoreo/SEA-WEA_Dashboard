import React from "react";
import { USE_COLORS, USE_COLOR_FALLBACK, formatNumber } from "../../utils/constants";
import UseIcon from "../icons/UseIcon";

function Row({ label, value }) {
    if (value == null || value === "") return null;
    return (
        <div className="flex items-start justify-between gap-4 py-2 border-b border-[#f0f2f5] last:border-0">
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
    if (!station) return null;
    const color = USE_COLORS[station.main_use] || USE_COLOR_FALLBACK;
    const title =
        station.reservoir_name || station.station_name || station.dam_name || "Station";
    return (
        <div
            className="absolute top-4 right-4 w-[360px] max-h-[calc(100%-2rem)] overflow-y-auto bg-white rounded-ps-lg z-[500] animate-[slideIn_220ms_ease]"
            style={{ boxShadow: "0 5px 28px 0 rgba(0,0,0,0.2)" }}
        >
            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-6px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
            <div
                className="relative p-5 text-white rounded-t-ps-lg"
                style={{
                    background: `linear-gradient(135deg, ${color} 0%, #0070cc 140%)`,
                }}
            >
                <button
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/25 text-white flex items-center justify-center hover:bg-black/45 transition"
                    aria-label="Close"
                    onClick={onClose}
                >
                    ✕
                </button>
                <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.12em] opacity-90">
                    {station.is_critical ? "Critical Station" : "Non-critical Station"}
                </div>
                <h2
                    className="mt-1 text-[22px] leading-[1.2] font-light"
                    style={{ letterSpacing: "-0.1px" }}
                >
                    {title}
                </h2>
                <div className="mt-3 flex items-center gap-2 text-[13px] opacity-95">
                    <UseIcon use={station.main_use} size={16} />
                    <span>{station.main_use || "Unknown use"}</span>
                    <span className="mx-1 opacity-50">·</span>
                    <span>{station.country || "—"}</span>
                </div>
            </div>

            <div className="p-5">
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
