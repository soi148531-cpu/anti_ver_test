#!/usr/bin/env node
/**
 * Anti-Gravity Asset MCP Server
 *
 * 이 MCP 서버는 Antigravity(AI)와 협력하여 동작합니다.
 *
 * 워크플로우:
 *  1. build_isometric_prompt(symbol)  → Anti-Gravity 스타일 프롬프트 반환
 *  2. [Antigravity가 generate_image 내장 도구로 이미지 생성 & 저장]
 *  3. remove_background(image_path)   → remove.bg API로 배경 제거 → 투명 PNG 저장
 *
 * ENV:
 *  REMOVEBG_API_KEY  - remove.bg API 키
 *  OUTPUT_DIR        - 출력 디렉토리 (기본값: ./generated)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================
// 설정
// ============================================================
const CONFIG = {
  removeBgApiKey: process.env.REMOVEBG_API_KEY ?? "K5X6PDJaw2rqk9Vo3CQgXd5K",
  outputDir: process.env.OUTPUT_DIR ?? path.join(__dirname, "generated"),
};

// ============================================================
// Anti-Gravity 프롬프트 빌더
// ============================================================
function buildAntiGravityPrompt(symbol, styleHint = "") {
  const base = [
    `High-fidelity 3D render, minimalist toy-like asset.`,
    `A stylized ${symbol}.`,
    `Minimalist isometric three-quarter front view, positioned diagonally,`,
    `set against a plain pastel light blue background.`,
    `Smooth, matte plastic material finish with softly beveled edges, giving a tactile quality.`,
    `The forms are clean pastel blue and white.`,
    `Simplified geometric forms, solid black details and windows.`,
    `No text, logos, or surface details.`,
    `Soft, diffused lighting; a clean, defined shadow cast on the ground (no gradients or haze),`,
    `similar to clean cell-shading. A slight specular highlight on the brightest surface.`,
    `Toss brand aesthetic, clean design, low-poly style, simplified geometry, precise construction.`,
  ].join(" ");

  return styleHint ? `${base} Additional style: ${styleHint}.` : base;
}

// ============================================================
// remove.bg 배경 제거
// ============================================================
async function removeBackground(inputPath, outputPath) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`파일을 찾을 수 없습니다: ${inputPath}`);
  }

  const blob = await fs.openAsBlob(inputPath);
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_file", blob);

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": CONFIG.removeBgApiKey },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`remove.bg 오류 ${response.status}: ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

// ============================================================
// 유틸
// ============================================================
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

// ============================================================
// MCP 서버
// ============================================================
const server = new Server(
  { name: "antigravity-asset-mcp", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

// ---- 도구 목록 ----
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "build_isometric_prompt",
      description: `Anti-Gravity 미니멀 아이소메트릭 스타일 프롬프트를 빌드합니다.
symbol(대상)을 입력받아 이미지 생성에 사용할 완성된 프롬프트 문자열을 반환합니다.
반환된 프롬프트는 Antigravity의 generate_image 도구에 바로 사용하세요.`,
      inputSchema: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description:
              "생성할 오브젝트 설명 (예: 'white and pastel-blue delivery truck', 'silver rocket ship', 'red sports car')",
          },
          style_hint: {
            type: "string",
            description:
              "추가 스타일 힌트 (선택). 예: 'harder edges', 'more rounded and chunky', 'darker navy fins'",
          },
        },
        required: ["symbol"],
      },
    },
    {
      name: "remove_background",
      description: `이미지 파일의 배경을 remove.bg API로 제거하고 투명 PNG로 저장합니다.
Antigravity가 generate_image로 생성·저장한 이미지 경로를 입력받습니다.`,
      inputSchema: {
        type: "object",
        properties: {
          image_path: {
            type: "string",
            description: "배경을 제거할 이미지의 절대 경로",
          },
          output_path: {
            type: "string",
            description:
              "결과 PNG 저장 경로 (선택). 미입력 시 원본 파일명에 _nobg를 붙여 generated/ 폴더에 저장",
          },
        },
        required: ["image_path"],
      },
    },
    {
      name: "list_generated_assets",
      description: "generated/ 폴더의 에셋 목록을 반환합니다.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  ],
}));

// ---- 도구 실행 ----
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // ----------------------------------------------------------
  // build_isometric_prompt
  // ----------------------------------------------------------
  if (name === "build_isometric_prompt") {
    const symbol = args?.symbol;
    const styleHint = args?.style_hint ?? "";

    if (!symbol) {
      return {
        content: [{ type: "text", text: "❌ symbol 파라미터가 필요합니다." }],
        isError: true,
      };
    }

    const prompt = buildAntiGravityPrompt(symbol, styleHint);

    return {
      content: [
        {
          type: "text",
          text: [
            `✅ Anti-Gravity 프롬프트 생성 완료`,
            ``,
            `📋 Symbol: ${symbol}`,
            styleHint ? `🎨 Style hint: ${styleHint}` : "",
            ``,
            `📝 Prompt:`,
            prompt,
            ``,
            `👉 이 프롬프트를 generate_image 도구에 사용하세요.`,
          ]
            .filter((l) => l !== "")
            .join("\n"),
        },
        {
          type: "text",
          text: JSON.stringify({ prompt, symbol, styleHint }),
        },
      ],
    };
  }

  // ----------------------------------------------------------
  // remove_background
  // ----------------------------------------------------------
  if (name === "remove_background") {
    const imagePath = args?.image_path;
    if (!imagePath) {
      return {
        content: [{ type: "text", text: "❌ image_path 파라미터가 필요합니다." }],
        isError: true,
      };
    }

    ensureDir(CONFIG.outputDir);

    const basename = path.basename(imagePath, path.extname(imagePath));
    const outputPath =
      args?.output_path ??
      path.join(CONFIG.outputDir, `${slugify(basename)}_nobg.png`);

    try {
      console.error(`⏳ 배경 제거 중: ${imagePath}`);
      await removeBackground(imagePath, outputPath);

      const stat = fs.statSync(outputPath);
      return {
        content: [
          {
            type: "text",
            text: [
              `✅ 배경 제거 완료!`,
              `📥 원본: ${imagePath}`,
              `📦 결과: ${outputPath}`,
              `💾 크기: ${Math.round(stat.size / 1024)} KB (투명 PNG)`,
            ].join("\n"),
          },
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              output_path: outputPath,
              sizeKB: Math.round(stat.size / 1024),
            }),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `❌ 오류: ${err.message}` }],
        isError: true,
      };
    }
  }

  // ----------------------------------------------------------
  // list_generated_assets
  // ----------------------------------------------------------
  if (name === "list_generated_assets") {
    ensureDir(CONFIG.outputDir);
    const files = fs
      .readdirSync(CONFIG.outputDir)
      .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));

    if (files.length === 0) {
      return { content: [{ type: "text", text: "생성된 에셋이 없습니다." }] };
    }

    const assets = files.map((f) => {
      const fullPath = path.join(CONFIG.outputDir, f);
      const stat = fs.statSync(fullPath);
      return { filename: f, path: fullPath, sizeKB: Math.round(stat.size / 1024), createdAt: stat.birthtime.toISOString() };
    });

    return {
      content: [
        {
          type: "text",
          text: `에셋 ${assets.length}개:\n` + assets.map((a) => `• ${a.filename} (${a.sizeKB}KB) — ${a.createdAt}`).join("\n"),
        },
        { type: "text", text: JSON.stringify(assets) },
      ],
    };
  }

  return {
    content: [{ type: "text", text: `❌ 알 수 없는 도구: ${name}` }],
    isError: true,
  };
});

// ============================================================
// 시작
// ============================================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 Anti-Gravity Asset MCP Server v2 실행 중 (stdio)");
}

main().catch((err) => {
  console.error("서버 시작 실패:", err);
  process.exit(1);
});
