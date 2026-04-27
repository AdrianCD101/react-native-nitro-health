import type { HybridObject } from 'react-native-nitro-modules'

export interface NitroHealth extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  isAvailable(): boolean
}
