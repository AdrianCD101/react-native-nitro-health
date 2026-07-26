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

The supported unified permission data types are `steps`, `distance`, `activeEnergyBurned`, `heartRate`, `restingHeartRate`, `heartRateVariability`, `oxygenSaturation`, `height`, `sleep`, `bodyMass`, and `workout`.

```ts
import { NitroHealth, type HealthPermission } from 'react-native-nitro-health'

const permissions: HealthPermission[] = [
  { accessType: 'read', dataType: 'steps' },
  { accessType: 'read', dataType: 'distance' },
  { accessType: 'read', dataType: 'activeEnergyBurned' },
  { accessType: 'read', dataType: 'heartRate' },
  { accessType: 'read', dataType: 'sleep' },
  { accessType: 'read', dataType: 'bodyMass' },
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

`openHealthSettings()` opens Android Health Connect settings on Android and the app settings screen on iOS. It returns `false` when settings cannot be opened. Note that iOS has no deep link to an app's HealthKit permission screen — users manage access in the Health app under Sharing → Apps.

Android consumer apps must declare the matching Health Connect permissions in their own `AndroidManifest.xml` before requesting access. Health Connect silently refuses undeclared permissions: the permission screen never shows them and they are never granted, so the corresponding read or write calls keep failing with a missing-permission error.

| Data type              | Android read permission                                 | Android write permission                                 |
| ---------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| `steps`                | `android.permission.health.READ_STEPS`                  | `android.permission.health.WRITE_STEPS`                  |
| `distance`             | `android.permission.health.READ_DISTANCE`               | `android.permission.health.WRITE_DISTANCE`               |
| `activeEnergyBurned`   | `android.permission.health.READ_ACTIVE_CALORIES_BURNED` | `android.permission.health.WRITE_ACTIVE_CALORIES_BURNED` |
| `heartRate`            | `android.permission.health.READ_HEART_RATE`             | `android.permission.health.WRITE_HEART_RATE`             |
| `restingHeartRate`     | `android.permission.health.READ_RESTING_HEART_RATE`     | `android.permission.health.WRITE_RESTING_HEART_RATE`     |
| `heartRateVariability` | `android.permission.health.READ_HEART_RATE_VARIABILITY` | n/a (writes not supported yet)                           |
| `oxygenSaturation`     | `android.permission.health.READ_OXYGEN_SATURATION`      | `android.permission.health.WRITE_OXYGEN_SATURATION`      |
| `height`               | `android.permission.health.READ_HEIGHT`                 | `android.permission.health.WRITE_HEIGHT`                 |
| `sleep`                | `android.permission.health.READ_SLEEP`                  | n/a (writes not supported yet)                           |
| `bodyMass`             | `android.permission.health.READ_WEIGHT`                 | `android.permission.health.WRITE_WEIGHT`                 |
| `workout`              | `android.permission.health.READ_EXERCISE`               | n/a (writes not supported yet)                           |

On iOS, apps must add `NSHealthShareUsageDescription` (reads) and `NSHealthUpdateUsageDescription` (writes) to `Info.plist`, plus the HealthKit capability.

Read methods behave differently per platform when permission is missing. On Android, reads reject with a missing-permission error until the permission is granted. On iOS, reads reject with an "Authorization not determined" error until the app has requested authorization at least once; after the user responds to the prompt, HealthKit never discloses a read denial — denied reads resolve with empty results, indistinguishable from having no data.

## Read Steps

```ts
import { NitroHealth } from 'react-native-nitro-health'

const page = await NitroHealth.readSteps({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-02T00:00:00.000Z'),
  limit: 100,
  ascending: true,
})

