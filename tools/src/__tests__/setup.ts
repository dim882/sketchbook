import { vi, beforeEach, afterEach } from 'vitest';

let originalExit: typeof process.exit;

beforeEach(() => {
  originalExit = process.exit;
  process.exit = vi.fn() as never;
});

afterEach(() => {
  process.exit = originalExit;
});
