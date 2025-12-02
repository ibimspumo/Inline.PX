# PixelCreator - Compact Pixel Art Editor

A professional, desktop-style pixel art editor with ultra-compact text-based storage format. Perfect as a foundation for game engines that need to manipulate individual pixels.

## Features

### Core Features
- **Ultra-Compact Storage Format**: Text-based format `WxH:PIXELS`
- **10 Colors**: 0=Transparent, 1-9=Predefined colors
- **Live Export Preview**: Real-time display of export string
- **LocalStorage**: Save and load projects directly in your browser
- **Import/Export**: Export as text string or .txt file

### Professional UI
- **Desktop Application Feel**: Modern dark theme with sidebar navigation
- **Visual Size Editor**: Quick presets (8×8, 16×16, 32×32, 64×64) and custom sizes
- **Live Preview**: See export string update in real-time as you draw
- **Responsive Design**: Works on desktop and mobile devices
- **Touch Support**: Full touch interaction for mobile devices

### Technical Features
- **Modular Architecture**: Clean separation of concerns for easy extension
- **No Dependencies**: Pure vanilla JavaScript, HTML, and CSS
- **LocalStorage Management**: Efficient browser-based file system

## Storage Format

The storage format is extremely compact:

```
WxH:PIXELDATA
```

### Examples

8×8 canvas (64 characters):
```
8x8:0000000001111110022222000333330000444400000055000000006000000070
```

16×16 canvas (256 characters):
```
16x16:0000000000000000011111111111110002222222222222000333333333333300...
```

### Color Codes
- `0` = Transparent
- `1` = Black (#000000)
- `2` = White (#FFFFFF)
- `3` = Red (#FF0000)
- `4` = Green (#00FF00)
- `5` = Blue (#0000FF)
- `6` = Yellow (#FFFF00)
- `7` = Magenta (#FF00FF)
- `8` = Cyan (#00FFFF)
- `9` = Orange (#FFA500)

## User Interface

### Sidebar
- **File Operations**: New, Save, Load
- **Import/Export**: Export file, Import text
- **Canvas Size**: Quick presets and custom dimensions
- **Actions**: Clear canvas

### Main Area
- **Top Bar**: Current canvas info (size, pixels, current color)
- **Color Palette**: Visual color selection with codes
- **Canvas**: Interactive drawing area with grid
- **Live Export Preview**: Real-time export string display with copy button

## File Structure

```
pixelcreator/
├── index.html              # Main HTML structure
├── style.css               # Desktop-style responsive CSS
├── js/
│   ├── colorPalette.js    # Color management module
│   ├── canvas.js          # Canvas drawing and pixel grid module
│   ├── fileManager.js     # LocalStorage and import/export module
│   └── app.js             # Main application controller
└── README.md              # This file
```

## Module Documentation

### ColorPalette Module (`js/colorPalette.js`)

Manages the color palette and color selection.

**Key Functions:**
```javascript
ColorPalette.init(containerId, onColorChange)
ColorPalette.selectColor(code)
ColorPalette.getCurrentColorCode()
ColorPalette.getColor(code)
ColorPalette.codeToRGBA(code)
```

### PixelCanvas Module (`js/canvas.js`)

Handles the pixel art canvas, drawing, and pixel grid.

**Key Functions:**
```javascript
PixelCanvas.init(canvasId, width, height, onChangeCallback)
PixelCanvas.clear()
PixelCanvas.resize(newWidth, newHeight)
PixelCanvas.exportToString()
PixelCanvas.importFromString(str)
PixelCanvas.getPixelData()
PixelCanvas.getDimensions()
```

**New Feature**: Pass an `onChangeCallback` function to get real-time updates when the canvas changes (used for live preview).

### FileManager Module (`js/fileManager.js`)

Manages file operations including LocalStorage, import, and export.

**Key Functions:**
```javascript
FileManager.save(dataString, name)
FileManager.load(id)
FileManager.getAllFiles()
FileManager.deleteFile(id)
FileManager.exportAsFile(dataString, filename)
FileManager.showLoadDialog(onSelectCallback)
```

### App Module (`js/app.js`)

Main application controller that coordinates all modules.

**Key Functions:**
```javascript
App.init()
App.updateLiveExportPreview()
```

## Usage

### Basic Workflow

1. **Select Canvas Size**: Use presets (8×8, 16×16, etc.) or enter custom dimensions
2. **Choose Color**: Click a color from the palette (0-9)
3. **Draw**: Click or drag on the canvas to draw pixels
4. **Live Preview**: Watch the export string update in real-time
5. **Save**: Click "Save" to store in browser LocalStorage
6. **Export**: Use "Export File" to download as .txt file

### Keyboard Shortcuts

- **Enter** (in size inputs): Apply canvas resize

### Mobile Usage

- Touch and drag to draw
- Pinch controls disabled for stable drawing
- Sidebar collapses on mobile for more canvas space

## Integration with Game Engines

The compact text format makes it perfect for game engines:

```javascript
// Example: Parse pixel art string
const pixelArtData = "8x8:0000000001111110022222000333330000444400000055000000006000000070";

// Parse format
const [dimensions, pixels] = pixelArtData.split(':');
const [width, height] = dimensions.split('x').map(Number);

// Read each pixel
for (let i = 0; i < pixels.length; i++) {
    const colorCode = parseInt(pixels[i]);
    const x = i % width;
    const y = Math.floor(i / width);

    // Get actual color
    const color = ColorPalette.getColor(colorCode);

    // Render in game engine
    renderPixel(x, y, color);
}
```

### Example: Create Sprite Sheet

```javascript
// Store multiple sprites compactly
const sprites = {
    player: "8x8:0011110001222210012222100122221001111110000110000001111000011110",
    enemy: "8x8:0033330003344330033443300334433003333330003003000030030003300330",
    coin: "8x8:0000000000066000006666000666660006666600006666000006660000000000"
};

// Load sprite
function loadSprite(name) {
    return PixelCanvas.importFromString(sprites[name]);
}
```

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Mobile Browsers**: Full support with touch events

## Storage Limitations

- **LocalStorage**: Typically 5-10MB per domain
- **File Size**: 64×64 canvas ≈ 4KB with metadata
- **Capacity**: Thousands of pixel arts can be stored

## Future Extensions

The modular architecture allows easy extensions:

1. **More Colors**: Extend color palette beyond 0-9 (use A-Z for more colors)
2. **Animation**: Store multiple frames as array
3. **Layers**: Add layer management for complex artwork
4. **Undo/Redo**: Implement history stack
5. **Drawing Tools**: Line, rectangle, circle, fill tools
6. **Zoom**: Add zoom controls for detailed work
7. **Color Picker**: Custom color selection
8. **Export Formats**: PNG export, sprite sheet generation

## Performance

- **Rendering**: Optimized canvas rendering with requestAnimationFrame
- **Storage**: Minimal memory footprint (1 byte per pixel)
- **UI**: Hardware-accelerated CSS animations
- **Touch**: Optimized touch event handling

## Tips

### Efficient Workflow
1. Use size presets for common canvas sizes
2. Use the live preview to verify your export string
3. Save frequently to LocalStorage
4. Use custom sizes for non-square sprites (8×16, 16×24, etc.)

### Game Engine Integration
1. Store sprites as constant strings in your code
2. Parse format once at initialization
3. Cache parsed pixel data for performance
4. Use color codes as lookup table for your game's palette

## License

Free to use and modify for any purpose.

## Contributing

The modular architecture makes it easy to add new features without breaking existing functionality. Each module is self-contained with a clear public API.
