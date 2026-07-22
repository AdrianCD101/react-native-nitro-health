//
//  HybridNitroHealth.swift
//  Pods
//
//  Created by Adrian White on 4/27/2026.
//

import Foundation
import HealthKit
import NitroModules
import UIKit

private let healthStore = HKHealthStore()

func permissionError(_ message: String) -> NSError {
    return NSError(domain: "NitroHealth", code: 1, userInfo: [NSLocalizedDescriptionKey: message])
}

class HybridNitroHealth: HybridNitroHealthSpec {
    func isAvailable() throws -> Bool {
        return try getAvailabilityStatus() == .available
    }

    func getAvailabilityStatus() throws -> HealthAvailabilityStatus {
        return HKHealthStore.isHealthDataAvailable() ? .available : .unavailable
    }

    func openHealthConnectInstall() throws -> Bool {
        return false
    }

    func openHealthSettings() throws -> Promise<Bool> {
        return Promise<Bool>.async {
            return await withCheckedContinuation { (continuation: CheckedContinuation<Bool, Never>) in
                DispatchQueue.main.async {
                    guard let url = URL(string: UIApplication.openSettingsURLString) else {
                        continuation.resume(returning: false)
                        return
                    }

                    UIApplication.shared.open(url) { success in
                        continuation.resume(returning: success)
                    }
                }
            }
        }
    }

