import { describe, it, expect } from 'vitest';
import { escapeRegex, replaceAll } from './string';

describe('escapeRegex', () => {
  it('escapes dots', () => {
    expect(escapeRegex('my-sketch.v2')).toBe('my-sketch\\.v2');
  });

  it('escapes brackets', () => {
    expect(escapeRegex('sketch[1]')).toBe('sketch\\[1\\]');
  });

  it('escapes parentheses', () => {
    expect(escapeRegex('sketch(test)')).toBe('sketch\\(test\\)');
  });

  it('escapes asterisks', () => {
    expect(escapeRegex('sketch*')).toBe('sketch\\*');
  });

  it('escapes plus signs', () => {
    expect(escapeRegex('sketch+')).toBe('sketch\\+');
  });

  it('escapes question marks', () => {
    expect(escapeRegex('sketch?')).toBe('sketch\\?');
  });

  it('escapes carets', () => {
    expect(escapeRegex('^sketch$')).toBe('\\^sketch\\$');
  });

  it('escapes curly braces', () => {
    expect(escapeRegex('sketch{1,2}')).toBe('sketch\\{1,2\\}');
  });

  it('escapes pipes', () => {
    expect(escapeRegex('sketch|other')).toBe('sketch\\|other');
  });

  it('escapes backslashes', () => {
    expect(escapeRegex('sketch\\path')).toBe('sketch\\\\path');
  });

  it('leaves normal characters unchanged', () => {
    expect(escapeRegex('my-sketch-name')).toBe('my-sketch-name');
  });

  it('handles empty string', () => {
    expect(escapeRegex('')).toBe('');
  });

  it('escapes multiple special characters', () => {
    expect(escapeRegex('[my-sketch.v2]+(test)')).toBe('\\[my-sketch\\.v2\\]\\+\\(test\\)');
  });
});

describe('replaceAll', () => {
  it('replaces all occurrences of a string', () => {
    const content = 'import "my-sketch";\nconst x = "my-sketch";';
    expect(replaceAll(content, 'my-sketch', 'new-sketch')).toBe(
      'import "new-sketch";\nconst x = "new-sketch";'
    );
  });

  it('handles strings with regex special characters', () => {
    const content = 'import "my-sketch.v2";\nconst x = "my-sketch.v2";';
    expect(replaceAll(content, 'my-sketch.v2', 'new-sketch-v2')).toBe(
      'import "new-sketch-v2";\nconst x = "new-sketch-v2";'
    );
  });

  it('does not treat dot as any character', () => {
    // With a bug (using raw regex), "my-sketch.v2" would match "my-sketchXv2"
    const content = 'my-sketchXv2 and my-sketch.v2';
    expect(replaceAll(content, 'my-sketch.v2', 'REPLACED')).toBe('my-sketchXv2 and REPLACED');
  });

  it('handles brackets as literal characters', () => {
    const content = 'const arr = sketch[1];';
    expect(replaceAll(content, 'sketch[1]', 'sketch[0]')).toBe('const arr = sketch[0];');
  });

  it('returns unchanged content when no match', () => {
    const content = 'no matches here';
    expect(replaceAll(content, 'my-sketch', 'new-sketch')).toBe('no matches here');
  });

  it('handles empty search string', () => {
    // Empty regex matches between every character
    const content = 'abc';
    expect(replaceAll(content, '', 'X')).toBe('XaXbXcX');
  });
});
