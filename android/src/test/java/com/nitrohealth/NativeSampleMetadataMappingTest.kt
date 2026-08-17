package com.nitrohealth

import androidx.health.connect.client.records.metadata.Device
import androidx.health.connect.client.records.metadata.Metadata
import com.margelo.nitro.nitrohealth.NativeHealthDeviceType
import com.margelo.nitro.nitrohealth.NativeHealthRecordingMethod
import com.margelo.nitro.nitrohealth.NativeHealthSampleIdentityKind
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class NativeSampleMetadataMappingTest {
    @Test
    fun mapsEveryStableHealthConnectDeviceType() {
        val values = listOf(
            Device.TYPE_UNKNOWN to NativeHealthDeviceType.UNKNOWN,
            Device.TYPE_WATCH to NativeHealthDeviceType.WATCH,
            Device.TYPE_PHONE to NativeHealthDeviceType.PHONE,
            Device.TYPE_SCALE to NativeHealthDeviceType.SCALE,
            Device.TYPE_RING to NativeHealthDeviceType.RING,
            Device.TYPE_HEAD_MOUNTED to NativeHealthDeviceType.HEADMOUNTED,
            Device.TYPE_FITNESS_BAND to NativeHealthDeviceType.FITNESSBAND,
            Device.TYPE_CHEST_STRAP to NativeHealthDeviceType.CHESTSTRAP,
            Device.TYPE_SMART_DISPLAY to NativeHealthDeviceType.SMARTDISPLAY
        )

        values.forEach { (healthConnect, native) ->
            val sampleMetadata = makeNativeHealthSampleMetadata(
                Metadata.unknownRecordingMethod(device = Device(type = healthConnect))
            )

            assertEquals(native, sampleMetadata.deviceType)
            assertNull(sampleMetadata.deviceManufacturer)
            assertNull(sampleMetadata.deviceModel)
        }
    }

    @Test
    fun mapsRecordMetadataAndExplicitChildIdentity() {
        val metadata = Metadata.autoRecorded(
            device = Device(
                type = Device.TYPE_WATCH,
                manufacturer = "Example Manufacturer",
                model = "Example Model"
            )
        )
        val sampleMetadata = makeNativeHealthSampleMetadata(
            metadata,
            makeRecordChildIdentity(metadata.id, 3)
        )

        assertEquals(NativeHealthSampleIdentityKind.RECORDCHILD, sampleMetadata.identityKind)
        assertEquals("${metadata.id}#3", sampleMetadata.identityId)
        assertEquals(metadata.id, sampleMetadata.identityRecordId)
        assertEquals(metadata.dataOrigin.packageName, sampleMetadata.originIdentifier)
        assertNull(sampleMetadata.originDisplayName)
        assertEquals(NativeHealthDeviceType.WATCH, sampleMetadata.deviceType)
        assertEquals("Example Manufacturer", sampleMetadata.deviceManufacturer)
        assertEquals("Example Model", sampleMetadata.deviceModel)
        assertEquals(
            NativeHealthRecordingMethod.AUTOMATICALLYRECORDED,
            sampleMetadata.recordingMethod
        )
    }

    @Test
    fun absentDeviceRemainsAbsentAndFutureDeviceTypeFallsBackToUnknown() {
        val absent = makeNativeHealthSampleMetadata(Metadata.unknownRecordingMethod())
        val future = makeNativeHealthSampleMetadata(
            Metadata.unknownRecordingMethod(device = Device(type = Int.MAX_VALUE))
        )

        assertNull(absent.deviceType)
        assertNull(absent.deviceManufacturer)
        assertNull(absent.deviceModel)
        assertEquals(NativeHealthDeviceType.UNKNOWN, future.deviceType)
    }
}
