import { Platform } from 'react-native'
import { beforeAll } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'

import { allHealthPermissions } from '../../healthPermissions'

beforeAll(async () => {
  if (Platform.OS !== 'ios') return

  const result = await NitroHealth.requestAuthorization(allHealthPermissions)
  if (result.status !== 'completed') {
    throw new Error('Harness prerequisite failed: HealthKit authorization is unavailable')
  }

  const deniedWrites = result.statuses.filter(
    ({ permission, status }) => permission.accessType === 'write' && status !== 'granted'
  )
  if (deniedWrites.length > 0) {
    const details = deniedWrites
      .map(({ permission, status }) => `${permission.dataType}=${status}`)
      .join(', ')
    throw new Error(
      `Harness prerequisite failed: HealthKit write access was not granted (${details})`
    )
  }
})
