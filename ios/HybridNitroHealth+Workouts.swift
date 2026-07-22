//
//  HybridNitroHealth+Workouts.swift
//  Pods
//
//  Workout session reads (HKWorkout). This file is HealthKit-only, so it must NOT be
//  added to Package.swift's pure-Foundation SPM test target; the podspec globs
//  ios/**/*.swift and picks it up automatically. Kept separate from
//  HybridNitroHealth.swift to stay under that file's line budget.
//

import Foundation
import HealthKit
import NitroModules

// HKWorkout's totalDistance/totalEnergyBurned are deprecated as of iOS 18 in favor of
// workout.statistics(for:), but the replacement needs an activity-to-distance-type table
// (distanceWalkingRunning vs distanceCycling vs ...) and Apple still populates the legacy
// accessors. Matching the deprecation on these wrappers silences the warning at the call
// site; migrating to statistics(for:) is a tracked follow-up.
private extension HKWorkout {
    @available(iOS, deprecated: 18.0, message: "Wraps the deprecated totalDistance accessor")
    var legacyTotalDistanceMeters: Double? {
        totalDistance?.doubleValue(for: .meter())
    }

    @available(iOS, deprecated: 18.0, message: "Wraps the deprecated totalEnergyBurned accessor")
    var legacyTotalEnergyBurnedKcal: Double? {
        totalEnergyBurned?.doubleValue(for: .kilocalorie())
    }
}

extension HybridNitroHealth {
    func readWorkouts(query: NativeHealthDateRangeQuery) throws -> Promise<[NativeWorkoutSample]> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let workoutType = HKObjectType.workoutType()
        let startDate = Date(timeIntervalSince1970: query.startTimeMs / 1000)
        let endDate = Date(timeIntervalSince1970: query.endTimeMs / 1000)
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])
        let sortDescriptors = [
            NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: query.ascending),
        ]

        return Promise<[NativeWorkoutSample]>.async {
            try await self.requireDeterminedReadAuthorization(for: workoutType, label: "workouts")
            let samples = try await self.queryHealthKitSamples(
                sampleType: workoutType,
                limit: Int(query.limit),
                predicate: predicate,
                sortDescriptors: sortDescriptors
            )

            return samples.compactMap { sample in
                guard let workout = sample as? HKWorkout else {
                    return nil
                }

                return NativeWorkoutSample(
                    startTimeMs: workout.startDate.timeIntervalSince1970 * 1000,
                    endTimeMs: workout.endDate.timeIntervalSince1970 * 1000,
                    durationSeconds: workout.duration,
                    activityType: makeWorkoutActivityType(
                        rawValue: workout.workoutActivityType.rawValue
                    ),
                    title: workout.metadata?[HKMetadataKeyWorkoutBrandName] as? String,
                    source: workout.sourceRevision.source.name,
                    totalDistanceMeters: workout.legacyTotalDistanceMeters,
                    totalEnergyBurnedKcal: workout.legacyTotalEnergyBurnedKcal
                )
            }
        }
    }
}
