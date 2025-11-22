export interface IFlockParams {
  separationDist: number;
  alignDist: number;
  cohesionDist: number;
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
}

export const FLOCK_PARAMS: IFlockParams = {
  separationDist: {{separationDist}},
  alignDist: {{alignDist}},
  cohesionDist: {{cohesionDist}},
  separationWeight: {{separationWeight}},
  alignmentWeight: {{alignmentWeight}},
  cohesionWeight: {{cohesionWeight}},
};

export const BOID_COUNT = {{BOID_COUNT}};
export const WOIM_LENGTH = {{WOIM_LENGTH}};
export const BACKGROUND_COLOR = '{{BACKGROUND_COLOR}}'; 

export const BOID_COLOR = '{{BOID_COLOR}}';
export const FLOCK_LIFETIME_FRAMES = {{FLOCK_LIFETIME_FRAMES}};
export const FLOCK_SPAWN_INTERVAL_FRAMES = {{FLOCK_SPAWN_INTERVAL_FRAMES}};
export const FLOCK_SPAWN_DISTANCE = {{FLOCK_SPAWN_DISTANCE}};