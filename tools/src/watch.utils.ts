import * as fs from 'node:fs';
import * as path from 'node:path';

export const findNearestConfig = (dir: string): string | null => {
  const configPath = path.join(dir, 'rollup.config.js');

  return fs.existsSync(configPath)
    ? configPath
    : dir === path.parse(dir).root
    ? null
    : findNearestConfig(path.dirname(dir));
};
