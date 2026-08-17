import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import jestDom from 'eslint-plugin-jest-dom'
import testingLibrary from 'eslint-plugin-testing-library'


export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
   {
    files: ['**/*.test.jsx', '**/*.test.js'],
    languageOptions: {
        globals: {
            ...globals.jest
        }
    },
    plugins: {
      'jest-dom': jestDom,
      'testing-library': testingLibrary
    },
    rules: {
      ...jestDom.configs.recommended.rules,
      ...testingLibrary.configs.react.rules
    }
  }
])
