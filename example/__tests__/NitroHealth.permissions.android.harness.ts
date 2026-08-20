import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'

import { requireVerifiedPermissions, stepsReadPermission } from './support/harnessSupport'

const permissionStatuses = ['granted', 'notGranted', 'notDetermined', 'unverifiable']

describe('NitroHealth Android permissions (native)', () => {
  it('returns one post-request status per entry once authorization is granted', async () => {
    await requireVerifiedPermissions(stepsReadPermission)

    const result = await NitroHealth.requestAuthorization(stepsReadPermission)

    expect(result.status).toBe('completed')
    expect(result.statuses).toHaveLength(stepsReadPermission.length)
    expect(result.statuses.map((entry) => entry.permission)).toEqual(stepsReadPermission)
    expect(result.statuses.every((entry) => permissionStatuses.includes(entry.status))).toBe(true)
  })
})
