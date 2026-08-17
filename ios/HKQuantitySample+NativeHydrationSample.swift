import HealthKit

extension HKQuantitySample {
    var nativeHydrationSample: NativeHydrationSample {
        return NativeHydrationSample(
            sampleMetadata: nativeHealthSampleMetadata,
            startTimeMs: startDate.timeIntervalSince1970 * 1000,
            endTimeMs: endDate.timeIntervalSince1970 * 1000,
            milliliters: quantity.doubleValue(for: .literUnit(with: .milli))
        )
    }
}
