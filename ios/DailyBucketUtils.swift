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
    let startTimeMs = min(max(bucketStartTimeMs, queryStartTimeMs), queryEndTimeMs)

    return DailyBucketRange(
        startTimeMs: startTimeMs,
        // Guard against inverted ranges when a bucket falls outside the query
        // range. Mirrors clampDailyBucketRange on Android.
        endTimeMs: max(min(bucketEndTimeMs, queryEndTimeMs), startTimeMs)
    )
}
