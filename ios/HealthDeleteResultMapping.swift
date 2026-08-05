enum HealthDeleteStatusMapping: Equatable {
    case completed
}

enum HealthDeletedCountStatusMapping: Equatable {
    case known
}

struct HealthDeleteResultMapping: Equatable {
    let status: HealthDeleteStatusMapping
    let deletedCountStatus: HealthDeletedCountStatusMapping
    let deletedCount: Double
}

func makeHealthDeleteResultMapping(deletedCount: Int) -> HealthDeleteResultMapping {
    return HealthDeleteResultMapping(
        status: .completed,
        deletedCountStatus: .known,
        deletedCount: Double(deletedCount)
    )
}
