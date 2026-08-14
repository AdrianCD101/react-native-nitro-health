package com.nitrohealth

import androidx.health.connect.client.records.metadata.Device
import androidx.health.connect.client.records.metadata.Metadata
import com.margelo.nitro.nitrohealth.NativeHealthRecordingMethod

private const val MAX_SAFE_INTEGER = 9_007_199_254_740_991.0

internal fun makeSampleMetadata(
    syncId: String?,
    syncVersion: Double?,
    recordingMethod: NativeHealthRecordingMethod? = null
): Metadata {
    val method = recordingMethod ?: NativeHealthRecordingMethod.UNKNOWN
    if (syncId == null && syncVersion == null) {
        return when (method) {
            NativeHealthRecordingMethod.MANUAL -> Metadata.manualEntry()
            NativeHealthRecordingMethod.ACTIVELYRECORDED -> Metadata.activelyRecorded(
                device = Device(type = Device.TYPE_UNKNOWN)
            )
            NativeHealthRecordingMethod.AUTOMATICALLYRECORDED -> Metadata.autoRecorded(
                device = Device(type = Device.TYPE_UNKNOWN)
            )
            NativeHealthRecordingMethod.UNKNOWN -> Metadata.unknownRecordingMethod()
        }
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

    val version = syncVersion.toLong()
    return when (method) {
        NativeHealthRecordingMethod.MANUAL -> Metadata.manualEntry(
            clientRecordId = syncId,
            clientRecordVersion = version
        )
        NativeHealthRecordingMethod.ACTIVELYRECORDED -> Metadata.activelyRecorded(
            clientRecordId = syncId,
            clientRecordVersion = version,
            device = Device(type = Device.TYPE_UNKNOWN)
        )
        NativeHealthRecordingMethod.AUTOMATICALLYRECORDED -> Metadata.autoRecorded(
            clientRecordId = syncId,
            clientRecordVersion = version,
            device = Device(type = Device.TYPE_UNKNOWN)
        )
        NativeHealthRecordingMethod.UNKNOWN -> Metadata.unknownRecordingMethod(
            clientRecordId = syncId,
            clientRecordVersion = version
        )
    }
}
