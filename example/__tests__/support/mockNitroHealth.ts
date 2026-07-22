/**
 * Mock NitroHealth hybrid object used by NitroHealth.breadth.test.ts.
 *
 * This lives in its own module (rather than a `const mockNitroHealth = {...}` declared
 * inline in the test file) so that ES module import hoisting resolves it correctly: Babel
 * hoists `import` statements above other top-level code, and jest hoists `jest.mock()` calls
 * above imports. `src/index.ts` calls `NitroModules.createHybridObject(...)` eagerly at module
 * load time, so by the time `import { NitroHealth } from 'react-native-nitro-health'` runs,
 * this module must already be fully evaluated. Importing it (rather than declaring it inline)
 * guarantees that ordering, because both imports are hoisted in the order they're written.
 */
export const mockNitroHealth = {
  readRestingHeartRate: jest.fn(),
  readHeartRateVariability: jest.fn(),
  readOxygenSaturation: jest.fn(),
  readHeight: jest.fn(),
  saveRestingHeartRate: jest.fn(),
  saveOxygenSaturation: jest.fn(),
  saveHeight: jest.fn(),
  readStatistics: jest.fn(),
}
