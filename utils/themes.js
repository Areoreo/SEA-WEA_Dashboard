// Theme system — single source of truth for every themable value.
//
// Each theme carries two kinds of values:
//   • `tokens`  — emitted as CSS custom properties by buildThemeCss() and
//                 consumed by Tailwind (tailwind.config.js maps utility names
//                 to var(--…)) and globals.scss.
//   • JS groups — `data` / `map` / `chart` / `summaryLabel` / `stationHeaderTo`
//                 consumed directly by components that need plain color strings
//                 at render time (Leaflet DivIcon HTML, D3 SVG props, summary
//                 SVG builder). All data-palette values MUST stay 6-digit hex —
//                 SummaryLayer's shade() only parses #rrggbb.
//
// "classic" transcribes the original PlayStation design system 1:1; with no
// data-theme attribute set the app renders exactly as before this system
// existed. Classic value provenance (original locations before tokenization):
//   #0070cc/#1eaedb/…       tailwind.config.js + globals.scss :root
//   USE/COUNTRY/BASIN/SUMMARY colors   utils/constants.js
//   dimmed fills, outlines  MapView.js (DIMMED_FILL/DIMMED_LINE, styleFn)
//   chart hexes             DynamicPanel.js (METRICS, axes, tooltip, brush)
//   summary label ink/halo  SummaryLayer.js barSvg/plotSvg
//
// New-theme categorical palettes were validated with the dataviz palette
// validator (--pairs all, per-theme surface): hydrology & monsoon worst
// all-pairs CVD ΔE 15.7 (PASS); mission 10.0 (floor band — legal with the
// existing secondary encoding: in-marker glyphs, white rings, legend).

export const THEME_IDS = ["classic", "hydrology", "mission", "monsoon"];
export const DEFAULT_THEME = "classic";
export const THEME_STORAGE_KEY = "seawea-theme";

// Font stacks. The var(--font-*) entries are provided by next/font in
// pages/_app.js; each falls back to a system stack when fonts fail to load.
const SST_STACK =
    '"SST", "Playstation SST", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
const INTER_STACK =
    'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
const SERIF_STACK = 'var(--font-source-serif), Georgia, "Times New Roman", serif';
const MONO_STACK = 'var(--font-plex-mono), "SFMono-Regular", Menlo, Consolas, monospace';
const MANROPE_STACK =
    'var(--font-manrope), -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

// token key → emitted CSS custom property
const TOKEN_VARS = {
    page: "--page",
    pageWash: "--page-wash",
    panel: "--panel",
    panelGlass: "--panel-glass",
    glassBlur: "--glass-blur",
    panelSoft: "--panel-soft",
    panelSoft2: "--panel-soft-2",
    ink: "--ink",
    ink2: "--ink-2",
    ink3: "--ink-3",
    onAccent: "--on-accent",
    accent: "--accent",
    accent2: "--accent-2",
    accentHover: "--accent-hover",
    link: "--link",
    linkHover: "--link-hover",
    danger: "--danger",
    cta: "--cta",
    ctaActive: "--cta-active",
    line: "--line",
    lineSoft: "--line-soft",
    lineStrong: "--line-strong",
    shadow1: "--shadow-1",
    shadow2: "--shadow-2",
    shadow3: "--shadow-3",
    shadowOverlay: "--shadow-overlay",
    shadowFloat: "--shadow-float",
    shadowPop: "--shadow-pop",
    radiusControl: "--radius-control",
    radiusPanel: "--radius-panel",
    radiusPanelLg: "--radius-panel-lg",
    radiusPill: "--radius-pill",
    fontDisplay: "--font-display",
    fontBody: "--font-body",
    fontData: "--font-data",
    dur1: "--dur-1",
    dur2: "--dur-2",
    dur3: "--dur-3",
    ease1: "--ease-1",
    easeEmphasis: "--ease-emphasis",
    hoverScale: "--hover-scale",
    hoverScaleMarker: "--hover-scale-marker",
    pulseRgb: "--pulse-rgb",
    pulseSpread: "--pulse-spread",
    pulsePeriod: "--pulse-period",
    tipBg: "--tip-bg",
    tipInk: "--tip-ink",
    scrollTrack: "--scroll-track",
    scrollThumb: "--scroll-thumb",
    scrollThumbHover: "--scroll-thumb-hover",
    leafletPopupRadius: "--leaflet-popup-radius",
};

