import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/maplibre-gl-compass.ts'),
      name: 'maplibre-gl-compass',
      fileName: 'maplibre-gl-compass'
    }
  },
})
