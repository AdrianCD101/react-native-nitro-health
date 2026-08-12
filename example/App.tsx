import React, { useEffect, useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { NitroHealth } from 'react-native-nitro-health'
import type {
  BackgroundChangesConfigurationResult,
  HealthAdditionalAccess,
  HealthAuthorizationResult,
  HealthCapabilitiesResult,
  HealthDataOrigin,
  HealthDataType,
  HealthMetricValue,
  HealthPermission,
  HealthPermissionStatusResult,
  HealthSampleIdentity,
  ListenerSubscription,
  WorkoutActivity,
  WritableHealthDataType,
} from 'react-native-nitro-health'
import { SafeAreaView } from 'react-native-safe-area-context'

import { allHealthPermissions, writableDataTypes } from './healthPermissions'

const readPermissions: Array<{ dataType: HealthDataType; label: string }> = [
  { dataType: 'steps', label: 'Steps' },
  { dataType: 'distance', label: 'Distance' },
  { dataType: 'activeEnergyBurned', label: 'Active Energy' },
  { dataType: 'floorsClimbed', label: 'Floors Climbed' },
  { dataType: 'heartRate', label: 'Heart Rate' },
  { dataType: 'sleep', label: 'Sleep' },
  { dataType: 'bodyMass', label: 'Body Mass' },
  { dataType: 'workout', label: 'Workouts' },
]

function isWritableDataType(dataType: HealthDataType): dataType is WritableHealthDataType {
  return writableDataTypes.includes(dataType as WritableHealthDataType)
}

function lastDays(days: number): { startDate: Date; endDate: Date } {
  const endDate = new Date()
  return { startDate: new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000), endDate }
}

function formatIdentity(identity: HealthSampleIdentity): string {
  if (identity.kind === 'record') {
    return `record ${identity.id}`
  }
  return `child ${identity.id} of record ${identity.record.id}`
}

function formatOrigin(origin: HealthDataOrigin): string {
  return origin.displayName ? `${origin.displayName} (${origin.identifier})` : origin.identifier
}

function formatSampleContext(identity: HealthSampleIdentity, origin: HealthDataOrigin): string {
  return `${formatIdentity(identity)} | source ${formatOrigin(origin)}`
}

function formatMetric(metric: HealthMetricValue, unit: string): string {
  return metric.status === 'available' ? `${Math.round(metric.value)} ${unit}` : metric.status
}

function formatActivity(activity: WorkoutActivity): string {
  return activity.status === 'known'
    ? `${activity.type} (${activity.portability}, ${activity.mapping})`
    : 'unknown activity'
}

function formatPermissionStatuses(result: HealthPermissionStatusResult): string {
  const entries = result.statuses
    .map(({ permission, status }) => `${permission.accessType}:${permission.dataType}=${status}`)
    .join(', ')
  return result.status === 'available'
    ? entries
    : `unavailable (${result.availability.reason}); ${entries}`
}

function formatAuthorization(result: HealthAuthorizationResult): string {
  const entries = result.statuses
    .map(({ permission, status }) => `${permission.accessType}:${permission.dataType}=${status}`)
    .join(', ')
  return result.status === 'completed'
    ? entries
    : `unavailable (${result.availability.reason}); ${entries}`
}

function formatBackgroundResult(result: BackgroundChangesConfigurationResult): string {
  if (result.status === 'completed') {
    return 'Observer delivery configured'
  }
  if (result.status === 'user-action-required') {
    return `Polling requires ${result.scheduling} scheduling; background read: ${result.backgroundRead}`
  }
  return 'Background changes unavailable'
}

