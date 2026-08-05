import Foundation

enum WorkoutActivityTypeMappingError: LocalizedError {
    case unsupportedWritableType(String)

    var errorDescription: String? {
        switch self {
        case .unsupportedWritableType(let activityType):
            return "Unsupported writable workout activity type: \(activityType)"
        }
    }
}

enum HealthKitWorkoutActivityMapping: Equatable {
    enum Portability: Equatable {
        case portable
        case readOnly
    }

    enum Fidelity: Equatable {
        case exact
        case broadened
    }

    case known(type: String, portability: Portability, mapping: Fidelity)
    case unknown
}

// Switches on raw values so future HealthKit values remain distinguishable from the native
// `.other` case and this semantic mapping stays testable without importing HealthKit.
func makeHealthKitWorkoutActivityMapping(rawValue: UInt) -> HealthKitWorkoutActivityMapping {
    let type: String
    let mapping: HealthKitWorkoutActivityMapping.Fidelity

    switch rawValue {
    case 1: type = "americanFootball" // .americanFootball
    case 2: type = "archery" // .archery
    case 3: type = "australianFootball" // .australianFootball
    case 4: type = "badminton" // .badminton
    case 5: type = "baseball" // .baseball
    case 6: type = "basketball" // .basketball
    case 7: type = "bowling" // .bowling
    case 8: type = "boxing" // .boxing
    case 9: type = "climbing" // .climbing
    case 10: type = "cricket" // .cricket
    case 11: type = "crossTraining" // .crossTraining
    case 12: type = "curling" // .curling
    case 13: type = "cycling" // .cycling
    case 14: type = "dance" // .dance
    case 15: type = "dance" // .danceInspiredTraining (deprecated)
    case 16: type = "elliptical" // .elliptical
    case 17: type = "equestrianSports" // .equestrianSports
    case 18: type = "fencing" // .fencing
    case 19: type = "fishing" // .fishing
    case 20: type = "strengthTraining" // .functionalStrengthTraining
    case 21: type = "golf" // .golf
    case 22: type = "gymnastics" // .gymnastics
    case 23: type = "handball" // .handball
    case 24: type = "hiking" // .hiking
    case 25: type = "hockey" // .hockey
    case 26: type = "hunting" // .hunting
    case 27: type = "lacrosse" // .lacrosse
    case 28: type = "martialArts" // .martialArts
    case 29: type = "mindAndBody" // .mindAndBody
    case 30: type = "mixedCardio" // .mixedMetabolicCardioTraining (deprecated)
    case 31: type = "paddleSports" // .paddleSports
    case 32: type = "other" // .play
    case 33: type = "flexibility" // .preparationAndRecovery
    case 34: type = "racquetball" // .racquetball
    case 35: type = "rowing" // .rowing
    case 36: type = "rugby" // .rugby
    case 37: type = "running" // .running
    case 38: type = "sailing" // .sailing
    case 39: type = "skating" // .skatingSports
    case 40: type = "snowSports" // .snowSports
    case 41: type = "soccer" // .soccer
    case 42: type = "softball" // .softball
    case 43: type = "squash" // .squash
    case 44: type = "stairClimbing" // .stairClimbing
    case 45: type = "surfing" // .surfingSports
    case 46: type = "swimming" // .swimming
    case 47: type = "tableTennis" // .tableTennis
    case 48: type = "tennis" // .tennis
    case 49: type = "trackAndField" // .trackAndField
    case 50: type = "strengthTraining" // .traditionalStrengthTraining
    case 51: type = "volleyball" // .volleyball
    case 52: type = "walking" // .walking
    case 53: type = "waterFitness" // .waterFitness
    case 54: type = "waterPolo" // .waterPolo
    case 55: type = "waterSports" // .waterSports
    case 56: type = "wrestling" // .wrestling
    case 57: type = "yoga" // .yoga
    case 58: type = "barre" // .barre
    case 59: type = "coreTraining" // .coreTraining
    case 60: type = "skiing" // .crossCountrySkiing
    case 61: type = "skiing" // .downhillSkiing
    case 62: type = "flexibility" // .flexibility
    case 63: type = "highIntensityIntervalTraining" // .highIntensityIntervalTraining
    case 64: type = "jumpRope" // .jumpRope
    case 65: type = "kickboxing" // .kickboxing
    case 66: type = "pilates" // .pilates
    case 67: type = "snowboarding" // .snowboarding
    case 68: type = "stairClimbing" // .stairs
    case 69: type = "stepTraining" // .stepTraining
    case 70: type = "wheelchair" // .wheelchairWalkPace
    case 71: type = "wheelchair" // .wheelchairRunPace
    case 72: type = "taiChi" // .taiChi
    case 73: type = "mixedCardio" // .mixedCardio
    case 74: type = "handCycling" // .handCycling
    case 75: type = "discSports" // .discSports
    case 76: type = "fitnessGaming" // .fitnessGaming
    case 77: type = "dance" // .cardioDance
    case 78: type = "dance" // .socialDance
    case 79: type = "pickleball" // .pickleball
    case 80: type = "flexibility" // .cooldown
    case 82: type = "swimBikeRun" // .swimBikeRun
    case 83: type = "other" // .transition
    case 84: type = "underwaterDiving" // .underwaterDiving
    case 3000: type = "other" // .other
    default: return .unknown
    }

    switch rawValue {
    case 15, 20, 30, 32, 33, 50, 60, 61, 68, 70, 71, 77, 78, 80, 83:
        mapping = .broadened
    default:
        mapping = .exact
    }

    let portability: HealthKitWorkoutActivityMapping.Portability =
        (try? healthKitWorkoutActivityRawValue(type)) == nil ? .readOnly : .portable
    return .known(type: type, portability: portability, mapping: mapping)
}

func healthKitWorkoutActivityRawValue(_ activityType: String) throws -> UInt {
    switch activityType {
    case "americanFootball": return 1
    case "australianFootball": return 3
    case "badminton": return 4
    case "baseball": return 5
    case "basketball": return 6
    case "boxing": return 8
    case "climbing": return 9
    case "cricket": return 10
    case "crossTraining": return 11
    case "cycling": return 13
    case "dance": return 77 // .cardioDance
    case "discSports": return 75
    case "elliptical": return 16
    case "fencing": return 18
    case "flexibility": return 62
    case "golf": return 21
    case "gymnastics": return 22
    case "handball": return 23
    case "highIntensityIntervalTraining": return 63
    case "hiking": return 24
    case "hockey": return 25
    case "martialArts": return 28
    case "mindAndBody": return 29
    case "other": return 3000
    case "paddleSports": return 31
    case "pilates": return 66
    case "racquetball": return 34
    case "rowing": return 35
    case "rugby": return 36
    case "running": return 37
    case "sailing": return 38
    case "skating": return 39
    case "skiing": return 60 // .crossCountrySkiing
    case "snowboarding": return 67
    case "snowSports": return 40
    case "soccer": return 41
    case "softball": return 42
    case "squash": return 43
    case "stairClimbing": return 44
    case "strengthTraining": return 20 // .functionalStrengthTraining
    case "surfing": return 45
    case "swimming": return 46
    case "tableTennis": return 47
    case "tennis": return 48
    case "volleyball": return 51
    case "walking": return 52
    case "waterPolo": return 54
    case "wheelchair": return 70 // .wheelchairWalkPace
    case "yoga": return 57
    default: throw WorkoutActivityTypeMappingError.unsupportedWritableType(activityType)
    }
}
