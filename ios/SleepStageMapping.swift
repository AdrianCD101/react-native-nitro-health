import Foundation

enum SleepStageMappingError: LocalizedError {
    case unsupportedWritableStage(String)

    var errorDescription: String? {
        switch self {
        case .unsupportedWritableStage(let stage):
            return "Unsupported writable sleep stage: \(stage)"
        }
    }
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
    case 0:
        return "inBed"
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
