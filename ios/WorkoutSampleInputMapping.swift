import Foundation
import HealthKit

func makeWorkoutBuilderInput(
    workout: NativeWorkoutSampleInput
) throws -> (
    startDate: Date,
    endDate: Date,
    configuration: HKWorkoutConfiguration,
    device: HKDevice?,
    metadata: [String: Any]
) {
    let startDate = Date(timeIntervalSince1970: workout.startTimeMs / 1000)
    let endDate = Date(timeIntervalSince1970: workout.endTimeMs / 1000)
    guard startDate < endDate else {
        throw workoutInputError("workout: startDate must be before endDate")
    }
    if let displayName = workout.displayName,
       displayName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
        throw workoutInputError("workout: displayName must be a non-empty string when provided")
    }

    let rawActivityType = try healthKitWorkoutActivityRawValue(workout.activityType)
    guard let activityType = HKWorkoutActivityType(rawValue: rawActivityType) else {
        throw workoutInputError("workout: activityType is not supported by HealthKit")
    }

    let configuration = HKWorkoutConfiguration()
    configuration.activityType = activityType

    let timeZone = try resolveIanaTimeZone(workout.timeZone, errorPrefix: "workout")
    var metadata = try workout.writeMetadata.healthKitMetadata() ?? [:]
    metadata[HKMetadataKeyTimeZone] = timeZone.identifier
    if let displayName = workout.displayName {
        metadata[HKMetadataKeyWorkoutBrandName] = displayName
    }

    return (
        startDate: startDate,
        endDate: endDate,
        configuration: configuration,
        device: workout.writeMetadata.healthKitDevice,
        metadata: metadata
    )
}

private func workoutInputError(_ message: String) -> NSError {
    return NSError(domain: "NitroHealth", code: 5, userInfo: [NSLocalizedDescriptionKey: message])
}
