/** @type {import('next').NextConfig} */

const path = require("path");

// GitHub Pages deployment configuration
// Allows optional NEXT_PUBLIC_BASE_PATH (e.g. repo name) while defaulting to relative assets
const isProd = process.env.NODE_ENV === 'production';
const envBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const normalizedBasePath = envBasePath
    ? `/${envBasePath.replace(/^\/|\/$/g, '')}`
    : '';

const resolveAssetPrefix = () => {
    if (!isProd) return '';
    if (normalizedBasePath) return `${normalizedBasePath}/`;
    return './';
};

const nextConfig = {
    reactStrictMode: true,
    output: "export",
    // For GitHub Pages: https://username.github.io/repo-name/
    basePath: isProd ? normalizedBasePath : '',
    assetPrefix: resolveAssetPrefix(),
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
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
        twitterHandle: "@your_handle",
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;
