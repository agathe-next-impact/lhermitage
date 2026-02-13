import nextConfig from "eslint-config-next"
import prettierConfig from "eslint-config-prettier"

export default [
  ...nextConfig,
  prettierConfig,
  {
    ignores: ["node_modules/", ".next/", "out/"],
  },
]
