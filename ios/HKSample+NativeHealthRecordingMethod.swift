import Foundation
import HealthKit

func makeNativeHealthRecordingMethod(metadata: [String: Any]?) -> NativeHealthRecordingMethod {
    guard
        let wasUserEntered = metadata?[HKMetadataKeyWasUserEntered] as? NSNumber,
        wasUserEntered.boolValue
    else {
        return .unknown
    }

    return .manual
}

extension HKSample {
    var nativeHealthRecordingMethod: NativeHealthRecordingMethod {
        return makeNativeHealthRecordingMethod(metadata: metadata)
    }
}
