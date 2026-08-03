package com.nitrohealth

import androidx.health.connect.client.records.metadata.Metadata

private const val MAX_SAFE_INTEGER = 9_007_199_254_740_991.0

internal fun makeSampleMetadata(syncId: String?, syncVersion: Double?): Metadata {
    if (syncId == null && syncVersion == null) {
        return Metadata.unknownRecordingMethod()
    }

    require(syncId != null && syncVersion != null) {
        "syncId and syncVersion must either both be provided or both be absent"
    }
    require(syncId.isNotBlank()) { "syncId must be a non-empty string" }
    require(
        syncVersion.isFinite() &&
            syncVersion >= 0.0 &&
            syncVersion <= MAX_SAFE_INTEGER &&
            syncVersion % 1.0 == 0.0
    ) {
        "syncVersion must be a non-negative safe integer"
    }

    return Metadata.unknownRecordingMethod(
        clientRecordId = syncId,
        clientRecordVersion = syncVersion.toLong()
    )
}
