// eslint.config.js
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/**", "node_modules/**"], // skip build + deps
  },
  ...tseslint.configs.recommended, // replaces parser + recommended extends
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "max-lines-per-function": ["error", { max: 30 }],
      "complexity": ["error", { max: 10 }],
    },
  },
];
