import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
    USE_COLORS,
    USE_COLOR_FALLBACK,
    COUNTRY_COLORS,
    BASIN_COLORS,
    BASEMAPS,
} from "../../utils/constants";
import { buildUseIconSvg } from "../icons/UseIcon";
import SummaryLayer from "../Summary/SummaryLayer";

function FitToRegion({ research }) {
    const map = useMap();
    useEffect(() => {
        if (!research) return;
        try {
            const layer = L.geoJSON(research);
            const bounds = layer.getBounds();
            if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
        } catch (e) {
            map.fitBounds([
                [6, 92],
                [29, 110],
            ]);
        }
    }, [research]);
    return null;
}

function FlyToStation({ target }) {
    const map = useMap();
    useEffect(() => {
        if (target && Number.isFinite(target.latitude) && Number.isFinite(target.longitude)) {
            map.flyTo([target.latitude, target.longitude], Math.max(map.getZoom(), 9), {
                duration: 0.8,
            });
        }
    }, [target]);
    return null;
}

export const SIZE_MIN_PX = 22;
export const SIZE_MAX_PX = 44;

export function computeScale(stations, attrKey) {
    const vals = stations
        .map((s) => s[attrKey])
        .filter((v) => Number.isFinite(v) && v > 0);
    if (vals.length === 0) return { scale: () => 26, min: null, max: null };
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const fn = (v) => {
        if (!Number.isFinite(v) || v <= 0) return SIZE_MIN_PX;
        const t = Math.sqrt((v - min) / (max - min || 1));
        return SIZE_MIN_PX + t * (SIZE_MAX_PX - SIZE_MIN_PX);
    };
    return { scale: fn, min, max };
}

