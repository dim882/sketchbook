import { configSchema } from './boids.schema';
import configJson from './boids.params.json';

export type { FlockParams } from './boids.schema';
export const config = configSchema.parse(configJson);
