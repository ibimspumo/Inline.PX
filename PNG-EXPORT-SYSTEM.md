# PNG Export System

Vollständiges System zum Konvertieren von Base64-codierten Pixeldaten zu PNG-Bildern.

## Übersicht

Das PNG-Export-System ermöglicht es, inline.px Base64-Strings (`WIDTHxHEIGHT:BASE64DATA`) in verschiedene Formate zu konvertieren:

- **PNG-Dateien** - Download als Datei
- **Data URLs** - Für `<img src="..." />` Tags
- **Blobs** - Für Uploads/API-Calls
- **Canvas-Rendering** - Direkte Darstellung

## Module

### 1. `base64ToPng.ts` - Core Utility

Kern-Funktionen für Base64 → PNG Konvertierung.

#### Wichtigste Funktionen:

```typescript
// Base64-String parsen
parseBase64String(encoded: string): ParsedBase64Data

// Auf Canvas rendern
renderBase64ToCanvas(canvas: HTMLCanvasElement, encoded: string, config?: Partial<Base64ToPngConfig>): void

// Als Data URL
base64ToDataURL(encoded: string, config?: Partial<Base64ToPngConfig>): string

// Als Blob
base64ToBlob(encoded: string, config?: Partial<Base64ToPngConfig>): Promise<Blob | null>

// Download als PNG
downloadBase64AsPng(encoded: string, filename?: string, config?: Partial<Base64ToPngConfig>): Promise<void>

// Pixels → Base64
encodePixelsToBase64(width: number, height: number, pixels: number[][]): string
```

#### Configuration:

```typescript
interface Base64ToPngConfig {
  scale: number;                // Pixel-Größe (1 = 1px, 2 = 2px, etc.)
  showCheckerboard: boolean;    // Transparenz-Schachbrett
  backgroundColor?: string;     // Hintergrundfarbe
  pixelBorders?: boolean;       // Pixel-Umrandungen
  pixelBorderColor?: string;    // Umrandungsfarbe
}
```

#### Beispiele:

```typescript
import { base64ToDataURL, downloadBase64AsPng } from '$lib/utils/base64ToPng';

// 1. Als Data URL für <img> Tag
const dataURL = base64ToDataURL('8x8:AAABBBCCC...', { scale: 4 });
// Verwendung: <img src={dataURL} />

// 2. Download als PNG
await downloadBase64AsPng('8x8:AAABBBCCC...', 'my-pixel-art.png', {
  scale: 8,
  pixelBorders: true
});

// 3. Auf bestehendes Canvas rendern
const canvas = document.getElementById('myCanvas');
renderBase64ToCanvas(canvas, '8x8:AAABBBCCC...', { scale: 2 });
```

### 2. `pngExport.ts` - High-Level API

Integriert mit `canvasStore` und `Layer` für einfachen Export.

#### Layer Export:

```typescript
import { exportLayerToPng, getLayerAsDataURL } from '$lib/utils/pngExport';

// Layer als PNG downloaden
await exportLayerToPng(layer, width, height, 'layer-1.png', {
  scale: 4,
  showCheckerboard: false
});

// Layer als Data URL
const dataURL = getLayerAsDataURL(layer, width, height, { scale: 2 });
```

#### Composite Export (Alle Layer kombiniert):

```typescript
import { exportCompositeLayersToPng, getCompositeLayersAsDataURL } from '$lib/utils/pngExport';

// Alle Layer als PNG
await exportCompositeLayersToPng(layers, width, height, 'final.png', {
  scale: 8
});

// Alle Layer als Data URL
const dataURL = getCompositeLayersAsDataURL(layers, width, height);
```

#### Export Presets:

```typescript
import { ExportPresets } from '$lib/utils/pngExport';

// Original-Größe
await downloadBase64AsPng(base64, 'original.png', ExportPresets.ORIGINAL);

// 2x Upscale
await downloadBase64AsPng(base64, '2x.png', ExportPresets.UPSCALE_2X);

// 8x mit Borders
await downloadBase64AsPng(base64, '8x-bordered.png', ExportPresets.UPSCALE_8X_BORDERED);

// Mit weißem Hintergrund (für Druck)
await downloadBase64AsPng(base64, 'print.png', ExportPresets.WHITE_BACKGROUND);
```

**Verfügbare Presets:**
- `ORIGINAL` - 1:1 ohne Hintergrund
- `ORIGINAL_WITH_CHECKER` - 1:1 mit Schachbrett
- `UPSCALE_2X` - 2x Vergrößerung
- `UPSCALE_4X` - 4x Vergrößerung
- `UPSCALE_8X_BORDERED` - 8x mit Pixel-Borders
- `THUMBNAIL` - Klein mit Schachbrett
- `WHITE_BACKGROUND` - 4x mit weißem Hintergrund
- `BLACK_BACKGROUND` - 4x mit schwarzem Hintergrund

### 3. `Base64Image.svelte` - Komponente

Svelte-Komponente für einfache Darstellung von Base64-Strings.

#### Verwendung:

```svelte
<script>
  import Base64Image from '$lib/components/atoms/display/Base64Image.svelte';
</script>

<!-- Einfach -->
<Base64Image encoded="8x8:AAABBBCCC..." />

<!-- Mit Config -->
<Base64Image
  encoded="8x8:AAABBBCCC..."
  scale={4}
  showCheckerboard={false}
  backgroundColor="#ffffff"
  pixelBorders={true}
  alt="My pixel art"
  class="custom-class"
/>
```

#### Props:

