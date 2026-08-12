import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'
import { allHealthPermissions } from '../healthPermissions'

import { requireVerifiedPermissions } from './support/harnessSupport'

describe('NitroHealth authorized harness prerequisites', () => {
  it('has every permission required by positive integration tests', async () => {
    await expect(requireVerifiedPermissions(allHealthPermissions)).resolves.toBe(true)

    const capabilities = await NitroHealth.getCapabilities()
    expect(capabilities.status).toBe('available')
    if (capabilities.status !== 'available') return
    expect(capabilities.backgroundChanges.backgroundRead).toBe('granted')
    expect(capabilities.historyRead).toBe('granted')
  })
})
