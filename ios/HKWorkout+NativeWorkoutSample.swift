import HealthKit

// HKWorkout's totalDistance/totalEnergyBurned are deprecated as of iOS 18 in favor of
// workout.statistics(for:). Keep the legacy accessors until activity-specific statistics
// quantity types are mapped comprehensively.
extension HKWorkout {
    @available(iOS, deprecated: 18.0, message: "Wraps the deprecated totalDistance accessor")
    var legacyTotalDistanceMeters: Double? {
        totalDistance?.doubleValue(for: .meter())
    }

    @available(iOS, deprecated: 18.0, message: "Wraps the deprecated totalEnergyBurned accessor")
    var legacyTotalEnergyBurnedKcal: Double? {
        totalEnergyBurned?.doubleValue(for: .kilocalorie())
    }

    var associatedActiveEnergyBurnedKcal: Double? {
        guard let activeEnergyType = HKQuantityType.quantityType(
            forIdentifier: .activeEnergyBurned
        ) else {
            return legacyTotalEnergyBurnedKcal
        }
        return statistics(for: activeEnergyType)?
            .sumQuantity()?
            .doubleValue(for: .kilocalorie()) ?? legacyTotalEnergyBurnedKcal
    }

    var nativeWorkoutSample: NativeWorkoutSample {
        return NativeWorkoutSample(
            identity: nativeHealthSampleIdentity,
            origin: nativeHealthDataOrigin,
            device: nativeHealthDeviceInfo,
            recordingMethod: nativeHealthRecordingMethod,
            startTimeMs: startDate.timeIntervalSince1970 * 1000,
            endTimeMs: endDate.timeIntervalSince1970 * 1000,
            elapsedDurationSeconds: endDate.timeIntervalSince(startDate),
            activeDuration: NativeHealthMetricValue(status: .available, value: duration),
            activity: makeHealthKitWorkoutActivityMapping(
                rawValue: workoutActivityType.rawValue
            ).nativeWorkoutActivity,
            title: nil,
            brandName: metadata?[HKMetadataKeyWorkoutBrandName] as? String,
            totalDistance: makeNativeHealthMetricValue(legacyTotalDistanceMeters),
            totalActiveEnergyBurned: makeNativeHealthMetricValue(associatedActiveEnergyBurnedKcal)
        )
    }
}

private func makeNativeHealthMetricValue(_ value: Double?) -> NativeHealthMetricValue {
    guard let value else {
        return NativeHealthMetricValue(status: .notreported, value: nil)
    }

    return NativeHealthMetricValue(status: .available, value: value)
}