```typescript
interface Props {
  encoded: string;              // Base64-String (required)
  scale?: number;               // Default: 1
  showCheckerboard?: boolean;   // Default: true
  backgroundColor?: string;     // Optional
  pixelBorders?: boolean;       // Default: false
  alt?: string;                 // Default: 'Pixel art'
  class?: string;               // Custom CSS class
}
```

## Use Cases

### 1. Layer-Thumbnails

```typescript
import { getLayerAsDataURL } from '$lib/utils/pngExport';

const thumbnailURL = getLayerAsDataURL(layer, width, height, {
  scale: 1,
  showCheckerboard: true
});
```

### 2. Projekt-Export

```typescript
import { exportCompositeLayersToPng, ExportPresets } from '$lib/utils/pngExport';

// Export für Social Media (4x upscale)
await exportCompositeLayersToPng(
  canvasStore.layers,
  canvasStore.width,
  canvasStore.height,
  'my-art-4x.png',
  ExportPresets.UPSCALE_4X
);
```

### 3. Preview in UI

```svelte
<script>
  import Base64Image from '$lib/components/atoms/display/Base64Image.svelte';
  import { encodePixelsToBase64 } from '$lib/utils/base64ToPng';

  const base64 = encodePixelsToBase64(width, height, pixels);
</script>

<Base64Image encoded={base64} scale={2} />
```

### 4. URL-basierte Darstellung (Future)

```typescript
// API-Endpoint: /api/render?data=8x8:AAABBBCCC&scale=4
import { renderBase64ToCanvas } from '$lib/utils/base64ToPng';

export async function GET({ url }) {
  const encoded = url.searchParams.get('data');
  const scale = parseInt(url.searchParams.get('scale') || '1');

  const canvas = createCanvas();
  renderBase64ToCanvas(canvas, encoded, { scale });

  return new Response(canvas.toBuffer(), {
    headers: { 'Content-Type': 'image/png' }
  });
}
```

### 5. Clipboard Copy

```typescript
import { base64ToBlob } from '$lib/utils/base64ToPng';

async function copyToClipboard(encoded: string) {
  const blob = await base64ToBlob(encoded, { scale: 4 });
  if (blob) {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
  }
}
```

## Performance-Hinweise

### Canvas Reuse

```typescript
// ❌ Nicht optimal (neue Canvas jedes Mal)
function render() {
  const canvas = document.createElement('canvas');
  renderBase64ToCanvas(canvas, encoded);
}

// ✅ Optimal (Canvas wiederverwenden)
const canvas = document.createElement('canvas');
function render() {
  renderBase64ToCanvas(canvas, encoded);
}
```

### Lazy Loading

```svelte
<script>
  import { onMount } from 'svelte';

  let dataURL = '';

  onMount(() => {
    // Nur rendern wenn Komponente gemountet ist
    dataURL = base64ToDataURL(encoded);
  });
</script>

{#if dataURL}
  <img src={dataURL} alt="Pixel art" />
{/if}
```

## Error Handling

```typescript
import { isValidBase64String, parseBase64String } from '$lib/utils/base64ToPng';

// Validierung
if (!isValidBase64String(encoded)) {
  console.error('Invalid Base64 format');
  return;
}

// Try-Catch
try {
  const { width, height, pixels } = parseBase64String(encoded);
  // ... verwenden
} catch (error) {
  console.error('Failed to parse Base64:', error);
}
```

## Integration mit bestehenden Systemen

### canvasStore Integration

```typescript
import { canvasStore } from '$lib/stores/canvasStore.svelte';
import { encodePixelsToBase64 } from '$lib/utils/base64ToPng';

// Gesamtes Canvas als Base64
const pixels = canvasStore.getFlattenedPixels();
const base64 = encodePixelsToBase64(
  canvasStore.width,
  canvasStore.height,
  pixels
);
```

### Layer System Integration

```typescript
// Einzelner Layer
const layerBase64 = encodePixelsToBase64(
  canvasStore.width,
  canvasStore.height,
  layer.pixels
);

// Export mit High-Level API
await exportLayerToPng(
  layer,
  canvasStore.width,
  canvasStore.height,
  'layer.png'
);
```

## Zukünftige Erweiterungen

### API-Endpoint (SvelteKit)

```typescript
// src/routes/api/render/+server.ts
import { renderBase64ToCanvas } from '$lib/utils/base64ToPng';

export async function GET({ url }) {
  const encoded = url.searchParams.get('data');
  const scale = parseInt(url.searchParams.get('scale') || '1');

  // Render to PNG buffer
  // Return as image/png response
}
```

### Batch Export

```typescript
export async function exportAllLayersAsPng(
  layers: Layer[],
  width: number,
  height: number,
  baseFilename: string
): Promise<void> {
  for (let i = 0; i < layers.length; i++) {
    await exportLayerToPng(
      layers[i],
      width,
      height,
      `${baseFilename}-layer-${i + 1}.png`
    );
  }
}
```

### Sprite Sheet Export

```typescript
export function exportAsSpriteSheet(
  frames: number[][][],
  frameWidth: number,
  frameHeight: number,
  columns: number
): Promise<void> {
  // Arrange frames in grid
  // Export as single PNG
}
```

## Zusammenfassung

Das PNG-Export-System ist vollständig modular und wiederverwendbar:

✅ **Standalone** - Keine Abhängigkeiten außer COLOR_PALETTE
✅ **Flexibel** - Viele Config-Optionen
✅ **Performant** - Canvas-Reuse möglich
✅ **Type-Safe** - Vollständig typisiert
✅ **Erweiterbar** - Einfach neue Features hinzufügen
✅ **Testbar** - Pure Functions

Kann verwendet werden für:
- Layer-Previews
- Projekt-Export
- Social Media Sharing
- API-Integration
- Clipboard-Copy
- Sprite Sheets (future)