const steps = page.samples
```

`readSteps()` resolves with a page of step count samples with `uuid`, `startDate`, `endDate`, and `count`. `uuid` is a stable sample identifier — the HealthKit sample UUID on iOS, the Health Connect record id on Android. When the platform query succeeds but no matching samples are available, `samples` is empty and `nextCursor` is absent; when more data exists beyond `limit`, the page carries a `nextCursor` (see [Pagination](#pagination)). Apps must request and receive steps read permission before relying on returned data.

## Pagination

All raw sample reads (`readSteps`, `readDistance`, `readActiveEnergyBurned`, `readBodyMass`, `readHeartRate`, `readRestingHeartRate`, `readHeartRateVariability`, `readOxygenSaturation`, `readHeight`, `readSleepSamples`, and `readWorkouts`) resolve with a page — `{ samples, nextCursor }`. `limit` (default 1000) caps the samples per page, and `nextCursor` is present if and only if more data exists. Pass it back as `cursor` to fetch the next page:

```ts
let cursor: string | undefined
do {
  const page = await NitroHealth.readSteps({ startDate, endDate, limit: 500, cursor })
  handle(page.samples)
  cursor = page.nextCursor
} while (cursor)
```

Cursors are opaque and platform-specific — never parse or construct one. A cursor is only valid for the read method and the same `startDate`, `endDate`, and `ascending` that produced it. Treat cursors as short-lived: use them to walk pages within one read loop, and do not persist them. Passing an invalid or foreign cursor (from the other platform, a different read method, a different `ascending`, or a malformed string) rejects with a descriptive `Invalid cursor…` error.

On Android, heart rate and sleep reads page by underlying Health Connect record, so a page may contain more samples than `limit` when a record holds multiple readings or stages; iOS honors `limit` exactly. Either way, nothing is silently truncated — whenever data remains, the page carries a `nextCursor`.

The deprecated daily total methods (`readDaily*Totals`) still return plain arrays and do not accept a `cursor`.

## Read Activity Quantities

```ts
import { NitroHealth } from 'react-native-nitro-health'

const { samples: distance } = await NitroHealth.readDistance({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-02T00:00:00.000Z'),
  limit: 100,
  ascending: true,
})

const { samples: activeEnergy } = await NitroHealth.readActiveEnergyBurned({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-02T00:00:00.000Z'),
  limit: 100,
  ascending: true,
})
```

`readDistance()` resolves with a page of distance samples with `uuid`, `startDate`, `endDate`, and `distanceMeters`. iOS reads HealthKit walking/running distance only — cycling, wheelchair, and swimming distance live under separate HealthKit identifiers and are not included. Android reads Health Connect distance records, which apps may write for any activity (including cycling), so totals for the same user can differ between platforms when non-pedestrian activity is present.

`readActiveEnergyBurned()` resolves with a page of active-energy samples with `uuid`, `startDate`, `endDate`, and `kilocalories`.

For both methods, `samples` is empty and `nextCursor` absent when the platform query succeeds but no matching samples are available. Apps must request and receive the matching read permission before relying on returned data.

## Aggregation

Use native aggregation when you need totals or statistics. HealthKit and Health Connect can aggregate across device and app sources without double-counting overlapping data, while summing raw samples in JavaScript can over-count data from a phone, watch, and other apps. `readStatistics()` is the primary way to do this: it returns bucketed totals and statistics for a single data type.

```ts
import { NitroHealth } from 'react-native-nitro-health'

const dailySteps = await NitroHealth.readStatistics('steps', {
  startDate: new Date('2026-01-01T00:00:00.000Z'), // local midnight anchors calendar-day buckets
  endDate: new Date('2026-01-08T00:00:00.000Z'),
  bucket: 'day',
  metrics: ['sum'],
})

