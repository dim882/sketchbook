export interface FlockParams {
  separationDist: number;
  alignDist: number;
  cohesionDist: number;
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
}

export const FLOCK_PARAMS: FlockParams = {
  separationDist: 120,
  alignDist: 50,
  cohesionDist: 50,
  separationWeight: 1.5,
  alignmentWeight: 1,
  cohesionWeight: 1,
};

export const BOID_COUNT = 500;
export const WOIM_LENGTH = 20;
export const BACKGROUND_COLOR = '#fcfaf7';
