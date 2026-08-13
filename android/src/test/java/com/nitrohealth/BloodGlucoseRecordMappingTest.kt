package com.nitrohealth

import androidx.health.connect.client.records.BloodGlucoseRecord
import androidx.health.connect.client.records.MealType
import androidx.health.connect.client.records.metadata.Metadata
import androidx.health.connect.client.units.BloodGlucose
import com.margelo.nitro.nitrohealth.NativeBloodGlucoseMealType
import com.margelo.nitro.nitrohealth.NativeBloodGlucoseRelationToMeal
import com.margelo.nitro.nitrohealth.NativeBloodGlucoseSpecimenSource
import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class BloodGlucoseRecordMappingTest {
    @Test
    fun mapsAndroidMetadataFieldsOntoNativeSample() {
        val record = BloodGlucoseRecord(
            time = Instant.parse("2026-01-01T09:00:00Z"),
            zoneOffset = null,
            metadata = Metadata.unknownRecordingMethod(),
            level = BloodGlucose.millimolesPerLiter(5.4),
            specimenSource = BloodGlucoseRecord.SPECIMEN_SOURCE_CAPILLARY_BLOOD,
            mealType = MealType.MEAL_TYPE_BREAKFAST,
            relationToMeal = BloodGlucoseRecord.RELATION_TO_MEAL_BEFORE_MEAL
        )

        val sample = makeNativeBloodGlucoseSample(record)

        assertEquals(NativeBloodGlucoseSpecimenSource.CAPILLARYBLOOD, sample.androidSpecimenSource)
        assertEquals(NativeBloodGlucoseMealType.BREAKFAST, sample.androidMealType)
        assertEquals(NativeBloodGlucoseRelationToMeal.BEFOREMEAL, sample.androidRelationToMeal)
        assertNull(sample.iosMealTime)
    }

    @Test
    fun mapsExplicitUnknownAndroidMetadataFieldsOntoNativeSample() {
        val record = BloodGlucoseRecord(
            time = Instant.parse("2026-01-01T09:00:00Z"),
            zoneOffset = null,
            metadata = Metadata.unknownRecordingMethod(),
            level = BloodGlucose.millimolesPerLiter(5.4)
        )

        val sample = makeNativeBloodGlucoseSample(record)

        assertEquals(NativeBloodGlucoseSpecimenSource.UNSPECIFIED, sample.androidSpecimenSource)
        assertEquals(NativeBloodGlucoseMealType.UNSPECIFIED, sample.androidMealType)
        assertEquals(NativeBloodGlucoseRelationToMeal.UNSPECIFIED, sample.androidRelationToMeal)
    }
}
