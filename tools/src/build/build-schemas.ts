import { spawn } from 'child_process';
import * as path from 'path';
import fg from 'fast-glob';
import { Future, Result } from '@swan-io/boxed';
import * as LibPaths from '../lib/paths';
import { createLogger } from '../lib/logger';

const log = createLogger('build-schemas');

export const SCHEMA_GLOB = '**/src/*.schema.ts';
export const SCHEMA_GLOB_IGNORE = ['**/node_modules/**', '**/dist/**'];

export const findSchemaFiles = (sketchesDir: string): string[] => {
  return fg.sync(SCHEMA_GLOB, {
    cwd: sketchesDir,
    ignore: SCHEMA_GLOB_IGNORE,
    absolute: false,
  });
};

export const compileSchema = (
  sketchesDir: string,
  relativeSchemaPath: string
): Future<Result<string, Error>> => {
  const absoluteSchemaPath = path.join(sketchesDir, relativeSchemaPath);
  const sketchDir = path.resolve(path.join(sketchesDir, relativeSchemaPath, '../..'));
  const distDir = path.join(sketchDir, 'dist');

  log.info(`Compiling schema: ${relativeSchemaPath}`);

  return Future.fromPromise(
    new Promise<string>((resolve, reject) => {
      const child = spawn(
        'npx',
        [
          'tsc',
          absoluteSchemaPath,
          '--declaration',
          '--emitDeclarationOnly', 'false',
          '--module', 'ESNext',
          '--target', 'ES2022',
          '--moduleResolution', 'bundler',
          '--outDir', distDir,
          '--rootDir', path.join(sketchDir, 'src'),
          '--skipLibCheck',
        ],
        {
          cwd: sketchDir,
          shell: true,
          stdio: ['ignore', 'pipe', 'pipe'],
        }
      );

      let stderr = '';
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(path.join(distDir, path.basename(relativeSchemaPath).replace('.ts', '.js')));
        } else {
          reject(new Error(stderr || `tsc exited with code ${code}`));
        }
      });

      child.on('error', reject);
    })
  ).mapError((err): Error => (err instanceof Error ? err : new Error(String(err))));
};

export const buildAllSchemas = async (
  sketchesDir: string
): Promise<{ total: number; failures: number }> => {
  const schemaFiles = findSchemaFiles(sketchesDir);
  let failures = 0;

  for (const schemaFile of schemaFiles) {
    const result = await compileSchema(sketchesDir, schemaFile).toPromise();
    result.match({
      Ok: (outputPath) => log.info(`Compiled: ${schemaFile} → ${outputPath}`),
      Error: (err) => {
        log.error(`Failed to compile ${schemaFile}`, { error: err.message });
        failures++;
      },
    });
  }

  return { total: schemaFiles.length, failures };
};

// CLI entry point
if (process.argv[1] && path.resolve(process.argv[1]).includes('build-schemas')) {
  const main = async () => {
    const sketchesDir = LibPaths.getSketchesDir();
    const result = await buildAllSchemas(sketchesDir);
    log.info(`Schema compilation complete: ${result.total} total, ${result.failures} failures`);

    if (result.failures > 0) {
      process.exit(1);
    }
  };

  main();
}
