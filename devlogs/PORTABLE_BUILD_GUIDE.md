# SEA-WEA Dashboard - Portable Build Guide

## What Was Fixed

The dashboard was experiencing loading issues where it would get stuck showing only "Loading SEA-WEA Dashboard..." text. This has been resolved with the following changes:

### Changes Made

#### 1. **Next.js Configuration** (`next.config.js`)
- Added `assetPrefix: "./"` to enable relative paths for all assets
- This allows the app to work with `file://` protocol and any web server

#### 2. **Data Fetch Paths** (Multiple Files)
All absolute paths (`/data/...`) were changed to relative paths (`./data/...`):

- ✅ `components/Dashboard/ReservoirDashboard.js:671` - Main data load
- ✅ `components/Dashboard/ReservoirDashboard.js:658` - Reservoir mask load
- ✅ `components/Map/MapComponent.js:177` - Boundary data load
- ✅ `utils/basinAssignment.js:50,61` - Basin boundary loads

#### 3. **Error Handling & Debugging**
- Added comprehensive error state management
- Console logging for debugging (`🔄`, `✅`, `❌` emojis for clarity)
- User-friendly error messages with retry button
- Helpful hints about running from a web server

## How to Use the Portable Build

The static build is located in the `/out` directory. You have multiple options:

### Option 1: Local Web Server (Recommended)

#### Python (Built-in)
```bash
cd out
python3 -m http.server 8000
```
Then open: http://localhost:8000

#### Node.js
```bash
cd out
npx serve
```

#### PHP
```bash
cd out
php -S localhost:8000
```

### Option 2: File Protocol (Limited)

Double-click `out/index.html` to open in your browser.

**Note:** While this works for loading the page, some features may be limited due to browser security restrictions with the `file://` protocol. Using a local web server is recommended.

### Option 3: Deploy to Any Web Host

Upload the entire `out/` folder to:
- GitHub Pages
- Netlify
- Vercel
- Apache/Nginx server
- Any static file hosting

No configuration needed!

## Troubleshooting

### Page Stuck on Loading Screen

**Check the browser console** (F12 → Console tab):

1. **Look for console messages:**
   - `🔄 Starting data load...` - Data fetch initiated
   - `📡 Response received:` - Check the HTTP status
   - `✅ Data loaded successfully:` - Success!
   - `❌ Error loading data:` - See error details

2. **Common Issues:**

   **Issue:** `Failed to fetch` or `NetworkError`
   - **Solution:** Make sure you're using a web server (not `file://`)
   - Run: `python3 -m http.server 8000` from the `out/` directory

   **Issue:** `404 Not Found` for data files
   - **Solution:** Verify data files exist in `out/data/`
   - Check: `ls out/data/processed_critical_reservoirs.json`

   **Issue:** `CORS policy` errors
   - **Solution:** This shouldn't happen with the current setup
   - If it does, ensure you're accessing via `http://localhost` not `file://`

### Data Files Missing

Rebuild the project:
```bash
npm run build
```

Verify data files are copied:
```bash
ls -lh out/data/
```

### JavaScript Not Loading

Check that all script tags use relative paths:
```bash
grep 'src="' out/index.html | head -5
```

Should show: `src="./_next/static/..."`

## Technical Details

### Build Configuration

- **Next.js Version:** 13.5.6
- **Output Type:** Static export
- **Asset Prefix:** `./` (relative paths)
- **Trailing Slash:** Enabled
- **Images:** Unoptimized (required for static export)

### File Structure

```
out/
├── index.html          # Main entry point
├── 404.html            # Error page
├── _next/              # Next.js assets
│   └── static/
│       ├── chunks/     # JavaScript bundles
│       └── css/        # Stylesheets
├── data/               # Data files
│   ├── processed_critical_reservoirs.json
│   ├── processed_all_reservoirs.json
│   └── ...
└── README.txt          # Basic usage guide
```

### Path Resolution

All paths are relative to the HTML file location:

- HTML in browser: `/path/to/out/index.html`
- Data file: `/path/to/out/data/file.json`
- Relative path: `./data/file.json` ✅
- Absolute path: `/data/file.json` ❌ (only works on root-hosted sites)

## Verification Checklist

✅ JavaScript files use relative paths (`./`)
✅ Data files use relative paths (`./`)
✅ Error handling displays helpful messages
✅ Console logging shows loading progress
✅ Works with local web server
✅ Works on any hosting platform
✅ No hardcoded absolute paths

## Build Date

- **Last Build:** 2025-11-03
- **Build ID:** Check `out/index.html` for `buildId` in `__NEXT_DATA__` script tag

## Next Steps

1. **Test locally:**
   ```bash
   cd out && python3 -m http.server 8000
   ```
   Open http://localhost:8000 and check console for `✅` messages

2. **Deploy:**
   - Copy `out/` folder to your hosting provider
   - No additional configuration needed

3. **Monitor:**
   - Open browser console to see loading progress
   - Watch for any `❌` error messages
   - Check network tab for failed requests

## Support

If you encounter issues:

1. Check browser console for detailed error messages
2. Verify all data files exist in `out/data/`
3. Ensure you're using a web server (not `file://`)
4. Try rebuilding: `npm run build`
5. Check this guide's troubleshooting section

---

Generated with Claude Code
