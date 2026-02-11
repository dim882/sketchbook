/**
 * Valid types for sketch parameter values.
 * Constrained to JSON-serializable primitives.
 */
export type ParamValue = string | number | boolean | null;

/**
 * Record of sketch parameters with typed values.
 */
export type SketchParams = Record<string, ParamValue>;

/**
 * Handler interface for sketch server modules.
 * Each sketch can export a default object implementing this interface.
 */
export interface SketchServerHandler {
  getParams(fileContent: string): SketchParams;
}
