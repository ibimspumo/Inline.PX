# Component Structure - Atomic Design

Dieses Projekt folgt dem **Atomic Design Prinzip** für eine saubere, skalierbare und wartbare Component-Architektur.

## Ordnerstruktur

```
src/lib/
├── components/
│   ├── atoms/           # Kleinste UI-Bausteine (nicht weiter teilbar)
│   │   ├── buttons/     # Button-Komponenten
│   │   ├── inputs/      # Input-Felder, Checkboxen, etc.
│   │   ├── icons/       # Icon-Wrapper und Icon-Komponenten
│   │   └── display/     # Text, Labels, Badges, etc.
│   │
│   ├── molecules/       # Kombinationen von Atoms
│   │   ├── toolbar/     # Toolbar-Items (Icon + Label)
│   │   ├── color-picker/# Farbauswahl-Komponenten
│   │   ├── canvas/      # Canvas-bezogene Komponenten
│   │   └── dialogs/     # Dialog-Komponenten
│   │
│   ├── organisms/       # Komplexe UI-Bereiche
│   │   ├── editor/      # Haupteditor-Komponenten
│   │   ├── sidebar/     # Sidebar-Komponenten
│   │   └── panels/      # Panel-Komponenten (Properties, Tools, etc.)
│   │
│   └── templates/       # Layout-Templates
│
├── stores/              # Svelte 5 Runes & State Management
├── types/               # TypeScript Type Definitions
├── utils/               # Utility Functions
└── constants/           # Konstanten (Colors, Defaults, etc.)
```

## Atomic Design Levels

### 🔹 Atoms (Kleinste Bausteine)
**Verwendung:** Nicht weiter teilbare UI-Elemente

**Beispiele für den Pixel Art Editor:**
- `Button.svelte` - Standard-Button
- `IconButton.svelte` - Button mit Icon
- `ColorSwatch.svelte` - Einzelne Farbkachel
- `Input.svelte` - Text-Input
- `Slider.svelte` - Range-Slider
- `Checkbox.svelte` - Checkbox
- `PixelCell.svelte` - Einzelne Pixel-Zelle

**Regeln:**
- Keine Business-Logik
- Nur Props empfangen
- Wiederverwendbar in jedem Kontext
- Minimal und fokussiert

### 🔸 Molecules (Atom-Kombinationen)
**Verwendung:** Kombinationen von Atoms mit spezifischem Zweck

**Beispiele für den Pixel Art Editor:**
- `ToolButton.svelte` - Icon + Tooltip + Active State
- `ColorPalette.svelte` - Grid von ColorSwatches
- `ZoomControls.svelte` - Zoom In/Out Buttons + Display
- `LayerItem.svelte` - Layer Name + Visibility Toggle + Actions
- `ResizeDialog.svelte` - Input Fields + Buttons in Dialog
- `PixelGrid.svelte` - Grid von PixelCells

**Regeln:**
- Bestehen aus mehreren Atoms
- Haben einen klaren Zweck
- Können lokale State haben
- Wiederverwendbar innerhalb des Editors

### 🔶 Organisms (Komplexe Komponenten)
**Verwendung:** Große, eigenständige UI-Bereiche mit voller Funktionalität

**Beispiele für den Pixel Art Editor:**
- `Canvas.svelte` - Hauptzeichenfläche mit Grid + Tools
- `Toolbar.svelte` - Komplette Tool-Leiste
- `LayerPanel.svelte` - Komplettes Layer-Management
- `ColorPickerPanel.svelte` - Vollständiger Color Picker mit Paletten
- `PropertiesPanel.svelte` - Tool-Properties und Settings
- `MenuBar.svelte` - Hauptmenü

**Regeln:**
- Bestehen aus Molecules und Atoms
- Können eigene Business-Logik haben
- Zugriff auf Stores/State
- Eigenständig funktionsfähig

### 📄 Templates (Layouts)
**Verwendung:** Seiten-Layouts ohne spezifischen Content

**Beispiele für den Pixel Art Editor:**
- `EditorLayout.svelte` - Hauptlayout mit Sidebar + Canvas + Panels
- `DialogLayout.svelte` - Standard Dialog-Layout

**Regeln:**
- Definieren Seitenlayout
- Platzhalter für Organisms
- Keine Business-Logik

## Best Practices

### 1. Component-Naming
- **PascalCase:** `ColorPicker.svelte`, nicht `color-picker.svelte`
- **Beschreibend:** Namen sollen Funktion klar machen
- **Konsistent:** Ähnliche Komponenten ähnlich benennen

### 2. Props vs. Stores
- **Props:** Für Daten die von Parent kommen
- **Stores:** Für globalen State (Canvas, Tools, History)
- **Svelte 5 Runes:** `$state()`, `$derived()`, `$effect()`

### 3. File Organization
Jede Component in eigenem Ordner wenn sie zusätzliche Files braucht:

```
ColorPicker/
├── ColorPicker.svelte
├── ColorPicker.types.ts
└── ColorPicker.test.ts
```

### 4. Svelte 5 Runes Beispiele

```svelte
<script lang="ts">
  // Props mit Runes
  let { color = '#000000', onchange }: Props = $props();

  // Lokaler State
  let isOpen = $state(false);

  // Berechnete Werte
  let hexColor = $derived(color.toUpperCase());

  // Effects
  $effect(() => {
    console.log('Color changed:', color);
  });
</script>
```

### 5. Wann welche Ebene?

**Atom erstellen wenn:**
- Element ist nicht weiter teilbar
- Element wird an vielen Stellen benötigt
- Keine spezifische Business-Logik

**Molecule erstellen wenn:**
- Kombination von 2+ Atoms
- Wiederverwendbare Funktionalität
- Spezifischer Zweck aber generisch einsetzbar

**Organism erstellen wenn:**
- Große, komplexe UI-Bereiche
- Business-Logik benötigt
- Eigenständig funktionsfähig

## Beispiel-Hierarchie im Pixel Art Editor

```
Template: EditorLayout
└── Organism: Toolbar
    ├── Molecule: ToolButton
    │   ├── Atom: IconButton
    │   └── Atom: Tooltip
    └── Molecule: ColorPalette
        └── Atom: ColorSwatch

Template: EditorLayout
└── Organism: Canvas
    ├── Molecule: PixelGrid
    │   └── Atom: PixelCell
    └── Molecule: ZoomControls
        ├── Atom: Button
        └── Atom: Input
```

## Weitere Ordner

### `/stores`
Svelte 5 State Management mit Runes:
```typescript
// canvasStore.svelte.ts
export const canvas = $state({
  width: 32,
  height: 32,
  pixels: []
});
```

### `/types`
TypeScript Type Definitions:
```typescript
// canvas.types.ts
export type Pixel = {
  x: number;
  y: number;
  color: string;
};
```

### `/utils`
Helper Functions:
```typescript
// color.utils.ts
export function hexToRgb(hex: string): RGB { ... }
```

### `/constants`
Konstanten:
```typescript
// editor.constants.ts
export const DEFAULT_CANVAS_SIZE = 32;
export const TOOL_TYPES = ['pencil', 'eraser', 'bucket'] as const;
```

## Zusammenfassung

Diese Struktur ermöglicht:
- ✅ Maximale Wiederverwendbarkeit
- ✅ Einfache Wartbarkeit
- ✅ Klare Verantwortlichkeiten
- ✅ Skalierbarkeit
- ✅ Testbarkeit
- ✅ Team-Kollaboration

Halte dich an diese Struktur und dein Pixel Art Editor wird sauber, professionell und wartbar sein!
