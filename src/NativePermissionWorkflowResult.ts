import type { NativeHealthAvailability } from './NativeHealthAvailability'

export type NativePermissionWorkflowStatus = 'completed' | 'userActionRequired' | 'unavailable'
export type NativePermissionActionKind = 'opened' | 'manual'
export type NativePermissionDestination = 'healthConnectSettings' | 'healthAppPermissions'

/** Native transport shared by permission-management and revocation workflows. */
export interface NativePermissionWorkflowResult {
  status: NativePermissionWorkflowStatus
  actionKind?: NativePermissionActionKind
  destination?: NativePermissionDestination
  availability?: NativeHealthAvailability
}
