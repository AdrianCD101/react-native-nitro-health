import XCTest

@testable import NitroHealthHelpers

final class DurationBucketUtilsTests: XCTestCase {
    private let utc = TimeZone(identifier: "UTC")!
    private let newYork = TimeZone(identifier: "America/New_York")!

    private func ms(_ iso: String) -> Double {
        let formatter = ISO8601DateFormatter()
        return formatter.date(from: iso)!.timeIntervalSince1970 * 1000
    }

    private func interval(_ start: String, _ end: String) -> HealthTimeInterval {
        return HealthTimeInterval(startTimeMs: ms(start), endTimeMs: ms(end))
    }

    // MARK: enumerateStatisticsBuckets

    func testBucketsAnchorAtQueryStartNotCalendarBoundaries() {
        let buckets = enumerateStatisticsBuckets(
            bucketComponents: DateComponents(day: 1),
            timeZone: utc,
            queryStartTimeMs: ms("2026-01-10T06:30:00Z"),
            queryEndTimeMs: ms("2026-01-12T06:30:00Z")
        )

        XCTAssertEqual(buckets, [
            interval("2026-01-10T06:30:00Z", "2026-01-11T06:30:00Z"),
            interval("2026-01-11T06:30:00Z", "2026-01-12T06:30:00Z"),
        ])
    }

    func testFinalBucketExtendsPastQueryEnd() {
        let buckets = enumerateStatisticsBuckets(
            bucketComponents: DateComponents(hour: 1),
            timeZone: utc,
            queryStartTimeMs: ms("2026-01-10T06:00:00Z"),
            queryEndTimeMs: ms("2026-01-10T07:30:00Z")
        )

        XCTAssertEqual(buckets, [
            interval("2026-01-10T06:00:00Z", "2026-01-10T07:00:00Z"),
            interval("2026-01-10T07:00:00Z", "2026-01-10T08:00:00Z"),
        ])
    }

    func testDayBucketsFollowDaylightSavingTransitions() {
        // US spring-forward 2026-03-08: that local day is 23 hours long.
        let buckets = enumerateStatisticsBuckets(
            bucketComponents: DateComponents(day: 1),
            timeZone: newYork,
            queryStartTimeMs: ms("2026-03-08T00:00:00-05:00"),
            queryEndTimeMs: ms("2026-03-10T00:00:00-04:00")
        )

        XCTAssertEqual(buckets.count, 2)
        let firstDay = buckets[0]
        XCTAssertEqual(firstDay.endTimeMs - firstDay.startTimeMs, 23 * 3_600_000)
        let secondDay = buckets[1]
        XCTAssertEqual(secondDay.endTimeMs - secondDay.startTimeMs, 24 * 3_600_000)
    }

    // MARK: mergeHealthTimeIntervals

    func testMergesOverlappingAndTouchingIntervalsAcrossSources() {
        let merged = mergeHealthTimeIntervals([
            interval("2026-01-11T04:00:00Z", "2026-01-11T06:30:00Z"),
            interval("2026-01-11T03:15:00Z", "2026-01-11T06:00:00Z"),
            interval("2026-01-11T06:30:00Z", "2026-01-11T07:00:00Z"),
            interval("2026-01-11T09:00:00Z", "2026-01-11T10:00:00Z"),
        ])

        XCTAssertEqual(merged, [
            interval("2026-01-11T03:15:00Z", "2026-01-11T07:00:00Z"),
            interval("2026-01-11T09:00:00Z", "2026-01-11T10:00:00Z"),
        ])
    }

    func testMergeDropsEmptyAndInvertedIntervals() {
        let merged = mergeHealthTimeIntervals([
            HealthTimeInterval(startTimeMs: 1000, endTimeMs: 1000),
            HealthTimeInterval(startTimeMs: 3000, endTimeMs: 2000),
        ])

        XCTAssertEqual(merged, [])
    }

    // MARK: sleepDurationIntervals

    func testAsleepIntervalsAreUnionMergedAcrossSources() {
        // Watch stages and a phone app's overlapping asleep interval must not
        // double-count 23:15-02:00.
        let merged = sleepDurationIntervals(
            asleepStageIntervals: [
                interval("2026-01-10T23:20:00Z", "2026-01-11T01:00:00Z"),
                interval("2026-01-11T01:00:00Z", "2026-01-11T02:30:00Z"),
                interval("2026-01-10T23:15:00Z", "2026-01-11T02:00:00Z"),
            ],
            allStageIntervals: [
                interval("2026-01-10T23:20:00Z", "2026-01-11T01:00:00Z"),
                interval("2026-01-11T01:00:00Z", "2026-01-11T02:30:00Z"),
                interval("2026-01-10T23:15:00Z", "2026-01-11T02:00:00Z"),
            ],
            inBedIntervals: [interval("2026-01-10T23:00:00Z", "2026-01-11T07:00:00Z")]
        )

        XCTAssertEqual(merged, [interval("2026-01-10T23:15:00Z", "2026-01-11T02:30:00Z")])
    }

