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

    func testOrderAndLimitDailySamplesSortsAscendingBeforeApplyingLimit() {
        let samples = [
            DailySample(startTimeMs: 30),
            DailySample(startTimeMs: 10),
            DailySample(startTimeMs: 20),
        ]

        let result = orderAndLimitDailySamples(
            samples,
            ascending: true,
            limit: 2
        ) { $0.startTimeMs }

        XCTAssertEqual(result.map(\.startTimeMs), [10, 20])
    }

    func testOrderAndLimitDailySamplesSortsDescendingBeforeApplyingLimit() {
        let samples = [
            DailySample(startTimeMs: 20),
            DailySample(startTimeMs: 10),
            DailySample(startTimeMs: 30),
        ]

        let result = orderAndLimitDailySamples(
            samples,
            ascending: false,
            limit: 2
        ) { $0.startTimeMs }

        XCTAssertEqual(result.map(\.startTimeMs), [30, 20])
    }
}

private struct DailySample {
    let startTimeMs: Double
}
