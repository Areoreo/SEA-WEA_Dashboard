import React from "react";

// Clean, glyph-style SVG icons at 24px canvas.
// All icons render as currentColor so callers control color via CSS.
const paths = {
    Hydropower: (
        <path
            d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeLinejoin="round"
        />
    ),
    Irrigation: (
        <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21v-7" />
            <path d="M12 14c0-3 2.5-5 6-5-.5 3-2.5 5-6 5z" fill="currentColor" fillOpacity="0.35" />
            <path d="M12 14c0-3-2.5-5-6-5 .5 3 2.5 5 6 5z" fill="currentColor" fillOpacity="0.35" />
            <path d="M4 21h16" />
        </g>
    ),
    "Water supply": (
        <path
            d="M12 2.5s-6 7-6 11.5a6 6 0 0012 0c0-4.5-6-11.5-6-11.5z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeLinejoin="round"
        />
    ),
    "Flood control": (
        // Shield — defense against flooding
        <g fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round">
            <path d="M12 2.5 4 5v6c0 4.5 3.3 8.5 8 10.5 4.7-2 8-6 8-10.5V5l-8-2.5z" fillOpacity="0.9" />
            <path
                d="M7.5 12.5c1.5-1 3-1 4.5 0s3 1 4.5 0"
                fill="none"
                stroke="#fff"
                strokeWidth="1.4"
                strokeLinecap="round"
            />
        </g>
    ),
    Navigation: (
        // Compass / navigation arrow
        <g>
            <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.9" />
            <path
                d="M12 6.5 14.2 12 12 17.5 9.8 12z"
                fill="#fff"
                stroke="#fff"
                strokeWidth="0.4"
                strokeLinejoin="round"
            />
        </g>
    ),
    Recreation: (
        // Sun over water — leisure
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="9" r="3.2" fill="currentColor" />
            <g strokeWidth="1.4">
                <path d="M12 3v1.8" />
                <path d="M12 13.2V15" />
                <path d="M5.5 9h1.8" />
                <path d="M16.7 9h1.8" />
                <path d="m7.2 4.2 1.3 1.3" />
                <path d="m15.5 12.5 1.3 1.3" />
                <path d="m16.8 4.2-1.3 1.3" />
                <path d="m8.5 12.5-1.3 1.3" />
            </g>
            <path
                d="M3 18c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0"
                fill="none"
                strokeWidth="1.6"
            />
            <path
                d="M3 21c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0"
                fill="none"
                strokeWidth="1.6"
            />
        </g>
    ),
};

export default function UseIcon({ use, size = 16, className = "", title }) {
    const glyph = paths[use];
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={className}
            aria-label={title || use}
            role="img"
        >
            {glyph || (
                <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.6" />
            )}
        </svg>
    );
}

export function buildUseIconSvg(use, colorHex = "#ffffff", size = 16) {
    // Inline SVG generator for Leaflet DivIcon — returns HTML string
    const inner = {
        Hydropower: `<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="${colorHex}"/>`,
        Irrigation: `<g fill="none" stroke="${colorHex}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 21v-7"/>
            <path d="M12 14c0-3 2.5-5 6-5-.5 3-2.5 5-6 5z" fill="${colorHex}" fill-opacity="0.55"/>
            <path d="M12 14c0-3-2.5-5-6-5 .5 3 2.5 5 6 5z" fill="${colorHex}" fill-opacity="0.55"/>
        </g>`,
        "Water supply": `<path d="M12 2.5s-6 7-6 11.5a6 6 0 0012 0c0-4.5-6-11.5-6-11.5z" fill="${colorHex}"/>`,
        "Flood control": `<path d="M12 2.5 4 5v6c0 4.5 3.3 8.5 8 10.5 4.7-2 8-6 8-10.5V5l-8-2.5z" fill="${colorHex}"/>
            <path d="M7.5 12.5c1.5-1 3-1 4.5 0s3 1 4.5 0" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`,
        Navigation: `<circle cx="12" cy="12" r="9" fill="${colorHex}"/>
            <path d="M12 6.5 14.2 12 12 17.5 9.8 12z" fill="#fff"/>`,
        Recreation: `<circle cx="12" cy="9" r="3.2" fill="${colorHex}"/>
            <g stroke="${colorHex}" stroke-width="1.4" stroke-linecap="round">
              <path d="M12 3v1.6"/><path d="M5.6 9h1.6"/><path d="M16.8 9h1.6"/>
              <path d="m7.3 4.3 1.1 1.1"/><path d="m15.6 4.3-1.1 1.1"/>
            </g>
            <path d="M3 18c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0" fill="none" stroke="${colorHex}" stroke-width="1.6"/>`,
    };
    const glyph = inner[use] || `<circle cx="12" cy="12" r="5" fill="${colorHex}"/>`;
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${glyph}</svg>`;
}
