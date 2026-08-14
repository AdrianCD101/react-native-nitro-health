package com.nitrohealth

import androidx.health.connect.client.records.BloodGlucoseRecord
import androidx.health.connect.client.records.MealType
import com.margelo.nitro.nitrohealth.NativeBloodGlucoseMealType
import com.margelo.nitro.nitrohealth.NativeBloodGlucoseRelationToMeal
import com.margelo.nitro.nitrohealth.NativeBloodGlucoseSample
import com.margelo.nitro.nitrohealth.NativeBloodGlucoseSpecimenSource

internal fun healthConnectBloodGlucoseSpecimenSource(
    value: NativeBloodGlucoseSpecimenSource?
): Int {
    return when (value) {
        null,
        NativeBloodGlucoseSpecimenSource.UNSPECIFIED -> BloodGlucoseRecord.SPECIMEN_SOURCE_UNKNOWN
        NativeBloodGlucoseSpecimenSource.INTERSTITIALFLUID ->
            BloodGlucoseRecord.SPECIMEN_SOURCE_INTERSTITIAL_FLUID
        NativeBloodGlucoseSpecimenSource.CAPILLARYBLOOD ->
            BloodGlucoseRecord.SPECIMEN_SOURCE_CAPILLARY_BLOOD
        NativeBloodGlucoseSpecimenSource.PLASMA -> BloodGlucoseRecord.SPECIMEN_SOURCE_PLASMA
        NativeBloodGlucoseSpecimenSource.SERUM -> BloodGlucoseRecord.SPECIMEN_SOURCE_SERUM
        NativeBloodGlucoseSpecimenSource.TEARS -> BloodGlucoseRecord.SPECIMEN_SOURCE_TEARS
        NativeBloodGlucoseSpecimenSource.WHOLEBLOOD ->
            BloodGlucoseRecord.SPECIMEN_SOURCE_WHOLE_BLOOD
    }
}

internal fun healthConnectBloodGlucoseMealType(value: NativeBloodGlucoseMealType?): Int {
    return when (value) {
        null,
        NativeBloodGlucoseMealType.UNSPECIFIED -> MealType.MEAL_TYPE_UNKNOWN
        NativeBloodGlucoseMealType.BREAKFAST -> MealType.MEAL_TYPE_BREAKFAST
        NativeBloodGlucoseMealType.LUNCH -> MealType.MEAL_TYPE_LUNCH
        NativeBloodGlucoseMealType.DINNER -> MealType.MEAL_TYPE_DINNER
        NativeBloodGlucoseMealType.SNACK -> MealType.MEAL_TYPE_SNACK
    }
}

internal fun healthConnectBloodGlucoseRelationToMeal(
    value: NativeBloodGlucoseRelationToMeal?
): Int {
    return when (value) {
        null,
        NativeBloodGlucoseRelationToMeal.UNSPECIFIED ->
            BloodGlucoseRecord.RELATION_TO_MEAL_UNKNOWN
        NativeBloodGlucoseRelationToMeal.GENERAL -> BloodGlucoseRecord.RELATION_TO_MEAL_GENERAL
        NativeBloodGlucoseRelationToMeal.FASTING -> BloodGlucoseRecord.RELATION_TO_MEAL_FASTING
        NativeBloodGlucoseRelationToMeal.BEFOREMEAL ->
            BloodGlucoseRecord.RELATION_TO_MEAL_BEFORE_MEAL
        NativeBloodGlucoseRelationToMeal.AFTERMEAL ->
            BloodGlucoseRecord.RELATION_TO_MEAL_AFTER_MEAL
    }
}

private fun nativeSpecimenSource(value: Int): NativeBloodGlucoseSpecimenSource {
    return when (value) {
        BloodGlucoseRecord.SPECIMEN_SOURCE_UNKNOWN ->
            NativeBloodGlucoseSpecimenSource.UNSPECIFIED
        BloodGlucoseRecord.SPECIMEN_SOURCE_INTERSTITIAL_FLUID ->
            NativeBloodGlucoseSpecimenSource.INTERSTITIALFLUID
        BloodGlucoseRecord.SPECIMEN_SOURCE_CAPILLARY_BLOOD ->
            NativeBloodGlucoseSpecimenSource.CAPILLARYBLOOD
        BloodGlucoseRecord.SPECIMEN_SOURCE_PLASMA -> NativeBloodGlucoseSpecimenSource.PLASMA
        BloodGlucoseRecord.SPECIMEN_SOURCE_SERUM -> NativeBloodGlucoseSpecimenSource.SERUM
        BloodGlucoseRecord.SPECIMEN_SOURCE_TEARS -> NativeBloodGlucoseSpecimenSource.TEARS
        BloodGlucoseRecord.SPECIMEN_SOURCE_WHOLE_BLOOD ->
            NativeBloodGlucoseSpecimenSource.WHOLEBLOOD
        else -> throw IllegalStateException(
            "Health Connect returned unsupported blood glucose specimen source: $value"
        )
    }
}

private fun nativeMealType(value: Int): NativeBloodGlucoseMealType {
    return when (value) {
        MealType.MEAL_TYPE_UNKNOWN -> NativeBloodGlucoseMealType.UNSPECIFIED
        MealType.MEAL_TYPE_BREAKFAST -> NativeBloodGlucoseMealType.BREAKFAST
        MealType.MEAL_TYPE_LUNCH -> NativeBloodGlucoseMealType.LUNCH
        MealType.MEAL_TYPE_DINNER -> NativeBloodGlucoseMealType.DINNER
        MealType.MEAL_TYPE_SNACK -> NativeBloodGlucoseMealType.SNACK
        else -> throw IllegalStateException(
            "Health Connect returned unsupported blood glucose meal type: $value"
        )
    }
}

private fun nativeRelationToMeal(value: Int): NativeBloodGlucoseRelationToMeal {
    return when (value) {
        BloodGlucoseRecord.RELATION_TO_MEAL_UNKNOWN ->
            NativeBloodGlucoseRelationToMeal.UNSPECIFIED
        BloodGlucoseRecord.RELATION_TO_MEAL_GENERAL -> NativeBloodGlucoseRelationToMeal.GENERAL
        BloodGlucoseRecord.RELATION_TO_MEAL_FASTING -> NativeBloodGlucoseRelationToMeal.FASTING
        BloodGlucoseRecord.RELATION_TO_MEAL_BEFORE_MEAL ->
            NativeBloodGlucoseRelationToMeal.BEFOREMEAL
        BloodGlucoseRecord.RELATION_TO_MEAL_AFTER_MEAL ->
            NativeBloodGlucoseRelationToMeal.AFTERMEAL
        else -> throw IllegalStateException(
            "Health Connect returned unsupported blood glucose meal relation: $value"
        )
    }
}

internal fun makeNativeBloodGlucoseSample(record: BloodGlucoseRecord): NativeBloodGlucoseSample {
    return NativeBloodGlucoseSample(
        identity = makeRecordIdentity(record.metadata.id),
        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
        recordingMethod = nativeHealthRecordingMethod(record.metadata.recordingMethod),
        timeMs = record.time.toEpochMilli().toDouble(),
        millimolesPerLiter = record.level.inMillimolesPerLiter,
        androidSpecimenSource = nativeSpecimenSource(record.specimenSource),
        androidMealType = nativeMealType(record.mealType),
        androidRelationToMeal = nativeRelationToMeal(record.relationToMeal),
        iosMealTime = null
    )
}
