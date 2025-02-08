// Types
type Point = { x: number; y: number };
type Polygon = Point[];

// Compute a bounding polygon covering all sites (with padding)
const computeBoundingPolygon = (sites: Point[]): Polygon => {
  const allX = sites.map((site) => site.x);
  const allY = sites.map((site) => site.y);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);
  const padding = 10;
  return [
    { x: minX - padding, y: minY - padding },
    { x: maxX + padding, y: minY - padding },
    { x: maxX + padding, y: maxY + padding },
    { x: minX - padding, y: maxY + padding },
  ];
};

// Clip a convex polygon by a half-plane using Sutherland–Hodgman.
const clipPolygon = (polygon: Polygon, isInside: (point: Point) => number): Polygon =>
  polygon.reduce<Polygon>((accumulatedPoints, currentPoint, index, points) => {
    const previousPoint = points[(index - 1 + points.length) % points.length];
    const currentInside = isInside(currentPoint) <= 0;
    const previousInside = isInside(previousPoint) <= 0;
    if (previousInside && currentInside) {
      return accumulatedPoints.concat(currentPoint);
    }
    if (previousInside && !currentInside) {
      const t = isInside(previousPoint) / (isInside(previousPoint) - isInside(currentPoint));
      const intersection: Point = {
        x: previousPoint.x + t * (currentPoint.x - previousPoint.x),
        y: previousPoint.y + t * (currentPoint.y - previousPoint.y),
      };
      return accumulatedPoints.concat(intersection);
    }
    if (!previousInside && currentInside) {
      const t = isInside(previousPoint) / (isInside(previousPoint) - isInside(currentPoint));
      const intersection: Point = {
        x: previousPoint.x + t * (currentPoint.x - previousPoint.x),
        y: previousPoint.y + t * (currentPoint.y - previousPoint.y),
      };
      return accumulatedPoints.concat(intersection, currentPoint);
    }
    return accumulatedPoints;
  }, []);

// Compute the Voronoi cell for a given site by clipping the bounding polygon
// with each half-plane that favors the current site over another site.
const voronoiCell = (currentSite: Point, allSites: Point[], boundingPolygon: Polygon): Polygon =>
  allSites
    .filter((otherSite) => otherSite.x !== currentSite.x || otherSite.y !== currentSite.y)
    .reduce<Polygon>((cellPolygon, otherSite) => {
      // Returns a positive number if point is closer to otherSite, negative if closer to currentSite.
      const halfPlaneTest = (point: Point) =>
        2 * (otherSite.x - currentSite.x) * point.x +
        2 * (otherSite.y - currentSite.y) * point.y -
        (otherSite.x ** 2 - currentSite.x ** 2 + (otherSite.y ** 2 - currentSite.y ** 2));
      return clipPolygon(cellPolygon, halfPlaneTest);
    }, boundingPolygon);

// Compute the Voronoi diagram for all sites.
export const computeVoronoi = (sites: Point[]): { site: Point; cell: Polygon }[] => {
  const boundingPolygon = computeBoundingPolygon(sites);
  return sites.map((site) => ({ site, cell: voronoiCell(site, sites, boundingPolygon) }));
};
