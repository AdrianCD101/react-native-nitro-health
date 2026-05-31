import type { HybridObject } from 'react-native-nitro-modules'
import type { AuthorizationRequestStatus } from '../AuthorizationRequestStatus'
import type { HealthAvailabilityStatus } from '../HealthAvailabilityStatus'
import type { NativeHealthAuthorizationResult } from '../NativeHealthAuthorizationResult'
import type { NativeHealthPermission } from '../NativeHealthPermission'

export interface NitroHealth extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  isAvailable(): boolean
  getAvailabilityStatus(): HealthAvailabilityStatus
  openHealthConnectInstall(): boolean
  openHealthSettings(): Promise<boolean>
  getRequestStatusForAuthorization(
    permissions: NativeHealthPermission[]
  ): Promise<AuthorizationRequestStatus>
  requestAuthorization(
    permissions: NativeHealthPermission[]
  ): Promise<NativeHealthAuthorizationResult>
}
