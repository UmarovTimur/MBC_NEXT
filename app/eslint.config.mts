import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  {
    rules: {
      "max-len": ["error", { code: 120 }],
      "no-console": "warn",
      "no-unused-vars": "warn",
    },
  },
  tseslint.configs.recommended,
]);
