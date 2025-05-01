# AI

See [[README]].

# Coding Standards

## Favor a functional style

OOP should be avoided.

Focus on creating clearly defined, composable data structures, with small tightly focused functions that act on the data structures.

Avoid mutation. Avoid using `let`.

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

### Miscellaneous

If you're passing a canvas context into a function, there's no need to pass in the width and height as well. The function can get the width and height from the context.
