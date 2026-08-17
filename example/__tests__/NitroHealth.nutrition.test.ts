import { mockNitroHealth, nativeRecordMetadata } from './support/mockNitroHealth'

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

import { NitroHealth } from 'react-native-nitro-health'

describe('NitroHealth nutrition contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('maps native nutrition entries to public samples with every field', async () => {
    const startDate = new Date('2026-01-01T12:00:00.000Z')
    const endDate = new Date('2026-01-01T12:30:00.000Z')
    mockNitroHealth.readNutrition.mockResolvedValue({
      samples: [
        {
          ...nativeRecordMetadata('nutrition-1'),
          startTimeMs: startDate.getTime(),
          endTimeMs: endDate.getTime(),
          foodName: 'Chicken salad',
          mealType: 'lunch',
          energyKilocalories: 640,
          proteinGrams: 42,
          totalCarbohydrateGrams: 38.5,
          totalFatGrams: 22,
          dietaryFiberGrams: 6,
          sugarGrams: 9.5,
          sodiumMilligrams: 820,
        },
      ],
      nextCursor: 'nutrition-cursor',
    })

    await expect(NitroHealth.readNutrition({ startDate, endDate })).resolves.toEqual({
      samples: [
        {
          identity: { kind: 'record', id: 'nutrition-1' },
          origin: { identifier: 'com.example.health' },
          recordingMethod: 'unknown',
          startDate,
          endDate,
          foodName: 'Chicken salad',
          mealType: 'lunch',
          energyKilocalories: 640,
          proteinGrams: 42,
          totalCarbohydrateGrams: 38.5,
          totalFatGrams: 22,
          dietaryFiberGrams: 6,
          sugarGrams: 9.5,
          sodiumMilligrams: 820,
        },
      ],
      nextCursor: 'nutrition-cursor',
    })
  })

  it('omits absent nutrients and metadata instead of fabricating values', async () => {
    const startDate = new Date('2026-01-01T12:00:00.000Z')
    const endDate = new Date('2026-01-01T12:30:00.000Z')
    mockNitroHealth.readNutrition.mockResolvedValue({
      samples: [
        {
          ...nativeRecordMetadata('nutrition-2'),
          startTimeMs: startDate.getTime(),
          endTimeMs: endDate.getTime(),
          proteinGrams: 30,
        },
      ],
    })

    const page = await NitroHealth.readNutrition({ startDate, endDate })
    expect(page.samples).toEqual([
      {
        identity: { kind: 'record', id: 'nutrition-2' },
        origin: { identifier: 'com.example.health' },
        recordingMethod: 'unknown',
        startDate,
        endDate,
        proteinGrams: 30,
      },
    ])
    expect(page.samples[0]).not.toHaveProperty('foodName')
    expect(page.samples[0]).not.toHaveProperty('mealType')
    expect(page.samples[0]).not.toHaveProperty('energyKilocalories')
  })

  it('passes every field through to the native save unchanged', async () => {
    const startDate = new Date('2026-01-01T12:00:00.000Z')
    const endDate = new Date('2026-01-01T12:30:00.000Z')

    await NitroHealth.saveNutrition([
      {
        startDate,
        endDate,
        foodName: 'Chicken salad',
        mealType: 'lunch',
        energyKilocalories: 640,
        proteinGrams: 42,
        totalCarbohydrateGrams: 38.5,
        totalFatGrams: 22,
        dietaryFiberGrams: 6,
        sugarGrams: 9.5,
        sodiumMilligrams: 820,
        recordingMethod: 'manual',
        sync: { id: 'lunch-2026-01-01', version: 2 },
      },
    ])

    expect(mockNitroHealth.saveNutrition).toHaveBeenCalledWith([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        foodName: 'Chicken salad',
        mealType: 'lunch',
        energyKilocalories: 640,
        proteinGrams: 42,
        totalCarbohydrateGrams: 38.5,
        totalFatGrams: 22,
        dietaryFiberGrams: 6,
        sugarGrams: 9.5,
        sodiumMilligrams: 820,
        writeMetadata: {
          provenance: { recordingMethod: 'manual' },
          sync: { id: 'lunch-2026-01-01', version: 2 },
        },
      },
    ])
  })

  it('rejects entries without any nutrient value', async () => {
    const startDate = new Date('2026-01-01T12:00:00.000Z')
    const endDate = new Date('2026-01-01T12:30:00.000Z')

    await expect(
      NitroHealth.saveNutrition([{ startDate, endDate, foodName: 'Water only' }])
    ).rejects.toThrow('samples[0]: at least one nutrient value is required')
    expect(mockNitroHealth.saveNutrition).not.toHaveBeenCalled()
  })

  it('rejects invalid nutrient values and meal types before crossing the native boundary', async () => {
    const startDate = new Date('2026-01-01T12:00:00.000Z')
    const endDate = new Date('2026-01-01T12:30:00.000Z')

    await expect(
      NitroHealth.saveNutrition([{ startDate, endDate, proteinGrams: -1 }])
    ).rejects.toThrow('samples[0]: proteinGrams must be a non-negative number')
    await expect(
      NitroHealth.saveNutrition([{ startDate, endDate, energyKilocalories: 100_001 }])
    ).rejects.toThrow('samples[0]: energyKilocalories must not exceed 100000')
    await expect(
      NitroHealth.saveNutrition([
        // @ts-expect-error deliberately invalid meal type
        { startDate, endDate, proteinGrams: 10, mealType: 'brunch' },
      ])
    ).rejects.toThrow('samples[0]: mealType must be breakfast, lunch, dinner, or snack')
    await expect(
      NitroHealth.saveNutrition([{ startDate, endDate, proteinGrams: 10, foodName: '  ' }])
    ).rejects.toThrow('samples[0]: foodName must be a non-empty string')
    expect(mockNitroHealth.saveNutrition).not.toHaveBeenCalled()
  })

  it('rejects readStatistics for the raw nutrition type', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-02T00:00:00.000Z')

    await expect(
      NitroHealth.readStatistics('nutrition', {
        startDate,
        endDate,
        bucket: 'day',
        metrics: ['sum'],
      })
    ).rejects.toThrow("readStatistics does not support the 'nutrition' data type")
  })

  it('rejects change tracking for nutrition until the correlation spike lands', async () => {
    // @ts-expect-error nutrition is excluded from ChangeTrackedHealthDataType
    await expect(NitroHealth.createChangesToken('nutrition')).rejects.toThrow(
      "Change tracking is not supported for 'nutrition' yet"
    )
    // @ts-expect-error nutrition is excluded from ChangeTrackedHealthDataType
    await expect(NitroHealth.getChanges('nutrition', 'token')).rejects.toThrow(
      "Change tracking is not supported for 'nutrition' yet"
    )
    await expect(
      NitroHealth.configureBackgroundChanges({
        // @ts-expect-error nutrition is excluded from ChangeTrackedHealthDataType
        dataTypes: ['nutrition'],
        frequency: 'daily',
      })
    ).rejects.toThrow(
      "configuration.dataTypes[0]: change tracking is not supported for 'nutrition' yet"
    )
    expect(mockNitroHealth.createChangesToken).not.toHaveBeenCalled()
    expect(mockNitroHealth.getChanges).not.toHaveBeenCalled()
    expect(mockNitroHealth.configureBackgroundChanges).not.toHaveBeenCalled()
  })
})
