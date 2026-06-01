import React, { useState } from 'react'
import { Pressable, ScrollView, Text, View, StyleSheet } from 'react-native'
import { NitroHealth } from 'react-native-nitro-health'
import type {
  HealthAuthorizationResult,
  AuthorizationRequestStatus,
  DailyStepTotal,
  HealthDataType,
  HealthAvailabilityStatus,
  HealthPermission,
  HeartRateStatistics,
} from 'react-native-nitro-health'

const readPermissions: Array<{ dataType: HealthDataType; label: string }> = [
  { dataType: 'steps', label: 'Steps' },
  { dataType: 'heartRate', label: 'Heart Rate' },
]

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

function App(): React.JSX.Element {
  const availabilityStatus = NitroHealth.getAvailabilityStatus()
  const isAvailable = availabilityStatus === 'available'
  const canOpenInstall = availabilityStatus === 'providerUpdateRequired'
  const [authorizationStatuses, setAuthorizationStatuses] = useState<
    Partial<Record<HealthDataType, AuthorizationRequestStatus>>
  >({})
  const [authorizationResults, setAuthorizationResults] = useState<
    Partial<Record<HealthDataType, HealthAuthorizationResult>>
  >({})
  const [checkingPermission, setCheckingPermission] = useState<HealthDataType>()
  const [requestingPermission, setRequestingPermission] = useState<HealthDataType>()
  const [openingSettings, setOpeningSettings] = useState<HealthDataType>()
  const [readingDailyStepTotals, setReadingDailyStepTotals] = useState(false)
  const [dailyStepTotals, setDailyStepTotals] = useState<DailyStepTotal[]>()
  const [readingHeartRateStatistics, setReadingHeartRateStatistics] = useState(false)
  const [heartRateStatistics, setHeartRateStatistics] = useState<HeartRateStatistics>()
  const [errorMessages, setErrorMessages] = useState<Partial<Record<HealthDataType, string>>>({})

  async function checkPermission(dataType: HealthDataType): Promise<void> {
    const permission: HealthPermission[] = [{ accessType: 'read', dataType }]
    setCheckingPermission(dataType)
    setErrorMessages((current) => ({ ...current, [dataType]: undefined }))

    try {
      const status = await NitroHealth.getRequestStatusForAuthorization(permission)
      setAuthorizationStatuses((current) => ({ ...current, [dataType]: status }))
    } catch (error) {
      setErrorMessages((current) => ({
        ...current,
        [dataType]: error instanceof Error ? error.message : String(error),
      }))
    } finally {
      setCheckingPermission(undefined)
    }
  }

  async function requestPermission(dataType: HealthDataType): Promise<void> {
    const permission: HealthPermission[] = [{ accessType: 'read', dataType }]
    setRequestingPermission(dataType)
    setErrorMessages((current) => ({ ...current, [dataType]: undefined }))
    setAuthorizationResults((current) => ({ ...current, [dataType]: undefined }))

    try {
      const result = await NitroHealth.requestAuthorization(permission)
      setAuthorizationResults((current) => ({ ...current, [dataType]: result }))
      setAuthorizationStatuses((current) => ({
        ...current,
        [dataType]: result.requestStatus,
      }))
    } catch (error) {
      setErrorMessages((current) => ({
        ...current,
        [dataType]: error instanceof Error ? error.message : String(error),
      }))
    } finally {
      setRequestingPermission(undefined)
    }
  }

  async function openSettings(dataType: HealthDataType): Promise<void> {
    setOpeningSettings(dataType)
    setErrorMessages((current) => ({ ...current, [dataType]: undefined }))

    try {
      const didOpen = await NitroHealth.openHealthSettings()
      if (!didOpen) {
        setErrorMessages((current) => ({
          ...current,
          [dataType]: 'Health settings could not be opened on this device.',
        }))
      }
    } catch (error) {
      setErrorMessages((current) => ({
        ...current,
        [dataType]: error instanceof Error ? error.message : String(error),
      }))
    } finally {
      setOpeningSettings(undefined)
    }
  }

  async function readDailyStepTotals(): Promise<void> {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)

    setReadingDailyStepTotals(true)
    setErrorMessages((current) => ({ ...current, steps: undefined }))

    try {
      const totals = await NitroHealth.readDailyStepTotals({
        startDate,
        endDate,
        limit: 7,
        ascending: false,
      })
      setDailyStepTotals(totals)
    } catch (error) {
      setErrorMessages((current) => ({
        ...current,
        steps: error instanceof Error ? error.message : String(error),
      }))
    } finally {
      setReadingDailyStepTotals(false)
    }
  }

  async function readHeartRateStatistics(): Promise<void> {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000)

    setReadingHeartRateStatistics(true)
    setErrorMessages((current) => ({ ...current, heartRate: undefined }))

    try {
      const statistics = await NitroHealth.readHeartRateStatistics({
        startDate,
        endDate,
      })
      setHeartRateStatistics(statistics)
    } catch (error) {
      setErrorMessages((current) => ({
        ...current,
        heartRate: error instanceof Error ? error.message : String(error),
      }))
    } finally {
      setReadingHeartRateStatistics(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Health APIs</Text>
      <Text style={[styles.status, isAvailable ? styles.available : styles.unavailable]}>
        {getAvailabilityLabel(availabilityStatus)}
      </Text>
      <Text style={styles.detail}>Status: {availabilityStatus}</Text>
      {readPermissions.map(({ dataType, label }) => {
        const isChecking = checkingPermission === dataType
        const isRequesting = requestingPermission === dataType
        const isOpeningSettings = openingSettings === dataType
        const result = authorizationResults[dataType]
        const requestStatus = authorizationStatuses[dataType]
        const canOpenSettings = result ? result.status !== 'granted' : false
        const canReadSteps = dataType === 'steps'
        const canReadHeartRate = dataType === 'heartRate'
        const hasPermission =
          result?.status === 'granted' ||
          result?.status === 'completed' ||
          (result?.grantedPermissions.length ?? 0) > 0 ||
          requestStatus === 'unnecessary'

        return (
          <View key={dataType} style={styles.permissionCard}>
            <Text style={styles.cardTitle}>{label} permission</Text>
            <Text style={styles.detail}>
              {label} request status: {authorizationStatuses[dataType] ?? 'not checked'}
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
            {errorMessages[dataType] ? (
              <Text style={styles.error}>{errorMessages[dataType]}</Text>
            ) : null}
            {canReadSteps && dailyStepTotals ? (
              <View style={styles.readResult}>
                <Text style={styles.detail}>Daily step buckets: {dailyStepTotals.length}</Text>
                {dailyStepTotals.map((bucket) => (
                  <Text key={bucket.startDate.toISOString()} style={styles.detail}>
                    {bucket.startDate.toLocaleDateString()}: {bucket.count} steps
                  </Text>
                ))}
              </View>
            ) : null}
            {canReadHeartRate && heartRateStatistics ? (
              <View style={styles.readResult}>
                <Text style={styles.detail}>
                  Average bpm: {heartRateStatistics.average ?? 'n/a'}
                </Text>
                <Text style={styles.detail}>Min bpm: {heartRateStatistics.min ?? 'n/a'}</Text>
                <Text style={styles.detail}>Max bpm: {heartRateStatistics.max ?? 'n/a'}</Text>
              </View>
            ) : null}
            <View style={styles.buttonRow}>
              <Pressable
                disabled={!isAvailable || isChecking}
                onPress={() => {
                  checkPermission(dataType)
                }}
                style={({ pressed }) => [
                  styles.button,
                  styles.secondaryButton,
                  pressed ? styles.buttonPressed : null,
                  !isAvailable || isChecking ? styles.buttonDisabled : null,
                ]}
              >
                <Text style={styles.buttonText}>
                  {isChecking ? 'Checking...' : `Check ${label} permission`}
                </Text>
              </Pressable>
              <Pressable
                disabled={!isAvailable || isRequesting}
                onPress={() => {
                  requestPermission(dataType)
                }}
                style={({ pressed }) => [
                  styles.button,
                  pressed ? styles.buttonPressed : null,
                  !isAvailable || isRequesting ? styles.buttonDisabled : null,
                ]}
              >
                <Text style={styles.buttonText}>
                  {isRequesting ? 'Requesting...' : `Request ${label} permission`}
                </Text>
              </Pressable>
              {canOpenSettings ? (
                <Pressable
                  disabled={isOpeningSettings}
                  onPress={() => {
                    openSettings(dataType)
                  }}
                  style={({ pressed }) => [
                    styles.button,
                    styles.settingsButton,
                    pressed ? styles.buttonPressed : null,
                    isOpeningSettings ? styles.buttonDisabled : null,
                  ]}
                >
                  <Text style={styles.buttonText}>
                    {isOpeningSettings ? 'Opening...' : 'Open health settings'}
                  </Text>
                </Pressable>
              ) : null}
              {canReadSteps && !hasPermission ? (
                <Text style={styles.detail}>Grant Steps permission to read</Text>
              ) : null}
              {canReadSteps ? (
                <Pressable
                  disabled={!isAvailable || readingDailyStepTotals || !hasPermission}
                  onPress={() => {
                    readDailyStepTotals()
                  }}
                  style={({ pressed }) => [
                    styles.button,
                    styles.readButton,
                    pressed ? styles.buttonPressed : null,
                    !isAvailable || readingDailyStepTotals || !hasPermission
                      ? styles.buttonDisabled
                      : null,
                  ]}
                >
                  <Text style={styles.buttonText}>
                    {readingDailyStepTotals ? 'Reading...' : 'Read daily step totals'}
                  </Text>
                </Pressable>
              ) : null}
              {canReadHeartRate && !hasPermission ? (
                <Text style={styles.detail}>Grant Heart Rate permission to read</Text>
              ) : null}
              {canReadHeartRate ? (
                <Pressable
                  disabled={!isAvailable || readingHeartRateStatistics || !hasPermission}
                  onPress={() => {
                    readHeartRateStatistics()
                  }}
                  style={({ pressed }) => [
                    styles.button,
                    styles.readButton,
                    pressed ? styles.buttonPressed : null,
                    !isAvailable || readingHeartRateStatistics || !hasPermission
                      ? styles.buttonDisabled
                      : null,
                  ]}
                >
                  <Text style={styles.buttonText}>
                    {readingHeartRateStatistics ? 'Reading...' : 'Read Heart Rate stats'}
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
  installButton: {
    marginTop: 24,
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
