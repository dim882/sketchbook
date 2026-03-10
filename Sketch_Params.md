# Sketch Parameters System

Sketches can expose browser-editable parameters using zod schemas and plain JSON files. The server handles reading and writing generically — no sketch-specific server code is needed.

## How It Works

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────────┐
│ Browser UI      │────▶│ Server       │────▶│ *.params.json    │
│ (form)          │◀────│ (generic)    │◀────│ (plain JSON)     │
└─────────────────┘     └──────┬───────┘     └──────────────────┘
                               │                      ▲
                      validates with                   │
                               │              read at runtime
                               ▼                      │
                      ┌──────────────────┐    ┌───────┴──────────┐
                      │ *.schema.js      │    │ *.schema.ts      │
                      │ (compiled)       │    │ (zod schema)     │
                      └──────────────────┘    └──────────────────┘
```

1. **Schema** (`*.schema.ts`) — Defines the parameter shape using zod. Compiled to JS + d.ts for server-side validation. Not imported at runtime by client code.
2. **Values** (`*.params.json`) — Plain JSON file with current values. Source of truth at runtime. Sketches import this directly for parameter values.
3. **Server** — Generic: GET reads JSON, POST validates against the compiled schema then writes JSON.

## Adding Parameters to a New Sketch

### 1. Create the schema file (`src/{name}.schema.ts`)

```typescript
import { z } from 'zod';

export const paramsSchema = z.object({
  speed: z.number().positive(),
  color: z.string(),
  count: z.number().int().positive(),
});

export type ISketchParams = z.infer<typeof paramsSchema>;
```

### 2. Create the params file (`src/{name}.params.json`)

```json
{
  "speed": 1.5,
  "color": "#ff0000",
  "count": 100
}
```

### 3. Import params in the sketch

Sketches import the JSON file directly and use `import type` for the schema type. This keeps Zod out of client bundles while providing full type safety via TypeScript's structural checking:

```typescript
import type { ISketchParams } from './{name}.schema';
import paramsJson from './{name}.params.json';

const params: ISketchParams = paramsJson;
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
  // ...existing rollup options
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

- **GET** `/api/sketches/{name}/params` — Returns the current params as JSON
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

Schema files are compiled from TypeScript to JavaScript + type declarations so the server can import the schema without depending on the sketch's TypeScript context. This is separate from the Rollup bundle build -- Rollup builds the sketch bundle for the browser, while tsc compiles the schema so the server can import it for validation.

The build pipeline:

1. `findSchemaFiles` discovers all `*.schema.ts` files under `sketches/`
2. `compileSchema` runs tsc on each one to produce `.js` + `.d.ts` in the sketch's `dist/` directory

Build all schemas:
```bash
pnpm build
```

This runs `build.ts`, which calls `buildAllSchemas`. The watch server (`pnpm dev`) also compiles schemas automatically on file changes.

Output goes to `dist/{name}.schema.js` + `dist/{name}.schema.d.ts` in each sketch directory.

## Key Constraints

- **No zod in client bundles**: Sketches must not import the schema file at runtime. Use `import type` for types, and import the JSON file directly for parameter values.
- **Schema must export `paramsSchema`**: The server does `const { paramsSchema } = await import(path)`.
- **JSON must match schema**: The `*.params.json` file must be valid according to the schema. The server validates on write, but manual edits bypass this.
