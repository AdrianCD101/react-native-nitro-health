import HealthKit

extension HKCategorySample {
    var nativeSleepSample: NativeSleepSample {
        let interval = healthKitSleepIntervalMapping(value: value)

        switch interval {
        case .stage(let stage):
            return NativeSleepSample(
                identity: nativeHealthSampleIdentity,
                origin: nativeHealthDataOrigin,
                device: nativeHealthDeviceInfo,
                recordingMethod: nativeHealthRecordingMethod,
                kind: .stage,
                startTimeMs: startDate.timeIntervalSince1970 * 1000,
                endTimeMs: endDate.timeIntervalSince1970 * 1000,
                stage: stage,
                stageData: nil
            )
        }
    }
}
