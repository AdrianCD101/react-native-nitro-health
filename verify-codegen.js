/**
 * @file Fails the build when nitrogen output is missing the create-nitro-module Android patch.
 *
 * @description Nitrogen hardcodes the `com.margelo.nitro` Android package, so `post-script.js`
 * must rewrite `NitroHealthOnLoad.cpp` after every nitrogen run (see `bun run codegen`).
 * Running `bunx nitrogen` directly skips that patch and the Android app then crashes at
 * startup with ClassNotFoundException. This guard catches the unpatched file at build time,
 * close to the cause.
 */
const path = require('node:path')
const { readFileSync } = require('node:fs')

const androidOnLoadFile = path.join(
  process.cwd(),
  'nitrogen/generated/android',
  'NitroHealthOnLoad.cpp'
)

const contents = readFileSync(androidOnLoadFile, { encoding: 'utf8' })

if (contents.includes('margelo/nitro/')) {
  console.error(
    `${androidOnLoadFile} still references the default "margelo/nitro/" Java package.\n` +
      'It looks like nitrogen ran without the post-script patch. Run `bun run codegen` ' +
      '(never `bunx nitrogen` directly) to regenerate and patch it.'
  )
  process.exit(1)
}
