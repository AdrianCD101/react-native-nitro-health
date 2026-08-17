package com.nitrohealth

import androidx.health.connect.client.records.metadata.Device
import androidx.health.connect.client.records.metadata.Metadata
import com.margelo.nitro.nitrohealth.NativeHealthDeviceType
import com.margelo.nitro.nitrohealth.NativeHealthSampleMetadata
import com.margelo.nitro.nitrohealth.NativeHealthSampleIdentityKind

internal fun makeRecordIdentity(recordId: String): NativeHealthSampleIdentity {
    return NativeHealthSampleIdentity(
        kind = NativeHealthSampleIdentityKind.RECORD,
        id = recordId,
        recordId = recordId
    )
}

internal fun makeRecordChildIdentity(
    recordId: String,
    childIndex: Int
): NativeHealthSampleIdentity {
    return NativeHealthSampleIdentity(
        kind = NativeHealthSampleIdentityKind.RECORDCHILD,
        id = "$recordId#$childIndex",
        recordId = recordId
    )
}

internal fun makeNativeHealthSampleMetadata(
    metadata: Metadata,
    identity: NativeHealthSampleIdentity? = null
): NativeHealthSampleMetadata {
    val resolvedIdentity = identity ?: makeRecordIdentity(metadata.id)
    val device = metadata.device
    val deviceType = when (device?.type) {
        null -> null
        Device.TYPE_UNKNOWN -> NativeHealthDeviceType.UNKNOWN
        Device.TYPE_WATCH -> NativeHealthDeviceType.WATCH
        Device.TYPE_PHONE -> NativeHealthDeviceType.PHONE
        Device.TYPE_SCALE -> NativeHealthDeviceType.SCALE
        Device.TYPE_RING -> NativeHealthDeviceType.RING
        Device.TYPE_HEAD_MOUNTED -> NativeHealthDeviceType.HEADMOUNTED
        Device.TYPE_FITNESS_BAND -> NativeHealthDeviceType.FITNESSBAND
        Device.TYPE_CHEST_STRAP -> NativeHealthDeviceType.CHESTSTRAP
        Device.TYPE_SMART_DISPLAY -> NativeHealthDeviceType.SMARTDISPLAY
        else -> NativeHealthDeviceType.UNKNOWN
    }

    return NativeHealthSampleMetadata(
        identityKind = resolvedIdentity.kind,
        identityId = resolvedIdentity.id,
        identityRecordId = resolvedIdentity.recordId,
        originIdentifier = metadata.dataOrigin.packageName,
        originDisplayName = null,
        deviceType = deviceType,
        deviceManufacturer = device?.manufacturer,
        deviceModel = device?.model,
        recordingMethod = nativeHealthRecordingMethod(metadata.recordingMethod)
    )
}
