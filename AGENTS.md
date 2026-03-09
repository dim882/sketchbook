# AI

See [[./README.md]].

## To create a new sketch with `clone`

Pass the name of the sketch you want to copy, then the name to give the new sketch

```
$ pnpm clone <base sketch name> <my sketch name>
```

# Coding Standards

## Commenting

Do not intersperse comments throughout the code. Simply write code that is clearly understood. The user is an experienced programmer and doesn't need much explanation.

## TypeScript

Avoid using `any` at all costs. If it's absolutely necessary, this is a case where a comment is NECESSARY to call it out.

Imports should not contain the file extension.

## Utilities

Sketch files should be focused on setup and the main render process. Utility functions should be put in a utils file.

When creating a utils file, the name should be prefixed with the name of the sketch or system the utils are for. For example a `foo.ts` sketch would have a `foo.utils.ts` utils file.

When importing from a utils file, use a star import.

`import * as utils from 'foo.utils.ts`

## Miscellaneous

### Dimensions

If you're passing a canvas context into a function, there's no need to pass in the width and height as well. The function can get the width and height from the context.

### Destructuring

Use destructuring whenever it will make the code more concise:

#### Bad

```
const width = canvas.width;
const height = canvas.height;
```

#### Good

```
const { width, height}  = canvas;
```

### Configuration

Configuration variables should be at the top of the main sketch function, formatted in ALL_CAPS.

```
const BACKGROUND_COLOR = '#fcfaf7';
const METABALL_COLOR = '#c27770';
const METABALL_COUNT = 20;
const THRESHOLD = 0.2;
```

## pnpm Scripts

All scripts are run from the repo root. We use bun for running TypeScript scripts that are called by pnpm. If it's a one-off script, then running it with `npx tsx` is acceptable.

### Development

- `pnpm dev` -- Start the dev server (Express on port 2000), file watcher, and UI watcher in parallel
- `pnpm build` -- Build all sketches with Rollup and compile all Zod parameter schemas to JSON
- `pnpm clone <from> <to>` -- Create a new sketch by copying an existing one, updating references and running install/build
- `pnpm move <from> <to>` -- Move/rename a sketch, adjusting all internal references and paths
- `pnpm lib:pull <sketch>` -- Copy the latest shared lib into a specific sketch's `lib/` directory

### Verification

Run these after completing a task to catch issues early:

- `pnpm check` -- TypeScript type-check all sketch files (no emit)
- `pnpm --filter tools test` -- Run tool tests once with Vitest
- `pnpm --filter tools test:watch` -- Run tool tests in watch mode
- `pnpm --filter tools check` -- TypeScript type-check the tools package (no emit)

After completing a task, always run:
1. `pnpm check` -- to verify sketch TypeScript types are correct
2. `pnpm --filter tools test` -- to verify tool tests pass (if you changed anything in `tools/`)
3. `pnpm --filter tools check` -- to verify tool TypeScript types are correct (if you changed anything in `tools/`)
