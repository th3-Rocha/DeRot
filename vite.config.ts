import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json" assert { type: "json" };
import type { ManifestV3Export } from "@crxjs/vite-plugin";

const typedManifest = manifest as ManifestV3Export;

export default defineConfig({
  plugins: [react(), crx({ manifest: typedManifest })],
});
