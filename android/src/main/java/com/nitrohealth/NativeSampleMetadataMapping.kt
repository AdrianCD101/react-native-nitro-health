package com.nitrohealth

import androidx.health.connect.client.records.metadata.Device
import com.margelo.nitro.nitrohealth.NativeHealthDataOrigin
import com.margelo.nitro.nitrohealth.NativeHealthDeviceInfo
import com.margelo.nitro.nitrohealth.NativeHealthDeviceType
import com.margelo.nitro.nitrohealth.NativeHealthSampleIdentity
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

internal fun makeHealthDataOrigin(packageName: String): NativeHealthDataOrigin {
    return NativeHealthDataOrigin(identifier = packageName, displayName = null)
}

internal fun makeHealthConnectDevice(device: NativeHealthDeviceInfo?): Device? {
    if (device == null) {
        return null
    }

    val type = when (device.type) {
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

    return Device(type = type, manufacturer = device.manufacturer, model = device.model)
}

internal fun makeNativeHealthDeviceInfo(device: Device?): NativeHealthDeviceInfo? {
    if (device == null) {
        return null
    }

    val type = when (device.type) {
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

    return NativeHealthDeviceInfo(
        type = type,
        manufacturer = device.manufacturer,
        model = device.model
    )
}
