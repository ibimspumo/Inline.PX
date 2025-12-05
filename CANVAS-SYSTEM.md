# Canvas System - inline.px

## Architektur-Übersicht

Das Canvas-System ist zukunftssicher mit modularer Architektur für Layer, Effekte, Auswahl-Tools und mehr aufgebaut.

```
┌─────────────────────────────────────────┐
│          User Interaction               │
│         (PixelGrid.svelte)              │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│          Canvas Store                   │
│      (State Management)                 │
│   - Layers                              │
│   - Active Layer                        │
│   - Zoom/Pan                            │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│        Render Pipeline                  │
│    (CanvasRenderer)                     │
│   - Layer Compositing                   │
│   - Grid Rendering                      │
│   - Pixel Borders                       │
│   - Effects (future)                    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│       HTML Canvas Element               │
└─────────────────────────────────────────┘
```

## Komponenten

### 1. Canvas Store (`canvasStore.svelte.ts`)

**State Management mit Svelte 5 Runes**

Zentraler Store für den gesamten Canvas-State:

```typescript
const canvasStore = {
  // State
  width: 8,
  height: 8,
  layers: Layer[],
  activeLayerId: string,
  zoom: 1.0,
  panX: 0,
  panY: 0,

  // Actions
  setPixel(x, y, colorIndex),
  getPixel(x, y, layerId?),
  clearCanvas(),
  resizeCanvas(width, height),
  addLayer(name),
  removeLayer(layerId),
  toggleLayerVisibility(layerId),
  setActiveLayer(layerId),
  setZoom(zoom),
  setPan(x, y),
  getFlattenedPixels()
}
```

**Features:**
- ✅ Multi-Layer Support
- ✅ Layer Visibility Toggle
- ✅ Layer Lock (future)
- ✅ Zoom & Pan
- ✅ Reaktives State Management
- ✅ Layer Compositing

### 2. Render Pipeline (`renderPipeline.ts`)

**Professionelles Rendering-System**

Die `CanvasRenderer` Klasse kümmert sich um alle Rendering-Aspekte:

```typescript
const renderer = new CanvasRenderer(canvas, {
  pixelSize: 32,
  showGrid: true,
  showPixelBorders: true,
  backgroundColor: '#2a2a2a',
  gridColor: 'rgba(255, 255, 255, 0.1)',
  pixelBorderColor: 'rgba(0, 0, 0, 0.2)'
});

renderer.render(width, height, layers);
```

**Rendering-Pipeline:**

1. **Checkerboard Background** - Transparenz-Hintergrund
2. **Layer Compositing** - Bottom-to-Top Layer-Rendering
3. **Grid Rendering** - Optional Grid-Linien
4. **Pixel Borders** - Optional Pixel-Umrandungen
5. **Effects** (future) - Layer-Effekte, Schatten, etc.

**Optimierungen:**
- Request Animation Frame für Performance
- Dirty-Checking (nur neu zeichnen wenn nötig)
- Image Smoothing disabled für crisp pixels
- Canvas Context Optimization

### 3. PixelGrid Component (`PixelGrid.svelte`)

**Interaktive Molecule-Komponente**

Verbindet User-Input mit Store und Renderer:

```svelte
<PixelGrid />
```

**Features:**
- ✅ Mouse Drawing (Linke Maustaste = Primary Color)
- ✅ Right-Click Drawing (Secondary Color)
- ✅ Drag Drawing
- ✅ Pixelgenaue Koordinaten-Erkennung
- ✅ Reaktives Rendering bei Store-Änderungen

**Event Handling:**
- `mousedown` - Start Drawing
- `mousemove` - Continue Drawing (wenn isDrawing)
- `mouseup` - Stop Drawing
- `mouseleave` - Stop Drawing
- `contextmenu` - Prevent default (Rechtsklick-Menü)

### 4. Color Store (`colorStore.svelte.ts`)

**Farbauswahl-Management**

```typescript
const colorStore = {
  primaryColorIndex: 1,    // Black
  secondaryColorIndex: 2,  // White

  setPrimaryColor(index),
  setSecondaryColor(index),
  swapColors()
}
```

## Layer System

### Layer Structure

```typescript
interface Layer {
  id: string;              // Eindeutige ID
  name: string;            // Layer-Name
  visible: boolean;        // Sichtbarkeit
  opacity: number;         // 0.0 - 1.0
  pixels: number[][];      // 2D Array von Farbindizes
  locked: boolean;         // Lock-Status
}
```

### Layer Operations

**Layer hinzufügen:**
```typescript
canvasStore.addLayer('New Layer');
```

**Layer entfernen:**
```typescript
canvasStore.removeLayer(layerId);
```

