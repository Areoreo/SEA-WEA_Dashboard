/**
 * Get the base path for the application
 * This handles both development (no base path) and production (with base path)
 */
const envBasePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);
let cachedClientBasePath;

function normalizeBasePath(path) {
    if (!path) return "";
    const trimmed = path.replace(/^\/|\/$/g, "");
    if (!trimmed) return "";
    return `/${trimmed}`;
}

function deriveBasePathFromAssetPrefix(assetPrefix) {
    if (!assetPrefix) return "";
    if (assetPrefix === "." || assetPrefix === "./") return "";
    if (assetPrefix.startsWith("./")) {
        return normalizeBasePath(assetPrefix.slice(1));
    }
    return normalizeBasePath(assetPrefix);
}

export function getBasePath() {
    if (typeof window === "undefined") {
        return envBasePath;
    }

    if (cachedClientBasePath !== undefined) {
        return cachedClientBasePath;
    }

    const assetPrefix = deriveBasePathFromAssetPrefix(window.__NEXT_DATA__?.assetPrefix);
    if (assetPrefix) {
        cachedClientBasePath = assetPrefix;
        return cachedClientBasePath;
    }

    const scriptWithChunks = document.querySelector('script[src*="_next/static/"]');
    if (scriptWithChunks) {
        try {
            const url = new URL(scriptWithChunks.getAttribute("src"), window.location.href);
            const beforeNext = url.pathname.split("/_next/")[0];
            cachedClientBasePath = normalizeBasePath(beforeNext);
            return cachedClientBasePath;
        } catch {
            // ignore and fall back to path-based detection
        }
    }

    const guessedFromPath = window.location.pathname
        .replace(/\/index(\.html?)?$/, "")
        .replace(/\/$/, "");

    cachedClientBasePath = normalizeBasePath(guessedFromPath);
    return cachedClientBasePath;
}

/**
 * Get a URL with the correct base path prefix
 * @param {string} path - The path to prefix (should start with /)
 * @returns {string} - The path with base path prefix
 */
export function getAssetPath(path) {
    const basePath = getBasePath();
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    if (!basePath) {
        return `.${normalizedPath}`;
    }

    return `${basePath}${normalizedPath}`;
}
