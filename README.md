# react-native-nitro-health

Cross-platform HealthKit and Health Connect access for React Native, built with Nitro Modules.

[![Version](https://img.shields.io/npm/v/react-native-nitro-health.svg)](https://www.npmjs.com/package/react-native-nitro-health)
[![Downloads](https://img.shields.io/npm/dm/react-native-nitro-health.svg)](https://www.npmjs.com/package/react-native-nitro-health)
[![License](https://img.shields.io/npm/l/react-native-nitro-health.svg)](https://github.com/AdrianCD101/react-native-nitro-health/blob/main/LICENSE)

## Requirements

- React Native 0.76 or newer
- Node.js 18 or newer
- iOS 16 or newer
- Android 9 (API 28) or newer with Health Connect available

## Installation

```sh
bun add react-native-nitro-health react-native-nitro-modules
```

Rebuild the native application after installation. Import the runtime and all public types from the package root:

```ts
import { NitroHealth, type HealthPermission, type StepSample } from 'react-native-nitro-health'
```

### Public package surface

The package root exports `NitroHealth` and consumer-facing types only. Native transport types named `Native*`, the generated `NitroHealthSpec`, generated Nitro files, and internal mapping helpers are not public exports.

Package entry points are intentionally restricted to:

- `react-native-nitro-health`
- `react-native-nitro-health/jest/mock`
- `react-native-nitro-health/jest/setup`
- `react-native-nitro-health/package.json`

There are no iOS, Android, `src`, spec, or other platform subpath imports. Consumer workflows use capabilities and tagged results instead of importing a platform implementation.

## Availability And Recovery

`getAvailability()` is synchronous and returns a discriminated value. A recovery action exists only when the current unavailable state can be addressed by installing or updating the Android Health Connect provider.

```ts
import { NitroHealth } from 'react-native-nitro-health'

const availability = NitroHealth.getAvailability()

if (availability.status === 'unavailable') {
  if (availability.reason === 'provider-install-or-update-required') {
    const recovery = await NitroHealth.performAvailabilityRecovery(availability.recovery)

    if (recovery.status === 'user-action-required') {
      // The provider store opened. The user still needs to install or update it.
    }
  } else {
    // reason is 'not-supported' or 'service-unavailable'.
  }
}
```

The availability shapes are:

```ts
type HealthAvailability =
  | { status: 'available' }
  | {
      status: 'unavailable'
      reason: 'not-supported' | 'service-unavailable'
    }
  | {
      status: 'unavailable'
      reason: 'provider-install-or-update-required'
      recovery: { kind: 'install-or-update-provider' }
    }
```

`performAvailabilityRecovery()` returns either `{ status: 'user-action-required', destination: 'provider-store' }` or `{ status: 'unavailable', reason: 'no-recovery-action' | 'destination-unavailable' }`. Opening the store is not proof that the provider was installed; call `getAvailability()` again when the app resumes.

On iOS, unsupported devices return `not-supported` and there is no install recovery action.

## Capabilities

Use `getCapabilities()` for workflows whose implementation differs by platform. Do not branch on `Platform.OS`.

```ts
const capabilities = await NitroHealth.getCapabilities()

if (capabilities.status === 'unavailable') {
  console.log(capabilities.availability.reason)
} else if (capabilities.backgroundChanges.mode === 'observer') {
  // The system can wake the app and emit change hints.
  console.log(capabilities.backgroundChanges.frequencies)
  console.log(capabilities.historyRead)
} else {
  // mode is 'polling' and scheduling is always 'app-owned'.
  console.log(capabilities.backgroundChanges.backgroundRead)
  console.log(capabilities.historyRead)
}
```

Background changes are one of:

- `observer`: system observer hints, frequencies `immediate`, `hourly`, `daily`, and `weekly`, with normal read authorization covering background reads. iOS reports this capability whenever HealthKit is available; configuration rejects if the host lacks the required background-delivery entitlement.
- `polling`: the consumer app owns scheduling and separately checks background-read access.

`historyRead` and polling `backgroundRead` use these states:

- `included`: included in normal read authorization.
- `unsupported`: the health service cannot provide the access.
- `not-declared`: the Android manifest permission is missing.
- `not-granted`: the permission is declared but has not been granted.
- `granted`: the additional Android permission is granted.

Request optional access only when its capability is `not-granted`:

```ts
const capabilities = await NitroHealth.getCapabilities()

if (
  capabilities.status === 'available' &&
  capabilities.backgroundChanges.mode === 'polling' &&
  capabilities.backgroundChanges.backgroundRead === 'not-granted'
) {
  const result = await NitroHealth.requestAdditionalAccess('background-read')
  console.log(result.access, result.status)
}

if (capabilities.status === 'available' && capabilities.historyRead === 'not-granted') {
  const result = await NitroHealth.requestAdditionalAccess('history-read')
  console.log(result.access, result.status)
}
```

`requestAdditionalAccess()` returns `{ access, status }` after the request, or an `unavailable` result carrying health availability. Android opens permission UI only from `not-granted`; `not-declared`, `unsupported`, and already granted states return without prompting. Both access types return `included` on iOS.

## Permissions

Supported data types are `steps`, `heartRate`, `bloodPressure`, `bloodGlucose`, `bodyTemperature`, `restingHeartRate`, `heartRateVariability`, `distance`, `activeEnergyBurned`, `oxygenSaturation`, `height`, `sleep`, `bodyMass`, and `workout`.

### Authorization

Authorization results contain one status entry per requested permission, preserving input order. There is no aggregate granted, denied, partial, or prompt-status result.

```ts
import { NitroHealth, type HealthPermission } from 'react-native-nitro-health'

const permissions: HealthPermission[] = [
  { accessType: 'read', dataType: 'steps' },
  { accessType: 'read', dataType: 'sleep' },
  { accessType: 'write', dataType: 'workout' },
]

const before = await NitroHealth.getPermissionStatuses(permissions)

if (before.status === 'unavailable') {
  console.log(before.availability.reason)
} else {
  for (const entry of before.statuses) {
    console.log(entry.permission.accessType, entry.permission.dataType, entry.status)
  }
}

const authorization = await NitroHealth.requestAuthorization(permissions)

if (authorization.status === 'completed') {
  for (const entry of authorization.statuses) {
    if (entry.status === 'granted') {
      continue
    }

    // Handle this specific permission's notGranted, notDetermined, or
    // unverifiable state in app UI.
    console.log(entry.permission, entry.status)
  }
}
```

Per-entry statuses are `granted`, `notGranted`, `notDetermined`, and `unverifiable`.

- Android reports `granted` or `notGranted` when Health Connect is available. Health Connect does not distinguish a denial from access that was never requested.
- HealthKit never discloses read authorization, so every iOS read entry is `unverifiable`, before and after authorization. iOS write entries can be `granted`, `notGranted`, or `notDetermined`.
- When health data is unavailable, `getPermissionStatuses()` and `requestAuthorization()` return `status: 'unavailable'`, include the typed `availability`, and mark every requested entry `unverifiable`.

On Android, a missing read permission causes reads to reject. On iOS, reads reject until authorization has been requested at least once; after the user responds, a denied HealthKit read resolves with empty results because denial is indistinguishable from no data. Missing write permission is detectable and rejects on both platforms.

### Manage And Revoke

Permission-management methods report whether the operation completed or still requires the user. Their result shape provides the workflow; no platform check is needed.

```ts
const management = await NitroHealth.managePermissions()

if (management.status === 'user-action-required') {
  if (management.action.kind === 'opened') {
    // Android Health Connect settings opened.
  } else {
    // Explain how to open Health app > Sharing > Apps on iOS.
  }
}

const revocation = await NitroHealth.revokeAllPermissions()

if (revocation.status === 'completed') {
  // Android revoked the app's Health Connect permissions directly.
} else if (revocation.status === 'user-action-required') {
  // iOS requires manual revocation in the Health app.
}
```

Every `user-action-required` result carries a typed action:

```ts
type HealthPermissionAction =
  | { kind: 'opened'; destination: 'health-connect-settings' }
  | { kind: 'manual'; destination: 'health-app-permissions' }
```

Both methods can return `{ status: 'unavailable', availability }`. `managePermissions()` opens Health Connect settings on Android and returns a stable manual Health-app destination on iOS. `revokeAllPermissions()` completes directly on Android; HealthKit does not provide direct all-permission revocation, so iOS returns the `manual` action — its `user-action-required` result never carries `kind: 'opened'`. Use the `destination` literal to select localized instructions rather than checking the platform.

Re-read permission statuses and perform a full data resync after a material permission change. Cached data and change tokens do not prove current authorization.

### Consumer Configuration

On iOS, enable the HealthKit capability and add usage descriptions to the consumer app's `Info.plist`:

```xml
<key>NSHealthShareUsageDescription</key>
<string>Explain the user-visible feature that reads health data.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>Explain the user-visible feature that writes health data.</string>
```

On Android, the consumer app must declare every Health Connect data permission it requests. The library deliberately does not add health data permissions to its own manifest.

| Data type              | Read permission                                         | Write permission                                         |
| ---------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| `steps`                | `android.permission.health.READ_STEPS`                  | `android.permission.health.WRITE_STEPS`                  |
| `distance`             | `android.permission.health.READ_DISTANCE`               | `android.permission.health.WRITE_DISTANCE`               |
| `activeEnergyBurned`   | `android.permission.health.READ_ACTIVE_CALORIES_BURNED` | `android.permission.health.WRITE_ACTIVE_CALORIES_BURNED` |
| `heartRate`            | `android.permission.health.READ_HEART_RATE`             | `android.permission.health.WRITE_HEART_RATE`             |
| `bloodPressure`        | `android.permission.health.READ_BLOOD_PRESSURE`         | `android.permission.health.WRITE_BLOOD_PRESSURE`         |
| `bloodGlucose`         | `android.permission.health.READ_BLOOD_GLUCOSE`          | `android.permission.health.WRITE_BLOOD_GLUCOSE`          |
| `bodyTemperature`      | `android.permission.health.READ_BODY_TEMPERATURE`       | `android.permission.health.WRITE_BODY_TEMPERATURE`       |
| `restingHeartRate`     | `android.permission.health.READ_RESTING_HEART_RATE`     | `android.permission.health.WRITE_RESTING_HEART_RATE`     |
| `heartRateVariability` | `android.permission.health.READ_HEART_RATE_VARIABILITY` | Not supported                                            |
| `oxygenSaturation`     | `android.permission.health.READ_OXYGEN_SATURATION`      | `android.permission.health.WRITE_OXYGEN_SATURATION`      |
| `height`               | `android.permission.health.READ_HEIGHT`                 | `android.permission.health.WRITE_HEIGHT`                 |
| `sleep`                | `android.permission.health.READ_SLEEP`                  | `android.permission.health.WRITE_SLEEP`                  |
| `bodyMass`             | `android.permission.health.READ_WEIGHT`                 | `android.permission.health.WRITE_WEIGHT`                 |
| `workout`              | `android.permission.health.READ_EXERCISE`               | `android.permission.health.WRITE_EXERCISE`               |

Undeclared Health Connect permissions do not appear in the system permission sheet and cannot be granted. The Android privacy-policy rationale activity and provider package query are also consumer-app responsibilities; see `example/android/app/src/main/AndroidManifest.xml` for a complete reference.

Background and extended-history declarations are documented in [Background Synchronization](#background-synchronization).

## Raw Sample Model

Every raw sample returned by a `read*` method or a change upsert has `identity` and `origin`.

### Data Origin

```ts
interface HealthDataOrigin {
  identifier: string
  displayName?: string
}
```

`origin.identifier` is the stable application identifier supplied by the health service: an iOS bundle identifier or Android package name. `origin.displayName` is a human-readable app name when available. HealthKit supplies the source name; Health Connect currently supplies only the package name, so Android `displayName` is normally absent.

Do not use a display name as a database key. Use `origin.identifier` for stable source grouping.

### Record And Child Identity

```ts
type HealthSampleIdentity =
  | { kind: 'record'; id: string }
  | {
      kind: 'record-child'
      id: string
      record: { kind: 'record'; id: string }
    }
```

- `record` identifies an independently deletable native record.
- `record-child` identifies one flattened reading or stage owned by a parent record. Its `id` can be synthetic and unstable; `record` is the parent record identity.
- Android heart-rate readings and sleep stages are record children because Health Connect stores several readings or stages inside one record.
- iOS HealthKit samples are independently deletable records.

Use the identity tag rather than parsing an ID:

```ts
const { samples } = await NitroHealth.readHeartRate(query)

for (const sample of samples) {
  if (sample.identity.kind === 'record') {
    console.log('deletable sample', sample.identity.id)
  } else {
    console.log('child', sample.identity.id, 'parent', sample.identity.record.id)
  }

  console.log('recorded by', sample.origin.identifier)
}
```

Selecting a child sample's `identity.record` for deletion explicitly selects its whole parent. That removes every child reading or stage in the parent, not just the selected child.

## Reading Data

All raw reads return `{ samples, nextCursor? }`. Every listed sample also includes the common `identity` and `origin` fields.

| Method                     | Data-specific sample fields                                 |
| -------------------------- | ----------------------------------------------------------- |
| `readSteps`                | `startDate`, `endDate`, `count`                             |
| `readDistance`             | `startDate`, `endDate`, `distanceMeters`, `scope`           |
| `readActiveEnergyBurned`   | `startDate`, `endDate`, `kilocalories`                      |
| `readBodyMass`             | `startDate`, `endDate`, `kilograms`                         |
| `readHeartRate`            | `date`, `bpm`                                               |
| `readBloodPressure`        | `date`, `systolicMmHg`, `diastolicMmHg`                     |
| `readBloodGlucose`         | `date`, `millimolesPerLiter`                                |
| `readBodyTemperature`      | `date`, `celsius`                                           |
| `readRestingHeartRate`     | `date`, `bpm`                                               |
| `readHeartRateVariability` | `date`, `milliseconds`, `method`                            |
| `readOxygenSaturation`     | `date`, `percentage`                                        |
| `readHeight`               | `date`, `meters`                                            |
| `readSleepSamples`         | tagged session-envelope or stage fields                     |
| `readWorkouts`             | workout duration, activity, labels, and metric availability |

```ts
const page = await NitroHealth.readSteps({
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-02T00:00:00.000Z'),
  limit: 100,
  ascending: true,
})

for (const sample of page.samples) {
  console.log(sample.count, sample.identity, sample.origin)
}
```

`startDate` is inclusive and `endDate` is exclusive. `limit` defaults to 1000 and `ascending` defaults to `true`. An empty successful query returns `samples: []` without `nextCursor`.

### Pagination

Pass the opaque `nextCursor` back to the same read with the same range and sort direction:

```ts
let cursor: string | undefined

do {
  const page = await NitroHealth.readSteps({
    startDate,
    endDate,
    limit: 500,
    ascending: true,
    cursor,
  })

  await store(page.samples)
  cursor = page.nextCursor
} while (cursor !== undefined)
```

Cursors are platform-specific, method-specific, query-specific, and short-lived. Do not parse, construct, transfer, or persist them. Invalid or foreign cursors reject.

Android heart-rate and sleep reads page by parent Health Connect record. One record can flatten to multiple returned samples, so a page can contain more samples than `limit`. iOS limits independent samples directly. In either case, `nextCursor` is present whenever another page remains.

### Distance Scope

Distance results state what activity coverage the native record represents:

```ts
type DistanceScope = 'walking-running' | 'activity-unspecified'
```

HealthKit uses the walking/running distance quantity, so iOS raw samples and statistics return `scope: 'walking-running'`. A Health Connect `DistanceRecord` does not preserve that distinction, so Android raw samples and statistics return `scope: 'activity-unspecified'`. Do not compare or merge cross-platform distance totals without considering the scope.

### Blood Pressure

One `BloodPressureSample` always carries both values in millimeters of mercury:

```ts
interface BloodPressureSample extends HealthSample {
  date: Date
  systolicMmHg: number
  diastolicMmHg: number
}
```

Android maps a Health Connect `BloodPressureRecord` one-to-one. On iOS a reading is stored as an `HKCorrelation` containing separate systolic and diastolic `HKQuantitySample` members: `saveBloodPressure()` writes the correlation and both members in one atomic call, `readBloodPressure()` returns one sample per correlation, and `identity` is the correlation record on both platforms (`kind: 'record'`). Other HealthKit consumers can see the member samples as individual systolic/diastolic readings — that is how HealthKit models blood pressure, not a duplicate write.

A malformed third-party correlation (missing or duplicated member samples) rejects the read rather than fabricating a value. Deletion by identity or time range removes the correlation together with the member samples this app wrote. Health Connect's `bodyPosition` and `measurementLocation` have no HealthKit counterpart and are intentionally not modeled — Android writes store the explicit `*_UNKNOWN` constants, tracked for metadata passthrough in [#70](https://github.com/AdrianCD101/react-native-nitro-health/issues/70). Blood pressure statistics are not supported by `readStatistics()` yet.

### Blood Glucose

One `BloodGlucoseSample` carries the concentration in millimoles per liter (multiply by 18.0182 for mg/dL):

```ts
interface BloodGlucoseSample extends HealthSample {
  date: Date
  millimolesPerLiter: number
}
```

Android maps a Health Connect `BloodGlucoseRecord` one-to-one; iOS stores an `HKQuantitySample` in a composed mmol/L unit, so neither platform converts the value in JavaScript. Health Connect's extra fields (`specimenSource`, `mealType`, `relationToMeal`) and HealthKit's `HKMetadataKeyBloodGlucoseMealTime` are intentionally not modeled — they have no clean cross-platform mapping and are tracked for delivery through metadata passthrough in [#69](https://github.com/AdrianCD101/react-native-nitro-health/issues/69). Android writes store the explicit `*_UNKNOWN` constants. Blood glucose statistics are not supported by `readStatistics()`.

### Blood Glucose

One `BloodGlucoseSample` carries the concentration in millimoles per liter (multiply by 18.0182 for mg/dL):

```ts
interface BloodGlucoseSample extends HealthSample {
  date: Date
  millimolesPerLiter: number
}
```

Android maps a Health Connect `BloodGlucoseRecord` one-to-one; iOS stores an `HKQuantitySample` in a composed mmol/L unit, so neither platform converts the value in JavaScript. Health Connect's extra fields (`specimenSource`, `mealType`, `relationToMeal`) and HealthKit's `HKMetadataKeyBloodGlucoseMealTime` are intentionally not modeled — they have no clean cross-platform mapping and are tracked for delivery through metadata passthrough in [#69](https://github.com/AdrianCD101/react-native-nitro-health/issues/69). Android writes store the explicit `*_UNKNOWN` constants. Blood glucose statistics are not supported by `readStatistics()`.

### Body Temperature

One `BodyTemperatureSample` carries the reading in degrees Celsius (°F = °C × 9/5 + 32):

```ts
interface BodyTemperatureSample extends HealthSample {
  date: Date
  celsius: number
}
```

Android maps a Health Connect `BodyTemperatureRecord` one-to-one; iOS stores an `HKQuantitySample` in `HKUnit.degreeCelsius()`. Health Connect's `measurementLocation` and HealthKit's `HKMetadataKeyBodyTemperatureSensorLocation` are intentionally not modeled yet — tracked in [#73](https://github.com/AdrianCD101/react-native-nitro-health/issues/73), where they are the strongest candidate so far for promotion to a typed portable field (8 of 10 values map exactly across platforms). Android writes store the explicit `MEASUREMENT_LOCATION_UNKNOWN` constant. Body temperature statistics are not supported by `readStatistics()`.

### Heart Rate Variability

`readHeartRateVariability()` returns `method: 'sdnn'` on iOS and `method: 'rmssd'` on Android. SDNN and RMSSD are different, non-comparable measures. Never mix samples with different `method` values in one average, chart, or trend. HRV is read-only because there is no portable value to write.

### Sleep Records

`readSleepSamples()` returns one flat tagged array. It preserves complete session envelopes separately from explicit stage intervals:

```ts
const { samples } = await NitroHealth.readSleepSamples({ startDate, endDate })

for (const sample of samples) {
  if (sample.kind === 'session-envelope') {
    console.log(sample.startDate, sample.endDate, sample.stageData)
    // stageData: 'reported' | 'not-reported' | 'unverifiable'
  } else {
    console.log(sample.startDate, sample.endDate, sample.stage)
    if (sample.identity.kind === 'record-child') console.log(sample.identity.record)
  }
}
```

A session envelope has `kind: 'session-envelope'`, bounds, and `stageData`. It does not have a `stage`. A stage has `kind: 'stage'`, bounds, and `stage`; parent ownership is encoded by a `record-child` identity.

- Android returns one record-identity envelope for every `SleepSessionRecord`, followed by its record-child stages. `stageData` is `reported` when explicit stages exist and `not-reported` when none exist.
- iOS returns every HealthKit sleep category interval, including `inBed`, as an independent stage record because HealthKit does not expose native sleep-session ownership.
- A session without stages remains only a session envelope. Nitro Health does not manufacture a synthetic `asleep` stage.

Stages normalize to `inBed`, `awake`, `awakeInBed`, `asleep`, `asleepCore`, `asleepDeep`, `asleepREM`, `outOfBed`, or `unknown`.

### Workouts

Workout reads preserve availability and mapping fidelity instead of collapsing platform differences into optional numbers:

```ts
const { samples: workouts } = await NitroHealth.readWorkouts({
  startDate,
  endDate,
  limit: 50,
  ascending: false,
})

for (const workout of workouts) {
  console.log(workout.elapsedDurationSeconds)

  if (workout.activeDuration.status === 'available') {
    console.log(workout.activeDuration.value)
  }

  if (workout.activity.status === 'known') {
    console.log(workout.activity.type, workout.activity.portability, workout.activity.mapping)
  } else {
    console.log('unknown native activity')
  }

  console.log(workout.title, workout.brandName)
  console.log(workout.totalDistance, workout.totalActiveEnergyBurned)
}
```

`elapsedDurationSeconds` is always wall-clock `endDate - startDate`. `activeDuration` is pause-aware when reported. HealthKit returns it as `available`; the Health Connect exercise-session record does not expose it, so Android returns `unsupported`.

`activity` is either `{ status: 'unknown' }` or a known activity with:

- `type`: the normalized `WorkoutActivityType`.
- `portability`: `portable` when the normalized value is also accepted for cross-platform writes, otherwise `read-only`.
- `mapping`: `exact` when the normalized type preserves native meaning, or `broadened` when a more specific native activity was folded into a broader type such as treadmill running to `running`.

Unknown or future native activity values remain explicitly `unknown`; they are not silently converted to `other`.

`title` and `brandName` are separate fields. Android supplies the exercise-session title and currently has no brand field. HealthKit supplies workout brand metadata and currently has no native session title in this mapping.

`activeDuration`, `totalDistance`, and `totalActiveEnergyBurned` are `HealthMetricValue` values:

```ts
type HealthMetricValue =
  { status: 'available'; value: number } | { status: 'not-reported' } | { status: 'unsupported' }
```

On iOS, total distance and active energy are `available` when the workout reports them and `not-reported` otherwise. Android currently returns `unsupported` for both exercise-session totals.

## Aggregation

Use native aggregation rather than summing raw samples. HealthKit and Health Connect can account for overlapping sources in ways a JavaScript sum cannot.

```ts
const dailySteps = await NitroHealth.readStatistics('steps', {
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-08T00:00:00.000Z'),
  bucket: 'day',
  metrics: ['sum'],
})

const heartRate = await NitroHealth.readStatistics('heartRate', {
  startDate,
  endDate,
  bucket: 'hour',
  metrics: ['avg', 'min', 'max'],
})
```

| Data type            | Metrics             | Unit                 |
| -------------------- | ------------------- | -------------------- |
| `steps`              | `sum`               | count                |
| `distance`           | `sum`               | meters, plus `scope` |
| `activeEnergyBurned` | `sum`               | kcal                 |
| `heartRate`          | `avg`, `min`, `max` | bpm                  |
| `restingHeartRate`   | `avg`, `min`, `max` | bpm                  |
| `height`             | `avg`, `min`, `max` | meters               |
| `bodyMass`           | `avg`, `min`, `max` | kg                   |

Sleep, HRV, oxygen saturation, blood pressure, blood glucose, body temperature, and workout statistics are not supported by `readStatistics()`. Invalid data-type/metric combinations reject before crossing the native boundary.

Buckets anchor at `startDate`. Use local midnight for calendar-day buckets. `week` is a rolling seven-day interval from that anchor. The final bucket is clamped to `endDate`, empty buckets are omitted, and results are ascending. Hour buckets are fixed 3600-second intervals; day, week, and month buckets follow the device calendar and local time zone.

`readHeartRateStatistics({ startDate, endDate })` remains the whole-range heart-rate aggregate and returns `{ average?, min?, max? }`.

## Change Tracking

Change tokens are durable synchronization checkpoints. They are different from pagination cursors. Persist one token per `HealthDataType` and device/store.

Create the token before the initial snapshot so changes that occur while paging the snapshot are not lost:

```ts
import { NitroHealth, type HealthRecordChange } from 'react-native-nitro-health'

let changesToken = await NitroHealth.createChangesToken('steps')
await replaceInitialStepSnapshot()

for (;;) {
  const result = await NitroHealth.getChanges('steps', changesToken)

  if (result.tokenExpired) {
    changesToken = await NitroHealth.createChangesToken('steps')
    await replaceInitialStepSnapshot()
    continue
  }

  await database.transaction(async () => {
    for (const change of result.changes) {
      await applyStepChange(change)
    }

    // Commit the checkpoint only after every change in this page succeeds.
    await saveChangesToken(result.nextChangesToken)
  })

  changesToken = result.nextChangesToken
  if (!result.hasMore) break
}

async function applyStepChange(change: HealthRecordChange<'steps'>) {
  if (change.type === 'delete') {
    await removeSamplesForRecord(change.record.id)
    return
  }

  // An upsert is the complete current content of this parent record.
  await replaceSamplesForRecord(change.record.id, change.samples)
}
```

Change identity is always record-level: every change has `record: { kind: 'record', id }`. An upsert can contain one sample, multiple record-child samples, or an empty array. Replace all locally cached samples owned by `change.record`; never append an upsert blindly. A delete removes every cached child owned by that record.

Process changes in returned order, but do not treat that order as a cross-platform event timeline. Persist `nextChangesToken` only after the page commits. Reusing the input token safely replays the page; committing the next token early can lose changes. Serialize drains per data type, or use compare-and-swap persistence, so foreground and background sync cannot commit out of order. Continue immediately while `hasMore` is true.

Tokens are opaque, platform-specific, data-type-specific, and device/store-specific. Never parse, modify, or transfer them. Health Connect tokens expire after approximately 30 days and then return `{ tokenExpired: true }`; create a new token before rebuilding the snapshot. HealthKit does not expose token expiration, though native query failures can still reject. The first iOS token creation drains existing anchored-query history internally to establish a current checkpoint and can take longer on a large store.

For versioned writes, `sync.id` is the app's logical identity while `identity` remains physical native identity. A replacement may keep or change its physical record ID depending on the health service. Synchronize from record changes rather than assuming IDs survive replacement.

## Background Synchronization

Both background modes feed the same durable change-token drain described above:

- Observer mode emits only a coalesced hint containing `dataTypes`; the app drains each type's last committed token.
- Polling mode runs from an app-owned scheduler and drains those same tokens.

The app always owns token persistence, serialized drains, database transactions, retry policy, network policy, and initial/expired-token snapshots.

### Configure, Disable, And Subscribe

The typed outcome tells the app whether native observer delivery completed or app-owned polling work remains:

```ts
const configured = await NitroHealth.configureBackgroundChanges({
  dataTypes: ['steps', 'sleep'],
  frequency: 'hourly',
})

if (configured.status === 'completed') {
  // configured.mode is 'observer'. Native observer configuration is active.
} else if (configured.status === 'user-action-required') {
  // configured.mode is 'polling' and scheduling is 'app-owned'.
  if (configured.backgroundRead === 'not-granted') {
    await NitroHealth.requestAdditionalAccess('background-read')
  }
  await scheduleAppOwnedHealthPolling()
} else {
  // Health data is unavailable.
}
```

Subscribe without checking the operating system:

```ts
const background = NitroHealth.subscribeToBackgroundChanges(({ dataTypes }) => {
  for (const dataType of dataTypes) {
    scheduleSerializedChangesDrain(dataType)
  }
})

if (background.mode === 'observer') {
  // Keep this cleanup handle for the listener lifetime.
  background.subscription.remove()
} else if (background.mode === 'polling') {
  // No listener was installed. Maintain the app-owned polling schedule.
  console.log(background.scheduling)
} else {
  console.log(`Health service unavailable: ${background.availability.reason}`)
}
```

In real startup code, retain an observer subscription until teardown rather than removing it immediately. Multiple observer listeners are supported; each returned subscription owns its cleanup. Removing a listener does not disable configured delivery.

Disable selected observer types, or omit the argument to disable all configured types:

```ts
const disabled = await NitroHealth.disableBackgroundChanges(['steps'])

if (disabled.status === 'user-action-required') {
  // Polling mode: cancel the corresponding app-owned scheduled work.
  await cancelAppOwnedHealthPolling(['steps'])
}

await NitroHealth.disableBackgroundChanges()
```

In polling mode, configure and disable cannot create or cancel the consumer's scheduler, so both return `user-action-required`. Observer frequencies are HealthKit scheduling hints, not timing guarantees.

### iOS Observer Bootstrap And Retention

iOS observer configuration is persisted by the library. The native bootstrap restores configured observers before JavaScript starts, and pending data-type hints are retained and coalesced until a JavaScript listener receives them. The library acknowledges a native delivery after the current JavaScript listeners have run. Always drain the durable token because a hint contains no records and can be delayed, duplicated, or coalesced.

HealthKit exposes observer delivery as an iOS capability, but does not provide an iOS API for inspecting the host app's signed background-delivery entitlement. A missing entitlement therefore causes `configureBackgroundChanges()` to reject rather than changing the reported capability to polling.

Autolinking cannot restore observers early enough for terminated-app delivery. Add the HealthKit background-delivery entitlement to the consumer target:

```xml
<key>com.apple.developer.healthkit.background-delivery</key>
<true/>
```

Import the library bootstrap header from the app target's Objective-C bridging header:

```objc
#import <NitroHealth/NitroHealthBackgroundDelivery.h>
```

Then call the bootstrap near the beginning of `application(_:didFinishLaunchingWithOptions:)`, before React Native starts:

```swift
func application(
  _ application: UIApplication,
  didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
) -> Bool {
  NitroHealthRegisterPersistedObservers()

  // Start React Native after persisted observers have been registered.
  return true
}
```

Objective-C and Objective-C++ AppDelegates can import `NitroHealthBackgroundDelivery.h` directly. Bare React Native apps add this setup once. Expo prebuild apps must apply the entitlement, bridging import, and AppDelegate call through their own config plugin; this package does not currently ship one.

HealthKit can enforce slower minimum frequencies for some types, protected data can be unavailable while the device is locked, and force-quitting can prevent relaunch. Drain configured tokens on normal launch and foreground activation even when no hint was received. True server delivery and cold-launch behavior require a signed physical device; Simulator is insufficient.

### Android Polling And Additional Permissions

Android has no application-facing Health Connect change observer. The app schedules WorkManager, an Expo background task, or another scheduler and drains change tokens when that work runs.

Declare background and extended-history permissions in the consumer manifest only when those workflows are used:

```xml
<uses-permission android:name="android.permission.health.READ_HEALTH_DATA_IN_BACKGROUND" />
<uses-permission android:name="android.permission.health.READ_HEALTH_DATA_HISTORY" />
```

These permissions do not replace data-type read permissions. `getCapabilities()` distinguishes unsupported, undeclared, ungranted, and granted states through Health Connect feature checks and manifest/grant inspection. After adding a missing declaration, rebuild the app before requesting it.

Each scheduled run should recheck availability, `getCapabilities()`, and relevant per-entry read permissions, then drain every token until `hasMore` is false. Handle token expiration with the token-before-snapshot sequence. Android configure/disable results never schedule or cancel work on the consumer's behalf.

## Writing Data

Request write authorization before saving. Save methods exist for steps, distance, active energy, heart rate, blood pressure, blood glucose, body temperature, resting heart rate, oxygen saturation, height, body mass, sleep sessions, and completed workouts. HRV remains read-only.

```ts
const authorization = await NitroHealth.requestAuthorization([
  { accessType: 'write', dataType: 'steps' },
])

const stepsWrite = authorization.statuses.find(
  ({ permission }) => permission.accessType === 'write' && permission.dataType === 'steps'
)

if (stepsWrite?.status === 'granted') {
  await NitroHealth.saveSteps([
    {
      startDate: new Date('2026-01-01T09:00:00.000Z'),
      endDate: new Date('2026-01-01T09:30:00.000Z'),
      count: 512,
      sync: { id: 'morning-walk', version: 1 },
    },
  ])
}
```

The main value constraints are:

- `saveSteps`: positive integer `count`, at most 1,000,000.
- `saveDistance`: non-negative `distanceMeters`, at most 1,000,000, plus required scope intent.
- `saveActiveEnergyBurned`: non-negative `kilocalories`, at most 1,000,000.
- `saveHeartRate` and `saveRestingHeartRate`: `bpm` from 1 through 300. Android rounds to whole bpm.
- `saveBloodPressure`: `systolicMmHg` from 20 through 200 and `diastolicMmHg` from 10 through 180.
- `saveBloodGlucose`: `millimolesPerLiter` from 0.5 through 50.
- `saveBodyTemperature`: `celsius` from 20 through 45.
- `saveOxygenSaturation`: `percentage` from 0 through 100.
- `saveHeight`: `meters` greater than 0 and at most 3.
- `saveBodyMass`: `kilograms` greater than 0 and at most 1,000.

Interval inputs require `startDate < endDate`; point measurements use `date`. Batch saves require a non-empty array.

Most inputs can include `sync: { id, version }` for retry-safe versioned writes. Exact retries are idempotent in stored state, a higher version replaces the logical record, and a lower version is ignored. Increment `version` whenever payload changes. IDs are nonblank, case-sensitive, scoped to the app and data type, and unique within one batch. Sleep sessions intentionally do not accept `sync` because one session can map to several independent HealthKit samples.

Avoid overlapping cumulative writes. Health Connect and HealthKit aggregate overlaps differently even though raw reads preserve every stored record.

### Write Distance

Distance writes require explicit walking/running intent:

```ts
const result = await NitroHealth.saveDistance([
  {
    scope: 'walking-running',
    startDate,
    endDate,
    distanceMeters: 1250,
    sync: { id: 'walk-2026-01-01', version: 1 },
  },
])

console.log(result.status, result.storedScope)
```

The only accepted input scope is `walking-running`. The returned `{ status: 'completed', storedScope }` reports what the native store retained. HealthKit stores walking/running distance and returns `walking-running`. Health Connect stores a general `DistanceRecord` without activity scope and returns `activity-unspecified`. The result makes this loss of specificity explicit.

### Write Sleep Sessions

```ts
await NitroHealth.saveSleepSessions([
  {
    startDate: new Date('2026-01-11T03:00:00.000Z'),
    endDate: new Date('2026-01-11T11:30:00.000Z'),
    timeZone: 'America/New_York',
    stages: [
      {
        startDate: new Date('2026-01-11T03:15:00.000Z'),
        endDate: new Date('2026-01-11T06:30:00.000Z'),
        stage: 'asleepCore',
      },
      {
        startDate: new Date('2026-01-11T06:30:00.000Z'),
        endDate: new Date('2026-01-11T08:00:00.000Z'),
        stage: 'asleepDeep',
      },
    ],
  },
])
```

Writable stages are `awake`, `asleep`, `asleepCore`, `asleepDeep`, and `asleepREM`. Stages must have positive duration, stay inside the session, and not overlap. Gaps and adjacent intervals are allowed. `timeZone` is an optional IANA identifier and defaults to the device time zone.

Android writes one session record with nested stages. iOS writes one `inBed` category interval and each explicit stage in one save operation. Reads return Android session envelopes or independent iOS stages through the flat tagged model; neither platform receives a synthetic `asleep` stage for an unstaged session.

### Write Workouts

```ts
await NitroHealth.saveWorkout({
  startDate: new Date('2026-08-04T10:00:00.000Z'),
  endDate: new Date('2026-08-04T10:45:00.000Z'),
  activityType: 'running',
  displayName: 'Morning run',
  timeZone: 'America/New_York',
  sync: { id: 'workout-2026-08-04-morning', version: 1 },
})
```

`activityType` accepts `WritableWorkoutActivityType`, the portable subset that reads back with the same normalized meaning. Read-only and unknown activities reject rather than silently changing meaning. Canonical writes choose one native subtype where reads broaden several variants.

`displayName` is write intent, not a promise that both stores expose the same native field. It becomes the Android workout `title` and the iOS workout `brandName`; reads keep those fields separate. The workout interval supplies elapsed duration. This API does not write pause events, distance/energy totals, routes, segments, laps, or planned workouts.

## Deleting Records

Deletion removes only records written by the calling app and requires the matching write permission.

`deleteRecordsByIds()` accepts only independently deletable `HealthRecordIdentity` values, not strings or record-child identities:

```ts
const [sample] = (await NitroHealth.readSteps({ startDate, endDate })).samples

if (sample?.identity.kind === 'record') {
  const result = await NitroHealth.deleteRecordsByIds('steps', [sample.identity])

  console.log(result.deletedCount.value)
}
```

The result is:

```ts
type HealthIdentityDeleteResult = {
  status: 'completed'
  requestedCount: number
  deletedCount: { status: 'known'; value: number }
}

type HealthTimeRangeDeleteResult = {
  status: 'completed'
  deletedCount: { status: 'known'; value: number } | { status: 'unverifiable' }
}
```

Delete-by-ID always reports an exact count after success. A no-match or foreign record rejects on both platforms rather than returning plausible success. Android deletion remains transactional; iOS can report a partial count for mixed matching and nonmatching identities. Time-range deletion reports an exact iOS count and an `unverifiable` Android count.

Record-child identities cannot be passed directly. To intentionally delete a child's whole parent, pass its parent record identity:

```ts
if (heartRateReading.identity.kind === 'record-child') {
  // This removes the complete Health Connect HeartRateRecord and every sibling reading.
  await NitroHealth.deleteRecordsByIds('heartRate', [heartRateReading.identity.record])
}
```

The same implication applies to Android sleep stages: deleting `stage.identity.record` deletes the complete sleep session envelope and all sibling stages.

Delete caller-owned records overlapping a range with:

```ts
const result = await NitroHealth.deleteRecordsByTimeRange('steps', {
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-02T00:00:00.000Z'),
})
```

Time-range deletion always returns `completed` when the native operation succeeds. iOS reports a known exact count; Health Connect does not expose the count, so Android returns `{ status: 'unverifiable' }`. A successful no-match range is not an error.

## Jest Mock

The package mock models the portable workflow rather than Nitro internals. Load the shared mock in a Jest setup file:

```js
jest.mock('react-native-nitro-health', () => require('react-native-nitro-health/jest/mock'))
```

Or use the packaged setup entry:

```js
module.exports = {
  setupFilesAfterEnv: ['react-native-nitro-health/jest/setup'],
}
```

Three profiles are available:

- `polling` (default): available service, app-owned polling, background/history access `not-granted`, direct revocation, and distance writes stored as `activity-unspecified`.
- `observer`: available service, observer frequencies, included background/history access, observer subscriptions, manual permission management/revocation, and walking/running distance storage.
- `unavailable`: `not-supported` availability, unsupported additional access, unavailable permission/background outcomes, and polling capability shape.

Reset the exported singleton for each test and select the workflow under test:

```ts
import { NitroHealth, resetNitroHealthMock } from 'react-native-nitro-health/jest/mock'

beforeEach(() => {
  resetNitroHealthMock({ profile: 'observer' })
})

test('handles unavailable health data', () => {
  resetNitroHealthMock({ profile: 'unavailable' })
  expect(NitroHealth.getAvailability()).toEqual({
    status: 'unavailable',
    reason: 'not-supported',
  })
})
```

Use `options.overrides` for one test-specific method while retaining a profile's other defaults:

```ts
resetNitroHealthMock({
  profile: 'polling',
  overrides: {
    getChanges: jest.fn().mockResolvedValue({ tokenExpired: true }),
  },
})
```

`createNitroHealthMock(options)` creates an independent mock object for dependency injection. `resetNitroHealthMock(options)` mutates and returns the exported `NitroHealth` mock used by the package mock. Overrides are applied after profile defaults.

Default reads return empty pages, statistics return empty results, `createChangesToken()` returns `mock-changes-token`, and `getChanges()` returns an empty successful page. The mock enforces workflow-level requirements such as non-empty permission, background, write, and deletion inputs, but deliberately does not duplicate every sample-field validator from the facade. It is stateless: writes and deletes do not modify subsequent reads or emulate version replacement, native ownership, or token history.

## Breaking Migration

This API replaces the previous surface; removed names and shapes are not compatibility aliases.

- Replace `getAvailabilityStatus()` and `isAvailable()` with `getAvailability()`; old `providerUpdateRequired` is now the typed unavailable reason `provider-install-or-update-required` with a recovery action.
- Replace `openHealthConnectInstall()` with `performAvailabilityRecovery(availability.recovery)` when `getAvailability()` supplies recovery.
- Remove `getRequestStatusForAuthorization()`. Inspect each entry returned by `getPermissionStatuses()` or `requestAuthorization()`.
- `getPermissionStatuses()` now returns a tagged `status` result; the old `availabilityStatus` field is removed.
- `requestAuthorization()` no longer returns aggregate `requestStatus`, `grantedPermissions`, `deniedPermissions`, or `unverifiablePermissions`. It returns `completed` or `unavailable` plus ordered `statuses` entries.
- Replace `openHealthSettings()` with `managePermissions()` and use `revokeAllPermissions()` for explicit revocation.
- Replace `getBackgroundReadAuthorizationStatus()` and `requestBackgroundReadAuthorization()` with `getCapabilities()` and `requestAdditionalAccess('background-read')`; history access uses `'history-read'`.
- Replace `enableBackgroundDelivery`, `disableBackgroundDelivery`, and `addOnChangeNotificationListener` with `configureBackgroundChanges`, `disableBackgroundChanges`, and `subscribeToBackgroundChanges`.
- Replace sample `uuid`, `recordUuid`, and optional `source` with tagged `identity` and required `origin`.
- Replace `deleteSamplesByUuids` and `deleteSamplesByTimeRange` with `deleteRecordsByIds` and `deleteRecordsByTimeRange`; both now return typed outcomes.
- Sleep results are now `session-envelope` or `stage` records. Stage-less sessions no longer produce a synthetic `asleep` interval.
- Workout `durationSeconds`, `activityType`, `totalDistanceMeters`, and `totalEnergyBurnedKcal` are now `elapsedDurationSeconds`, `activity`, `totalDistance`, and `totalActiveEnergyBurned`. `activeDuration`, `brandName`, and metric availability are explicit. Workout write `title` is now `displayName` intent.
- Distance reads/statistics now include `scope`; distance writes require `scope: 'walking-running'` and return `storedScope`.
- Root exports no longer include `Native*` types or `NitroHealthSpec`. Platform and source subpaths are not package entry points.

## Credits

Bootstrapped with [create-nitro-module](https://github.com/patrickkabwe/create-nitro-module).

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss the intended API and native semantics.
