package com.nitrohealth

import androidx.health.connect.client.records.metadata.DataOrigin
import com.margelo.nitro.nitrohealth.NativeHealthDateRangeQuery

/**
 * Builds the Health Connect data-origin filter for a raw read. On the wire an empty
 * `originIdentifiers` array means "no identifier filter" — the sentinel is safe because
 * the JS mapping layer rejects user-supplied empty arrays before they reach native, so an
 * empty array here always means the caller requested no filter, never a scoped read that
 * would silently widen. `ownAppOnly` and a non-empty `originIdentifiers` are mutually
 * exclusive by the same JS contract; both arriving means the mapping layer was bypassed
 * and must fail loudly rather than pick a winner.
 */
internal fun makeDataOriginFilter(
    query: NativeHealthDateRangeQuery,
    ownPackageName: () -> String
): Set<DataOrigin> {
    val identifiers = query.originIdentifiers

    if (query.ownAppOnly == true && identifiers.isNotEmpty()) {
        throw IllegalArgumentException("ownAppOnly and originIdentifiers are mutually exclusive")
    }

    if (query.ownAppOnly == true) {
        return setOf(DataOrigin(ownPackageName()))
    }

    return identifiers.map { DataOrigin(it) }.toSet()
}
