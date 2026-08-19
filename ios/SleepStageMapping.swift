import Foundation

// Nitro stringifies thrown Swift errors with String(describing:), which ignores
// LocalizedError — CustomStringConvertible is what makes the message reach JS.
enum SleepStageMappingError: LocalizedError, CustomStringConvertible {
    case unsupportedWritableStage(String)

    var description: String {
        switch self {
        case .unsupportedWritableStage(let stage):
            return "Unsupported writable sleep stage: \(stage)"
        }
    }

    var errorDescription: String? {
        return description
    }
}

enum HealthKitSleepIntervalMapping: Equatable {
    case sessionEnvelope
    case stage(String)
}

func healthKitSleepStageValue(_ stage: String) throws -> Int {
    switch stage {
    case "awake":
        return 2
    case "asleep":
        return 1
    case "asleepCore":
        return 3
    case "asleepDeep":
        return 4
    case "asleepREM":
        return 5
    default:
        throw SleepStageMappingError.unsupportedWritableStage(stage)
    }
}

func normalizedSleepStage(value: Int) -> String {
    switch value {
    case 1:
        return "asleep"
    case 2:
        return "awake"
    case 3:
        return "asleepCore"
    case 4:
        return "asleepDeep"
    case 5:
        return "asleepREM"
    default:
        return "unknown"
    }
}

// HealthKit stores a session's in-bed span (value 0) as just another category
// sample; it is surfaced as the session envelope rather than a stage.
func healthKitSleepIntervalMapping(value: Int) -> HealthKitSleepIntervalMapping {
    if value == 0 {
        return .sessionEnvelope
    }
    return .stage(normalizedSleepStage(value: value))
}
