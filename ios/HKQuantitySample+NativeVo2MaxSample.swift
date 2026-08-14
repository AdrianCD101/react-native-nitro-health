import HealthKit

extension HKQuantitySample {
    func nativeVo2MaxSample(unit: HKUnit) throws -> NativeVo2MaxSample {
        return NativeVo2MaxSample(
            identity: nativeHealthSampleIdentity,
            origin: nativeHealthDataOrigin,
            recordingMethod: nativeHealthRecordingMethod,
            timeMs: startDate.timeIntervalSince1970 * 1000,
            millilitersPerKilogramPerMinute: quantity.doubleValue(for: unit),
            androidMeasurementMethod: nil,
            iosTestType: try nativeVo2MaxTestType(metadata: metadata)
        )
    }
}
