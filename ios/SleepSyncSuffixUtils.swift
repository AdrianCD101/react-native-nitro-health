//
//  SleepSyncSuffixUtils.swift
//
//  Pure sync-suffix logic for sleep sessions. A session's envelope carries the
//  unsuffixed sync id; each stage sample carries "<id>#stage<N>" keyed off its
//  sorted position. Unlike nutrition's fixed nutrient descriptors, stages are a
//  variable-length list, so a versioned re-save with fewer stages leaves prior
//  "#stageN" samples behind that must be found by prefix and removed by version.
//  Foundation-only so Package.swift's SPM test target can cover it.
//

import Foundation

private let sleepStageSyncMarker = "#stage"

func sleepStageSyncSuffix(sortedIndex: Int) -> String {
    return "\(sleepStageSyncMarker)\(sortedIndex)"
}

func sleepStageSyncPrefix(sessionSyncId: String) -> String {
    return "\(sessionSyncId)\(sleepStageSyncMarker)"
}

struct SleepStageSyncCandidate {
    let uuid: UUID
    let syncIdentifier: String?
    let syncVersion: Int64?
}

// Stage samples left over from an earlier version of the same logical session:
// the sync id must be exactly "<prefix><digits>" (a broader begins-with match
// could capture another session whose own id extends this one), and only a
// strictly lower stored version is stale — an equal or higher version means the
// incoming save was ignored because a newer record is already stored, matching
// HealthKit's own replacement semantics.
func staleSleepStageUuids(
    candidates: [SleepStageSyncCandidate],
    syncPrefix: String,
    incomingVersion: Int64
) -> [UUID] {
    return candidates.compactMap { candidate in
        guard
            let syncIdentifier = candidate.syncIdentifier,
            syncIdentifier.hasPrefix(syncPrefix),
            isAllDigits(syncIdentifier.dropFirst(syncPrefix.count)),
            let storedVersion = candidate.syncVersion,
            storedVersion < incomingVersion
        else {
            return nil
        }
        return candidate.uuid
    }
}

private func isAllDigits(_ text: Substring) -> Bool {
    return !text.isEmpty && text.allSatisfy { character in character.isNumber && character.isASCII }
}
