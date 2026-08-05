module.exports = {
  preset: '@react-native/jest-preset',
  testPathIgnorePatterns: ['\\.harness\\.', '/__tests__/support/'],
  moduleNameMapper: {
    '^react-native-nitro-health/jest/mock$': '<rootDir>/../jest/mock.js',
    '^react-native-nitro-health/jest/setup$': '<rootDir>/../jest/setup.js',
  },
}
