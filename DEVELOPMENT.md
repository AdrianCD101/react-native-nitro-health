# Development Workflow

Use this to decide which command to run after a change.

```mermaid
flowchart TD
  A[What changed?] --> B{New clone or deps changed?}
  B -->|Yes| B1[bun install]
  B -->|No| C{Nitro spec changed?}

  B1 --> C

  C -->|Yes: src/specs/*.nitro.ts| C1[bun run codegen]
  C1 --> C2{iOS?}
  C2 -->|Yes| C3[cd example && bun run pod && bun run ios]
  C2 -->|No: Android| C4[cd example && bun run android]

  C -->|No| D{Native implementation changed?}
  D -->|Yes: Swift/Kotlin| D1[cd example && bun run ios or bun run android]

  D -->|No| E{Package TypeScript changed?}
  E -->|Yes: src/*.ts| E1[bun run build]
  E1 --> E2[Optional: test in example app]

  E -->|No| F{Example app changed?}
  F -->|Yes: example/App.tsx etc| F1[cd example && bun run start]
  F1 --> F2{App already installed?}
  F2 -->|Yes| F3[Fast Refresh]
  F2 -->|No| F4[bun run ios or bun run android]

  F -->|No| G[No build step needed]

  C1 --> Q[Before commit]
  D1 --> Q
  E1 --> Q
  F3 --> Q
  F4 --> Q
  G --> Q

  Q --> Q1[bun run lint]
  Q1 --> Q2[bun run format:check]
  Q2 --> Q3[bun run typecheck]
```

## One-Time Setup

```sh
bun install
bun run codegen
cd example
bun run pod # iOS only
```

Do not run `bun install` every time. Run it for a new clone or when dependencies change.

## If/Then

| Change                              | Run                                              |
| ----------------------------------- | ------------------------------------------------ |
| New clone                           | `bun install`                                    |
| Dependencies changed                | `bun install`                                    |
| Nitro spec changed                  | `bun run codegen`                                |
| Package TypeScript changed          | `bun run build`                                  |
| Swift/Kotlin implementation changed | `cd example && bun run ios` or `bun run android` |
| iOS native deps/pods changed        | `cd example && bun run pod`                      |
| Example app JS changed              | `cd example && bun run start`                    |
| Run iOS app                         | `cd example && bun run ios`                      |
| Run Android app                     | `cd example && bun run android`                  |
| Check lint                          | `bun run lint`                                   |
| Fix lint                            | `bun run lint:fix`                               |
| Check formatting                    | `bun run format:check`                           |
| Apply formatting                    | `bun run format`                                 |
| Type-check                          | `bun run typecheck`                              |

## Common Flows

### Changed Nitro Spec

Example: added or renamed a method in `src/specs/*.nitro.ts`.

```sh
bun run codegen
cd example
bun run pod # iOS only
bun run ios # or bun run android
```

`bun run codegen` already runs `build`, so do not run both unless you specifically want a build without regenerating Nitro files.

### Changed Swift/Kotlin Only

Example: changed method behavior but the `.nitro.ts` signature stayed the same.

```sh
cd example
bun run ios # or bun run android
```

No `codegen` needed.

### Changed Package TypeScript Only

Example: changed `src/index.ts`.

```sh
bun run build
```

If you want to test it in the app:

```sh
cd example
bun run start
```

### Changed Example App Only

Example: changed `example/App.tsx`.

```sh
cd example
bun run start
```

Fast Refresh should pick it up if the app is already installed. If not:

```sh
bun run ios # or bun run android
```

## Before Commit

```sh
bun run lint
bun run format:check
bun run typecheck
```

Use `bun run lint:fix` for safe lint fixes. Use `bun run format` only when you are ready to accept formatting changes.
