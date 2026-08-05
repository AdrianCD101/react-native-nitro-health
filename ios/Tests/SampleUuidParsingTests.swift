import XCTest
@testable import NitroHealthHelpers

final class SampleUuidParsingTests: XCTestCase {
    func testParsesValidUuidStrings() throws {
        let uuids = try makeSampleUuids([
            "3F2B9C1E-7A54-4F0D-9E2A-1C8D5B6E4A30",
            "B4A1D2C3-0F9E-4B8A-A7C6-D5E4F3A2B1C0",
        ])

        XCTAssertEqual(uuids, [
            UUID(uuidString: "3F2B9C1E-7A54-4F0D-9E2A-1C8D5B6E4A30"),
            UUID(uuidString: "B4A1D2C3-0F9E-4B8A-A7C6-D5E4F3A2B1C0"),
        ])
    }

    func testParsesLowercaseUuidStrings() throws {
        let uuids = try makeSampleUuids(["3f2b9c1e-7a54-4f0d-9e2a-1c8d5b6e4a30"])

        XCTAssertEqual(uuids, [UUID(uuidString: "3F2B9C1E-7A54-4F0D-9E2A-1C8D5B6E4A30")])
    }

    func testParsesEmptyArray() throws {
        // The non-empty guard lives in the JS wrapper; parsing itself accepts an empty list.
        XCTAssertEqual(try makeSampleUuids([]), [])
    }

    func testRejectsInvalidUuidStringWithFailingIndex() {
        XCTAssertThrowsError(
            try makeSampleUuids(["3F2B9C1E-7A54-4F0D-9E2A-1C8D5B6E4A30", "not-a-uuid"])
        ) { error in
            XCTAssertEqual(
                (error as NSError).localizedDescription,
                "recordIds[1]: \"not-a-uuid\" is not a valid HealthKit record id"
            )
        }
    }

    func testRejectsSyntheticAndroidReadingId() {
        // Android's synthetic "<recordId>#<index>" ids are rejected in the JS wrapper before the
        // bridge; if one ever reaches iOS it is not a parseable UUID and fails here too.
        XCTAssertThrowsError(
            try makeSampleUuids(["3F2B9C1E-7A54-4F0D-9E2A-1C8D5B6E4A30#0"])
        ) { error in
            XCTAssertEqual(
                (error as NSError).localizedDescription,
                "recordIds[0]: \"3F2B9C1E-7A54-4F0D-9E2A-1C8D5B6E4A30#0\" is not a valid HealthKit record id"
            )
        }
    }
}
