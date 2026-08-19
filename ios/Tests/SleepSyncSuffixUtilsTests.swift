import XCTest

@testable import NitroHealthHelpers

final class SleepSyncSuffixUtilsTests: XCTestCase {
    func testStageSuffixUsesSortedPosition() {
        XCTAssertEqual(sleepStageSyncSuffix(sortedIndex: 0), "#stage0")
        XCTAssertEqual(sleepStageSyncSuffix(sortedIndex: 12), "#stage12")
    }

    func testPrefixComposesSessionIdAndMarker() {
        XCTAssertEqual(sleepStageSyncPrefix(sessionSyncId: "night-1"), "night-1#stage")
    }

    func testRemovesOnlyStrictlyOlderVersions() {
        let older = UUID()
        let same = UUID()
        let newer = UUID()
        let stale = staleSleepStageUuids(
            candidates: [
                SleepStageSyncCandidate(uuid: older, syncIdentifier: "night-1#stage2", syncVersion: 1),
                SleepStageSyncCandidate(uuid: same, syncIdentifier: "night-1#stage3", syncVersion: 2),
                SleepStageSyncCandidate(uuid: newer, syncIdentifier: "night-1#stage4", syncVersion: 3),
            ],
            syncPrefix: "night-1#stage",
            incomingVersion: 2
        )

        XCTAssertEqual(stale, [older])
    }

    func testIgnoresPrefixExtensionsOfOtherSessions() {
        let stale = staleSleepStageUuids(
            candidates: [
                SleepStageSyncCandidate(
                    uuid: UUID(),
                    // A different session whose own id happens to extend this prefix.
                    syncIdentifier: "night-1#stagey-mcstageface#stage0",
                    syncVersion: 0
                ),
                SleepStageSyncCandidate(uuid: UUID(), syncIdentifier: "night-1#stage", syncVersion: 0),
            ],
            syncPrefix: "night-1#stage",
            incomingVersion: 5
        )

        XCTAssertEqual(stale, [])
    }

    func testIgnoresCandidatesMissingSyncFields() {
        let stale = staleSleepStageUuids(
            candidates: [
                SleepStageSyncCandidate(uuid: UUID(), syncIdentifier: nil, syncVersion: 0),
                SleepStageSyncCandidate(uuid: UUID(), syncIdentifier: "night-1#stage0", syncVersion: nil),
            ],
            syncPrefix: "night-1#stage",
            incomingVersion: 5
        )

        XCTAssertEqual(stale, [])
    }
}
