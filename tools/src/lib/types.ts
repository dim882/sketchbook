/**
 * JSON-serializable param value types.
 */
export type ParamValue = string | number | boolean | null;

/**
 * Recursive JSON-serializable param record.
 * Supports nested objects for structured params (e.g., FLOCK_PARAMS).
 */
export type ParamRecord = { [key: string]: ParamValue | ParamRecord };

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
