import Foundation
import HealthKit

func healthKitBodyTemperatureSensorLocation(
    _ location: NativeIOSBodyTemperatureSensorLocation
) -> HKBodyTemperatureSensorLocation {
    switch location {
    case .other:
        return .other
    case .armpit:
        return .armpit
    case .body:
        return .body
    case .ear:
        return .ear
    case .finger:
        return .finger
    case .gastrointestinal:
        return .gastroIntestinal
    case .mouth:
        return .mouth
    case .rectum:
        return .rectum
    case .toe:
        return .toe
    case .eardrum:
        return .earDrum
    case .temporalartery:
        return .temporalArtery
    case .forehead:
        return .forehead
    }
}

func nativeBodyTemperatureSensorLocation(
    metadata: [String: Any]?
) throws -> NativeIOSBodyTemperatureSensorLocation? {
    guard let value = metadata?[HKMetadataKeyBodyTemperatureSensorLocation] else {
        return nil
    }
    guard let number = value as? NSNumber else {
        throw NSError(
            domain: "NitroHealth",
            code: 6,
            userInfo: [NSLocalizedDescriptionKey: "HealthKit returned a non-numeric body temperature sensor location"]
        )
    }

    switch number.intValue {
    case HKBodyTemperatureSensorLocation.other.rawValue:
        return .other
    case HKBodyTemperatureSensorLocation.armpit.rawValue:
        return .armpit
    case HKBodyTemperatureSensorLocation.body.rawValue:
        return .body
    case HKBodyTemperatureSensorLocation.ear.rawValue:
        return .ear
    case HKBodyTemperatureSensorLocation.finger.rawValue:
        return .finger
    case HKBodyTemperatureSensorLocation.gastroIntestinal.rawValue:
        return .gastrointestinal
    case HKBodyTemperatureSensorLocation.mouth.rawValue:
        return .mouth
    case HKBodyTemperatureSensorLocation.rectum.rawValue:
        return .rectum
    case HKBodyTemperatureSensorLocation.toe.rawValue:
        return .toe
    case HKBodyTemperatureSensorLocation.earDrum.rawValue:
        return .eardrum
    case HKBodyTemperatureSensorLocation.temporalArtery.rawValue:
        return .temporalartery
    case HKBodyTemperatureSensorLocation.forehead.rawValue:
        return .forehead
    default:
        throw NSError(
            domain: "NitroHealth",
            code: 6,
            userInfo: [
                NSLocalizedDescriptionKey: "HealthKit returned unsupported body temperature sensor location: \(number)"
            ]
        )
    }
}
