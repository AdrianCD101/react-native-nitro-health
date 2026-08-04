import XCTest
@testable import NitroHealthHelpers

final class TimeZoneMappingTests: XCTestCase {
    func testResolvesKnownIdentifiers() throws {
        XCTAssertEqual(
            try resolveIanaTimeZone("UTC", errorPrefix: "workout").secondsFromGMT(),
            0
        )
        XCTAssertEqual(
            try resolveIanaTimeZone("America/New_York", errorPrefix: "workout").identifier,
            "America/New_York"
        )
    }

    func testRejectsFixedOffsetsAndUnknownIdentifiers() {
        for identifier in ["+01:00", "Not/A_Zone"] {
            XCTAssertThrowsError(try resolveIanaTimeZone(identifier, errorPrefix: "workout"))
        }
    }
}
