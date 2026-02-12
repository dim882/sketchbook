# Tools - Functional Programming Patterns

This directory contains build tools, server utilities, and CLI scripts for the sketchbook project. All code follows functional programming patterns using the [Boxed](https://swan-io.github.io/boxed/) library.

## Core Principles

### Lift at the Edge

Convert Promises to Futures **immediately** at I/O boundaries:

```typescript
// GOOD - wrap at the boundary
const readFile = (filePath: string) => Future.fromPromise(fs.readFile(filePath, 'utf-8'));

// BAD - mixing Promise and Future
async function getData() {
  const result = await somePromise();  // Don't mix async/await with Future
  return Future.value(Result.Ok(result));
}
```

| I/O Type                   | Pattern                                |
| -------------------------- | -------------------------------------- |
| File operations            | `Future.fromPromise(fs.readFile(...))` |
| HTTP calls                 | `Future.fromPromise(fetch(...))`       |
| Dynamic imports            | `Future.fromPromise(import(...))`      |
| Sync operations that throw | `Result.fromExecution(() => ...)`      |

### Type Errors at Boundaries

Every **public function** must have an explicit error type, never `unknown`:

```typescript
// GOOD - explicit error type
function getSketchData(name: string): Future<Result<Data, ServerError>>

// BAD - unknown error type
function getSketchData(name: string): Future<Result<Data, unknown>>
```

| Context          | Error Type    | Example                           |
| ---------------- | ------------- | --------------------------------- |
| Server utilities | `ServerError` | HTTP handlers, API utilities      |
| CLI utilities    | `Error`       | Clone scripts, build tools        |
| Validation       | `string`      | Simple user-facing error messages |

### Pure Core, Imperative Shell

Keep validation and business logic **pure** (no side effects). Handle I/O and process control at entry points:

```typescript
// Pure validation function - testable
function validateArgs(args: string[]): Result<Args, string> {
  if (!args[2]) return Result.Error('source not provided');
  return Result.Ok({ source: args[2] });
}

// Imperative shell - handles side effects
export function getArgs() {
  return validateArgs(process.argv).match({
    Ok: (args) => args,
    Error: (msg) => {
      console.error(msg);
      process.exit(1);
    }
  });
}
```

## Error Handling

```
I/O Operation
    ↓
Future.fromPromise() → Future<Result<T, Error>>
    ↓
.mapError() → Future<Result<T, ServerError>>
    ↓
.tap() at HTTP boundary
    ↓
result.match({ Ok: ..., Error: handleError(res) })
```

Errors are:
- **Typed** at function boundaries
- **Mapped** to domain-specific types (e.g., `ServerError`)
- **Logged** at boundaries (in `handleError`), not inline
- **Never swallowed** - always propagated or explicitly handled

## Composition Patterns

### Sequential Operations: `flatMapOk`

Chain dependent async operations:

```typescript
readFile(path)
  .flatMapOk((content) => parseContent(content))
  .flatMapOk((data) => saveData(data))
  .mapError((err) => serverError('Pipeline failed', err));
```

### Side Effects: `tap`

Execute side effects without changing the value (used at HTTP boundaries):

```typescript
fetchData().tap((result) =>
  result.match({
    Ok: (data) => res.json(data),
    Error: handleError(res),
  })
);
```

## Type Safety

### Param Values

Sketch parameters use constrained types:

```typescript
type ParamValue = string | number | boolean | null;
type Params = Record<string, ParamValue>;
```

### Type Guards

Use type guards instead of type assertions:

```typescript
// GOOD - runtime type check
function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && 'code' in err;
}

if (isErrnoException(err) && err.code === 'ENOENT') { ... }

// BAD - unsafe cast
if ((err as NodeJS.ErrnoException).code === 'ENOENT') { ... }
```

### Acceptable `unknown` Uses

- **Validation inputs**: `validateSketchName(name: unknown)` - must validate untrusted input
- **Error handlers**: `logError(error: unknown)` - catch blocks produce unknown errors
