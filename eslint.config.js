module.exports = [
  {
    files: ['server.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'after-used', ignoreRestSiblings: true }],
      'no-var': 'error',
      'prefer-const': ['warn', { destructuring: 'all' }],
    },
  },
  {
    files: ['scripts/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        alert: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'after-used', ignoreRestSiblings: true }],
      'no-var': 'error',
      'prefer-const': ['warn', { destructuring: 'all' }],
    },
  },
];
