import Foundation
import HealthKit

extension NativeBloodGlucoseSampleInput {
    func healthKitMetadata() throws -> [String: Any]? {
        var metadata = try makeHealthKitSyncMetadata(
            syncId: syncId,
            syncVersion: syncVersion
        ) ?? [:]

        if let mealTime = iosMealTime {
            switch mealTime {
            case .preprandial:
                metadata[HKMetadataKeyBloodGlucoseMealTime] = NSNumber(
                    value: HKBloodGlucoseMealTime.preprandial.rawValue
                )
            case .postprandial:
                metadata[HKMetadataKeyBloodGlucoseMealTime] = NSNumber(
                    value: HKBloodGlucoseMealTime.postprandial.rawValue
                )
            }
        }

        return metadata.isEmpty ? nil : metadata
    }
}
