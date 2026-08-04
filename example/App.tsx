import React, { useState } from 'react'
import { Pressable, ScrollView, Text, View, StyleSheet } from 'react-native'
import { NitroHealth } from 'react-native-nitro-health'
import type {
  AuthorizationRequestStatus,
  HealthAuthorizationResult,
  HealthDataType,
  HealthAvailabilityStatus,
  HealthPermission,
} from 'react-native-nitro-health'
import { SafeAreaView } from 'react-native-safe-area-context'

const readPermissions: Array<{ dataType: HealthDataType; label: string }> = [
  { dataType: 'steps', label: 'Steps' },
  { dataType: 'distance', label: 'Distance' },
  { dataType: 'activeEnergyBurned', label: 'Active Energy' },
  { dataType: 'heartRate', label: 'Heart Rate' },
  { dataType: 'sleep', label: 'Sleep' },
  { dataType: 'bodyMass', label: 'Body Mass' },
  { dataType: 'workout', label: 'Workouts' },
]

function lastDays(days: number): { startDate: Date; endDate: Date } {
  const endDate = new Date()

  return { startDate: new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000), endDate }
}

// Each read card normalizes its result to display lines so differently-shaped reads
// (statistics buckets, a single statistics object, sleep stages, workouts) share one renderer.
const readCards: Partial<
  Record<HealthDataType, { buttonLabel: string; execute: () => Promise<string[]> }>
> = {
  steps: {
    buttonLabel: 'Read daily step totals',
    execute: async () => {
      const buckets = await NitroHealth.readStatistics('steps', {
        ...lastDays(7),
        bucket: 'day',
        metrics: ['sum'],
      })
      const latestBuckets = buckets.slice(-7).reverse()

      return [
        `Daily step buckets: ${latestBuckets.length}`,
        ...latestBuckets.map(
          (bucket) => `${bucket.startDate.toLocaleDateString()}: ${bucket.sum ?? 0} steps`
        ),
      ]
    },
  },
  distance: {
    buttonLabel: 'Read daily distance totals',
    execute: async () => {
      const buckets = await NitroHealth.readStatistics('distance', {
        ...lastDays(7),
        bucket: 'day',
        metrics: ['sum'],
      })
      const latestBuckets = buckets.slice(-7).reverse()

      return [
        `Daily distance buckets: ${latestBuckets.length}`,
        ...latestBuckets.map(
          (bucket) => `${bucket.startDate.toLocaleDateString()}: ${Math.round(bucket.sum ?? 0)} m`
        ),
      ]
    },
  },
  activeEnergyBurned: {
    buttonLabel: 'Read daily active energy totals',
    execute: async () => {
      const buckets = await NitroHealth.readStatistics('activeEnergyBurned', {
        ...lastDays(7),
        bucket: 'day',
        metrics: ['sum'],
      })
      const latestBuckets = buckets.slice(-7).reverse()

      return [
        `Daily active-energy buckets: ${latestBuckets.length}`,
        ...latestBuckets.map(
          (bucket) =>
            `${bucket.startDate.toLocaleDateString()}: ${Math.round(bucket.sum ?? 0)} kcal`
        ),
      ]
    },
  },
  heartRate: {
    buttonLabel: 'Read Heart Rate stats',
    execute: async () => {
      const statistics = await NitroHealth.readHeartRateStatistics(lastDays(1))

      return [
        `Average bpm: ${statistics.average ?? 'n/a'}`,
        `Min bpm: ${statistics.min ?? 'n/a'}`,
        `Max bpm: ${statistics.max ?? 'n/a'}`,
      ]
    },
  },
  sleep: {
    buttonLabel: 'Read sleep samples',
    execute: async () => {
      const page = await NitroHealth.readSleepSamples({
        ...lastDays(7),
        limit: 50,
        ascending: false,
      })

      return [
        `Sleep samples: ${page.samples.length}${page.nextCursor ? ' (more available)' : ''}`,
        ...page.samples.map((sample) => `${sample.startDate.toLocaleString()}: ${sample.stage}`),
      ]
    },
  },
  bodyMass: {
    buttonLabel: 'Read body mass',
    execute: async () => {
      const page = await NitroHealth.readBodyMass({
        ...lastDays(7),
        limit: 20,
        ascending: false,
      })

      return [
        `Body mass samples: ${page.samples.length}${page.nextCursor ? ' (more available)' : ''}`,
        ...page.samples.map(
          (sample) => `${sample.startDate.toLocaleString()}: ${sample.kilograms.toFixed(1)} kg`
        ),
      ]
    },
  },
  workout: {
    buttonLabel: 'Read workouts',
    execute: async () => {
      const page = await NitroHealth.readWorkouts({
        ...lastDays(7),
        limit: 20,
        ascending: false,
      })

      return [
        `Workouts: ${page.samples.length}${page.nextCursor ? ' (more available)' : ''}`,
        ...page.samples.map(
          (workout) =>
            `${workout.startDate.toLocaleString()}: ${workout.activityType} (${Math.round(workout.durationSeconds / 60)} min)`
        ),
      ]
    },
  },
}

