//
//  HybridNitroHealth+Nutrition.swift
//  Pods
//
//  Nutrition reads, saves, and deletion helpers. One entry is a food HKCorrelation
//  wrapping one dietary HKQuantitySample per present nutrient, so the quantity
//  read/save helpers do not apply: reads unpack correlations (dietary samples written by
//  other apps outside a correlation are invisible by design), saves build each correlation
//  atomically, and write authorization is the worst-of across every member quantity type.
//  This file is HealthKit-only, so it must NOT be added to Package.swift's pure-Foundation
//  SPM test target; the podspec globs ios/**/*.swift and picks it up automatically.
//

import Foundation
import HealthKit
import NitroModules

extension HybridNitroHealth {
    func readNutrition(query: NativeHealthDateRangeQuery) throws -> Promise<NativeNutritionSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let correlationType = try makeNutritionCorrelationType()

        return Promise<NativeNutritionSamplePage>.async {
            let page = try await self.queryPagedSamples(
                sampleType: correlationType,
                dataType: "nutrition",
                query: query,
                authorizationLabel: "nutrition"
            ) { sample -> NativeNutritionSample? in
                guard let correlation = sample as? HKCorrelation else {
                    return nil
                }

                return try correlation.nativeNutritionSample()
            }

            return NativeNutritionSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    func saveNutrition(samples: [NativeNutritionSampleInput]) throws -> Promise<NativeHealthWriteResult> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeHealthWriteResult>.async {
            try self.requireNutritionWriteAuthorization()

            let correlations = try makeNutritionCorrelations(
                samples: samples,
                correlationType: try makeNutritionCorrelationType()
            )
            // One save call persists each correlation together with its member samples, so
            // an entry can never be stored half-written.
            try await self.saveHealthKitSamples(correlations)
            // A versioned re-save that DROPS a nutrient has no new member to replace the old
            // one, so the stale member must be removed explicitly or it lingers as a loose
            // dietary sample visible to other HealthKit consumers.
            try await self.removeStaleNutritionMembers(samples: samples)
            return NativeHealthWriteResult(
                storedRecordingMethods: await self.storedRecordingMethods(for: correlations)
            )
        }
    }

    // For every synced input, each nutrient ABSENT from the input may have a member sample
    // left over from an earlier version of the same logical record (sync id + member
    // suffix). Only members with a strictly lower stored sync version are removed: when the
    // incoming save was ignored because a newer version is already stored, the stored
    // members carry a version >= the incoming one and are preserved, matching HealthKit's
    // own replacement semantics.
    private func removeStaleNutritionMembers(samples: [NativeNutritionSampleInput]) async throws {
        for descriptor in NutritionNutrients.all {
            var incomingVersionBySyncId = [String: Int64]()
            for sample in samples {
                guard let sync = sample.writeMetadata.sync,
                      sample[keyPath: descriptor.inputValue] == nil else {
                    continue
                }
                let memberSyncId = "\(sync.id)\(descriptor.syncIdentifierSuffix)"
                incomingVersionBySyncId[memberSyncId] = Int64(sync.version)
            }
            guard !incomingVersionBySyncId.isEmpty else {
                continue
            }

            let quantityType = try makeNutritionQuantityType(descriptor)
            let candidates = try await queryHealthKitSamples(
                sampleType: quantityType,
                limit: HKObjectQueryNoLimit,
                predicate: HKQuery.predicateForObjects(
                    withMetadataKey: HKMetadataKeySyncIdentifier,
                    allowedValues: Array(incomingVersionBySyncId.keys)
                ),
                sortDescriptors: []
            )
            let staleUuids = candidates.compactMap { candidate -> UUID? in
                guard
                    let syncId = candidate.metadata?[HKMetadataKeySyncIdentifier] as? String,
                    let incomingVersion = incomingVersionBySyncId[syncId],
                    let storedVersion = candidate.metadata?[HKMetadataKeySyncVersion] as? NSNumber,
                    storedVersion.int64Value < incomingVersion
                else {
                    return nil
                }
                return candidate.uuid
            }

            if !staleUuids.isEmpty {
                _ = try await deleteHealthKitObjects(
                    of: quantityType,
                    predicate: HKQuery.predicateForObjects(with: Set(staleUuids))
                )
            }
        }
    }

    // Correlation types have no meaningful authorizationStatus; writes (and deletes, which
    // are write-gated) require sharing authorization on every member quantity type.
    func requireNutritionWriteAuthorization() throws {
        for quantityType in try makeNutritionQuantityTypes() {
            try requireWriteAuthorization(for: quantityType, label: "nutrition")
        }
    }

    // Deleting an HKCorrelation does not delete its member samples, so member UUIDs are
    // collected from the matched correlations first and removed alongside; otherwise
    // orphaned dietary samples would stay visible to other HealthKit consumers. Members
    // are deleted strictly by UUID (never by time predicate) so own-app dietary data
    // outside these correlations — hydration's dietary water, for example — is untouched.
    // The returned count reports correlation deletions only, matching requestedCount
    // semantics.
    func deleteNutritionRecords(uuids: [UUID]) async throws -> Int {
        return try await deleteNutritionRecords(
            correlationPredicate: HKQuery.predicateForObjects(with: Set(uuids))
        )
    }

    func deleteNutritionRecords(timeRangePredicate: NSPredicate) async throws -> Int {
        return try await deleteNutritionRecords(correlationPredicate: timeRangePredicate)
    }

    private func deleteNutritionRecords(correlationPredicate: NSPredicate) async throws -> Int {
        let correlationType = try makeNutritionCorrelationType()

        let correlations = try await queryHealthKitSamples(
            sampleType: correlationType,
            limit: HKObjectQueryNoLimit,
            predicate: correlationPredicate,
            sortDescriptors: []
        ).compactMap { $0 as? HKCorrelation }
        let memberUuids = Set(correlations.flatMap { correlation in correlation.objects.map { $0.uuid } })

        let deletedCount = try await deleteHealthKitObjects(
            of: correlationType,
            predicate: correlationPredicate
        )

        if !memberUuids.isEmpty {
            let memberPredicate = HKQuery.predicateForObjects(with: memberUuids)
            for quantityType in try makeNutritionQuantityTypes() {
                _ = try await deleteHealthKitObjects(of: quantityType, predicate: memberPredicate)
            }
        }

        return deletedCount
    }
}
