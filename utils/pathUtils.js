/**
 * Get the base path for the application
 * This handles both development (no base path) and production (with base path)
 */
export function getBasePath() {
    // In production, Next.js sets the BASE_PATH environment variable
    // We also check for the __NEXT_DATA__ which contains the build-time config
    if (typeof window !== 'undefined') {
        // Client-side: check if __NEXT_DATA__ exists
        if (window.__NEXT_DATA__?.buildId) {
            // If we're in production with a base path, return it
            return process.env.NODE_ENV === 'production' ? '/SEA-WEA_VISUAL' : '';
        }
    }
    return '';
}

/**
 * Get a URL with the correct base path prefix
 * @param {string} path - The path to prefix (should start with /)
 * @returns {string} - The path with base path prefix
 */
export function getAssetPath(path) {
    const basePath = getBasePath();
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${basePath}${normalizedPath}`;
}
