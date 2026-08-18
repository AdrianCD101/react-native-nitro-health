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

struct HealthSampleZoneValues: Equatable {
    let timeZone: String?
    let zoneOffset: String?
}

func formatUtcOffset(seconds: Int) -> String {
    let sign = seconds < 0 ? "-" : "+"
    let total = abs(seconds)
    return String(format: "%@%02d:%02d", sign, total / 3600, (total % 3600) / 60)
}

// A missing or unresolvable stored identifier yields (nil, nil) — the reader's own zone is
// never substituted. The offset is resolved at the sample's start date, so it is DST-correct.
func makeHealthSampleZoneValues(
    storedTimeZoneIdentifier: String?,
    startDate: Date
) -> HealthSampleZoneValues {
    guard let storedTimeZoneIdentifier,
          let timeZone = TimeZone(identifier: storedTimeZoneIdentifier) else {
        return HealthSampleZoneValues(timeZone: nil, zoneOffset: nil)
    }

    return HealthSampleZoneValues(
        timeZone: storedTimeZoneIdentifier,
        zoneOffset: formatUtcOffset(seconds: timeZone.secondsFromGMT(for: startDate))
    )
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
