/**
 * Mock NitroHealth hybrid object shared by the Jest contract tests.
 *
 * This lives in its own module (rather than a `const mockNitroHealth = {...}` declared
 * inline in each test file) so that ES module import hoisting resolves it correctly: Babel
 * hoists `import` statements above other top-level code, and jest hoists `jest.mock()` calls
 * above imports. `src/index.ts` calls `NitroModules.createHybridObject(...)` eagerly at module
 * load time, so by the time `import { NitroHealth } from 'react-native-nitro-health'` runs,
 * this module must already be fully evaluated. Importing it (rather than declaring it inline)
 * guarantees that ordering, because both imports are hoisted in the order they're written.
 *
 * It intentionally covers the full native spec surface so every contract test file can share
 * it; `jest.clearAllMocks()` in each file's `beforeEach` keeps suites isolated.
 */
export const mockNitroHealth = {
  isAvailable: jest.fn(),
  getAvailabilityStatus: jest.fn(),
  openHealthConnectInstall: jest.fn(),
  openHealthSettings: jest.fn(),
  createChangesToken: jest.fn(),
  getChanges: jest.fn(),
  requestAuthorization: jest.fn(),
  getRequestStatusForAuthorization: jest.fn(),
  readSteps: jest.fn(),
  readDistance: jest.fn(),
  readActiveEnergyBurned: jest.fn(),
  readBodyMass: jest.fn(),
  readHeartRate: jest.fn(),
  readHeartRateStatistics: jest.fn(),
  readRestingHeartRate: jest.fn(),
  readHeartRateVariability: jest.fn(),
  readOxygenSaturation: jest.fn(),
  readHeight: jest.fn(),
  readStatistics: jest.fn(),
  readSleepSamples: jest.fn(),
  readWorkouts: jest.fn(),
  saveSteps: jest.fn(),
  saveDistance: jest.fn(),
  saveActiveEnergyBurned: jest.fn(),
  saveHeartRate: jest.fn(),
  saveBodyMass: jest.fn(),
  saveRestingHeartRate: jest.fn(),
  saveOxygenSaturation: jest.fn(),
  saveHeight: jest.fn(),
  deleteSamplesByUuids: jest.fn(),
  deleteSamplesByTimeRange: jest.fn(),
}
