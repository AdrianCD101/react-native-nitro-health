import { androidEmulator, androidPlatform } from '@react-native-harness/platform-android'
import { applePlatform, appleSimulator } from '@react-native-harness/platform-apple'

const androidAvd = process.env.RN_HARNESS_ANDROID_AVD ?? 'Medium_Phone'
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
      device: androidEmulator(androidAvd),
      bundleId: 'com.nitrohealth.example',
    }),
  ],
}

export default config
