import HealthKit

extension HKQuantitySample {
    var nativeBodyMassSample: NativeBodyMassSample {
        return NativeBodyMassSample(
            sampleMetadata: nativeHealthSampleMetadata,
            startTimeMs: startDate.timeIntervalSince1970 * 1000,
            endTimeMs: endDate.timeIntervalSince1970 * 1000,
            kilograms: quantity.doubleValue(for: .gramUnit(with: .kilo))
        )
    }
}
