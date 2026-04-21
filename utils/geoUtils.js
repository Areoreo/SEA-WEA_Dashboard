// Ray-casting point-in-polygon — supports Polygon and MultiPolygon GeoJSON geometries.
// Coords are [lng, lat].

function pointInRing(pt, ring) {
    const [x, y] = pt;
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        const intersect =
            yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-12) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}

function pointInPolygon(pt, polygon) {
    if (!pointInRing(pt, polygon[0])) return false;
    for (let i = 1; i < polygon.length; i++) {
        if (pointInRing(pt, polygon[i])) return false; // inside hole
    }
    return true;
}

export function pointInFeature(lng, lat, feature) {
    const g = feature.geometry;
    if (!g) return false;
    const pt = [lng, lat];
    if (g.type === "Polygon") return pointInPolygon(pt, g.coordinates);
    if (g.type === "MultiPolygon") {
        for (const poly of g.coordinates) {
            if (pointInPolygon(pt, poly)) return true;
        }
    }
    return false;
}

export function assignFeature(lng, lat, featureCollection, labelKey) {
    for (const f of featureCollection.features) {
        if (pointInFeature(lng, lat, f)) {
            return f.properties[labelKey];
        }
    }
    return null;
}

function ringArea(ring) {
    let a = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    }
    return a * 0.5;
}

function ringCentroid(ring) {
    let cx = 0,
        cy = 0,
        a = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        const f = xj * yi - xi * yj;
        a += f;
        cx += (xi + xj) * f;
        cy += (yi + yj) * f;
    }
    a *= 0.5;
    if (Math.abs(a) < 1e-12) {
        let sx = 0,
            sy = 0;
        for (const [x, y] of ring) {
            sx += x;
            sy += y;
        }
        return [sx / ring.length, sy / ring.length];
    }
    return [cx / (6 * a), cy / (6 * a)];
}

// Returns [lng, lat] of the geometric centre of the feature. For a
// MultiPolygon we take the centroid of the largest component — that's what
// a user reads as "middle of the basin", even when a small outlying polygon
// would otherwise drag the average away.
export function featureCentroid(feature) {
    const g = feature?.geometry;
    if (!g) return null;
    if (g.type === "Polygon") return ringCentroid(g.coordinates[0]);
    if (g.type === "MultiPolygon") {
        let best = null;
        let bestArea = 0;
        for (const poly of g.coordinates) {
            const ring = poly[0];
            const area = Math.abs(ringArea(ring));
            if (area > bestArea) {
                bestArea = area;
                best = ring;
            }
        }
        return best ? ringCentroid(best) : null;
    }
    return null;
}
