import { spawn } from 'child_process';
import { mkdir, copyFile } from 'fs/promises';
import * as path from 'path';
import fg from 'fast-glob';
import { Future, Result } from '@swan-io/boxed';
import { createLogger } from '../lib/logger';
import { logFutureResult } from '../lib/result-logging';

const log = createLogger('build-schemas');

export const SCHEMA_GLOB = '**/src/*.params.ts';
export const SCHEMA_GLOB_IGNORE = ['**/node_modules/**', '**/dist/**'];

const schemaCompilerFlags = [
  '--declaration',
  '--emitDeclarationOnly', 'false',
  '--module', 'ESNext',
  '--target', 'ES2022',
  '--moduleResolution', 'bundler',
  '--resolveJsonModule',
  '--skipLibCheck',
];

export const findSchemaFiles = (sketchesDirectory: string): string[] =>
  fg.sync(SCHEMA_GLOB, {
    cwd: sketchesDirectory,
    ignore: SCHEMA_GLOB_IGNORE,
    absolute: false,
  });

const copyCompanionJson = async (
  sourceDirectory: string,
  distDirectory: string,
  relativeSchemaPath: string,
): Promise<string> => {
  const jsonFileName = path.basename(relativeSchemaPath).replace('.ts', '.json');
  const jsonSource = path.join(sourceDirectory, jsonFileName);
  await mkdir(distDirectory, { recursive: true });
  await copyFile(jsonSource, path.join(distDirectory, jsonFileName));
  return path.join(distDirectory, path.basename(relativeSchemaPath).replace('.ts', '.js'));
};

export const compileSchema = (
  sketchesDirectory: string,
  relativeSchemaPath: string,
): Future<Result<string, Error>> => {
  const absoluteSchemaPath = path.join(sketchesDirectory, relativeSchemaPath);
  const sketchDirectory = path.resolve(path.join(sketchesDirectory, relativeSchemaPath, '../..'));
  const sourceDirectory = path.join(sketchDirectory, 'src');
  const distDirectory = path.join(sketchDirectory, 'dist');

  log.info(`Compiling schema: ${relativeSchemaPath}`);

  return Future.fromPromise(
    new Promise<string>((resolve, reject) => {
      const child = spawn(
        'npx',
        [
          'tsc',
          absoluteSchemaPath,
          ...schemaCompilerFlags,
          '--outDir', distDirectory,
          '--rootDir', sourceDirectory,
        ],
        {
          cwd: sketchDirectory,
          shell: true,
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );

      let stderr = '';
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', async (code) => {
        if (code !== 0) {
          reject(new Error(stderr || `tsc exited with code ${code}`));
          return;
        }

        try {
          resolve(await copyCompanionJson(sourceDirectory, distDirectory, relativeSchemaPath));
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });

      child.on('error', reject);
    }),
  ).mapError((err): Error => (err instanceof Error ? err : new Error(String(err))));
};

export const findSchemaFilesForSketch = (
  sketchesDirectory: string,
  sketchDirectory: string,
): string[] => {
  const sketchName = path.relative(sketchesDirectory, sketchDirectory);
  return findSchemaFiles(sketchesDirectory).filter(
    (file) => file.startsWith(sketchName + '/'),
  );
};

export const compileSchemasForSketch = (
  sketchesDirectory: string,
  sketchDirectory: string,
): void => {
  findSchemaFilesForSketch(sketchesDirectory, sketchDirectory).forEach((schemaFile) =>
    logFutureResult(log, `compile ${schemaFile}`)(compileSchema(sketchesDirectory, schemaFile)),
  );
};

export const buildAllSchemas = async (
  sketchesDirectory: string,
): Promise<{ total: number; failures: number }> => {
  const schemaFiles = findSchemaFiles(sketchesDirectory);

  const failures = await schemaFiles.reduce(async (previousFailures, schemaFile) => {
    const count = await previousFailures;
    const result = await compileSchema(sketchesDirectory, schemaFile).toPromise();
    return result.match({
      Ok: (outputPath) => {
        log.info(`Compiled: ${schemaFile} -> ${outputPath}`);
        return count;
      },
      Error: (error) => {
        log.error(`Failed to compile ${schemaFile}`, { error: error.message });
        return count + 1;
      },
    });
  }, Promise.resolve(0));

  return { total: schemaFiles.length, failures };
};
