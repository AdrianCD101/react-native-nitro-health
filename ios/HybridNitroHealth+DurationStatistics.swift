//
//  HybridNitroHealth+DurationStatistics.swift
//
//  Hand-computed 'duration' statistics for sleep and workouts.
//  HKStatisticsCollectionQuery only exists for quantity types, so these paths
//  fetch the raw samples overlapping the query range and hand the intervals to
//  the pure bucket math in DurationBucketUtils.swift. This file is
//  HealthKit-only, so it must NOT be added to Package.swift's pure-Foundation
//  SPM test target; the podspec globs ios/**/*.swift and picks it up
//  automatically.
//

import Foundation
import HealthKit
import NitroModules

extension HybridNitroHealth {
    func readSleepDurationStatistics(query: NativeHealthStatisticsQuery) throws -> Promise<[NativeHealthStatistics]> {
        guard let categoryType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
            throw permissionError("Health data type is not available on this device: sleep")
        }
        let context = try makeDurationStatisticsContext(query: query, dataType: "sleep")

        return Promise<[NativeHealthStatistics]>.async {
            // Resolved inside the promise so an invalid identifier rejects with the
            // resolver's message rather than Nitro's raw sync-throw rendering.
            let timeZone = try resolveIanaTimeZone(query.timeZone, errorPrefix: "readStatistics")
            try await self.requireDeterminedReadAuthorization(for: categoryType, label: "sleep")
            let samples = try await self.queryHealthKitSamples(
                sampleType: categoryType,
                limit: HKObjectQueryNoLimit,
                predicate: context.predicate,
                sortDescriptors: []
            ).compactMap { $0 as? HKCategorySample }

            var asleepStageIntervals = [HealthTimeInterval]()
            var allStageIntervals = [HealthTimeInterval]()
            var inBedIntervals = [HealthTimeInterval]()
            for sample in samples {
                let interval = HealthTimeInterval(
                    startTimeMs: sample.startDate.timeIntervalSince1970 * 1000,
                    endTimeMs: sample.endDate.timeIntervalSince1970 * 1000
                )
                switch healthKitSleepIntervalMapping(value: sample.value) {
                case .sessionEnvelope:
                    inBedIntervals.append(interval)
                case .stage(let stage):
                    allStageIntervals.append(interval)
                    if stage.hasPrefix("asleep") {
                        asleepStageIntervals.append(interval)
                    }
                }
            }

            let mergedIntervals = sleepDurationIntervals(
                asleepStageIntervals: asleepStageIntervals,
                allStageIntervals: allStageIntervals,
                inBedIntervals: inBedIntervals
            )
            return self.makeDurationStatistics(
                buckets: bucketedIntervalDurations(
                    buckets: context.makeBuckets(timeZone),
                    mergedIntervals: mergedIntervals
                ),
                query: query,
                timeZone: timeZone
            )
        }
    }

    func readWorkoutDurationStatistics(query: NativeHealthStatisticsQuery) throws -> Promise<[NativeHealthStatistics]> {
        let workoutType = HKObjectType.workoutType()
        let context = try makeDurationStatisticsContext(query: query, dataType: "workout")

        return Promise<[NativeHealthStatistics]>.async {
            // Resolved inside the promise so an invalid identifier rejects with the
            // resolver's message rather than Nitro's raw sync-throw rendering.
            let timeZone = try resolveIanaTimeZone(query.timeZone, errorPrefix: "readStatistics")
            try await self.requireDeterminedReadAuthorization(for: workoutType, label: "workouts")
            let workouts = try await self.queryHealthKitSamples(
                sampleType: workoutType,
                limit: HKObjectQueryNoLimit,
                predicate: context.predicate,
                sortDescriptors: []
            ).compactMap { sample -> WorkoutDurationSample? in
                guard let workout = sample as? HKWorkout else {
                    return nil
                }
                return WorkoutDurationSample(
                    interval: HealthTimeInterval(
                        startTimeMs: workout.startDate.timeIntervalSince1970 * 1000,
                        endTimeMs: workout.endDate.timeIntervalSince1970 * 1000
                    ),
                    durationSeconds: workout.duration
                )
            }

            return self.makeDurationStatistics(
                buckets: bucketedWorkoutDurations(
                    buckets: context.makeBuckets(timeZone),
                    workouts: workouts
                ),
                query: query,
                timeZone: timeZone
            )
        }
    }

    private struct DurationStatisticsContext {
        let predicate: NSPredicate
        let makeBuckets: (TimeZone) -> [HealthTimeInterval]
    }

    // Shared pre-Promise validation: 'duration' is the only metric these
    // hand-computed paths serve, mirroring makeStatisticsOptions' strictness
    // for HKStatistics-backed metrics.
    private func makeDurationStatisticsContext(
        query: NativeHealthStatisticsQuery,
        dataType: String
    ) throws -> DurationStatisticsContext {
        if let unsupportedMetric = query.metrics.first(where: { $0 != "duration" }) {
            throw permissionError("Unsupported statistics metric: \(unsupportedMetric)")
        }
        guard let bucketComponents = makeBucketIntervalComponents(bucket: query.bucket) else {
            throw permissionError("Unsupported statistics bucket: \(query.bucket)")
        }

        let startDate = Date(timeIntervalSince1970: query.startTimeMs / 1000)
        let endDate = Date(timeIntervalSince1970: query.endTimeMs / 1000)
        return DurationStatisticsContext(
            // The default (non-strict) predicate matches samples that merely
            // overlap the range, so intervals straddling the query edges are
            // fetched and clamped by the bucket intersection math.
            predicate: HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: []),
            makeBuckets: { timeZone in
                enumerateStatisticsBuckets(
                    bucketComponents: bucketComponents,
                    timeZone: timeZone,
                    queryStartTimeMs: query.startTimeMs,
                    queryEndTimeMs: query.endTimeMs
                )
            }
        )
    }

    private func makeDurationStatistics(
        buckets: [DurationBucket],
        query: NativeHealthStatisticsQuery,
        timeZone: TimeZone
    ) -> [NativeHealthStatistics] {
        return buckets.map { bucket in
            let range = clampDailyBucketRange(
                bucketStartTimeMs: bucket.startTimeMs,
                bucketEndTimeMs: bucket.endTimeMs,
                queryStartTimeMs: query.startTimeMs,
                queryEndTimeMs: query.endTimeMs
            )
            return NativeHealthStatistics(
                startTimeMs: range.startTimeMs,
                endTimeMs: range.endTimeMs,
                sum: nil,
                avg: nil,
                min: nil,
                max: nil,
                duration: bucket.durationSeconds,
                scope: nil,
                timeZone: timeZone.identifier
            )
        }
    }
}