export const THEMES = {
    /* ---------------------------------------------------------------- */
    /* 0 — Classic: the original PlayStation voice, unchanged            */
    /* ---------------------------------------------------------------- */
    classic: {
        id: "classic",
        name: "Classic",
        tagline: "PlayStation blue",
        tokens: {
            page: "#f5f7fa",
            pageWash: "none",
            panel: "#ffffff",
            panelGlass: "rgba(255,255,255,0.95)",
            glassBlur: "8px",
            panelSoft: "#f5f7fa",
            panelSoft2: "#e2e8f0",
            ink: "#1f1f1f",
            ink2: "#6b6b6b",
            ink3: "#9aa5b1",
            onAccent: "#ffffff",
            accent: "#0070cc",
            accent2: "#1eaedb",
            accentHover: "#1eaedb",
            link: "#0068bd",
            linkHover: "#1883fd",
            danger: "#c81b3a",
            cta: "#d53b00",
            ctaActive: "#aa2f00",
            line: "#e4e7eb",
            lineSoft: "#f3f3f3",
            lineStrong: "#cccccc",
            shadow1: "0 5px 9px 0 rgba(0,0,0,0.06)",
            shadow2: "0 5px 9px 0 rgba(0,0,0,0.08)",
            shadow3: "0 5px 9px 0 rgba(0,0,0,0.16)",
            shadowOverlay: "0 5px 9px 0 rgba(0,0,0,0.12)",
            shadowFloat: "0 5px 14px rgba(0,0,0,0.14)",
            shadowPop: "0 5px 28px 0 rgba(0,0,0,0.2)",
            radiusControl: "3px",
            radiusPanel: "12px",
            radiusPanelLg: "24px",
            radiusPill: "999px",
            fontDisplay: SST_STACK,
            fontBody: SST_STACK,
            fontData: SST_STACK,
            dur1: "180ms",
            dur2: "220ms",
            dur3: "420ms",
            ease1: "cubic-bezier(0.4, 0, 0.2, 1)",
            easeEmphasis: "cubic-bezier(0.22, 1, 0.36, 1)",
            hoverScale: "1.06",
            hoverScaleMarker: "1.2",
            pulseRgb: "30 174 219",
            pulseSpread: "10px",
            pulsePeriod: "2.1s",
            tipBg: "rgba(0,0,0,0.85)",
            tipInk: "#ffffff",
            scrollTrack: "#f5f7fa",
            scrollThumb: "#cccccc",
            scrollThumbHover: "#0070cc",
            leafletPopupRadius: "12px",
        },
        data: {
            use: {
                Hydropower: "#5cc5ef",
                Irrigation: "#7bc36a",
                "Water supply": "#0a4f9e",
                "Flood control": "#ffb454",
                "Multiple purpose": "#b388ff",
                SEAWEA_UNKNOWN: "#9aa5b1",
            },
            useFallback: "#9aa5b1",
            summary: {
                critical: "#0070cc",
                nonCritical: "#8aa0b4",
                unknown: "#c9ced4",
            },
            country: {
                Cambodia: "#b9e3ff",
                Laos: "#ffe3b8",
                Myanmar: "#e5d6ff",
                Thailand: "#c8f0d2",
                Vietnam: "#ffd1d1",
            },
            basin: {
                ChaoPhraya: "#cfeaff",
                Irrawaddy: "#ffdfc0",
                Mekong: "#c8e8d4",
                Red: "#ffc9d1",
                Salween: "#e0d4ff",
                Other: "#e8ecef",
            },
        },
        map: {
            defaultBasemap: "light",
            dimmedFill: "#e3e7eb",
            dimmedLine: "#cbd2da",
            restingOutline: "#8fa0b4",
            selectedOutline: "#0070cc",
            researchOutline: "#0070cc",
            noDataFill: "#e8ecef",
            restingFillOpacity: { basins: 0.55, countries: 0.5 },
            selectedFillOpacity: 0.68,
            dimmedFillOpacity: 0.4,
        },
        chart: {
            grid: "#f3f3f3",
            axis: "#cccccc",
            tick: "#6b6b6b",
            zeroLine: "#cccccc",
            crosshair: "#1eaedb",
            dotRing: "#ffffff",
            tooltipBg: "#ffffff",
            tooltipBorder: "#f3f3f3",
            tooltipInk: "#1f1f1f",
            tooltipInk2: "#6b6b6b",
            series: {
                area_km2: "#0070cc",
                elevation_m: "#1883fd",
                changed_storage_mcm: "#d53b00",
            },
            brushTrack: "#f5f7fa",
            brushSpark: "#cccccc",
            brushAccent: "#0070cc",
            lineGlow: false,
        },
        summaryLabel: {
            ink: "#1f1f1f",
            halo: "#ffffff",
            pillBg: "rgba(255,255,255,0.95)",
            faceStroke: "rgba(0,0,0,0.10)",
        },
        stationHeaderTo: "#0070cc",
    },

    /* ---------------------------------------------------------------- */
    /* 1 — Hydrology Atlas: light editorial-scientific (usability pole)  */
    /* ---------------------------------------------------------------- */
    hydrology: {
        id: "hydrology",
        name: "Hydrology Atlas",
        tagline: "Printed-atlas calm",
        tokens: {
            page: "#f7f6f2",
            pageWash: "none",
            panel: "#fffdf9",
            // Near-opaque: the atlas voice is solid paper, and with no blur a
            // translucent panel lets underlying overlays ghost through.
            panelGlass: "rgba(255,253,249,0.99)",
            glassBlur: "0px",
            panelSoft: "#f1efe9",
            panelSoft2: "#e7e4dc",
            ink: "#1c1b18",
            ink2: "#5f5c55",
            ink3: "#8c8a82",
            onAccent: "#ffffff",
            accent: "#1c5a96",
            accent2: "#2e77bd",
            accentHover: "#174a7c",
            link: "#1c5a96",
            linkHover: "#2e77bd",
            danger: "#a83232",
            cta: "#b27400",
            ctaActive: "#8f5d00",
            line: "rgba(28,27,24,0.16)",
            lineSoft: "rgba(28,27,24,0.09)",
            lineStrong: "rgba(28,27,24,0.30)",
            // Hairline rings instead of drop shadows — the atlas voice.
            shadow1: "0 0 0 1px rgba(28,27,24,0.08)",
            shadow2: "0 0 0 1px rgba(28,27,24,0.10)",
            shadow3: "0 0 0 1px rgba(28,27,24,0.12), 0 2px 6px rgba(28,27,24,0.06)",
            shadowOverlay: "0 0 0 1px rgba(28,27,24,0.10)",
            shadowFloat: "0 0 0 1px rgba(28,27,24,0.10), 0 2px 8px rgba(28,27,24,0.06)",
            shadowPop: "0 0 0 1px rgba(28,27,24,0.12), 0 6px 18px rgba(28,27,24,0.10)",
            radiusControl: "4px",
            radiusPanel: "6px",
            radiusPanelLg: "8px",
            radiusPill: "6px",
            fontDisplay: SERIF_STACK,
            fontBody: INTER_STACK,
            fontData: INTER_STACK,
            dur1: "150ms",
            dur2: "200ms",
            dur3: "300ms",
            ease1: "cubic-bezier(0.4, 0, 0.2, 1)",
            easeEmphasis: "cubic-bezier(0.22, 1, 0.36, 1)",
            hoverScale: "1",
            hoverScaleMarker: "1.12",
            pulseRgb: "28 90 150",
            pulseSpread: "8px",
            pulsePeriod: "3s",
            tipBg: "rgba(28,27,24,0.9)",
            tipInk: "#fffdf9",
            scrollTrack: "#f1efe9",
            scrollThumb: "#cfccc2",
            scrollThumbHover: "#1c5a96",
            leafletPopupRadius: "6px",
        },
        data: {
            use: {
                Hydropower: "#4aa8dc",
                Irrigation: "#1e7d32",
                "Water supply": "#1c5a96",
                "Flood control": "#b27400",
                "Multiple purpose": "#7e57c7",
                SEAWEA_UNKNOWN: "#8f948b",
            },
            useFallback: "#8f948b",
            summary: {
                critical: "#1c5a96",
                nonCritical: "#a09a8c",
                unknown: "#d4d0c6",
            },
            country: {
                Cambodia: "#d8e4f0",
                Laos: "#f0e2c8",
                Myanmar: "#e4dcf0",
                Thailand: "#dbe8d9",
                Vietnam: "#f0d5d3",
            },
            basin: {
                ChaoPhraya: "#d8e4f0",
                Irrawaddy: "#f0e2c8",
                Mekong: "#dbe8d9",
                Red: "#f0d5d3",
                Salween: "#e4dcf0",
                Other: "#eae8e2",
            },
        },
        map: {
            defaultBasemap: "light",
            dimmedFill: "#e9e7e0",
            dimmedLine: "#d3d0c7",
            restingOutline: "#a39f93",
            selectedOutline: "#1c5a96",
            researchOutline: "#44423c",
            noDataFill: "#eae8e2",
            restingFillOpacity: { basins: 0.55, countries: 0.5 },
            selectedFillOpacity: 0.68,
            dimmedFillOpacity: 0.4,
        },
        chart: {
            grid: "#edeae2",
            axis: "#cfccc2",
            tick: "#6f6c64",
            zeroLine: "#cfccc2",
            crosshair: "#44423c",
            dotRing: "#fffdf9",
            tooltipBg: "#fffdf9",
            tooltipBorder: "rgba(28,27,24,0.16)",
            tooltipInk: "#1c1b18",
            tooltipInk2: "#5f5c55",
            series: {
                area_km2: "#1c5a96",
                elevation_m: "#4aa8dc",
                changed_storage_mcm: "#b27400",
            },
            brushTrack: "#f1efe9",
            brushSpark: "#cfccc2",
            brushAccent: "#1c5a96",
            lineGlow: false,
        },
        summaryLabel: {
            ink: "#1c1b18",
            halo: "#fffdf9",
            pillBg: "rgba(255,253,249,0.95)",
            faceStroke: "rgba(28,27,24,0.12)",
        },
        stationHeaderTo: "#1c5a96",
    },

    /* ---------------------------------------------------------------- */
    /* 2 — Mission Control: dark ops console (effects pole)              */
    /* ---------------------------------------------------------------- */
    mission: {
        id: "mission",
        name: "Mission Control",
        tagline: "Dark ops console",
        tokens: {
            page: "#0d1420",
            pageWash: "none",
            panel: "#131b2a",
            panelGlass: "rgba(19,27,42,0.78)",
            glassBlur: "10px",
            panelSoft: "#1a2536",
            panelSoft2: "#223046",
            ink: "#e6edf7",
            ink2: "#8fa3bf",
            ink3: "#5b6c82",
            onAccent: "#06121f",
            accent: "#22d3ee",
            accent2: "#67e8f9",
            accentHover: "#67e8f9",
            link: "#38bdf8",
            linkHover: "#7dd3fc",
            danger: "#f0526a",
            cta: "#e8833a",
            ctaActive: "#c46520",
            line: "rgba(122,162,247,0.18)",
            lineSoft: "rgba(122,162,247,0.10)",
            lineStrong: "rgba(143,163,191,0.45)",
            shadow1: "0 6px 14px rgba(0,0,0,0.45)",
            shadow2: "0 8px 18px rgba(0,0,0,0.5)",
            shadow3: "0 10px 26px rgba(0,0,0,0.55)",
            shadowOverlay: "0 8px 20px rgba(0,0,0,0.5)",
            shadowFloat: "0 10px 24px rgba(0,0,0,0.5)",
            shadowPop: "0 12px 36px rgba(0,0,0,0.6), 0 0 0 1px rgba(122,162,247,0.18)",
            radiusControl: "6px",
            radiusPanel: "10px",
            radiusPanelLg: "14px",
            radiusPill: "999px",
            fontDisplay: INTER_STACK,
            fontBody: INTER_STACK,
            fontData: MONO_STACK,
            dur1: "160ms",
            dur2: "240ms",
            dur3: "420ms",
            ease1: "cubic-bezier(0.4, 0, 0.2, 1)",
            easeEmphasis: "cubic-bezier(0.22, 1, 0.36, 1)",
            hoverScale: "1.02",
            hoverScaleMarker: "1.15",
            pulseRgb: "34 211 238",
            pulseSpread: "14px",
            pulsePeriod: "1.6s",
            tipBg: "rgba(19,27,42,0.92)",
            tipInk: "#e6edf7",
            scrollTrack: "#0d1420",
            scrollThumb: "#2b3b55",
            scrollThumbHover: "#22d3ee",
            leafletPopupRadius: "10px",
        },
        data: {
            use: {
                Hydropower: "#1b93c9",
                Irrigation: "#2fae60",
                "Water supply": "#3f6ee0",
                "Flood control": "#c47e00",
                "Multiple purpose": "#a678e8",
                SEAWEA_UNKNOWN: "#6e7f96",
            },
            useFallback: "#6e7f96",
            summary: {
                critical: "#29b6f6",
                nonCritical: "#5b6c82",
                unknown: "#3d4c63",
            },
            country: {
                Cambodia: "#14324e",
                Laos: "#3d3117",
                Myanmar: "#33284a",
                Thailand: "#16382a",
                Vietnam: "#43222a",
            },
            basin: {
                ChaoPhraya: "#14324e",
                Irrawaddy: "#3d3117",
                Mekong: "#16382a",
                Red: "#43222a",
                Salween: "#33284a",
                Other: "#1d2a3c",
            },
        },
        map: {
            defaultBasemap: "dark",
            dimmedFill: "#1a2233",
            dimmedLine: "#2b3750",
            restingOutline: "#3d5270",
            selectedOutline: "#22d3ee",
            researchOutline: "#22d3ee",
            noDataFill: "#223046",
            restingFillOpacity: { basins: 0.65, countries: 0.6 },
            selectedFillOpacity: 0.8,
            dimmedFillOpacity: 0.3,
        },
        chart: {
            grid: "#1c2739",
            axis: "#2e3d55",
            tick: "#8fa3bf",
            zeroLine: "#3d5270",
            crosshair: "#67e8f9",
            dotRing: "#0d1420",
            tooltipBg: "#1a2536",
            tooltipBorder: "rgba(122,162,247,0.25)",
            tooltipInk: "#e6edf7",
            tooltipInk2: "#8fa3bf",
            series: {
                area_km2: "#3fb0e0",
                elevation_m: "#a678e8",
                changed_storage_mcm: "#e8833a",
            },
            brushTrack: "#0f1726",
            brushSpark: "#3d5270",
            brushAccent: "#22d3ee",
            lineGlow: true,
        },
        summaryLabel: {
            ink: "#e6edf7",
            halo: "#0d1420",
            pillBg: "rgba(13,20,32,0.9)",
            faceStroke: "rgba(255,255,255,0.08)",
        },
        stationHeaderTo: "#164e63",
    },

    /* ---------------------------------------------------------------- */
    /* 3 — Monsoon Glass: light aqua glassmorphism (balanced middle)     */
    /* ---------------------------------------------------------------- */
    monsoon: {
        id: "monsoon",
        name: "Monsoon Glass",
        tagline: "Frosted aqua",
        tokens: {
            // A clearly aqua page keeps Monsoon distinct from Classic even in
            // panel-heavy views (charts open) where the wash is covered.
            page: "#e6f1f6",
            pageWash: "linear-gradient(160deg, #f2fbff 0%, #ddedf6 55%, #d3eaf0 100%)",
            panel: "#fbfeff",
            panelGlass: "rgba(255,255,255,0.62)",
            glassBlur: "14px",
            panelSoft: "#e4f1f6",
            panelSoft2: "#d5e8f0",
            ink: "#12333f",
            ink2: "#48616d",
            ink3: "#7d929d",
            onAccent: "#ffffff",
            accent: "#0891b2",
            accent2: "#06b6d4",
            accentHover: "#06b6d4",
            link: "#0e7490",
            linkHover: "#0891b2",
            danger: "#d03b52",
            cta: "#c06e00",
            ctaActive: "#9c5900",
            line: "rgba(18,51,63,0.12)",
            lineSoft: "rgba(18,51,63,0.07)",
            lineStrong: "rgba(18,51,63,0.25)",
            shadow1: "0 4px 14px rgba(31,84,109,0.08)",
            shadow2: "0 6px 18px rgba(31,84,109,0.09)",
            shadow3: "0 10px 28px rgba(31,84,109,0.12)",
            shadowOverlay: "0 8px 24px rgba(31,84,109,0.10)",
            shadowFloat: "0 10px 28px rgba(31,84,109,0.12)",
            shadowPop: "0 16px 44px rgba(31,84,109,0.18)",
            radiusControl: "10px",
            radiusPanel: "18px",
            radiusPanelLg: "22px",
            radiusPill: "999px",
            fontDisplay: MANROPE_STACK,
            fontBody: MANROPE_STACK,
            fontData: MANROPE_STACK,
            dur1: "200ms",
            dur2: "260ms",
            dur3: "480ms",
            ease1: "cubic-bezier(0.4, 0, 0.2, 1)",
            // Gentle spring overshoot — the Monsoon micro-interaction voice.
            easeEmphasis: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            hoverScale: "1.04",
            hoverScaleMarker: "1.18",
            pulseRgb: "8 145 178",
            pulseSpread: "10px",
            pulsePeriod: "2.4s",
            tipBg: "rgba(18,51,63,0.85)",
            tipInk: "#ffffff",
            scrollTrack: "#e4f1f6",
            scrollThumb: "#b8d4de",
            scrollThumbHover: "#0891b2",
            leafletPopupRadius: "14px",
        },
        data: {
            use: {
                Hydropower: "#38a7e0",
                Irrigation: "#2f9e63",
                "Water supply": "#1c5a96",
                "Flood control": "#c06e00",
                "Multiple purpose": "#7e57c7",
                SEAWEA_UNKNOWN: "#8fa3b0",
            },
            useFallback: "#8fa3b0",
            summary: {
                critical: "#0e7490",
                nonCritical: "#8ba3ad",
                unknown: "#cddbe0",
            },
            country: {
                Cambodia: "#cfe6f8",
                Laos: "#fbe3c0",
                Myanmar: "#e2d9f8",
                Thailand: "#c4e7d4",
                Vietnam: "#f8cfd8",
            },
            basin: {
                ChaoPhraya: "#cfe6f8",
                Irrawaddy: "#fbe3c0",
                Mekong: "#c4e7d4",
                Red: "#f8cfd8",
                Salween: "#e2d9f8",
                Other: "#e6edf2",
            },
        },
        map: {
            defaultBasemap: "light",
            dimmedFill: "#e2ebef",
            dimmedLine: "#c6d6dd",
            restingOutline: "#8fa9b4",
            selectedOutline: "#0891b2",
            researchOutline: "#0e7490",
            noDataFill: "#e6edf2",
            restingFillOpacity: { basins: 0.55, countries: 0.5 },
            selectedFillOpacity: 0.68,
            dimmedFillOpacity: 0.4,
        },
        chart: {
            grid: "#e4eef2",
            axis: "#c6d6dd",
            tick: "#48616d",
            zeroLine: "#c6d6dd",
            crosshair: "#06b6d4",
            dotRing: "#fbfeff",
            tooltipBg: "#ffffff",
            tooltipBorder: "rgba(18,51,63,0.10)",
            tooltipInk: "#12333f",
            tooltipInk2: "#48616d",
            series: {
                area_km2: "#1565c0",
                elevation_m: "#38a7e0",
                changed_storage_mcm: "#c06e00",
            },
            brushTrack: "#e4f1f6",
            brushSpark: "#b8d4de",
            brushAccent: "#0891b2",
            lineGlow: false,
        },
        summaryLabel: {
            ink: "#12333f",
            halo: "#ffffff",
            pillBg: "rgba(255,255,255,0.92)",
            faceStroke: "rgba(18,51,63,0.10)",
        },
        stationHeaderTo: "#0e7490",
    },
};

