package com.nitrohealth

import androidx.health.connect.client.records.metadata.Metadata
import com.margelo.nitro.nitrohealth.NativeHealthRecordingMethod

internal fun nativeHealthRecordingMethod(recordingMethod: Int): NativeHealthRecordingMethod {
    return when (recordingMethod) {
        Metadata.RECORDING_METHOD_MANUAL_ENTRY -> NativeHealthRecordingMethod.MANUAL
        Metadata.RECORDING_METHOD_ACTIVELY_RECORDED -> NativeHealthRecordingMethod.ACTIVELYRECORDED
        Metadata.RECORDING_METHOD_AUTOMATICALLY_RECORDED ->
            NativeHealthRecordingMethod.AUTOMATICALLYRECORDED
        Metadata.RECORDING_METHOD_UNKNOWN -> NativeHealthRecordingMethod.UNKNOWN
        else -> NativeHealthRecordingMethod.UNKNOWN
    }
}
