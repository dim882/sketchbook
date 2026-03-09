import { z } from 'zod';
import paramsJson from './boid-fuzz.params.json';

export const paramsSchema = z.object({
  FLOCK_PARAMS: z.object({
    separationDist: z.number(),
    alignDist: z.number(),
    cohesionDist: z.number(),
    separationWeight: z.number(),
    alignmentWeight: z.number(),
    cohesionWeight: z.number(),
  }),
  BOID_COUNT: z.number().int().positive(),
  WOIM_LENGTH: z.number().int().positive(),
  BACKGROUND_COLOR: z.string(),
  BOID_COLOR: z.string(),
  FLOCK_LIFETIME_FRAMES: z.number().int().positive(),
  FLOCK_SPAWN_INTERVAL_FRAMES: z.number().int().positive(),
  FLOCK_SPAWN_DISTANCE: z.number().positive(),
});

export type BoidsParams = z.infer<typeof paramsSchema>;
export type IFlockParams = BoidsParams['FLOCK_PARAMS'];

export const params = paramsSchema.parse(paramsJson);
