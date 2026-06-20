# Anti-Gravity Asset MCP Server

> Minimal isometric 3D asset generator with automatic background removal — built for the Anti-Gravity aesthetic.

## Overview

This MCP (Model Context Protocol) server exposes tools to generate **minimalist isometric 3D assets** using the Anti-Gravity style guide, then automatically removes the background via remove.bg, delivering a clean transparent PNG ready for use.

### Pipeline

```
symbol input
    ↓
Anti-Gravity Prompt Builder (isometric / toy-like / matte plastic / pastel blue & white)
    ↓
Stability AI — stable-image/generate/core
    ↓
remove.bg — background removal
    ↓
Transparent PNG output
```

---

## Anti-Gravity Style Guide (Applied Automatically)

| Element | Style | Keywords |
|---|---|---|
| **Perspective** | Isometric | `minimalist isometric view`, `three-quarter front view` |
| **Style** | Toy-like, Clean | `minimalist toy-like style`, `stylized geometry` |
| **Material** | Matte Plastic | `smooth matte plastic material`, `softly beveled edges` |
| **Colors** | Pastel Blue / White | `pastel light blue`, `clean white`, `cool tone palette` |
| **Details** | Simplified, Solid | `no logos`, `solid black window`, `solid black wheels` |
| **Lighting** | Diffused, Defined Shadow | `soft diffused lighting`, `clean hard shadow`, `cell-shading` |

---

## Setup

### 1. Install dependencies

```bash
cd mcp
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```
STABILITY_API_KEY=your_stability_ai_key_here
REMOVEBG_API_KEY=your_removebg_key_here
OUTPUT_DIR=./generated
```

- **STABILITY_API_KEY**: Get at [platform.stability.ai](https://platform.stability.ai)
- **REMOVEBG_API_KEY**: Get at [remove.bg/api](https://www.remove.bg/api)

### 3. Register with your MCP client

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "antigravity-asset": {
      "command": "node",
      "args": ["/absolute/path/to/mcp/server.mjs"],
      "env": {
        "STABILITY_API_KEY": "your_key",
        "REMOVEBG_API_KEY": "your_key",
        "OUTPUT_DIR": "/absolute/path/to/mcp/generated"
      }
    }
  }
}
```

**Cursor / Other MCP clients**: Add similarly with the path to `server.mjs`.

---

## Tools

### `generate_isometric_asset`

Generates a minimal isometric 3D asset for a given symbol.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `symbol` | string | ✅ | Object to generate (e.g. `"white and blue delivery truck"`, `"red sports car"`, `"silver rocket"`) |
| `style_hint` | string | ❌ | Extra style override (e.g. `"harder edges"`, `"more rounded and chunky"`) |
| `output_filename` | string | ❌ | Custom filename without extension. Auto-generated from symbol if omitted. |

**Example:**
```
generate_isometric_asset(
  symbol: "pastel blue and white rocket ship",
  style_hint: "chunky rounded form, oversized fins"
)
```

**Returns:**
- Log of each step (prompt → generate → remove bg)
- JSON with `path`, `filename`, `symbol`, `prompt`, `sizeKB`

---

### `list_generated_assets`

Lists all previously generated assets in the output directory.

**Returns:** Array of `{ filename, path, sizeKB, createdAt }`

---

## File Structure

```
mcp/
├── server.mjs          # MCP server entry point
├── package.json
├── .env.example        # Environment variable template
├── .gitignore
├── README.md
└── generated/          # Output directory (gitignored)
    ├── rocket_1234567890.png
    └── truck_1234567891.png
```

---

## License

MIT
