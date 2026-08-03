import type { HealthPermission } from '../HealthPermission'

export function assertPermissions(permissions: HealthPermission[]): void {
  if (permissions.length === 0) {
    throw new Error('At least one health permission is required')
  }
}

export function dateToTimeMs(value: Date, message: string): number {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new Error(message)
  }

  return value.getTime()
}

export function assertStartBeforeEnd(startTimeMs: number, endTimeMs: number, prefix = ''): void {
  if (startTimeMs >= endTimeMs) {
    throw new Error(`${prefix}startDate must be before endDate`)
  }
}

export function assertValidDate(value: Date, name: 'startDate' | 'endDate'): number {
  return dateToTimeMs(value, `A valid ${name} is required`)
}

export function assertValidSampleDate(value: Date, index: number, name: string): number {
  return dateToTimeMs(value, `samples[${index}]: a valid ${name} is required`)
}

export function assertSampleInterval(startTimeMs: number, endTimeMs: number, index: number): void {
  assertStartBeforeEnd(startTimeMs, endTimeMs, `samples[${index}]: `)
}

export function assertNonEmptySamples(samples: readonly unknown[]): void {
  if (samples.length === 0) {
    throw new Error('At least one sample is required')
  }
}

export function assertUniqueSampleSyncIds(samples: readonly { sync?: { id: string } }[]): void {
  const firstIndexById = new Map<string, number>()

  samples.forEach((sample, index) => {
    if (sample.sync === undefined) return

    const previousIndex = firstIndexById.get(sample.sync.id)
    if (previousIndex !== undefined) {
      throw new Error(
        `samples[${index}]: sync.id duplicates samples[${previousIndex}].sync.id within this save call`
      )
    }

    firstIndexById.set(sample.sync.id, index)
  })
}

export function assertDeletableUuids(uuids: readonly string[]): void {
  if (uuids.length === 0) {
    throw new Error('At least one uuid is required')
  }

  uuids.forEach((uuid, index) => {
    if (typeof uuid !== 'string' || uuid.trim() === '') {
      throw new Error(`uuids[${index}]: a non-empty uuid string is required`)
    }

    // Android reads flatten heart-rate readings and sleep stages out of parent Health Connect
    // records under synthetic "<recordId>#<index>" ids; Health Connect can only delete whole
    // records, so deleting by such an id would silently remove sibling readings. Mirrors
    // ensureDeletableRecordIds in android/.../DeleteRecordIdValidation.kt — keep messages in sync.
    if (uuid.includes('#')) {
      throw new Error(
        `uuids[${index}]: synthetic reading ids (record id + '#index') cannot be deleted individually; use deleteSamplesByTimeRange instead`
      )
    }
  })
}

export function assertChangesToken(changesToken: string): void {
  if (typeof changesToken !== 'string' || changesToken.trim() === '') {
    throw new Error('changesToken must be a non-empty string')
  }
}

export function assertSamplePositiveInteger(value: number, index: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`samples[${index}]: ${name} must be a positive integer`)
  }
}

export function assertSampleNonNegativeNumber(value: number, index: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`samples[${index}]: ${name} must be a non-negative number`)
  }
}

export function assertSampleGreaterThanZero(value: number, index: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`samples[${index}]: ${name} must be greater than 0`)
  }
}

export function assertSampleBetween(
  value: number,
  min: number,
  max: number,
  index: number,
  name: string
): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`samples[${index}]: ${name} must be between ${min} and ${max}`)
  }
}

export function assertSampleMaxValue(
  value: number,
  max: number,
  index: number,
  name: string
): void {
  if (value > max) {
    throw new Error(`samples[${index}]: ${name} must not exceed ${max}`)
  }
}
