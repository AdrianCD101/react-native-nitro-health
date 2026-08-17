import HealthKit

extension HKQuantitySample {
    var nativeBodyFatSample: NativeBodyFatSample {
        return NativeBodyFatSample(
            sampleMetadata: nativeHealthSampleMetadata,
            timeMs: startDate.timeIntervalSince1970 * 1000,
            percentage: quantity.doubleValue(for: .percent()) * 100
        )
    }
}
