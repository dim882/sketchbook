import type { Config, FlockParams } from './boids.schema';
import configJson from './boids.params.json';

const config: Config = configJson as Config;

export type { FlockParams };
export const FLOCK_PARAMS: FlockParams = config.FLOCK_PARAMS;
export const BOID_COUNT: number = config.BOID_COUNT;
export const WOIM_LENGTH: number = config.WOIM_LENGTH;
export const BACKGROUND_COLOR: string = config.BACKGROUND_COLOR;
