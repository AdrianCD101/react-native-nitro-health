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

private func permissionError(_ message: String) -> NSError {
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

    // Note: HealthKit cannot report read-permission denial (a privacy limitation), so a query
    // without read access resolves to an empty array rather than throwing. Callers should gate on
    // getRequestStatusForAuthorization / requestAuthorization before reading.
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

    private func queryHealthKitSamples(
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
                let quantityType = try makeHealthKitQuantityType(dataType: permission.dataType)
                if healthStore.authorizationStatus(for: quantityType) == .sharingAuthorized {
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
            let quantityType = try makeHealthKitQuantityType(dataType: permission.dataType)

            switch permission.accessType {
            case "read":
                toRead.insert(quantityType)
            case "write":
                toShare.insert(quantityType)
            default:
                throw permissionError("Unsupported health permission access type: \(permission.accessType)")
            }
        }

        return (toShare, toRead)
    }

    private func makeHealthKitQuantityType(dataType: String) throws -> HKQuantityType {
        let identifier: HKQuantityTypeIdentifier
        switch dataType {
        case "steps":
            identifier = .stepCount
        case "heartRate":
            identifier = .heartRate
        case "distance":
            identifier = .distanceWalkingRunning
        case "activeEnergyBurned":
            identifier = .activeEnergyBurned
        default:
            throw permissionError("Unsupported health data type: \(dataType)")
        }

        guard let quantityType = HKObjectType.quantityType(forIdentifier: identifier) else {
            throw permissionError("Health data type is not available on this device: \(dataType)")
        }

        return quantityType
    }
}
