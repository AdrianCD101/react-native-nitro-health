import React, { useState } from 'react'
import { Pressable, ScrollView, Text, View, StyleSheet } from 'react-native'
import { NitroHealth } from 'react-native-nitro-health'
import type {
  HealthAuthorizationResult,
  AuthorizationRequestStatus,
  HealthDataType,
  HealthAvailabilityStatus,
  HealthPermission,
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
        const canOpenSettings = result ? result.status !== 'granted' : false

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
