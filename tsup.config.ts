import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    // tsup sets the deprecated `baseUrl` option internally, which TypeScript 6 rejects
    dts: { compilerOptions: { ignoreDeprecations: "6.0" } },
    // Treat CSS as CSS Modules: class names get renamed to unique ones.
    // tsup applies this to every .css file; tokens.css only uses :root, which is never renamed.
    loader: { ".css": "local-css" },
    clean: true,
    external: ["react", "react-dom"],
});
