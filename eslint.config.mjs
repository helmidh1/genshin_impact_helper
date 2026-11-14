import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Mechanical boundary rule: forbid client components and client hooks from importing server adapters
  {
    files: ["src/components/**/*.{ts,tsx}", "src/lib/use-*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/lib/enka",
                "@/lib/hoyolab",
                "@/lib/hoyolab-checkin",
                "@/lib/gemini",
                "**/lib/enka",
                "**/lib/hoyolab",
                "**/lib/hoyolab-checkin",
                "**/lib/gemini",
              ],
              message:
                "Client components and hooks must not import server-side data adapters or AI SDK modules. Use pure domain engines (@/lib/build-engine, @/lib/coach-engine, @/lib/directives-engine) or store actions instead.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
