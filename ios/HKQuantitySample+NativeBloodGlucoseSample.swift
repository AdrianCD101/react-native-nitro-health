import Foundation
import HealthKit

private func nativeBloodGlucoseMealTime(
    metadata: [String: Any]?
) throws -> NativeBloodGlucoseMealTime? {
    guard let value = metadata?[HKMetadataKeyBloodGlucoseMealTime] else {
        return nil
    }
    guard let number = value as? NSNumber else {
        throw NSError(
            domain: "NitroHealth",
            code: 6,
            userInfo: [NSLocalizedDescriptionKey: "HealthKit returned a non-numeric blood glucose meal time"]
        )
    }

    switch number.intValue {
    case HKBloodGlucoseMealTime.preprandial.rawValue:
        return .preprandial
    case HKBloodGlucoseMealTime.postprandial.rawValue:
        return .postprandial
    default:
        throw NSError(
            domain: "NitroHealth",
            code: 6,
            userInfo: [
                NSLocalizedDescriptionKey: "HealthKit returned unsupported blood glucose meal time: \(number)"
            ]
        )
    }
}

extension HKQuantitySample {
    func nativeBloodGlucoseSample() throws -> NativeBloodGlucoseSample {
        return NativeBloodGlucoseSample(
            identity: nativeHealthSampleIdentity,
            origin: nativeHealthDataOrigin,
            device: nativeHealthDeviceInfo,
            recordingMethod: nativeHealthRecordingMethod,
            timeMs: startDate.timeIntervalSince1970 * 1000,
            millimolesPerLiter: quantity.doubleValue(for: bloodGlucoseMmolPerLiterUnit),
            androidSpecimenSource: nil,
            androidMealType: nil,
            androidRelationToMeal: nil,
            iosMealTime: try nativeBloodGlucoseMealTime(metadata: metadata)
        )
    }
}
