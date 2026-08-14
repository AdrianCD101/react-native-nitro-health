import Foundation
import HealthKit

private let predictionStepTestRawValue = 4

func healthKitVo2MaxTestTypeRawValue(
    _ testType: NativeIOSVo2MaxTestType
) throws -> Int {
    switch testType {
    case .maxexercise:
        return HKVO2MaxTestType.maxExercise.rawValue
    case .predictionsubmaxexercise:
        return HKVO2MaxTestType.predictionSubMaxExercise.rawValue
    case .predictionnonexercise:
        return HKVO2MaxTestType.predictionNonExercise.rawValue
    case .predictionsteptest:
#if os(iOS)
        guard #available(iOS 26.0, *) else {
            throw NSError(
                domain: "NitroHealth",
                code: 6,
                userInfo: [
                    NSLocalizedDescriptionKey: "VO2 max test type 'prediction_step_test' requires iOS 26 or later"
                ]
            )
        }
        return predictionStepTestRawValue
#else
        throw NSError(
            domain: "NitroHealth",
            code: 6,
            userInfo: [
                NSLocalizedDescriptionKey: "VO2 max test type 'prediction_step_test' is only available on iOS 26 or later"
            ]
        )
#endif
    }
}

func nativeVo2MaxTestType(
    metadata: [String: Any]?
) throws -> NativeIOSVo2MaxTestType? {
    guard let value = metadata?[HKMetadataKeyVO2MaxTestType] else {
        return nil
    }
    guard let number = value as? NSNumber else {
        throw NSError(
            domain: "NitroHealth",
            code: 6,
            userInfo: [NSLocalizedDescriptionKey: "HealthKit returned a non-numeric VO2 max test type"]
        )
    }

    switch number.intValue {
    case HKVO2MaxTestType.maxExercise.rawValue:
        return .maxexercise
    case HKVO2MaxTestType.predictionSubMaxExercise.rawValue:
        return .predictionsubmaxexercise
    case HKVO2MaxTestType.predictionNonExercise.rawValue:
        return .predictionnonexercise
    case predictionStepTestRawValue:
        return .predictionsteptest
    default:
        throw NSError(
            domain: "NitroHealth",
            code: 6,
            userInfo: [
                NSLocalizedDescriptionKey: "HealthKit returned unsupported VO2 max test type: \(number)"
            ]
        )
    }
}
