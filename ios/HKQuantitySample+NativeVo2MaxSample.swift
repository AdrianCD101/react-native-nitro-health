import HealthKit

extension HKQuantitySample {
    func nativeVo2MaxSample() throws -> NativeVo2MaxSample {
        let unit = HKUnit.literUnit(with: .milli).unitDivided(
            by: HKUnit.gramUnit(with: .kilo).unitMultiplied(by: HKUnit.minute())
        )

        return NativeVo2MaxSample(
            sampleMetadata: nativeHealthSampleMetadata,
            timeMs: startDate.timeIntervalSince1970 * 1000,
            millilitersPerKilogramPerMinute: quantity.doubleValue(for: unit),
            androidMeasurementMethod: nil,
            iosTestType: try nativeVo2MaxTestType(metadata: metadata)
        )
    }
}
