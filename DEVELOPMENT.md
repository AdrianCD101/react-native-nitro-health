# Development Workflow

This document lists the verification commands maintainers run for each kind of change. Run the relevant commands locally; no single test layer can validate the TypeScript facade, generated Nitro bindings, native semantic mappings, permission UI, and background delivery by itself.

## One-Time Setup

```sh
bun install
bun run codegen
cd example
bun install
bun run pod # iOS only
```

Run `bun install` again only after dependency or workspace-link changes. After codegen or native changes, run `bun install` in `example/` before rebuilding. Otherwise the example can build against a stale workspace copy and report a new native method as undefined even when generation succeeded.

## Verification Commands

All commands below already exist in the root or example package scripts.

| Purpose | Command from repository root |
| --- | --- |
| Generate Nitro bindings, apply the Android package patch, and build | `bun run codegen` |
| Build package output and verify generated Android output | `bun run build` |
| Run Jest API and example tests | `bun run test` |
| Typecheck the package | `bun run typecheck` |
| Typecheck the example | `bun run typecheck:example` |
| Run both TypeScript checks | `bun run typecheck && bun run typecheck:example` |
| Run Android native semantic tests | `bun run test:android:native` |
| Run iOS native semantic tests | `bun run test:ios:native` |
| Run lint | `bun run lint` |
| Apply lint fixes | `bun run lint:fix` |
| Check formatting | `bun run format:check` |
| Apply formatting | `bun run format` |
| Build and install the iOS example | `cd example && bun run ios` |
| Install iOS pods | `cd example && bun run pod` |
| Build and install the Android example | `cd example && bun run android` |
| Start Metro for an installed example | `cd example && bun run start` |
| Run iOS Harness tests | `bun run harness:ios` |
| Run Android Harness tests | `bun run harness:android` |

Before submitting a change, the minimum repository checks are:

```sh
bun run test
bun run typecheck
bun run typecheck:example
bun run lint
bun run format:check
```

Add the platform-native, Harness, build, and device checks that match the changed behavior.

## Change Matrix

| Change | Required workflow |
| --- | --- |
| Dependencies or a new clone | `bun install` |
| `src/specs/*.nitro.ts` or a native transport type | Codegen workflow, native rebuilds, relevant native/Harness tests |
| Public facade or public TypeScript types | `bun run build`, Jest, both typechecks |
| Swift implementation or helper | iOS native tests when pure, example relink, iOS rebuild, relevant Harness/device test |
| Kotlin implementation or helper | Android native tests when pure, example relink, Android rebuild, relevant Harness/device test |
| iOS pods or native dependencies | `cd example && bun run pod`, then iOS rebuild |
| Example JavaScript only | Jest/typecheck as relevant, then Metro Fast Refresh |
| Permission, availability, observer, history, or store behavior | Native semantic tests plus Harness or manual physical-device coverage |
| Documentation only | Review examples against `src/NitroHealth.ts`, public types, and current native outcomes |

## Codegen Workflow

Nitrogen output under `nitrogen/generated/` is generated code. Do not edit it manually.

After changing a Nitro spec or any type used by the spec:

```sh
bun run codegen
bun run test
bun run typecheck
bun run typecheck:example
cd example
bun install
bun run pod # iOS only when generated pod inputs changed
bun run ios # or: bun run android
```

Use `bun run codegen`, not `bunx nitrogen` directly. The repository script performs this sequence:

1. Runs Nitrogen with debug logging.
2. Runs `post-script.js`, which patches the generated Android `NitroHealthOnLoad.cpp` package path.
3. Runs `bun run build`.
4. `bun run build` executes `verify-codegen.js`, package typechecking, and Bob builds.

The build guard intentionally fails when generated Android output still contains Nitrogen's default `com.margelo.nitro` package path. Re-running the repository codegen script is the fix.

Review generated diffs together with the source spec. A generated signature change must be implemented on both native platforms before the public API is considered complete.

### Native-Only Changes

No codegen is needed when the generated signature is unchanged:

```sh
bun run test:ios:native # for pure Swift semantics, when relevant
bun run test:android:native # for pure Kotlin semantics, when relevant
cd example
bun install
bun run ios # or: bun run android
```

The example relink remains necessary because its workspace dependency can otherwise point at stale library files.

### TypeScript-Only Changes

```sh
bun run build
bun run test
bun run typecheck:example
```

Use the example and Harness when a TypeScript facade change alters native calls, listener lifetime, or result mapping.

## Test Layers

### Jest

Jest is the fast public-API layer:

```sh
bun run test
```

It covers validation, pagination contracts, statistics mapping, durable change results, background observer/polling facade outcomes, per-entry permission results, writes, sleep/workout mapping, typed deletion outcomes, and the packaged mock profiles. Jest does not prove HealthKit or Health Connect behavior.

### Android Native Semantic Tests

```sh
bun run test:android:native
```

The JVM suite covers pure Kotlin semantics that do not require a live provider or permission UI:

- Health Connect availability and additional-access status mapping.
- Background/history manifest and grant-state helpers.
- Change-token and pagination-cursor validation.
- Record identity, origin metadata, delete-ID validation, and typed delete outcomes.
- Daily and general statistics bucket shaping.
- Distance/sample input conversion and platform unit rules.
- Sleep session input and flat session-envelope/stage mapping, including record-child identity.
- Workout input, elapsed/metric availability, activity portability, and mapping fidelity.
- Time-zone behavior.

Provider IPC, real permission sheets, ownership enforcement, token expiry, and process scheduling belong in Harness or manual device tests.

