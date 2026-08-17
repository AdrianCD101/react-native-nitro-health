import HealthKit

extension HKQuantitySample {
    var nativeFloorsClimbedSample: NativeFloorsClimbedSample {
        return NativeFloorsClimbedSample(
            sampleMetadata: nativeHealthSampleMetadata,
            startTimeMs: startDate.timeIntervalSince1970 * 1000,
            endTimeMs: endDate.timeIntervalSince1970 * 1000,
            floors: quantity.doubleValue(for: .count())
        )
    }
}
