//
//  HybridNitroHealth+QuantityReads.swift
//  Pods
//
//  Instantaneous-quantity reads/writes (bloodGlucose, bodyTemperature, respiratoryRate,
//  bodyFat, leanBodyMass, basalBodyTemperature, restingHeartRate, heartRateVariability,
//  oxygenSaturation, height; readBodyMass in HybridNitroHealth.swift shares the read helper).
//  This file is HealthKit-only, so it must NOT be added to Package.swift's pure-Foundation SPM
//  test target; the podspec globs ios/**/*.swift and picks it up automatically. Kept separate
//  from HybridNitroHealth.swift to stay under that file's line budget.
//

import Foundation
import HealthKit
import NitroModules

extension HybridNitroHealth {
    // Shared boilerplate for instantaneous (point-in-time) quantity reads: descriptor/type
    // lookup, auth gate, cursor-paged query, then per-sample mapping. readHeartRate stays
    // bespoke to remain symmetric with Android, where HeartRateRecord is a series record
    // that needs post-read flattening.
    func readInstantQuantitySamplePage<T>(
        dataType: String,
        query: NativeHealthDateRangeQuery,
        map: (HKQuantitySample) throws -> T
    ) async throws -> (samples: [T], nextCursor: String?) {
        let descriptor = try makeHealthDataTypeDescriptor(dataType: dataType)
        let quantityType = try makeHealthKitQuantityType(dataType: dataType)

        return try await queryPagedSamples(
            sampleType: quantityType,
            dataType: dataType,
            query: query,
            authorizationLabel: descriptor.label
        ) { sample in
            guard let quantitySample = sample as? HKQuantitySample else {
                return nil
            }

            return try map(quantitySample)
        }
    }

