import { androidEmulator, androidPlatform } from '@react-native-harness/platform-android'
import { applePlatform, appleSimulator } from '@react-native-harness/platform-apple'
import { fileURLToPath } from 'node:url'

// Load the optional .env next to this config so RN_HARNESS_* overrides apply
// regardless of how the harness is invoked (root script, example script, or CLI).
try {
  process.loadEnvFile(fileURLToPath(new URL('.env', import.meta.url)))
} catch {
  // .env is optional — the defaults below apply.
}

const androidAvd = process.env.RN_HARNESS_ANDROID_AVD ?? 'Pixel_7_API_35'
const androidAvdApiLevel = Number(process.env.RN_HARNESS_ANDROID_API_LEVEL ?? '35')
const androidAvdProfile = process.env.RN_HARNESS_ANDROID_PROFILE ?? 'pixel_7'
const androidAvdDiskSize = process.env.RN_HARNESS_ANDROID_DISK_SIZE ?? '4G'
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
        diskSize: androidAvdDiskSize,
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
