import XCTest
@testable import NitroHealthHelpers

final class SyncMetadataNormalizationTests: XCTestCase {
    func testAbsentPairProducesNoMetadata() throws {
        XCTAssertNil(try normalizeSyncMetadata(syncId: nil, syncVersion: nil))
    }

    func testNormalizesValidPairToInt64Version() throws {
        let metadata = try XCTUnwrap(
            normalizeSyncMetadata(syncId: "record-123", syncVersion: 42)
        )

        XCTAssertEqual(metadata.identifier, "record-123")
        XCTAssertEqual(metadata.version, 42)
    }

    func testAcceptsZeroAndMaximumSafeVersion() throws {
        XCTAssertEqual(
            try normalizeSyncMetadata(syncId: "zero", syncVersion: 0)?.version,
            0
        )
        XCTAssertEqual(
            try normalizeSyncMetadata(
                syncId: "maximum",
                syncVersion: 9_007_199_254_740_991
            )?.version,
            9_007_199_254_740_991
        )
    }

    func testRejectsPartialPairs() {
        assertInvalid(syncId: "record-123", syncVersion: nil, detail: "provided together")
        assertInvalid(syncId: nil, syncVersion: 1, detail: "provided together")
    }

    func testRejectsBlankIdentifier() {
        assertInvalid(syncId: "", syncVersion: 1, detail: "non-empty string")
        assertInvalid(syncId: " \n\t", syncVersion: 1, detail: "non-empty string")
    }

    func testRejectsInvalidVersions() {
        let invalidVersions = [
            -1,
            1.5,
            Double.nan,
            Double.infinity,
            -Double.infinity,
            9_007_199_254_740_992,
        ]

        for version in invalidVersions {
            assertInvalid(
                syncId: "record-123",
                syncVersion: version,
                detail: "non-negative safe integer"
            )
        }
    }

    private func assertInvalid(syncId: String?, syncVersion: Double?, detail: String) {
        XCTAssertThrowsError(
            try normalizeSyncMetadata(syncId: syncId, syncVersion: syncVersion)
        ) { error in
            XCTAssertTrue(error.localizedDescription.contains(detail))
        }
    }
}
