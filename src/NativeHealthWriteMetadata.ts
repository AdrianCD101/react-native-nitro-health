import type { NativeHealthSyncMetadata } from './NativeHealthSyncMetadata'
import type { NativeHealthWriteProvenance } from './NativeHealthWriteProvenance'

/** Native provenance and optional synchronization metadata for a health write. */
export interface NativeHealthWriteMetadata {
  provenance: NativeHealthWriteProvenance
  sync?: NativeHealthSyncMetadata
}
