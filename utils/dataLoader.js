import Papa from "papaparse";
import { getAssetPath } from "./pathUtils";

const NULL_SENTINELS = new Set(["-999.9", "-999", "SEAWEA_UNKNOWN", "UNKNOWN", "N/A", "NA", ""]);

function cleanValue(v) {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    if (NULL_SENTINELS.has(s)) return null;
    return v;
}

function parseNumberSafe(v) {
    const c = cleanValue(v);
    if (c === null) return null;
    const n = Number(c);
    return Number.isFinite(n) ? n : null;
}

function normalizeStationRow(row) {
    return {
        SEAWEA_ID: parseNumberSafe(row.SEAWEA_ID),
        reservoir_name: cleanValue(row.reservoir_name),
        dam_name: cleanValue(row.dam_name),
        station_name: cleanValue(row.station_name),
        station_type: cleanValue(row.station_type),
        country: cleanValue(row.country),
        commission_year: parseNumberSafe(row.commission_year),
        status: cleanValue(row.status),
        dam_height_m: parseNumberSafe(row.dam_height_m),
        dam_length_m: parseNumberSafe(row.dam_length_m),
        max_area_km2: parseNumberSafe(row.max_area_km2),
        min_area_km2: parseNumberSafe(row.min_area_km2),
        normal_area_km2: parseNumberSafe(row.normal_area_km2),
        max_capacity_mcm: parseNumberSafe(row.max_capacity_mcm),
        min_capacity_mcm: parseNumberSafe(row.min_capacity_mcm),
        normal_capacity_mcm: parseNumberSafe(row.normal_capacity_mcm),
        average_depth_m: parseNumberSafe(row.average_depth_m),
        water_head_m: parseNumberSafe(row.water_head_m),
        design_flow_m3s: parseNumberSafe(row.design_flow_m3s),
        power_mw: parseNumberSafe(row.power_mw),
        main_use: cleanValue(row.main_use),
        second_use: cleanValue(row.second_use),
        longitude: parseNumberSafe(row.longitude),
        latitude: parseNumberSafe(row.latitude),
    };
}

async function fetchCsv(path) {
    const res = await fetch(getAssetPath(path));
    if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
    const text = await res.text();
    return new Promise((resolve, reject) => {
        Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (r) => resolve(r.data),
            error: reject,
        });
    });
}

export async function loadStations() {
    const [allRows, critRows] = await Promise.all([
        fetchCsv("/data/static_data/13-all_static.csv"),
        fetchCsv("/data/static_data/16-critical_static.csv"),
    ]);
    const critIds = new Set(
        critRows.map((r) => Number(r.SEAWEA_ID)).filter((n) => Number.isFinite(n))
    );
    return allRows
        .map(normalizeStationRow)
        .filter((r) => r.SEAWEA_ID != null && r.longitude != null && r.latitude != null)
        .map((r) => ({ ...r, is_critical: critIds.has(r.SEAWEA_ID) }));
}

let _dynamicIndexCache = null;
export async function loadDynamicIndex() {
    if (_dynamicIndexCache) return _dynamicIndexCache;
    const res = await fetch(getAssetPath("/data/dynamic_index.json"));
    if (!res.ok) throw new Error("Failed to load dynamic index");
    _dynamicIndexCache = await res.json();
    return _dynamicIndexCache;
}

export async function loadDynamicSeries(seaweaId) {
    const idx = await loadDynamicIndex();
    const fname = idx[String(seaweaId)] || idx[seaweaId];
    if (!fname) return null;
    const rows = await fetchCsv(`/data/dynamic_data/${fname}`);
    return rows
        .map((r) => ({
            time: r.Time,
            date: new Date(r.Time),
            area_km2: parseNumberSafe(r.area_km2),
            elevation_m: parseNumberSafe(r.elevation_m),
            changed_storage_mcm: parseNumberSafe(r.changed_storage_mcm),
        }))
        .filter((r) => !Number.isNaN(r.date?.getTime()));
}

export async function loadGeoJson(name) {
    const res = await fetch(getAssetPath(`/data/geojson/${name}.geojson`));
    if (!res.ok) throw new Error(`Failed to load ${name}.geojson`);
    return res.json();
}

export async function loadAllBoundaries() {
    const [countries, basins, research] = await Promise.all([
        loadGeoJson("countries"),
        loadGeoJson("basins"),
        loadGeoJson("research_region"),
    ]);
    return { countries, basins, research };
}
