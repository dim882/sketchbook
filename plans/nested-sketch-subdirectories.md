# Plan: Nested Subdirectories for Sketches

## Setup
- Create new branch: `git checkout -b feat/nested-sketches`

## Final State

Sketches can be organized in nested subdirectories:
```
sketches/
  experiments/
    cool-thing/        # Sketch at path "experiments/cool-thing"
      src/
      dist/
      rollup.config.js
  base/                # Existing flat sketch at path "base"
    src/
    dist/
    rollup.config.js
```

- **Sketch identification**: Directory containing `rollup.config.js`
- **URLs**: `/sketches/experiments/cool-thing` (wildcard routing)
- **UI**: Collapsible tree view with folders and sketches
- **Backwards compatible**: Existing flat sketches work unchanged

---

## Implementation Phases

### Phase 1: Data Model & Recursive Discovery
**Files to modify:**
- [types.ts](tools/src/lib/types.ts) - Add `path` and `isSketch` to `IDir`; add `IDirTreeNode` interface
- [build.utils.ts](tools/src/build/build.utils.ts) - Add `getAllSketchDirectoriesRecursive()` function
- [main.ts](tools/src/server/routes/main.ts) - Update `getSketchDirsData()` for recursive discovery

**Changes:**
```typescript
// types.ts
export interface IDir {
  name: string;           // Display name (last segment)
  path: string;           // Full relative path from sketches/
  lastModified: number;
  isSketch: boolean;      // true if contains rollup.config.js
}

export interface IDirTreeNode extends IDir {
  children?: IDirTreeNode[];
}
```

**Verification:** Run `pnpm --filter tools test` and manually verify server returns nested structure

**Commit:** "feat: add recursive sketch discovery with path support"

---

### Phase 2: Server Route Changes
**Files to modify:**
- [server.middleware.ts](tools/src/server/server.middleware.ts) - Allow slashes, validate path segments
- [server.ts](tools/src/server/server.ts) - Change `:sketchName` to wildcard `*` routes
- [server.paths.ts](tools/src/server/server.paths.ts) - Handle nested paths in `createSketchPaths()`

**Key changes:**
```typescript
// server.middleware.ts - allow slashes, block ".." and backslash
if (name.includes('..') || name.includes('\\')) {
  return Result.Error('Invalid sketch path: path traversal not allowed');
}
// Validate each segment
const segments = name.split('/');
for (const segment of segments) {
  if (!/^[a-zA-Z0-9_-]+$/.test(segment)) {
    return Result.Error('Invalid path segment');
  }
}

// server.ts - wildcard routes
app.get('/nav/*', Middleware.requireValidSketchName, Main.route);
app.get('/sketches/*', Middleware.requireValidSketchName, Sketches.htmlRoute);
```

**Verification:** `curl http://localhost:2000/sketches/experiments/cool-thing`

**Commit:** "feat: server routes support nested sketch paths"

---

### Phase 3: UI Tree View
**Files to modify:**
- [SketchList.tsx](tools/src/ui/SketchList.tsx) - Build tree from flat array, add collapsible folders
- [SketchList.module.css](tools/src/ui/SketchList.module.css) - Add folder/tree styles
- [NavUtils.ts](tools/src/ui/NavUtils.ts) - Handle nested paths in navigation

**Key changes:**
- `buildTree(dirs: IDir[]): IDirTreeNode[]` - transforms flat list to tree
- `TreeNode` component - recursive rendering with expand/collapse state
- Folder toggle button with `▼`/`▶` indicators
- Indentation based on depth
- **Sort order**: Folders first, then sketches (at each level)

**Verification:** Visual testing in browser - expand/collapse folders, navigate to nested sketches

**Commit:** "feat: UI renders collapsible folder hierarchy"

---

### Phase 4: Clone Support
**Files to modify:**
- [clone.utils.ts](tools/src/clone/clone.utils.ts) - Support slash-separated paths in source/target

**Key changes:**
```typescript
// validateDirectories - handle nested paths
const sourceDir = path.join(sketchesDir, ...sourceName.split('/'));
const targetDir = path.join(sketchesDir, ...targetName.split('/'));

// Create parent directories for nested target
const targetParent = path.dirname(targetDir);
if (!fs.existsSync(targetParent)) {
  fs.mkdirSync(targetParent, { recursive: true });
}
```

**Verification:** `pnpm clone base experiments/new-sketch`

**Commit:** "feat: clone supports nested sketch paths"

---

### Phase 5: Build Integration
**Files to modify:**
- [build.ts](tools/src/build/build.ts) - Use recursive discovery

**Verification:**
1. Create nested test sketch: `mkdir -p sketches/test/nested && cp -r sketches/base/* sketches/test/nested/`
2. Run `pnpm --filter tools build`
3. Verify nested sketch is built

**Commit:** "feat: build discovers nested sketches recursively"

---

## Testing Checklist

- [ ] Existing flat sketches continue to work
- [ ] Nested sketches are discovered and listed
- [ ] UI shows folder hierarchy with expand/collapse
- [ ] Clicking nested sketch loads it in iframe
- [ ] External link (↗) opens nested sketch in new tab
- [ ] Clone to nested path works
- [ ] Clone from nested path works
- [ ] Build discovers all nested sketches
- [ ] Watch detects changes in nested sketches (should already work - uses depth: 99)

---

## Critical Files Summary

| File | Change |
|------|--------|
| `tools/src/lib/types.ts` | Add `path`, `isSketch`, `IDirTreeNode` |
| `tools/src/build/build.utils.ts` | Add recursive discovery |
| `tools/src/server/routes/main.ts` | Recursive `getSketchDirsData()` |
| `tools/src/server/server.middleware.ts` | Allow slashes in validation |
| `tools/src/server/server.ts` | Wildcard routes |
| `tools/src/server/server.paths.ts` | Handle nested paths |
| `tools/src/ui/SketchList.tsx` | Tree view with collapse |
| `tools/src/clone/clone.utils.ts` | Nested path support |
