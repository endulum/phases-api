const { PI, atan2, sqrt, sin, cos, pow } = Math;

function toRad(degrees: number): number {
  return (degrees * PI) / 180;
}

type Coords = { latitude: number; longitude: number };

export function haversine(a: Coords, b: Coords, RADIUS = 6371) {
  const [a_phi, b_phi, d_phi, d_lam] = [
    a.latitude,
    b.latitude,
    b.latitude - a.latitude,
    b.longitude - a.longitude,
  ].map(toRad);

  const c =
    pow(sin(d_phi / 2), 2) + cos(a_phi) * cos(b_phi) * pow(sin(d_lam / 2), 2);

  const distance = RADIUS * 2 * atan2(sqrt(c), sqrt(1 - c));

  return distance;
}

// https://www.movable-type.co.uk/scripts/latlong.html
