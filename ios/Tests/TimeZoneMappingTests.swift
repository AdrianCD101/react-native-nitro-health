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

    // Nitro sends String(describing: error) to JS, so the plain description — not just
    // errorDescription — must carry the human-readable message.
    func testStringDescribingCarriesTheResolverMessage() {
        XCTAssertThrowsError(
            try resolveIanaTimeZone("Not/A_Zone", errorPrefix: "readStatistics")
        ) { error in
            XCTAssertEqual(
                String(describing: error),
                "readStatistics: timeZone is not a valid IANA time-zone identifier: Not/A_Zone"
            )
            XCTAssertEqual(
                error.localizedDescription,
                "readStatistics: timeZone is not a valid IANA time-zone identifier: Not/A_Zone"
            )
        }
    }
}
