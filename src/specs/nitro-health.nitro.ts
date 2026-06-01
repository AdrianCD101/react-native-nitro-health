import type { HybridObject } from 'react-native-nitro-modules'
import type { AuthorizationRequestStatus } from '../AuthorizationRequestStatus'
import type { HealthAvailabilityStatus } from '../HealthAvailabilityStatus'
import type { NativeHealthAuthorizationResult } from '../NativeHealthAuthorizationResult'
import type { NativeHealthDateRangeQuery } from '../NativeHealthDateRangeQuery'
import type { NativeHealthPermission } from '../NativeHealthPermission'
import type { NativeStepSample } from '../NativeStepSample'

export interface NitroHealth extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  isAvailable(): boolean
  getAvailabilityStatus(): HealthAvailabilityStatus
  openHealthConnectInstall(): boolean
  openHealthSettings(): Promise<boolean>
  readSteps(query: NativeHealthDateRangeQuery): Promise<NativeStepSample[]>
  getRequestStatusForAuthorization(
    permissions: NativeHealthPermission[]
  ): Promise<AuthorizationRequestStatus>
  requestAuthorization(
    permissions: NativeHealthPermission[]
  ): Promise<NativeHealthAuthorizationResult>
}
