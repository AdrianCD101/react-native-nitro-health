# Vendored anti-slop

Source: [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop), `skills/install-anti-slop/assets/anti-slop/`.

| | Commit | Verification |
| --- | --- | --- |
| Current | `e6676e8d0bf17c678cb45b9dacb2bd6ca8dea53a` (2026-09-10) | All 38 bundled files blob-identical to the commit. |
| Previous base | `e8100a10da49858cfa8d26883d170e9cc8281988` (2026-08-14) | Original copy's tree hash matched the commit's directory tree. |

The whole incoming snapshot is reconciled; differences below are intentional.

## Local deviations

- `package.json` (`{"type": "module"}`) is local and has no upstream counterpart.
- `effect/` (the optional `anti-slop-effect` plugin) is not vendored: this repository has no direct `effect` dependency. Copy it from the commit above if that changes.
- `vendor/eslint-stylistic/` keeps its own `LICENSE` and `UPSTREAM.md`; preserve both.

Policy lives in `.oxlintrc.json`, not in these files: `no-runtime-typeof` and `no-unknown-parameters` are off, and test paths disable three rules.

## Update e8100a1 → e6676e8 (2026-10-09)

No local source edits existed, so every change was upstream-only and applied as-is. No upstream files were removed.

- Added and enabled at `error`: `no-array-filter-map`, `no-reduce-accumulator-copy`, `require-readable-spacing`.
- Updated: shared scope and type-alias resolution across `no-known-value-widening`, `no-object-parameters`, `no-unknown-returns`, `no-unknown-type-aliases`, `no-unsafe-dictionary-type`; type-predicate handling in `no-known-value-widening` and `no-unknown-parameters`; existence probes in `no-runtime-typeof`; member names in `no-shape-in-symbol-names`; configurable `markers` in `require-safety-comment-for-type-assertion`.
- Upstream RuleTester suites are not bundled. Verification was a full `oxlint .` run on `oxlint`/`@oxlint/plugins` 1.85.0: 1021 `require-readable-spacing` findings in 49 files, none from any other anti-slop rule.
