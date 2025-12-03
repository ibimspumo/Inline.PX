# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Inline.px is a browser-based pixel art editor that generates ultra-compact text strings using Base64 encoding. It consists of:
1. **Editor Application** (`index.html` + all source files) - Professional pixel art creation tool
2. **Standalone Library** (`inline-px.js`) - Drop-in Web Component for rendering pixel art anywhere

**Version 3.0** features a complete architectural refactoring to use a modern toolchain (Vite) and ES modules. This simplifies development, improves performance, and makes the project much easier to maintain.

## Development Setup

The project now uses **Vite** as a build tool and development server.

⚠️ **IMPORTANT:** You must have [Node.js](https://nodejs.org/) installed to work on this project.

1.  **Install Dependencies:**
    From the project root, run:
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    To start the dev server with hot-reloading:
    ```bash
    npm run dev
    ```
    This will open the application at `http://localhost:5173` (or another port if 5173 is in use).

## Core Architecture

### Data Format Specification

**Critical: This is the heart of the project and remains unchanged.**

Pixel art is stored as text strings in two formats:

#### Standard Format
`WxH:DATA`
- `W` = Width (2-128 pixels)
- `H` = Height (2-128 pixels)
- `DATA` = Exactly W×H Base64 characters (0-9, A-Z, a-z, +, /)

#### RLE Compressed Format
`WxH:RLE:COMPRESSED_DATA`
- Fixed 2-digit COUNT + 1 CHAR format (exactly 3 bytes per run).
- See `js/compression.js` for implementation details.

### Module System

The project now uses **ES Modules**. The old IIFE pattern has been completely removed.

-   **Entry Point:** The main application entry point is `js/main.js`.
-   **Dependencies:** All dependencies are handled via `import` and `export` statements. Vite's build process resolves these and bundles them.
-   **No More Load Order Issues:** We no longer need to worry about the order of `<script>` tags in `index.html`. Vite figures out the dependency graph automatically.

### Build Process

-   **Development:** `npm run dev` starts a fast development server with hot module replacement (HMR).
-   **Production:** `npm run build` bundles the entire application.
    -   **Output:** The build output is placed in the `docs/` directory.
    -   **Single File:** Thanks to the `vite-plugin-singlefile` plugin, the build process generates a **single, self-contained `docs/index.html` file**. This file has all the necessary JavaScript and CSS inlined, allowing it to run from any local filesystem (`file://`) without needing a web server and without CORS issues.

## Key Module Responsibilities

The responsibilities of the modules (`ColorPalette`, `ToolRegistry`, `PixelCanvas`, etc.) remain the same as described in the previous architecture, but they now communicate via ES module imports/exports instead of global `window` objects.

## Important Implementation Details

### When Adding New Tools or Modules

1.  Create your new file (e.g., `js/tools/implementations/NewTool.js`).
2.  Make sure it exports its class or functions (`export default NewTool;`).
3.  Import it in the file where it's needed (e.g., import `NewTool` in `js/main.js`).
4.  Add the new tool to the `toolClasses` array in `js/main.js` to register it.

### Common Pitfalls (Updated)

1.  **RLE Parsing:** Still critical. Don't change the fixed 2-digit format.
2.  **Forgetting Imports:** If you get an "undefined" error, you most likely forgot to `import` the module you're trying to use.
3.  **Running without Dev Server:** While the *built* `docs/index.html` file can be opened directly, the *source* `index.html` in the root directory **must** be run through the Vite dev server (`npm run dev`) to work correctly.

## File Organization (v3.0 - Vite)

```
inline.px/
├── docs/                 # Build output for GitHub Pages
│   └── index.html        # Final, single-file, standalone application
├── index.html            # Development entry point (used by Vite)
├── inline-px.js          # Standalone library (Web Component)
├── example.html          # Integration examples
├── vite.config.js        # Vite build configuration
├── package.json          # Project dependencies and scripts
├── style.css             # CSS module loader
│
├── config/               # Configuration (now imported as ES modules)
│   ├── colors.js
│   └── constants.js
│
├── js/                   # ES Module source code
│   ├── core/
│   ├── utils/
│   ├── tools/
│   │   ├── implementations/
│   ├── canvas/
│   └── main.js           # NEW: Main application entry point
│
└── css/                  # Modular stylesheets
```