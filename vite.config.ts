import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { functionsMixins } from 'vite-plugin-functions-mixins'

export default defineConfig({
  base: '/gh-stats/',
  plugins: [svelte(), functionsMixins({ deps: ['m3-svelte'] })],
})
