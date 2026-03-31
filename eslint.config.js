const coreWebVitals = require('eslint-config-next/core-web-vitals');
const tseslint = require('typescript-eslint');

module.exports = [
  ...coreWebVitals,
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
