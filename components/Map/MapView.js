import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BASEMAPS } from "../../utils/constants";
import { buildUseIconSvg } from "../icons/UseIcon";
import SummaryLayer from "../Summary/SummaryLayer";
import { useTheme } from "../Theme/ThemeProvider";

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

function buildCriticalIcon(station, size, isSelected, theme) {
    const color = theme.data.use[station.main_use] || theme.data.useFallback;
    const glyph = buildUseIconSvg(station.main_use, "#ffffff", Math.round(size * 0.55));
    const ring = isSelected
        ? `box-shadow:0 0 0 3px ${theme.map.selectedOutline},0 0 0 6px rgb(var(--pulse-rgb) / 0.35),0 2px 6px rgba(0,0,0,0.35);`
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

function PolygonsLayer({ spatialUnit, countries, basins, selectedCountries, selectedBasins }) {
    const ref = useRef(null);
    const { theme, themeId } = useTheme();
    const isBasin = spatialUnit === "basins";
    const data = isBasin ? basins : countries;
    const labelKey = isBasin ? "basin" : "country";
    const colorMap = isBasin ? theme.data.basin : theme.data.country;
    const selected = isBasin ? selectedBasins : selectedCountries;
    const selKey = selected.join("|");

    // Selected regions keep their fill and gain a bold accent outline;
    // everything else fades to the theme's dimmed greys so the selection
    // reads as the focus. With no selection, all regions show their resting
    // style.
    const styleFn = useCallback(
        (f) => {
            const name = f.properties[labelKey];
            const baseFill = colorMap[name] || theme.map.noDataFill;
            const restingOpacity =
                theme.map.restingFillOpacity[isBasin ? "basins" : "countries"];
            if (selected.length === 0) {
                return {
                    fillColor: baseFill,
                    fillOpacity: restingOpacity,
                    color: theme.map.restingOutline,
                    weight: 0.6,
                };
            }
            if (selected.includes(name)) {
                return {
                    fillColor: baseFill,
                    fillOpacity: theme.map.selectedFillOpacity,
                    color: theme.map.selectedOutline,
                    weight: 2.5,
                };
            }
            return {
                fillColor: theme.map.dimmedFill,
                fillOpacity: theme.map.dimmedFillOpacity,
                color: theme.map.dimmedLine,
                weight: 0.5,
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isBasin, labelKey, selKey, themeId]
    );

    // Re-style the existing paths imperatively (react-leaflet does not re-run
    // `style` on prop change) so toggling chips never re-parses the geometry.
    useEffect(() => {
        if (ref.current) ref.current.setStyle(styleFn);
    }, [styleFn]);

    return (
        <GeoJSON
            key={isBasin ? "basins" : "countries"}
            ref={ref}
            data={data}
            style={styleFn}
            onEachFeature={(f, layer) => {
                const name = f.properties[labelKey];
                layer.bindTooltip(isBasin ? `${name} Basin` : name, {
                    sticky: true,
                    className: "ps-tooltip",
                });
            }}
        />
    );
}

// Animate to the bounds of the selected regions. With no selection we fall
// back to the research region — but the very first render is left to
// FitToRegion so the initial load stays an instant fit rather than a fly-in.
function FitToSelection({ spatialUnit, selectedCountries, selectedBasins, boundaries }) {
    const map = useMap();
    const mounted = useRef(false);
    const isBasin = spatialUnit === "basins";
    const selected = isBasin ? selectedBasins : selectedCountries;
    const selKey = `${spatialUnit}:${selected.join("|")}`;

    useEffect(() => {
        if (!boundaries) return;
        if (!mounted.current) {
            mounted.current = true;
            if (selected.length === 0) return;
        }
        const fc = isBasin ? boundaries.basins : boundaries.countries;
        const labelKey = isBasin ? "basin" : "country";
        let target = null;
        if (selected.length > 0 && fc) {
            const feats = fc.features.filter((f) =>
                selected.includes(f.properties[labelKey])
            );
            if (feats.length) {
                try {
                    const b = L.geoJSON({
                        type: "FeatureCollection",
                        features: feats,
                    }).getBounds();
                    if (b.isValid()) target = b;
                } catch (e) {
                    /* ignore malformed geometry */
                }
            }
        }
        if (!target && boundaries.research) {
            try {
                const b = L.geoJSON(boundaries.research).getBounds();
                if (b.isValid()) target = b;
            } catch (e) {
                /* ignore */
            }
        }
        if (target) {
            map.flyToBounds(target, { padding: [40, 40], duration: 0.8, maxZoom: 9 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selKey, boundaries]);

    return null;
}

function BasemapToggle({ basemap, onChange }) {
    return (
        <div
            className="leaflet-bottom leaflet-right"
            style={{ pointerEvents: "auto", marginBottom: 28, marginRight: 12 }}
        >
            <div className="leaflet-control glass-panel rounded-pill p-1 inline-flex shadow-ps-2">
                {Object.entries(BASEMAPS).map(([key, cfg]) => (
                    <button
                        key={key}
                        onClick={() => onChange(key)}
                        className={`px-3 py-1 rounded-pill text-[12px] font-medium transition ${
                            basemap === key
                                ? "bg-ps-blue text-on-accent"
                                : "text-ps-charcoal hover:bg-panel-soft-2"
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
    selectedCountries,
    selectedBasins,
    selectedAttribute,
    selectedStation,
    onStationClick,
    basemap,
    onBasemapChange,
    onScaleChange,
    summaryVisible,
}) {
    const { theme, themeId } = useTheme();
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
                        selectedCountries={selectedCountries}
                        selectedBasins={selectedBasins}
                    />
                    {/* Keyed by theme — react-leaflet does not re-apply a
                        changed `style` prop, so remount on switch (cheap:
                        one outline). */}
                    <GeoJSON
                        key={`research-${themeId}`}
                        data={boundaries.research}
                        style={{
                            color: theme.map.researchOutline,
                            weight: 2,
                            fill: false,
                            opacity: 0.9,
                            dashArray: "4 6",
                        }}
                    />
                    <FitToRegion research={boundaries.research} />
                    <FitToSelection
                        spatialUnit={spatialUnit}
                        selectedCountries={selectedCountries}
                        selectedBasins={selectedBasins}
                        boundaries={boundaries}
                    />
                </>
            )}

            {/* Non-critical: canvas circle, filled with use color so type is legible */}
            {nonCritical.map((s) => {
                const color = theme.data.use[s.main_use] || theme.data.useFallback;
                const isSelected = selectedStation?.SEAWEA_ID === s.SEAWEA_ID;
                return (
                    <CircleMarker
                        key={`nc-${s.SEAWEA_ID}`}
                        center={[s.latitude, s.longitude]}
                        radius={isSelected ? 8 : 5}
                        pathOptions={{
                            color: isSelected ? theme.map.selectedOutline : "#ffffff",
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
                const icon = buildCriticalIcon(s, size, isSelected, theme);
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
            {summaryVisible && boundaries && (
                <SummaryLayer
                    features={
                        spatialUnit === "countries"
                            ? boundaries.countries
                            : boundaries.basins
                    }
                    labelKey={spatialUnit === "countries" ? "country" : "basin"}
                    stations={stations}
                    selectedAttribute={selectedAttribute}
                />
            )}
            <BasemapToggle basemap={basemap} onChange={onBasemapChange} />
        </MapContainer>
    );
}
