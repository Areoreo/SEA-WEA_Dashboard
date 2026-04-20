// Research region visual scheme
export const MAIN_USES = [
    "Hydropower",
    "Irrigation",
    "Water supply",
    "Flood control",
    "Navigation",
    "Recreation",
];

// Accessible, distinct color per use. PlayStation palette leans blue — use-type
// colors distinguish categories but stay in a cool, restrained gamut.
export const USE_COLORS = {
    Hydropower: "#1eaedb", // cyan — power/electric
    Irrigation: "#7bc36a", // soft green — seedling
    "Water supply": "#53b1ff", // light blue — water drop
    "Flood control": "#ffb454", // warm sand — shield
    Navigation: "#b388ff", // violet — compass
    Recreation: "#ff6ea0", // magenta — wave
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

export const NUMERIC_ATTRIBUTES = [
    { key: "normal_capacity_mcm", label: "Normal Capacity (MCM)" },
    { key: "normal_area_km2", label: "Normal Area (km²)" },
    { key: "max_capacity_mcm", label: "Max Capacity (MCM)" },
    { key: "dam_height_m", label: "Dam Height (m)" },
    { key: "power_mw", label: "Power (MW)" },
    { key: "water_head_m", label: "Water Head (m)" },
];

export function formatNumber(v, decimals = 2) {
    if (v == null || !Number.isFinite(v)) return "—";
    if (Math.abs(v) >= 1000) return Math.round(v).toLocaleString();
    return Number(v.toFixed(decimals)).toLocaleString();
}
