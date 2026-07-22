import Foundation

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
