import Foundation

enum HealthSampleIdentityKindValue: Equatable {
    case record
}

struct HealthSampleIdentityValues: Equatable {
    let kind: HealthSampleIdentityKindValue
    let id: String
    let recordId: String
}

struct HealthDataOriginValues: Equatable {
    let identifier: String
    let displayName: String
}

func makeHealthSampleIdentityValues(uuid: UUID) -> HealthSampleIdentityValues {
    let id = uuid.uuidString
    return HealthSampleIdentityValues(kind: .record, id: id, recordId: id)
}

func makeHealthDataOriginValues(
    sourceBundleIdentifier: String,
    sourceName: String
) -> HealthDataOriginValues {
    return HealthDataOriginValues(
        identifier: sourceBundleIdentifier,
        displayName: sourceName
    )
}
