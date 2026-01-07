module.exports = {
  root: false,
  env: { browser: true, node: true, es2022: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off'
  }
};
