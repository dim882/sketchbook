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

## Tool Scripts

We use bun for running TypeScript scripts that are called by pnpm.

If it's a one-off script, then running it with `npx tsx` is acceptable.
