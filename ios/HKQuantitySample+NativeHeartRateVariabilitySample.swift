import HealthKit

extension HKQuantitySample {
    var nativeHeartRateVariabilitySample: NativeHeartRateVariabilitySample {
        return NativeHeartRateVariabilitySample(
            sampleMetadata: nativeHealthSampleMetadata,
            timeMs: startDate.timeIntervalSince1970 * 1000,
            milliseconds: quantity.doubleValue(for: .secondUnit(with: .milli)),
            method: "sdnn"
        )
    }
}
