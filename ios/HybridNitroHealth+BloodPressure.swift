//
//  HybridNitroHealth+BloodPressure.swift
//  Pods
//
//  Blood pressure reads, saves, and deletion helpers. Unlike the quantity types, one
//  reading is an HKCorrelation of a systolic and a diastolic HKQuantitySample, so the
//  quantity read/save helpers do not apply: reads unpack the correlation's members, saves
//  build the correlation atomically, and write authorization is the worst-of across both
//  member quantity types. This file is HealthKit-only, so it must NOT be added to
//  Package.swift's pure-Foundation SPM test target; the podspec globs ios/**/*.swift and
//  picks it up automatically.
//

import Foundation
import HealthKit
import NitroModules

extension HybridNitroHealth {
    func readBloodPressure(query: NativeHealthDateRangeQuery) throws -> Promise<NativeBloodPressureSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let correlationType = try makeBloodPressureCorrelationType()
        let quantityTypes = try makeBloodPressureQuantityTypes()

        return Promise<NativeBloodPressureSamplePage>.async {
            let page = try await self.queryPagedSamples(
                sampleType: correlationType,
                dataType: "bloodPressure",
                query: query,
                authorizationLabel: "blood pressure"
            ) { sample -> NativeBloodPressureSample? in
                guard let correlation = sample as? HKCorrelation else {
                    return nil
                }

                return try correlation.nativeBloodPressureSample(
                    systolicType: quantityTypes.systolic,
                    diastolicType: quantityTypes.diastolic
                )
            }

            return NativeBloodPressureSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    func saveBloodPressure(samples: [NativeBloodPressureSampleInput]) throws -> Promise<Void> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<Void>.async {
            try self.requireBloodPressureWriteAuthorization()

            let correlations = try makeBloodPressureCorrelations(
                samples: samples,
                correlationType: try makeBloodPressureCorrelationType(),
                quantityTypes: try makeBloodPressureQuantityTypes()
            )
            // One save call persists each correlation together with its member samples, so
            // a reading can never be stored half-written.
            try await self.saveHealthKitSamples(correlations)
        }
    }

    // Correlation types have no meaningful authorizationStatus; writes (and deletes, which
    // are write-gated) require sharing authorization on both member quantity types.
    func requireBloodPressureWriteAuthorization() throws {
        let quantityTypes = try makeBloodPressureQuantityTypes()
        try requireWriteAuthorization(for: quantityTypes.systolic, label: "blood pressure")
        try requireWriteAuthorization(for: quantityTypes.diastolic, label: "blood pressure")
    }

    // Deleting an HKCorrelation does not delete its member samples, so the members are
    // collected first and removed alongside the correlation; otherwise orphaned systolic/
    // diastolic samples would stay visible to other HealthKit consumers. The returned count
    // reports correlation deletions only, matching requestedCount semantics.
    func deleteBloodPressureRecords(uuids: [UUID]) async throws -> Int {
        let correlationType = try makeBloodPressureCorrelationType()
        let quantityTypes = try makeBloodPressureQuantityTypes()
        let correlationPredicate = HKQuery.predicateForObjects(with: Set(uuids))

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
            _ = try await deleteHealthKitObjects(of: quantityTypes.systolic, predicate: memberPredicate)
            _ = try await deleteHealthKitObjects(of: quantityTypes.diastolic, predicate: memberPredicate)
        }

        return deletedCount
    }

    // Member samples share their correlation's instant and this library never writes
    // standalone systolic/diastolic samples, so the same own-app time predicate removes
    // exactly the members belonging to the deleted correlations.
    func deleteBloodPressureRecords(timeRangePredicate: NSPredicate) async throws -> Int {
        let correlationType = try makeBloodPressureCorrelationType()
        let quantityTypes = try makeBloodPressureQuantityTypes()

        let deletedCount = try await deleteHealthKitObjects(
            of: correlationType,
            predicate: timeRangePredicate
        )
        _ = try await deleteHealthKitObjects(of: quantityTypes.systolic, predicate: timeRangePredicate)
        _ = try await deleteHealthKitObjects(of: quantityTypes.diastolic, predicate: timeRangePredicate)

        return deletedCount
    }
}
