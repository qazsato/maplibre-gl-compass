import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/maplibre-gl-compass.ts'),
      name: 'maplibre-gl-compass',
      fileName: 'maplibre-gl-compass'
    }
  },
  plugins: [dts()]
})
