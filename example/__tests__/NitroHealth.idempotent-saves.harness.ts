import { Platform } from 'react-native'
import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'
import type { HealthPermission, StepSample, WorkoutSample } from 'react-native-nitro-health'

import { hasVerifiedPermissions } from './support/harnessSupport'

const stepReadWritePermissions: HealthPermission[] = [
  { accessType: 'read', dataType: 'steps' },
  { accessType: 'write', dataType: 'steps' },
]
const workoutReadWritePermissions: HealthPermission[] = [
  { accessType: 'read', dataType: 'workout' },
  { accessType: 'write', dataType: 'workout' },
]
const idempotentInterval = {
  startDate: new Date('2004-06-01T09:00:00.000Z'),
  endDate: new Date('2004-06-01T09:30:00.000Z'),
}
const idempotentReadRange = {
  startDate: new Date('2004-06-01T00:00:00.000Z'),
  endDate: new Date('2004-06-02T00:00:00.000Z'),
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

async function readIdempotentWorkouts(expectedTitles: readonly string[]): Promise<WorkoutSample[]> {
  const page = await NitroHealth.readWorkouts({ ...idempotentReadRange, limit: 1000 })
  return page.samples.filter(
    (workout) =>
      workout.startDate.getTime() === idempotentInterval.startDate.getTime() &&
      workout.endDate.getTime() === idempotentInterval.endDate.getTime() &&
      workout.title !== undefined &&
      expectedTitles.includes(workout.title)
  )
}

describe('NitroHealth idempotent saves (native)', () => {
  it('keeps exactly one step record when the same versioned save is retried', async () => {
    if (!(await hasVerifiedPermissions(stepReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteSamplesByTimeRange('steps', idempotentReadRange)

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
      await NitroHealth.deleteSamplesByTimeRange('steps', idempotentReadRange)
    }
  })

  it('replaces a step record at a higher version with platform-specific identity', async () => {
    if (!(await hasVerifiedPermissions(stepReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteSamplesByTimeRange('steps', idempotentReadRange)

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
        expect(replacementSample.recordUuid).toBe(initialSample.recordUuid)
      } else if (Platform.OS === 'ios') {
        expect(replacementSample.recordUuid).not.toBe(initialSample.recordUuid)
      }
    } finally {
      await NitroHealth.deleteSamplesByTimeRange('steps', idempotentReadRange)
    }
  })

  it('does not overwrite a step record with a lower version', async () => {
    if (!(await hasVerifiedPermissions(stepReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteSamplesByTimeRange('steps', idempotentReadRange)

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
      expect(afterLowerVersion[0]?.recordUuid).toBe(currentSample.recordUuid)
    } finally {
      await NitroHealth.deleteSamplesByTimeRange('steps', idempotentReadRange)
    }
  })

  it('keeps exactly one workout when the same versioned save is retried', async () => {
    if (!(await hasVerifiedPermissions(workoutReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteSamplesByTimeRange('workout', idempotentReadRange)
    try {
      const workout = {
        ...idempotentInterval,
        activityType: 'running' as const,
        title: 'Nitro Retry Workout',
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
      await NitroHealth.deleteSamplesByTimeRange('workout', idempotentReadRange)
    }
  })

  it('replaces a workout at a higher version with platform-specific identity', async () => {
    if (!(await hasVerifiedPermissions(workoutReadWritePermissions))) {
      return
    }

    await NitroHealth.deleteSamplesByTimeRange('workout', idempotentReadRange)
    try {
      const syncId = 'nitro-health-harness-workout-higher-version'
      await NitroHealth.saveWorkout({
        ...idempotentInterval,
        activityType: 'running',
        title: 'Nitro Workout Version 1',
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
        title: 'Nitro Workout Version 2',
        sync: { id: syncId, version: 2 },
      })

      const replacement = await readIdempotentWorkouts([
        'Nitro Workout Version 1',
        'Nitro Workout Version 2',
      ])
      expect(replacement).toHaveLength(1)
      expect(replacement[0]?.title).toBe('Nitro Workout Version 2')
      if (Platform.OS === 'android') {
        expect(replacement[0]?.recordUuid).toBe(initial[0]?.recordUuid)
      } else if (Platform.OS === 'ios') {
        expect(replacement[0]?.recordUuid).not.toBe(initial[0]?.recordUuid)
      }
    } finally {
      await NitroHealth.deleteSamplesByTimeRange('workout', idempotentReadRange)
    }
  })
})
