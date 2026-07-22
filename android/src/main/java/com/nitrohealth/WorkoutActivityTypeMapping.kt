package com.nitrohealth

import androidx.health.connect.client.records.ExerciseSessionRecord

/**
 * Maps [ExerciseSessionRecord] exercise type constants to the normalized cross-platform
 * activity type string (mirrors makeWorkoutActivityType in ios/WorkoutActivityTypeMapping.swift).
 *
 * The int literals cover exercise type values that connect-client 1.1.0 no longer exposes as
 * `EXERCISE_TYPE_*` constants (they survive only as segment types), but which may still appear
 * in session data written by apps against older schemas. Unknown or future values fall back
 * to "other".
 */
internal fun makeWorkoutActivityType(exerciseType: Int): String {
    return when (exerciseType) {
        ExerciseSessionRecord.EXERCISE_TYPE_OTHER_WORKOUT -> "other"
        1 -> "coreTraining" // EXERCISE_TYPE_BACK_EXTENSION (legacy)
        ExerciseSessionRecord.EXERCISE_TYPE_BADMINTON -> "badminton"
        3 -> "strengthTraining" // EXERCISE_TYPE_BARBELL_SHOULDER_PRESS (legacy)
        ExerciseSessionRecord.EXERCISE_TYPE_BASEBALL -> "baseball"
        ExerciseSessionRecord.EXERCISE_TYPE_BASKETBALL -> "basketball"
        6 -> "strengthTraining" // EXERCISE_TYPE_BENCH_PRESS (legacy)
        7 -> "coreTraining" // EXERCISE_TYPE_BENCH_SIT_UP (legacy)
        ExerciseSessionRecord.EXERCISE_TYPE_BIKING -> "cycling"
        ExerciseSessionRecord.EXERCISE_TYPE_BIKING_STATIONARY -> "cycling"
        ExerciseSessionRecord.EXERCISE_TYPE_BOOT_CAMP -> "crossTraining"
        ExerciseSessionRecord.EXERCISE_TYPE_BOXING -> "boxing"
        12 -> "calisthenics" // EXERCISE_TYPE_BURPEE (legacy)
        ExerciseSessionRecord.EXERCISE_TYPE_CALISTHENICS -> "calisthenics"
        ExerciseSessionRecord.EXERCISE_TYPE_CRICKET -> "cricket"
        15 -> "coreTraining" // EXERCISE_TYPE_CRUNCH (legacy)
        ExerciseSessionRecord.EXERCISE_TYPE_DANCING -> "dance"
        17 -> "strengthTraining" // EXERCISE_TYPE_DEADLIFT (legacy)
        18 -> "strengthTraining" // EXERCISE_TYPE_DUMBBELL_CURL_LEFT_ARM (legacy)
        19 -> "strengthTraining" // EXERCISE_TYPE_DUMBBELL_CURL_RIGHT_ARM (legacy)
        20 -> "strengthTraining" // EXERCISE_TYPE_DUMBBELL_FRONT_RAISE (legacy)
        21 -> "strengthTraining" // EXERCISE_TYPE_DUMBBELL_LATERAL_RAISE (legacy)
        22 -> "strengthTraining" // EXERCISE_TYPE_DUMBBELL_TRICEPS_EXTENSION_LEFT_ARM (legacy)
        23 -> "strengthTraining" // EXERCISE_TYPE_DUMBBELL_TRICEPS_EXTENSION_RIGHT_ARM (legacy)
        24 -> "strengthTraining" // EXERCISE_TYPE_DUMBBELL_TRICEPS_EXTENSION_TWO_ARM (legacy)
        ExerciseSessionRecord.EXERCISE_TYPE_ELLIPTICAL -> "elliptical"
        ExerciseSessionRecord.EXERCISE_TYPE_EXERCISE_CLASS -> "other"
        ExerciseSessionRecord.EXERCISE_TYPE_FENCING -> "fencing"
        ExerciseSessionRecord.EXERCISE_TYPE_FOOTBALL_AMERICAN -> "americanFootball"
        ExerciseSessionRecord.EXERCISE_TYPE_FOOTBALL_AUSTRALIAN -> "australianFootball"
        30 -> "coreTraining" // EXERCISE_TYPE_FORWARD_TWIST (legacy)
        ExerciseSessionRecord.EXERCISE_TYPE_FRISBEE_DISC -> "discSports"
        ExerciseSessionRecord.EXERCISE_TYPE_GOLF -> "golf"
        ExerciseSessionRecord.EXERCISE_TYPE_GUIDED_BREATHING -> "mindAndBody"
        ExerciseSessionRecord.EXERCISE_TYPE_GYMNASTICS -> "gymnastics"
        ExerciseSessionRecord.EXERCISE_TYPE_HANDBALL -> "handball"
        ExerciseSessionRecord.EXERCISE_TYPE_HIGH_INTENSITY_INTERVAL_TRAINING ->
            "highIntensityIntervalTraining"
        ExerciseSessionRecord.EXERCISE_TYPE_HIKING -> "hiking"
        ExerciseSessionRecord.EXERCISE_TYPE_ICE_HOCKEY -> "hockey"
        ExerciseSessionRecord.EXERCISE_TYPE_ICE_SKATING -> "skating"
        40 -> "calisthenics" // EXERCISE_TYPE_JUMPING_JACK (legacy)
        41 -> "jumpRope" // EXERCISE_TYPE_JUMP_ROPE (legacy)
        42 -> "strengthTraining" // EXERCISE_TYPE_LAT_PULL_DOWN (legacy)
        43 -> "calisthenics" // EXERCISE_TYPE_LUNGE (legacy)
        ExerciseSessionRecord.EXERCISE_TYPE_MARTIAL_ARTS -> "martialArts"
        ExerciseSessionRecord.EXERCISE_TYPE_PADDLING -> "paddleSports"
        ExerciseSessionRecord.EXERCISE_TYPE_PARAGLIDING -> "paragliding"
        ExerciseSessionRecord.EXERCISE_TYPE_PILATES -> "pilates"
        49 -> "coreTraining" // EXERCISE_TYPE_PLANK (legacy)
        ExerciseSessionRecord.EXERCISE_TYPE_RACQUETBALL -> "racquetball"
        ExerciseSessionRecord.EXERCISE_TYPE_ROCK_CLIMBING -> "climbing"
        ExerciseSessionRecord.EXERCISE_TYPE_ROLLER_HOCKEY -> "hockey"
        ExerciseSessionRecord.EXERCISE_TYPE_ROWING -> "rowing"
        ExerciseSessionRecord.EXERCISE_TYPE_ROWING_MACHINE -> "rowing"
        ExerciseSessionRecord.EXERCISE_TYPE_RUGBY -> "rugby"
        ExerciseSessionRecord.EXERCISE_TYPE_RUNNING -> "running"
        ExerciseSessionRecord.EXERCISE_TYPE_RUNNING_TREADMILL -> "running"
        ExerciseSessionRecord.EXERCISE_TYPE_SAILING -> "sailing"
        ExerciseSessionRecord.EXERCISE_TYPE_SCUBA_DIVING -> "underwaterDiving"
        ExerciseSessionRecord.EXERCISE_TYPE_SKATING -> "skating"
        ExerciseSessionRecord.EXERCISE_TYPE_SKIING -> "skiing"
        ExerciseSessionRecord.EXERCISE_TYPE_SNOWBOARDING -> "snowboarding"
        ExerciseSessionRecord.EXERCISE_TYPE_SNOWSHOEING -> "snowSports"
        ExerciseSessionRecord.EXERCISE_TYPE_SOCCER -> "soccer"
        ExerciseSessionRecord.EXERCISE_TYPE_SOFTBALL -> "softball"
        ExerciseSessionRecord.EXERCISE_TYPE_SQUASH -> "squash"
        67 -> "calisthenics" // EXERCISE_TYPE_SQUAT (legacy)
        ExerciseSessionRecord.EXERCISE_TYPE_STAIR_CLIMBING -> "stairClimbing"
        ExerciseSessionRecord.EXERCISE_TYPE_STAIR_CLIMBING_MACHINE -> "stairClimbing"
        ExerciseSessionRecord.EXERCISE_TYPE_STRENGTH_TRAINING -> "strengthTraining"
        ExerciseSessionRecord.EXERCISE_TYPE_STRETCHING -> "flexibility"
        ExerciseSessionRecord.EXERCISE_TYPE_SURFING -> "surfing"
        ExerciseSessionRecord.EXERCISE_TYPE_SWIMMING_OPEN_WATER -> "swimming"
        ExerciseSessionRecord.EXERCISE_TYPE_SWIMMING_POOL -> "swimming"
        ExerciseSessionRecord.EXERCISE_TYPE_TABLE_TENNIS -> "tableTennis"
        ExerciseSessionRecord.EXERCISE_TYPE_TENNIS -> "tennis"
        77 -> "coreTraining" // EXERCISE_TYPE_UPPER_TWIST (legacy)
        ExerciseSessionRecord.EXERCISE_TYPE_VOLLEYBALL -> "volleyball"
        ExerciseSessionRecord.EXERCISE_TYPE_WALKING -> "walking"
        ExerciseSessionRecord.EXERCISE_TYPE_WATER_POLO -> "waterPolo"
        ExerciseSessionRecord.EXERCISE_TYPE_WEIGHTLIFTING -> "strengthTraining"
        ExerciseSessionRecord.EXERCISE_TYPE_WHEELCHAIR -> "wheelchair"
        ExerciseSessionRecord.EXERCISE_TYPE_YOGA -> "yoga"
        else -> "other"
    }
}
