import XCTest
@testable import NitroHealthHelpers

private let defaultQueryStartTimeMs = 1_600_000_000_000.0
private let defaultQueryEndTimeMs = 1_700_000_000_000.0

final class SampleCursorUtilsTests: XCTestCase {
    private func makeCursor(
        dataType: String = "steps",
        ascending: Bool = true,
        queryStartTimeMs: Double = defaultQueryStartTimeMs,
        queryEndTimeMs: Double = defaultQueryEndTimeMs,
        startInterval: Double = 1_700_000_000,
        seenUuids: [String] = ["A"],
        originsOwnApp: Bool? = nil,
        originIdentifiers: [String]? = nil
    ) -> SampleCursor {
        return SampleCursor(
            version: 1,
            platform: "ios",
            dataType: dataType,
            ascending: ascending,
            queryStartTimeMs: queryStartTimeMs,
            queryEndTimeMs: queryEndTimeMs,
            startInterval: startInterval,
            seenUuids: seenUuids,
            originsOwnApp: originsOwnApp,
            originIdentifiers: originIdentifiers
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
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs
        )

        XCTAssertEqual(decoded, cursor)
    }

    func testEncodeDecodeRoundTripsDescending() throws {
        let cursor = makeCursor(dataType: "workout", ascending: false, seenUuids: [])

        let decoded = try decodeSampleCursor(
            try encodeSampleCursor(cursor),
            dataType: "workout",
            ascending: false,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs
        )

        XCTAssertEqual(decoded, cursor)
    }

    func testEncodedCursorIsBase64UrlSafe() throws {
        let encoded = try encodeSampleCursor(makeCursor(seenUuids: ["A", "B", "C"]))

        XCTAssertNil(encoded.rangeOfCharacter(from: CharacterSet(charactersIn: "+/=")))
    }

    func testDecodeRejectsGarbage() {
        XCTAssertThrowsError(try decodeSampleCursor(
            "not a cursor!!",
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs
        )) { error in
            XCTAssertTrue(error.localizedDescription.contains("Invalid cursor for steps read"))
        }
    }

    func testDecodeRejectsAndroidEnvelope() {
        // Android cursors are base64url of
        // "v1|android|<dataType>|<asc|desc>|<startTimeMs>|<endTimeMs>|<token>".
        let androidCursor = Data("v1|android|steps|asc|1000|2000|token123".utf8)
            .base64EncodedString()
            .replacingOccurrences(of: "=", with: "")

        XCTAssertThrowsError(try decodeSampleCursor(
            androidCursor,
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs
        )) { error in
            XCTAssertTrue(error.localizedDescription.contains("Invalid cursor for steps read"))
        }
    }

    func testDecodeRejectsForeignPlatform() throws {
        let payload = """
        {"version":1,"platform":"android","dataType":"steps","ascending":true,"queryStartTimeMs":1000,"queryEndTimeMs":2000,"startInterval":0,"seenUuids":[]}
        """
        let encoded = Data(payload.utf8).base64EncodedString().replacingOccurrences(of: "=", with: "")

        XCTAssertThrowsError(try decodeSampleCursor(
            encoded,
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs
        )) { error in
            XCTAssertTrue(error.localizedDescription.contains("another platform"))
        }
    }

    func testDecodeRejectsNewerVersion() throws {
        let payload = """
        {"version":2,"platform":"ios","dataType":"steps","ascending":true,"queryStartTimeMs":1000,"queryEndTimeMs":2000,"startInterval":0,"seenUuids":[]}
        """
        let encoded = Data(payload.utf8).base64EncodedString().replacingOccurrences(of: "=", with: "")

        XCTAssertThrowsError(try decodeSampleCursor(
            encoded,
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs
        )) { error in
            XCTAssertTrue(error.localizedDescription.contains("another platform or by a newer library version"))
        }
    }

    func testDecodeRejectsDataTypeMismatch() throws {
        let encoded = try encodeSampleCursor(makeCursor(dataType: "heartRate"))

        XCTAssertThrowsError(try decodeSampleCursor(
            encoded,
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs
        )) { error in
            XCTAssertTrue(error.localizedDescription.contains("created by a heartRate read"))
        }
    }

    func testDecodeRejectsAscendingMismatch() throws {
        let encoded = try encodeSampleCursor(makeCursor(ascending: true))

        XCTAssertThrowsError(try decodeSampleCursor(
            encoded,
            dataType: "steps",
            ascending: false,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs
        )) { error in
            XCTAssertTrue(error.localizedDescription.contains("different ascending option"))
        }
    }

    func testDecodeRejectsStartTimeMismatch() throws {
        let encoded = try encodeSampleCursor(makeCursor())

        XCTAssertThrowsError(try decodeSampleCursor(
            encoded,
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs - 1,
            queryEndTimeMs: defaultQueryEndTimeMs
        )) { error in
            XCTAssertTrue(error.localizedDescription.contains("different date range"))
        }
    }

    func testDecodeRejectsEndTimeMismatch() throws {
        let encoded = try encodeSampleCursor(makeCursor())

        XCTAssertThrowsError(try decodeSampleCursor(
            encoded,
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs + 1
        )) { error in
            XCTAssertTrue(error.localizedDescription.contains("different date range"))
        }
    }