    func testStageLessInBedIntervalCountsInFull() {
        // A manual nap with no stage samples counts its whole span, matching
        // Health Connect's stage-less session rule.
        let merged = sleepDurationIntervals(
            asleepStageIntervals: [],
            allStageIntervals: [],
            inBedIntervals: [interval("2026-01-11T13:00:00Z", "2026-01-11T13:40:00Z")]
        )

        XCTAssertEqual(merged, [interval("2026-01-11T13:00:00Z", "2026-01-11T13:40:00Z")])
    }

    func testAwakeStagesSuppressTheInBedFallbackWithoutCountingAsSleep() {
        // An envelope overlapped by only an awake stage is staged data: the
        // envelope must not count, and neither does the awake time.
        let merged = sleepDurationIntervals(
            asleepStageIntervals: [],
            allStageIntervals: [interval("2026-01-11T03:00:00Z", "2026-01-11T04:00:00Z")],
            inBedIntervals: [interval("2026-01-11T02:00:00Z", "2026-01-11T07:00:00Z")]
        )

        XCTAssertEqual(merged, [])
    }

    func testMixedStagedNightAndStageLessNap() {
        let merged = sleepDurationIntervals(
            asleepStageIntervals: [interval("2026-01-10T23:20:00Z", "2026-01-11T06:30:00Z")],
            allStageIntervals: [interval("2026-01-10T23:20:00Z", "2026-01-11T06:30:00Z")],
            inBedIntervals: [
                interval("2026-01-10T23:00:00Z", "2026-01-11T07:00:00Z"),
                interval("2026-01-11T13:00:00Z", "2026-01-11T13:40:00Z"),
            ]
        )

        XCTAssertEqual(merged, [
            interval("2026-01-10T23:20:00Z", "2026-01-11T06:30:00Z"),
            interval("2026-01-11T13:00:00Z", "2026-01-11T13:40:00Z"),
        ])
    }

    // MARK: bucketedIntervalDurations

    func testIntervalCrossingBucketBoundarySplitsBetweenBuckets() {
        let buckets = [
            interval("2026-01-10T00:00:00Z", "2026-01-11T00:00:00Z"),
            interval("2026-01-11T00:00:00Z", "2026-01-12T00:00:00Z"),
        ]
        let durations = bucketedIntervalDurations(
            buckets: buckets,
            mergedIntervals: [interval("2026-01-10T23:00:00Z", "2026-01-11T07:00:00Z")]
        )

        XCTAssertEqual(durations, [
            DurationBucket(
                startTimeMs: buckets[0].startTimeMs,
                endTimeMs: buckets[0].endTimeMs,
                durationSeconds: 3600
            ),
            DurationBucket(
                startTimeMs: buckets[1].startTimeMs,
                endTimeMs: buckets[1].endTimeMs,
                durationSeconds: 7 * 3600
            ),
        ])
    }

    func testEmptyBucketsAreOmittedNotZeroFilled() {
        let durations = bucketedIntervalDurations(
            buckets: [
                interval("2026-01-10T00:00:00Z", "2026-01-11T00:00:00Z"),
                interval("2026-01-11T00:00:00Z", "2026-01-12T00:00:00Z"),
            ],
            mergedIntervals: [interval("2026-01-11T01:00:00Z", "2026-01-11T02:00:00Z")]
        )

        XCTAssertEqual(durations.count, 1)
        XCTAssertEqual(durations[0].durationSeconds, 3600)
    }

    // MARK: bucketedWorkoutDurations

    func testWorkoutDurationSplitsProportionallyAcrossBuckets() {
        // A 60-minute declared duration over a 90-minute wall-clock span that
        // straddles midnight: 60 wall-clock minutes fall before midnight and 30
        // after, so the declared duration splits 40/20 minutes.
        let buckets = [
            interval("2026-01-10T00:00:00Z", "2026-01-11T00:00:00Z"),
            interval("2026-01-11T00:00:00Z", "2026-01-12T00:00:00Z"),
        ]
        let durations = bucketedWorkoutDurations(
            buckets: buckets,
            workouts: [
                WorkoutDurationSample(
                    interval: interval("2026-01-10T23:00:00Z", "2026-01-11T00:30:00Z"),
                    durationSeconds: 3600
                ),
            ]
        )

        XCTAssertEqual(durations.count, 2)
        XCTAssertEqual(durations[0].durationSeconds, 2400, accuracy: 0.001)
        XCTAssertEqual(durations[1].durationSeconds, 1200, accuracy: 0.001)
    }

    func testOverlappingWorkoutsSumWithoutMerging() {
        // Unlike sleep, two overlapping workouts (e.g. a run inside a hike)
        // both count in full: duration is the value each app declared.
        let bucket = interval("2026-01-10T00:00:00Z", "2026-01-11T00:00:00Z")
        let durations = bucketedWorkoutDurations(
            buckets: [bucket],
            workouts: [
                WorkoutDurationSample(
                    interval: interval("2026-01-10T10:00:00Z", "2026-01-10T12:00:00Z"),
                    durationSeconds: 7200
                ),
                WorkoutDurationSample(
                    interval: interval("2026-01-10T10:30:00Z", "2026-01-10T11:00:00Z"),
                    durationSeconds: 1800
                ),
            ]
        )

        XCTAssertEqual(durations, [
            DurationBucket(
                startTimeMs: bucket.startTimeMs,
                endTimeMs: bucket.endTimeMs,
                durationSeconds: 9000
            ),
        ])
    }
}