    func readRestingHeartRate(query: NativeHealthDateRangeQuery) throws -> Promise<NativeRestingHeartRateSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeRestingHeartRateSamplePage>.async {
            let page = try await self.readInstantQuantitySamplePage(dataType: "restingHeartRate", query: query) { quantitySample in
                quantitySample.nativeRestingHeartRateSample
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
            let page = try await self.readInstantQuantitySamplePage(dataType: "heartRateVariability", query: query) { quantitySample in
                quantitySample.nativeHeartRateVariabilitySample
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
            let page = try await self.readInstantQuantitySamplePage(dataType: "oxygenSaturation", query: query) { quantitySample in
                quantitySample.nativeOxygenSaturationSample
            }

            return NativeOxygenSaturationSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    func readBloodGlucose(query: NativeHealthDateRangeQuery) throws -> Promise<NativeBloodGlucoseSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeBloodGlucoseSamplePage>.async {
            let page = try await self.readInstantQuantitySamplePage(dataType: "bloodGlucose", query: query) { quantitySample in
                try quantitySample.nativeBloodGlucoseSample()
            }

            return NativeBloodGlucoseSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    func readBodyTemperature(query: NativeHealthDateRangeQuery) throws -> Promise<NativeBodyTemperatureSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeBodyTemperatureSamplePage>.async {
            let page = try await self.readInstantQuantitySamplePage(dataType: "bodyTemperature", query: query) { quantitySample in
                try quantitySample.nativeBodyTemperatureSample()
            }

            return NativeBodyTemperatureSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    func readRespiratoryRate(query: NativeHealthDateRangeQuery) throws -> Promise<NativeRespiratoryRateSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeRespiratoryRateSamplePage>.async {
            let page = try await self.readInstantQuantitySamplePage(dataType: "respiratoryRate", query: query) { quantitySample in
                quantitySample.nativeRespiratoryRateSample
            }

            return NativeRespiratoryRateSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    // HealthKit stores body fat as a fraction (0-1 via HKUnit.percent()); the JS surface uses
    // percentage (0-100), so convert here (inverse of the /100 in makeBodyFatQuantitySamples).
    func readBodyFat(query: NativeHealthDateRangeQuery) throws -> Promise<NativeBodyFatSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeBodyFatSamplePage>.async {
            let page = try await self.readInstantQuantitySamplePage(dataType: "bodyFat", query: query) { quantitySample in
                quantitySample.nativeBodyFatSample
            }

            return NativeBodyFatSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    func readLeanBodyMass(query: NativeHealthDateRangeQuery) throws -> Promise<NativeLeanBodyMassSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeLeanBodyMassSamplePage>.async {
            let page = try await self.readInstantQuantitySamplePage(dataType: "leanBodyMass", query: query) { quantitySample in
                quantitySample.nativeLeanBodyMassSample
            }

            return NativeLeanBodyMassSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    func readBasalBodyTemperature(query: NativeHealthDateRangeQuery) throws -> Promise<NativeBasalBodyTemperatureSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeBasalBodyTemperatureSamplePage>.async {
            let page = try await self.readInstantQuantitySamplePage(dataType: "basalBodyTemperature", query: query) { quantitySample in
                try quantitySample.nativeBasalBodyTemperatureSample()
            }

            return NativeBasalBodyTemperatureSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    func readHeight(query: NativeHealthDateRangeQuery) throws -> Promise<NativeHeightSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeHeightSamplePage>.async {
            let page = try await self.readInstantQuantitySamplePage(dataType: "height", query: query) { quantitySample in
                quantitySample.nativeHeightSample
            }

            return NativeHeightSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    func readVo2Max(query: NativeHealthDateRangeQuery) throws -> Promise<NativeVo2MaxSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeVo2MaxSamplePage>.async {
            let page = try await self.readInstantQuantitySamplePage(dataType: "vo2Max", query: query) { quantitySample in
                try quantitySample.nativeVo2MaxSample()
            }

            return NativeVo2MaxSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    func saveRestingHeartRate(samples: [NativeRestingHeartRateSampleInput]) throws -> Promise<NativeHealthWriteResult> {
        return try saveQuantitySamples(dataType: "restingHeartRate", label: "resting heart rate") { quantityType in
            try makeRestingHeartRateQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveBloodGlucose(samples: [NativeBloodGlucoseSampleInput]) throws -> Promise<NativeHealthWriteResult> {
        return try saveQuantitySamples(dataType: "bloodGlucose", label: "blood glucose") { quantityType in
            try makeBloodGlucoseQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveBodyTemperature(samples: [NativeBodyTemperatureSampleInput]) throws -> Promise<NativeHealthWriteResult> {
        return try saveQuantitySamples(dataType: "bodyTemperature", label: "body temperature") { quantityType in
            try makeBodyTemperatureQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveRespiratoryRate(samples: [NativeRespiratoryRateSampleInput]) throws -> Promise<NativeHealthWriteResult> {
        return try saveQuantitySamples(dataType: "respiratoryRate", label: "respiratory rate") { quantityType in
            try makeRespiratoryRateQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveBodyFat(samples: [NativeBodyFatSampleInput]) throws -> Promise<NativeHealthWriteResult> {
        return try saveQuantitySamples(dataType: "bodyFat", label: "body fat") { quantityType in
            try makeBodyFatQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveLeanBodyMass(samples: [NativeLeanBodyMassSampleInput]) throws -> Promise<NativeHealthWriteResult> {
        return try saveQuantitySamples(dataType: "leanBodyMass", label: "lean body mass") { quantityType in
            try makeLeanBodyMassQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveBasalBodyTemperature(samples: [NativeBasalBodyTemperatureSampleInput]) throws -> Promise<NativeHealthWriteResult> {
        return try saveQuantitySamples(dataType: "basalBodyTemperature", label: "basal body temperature") { quantityType in
            try makeBasalBodyTemperatureQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveOxygenSaturation(samples: [NativeOxygenSaturationSampleInput]) throws -> Promise<NativeHealthWriteResult> {
        return try saveQuantitySamples(dataType: "oxygenSaturation", label: "oxygen saturation") { quantityType in
            try makeOxygenSaturationQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveHeight(samples: [NativeHeightSampleInput]) throws -> Promise<NativeHealthWriteResult> {
        return try saveQuantitySamples(dataType: "height", label: "height") { quantityType in
            try makeHeightQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveVo2Max(samples: [NativeVo2MaxSampleInput]) throws -> Promise<NativeHealthWriteResult> {
        return try saveQuantitySamples(dataType: "vo2Max", label: "VO2 max") { quantityType in
            try makeVo2MaxQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }
}
