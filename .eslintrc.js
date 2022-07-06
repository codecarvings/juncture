module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'airbnb',
    'airbnb-typescript'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint'
  ],
  settings: {
    react: {
      version: "17.0"
    },
  },
  rules: {
    'arrow-parens': [
      'error',
      'as-needed'
    ],
    'import/no-cycle': 'off',
    'import/prefer-default-export': 'off',
    'max-classes-per-file': 'off',
    'react/react-in-jsx-scope': 'off',
    'max-len': [
      'error',
      {
        code: 120
      }
    ],
    'no-underscore-dangle': [
      'error',
      {
        'allowAfterThis': true
      }
    ],
    '@typescript-eslint/comma-dangle': [
      'error',
      {
        'imports': 'never'
      }
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: [
          'variable'
        ],
        format: [
          'camelCase', 'PascalCase'
        ],
        leadingUnderscore: 'allow'
      }
    ]
  }
}