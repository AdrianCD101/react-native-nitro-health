import { Platform } from 'react-native'
import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'
import type {
  BloodGlucoseSample,
  BloodPressureSample,
  BodyTemperatureSample,
  HealthPermission,
  HealthSampleIdentity,
  RespiratoryRateSample,
  StepSample,
  WorkoutSample,
} from 'react-native-nitro-health'

import { hasVerifiedPermissions } from './support/harnessSupport'

const stepReadWritePermissions: HealthPermission[] = [
  { accessType: 'read', dataType: 'steps' },
  { accessType: 'write', dataType: 'steps' },
]
const workoutReadWritePermissions: HealthPermission[] = [
  { accessType: 'read', dataType: 'workout' },
  { accessType: 'write', dataType: 'workout' },
]
const bloodPressureReadWritePermissions: HealthPermission[] = [
  { accessType: 'read', dataType: 'bloodPressure' },
  { accessType: 'write', dataType: 'bloodPressure' },
]
const bloodGlucoseReadWritePermissions: HealthPermission[] = [
  { accessType: 'read', dataType: 'bloodGlucose' },
  { accessType: 'write', dataType: 'bloodGlucose' },
]
const bodyTemperatureReadWritePermissions: HealthPermission[] = [
  { accessType: 'read', dataType: 'bodyTemperature' },
  { accessType: 'write', dataType: 'bodyTemperature' },
]
const respiratoryRateReadWritePermissions: HealthPermission[] = [
  { accessType: 'read', dataType: 'respiratoryRate' },
  { accessType: 'write', dataType: 'respiratoryRate' },
]
const idempotentInterval = {
  startDate: new Date('2004-06-01T09:00:00.000Z'),
  endDate: new Date('2004-06-01T09:30:00.000Z'),
}
const idempotentReadRange = {
  startDate: new Date('2004-06-01T00:00:00.000Z'),
  endDate: new Date('2004-06-02T00:00:00.000Z'),
}

function recordId(identity: HealthSampleIdentity): string {
  return identity.kind === 'record' ? identity.id : identity.record.id
}

function workoutDisplayName(workout: WorkoutSample): string | undefined {
  return workout.title ?? workout.brandName
}

async function readIdempotentStepSamples(expectedCounts: readonly number[]): Promise<StepSample[]> {
  const samples: StepSample[] = []
  let cursor: string | undefined

  do {
    const page = await NitroHealth.readSteps({
      ...idempotentReadRange,
      limit: 1000,
      cursor,
    })

    samples.push(
      ...page.samples.filter(
        (sample) =>
          sample.startDate.getTime() === idempotentInterval.startDate.getTime() &&
          sample.endDate.getTime() === idempotentInterval.endDate.getTime() &&
          expectedCounts.includes(sample.count)
      )
    )
    cursor = page.nextCursor
  } while (cursor !== undefined)

  return samples
}

async function readIdempotentBloodPressure(
  expectedSystolic: readonly number[]
): Promise<BloodPressureSample[]> {
  const page = await NitroHealth.readBloodPressure({ ...idempotentReadRange, limit: 1000 })
  return page.samples.filter(
    (sample) =>
      sample.date.getTime() === idempotentInterval.startDate.getTime() &&
      expectedSystolic.includes(sample.systolicMmHg)
  )
}

async function readIdempotentBloodGlucose(
  expectedMmolPerLiter: readonly number[]
): Promise<BloodGlucoseSample[]> {
  const page = await NitroHealth.readBloodGlucose({ ...idempotentReadRange, limit: 1000 })
  return page.samples.filter(
    (sample) =>
      sample.date.getTime() === idempotentInterval.startDate.getTime() &&
      expectedMmolPerLiter.some(
        (expected) => Math.abs(sample.millimolesPerLiter - expected) < 0.001
      )
  )
}

async function readIdempotentBodyTemperature(
  expectedCelsius: readonly number[]
): Promise<BodyTemperatureSample[]> {
  const page = await NitroHealth.readBodyTemperature({ ...idempotentReadRange, limit: 1000 })
  return page.samples.filter(
    (sample) =>
      sample.date.getTime() === idempotentInterval.startDate.getTime() &&
      expectedCelsius.some((expected) => Math.abs(sample.celsius - expected) < 0.001)
  )
}

