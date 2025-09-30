// eslint.config.js
import tseslint from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import local from "./eslint-plugin-local/index.js";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser
    },
    plugins: {
      "@typescript-eslint": tseslint,
      local
    },
    rules: {
      "no-var": "error",
      // "prefer-const": "warn",
      "local/no-final-override": "error"
    }
  }
];
