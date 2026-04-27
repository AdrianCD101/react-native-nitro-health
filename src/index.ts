import { NitroModules } from 'react-native-nitro-modules'
import type { NitroHealth as NitroHealthSpec } from './specs/nitro-health.nitro'

export const NitroHealth =
  NitroModules.createHybridObject<NitroHealthSpec>('NitroHealth')