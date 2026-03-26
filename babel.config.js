module.exports = function (api) {
  // Cache config based on NODE_ENV so Jest (test) gets different config from Metro
  api.cache.using(() => process.env.NODE_ENV);
  const isTest = process.env.NODE_ENV === 'test';
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      // Skip nativewind/babel in test environment as it requires react-native-worklets/plugin
      // which is a Reanimated v4 dependency not used in this project (Reanimated v3)
      ...(isTest ? [] : ['nativewind/babel']),
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.js',
            '.jsx',
            '.json',
          ],
        },
      ],
    ],
  };
};
