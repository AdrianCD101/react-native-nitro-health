package com.nitrohealth

import androidx.health.connect.client.records.metadata.Device
import com.margelo.nitro.nitrohealth.NativeHealthDeviceType
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
            val device = makeNativeHealthDeviceInfo(Device(type = healthConnect))!!

            assertEquals(native, device.type)
            assertNull(device.manufacturer)
            assertNull(device.model)
        }
    }

    @Test
    fun futureDeviceTypeFallsBackToUnknown() {
        val device = makeNativeHealthDeviceInfo(Device(type = Int.MAX_VALUE))

        assertEquals(NativeHealthDeviceType.UNKNOWN, device!!.type)
    }

    @Test
    fun nullDeviceRemainsNull() {
        assertNull(makeNativeHealthDeviceInfo(null))
    }

    @Test
    fun preservesManufacturerAndModel() {
        val device = makeNativeHealthDeviceInfo(
            Device(
                type = Device.TYPE_WATCH,
                manufacturer = "Example Manufacturer",
                model = "Example Model"
            )
        )!!

        assertEquals("Example Manufacturer", device.manufacturer)
        assertEquals("Example Model", device.model)
    }
}
