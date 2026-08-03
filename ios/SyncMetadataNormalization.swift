//
//  SyncMetadataNormalization.swift
//  Pods
//
//  Pure-Foundation validation for the optional versioned-sync pair passed by
//  generated Nitro inputs. HealthKit metadata construction stays in
//  SampleInputMapping.swift so this helper remains unit-testable with SwiftPM.
//

import Foundation

private let maximumSafeSyncVersion = 9_007_199_254_740_991.0

struct NormalizedSyncMetadata: Equatable {
    let identifier: String
    let version: Int64
}

private func invalidSyncMetadataError(_ detail: String) -> NSError {
    return NSError(
        domain: "NitroHealth",
        code: 4,
        userInfo: [NSLocalizedDescriptionKey: "Invalid sync metadata: \(detail)"]
    )
}

func normalizeSyncMetadata(
    syncId: String?,
    syncVersion: Double?
) throws -> NormalizedSyncMetadata? {
    if syncId == nil && syncVersion == nil {
        return nil
    }

    guard let identifier = syncId, let version = syncVersion else {
        throw invalidSyncMetadataError("syncId and syncVersion must be provided together")
    }

    guard !identifier.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
        throw invalidSyncMetadataError("syncId must be a non-empty string")
    }

    guard version.isFinite,
          version >= 0,
          version.rounded(.towardZero) == version,
          version <= maximumSafeSyncVersion
    else {
        throw invalidSyncMetadataError("syncVersion must be a non-negative safe integer")
    }

    return NormalizedSyncMetadata(identifier: identifier, version: Int64(version))
}
