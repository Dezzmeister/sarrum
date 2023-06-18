module.exports = {
	root: true,
	extends: "@react-native-community",
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint"],
	overrides: [
		{
			files: ["*.ts", "*.tsx", "*.js"],
			rules: {
				"@typescript-eslint/no-shadow": ["error"],
				"@typescript-eslint/no-unused-vars": ["warn"],
				"no-shadow": "off",
				"no-undef": "off",
				endOfLine: "off",
				quotes: ["warn", "double"],
				"max-len": [
					"warn",
					{
						code: 120,
					},
				],
				"handle-callback-err": "off",
			},
		},
	],
};
