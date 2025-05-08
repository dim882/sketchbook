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

It is important to NEVER FORGET THIS.

## TypeScript

Avoid using `any` at all costs. If it's absolutely necessary, this is a case where a comment is NECESSARY to call it out.

Imports should not contain the file extension.

## Utilities

Sketch files should be focused on setup and the main render process. Utility functions should be put in a utils file.

When creating a utils file, the name should be prefixed with the name of the sketch or system the utils are for. For example a `foo.ts` sketch would have a `foo.utils.ts` utils file.

When importing from a utils file, use a star import.

`import * as utils from 'foo.utils.ts`

## Code Formatting

Place line breaks between significant parts of the code.

### Bad

```
function copyDir(source: string, target: string) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  const items = fs.readdirSync(source);
  items.forEach((item) => {
    if (EXCLUDED_FILES.includes(item)) {
      return;
    }
    const sourcePath = path.join(source, item);
    const targetPath = utils.createTargetPath(item, target, sourceName, targetName);
    const stats = fs.statSync(sourcePath);
    if (stats.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else if (stats.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
      const baseName = path.basename(targetPath);
      const extName = path.extname(targetPath);
      if (baseName === 'package.json') {
        utils.setPackageName(targetPath, targetName);
      } else if (extName === '.html') {
        utils.replaceHtmlTitle(targetPath, targetName);
        utils.replaceContentInFile(targetPath, sourceName, targetName);
      } else if (utils.isTextFile(targetPath)) {
        utils.replaceContentInFile(targetPath, sourceName, targetName);
      }
    }
  });
}
```

### Good

```
function copyDir(source: string, target: string) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const items = fs.readdirSync(source);

  items.forEach((item) => {
    if (EXCLUDED_FILES.includes(item)) {
      return;
    }

    const sourcePath = path.join(source, item);
    const targetPath = utils.createTargetPath(item, target, sourceName, targetName);
    const stats = fs.statSync(sourcePath);

    if (stats.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else if (stats.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);

      const baseName = path.basename(targetPath);
      const extName = path.extname(targetPath);

      if (baseName === 'package.json') {
        utils.setPackageName(targetPath, targetName);
      } else if (extName === '.html') {
        utils.replaceHtmlTitle(targetPath, targetName);
        utils.replaceContentInFile(targetPath, sourceName, targetName);
      } else if (utils.isTextFile(targetPath)) {
        utils.replaceContentInFile(targetPath, sourceName, targetName);
      }
    }
  });
}
```

Always place a linebreak before a return statement.

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
