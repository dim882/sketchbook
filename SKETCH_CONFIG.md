# Sketch Configuration System

Sketches can expose browser-editable configuration using zod schemas and plain JSON files. The server handles reading and writing generically — no sketch-specific server code is needed.

## How It Works

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────────┐
│ Browser UI      │────▶│ Server       │────▶│ *.params.json    │
│ (form)          │◀────│ (generic)    │◀────│ (plain JSON)     │
└─────────────────┘     └──────┬───────┘     └──────────────────┘
                               │                      ▲
                      validates with                   │
                               │              read at build time
                               ▼                      │
                      ┌──────────────────┐    ┌───────┴──────────┐
                      │ *.schema.js      │    │ *.params.ts      │
                      │ (compiled zod)   │    │ (thin wrapper)   │
                      └──────────────────┘    └──────────────────┘
```

1. **Schema** (`*.schema.ts`) — Defines the config shape using zod. Compiled to JS + d.ts for the server.
2. **Config** (`*.params.json`) — Plain JSON file with current values. Source of truth at runtime.
3. **Wrapper** (`*.params.ts`) — Thin module that imports JSON and re-exports typed constants, preserving the existing import API for sketch code.
4. **Server** — Generic: GET reads JSON, POST validates against the compiled schema then writes JSON.

## Adding Config to a New Sketch

### 1. Create the schema file (`src/{name}.schema.ts`)

```typescript
import { z } from 'zod';

export const configSchema = z.object({
  speed: z.number().positive(),
  color: z.string(),
  count: z.number().int().positive(),
});

export type Config = z.infer<typeof configSchema>;

// Default export is required — the server imports this for validation
export default configSchema;
```

### 2. Create the config file (`src/{name}.params.json`)

```json
{
  "speed": 1.5,
  "color": "#ff0000",
  "count": 100
}
```

### 3. Create the params wrapper (`src/{name}.params.ts`)

```typescript
import type { Config } from './{name}.schema';
import configJson from './{name}.params.json';

const config: Config = configJson as Config;

export const speed: number = config.speed;
export const color: string = config.color;
export const count: number = config.count;
```

### 4. Update `package.json`

Add `zod` and `@rollup/plugin-json` as dev dependencies:

```bash
pnpm add -D zod @rollup/plugin-json
```

### 5. Update `rollup.config.js`

Add the JSON plugin:

```javascript
import json from '@rollup/plugin-json';

export default {
  // ...existing config
  plugins: [
    nodeResolve(),
    json(),        // <-- add this
    typescript(),
    // ...
  ],
};
```

### 6. Add `tsconfig.json` (if not present)

Must include `resolveJsonModule`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"]
}
```

## Server API

- **GET** `/api/sketches/{name}/params` — Returns the current config as JSON
- **POST** `/api/sketches/{name}/params` — Validates against the sketch's zod schema, then writes

Request body for POST:
```json
{
  "params": {
    "speed": 2.0,
    "color": "#00ff00",
    "count": 200
  }
}
```

## Schema Compilation

Schemas are compiled from TypeScript to JavaScript + type declarations so the server can import them without depending on the sketch's TypeScript context.

Build all schemas:
```bash
bun tools/src/build/build-schemas.ts
```

This is also run automatically as part of `pnpm build`.

Output goes to `dist/{name}.schema.js` + `dist/{name}.schema.d.ts` in each sketch directory.

## Key Constraints

- **No zod in client bundles**: Schema files must never be imported at runtime by client code. Use `import type` only.
- **Schema must have a default export**: The server does `const { default: schema } = await import(path)`.
- **JSON must match schema**: The `*.params.json` file must be valid according to the schema. The server validates on write, but manual edits bypass this.
