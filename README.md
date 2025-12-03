# Inline.px - Ultra-Compact Pixel Art Editor

**Inline.px** is a lightweight, browser-based pixel art editor. It's designed to be fast, easy to use, and entirely client-side, making it perfect for quick sprites and pixel art creation without any server-side dependencies.

This project has been recently refactored to use a modern JavaScript toolchain for better maintainability and performance.

## Features

-   **Modern UI:** A clean and responsive user interface for a smooth editing experience.
-   **Core Tools:** Includes all the essential pixel art tools: Pencil, Brush, Eraser, Line, Rectangle, Ellipse, Fill, and more.
-   **Selection:** Rectangular selection, magic wand, and content moving capabilities.
-   **Color Palette:** A default 64-color palette for convenience.
-   **LocalStorage:** Save and load your projects directly in the browser.
-   **Export:** Export your creations as `.txt` or `.png` files.
-   **Standalone:** The final build is a single HTML file that runs anywhere, even offline.

## Project Structure

The project is built using **Vite** and modern ES modules.

-   `js/`: Contains all JavaScript source code, organized into sub-modules (`core`, `canvas`, `tools`, etc.).
    -   `js/main.js`: The main application entry point.
-   `css/`: Contains the modular CSS files.
-   `index.html`: The main HTML file used for development.
-   `docs/`: The build output directory. **The final, distributable application is `docs/index.html`**.
-   `vite.config.js`: Vite configuration file.
-   `package.json`: Project dependencies and scripts.

## Development

To set up the project for development, you need to have [Node.js](https://nodejs.org/) installed.

1.  **Install Dependencies:**
    Open a terminal in the project root and run:
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    To start the Vite development server with hot-reloading, run:
    ```bash
    npm run dev
    ```
    This will open the application in your browser, and any changes you make to the code will be reflected instantly.

## Building for Production

To create the final, single-file application, run the build command:

```bash
npm run build
```

This command will bundle all necessary JavaScript and CSS into a single, self-contained `index.html` file located in the `docs/` directory.

**To use the application, simply open `docs/index.html` in your web browser.**

---
*This project was refactored and is maintained by an AI assistant.*