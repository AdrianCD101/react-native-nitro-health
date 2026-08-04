package com.nitrohealth

import androidx.health.connect.client.records.ExerciseSessionRecord
import org.junit.Assert.assertEquals
import org.junit.Test

class WorkoutActivityTypeMappingTest {
    private val writableActivityTypes = listOf(
        "americanFootball", "australianFootball", "badminton", "baseball", "basketball",
        "boxing", "climbing", "cricket", "crossTraining", "cycling", "dance", "discSports",
        "elliptical", "fencing", "flexibility", "golf", "gymnastics", "handball",
        "highIntensityIntervalTraining", "hiking", "hockey", "martialArts", "mindAndBody",
        "other", "paddleSports", "pilates", "racquetball", "rowing", "rugby", "running",
        "sailing", "skating", "skiing", "snowboarding", "snowSports", "soccer", "softball",
        "squash", "stairClimbing", "strengthTraining", "surfing", "swimming", "tableTennis",
        "tennis", "volleyball", "walking", "waterPolo", "wheelchair", "yoga"
    )

    // Every ExerciseSessionRecord exercise type value and its normalized mapping. Int literals
    // are legacy values that connect-client 1.1.0 no longer exposes as constants (see
    // WorkoutActivityTypeMapping.kt).
    private val expectedMappings = mapOf(
        ExerciseSessionRecord.EXERCISE_TYPE_OTHER_WORKOUT to "other",
        1 to "coreTraining", // EXERCISE_TYPE_BACK_EXTENSION
        ExerciseSessionRecord.EXERCISE_TYPE_BADMINTON to "badminton",
        3 to "strengthTraining", // EXERCISE_TYPE_BARBELL_SHOULDER_PRESS
        ExerciseSessionRecord.EXERCISE_TYPE_BASEBALL to "baseball",
        ExerciseSessionRecord.EXERCISE_TYPE_BASKETBALL to "basketball",
        6 to "strengthTraining", // EXERCISE_TYPE_BENCH_PRESS
        7 to "coreTraining", // EXERCISE_TYPE_BENCH_SIT_UP
        ExerciseSessionRecord.EXERCISE_TYPE_BIKING to "cycling",
        ExerciseSessionRecord.EXERCISE_TYPE_BIKING_STATIONARY to "cycling",
        ExerciseSessionRecord.EXERCISE_TYPE_BOOT_CAMP to "crossTraining",
        ExerciseSessionRecord.EXERCISE_TYPE_BOXING to "boxing",
        12 to "calisthenics", // EXERCISE_TYPE_BURPEE
        ExerciseSessionRecord.EXERCISE_TYPE_CALISTHENICS to "calisthenics",
        ExerciseSessionRecord.EXERCISE_TYPE_CRICKET to "cricket",
        15 to "coreTraining", // EXERCISE_TYPE_CRUNCH
        ExerciseSessionRecord.EXERCISE_TYPE_DANCING to "dance",
        17 to "strengthTraining", // EXERCISE_TYPE_DEADLIFT
        18 to "strengthTraining", // EXERCISE_TYPE_DUMBBELL_CURL_LEFT_ARM
        19 to "strengthTraining", // EXERCISE_TYPE_DUMBBELL_CURL_RIGHT_ARM
        20 to "strengthTraining", // EXERCISE_TYPE_DUMBBELL_FRONT_RAISE
        21 to "strengthTraining", // EXERCISE_TYPE_DUMBBELL_LATERAL_RAISE
        22 to "strengthTraining", // EXERCISE_TYPE_DUMBBELL_TRICEPS_EXTENSION_LEFT_ARM
        23 to "strengthTraining", // EXERCISE_TYPE_DUMBBELL_TRICEPS_EXTENSION_RIGHT_ARM
        24 to "strengthTraining", // EXERCISE_TYPE_DUMBBELL_TRICEPS_EXTENSION_TWO_ARM
        ExerciseSessionRecord.EXERCISE_TYPE_ELLIPTICAL to "elliptical",
        ExerciseSessionRecord.EXERCISE_TYPE_EXERCISE_CLASS to "other",
        ExerciseSessionRecord.EXERCISE_TYPE_FENCING to "fencing",
        ExerciseSessionRecord.EXERCISE_TYPE_FOOTBALL_AMERICAN to "americanFootball",
        ExerciseSessionRecord.EXERCISE_TYPE_FOOTBALL_AUSTRALIAN to "australianFootball",
        30 to "coreTraining", // EXERCISE_TYPE_FORWARD_TWIST
        ExerciseSessionRecord.EXERCISE_TYPE_FRISBEE_DISC to "discSports",
        ExerciseSessionRecord.EXERCISE_TYPE_GOLF to "golf",
        ExerciseSessionRecord.EXERCISE_TYPE_GUIDED_BREATHING to "mindAndBody",
        ExerciseSessionRecord.EXERCISE_TYPE_GYMNASTICS to "gymnastics",
        ExerciseSessionRecord.EXERCISE_TYPE_HANDBALL to "handball",
        ExerciseSessionRecord.EXERCISE_TYPE_HIGH_INTENSITY_INTERVAL_TRAINING to
            "highIntensityIntervalTraining",
        ExerciseSessionRecord.EXERCISE_TYPE_HIKING to "hiking",
        ExerciseSessionRecord.EXERCISE_TYPE_ICE_HOCKEY to "hockey",
        ExerciseSessionRecord.EXERCISE_TYPE_ICE_SKATING to "skating",
        40 to "calisthenics", // EXERCISE_TYPE_JUMPING_JACK
        41 to "jumpRope", // EXERCISE_TYPE_JUMP_ROPE
        42 to "strengthTraining", // EXERCISE_TYPE_LAT_PULL_DOWN
        43 to "calisthenics", // EXERCISE_TYPE_LUNGE
        ExerciseSessionRecord.EXERCISE_TYPE_MARTIAL_ARTS to "martialArts",
        ExerciseSessionRecord.EXERCISE_TYPE_PADDLING to "paddleSports",
        ExerciseSessionRecord.EXERCISE_TYPE_PARAGLIDING to "paragliding",
        ExerciseSessionRecord.EXERCISE_TYPE_PILATES to "pilates",
        49 to "coreTraining", // EXERCISE_TYPE_PLANK
        ExerciseSessionRecord.EXERCISE_TYPE_RACQUETBALL to "racquetball",
        ExerciseSessionRecord.EXERCISE_TYPE_ROCK_CLIMBING to "climbing",
        ExerciseSessionRecord.EXERCISE_TYPE_ROLLER_HOCKEY to "hockey",
        ExerciseSessionRecord.EXERCISE_TYPE_ROWING to "rowing",
        ExerciseSessionRecord.EXERCISE_TYPE_ROWING_MACHINE to "rowing",
        ExerciseSessionRecord.EXERCISE_TYPE_RUGBY to "rugby",
        ExerciseSessionRecord.EXERCISE_TYPE_RUNNING to "running",
        ExerciseSessionRecord.EXERCISE_TYPE_RUNNING_TREADMILL to "running",
        ExerciseSessionRecord.EXERCISE_TYPE_SAILING to "sailing",
        ExerciseSessionRecord.EXERCISE_TYPE_SCUBA_DIVING to "underwaterDiving",
        ExerciseSessionRecord.EXERCISE_TYPE_SKATING to "skating",
        ExerciseSessionRecord.EXERCISE_TYPE_SKIING to "skiing",
        ExerciseSessionRecord.EXERCISE_TYPE_SNOWBOARDING to "snowboarding",
        ExerciseSessionRecord.EXERCISE_TYPE_SNOWSHOEING to "snowSports",
        ExerciseSessionRecord.EXERCISE_TYPE_SOCCER to "soccer",
        ExerciseSessionRecord.EXERCISE_TYPE_SOFTBALL to "softball",
        ExerciseSessionRecord.EXERCISE_TYPE_SQUASH to "squash",
        67 to "calisthenics", // EXERCISE_TYPE_SQUAT
        ExerciseSessionRecord.EXERCISE_TYPE_STAIR_CLIMBING to "stairClimbing",
        ExerciseSessionRecord.EXERCISE_TYPE_STAIR_CLIMBING_MACHINE to "stairClimbing",
        ExerciseSessionRecord.EXERCISE_TYPE_STRENGTH_TRAINING to "strengthTraining",
        ExerciseSessionRecord.EXERCISE_TYPE_STRETCHING to "flexibility",
        ExerciseSessionRecord.EXERCISE_TYPE_SURFING to "surfing",
        ExerciseSessionRecord.EXERCISE_TYPE_SWIMMING_OPEN_WATER to "swimming",
        ExerciseSessionRecord.EXERCISE_TYPE_SWIMMING_POOL to "swimming",
        ExerciseSessionRecord.EXERCISE_TYPE_TABLE_TENNIS to "tableTennis",
        ExerciseSessionRecord.EXERCISE_TYPE_TENNIS to "tennis",
        77 to "coreTraining", // EXERCISE_TYPE_UPPER_TWIST
        ExerciseSessionRecord.EXERCISE_TYPE_VOLLEYBALL to "volleyball",
        ExerciseSessionRecord.EXERCISE_TYPE_WALKING to "walking",
        ExerciseSessionRecord.EXERCISE_TYPE_WATER_POLO to "waterPolo",
        ExerciseSessionRecord.EXERCISE_TYPE_WEIGHTLIFTING to "strengthTraining",
        ExerciseSessionRecord.EXERCISE_TYPE_WHEELCHAIR to "wheelchair",
        ExerciseSessionRecord.EXERCISE_TYPE_YOGA to "yoga",
    )

