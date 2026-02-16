# Plan: Preset System for Sketches

**Status**: Ready for implementation (Plan 1 - sketch standardization is complete)

## Overview

Implement a preset system in `lib/presets/` where each preset bundles rollup config, tsconfig, and HTML/CSS templates. Sketches will have minimal 2-line rollup configs that import from their preset.

---

## Preset Classification (36 sketches)

| Preset       | Count | Sketches |
|-------------|-------|----------|
| **default**  | 29    | animation, arcs, audio, axis, base, blob-grid, blob-path, boid-fuzz, boids, css-scope, curves, fuzz, grid-curves, grid-curves-2, grid1, grid2, live-audio, metaballs, my-sketch, particles, particles-oop, radiation, sinewaves, sphere, square-transform, voronoi, waves-audio, whorley, xor1 |
| **preact**   | 2     | preact-base, blob-grid-svg |
| **functron** | 2     | functron-demo, palettes |
| **commonjs** | 2     | flowfield, strange-attractor |
| **custom**   | 1     | color-picker (multi-entry build, keeps full rollup.config.js) |

---

## Preset Structure

```
lib/
├── presets/
│   ├── tsconfig.base.json      # Base tsconfig all sketches extend
│   ├── default/
│   │   ├── rollup.config.js    # Exports createConfig function
│   │   ├── tsconfig.json
│   │   ├── template.html       # {{SKETCH_NAME}} placeholders
│   │   └── template.css
│   ├── preact/
│   │   ├── rollup.config.js    # Babel + PostCSS (CSS modules)
│   │   ├── tsconfig.json       # jsx: "react-jsx", jsxImportSource: "preact"
│   │   ├── template.html
│   │   └── template.css
│   ├── functron/
│   │   ├── rollup.config.js    # Babel + PostCSS (CSS modules)
│   │   └── tsconfig.json       # Custom jsxFactory
│   └── commonjs/
│       └── rollup.config.js    # Adds commonjs plugin (extends default)
```

---

## createConfig API

```javascript
// Sketch rollup.config.js (minimal)
import createConfig from '@dim882/sketchlib/presets/default/rollup.config';
export default createConfig('my-sketch', import.meta.url);

// With overrides
export default createConfig('my-sketch', import.meta.url, {
  html: './my-sketch.tpl.html',  // Custom template path (CSS via <link> in HTML)
  extraAssets: ['*.obj', '*.glb'] // Additional asset patterns to copy
});
```

**Behavior:**
- If no `html` option: uses preset's `template.html`, interpolating `{{SKETCH_NAME}}`
- If `html` option provided: uses that template directly (no interpolation needed)
- Custom CSS is included via `<link>` in the custom HTML file
- Default assets always copied: `*.mp3`, `*.json`, `*.png`, `*.jpg`, `*.svg`, `*.woff`, `*.woff2`

---

## Implementation

### Phase A: Preset Infrastructure

**Step 1: Create base tsconfig**
- File: `lib/presets/tsconfig.base.json`
- Content: Common TypeScript settings all sketches extend
- Commit: `feat(lib): add base tsconfig for sketch presets`

**Step 2: Create default preset**
- Files:
  - `lib/presets/default/rollup.config.js` - exports `createConfig(name, url, options?)`
  - `lib/presets/default/tsconfig.json` - extends base
  - `lib/presets/default/template.html` - with `{{SKETCH_NAME}}` placeholder
  - `lib/presets/default/template.css` - minimal reset
- Commit: `feat(lib): add default sketch preset`

**Step 3: Add sketchlib dependency to all sketches**
- Add `"@dim882/sketchlib": "link:../../lib"` to all 36 sketch package.json files
- Commit: `chore(sketches): add sketchlib dependency`

**Step 4: Create additional presets**
- `lib/presets/preact/` - babel + PostCSS (CSS modules) for preact
- `lib/presets/functron/` - babel + PostCSS (CSS modules) with custom pragma
- `lib/presets/commonjs/` - adds commonjs plugin (extends default)
- Commit: `feat(lib): add preact, functron, commonjs presets`

