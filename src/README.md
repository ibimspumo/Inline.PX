# Inline.PX - Svelte 5 Source

This directory contains the Svelte 5 migration of Inline.PX.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173/

## Structure

```
src/
├── lib/
│   ├── components/     # Svelte components (Atomic Design)
│   ├── stores/         # Reactive state management
│   └── utils/          # Utility functions
├── App.svelte          # Main app component
├── main.js             # Entry point (Svelte 5 mount API)
└── app.css             # Global styles
```

## Key Files

- **`App.svelte`** - Main application shell with menu bar and info panel
- **`lib/stores/editor-simple.svelte.js`** - Reactive stores (canvas, tool, file state)
- **`lib/components/ui/atoms/MenuButton.svelte`** - Reusable button component

## Integration with Legacy Code

The Svelte app coexists with the original Vanilla JS code in `../js/`.
Canvas rendering logic (`PixelCanvas.js`) is preserved and will be integrated via wrapper components.

See `../SVELTE_MIGRATION.md` for full migration documentation.
