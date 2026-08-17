import HealthKit

extension HKQuantitySample {
    var nativeHeightSample: NativeHeightSample {
        return NativeHeightSample(
            sampleMetadata: nativeHealthSampleMetadata,
            timeMs: startDate.timeIntervalSince1970 * 1000,
            meters: quantity.doubleValue(for: .meter())
        )
    }
}
