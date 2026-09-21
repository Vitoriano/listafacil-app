// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*'],
  },
  {
    rules: {
      // React Compiler advisory (eslint-plugin-react-hooks v7). The project does not enable
      // the React Compiler; keep it visible as a warning while the affected effects are
      // migrated to event handlers / derived state.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]);
