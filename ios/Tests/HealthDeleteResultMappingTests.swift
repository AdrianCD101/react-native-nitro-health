import XCTest
@testable import NitroHealthHelpers

final class HealthDeleteResultMappingTests: XCTestCase {
    func testPreservesKnownDeletedCountIncludingZero() {
        XCTAssertEqual(
            makeHealthDeleteResultMapping(deletedCount: 0),
            HealthDeleteResultMapping(
                status: .completed,
                deletedCountStatus: .known,
                deletedCount: 0
            )
        )
        XCTAssertEqual(makeHealthDeleteResultMapping(deletedCount: 3).deletedCount, 3)
    }
}
