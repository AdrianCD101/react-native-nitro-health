import Foundation

struct DailyBucketRange {
    let startTimeMs: Double
    let endTimeMs: Double
}

func clampDailyBucketRange(
    bucketStartTimeMs: Double,
    bucketEndTimeMs: Double,
    queryStartTimeMs: Double,
    queryEndTimeMs: Double
) -> DailyBucketRange {
    let startTimeMs = max(bucketStartTimeMs, queryStartTimeMs)

    return DailyBucketRange(
        startTimeMs: startTimeMs,
        // Guard against inverted ranges when a bucket falls outside the query
        // range. Mirrors clampDailyBucketRange on Android.
        endTimeMs: max(min(bucketEndTimeMs, queryEndTimeMs), startTimeMs)
    )
}

func orderAndLimitDailySamples<T>(
    _ samples: [T],
    ascending: Bool,
    limit: Int,
    getStartTimeMs: (T) -> Double
) -> [T] {
    let ordered = samples.sorted {
        if ascending {
            return getStartTimeMs($0) < getStartTimeMs($1)
        }

        return getStartTimeMs($0) > getStartTimeMs($1)
    }

    return Array(ordered.prefix(limit))
}