### Phase B: Migration

**Step 5: Migrate sketches to presets**
- Replace full rollup.config.js with 2-line import from preset
- Add `"sketchPreset": "<preset-name>"` to each sketch's package.json
- Update tsconfig.json to extend preset's tsconfig
- Commit: `refactor: migrate sketches to use lib presets`

**Step 6: Update clone CLI**
- Read preset from source sketch's package.json `sketchPreset` field
- Generate minimal rollup.config.js importing from correct preset
- Copy custom HTML only if source has it (preset templates used otherwise)
- Commit: `feat(tools): clone CLI generates preset-based sketches`

### Phase C: Publish and Lock

**Step 7: Update lib/package.json exports**
```json
{
  "exports": {
    ...existing exports...
    "./presets/*": "./presets/*"
  },
  "files": ["dist", "presets"]
}
```
- Commit: `feat(lib): add preset exports to package.json`

**Step 8: Publish to npm**
- Commit: `chore(lib): bump version for preset system`

**Step 9: Lock sketch dependencies**
- Change `link:../../lib` to published version (e.g., `"^0.3.0"`)
- Commit: `chore(sketches): lock sketchlib to published version`

**Step 10: Remove lib includes from sketches**
- Remove `../../lib/**/*.ts` from 5 sketches (base, blob-path, grid-curves, grid-curves-2, whorley)
- These will now import from npm package
- Commit: `refactor: remove direct lib includes, use npm imports`

---

## Design Decisions

1. **functron and preact share structure, not templates** - Each has own template.html/css to allow preset-specific defaults

2. **commonjs preset extends default** - Only adds the commonjs plugin, inherits everything else

3. **PostCSS with CSS modules in JSX presets** - Both functron and preact presets include PostCSS with CSS modules by default:
   ```javascript
   postcss({
     modules: true,
     extract: 'bundle.css',
     minimize: true,
     sourceMap: true,
   })
   ```
   - `functron-demo` will need its CSS adapted to work with CSS modules
   - `color-picker` keeps its custom rollup.config.js due to multi-entry build

---

## Files to Create

| File | Description |
|------|-------------|
| `lib/presets/tsconfig.base.json` | Base TypeScript config |
| `lib/presets/default/rollup.config.js` | Default createConfig |
| `lib/presets/default/tsconfig.json` | Default TS settings |
| `lib/presets/default/template.html` | Default HTML template |
| `lib/presets/default/template.css` | Default CSS template |
| `lib/presets/preact/rollup.config.js` | Preact createConfig |
| `lib/presets/preact/tsconfig.json` | Preact TS settings |
| `lib/presets/preact/template.html` | Preact HTML template |
| `lib/presets/preact/template.css` | Preact CSS template |
| `lib/presets/functron/rollup.config.js` | Functron createConfig |
| `lib/presets/functron/tsconfig.json` | Functron TS settings |
| `lib/presets/commonjs/rollup.config.js` | CommonJS createConfig |

## Files to Modify

| File | Changes |
|------|---------|
| `lib/package.json` | Add preset exports, update files array |
| `tools/src/clone/clone.ts` | Read preset, generate minimal config |
| `sketches/*/package.json` | Add `sketchPreset`, `@dim882/sketchlib` (all 36) |
| `sketches/*/tsconfig.json` | Extend preset tsconfig (35, not color-picker) |
| `sketches/*/rollup.config.js` | Replace with 2-line import (35 sketches, color-picker keeps custom) |

---

## Verification

- [ ] `pnpm dev` serves all sketches correctly
- [ ] `pnpm build` builds all sketches without errors
- [ ] `pnpm clone base test-new` creates sketch with correct preset
- [ ] Sketches with custom HTML/CSS still work (pass options to createConfig)
- [ ] Each preset type builds correctly:
  - default: `metaballs`
  - preact: `preact-base`
  - functron: `functron-demo` (verify CSS modules work)
  - commonjs: `flowfield`
  - custom: `color-picker` (unchanged)
- [ ] `npm pack` in lib/ includes presets directory
