import HealthKit

extension HKQuantitySample {
    var nativeLeanBodyMassSample: NativeLeanBodyMassSample {
        return NativeLeanBodyMassSample(
            sampleMetadata: nativeHealthSampleMetadata,
            timeMs: startDate.timeIntervalSince1970 * 1000,
            kilograms: quantity.doubleValue(for: .gramUnit(with: .kilo))
        )
    }
}
