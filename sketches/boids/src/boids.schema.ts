import { z } from 'zod';

export const flockParamsSchema = z.object({
  separationDist: z.number(),
  alignDist: z.number(),
  cohesionDist: z.number(),
  separationWeight: z.number(),
  alignmentWeight: z.number(),
  cohesionWeight: z.number(),
});

export const configSchema = z.object({
  FLOCK_PARAMS: flockParamsSchema,
  BOID_COUNT: z.number().int().positive(),
  WOIM_LENGTH: z.number().int().positive(),
  BACKGROUND_COLOR: z.string(),
});

export type Config = z.infer<typeof configSchema>;
export type FlockParams = z.infer<typeof flockParamsSchema>;

export default configSchema;
