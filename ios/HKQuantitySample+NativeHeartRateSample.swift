import HealthKit

extension HKQuantitySample {
    var nativeHeartRateSample: NativeHeartRateSample {
        return NativeHeartRateSample(
            sampleMetadata: nativeHealthSampleMetadata,
            timeMs: startDate.timeIntervalSince1970 * 1000,
            bpm: quantity.doubleValue(
                for: HKUnit.count().unitDivided(by: HKUnit.minute())
            )
        )
    }
}
