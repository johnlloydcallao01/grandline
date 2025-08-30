import baseConfig from '@encreasl/eslint-config/base.js';

export default [
  ...baseConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
