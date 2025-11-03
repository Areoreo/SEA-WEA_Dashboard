# SEA-WEA Dashboard - Static Site

A fully static, portable dashboard for Water and Energy Assessment in Southeast Asia.

> Core function and structure adapted from the RICE-MAP Dashboard.

## Quick Start

### Build the Static Site

```bash
npm install
npm run build
```

The static site will be generated in the `out/` directory.

### Test Locally

```bash
npm run serve
```

Then open: **http://localhost:8000**

**Important:** Do NOT open `out/index.html` directly in your browser. Modern browsers block CORS requests from `file://` protocol. Always use an HTTP server for testing.

## Deploy Anywhere

The `out/` folder contains a **fully portable static site** that can be deployed to any static hosting without configuration.

### GitHub Pages (Recommended)

```bash
npm run deploy
```

This automatically:
1. Builds the site
2. Creates `.nojekyll` file
3. Deploys to GitHub Pages

**Then configure your GitHub repository:**
- Go to Settings → Pages
- Set source to `gh-pages` branch
- Your site will be at: `https://yourusername.github.io/your-repo-name/`

### Other Platforms

Simply upload the contents of the `out/` directory:

- **Netlify**: Drag and drop the `out/` folder
- **Vercel**: `vercel --prod out/`
- **AWS S3**: `aws s3 sync out/ s3://your-bucket/`
- **Any web server**: Copy `out/` contents to your web root

## Project Structure

```
out/
├── index.html          # Main page
├── 404.html           # Error page
├── _next/             # JavaScript bundles and CSS
├── data/              # Static data files (GeoJSON, CSV, TIFF)
└── [other assets]     # Images, fonts, etc.
```

## Features

✅ **100% Static** - No server required
✅ **Portable** - Deploy anywhere without configuration
✅ **No Base Path** - Works in any directory/subdomain
✅ **Self-contained** - All data included
✅ **Production Ready** - Optimized build

## Development

```bash
# Development server (with hot reload)
npm run dev

# Build static site
npm run build

# Test built site locally
npm run serve

# Deploy to GitHub Pages
npm run deploy
```

## Troubleshooting

### "Loading..." screen stuck

**Cause**: Opening HTML file directly or CORS issues

**Solution**: Use `npm run serve` and access via `http://localhost:8000`

### 404 errors for resources

**Cause**: Not serving from the correct directory

**Solution**: Ensure you're serving from the `out/` directory root

### Data files not loading

**Cause**: Missing data directory or wrong paths

**Solution**: Ensure `data/` folder exists in `out/` after build

## Technical Details

- **Framework**: Next.js 13 (Static Export)
- **UI**: React + Tailwind CSS
- **Maps**: Leaflet
- **Charts**: Chart.js / Recharts
- **Data Format**: GeoJSON, CSV, GeoTIFF

## Important Notes

- The site is **fully static** - no API routes or server-side rendering
- All data is loaded from static files in the `/data` directory
- The build output (`out/`) is completely portable and self-contained
- No configuration needed for different deployment locations