### iOS Native Semantic Tests

```sh
bun run test:ios:native
```

The SwiftPM/XCTest target includes pure helpers only. It covers:

- Durable change-token encoding and validation.
- Pagination cursors and daily/statistics bucket shaping.
- Stable origin and record identity metadata mapping.
- Exact deletion-count mapping and UUID parsing.
- Sleep session-envelope/stage classification with no synthetic stage.
- Workout activity portability and exact/broadened mapping.
- Sync metadata normalization and time-zone behavior.

`Package.swift` is test-only. Consumer iOS builds still use the pod. `HKHealthStore`, authorization UI, observer server delivery, and protected-data behavior require Harness or manual device testing.

### React Native Harness

Harness executes tests inside a real React Native runtime with the Nitro module loaded:

```sh
cd example
bun run ios # or: bun run android
cd ..
bun run harness:ios # or: bun run harness:android
```

Harness does not build or install the app. Rebuild after native or generated changes before rerunning it.

Override local device names when needed:

```sh
RN_HARNESS_IOS_SIMULATOR='iPhone 17 Pro' RN_HARNESS_IOS_RUNTIME='26.0' bun run harness:ios
RN_HARNESS_ANDROID_AVD='Pixel_7_API_35' RN_HARNESS_ANDROID_API_LEVEL='35' RN_HARNESS_ANDROID_PROFILE='pixel_7' bun run harness:android
```

Harness suites cover availability, permission status, raw reads, statistics, writes, idempotent saves, durable changes, and deletes through the public facade. Interactive HealthKit and Health Connect permission sheets are specialized system UI; do not assume Harness can auto-accept them like camera or location prompts. Set `permissions: true` in the Harness configuration only for tests that deliberately use Harness-managed prompt handling.

The GitHub Actions Harness workflow runs Android runtime validation for relevant pull requests and `main` pushes. iOS is manual. Use the workflow dispatch when CI device coverage is needed.

## Manual Device Cases

Simulator/emulator checks are not sufficient for observer delivery, real permission revocation, provider history limits, or app lifecycle scheduling.

### Signed iOS Device

Use a signed physical iPhone with the HealthKit capability and background-delivery entitlement. Validate:

- `getAvailability()` and per-entry authorization results, including permanently `unverifiable` read entries.
- `getCapabilities()` returning observer mode with included background/history access.
- A build without the background-delivery entitlement still reporting observer capability, with `configureBackgroundChanges()` rejecting because iOS cannot inspect the signed entitlement directly.
- `requestAdditionalAccess('history-read')` and `'background-read'` returning `included` without a separate prompt.
- `managePermissions()` and `revokeAllPermissions()` returning the manual Health-app action; revoke access in the Health app, resume, and re-read statuses/data.
- `configureBackgroundChanges()` persistence and bootstrap restoration after an OS-terminated launch, not a user force-quit.
- A change written by another source while the app is backgrounded.
- Pending/coalesced notification retention before JavaScript subscribes, followed by a durable token drain.
- Protected-data behavior while locked, later retry, duplicate hints, and foreground catch-up.
- Per-type disable, disable-all, re-enable, listener removal, and launch with no listener yet attached.

A user force-quit can suppress HealthKit relaunch and is not equivalent to OS termination. True HealthKit server delivery is unavailable on Simulator.

### Android Device With Health Connect

Use a device/profile with the intended Health Connect provider and feature level. Validate:

- Available, provider-install/update recovery, service-unavailable, and unsupported availability states where devices are available.
- `not-declared`, `not-granted`, `granted`, and `unsupported` background/history capability states.
- `requestAdditionalAccess('background-read')` and `requestAdditionalAccess('history-read')` with the matching consumer manifest declarations.
- Historical reads inside and outside the default window before grant, after grant, and after revocation.
- `revokeAllPermissions()` completing directly, followed by per-entry `notGranted` statuses and rejected protected operations.
- `managePermissions()` opening Health Connect settings.
- App-owned scheduler behavior across backgrounding, process death, reboot, Doze, and force-stop as appropriate for the consumer scheduler.
- Record ownership and all-or-nothing delete-by-ID outcomes using missing, foreign, parent, and record-child-derived identities.
- Durable token drain, token expiry/full resync, and concurrent foreground/background drain serialization.

Scheduling behavior belongs to the consuming application. The library reports `mode: 'polling'` and `scheduling: 'app-owned'`; it does not install WorkManager jobs.

## Consumer App Fixtures

The example app is the reference consumer configuration.

### iOS

Verify the example target includes:

- HealthKit capability.
- `NSHealthShareUsageDescription` and `NSHealthUpdateUsageDescription`.
- Background-delivery entitlement when testing observers.
- `NitroHealthRegisterPersistedObservers()` before React Native startup.

For a physical device, open `example/ios/NitroHealthExample.xcworkspace` in Xcode, select a local signing team, and use a unique bundle identifier if needed. Do not commit local signing changes.

### Android

Verify the example manifest includes only the Health Connect permissions used by its tests, including background/history declarations when those cases are enabled. It must also include the provider package query and permission-rationale activity/alias required by Health Connect.

The library manifest contains no health data permissions. This is intentional: each consumer must declare and justify only the data types and additional access it uses.

## Before Commit

Review the diff for generated files, local signing changes, and unrelated formatting, then let the relevant verification commands above validate the change. Use `bun run lint:fix` for accepted lint fixes and `bun run format` only when the resulting formatting diff is intended.
