# mini-framework

A lightweight DOM framework with route, modal, animation, interaction, and toast utilities.

## Features

- Route-based navigation with lifecycle hooks
- Modal lifecycle management
- CSS animation helpers
- Interaction control via `inert`
- Toast notifications
- HTML template files with variable injection via `renderTemplate()`

## Installation

For local development in this workspace:

```bash
npm install
```

This package depends on Vite as a peer dependency, so the consuming project should install Vite in its own dependencies.

## Publish to npm

Before publishing, make sure you are logged in to npm:

```bash
npm login
```

Then publish with:

```bash
npm publish --access public
```

You can also run a dry run first:

```bash
npm run publish:check
```

The library source is exposed through the exported entrypoint in `lib/index.ts`.

## Usage

```ts
import {
  Toast,
  Router,
  Modal,
  fadeIn,
  renderTemplate,
} from "@familyboat/mini-framework";
```

## Package structure

```text
lib/
  animate/
  interaction/
  modal/
  router/
  toast/
  index.ts
  README.md
```

## Documentation

See [lib/README.md](lib/README.md) for the detailed usage guide, lifecycle rules, CSS naming conventions, and component directory structure.
