import HealthKit

extension HKQuantitySample {
    var nativeActiveEnergyBurnedSample: NativeActiveEnergyBurnedSample {
        return NativeActiveEnergyBurnedSample(
            sampleMetadata: nativeHealthSampleMetadata,
            startTimeMs: startDate.timeIntervalSince1970 * 1000,
            endTimeMs: endDate.timeIntervalSince1970 * 1000,
            kilocalories: quantity.doubleValue(for: .kilocalorie())
        )
    }
}
