import Foundation
import HealthKit

extension NativeHealthWriteMetadata {
    var healthKitDevice: HKDevice? {
        return provenance.healthKitDevice
    }

    func healthKitMetadata(
        syncIdentifierSuffix: String? = nil,
        errorPrefix: String = "samples"
    ) throws -> [String: Any]? {
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

        // Stamped unconditionally: an omitted timeZone means the device zone at write time.
        let timeZone = try resolveIanaTimeZone(self.timeZone, errorPrefix: errorPrefix)
        metadata[HKMetadataKeyTimeZone] = timeZone.identifier

        return metadata.isEmpty ? nil : metadata
    }
}
