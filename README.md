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

The first supported unified permission data types are `steps`, `distance`, `activeEnergyBurned`, and `heartRate`.

```ts
import { NitroHealth, type HealthPermission } from 'react-native-nitro-health'

const permissions: HealthPermission[] = [
  { accessType: 'read', dataType: 'steps' },
  { accessType: 'read', dataType: 'distance' },
  { accessType: 'read', dataType: 'activeEnergyBurned' },
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

Android consumer apps must declare the matching Health Connect permissions in their own `AndroidManifest.xml`, for example `android.permission.health.READ_DISTANCE`, `android.permission.health.READ_ACTIVE_CALORIES_BURNED`, and `android.permission.health.READ_HEART_RATE` before requesting read access.

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

## Read Activity Quantities

```ts
import { NitroHealth } from 'react-native-nitro-health'

const distance = await NitroHealth.readDistance({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-02T00:00:00.000Z'),
  limit: 100,
  ascending: true,
})

const activeEnergy = await NitroHealth.readActiveEnergyBurned({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-02T00:00:00.000Z'),
  limit: 100,
  ascending: true,
})
```

`readDistance()` returns distance samples with `startDate`, `endDate`, and `distanceMeters`. iOS reads walking/running distance. Android reads Health Connect distance records.

`readActiveEnergyBurned()` returns active-energy samples with `startDate`, `endDate`, and `kilocalories`.

Both methods return an empty array when the platform query succeeds but no matching samples are available. Apps must request and receive the matching read permission before relying on returned data.

## Aggregation

Use native aggregation when you need totals or statistics. HealthKit and Health Connect can aggregate across device and app sources without double-counting overlapping data, while summing raw samples in JavaScript can over-count data from a phone, watch, and other apps.

```ts
import { NitroHealth } from 'react-native-nitro-health'

const dailySteps = await NitroHealth.readDailyStepTotals({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-08T00:00:00.000Z'),
  limit: 7,
  ascending: true,
})

const dailyDistance = await NitroHealth.readDailyDistanceTotals({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-08T00:00:00.000Z'),
  limit: 7,
  ascending: true,
})

const dailyActiveEnergy = await NitroHealth.readDailyActiveEnergyBurnedTotals({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-08T00:00:00.000Z'),
  limit: 7,
  ascending: true,
})

const heartRate = await NitroHealth.readHeartRateStatistics({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-02T00:00:00.000Z'),
})
```

`readDailyStepTotals()` returns one step-count bucket per local calendar day with `startDate`, `endDate`, and `count`. Empty days are omitted, so apps that need a continuous chart should zero-fill missing days. First and last buckets may be partial when the query starts or ends mid-day. `ascending` orders the buckets and `limit` caps the returned bucket count.

`readDailyDistanceTotals()` returns one distance bucket per local calendar day with `startDate`, `endDate`, and `distanceMeters`.

`readDailyActiveEnergyBurnedTotals()` returns one active-energy bucket per local calendar day with `startDate`, `endDate`, and `kilocalories`.

`readHeartRateStatistics()` returns `{ average, min, max }` in beats per minute. Each field is `undefined` when no matching heart-rate data exists.

## Read Heart Rate

```ts
import { NitroHealth } from 'react-native-nitro-health'

const heartRate = await NitroHealth.readHeartRate({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-02T00:00:00.000Z'),
  limit: 100,
  ascending: true,
})
```

`readHeartRate()` returns individual readings with `date`, `bpm`, and an optional `source` (the originating app or device). On iOS each reading is one `HKQuantitySample`; on Android a `HeartRateRecord` holds many readings, so records are flattened to individual points and `limit` caps the flattened, time-ordered result (records are fetched up to `limit`). It returns an empty array when the query succeeds but no samples are available. Apps must request and receive heart rate read permission before relying on returned data.

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
