// eslint v9 expects this file. Proxy to .eslintrc.cjs settings.
export default [
	{
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: 'script',
		},
		env: {
			node: true,
			jest: true,
		},
		rules: {
			'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		},
	},
];