function buildCriticalIcon(station, size, isSelected) {
    const color = USE_COLORS[station.main_use] || USE_COLOR_FALLBACK;
    const glyph = buildUseIconSvg(station.main_use, "#ffffff", Math.round(size * 0.55));
    const ring = isSelected
        ? "box-shadow:0 0 0 3px #0070cc,0 0 0 6px rgba(30,174,219,0.35),0 2px 6px rgba(0,0,0,0.35);"
        : "";
    const pulseCls = " critical";
    const selectedCls = isSelected ? " selected" : "";
    return L.divIcon({
        className: "ps-marker-wrapper",
        html: `<div class="ps-marker${pulseCls}${selectedCls}" style="width:${size}px;height:${size}px;background:${color};${ring}">${glyph}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

function PolygonsLayer({ spatialUnit, countries, basins }) {
    if (spatialUnit === "countries") {
        return (
            <GeoJSON
                key="countries"
                data={countries}
                style={(f) => ({
                    fillColor: COUNTRY_COLORS[f.properties.country] || "#e8ecef",
                    fillOpacity: 0.5,
                    color: "#8fa0b4",
                    weight: 0.6,
                })}
                onEachFeature={(f, layer) => {
                    layer.bindTooltip(f.properties.country, {
                        sticky: true,
                        className: "ps-tooltip",
                    });
                }}
            />
        );
    }
    return (
        <GeoJSON
            key="basins"
            data={basins}
            style={(f) => ({
                fillColor: BASIN_COLORS[f.properties.basin] || "#e8ecef",
                fillOpacity: 0.55,
                color: "#8fa0b4",
                weight: 0.6,
            })}
            onEachFeature={(f, layer) => {
                layer.bindTooltip(`${f.properties.basin} Basin`, {
                    sticky: true,
                    className: "ps-tooltip",
                });
            }}
        />
    );
}

function BasemapToggle({ basemap, onChange }) {
    return (
        <div
            className="leaflet-bottom leaflet-right"
            style={{ pointerEvents: "auto", marginBottom: 28, marginRight: 12 }}
        >
            <div className="leaflet-control bg-white/95 backdrop-blur rounded-pill p-1 inline-flex shadow-ps-2">
                {Object.entries(BASEMAPS).map(([key, cfg]) => (
                    <button
                        key={key}
                        onClick={() => onChange(key)}
                        className={`px-3 py-1 rounded-pill text-[12px] font-medium transition ${
                            basemap === key
                                ? "bg-ps-blue text-white"
                                : "text-ps-charcoal hover:bg-[#e2e8f0]"
                        }`}
                        title={`Switch to ${cfg.label} basemap`}
                    >
                        {cfg.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function MapView({
    stations,
    boundaries,
    spatialUnit,
    selectedAttribute,
    selectedStation,
    onStationClick,
    basemap,
    onBasemapChange,
    onScaleChange,
    summaryVisible,
}) {
    const basemapCfg = BASEMAPS[basemap] || BASEMAPS.light;
    const scaleInfo = useMemo(
        () => computeScale(stations.filter((s) => s.is_critical), selectedAttribute),
        [stations, selectedAttribute]
    );
    const scale = scaleInfo.scale;

    // Push the scale range out so the parent / Legend can reflect the same numbers.
    useEffect(() => {
        if (typeof onScaleChange === "function") {
            onScaleChange({ min: scaleInfo.min, max: scaleInfo.max });
        }
    }, [scaleInfo.min, scaleInfo.max, onScaleChange]);

    // Split into two groups — critical uses DivIcon (DOM, rich) while
    // non-critical uses CircleMarker (canvas, very light) for memory.
    const { critical, nonCritical } = useMemo(() => {
        const crit = [],
            nc = [];
        for (const s of stations) {
            if (s.is_critical) crit.push(s);
            else nc.push(s);
        }
        return { critical: crit, nonCritical: nc };
    }, [stations]);

    return (
        <MapContainer
            center={[15, 102]}
            zoom={5}
            className="h-full w-full"
            scrollWheelZoom
            zoomControl={false}
            preferCanvas
            style={{ background: basemapCfg.background }}
        >
            <TileLayer
                key={basemap}
                attribution={basemapCfg.attribution}
                url={basemapCfg.url}
            />
            {boundaries && (
                <>
                    <PolygonsLayer
                        spatialUnit={spatialUnit}
                        countries={boundaries.countries}
                        basins={boundaries.basins}
                    />
                    <GeoJSON
                        key="research"
                        data={boundaries.research}
                        style={{
                            color: "#0070cc",
                            weight: 2,
                            fill: false,
                            opacity: 0.9,
                            dashArray: "4 6",
                        }}
                    />
                    <FitToRegion research={boundaries.research} />
                </>
            )}

            {/* Non-critical: canvas circle, filled with use color so type is legible */}
            {nonCritical.map((s) => {
                const color = USE_COLORS[s.main_use] || USE_COLOR_FALLBACK;
                const isSelected = selectedStation?.SEAWEA_ID === s.SEAWEA_ID;
                return (
                    <CircleMarker
                        key={`nc-${s.SEAWEA_ID}`}
                        center={[s.latitude, s.longitude]}
                        radius={isSelected ? 8 : 5}
                        pathOptions={{
                            color: isSelected ? "#0070cc" : "#ffffff",
                            weight: isSelected ? 2.5 : 1.2,
                            opacity: 1,
                            fillColor: color,
                            fillOpacity: isSelected ? 1 : 0.9,
                        }}
                        eventHandlers={{
                            click: () => onStationClick(s),
                        }}
                    />
                );
            })}

            {/* Critical: rich DivIcon with pulse and use-type glyph */}
            {critical.map((s) => {
                const size = Math.round(scale(s[selectedAttribute]));
                const isSelected = selectedStation?.SEAWEA_ID === s.SEAWEA_ID;
                const icon = buildCriticalIcon(s, size, isSelected);
                return (
                    <Marker
                        key={`c-${s.SEAWEA_ID}`}
                        position={[s.latitude, s.longitude]}
                        icon={icon}
                        eventHandlers={{
                            click: () => onStationClick(s),
                        }}
                    />
                );
            })}

            <FlyToStation target={selectedStation} />
            {summaryVisible && boundaries?.basins && (
                <SummaryLayer
                    basins={boundaries.basins}
                    stations={stations}
                    selectedAttribute={selectedAttribute}
                />
            )}
            <BasemapToggle basemap={basemap} onChange={onBasemapChange} />
        </MapContainer>
    );
}
