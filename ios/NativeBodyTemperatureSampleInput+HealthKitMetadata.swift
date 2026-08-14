import Foundation
import HealthKit

extension NativeBodyTemperatureSampleInput {
    func healthKitMetadata() throws -> [String: Any]? {
        var metadata = try makeHealthKitSyncMetadata(
            syncId: syncId,
            syncVersion: syncVersion
        ) ?? [:]

        if let iosSensorLocation {
            metadata[HKMetadataKeyBodyTemperatureSensorLocation] = NSNumber(
                value: healthKitBodyTemperatureSensorLocation(iosSensorLocation).rawValue
            )
        }

        return metadata.isEmpty ? nil : metadata
    }
}
