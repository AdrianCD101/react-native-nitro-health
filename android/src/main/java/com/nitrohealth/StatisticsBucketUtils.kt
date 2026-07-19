package com.nitrohealth

import java.time.Duration
import java.time.Period

/**
 * How a `readStatistics` bucket should be sliced when building the Health Connect aggregate
 * request: a fixed physical [Duration] (e.g. hourly) via [AggregateGroupByDurationRequest], or a
 * variable-length [Period] (e.g. daily/weekly/monthly, which may cross DST transitions) via
 * [AggregateGroupByPeriodRequest].
 */
internal sealed class BucketSlicer {
    internal data class ByDuration(val duration: Duration) : BucketSlicer()
    internal data class ByPeriod(val period: Period) : BucketSlicer()
}

internal fun makeBucketSlicer(bucket: String): BucketSlicer? {
    return when (bucket) {
        "hour" -> BucketSlicer.ByDuration(Duration.ofHours(1))
        "day" -> BucketSlicer.ByPeriod(Period.ofDays(1))
        "week" -> BucketSlicer.ByPeriod(Period.ofWeeks(1))
        "month" -> BucketSlicer.ByPeriod(Period.ofMonths(1))
        else -> null
    }
}