const hourlyHeartRate = await NitroHealth.readStatistics('heartRate', {
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-02T00:00:00.000Z'),
  bucket: 'hour',
  metrics: ['avg', 'min', 'max'],
})
```

`readStatistics(dataType, query)` returns one bucket per interval, each with `startDate`, `endDate`, and the requested metric fields. A metric field is only present on the result when it was requested in `query.metrics` and is supported for `dataType`:

| Data type              | Supported metrics   | Unit                                           |
| ---------------------- | ------------------- | ---------------------------------------------- |
| `steps`                | `sum`               | count                                          |
| `distance`             | `sum`               | meters                                         |
| `activeEnergyBurned`   | `sum`               | kcal                                           |
| `heartRate`            | `avg`, `min`, `max` | bpm                                            |
| `restingHeartRate`     | `avg`, `min`, `max` | bpm                                            |
| `heartRateVariability` | —                   | not supported — use `readHeartRateVariability` |
| `oxygenSaturation`     | —                   | not supported — use `readOxygenSaturation`     |
| `height`               | `avg`, `min`, `max` | meters                                         |
| `bodyMass`             | `avg`, `min`, `max` | kg                                             |
| `sleep`                | —                   | not supported — use `readSleepSamples`         |

Requesting a metric that is not supported for `dataType`, an empty `metrics` array, an unknown `bucket`, or the `sleep`, `heartRateVariability`, or `oxygenSaturation` data type all reject before crossing the native boundary.

**Bucket behavior:** buckets anchor at `query.startDate` on both platforms — pass a local-midnight `startDate` when you need calendar-day buckets. `'week'` buckets are a rolling 7 days from the anchor, not calendar weeks. The final bucket is clamped to `endDate`, empty buckets are omitted, and results are always ascending. `'hour'` buckets are a fixed 3600 seconds; `'day'`, `'week'`, and `'month'` buckets are calendar-aware in the device's local timezone, so a bucket can span 23 or 25 hours across a daylight-saving transition. On Android, heart-rate and resting-heart-rate `avg` are integer-valued (Health Connect's `BPM_AVG` is a `Long`); on iOS they are fractional. As with other reads, HealthKit cannot distinguish a denied read from no data (see the permission caveat in the Permissions section above) — a denied read resolves with empty buckets rather than rejecting.

Daily total methods return one bucket per day and predate `readStatistics()`. They are **deprecated** in favor of it and will be removed before 1.0, but keep their existing behavior in the meantime: on iOS, buckets align to local calendar days, so the first and last buckets may be partial when the query starts or ends mid-day — this differs from `readStatistics()`, which always anchors buckets at `query.startDate` rather than local midnight. On Android, Health Connect anchors buckets to the query's start time, so a query starting at 15:30 returns 15:30-to-15:30 windows — pass a local-midnight `startDate` when you need calendar-day buckets on both platforms. Empty days are omitted, so apps that need a continuous chart should zero-fill missing days. `ascending` orders the buckets and `limit` caps the returned bucket count. Unlike the raw sample reads, daily total methods return plain arrays — they do not paginate, do not accept a `cursor`, and their aggregated buckets carry no `uuid`.

`readDailyStepTotals()` returns buckets with `startDate`, `endDate`, and `count`. Use `readStatistics('steps', { ...query, bucket: 'day', metrics: ['sum'] })` instead.

`readDailyDistanceTotals()` returns buckets with `startDate`, `endDate`, and `distanceMeters`. Use `readStatistics('distance', { ...query, bucket: 'day', metrics: ['sum'] })` instead.

`readDailyActiveEnergyBurnedTotals()` returns buckets with `startDate`, `endDate`, and `kilocalories`. Use `readStatistics('activeEnergyBurned', { ...query, bucket: 'day', metrics: ['sum'] })` instead.

`readHeartRateStatistics()` returns `{ average, min, max }` in beats per minute for the whole query range in a single result. Each field is `undefined` when no matching heart-rate data exists. It is not deprecated — it remains the way to get a single whole-range aggregate, which `readStatistics()` cannot express since it always returns one or more buckets.

## Read Heart Rate

```ts
import { NitroHealth } from 'react-native-nitro-health'

const { samples: heartRate } = await NitroHealth.readHeartRate({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-02T00:00:00.000Z'),
  limit: 100,
  ascending: true,
})
```

`readHeartRate()` resolves with a page of individual readings with `uuid`, `date`, `bpm`, and an optional `source` (the originating app or device). On iOS each reading is one `HKQuantitySample`, its `uuid` is the HealthKit sample UUID, and `limit` caps the readings per page exactly. On Android a `HeartRateRecord` holds many readings, so records are flattened to individual points and pages are cut by record: `limit` counts records, and a page can contain more readings than `limit` when records hold multiple readings. Because Android readings live inside a parent record, each reading's `uuid` is the record id plus a `#index` suffix (for example `"a1b2…#3"`). `samples` is empty and `nextCursor` absent when the query succeeds but no samples are available. Apps must request and receive heart rate read permission before relying on returned data.

## Read Resting Heart Rate

```ts
import { NitroHealth } from 'react-native-nitro-health'

const { samples: restingHeartRate } = await NitroHealth.readRestingHeartRate({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-08T00:00:00.000Z'),
  limit: 100,
  ascending: true,
})
```

`readRestingHeartRate()` resolves with a page of individual readings with `uuid`, `date`, `bpm`, and an optional `source`. `samples` is empty and `nextCursor` absent when the query succeeds but no samples are available. Apps must request and receive resting heart rate read permission before relying on returned data.

## Read Heart Rate Variability

```ts
import { NitroHealth } from 'react-native-nitro-health'

const { samples: hrv } = await NitroHealth.readHeartRateVariability({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-08T00:00:00.000Z'),
  limit: 100,
  ascending: true,
})
```

`readHeartRateVariability()` resolves with a page of individual readings with `uuid`, `date`, `milliseconds`, a `method` field, and an optional `source`. `samples` is empty and `nextCursor` absent when the query succeeds but no samples are available.

