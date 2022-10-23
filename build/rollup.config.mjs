import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default [
  {
    input: './packages/i18n-extract/src/index.ts',
    output: {
      dir: './packages/i18n-extract/dist',
      format: 'esm',
      entryFileNames: '[name].js',
    },
    plugins: [nodeResolve(), typescript()],
  },
]