    @Test
    fun mapsEveryDefinedExerciseType() {
        for ((exerciseType, expected) in expectedMappings) {
            assertEquals(
                "exerciseType $exerciseType should map to $expected",
                expected,
                makeWorkoutActivityType(exerciseType)
            )
        }
    }

    @Test
    fun foldsSubVariantsIntoParentActivity() {
        assertEquals(
            "running",
            makeWorkoutActivityType(ExerciseSessionRecord.EXERCISE_TYPE_RUNNING_TREADMILL)
        )
        assertEquals(
            "cycling",
            makeWorkoutActivityType(ExerciseSessionRecord.EXERCISE_TYPE_BIKING_STATIONARY)
        )
        assertEquals(
            "swimming",
            makeWorkoutActivityType(ExerciseSessionRecord.EXERCISE_TYPE_SWIMMING_POOL)
        )
        assertEquals(
            "swimming",
            makeWorkoutActivityType(ExerciseSessionRecord.EXERCISE_TYPE_SWIMMING_OPEN_WATER)
        )
        assertEquals(
            "strengthTraining",
            makeWorkoutActivityType(17) // EXERCISE_TYPE_DEADLIFT (legacy)
        )
        assertEquals(
            "rowing",
            makeWorkoutActivityType(ExerciseSessionRecord.EXERCISE_TYPE_ROWING_MACHINE)
        )
    }

    @Test
    fun unknownValuesMapToOther() {
        assertEquals("other", makeWorkoutActivityType(45)) // gap in the constant range
        assertEquals("other", makeWorkoutActivityType(-1))
        assertEquals("other", makeWorkoutActivityType(9999))
    }

    @Test
    fun writableActivitiesRoundTripThroughCanonicalNativeTypes() {
        assertEquals(49, writableActivityTypes.size)
        for (activityType in writableActivityTypes) {
            assertEquals(
                activityType,
                makeWorkoutActivityType(toHealthConnectWorkoutActivityType(activityType))
            )
        }
    }

    @Test
    fun rejectsNonPortableWritableActivities() {
        for (activityType in listOf("archery", "calisthenics", "jumpRope", "underwaterDiving")) {
            org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
                toHealthConnectWorkoutActivityType(activityType)
            }
        }
    }
}
