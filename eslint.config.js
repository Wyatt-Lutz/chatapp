import globals from "globals";
import pluginJs from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc"
import pluginReact from "eslint-plugin-react";
import js from "@eslint/js";


const compat = new FlatCompat({
  recommendedConfig: js.configs.recommended,
});

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...compat.extends('plugin:react-hooks/recommended'),
  ...compat.plugins('react-hooks', 'react'),
  ...compat.config({
    env: {node: true},
    extends: 'plugin:react-hooks/recommended',
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  }),
  {
    "settings": {
      "react": {
        "version": "detect"
      }
    }
  },
  {files: ["**/*.{js,mjs,cjs,jsx}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",
    },
  },
];