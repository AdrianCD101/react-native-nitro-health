package com.nitrohealth

import androidx.health.connect.client.records.metadata.DataOrigin
import com.margelo.nitro.nitrohealth.NativeHealthDateRangeQuery

/**
 * Builds the Health Connect data-origin filter for a raw read. An empty set means
 * "no filter" to Health Connect, so this only ever returns an empty set for a query
 * with no origins filter at all: the JS mapping layer guarantees a present
 * `originIdentifiers` is non-empty, and a violated guarantee throws rather than
 * silently widening a scoped read. `ownAppOnly` and `originIdentifiers` are mutually
 * exclusive by the same contract.
 */
internal fun makeDataOriginFilter(
    query: NativeHealthDateRangeQuery,
    ownPackageName: () -> String
): Set<DataOrigin> {
    val identifiers = query.originIdentifiers

    if (query.ownAppOnly == true && identifiers != null) {
        throw IllegalArgumentException("ownAppOnly and originIdentifiers are mutually exclusive")
    }

    if (query.ownAppOnly == true) {
        return setOf(DataOrigin(ownPackageName()))
    }

    if (identifiers != null) {
        if (identifiers.isEmpty()) {
            throw IllegalArgumentException("originIdentifiers must not be empty")
        }
        return identifiers.map { DataOrigin(it) }.toSet()
    }

    return emptySet()
}