function authorizationAllowsOperation(result: HealthAuthorizationResult): boolean {
  return (
    result.status === 'completed' &&
    result.statuses.every(({ permission, status }) =>
      permission.accessType === 'write'
        ? status === 'granted'
        : status === 'granted' || status === 'unverifiable'
    )
  )
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

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
      return [
        `Daily step buckets: ${buckets.length}`,
        ...buckets
          .slice(-7)
          .reverse()
          .map((bucket) => `${bucket.startDate.toLocaleDateString()}: ${bucket.sum ?? 0} steps`),
      ]
    },
  },
  distance: {
    buttonLabel: 'Read distance samples',
    execute: async () => {
      const page = await NitroHealth.readDistance({
        ...lastDays(7),
        limit: 20,
        ascending: false,
      })
      return [
        `Distance samples: ${page.samples.length}${page.nextCursor ? ' (more available)' : ''}`,
        ...page.samples.map(
          (sample) =>
            `${sample.startDate.toLocaleString()}: ${Math.round(sample.distanceMeters)} m | scope ${sample.scope} | ${formatSampleContext(sample.identity, sample.origin)}`
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
      return [
        `Daily active-energy buckets: ${buckets.length}`,
        ...buckets
          .slice(-7)
          .reverse()
          .map(
            (bucket) =>
              `${bucket.startDate.toLocaleDateString()}: ${Math.round(bucket.sum ?? 0)} kcal`
          ),
      ]
    },
  },
  floorsClimbed: {
    buttonLabel: 'Read daily floors climbed',
    execute: async () => {
      const buckets = await NitroHealth.readStatistics('floorsClimbed', {
        ...lastDays(7),
        bucket: 'day',
        metrics: ['sum'],
      })
      return [
        `Daily floors-climbed buckets: ${buckets.length}`,
        ...buckets
          .slice(-7)
          .reverse()
          .map((bucket) => `${bucket.startDate.toLocaleDateString()}: ${bucket.sum ?? 0}`),
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
        ...page.samples.map((sample) => {
          const sleepDetail =
            sample.kind === 'session-envelope'
              ? `session envelope; stage data ${sample.stageData}`
              : `stage ${sample.stage}${sample.identity.kind === 'record-child' ? `; parent ${sample.identity.record.id}` : ''}`
          return `${sample.startDate.toLocaleString()}: ${sleepDetail} | ${formatSampleContext(sample.identity, sample.origin)}`
        }),
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
          (sample) =>
            `${sample.startDate.toLocaleString()}: ${sample.kilograms.toFixed(1)} kg | ${formatSampleContext(sample.identity, sample.origin)}`
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
            `${workout.startDate.toLocaleString()}: ${formatActivity(workout.activity)} | elapsed ${Math.round(workout.elapsedDurationSeconds / 60)} min | active ${formatMetric(workout.activeDuration, 'sec')} | title ${workout.title ?? 'n/a'} | brand ${workout.brandName ?? 'n/a'} | distance ${formatMetric(workout.totalDistance, 'm')} | energy ${formatMetric(workout.totalActiveEnergyBurned, 'kcal')} | ${formatSampleContext(workout.identity, workout.origin)}`
        ),
      ]
    },
  },
}

type CardActivity = 'checking' | 'requesting' | 'requestingWrite' | 'reading' | 'saving'

interface CardState {
  activity?: CardActivity
  statusResult?: HealthPermissionStatusResult
  readResult?: HealthAuthorizationResult
  writeResult?: HealthAuthorizationResult
  feedback?: { kind: 'error' | 'saved'; message: string }
}