    // Note: reads reject with a "not determined" error until authorization has been requested
    // once. After the user responds, HealthKit cannot report read-permission denial (a privacy
    // limitation), so a query without read access resolves to an empty array rather than
    // throwing. Callers should gate on requestAuthorization before relying on results.
    func readSteps(query: NativeHealthDateRangeQuery) throws -> Promise<[NativeStepSample]> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let quantityType = try makeHealthKitQuantityType(dataType: "steps")
        let startDate = Date(timeIntervalSince1970: query.startTimeMs / 1000)
        let endDate = Date(timeIntervalSince1970: query.endTimeMs / 1000)
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])
        let sortDescriptors = [
            NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: query.ascending),
        ]

        return Promise<[NativeStepSample]>.async {
            try await self.requireDeterminedReadAuthorization(for: quantityType, label: "steps")
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

                return NativeStepSample(
                    startTimeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                    endTimeMs: quantitySample.endDate.timeIntervalSince1970 * 1000,
                    count: quantitySample.quantity.doubleValue(for: HKUnit.count())
                )
            }
        }
    }

    // Daily totals use HealthKit statistics so overlapping sources are aggregated by the OS.
    func readDailyStepTotals(query: NativeHealthDateRangeQuery) throws -> Promise<[NativeStepSample]> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let quantityType = try makeHealthKitQuantityType(dataType: "steps")
        let startDate = Date(timeIntervalSince1970: query.startTimeMs / 1000)
        let endDate = Date(timeIntervalSince1970: query.endTimeMs / 1000)
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])
        let anchorDate = Calendar.current.startOfDay(for: startDate)
        var intervalComponents = DateComponents()
        intervalComponents.day = 1

        return Promise<[NativeStepSample]>.async {
            try await self.requireDeterminedReadAuthorization(for: quantityType, label: "steps")
            let statistics = try await self.queryHealthKitStatisticsCollection(
                quantityType: quantityType,
                predicate: predicate,
                options: .cumulativeSum,
                anchorDate: anchorDate,
                intervalComponents: intervalComponents,
                startDate: startDate,
                endDate: endDate
            )
            let samples = statistics.compactMap { statistic -> NativeStepSample? in
                guard let sum = statistic.sumQuantity() else {
                    return nil
                }
                let range = clampDailyBucketRange(
                    bucketStartTimeMs: statistic.startDate.timeIntervalSince1970 * 1000,
                    bucketEndTimeMs: statistic.endDate.timeIntervalSince1970 * 1000,
                    queryStartTimeMs: query.startTimeMs,
                    queryEndTimeMs: query.endTimeMs
                )

                return NativeStepSample(
                    startTimeMs: range.startTimeMs,
                    endTimeMs: range.endTimeMs,
                    count: sum.doubleValue(for: HKUnit.count())
                )
            }

            return orderAndLimitDailySamples(
                samples,
                ascending: query.ascending,
                limit: Int(query.limit)
            ) { $0.startTimeMs }
        }
    }

    // Note: like readSteps, HealthKit resolves with an empty array when read access is denied.
    func readDistance(query: NativeHealthDateRangeQuery) throws -> Promise<[NativeDistanceSample]> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let quantityType = try makeHealthKitQuantityType(dataType: "distance")
        let startDate = Date(timeIntervalSince1970: query.startTimeMs / 1000)
        let endDate = Date(timeIntervalSince1970: query.endTimeMs / 1000)
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])
        let sortDescriptors = [
            NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: query.ascending),
        ]

        return Promise<[NativeDistanceSample]>.async {
            try await self.requireDeterminedReadAuthorization(for: quantityType, label: "distance")
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

                return NativeDistanceSample(
                    startTimeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                    endTimeMs: quantitySample.endDate.timeIntervalSince1970 * 1000,
                    distanceMeters: quantitySample.quantity.doubleValue(for: HKUnit.meter())
                )
            }
        }
    }

    // Daily totals use HealthKit statistics so overlapping sources are aggregated by the OS.
    func readDailyDistanceTotals(query: NativeHealthDateRangeQuery) throws -> Promise<[NativeDistanceSample]> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let quantityType = try makeHealthKitQuantityType(dataType: "distance")
        let startDate = Date(timeIntervalSince1970: query.startTimeMs / 1000)
        let endDate = Date(timeIntervalSince1970: query.endTimeMs / 1000)
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])
        let anchorDate = Calendar.current.startOfDay(for: startDate)
        var intervalComponents = DateComponents()
        intervalComponents.day = 1

        return Promise<[NativeDistanceSample]>.async {
            try await self.requireDeterminedReadAuthorization(for: quantityType, label: "distance")
            let statistics = try await self.queryHealthKitStatisticsCollection(
                quantityType: quantityType,
                predicate: predicate,
                options: .cumulativeSum,
                anchorDate: anchorDate,
                intervalComponents: intervalComponents,
                startDate: startDate,
                endDate: endDate
            )
            let samples = statistics.compactMap { statistic -> NativeDistanceSample? in
                guard let sum = statistic.sumQuantity() else {
                    return nil
                }
                let range = clampDailyBucketRange(
                    bucketStartTimeMs: statistic.startDate.timeIntervalSince1970 * 1000,
                    bucketEndTimeMs: statistic.endDate.timeIntervalSince1970 * 1000,
                    queryStartTimeMs: query.startTimeMs,
                    queryEndTimeMs: query.endTimeMs
                )

                return NativeDistanceSample(
                    startTimeMs: range.startTimeMs,
                    endTimeMs: range.endTimeMs,
                    distanceMeters: sum.doubleValue(for: HKUnit.meter())
                )
            }

            return orderAndLimitDailySamples(
                samples,
                ascending: query.ascending,
                limit: Int(query.limit)
            ) { $0.startTimeMs }
        }
    }

    // Note: like readSteps, HealthKit resolves with an empty array when read access is denied.
    func readActiveEnergyBurned(query: NativeHealthDateRangeQuery) throws -> Promise<[NativeActiveEnergyBurnedSample]> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let quantityType = try makeHealthKitQuantityType(dataType: "activeEnergyBurned")
        let startDate = Date(timeIntervalSince1970: query.startTimeMs / 1000)
        let endDate = Date(timeIntervalSince1970: query.endTimeMs / 1000)
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])
        let sortDescriptors = [
            NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: query.ascending),
        ]

        return Promise<[NativeActiveEnergyBurnedSample]>.async {
            try await self.requireDeterminedReadAuthorization(for: quantityType, label: "active energy burned")
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

                return NativeActiveEnergyBurnedSample(
                    startTimeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                    endTimeMs: quantitySample.endDate.timeIntervalSince1970 * 1000,
                    kilocalories: quantitySample.quantity.doubleValue(for: HKUnit.kilocalorie())
                )
            }
        }
    }

    // Daily totals use HealthKit statistics so overlapping sources are aggregated by the OS.
    func readDailyActiveEnergyBurnedTotals(query: NativeHealthDateRangeQuery) throws -> Promise<[NativeActiveEnergyBurnedSample]> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let quantityType = try makeHealthKitQuantityType(dataType: "activeEnergyBurned")
        let startDate = Date(timeIntervalSince1970: query.startTimeMs / 1000)
        let endDate = Date(timeIntervalSince1970: query.endTimeMs / 1000)
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])
        let anchorDate = Calendar.current.startOfDay(for: startDate)
        var intervalComponents = DateComponents()
        intervalComponents.day = 1

        return Promise<[NativeActiveEnergyBurnedSample]>.async {
            try await self.requireDeterminedReadAuthorization(for: quantityType, label: "active energy burned")
            let statistics = try await self.queryHealthKitStatisticsCollection(
                quantityType: quantityType,
                predicate: predicate,
                options: .cumulativeSum,
                anchorDate: anchorDate,
                intervalComponents: intervalComponents,
                startDate: startDate,
                endDate: endDate
            )
            let samples = statistics.compactMap { statistic -> NativeActiveEnergyBurnedSample? in
                guard let sum = statistic.sumQuantity() else {
                    return nil
                }
                let range = clampDailyBucketRange(
                    bucketStartTimeMs: statistic.startDate.timeIntervalSince1970 * 1000,
                    bucketEndTimeMs: statistic.endDate.timeIntervalSince1970 * 1000,
                    queryStartTimeMs: query.startTimeMs,
                    queryEndTimeMs: query.endTimeMs
                )

                return NativeActiveEnergyBurnedSample(
                    startTimeMs: range.startTimeMs,
                    endTimeMs: range.endTimeMs,
                    kilocalories: sum.doubleValue(for: HKUnit.kilocalorie())
                )
            }

            return orderAndLimitDailySamples(
                samples,
                ascending: query.ascending,
                limit: Int(query.limit)
            ) { $0.startTimeMs }
        }
    }

    // Note: like readSteps, HealthKit resolves with an empty array when read access is denied
    // (read-permission denial is not detectable). Heart rate is read in beats per minute.
    func readHeartRate(query: NativeHealthDateRangeQuery) throws -> Promise<[NativeHeartRateSample]> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let quantityType = try makeHealthKitQuantityType(dataType: "heartRate")
        let bpmUnit = HKUnit.count().unitDivided(by: HKUnit.minute())
        let startDate = Date(timeIntervalSince1970: query.startTimeMs / 1000)
        let endDate = Date(timeIntervalSince1970: query.endTimeMs / 1000)
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])
        let sortDescriptors = [
            NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: query.ascending),
        ]

        return Promise<[NativeHeartRateSample]>.async {
            try await self.requireDeterminedReadAuthorization(for: quantityType, label: "heart rate")
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

                return NativeHeartRateSample(
                    timeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                    bpm: quantitySample.quantity.doubleValue(for: bpmUnit),
                    source: quantitySample.sourceRevision.source.name
                )
            }
        }
    }

    // Note: like readSteps, HealthKit resolves with an empty array when read access is denied.
    func readBodyMass(query: NativeHealthDateRangeQuery) throws -> Promise<[NativeBodyMassSample]> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let quantityType = try makeHealthKitQuantityType(dataType: "bodyMass")
        let kilogramUnit = HKUnit.gramUnit(with: .kilo)
        let startDate = Date(timeIntervalSince1970: query.startTimeMs / 1000)
        let endDate = Date(timeIntervalSince1970: query.endTimeMs / 1000)
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])
        let sortDescriptors = [
            NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: query.ascending),
        ]

        return Promise<[NativeBodyMassSample]>.async {
            try await self.requireDeterminedReadAuthorization(for: quantityType, label: "body mass")
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

                return NativeBodyMassSample(
                    startTimeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                    endTimeMs: quantitySample.endDate.timeIntervalSince1970 * 1000,
                    kilograms: quantitySample.quantity.doubleValue(for: kilogramUnit),
                    source: quantitySample.sourceRevision.source.name
                )
            }
        }
    }

    // Note: like readHeartRate, HealthKit resolves with empty statistics when read access is denied.
    func readHeartRateStatistics(query: NativeHealthTimeRangeQuery) throws -> Promise<NativeHeartRateStatistics> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let quantityType = try makeHealthKitQuantityType(dataType: "heartRate")
        let bpmUnit = HKUnit.count().unitDivided(by: HKUnit.minute())
        let startDate = Date(timeIntervalSince1970: query.startTimeMs / 1000)
        let endDate = Date(timeIntervalSince1970: query.endTimeMs / 1000)
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])

        return Promise<NativeHeartRateStatistics>.async {
            try await self.requireDeterminedReadAuthorization(for: quantityType, label: "heart rate")
            let statistics = try await self.queryHealthKitStatistics(
                quantityType: quantityType,
                predicate: predicate,
                options: [.discreteAverage, .discreteMin, .discreteMax]
            )

            return NativeHeartRateStatistics(
                average: statistics?.averageQuantity()?.doubleValue(for: bpmUnit),
                min: statistics?.minimumQuantity()?.doubleValue(for: bpmUnit),
                max: statistics?.maximumQuantity()?.doubleValue(for: bpmUnit)
            )
        }
    }

    // Note: like readHeartRateStatistics, HealthKit resolves with empty buckets when read access
    // is denied. Bucket boundaries anchor at query.startTimeMs (not startOfDay/calendar weeks),
    // so 'week' is a rolling 7-day window from the anchor rather than a calendar week.
    func readStatistics(dataType: String, query: NativeHealthStatisticsQuery) throws -> Promise<[NativeHealthStatistics]> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let descriptor = try makeHealthDataTypeDescriptor(dataType: dataType)
        let quantityType = try makeHealthKitQuantityType(dataType: dataType)
        let unit = descriptor.unit
        let options = try makeStatisticsOptions(dataType: dataType, isCumulative: descriptor.isCumulative, metrics: query.metrics)
        guard let intervalComponents = makeBucketIntervalComponents(bucket: query.bucket) else {
            throw permissionError("Unsupported statistics bucket: \(query.bucket)")
        }

        let startDate = Date(timeIntervalSince1970: query.startTimeMs / 1000)
        let endDate = Date(timeIntervalSince1970: query.endTimeMs / 1000)
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])
        let requestedMetrics = Set(query.metrics)
        let label = descriptor.label

        return Promise<[NativeHealthStatistics]>.async {
            try await self.requireDeterminedReadAuthorization(for: quantityType, label: label)
            let statistics = try await self.queryHealthKitStatisticsCollection(
                quantityType: quantityType,
                predicate: predicate,
                options: options,
                anchorDate: startDate,
                intervalComponents: intervalComponents,
                startDate: startDate,
                endDate: endDate
            )

            return statistics.compactMap { statistic -> NativeHealthStatistics? in
                let sum = requestedMetrics.contains("sum") ? statistic.sumQuantity()?.doubleValue(for: unit) : nil
                let avg = requestedMetrics.contains("avg") ? statistic.averageQuantity()?.doubleValue(for: unit) : nil
                let min = requestedMetrics.contains("min") ? statistic.minimumQuantity()?.doubleValue(for: unit) : nil
                let max = requestedMetrics.contains("max") ? statistic.maximumQuantity()?.doubleValue(for: unit) : nil

                if sum == nil, avg == nil, min == nil, max == nil {
                    return nil
                }

                let range = clampDailyBucketRange(
                    bucketStartTimeMs: statistic.startDate.timeIntervalSince1970 * 1000,
                    bucketEndTimeMs: statistic.endDate.timeIntervalSince1970 * 1000,
                    queryStartTimeMs: query.startTimeMs,
                    queryEndTimeMs: query.endTimeMs
                )

                return NativeHealthStatistics(
                    startTimeMs: range.startTimeMs,
                    endTimeMs: range.endTimeMs,
                    sum: sum,
                    avg: avg,
                    min: min,
                    max: max
                )
            }
        }
    }

    // Note: HealthKit sleep analysis is category interval data. In-bed and asleep samples can
    // overlap, so this returns raw normalized intervals rather than derived sessions.
    func readSleepSamples(query: NativeHealthDateRangeQuery) throws -> Promise<[NativeSleepSample]> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        guard let categoryType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
            throw permissionError("Health data type is not available on this device: sleep")
        }

        let startDate = Date(timeIntervalSince1970: query.startTimeMs / 1000)
        let endDate = Date(timeIntervalSince1970: query.endTimeMs / 1000)
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: [])
        let sortDescriptors = [
            NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: query.ascending),
        ]

        return Promise<[NativeSleepSample]>.async {
            try await self.requireDeterminedReadAuthorization(for: categoryType, label: "sleep")
            let samples = try await self.queryHealthKitSamples(
                sampleType: categoryType,
                limit: Int(query.limit),
                predicate: predicate,
                sortDescriptors: sortDescriptors
            )

            return samples.compactMap { sample in
                guard let categorySample = sample as? HKCategorySample else {
                    return nil
                }

                return NativeSleepSample(
                    startTimeMs: categorySample.startDate.timeIntervalSince1970 * 1000,
                    endTimeMs: categorySample.endDate.timeIntervalSince1970 * 1000,
                    stage: self.makeSleepStage(value: categorySample.value),
                    source: categorySample.sourceRevision.source.name
                )
            }
        }
    }

    // Note: unlike reads, HealthKit can verify write authorization, so save methods throw a
    // permission error when sharing is not authorized (including when not yet determined).
    func saveSteps(samples: [NativeStepSampleInput]) throws -> Promise<Void> {
        return try saveQuantitySamples(dataType: "steps", label: "steps") { quantityType in
            makeStepQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveDistance(samples: [NativeDistanceSampleInput]) throws -> Promise<Void> {
        return try saveQuantitySamples(dataType: "distance", label: "distance") { quantityType in
            makeDistanceQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveActiveEnergyBurned(samples: [NativeActiveEnergyBurnedSampleInput]) throws -> Promise<Void> {
        return try saveQuantitySamples(dataType: "activeEnergyBurned", label: "active energy burned") { quantityType in
            makeActiveEnergyBurnedQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveHeartRate(samples: [NativeHeartRateSampleInput]) throws -> Promise<Void> {
        return try saveQuantitySamples(dataType: "heartRate", label: "heart rate") { quantityType in
            makeHeartRateQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveBodyMass(samples: [NativeBodyMassSampleInput]) throws -> Promise<Void> {
        return try saveQuantitySamples(dataType: "bodyMass", label: "body mass") { quantityType in
            makeBodyMassQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    // The type lookup, authorization check, and sample construction run inside the Promise so
    // large batches never block the calling JS thread.
    //
    // Internal (not private) so HybridNitroHealth+QuantityReads.swift can reuse it for the
    // instantaneous-quantity save methods without duplicating this boilerplate.
    func saveQuantitySamples(
        dataType: String,
        label: String,
        makeSamples: @escaping (HKQuantityType) -> [HKQuantitySample]
    ) throws -> Promise<Void> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<Void>.async {
            let quantityType = try makeHealthKitQuantityType(dataType: dataType)
            try self.requireWriteAuthorization(for: quantityType, label: label)
            try await self.saveHealthKitSamples(makeSamples(quantityType))
        }
    }

    func getRequestStatusForAuthorization(permissions: [NativeHealthPermission]) throws -> Promise<AuthorizationRequestStatus> {
        if !HKHealthStore.isHealthDataAvailable() {
            return Promise<AuthorizationRequestStatus>.resolved(withResult: AuthorizationRequestStatus.unknown)
        }

        let healthKitTypes = try makeHealthKitTypeSets(permissions: permissions)

        return Promise<AuthorizationRequestStatus>.async {
            return try await self.getAuthorizationRequestStatus(healthKitTypes: healthKitTypes)
        }
    }

    func requestAuthorization(permissions: [NativeHealthPermission]) throws -> Promise<NativeHealthAuthorizationResult> {
        if !HKHealthStore.isHealthDataAvailable() {
            return Promise<NativeHealthAuthorizationResult>.resolved(
                withResult: makeAuthorizationResult(
                    permissions: permissions,
                    availabilityStatus: .unavailable,
                    requestStatus: .unknown,
                    deniedPermissions: permissions
                )
            )
        }

        let healthKitTypes = try makeHealthKitTypeSets(permissions: permissions)

        return Promise<NativeHealthAuthorizationResult>.async {
            let success = try await self.requestHealthKitAuthorization(healthKitTypes: healthKitTypes)

            if !success {
                return self.makeAuthorizationResult(
                    permissions: permissions,
                    availabilityStatus: .available,
                    requestStatus: .unknown,
                    deniedPermissions: permissions
                )
            }

            let requestStatus = try await self.getAuthorizationRequestStatus(healthKitTypes: healthKitTypes)
            return try self.makeHealthKitAuthorizationResult(
                permissions: permissions,
                requestStatus: requestStatus
            )
        }
    }

    private func requestHealthKitAuthorization(healthKitTypes: (
        toShare: Set<HKSampleType>,
        toRead: Set<HKObjectType>
    )) async throws -> Bool {
        return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Bool, Error>) in
            healthStore.requestAuthorization(
                toShare: healthKitTypes.toShare,
                read: healthKitTypes.toRead
            ) { success, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                continuation.resume(returning: success)
            }
        }
    }

    private func getAuthorizationRequestStatus(healthKitTypes: (
        toShare: Set<HKSampleType>,
        toRead: Set<HKObjectType>
    )) async throws -> AuthorizationRequestStatus {
        return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<AuthorizationRequestStatus, Error>) in
            healthStore.getRequestStatusForAuthorization(
                toShare: healthKitTypes.toShare,
                read: healthKitTypes.toRead
            ) { status, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                switch status {
                case .unknown:
                    continuation.resume(returning: AuthorizationRequestStatus.unknown)
                case .shouldRequest:
                    continuation.resume(returning: AuthorizationRequestStatus.shouldrequest)
                case .unnecessary:
                    continuation.resume(returning: AuthorizationRequestStatus.unnecessary)
                @unknown default:
                    continuation.resume(returning: AuthorizationRequestStatus.unknown)
                }
            }
        }
    }

    // HealthKit never discloses read denials, but it can report whether the app has asked at
    // all. Reads reject before the first authorization request (matching Android's behavior as
    // closely as the platform allows); after the user responds, denied reads resolve empty.
    //
    // Internal (not private) so HybridNitroHealth+QuantityReads.swift can reuse it.
    func requireDeterminedReadAuthorization(for objectType: HKObjectType, label: String) async throws {
        let status = try await getAuthorizationRequestStatus(healthKitTypes: (toShare: [], toRead: [objectType]))

        if status == .shouldrequest {
            throw permissionError("Read authorization is not determined for \(label). Request authorization first.")
        }
    }

    private func requireWriteAuthorization(for sampleType: HKSampleType, label: String) throws {
        if healthStore.authorizationStatus(for: sampleType) != .sharingAuthorized {
            throw permissionError("Missing permission to write \(label)")
        }
    }

    private func saveHealthKitSamples(_ samples: [HKSample]) async throws {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            healthStore.save(samples) { _, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                continuation.resume(returning: ())
            }
        }
    }

    // Internal (not private) so HybridNitroHealth+QuantityReads.swift can reuse it.
    func queryHealthKitSamples(
        sampleType: HKSampleType,
        limit: Int,
        predicate: NSPredicate?,
        sortDescriptors: [NSSortDescriptor]
    ) async throws -> [HKSample] {
        return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<[HKSample], Error>) in
            let query = HKSampleQuery(
                sampleType: sampleType,
                predicate: predicate,
                limit: limit,
                sortDescriptors: sortDescriptors
            ) { _, samples, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                continuation.resume(returning: samples ?? [])
            }

            healthStore.execute(query)
        }
    }

    private func queryHealthKitStatisticsCollection(
        quantityType: HKQuantityType,
        predicate: NSPredicate?,
        options: HKStatisticsOptions,
        anchorDate: Date,
        intervalComponents: DateComponents,
        startDate: Date,
        endDate: Date
    ) async throws -> [HKStatistics] {
        return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<[HKStatistics], Error>) in
            let query = HKStatisticsCollectionQuery(
                quantityType: quantityType,
                quantitySamplePredicate: predicate,
                options: options,
                anchorDate: anchorDate,
                intervalComponents: intervalComponents
            )

            query.initialResultsHandler = { _, collection, error in
                if let error = error {
                    if let hkError = error as? HKError, hkError.code == .errorNoData {
                        continuation.resume(returning: [])
                        return
                    }

                    continuation.resume(throwing: error)
                    return
                }

                var statistics = [HKStatistics]()
                collection?.enumerateStatistics(from: startDate, to: endDate) { statistic, _ in
                    statistics.append(statistic)
                }
                continuation.resume(returning: statistics)
            }

            healthStore.execute(query)
        }
    }

    private func queryHealthKitStatistics(
        quantityType: HKQuantityType,
        predicate: NSPredicate?,
        options: HKStatisticsOptions
    ) async throws -> HKStatistics? {
        return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<HKStatistics?, Error>) in
            let query = HKStatisticsQuery(
                quantityType: quantityType,
                quantitySamplePredicate: predicate,
                options: options
            ) { _, statistics, error in
                if let error = error {
                    if let hkError = error as? HKError, hkError.code == .errorNoData {
                        continuation.resume(returning: nil)
                        return
                    }

                    continuation.resume(throwing: error)
                    return
                }

                continuation.resume(returning: statistics)
            }

            healthStore.execute(query)
        }
    }

    private func makeHealthKitAuthorizationResult(
        permissions: [NativeHealthPermission],
        requestStatus: AuthorizationRequestStatus
    ) throws -> NativeHealthAuthorizationResult {
        var grantedPermissions = [NativeHealthPermission]()
        var deniedPermissions = [NativeHealthPermission]()
        var unverifiablePermissions = [NativeHealthPermission]()

        for permission in permissions {
            switch permission.accessType {
            case "read":
                unverifiablePermissions.append(permission)
            case "write":
                let sampleType = try makeHealthKitSampleType(dataType: permission.dataType)
                if healthStore.authorizationStatus(for: sampleType) == .sharingAuthorized {
                    grantedPermissions.append(permission)
                } else {
                    deniedPermissions.append(permission)
                }
            default:
                throw permissionError("Unsupported health permission access type: \(permission.accessType)")
            }
        }

        return makeAuthorizationResult(
            permissions: permissions,
            availabilityStatus: .available,
            requestStatus: requestStatus,
            grantedPermissions: grantedPermissions,
            deniedPermissions: deniedPermissions,
            unverifiablePermissions: unverifiablePermissions
        )
    }

    private func makeAuthorizationResult(
        permissions: [NativeHealthPermission],
        availabilityStatus: HealthAvailabilityStatus,
        requestStatus: AuthorizationRequestStatus,
        grantedPermissions: [NativeHealthPermission] = [],
        deniedPermissions: [NativeHealthPermission] = [],
        unverifiablePermissions: [NativeHealthPermission] = []
    ) -> NativeHealthAuthorizationResult {
        let status: HealthAuthorizationStatus

        if availabilityStatus != .available {
            status = .unavailable
        } else if !unverifiablePermissions.isEmpty && deniedPermissions.isEmpty {
            status = .completed
        } else if deniedPermissions.isEmpty {
            status = .granted
        } else if !grantedPermissions.isEmpty || !unverifiablePermissions.isEmpty {
            status = .partial
        } else {
            status = .denied
        }

        return NativeHealthAuthorizationResult(
            status: status,
            availabilityStatus: availabilityStatus,
            requestStatus: requestStatus,
            grantedPermissions: grantedPermissions,
            deniedPermissions: deniedPermissions,
            unverifiablePermissions: unverifiablePermissions
        )
    }

    private func makeHealthKitTypeSets(permissions: [NativeHealthPermission]) throws -> (
        toShare: Set<HKSampleType>,
        toRead: Set<HKObjectType>
    ) {
        var toShare = Set<HKSampleType>()
        var toRead = Set<HKObjectType>()

        for permission in permissions {
            let sampleType = try makeHealthKitSampleType(dataType: permission.dataType)

            switch permission.accessType {
            case "read":
                toRead.insert(sampleType)
            case "write":
                toShare.insert(sampleType)
            default:
                throw permissionError("Unsupported health permission access type: \(permission.accessType)")
            }
        }

        return (toShare, toRead)
    }

    private func makeHealthKitSampleType(dataType: String) throws -> HKSampleType {
        if dataType == "sleep" {
            guard let categoryType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
                throw permissionError("Health data type is not available on this device: sleep")
            }

            return categoryType
        }

        return try makeHealthKitQuantityType(dataType: dataType)
    }

    private func makeSleepStage(value: Int) -> String {
        switch value {
        case 0:
            return "inBed"
        case 1:
            return "asleep"
        case 2:
            return "awake"
        case 3:
            return "asleepCore"
        case 4:
            return "asleepDeep"
        case 5:
            return "asleepREM"
        default:
            return "unknown"
        }
    }
}
