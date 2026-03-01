import type { Config, IFlockParams } from './boid-fuzz.schema';
import configJson from './boid-fuzz.params.json';

const config: Config = configJson as Config;

export type { IFlockParams };
export const FLOCK_PARAMS: IFlockParams = config.FLOCK_PARAMS;
export const BOID_COUNT: number = config.BOID_COUNT;
export const WOIM_LENGTH: number = config.WOIM_LENGTH;
export const BACKGROUND_COLOR: string = config.BACKGROUND_COLOR;
export const BOID_COLOR: string = config.BOID_COLOR;
export const FLOCK_LIFETIME_FRAMES: number = config.FLOCK_LIFETIME_FRAMES;
export const FLOCK_SPAWN_INTERVAL_FRAMES: number = config.FLOCK_SPAWN_INTERVAL_FRAMES;
export const FLOCK_SPAWN_DISTANCE: number = config.FLOCK_SPAWN_DISTANCE;
