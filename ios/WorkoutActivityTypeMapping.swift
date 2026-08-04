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

// Maps HKWorkoutActivityType.rawValue to the normalized cross-platform activity type
// string (mirrors makeWorkoutActivityType on Android). Switches on the raw value rather
// than HKWorkoutActivityType cases so this file stays pure Foundation and can be unit
// tested via the SPM target; the exhaustive table is covered by
// WorkoutActivityTypeMappingTests instead of compile-time exhaustiveness.
func makeWorkoutActivityType(rawValue: UInt) -> String {
    switch rawValue {
    case 1: return "americanFootball" // .americanFootball
    case 2: return "archery" // .archery
    case 3: return "australianFootball" // .australianFootball
    case 4: return "badminton" // .badminton
    case 5: return "baseball" // .baseball
    case 6: return "basketball" // .basketball
    case 7: return "bowling" // .bowling
    case 8: return "boxing" // .boxing
    case 9: return "climbing" // .climbing
    case 10: return "cricket" // .cricket
    case 11: return "crossTraining" // .crossTraining
    case 12: return "curling" // .curling
    case 13: return "cycling" // .cycling
    case 14: return "dance" // .dance
    case 15: return "dance" // .danceInspiredTraining (deprecated)
    case 16: return "elliptical" // .elliptical
    case 17: return "equestrianSports" // .equestrianSports
    case 18: return "fencing" // .fencing
    case 19: return "fishing" // .fishing
    case 20: return "strengthTraining" // .functionalStrengthTraining
    case 21: return "golf" // .golf
    case 22: return "gymnastics" // .gymnastics
    case 23: return "handball" // .handball
    case 24: return "hiking" // .hiking
    case 25: return "hockey" // .hockey
    case 26: return "hunting" // .hunting
    case 27: return "lacrosse" // .lacrosse
    case 28: return "martialArts" // .martialArts
    case 29: return "mindAndBody" // .mindAndBody
    case 30: return "mixedCardio" // .mixedMetabolicCardioTraining (deprecated)
    case 31: return "paddleSports" // .paddleSports
    case 32: return "other" // .play (unstructured by definition)
    case 33: return "flexibility" // .preparationAndRecovery (warm-up/cool-down)
    case 34: return "racquetball" // .racquetball
    case 35: return "rowing" // .rowing
    case 36: return "rugby" // .rugby
    case 37: return "running" // .running
    case 38: return "sailing" // .sailing
    case 39: return "skating" // .skatingSports
    case 40: return "snowSports" // .snowSports
    case 41: return "soccer" // .soccer
    case 42: return "softball" // .softball
    case 43: return "squash" // .squash
    case 44: return "stairClimbing" // .stairClimbing
    case 45: return "surfing" // .surfingSports
    case 46: return "swimming" // .swimming
    case 47: return "tableTennis" // .tableTennis
    case 48: return "tennis" // .tennis
    case 49: return "trackAndField" // .trackAndField
    case 50: return "strengthTraining" // .traditionalStrengthTraining
    case 51: return "volleyball" // .volleyball
    case 52: return "walking" // .walking
    case 53: return "waterFitness" // .waterFitness
    case 54: return "waterPolo" // .waterPolo
    case 55: return "waterSports" // .waterSports
    case 56: return "wrestling" // .wrestling
    case 57: return "yoga" // .yoga
    case 58: return "barre" // .barre
    case 59: return "coreTraining" // .coreTraining
    case 60: return "skiing" // .crossCountrySkiing
    case 61: return "skiing" // .downhillSkiing
    case 62: return "flexibility" // .flexibility
    case 63: return "highIntensityIntervalTraining" // .highIntensityIntervalTraining
    case 64: return "jumpRope" // .jumpRope
    case 65: return "kickboxing" // .kickboxing
    case 66: return "pilates" // .pilates
    case 67: return "snowboarding" // .snowboarding
    case 68: return "stairClimbing" // .stairs
    case 69: return "stepTraining" // .stepTraining
    case 70: return "wheelchair" // .wheelchairWalkPace
    case 71: return "wheelchair" // .wheelchairRunPace
    case 72: return "taiChi" // .taiChi
    case 73: return "mixedCardio" // .mixedCardio
    case 74: return "handCycling" // .handCycling
    case 75: return "discSports" // .discSports
    case 76: return "fitnessGaming" // .fitnessGaming
    case 77: return "dance" // .cardioDance
    case 78: return "dance" // .socialDance
    case 79: return "pickleball" // .pickleball
    case 80: return "flexibility" // .cooldown
    case 82: return "swimBikeRun" // .swimBikeRun
    case 83: return "other" // .transition (multisport segment, not an activity)
    case 84: return "underwaterDiving" // .underwaterDiving
    case 3000: return "other" // .other
    default: return "other" // unknown/future HKWorkoutActivityType values
    }
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
