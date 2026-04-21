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

// Accessible, distinct color per use — all sit within a cool/neutral gamut to
// keep the PlayStation voice. "Unknown" is intentionally muted.
export const USE_COLORS = {
    Hydropower: "#1eaedb",
    Irrigation: "#7bc36a",
    "Water supply": "#53b1ff",
    "Flood control": "#ffb454",
    "Multiple purpose": "#b388ff",
    SEAWEA_UNKNOWN: "#9aa5b1",
};

export const USE_COLOR_FALLBACK = "#9aa5b1";

export const COUNTRIES = ["Cambodia", "Laos", "Myanmar", "Thailand", "Vietnam"];

export const COUNTRY_COLORS = {
    Cambodia: "#b9e3ff",
    Laos: "#ffe3b8",
    Myanmar: "#e5d6ff",
    Thailand: "#c8f0d2",
    Vietnam: "#ffd1d1",
};

export const BASINS = ["ChaoPhraya", "Irrawaddy", "Mekong", "Red", "Salween", "Other"];

export const BASIN_COLORS = {
    ChaoPhraya: "#cfeaff",
    Irrawaddy: "#ffdfc0",
    Mekong: "#c8e8d4",
    Red: "#ffc9d1",
    Salween: "#e0d4ff",
    Other: "#e8ecef",
};

export const STATUS_OPERATIONAL = "Operational";

export function isOperational(status) {
    if (!status) return false;
    return String(status).trim().toLowerCase() === "operational";
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

export const SUMMARY_CLASSES = [
    { key: "critical", label: "Critical", color: "#0070cc" },
    { key: "nonCritical", label: "Non-critical", color: "#8aa0b4" },
    { key: "unknown", label: "Unknown", color: "#c9ced4" },
];

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
