module.exports = {
  extends: [
    '../../.eslintrc.js',
  ],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  overrides: [{
    files: 'src/**/*.test@ts.ts',
    rules: {
      'max-len': 'off',
      'no-lone-blocks': 'off',
      'prefer-destructuring': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }]
}