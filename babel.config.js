module.exports = function (api) {
  // Cache config based on NODE_ENV so Jest (test) gets different config from Metro
  api.cache.using(() => process.env.NODE_ENV);
  const isTest = process.env.NODE_ENV === 'test';
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      // nativewind/babel applies the css-interop transform (className -> style).
      // It is skipped under Jest, where jest-expo + jsxImportSource already cover rendering.
      ...(isTest ? [] : ['nativewind/babel']),
    ],
    // NOTES:
    // - The `@/*` alias is resolved from tsconfig `paths` by Expo's Metro config and by
    //   `moduleNameMapper` in jest.config.js. No babel alias plugin is needed.
    // - react-native-worklets/plugin (Reanimated 4) is added automatically by
    //   babel-preset-expo (SDK 54+) when react-native-worklets is installed.
    plugins: [],
  };
};
