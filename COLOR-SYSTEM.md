# Color System - inline.px

## Übersicht

Das Farbsystem von inline.px basiert auf einem **64-Farben-Index**, der eine kompakte Base64-Kodierung ermöglicht.

## Farbpalette (64 Farben)

### Index-Mapping

Jede Farbe hat einen eindeutigen Index (0-63), der einem Base64-Zeichen entspricht:

```
Index 0-63 → Base64: A-Z, a-z, 0-9, +, /
```

### Farbkategorien

| Index | Kategorie | Beschreibung |
|-------|-----------|--------------|
| 0 | Transparent | Transparenz |
| 1 | Black | Schwarz |
| 2 | White | Weiß |
| 3-8 | Grays | 6 Graustufen |
| 9-14 | Reds | 6 Rottöne |
| 15-20 | Oranges | 6 Orangetöne |
| 21-26 | Yellows | 6 Gelbtöne |
| 27-32 | Greens | 6 Grüntöne |
| 33-38 | Cyans | 6 Cyan-Töne |
| 39-44 | Blues | 6 Blautöne |
| 45-50 | Purples | 6 Lilatöne |
| 51-56 | Magentas | 6 Magenta-Töne |
| 57-63 | Special | 7 spezielle Farben (Brown, Gold, Indigo, etc.) |

## Base64-Kodierung

### Format

```
WIDTHxHEIGHT:BASE64DATA
```

**Beispiele:**
- `8x8:AAAAAAAAAAAAAAAA...` (8×8 Pixel Canvas)
- `16x16:BBBBCCCCDDDD...` (16×16 Pixel Canvas)
- `32x32:ABCDEFGH...` (32×32 Pixel Canvas)

### Kodierung

Jedes Pixel wird durch seinen Farbindex repräsentiert, der in ein Base64-Zeichen umgewandelt wird:

```typescript
// Beispiel: Pixel mit Farbindex 1 (Schwarz)
indexToBase64(1) // → 'B'

// Beispiel: Pixel mit Farbindex 12 (Rot)
indexToBase64(12) // → 'M'

// Beispiel: Pixel mit Farbindex 0 (Transparent)
indexToBase64(0) // → 'A'
```

### Dekodierung

Ein Base64-Zeichen wird zurück in einen Farbindex konvertiert:

```typescript
// Beispiel: 'B' → Farbindex 1 (Schwarz)
base64ToIndex('B') // → 1

// Beispiel: 'M' → Farbindex 12 (Rot)
base64ToIndex('M') // → 12
```

## API-Funktionen

### `getColorByIndex(index: number)`

Gibt die Farbe für einen gegebenen Index zurück.

```typescript
const color = getColorByIndex(1);
// { index: 1, color: '#000000', name: 'Black' }
```

### `indexToBase64(index: number)`

Konvertiert einen Farbindex in ein Base64-Zeichen.

```typescript
const char = indexToBase64(12);
// 'M'
```

### `base64ToIndex(char: string)`

Konvertiert ein Base64-Zeichen in einen Farbindex.

```typescript
const index = base64ToIndex('M');
// 12
```

### `encodeCanvas(width, height, pixels)`

Kodiert Canvas-Daten in einen Base64-String.

```typescript
const pixels = [0, 1, 2, 1, 0, 1, 2, 1]; // 8 Pixel
const encoded = encodeCanvas(8, 1, pixels);
// "8x1:ABCBABCB"
```

### `decodeCanvas(encoded: string)`

Dekodiert einen Base64-String zurück in Canvas-Daten.

```typescript
const { width, height, pixels } = decodeCanvas("8x1:ABCBABCB");
// { width: 8, height: 1, pixels: [0, 1, 2, 1, 0, 1, 2, 1] }
```

## Komponenten

### ColorSwatch

Einzelne Farbkachel mit Index-Anzeige.

```svelte
<ColorSwatch
  color="#ff0000"
  index={12}
  active={true}
  onclick={(index) => console.log(index)}
  size="md"
/>
```

**Props:**
- `color`: Hex-Farbe oder 'transparent'
- `index`: Farbindex (0-63)
- `active`: Ist die Farbe aktiv?
- `onclick`: Callback beim Klick
- `size`: 'sm' | 'md' | 'lg'

### ColorPanel

Farbauswahl-Panel mit kompletter Palette.

```svelte
<ColorPanel />
```

**Features:**
- Anzeige von Primär- und Sekundärfarbe
- 64-Farben-Palette in 8×8 Grid
- Farbindex-Anzeige
- Farbnamen-Anzeige

## Vorteile des Systems

### ✅ Kompakte Speicherung

Ein 32×32 Pixel Canvas benötigt nur:
- **1024 Zeichen** im Base64-Format
- Im Vergleich zu PNG: **~50-80% kleiner**

### ✅ Feste Farbpalette

- Konsistente Farben über alle Projekte
- Keine Farbabweichungen
- Einfache Palette-Verwaltung

### ✅ Einfaches Copy/Paste

```
32x32:AAABBBCCCDDDEEE...
```

Kann direkt als Text kopiert und geteilt werden!

### ✅ Versionierung

Base64-Strings können einfach in Git versioniert werden.

## Beispiel-Workflow

### 1. Pixel zeichnen

```typescript
// Benutzer zeichnet mit Farbe Index 12 (Rot)
canvas.setPixel(x, y, 12);
```

### 2. Canvas speichern

```typescript
const pixels = canvas.getAllPixels(); // [0, 1, 12, 12, 1, ...]
const encoded = encodeCanvas(32, 32, pixels);
// "32x32:ABMMBBC..."

// Speichern oder teilen
localStorage.setItem('myPixelArt', encoded);
```

### 3. Canvas laden

```typescript
const encoded = localStorage.getItem('myPixelArt');
const { width, height, pixels } = decodeCanvas(encoded);

// Pixels zurück auf Canvas zeichnen
canvas.setAllPixels(width, height, pixels);
```

## Erweiterbarkeit

Das System ist auf 64 Farben limitiert, aber die Palette kann angepasst werden:

1. `src/lib/constants/colorPalette.ts` bearbeiten
2. Farben im `COLOR_PALETTE` Array ändern
3. System bleibt kompatibel, da Indizes gleich bleiben

## Zusammenfassung

- **64 Farben** mit festem Index (0-63)
- **Base64-Kodierung** für kompakte Speicherung
- **Format:** `WIDTHxHEIGHT:BASE64DATA`
- **Komponenten:** ColorSwatch & ColorPanel
- **Perfekt für Pixel Art** mit begrenzter Farbpalette
