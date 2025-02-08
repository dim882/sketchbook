type Point = { x: number; y: number };
type Polygon = Point[];

// Compute a large bounding box that covers all sites (with padding)
const computeBoundingBox = (points: Point[]): Polygon => {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const pad = 10;
  return [
    { x: minX - pad, y: minY - pad },
    { x: maxX + pad, y: minY - pad },
    { x: maxX + pad, y: maxY + pad },
    { x: minX - pad, y: maxY + pad },
  ];
};

// Clip a convex polygon by the half-plane f(p) <= 0 using the Sutherland–Hodgman algorithm.
const clipPolygon = (poly: Polygon, f: (p: Point) => number): Polygon =>
  poly.reduce<Polygon>((acc, curr, i, arr) => {
    const prev = arr[(i - 1 + arr.length) % arr.length];
    const currInside = f(curr) <= 0;
    const prevInside = f(prev) <= 0;
    // Edge from prev -> curr
    if (prevInside && currInside) return acc.concat(curr);
    if (prevInside && !currInside) {
      const t = f(prev) / (f(prev) - f(curr));
      const inter = {
        x: prev.x + t * (curr.x - prev.x),
        y: prev.y + t * (curr.y - prev.y),
      };
      return acc.concat(inter);
    }
    if (!prevInside && currInside) {
      const t = f(prev) / (f(prev) - f(curr));
      const inter = {
        x: prev.x + t * (curr.x - prev.x),
        y: prev.y + t * (curr.y - prev.y),
      };
      return acc.concat(inter, curr);
    }
    return acc;
  }, []);

// For a given site s, compute its Voronoi cell by clipping the bounding polygon
// with each half-plane defined by (distance to s <= distance to t)
const voronoiCell = (s: Point, sites: Point[], bbox: Polygon): Polygon =>
  sites
    .filter((t) => t.x !== s.x || t.y !== s.y)
    .reduce<Polygon>((cell, t) => {
      // f(p) <= 0 when p is closer to s than to t.
      const f = (p: Point) =>
        2 * (t.x - s.x) * p.x + 2 * (t.y - s.y) * p.y - (t.x ** 2 - s.x ** 2 + (t.y ** 2 - s.y ** 2));
      return clipPolygon(cell, f);
    }, bbox);

// Compute the Voronoi diagram for all sites
export const voronoiDiagram = (sites: Point[]): { site: Point; cell: Polygon }[] => {
  const bbox = computeBoundingBox(sites);
  return sites.map((site) => ({ site, cell: voronoiCell(site, sites, bbox) }));
};

/* Example usage */
const sites: Point[] = [
  { x: 20, y: 30 },
  { x: 50, y: 60 },
  { x: 80, y: 20 },
];

const diagram = voronoiDiagram(sites);
console.log(diagram);
