// Active main-use types (order drives sidebar chip order).
export const MAIN_USES = [
    "Hydropower",
    "Irrigation",
    "Water supply",
    "Flood control",
    "Multiple purpose",
    "SEAWEA_UNKNOWN",
];

// UI label overrides for presentation (raw value kept in data).
export const USE_LABEL = {
    SEAWEA_UNKNOWN: "Unknown",
};

// Use / country / basin / summary COLORS live in utils/themes.js (per-theme
// palettes, THEMES[id].data.*) — components read them via useTheme(). Only
// theme-independent keys, labels, and orderings stay here.

export const COUNTRIES = ["Cambodia", "Laos", "Myanmar", "Thailand", "Vietnam"];

export const BASINS = ["ChaoPhraya", "Irrawaddy", "Mekong", "Red", "Salween", "Other"];

// UI label overrides — the raw `basin` property value is kept in the data.
export const BASIN_LABEL = {
    ChaoPhraya: "Chao Phraya",
};

export const STATUS_OPERATIONAL = "Operational";

export function isOperational(status) {
    if (!status) return false;
    return String(status).trim().toLowerCase() === "operational";
}

// "Future" = stations that are coming but not yet running. Deliberately a
// closed allow-list: "potential", "cancelled", "postponed", "closed" and
// unknown status are NOT future.
export const FUTURE_STATUSES = new Set(["under construction", "planned"]);

export function isFutureStatus(status) {
    if (!status) return false;
    return FUTURE_STATUSES.has(String(status).trim().toLowerCase());
}

// `summary` drives the per-basin summary bar plot:
//   "sum"   → bar height is the sum of this attribute per class
//   "count" → bar height is the count of stations (with data) per class
export const NUMERIC_ATTRIBUTES = [
    { key: "normal_capacity_mcm", label: "Normal Capacity (MCM)", summary: "sum" },
    { key: "normal_area_km2", label: "Normal Area (km²)", summary: "sum" },
    { key: "power_mw", label: "Installed Capacity (MW)", summary: "sum" },
    { key: "dam_height_m", label: "Dam Height (m)", summary: "count" },
    { key: "dam_length_m", label: "Dam Length (m)", summary: "count" },
    { key: "water_head_m", label: "Water Head (m)", summary: "count" },
];

// Colors come from THEMES[id].data.summary (utils/themes.js), keyed by `key`.
export const SUMMARY_CLASSES = [
    { key: "critical", label: "Critical" },
    { key: "nonCritical", label: "Non-critical" },
    { key: "unknown", label: "Unknown" },
];

// Optional hard-coded anchor for each Summary bar plot, keyed by the region's
// raw name (basin key or country name). Value is [lat, lng].
//
// Irregular basin/country outlines mean the geometric centroid can land off
// the polygon or somewhere awkward; add an entry here to pin a plot exactly
// where you want it. Any region without an entry falls back to its centroid
// (utils/geoUtils.featureCentroid). Tweak these once you've eyeballed the map.
//
//   Basin keys:   "ChaoPhraya", "Irrawaddy", "Mekong", "Red", "Salween", "Other"
//   Country keys: "Cambodia", "Laos", "Myanmar", "Thailand", "Vietnam"
export const SUMMARY_PLOT_POSITIONS = {
    Mekong: [15.5, 104.5],
    // "ChaoPhraya": [15.5, 100.2],
    Salween: [20.0, 98.0],
    Other: [13.4, 108.9],
};

// Classify a station into one of the three summary classes.
// - critical    = is_critical === true
// - nonCritical = is_critical false AND the station is operational
// - unknown     = everything else (non-operational / missing status)
export function classifyStation(station) {
    if (station.is_critical) return "critical";
    if (isOperational(station.status)) return "nonCritical";
    return "unknown";
}

export function formatNumber(v, decimals = 2) {
    if (v == null || !Number.isFinite(v)) return "—";
    if (Math.abs(v) >= 1000) return Math.round(v).toLocaleString();
    return Number(v.toFixed(decimals)).toLocaleString();
}

// Basemap catalogue. `light` is default; `dark` kept as a quick A/B alternate.
export const BASEMAPS = {
    light: {
        label: "Light",
        url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, <a href="https://carto.com/attributions">CARTO</a>',
        background: "#eef2f6",
    },
    dark: {
        label: "Dark",
        url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, <a href="https://carto.com/attributions">CARTO</a>',
        background: "#0b0d10",
    },
};
export const DEFAULT_BASEMAP = "light";
