import { z } from 'zod';
import paramsJson from './boids.params.json';

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
});

export type IBoidsParams = z.infer<typeof paramsSchema>;

export const params = paramsSchema.parse(paramsJson);
