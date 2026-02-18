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

### HTML Template Inventory

**Generic-compatible (21 sketches)** — can use the preset's `template.html` with `{{SKETCH_NAME}}` interpolation:

| Sub-template | Sketches |
|-------------|----------|
| Canvas-only (no aside) | animation, arcs, flowfield, metaballs, my-sketch, particles, particles-oop, sinewaves, strange-attractor, waves-audio |
| Main/aside layout (empty aside) | axis, blob-grid, curves, grid-curves, grid-curves-2, grid1, grid2, sphere, square-transform, voronoi, whorley, xor1 |

> **Note:** The two sub-template variants above (canvas-only vs. main/aside) may warrant a single generic template with the main/aside layout, since an empty aside is harmless. Alternatively, `createConfig` could accept a `layout` option. Decide during Step 2.

**Custom HTML required (15 sketches)** — must pass `html` option to `createConfig`:

| Sketch | Reason |
|--------|--------|
| audio | CDN script (`@ircam/sc-components`), `<sc-waveform>`, `<audio>` element |
| base | `<button class="change-seed">` in aside |
| blob-grid-svg | SVG + `div#app` instead of canvas |
| blob-path | `<button class="change-seed">` in aside |
| boid-fuzz | Custom elements `<fps-display>`, `<params-ui>`, wrapper div |
| boids | Complex form with multiple inputs, status div |
| css-scope | Non-canvas; nested divs for CSS scoping demo |
| fuzz | CDN script, tabbed multi-canvas, `<sc-toggle>`, `<sc-color-picker>` |
| functron-demo | `<ui-counter>` custom element (not canvas-based) |
| live-audio | Custom elements `<sc-waveform>`, `<sc-transport>`, `<audio>` |
| palettes | `<sk-color-grid>` custom element (not canvas-based) |
| preact-base | `div#app` for Preact rendering |
| radiation | Tabbed multi-canvas layout with extensive inline styling |
| blob-grid-svg | `div#app` for Preact SVG rendering |
| color-picker | `div#app` (custom preset — keeps full rollup.config.js) |

### Lib Include Cleanup

12 sketches have dead `../../lib/**/*.ts` includes in their `rollup.config.js` typescript plugin config:
axis, base, curves, fuzz, grid-curves, grid-curves-2, grid1, grid2, sphere, square-transform, voronoi, whorley

The parent `sketches/tsconfig.json` also has `"include": ["../lib/**/*.ts"]`.

**None of these sketches actually import from lib** — the includes are dead config. Only `boid-fuzz` imports from `@dim882/sketchlib` (using the npm package name, which already works). These dead includes will be cleaned up as part of the migration.

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
│   │   ├── tsconfig.json       # Custom jsxFactory
│   │   ├── template.html       # Custom element placeholder
│   │   └── template.css
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
- Output format: `es` (ESM) for all presets
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

**Step 2: Create default preset**
- Files:
  - `lib/presets/default/rollup.config.js` - exports `createConfig(name, url, options?)`
  - `lib/presets/default/tsconfig.json` - extends base
  - `lib/presets/default/template.html` - with `{{SKETCH_NAME}}` placeholder (decide on canvas-only vs. main/aside)
  - `lib/presets/default/template.css` - minimal reset

**Step 3: Update lib/package.json exports**
```json
{
  "exports": {
    ...existing exports...
    "./presets/*": "./presets/*"
  },
  "files": ["dist", "presets"]
}
```

**Step 4: Create additional presets**
- `lib/presets/preact/` - babel + PostCSS (CSS modules) for preact, with template.html/css
- `lib/presets/functron/` - babel + PostCSS (CSS modules) with custom pragma, with template.html/css
- `lib/presets/commonjs/` - adds commonjs plugin (extends default)

**Step 5: Add sketchlib dependency to all sketches**
- Add `"@dim882/sketchlib": "link:../../lib"` to all 36 sketch package.json files

**Commit:** `feat(lib): add preset infrastructure with default, preact, functron, commonjs presets`

**Verify Phase A:**
- `npm pack` in lib/ includes presets directory
- Preset files are syntactically valid (import and inspect in a test script or manual check)

### Phase B: Migration (split by preset type)

**Step 6: Migrate default sketches (29 sketches)**
- Replace full rollup.config.js with 2-line import from default preset
- 15 sketches with custom HTML: pass `html` option to `createConfig`
- 14 sketches with generic HTML: use preset template (no `html` option)
- Remove dead `../../lib/**/*.ts` includes from the 12 sketches that have them
- Add `"sketchPreset": "default"` to each sketch's package.json
- Update tsconfig.json to extend preset's tsconfig
- Update parent `sketches/tsconfig.json` to remove `"include": ["../lib/**/*.ts"]`
- Remove `.babelrc` files that are no longer needed

**Commit:** `refactor: migrate default sketches to preset system`

**Verify:** Build and serve a representative default sketch (e.g., `metaballs`) to confirm it works.

