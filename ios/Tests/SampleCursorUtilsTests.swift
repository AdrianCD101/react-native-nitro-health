import XCTest
@testable import NitroHealthHelpers

final class SampleCursorUtilsTests: XCTestCase {
    private func makeCursor(
        dataType: String = "steps",
        ascending: Bool = true,
        startInterval: Double = 1_700_000_000,
        seenUuids: [String] = ["A"]
    ) -> SampleCursor {
        return SampleCursor(
            version: 1,
            platform: "ios",
            dataType: dataType,
            ascending: ascending,
            startInterval: startInterval,
            seenUuids: seenUuids
        )
    }

    private func makeItems(_ pairs: [(String, Double)]) -> [CursorPageItem] {
        return pairs.map { CursorPageItem(uuid: $0.0, startInterval: $0.1) }
    }

    // MARK: - Encoding

    func testEncodeDecodeRoundTripsAscending() throws {
        let cursor = makeCursor(seenUuids: ["A", "B"])

        let decoded = try decodeSampleCursor(
            try encodeSampleCursor(cursor),
            dataType: "steps",
            ascending: true
        )

        XCTAssertEqual(decoded, cursor)
    }

    func testEncodeDecodeRoundTripsDescending() throws {
        let cursor = makeCursor(dataType: "workout", ascending: false, seenUuids: [])

        let decoded = try decodeSampleCursor(
            try encodeSampleCursor(cursor),
            dataType: "workout",
            ascending: false
        )

        XCTAssertEqual(decoded, cursor)
    }

    func testEncodedCursorIsBase64UrlSafe() throws {
        let encoded = try encodeSampleCursor(makeCursor(seenUuids: ["A", "B", "C"]))

        XCTAssertNil(encoded.rangeOfCharacter(from: CharacterSet(charactersIn: "+/=")))
    }

    func testDecodeRejectsGarbage() {
        XCTAssertThrowsError(try decodeSampleCursor("not a cursor!!", dataType: "steps", ascending: true)) { error in
            XCTAssertTrue(error.localizedDescription.contains("Invalid cursor for steps read"))
        }
    }

    func testDecodeRejectsAndroidEnvelope() {
        // Android cursors are base64url of "v1|android|<dataType>|<asc|desc>|<token>" — valid
        // base64, but not JSON.
        let androidCursor = Data("v1|android|steps|asc|token123".utf8)
            .base64EncodedString()
            .replacingOccurrences(of: "=", with: "")

        XCTAssertThrowsError(try decodeSampleCursor(androidCursor, dataType: "steps", ascending: true)) { error in
            XCTAssertTrue(error.localizedDescription.contains("Invalid cursor for steps read"))
        }
    }

    func testDecodeRejectsForeignPlatform() throws {
        let payload = """
        {"version":1,"platform":"android","dataType":"steps","ascending":true,"startInterval":0,"seenUuids":[]}
        """
        let encoded = Data(payload.utf8).base64EncodedString().replacingOccurrences(of: "=", with: "")

        XCTAssertThrowsError(try decodeSampleCursor(encoded, dataType: "steps", ascending: true)) { error in
            XCTAssertTrue(error.localizedDescription.contains("another platform"))
        }
    }

    func testDecodeRejectsNewerVersion() throws {
        let payload = """
        {"version":2,"platform":"ios","dataType":"steps","ascending":true,"startInterval":0,"seenUuids":[]}
        """
        let encoded = Data(payload.utf8).base64EncodedString().replacingOccurrences(of: "=", with: "")

        XCTAssertThrowsError(try decodeSampleCursor(encoded, dataType: "steps", ascending: true)) { error in
            XCTAssertTrue(error.localizedDescription.contains("another platform or by a newer library version"))
        }
    }

    func testDecodeRejectsDataTypeMismatch() throws {
        let encoded = try encodeSampleCursor(makeCursor(dataType: "heartRate"))

        XCTAssertThrowsError(try decodeSampleCursor(encoded, dataType: "steps", ascending: true)) { error in
            XCTAssertTrue(error.localizedDescription.contains("created by a heartRate read"))
        }
    }

    func testDecodeRejectsAscendingMismatch() throws {
        let encoded = try encodeSampleCursor(makeCursor(ascending: true))

        XCTAssertThrowsError(try decodeSampleCursor(encoded, dataType: "steps", ascending: false)) { error in
            XCTAssertTrue(error.localizedDescription.contains("different ascending option"))
        }
    }

    // MARK: - Resume window

    func testWindowAscendingResumesAtBoundaryWithStrictStart() {
        let window = makeCursorPageWindow(
            cursor: makeCursor(startInterval: 500),
            queryStartInterval: 100,
            queryEndInterval: 900
        )

        XCTAssertEqual(window, CursorPageWindow(startInterval: 500, endInterval: 900, strictStartDate: true))
    }

    func testWindowDescendingKeepsQueryStartAndBumpsEndAboveBoundary() {
        let window = makeCursorPageWindow(
            cursor: makeCursor(ascending: false, startInterval: 500),
            queryStartInterval: 100,
            queryEndInterval: 900
        )

        XCTAssertEqual(window.startInterval, 100)
        XCTAssertFalse(window.strictStartDate)
        // The non-strict end bound is `start < end`; nextUp makes it exactly `start <= boundary`.
        XCTAssertGreaterThan(window.endInterval, 500)
        XCTAssertEqual(window.endInterval, (500 as Double).nextUp)
    }