async function readIdempotentRespiratoryRate(
  expectedBreathsPerMinute: readonly number[]
): Promise<RespiratoryRateSample[]> {
  const page = await NitroHealth.readRespiratoryRate({ ...idempotentReadRange, limit: 1000 })
  return page.samples.filter(
    (sample) =>
      sample.date.getTime() === idempotentInterval.startDate.getTime() &&
      expectedBreathsPerMinute.some(
        (expected) => Math.abs(sample.breathsPerMinute - expected) < 0.001
      )
  )
}

async function readIdempotentWorkouts(
  expectedDisplayNames: readonly string[]
): Promise<WorkoutSample[]> {
  const page = await NitroHealth.readWorkouts({ ...idempotentReadRange, limit: 1000 })
  return page.samples.filter(
    (workout) =>
      workout.startDate.getTime() === idempotentInterval.startDate.getTime() &&
      workout.endDate.getTime() === idempotentInterval.endDate.getTime() &&
      workoutDisplayName(workout) !== undefined &&
      expectedDisplayNames.includes(workoutDisplayName(workout) ?? '')
  )
}

describe('NitroHealth idempotent saves (native)', () => {
  it('keeps exactly one step record when the same versioned save is retried', async () => {
    if (!(await hasVerifiedPermissions(stepReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteRecordsByTimeRange('steps', idempotentReadRange)

    try {
      const sample = {
        ...idempotentInterval,
        count: 710_001,
        sync: { id: 'nitro-health-harness-retry', version: 1 },
      }

      await NitroHealth.saveSteps([sample])
      await NitroHealth.saveSteps([sample])

      const samples = await readIdempotentStepSamples([710_001])
      if (Platform.OS === 'ios' && samples.length === 0) {
        return
      }

      expect(samples).toHaveLength(1)
      expect(samples[0]?.count).toBe(710_001)
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('steps', idempotentReadRange)
    }
  })

  it('replaces a step record at a higher version with platform-specific identity', async () => {
    if (!(await hasVerifiedPermissions(stepReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteRecordsByTimeRange('steps', idempotentReadRange)

    try {
      await NitroHealth.saveSteps([
        {
          ...idempotentInterval,
          count: 720_001,
          sync: { id: 'nitro-health-harness-higher-version', version: 1 },
        },
      ])

      const initialSamples = await readIdempotentStepSamples([720_001, 720_002])
      if (Platform.OS === 'ios' && initialSamples.length === 0) {
        return
      }

      expect(initialSamples).toHaveLength(1)
      const initialSample = initialSamples[0]
      if (initialSample === undefined) {
        return
      }

      await NitroHealth.saveSteps([
        {
          ...idempotentInterval,
          count: 720_002,
          sync: { id: 'nitro-health-harness-higher-version', version: 2 },
        },
      ])

      const replacementSamples = await readIdempotentStepSamples([720_001, 720_002])

      expect(replacementSamples).toHaveLength(1)
      const replacementSample = replacementSamples[0]
      if (replacementSample === undefined) {
        return
      }

      expect(replacementSample.count).toBe(720_002)
      if (Platform.OS === 'android') {
        expect(recordId(replacementSample.identity)).toBe(recordId(initialSample.identity))
      } else if (Platform.OS === 'ios') {
        expect(recordId(replacementSample.identity)).not.toBe(recordId(initialSample.identity))
      }
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('steps', idempotentReadRange)
    }
  })

  it('does not overwrite a step record with a lower version', async () => {
    if (!(await hasVerifiedPermissions(stepReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteRecordsByTimeRange('steps', idempotentReadRange)

    try {
      await NitroHealth.saveSteps([
        {
          ...idempotentInterval,
          count: 730_002,
          sync: { id: 'nitro-health-harness-lower-version', version: 2 },
        },
      ])

      const currentSamples = await readIdempotentStepSamples([730_001, 730_002])
      if (Platform.OS === 'ios' && currentSamples.length === 0) {
        return
      }

      expect(currentSamples).toHaveLength(1)
      const currentSample = currentSamples[0]
      if (currentSample === undefined) {
        return
      }

      await NitroHealth.saveSteps([
        {
          ...idempotentInterval,
          count: 730_001,
          sync: { id: 'nitro-health-harness-lower-version', version: 1 },
        },
      ])

      const afterLowerVersion = await readIdempotentStepSamples([730_001, 730_002])

      expect(afterLowerVersion).toHaveLength(1)
      expect(afterLowerVersion[0]?.count).toBe(730_002)
      expect(afterLowerVersion[0] ? recordId(afterLowerVersion[0].identity) : undefined).toBe(
        recordId(currentSample.identity)
      )
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('steps', idempotentReadRange)
    }
  })

  it('keeps exactly one workout when the same versioned save is retried', async () => {
    if (!(await hasVerifiedPermissions(workoutReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteRecordsByTimeRange('workout', idempotentReadRange)
    try {
      const workout = {
        ...idempotentInterval,
        activityType: 'running' as const,
        displayName: 'Nitro Retry Workout',
        timeZone: 'UTC',
        sync: { id: 'nitro-health-harness-workout-retry', version: 1 },
      }

      await NitroHealth.saveWorkout(workout)
      await NitroHealth.saveWorkout(workout)

      const workouts = await readIdempotentWorkouts(['Nitro Retry Workout'])
      if (Platform.OS === 'ios' && workouts.length === 0) {
        return
      }

      expect(workouts).toHaveLength(1)
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('workout', idempotentReadRange)
    }
  })

  // The acceptance gate for correlation sync metadata (plan risk R3): retries and versioned
  // replaces must leave exactly one reading — a leftover old correlation would surface as a
  // second sample here. Member samples carry derived '<id>#systolic'/'#diastolic' identities
  // so the same save replaces them alongside the correlation.
  it('keeps exactly one blood pressure reading when the same versioned save is retried', async () => {
    if (!(await hasVerifiedPermissions(bloodPressureReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteRecordsByTimeRange('bloodPressure', idempotentReadRange)
    try {
      const sample = {
        date: idempotentInterval.startDate,
        systolicMmHg: 141,
        diastolicMmHg: 91,
        sync: { id: 'nitro-health-harness-bp-retry', version: 1 },
      }

      await NitroHealth.saveBloodPressure([sample])
      await NitroHealth.saveBloodPressure([sample])

      const samples = await readIdempotentBloodPressure([141])
      if (Platform.OS === 'ios' && samples.length === 0) {
        return
      }

      expect(samples).toHaveLength(1)
      expect(samples[0]?.diastolicMmHg).toBe(91)
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('bloodPressure', idempotentReadRange)
    }
  })

  it('replaces a blood pressure reading at a higher version with platform-specific identity', async () => {
    if (!(await hasVerifiedPermissions(bloodPressureReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteRecordsByTimeRange('bloodPressure', idempotentReadRange)
    try {
      const syncId = 'nitro-health-harness-bp-higher-version'
      await NitroHealth.saveBloodPressure([
        {
          date: idempotentInterval.startDate,
          systolicMmHg: 142,
          diastolicMmHg: 92,
          sync: { id: syncId, version: 1 },
        },
      ])

      const initial = await readIdempotentBloodPressure([142, 143])
      if (Platform.OS === 'ios' && initial.length === 0) {
        return
      }
      expect(initial).toHaveLength(1)
      const initialSample = initial[0]
      if (initialSample === undefined) {
        return
      }

      await NitroHealth.saveBloodPressure([
        {
          date: idempotentInterval.startDate,
          systolicMmHg: 143,
          diastolicMmHg: 93,
          sync: { id: syncId, version: 2 },
        },
      ])

      const replacement = await readIdempotentBloodPressure([142, 143])
      expect(replacement).toHaveLength(1)
      const replacementSample = replacement[0]
      if (replacementSample === undefined) {
        return
      }

      expect(replacementSample.systolicMmHg).toBe(143)
      expect(replacementSample.diastolicMmHg).toBe(93)
      if (Platform.OS === 'android') {
        expect(recordId(replacementSample.identity)).toBe(recordId(initialSample.identity))
      } else if (Platform.OS === 'ios') {
        expect(recordId(replacementSample.identity)).not.toBe(recordId(initialSample.identity))
      }
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('bloodPressure', idempotentReadRange)
    }
  })

  it('keeps exactly one blood glucose reading when the same versioned save is retried', async () => {
    if (!(await hasVerifiedPermissions(bloodGlucoseReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteRecordsByTimeRange('bloodGlucose', idempotentReadRange)
    try {
      const sample = {
        date: idempotentInterval.startDate,
        millimolesPerLiter: 6.1,
        sync: { id: 'nitro-health-harness-bg-retry', version: 1 },
      }

      await NitroHealth.saveBloodGlucose([sample])
      await NitroHealth.saveBloodGlucose([sample])

      const samples = await readIdempotentBloodGlucose([6.1])
      if (Platform.OS === 'ios' && samples.length === 0) {
        return
      }

      expect(samples).toHaveLength(1)
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('bloodGlucose', idempotentReadRange)
    }
  })

  it('replaces a blood glucose reading at a higher version with platform-specific identity', async () => {
    if (!(await hasVerifiedPermissions(bloodGlucoseReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteRecordsByTimeRange('bloodGlucose', idempotentReadRange)
    try {
      const syncId = 'nitro-health-harness-bg-higher-version'
      await NitroHealth.saveBloodGlucose([
        {
          date: idempotentInterval.startDate,
          millimolesPerLiter: 6.2,
          sync: { id: syncId, version: 1 },
        },
      ])

      const initial = await readIdempotentBloodGlucose([6.2, 6.3])
      if (Platform.OS === 'ios' && initial.length === 0) {
        return
      }
      expect(initial).toHaveLength(1)
      const initialSample = initial[0]
      if (initialSample === undefined) {
        return
      }

      await NitroHealth.saveBloodGlucose([
        {
          date: idempotentInterval.startDate,
          millimolesPerLiter: 6.3,
          sync: { id: syncId, version: 2 },
        },
      ])

      const replacement = await readIdempotentBloodGlucose([6.2, 6.3])
      expect(replacement).toHaveLength(1)
      const replacementSample = replacement[0]
      if (replacementSample === undefined) {
        return
      }

      expect(Math.abs(replacementSample.millimolesPerLiter - 6.3)).toBeLessThan(0.001)
      if (Platform.OS === 'android') {
        expect(recordId(replacementSample.identity)).toBe(recordId(initialSample.identity))
      } else if (Platform.OS === 'ios') {
        expect(recordId(replacementSample.identity)).not.toBe(recordId(initialSample.identity))
      }
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('bloodGlucose', idempotentReadRange)
    }
  })

  it('keeps exactly one body temperature reading when the same versioned save is retried', async () => {
    if (!(await hasVerifiedPermissions(bodyTemperatureReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteRecordsByTimeRange('bodyTemperature', idempotentReadRange)
    try {
      const sample = {
        date: idempotentInterval.startDate,
        celsius: 37.1,
        sync: { id: 'nitro-health-harness-bt-retry', version: 1 },
      }

      await NitroHealth.saveBodyTemperature([sample])
      await NitroHealth.saveBodyTemperature([sample])

      const samples = await readIdempotentBodyTemperature([37.1])
      if (Platform.OS === 'ios' && samples.length === 0) {
        return
      }

      expect(samples).toHaveLength(1)
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('bodyTemperature', idempotentReadRange)
    }
  })

  it('replaces a body temperature reading at a higher version with platform-specific identity', async () => {
    if (!(await hasVerifiedPermissions(bodyTemperatureReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteRecordsByTimeRange('bodyTemperature', idempotentReadRange)
    try {
      const syncId = 'nitro-health-harness-bt-higher-version'
      await NitroHealth.saveBodyTemperature([
        {
          date: idempotentInterval.startDate,
          celsius: 37.1,
          sync: { id: syncId, version: 1 },
        },
      ])

      const initial = await readIdempotentBodyTemperature([37.1, 37.2])
      if (Platform.OS === 'ios' && initial.length === 0) {
        return
      }
      expect(initial).toHaveLength(1)
      const initialSample = initial[0]
      if (initialSample === undefined) {
        return
      }

      await NitroHealth.saveBodyTemperature([
        {
          date: idempotentInterval.startDate,
          celsius: 37.2,
          sync: { id: syncId, version: 2 },
        },
      ])

      const replacement = await readIdempotentBodyTemperature([37.1, 37.2])
      expect(replacement).toHaveLength(1)
      const replacementSample = replacement[0]
      if (replacementSample === undefined) {
        return
      }

      expect(Math.abs(replacementSample.celsius - 37.2)).toBeLessThan(0.001)
      if (Platform.OS === 'android') {
        expect(recordId(replacementSample.identity)).toBe(recordId(initialSample.identity))
      } else if (Platform.OS === 'ios') {
        expect(recordId(replacementSample.identity)).not.toBe(recordId(initialSample.identity))
      }
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('bodyTemperature', idempotentReadRange)
    }
  })

  it('keeps exactly one respiratory rate reading when the same versioned save is retried', async () => {
    if (!(await hasVerifiedPermissions(respiratoryRateReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteRecordsByTimeRange('respiratoryRate', idempotentReadRange)
    try {
      const sample = {
        date: idempotentInterval.startDate,
        breathsPerMinute: 16.5,
        sync: { id: 'nitro-health-harness-rr-retry', version: 1 },
      }

      await NitroHealth.saveRespiratoryRate([sample])
      await NitroHealth.saveRespiratoryRate([sample])

      const samples = await readIdempotentRespiratoryRate([16.5])
      if (Platform.OS === 'ios' && samples.length === 0) {
        return
      }

      expect(samples).toHaveLength(1)
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('respiratoryRate', idempotentReadRange)
    }
  })

  it('replaces a respiratory rate reading at a higher version with platform-specific identity', async () => {
    if (!(await hasVerifiedPermissions(respiratoryRateReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteRecordsByTimeRange('respiratoryRate', idempotentReadRange)
    try {
      const syncId = 'nitro-health-harness-rr-higher-version'
      await NitroHealth.saveRespiratoryRate([
        {
          date: idempotentInterval.startDate,
          breathsPerMinute: 16.5,
          sync: { id: syncId, version: 1 },
        },
      ])

      const initial = await readIdempotentRespiratoryRate([16.5, 17.5])
      if (Platform.OS === 'ios' && initial.length === 0) {
        return
      }
      expect(initial).toHaveLength(1)
      const initialSample = initial[0]
      if (initialSample === undefined) {
        return
      }

      await NitroHealth.saveRespiratoryRate([
        {
          date: idempotentInterval.startDate,
          breathsPerMinute: 17.5,
          sync: { id: syncId, version: 2 },
        },
      ])

      const replacement = await readIdempotentRespiratoryRate([16.5, 17.5])
      expect(replacement).toHaveLength(1)
      const replacementSample = replacement[0]
      if (replacementSample === undefined) {
        return
      }

      expect(Math.abs(replacementSample.breathsPerMinute - 17.5)).toBeLessThan(0.001)
      if (Platform.OS === 'android') {
        expect(recordId(replacementSample.identity)).toBe(recordId(initialSample.identity))
      } else if (Platform.OS === 'ios') {
        expect(recordId(replacementSample.identity)).not.toBe(recordId(initialSample.identity))
      }
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('respiratoryRate', idempotentReadRange)
    }
  })

  it('replaces a workout at a higher version with platform-specific identity', async () => {
    if (!(await hasVerifiedPermissions(workoutReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteRecordsByTimeRange('workout', idempotentReadRange)
    try {
      const syncId = 'nitro-health-harness-workout-higher-version'
      await NitroHealth.saveWorkout({
        ...idempotentInterval,
        activityType: 'running',
        displayName: 'Nitro Workout Version 1',
        sync: { id: syncId, version: 1 },
      })

      const initial = await readIdempotentWorkouts([
        'Nitro Workout Version 1',
        'Nitro Workout Version 2',
      ])
      if (Platform.OS === 'ios' && initial.length === 0) {
        return
      }
      expect(initial).toHaveLength(1)

      await NitroHealth.saveWorkout({
        ...idempotentInterval,
        activityType: 'running',
        displayName: 'Nitro Workout Version 2',
        sync: { id: syncId, version: 2 },
      })

      const replacement = await readIdempotentWorkouts([
        'Nitro Workout Version 1',
        'Nitro Workout Version 2',
      ])
      expect(replacement).toHaveLength(1)
      expect(replacement[0] ? workoutDisplayName(replacement[0]) : undefined).toBe(
        'Nitro Workout Version 2'
      )
      if (Platform.OS === 'android') {
        expect(replacement[0]?.title).toBe('Nitro Workout Version 2')
        expect(replacement[0]?.brandName).toBeUndefined()
        expect(replacement[0] ? recordId(replacement[0].identity) : undefined).toBe(
          initial[0] ? recordId(initial[0].identity) : undefined
        )
      } else if (Platform.OS === 'ios') {
        expect(replacement[0]?.title).toBeUndefined()
        expect(replacement[0]?.brandName).toBe('Nitro Workout Version 2')
        expect(replacement[0] ? recordId(replacement[0].identity) : undefined).not.toBe(
          initial[0] ? recordId(initial[0].identity) : undefined
        )
      }
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('workout', idempotentReadRange)
    }
  })
})