**Step 7: Migrate preact sketches (2 sketches: preact-base, blob-grid-svg)**
- Replace rollup.config.js with 2-line import from preact preset
- Both need `html` option (preact-base has div#app, blob-grid-svg has SVG)
- Add `"sketchPreset": "preact"` to package.json
- Update tsconfig.json to extend preact preset's tsconfig
- Remove `.babelrc` files (babel config now in preset's rollup.config.js)

**Commit:** `refactor: migrate preact sketches to preset system`

**Verify:** Build and serve `preact-base` to confirm it works.

**Step 8: Migrate functron sketches (2 sketches: functron-demo, palettes)**
- Replace rollup.config.js with 2-line import from functron preset
- Both need `html` option (custom elements, not canvas-based)
- Add `"sketchPreset": "functron"` to package.json
- Update tsconfig.json to extend functron preset's tsconfig
- Adapt CSS for CSS modules if needed (`functron-demo`)

**Commit:** `refactor: migrate functron sketches to preset system`

**Verify:** Build and serve `functron-demo` to confirm JSX and CSS modules work.

**Step 9: Migrate commonjs sketches (2 sketches: flowfield, strange-attractor)**
- Replace rollup.config.js with 2-line import from commonjs preset
- Add `"sketchPreset": "commonjs"` to package.json
- Update tsconfig.json to extend preset's tsconfig

**Commit:** `refactor: migrate commonjs sketches to preset system`

**Verify:** Build and serve `flowfield` to confirm CommonJS deps resolve.

**Step 10: Full integration verification**
- `pnpm build` — all 36 sketches build without errors
- `pnpm dev` — spot-check sketches from each preset type

**Commit (if any fixups needed):** `fix: address migration issues found during verification`

### Phase C: Clone CLI Update

**Step 11: Update clone CLI**
- Read preset from source sketch's package.json `sketchPreset` field
- Generate minimal rollup.config.js importing from correct preset
- Copy custom HTML only if source has it (preset templates used otherwise)

**Commit:** `feat(tools): clone CLI generates preset-based sketches`

**Verify:** `pnpm clone base test-new` creates a working sketch with correct preset config.

### Phase D: Publish and Lock

**Step 12: Publish to npm**
- Bump version in `lib/package.json`

**Commit:** `chore(lib): bump version for preset system`

**Step 13: Lock sketch dependencies**
- Change `link:../../lib` to published version (e.g., `"^0.3.0"`) in all 36 sketch package.json files

**Commit:** `chore(sketches): lock sketchlib to published version`

---

## Design Decisions

1. **Output format: `es` (ESM)** — All presets output ES module format. The few sketches currently using `iife` will be normalized to `es`.

2. **functron and preact share structure, not templates** — Each has own template.html/css to allow preset-specific defaults. Both functron sketches have custom elements so will likely always use the `html` option.

3. **commonjs preset extends default** — Only adds the commonjs plugin, inherits everything else.

4. **PostCSS with CSS modules in JSX presets** — Both functron and preact presets include PostCSS with CSS modules by default:
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

5. **Babel config embedded in preset rollup.config.js** — No separate `.babelrc` files needed. Preact and functron presets embed their babel configuration directly in the rollup plugin chain.

6. **Dead lib includes cleaned up during migration** — The 12 sketches with `../../lib/**/*.ts` in their rollup configs and the parent `sketches/tsconfig.json` include are dead configuration (no actual imports). These are removed as part of the migration, not as a separate step.

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
| `lib/presets/functron/template.html` | Functron HTML template |
| `lib/presets/functron/template.css` | Functron CSS template |
| `lib/presets/commonjs/rollup.config.js` | CommonJS createConfig |

## Files to Modify

| File | Changes |
|------|---------|
| `lib/package.json` | Add preset exports, update files array |
| `tools/src/clone/clone.ts` | Read preset, generate minimal config |
| `sketches/*/package.json` | Add `sketchPreset`, `@dim882/sketchlib` (all 36) |
| `sketches/*/tsconfig.json` | Extend preset tsconfig (35, not color-picker) |
| `sketches/*/rollup.config.js` | Replace with 2-line import (35 sketches, color-picker keeps custom) |
| `sketches/tsconfig.json` | Remove dead `../lib/**/*.ts` include |

---

## Verification

- [ ] `pnpm dev` serves all sketches correctly
- [ ] `pnpm build` builds all sketches without errors
- [ ] `pnpm clone base test-new` creates sketch with correct preset
- [ ] Sketches with custom HTML/CSS still work (pass options to createConfig)
- [ ] Each preset type builds correctly:
  - default: `metaballs` (generic), `audio` (custom HTML)
  - preact: `preact-base`
  - functron: `functron-demo` (verify CSS modules work)
  - commonjs: `flowfield`
  - custom: `color-picker` (unchanged)
- [ ] `npm pack` in lib/ includes presets directory
