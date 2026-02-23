/* ------------------------------------------------------------------ */
/*  Qibla direction utility                                           */
/* ------------------------------------------------------------------ */

/** Kaaba coordinates (Makkah, Saudi Arabia) */
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function toRad(deg: number) {
    return (deg * Math.PI) / 180;
}

function toDeg(rad: number) {
    return (rad * 180) / Math.PI;
}

/**
 * Calculate the Qibla bearing from a given location.
 * Returns the bearing in degrees (0–360, where 0 = North).
 */
export function calculateQiblaBearing(latitude: number, longitude: number): number {
    const phiK = toRad(KAABA_LAT);
    const lambdaK = toRad(KAABA_LNG);
    const phi = toRad(latitude);
    const lambda = toRad(longitude);

    const y = Math.sin(lambdaK - lambda);
    const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);

    let bearing = toDeg(Math.atan2(y, x));
    bearing = ((bearing % 360) + 360) % 360; // normalise to 0–360

    return bearing;
}

/**
 * Get a cardinal direction label for a bearing.
 */
export function bearingToCardinal(bearing: number): string {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(bearing / 45) % 8;
    return dirs[idx];
}
