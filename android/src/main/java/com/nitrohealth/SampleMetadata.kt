package com.nitrohealth

import androidx.health.connect.client.records.metadata.Device
import androidx.health.connect.client.records.metadata.Metadata
import com.margelo.nitro.nitrohealth.NativeHealthDeviceType
import com.margelo.nitro.nitrohealth.NativeHealthRecordingMethod
import com.margelo.nitro.nitrohealth.NativeHealthSyncMetadata
import com.margelo.nitro.nitrohealth.NativeHealthWriteMetadata
import com.margelo.nitro.nitrohealth.NativeHealthWriteProvenance

private const val MAX_SAFE_INTEGER = 9_007_199_254_740_991.0

internal fun makeSampleMetadata(
    writeMetadata: NativeHealthWriteMetadata
): Metadata {
    return makeSampleMetadata(writeMetadata.provenance, writeMetadata.sync)
}

internal fun makeSampleMetadata(
    writeProvenance: NativeHealthWriteProvenance
): Metadata {
    return makeSampleMetadata(writeProvenance, sync = null)
}

private fun makeSampleMetadata(
    provenance: NativeHealthWriteProvenance,
    sync: NativeHealthSyncMetadata?
): Metadata {
    val method = provenance.recordingMethod ?: NativeHealthRecordingMethod.UNKNOWN
    val healthConnectDevice = makeHealthConnectDevice(provenance)
    if (sync == null) {
        return when (method) {
            NativeHealthRecordingMethod.MANUAL -> Metadata.manualEntry(device = healthConnectDevice)
            NativeHealthRecordingMethod.ACTIVELYRECORDED -> Metadata.activelyRecorded(
                device = healthConnectDevice ?: Device(type = Device.TYPE_UNKNOWN)
            )
            NativeHealthRecordingMethod.AUTOMATICALLYRECORDED -> Metadata.autoRecorded(
                device = healthConnectDevice ?: Device(type = Device.TYPE_UNKNOWN)
            )
            NativeHealthRecordingMethod.UNKNOWN -> Metadata.unknownRecordingMethod(
                device = healthConnectDevice
            )
        }
    }

    require(sync.id.isNotBlank()) { "syncId must be a non-empty string" }
    require(
        sync.version.isFinite() &&
            sync.version >= 0.0 &&
            sync.version <= MAX_SAFE_INTEGER &&
            sync.version % 1.0 == 0.0
    ) {
        "syncVersion must be a non-negative safe integer"
    }

    val version = sync.version.toLong()
    return when (method) {
        NativeHealthRecordingMethod.MANUAL -> Metadata.manualEntry(
            clientRecordId = sync.id,
            clientRecordVersion = version,
            device = healthConnectDevice
        )
        NativeHealthRecordingMethod.ACTIVELYRECORDED -> Metadata.activelyRecorded(
            clientRecordId = sync.id,
            clientRecordVersion = version,
            device = healthConnectDevice ?: Device(type = Device.TYPE_UNKNOWN)
        )
        NativeHealthRecordingMethod.AUTOMATICALLYRECORDED -> Metadata.autoRecorded(
            clientRecordId = sync.id,
            clientRecordVersion = version,
            device = healthConnectDevice ?: Device(type = Device.TYPE_UNKNOWN)
        )
        NativeHealthRecordingMethod.UNKNOWN -> Metadata.unknownRecordingMethod(
            clientRecordId = sync.id,
            clientRecordVersion = version,
            device = healthConnectDevice
        )
    }
}

private fun makeHealthConnectDevice(provenance: NativeHealthWriteProvenance): Device? {
    if (
        provenance.deviceType == null &&
        provenance.deviceManufacturer == null &&
        provenance.deviceModel == null
    ) {
        return null
    }

    val type = when (provenance.deviceType) {
        null, NativeHealthDeviceType.UNKNOWN -> Device.TYPE_UNKNOWN
        NativeHealthDeviceType.WATCH -> Device.TYPE_WATCH
        NativeHealthDeviceType.PHONE -> Device.TYPE_PHONE
        NativeHealthDeviceType.SCALE -> Device.TYPE_SCALE
        NativeHealthDeviceType.RING -> Device.TYPE_RING
        NativeHealthDeviceType.HEADMOUNTED -> Device.TYPE_HEAD_MOUNTED
        NativeHealthDeviceType.FITNESSBAND -> Device.TYPE_FITNESS_BAND
        NativeHealthDeviceType.CHESTSTRAP -> Device.TYPE_CHEST_STRAP
        NativeHealthDeviceType.SMARTDISPLAY -> Device.TYPE_SMART_DISPLAY
    }

    return Device(
        type = type,
        manufacturer = provenance.deviceManufacturer,
        model = provenance.deviceModel
    )
}
