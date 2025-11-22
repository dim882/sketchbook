export interface IFlockParams {
  separationDist: number;
  alignDist: number;
  cohesionDist: number;
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
}

export const FLOCK_PARAMS: IFlockParams = {
  separationDist: 100,
  alignDist: 50,
  cohesionDist: 500,
  separationWeight: 2.4,
  alignmentWeight: 1,
  cohesionWeight: 1,
};

export const BOID_COUNT = 200;
export const WOIM_LENGTH = 20;
export const BACKGROUND_COLOR = '#121212'; 

export const BOID_COLOR = '#e8c9c9';
export const FLOCK_LIFETIME_FRAMES = 200;
export const FLOCK_SPAWN_INTERVAL_FRAMES = 40;
export const FLOCK_SPAWN_DISTANCE = 60;