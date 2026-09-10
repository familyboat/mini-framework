import {defineConfig} from 'vite'
import {resolve} from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      'lib': resolve(import.meta.dirname, './lib')
    }
  }
})