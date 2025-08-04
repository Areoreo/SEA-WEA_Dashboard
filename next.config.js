/** @type {import('next').NextConfig} */

const { createSecureHeaders } = require("next-secure-headers");
const path = require("path");
const fs = require("fs");

// const nextConfig = {
//     reactStrictMode: true,
//     experimental: {
//         // appDir: true
//     },
//     sassOptions: {
//         includePaths: [path.join(__dirname, "styles")]
//     },
//     images: {
//         formats: ["image/avif", "image/webp"],
//         domains: ["s.gravatar.com"]
//     },
//     env: {
//         siteTitle: "Your Company",
//         siteDescription: "Your company description.",
//         siteKeywords: "your company keywords",
//         siteUrl: "You site url",
//         siteImagePreviewUrl: "/images/preview.jpeg",
//         twitterHandle: "@your_handle"
//     },
//     headers() {
//         return [
//             {
//                 source: "/(.*)",
//                 headers: [
//                     ...createSecureHeaders(),
//                     // HSTS Preload: https://hstspreload.org/
//                     {
//                         key: "Strict-Transport-Security",
//                         value: "max-age=63072000; includeSubDomains; preload"
//                     }
//                 ]
//             }
//         ];
//     }
// };

const nextConfig = {
    reactStrictMode: true,
    output: "export",
    basePath: process.env.NODE_ENV === "production" ? "/SEA-WEA_Dashboard" : "",
    assetPrefix: process.env.NODE_ENV === "production" ? "/SEA-WEA_Dashboard" : "",
    images: {
        unoptimized: true, // Required for static export
    },
    sassOptions: {
        includePaths: [path.join(__dirname, "styles")],
    },
    env: {
        siteTitle: "SEA-WEA Dashboard",
        siteDescription: "Water and Energy Assessment Dashboard for Southeast Asia",
        siteKeywords: "water, energy, SEA, dashboard, assessment",
        siteUrl: "https://Areoreo.github.io/SEA-WEA_Dashboard",
        twitterHandle: "@your_handle",
    },
};

// module.exports = nextConfig;

module.exports = {
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
};
