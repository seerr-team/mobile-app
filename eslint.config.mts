import js from '@eslint/js';
// @ts-expect-error no TypeScript declarations for this package
import expoConfig from 'eslint-config-expo/flat';
import prettier from 'eslint-config-prettier';
import formatjs from 'eslint-plugin-formatjs';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, type Config } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

type Plugin = NonNullable<Config['plugins']>[string];

// Based on the Seerr web config (seerr/eslint.config.mts), with the Next.js
// plugin replaced by the Expo config.
export default defineConfig(
  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'seerr/**',
      'android/**',
      'ios/**',
      'dist/**',
      '.expo/**',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  expoConfig,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks as Plugin,
      formatjs,
      'no-relative-import-paths': noRelativeImportPaths,
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],

      // React
      'react/prop-types': 'off',
      'react/self-closing-comp': 'error',

      // jsx-a11y
      'jsx-a11y/no-noninteractive-tabindex': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/no-onchange': 'off',

      // React Hooks: Expo's base enables the whole recommended preset,
      // including the React Compiler rules; keep only the ones Seerr uses.
      ...Object.fromEntries(
        Object.keys(reactHooks.configs.recommended.rules).map((rule) => [
          rule,
          'off',
        ])
      ),
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General
      'arrow-parens': 'off',
      'no-console': 'warn',
      'no-unused-vars': 'off',

      // Plugins
      'formatjs/no-offset': 'error',
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        { allowSameFolder: true },
      ],
    },
  },
  // Node scripts and CommonJS config files
  {
    files: ['bin/**', '*.config.js', '.prettierrc.js'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
    },
  },
  prettier,
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  }
);
