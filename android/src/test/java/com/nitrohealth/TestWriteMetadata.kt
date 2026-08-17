package com.nitrohealth

import com.margelo.nitro.nitrohealth.NativeHealthDeviceType
import com.margelo.nitro.nitrohealth.NativeHealthRecordingMethod
import com.margelo.nitro.nitrohealth.NativeHealthSyncMetadata
import com.margelo.nitro.nitrohealth.NativeHealthWriteMetadata
import com.margelo.nitro.nitrohealth.NativeHealthWriteProvenance

internal fun makeTestWriteProvenance(
    deviceType: NativeHealthDeviceType? = null,
    deviceManufacturer: String? = null,
    deviceModel: String? = null,
    recordingMethod: NativeHealthRecordingMethod? = null
): NativeHealthWriteProvenance {
    return NativeHealthWriteProvenance(
        deviceType = deviceType,
        deviceManufacturer = deviceManufacturer,
        deviceModel = deviceModel,
        recordingMethod = recordingMethod
    )
}

internal fun makeTestWriteMetadata(
    deviceType: NativeHealthDeviceType? = null,
    deviceManufacturer: String? = null,
    deviceModel: String? = null,
    recordingMethod: NativeHealthRecordingMethod? = null,
    syncId: String? = null,
    syncVersion: Double? = null
): NativeHealthWriteMetadata {
    require((syncId == null) == (syncVersion == null))
    return NativeHealthWriteMetadata(
        provenance = makeTestWriteProvenance(
            deviceType,
            deviceManufacturer,
            deviceModel,
            recordingMethod
        ),
        sync = if (syncId == null || syncVersion == null) {
            null
        } else {
            NativeHealthSyncMetadata(id = syncId, version = syncVersion)
        }
    )
}
