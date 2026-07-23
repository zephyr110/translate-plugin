/**
 * Build script for the Chrome extension.
 *
 * Builds content.js and popup.js independently (each self-contained IIFE),
 * then assembles everything into dist/.
 */
import { build } from "vite";
import { rmSync, mkdirSync, cpSync, readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const root = resolve(__filename, "..", "..");
const dist = resolve(root, "dist");
const tmpContent = resolve(root, ".tmp-content");
const tmpPopup = resolve(root, ".tmp-popup");

// 1. Clean
rmSync(dist, { recursive: true, force: true });
rmSync(tmpContent, { recursive: true, force: true });
rmSync(tmpPopup, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

// 2. Build content script to temp dir
console.log("Building content.js...");
await build({
  configFile: false, // don't load vite.config.ts
  build: {
    outDir: tmpContent,
    emptyDirOnBuild: true,
    lib: {
      entry: resolve(root, "src/content/index.ts"),
      name: "TranslateContent",
      formats: ["iife"],
      fileName: () => "content.js",
    },
    target: "es2020",
    minify: false,
  },
});

// 3. Build popup script to temp dir
console.log("Building popup.js...");
await build({
  configFile: false,
  build: {
    outDir: tmpPopup,
    emptyDirOnBuild: true,
    lib: {
      entry: resolve(root, "src/popup/index.ts"),
      name: "TranslatePopup",
      formats: ["iife"],
      fileName: () => "popup.js",
    },
    target: "es2020",
    minify: false,
  },
});

// 4. Assemble dist/
console.log("Assembling dist/...");

// Copy built JS
cpSync(resolve(tmpContent, "content.js"), resolve(dist, "content.js"));
cpSync(resolve(tmpPopup, "popup.js"), resolve(dist, "popup.js"));

// Copy manifest (update paths)
const manifest = JSON.parse(
  readFileSync(resolve(root, "manifest.json"), "utf-8")
);
manifest.content_scripts[0].js = ["content.js"];
manifest.content_scripts[0].css = ["content.css"];
manifest.action = {
  ...manifest.action,
  default_popup: "popup.html",
};
writeFileSync(resolve(dist, "manifest.json"), JSON.stringify(manifest, null, 2));

// Copy CSS
cpSync(resolve(root, "styles/content.css"), resolve(dist, "content.css"));
cpSync(resolve(root, "styles/popup.css"), resolve(dist, "popup.css"));

// Copy HTML
cpSync(resolve(root, "public/popup.html"), resolve(dist, "popup.html"));
if (existsSync(resolve(root, "public/test.html"))) {
  cpSync(resolve(root, "public/test.html"), resolve(dist, "test.html"));
}

// Copy icons
cpSync(resolve(root, "icons"), resolve(dist, "icons"), { recursive: true });

// 5. Clean up temp dirs
rmSync(tmpContent, { recursive: true, force: true });
rmSync(tmpPopup, { recursive: true, force: true });

console.log("✓ Build complete — load dist/ as an unpacked extension");
