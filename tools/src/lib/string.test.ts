import { describe, it, expect } from 'vitest';
import * as Lib from './string';

describe('escapeRegex', () => {
  it('escapes dots', () => {
    expect(Lib.escapeRegex('my-sketch.v2')).toBe('my-sketch\\.v2');
  });

  it('escapes brackets', () => {
    expect(Lib.escapeRegex('sketch[1]')).toBe('sketch\\[1\\]');
  });

  it('escapes parentheses', () => {
    expect(Lib.escapeRegex('sketch(test)')).toBe('sketch\\(test\\)');
  });

  it('escapes asterisks', () => {
    expect(Lib.escapeRegex('sketch*')).toBe('sketch\\*');
  });

  it('escapes plus signs', () => {
    expect(Lib.escapeRegex('sketch+')).toBe('sketch\\+');
  });

  it('escapes question marks', () => {
    expect(Lib.escapeRegex('sketch?')).toBe('sketch\\?');
  });

  it('escapes carets', () => {
    expect(Lib.escapeRegex('^sketch$')).toBe('\\^sketch\\$');
  });

  it('escapes curly braces', () => {
    expect(Lib.escapeRegex('sketch{1,2}')).toBe('sketch\\{1,2\\}');
  });

  it('escapes pipes', () => {
    expect(Lib.escapeRegex('sketch|other')).toBe('sketch\\|other');
  });

  it('escapes backslashes', () => {
    expect(Lib.escapeRegex('sketch\\path')).toBe('sketch\\\\path');
  });

  it('leaves normal characters unchanged', () => {
    expect(Lib.escapeRegex('my-sketch-name')).toBe('my-sketch-name');
  });

  it('handles empty string', () => {
    expect(Lib.escapeRegex('')).toBe('');
  });

  it('escapes multiple special characters', () => {
    expect(Lib.escapeRegex('[my-sketch.v2]+(test)')).toBe('\\[my-sketch\\.v2\\]\\+\\(test\\)');
  });
});
