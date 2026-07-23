import { defineConfig } from "vite";
import { resolve } from "path";
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";

// Use fileURLToPath for ESM compatibility (import.meta.url works in all Node ESM versions)
const __filename = fileURLToPath(import.meta.url);
const root = resolve(__filename, "..");

/**
 * Vite config for IDE support and type-checking.
 * NOTE: The actual production build uses scripts/build.mjs (invoked via npm run build).
 * This config is retained for IDE import resolution and manual `vite build` support.
 */
export default defineConfig(({ mode }) => {
  const isContent = mode === "content";

  return {
    build: {
      outDir: "dist",
      emptyDirOnBuild: false,
      lib: {
        entry: isContent
          ? resolve(root, "src/content/index.ts")
          : resolve(root, "src/popup/index.ts"),
        name: isContent ? "TranslateContent" : "TranslatePopup",
        formats: ["iife"],
        fileName: () => (isContent ? "content.js" : "popup.js"),
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
      target: "es2020",
      minify: false,
    },
    plugins: [copyStaticAssets(isContent)],
  };
});

function copyStaticAssets(isFirstBuild: boolean) {
  return {
    name: "copy-static-assets",
    closeBundle() {
      if (isFirstBuild) {
        console.log("  (static assets will be copied on the next pass)");
        return;
      }

      const dist = resolve(root, "dist");
      if (!existsSync(dist)) mkdirSync(dist, { recursive: true });

      const manifest = JSON.parse(
        readFileSync(resolve(root, "manifest.json"), "utf-8")
      );
      manifest.content_scripts[0].js = ["content.js"];
      manifest.content_scripts[0].css = ["content.css"];
      manifest.action = {
        ...manifest.action,
        default_popup: "popup.html",
      };
      writeFileSync(
        resolve(dist, "manifest.json"),
        JSON.stringify(manifest, null, 2)
      );

      copyFileSync(resolve(root, "public/popup.html"), resolve(dist, "popup.html"));
      copyFileSync(resolve(root, "styles/content.css"), resolve(dist, "content.css"));
      copyFileSync(resolve(root, "styles/popup.css"), resolve(dist, "popup.css"));

      if (existsSync(resolve(root, "public/test.html"))) {
        copyFileSync(resolve(root, "public/test.html"), resolve(dist, "test.html"));
      }

      const iconsDir = resolve(root, "icons");
      const distIconsDir = resolve(dist, "icons");
      if (!existsSync(distIconsDir)) mkdirSync(distIconsDir, { recursive: true });
      for (const file of readdirSync(iconsDir)) {
        copyFileSync(resolve(iconsDir, file), resolve(distIconsDir, file));
      }

      console.log("✓ Static assets copied to dist/");
    },
  };
}
