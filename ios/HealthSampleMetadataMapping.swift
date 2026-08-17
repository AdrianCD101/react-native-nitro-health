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

struct HealthDeviceInfoValues: Equatable {
    let manufacturer: String?
    let model: String?
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

func makeHealthDeviceInfoValues(
    manufacturer: String?,
    model: String?
) -> HealthDeviceInfoValues? {
    let normalizedManufacturer = manufacturer.flatMap {
        $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? nil : $0
    }
    let normalizedModel = model.flatMap {
        $0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? nil : $0
    }
    guard normalizedManufacturer != nil || normalizedModel != nil else {
        return nil
    }

    return HealthDeviceInfoValues(
        manufacturer: normalizedManufacturer,
        model: normalizedModel
    )
}
