import Foundation
import HealthKit

extension NativeVo2MaxSampleInput {
    func healthKitMetadata() throws -> [String: Any]? {
        var metadata = try makeHealthKitMetadata(
            syncId: syncId,
            syncVersion: syncVersion,
            recordingMethod: recordingMethod
        ) ?? [:]

        if let iosTestType {
            metadata[HKMetadataKeyVO2MaxTestType] = NSNumber(
                value: try healthKitVo2MaxTestTypeRawValue(iosTestType)
            )
        }

        return metadata.isEmpty ? nil : metadata
    }
}
