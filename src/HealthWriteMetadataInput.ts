import type { HealthRecordSync } from './HealthRecordSync'
import type { HealthWriteProvenanceInput } from './HealthWriteProvenanceInput'

/** Write-input base for sample types that support idempotent, versioned saves. */
export interface HealthWriteMetadataInput extends HealthWriteProvenanceInput {
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
