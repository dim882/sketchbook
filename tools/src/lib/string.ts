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

/**
 * Replaces all occurrences of a literal string in content.
 * Unlike String.replace with a string argument, this replaces ALL occurrences,
 * and the search string is treated as literal (not as a regex pattern).
 *
 * @example
 * replaceAll('import "my-sketch.v2"', 'my-sketch.v2', 'new-sketch-v2')
 * // 'import "new-sketch-v2"'
 */
export function replaceAll(content: string, search: string, replacement: string): string {
  return content.replace(new RegExp(escapeRegex(search), 'g'), replacement);
}
