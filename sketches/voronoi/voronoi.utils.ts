type Point = { x: number; y: number };
type Polygon = Point[];

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
const computeCell = (currentSite: Point, allSites: Point[], boundingPolygon: Polygon): Polygon =>
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

export const computeVoronoi = (sites: Point[], boundingPolygon: Polygon): { site: Point; cell: Polygon }[] => {
  return sites.map((site) => ({
    site,
    cell: computeCell(site, sites, boundingPolygon),
  }));
};
