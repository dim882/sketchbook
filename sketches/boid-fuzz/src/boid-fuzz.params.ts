import { configSchema } from './boid-fuzz.schema';
import configJson from './boid-fuzz.params.json';

export type { IFlockParams } from './boid-fuzz.schema';
export const config = configSchema.parse(configJson);