function App(): React.JSX.Element {
  const availability = NitroHealth.getAvailability()
  const isAvailable = availability.status === 'available'
  const [capabilities, setCapabilities] = useState<HealthCapabilitiesResult>()
  const [cards, setCards] = useState<Partial<Record<HealthDataType, CardState>>>({})
  const [readResults, setReadResults] = useState<Partial<Record<HealthDataType, string[]>>>({})
  const [workflowActivity, setWorkflowActivity] = useState<string>()
  const [workflowMessage, setWorkflowMessage] = useState<string>()
  const [workflowError, setWorkflowError] = useState<string>()
  const backgroundSubscription = useRef<ListenerSubscription | undefined>(undefined)

  useEffect(() => {
    let isActive = true
    NitroHealth.getCapabilities()
      .then((result) => {
        if (isActive) setCapabilities(result)
      })
      .catch((error: unknown) => {
        if (isActive) setWorkflowError(getErrorMessage(error))
      })

    return () => {
      isActive = false
      backgroundSubscription.current?.remove()
    }
  }, [])

  function updateCard(dataType: HealthDataType, patch: Partial<CardState>): void {
    setCards((current) => ({ ...current, [dataType]: { ...current[dataType], ...patch } }))
  }

  async function runWorkflow(name: string, operation: () => Promise<void>): Promise<void> {
    setWorkflowActivity(name)
    setWorkflowError(undefined)
    try {
      await operation()
    } catch (error) {
      setWorkflowError(getErrorMessage(error))
    } finally {
      setWorkflowActivity(undefined)
    }
  }

  async function refreshCapabilities(): Promise<void> {
    await runWorkflow('capabilities', async () => {
      const result = await NitroHealth.getCapabilities()
      setCapabilities(result)
      if (result.status === 'unavailable') {
        setWorkflowMessage(`Capabilities unavailable: ${result.availability.reason}`)
        return
      }
      const background = result.backgroundChanges
      setWorkflowMessage(
        background.mode === 'observer'
          ? `Observer background changes: ${background.frequencies.join(', ')}; history read: ${result.historyRead}`
          : `Polling background changes: ${background.scheduling}; background read: ${background.backgroundRead}; history read: ${result.historyRead}`
      )
    })
  }

  async function recoverAvailability(): Promise<void> {
    if (
      availability.status === 'available' ||
      availability.reason !== 'provider-install-or-update-required'
    ) {
      return
    }
    await runWorkflow('recovery', async () => {
      const result = await NitroHealth.performAvailabilityRecovery(availability.recovery)
      setWorkflowMessage(
        result.status === 'user-action-required'
          ? `Continue in ${result.destination}`
          : `Recovery unavailable: ${result.reason}`
      )
    })
  }

  async function requestAdditionalAccess(access: HealthAdditionalAccess): Promise<void> {
    await runWorkflow(access, async () => {
      const result = await NitroHealth.requestAdditionalAccess(access)
      setWorkflowMessage(`${result.access}: ${result.status}`)
      setCapabilities(await NitroHealth.getCapabilities())
    })
  }

  async function managePermissions(): Promise<void> {
    await runWorkflow('manage', async () => {
      const result = await NitroHealth.managePermissions()
      setWorkflowMessage(
        result.status === 'unavailable'
          ? `Permission management unavailable: ${result.availability.reason}`
          : `${result.action.kind}: ${result.action.destination}`
      )
    })
  }

  async function requestAllPermissions(): Promise<void> {
    await runWorkflow('requestAllPermissions', async () => {
      const result = await NitroHealth.requestAuthorization(allHealthPermissions)
      setWorkflowMessage(`All health access: ${formatAuthorization(result)}`)
      setCapabilities(await NitroHealth.getCapabilities())
    })
  }

  async function revokePermissions(): Promise<void> {
    await runWorkflow('revoke', async () => {
      const result = await NitroHealth.revokeAllPermissions()
      if (result.status === 'completed') {
        setWorkflowMessage('All health permissions revoked')
      } else if (result.status === 'user-action-required') {
        setWorkflowMessage(`Revoke manually in ${result.action.destination}`)
      } else {
        setWorkflowMessage(`Revocation unavailable: ${result.availability.reason}`)
      }
    })
  }

  async function startBackgroundChanges(): Promise<void> {
    await runWorkflow('background', async () => {
      const configuration = await NitroHealth.configureBackgroundChanges({
        dataTypes: ['steps', 'sleep', 'workout'],
        frequency: 'immediate',
      })
      backgroundSubscription.current?.remove()
      const subscription = NitroHealth.subscribeToBackgroundChanges(({ dataTypes }) => {
        setWorkflowMessage(`Background change: ${dataTypes.join(', ')}`)
      })
      if (subscription.mode === 'observer') {
        backgroundSubscription.current = subscription.subscription
        setWorkflowMessage(`${formatBackgroundResult(configuration)}; observer subscribed`)
      } else if (subscription.mode === 'polling') {
        backgroundSubscription.current = undefined
        setWorkflowMessage(
          `${formatBackgroundResult(configuration)}; ${subscription.scheduling} polling required`
        )
      } else {
        backgroundSubscription.current = undefined
        setWorkflowMessage(`Background changes unavailable: ${subscription.availability.reason}`)
      }
    })
  }

  async function stopBackgroundChanges(): Promise<void> {
    await runWorkflow('stopBackground', async () => {
      backgroundSubscription.current?.remove()
      backgroundSubscription.current = undefined
      const result = await NitroHealth.disableBackgroundChanges(['steps', 'sleep', 'workout'])
      setWorkflowMessage(formatBackgroundResult(result))
    })
  }

  async function checkPermission(dataType: HealthDataType): Promise<void> {
    const permission: HealthPermission[] = [{ accessType: 'read', dataType }]
    updateCard(dataType, { activity: 'checking', feedback: undefined })
    try {
      const statusResult = await NitroHealth.getPermissionStatuses(permission)
      updateCard(dataType, { activity: undefined, statusResult })
    } catch (error) {
      updateCard(dataType, {
        activity: undefined,
        feedback: { kind: 'error', message: getErrorMessage(error) },
      })
    }
  }

  async function requestPermission(
    dataType: HealthDataType,
    accessType: 'read' | 'write'
  ): Promise<void> {
    updateCard(dataType, {
      activity: accessType === 'read' ? 'requesting' : 'requestingWrite',
      feedback: undefined,
    })
    try {
      let permission: HealthPermission = { accessType: 'read', dataType }
      if (accessType === 'write') {
        if (!isWritableDataType(dataType)) throw new Error(`${dataType} is read-only`)
        permission = { accessType: 'write', dataType }
      }
      const result = await NitroHealth.requestAuthorization([permission])
      updateCard(
        dataType,
        accessType === 'read'
          ? { activity: undefined, readResult: result }
          : { activity: undefined, writeResult: result }
      )
    } catch (error) {
      updateCard(dataType, {
        activity: undefined,
        feedback: { kind: 'error', message: getErrorMessage(error) },
      })
    }
  }

  async function runReadCard(dataType: HealthDataType): Promise<void> {
    const readCard = readCards[dataType]
    if (!readCard) return

    updateCard(dataType, { activity: 'reading', feedback: undefined })
    try {
      const readResult = await NitroHealth.requestAuthorization([{ accessType: 'read', dataType }])
      if (!authorizationAllowsOperation(readResult)) {
        updateCard(dataType, {
          activity: undefined,
          readResult,
          feedback: { kind: 'error', message: 'Read access is unavailable or not granted.' },
        })
        return
      }
      const lines = await readCard.execute()
      setReadResults((current) => ({ ...current, [dataType]: lines }))
      updateCard(dataType, { activity: undefined, readResult })
    } catch (error) {
      updateCard(dataType, {
        activity: undefined,
        feedback: { kind: 'error', message: getErrorMessage(error) },
      })
    }
  }

  async function saveSample(dataType: WritableHealthDataType): Promise<void> {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 60 * 1000)
    updateCard(dataType, { activity: 'saving', feedback: undefined })

    try {
      const writeResult = await NitroHealth.requestAuthorization([
        { accessType: 'write', dataType },
      ])
      if (!authorizationAllowsOperation(writeResult)) {
        updateCard(dataType, {
          activity: undefined,
          writeResult,
          feedback: { kind: 'error', message: 'Write access is unavailable or not granted.' },
        })
        return
      }

      let message: string
      switch (dataType) {
        case 'steps':
          await NitroHealth.saveSteps([{ startDate, endDate, count: 250 }])
          message = 'Saved 250 steps'
          break
        case 'distance': {
          const result = await NitroHealth.saveDistance([
            { scope: 'walking-running', startDate, endDate, distanceMeters: 400 },
          ])
          message = `Saved 400 m with storage scope ${result.storedScope}`
          break
        }
        case 'activeEnergyBurned':
          await NitroHealth.saveActiveEnergyBurned([{ startDate, endDate, kilocalories: 45 }])
          message = 'Saved 45 kcal'
          break
        case 'floorsClimbed':
          await NitroHealth.saveFloorsClimbed([{ startDate, endDate, floors: 3 }])
          message = 'Saved 3 floors climbed'
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
            { startDate, endDate, stages: [{ startDate, endDate, stage: 'asleep' }] },
          ])
          message = 'Saved a one-minute asleep session'
          break
        case 'workout':
          await NitroHealth.saveWorkout({
            startDate,
            endDate,
            activityType: 'running',
            displayName: 'Example run',
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

  const availabilityDetail =
    availability.status === 'available'
      ? 'Health service ready'
      : `Unavailable: ${availability.reason}`

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Nitro Health</Text>
        <Text style={[styles.status, isAvailable ? styles.available : styles.unavailable]}>
          {availabilityDetail}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Workflows</Text>
          <Text style={styles.detail}>
            Background:{' '}
            {capabilities?.status === 'available'
              ? `${capabilities.backgroundChanges.mode}; history ${capabilities.historyRead}`
              : capabilities
                ? `unavailable (${capabilities.availability.reason})`
                : 'loading'}
          </Text>
          {capabilities?.status === 'available' &&
          capabilities.backgroundChanges.mode === 'polling' ? (
            <Text style={styles.detail}>
              Background read: {capabilities.backgroundChanges.backgroundRead}; scheduling:{' '}
              {capabilities.backgroundChanges.scheduling}
            </Text>
          ) : capabilities?.status === 'available' &&
            capabilities.backgroundChanges.mode === 'observer' ? (
            <Text style={styles.detail}>
              Observer frequencies: {capabilities.backgroundChanges.frequencies.join(', ')}
            </Text>
          ) : null}
          {workflowMessage ? <Text style={styles.saved}>{workflowMessage}</Text> : null}
          {workflowError ? <Text style={styles.error}>{workflowError}</Text> : null}
          <View style={styles.buttonRow}>
            {availability.status === 'unavailable' &&
            availability.reason === 'provider-install-or-update-required' ? (
              <ActionButton
                disabled={workflowActivity !== undefined}
                label={
                  workflowActivity === 'recovery' ? 'Opening...' : 'Install or update provider'
                }
                onPress={recoverAvailability}
              />
            ) : null}
            <ActionButton
              disabled={workflowActivity !== undefined}
              label={workflowActivity === 'capabilities' ? 'Refreshing...' : 'Refresh capabilities'}
              onPress={refreshCapabilities}
            />
            <ActionButton
              disabled={!isAvailable || workflowActivity !== undefined}
              label="Request background read"
              onPress={() => requestAdditionalAccess('background-read')}
            />
            <ActionButton
              disabled={!isAvailable || workflowActivity !== undefined}
              label="Request history read"
              onPress={() => requestAdditionalAccess('history-read')}
            />
            <ActionButton
              disabled={!isAvailable || workflowActivity !== undefined}
              label="Configure background changes"
              onPress={startBackgroundChanges}
            />
            <ActionButton
              disabled={!isAvailable || workflowActivity !== undefined}
              label="Disable background changes"
              onPress={stopBackgroundChanges}
            />
            <ActionButton
              disabled={workflowActivity !== undefined}
              label="Manage permissions"
              onPress={managePermissions}
            />
            <ActionButton
              disabled={!isAvailable || workflowActivity !== undefined}
              label={
                workflowActivity === 'requestAllPermissions'
                  ? 'Requesting all access...'
                  : 'Request all health access'
              }
              onPress={requestAllPermissions}
            />
            <ActionButton
              danger
              disabled={workflowActivity !== undefined}
              label="Revoke all permissions"
              onPress={revokePermissions}
            />
          </View>
        </View>

        {readPermissions.map(({ dataType, label }) => {
          const card = cards[dataType] ?? {}
          const isBusy = card.activity !== undefined
          const readCard = readCards[dataType]
          const readLines = readResults[dataType]
          return (
            <View key={dataType} style={styles.card}>
              <Text style={styles.cardTitle}>{label}</Text>
              {card.statusResult ? (
                <Text style={styles.detail}>
                  Current: {formatPermissionStatuses(card.statusResult)}
                </Text>
              ) : null}
              {card.readResult ? (
                <Text style={styles.detail}>Read: {formatAuthorization(card.readResult)}</Text>
              ) : null}
              {card.writeResult ? (
                <Text style={styles.detail}>Write: {formatAuthorization(card.writeResult)}</Text>
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
                <ActionButton
                  disabled={!isAvailable || isBusy}
                  label={card.activity === 'checking' ? 'Checking...' : 'Check read status'}
                  onPress={() => checkPermission(dataType)}
                />
                <ActionButton
                  disabled={!isAvailable || isBusy}
                  label={card.activity === 'requesting' ? 'Requesting...' : 'Request read access'}
                  onPress={() => requestPermission(dataType, 'read')}
                />
                {readCard ? (
                  <ActionButton
                    disabled={!isAvailable || isBusy}
                    label={card.activity === 'reading' ? 'Reading...' : readCard.buttonLabel}
                    onPress={() => runReadCard(dataType)}
                    tone="read"
                  />
                ) : null}
                {isWritableDataType(dataType) ? (
                  <ActionButton
                    disabled={!isAvailable || isBusy}
                    label={
                      card.activity === 'requestingWrite' ? 'Requesting...' : 'Request write access'
                    }
                    onPress={() => requestPermission(dataType, 'write')}
                  />
                ) : null}
                {isWritableDataType(dataType) ? (
                  <ActionButton
                    disabled={!isAvailable || isBusy}
                    label={card.activity === 'saving' ? 'Saving...' : 'Save sample'}
                    onPress={() => saveSample(dataType)}
                    tone="write"
                  />
                ) : null}
              </View>
            </View>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

function ActionButton({
  danger = false,
  disabled,
  label,
  onPress,
  tone,
}: {
  danger?: boolean
  disabled: boolean
  label: string
  onPress: () => void
  tone?: 'read' | 'write'
}): React.JSX.Element {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        tone === 'read' ? styles.readButton : null,
        tone === 'write' ? styles.writeButton : null,
        danger ? styles.dangerButton : null,
        pressed ? styles.buttonPressed : null,
        disabled ? styles.buttonDisabled : null,
      ]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 20, paddingBottom: 48, backgroundColor: '#f8fafc' },
  title: { fontSize: 32, fontWeight: '800', color: '#0f172a' },
  status: { marginTop: 8, fontSize: 16, fontWeight: '700' },
  available: { color: '#15803d' },
  unavailable: { color: '#b91c1c' },
  card: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  detail: { marginTop: 8, fontSize: 14, lineHeight: 20, color: '#64748b' },
  error: { marginTop: 10, fontSize: 14, color: '#b91c1c' },
  saved: { marginTop: 10, fontSize: 14, color: '#15803d' },
  buttonRow: { marginTop: 14, gap: 10 },
  readResult: { marginTop: 4 },
  button: {
    minHeight: 44,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readButton: { backgroundColor: '#15803d' },
  writeButton: { backgroundColor: '#1d4ed8' },
  dangerButton: { backgroundColor: '#b91c1c' },
  buttonPressed: { opacity: 0.8 },
  buttonDisabled: { backgroundColor: '#94a3b8' },
  buttonText: { color: '#ffffff', fontSize: 15, fontWeight: '600', textAlign: 'center' },
})

export default App
