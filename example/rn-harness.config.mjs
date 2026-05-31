import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { androidEmulator, androidPlatform } from '@react-native-harness/platform-android'
import { applePlatform, appleSimulator } from '@react-native-harness/platform-apple'

const configDir = dirname(fileURLToPath(import.meta.url))

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return
  }

  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)?\s*$/)

    if (!match || process.env[match[1]] !== undefined) {
      continue
    }

    process.env[match[1]] = (match[2] ?? '').replace(/^['"]|['"]$/g, '')
  }
}

loadEnvFile(resolve(configDir, '.env'))
loadEnvFile(resolve(configDir, '..', '.env'))

const androidAvd = process.env.RN_HARNESS_ANDROID_AVD ?? 'Pixel_7_API_35'
const androidAvdApiLevel = Number(process.env.RN_HARNESS_ANDROID_API_LEVEL ?? '35')
const androidAvdProfile = process.env.RN_HARNESS_ANDROID_PROFILE ?? 'pixel_7'
const iosSimulator = process.env.RN_HARNESS_IOS_SIMULATOR ?? 'iPhone 17 Pro'
const iosRuntime = process.env.RN_HARNESS_IOS_RUNTIME ?? '26.0'

const config = {
  entryPoint: './index.js',
  appRegistryComponentName: 'NitroHealthExample',
  defaultRunner: 'ios',
  runners: [
    applePlatform({
      name: 'ios',
      device: appleSimulator(iosSimulator, iosRuntime),
      bundleId: 'com.nitrohealth.example',
    }),
    androidPlatform({
      name: 'android',
      device: androidEmulator(androidAvd, {
        apiLevel: androidAvdApiLevel,
        profile: androidAvdProfile,
        diskSize: '6G',
        heapSize: '1G',
        snapshot: {
          enabled: true,
        },
      }),
      bundleId: 'com.nitrohealth.example',
    }),
  ],
}

export default config
