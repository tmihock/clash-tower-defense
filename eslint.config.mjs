import eslint from "@eslint/js"
import { defineConfig } from "eslint/config"
import tseslint from "typescript-eslint"
import stylistic from "@stylistic/eslint-plugin"

export default defineConfig([
	// start with the stylistic config
	...tseslint.configs.stylistic,

	// then layer your overrides
	{
		plugins: {
			"@stylistic": stylistic
		},
		rules: {
			// Example overrides:
			"@stylistic/quotes": ["error", "double"],
			"@stylistic/indent": ["error", "tab"],
			"@typescript-eslint/no-empty-function": ["off"],
			semi: ["error", "never"]
		}
	}
])
