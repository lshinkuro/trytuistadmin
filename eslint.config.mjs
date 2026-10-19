import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Aturan dependency clean architecture (lihat WEBPLAN.md §3.2):
// layer dalam tidak boleh meng-import layer luar.
const layer = (files, forbidden, message) => ({
  files,
  rules: {
    "no-restricted-imports": ["error", { patterns: forbidden.map((group) => ({ group: [group], message })) }],
  },
});

const config = [
  ...nextVitals,
  ...nextTs,
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "storefront/**"] },
  layer(
    ["src/domain/**"],
    ["@/application/*", "@/infrastructure/*", "@/presentation/*", "@/app/*", "react", "react-dom", "next", "next/*"],
    "domain hanya boleh berisi TypeScript murni (entity, aturan bisnis, interface repository).",
  ),
  layer(
    ["src/application/**"],
    ["@/infrastructure/*", "@/presentation/*", "@/app/*", "react", "react-dom", "next", "next/*"],
    "application hanya boleh bergantung pada domain.",
  ),
  layer(
    ["src/infrastructure/**"],
    ["@/presentation/*", "@/app/*"],
    "infrastructure tidak boleh tahu UI.",
  ),
  layer(
    ["src/presentation/components/ui/**"],
    ["@/domain/*", "@/application/*", "@/infrastructure/*", "@/presentation/hooks/*", "@/presentation/features/*"],
    "Base component (ui/) murni presentational: hanya props, tanpa data & logika bisnis.",
  ),
  layer(
    ["src/presentation/**"],
    ["@/infrastructure/repositories/*", "@/infrastructure/http/*", "@/infrastructure/server/*"],
    "presentation memakai use case lewat useDependencies(), bukan repository langsung.",
  ),
];

export default config;
