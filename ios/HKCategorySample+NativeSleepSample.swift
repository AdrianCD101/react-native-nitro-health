import HealthKit

extension HKCategorySample {
    var nativeSleepSample: NativeSleepSample {
        let interval = healthKitSleepIntervalMapping(value: value)

        switch interval {
        case .sessionEnvelope:
            return NativeSleepSample(
                sampleMetadata: nativeHealthSampleMetadata,
                kind: .sessionenvelope,
                startTimeMs: startDate.timeIntervalSince1970 * 1000,
                endTimeMs: endDate.timeIntervalSince1970 * 1000,
                stage: nil,
                // HealthKit does not link stages to their envelope, so whether
                // stages were reported for this session is never knowable here.
                stageData: .notreported
            )
        case .stage(let stage):
            return NativeSleepSample(
                sampleMetadata: nativeHealthSampleMetadata,
                kind: .stage,
                startTimeMs: startDate.timeIntervalSince1970 * 1000,
                endTimeMs: endDate.timeIntervalSince1970 * 1000,
                stage: stage,
                stageData: nil
            )
        }
    }
}
