import { defineConfig } from "vite";

/** @type {import('vite').UserConfig} */

// https://vitejs.dev/config/
export default defineConfig({
    base: "./",
    // your other configuration...
    build: {
        outDir: '../docs',
        emptyOutDir: true, // also necessary
    }
});