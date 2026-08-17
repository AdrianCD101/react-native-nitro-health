import HealthKit

extension HKQuantitySample {
    var nativeOxygenSaturationSample: NativeOxygenSaturationSample {
        return NativeOxygenSaturationSample(
            sampleMetadata: nativeHealthSampleMetadata,
            timeMs: startDate.timeIntervalSince1970 * 1000,
            percentage: quantity.doubleValue(for: .percent()) * 100
        )
    }
}
