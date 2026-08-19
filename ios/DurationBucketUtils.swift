//
//  DurationBucketUtils.swift
//
//  Pure interval math for the hand-computed 'duration' statistics metric.
//  HKStatisticsCollectionQuery only exists for quantity types, so sleep
//  (category samples) and workouts enumerate their own buckets — anchored at
//  the query start like the HealthKit collection queries — and sum interval
//  intersections per bucket. Foundation-only so Package.swift's SPM test
//  target can cover it.
//

import Foundation

struct HealthTimeInterval: Equatable {
    let startTimeMs: Double
    let endTimeMs: Double
}

struct DurationBucket: Equatable {
    let startTimeMs: Double
    let endTimeMs: Double
    let durationSeconds: Double
}

// Mirrors HKStatisticsCollectionQuery boundaries: buckets anchor at the query
// start (not startOfDay/calendar weeks) and day/month arithmetic runs in the
// resolved time zone, so a bucket can be 23 or 25 hours across DST.
func enumerateStatisticsBuckets(
    bucketComponents: DateComponents,
    timeZone: TimeZone,
    queryStartTimeMs: Double,
    queryEndTimeMs: Double
) -> [HealthTimeInterval] {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = timeZone

    var buckets = [HealthTimeInterval]()
    var bucketStart = Date(timeIntervalSince1970: queryStartTimeMs / 1000)
    let queryEnd = Date(timeIntervalSince1970: queryEndTimeMs / 1000)
    while bucketStart < queryEnd {
        guard let bucketEnd = calendar.date(byAdding: bucketComponents, to: bucketStart),
              bucketEnd > bucketStart
        else {
            break
        }
        buckets.append(
            HealthTimeInterval(
                startTimeMs: bucketStart.timeIntervalSince1970 * 1000,
                endTimeMs: bucketEnd.timeIntervalSince1970 * 1000
            )
        )
        bucketStart = bucketEnd
    }
    return buckets
}

// Union-merge: overlapping or touching intervals collapse so every minute is
// counted once even when several sources recorded the same time span.
func mergeHealthTimeIntervals(_ intervals: [HealthTimeInterval]) -> [HealthTimeInterval] {
    let sorted = intervals
        .filter { $0.endTimeMs > $0.startTimeMs }
        .sorted { left, right in
            if left.startTimeMs != right.startTimeMs {
                return left.startTimeMs < right.startTimeMs
            }
            return left.endTimeMs < right.endTimeMs
        }

    var merged = [HealthTimeInterval]()
    for interval in sorted {
        if let last = merged.last, interval.startTimeMs <= last.endTimeMs {
            if interval.endTimeMs > last.endTimeMs {
                merged[merged.count - 1] = HealthTimeInterval(
                    startTimeMs: last.startTimeMs,
                    endTimeMs: interval.endTimeMs
                )
            }
        } else {
            merged.append(interval)
        }
    }
    return merged
}

// Time asleep = union-merged asleep-stage intervals, plus in-bed intervals
// that no stage sample overlaps. The fallback mirrors Health Connect's
// stage-less rule (a session without stages counts its full length) and also
// prevents self-double-counting, because a session's own envelope always
// overlaps its stages.
func sleepDurationIntervals(
    asleepStageIntervals: [HealthTimeInterval],
    allStageIntervals: [HealthTimeInterval],
    inBedIntervals: [HealthTimeInterval]
) -> [HealthTimeInterval] {
    let mergedStages = mergeHealthTimeIntervals(allStageIntervals)
    let stageLessInBed = inBedIntervals.filter { inBed in
        !mergedStages.contains { stage in
            stage.startTimeMs < inBed.endTimeMs && stage.endTimeMs > inBed.startTimeMs
        }
    }
    return mergeHealthTimeIntervals(asleepStageIntervals + stageLessInBed)
}

// Sums each bucket's intersection with already-merged intervals. Buckets with
// no covered time are omitted: absent means "no data", never zero.
func bucketedIntervalDurations(
    buckets: [HealthTimeInterval],
    mergedIntervals: [HealthTimeInterval]
) -> [DurationBucket] {
    return buckets.compactMap { bucket in
        var coveredMs = 0.0
        for interval in mergedIntervals {
            let overlap = min(bucket.endTimeMs, interval.endTimeMs)
                - max(bucket.startTimeMs, interval.startTimeMs)
            if overlap > 0 {
                coveredMs += overlap
            }
        }
        if coveredMs <= 0 {
            return nil
        }
        return DurationBucket(
            startTimeMs: bucket.startTimeMs,
            endTimeMs: bucket.endTimeMs,
            durationSeconds: coveredMs / 1000
        )
    }
}

struct WorkoutDurationSample: Equatable {
    let interval: HealthTimeInterval
    let durationSeconds: Double
}

// Workout duration is the value the writing app declared (it can exclude
// pauses), so workouts sum as-is without union-merging. A workout spanning a
// bucket boundary contributes to each bucket in proportion to its wall-clock
// overlap.
func bucketedWorkoutDurations(
    buckets: [HealthTimeInterval],
    workouts: [WorkoutDurationSample]
) -> [DurationBucket] {
    return buckets.compactMap { bucket in
        var durationSeconds = 0.0
        for workout in workouts {
            let intervalMs = workout.interval.endTimeMs - workout.interval.startTimeMs
            guard intervalMs > 0, workout.durationSeconds > 0 else {
                continue
            }
            let overlapMs = min(bucket.endTimeMs, workout.interval.endTimeMs)
                - max(bucket.startTimeMs, workout.interval.startTimeMs)
            if overlapMs > 0 {
                durationSeconds += workout.durationSeconds * (overlapMs / intervalMs)
            }
        }
        if durationSeconds <= 0 {
            return nil
        }
        return DurationBucket(
            startTimeMs: bucket.startTimeMs,
            endTimeMs: bucket.endTimeMs,
            durationSeconds: durationSeconds
        )
    }
}
