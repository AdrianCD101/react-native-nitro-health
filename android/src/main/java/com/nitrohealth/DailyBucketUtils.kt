package com.nitrohealth

internal data class DailyBucketRange(
    val startTimeMs: Double,
    val endTimeMs: Double
)

internal fun clampDailyBucketRange(
    bucketStartTimeMs: Double,
    bucketEndTimeMs: Double,
    queryStartTimeMs: Double,
    queryEndTimeMs: Double
): DailyBucketRange {
    val startTimeMs = bucketStartTimeMs.coerceIn(queryStartTimeMs, queryEndTimeMs)

    return DailyBucketRange(
        startTimeMs = startTimeMs,
        // Guard against inverted ranges when a bucket boundary round-trips across a
        // DST transition and lands outside the query range.
        endTimeMs = bucketEndTimeMs.coerceAtMost(queryEndTimeMs).coerceAtLeast(startTimeMs)
    )
}

internal fun <T> orderAndLimitDailySamples(
    samples: List<T>,
    ascending: Boolean,
    limit: Int,
    getStartTimeMs: (T) -> Double
): List<T> {
    val ordered = if (ascending) {
        samples.sortedBy(getStartTimeMs)
    } else {
        samples.sortedByDescending(getStartTimeMs)
    }

    return ordered.take(limit)
}
