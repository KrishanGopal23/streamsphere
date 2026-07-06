import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        URLSearchParams: "readonly",
        YT: "readonly"
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module"
      }
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react/jsx-uses-vars": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "react-refresh/only-export-components": "off"
    }
  }
];
