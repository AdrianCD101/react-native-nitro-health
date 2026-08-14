import Foundation

extension NativeHealthRecordingMethod {
    var healthKitWasUserEntered: NSNumber? {
        switch self {
        case .manual:
            return NSNumber(value: true)
        case .activelyrecorded, .automaticallyrecorded, .unknown:
            return nil
        }
    }
}