const writableDataTypes: HealthDataType[] = [
  'steps',
  'distance',
  'activeEnergyBurned',
  'heartRate',
  'bodyMass',
  'sleep',
  'workout',
]

// Each card runs one operation at a time, so in-flight work is a single finite activity
// instead of a boolean per operation.
type CardActivity =
  | 'checking'
  | 'requesting'
  | 'requestingWrite'
  | 'openingSettings'
  | 'reading'
  | 'saving'

// Permission state lives in the OS; readRequestStatus/readResult/writeResult are the last
// native answers we saw, cached for display. Gating decisions that must be correct (saving)
// re-consult native instead of trusting these caches.
interface CardState {
  activity?: CardActivity
  readRequestStatus?: AuthorizationRequestStatus
  readResult?: HealthAuthorizationResult
  writeResult?: HealthAuthorizationResult
  feedback?: { kind: 'error' | 'saved'; message: string }
}

function getAvailabilityLabel(status: HealthAvailabilityStatus): string {
  switch (status) {
    case 'available':
      return 'Available'
    case 'providerUpdateRequired':
      return 'Install or update Health Connect'
    case 'unavailable':
      return 'Unavailable'
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function App(): React.JSX.Element {
  const availabilityStatus = NitroHealth.getAvailabilityStatus()
  const isAvailable = availabilityStatus === 'available'
  const canOpenInstall = availabilityStatus === 'providerUpdateRequired'
  const [cards, setCards] = useState<Partial<Record<HealthDataType, CardState>>>({})
  const [readResults, setReadResults] = useState<Partial<Record<HealthDataType, string[]>>>({})
  const [openingHealthSettings, setOpeningHealthSettings] = useState(false)
  const [healthSettingsError, setHealthSettingsError] = useState<string>()

  async function openHealthSettings(): Promise<void> {
    setOpeningHealthSettings(true)
    setHealthSettingsError(undefined)

    try {
      const didOpen = await NitroHealth.openHealthSettings()
      if (!didOpen) {
        setHealthSettingsError('Health settings could not be opened on this device.')
      }
    } catch (error) {
      setHealthSettingsError(getErrorMessage(error))
    } finally {
      setOpeningHealthSettings(false)
    }
  }

  function updateCard(dataType: HealthDataType, patch: Partial<CardState>): void {
    setCards((current) => ({ ...current, [dataType]: { ...current[dataType], ...patch } }))
  }

  async function checkPermission(dataType: HealthDataType): Promise<void> {
    const permission: HealthPermission[] = [{ accessType: 'read', dataType }]
    updateCard(dataType, { activity: 'checking', feedback: undefined })

    try {
      const status = await NitroHealth.getRequestStatusForAuthorization(permission)
      updateCard(dataType, { activity: undefined, readRequestStatus: status })
    } catch (error) {
      updateCard(dataType, {
        activity: undefined,
        feedback: { kind: 'error', message: getErrorMessage(error) },
      })
    }
  }

  async function requestPermission(dataType: HealthDataType): Promise<void> {
    const permission: HealthPermission[] = [{ accessType: 'read', dataType }]
    updateCard(dataType, { activity: 'requesting', feedback: undefined, readResult: undefined })

    try {
      const result = await NitroHealth.requestAuthorization(permission)
      updateCard(dataType, {
        activity: undefined,
        readResult: result,
        readRequestStatus: result.requestStatus,
      })
    } catch (error) {
      updateCard(dataType, {
        activity: undefined,
        feedback: { kind: 'error', message: getErrorMessage(error) },
      })
    }
  }

  async function requestWritePermission(dataType: HealthDataType): Promise<void> {
    const permission: HealthPermission[] = [{ accessType: 'write', dataType }]
    updateCard(dataType, { activity: 'requestingWrite', feedback: undefined })

    try {
      const result = await NitroHealth.requestAuthorization(permission)
      updateCard(dataType, { activity: undefined, writeResult: result })
    } catch (error) {
      updateCard(dataType, {
        activity: undefined,
        feedback: { kind: 'error', message: getErrorMessage(error) },
      })
    }
  }

  async function openSettings(dataType: HealthDataType): Promise<void> {
    updateCard(dataType, { activity: 'openingSettings', feedback: undefined })

    try {
      const didOpen = await NitroHealth.openHealthSettings()
      updateCard(dataType, {
        activity: undefined,
        feedback: didOpen
          ? undefined
          : { kind: 'error', message: 'Health settings could not be opened on this device.' },
      })
    } catch (error) {
      updateCard(dataType, {
        activity: undefined,
        feedback: { kind: 'error', message: getErrorMessage(error) },
      })
    }
  }

  // Reading never gates on cached permission state: it asks native for read authorization
  // first (silent when already determined, prompts only when needed), then reads.
  async function readData(dataType: HealthDataType, read: () => Promise<void>): Promise<void> {
    updateCard(dataType, { activity: 'reading', feedback: undefined })

    try {
      const readResult = await NitroHealth.requestAuthorization([{ accessType: 'read', dataType }])

      if (readResult.deniedPermissions.length > 0) {
        updateCard(dataType, {
          activity: undefined,
          readResult,
          readRequestStatus: readResult.requestStatus,
          feedback: {
            kind: 'error',
            message: 'Read permission denied. Open health settings to enable it.',
          },
        })
        return
      }

      await read()
      updateCard(dataType, {
        activity: undefined,
        readResult,
        readRequestStatus: readResult.requestStatus,
      })
    } catch (error) {
      updateCard(dataType, {
        activity: undefined,
        feedback: { kind: 'error', message: getErrorMessage(error) },
      })
    }
  }

  async function runReadCard(dataType: HealthDataType): Promise<void> {
    const readCard = readCards[dataType]

    if (!readCard) {
      return
    }

    await readData(dataType, async () => {
      const lines = await readCard.execute()
      setReadResults((current) => ({ ...current, [dataType]: lines }))
    })
  }

  // Saving never gates on cached permission state: it asks native for write authorization
  // first (silent when already granted, prompts only when needed), then saves.
  // Each save covers the last minute only: Health Connect deduplicates overlapping intervals
  // when aggregating, so repeatedly saving the same wide window would not accumulate on Android.
  async function saveSample(dataType: HealthDataType): Promise<void> {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 60 * 1000)

    updateCard(dataType, { activity: 'saving', feedback: undefined })

    try {
      const writeResult = await NitroHealth.requestAuthorization([
        { accessType: 'write', dataType },
      ])

      if (writeResult.deniedPermissions.length > 0) {
        updateCard(dataType, {
          activity: undefined,
          writeResult,
          feedback: {
            kind: 'error',
            message: 'Write permission denied. Open health settings to enable it.',
          },
        })
        return
      }

      let message: string
      switch (dataType) {
        case 'steps':
          await NitroHealth.saveSteps([{ startDate, endDate, count: 250 }])
          message = 'Saved 250 steps over the last minute'
          break
        case 'distance':
          await NitroHealth.saveDistance([{ startDate, endDate, distanceMeters: 400 }])
          message = 'Saved 400 m over the last minute'
          break
        case 'activeEnergyBurned':
          await NitroHealth.saveActiveEnergyBurned([{ startDate, endDate, kilocalories: 45 }])
          message = 'Saved 45 kcal over the last minute'
          break
        case 'heartRate':
          await NitroHealth.saveHeartRate([{ date: endDate, bpm: 76 }])
          message = 'Saved a 76 bpm reading'
          break
        case 'bodyMass':
          await NitroHealth.saveBodyMass([{ date: endDate, kilograms: 72.5 }])
          message = 'Saved a 72.5 kg measurement'
          break
        case 'sleep':
          await NitroHealth.saveSleepSessions([
            {
              startDate,
              endDate,
              stages: [{ startDate, endDate, stage: 'asleep' }],
            },
          ])
          message = 'Saved a one-minute asleep session'
          break
        case 'workout':
          await NitroHealth.saveWorkout({
            startDate,
            endDate,
            activityType: 'running',
            title: 'Example run',
          })
          message = 'Saved a one-minute running workout'
          break
        default:
          updateCard(dataType, { activity: undefined })
          return
      }

      updateCard(dataType, {
        activity: undefined,
        writeResult,
        feedback: { kind: 'saved', message },
      })
    } catch (error) {
      updateCard(dataType, {
        activity: undefined,
        feedback: { kind: 'error', message: getErrorMessage(error) },
      })
    }
  }

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Health APIs</Text>
        <Text style={[styles.status, isAvailable ? styles.available : styles.unavailable]}>
          {getAvailabilityLabel(availabilityStatus)}
        </Text>
        <Text style={styles.detail}>Status: {availabilityStatus}</Text>
        <Pressable
          disabled={openingHealthSettings}
          onPress={() => {
            openHealthSettings()
          }}
          style={({ pressed }) => [
            styles.button,
            styles.settingsButton,
            styles.settingsLink,
            pressed ? styles.buttonPressed : null,
            openingHealthSettings ? styles.buttonDisabled : null,
          ]}
        >
          <Text style={styles.buttonText}>
            {openingHealthSettings ? 'Opening...' : 'Open health settings'}
          </Text>
        </Pressable>
        {healthSettingsError ? <Text style={styles.error}>{healthSettingsError}</Text> : null}
        {readPermissions.map(({ dataType, label }) => {
          const card = cards[dataType] ?? {}
          const isBusy = card.activity !== undefined
          const isChecking = card.activity === 'checking'
          const isRequesting = card.activity === 'requesting'
          const isRequestingWrite = card.activity === 'requestingWrite'
          const isOpeningSettings = card.activity === 'openingSettings'
          const isReading = card.activity === 'reading'
          const isSaving = card.activity === 'saving'
          const result = card.readResult
          const requestStatus = card.readRequestStatus
          const writeResult = card.writeResult
          const canOpenSettings =
            (result !== undefined && result.status !== 'granted') ||
            writeResult?.status === 'denied' ||
            writeResult?.status === 'partial'
          const canWrite = writableDataTypes.includes(dataType)
          const readCard = readCards[dataType]
          const readLines = readResults[dataType]

          return (
            <View key={dataType} style={styles.permissionCard}>
              <Text style={styles.cardTitle}>{label} permission</Text>
              <Text style={styles.detail}>
                {label} request status: {requestStatus ?? 'not checked'}
              </Text>
              {result ? (
                <Text style={styles.detail}>
                  {label} authorization result: {result.status}
                </Text>
              ) : null}
              {result ? (
                <Text style={styles.detail}>
                  {label} granted: {result.grantedPermissions.length} | denied:{' '}
                  {result.deniedPermissions.length} | unverifiable:{' '}
                  {result.unverifiablePermissions.length}
                </Text>
              ) : null}
              {writeResult ? (
                <Text style={styles.detail}>
                  {label} write authorization result: {writeResult.status}
                </Text>
              ) : null}
              {card.feedback ? (
                <Text style={card.feedback.kind === 'saved' ? styles.saved : styles.error}>
                  {card.feedback.message}
                </Text>
              ) : null}
              {readLines ? (
                <View style={styles.readResult}>
                  {readLines.map((line, index) => (
                    <Text key={`${dataType}-${index}`} style={styles.detail}>
                      {line}
                    </Text>
                  ))}
                </View>
              ) : null}
              <View style={styles.buttonRow}>
                <Pressable
                  disabled={!isAvailable || isBusy}
                  onPress={() => {
                    checkPermission(dataType)
                  }}
                  style={({ pressed }) => [
                    styles.button,
                    styles.secondaryButton,
                    pressed ? styles.buttonPressed : null,
                    !isAvailable || isBusy ? styles.buttonDisabled : null,
                  ]}
                >
                  <Text style={styles.buttonText}>
                    {isChecking ? 'Checking...' : `Check ${label} permission`}
                  </Text>
                </Pressable>
                <Pressable
                  disabled={!isAvailable || isBusy}
                  onPress={() => {
                    requestPermission(dataType)
                  }}
                  style={({ pressed }) => [
                    styles.button,
                    pressed ? styles.buttonPressed : null,
                    !isAvailable || isBusy ? styles.buttonDisabled : null,
                  ]}
                >
                  <Text style={styles.buttonText}>
                    {isRequesting ? 'Requesting...' : `Request ${label} permission`}
                  </Text>
                </Pressable>
                {canOpenSettings ? (
                  <Pressable
                    disabled={isBusy}
                    onPress={() => {
                      openSettings(dataType)
                    }}
                    style={({ pressed }) => [
                      styles.button,
                      styles.settingsButton,
                      pressed ? styles.buttonPressed : null,
                      isBusy ? styles.buttonDisabled : null,
                    ]}
                  >
                    <Text style={styles.buttonText}>
                      {isOpeningSettings ? 'Opening...' : 'Open health settings'}
                    </Text>
                  </Pressable>
                ) : null}
                {readCard ? (
                  <Pressable
                    disabled={!isAvailable || isBusy}
                    onPress={() => {
                      runReadCard(dataType)
                    }}
                    style={({ pressed }) => [
                      styles.button,
                      styles.readButton,
                      pressed ? styles.buttonPressed : null,
                      !isAvailable || isBusy ? styles.buttonDisabled : null,
                    ]}
                  >
                    <Text style={styles.buttonText}>
                      {isReading ? 'Reading...' : readCard.buttonLabel}
                    </Text>
                  </Pressable>
                ) : null}
                {canWrite ? (
                  <Pressable
                    disabled={!isAvailable || isBusy}
                    onPress={() => {
                      requestWritePermission(dataType)
                    }}
                    style={({ pressed }) => [
                      styles.button,
                      pressed ? styles.buttonPressed : null,
                      !isAvailable || isBusy ? styles.buttonDisabled : null,
                    ]}
                  >
                    <Text style={styles.buttonText}>
                      {isRequestingWrite ? 'Requesting...' : `Request ${label} write permission`}
                    </Text>
                  </Pressable>
                ) : null}
                {canWrite ? (
                  <Pressable
                    disabled={!isAvailable || isBusy}
                    onPress={() => {
                      saveSample(dataType)
                    }}
                    style={({ pressed }) => [
                      styles.button,
                      styles.writeButton,
                      pressed ? styles.buttonPressed : null,
                      !isAvailable || isBusy ? styles.buttonDisabled : null,
                    ]}
                  >
                    <Text style={styles.buttonText}>
                      {isSaving ? 'Saving...' : `Save sample ${label.toLowerCase()}`}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          )
        })}
        {canOpenInstall ? (
          <Pressable
            onPress={() => {
              NitroHealth.openHealthConnectInstall()
            }}
            style={({ pressed }) => [
              styles.button,
              styles.installButton,
              pressed ? styles.buttonPressed : null,
            ]}
          >
            <Text style={styles.buttonText}>Open Health Connect install</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 18,
    color: '#475569',
    marginBottom: 8,
  },
  status: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  available: {
    color: '#15803d',
  },
  unavailable: {
    color: '#b91c1c',
  },
  detail: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  permissionCard: {
    width: '100%',
    marginTop: 24,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  error: {
    marginTop: 12,
    fontSize: 14,
    color: '#b91c1c',
  },
  saved: {
    marginTop: 12,
    fontSize: 14,
    color: '#15803d',
  },
  buttonRow: {
    marginTop: 16,
    gap: 12,
  },
  readResult: {
    marginTop: 4,
  },
  button: {
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#475569',
  },
  settingsButton: {
    backgroundColor: '#64748b',
  },
  readButton: {
    backgroundColor: '#15803d',
  },
  writeButton: {
    backgroundColor: '#1d4ed8',
  },
  installButton: {
    marginTop: 24,
  },
  settingsLink: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
  buttonPressed: {
    backgroundColor: '#334155',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
})

export default App
