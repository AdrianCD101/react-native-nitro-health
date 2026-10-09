import { androidEmulator, androidPlatform } from '@react-native-harness/platform-android'
import { applePlatform, appleSimulator } from '@react-native-harness/platform-apple'

const config = {
  entryPoint: './index.js',
  appRegistryComponentName: 'NitroHealthExample',
  permissions: true,
  runners: [
    androidPlatform({
      name: 'android',
      device: androidEmulator(process.env.AVD_NAME ?? 'Pixel_10', {
        apiLevel: Number(process.env.DEVICE_API_LEVEL ?? '37'),
        profile: process.env.DEVICE_PROFILE ?? 'pixel_10',
        diskSize: process.env.AVD_DISK_SIZE ?? '1G',
        heapSize: process.env.AVD_HEAP_SIZE ?? '1G',
        snapshot: {
          enabled: process.env.CI === 'true',
        },
      }),
      bundleId: 'com.nitrohealth.example',
    }),
    applePlatform({
      name: 'ios',
      device: appleSimulator(
        process.env.DEVICE_MODEL ?? 'iPhone 17 Pro',
        process.env.IOS_VERSION ?? '27.0'
      ),
      bundleId: 'com.nitrohealth.example',
    }),
  ],
  defaultRunner: 'android',
  bridgeTimeout: 300000,
  // A fresh iOS 27 simulator on the xcode-27 CI image took over four minutes to boot,
  // leaving too little of the 5-minute default for the XCTest agent to start.
  platformReadyTimeout: 600000,
  // Several suites poll with waitUntil(..., { timeout: 10_000 }); the Harness default test
  // timeout of 5s cuts those polls short on slow CI emulators, so give every test headroom.
  testTimeout: 30_000,
}

export default config