> [!IMPORTANT]
> **SDNN and RMSSD are different, non-comparable HRV measures — never mix or chart samples with different `method` values together.** iOS reports HealthKit's HRV SDNN metric, so every sample read on iOS has `method: 'sdnn'`. Android reports Health Connect's HRV RMSSD metric, so every sample read on Android has `method: 'rmssd'`. The `method` field exists precisely so app code can tell which metric a sample used and avoid combining SDNN and RMSSD values in the same average, trend line, or chart. There is no `saveHeartRateVariability()`: because the two platforms use non-comparable metrics, there is no single value that would be meaningful to write on both.

## Read Body Mass

```ts
import { NitroHealth } from 'react-native-nitro-health'

const { samples: bodyMass } = await NitroHealth.readBodyMass({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-02-01T00:00:00.000Z'),
  limit: 100,
  ascending: true,
})
```

`readBodyMass()` resolves with a page of body mass samples with `uuid`, `startDate`, `endDate`, `kilograms`, and an optional `source`. `samples` is empty and `nextCursor` absent when the platform query succeeds but no matching samples are available. Apps must request and receive body mass read permission before relying on returned data.

## Read Oxygen Saturation

```ts
import { NitroHealth } from 'react-native-nitro-health'

const { samples: oxygenSaturation } = await NitroHealth.readOxygenSaturation({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-08T00:00:00.000Z'),
  limit: 100,
  ascending: true,
})
```

`readOxygenSaturation()` resolves with a page of individual readings with `uuid`, `date`, `percentage`, and an optional `source`. `percentage` is 0-100 on both platforms: Health Connect's `Percentage` is used directly, while HealthKit stores oxygen saturation as a 0-1 fraction, so iOS reads are converted (`× 100`) before they reach JavaScript. `samples` is empty and `nextCursor` absent when the query succeeds but no samples are available. Apps must request and receive oxygen saturation read permission before relying on returned data.

## Read Height

```ts
import { NitroHealth } from 'react-native-nitro-health'

const { samples: height } = await NitroHealth.readHeight({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-08T00:00:00.000Z'),
  limit: 100,
  ascending: true,
})
```

`readHeight()` resolves with a page of individual readings with `uuid`, `date`, `meters`, and an optional `source`. `samples` is empty and `nextCursor` absent when the query succeeds but no samples are available. Apps must request and receive height read permission before relying on returned data.

## Read Sleep

```ts
import { NitroHealth } from 'react-native-nitro-health'

const { samples: sleep } = await NitroHealth.readSleepSamples({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-08T00:00:00.000Z'),
  limit: 100,
  ascending: true,
})
```

`readSleepSamples()` resolves with a page of sleep intervals with `uuid`, `startDate`, `endDate`, `stage`, and an optional `source`. Stages are normalized to `inBed`, `awake`, `awakeInBed`, `asleep`, `asleepCore`, `asleepDeep`, `asleepREM`, `outOfBed`, or `unknown`. `samples` is empty and `nextCursor` absent when the query succeeds but no samples are available.

On iOS, HealthKit sleep analysis is category interval data and `inBed` samples can overlap `asleep` stage samples; each interval's `uuid` is the HealthKit sample UUID and `limit` caps the intervals per page exactly. On Android, Health Connect sleep sessions are flattened to stage intervals and pages are cut by session record: `limit` counts sessions, and a page can contain more intervals than `limit` when sessions hold multiple stages. Because Android stages live inside a session record, each stage's `uuid` is the session record id plus a `#index` suffix; a session without explicit stages is returned as one `asleep` interval that keeps the plain record id. Apps must request and receive sleep read permission before relying on returned data.

## Read Workouts

```ts
import { NitroHealth } from 'react-native-nitro-health'

const { samples: workouts } = await NitroHealth.readWorkouts({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-08T00:00:00.000Z'),
  limit: 50,
  ascending: false,
})
```

`readWorkouts()` resolves with a page of workout sessions (`HKWorkout` on iOS, `ExerciseSessionRecord` on Android) with `uuid`, `startDate`, `endDate`, `durationSeconds`, `activityType`, and optional `title`, `source`, `totalDistanceMeters`, and `totalEnergyBurnedKcal` fields. `samples` is empty and `nextCursor` absent when the query succeeds but no sessions are available.

