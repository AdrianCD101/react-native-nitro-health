import { fileURLToPath } from 'node:url'

try {
  process.loadEnvFile(fileURLToPath(new URL('.env', import.meta.url)))
} catch {
  // .env is optional.
}

const harnessProfile = process.env.RN_HARNESS_PROFILE ?? 'manual'
const harnessProfiles = new Set(['authorized', 'manual'])

if (!harnessProfiles.has(harnessProfile)) {
  throw new Error(`Unsupported RN_HARNESS_PROFILE: ${harnessProfile}`)
}

export default {
  preset: 'react-native-harness',
  testMatch: ['**/__tests__/**/*.harness.{js,ts,tsx}'],
  setupFilesAfterEnv:
    harnessProfile === 'manual' ? ['<rootDir>/__tests__/support/harnessAuthorizationSetup.ts'] : [],
  testPathIgnorePatterns: [
    '/node_modules/',
    ...(harnessProfile === 'manual'
      ? ['/NitroHealth[.]authorized-prerequisites[.]harness[.][jt]sx?$']
      : []),
  ],
}
