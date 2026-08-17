import HealthKit

extension HKQuantitySample {
    var nativeStepSample: NativeStepSample {
        return NativeStepSample(
            sampleMetadata: nativeHealthSampleMetadata,
            startTimeMs: startDate.timeIntervalSince1970 * 1000,
            endTimeMs: endDate.timeIntervalSince1970 * 1000,
            count: quantity.doubleValue(for: .count())
        )
    }
}
