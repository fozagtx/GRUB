// vite.config.js
import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  // IMPORTANT: repo name so assets load at https://jdew.../KaleGrabRush/
  base: '/KaleGrabRush/',
  plugins: [basicSsl()],          // keeps https for local dev if you want it
  server: {
    https: true,
    host: true,                   // 0.0.0.0 / LAN
    port: 5173
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets'
  }
})
