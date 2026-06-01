# react-native-nitro-health

react-native-nitro-health is a react native package built with Nitro

[![Version](https://img.shields.io/npm/v/react-native-nitro-health.svg)](https://www.npmjs.com/package/react-native-nitro-health)
[![Downloads](https://img.shields.io/npm/dm/react-native-nitro-health.svg)](https://www.npmjs.com/package/react-native-nitro-health)
[![License](https://img.shields.io/npm/l/react-native-nitro-health.svg)](https://github.com/AdrianCD101/react-native-nitro-health/blob/main/LICENSE)

## Requirements

- React Native v0.76.0 or higher
- Node 18.0.0 or higher

> [!IMPORTANT]  
> To Support `Nitro Views` you need to install React Native version v0.78.0 or higher.

## Installation

```bash
bun add react-native-nitro-health react-native-nitro-modules
```

## Availability

```ts
import { NitroHealth } from 'react-native-nitro-health'

const status = NitroHealth.getAvailabilityStatus()
const available = NitroHealth.isAvailable()

if (status === 'providerUpdateRequired') {
  NitroHealth.openHealthConnectInstall()
}
```

`getAvailabilityStatus()` returns:

| Status                   | Meaning                                                        |
| ------------------------ | -------------------------------------------------------------- |
| `available`              | HealthKit or Health Connect is available on this device.       |
| `unavailable`            | Health APIs are not available on this device.                  |
| `providerUpdateRequired` | Android only. Health Connect needs to be installed or updated. |

`isAvailable()` is a convenience method equivalent to `getAvailabilityStatus() === 'available'`.

`openHealthConnectInstall()` opens the Android Health Connect Play Store onboarding flow when `getAvailabilityStatus()` returns `providerUpdateRequired`. It returns `false` when the flow is not available, including on iOS.

On iOS, apps still need the HealthKit capability and the relevant HealthKit usage descriptions before read/write APIs can request authorization.

## Permissions

The first supported unified permission data types are `steps` and `heartRate`.

```ts
import { NitroHealth, type HealthPermission } from 'react-native-nitro-health'

const permissions: HealthPermission[] = [
  { accessType: 'read', dataType: 'steps' },
  { accessType: 'read', dataType: 'heartRate' },
]

const status = await NitroHealth.getRequestStatusForAuthorization(permissions)

if (status === 'shouldRequest') {
  const result = await NitroHealth.requestAuthorization(permissions)

  if (result.status === 'denied' || result.status === 'partial') {
    // Show your app-specific rationale or settings instructions.
    await NitroHealth.openHealthSettings()
  }
}
```

`getRequestStatusForAuthorization()` returns `unknown`, `shouldRequest`, or `unnecessary`.

`requestAuthorization()` returns a structured result with `status`, `requestStatus`, `grantedPermissions`, `deniedPermissions`, and `unverifiablePermissions`. Android Health Connect can report granted and denied permissions after the prompt. iOS HealthKit cannot verify read permissions after prompting, so read permissions are returned in `unverifiablePermissions` and the aggregate status can be `completed`.

`openHealthSettings()` opens Android Health Connect settings on Android and the app settings screen on iOS. It returns `false` when settings cannot be opened.

Android consumer apps must declare the matching Health Connect permissions in their own `AndroidManifest.xml`, for example `android.permission.health.READ_HEART_RATE` before requesting `heartRate` read access.

## Read Steps

```ts
import { NitroHealth } from 'react-native-nitro-health'

const steps = await NitroHealth.readSteps({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-02T00:00:00.000Z'),
  limit: 100,
  ascending: true,
})
```

`readSteps()` returns step count samples with `startDate`, `endDate`, and `count`. It returns an empty array when the platform query succeeds but no matching samples are available. Apps must request and receive steps read permission before relying on returned data.

## Jest

The package ships a Jest mock so app tests do not need to mock Nitro internals.

Add it to your Jest setup file:

```js
jest.mock('react-native-nitro-health', () => require('react-native-nitro-health/jest/mock'))
```

Or load the provided setup file from your Jest config:

```js
module.exports = {
  setupFilesAfterEnv: ['react-native-nitro-health/jest/setup'],
}
```

Then override behavior in tests as needed:

```ts
import { NitroHealth, resetNitroHealthMock } from 'react-native-nitro-health/jest/mock'

beforeEach(() => {
  resetNitroHealthMock()
})

NitroHealth.getAvailabilityStatus.mockReturnValue('unavailable')
```

## Credits

Bootstrapped with [create-nitro-module](https://github.com/patrickkabwe/create-nitro-module).

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
