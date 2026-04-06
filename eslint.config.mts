import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // 1. Configuración para JS y TS
  { 
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], 
    plugins: { 
      js,
      "@stylistic": stylistic 
    }, 
    // Combinamos las recomendaciones de JS y TS
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    languageOptions: { 
      globals: { ...globals.browser, ...globals.node } 
    },
    rules: {
      // --- BUENAS PRÁCTICAS ---
      "@stylistic/indent": ["error", 2],           // 2 espacios
      "@stylistic/quotes": ["error", "double"],    // Comillas dobles
      "@stylistic/semi": ["error", "always"],      // Punto y coma obligatorio
      "no-console": "warn",                        // Avisa si olvidas un console.log
      "@typescript-eslint/no-explicit-any": "warn", // Evita el uso de 'any'
      "no-unused-vars": "off",                     // Desactivamos la de JS...
      "@typescript-eslint/no-unused-vars": "error" // ...para usar la versión superior de TS
    }
  },

  // 2. Archivos JSON
  { 
    files: ["**/*.json"], 
    plugins: { json }, 
    language: "json/json", 
    extends: ["json/recommended"] 
  },

  // 3. Archivos Markdown
  { 
    files: ["**/*.md"], 
    plugins: { markdown }, 
    language: "markdown/commonmark", 
    extends: ["markdown/recommended"] 
  },

  // 4. Archivos CSS
  { 
    files: ["**/*.css"], 
    plugins: { css }, 
    language: "css/css", 
    extends: ["css/recommended"] 
  },
]);