    func testFetchLimitCoversSeenUuidsAndSentinel() {
        XCTAssertEqual(makeCursorFetchLimit(limit: 100, cursor: nil), 101)
        XCTAssertEqual(makeCursorFetchLimit(limit: 100, cursor: makeCursor(seenUuids: ["A", "B"])), 103)
    }

    // MARK: - Pagination

    func testFirstPageUnderLimitHasNoNextCursor() {
        let page = paginateCursorPage(
            items: makeItems([("A", 1), ("B", 2)]),
            limit: 3,
            dataType: "steps",
            ascending: true,
            cursor: nil
        )

        XCTAssertEqual(page.keptIndices, [0, 1])
        XCTAssertNil(page.nextCursor)
    }

    func testFirstPageOverLimitKeepsLimitAndEmitsBoundaryCursor() {
        let page = paginateCursorPage(
            items: makeItems([("A", 1), ("B", 2), ("C", 3), ("D", 4)]),
            limit: 3,
            dataType: "steps",
            ascending: true,
            cursor: nil
        )

        XCTAssertEqual(page.keptIndices, [0, 1, 2])
        XCTAssertEqual(page.nextCursor?.startInterval, 3)
        XCTAssertEqual(page.nextCursor?.seenUuids, ["C"])
        XCTAssertEqual(page.nextCursor?.dataType, "steps")
        XCTAssertEqual(page.nextCursor?.ascending, true)
    }

    func testBoundaryTiesAreRecordedInNextCursor() {
        let page = paginateCursorPage(
            items: makeItems([("A", 1), ("B", 2), ("C", 2), ("D", 2)]),
            limit: 3,
            dataType: "steps",
            ascending: true,
            cursor: nil
        )

        XCTAssertEqual(page.keptIndices, [0, 1, 2])
        XCTAssertEqual(page.nextCursor?.startInterval, 2)
        XCTAssertEqual(page.nextCursor?.seenUuids, ["B", "C"])
    }

    func testResumeSkipsSeenUuidsEvenWhenInterleaved() {
        // HealthKit's tie order is not stable between queries: seen items can
        // interleave with unseen ones inside the refetched window. Fetch limit
        // for limit 2 + 2 seen uuids is 5; the store returned only 4, so the
        // range is exhausted.
        let page = paginateCursorPage(
            items: makeItems([("C", 2), ("B", 2), ("D", 2), ("E", 3)]),
            limit: 2,
            dataType: "steps",
            ascending: true,
            cursor: makeCursor(startInterval: 2, seenUuids: ["B", "C"])
        )

        XCTAssertEqual(page.keptIndices, [2, 3])
        XCTAssertNil(page.nextCursor)
    }

    func testMultiplePagesOfIdenticalTimestampsCarrySeenUuidsForward() {
        // Page 2 of a run where every sample shares startInterval == 7.
        let page = paginateCursorPage(
            items: makeItems([("A", 7), ("B", 7), ("C", 7), ("D", 7), ("E", 7)]),
            limit: 2,
            dataType: "steps",
            ascending: true,
            cursor: makeCursor(startInterval: 7, seenUuids: ["A", "B"])
        )

        XCTAssertEqual(page.keptIndices, [2, 3])
        XCTAssertEqual(page.nextCursor?.startInterval, 7)
        XCTAssertEqual(Set(page.nextCursor?.seenUuids ?? []), Set(["A", "B", "C", "D"]))
    }

    func testSeenUuidsResetOnceBoundaryAdvances() {
        let page = paginateCursorPage(
            items: makeItems([("A", 7), ("B", 8), ("C", 9), ("D", 10)]),
            limit: 2,
            dataType: "steps",
            ascending: true,
            cursor: makeCursor(startInterval: 7, seenUuids: ["A"])
        )

        XCTAssertEqual(page.keptIndices, [1, 2])
        XCTAssertEqual(page.nextCursor?.startInterval, 9)
        XCTAssertEqual(page.nextCursor?.seenUuids, ["C"])
    }

    func testTerminalPageEmptyAfterSkippingSeenUuids() {
        let page = paginateCursorPage(
            items: makeItems([("A", 5), ("B", 5)]),
            limit: 3,
            dataType: "steps",
            ascending: true,
            cursor: makeCursor(startInterval: 5, seenUuids: ["A", "B"])
        )

        XCTAssertEqual(page.keptIndices, [])
        XCTAssertNil(page.nextCursor)
    }

    func testDescendingPaginationUsesLowestKeptIntervalAsBoundary() {
        let page = paginateCursorPage(
            items: makeItems([("D", 9), ("C", 8), ("B", 8), ("A", 7)]),
            limit: 3,
            dataType: "workout",
            ascending: false,
            cursor: nil
        )

        XCTAssertEqual(page.keptIndices, [0, 1, 2])
        XCTAssertEqual(page.nextCursor?.startInterval, 8)
        XCTAssertEqual(page.nextCursor?.seenUuids, ["C", "B"])
        XCTAssertEqual(page.nextCursor?.ascending, false)
    }

    func testExactlyFullWindowWithNoExtraItemEndsPagination() {
        // Fetch limit for limit 3 + no cursor is 4; the store returning exactly 3
        // means it is exhausted.
        let page = paginateCursorPage(
            items: makeItems([("A", 1), ("B", 2), ("C", 3)]),
            limit: 3,
            dataType: "steps",
            ascending: true,
            cursor: nil
        )

        XCTAssertEqual(page.keptIndices, [0, 1, 2])
        XCTAssertNil(page.nextCursor)
    }
}
