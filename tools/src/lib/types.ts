/**
 * JSON-serializable config value types.
 */
export type ConfigValue = string | number | boolean | null;

/**
 * Recursive JSON-serializable config record.
 * Supports nested objects for structured config (e.g., FLOCK_PARAMS).
 */
export type ConfigRecord = { [key: string]: ConfigValue | ConfigRecord };

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
