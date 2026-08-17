import Foundation
import HealthKit

extension NativeHealthWriteMetadata {
    var healthKitDevice: HKDevice? {
        return provenance.healthKitDevice
    }

    func healthKitMetadata(syncIdentifierSuffix: String? = nil) throws -> [String: Any]? {
        var metadata = provenance.healthKitMetadata ?? [:]
        let syncId = self.sync.map { sync in
            guard let syncIdentifierSuffix else {
                return sync.id
            }
            return "\(sync.id)\(syncIdentifierSuffix)"
        }

        if let normalizedSync = try normalizeSyncMetadata(
            syncId: syncId,
            syncVersion: self.sync?.version
        ) {
            metadata[HKMetadataKeySyncIdentifier] = normalizedSync.identifier
            metadata[HKMetadataKeySyncVersion] = NSNumber(value: normalizedSync.version)
        }

        return metadata.isEmpty ? nil : metadata
    }
}
