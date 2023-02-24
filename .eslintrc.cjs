module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 13,
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'prettier/prettier': ['error'],
    'import/prefer-default-export': 'off',
    'implicit-arrow-linebreak': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: 'req|res|next|val|_' }],
    'comma-dangle': 'off',
    indent: 'off',
    'function-paren-newline': 'off',
    camelcase: 'off',
    'consistent-return': 'off',
    'no-undef': 'off',
    'func-names': 'off',
    'operator-linebreak': 'off',
    'object-curly-newline': 'off',
    'newline-per-chained-call': 'off',
    'linebreak-style': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
