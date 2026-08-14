//
//  HybridNitroHealth+Workouts.swift
//  Pods
//
//  Workout session reads and writes (HKWorkout). This file is HealthKit-only, so it must NOT be
//  added to Package.swift's pure-Foundation SPM test target; the podspec globs
//  ios/**/*.swift and picks it up automatically. Kept separate from
//  HybridNitroHealth.swift to stay under that file's line budget.
//

import HealthKit
import NitroModules

extension HybridNitroHealth {
    func readWorkouts(query: NativeHealthDateRangeQuery) throws -> Promise<NativeWorkoutSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let workoutType = HKObjectType.workoutType()

        return Promise<NativeWorkoutSamplePage>.async {
            let page = try await self.queryPagedSamples(
                sampleType: workoutType,
                dataType: "workout",
                query: query,
                authorizationLabel: "workouts"
            ) { sample -> NativeWorkoutSample? in
                guard let workout = sample as? HKWorkout else {
                    return nil
                }

                return workout.nativeWorkoutSample
            }

            return NativeWorkoutSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    func saveWorkout(workout: NativeWorkoutSampleInput) throws -> Promise<NativeHealthWriteResult> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeHealthWriteResult>.async {
            let workoutType = HKObjectType.workoutType()
            try self.requireWriteAuthorization(for: workoutType, label: "workouts")
            let input = try makeWorkoutBuilderInput(workout: workout)
            let builder = HKWorkoutBuilder(
                healthStore: healthStore,
                configuration: input.configuration,
                device: nil
            )

            do {
                try await builder.beginCollection(at: input.startDate)
                try await builder.addMetadata(input.metadata)
                try await builder.endCollection(at: input.endDate)
            } catch {
                builder.discardWorkout()
                throw error
            }

            let finishedWorkout = try await builder.finishWorkout()
            let storedRecordingMethods: [NativeHealthRecordingMethod]
            if let finishedWorkout {
                storedRecordingMethods = await self.storedRecordingMethods(for: [finishedWorkout])
            } else {
                storedRecordingMethods = [makeNativeHealthRecordingMethod(metadata: input.metadata)]
            }
            return NativeHealthWriteResult(storedRecordingMethods: storedRecordingMethods)
        }
    }
}
