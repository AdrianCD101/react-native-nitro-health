import HealthKit

extension HKQuantitySample {
    var nativeRestingHeartRateSample: NativeRestingHeartRateSample {
        return NativeRestingHeartRateSample(
            sampleMetadata: nativeHealthSampleMetadata,
            timeMs: startDate.timeIntervalSince1970 * 1000,
            bpm: quantity.doubleValue(
                for: HKUnit.count().unitDivided(by: HKUnit.minute())
            )
        )
    }
}
