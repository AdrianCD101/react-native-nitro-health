import XCTest
@testable import NitroHealthHelpers

final class DailyBucketUtilsTests: XCTestCase {
    func testClampDailyBucketRangeKeepsBucketInsideQuery() {
        let range = clampDailyBucketRange(
            bucketStartTimeMs: 10,
            bucketEndTimeMs: 20,
            queryStartTimeMs: 0,
            queryEndTimeMs: 30
        )

        XCTAssertEqual(range.startTimeMs, 10)
        XCTAssertEqual(range.endTimeMs, 20)
    }

    func testClampDailyBucketRangeClampsStartToQueryStart() {
        let range = clampDailyBucketRange(
            bucketStartTimeMs: 0,
            bucketEndTimeMs: 20,
            queryStartTimeMs: 10,
            queryEndTimeMs: 30
        )

        XCTAssertEqual(range.startTimeMs, 10)
        XCTAssertEqual(range.endTimeMs, 20)
    }

    func testClampDailyBucketRangeClampsEndToQueryEnd() {
        let range = clampDailyBucketRange(
            bucketStartTimeMs: 10,
            bucketEndTimeMs: 40,
            queryStartTimeMs: 0,
            queryEndTimeMs: 30
        )

        XCTAssertEqual(range.startTimeMs, 10)
        XCTAssertEqual(range.endTimeMs, 30)
    }

    func testClampDailyBucketRangeClampsBothEdges() {
        let range = clampDailyBucketRange(
            bucketStartTimeMs: 0,
            bucketEndTimeMs: 40,
            queryStartTimeMs: 10,
            queryEndTimeMs: 30
        )

        XCTAssertEqual(range.startTimeMs, 10)
        XCTAssertEqual(range.endTimeMs, 30)
    }

    func testClampDailyBucketRangeNeverInvertsWhenBucketFallsOutsideQuery() {
        let range = clampDailyBucketRange(
            bucketStartTimeMs: 0,
            bucketEndTimeMs: 5,
            queryStartTimeMs: 10,
            queryEndTimeMs: 30
        )

        XCTAssertEqual(range.startTimeMs, 10)
        XCTAssertEqual(range.endTimeMs, 10)
    }

    func testClampDailyBucketRangeNeverExceedsQueryEndWhenBucketStartsAfterQuery() {
        let range = clampDailyBucketRange(
            bucketStartTimeMs: 40,
            bucketEndTimeMs: 50,
            queryStartTimeMs: 10,
            queryEndTimeMs: 30
        )

        XCTAssertEqual(range.startTimeMs, 30)
        XCTAssertEqual(range.endTimeMs, 30)
    }
}
