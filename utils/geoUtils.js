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
