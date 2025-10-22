module.exports = [
  {
    ignores: ['node_modules/', 'dist/', '.git/', '*.log'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      // Error level rules
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'no-implicit-coercion': 'error',
      'no-throw-literal': 'error',
      'no-eval': 'error',

      // Warning level rules
      'no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
        },
      ],
      'prefer-const': ['warn', { destructuring: 'all' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true }],
      'indent': ['warn', 2],
      'comma-dangle': ['warn', 'es5'],

      // Best practices
      'consistent-this': ['warn', 'self'],
      'prefer-arrow-callback': 'warn',
      'prefer-template': 'warn',
      'no-nested-ternary': 'warn',
      'complexity': ['warn', { max: 10 }],
    },
  },
  {
    files: ['server.js'],
    languageOptions: {
      sourceType: 'module',
    },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      sourceType: 'module',
    },
  },
];
