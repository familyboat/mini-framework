# Changelog

## 0.1.1 (2026-09-10)

### Added
- Added a factory-style `create()` lifecycle for `Route` and `Modal` to make initialization more predictable.
- Added stale-operation protection so older async operations do not overwrite newer UI state.
- Added shared template helpers: `html()` and `renderTemplate()`.
- Added `Toast` support with show/clear lifecycle management.
- Added interaction disabling helper based on inert behavior.
- Added directional slide animations and animation timing customization.
- Reorganized component examples into component-style folders with `index.ts`, `index.html`, and `index.css`.

### Changed
- Refactored route and modal lifecycle handling to avoid calling subclass render logic too early.
- Updated documentation to describe CSS naming conventions, component structure, and template authoring guidance.
- Updated package metadata for npm publishing, including scoped package name, exports, files, peer dependency on Vite, and publish configuration.
- Removed stale `jsr` metadata from package keywords after switching publishing target to npm.
- Bumped package version from `0.1.0` to `0.1.1` before re-publishing.

### Fixed
- Fixed the `this._content` lifecycle issue caused by base initialization running before subclass state was ready.
- Fixed stale async route/modal operations overriding newer state.
- Fixed publish metadata mismatch by removing leftover JSR references.

### Publishing
- Verified package readiness with `npm run publish:check`.
- Verified tarball contents with `npm pack --dry-run`.
- Published successfully to npm with `npm publish --access public --registry https://registry.npmjs.org/`.

### Notes
- This workspace currently does not contain a Git repository (`.git` directory is missing), so there is no actual Git history to rewrite or reorder here.
- The changelog above is a curated summary of the work completed during this session.

## 0.1.2 (2026-09-11)

### Changed
- Split animation naming exports into `EnterAnimationName` and `LeaveAnimationName` with separate `EnterAnimationNameMap` / `LeaveAnimationNameMap` extension points, and removed the generic `AnimationName` alias from the public API.
- Updated the library README to document how custom animation names should match CSS class names and how to extend animation types via declaration merging.
- Re-exported the new animation type maps from the package entry so the public API reflects the new extension model.
