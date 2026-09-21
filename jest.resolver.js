/**
 * Composes the two resolvers this project needs:
 *  - react-native-worklets 0.10+ ships a native TurboModule entry (`*.native.ts`) that cannot
 *    load under Jest; its resolver drops the `.native` extensions so Reanimated 4 falls back
 *    to the JS implementation.
 *  - @react-native/jest-preset's resolver keeps `react-native/*` deep imports mockable.
 */
const workletsResolver = require('react-native-worklets/jest/resolver');
const rnResolver = require('@react-native/jest-preset/jest/resolver');

module.exports = (request, options) => {
  const jestDefaultResolver = options.defaultResolver;
  return workletsResolver(request, {
    ...options,
    defaultResolver: (req, opts) =>
      rnResolver(req, { ...opts, defaultResolver: jestDefaultResolver }),
  });
};
