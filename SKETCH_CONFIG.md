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
                      │ *.params.js      │    │ *.params.ts      │
                      │ (compiled)       │    │ (schema + parse) │
                      └──────────────────┘    └──────────────────┘
```

1. **Params** (`*.params.ts`) — Defines the config shape using zod, imports the JSON, and exports the parsed config. Compiled to JS + d.ts for the server.
2. **Config** (`*.params.json`) — Plain JSON file with current values. Source of truth at runtime.
3. **Server** — Generic: GET reads JSON, POST validates against the compiled schema then writes JSON.

## Adding Config to a New Sketch

### 1. Create the params file (`src/{name}.params.ts`)

```typescript
import { z } from 'zod';
import paramsJson from './{name}.params.json';

export const configSchema = z.object({
  speed: z.number().positive(),
  color: z.string(),
  count: z.number().int().positive(),
});

export type SketchParams = z.infer<typeof configSchema>;

export const params = configSchema.parse(paramsJson);
```

### 2. Create the config file (`src/{name}.params.json`)

```json
{
  "speed": 1.5,
  "color": "#ff0000",
  "count": 100
}
```

### 3. Update `package.json`

Add `zod` and `@rollup/plugin-json` as dev dependencies:

```bash
pnpm add -D zod @rollup/plugin-json
```

### 4. Update `rollup.config.js`

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

### 5. Add `tsconfig.json` (if not present)

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

Params files are compiled from TypeScript to JavaScript + type declarations so the server can import the schema without depending on the sketch's TypeScript context. The adjacent `.params.json` is also copied to `dist/` so the compiled module can resolve its JSON import.

Build all schemas:
```bash
bun tools/src/build/build-schemas.ts
```

This is also run automatically as part of `pnpm build`.

Output goes to `dist/{name}.params.js` + `dist/{name}.params.d.ts` in each sketch directory.

## Key Constraints

- **No zod in client bundles**: The `configSchema` should not be imported at runtime by client code. Use `import type` for types, and import `params` for the parsed values.
- **Schema must export `configSchema`**: The server does `const { configSchema } = await import(path)`.
- **JSON must match schema**: The `*.params.json` file must be valid according to the schema. The server validates on write, but manual edits bypass this.
