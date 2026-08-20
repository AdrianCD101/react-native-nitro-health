import { Platform } from 'react-native'
import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'
import type { HealthRecordChange } from 'react-native-nitro-health'

import { requireVerifiedPermissions } from './support/harnessSupport'

// Spike #100 acceptance suite: nutrition change tracking anchors on the food
// correlation (iOS) / NutritionRecord (Android). The delete test is the verdict —
// a deleted meal must surface as a delete change carrying the exact record
// identity the upsert reported, matching every other change-tracked type.

const nutritionPermissions = [
  { accessType: 'read' as const, dataType: 'nutrition' as const },
  { accessType: 'write' as const, dataType: 'nutrition' as const },
]

const roundTripRange = {
  startDate: new Date('2003-06-05T00:00:00.000Z'),
  endDate: new Date('2003-06-06T00:00:00.000Z'),
}
const roundTripInterval = {
  startDate: new Date('2003-06-05T09:00:00.000Z'),
  endDate: new Date('2003-06-05T09:30:00.000Z'),
}
const replacementRange = {
  startDate: new Date('2003-06-06T00:00:00.000Z'),
  endDate: new Date('2003-06-07T00:00:00.000Z'),
}
const replacementInterval = {
  startDate: new Date('2003-06-06T09:00:00.000Z'),
  endDate: new Date('2003-06-06T09:30:00.000Z'),
}
const shrinkRange = {
  startDate: new Date('2003-06-07T00:00:00.000Z'),
  endDate: new Date('2003-06-08T00:00:00.000Z'),
}
const shrinkInterval = {
  startDate: new Date('2003-06-07T09:00:00.000Z'),
  endDate: new Date('2003-06-07T09:30:00.000Z'),
}

async function drainNutritionChanges(changesToken: string): Promise<{
  changes: HealthRecordChange<'nutrition'>[]
  changesToken: string
}> {
  const changes: HealthRecordChange<'nutrition'>[] = []
  let currentToken = changesToken

  for (let pageIndex = 0; pageIndex < 20; pageIndex += 1) {
    const result = await NitroHealth.getChanges('nutrition', currentToken)
    if (result.tokenExpired) throw new Error('Fresh changes token expired unexpectedly')

    changes.push(...result.changes)
    currentToken = result.nextChangesToken
    if (!result.hasMore) return { changes, changesToken: currentToken }
  }

  throw new Error('Nutrition changes did not drain within 20 pages')
}

