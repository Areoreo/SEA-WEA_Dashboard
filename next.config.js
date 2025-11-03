/** @type {import('next').NextConfig} */

const path = require("path");

// Fully portable static site - no base path required
// Can be deployed anywhere: GitHub Pages, Netlify, Vercel, or any static host
const nextConfig = {
    reactStrictMode: true,
    output: "export",
    // NO basePath - makes it portable
    // NO assetPrefix - uses relative paths
    images: {
        unoptimized: true, // Required for static export
    },
    trailingSlash: true, // Helps with routing on various hosts
    sassOptions: {
        includePaths: [path.join(__dirname, "styles")],
    },
    env: {
        siteTitle: "SEA-WEA Dashboard",
        siteDescription: "Water and Energy Assessment Dashboard for Southeast Asia",
        siteKeywords: "water, energy, SEA, dashboard, assessment",
        siteUrl: "https://areoreo.github.io/SEA-WEA_static",
        twitterHandle: "@your_handle",
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;