`activityType` is normalized to a single cross-platform union (`running`, `cycling`, `swimming`, `strengthTraining`, `yoga`, `hiking`, ... — see `WorkoutActivityType` for the full list). Platform sub-variants fold into the parent activity: treadmill running and outdoor running both map to `running`, stationary and outdoor biking to `cycling`, pool and open-water swimming to `swimming`, and individual strength exercises (bench press, deadlift, dumbbell curls, ...) to `strengthTraining`. Values with no cross-platform equivalent map to `other`, as do unknown values from future OS versions. Some union members are only ever produced by one platform (for example `archery` on iOS or `paragliding` on Android).

Platform differences: `totalDistanceMeters` and `totalEnergyBurnedKcal` are iOS-only for now — Health Connect exercise sessions carry no totals, so they are `undefined` on Android (per-session aggregation may be added later). `durationSeconds` excludes pauses on iOS (`HKWorkout.duration`) but is the wall-clock `endDate - startDate` on Android, which has no pause-aware duration on the session record. `title` is the user-visible session title on Android; on iOS it falls back to the rarely-set workout brand name metadata. Apps must request and receive workout read permission before relying on returned data.

## Write Samples

Batch save methods are available for `steps`, `distance`, `activeEnergyBurned`, `heartRate`, `restingHeartRate`, `oxygenSaturation`, `height`, and `bodyMass` (sleep and heart rate variability writes are not supported yet — see [Read Heart Rate Variability](#read-heart-rate-variability) for why HRV has no save method). Request write authorization first, then save:

```ts
import { NitroHealth } from 'react-native-nitro-health'

const result = await NitroHealth.requestAuthorization([{ accessType: 'write', dataType: 'steps' }])

if (result.deniedPermissions.length === 0) {
  await NitroHealth.saveSteps([
    {
      startDate: new Date('2026-01-01T09:00:00.000Z'),
      endDate: new Date('2026-01-01T09:30:00.000Z'),
      count: 512,
    },
  ])
}
```

Interval samples take `startDate`/`endDate` with `startDate` strictly before `endDate`:

- `saveSteps(samples)` — `{ startDate, endDate, count }`, `count` must be a positive integer up to 1,000,000.
- `saveDistance(samples)` — `{ startDate, endDate, distanceMeters }`, `distanceMeters` must be non-negative, up to 1,000,000.
- `saveActiveEnergyBurned(samples)` — `{ startDate, endDate, kilocalories }`, `kilocalories` must be non-negative, up to 1,000,000.

Point-in-time samples take a single `date`:

- `saveHeartRate(samples)` — `{ date, bpm }`, `bpm` must be between 1 and 300. Android stores whole bpm (fractional values are rounded to the nearest integer); iOS stores the exact value.
- `saveRestingHeartRate(samples)` — `{ date, bpm }`, `bpm` must be between 1 and 300. Android stores whole bpm (fractional values are rounded to the nearest integer); iOS stores the exact value.
- `saveOxygenSaturation(samples)` — `{ date, percentage }`, `percentage` must be between 0 and 100 inclusive. iOS converts to HealthKit's 0-1 fraction before saving (`÷ 100`); Android stores the value directly.
- `saveHeight(samples)` — `{ date, meters }`, `meters` must be greater than 0, up to 3.
- `saveBodyMass(samples)` — `{ date, kilograms }`, `kilograms` must be greater than 0, up to 1,000.

All save methods take a non-empty array, resolve to `void` when every sample is saved (both platforms save each call atomically), and reject before crossing the native boundary when validation fails — error messages include the failing index, for example `samples[2]: bpm must be between 1 and 300`.

The value ranges mirror what Health Connect enforces at insert time, applied on both platforms so a sample that saves on iOS also saves on Android.

Unlike reads, missing write permission is detectable on both platforms: save methods reject with a missing-permission error on Android and iOS alike (on iOS this includes the not-yet-requested state, so request write authorization first). Saved samples are attributed to your app as the source.

Avoid writing samples with overlapping time intervals. The platforms aggregate overlapping records differently: Health Connect deduplicates overlapping intervals when computing totals (writing 250 steps twice over the same 30-minute window still totals roughly 250), while HealthKit cumulative sums count every sample (the same two writes total 500). Raw reads return every stored record on both platforms — only aggregates differ. Writing non-overlapping intervals produces consistent totals everywhere.

## Jest

The package ships a Jest mock so app tests do not need to mock Nitro internals. By default, mocked raw sample reads resolve with an empty page (`{ samples: [] }`) and the deprecated daily total methods resolve with `[]`.

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
