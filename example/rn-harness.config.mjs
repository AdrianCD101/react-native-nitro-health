import { androidEmulator, androidPlatform } from '@react-native-harness/platform-android'
import { applePlatform, appleSimulator } from '@react-native-harness/platform-apple'

const androidAvd = process.env.RN_HARNESS_ANDROID_AVD ?? 'Pixel_8_API_35'
const androidAvdApiLevel = Number(process.env.RN_HARNESS_ANDROID_API_LEVEL ?? '35')
const androidAvdProfile = process.env.RN_HARNESS_ANDROID_PROFILE ?? 'pixel_8'
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
