import { z } from 'zod';
import paramsJson from './boids.params.json';

export const configSchema = z.object({
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
});

export type BoidsParams = z.infer<typeof configSchema>;

export const params = configSchema.parse(paramsJson);
