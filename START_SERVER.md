# 🚀 SERVER STARTEN

**WICHTIG:** Die App muss über einen HTTP-Server geöffnet werden, nicht über `file://` Protocol!

## Warum?
Die neuen JSON-Konfigurationsdateien (`config/colors.json`, `config/constants.json`) können aus Sicherheitsgründen nicht über `file://` geladen werden.

## Schnellstart:

### Option 1: Python (empfohlen)
```bash
cd /Users/timocorvinus/Desktop/inline.px
python3 -m http.server 8000
```

Dann öffne im Browser: **http://localhost:8000**

### Option 2: Node.js (wenn installiert)
```bash
npx http-server -p 8000
```

### Option 3: PHP (wenn installiert)
```bash
php -S localhost:8000
```

## ✅ Server läuft bereits!

Ein Server wurde bereits auf Port 8000 gestartet.

**Öffne einfach:** http://localhost:8000

## 🛑 Server stoppen

```bash
# Finde die Process-ID
lsof -ti:8000

# Stoppe den Server
kill <PID>
```

## 🐛 Probleme?

### "Address already in use"
Port 8000 ist bereits belegt. Nutze einen anderen Port:
```bash
python3 -m http.server 8001
# Dann: http://localhost:8001
```

### "Module not found"
Stelle sicher, dass du im richtigen Verzeichnis bist:
```bash
cd /Users/timocorvinus/Desktop/inline.px
```

## 📝 Hinweise

- **Öffne IMMER über `http://localhost:8000`**, NICHT über `file:///...`
- Browser-Console öffnen: `Cmd+Option+I` (Chrome/Safari)
- Hard-Refresh: `Cmd+Shift+R` (löscht Cache)
