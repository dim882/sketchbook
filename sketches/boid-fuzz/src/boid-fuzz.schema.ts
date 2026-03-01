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
  BOID_COLOR: z.string(),
  FLOCK_LIFETIME_FRAMES: z.number().int().positive(),
  FLOCK_SPAWN_INTERVAL_FRAMES: z.number().int().positive(),
  FLOCK_SPAWN_DISTANCE: z.number().positive(),
});

export type Config = z.infer<typeof configSchema>;
export type IFlockParams = z.infer<typeof flockParamsSchema>;

export default configSchema;
