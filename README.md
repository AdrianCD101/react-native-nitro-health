# react-native-nitro-health

react-native-nitro-health is a react native package built with Nitro

[![Version](https://img.shields.io/npm/v/react-native-nitro-health.svg)](https://www.npmjs.com/package/react-native-nitro-health)
[![Downloads](https://img.shields.io/npm/dm/react-native-nitro-health.svg)](https://www.npmjs.com/package/react-native-nitro-health)
[![License](https://img.shields.io/npm/l/react-native-nitro-health.svg)](https://github.com/AdrianCD101/react-native-nitro-health/blob/main/LICENSE)

## Requirements

- React Native v0.76.0 or higher
- Node 18.0.0 or higher
- iOS 16.0 or higher

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

const current = await NitroHealth.getPermissionStatuses(permissions)
const status = await NitroHealth.getRequestStatusForAuthorization(permissions)

if (status === 'shouldRequest') {
  const result = await NitroHealth.requestAuthorization(permissions)

  if (result.status === 'denied' || result.status === 'partial') {
    // Show your app-specific rationale or settings instructions.
    await NitroHealth.openHealthSettings()
  }
}
```

`getPermissionStatuses()` reports one current state per requested permission without opening system authorization UI. States are `granted`, `notGranted`, `notDetermined`, or `unverifiable`. Android reports `granted` or `notGranted` because Health Connect does not distinguish denial from a permission that has never been requested. HealthKit reports all read permissions as `unverifiable`; write permissions can be `granted`, `notGranted`, or `notDetermined`. When the health API is unavailable, every requested permission is `unverifiable` and `availabilityStatus` explains why.

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
| `sleep`                | `android.permission.health.READ_SLEEP`                  | `android.permission.health.WRITE_SLEEP`                  |
| `bodyMass`             | `android.permission.health.READ_WEIGHT`                 | `android.permission.health.WRITE_WEIGHT`                 |
| `workout`              | `android.permission.health.READ_EXERCISE`               | n/a (writes not supported yet)                           |

Background Health Connect reads additionally require `android.permission.health.READ_HEALTH_DATA_IN_BACKGROUND`; see [Background Synchronization](#background-synchronization). This permission does not replace any data-type read permission.

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

`readSteps()` resolves with a page of step count samples with `uuid`, `startDate`, `endDate`, and `count`. `uuid` identifies the physical native sample — the HealthKit sample UUID on iOS, the Health Connect record id on Android. It remains valid for that physical sample, but a higher-version iOS write replaces the sample and creates a new UUID. When the platform query succeeds but no matching samples are available, `samples` is empty and `nextCursor` is absent; when more data exists beyond `limit`, the page carries a `nextCursor` (see [Pagination](#pagination)). Apps must request and receive steps read permission before relying on returned data.

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

## Change Tracking

Use change tracking to keep a local database or backend synchronized after an initial snapshot. Changes tokens are durable checkpoints and are separate from the short-lived pagination cursors above. Create and persist one token per `HealthDataType`.

Create the token **before** reading the initial snapshot. That ordering ensures changes made while the snapshot is being paged are returned afterward:

```ts
import { NitroHealth } from 'react-native-nitro-health'
import type { HealthRecordChange } from 'react-native-nitro-health'

let changesToken = await NitroHealth.createChangesToken('steps')

// Read and store the initial snapshot using readSteps() and its pagination cursor.
await storeInitialStepSnapshot()

do {
  const result = await NitroHealth.getChanges('steps', changesToken)

  if (result.tokenExpired) {
    // Create a new token before replacing the local snapshot, then drain it.
    changesToken = await NitroHealth.createChangesToken('steps')
    await replaceInitialStepSnapshot()
    continue
  }

  await database.transaction(async () => {
    for (const change of result.changes) {
      await applyRecordChange(change)
    }

    // Persist only after every change in the page was applied successfully.
    await saveChangesToken(result.nextChangesToken)
  })

  changesToken = result.nextChangesToken
  if (!result.hasMore) break
} while (true)

async function applyRecordChange(change: HealthRecordChange<'steps'>) {
  if (change.type === 'delete') {
    await removeSamplesByRecordUuid(change.recordUuid)
    return
  }

  // An upsert contains the complete current contents of its native record.
  await replaceSamplesByRecordUuid(change.recordUuid, change.samples)
}
```

Every public sample has both `uuid` and `recordUuid`. `uuid` identifies the returned sample. `recordUuid` identifies its native parent record and is the key used by change tracking. They are equal except for Android heart-rate readings and sleep stages, where one Health Connect record is flattened into several samples such as `recordUuid#0`, `recordUuid#1`, and so on. Those index-based sample identifiers can change when an updated parent record reorders its children. Always replace all cached samples sharing an upsert's `recordUuid`; never append an upsert blindly. An upsert may contain an empty `samples` array, which means the parent record currently has no child samples and any cached children must be removed.

For versioned writes, `sync.id` is the logical application identity; `uuid` and `recordUuid` remain physical native identities. Current Health Connect implementations keep the same `recordUuid` when a higher version replaces a record. iOS creates a sample with a new UUID and deletes the previous sample, so change tracking reports an upsert under the new `recordUuid` and a deletion for the old one. Any previously cached iOS UUID is stale after that replacement.

`getChanges()` returns a sequence of `upsert` and `delete` changes. Process them in the returned order, but do not treat that order as a cross-platform event timeline. A successful page includes `nextChangesToken`; apply the page transactionally and persist that token only afterward. Reusing the previous token safely replays a page, while saving the next token before applying the page can permanently lose changes. Serialize drains for each data type, or use compare-and-swap persistence against the input token, so two foreground/background syncs cannot commit checkpoints out of order. Continue immediately while `hasMore` is true. iOS deliberately performs one terminal empty anchored query, so its final non-empty page may still report `hasMore: true`.

Changes tokens are opaque, platform-specific, data-type-specific, and device/store-specific. Never parse, modify, or transfer them between devices. Invalid, foreign-platform, pagination, or wrong-data-type tokens reject. Health Connect tokens expire after approximately 30 days; an expired token returns `{ tokenExpired: true }` and requires the token-before-snapshot sequence again. HealthKit does not expose token expiration, but native query failures still reject. Creating the first iOS token drains existing HealthKit history internally to establish the current checkpoint, so it can take longer for data types with substantial history.

Change tracking uses the same read authorization as raw reads. HealthKit cannot reveal a denied read permission after the authorization prompt, so denial can still appear as an empty result on iOS. Request authorization before creating tokens, and perform a full resync after material permission changes.

## Background Synchronization

Background support differs by platform. HealthKit can wake an iOS app with an observer notification. Health Connect does not expose change notifications to applications; Android apps schedule their own polling and use a separate permission to read while backgrounded. In both cases, your app owns changes-token persistence, serialized drains, database transactions, retries, network policy, and scheduling.

### iOS change notifications

After one native setup step, consumers choose every observed data type and frequency from JavaScript with `enableBackgroundDelivery()`. The native setup does not register any data type by itself; it only restores the choices previously persisted by those JavaScript calls when HealthKit launches the app before JavaScript is ready.

Autolinking alone is not sufficient for terminated-app delivery. Apple requires observer queries to be restored during `application(_:didFinishLaunchingWithOptions:)`. This release intentionally does not use AppDelegate swizzling, Objective-C `+load` side effects, or another hidden startup hook. It also does not ship an Expo config plugin. Bare React Native apps perform the setup below once; Expo prebuild apps must apply the same entitlement, bridging-header import, and AppDelegate call through their own config plugin until first-party Expo support is added.

Add the HealthKit background-delivery entitlement to the app target:

```xml
<key>com.apple.developer.healthkit.background-delivery</key>
<true/>
```

Import the library's narrow C bootstrap header from the app target's Objective-C bridging header. If the target does not have one, create it and set `SWIFT_OBJC_BRIDGING_HEADER` to its project-relative path:

```objc
#import <NitroHealth/NitroHealthBackgroundDelivery.h>
```

Then register persisted observers near the beginning of `application(_:didFinishLaunchingWithOptions:)`, before React Native starts:

```swift
func application(
  _ application: UIApplication,
  didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
) -> Bool {
  NitroHealthRegisterPersistedObservers()

  // Start React Native after restoring observers.
  return true
}
```

Objective-C and Objective-C++ AppDelegates can import `NitroHealthBackgroundDelivery.h` directly and call `NitroHealthRegisterPersistedObservers()` without a bridging header.

After requesting the normal read permission, enable each data type independently and register one or more listeners during application startup:

```ts
const subscription = NitroHealth.addOnChangeNotificationListener(({ dataTypes }) => {
  for (const dataType of dataTypes) {
    scheduleSerializedChangesDrain(dataType)
  }
})

await NitroHealth.enableBackgroundDelivery('steps', 'hourly')

// Later:
subscription.remove()
await NitroHealth.disableBackgroundDelivery('steps')
```

Listeners and delivery configuration have separate lifetimes: removing a listener does not disable HealthKit delivery. Configured types and frequencies persist across launches. A notification received before JavaScript attaches is coalesced by data type and handed to the first listener. Notifications contain no records and can be delayed, duplicated, or coalesced; always call `getChanges()` with the last committed token to discover the actual upserts and deletions.

`immediate`, `hourly`, `daily`, and `weekly` are HealthKit scheduling hints, not delivery guarantees. HealthKit enforces slower minimum frequencies for some types (step count is commonly hourly), protected health data can be inaccessible while the device is locked, and a user force-quit can prevent relaunch. Drain every configured token on normal app launch and foreground activation even when no notification was received. True background relaunch must be validated on a signed physical device; HealthKit background server delivery is not supported on Simulator.

The background delivery methods and change-notification listener are iOS-only. Background-delivery promises reject on Android, while listener registration throws synchronously with guidance to use app-owned polling.

### Android background reads

Declare the permission in the consumer app, not the library manifest:

```xml
<uses-permission android:name="android.permission.health.READ_HEALTH_DATA_IN_BACKGROUND" />
```

Check runtime feature support and manifest/grant state before scheduling work:

```ts
let status = await NitroHealth.getBackgroundReadAuthorizationStatus()

if (status === 'notGranted') {
  status = await NitroHealth.requestBackgroundReadAuthorization()
}

if (status === 'granted') {
  scheduleHealthSyncWork()
}
```

The returned status is `unavailable`, `notDeclared`, `notGranted`, or `granted`. Availability is checked through Health Connect's background-read feature flag rather than Android API level alone. The request method opens the Health Connect permission flow only from `notGranted`; all other states return without prompting. On iOS both methods resolve to `unavailable` because HealthKit uses background delivery instead of a separate background-read permission.

Background authorization does not wake or schedule the Android app. Use application-owned WorkManager, an Expo background-task integration, or another scheduler. Each run should recheck Health Connect availability, background authorization, and the relevant data-type read permissions, then transactionally drain `getChanges()` until `hasMore` is false. Handle `tokenExpired` with the token-before-snapshot resynchronization sequence above.

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

Batch save methods are available for `steps`, `distance`, `activeEnergyBurned`, `heartRate`, `restingHeartRate`, `oxygenSaturation`, `height`, `bodyMass`, and sleep sessions. Heart rate variability remains read-only by design; see [Read Heart Rate Variability](#read-heart-rate-variability). Request write authorization first, then save:

```ts
import { NitroHealth } from 'react-native-nitro-health'

const result = await NitroHealth.requestAuthorization([{ accessType: 'write', dataType: 'steps' }])

if (result.deniedPermissions.length === 0) {
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

Every non-sleep sample input may include `sync: { id, version }` for retry-safe, versioned writes. Without `sync`, the write has no application-controlled identity and retries are not portably idempotent. With `sync`, an exact retry of the same id, version, and payload is idempotent in stored state; a strictly higher version replaces the logical record, and a lower version is ignored. Native change tracking may still emit a current-state upsert for a retry. Reusing an id and version with a changed payload is unsupported — increment `version` whenever the payload changes. IDs must be nonblank, versions must be non-negative safe integers, and duplicate IDs within one save call reject. IDs are case-sensitive and scoped to the writing app and `HealthDataType`, so one id must identify only one logical record of that type.

All save methods take a non-empty array, resolve to `void` after the atomic call succeeds, and do not report whether an input was inserted, retried, replaced, or ignored. They reject before crossing the native boundary when validation fails — error messages include the failing index, for example `samples[2]: bpm must be between 1 and 300`.

The value ranges mirror what Health Connect enforces at insert time, applied on both platforms so a sample that saves on iOS also saves on Android.

### Write Sleep Sessions

`saveSleepSessions(sessions)` writes complete session bounds with optional detailed stages:

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

Writable stages are `awake`, `asleep`, `asleepCore`, `asleepDeep`, and `asleepREM`. The read-only values `inBed`, `awakeInBed`, `outOfBed`, and `unknown` are rejected because they do not have the same meaning on both platforms. Stage intervals must have positive duration, remain inside the session, and not overlap; adjacency and gaps are allowed. Input stages are saved in chronological order without mutating the caller's array.

`timeZone` is an optional IANA identifier such as `America/New_York`. When omitted, the device's current time zone is used. Android derives separate start and end offsets so sessions crossing a daylight-saving transition retain the correct civil time. iOS stores the time zone as HealthKit metadata on every written interval.

Android writes one `SleepSessionRecord` with nested stages. iOS writes one `inBed` interval for the session envelope plus one interval per stage, all in one HealthKit save call. Consequently, `readSleepSamples()` returns only flattened stages for a staged Android session but returns the overlapping `inBed` envelope and stages on iOS. A stage-less session reads as `asleep` on Android under the existing read normalization and `inBed` on iOS.

Sleep sessions intentionally do not accept `sync`: one logical session maps to one Android record but several independent HealthKit samples, so HealthKit cannot provide the same atomic whole-session replacement semantics. Each call is atomic, but retrying a successful sleep write can create duplicates.

Unlike reads, missing write permission is detectable on both platforms: save methods reject with a missing-permission error on Android and iOS alike (on iOS this includes the not-yet-requested state, so request write authorization first). Saved samples are attributed to your app as the source.

Avoid writing cumulative samples with overlapping time intervals. The platforms aggregate overlapping records differently: Health Connect deduplicates overlapping intervals when computing totals (writing 250 steps twice over the same 30-minute window still totals roughly 250), while HealthKit cumulative sums count every sample (the same two writes total 500). Raw reads for those cumulative types return every stored record on both platforms — only aggregates differ. Writing non-overlapping intervals produces consistent totals everywhere.

## Delete Samples

Samples can be deleted by uuid or by time range for every `HealthDataType` (`steps`, `heartRate`, `restingHeartRate`, `heartRateVariability`, `distance`, `activeEnergyBurned`, `oxygenSaturation`, `height`, `sleep`, `bodyMass`, and `workout`). Deletion only removes data **your app wrote** — Health Connect automatically restricts deletes to records owned by the calling app, and HealthKit can only delete objects your app saved. Like saves, deletes are gated on write permission and reject with a missing-permission error otherwise (on iOS this includes the not-yet-requested state, so request write authorization first).

```ts
import { NitroHealth } from 'react-native-nitro-health'

const result = await NitroHealth.requestAuthorization([{ accessType: 'write', dataType: 'steps' }])

if (result.deniedPermissions.length === 0) {
  // Delete specific samples using the `uuid` values returned by reads:
  await NitroHealth.deleteSamplesByUuids('steps', [sample.uuid])

  // Or delete everything your app wrote in a time range:
  await NitroHealth.deleteSamplesByTimeRange('steps', {
    startDate: new Date('2026-01-01T00:00:00.000Z'),
    endDate: new Date('2026-01-02T00:00:00.000Z'),
  })
}
```

- `deleteSamplesByUuids(dataType, uuids)` — deletes samples by the physical `uuid` values returned by reads, not by logical `sync.id`. Takes a non-empty array and rejects before crossing the native boundary when validation fails — error messages include the failing index, for example `uuids[0]: a non-empty uuid string is required`.
- `deleteSamplesByTimeRange(dataType, { startDate, endDate })` — deletes every sample your app wrote in `[startDate, endDate)` on both platforms: `startDate` inclusive, `endDate` exclusive, `startDate` strictly before `endDate`. A time-range delete removes exactly the own-app samples a read over the same range returns, and resolves even when nothing matches.

Both methods resolve to `void` — Health Connect does not report how many records were deleted, so neither platform exposes a count.

On Android, heart-rate readings and sleep stages live inside parent Health Connect records and are read back under synthetic `uuid` values of the form `recordId#index`. Health Connect can only delete whole records, so passing a synthetic uuid to `deleteSamplesByUuids` rejects with `uuids[N]: synthetic reading ids (record id + '#index') cannot be deleted individually; use deleteSamplesByTimeRange instead` — it never silently deletes the parent record and its sibling readings. A sleep session without stages keeps its plain record id and stays deletable by uuid. On iOS every sample — including each heart-rate reading and sleep interval — is its own HealthKit object with a real UUID, so per-sample deletion works there; use time-range deletion when the same code path must also cover Android. iOS additionally rejects malformed uuid strings with `uuids[N]: "…" is not a valid HealthKit sample uuid`.

The no-match behavior of `deleteSamplesByUuids` also differs by platform. On iOS, deleting uuids that match nothing resolves successfully with nothing deleted (HealthKit's no-data error is normalized to success). On Android, delete-by-id is transactional and all-or-nothing: a uuid that does not exist rejects (Health Connect reports it as an IPC failure), a uuid owned by another app rejects with a security error, and in both cases none of the requested records are deleted.

After a higher-version write, current Health Connect implementations retain the record UUID, so it remains valid for deletion. iOS replaces the physical sample, so an older UUID is stale and deleting it is a successful no-op; use the latest UUID from reads or change tracking, or delete by time range.

## Jest

The package ships a Jest mock so app tests do not need to mock Nitro internals. By default, mocked raw sample reads resolve with an empty page (`{ samples: [] }`), `readStatistics` resolves with `[]`, `createChangesToken` resolves with `'mock-changes-token'`, and `getChanges` resolves with an empty successful changes page. The mock is stateless: saves and deletes resolve to `void` but do not affect reads, track sync ids or versions, or emulate retry, replacement, and change-tracking behavior.

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
