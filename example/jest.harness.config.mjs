export default {
  preset: 'react-native-harness',
  testMatch: ['<rootDir>/__tests__/**/*.harness.{js,jsx,ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/support/harnessAuthorizationSetup.ts'],
}
