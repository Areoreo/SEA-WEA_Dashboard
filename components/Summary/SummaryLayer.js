import React, { useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import {
    NUMERIC_ATTRIBUTES,
    SUMMARY_CLASSES,
    classifyStation,
    formatNumber,
} from "../../utils/constants";
import { assignFeature, featureCentroid } from "../../utils/geoUtils";

// Fixed pixel geometry of the bar plot — deliberately chunky so the three
// bars stay legible at small zooms but still fit over a basin centroid.
const BAR_WIDTH = 18;
const BAR_GAP = 6;
const PLOT_MAX_HEIGHT = 90;
const PLOT_PAD_X = 10;
const PLOT_PAD_Y = 14;
const LABEL_HEIGHT = 34;

function shade(hex, percent) {
    const h = hex.replace("#", "");
    const num = parseInt(
        h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
        16
    );
    let r = (num >> 16) + Math.round((percent / 100) * 255);
    let g = ((num >> 8) & 0xff) + Math.round((percent / 100) * 255);
    let b = (num & 0xff) + Math.round((percent / 100) * 255);
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// Build the HTML string for a single 3D bar. Front / top / right faces are
// skewed divs for the same "power-on" depth as the other 3D bar components.
function barHtml(value, maxValue, color, depth = 8) {
    const pct = maxValue > 0 ? Math.max(0.02, value / maxValue) : 0;
    const h = Math.round(PLOT_MAX_HEIGHT * pct);
    const front = `linear-gradient(180deg, ${color} 0%, ${shade(color, -20)} 100%)`;
    const top = `linear-gradient(180deg, ${shade(color, 18)} 0%, ${color} 100%)`;
    const right = `linear-gradient(90deg, ${shade(color, -15)} 0%, ${shade(color, -35)} 100%)`;
    return `
        <div class="ps-sumbar" style="width:${BAR_WIDTH}px;height:${h}px;">
            <div class="ps-sumbar-front" style="background:${front};"></div>
            <div class="ps-sumbar-top" style="background:${top};width:${BAR_WIDTH}px;height:${depth}px;top:${-depth / 2}px;"></div>
            <div class="ps-sumbar-right" style="background:${right};width:${depth}px;height:100%;right:${-depth / 2}px;"></div>
        </div>
    `;
}

function plotHtml({ label, bars, maxValue, metricLabel, metricMode }) {
    const totalWidth =
        SUMMARY_CLASSES.length * BAR_WIDTH +
        (SUMMARY_CLASSES.length - 1) * BAR_GAP +
        PLOT_PAD_X * 2;
    const totalHeight = PLOT_MAX_HEIGHT + PLOT_PAD_Y + LABEL_HEIGHT;

    const barsHtml = SUMMARY_CLASSES.map((cls) => {
        const value = bars[cls.key] ?? 0;
        return `
            <div class="ps-sumbar-col" title="${cls.label}: ${formatNumber(value)}">
                ${barHtml(value, maxValue, cls.color)}
            </div>
        `;
    }).join("");

    return `
        <div class="ps-sumplot" style="width:${totalWidth}px;height:${totalHeight}px;">
            <div class="ps-sumplot-bars" style="height:${PLOT_MAX_HEIGHT}px;gap:${BAR_GAP}px;padding:0 ${PLOT_PAD_X}px;">
                ${barsHtml}
            </div>
            <div class="ps-sumplot-label">
                <div class="ps-sumplot-basin">${label}</div>
                <div class="ps-sumplot-metric">${metricLabel} · ${metricMode === "sum" ? "sum" : "count"}</div>
            </div>
        </div>
    `;
}

export default function SummaryLayer({ basins, stations, selectedAttribute }) {
    const attrMeta = useMemo(
        () => NUMERIC_ATTRIBUTES.find((a) => a.key === selectedAttribute),
        [selectedAttribute]
    );
    const mode = attrMeta?.summary || "count";
    const metricLabel = attrMeta?.label || selectedAttribute;

    const data = useMemo(() => {
        if (!basins || !basins.features) return [];
        // Pre-seed every basin so empty ones still render a (flat) plot.
        const byBasin = {};
        for (const f of basins.features) {
            const name = f.properties?.basin;
            if (!name) continue;
            byBasin[name] = {
                name,
                feature: f,
                bars: { critical: 0, nonCritical: 0, unknown: 0 },
            };
        }
        for (const s of stations) {
            const basinName = assignFeature(
                s.longitude,
                s.latitude,
                basins,
                "basin"
            );
            if (!basinName || !byBasin[basinName]) continue;
            const cls = classifyStation(s);
            if (mode === "sum") {
                const v = s[selectedAttribute];
                if (Number.isFinite(v)) byBasin[basinName].bars[cls] += v;
            } else {
                // count: include only stations that actually have the attribute
                // value, so the choice of attribute continues to matter.
                if (Number.isFinite(s[selectedAttribute])) {
                    byBasin[basinName].bars[cls] += 1;
                }
            }
        }
        return Object.values(byBasin);
    }, [basins, stations, selectedAttribute, mode]);

    const maxValue = useMemo(() => {
        let m = 0;
        for (const d of data) {
            for (const k of Object.keys(d.bars)) {
                if (d.bars[k] > m) m = d.bars[k];
            }
        }
        return m;
    }, [data]);

    return (
        <>
            {data.map((d) => {
                const centroid = featureCentroid(d.feature);
                if (!centroid) return null;
                const [lng, lat] = centroid;
                const html = plotHtml({
                    label: d.name,
                    bars: d.bars,
                    maxValue,
                    metricLabel,
                    metricMode: mode,
                });
                const totalWidth =
                    SUMMARY_CLASSES.length * BAR_WIDTH +
                    (SUMMARY_CLASSES.length - 1) * BAR_GAP +
                    PLOT_PAD_X * 2;
                const totalHeight = PLOT_MAX_HEIGHT + PLOT_PAD_Y + LABEL_HEIGHT;
                const icon = L.divIcon({
                    className: "ps-sumplot-wrapper",
                    html,
                    iconSize: [totalWidth, totalHeight],
                    iconAnchor: [totalWidth / 2, totalHeight],
                });
                return (
                    <Marker
                        key={d.name}
                        position={[lat, lng]}
                        icon={icon}
                        interactive={false}
                        keyboard={false}
                    />
                );
            })}
        </>
    );
}