// #rrggbb → "R G B" (space-separated triplet for rgb(var(--x) / alpha)).
function hexToTriplet(hex) {
    const h = hex.replace("#", "");
    const num = parseInt(h, 16);
    return `${(num >> 16) & 0xff} ${(num >> 8) & 0xff} ${num & 0xff}`;
}

// Serialize THEMES into CSS custom-property blocks. Classic lands on :root so
// the default (no data-theme attribute) needs no work at first paint; the
// other themes override under :root[data-theme="…"].
export function buildThemeCss() {
    const blocks = THEME_IDS.map((id) => {
        const t = THEMES[id];
        const lines = Object.entries(TOKEN_VARS).map(
            ([key, cssVar]) => `${cssVar}:${t.tokens[key]};`
        );
        // Derived triplets — the only tokens Tailwind uses with alpha
        // modifiers (border-ps-blue/30, bg-ps-cyan/30).
        lines.push(`--accent-rgb:${hexToTriplet(t.tokens.accent)};`);
        lines.push(`--accent-2-rgb:${hexToTriplet(t.tokens.accent2)};`);
        const selector = id === DEFAULT_THEME ? ":root" : `:root[data-theme="${id}"]`;
        return `${selector}{${lines.join("")}}`;
    });
    return blocks.join("\n");
}
