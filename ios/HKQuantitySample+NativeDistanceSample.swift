import HealthKit

extension HKQuantitySample {
    var nativeDistanceSample: NativeDistanceSample {
        return NativeDistanceSample(
            sampleMetadata: nativeHealthSampleMetadata,
            startTimeMs: startDate.timeIntervalSince1970 * 1000,
            endTimeMs: endDate.timeIntervalSince1970 * 1000,
            distanceMeters: quantity.doubleValue(for: .meter()),
            scope: .walkingrunning
        )
    }
}
