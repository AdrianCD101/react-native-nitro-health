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
        let authorizationTypes = try makeReadAuthorizationObjectTypes(dataType: dataType)
        let label = makeHealthDataTypeLabel(dataType: dataType)

        return Promise<String>.async {
            try await self.requireDeterminedReadAuthorization(for: authorizationTypes, label: label)

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
        let authorizationTypes = try makeReadAuthorizationObjectTypes(dataType: dataType)
        let label = makeHealthDataTypeLabel(dataType: dataType)
        let anchor = try decodeChangesAnchor(changesToken, dataType: dataType)

        return Promise<NativeHealthChangesResult>.async {
            try await self.requireDeterminedReadAuthorization(for: authorizationTypes, label: label)

            let page = try await self.queryHealthKitChanges(
                sampleType: sampleType,
                anchor: anchor
            )
            var changes = try page.samples.map {
                try self.makeUpsertChange(sample: $0, dataType: dataType)
            }
            changes.append(contentsOf: page.deletedObjects.map {
                self.makeNativeHealthChange(type: "delete", recordId: $0.uuid.uuidString)
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

        switch dataType {
        case "steps":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                stepSamples: [quantitySample.nativeStepSample]
            )
        case "heartRate":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                heartRateSamples: [quantitySample.nativeHeartRateSample]
            )
        case "bloodPressure":
            guard let correlation = sample as? HKCorrelation else {
                throw unexpectedChangesSampleError(
                    sample: sample,
                    dataType: dataType,
                    expectedType: "HKCorrelation"
                )
            }

            let quantityTypes = try makeBloodPressureQuantityTypes()
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                bloodPressureSamples: [try correlation.nativeBloodPressureSample(
                    systolicType: quantityTypes.systolic,
                    diastolicType: quantityTypes.diastolic
                )]
            )
        case "bloodGlucose":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                bloodGlucoseSamples: [try quantitySample.nativeBloodGlucoseSample()]
            )
        case "bodyTemperature":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                bodyTemperatureSamples: [try quantitySample.nativeBodyTemperatureSample()]
            )
        case "respiratoryRate":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                respiratoryRateSamples: [quantitySample.nativeRespiratoryRateSample]
            )
        case "bodyFat":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                bodyFatSamples: [quantitySample.nativeBodyFatSample]
            )
        case "leanBodyMass":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                leanBodyMassSamples: [quantitySample.nativeLeanBodyMassSample]
            )
        case "basalBodyTemperature":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                basalBodyTemperatureSamples: [try quantitySample.nativeBasalBodyTemperatureSample()]
            )
        case "restingHeartRate":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                restingHeartRateSamples: [quantitySample.nativeRestingHeartRateSample]
            )
        case "heartRateVariability":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                heartRateVariabilitySamples: [quantitySample.nativeHeartRateVariabilitySample]
            )
        case "distance":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                distanceSamples: [quantitySample.nativeDistanceSample]
            )
        case "activeEnergyBurned":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                activeEnergyBurnedSamples: [quantitySample.nativeActiveEnergyBurnedSample]
            )
        case "hydration":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                hydrationSamples: [quantitySample.nativeHydrationSample]
            )
        case "floorsClimbed":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                floorsClimbedSamples: [quantitySample.nativeFloorsClimbedSample]
            )
        case "oxygenSaturation":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                oxygenSaturationSamples: [quantitySample.nativeOxygenSaturationSample]
            )
        case "height":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                heightSamples: [quantitySample.nativeHeightSample]
            )
        case "vo2Max":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                vo2MaxSamples: [try quantitySample.nativeVo2MaxSample()]
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
                recordId: uuid,
                sleepSamples: [categorySample.nativeSleepSample]
            )
        case "bodyMass":
            let quantitySample = try requireQuantitySample(sample, dataType: dataType)
            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                bodyMassSamples: [quantitySample.nativeBodyMassSample]
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
                recordId: uuid,
                workoutSamples: [workout.nativeWorkoutSample]
            )
        case "nutrition":
            guard let correlation = sample as? HKCorrelation else {
                throw unexpectedChangesSampleError(
                    sample: sample,
                    dataType: dataType,
                    expectedType: "HKCorrelation"
                )
            }

            return makeNativeHealthChange(
                type: "upsert",
                recordId: uuid,
                nutritionSamples: [try correlation.nativeNutritionSample()]
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
        recordId: String,
        stepSamples: [NativeStepSample]? = nil,
        heartRateSamples: [NativeHeartRateSample]? = nil,
        bloodPressureSamples: [NativeBloodPressureSample]? = nil,
        bloodGlucoseSamples: [NativeBloodGlucoseSample]? = nil,
        bodyTemperatureSamples: [NativeBodyTemperatureSample]? = nil,
        respiratoryRateSamples: [NativeRespiratoryRateSample]? = nil,
        bodyFatSamples: [NativeBodyFatSample]? = nil,
        leanBodyMassSamples: [NativeLeanBodyMassSample]? = nil,
        basalBodyTemperatureSamples: [NativeBasalBodyTemperatureSample]? = nil,
        restingHeartRateSamples: [NativeRestingHeartRateSample]? = nil,
        heartRateVariabilitySamples: [NativeHeartRateVariabilitySample]? = nil,
        distanceSamples: [NativeDistanceSample]? = nil,
        activeEnergyBurnedSamples: [NativeActiveEnergyBurnedSample]? = nil,
        hydrationSamples: [NativeHydrationSample]? = nil,
        floorsClimbedSamples: [NativeFloorsClimbedSample]? = nil,
        oxygenSaturationSamples: [NativeOxygenSaturationSample]? = nil,
        heightSamples: [NativeHeightSample]? = nil,
        vo2MaxSamples: [NativeVo2MaxSample]? = nil,
        sleepSamples: [NativeSleepSample]? = nil,
        bodyMassSamples: [NativeBodyMassSample]? = nil,
        workoutSamples: [NativeWorkoutSample]? = nil,
        nutritionSamples: [NativeNutritionSample]? = nil
    ) -> NativeHealthChange {
        return NativeHealthChange(
            type: type,
            recordId: recordId,
            stepSamples: stepSamples,
            heartRateSamples: heartRateSamples,
            bloodPressureSamples: bloodPressureSamples,
            bloodGlucoseSamples: bloodGlucoseSamples,
            bodyTemperatureSamples: bodyTemperatureSamples,
            respiratoryRateSamples: respiratoryRateSamples,
            bodyFatSamples: bodyFatSamples,
            leanBodyMassSamples: leanBodyMassSamples,
            basalBodyTemperatureSamples: basalBodyTemperatureSamples,
            restingHeartRateSamples: restingHeartRateSamples,
            heartRateVariabilitySamples: heartRateVariabilitySamples,
            distanceSamples: distanceSamples,
            activeEnergyBurnedSamples: activeEnergyBurnedSamples,
            hydrationSamples: hydrationSamples,
            floorsClimbedSamples: floorsClimbedSamples,
            oxygenSaturationSamples: oxygenSaturationSamples,
            heightSamples: heightSamples,
            vo2MaxSamples: vo2MaxSamples,
            sleepSamples: sleepSamples,
            bodyMassSamples: bodyMassSamples,
            workoutSamples: workoutSamples,
            nutritionSamples: nutritionSamples,
            dummyNonEquatable: nil
        )
    }
}
