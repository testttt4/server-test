module.exports = {
	extends: [
		"plugin:@typescript-eslint/recommended",
		"prettier/@typescript-eslint",
		"plugin:prettier/recommended",
		"plugin:jest/recommended"
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 10,
		sourceType: "module",
		ecmaFeatures: {
			jsx: true
		}
	},
	rules: {
		"prettier/prettier": "off",
		"curly": ["warn", "multi"],
		"sort-imports": "warn",

		"@typescript-eslint/array-type": ["warn", "array-simple"],
		"@typescript-eslint/camelcase": "off",
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/no-non-null-assertion": ["warn"],
		"@typescript-eslint/no-triple-slash-reference": "off",
		"@typescript-eslint/prefer-interface": "off",
		"@typescript-eslint/no-var-requires": "off"
	},
	settings: {
		react: {
			version: "detect"
		}
	}
};