**Layer-Sichtbarkeit:**
```typescript
canvasStore.toggleLayerVisibility(layerId);
```

**Aktiven Layer setzen:**
```typescript
canvasStore.setActiveLayer(layerId);
```

### Layer Compositing

Die Render-Pipeline composited alle sichtbaren Layer von unten nach oben:

```
Background Layer (bottom)
    ↓
Layer 1
    ↓
Layer 2
    ↓
Layer 3 (top)
    ↓
Final Image
```

Transparente Pixels (index 0) werden übersprungen.

## Zukunftssichere Erweiterungen

Das System ist für folgende Features vorbereitet:

### ✅ Implementiert

- [x] Multi-Layer Support
- [x] Layer Visibility
- [x] Color Index System
- [x] Reaktives Rendering
- [x] Mouse Drawing
- [x] Grid Rendering

### 🚧 Vorbereitet (Ready to Implement)

- [ ] **Selection Tools** - Rechteck/Lasso-Auswahl
- [ ] **Transform Tools** - Move, Rotate, Scale
- [ ] **Layer Effects** - Shadows, Glow, etc.
- [ ] **Blending Modes** - Normal, Multiply, Overlay, etc.
- [ ] **Opacity per Layer** - Transparenz-Control
- [ ] **Layer Lock** - Verhindert Änderungen
- [ ] **Undo/Redo** - History System
- [ ] **Zoom & Pan** - Viewport-Control
- [ ] **Keyboard Shortcuts** - Hotkeys
- [ ] **Copy/Paste** - Layer/Selection kopieren

### Wie Erweiterungen funktionieren:

**Selection System:**
```typescript
// In canvasStore.svelte.ts
let selection = $state<Selection | null>(null);

interface Selection {
  x: number;
  y: number;
  width: number;
  height: number;
}

// In renderPipeline.ts
renderer.drawSelection(selection); // Overlay
```

**Layer Effects:**
```typescript
interface Layer {
  effects: LayerEffect[];
}

interface LayerEffect {
  type: 'shadow' | 'glow' | 'outline';
  color: string;
  size: number;
  enabled: boolean;
}

// In renderPipeline.ts
private applyLayerEffects(layer: Layer) {
  for (const effect of layer.effects) {
    if (!effect.enabled) continue;
    this.renderEffect(effect);
  }
}
```

**Undo/Redo:**
```typescript
// In canvasStore.svelte.ts
let history = $state<CanvasHistory>({
  past: [],
  present: currentState,
  future: []
});

function undo() {
  if (history.past.length === 0) return;
  // Restore previous state
}
```

## Performance-Optimierungen

### Dirty-Checking

```typescript
private needsRedraw = true;

requestRedraw() {
  this.needsRedraw = true;
}

render(...) {
  if (!this.needsRedraw) return;
  // ... render
  this.needsRedraw = false;
}
```

### Reaktives Rendering

```typescript
// In PixelGrid.svelte
$effect(() => {
  const { width, height, layers } = canvasStore;
  renderer.requestRedraw();
  renderer.render(width, height, layers);
});
```

Ändert sich der Store, wird automatisch neu gerendert.

### Canvas Optimizations

```typescript
const ctx = canvas.getContext('2d', {
  alpha: true,
  willReadFrequently: false  // Performance hint
});

ctx.imageSmoothingEnabled = false;  // Crisp pixels
```

## Verwendung

### Basis-Canvas erstellen

```typescript
import { canvasStore } from '$lib/stores/canvasStore.svelte';

// 8x8 Canvas ist Default
// Mit Farbe zeichnen
canvasStore.setPixel(0, 0, 1); // Black pixel at (0,0)
```

### Canvas resizen

```typescript
canvasStore.resizeCanvas(16, 16); // Auf 16x16 vergrößern
```

### Neuen Layer hinzufügen

```typescript
canvasStore.addLayer('Details');
```

### Farbe auswählen

```typescript
import { colorStore } from '$lib/stores/colorStore.svelte';

colorStore.setPrimaryColor(12); // Rot
```

## Zusammenfassung

✅ **Modular** - Getrennte Stores, Renderer, Komponenten
✅ **Reaktiv** - Svelte 5 Runes für automatische Updates
✅ **Performant** - Dirty-Checking, RAF, Optimierungen
✅ **Zukunftssicher** - Vorbereitet für Layer-Effekte, Selection, etc.
✅ **Type-Safe** - Vollständig typisiert mit TypeScript
✅ **Layer-System** - Multi-Layer mit Visibility Control
✅ **Professional** - Render-Pipeline wie in Photoshop/GIMP

Das Canvas-System ist jetzt vollständig funktionsfähig und bereit für alle zukünftigen Features! 🎨
