# Sketchbook

A monorepo for creative coding sketches.

## Philosophy

**Sketches are standalone.** Each sketch is its own package that can be built and run independently—no framework lock-in. The dev server exists to make iteration fast, but sketches should never depend on it.

**Loose coupling.** Any interaction between sketches and tooling is explicit and generic. A few sketches (like `boids`) support browser-based parameter editing that writes to disk via the server—this works but is experimental.

## Structure

```
sketches/   # Individual sketch packages (browser)
lib/        # Shared utilities as @dim882/sketchlib (browser)
tools/      # Dev server, build system, CLI (node)
```

### Sketches

Each sketch follows a naming convention:

```
sketches/foo/
  src/
    foo.html      # Entry point
    foo.ts        # Main logic
    foo.css       # Styles
    foo.utils.ts  # Helpers
  rollup.config.js
  package.json
```

Sketches can import from `@dim882/sketchlib` for shared utilities.

### Lib

Published to npm as `@dim882/sketchlib`. Contains reusable utilities: canvas helpers, animation, audio, math, random, etc. Distributed as TypeScript source.

### Tools

Node-based infrastructure: Express dev server, Rollup build orchestration, file watcher, and CLI utilities. Run with Bun.

## Commands

```bash
pnpm dev                    # Dev server with hot reload
pnpm clone <from> <to>      # Create new sketch from template
pnpm build                  # Build all sketches
pnpm check                  # TypeScript checking
pnpm lib:pull               # Update shared lib in sketches
pnpm lib:publish:patch      # Publish lib (patch/minor/major)
```

## Parameter Editing (Experimental)

Some sketches support editable parameters that persist to disk. Requires:

1. `<sketch>.params.ts` — default values
2. `<sketch>.params.tpl` — template with `{{placeholders}}`
3. `<sketch>.server.ts` — `getParams()` parser
4. Form UI in HTML

Server handles `/api/sketches/<sketch>/params` automatically. See `boids` for a working example.

