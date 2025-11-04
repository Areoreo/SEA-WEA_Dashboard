# GitHub Pages Deployment Instructions

## Quick Start

Your Next.js app is now configured for GitHub Pages deployment. Follow these steps:

### 1. Build the Project

```bash
npm run build
```

This creates a static export in the `out/` directory.

### 2. Deploy to GitHub Pages

**Method A: Manual Copy & Paste (Recommended for you)**

1. Navigate to your GitHub Pages repository
2. Copy **ALL contents** from the `out/` directory
3. Paste them into the root of your GitHub Pages repository
4. Commit and push to GitHub

```bash
# If your GitHub Pages repo is in a separate folder:
cd /path/to/your/github/pages/repo
# Copy everything from out/ to your pages repo
cp -r /mnt/c/Users/15330/Works/GithubRepo/SEA-WEA_Dashboard/out/* .
# Commit and push
git add .
git commit -m "Update dashboard deployment"
git push
```

**Method B: Using gh-pages (requires git configuration)**

If you have git configured with your username and email:

```bash
npm run deploy
```

### 3. Verify Deployment

Visit: `https://areoreo.github.io/SEA-WEA_VISUAL/`

The dashboard should load with all data files accessible.

## Important Configuration

Key files that control path handling:

- `next.config.js`: exposes an optional `NEXT_PUBLIC_BASE_PATH` override and defaults to fully relative asset URLs.
- `utils/pathUtils.js`: helper to resolve asset and data URLs at runtime based on the current location.
- All data fetch calls use `getAssetPath()` to ensure they work from any sub-directory.

## What's in the Build Output

The `out/` directory contains:

```
out/
├── _next/           # Next.js bundled JavaScript and CSS
├── data/            # All your data files (JSON, CSV, GeoJSON)
│   ├── dynamicData/ # Time series CSV files
│   └── ...          # Other data files
├── index.html       # Main entry point
└── ...              # Other static assets
```

## Testing Locally

To test the build locally before deploying:

```bash
# Option 1: Using Python
cd out
python3 -m http.server 8000
# Visit: http://localhost:8000/SEA-WEA_VISUAL/

# Option 2: Using Node.js serve package
npx serve out -p 8000
# Visit: http://localhost:8000/SEA-WEA_VISUAL/
```

## Troubleshooting

### Assets Not Loading (404 errors)

- **Symptom**: Console shows 404 errors for `/data/...` files
- **Solution**: This is now fixed! All fetch calls use `getAssetPath()` which adds the correct base path

### Wrong Base Path

- **Symptom**: URLs don't match your GitHub repo name
- **Solution**: The build now auto-detects the deploy path. If you need to force a specific path (e.g. for previews), set `NEXT_PUBLIC_BASE_PATH` before running the build.

### Development Mode Issues

- **Note**: In development (`npm run dev`), the base path is NOT applied
- **Reason**: This allows local development to work smoothly
- **Solution**: Always test the production build before deploying

## Files Modified

The following files were updated to support GitHub Pages deployment:

1. `next.config.js` - Defaults to relative asset URLs with optional base-path override.
2. `utils/pathUtils.js` - Runtime helper for base-path detection across assets and fetch calls.
3. `components/DynamicInfo/DynamicInfoSystem.js` - Uses `getAssetPath()`.
4. `components/Map/MapComponent.js` - Uses `getAssetPath()`.
5. `components/Dashboard/ReservoirDashboard.js` - Uses `getAssetPath()`.
6. `utils/basinAssignment.js` - Uses `getAssetPath()`.

## Notes

- The build creates a **static export** - no server required
- All data files are copied to the output automatically
- The app works entirely client-side after deployment
- No sensitive API keys or credentials are in the build
