import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'

import { stepsReadPermission } from './support/harnessSupport'

const permissionStatuses = ['granted', 'notGranted', 'notDetermined', 'unverifiable']

describe('NitroHealth Android permissions (native)', () => {
  it('returns one post-request status per entry when authorization is already observable', async () => {
    const before = await NitroHealth.getPermissionStatuses(stepsReadPermission)
    if (
      before.status === 'unavailable' ||
      before.statuses.some(({ status }) => status !== 'granted')
    ) {
      return
    }

    const result = await NitroHealth.requestAuthorization(stepsReadPermission)

    expect(result.status).toBe('completed')
    expect(result.statuses).toHaveLength(stepsReadPermission.length)
    expect(result.statuses.map((entry) => entry.permission)).toEqual(stepsReadPermission)
    expect(result.statuses.every((entry) => permissionStatuses.includes(entry.status))).toBe(true)
  })
})
