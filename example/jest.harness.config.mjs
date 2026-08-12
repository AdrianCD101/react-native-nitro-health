import { fileURLToPath } from 'node:url'

try {
  process.loadEnvFile(fileURLToPath(new URL('.env', import.meta.url)))
} catch {
  // .env is optional.
}

const runnerOptionIndex = process.argv.findIndex((argument) => argument === '--harnessRunner')
const harnessRunner =
  process.argv.find((argument) => argument.startsWith('--harnessRunner='))?.split('=', 2)[1] ??
  (runnerOptionIndex >= 0 ? process.argv[runnerOptionIndex + 1] : undefined) ??
  'ios'

if (harnessRunner !== 'android' && harnessRunner !== 'ios') {
  throw new Error(`Unsupported Harness runner: ${harnessRunner}`)
}

export default {
  preset: 'react-native-harness',
  testMatch: ['**/__tests__/**/*.harness.{js,ts,tsx}'],
  setupFilesAfterEnv:
    harnessRunner === 'ios' ? ['<rootDir>/__tests__/support/harnessAuthorizationSetup.ts'] : [],
  testPathIgnorePatterns: ['/node_modules/'],
}
