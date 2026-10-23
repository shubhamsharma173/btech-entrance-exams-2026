import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores(['.next/**', 'out/**', 'coverage/**', 'node_modules/**', 'next-env.d.ts']),
  // Next's small toolchain configuration files use CommonJS intentionally.
  {
    files: ['next.config.js', 'postcss.config.js', 'tailwind.config.js'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
])
