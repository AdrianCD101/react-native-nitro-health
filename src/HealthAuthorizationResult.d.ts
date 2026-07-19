import type { NativeHealthAuthorizationResult } from './NativeHealthAuthorizationResult'
import type { HealthPermission } from './HealthPermission'
/** Public authorization result returned by {@linkcode NitroHealth.requestAuthorization}. */
export interface HealthAuthorizationResult extends Omit<
  NativeHealthAuthorizationResult,
  'grantedPermissions' | 'deniedPermissions' | 'unverifiablePermissions'
> {
  grantedPermissions: HealthPermission[]
  deniedPermissions: HealthPermission[]
  unverifiablePermissions: HealthPermission[]
}
