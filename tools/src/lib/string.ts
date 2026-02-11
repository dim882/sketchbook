/**
 * Escapes special regex characters in a string so it can be used
 * as a literal pattern in a RegExp.
 *
 * @example
 * escapeRegex('my-sketch.v2') // 'my-sketch\\.v2'
 * escapeRegex('[test]') // '\\[test\\]'
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
