import { mockNitroHealth } from './support/mockNitroHealth'

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

import { NitroHealth } from 'react-native-nitro-health'

const sessionStart = new Date('2026-01-11T03:00:00.000Z')
const sessionEnd = new Date('2026-01-11T11:30:00.000Z')

describe('NitroHealth sleep session save contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('maps and chronologically sorts a sleep session without mutating the input', async () => {
    const laterStage = {
      startDate: new Date('2026-01-11T06:30:00.000Z'),
      endDate: new Date('2026-01-11T08:00:00.000Z'),
      stage: 'asleepDeep' as const,
    }
    const earlierStage = {
      startDate: new Date('2026-01-11T04:00:00.000Z'),
      endDate: new Date('2026-01-11T06:30:00.000Z'),
      stage: 'asleepCore' as const,
    }
    const stages = [laterStage, earlierStage]
    mockNitroHealth.saveSleepSessions.mockResolvedValueOnce({
      storedRecordingMethods: ['manual'],
    })

    await expect(
      NitroHealth.saveSleepSessions([
        {
          startDate: sessionStart,
          endDate: sessionEnd,
          timeZone: 'America/New_York',
          device: { type: 'watch', manufacturer: 'Example', model: 'Sleep Watch' },
          recordingMethod: 'automatically-recorded',
          sync: { id: 'night-2026-01-11', version: 2 },
          metadata: { android: { title: 'Night sleep', notes: 'travel day' } },
          stages,
        },
      ])
    ).resolves.toEqual({ status: 'completed', storedRecordingMethods: ['manual'] })

    expect(stages).toEqual([laterStage, earlierStage])
    expect(mockNitroHealth.saveSleepSessions).toHaveBeenCalledWith([
      {
        startTimeMs: sessionStart.getTime(),
        endTimeMs: sessionEnd.getTime(),
        writeMetadata: {
          provenance: {
            deviceType: 'watch',
            deviceManufacturer: 'Example',
            deviceModel: 'Sleep Watch',
            recordingMethod: 'automaticallyRecorded',
          },
          sync: { id: 'night-2026-01-11', version: 2 },
          timeZone: 'America/New_York',
        },
        androidTitle: 'Night sleep',
        androidNotes: 'travel day',
        stages: [
          {
            startTimeMs: earlierStage.startDate.getTime(),
            endTimeMs: earlierStage.endDate.getTime(),
            stage: 'asleepCore',
          },
          {
            startTimeMs: laterStage.startDate.getTime(),
            endTimeMs: laterStage.endDate.getTime(),
            stage: 'asleepDeep',
          },
        ],
      },
    ])
  })

  it('accepts stage-less sessions and adjacent stages', async () => {
    mockNitroHealth.saveSleepSessions.mockResolvedValueOnce({
      storedRecordingMethods: ['unknown', 'unknown'],
    })

    await NitroHealth.saveSleepSessions([
      { startDate: sessionStart, endDate: sessionEnd },
      {
        startDate: sessionStart,
        endDate: sessionEnd,
        stages: [
          {
            startDate: sessionStart,
            endDate: new Date('2026-01-11T06:00:00.000Z'),
            stage: 'asleep',
          },
          {
            startDate: new Date('2026-01-11T06:00:00.000Z'),
            endDate: sessionEnd,
            stage: 'awake',
          },
        ],
      },
    ])

    expect(mockNitroHealth.saveSleepSessions).toHaveBeenCalledTimes(1)
  })

  it('rejects invalid session and stage intervals before crossing native', async () => {
    await expect(NitroHealth.saveSleepSessions([])).rejects.toThrow(
      'At least one sleep session is required'
    )
    await expect(
      NitroHealth.saveSleepSessions([{ startDate: sessionEnd, endDate: sessionStart }])
    ).rejects.toThrow('sessions[0]: startDate must be before endDate')
    await expect(
      NitroHealth.saveSleepSessions([
        {
          startDate: sessionStart,
          endDate: sessionEnd,
          stages: [
            {
              startDate: new Date('2026-01-11T02:59:00.000Z'),
              endDate: new Date('2026-01-11T04:00:00.000Z'),
              stage: 'asleep',
            },
          ],
        },
      ])
    ).rejects.toThrow('sessions[0].stages[0]: interval must be contained')

    expect(mockNitroHealth.saveSleepSessions).not.toHaveBeenCalled()
  })

  it('rejects overlapping stages and non-portable stage values', async () => {
    await expect(
      NitroHealth.saveSleepSessions([
        {
          startDate: sessionStart,
          endDate: sessionEnd,
          stages: [
            {
              startDate: new Date('2026-01-11T04:00:00.000Z'),
              endDate: new Date('2026-01-11T06:00:00.000Z'),
              stage: 'asleep',
            },
            {
              startDate: new Date('2026-01-11T05:00:00.000Z'),
              endDate: new Date('2026-01-11T07:00:00.000Z'),
              stage: 'asleepCore',
            },
          ],
        },
      ])
    ).rejects.toThrow('sessions[0].stages[1]: interval overlaps sessions[0].stages[0]')

    await expect(
      NitroHealth.saveSleepSessions([
        {
          startDate: sessionStart,
          endDate: sessionEnd,
          stages: [
            {
              startDate: sessionStart,
              endDate: sessionEnd,
              stage: 'outOfBed',
            },
          ],
        } as never,
      ])
    ).rejects.toThrow('stage must be awake, asleep, asleepCore, asleepDeep, or asleepREM')
  })

  it('rejects unsupported or blank platform metadata before crossing native', async () => {
    await expect(
      NitroHealth.saveSleepSessions([
        {
          startDate: sessionStart,
          endDate: sessionEnd,
          metadata: { android: { title: '  ' } },
        },
      ])
    ).rejects.toThrow(
      'sessions[0]: metadata.android.title must be a non-empty string when provided'
    )
    await expect(
      NitroHealth.saveSleepSessions([
        {
          startDate: sessionStart,
          endDate: sessionEnd,
          metadata: { ios: { title: 'nope' } } as never,
        },
      ])
    ).rejects.toThrow('sessions[0]: metadata.ios is unsupported')

    expect(mockNitroHealth.saveSleepSessions).not.toHaveBeenCalled()
  })

  it('rejects duplicate sync ids across sessions before crossing native', async () => {
    await expect(
      NitroHealth.saveSleepSessions([
        { startDate: sessionStart, endDate: sessionEnd, sync: { id: 'night-1', version: 1 } },
        { startDate: sessionStart, endDate: sessionEnd, sync: { id: 'night-1', version: 1 } },
      ])
    ).rejects.toThrow('samples[1]: sync.id duplicates samples[0].sync.id within this save call')

    expect(mockNitroHealth.saveSleepSessions).not.toHaveBeenCalled()
  })

  it('rejects invalid time-zone values before crossing native', async () => {
    for (const timeZone of ['', '  ', 42]) {
      await expect(
        NitroHealth.saveSleepSessions([
          { startDate: sessionStart, endDate: sessionEnd, timeZone: timeZone as never },
        ])
      ).rejects.toThrow('timeZone must be a non-empty IANA time-zone identifier')
    }

    expect(mockNitroHealth.saveSleepSessions).not.toHaveBeenCalled()
  })

  it('reports the session path for invalid device provenance', async () => {
    await expect(
      NitroHealth.saveSleepSessions([
        {
          startDate: sessionStart,
          endDate: sessionEnd,
          device: { model: '' },
        },
      ])
    ).rejects.toThrow('sessions[0]: device.model must be a non-empty string')

    expect(mockNitroHealth.saveSleepSessions).not.toHaveBeenCalled()
  })
})
