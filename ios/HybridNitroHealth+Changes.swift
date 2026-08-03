//
//  HybridNitroHealth+Changes.swift
//  Pods
//
//  HealthKit anchored change tracking and native change mapping. The pure token
//  envelope lives in HealthChangesToken.swift; this file owns secure
//  HKQueryAnchor archiving and must not be added to the SwiftPM helper target.
//

import Foundation
import HealthKit
import NitroModules

private let healthChangesPageLimit = 1000

extension HybridNitroHealth {
    func createChangesToken(dataType: String) throws -> Promise<String> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let sampleType = try makeHealthKitSampleType(dataType: dataType)
        let label = makeHealthDataTypeLabel(dataType: dataType)

        return Promise<String>.async {
            try await self.requireDeterminedReadAuthorization(for: sampleType, label: label)

            var anchor: HKQueryAnchor?
            while true {
                let page = try await self.queryHealthKitChanges(
                    sampleType: sampleType,
                    anchor: anchor
                )
                anchor = page.anchor

                if page.samples.isEmpty, page.deletedObjects.isEmpty {
                    return try self.encodeChangesAnchor(page.anchor, dataType: dataType)
                }
            }
        }
    }

    func getChanges(dataType: String, changesToken: String) throws -> Promise<NativeHealthChangesResult> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let sampleType = try makeHealthKitSampleType(dataType: dataType)
        let label = makeHealthDataTypeLabel(dataType: dataType)

        return Promise<NativeHealthChangesResult>.async {
            try await self.requireDeterminedReadAuthorization(for: sampleType, label: label)

            let anchor = try self.decodeChangesAnchor(changesToken, dataType: dataType)
            let page = try await self.queryHealthKitChanges(
                sampleType: sampleType,
                anchor: anchor
            )
            var changes = try page.samples.map {
                try self.makeUpsertChange(sample: $0, dataType: dataType)
            }
            changes.append(contentsOf: page.deletedObjects.map {
                self.makeNativeHealthChange(type: "delete", recordUuid: $0.uuid.uuidString)
            })

            let hasMore = !page.samples.isEmpty || !page.deletedObjects.isEmpty
            return NativeHealthChangesResult(
                changes: changes,
                nextChangesToken: try self.encodeChangesAnchor(page.anchor, dataType: dataType),
                hasMore: hasMore,
                tokenExpired: false
            )
        }
    }

    private func queryHealthKitChanges(
        sampleType: HKSampleType,
        anchor: HKQueryAnchor?
    ) async throws -> (samples: [HKSample], deletedObjects: [HKDeletedObject], anchor: HKQueryAnchor) {
        return try await withCheckedThrowingContinuation { continuation in
            let query = HKAnchoredObjectQuery(
                type: sampleType,
                predicate: nil,
                anchor: anchor,
                limit: healthChangesPageLimit
            ) { _, samples, deletedObjects, nextAnchor, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                guard let nextAnchor = nextAnchor else {
                    continuation.resume(throwing: NSError(
                        domain: "NitroHealth",
                        code: 4,
                        userInfo: [NSLocalizedDescriptionKey: "HealthKit returned no changes anchor for \(sampleType.identifier)"]
                    ))
                    return
                }

                continuation.resume(returning: (
                    samples: samples ?? [],
                    deletedObjects: deletedObjects ?? [],
                    anchor: nextAnchor
                ))
            }

            healthStore.execute(query)
        }
    }

    private func encodeChangesAnchor(_ anchor: HKQueryAnchor, dataType: String) throws -> String {
        let payload = try NSKeyedArchiver.archivedData(
            withRootObject: anchor,
            requiringSecureCoding: true
        )
        return try encodeHealthChangesToken(dataType: dataType, anchorPayload: payload)
    }

    private func decodeChangesAnchor(_ token: String, dataType: String) throws -> HKQueryAnchor {
        let payload = try decodeHealthChangesToken(token, dataType: dataType)

        do {
            guard let anchor = try NSKeyedUnarchiver.unarchivedObject(
                ofClass: HKQueryAnchor.self,
                from: payload
            ) else {
                throw invalidChangesTokenError(
                    dataType: dataType,
                    detail: "the anchor payload did not contain an HKQueryAnchor"
                )
            }

            return anchor
        } catch let error as NSError where error.domain == "NitroHealth" && error.code == 3 {
            throw error
        } catch {
            throw invalidChangesTokenError(
                dataType: dataType,
                detail: "the anchor payload could not be securely decoded"
            )
        }
    }

    private func makeUpsertChange(sample: HKSample, dataType: String) throws -> NativeHealthChange {
        let uuid = sample.uuid.uuidString
        let startTimeMs = sample.startDate.timeIntervalSince1970 * 1000
        let endTimeMs = sample.endDate.timeIntervalSince1970 * 1000

        switch dataType {
        case "steps":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordUuid: uuid,
                stepSamples: [NativeStepSample(
                    uuid: uuid,
                    startTimeMs: startTimeMs,
                    endTimeMs: endTimeMs,
                    count: quantitySample.quantity.doubleValue(for: HKUnit.count())
                )]
            )
        case "heartRate":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordUuid: uuid,
                heartRateSamples: [NativeHeartRateSample(
                    uuid: uuid,
                    recordUuid: uuid,
                    timeMs: startTimeMs,
                    bpm: quantitySample.quantity.doubleValue(
                        for: HKUnit.count().unitDivided(by: HKUnit.minute())
                    ),
                    source: quantitySample.sourceRevision.source.name
                )]
            )
        case "restingHeartRate":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordUuid: uuid,
                restingHeartRateSamples: [NativeRestingHeartRateSample(
                    uuid: uuid,
                    timeMs: startTimeMs,
                    bpm: quantitySample.quantity.doubleValue(
                        for: HKUnit.count().unitDivided(by: HKUnit.minute())
                    ),
                    source: quantitySample.sourceRevision.source.name
                )]
            )
        case "heartRateVariability":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordUuid: uuid,
                heartRateVariabilitySamples: [NativeHeartRateVariabilitySample(
                    uuid: uuid,
                    timeMs: startTimeMs,
                    milliseconds: quantitySample.quantity.doubleValue(
                        for: HKUnit.secondUnit(with: .milli)
                    ),
                    method: "sdnn",
                    source: quantitySample.sourceRevision.source.name
                )]
            )
        case "distance":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordUuid: uuid,
                distanceSamples: [NativeDistanceSample(
                    uuid: uuid,
                    startTimeMs: startTimeMs,
                    endTimeMs: endTimeMs,
                    distanceMeters: quantitySample.quantity.doubleValue(for: HKUnit.meter())
                )]
            )
        case "activeEnergyBurned":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordUuid: uuid,
                activeEnergyBurnedSamples: [NativeActiveEnergyBurnedSample(
                    uuid: uuid,
                    startTimeMs: startTimeMs,
                    endTimeMs: endTimeMs,
                    kilocalories: quantitySample.quantity.doubleValue(for: HKUnit.kilocalorie())
                )]
            )
        case "oxygenSaturation":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordUuid: uuid,
                oxygenSaturationSamples: [NativeOxygenSaturationSample(
                    uuid: uuid,
                    timeMs: startTimeMs,
                    percentage: quantitySample.quantity.doubleValue(for: HKUnit.percent()) * 100,
                    source: quantitySample.sourceRevision.source.name
                )]
            )
        case "height":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordUuid: uuid,
                heightSamples: [NativeHeightSample(
                    uuid: uuid,
                    timeMs: startTimeMs,
                    meters: quantitySample.quantity.doubleValue(for: HKUnit.meter()),
                    source: quantitySample.sourceRevision.source.name
                )]
            )
        case "sleep":
            guard let categorySample = sample as? HKCategorySample else {
                throw unexpectedChangesSampleError(
                    sample: sample,
                    dataType: dataType,
                    expectedType: "HKCategorySample"
                )
            }

            return makeNativeHealthChange(
                type: "upsert",
                recordUuid: uuid,
                sleepSamples: [NativeSleepSample(
                    uuid: uuid,
                    recordUuid: uuid,
                    startTimeMs: startTimeMs,
                    endTimeMs: endTimeMs,
                    stage: makeSleepStage(value: categorySample.value),
                    source: categorySample.sourceRevision.source.name
                )]
            )
        case "bodyMass":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordUuid: uuid,
                bodyMassSamples: [NativeBodyMassSample(
                    uuid: uuid,
                    startTimeMs: startTimeMs,
                    endTimeMs: endTimeMs,
                    kilograms: quantitySample.quantity.doubleValue(for: HKUnit.gramUnit(with: .kilo)),
                    source: quantitySample.sourceRevision.source.name
                )]
            )
        case "workout":
            guard let workout = sample as? HKWorkout else {
                throw unexpectedChangesSampleError(
                    sample: sample,
                    dataType: dataType,
                    expectedType: "HKWorkout"
                )
            }

            return makeNativeHealthChange(
                type: "upsert",
                recordUuid: uuid,
                workoutSamples: [NativeWorkoutSample(
                    uuid: uuid,
                    startTimeMs: startTimeMs,
                    endTimeMs: endTimeMs,
                    durationSeconds: workout.duration,
                    activityType: makeWorkoutActivityType(
                        rawValue: workout.workoutActivityType.rawValue
                    ),
                    title: workout.metadata?[HKMetadataKeyWorkoutBrandName] as? String,
                    source: workout.sourceRevision.source.name,
                    totalDistanceMeters: workout.legacyTotalDistanceMeters,
                    totalEnergyBurnedKcal: workout.legacyTotalEnergyBurnedKcal
                )]
            )
        default:
            throw permissionError("Unsupported health data type: \(dataType)")
        }
    }

    private func requireQuantitySample(_ sample: HKSample, dataType: String) throws -> HKQuantitySample {
        guard let quantitySample = sample as? HKQuantitySample else {
            throw unexpectedChangesSampleError(
                sample: sample,
                dataType: dataType,
                expectedType: "HKQuantitySample"
            )
        }

        return quantitySample
    }

    private func unexpectedChangesSampleError(
        sample: HKSample,
        dataType: String,
        expectedType: String
    ) -> NSError {
        return NSError(
            domain: "NitroHealth",
            code: 4,
            userInfo: [
                NSLocalizedDescriptionKey: "Unable to map \(dataType) HealthKit change \(sample.uuid.uuidString): expected \(expectedType), received \(String(describing: type(of: sample)))",
            ]
        )
    }

    private func makeNativeHealthChange(
        type: String,
        recordUuid: String,
        stepSamples: [NativeStepSample]? = nil,
        heartRateSamples: [NativeHeartRateSample]? = nil,
        restingHeartRateSamples: [NativeRestingHeartRateSample]? = nil,
        heartRateVariabilitySamples: [NativeHeartRateVariabilitySample]? = nil,
        distanceSamples: [NativeDistanceSample]? = nil,
        activeEnergyBurnedSamples: [NativeActiveEnergyBurnedSample]? = nil,
        oxygenSaturationSamples: [NativeOxygenSaturationSample]? = nil,
        heightSamples: [NativeHeightSample]? = nil,
        sleepSamples: [NativeSleepSample]? = nil,
        bodyMassSamples: [NativeBodyMassSample]? = nil,
        workoutSamples: [NativeWorkoutSample]? = nil
    ) -> NativeHealthChange {
        return NativeHealthChange(
            type: type,
            recordUuid: recordUuid,
            stepSamples: stepSamples,
            heartRateSamples: heartRateSamples,
            restingHeartRateSamples: restingHeartRateSamples,
            heartRateVariabilitySamples: heartRateVariabilitySamples,
            distanceSamples: distanceSamples,
            activeEnergyBurnedSamples: activeEnergyBurnedSamples,
            oxygenSaturationSamples: oxygenSaturationSamples,
            heightSamples: heightSamples,
            sleepSamples: sleepSamples,
            bodyMassSamples: bodyMassSamples,
            workoutSamples: workoutSamples,
            dummyNonEquatable: nil
        )
    }
}
