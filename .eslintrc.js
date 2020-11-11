module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
    '@vue/typescript'
  ],
  rules: {
    // 'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-console': 'off',
    'no-debugger': 'off',
    'import/prefer-default-export': 'off',
    'linebreak-style': 0,
    'global-require': 0,
    'eslint linebreak-style': [0, 'error', 'windows'],
    allowForLoopAfterthoughts: true,
    'no-plusplus': 'off',
    'class-methods-use-this': 'off',
    'max-len': 'off',
    // 'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['state'] }],
    'comma-dangle': ['error', 'never'],
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'dot-notation': 'off',
    'no-param-reassign': 'off',
    'object-curly-newline': 'off'
  },
  parserOptions: {
    parser: 'typescript-eslint-parser'
  }
};
