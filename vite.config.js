import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",

    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{js,jsx}"],
      exclude: [
        "src/main.jsx",
        "src/firebase/config.js",
        "src/test/**",
        "src/**/*.test.{js,jsx}",
      ],
      thresholds: {
        lines: 65,
        functions: 65,
        statements: 65,
        branches: 65,
      },
    },
  },
});
