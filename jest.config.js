module.exports = {
  preset: 'jest-expo',
  // react-native-worklets 0.10+ ships a native TurboModule entry that cannot load under Jest;
  // its resolver skips the `.native` files so Reanimated 4 falls back to the JS implementation.
  resolver: '<rootDir>/jest.resolver.js',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|native-base|react-native-svg|nativewind|@gluestack-ui|@gluestack-style|react-native-reanimated|react-native-worklets|react-native-safe-area-context|react-native-screens|react-native-gesture-handler|firebase|@firebase)',
  ],
  transform: {
    // jest-expo only transforms .[jt]sx? files; firebase ships ESM `.mjs` entry points.
    '\\.[cm]js$': 'babel-jest',
  },
  moduleNameMapper: {
    // Tests run against the in-memory seed repositories, not the HTTP API.
    '^@/data/repositories$': '<rootDir>/src/data/repositories/mock/index.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json'],
  setupFiles: ['<rootDir>/jest-setup-env.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
