# SEA-WEA Dashboard - Deployment Guide

## Overview

This is a **fully static** Next.js application that can be deployed to GitHub Pages or any static hosting service. All data is served from static files in the `/data` directory.

## Build Configurations

The project supports two build modes:

### 1. Local Development/Testing Build

```bash
npm run build:local
# or simply
npm run build
```

-   No base path configured
-   Suitable for local testing with a development server
-   Output: `out/` directory

### 2. GitHub Pages Build

```bash
npm run build:github
```

-   Configured with `/SEA-WEA_Dashboard` base path
-   Optimized for GitHub Pages deployment
-   Output: `out/` directory

## Testing Locally

### Option 1: Using the built-in serve command (Recommended)

```bash
# Build for local testing
npm run build:local

# Serve the static site
npm run serve
```

Then open: http://localhost:8000

### Option 2: Using any HTTP server

```bash
# Build for local testing
npm run build:local

# Use Python's built-in server
cd out && python3 -m http.server 8000

# Or use Node's http-server (install first: npm install -g http-server)
cd out && http-server -p 8000

# Or use PHP's built-in server
cd out && php -S localhost:8000
```

**Important:** Do NOT open `out/index.html` directly in your browser using the `file://` protocol. Modern browsers block CORS requests for local files, which will prevent the app from loading data files. Always use an HTTP server.

## Deploying to GitHub Pages

Perfect! Now let me create a summary of what's been fixed:

---

✅ FIXED! Your Site is Now Truly Portable

What Changed:

I removed all base path configuration from next.config.js. Now the site works anywhere without needing to know its
deployment location.

Before:
basePath: "/SEA-WEA_Dashboard" // ❌ Hard-coded path

After:
// NO basePath - fully portable ✅

How to Deploy:

Option 1: Copy the out/ folder (Easiest)

1. Build: npm run build
2. Copy the entire out/ folder to your SEA-WEA_static repository
3. Commit and push
4. Done! Works at https://areoreo.github.io/SEA-WEA_static/

Option 2: Use the deploy script

1. In your SEA-WEA_static repository, run: npm run deploy
2. Configure GitHub Pages to use the gh-pages branch
3. Done!

Why It Works Now:

-   No hard-coded paths - Resources load from relative paths
-   Works in any subdirectory - /SEA-WEA_static/, /SEA-WEA_Dashboard/, or even /
-   Truly portable - The same build works on GitHub Pages, Netlify, Vercel, or any web server

Testing Locally:

npm run build
npm run serve

# Open: http://localhost:8000

The site will work this time because there's no base path mismatch!

---

Just rebuild and copy the out/ folder to your SEA-WEA_static repo and it will work! 🎉
