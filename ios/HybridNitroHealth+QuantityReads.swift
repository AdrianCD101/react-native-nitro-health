//
//  HybridNitroHealth+QuantityReads.swift
//  Pods
//
//  Instantaneous-quantity reads/writes (bloodGlucose, bodyTemperature, restingHeartRate,
//  heartRateVariability, oxygenSaturation, height; readBodyMass in HybridNitroHealth.swift
//  shares the read helper).
//  This file is HealthKit-only, so it must NOT be added to Package.swift's pure-Foundation SPM
//  test target; the podspec globs ios/**/*.swift and picks it up automatically. Kept separate
//  from HybridNitroHealth.swift to stay under that file's line budget.
//

import Foundation
import HealthKit
import NitroModules

extension HybridNitroHealth {
    // Shared boilerplate for instantaneous (point-in-time) quantity reads: descriptor/type
    // lookup, auth gate, cursor-paged query, then per-sample mapping. Each data type only
    // supplies its unit conversion and struct construction. readHeartRate stays bespoke to
    // remain symmetric with Android, where HeartRateRecord is a series record that needs
    // post-read flattening.
    func readInstantQuantitySamplePage<T>(
        dataType: String,
        query: NativeHealthDateRangeQuery,
        map: (HKQuantitySample, HKUnit) -> T
    ) async throws -> (samples: [T], nextCursor: String?) {
        let descriptor = try makeHealthDataTypeDescriptor(dataType: dataType)
        let quantityType = try makeHealthKitQuantityType(dataType: dataType)
        let unit = descriptor.unit

        return try await queryPagedSamples(
            sampleType: quantityType,
            dataType: dataType,
            query: query,
            authorizationLabel: descriptor.label
        ) { sample in
            guard let quantitySample = sample as? HKQuantitySample else {
                return nil
            }

            return map(quantitySample, unit)
        }
    }

    func readRestingHeartRate(query: NativeHealthDateRangeQuery) throws -> Promise<NativeRestingHeartRateSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeRestingHeartRateSamplePage>.async {
            let page = try await self.readInstantQuantitySamplePage(dataType: "restingHeartRate", query: query) { quantitySample, unit in
                NativeRestingHeartRateSample(
                    identity: quantitySample.nativeHealthSampleIdentity,
                    origin: quantitySample.nativeHealthDataOrigin,
                    timeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                    bpm: quantitySample.quantity.doubleValue(for: unit)
                )
            }

            return NativeRestingHeartRateSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    // iOS only ever reports SDNN for HRV (Android reports RMSSD); `method` lets JS distinguish
    // the two so callers never mix/chart them together.
    func readHeartRateVariability(query: NativeHealthDateRangeQuery) throws -> Promise<NativeHeartRateVariabilitySamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeHeartRateVariabilitySamplePage>.async {
            let page = try await self.readInstantQuantitySamplePage(dataType: "heartRateVariability", query: query) { quantitySample, unit in
                NativeHeartRateVariabilitySample(
                    identity: quantitySample.nativeHealthSampleIdentity,
                    origin: quantitySample.nativeHealthDataOrigin,
                    timeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                    milliseconds: quantitySample.quantity.doubleValue(for: unit),
                    method: "sdnn"
                )
            }

            return NativeHeartRateVariabilitySamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    // HealthKit stores oxygen saturation as a fraction (0-1 via HKUnit.percent()); the JS
    // surface uses percentage (0-100), so convert here (inverse of the /100 in
    // makeOxygenSaturationQuantitySamples).
    func readOxygenSaturation(query: NativeHealthDateRangeQuery) throws -> Promise<NativeOxygenSaturationSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeOxygenSaturationSamplePage>.async {
            let page = try await self.readInstantQuantitySamplePage(dataType: "oxygenSaturation", query: query) { quantitySample, unit in
                NativeOxygenSaturationSample(
                    identity: quantitySample.nativeHealthSampleIdentity,
                    origin: quantitySample.nativeHealthDataOrigin,
                    timeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                    percentage: quantitySample.quantity.doubleValue(for: unit) * 100
                )
            }

            return NativeOxygenSaturationSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    func readBloodGlucose(query: NativeHealthDateRangeQuery) throws -> Promise<NativeBloodGlucoseSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeBloodGlucoseSamplePage>.async {
            let page = try await self.readInstantQuantitySamplePage(dataType: "bloodGlucose", query: query) { quantitySample, unit in
                NativeBloodGlucoseSample(
                    identity: quantitySample.nativeHealthSampleIdentity,
                    origin: quantitySample.nativeHealthDataOrigin,
                    timeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                    millimolesPerLiter: quantitySample.quantity.doubleValue(for: unit)
                )
            }

            return NativeBloodGlucoseSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    func readBodyTemperature(query: NativeHealthDateRangeQuery) throws -> Promise<NativeBodyTemperatureSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeBodyTemperatureSamplePage>.async {
            let page = try await self.readInstantQuantitySamplePage(dataType: "bodyTemperature", query: query) { quantitySample, unit in
                NativeBodyTemperatureSample(
                    identity: quantitySample.nativeHealthSampleIdentity,
                    origin: quantitySample.nativeHealthDataOrigin,
                    timeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                    celsius: quantitySample.quantity.doubleValue(for: unit)
                )
            }

            return NativeBodyTemperatureSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    func readHeight(query: NativeHealthDateRangeQuery) throws -> Promise<NativeHeightSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeHeightSamplePage>.async {
            let page = try await self.readInstantQuantitySamplePage(dataType: "height", query: query) { quantitySample, unit in
                NativeHeightSample(
                    identity: quantitySample.nativeHealthSampleIdentity,
                    origin: quantitySample.nativeHealthDataOrigin,
                    timeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                    meters: quantitySample.quantity.doubleValue(for: unit)
                )
            }

            return NativeHeightSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    func saveRestingHeartRate(samples: [NativeRestingHeartRateSampleInput]) throws -> Promise<Void> {
        return try saveQuantitySamples(dataType: "restingHeartRate", label: "resting heart rate") { quantityType in
            try makeRestingHeartRateQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveBloodGlucose(samples: [NativeBloodGlucoseSampleInput]) throws -> Promise<Void> {
        return try saveQuantitySamples(dataType: "bloodGlucose", label: "blood glucose") { quantityType in
            try makeBloodGlucoseQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveBodyTemperature(samples: [NativeBodyTemperatureSampleInput]) throws -> Promise<Void> {
        return try saveQuantitySamples(dataType: "bodyTemperature", label: "body temperature") { quantityType in
            try makeBodyTemperatureQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveOxygenSaturation(samples: [NativeOxygenSaturationSampleInput]) throws -> Promise<Void> {
        return try saveQuantitySamples(dataType: "oxygenSaturation", label: "oxygen saturation") { quantityType in
            try makeOxygenSaturationQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveHeight(samples: [NativeHeightSampleInput]) throws -> Promise<Void> {
        return try saveQuantitySamples(dataType: "height", label: "height") { quantityType in
            try makeHeightQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }
}
