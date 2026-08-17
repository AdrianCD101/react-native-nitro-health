import HealthKit

extension HKQuantitySample {
    var nativeRespiratoryRateSample: NativeRespiratoryRateSample {
        return NativeRespiratoryRateSample(
            sampleMetadata: nativeHealthSampleMetadata,
            timeMs: startDate.timeIntervalSince1970 * 1000,
            breathsPerMinute: quantity.doubleValue(
                for: HKUnit.count().unitDivided(by: HKUnit.minute())
            )
        )
    }
}
