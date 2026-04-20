import React from "react";

// Glyph-style SVGs on a 24px canvas. All render as currentColor so callers
// control color via CSS.
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
        <g
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 21v-7" />
            <path
                d="M12 14c0-3 2.5-5 6-5-.5 3-2.5 5-6 5z"
                fill="currentColor"
                fillOpacity="0.35"
            />
            <path
                d="M12 14c0-3-2.5-5-6-5 .5 3 2.5 5 6 5z"
                fill="currentColor"
                fillOpacity="0.35"
            />
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
    "Multiple purpose": (
        // Three overlapping droplets — reads as "many uses in one place".
        <g fill="currentColor">
            <path d="M8 14.5c0-3 3-6.5 3-6.5s3 3.5 3 6.5a3 3 0 0 1-6 0z" fillOpacity="0.95" />
            <path
                d="M13 16.5c0-3 3-6.5 3-6.5s3 3.5 3 6.5a3 3 0 0 1-6 0z"
                fillOpacity="0.7"
            />
            <path
                d="M3 16.5c0-3 3-6.5 3-6.5s3 3.5 3 6.5a3 3 0 0 1-6 0z"
                fillOpacity="0.7"
            />
        </g>
    ),
    SEAWEA_UNKNOWN: (
        // Neutral circled question mark.
        <g>
            <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.2" />
            <circle
                cx="12"
                cy="12"
                r="8.25"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
            />
            <path
                d="M9.5 9.5a2.5 2.5 0 1 1 4 2c-.9.5-1.5 1.1-1.5 2.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            <circle cx="12" cy="17" r="1.1" fill="currentColor" />
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
            {glyph || <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.6" />}
        </svg>
    );
}

export function buildUseIconSvg(use, colorHex = "#ffffff", size = 16) {
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
        "Multiple purpose": `<g fill="${colorHex}">
            <path d="M8 14.5c0-3 3-6.5 3-6.5s3 3.5 3 6.5a3 3 0 0 1-6 0z" fill-opacity="0.95"/>
            <path d="M13 16.5c0-3 3-6.5 3-6.5s3 3.5 3 6.5a3 3 0 0 1-6 0z" fill-opacity="0.7"/>
            <path d="M3 16.5c0-3 3-6.5 3-6.5s3 3.5 3 6.5a3 3 0 0 1-6 0z" fill-opacity="0.7"/>
        </g>`,
        SEAWEA_UNKNOWN: `<g>
            <circle cx="12" cy="12" r="8" fill="none" stroke="${colorHex}" stroke-width="1.6"/>
            <path d="M9.5 9.5a2.5 2.5 0 1 1 4 2c-.9.5-1.5 1.1-1.5 2.2" fill="none" stroke="${colorHex}" stroke-width="1.6" stroke-linecap="round"/>
            <circle cx="12" cy="17" r="1.1" fill="${colorHex}"/>
        </g>`,
    };
    const glyph = inner[use] || `<circle cx="12" cy="12" r="5" fill="${colorHex}"/>`;
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${glyph}</svg>`;
}
