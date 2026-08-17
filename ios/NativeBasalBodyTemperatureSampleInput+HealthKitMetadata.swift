import Foundation
import HealthKit

extension NativeBasalBodyTemperatureSampleInput {
    func healthKitMetadata() throws -> [String: Any]? {
        var metadata = try writeMetadata.healthKitMetadata() ?? [:]

        if let iosSensorLocation {
            metadata[HKMetadataKeyBodyTemperatureSensorLocation] = NSNumber(
                value: healthKitBodyTemperatureSensorLocation(iosSensorLocation).rawValue
            )
        }

        return metadata.isEmpty ? nil : metadata
    }
}
