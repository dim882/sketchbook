# Functional Error Handling Library Comparison

## Current Codebase Patterns

Your tools directory has 7 try/catch blocks across 4 files with these patterns:

| Pattern | Files | Example |
|---------|-------|---------|
| **Catch-and-log (silent fail)** | sketch.clone.utils.ts | File ops continue on error |
| **Catch-and-respond (HTTP)** | server.ts | Map errors to 500/404 |
| **Try-finally (cleanup)** | watch.ts | Restore cwd after rollup |
| **Fire-and-forget** | lib-pull.ts, watch.ts | Promise .catch() chains |

Key problems:
- All errors are `any` type (no type safety)
- Silent failures hide bugs (file operations just log and continue)
- No error propagation (callers can't react to failures)
- Repetitive try/catch boilerplate

---

## Library Comparison

### 1. True Myth

**Types:** `Result<T, E>`, `Maybe<T>`, `Task<T, E>` (async)

**Style:** Dual API - both method chaining AND standalone functions for piping

```typescript
// Piping style (true-myth's strength)
import { Result, pipe } from 'true-myth';

const result = pipe(
  readFile(path),
  Result.map(parseJson),
  Result.andThen(validateConfig)
);
```

**Your code converted:**
```typescript
// sketch.clone.utils.ts - replaceContentInFile
import { Result } from 'true-myth';

export function replaceContentInFile(
  filePath: string,
  searchValue: string,
  replaceValue: string
): Result<void, Error> {
  return Result.tryOr(new Error(`Failed: ${filePath}`), () => {
    const content = fs.readFileSync(filePath, 'utf8');
    const updated = content.replace(new RegExp(searchValue, 'g'), replaceValue);
    if (content !== updated) {
      fs.writeFileSync(filePath, updated, 'utf8');
    }
  });
}
```

**Pros:**
- Excellent pipe/compose support for functional pipelines
- `Task` type for async (like ResultAsync)
- Mature, well-documented

**Cons:**
- Slightly more verbose API names
- Less pattern matching ergonomics than boxed

---

### 2. Boxed

**Types:** `Option<T>`, `Result<T, E>`, `AsyncData<T>` (loading states)

**Style:** Method-based chaining with `.match()` pattern matching

```typescript
// Method chaining style (boxed's strength)
import { Result } from "@swan-io/boxed";

const result = Result.fromExecution(() => fs.readFileSync(path))
  .map(parseJson)
  .flatMap(validateConfig)
  .match({
    Ok: (config) => useConfig(config),
    Error: (err) => handleError(err),
  });
```

**Your code converted:**
```typescript
// server.ts - GET / handler
import { Result } from "@swan-io/boxed";

app.get('/', async (req, res) => {
  const result = await Result.fromPromise(renderMainPage());

  result.match({
    Ok: (page) => res.send(page),
    Error: (err) => {
      console.error('Error:', err);
      res.status(500).send('Failed to process request');
    },
  });
});

// sketch.clone.utils.ts - setPackageName
export function setPackageName(
  packageJsonPath: string,
  targetName: string
): Result<void, Error> {
  return Result.fromExecution(() => {
    const data = fs.readFileSync(packageJsonPath, 'utf8');
    const json = JSON.parse(data);
    json.name = targetName;
    fs.writeFileSync(packageJsonPath, JSON.stringify(json, null, 2));
  });
}
```

**Pros:**
- Cleanest `.match()` syntax for pattern matching
- `AsyncData` type handles NotAsked/Loading/Done states (useful for UI)
- Smallest bundle (~3KB)
- Works seamlessly with ts-pattern

**Cons:**
- Less pipe/compose ergonomics than true-myth
- Smaller community than purify

---

### 3. Purify

**Types:** `Either<L, R>`, `Maybe<T>`, `EitherAsync<L, R>`, codec module

**Style:** Haskell-influenced naming (Either/Left/Right instead of Result/Ok/Err)

```typescript
// Either style (purify's approach)
import { Either, Left, Right } from 'purify-ts';

const result: Either<Error, Config> = Either.encase(() =>
  fs.readFileSync(path)
).chain(parseJson);

result.caseOf({
  Left: (err) => handleError(err),
  Right: (config) => useConfig(config),
});
```

**Your code converted:**
```typescript
// watch.ts - runRollup
import { EitherAsync } from 'purify-ts';

const runRollup = (configPath: string): EitherAsync<Error, void> =>
  EitherAsync(async ({ liftEither, fromPromise }) => {
    const originalCwd = process.cwd();

    try {
      process.chdir(path.dirname(configPath));
      const config = await fromPromise(getRollupConfig(configPath));
      const bundle = await fromPromise(rollup(config));

      if (Array.isArray(config.output)) {
        for (const output of config.output) {
          await fromPromise(bundle.write(output));
        }
      } else if (config.output) {
        await fromPromise(bundle.write(config.output));
      }
    } finally {
      process.chdir(originalCwd);
    }
  });
```

**Pros:**
- `codec` module for runtime validation (JSON parsing, API responses)
- Most feature-complete (NonEmptyList, Tuple, etc.)
- Production-proven (used by real companies)

**Cons:**
- Haskell naming (Either/Left/Right) less intuitive for JS devs
- More concepts to learn

---

## Recommendation Matrix

| Criteria | True Myth | Boxed | Purify |
|----------|-----------|-------|--------|
| **Learning curve** | Medium | Low | High |
| **Pattern matching** | Good | Best | Good |
| **Pipe/compose** | Best | Medium | Medium |
| **Async ergonomics** | Good (Task) | Good | Good (EitherAsync) |
| **Bundle size** | ~5KB | ~3KB | ~8KB |
| **TypeScript DX** | Excellent | Excellent | Excellent |
| **Naming familiarity** | Good (Result) | Best (Result) | Poor (Either) |

---

## Side-by-Side: True Myth vs Boxed

### Pattern 1: Basic Sync Operation

**Current code (sketch.clone.utils.ts:54-65):**
```typescript
export function replaceContentInFile(filePath: string, searchValue: string, replaceValue: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(new RegExp(searchValue, 'g'), replaceValue);
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}
```

**True Myth:**
```typescript
import { Result } from 'true-myth';

export function replaceContentInFile(
  filePath: string,
  searchValue: string,
  replaceValue: string
): Result<void, Error> {
  return Result.tryOr(new Error(`Failed: ${filePath}`), () => {
    const content = fs.readFileSync(filePath, 'utf8');
    const updated = content.replace(new RegExp(searchValue, 'g'), replaceValue);
    if (content !== updated) {
      fs.writeFileSync(filePath, updated, 'utf8');
    }
  });
}
```

**Boxed:**
```typescript
import { Result } from '@swan-io/boxed';

export function replaceContentInFile(
  filePath: string,
  searchValue: string,
  replaceValue: string
): Result<void, Error> {
  return Result.fromExecution(() => {
    const content = fs.readFileSync(filePath, 'utf8');
    const updated = content.replace(new RegExp(searchValue, 'g'), replaceValue);
    if (content !== updated) {
      fs.writeFileSync(filePath, updated, 'utf8');
    }
  });
}
```

**Verdict:** Nearly identical. True Myth's `tryOr` lets you specify a custom error; Boxed captures the thrown error automatically.

---

### Pattern 2: Chained Operations (read → parse → modify → write)

**True Myth (piping style):**
```typescript
import { Result, pipe } from 'true-myth';

const readJson = (path: string): Result<unknown, Error> =>
  Result.tryOr(new Error('read failed'), () => fs.readFileSync(path, 'utf8'))
    .andThen(content => Result.tryOr(new Error('parse failed'), () => JSON.parse(content)));

const writeJson = (path: string, data: unknown): Result<void, Error> =>
  Result.tryOr(new Error('write failed'), () =>
    fs.writeFileSync(path, JSON.stringify(data, null, 2))
  );

// Piping: operations flow left to right through standalone functions
export function setPackageName(path: string, name: string): Result<void, Error> {
  return pipe(
    readJson(path),
    Result.map(pkg => ({ ...pkg as object, name })),
    Result.andThen(pkg => writeJson(path, pkg))
  );
}

// Alternative: method chaining also works
export function setPackageNameChained(path: string, name: string): Result<void, Error> {
  return readJson(path)
    .map(pkg => ({ ...pkg as object, name }))
    .andThen(pkg => writeJson(path, pkg));
}
```

**Boxed (method chaining style):**
```typescript
import { Result } from '@swan-io/boxed';

const readJson = (path: string): Result<unknown, Error> =>
  Result.fromExecution(() => fs.readFileSync(path, 'utf8'))
    .flatMap(content => Result.fromExecution(() => JSON.parse(content)));

const writeJson = (path: string, data: unknown): Result<void, Error> =>
  Result.fromExecution(() => fs.writeFileSync(path, JSON.stringify(data, null, 2)));

// Everything chains - no intermediate variables needed
export function setPackageName(path: string, name: string): Result<void, Error> {
  return readJson(path)
    .map(pkg => ({ ...pkg as object, name }))
    .flatMap(pkg => writeJson(path, pkg));
}

// With inline match for fire-and-forget usage
setPackageName(pkgPath, 'new-name').match({
  Ok: () => console.log('Updated package.json'),
  Error: (err) => console.error('Failed:', err),
});
```

**Key difference:**
- True Myth: `andThen` = flatMap, offers both `pipe()` and method chaining
- Boxed: `flatMap` = andThen, method chaining only (but chains as far as you want)

**Chaining note:** Both libraries support fluent chaining. The difference is that True Myth also offers standalone functions for `pipe()`:

```typescript
// True Myth - standalone functions work with pipe()
pipe(result, Result.map(fn), Result.andThen(fn2))

// Boxed - no standalone functions, but chains indefinitely
result.map(fn).flatMap(fn2).map(fn3).flatMap(fn4).match({...})
```

You never need an intermediate variable with either library.

---

### Pattern 3: HTTP Handler with Error Mapping

**Current code (server.ts:21-28):**
```typescript
app.get('/', async (req, res) => {
  try {
    res.send(await renderMainPage());
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Failed to process request');
  }
});
```

**True Myth:**
```typescript
import { Result } from 'true-myth';

// Helper for async
const tryAsync = async <T>(fn: () => Promise<T>): Promise<Result<T, Error>> => {
  try {
    return Result.ok(await fn());
  } catch (e) {
    return Result.err(e instanceof Error ? e : new Error(String(e)));
  }
};

app.get('/', async (req, res) => {
  const result = await tryAsync(() => renderMainPage());

  // Match with standalone function
  Result.match(
    {
      Ok: (page) => res.send(page),
      Err: (err) => {
        console.error('Error:', err);
        res.status(500).send('Failed to process request');
      },
    },
    result
  );

  // Or with method
  result.match({
    Ok: (page) => res.send(page),
    Err: (err) => {
      console.error('Error:', err);
      res.status(500).send('Failed to process request');
    },
  });
});
```

**Boxed:**
```typescript
import { Result } from '@swan-io/boxed';

// With intermediate variable (for clarity or reuse)
app.get('/', async (req, res) => {
  const result = await Result.fromPromise(renderMainPage());

  result.match({
    Ok: (page) => res.send(page),
    Error: (err) => {
      console.error('Error:', err);
      res.status(500).send('Failed to process request');
    },
  });
});

// Direct chaining - no intermediate variable
app.get('/', async (req, res) => {
  (await Result.fromPromise(renderMainPage())).match({
    Ok: (page) => res.send(page),
    Error: (err) => {
      console.error('Error:', err);
      res.status(500).send('Failed to process request');
    },
  });
});

// Even cleaner with a helper
const asyncResult = <T>(p: Promise<T>) => Result.fromPromise(p);

app.get('/', async (req, res) =>
  (await asyncResult(renderMainPage())).match({
    Ok: (page) => res.send(page),
    Error: (err) => {
      console.error('Error:', err);
      res.status(500).send('Failed');
    },
  })
);
```

**Key differences:**
- Boxed: Built-in `Result.fromPromise()` for async
- True Myth: Needs helper or use `Task` type (their async primitive)
- True Myth: `Err` vs Boxed: `Error` in match arms

---

### Pattern 4: Composing Multiple Results

**Current code (hypothetical - combining multiple file operations):**
```typescript
// Current: silent failures, no way to know if all succeeded
replaceContentInFile(path1, search, replace);
setPackageName(pkgPath, name);
replaceHtmlTitle(htmlPath, title);
```

**True Myth:**
```typescript
import { Result } from 'true-myth';

// Collect all results
const results = [
  replaceContentInFile(path1, search, replace),
  setPackageName(pkgPath, name),
  replaceHtmlTitle(htmlPath, title),
];

// Get first error, or Ok if all succeeded
const combined: Result<void[], Error> = Result.all(results);

// Or use pipe for sequential with early exit
const sequential = pipe(
  replaceContentInFile(path1, search, replace),
  Result.andThen(() => setPackageName(pkgPath, name)),
  Result.andThen(() => replaceHtmlTitle(htmlPath, title))
);
```

**Boxed:**
```typescript
import { Result } from '@swan-io/boxed';

// Collect all and handle in one chain
Result.all([
  replaceContentInFile(path1, search, replace),
  setPackageName(pkgPath, name),
  replaceHtmlTitle(htmlPath, title),
]).match({
  Ok: () => console.log('All operations succeeded'),
  Error: (err) => console.error('Operation failed:', err),
});

// Sequential with early exit - direct chaining
replaceContentInFile(path1, search, replace)
  .flatMap(() => setPackageName(pkgPath, name))
  .flatMap(() => replaceHtmlTitle(htmlPath, title))
  .match({
    Ok: () => console.log('Done'),
    Error: (err) => console.error('Failed:', err),
  });
```

**Verdict:** Both have `Result.all()`. True Myth's pipe is cleaner for long chains; Boxed's chaining is fine for short ones.

---

### Pattern 5: Async with Cleanup (watch.ts:67-89)

**Current code:**
```typescript
const runRollup = async (configPath: string) => {
  const originalCwd = process.cwd();

  try {
    process.chdir(path.dirname(configPath));
    const config = await getRollupConfig(configPath);
    const bundle = await rollup(config);
    // ... write outputs
  } catch (error) {
    logError(error);
  } finally {
    process.chdir(originalCwd);
  }
};
```

**True Myth (with Task):**
```typescript
import { Task } from 'true-myth';

const runRollup = (configPath: string): Task<void, Error> =>
  Task.try(async () => {
    const originalCwd = process.cwd();

    try {
      process.chdir(path.dirname(configPath));
      const config = await getRollupConfig(configPath);
      const bundle = await rollup(config);
      // ... write outputs
    } finally {
      process.chdir(originalCwd);
    }
  });

// Usage
runRollup(configPath).match({
  Ok: () => console.log('Built'),
  Err: logError,
});
```

**Boxed:**
```typescript
import { Result } from '@swan-io/boxed';

const runRollup = async (configPath: string): Promise<Result<void, Error>> => {
  const originalCwd = process.cwd();

  try {
    process.chdir(path.dirname(configPath));
    const config = await getRollupConfig(configPath);
    const bundle = await rollup(config);
    // ... write outputs
    return Result.Ok(undefined);
  } catch (e) {
    return Result.Error(e instanceof Error ? e : new Error(String(e)));
  } finally {
    process.chdir(originalCwd);
  }
};

// Usage
(await runRollup(configPath)).match({
  Ok: () => console.log('Built'),
  Error: logError,
});
```

**Key difference:**
- True Myth: `Task` is a lazy async Result (doesn't run until you call `.run()` or `.match()`)
- Boxed: Uses `Promise<Result<T, E>>` - runs immediately

---

## Tradeoffs Summary

| Aspect | True Myth | Boxed |
|--------|-----------|-------|
| **Chaining** | Methods + standalone pipe | Methods only (but fully chainable) |
| **Async** | `Task` type (lazy) | `Promise<Result>` (eager) |
| **Composability** | `pipe()` shines for 4+ operations | Chaining fine for 2-3 ops |
| **Bundle** | ~5KB | ~3KB |
| **Learning curve** | Medium (pipe, Task concepts) | Low (just methods) |
| **Error creation** | `tryOr(error, fn)` - explicit | `fromExecution(fn)` - captures thrown |

### When True Myth is better:
- Long transformation pipelines (5+ steps)
- You want lazy async execution (Task)
- You prefer point-free / functional style
- You're already using pipe/compose elsewhere

### When Boxed is better:
- Mostly simple "do thing, handle result" patterns
- You want smallest possible bundle
- Team less familiar with FP concepts
- Your async should run immediately, not lazily

---

## Your Codebase Analysis

Looking at your actual patterns:
1. **sketch.clone.utils.ts** - Simple ops, no chaining needed
2. **server.ts** - HTTP handlers need async, no complex pipelines
3. **watch.ts** - Has cleanup needs, but not complex chains

**Neither library has a significant advantage for your patterns.** Both would work well. The choice comes down to:

- **Prefer True Myth** if you want the option to use `pipe()` for future complex flows
- **Prefer Boxed** if you want the simpler mental model and smaller bundle

---

## Final Recommendation: Start with Boxed

Given you're unsure about future complexity needs:

1. **Boxed is the safer starting point** - simpler to learn, smaller bundle
2. **Migration path exists** - APIs are similar enough that switching to True Myth later wouldn't be a major refactor:
   - `Result.fromExecution` → `Result.tryOr`
   - `.flatMap()` → `.andThen()`
   - `.match({ Ok, Error })` → `.match({ Ok, Err })`
3. **You can evaluate as you go** - if you find yourself wanting `pipe()`, migrate then

---

## Implementation Plan

### Phase 1: Setup
```bash
cd tools && pnpm add @swan-io/boxed
```

### Phase 2: Convert utilities (sketch.clone.utils.ts)
Convert these functions to return `Result<T, Error>`:
- `replaceContentInFile`
- `setPackageName`
- `install`
- `replaceHtmlTitle`

### Phase 3: Update callers (sketch.clone.ts)
- Change from fire-and-forget to collecting Results
- Add final error summary if any operations failed

### Phase 4: Convert server handlers (server.ts)
- Use `Result.fromPromise()` for async operations
- Map Result states to HTTP responses

### Phase 5: Convert watch (watch.ts)
- Wrap rollup operations in Result
- Keep finally cleanup inside the async function

---

## Verification

1. `pnpm build` in tools directory
2. `pnpm clone <sketch> test-clone` - verify clone works and reports errors
3. `pnpm serve` - verify server responds correctly to valid/invalid requests
4. Delete test-clone sketch