describe('NitroHealth nutrition changes (native)', () => {
  it('observes a saved and then deleted nutrition entry with a traceable record identity', async () => {
    await requireVerifiedPermissions(nutritionPermissions)

    await NitroHealth.deleteRecordsByTimeRange('nutrition', roundTripRange)
    try {
      const baselineToken = await NitroHealth.createChangesToken('nutrition')
      await NitroHealth.saveNutrition([
        {
          ...roundTripInterval,
          foodName: 'Nitro Harness Salad',
          mealType: 'lunch',
          energyKilocalories: 640,
          proteinGrams: 42.5,
          totalCarbohydrateGrams: 38.5,
          totalFatGrams: 22,
          dietaryFiberGrams: 6,
          sugarGrams: 9.5,
          sodiumMilligrams: 820,
          sync: { id: 'nitro-health-harness-nutrition-changes', version: 1 },
        },
      ])

      const afterSave = await drainNutritionChanges(baselineToken)
      const upsert = afterSave.changes.find(
        (change) =>
          change.type === 'upsert' &&
          change.samples.some((sample) => sample.foodName === 'Nitro Harness Salad')
      )

      // HealthKit hides read denials and returns no changes, even when writing is allowed.
      expect(upsert).toBeDefined()
      if (upsert === undefined || upsert.type !== 'upsert') return

      expect(
        upsert.samples.every(
          (sample) => sample.identity.kind === 'record' && sample.identity.id === upsert.record.id
        )
      ).toBe(true)
      const sample = upsert.samples[0]!
      expect(sample.mealType).toBe('lunch')
      expect(Math.abs((sample.energyKilocalories ?? 0) - 640)).toBeLessThan(0.001)
      expect(Math.abs((sample.proteinGrams ?? 0) - 42.5)).toBeLessThan(0.001)
      expect(Math.abs((sample.totalCarbohydrateGrams ?? 0) - 38.5)).toBeLessThan(0.001)
      expect(Math.abs((sample.totalFatGrams ?? 0) - 22)).toBeLessThan(0.001)
      expect(Math.abs((sample.dietaryFiberGrams ?? 0) - 6)).toBeLessThan(0.001)
      expect(Math.abs((sample.sugarGrams ?? 0) - 9.5)).toBeLessThan(0.001)
      expect(Math.abs((sample.sodiumMilligrams ?? 0) - 820)).toBeLessThan(0.001)
      expect(sample.startDate.getTime()).toBe(roundTripInterval.startDate.getTime())
      expect(sample.endDate.getTime()).toBe(roundTripInterval.endDate.getTime())

      const deletion = await NitroHealth.deleteRecordsByIds('nutrition', [upsert.record])
      expect(deletion.status).toBe('completed')

      // THE spike verdict: the delete change must identify the exact meal that died.
      const afterDelete = await drainNutritionChanges(afterSave.changesToken)
      expect(
        afterDelete.changes.some(
          (change) => change.type === 'delete' && change.record.id === upsert.record.id
        )
      ).toBe(true)
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('nutrition', roundTripRange)
    }
  })

  it('reports platform-specific changes when a higher nutrition version replaces an entry', async () => {
    await requireVerifiedPermissions(nutritionPermissions)

    await NitroHealth.deleteRecordsByTimeRange('nutrition', replacementRange)
    try {
      const baselineToken = await NitroHealth.createChangesToken('nutrition')
      await NitroHealth.saveNutrition([
        {
          ...replacementInterval,
          proteinGrams: 41,
          energyKilocalories: 500,
          sync: { id: 'nitro-health-harness-nutrition-replacement', version: 1 },
        },
      ])

      const afterInitialSave = await drainNutritionChanges(baselineToken)
      const initialUpsert = afterInitialSave.changes.find(
        (change) =>
          change.type === 'upsert' &&
          change.samples.some((sample) => Math.abs((sample.proteinGrams ?? 0) - 41) < 0.001)
      )

      // HealthKit hides read denials and returns no changes, even when writing is allowed.
      expect(initialUpsert).toBeDefined()
      if (initialUpsert === undefined || initialUpsert.type !== 'upsert') return

      await NitroHealth.saveNutrition([
        {
          ...replacementInterval,
          proteinGrams: 43,
          energyKilocalories: 520,
          sync: { id: 'nitro-health-harness-nutrition-replacement', version: 2 },
        },
      ])

      const afterReplacement = await drainNutritionChanges(afterInitialSave.changesToken)
      const replacementUpserts = afterReplacement.changes.filter(
        (change) =>
          change.type === 'upsert' &&
          change.samples.some((sample) => Math.abs((sample.proteinGrams ?? 0) - 43) < 0.001)
      )

      expect(replacementUpserts).toHaveLength(1)
      const replacementUpsert = replacementUpserts[0]
      if (replacementUpsert === undefined || replacementUpsert.type !== 'upsert') return

      const deletedInitialRecord = afterReplacement.changes.some(
        (change) => change.type === 'delete' && change.record.id === initialUpsert.record.id
      )

      if (Platform.OS === 'android') {
        expect(replacementUpsert.record.id).toBe(initialUpsert.record.id)
        expect(deletedInitialRecord).toBe(false)
      } else if (Platform.OS === 'ios') {
        expect(replacementUpsert.record.id).not.toBe(initialUpsert.record.id)
        expect(deletedInitialRecord).toBe(true)
      }
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('nutrition', replacementRange)
    }
  })

  it('drops a removed nutrient on re-save without leaking member-level noise', async () => {
    await requireVerifiedPermissions(nutritionPermissions)

    await NitroHealth.deleteRecordsByTimeRange('nutrition', shrinkRange)
    try {
      const baselineToken = await NitroHealth.createChangesToken('nutrition')
      await NitroHealth.saveNutrition([
        {
          ...shrinkInterval,
          proteinGrams: 40,
          sugarGrams: 12,
          sync: { id: 'nitro-health-harness-nutrition-shrink', version: 1 },
        },
      ])

      const afterInitialSave = await drainNutritionChanges(baselineToken)
      const initialUpsert = afterInitialSave.changes.find(
        (change) =>
          change.type === 'upsert' &&
          change.samples.some((sample) => Math.abs((sample.sugarGrams ?? 0) - 12) < 0.001)
      )

      // HealthKit hides read denials and returns no changes, even when writing is allowed.
      expect(initialUpsert).toBeDefined()
      if (initialUpsert === undefined || initialUpsert.type !== 'upsert') return

      // The v2 save drops sugar entirely; on iOS the stale sugar member is deleted by
      // the save path and must not survive in the replacement upsert.
      await NitroHealth.saveNutrition([
        {
          ...shrinkInterval,
          proteinGrams: 40,
          sync: { id: 'nitro-health-harness-nutrition-shrink', version: 2 },
        },
      ])

      const afterShrink = await drainNutritionChanges(afterInitialSave.changesToken)
      const shrinkUpserts = afterShrink.changes.filter(
        (change): change is HealthRecordChange<'nutrition'> & { type: 'upsert' } =>
          change.type === 'upsert'
      )

      expect(shrinkUpserts).toHaveLength(1)
      const shrinkSample = shrinkUpserts[0]?.samples[0]
      expect(shrinkSample).toBeDefined()
      if (shrinkSample === undefined) return

      expect(Math.abs((shrinkSample.proteinGrams ?? 0) - 40)).toBeLessThan(0.001)
      expect(shrinkSample.sugarGrams).toBeUndefined()

      // Member-level cleanup of the dropped nutrient must not surface as extra
      // correlation-level changes beyond the replacement itself.
      const foreignChanges = afterShrink.changes.filter((change) => {
        if (change.type === 'upsert') return !shrinkUpserts.includes(change)
        return Platform.OS === 'android' || change.record.id !== initialUpsert.record.id
      })
      expect(foreignChanges).toEqual([])
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('nutrition', shrinkRange)
    }
  })

  it('drains a fresh token empty once every harness entry is cleaned up', async () => {
    await requireVerifiedPermissions(nutritionPermissions)

    const token = await NitroHealth.createChangesToken('nutrition')
    const result = await NitroHealth.getChanges('nutrition', token)

    expect(result.tokenExpired).toBe(false)
    if (result.tokenExpired) return
    expect(result.changes).toEqual([])
    expect(result.hasMore).toBe(false)
  })
})