    // MARK: - Origins filter binding

    func testDecodeRejectsUnfilteredCursorForFilteredQuery() throws {
        let encoded = try encodeSampleCursor(makeCursor())

        XCTAssertThrowsError(try decodeSampleCursor(
            encoded,
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs,
            ownAppOnly: true
        )) { error in
            XCTAssertTrue(error.localizedDescription.contains("different origins filter"))
        }
    }

    func testDecodeRejectsFilteredCursorForUnfilteredQuery() throws {
        let encoded = try encodeSampleCursor(makeCursor(originIdentifiers: ["com.a.app"]))

        XCTAssertThrowsError(try decodeSampleCursor(
            encoded,
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs
        )) { error in
            XCTAssertTrue(error.localizedDescription.contains("different origins filter"))
        }
    }

    func testDecodeRejectsOwnAppCursorForIdentifiersQuery() throws {
        let encoded = try encodeSampleCursor(makeCursor(originsOwnApp: true))

        XCTAssertThrowsError(try decodeSampleCursor(
            encoded,
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs,
            originIdentifiers: ["com.a.app"]
        )) { error in
            XCTAssertTrue(error.localizedDescription.contains("different origins filter"))
        }
    }

    func testDecodeRejectsDifferentIdentifierSets() throws {
        let encoded = try encodeSampleCursor(makeCursor(originIdentifiers: ["com.a.app", "com.b.app"]))

        XCTAssertThrowsError(try decodeSampleCursor(
            encoded,
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs,
            originIdentifiers: ["com.a.app"]
        )) { error in
            XCTAssertTrue(error.localizedDescription.contains("different origins filter"))
        }
    }

    func testDecodeAcceptsMatchingCanonicalIdentifiers() throws {
        let identifiers = ["com.a.app", "com.b.app"]
        let cursor = makeCursor(originIdentifiers: identifiers)

        let decoded = try decodeSampleCursor(
            try encodeSampleCursor(cursor),
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs,
            originIdentifiers: identifiers
        )

        XCTAssertEqual(decoded, cursor)
    }

    func testDecodeAcceptsOwnAppCursorForOwnAppQuery() throws {
        let cursor = makeCursor(originsOwnApp: true)

        let decoded = try decodeSampleCursor(
            try encodeSampleCursor(cursor),
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs,
            ownAppOnly: true
        )

        XCTAssertEqual(decoded, cursor)
    }

    func testDecodeTreatsLegacyPayloadWithoutOriginKeysAsUnfiltered() throws {
        // A cursor produced by a build predating origin filtering has no origin keys;
        // it stays valid for unfiltered queries and rejects filtered ones.
        let payload = """
        {"version":1,"platform":"ios","dataType":"steps","ascending":true,"queryStartTimeMs":\(defaultQueryStartTimeMs),"queryEndTimeMs":\(defaultQueryEndTimeMs),"startInterval":0,"seenUuids":[]}
        """
        let encoded = Data(payload.utf8).base64EncodedString().replacingOccurrences(of: "=", with: "")

        XCTAssertNoThrow(try decodeSampleCursor(
            encoded,
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs
        ))

        XCTAssertThrowsError(try decodeSampleCursor(
            encoded,
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs,
            ownAppOnly: true
        ))
    }

    func testPaginationPropagatesOriginsIntoNextCursor() {
        let page = paginateCursorPage(
            items: makeItems([("A", 1), ("B", 2), ("C", 3), ("D", 4)]),
            limit: 3,
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs,
            cursor: nil,
            ownAppOnly: nil,
            originIdentifiers: ["com.a.app", "com.b.app"]
        )

        XCTAssertEqual(page.nextCursor?.originIdentifiers, ["com.a.app", "com.b.app"])
        XCTAssertNil(page.nextCursor?.originsOwnApp)
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
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs,
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
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs,
            cursor: nil
        )

        XCTAssertEqual(page.keptIndices, [0, 1, 2])
        XCTAssertEqual(page.nextCursor?.startInterval, 3)
        XCTAssertEqual(page.nextCursor?.seenUuids, ["C"])
        XCTAssertEqual(page.nextCursor?.dataType, "steps")
        XCTAssertEqual(page.nextCursor?.ascending, true)
        XCTAssertEqual(page.nextCursor?.queryStartTimeMs, defaultQueryStartTimeMs)
        XCTAssertEqual(page.nextCursor?.queryEndTimeMs, defaultQueryEndTimeMs)
    }

    func testBoundaryTiesAreRecordedInNextCursor() {
        let page = paginateCursorPage(
            items: makeItems([("A", 1), ("B", 2), ("C", 2), ("D", 2)]),
            limit: 3,
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs,
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
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs,
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
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs,
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
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs,
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
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs,
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
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs,
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
            queryStartTimeMs: defaultQueryStartTimeMs,
            queryEndTimeMs: defaultQueryEndTimeMs,
            cursor: nil
        )

        XCTAssertEqual(page.keptIndices, [0, 1, 2])
        XCTAssertNil(page.nextCursor)
    }
}
