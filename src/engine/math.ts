import type { Obstacle } from '../contracts';

export interface Point { x: number; z: number }
export const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.z - b.z);
export const clamp = (n: number, a: number, b: number): number => Math.max(a, Math.min(b, n));
export function blocked(p: Point, radius: number, obstacles: Obstacle[]): boolean {
  if (p.x < -15 + radius || p.x > 15 - radius || p.z < -15 + radius || p.z > 13 - radius) return true;
  return obstacles.some(o => Math.hypot(p.x - clamp(p.x, o.minX, o.maxX), p.z - clamp(p.z, o.minZ, o.maxZ)) < radius - 1e-6);
}
export function move(p: Point, dx: number, dz: number, radius: number, obstacles: Obstacle[]): void {
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / .12));
  for (let i = 0; i < steps; i++) {
    const x = clamp(p.x + dx / steps, -15 + radius, 15 - radius);
    if (!blocked({ x, z: p.z }, radius, obstacles)) p.x = x;
    const z = clamp(p.z + dz / steps, -15 + radius, 13 - radius);
    if (!blocked({ x: p.x, z }, radius, obstacles)) p.z = z;
  }
}
export function lineClear(a: Point, b: Point, obstacles: Obstacle[], padding = 0): boolean {
  // Slab intersection, including shots that cross a thin wall between frames.
  return !obstacles.some(o => {
    let lo = 0, hi = 1;
    for (const [s, d, min, max] of [[a.x, b.x-a.x, o.minX-padding, o.maxX+padding], [a.z, b.z-a.z, o.minZ-padding, o.maxZ+padding]]) {
      if (Math.abs(d) < 1e-9) { if (s < min || s > max) return false; }
      else { let u = (min-s)/d, v = (max-s)/d; if (u > v) [u,v] = [v,u]; lo = Math.max(lo,u); hi = Math.min(hi,v); if (lo > hi) return false; }
    }
    return hi >= 0 && lo <= 1;
  });
}
/** Small deterministic visibility graph around the four shared AABBs. */
export function nextWaypoint(a: Point, b: Point, obstacles: Obstacle[], radius = .46): Point {
  if (lineClear(a,b,obstacles,radius)) return b;
  const nodes: Point[] = [a,b];
  for (const o of obstacles) for (const x of [o.minX-radius-.08,o.maxX+radius+.08]) for (const z of [o.minZ-radius-.08,o.maxZ+radius+.08]) {
    const p = {x,z}; if (!blocked(p,radius,obstacles)) nodes.push(p);
  }
  const cost = nodes.map(() => Infinity), prev = nodes.map(() => -1), used = new Set<number>(); cost[0] = 0;
  for (let k=0; k<nodes.length; k++) {
    let u=-1; for(let i=0;i<nodes.length;i++) if(!used.has(i) && (u<0 || cost[i]<cost[u])) u=i;
    if(u<0 || !Number.isFinite(cost[u])) break; if(u===1) break; used.add(u);
    for(let v=1;v<nodes.length;v++) if(!used.has(v) && lineClear(nodes[u],nodes[v],obstacles,radius)) {
      const c=cost[u]+distance(nodes[u],nodes[v]); if(c<cost[v]) {cost[v]=c;prev[v]=u;}
    }
  }
  if(prev[1]<0) return a;
  let i=1; while(prev[i]>0) i=prev[i]; return nodes[i];
}
