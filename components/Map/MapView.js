import React, { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
    USE_COLORS,
    USE_COLOR_FALLBACK,
    COUNTRY_COLORS,
    BASIN_COLORS,
} from "../../utils/constants";
import { buildUseIconSvg } from "../icons/UseIcon";

const RESEARCH_REGION_BOUNDS = [
    [6, 92],
    [29, 110],
];

function FitToRegion({ research }) {
    const map = useMap();
    useEffect(() => {
        if (!research) return;
        try {
            const layer = L.geoJSON(research);
            const bounds = layer.getBounds();
            if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
        } catch (e) {
            map.fitBounds(RESEARCH_REGION_BOUNDS);
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

function computeScale(stations, attrKey) {
    const vals = stations
        .map((s) => s[attrKey])
        .filter((v) => Number.isFinite(v) && v > 0);
    if (vals.length === 0) return () => 22;
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    return (v) => {
        if (!Number.isFinite(v) || v <= 0) return 20;
        const t = Math.sqrt((v - min) / (max - min || 1));
        return 18 + t * 22; // 18 → 40
    };
}

function buildMarkerIcon(station, size, isSelected) {
    const color = USE_COLORS[station.main_use] || USE_COLOR_FALLBACK;
    const glyph = buildUseIconSvg(station.main_use, "#ffffff", Math.round(size * 0.55));
    const pulseCls = station.is_critical ? " critical" : "";
    const selectedCls = isSelected ? " selected" : "";
    const ring = isSelected ? "box-shadow:0 0 0 3px #1eaedb, 0 2px 6px rgba(0,0,0,0.35);" : "";
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
                    fillOpacity: 0.45,
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

export default function MapView({
    stations,
    boundaries,
    spatialUnit,
    selectedAttribute,
    selectedStation,
    onStationClick,
}) {
    const scale = useMemo(() => computeScale(stations, selectedAttribute), [stations, selectedAttribute]);

    return (
        <MapContainer
            center={[15, 102]}
            zoom={5}
            className="h-full w-full"
            scrollWheelZoom
            zoomControl={false}
            preferCanvas
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
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
                            color: "#1eaedb",
                            weight: 2,
                            fill: false,
                            opacity: 0.9,
                            dashArray: "4 6",
                        }}
                    />
                    <FitToRegion research={boundaries.research} />
                </>
            )}
            {stations.map((s) => {
                const size = Math.round(scale(s[selectedAttribute]));
                const isSelected = selectedStation?.SEAWEA_ID === s.SEAWEA_ID;
                const icon = buildMarkerIcon(s, size, isSelected);
                return (
                    <Marker
                        key={s.SEAWEA_ID}
                        position={[s.latitude, s.longitude]}
                        icon={icon}
                        eventHandlers={{
                            click: () => onStationClick(s),
                        }}
                    />
                );
            })}
            <FlyToStation target={selectedStation} />
        </MapContainer>
    );
}
