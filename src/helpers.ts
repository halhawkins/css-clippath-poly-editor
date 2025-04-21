import { IPath } from "./Slice/ClipPathSlice"
/**
 * Inserts newPoint into the polygon's points, placing it in between the segment closest to newPoint.
 *
 * @param polygon - The current polygon.
 * @param newPoint - The new point to be inserted.
 * @param closed - If the polygon is closed (default is true).
 * @returns A new IPath with the new point inserted.
 */
export function insertPointInPolygon(polygon: IPath, newPoint: { x: number; y: number }, closed: boolean = true): IPath {
    const points = polygon.points;
    if (points.length < 2) {
      // Not enough points to find a segment, so just append.
      return { ...polygon, points: [...points, newPoint] };
    }
    
    let minDistance = Infinity;
    let insertIndex = 1; // Default value.
    
    // If the polygon is not closed, only iterate segments from index 0 to n-2.
    // If closed, we consider the segment from the last point to the first.
    const limit = closed ? points.length : points.length - 1;
    
    for (let i = 0; i < limit; i++) {
      // Calculate next index; if we're at the last point in a closed polygon, wrap to 0.
      const nextIndex = (i + 1) % points.length;
      const dist = distanceFromPointToSegment(points[i], points[nextIndex], newPoint);
      if (dist < minDistance) {
        minDistance = dist;
        insertIndex = i + 1;
      }
    }
    
    // Insert the new point at the identified index.
    const newPoints = [...points];
    newPoints.splice(insertIndex, 0, newPoint);
    
    return { ...polygon, points: newPoints };
  }

  /**
 * Computes the shortest distance from point P to the line segment AB.
 *
 * @param A - The first endpoint of the segment.
 * @param B - The second endpoint of the segment.
 * @param P - The point from which the distance is calculated.
 * @returns The shortest distance from point P to the line segment AB.
 */
export function distanceFromPointToSegment(
    A: { x: number; y: number },
    B: { x: number; y: number },
    P: { x: number; y: number }
  ): number {
    // Calculate the vector AB
    const ABx = B.x - A.x;
    const ABy = B.y - A.y;
    
    // Compute the squared length of AB
    const lenAB2 = ABx * ABx + ABy * ABy;
    
    // If A and B are identical, return the distance from P to A.
    if (lenAB2 === 0) return Math.hypot(P.x - A.x, P.y - A.y);
    
    // Compute the projection parameter t of P onto the line defined by A and B.
    let t = ((P.x - A.x) * ABx + (P.y - A.y) * ABy) / lenAB2;
    
    // Clamp t to the range [0, 1] so that the projection falls on the segment.
    t = Math.max(0, Math.min(1, t));
    
    // Calculate the projection point
    const projX = A.x + t * ABx;
    const projY = A.y + t * ABy;
    
    // Return the Euclidean distance from P to the projection point.
    return Math.hypot(P.x - projX, P.y - projY);
  }
  
  