/**
 * Inline.px Server - PNG Generation API
 *
 * Usage:
 *   node server.js
 *
 * Endpoints:
 *   GET /png?data=16x16:000...&scale=4
 *   - Generates PNG from pixel art data string
 *   - Returns PNG image with proper content-type
 *
 * URL Parameters:
 *   - data: The pixel art string (WxH:DATA or WxH:RLE:DATA)
 *   - scale: Image scale multiplier (default: 1, max: 16)
 */

const http = require('http');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;

// 64-color palette (same as editor)
const PALETTE = [
    null,        // 0: Transparent
    '#000000',   // 1: Black
    '#FFFFFF',   // 2: White
    '#FF0000',   // 3: Red
    '#00FF00',   // 4: Green
    '#0000FF',   // 5: Blue
    '#FFFF00',   // 6: Yellow
    '#FF00FF',   // 7: Magenta
    '#00FFFF',   // 8: Cyan
    '#FFA500',   // 9: Orange
    '#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080',
    '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#f5f5f5',
    '#8B0000', '#DC143C', '#FF6347', '#FFA07A', '#FFB6C1',
    '#006400', '#228B22', '#32CD32', '#90EE90', '#98FB98',
    '#00008B', '#4169E1', '#1E90FF', '#87CEEB', '#ADD8E6',
    '#4B0082', '#8B008B', '#9370DB', '#BA55D3', '#DDA0DD',
    '#8B4513', '#A0522D', '#D2691E', '#CD853F', '#DEB887',
    '#FFE4E1', '#FFE4B5', '#FAFAD2', '#E0FFFF', '#E6E6FA',
    '#FF1493', '#FF8C00', '#FFD700', '#ADFF2F', '#00CED1',
    '#9400D3', '#8B4789', '#2F4F4F', '#708090', '#BC8F8F',
    '#F0E68C', '#EEE8AA', '#F5DEB3', '#FFDAB9'
];

// Base64 character to index mapping
const BASE64_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/';

function getColorIndex(char) {
    const index = BASE64_CHARS.indexOf(char);
    return index >= 0 && index < PALETTE.length ? index : 0;
}

/**
 * Decompress RLE format
 */
function decompressRLE(compressed) {
    let decompressed = '';
    let i = 0;

    while (i < compressed.length) {
        if (/\d/.test(compressed[i])) {
            let numStr = '';
            while (i < compressed.length && /\d/.test(compressed[i])) {
                numStr += compressed[i];
                i++;
            }
            const count = parseInt(numStr);
            if (i < compressed.length) {
                const char = compressed[i];
                decompressed += char.repeat(count);
                i++;
            }
        } else {
            decompressed += compressed[i];
            i++;
        }
    }

    return decompressed;
}

/**
 * Parse pixel art data string
 */
function parsePixelArt(dataString) {
    const parts = dataString.split(':');
    const [width, height] = parts[0].split('x').map(Number);

    let data;
    if (parts[1] === 'RLE') {
        data = decompressRLE(parts[2]);
    } else {
        data = parts[1];
    }

    return { width, height, data };
}

/**
 * Generate PNG using Canvas API (requires canvas npm package)
 */
function generatePNG(dataString, scale = 1) {
    try {
        // Try to use canvas package if available
        const { createCanvas } = require('canvas');

        const { width, height, data } = parsePixelArt(dataString);

        const canvas = createCanvas(width * scale, height * scale);
        const ctx = canvas.getContext('2d');

        // Disable smoothing for pixel-perfect rendering
        ctx.imageSmoothingEnabled = false;

        // Draw pixels
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width + x;
                const char = data[index];
                const colorIndex = getColorIndex(char);
                const color = PALETTE[colorIndex];

                if (color) {
                    ctx.fillStyle = color;
                    ctx.fillRect(x * scale, y * scale, scale, scale);
                }
            }
        }

        return canvas.toBuffer('image/png');
    } catch (error) {
        throw new Error(`PNG generation failed: ${error.message}`);
    }
}

/**
 * Generate SVG (fallback if canvas not available)
 */
function generateSVG(dataString, scale = 1) {
    const { width, height, data } = parsePixelArt(dataString);

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" shape-rendering="crispEdges">`;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            const char = data[index];
            const colorIndex = getColorIndex(char);
            const color = PALETTE[colorIndex];

            if (color) {
                svg += `<rect x="${x * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="${color}"/>`;
            }
        }
    }

    svg += '</svg>';
    return Buffer.from(svg);
}

/**
 * HTTP Request Handler
 */
function handleRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // PNG endpoint
    if (url.pathname === '/png' && req.method === 'GET') {
        const data = url.searchParams.get('data');
        const scale = Math.min(16, Math.max(1, parseInt(url.searchParams.get('scale') || '1')));
        const format = url.searchParams.get('format') || 'png';

        if (!data) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing "data" parameter' }));
            return;
        }

        try {
            if (format === 'svg') {
                const svgBuffer = generateSVG(data, scale);
                res.writeHead(200, {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'public, max-age=31536000'
                });
                res.end(svgBuffer);
            } else {
                const pngBuffer = generatePNG(data, scale);
                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=31536000'
                });
                res.end(pngBuffer);
            }
        } catch (error) {
            console.error('Generation error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }

    // Health check
    if (url.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'Inline.px PNG API' }));
        return;
    }

    // API documentation
    if (url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Inline.px PNG API</title>
                <style>
                    body { font-family: system-ui; max-width: 800px; margin: 40px auto; padding: 20px; }
                    code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
                    pre { background: #f0f0f0; padding: 15px; border-radius: 5px; overflow-x: auto; }
                </style>
            </head>
            <body>
                <h1>Inline.px PNG Generation API</h1>
                <p>Convert ultra-compact pixel art strings to PNG images on-the-fly.</p>

                <h2>Endpoint</h2>
                <pre>GET /png?data=WxH:DATA&scale=4</pre>

                <h2>Parameters</h2>
                <ul>
                    <li><code>data</code> - Pixel art string (required)</li>
                    <li><code>scale</code> - Image scale 1-16 (default: 1)</li>
                    <li><code>format</code> - Output format: png or svg (default: png)</li>
                </ul>

                <h2>Example Usage</h2>
                <pre>&lt;img src="http://localhost:${PORT}/png?data=16x16:0000000000000000003BB00BB3000000B11111111B00000B111111111B0000B11111111111B000B111111111111B00B11111111111111B0B111111111111111B0B111111111111111B00B11111111111111B000B111111111111B0000B11111111111B00000B111111111B000000B11111111B0000000B111111B00000000B11111B000000000B111B0000000000BBB00000000000000000000000&scale=8" /&gt;</pre>

                <h2>Test</h2>
                <img src="/png?data=16x16:0000000000000000003BB00BB3000000B11111111B00000B111111111B0000B11111111111B000B111111111111B00B11111111111111B0B111111111111111B0B111111111111111B00B11111111111111B000B111111111111B0000B11111111111B00000B111111111B000000B11111111B0000000B111111B00000000B11111B000000000B111B0000000000BBB00000000000000000000000&scale=8" alt="Test sprite" />
                <p><em>Heart sprite at 8× scale</em></p>
            </body>
            </html>
        `);
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
}

// Start server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
    console.log(`🎨 Inline.px PNG API running on http://localhost:${PORT}`);
    console.log(`📖 Documentation: http://localhost:${PORT}/`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});
