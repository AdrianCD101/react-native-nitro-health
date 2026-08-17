package com.nitrohealth

import androidx.health.connect.client.records.metadata.Device
import androidx.health.connect.client.records.metadata.Metadata
import com.margelo.nitro.nitrohealth.NativeHealthDeviceInfo
import com.margelo.nitro.nitrohealth.NativeHealthDeviceType
import com.margelo.nitro.nitrohealth.NativeHealthRecordingMethod
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Test

class SampleMetadataTest {
    @Test
    fun mapsEveryRecordingMethodWithAndWithoutSyncMetadata() {
        val values = listOf(
            NativeHealthRecordingMethod.MANUAL to Metadata.RECORDING_METHOD_MANUAL_ENTRY,
            NativeHealthRecordingMethod.ACTIVELYRECORDED to
                Metadata.RECORDING_METHOD_ACTIVELY_RECORDED,
            NativeHealthRecordingMethod.AUTOMATICALLYRECORDED to
                Metadata.RECORDING_METHOD_AUTOMATICALLY_RECORDED,
            NativeHealthRecordingMethod.UNKNOWN to Metadata.RECORDING_METHOD_UNKNOWN
        )

        values.forEach { (native, healthConnect) ->
            val unkeyed = makeSampleMetadata(null, null, native)
            val keyed = makeSampleMetadata("sample-sync-id", 3.0, native)

            assertEquals(healthConnect, unkeyed.recordingMethod)
            assertEquals(healthConnect, keyed.recordingMethod)
            assertEquals("sample-sync-id", keyed.clientRecordId)
            assertEquals(3L, keyed.clientRecordVersion)
            if (
                native == NativeHealthRecordingMethod.ACTIVELYRECORDED ||
                native == NativeHealthRecordingMethod.AUTOMATICALLYRECORDED
            ) {
                val device = unkeyed.device!!
                assertEquals(Device.TYPE_UNKNOWN, device.type)
                assertNull(device.manufacturer)
                assertNull(device.model)
            } else {
                assertNull(unkeyed.device)
            }
        }
    }

    @Test
    fun mapsEveryPortableDeviceType() {
        val values = listOf(
            null to Device.TYPE_UNKNOWN,
            NativeHealthDeviceType.UNKNOWN to Device.TYPE_UNKNOWN,
            NativeHealthDeviceType.WATCH to Device.TYPE_WATCH,
            NativeHealthDeviceType.PHONE to Device.TYPE_PHONE,
            NativeHealthDeviceType.SCALE to Device.TYPE_SCALE,
            NativeHealthDeviceType.RING to Device.TYPE_RING,
            NativeHealthDeviceType.HEADMOUNTED to Device.TYPE_HEAD_MOUNTED,
            NativeHealthDeviceType.FITNESSBAND to Device.TYPE_FITNESS_BAND,
            NativeHealthDeviceType.CHESTSTRAP to Device.TYPE_CHEST_STRAP,
            NativeHealthDeviceType.SMARTDISPLAY to Device.TYPE_SMART_DISPLAY
        )

        values.forEach { (native, healthConnect) ->
            val device = makeHealthConnectDevice(
                NativeHealthDeviceInfo(
                    type = native,
                    manufacturer = "Example",
                    model = "Sensor"
                )
            )!!

            assertEquals(healthConnect, device.type)
            assertEquals("Example", device.manufacturer)
            assertEquals("Sensor", device.model)
        }
    }

    @Test
    fun suppliedDeviceSurvivesEveryRecordingMethod() {
        val device = NativeHealthDeviceInfo(
            type = NativeHealthDeviceType.PHONE,
            manufacturer = "Example",
            model = "Phone"
        )

        listOf(
            NativeHealthRecordingMethod.MANUAL,
            NativeHealthRecordingMethod.ACTIVELYRECORDED,
            NativeHealthRecordingMethod.AUTOMATICALLYRECORDED,
            NativeHealthRecordingMethod.UNKNOWN
        ).forEach { method ->
            val unkeyed = makeSampleMetadata(null, null, method, device)
            val keyed = makeSampleMetadata("sample-sync-id", 3.0, method, device)

            listOf(unkeyed, keyed).forEach { metadata ->
                assertEquals(Device.TYPE_PHONE, metadata.device?.type)
                assertEquals("Example", metadata.device?.manufacturer)
                assertEquals("Phone", metadata.device?.model)
            }
        }
    }

    @Test
    fun defaultsRecordingMethodToUnknown() {
        assertEquals(
            Metadata.RECORDING_METHOD_UNKNOWN,
            makeSampleMetadata(syncId = null, syncVersion = null).recordingMethod
        )
    }

    @Test
    fun rejectsSyncIdWithoutVersion() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            makeSampleMetadata(syncId = "sample-sync-id", syncVersion = null)
        }

        assertEquals(
            "syncId and syncVersion must either both be provided or both be absent",
            error.message
        )
    }

    @Test
    fun rejectsSyncVersionWithoutId() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            makeSampleMetadata(syncId = null, syncVersion = 1.0)
        }

        assertEquals(
            "syncId and syncVersion must either both be provided or both be absent",
            error.message
        )
    }

    @Test
    fun rejectsBlankSyncId() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            makeSampleMetadata(syncId = "  ", syncVersion = 1.0)
        }

        assertEquals("syncId must be a non-empty string", error.message)
    }

    @Test
    fun rejectsInvalidSyncVersionsBeforeLongConversion() {
        val invalidVersions = listOf(
            -1.0,
            1.5,
            Double.NaN,
            Double.POSITIVE_INFINITY,
            9_007_199_254_740_992.0
        )

        invalidVersions.forEach { syncVersion ->
            val error = assertThrows(IllegalArgumentException::class.java) {
                makeSampleMetadata(syncId = "sample-sync-id", syncVersion = syncVersion)
            }

            assertEquals("syncVersion must be a non-negative safe integer", error.message)
        }
    }

    @Test
    fun acceptsMaximumSafeIntegerVersion() {
        val metadata = makeSampleMetadata(
            syncId = "sample-sync-id",
            syncVersion = 9_007_199_254_740_991.0
        )

        assertEquals("sample-sync-id", metadata.clientRecordId)
        assertEquals(9_007_199_254_740_991L, metadata.clientRecordVersion)
        assertEquals(Metadata.RECORDING_METHOD_UNKNOWN, metadata.recordingMethod)
    }
}
