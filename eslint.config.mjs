import eslint from "@eslint/js"
import { defineConfig } from "eslint/config"
import tseslint from "typescript-eslint"
import stylistic from "@stylistic/eslint-plugin"
import unusedImports from "eslint-plugin-unused-imports"

export default defineConfig([
	// start with the stylistic config
	...tseslint.configs.stylistic,

	// then layer your overrides
	{
		ignores: ["eslint.config.mjs"],
		plugins: {
			"@stylistic": stylistic,
			"unused-imports": unusedImports
		},
		rules: {
			// Example overrides:
			"@stylistic/quotes": ["error", "double"],
			"@stylistic/indent": ["error", "tab"],
			"@typescript-eslint/no-empty-function": ["off"],
			"unused-imports/no-unused-imports": "error",
			semi: ["error", "never"]
		}
	}
])
