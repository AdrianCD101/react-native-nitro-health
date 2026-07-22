//
//  HybridNitroHealth+QuantityReads.swift
//  Pods
//
//  Instantaneous-quantity reads/writes (restingHeartRate, heartRateVariability,
//  oxygenSaturation, height; readBodyMass in HybridNitroHealth.swift shares the read helper).
//  This file is HealthKit-only, so it must NOT be added to Package.swift's pure-Foundation SPM
//  test target; the podspec globs ios/**/*.swift and picks it up automatically. Kept separate
//  from HybridNitroHealth.swift to stay under that file's line budget.
//

import Foundation
import HealthKit
import NitroModules

extension HybridNitroHealth {
    // Shared boilerplate for instantaneous (point-in-time) quantity reads: availability check,
    // descriptor/type lookup, predicate + sort/limit, auth gate, query, then per-sample mapping.
    // Each data type only supplies its unit conversion and struct construction. readHeartRate
    // stays bespoke to remain symmetric with Android, where HeartRateRecord is a series record
    // that needs post-read flattening.
    func readInstantQuantitySamples<T>(
        dataType: String,
        query: NativeHealthDateRangeQuery,
        map: @escaping (HKQuantitySample, HKUnit) -> T
    ) throws -> Promise<[T]> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let descriptor = try makeHealthDataTypeDescriptor(dataType: dataType)
        let quantityType = try makeHealthKitQuantityType(dataType: dataType)
        let startDate = Date(timeIntervalSince1970: query.startTimeMs / 1000)
        let endDate = Date(timeIntervalSince1970: query.endTimeMs / 1000)
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])
        let sortDescriptors = [
            NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: query.ascending),
        ]
        let label = descriptor.label
        let unit = descriptor.unit

        return Promise<[T]>.async {
            try await self.requireDeterminedReadAuthorization(for: quantityType, label: label)
            let samples = try await self.queryHealthKitSamples(
                sampleType: quantityType,
                limit: Int(query.limit),
                predicate: predicate,
                sortDescriptors: sortDescriptors
            )

            return samples.compactMap { sample in
                guard let quantitySample = sample as? HKQuantitySample else {
                    return nil
                }

                return map(quantitySample, unit)
            }
        }
    }

    func readRestingHeartRate(query: NativeHealthDateRangeQuery) throws -> Promise<[NativeRestingHeartRateSample]> {
        return try readInstantQuantitySamples(dataType: "restingHeartRate", query: query) { quantitySample, unit in
            NativeRestingHeartRateSample(
                timeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                bpm: quantitySample.quantity.doubleValue(for: unit),
                source: quantitySample.sourceRevision.source.name
            )
        }
    }

    // iOS only ever reports SDNN for HRV (Android reports RMSSD); `method` lets JS distinguish
    // the two so callers never mix/chart them together.
    func readHeartRateVariability(query: NativeHealthDateRangeQuery) throws -> Promise<[NativeHeartRateVariabilitySample]> {
        return try readInstantQuantitySamples(dataType: "heartRateVariability", query: query) { quantitySample, unit in
            NativeHeartRateVariabilitySample(
                timeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                milliseconds: quantitySample.quantity.doubleValue(for: unit),
                method: "sdnn",
                source: quantitySample.sourceRevision.source.name
            )
        }
    }

    // HealthKit stores oxygen saturation as a fraction (0-1 via HKUnit.percent()); the JS
    // surface uses percentage (0-100), so convert here (inverse of the /100 in
    // makeOxygenSaturationQuantitySamples).
    func readOxygenSaturation(query: NativeHealthDateRangeQuery) throws -> Promise<[NativeOxygenSaturationSample]> {
        return try readInstantQuantitySamples(dataType: "oxygenSaturation", query: query) { quantitySample, unit in
            NativeOxygenSaturationSample(
                timeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                percentage: quantitySample.quantity.doubleValue(for: unit) * 100,
                source: quantitySample.sourceRevision.source.name
            )
        }
    }

    func readHeight(query: NativeHealthDateRangeQuery) throws -> Promise<[NativeHeightSample]> {
        return try readInstantQuantitySamples(dataType: "height", query: query) { quantitySample, unit in
            NativeHeightSample(
                timeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                meters: quantitySample.quantity.doubleValue(for: unit),
                source: quantitySample.sourceRevision.source.name
            )
        }
    }

    func saveRestingHeartRate(samples: [NativeRestingHeartRateSampleInput]) throws -> Promise<Void> {
        return try saveQuantitySamples(dataType: "restingHeartRate", label: "resting heart rate") { quantityType in
            makeRestingHeartRateQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveOxygenSaturation(samples: [NativeOxygenSaturationSampleInput]) throws -> Promise<Void> {
        return try saveQuantitySamples(dataType: "oxygenSaturation", label: "oxygen saturation") { quantityType in
            makeOxygenSaturationQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveHeight(samples: [NativeHeightSampleInput]) throws -> Promise<Void> {
        return try saveQuantitySamples(dataType: "height", label: "height") { quantityType in
            makeHeightQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }
}
