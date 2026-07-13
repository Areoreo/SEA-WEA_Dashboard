import React, { useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import {
    NUMERIC_ATTRIBUTES,
    SUMMARY_CLASSES,
    SUMMARY_PLOT_POSITIONS,
    classifyStation,
} from "../../utils/constants";
import { assignFeature, featureCentroid } from "../../utils/geoUtils";
import { useTheme } from "../Theme/ThemeProvider";

// --- Plot geometry (px) -----------------------------------------------------
// The bars are drawn as an inline SVG with exact polygon faces (front / top /
// right) rather than CSS-skewed divs. Computing each face's corner points
// directly removes the sub-pixel rounding/translate drift that made the old
// skewed-div faces look misaligned, and keeps everything crisp at any DPR.
const BAR_W = 20;
const BAR_GAP = 14;
const DEPTH = 8; // isometric offset (up-right) for the top/right faces
const MAX_H = 78;
const NUM_SPACE = 18; // headroom above the tallest bar for its value label
const MARGIN_X = 18;
const LABEL_GAP = 8;
const LABEL_H = 24;

// Lighten (+) / darken (-) a hex color by a percentage of full white/black.
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

// Compact value formatter for the on-bar labels so large sums (e.g. capacity)
// stay narrow enough to sit over a single bar.
function compact(v) {
    if (!Number.isFinite(v)) return "";
    const a = Math.abs(v);
    if (a >= 1e9) return (v / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    if (a >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (a >= 1e3) return (v / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
    return String(Math.round(v));
}

const N = SUMMARY_CLASSES.length;
const BARS_W = N * BAR_W + (N - 1) * BAR_GAP;
const SVG_W = MARGIN_X * 2 + BARS_W + DEPTH;
const Y_BASE = NUM_SPACE + DEPTH + MAX_H; // y of the bar baseline (front bottom)
const SVG_H = Y_BASE + LABEL_GAP + LABEL_H;

function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function barSvg(value, maxValue, color, x, label) {
    const pct = maxValue > 0 ? value / maxValue : 0;
    const h = value > 0 ? Math.max(3, Math.round(MAX_H * pct)) : 0;
    const yTop = Y_BASE - h;
    const xr = x + BAR_W; // front right edge
    const front = color;
    const top = shade(color, 20);
    const side = shade(color, -24);
    const stroke = label.faceStroke;

    const faces =
        h > 0
            ? `
        <polygon points="${xr},${yTop} ${xr + DEPTH},${yTop - DEPTH} ${xr + DEPTH},${Y_BASE - DEPTH} ${xr},${Y_BASE}" fill="${side}" stroke="${stroke}" stroke-width="0.5"/>
        <polygon points="${x},${yTop} ${x + DEPTH},${yTop - DEPTH} ${xr + DEPTH},${yTop - DEPTH} ${xr},${yTop}" fill="${top}" stroke="${stroke}" stroke-width="0.5"/>
        <rect x="${x}" y="${yTop}" width="${BAR_W}" height="${h}" fill="${front}" stroke="${stroke}" stroke-width="0.5"/>`
            : "";

    const numX = x + BAR_W / 2 + DEPTH / 2;
    const numY = (h > 0 ? yTop - DEPTH : Y_BASE - DEPTH) - 5;
    const num = `<text x="${numX}" y="${numY}" text-anchor="middle" font-size="10" font-weight="700" fill="${label.ink}" stroke="${label.halo}" stroke-width="2.6" paint-order="stroke" style="paint-order:stroke">${esc(
        compact(value)
    )}</text>`;

    return faces + num;
}

function plotSvg(name, bars, maxValue, theme) {
    const label = theme.summaryLabel;
    const barsSvg = SUMMARY_CLASSES.map((cls, i) => {
        const x = MARGIN_X + i * (BAR_W + BAR_GAP);
        return barSvg(
            bars[cls.key] ?? 0,
            maxValue,
            theme.data.summary[cls.key],
            x,
            label
        );
    }).join("");

    const labelY = Y_BASE + LABEL_GAP;
    const labelSvg = `
        <rect x="2" y="${labelY}" width="${SVG_W - 4}" height="${LABEL_H}" rx="6" fill="${label.pillBg}"/>
        <text x="${SVG_W / 2}" y="${labelY + LABEL_H / 2 + 4}" text-anchor="middle" font-size="12" font-weight="600" fill="${label.ink}" style="letter-spacing:-0.1px">${esc(
            name
        )}</text>`;

    return `<svg class="ps-sumplot" width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}" style="overflow:visible">${barsSvg}${labelSvg}</svg>`;
}

export default function SummaryLayer({ features, labelKey, stations, selectedAttribute }) {
    const { theme } = useTheme();
    const attrMeta = useMemo(
        () => NUMERIC_ATTRIBUTES.find((a) => a.key === selectedAttribute),
        [selectedAttribute]
    );
    const mode = attrMeta?.summary || "count";

    const data = useMemo(() => {
        if (!features || !features.features) return [];
        // Pre-seed every region so empty ones still render a (flat) plot.
        const byRegion = {};
        for (const f of features.features) {
            const name = f.properties?.[labelKey];
            if (!name) continue;
            byRegion[name] = {
                name,
                feature: f,
                bars: { critical: 0, nonCritical: 0, unknown: 0 },
            };
        }
        for (const s of stations) {
            const name = assignFeature(s.longitude, s.latitude, features, labelKey);
            if (!name || !byRegion[name]) continue;
            const cls = classifyStation(s);
            if (mode === "sum") {
                const v = s[selectedAttribute];
                if (Number.isFinite(v)) byRegion[name].bars[cls] += v;
            } else if (Number.isFinite(s[selectedAttribute])) {
                // count: only stations that actually carry the attribute, so the
                // chosen attribute keeps mattering.
                byRegion[name].bars[cls] += 1;
            }
        }
        return Object.values(byRegion);
    }, [features, labelKey, stations, selectedAttribute, mode]);

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
                // Hard-coded anchor wins; otherwise fall back to the centroid.
                // Override is [lat, lng]; featureCentroid returns [lng, lat].
                const override = SUMMARY_PLOT_POSITIONS[d.name];
                let position;
                if (Array.isArray(override) && override.length === 2) {
                    position = override;
                } else {
                    const centroid = featureCentroid(d.feature);
                    if (!centroid) return null;
                    position = [centroid[1], centroid[0]];
                }
                const icon = L.divIcon({
                    className: "ps-sumplot-wrapper",
                    html: plotSvg(d.name, d.bars, maxValue, theme),
                    iconSize: [SVG_W, SVG_H],
                    iconAnchor: [SVG_W / 2, SVG_H],
                });
                return (
                    <Marker
                        key={d.name}
                        position={position}
                        icon={icon}
                        interactive={false}
                        keyboard={false}
                        // Float the plots above every station marker so scatter
                        // dots never cover a bar group.
                        zIndexOffset={1000000}
                    />
                );
            })}
        </>
    );
}
