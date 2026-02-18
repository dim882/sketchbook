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

/**
 * Directory entry with name and last modified timestamp.
 * Used by both server and UI for sketch listing.
 */
export interface IDir {
  name: string;
  path: string;
  lastModified: number;
  isSketch: boolean;
}

export interface IDirTreeNode extends IDir {
  children?: IDirTreeNode[];
}
