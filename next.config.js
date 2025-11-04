/** @type {import('next').NextConfig} */

const path = require("path");

// GitHub Pages deployment configuration
// Repository name must match the basePath and assetPrefix
const isProd = process.env.NODE_ENV === 'production';
const repoName = 'SEA-WEA_VISUAL'; // Change this to match your actual GitHub repo name

const nextConfig = {
    reactStrictMode: true,
    output: "export",
    // For GitHub Pages: https://username.github.io/repo-name/
    basePath: isProd ? `/${repoName}` : '',
    assetPrefix: isProd ? `/${repoName}/` : '',
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
        siteUrl: `https://areoreo.github.io/${repoName}`,
        twitterHandle: "@your_handle",
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;
