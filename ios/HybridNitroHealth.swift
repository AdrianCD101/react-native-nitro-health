//
//  HybridNitroHealth.swift
//  Pods
//
//  Created by Adrian White on 4/27/2026.
//

import Foundation
import HealthKit
import NitroModules

let healthStore = HKHealthStore()

func permissionError(_ message: String) -> NSError {
    return NSError(domain: "NitroHealth", code: 1, userInfo: [NSLocalizedDescriptionKey: message])
}

class HybridNitroHealth: HybridNitroHealthSpec {
    // Note: reads reject with a "not determined" error until authorization has been requested
    // once. After the user responds, HealthKit cannot report read-permission denial (a privacy
    // limitation), so a query without read access resolves to an empty array rather than
    // throwing. Callers should gate on requestAuthorization before relying on results.
    func readSteps(query: NativeHealthDateRangeQuery) throws -> Promise<NativeStepSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let quantityType = try makeHealthKitQuantityType(dataType: "steps")

        return Promise<NativeStepSamplePage>.async {
            let page = try await self.queryPagedSamples(
                sampleType: quantityType,
                dataType: "steps",
                query: query,
                authorizationLabel: "steps"
            ) { sample -> NativeStepSample? in
                guard let quantitySample = sample as? HKQuantitySample else {
                    return nil
                }

                return NativeStepSample(
                    identity: quantitySample.nativeHealthSampleIdentity,
                    origin: quantitySample.nativeHealthDataOrigin,
                    startTimeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                    endTimeMs: quantitySample.endDate.timeIntervalSince1970 * 1000,
                    count: quantitySample.quantity.doubleValue(for: HKUnit.count())
                )
            }

            return NativeStepSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    // Note: like readSteps, HealthKit resolves with an empty array when read access is denied.
    func readDistance(query: NativeHealthDateRangeQuery) throws -> Promise<NativeDistanceSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let quantityType = try makeHealthKitQuantityType(dataType: "distance")

        return Promise<NativeDistanceSamplePage>.async {
            let page = try await self.queryPagedSamples(
                sampleType: quantityType,
                dataType: "distance",
                query: query,
                authorizationLabel: "distance"
            ) { sample -> NativeDistanceSample? in
                guard let quantitySample = sample as? HKQuantitySample else {
                    return nil
                }

                return NativeDistanceSample(
                    identity: quantitySample.nativeHealthSampleIdentity,
                    origin: quantitySample.nativeHealthDataOrigin,
                    startTimeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                    endTimeMs: quantitySample.endDate.timeIntervalSince1970 * 1000,
                    distanceMeters: quantitySample.quantity.doubleValue(for: HKUnit.meter()),
                    scope: .walkingrunning
                )
            }

            return NativeDistanceSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    // Note: like readSteps, HealthKit resolves with an empty array when read access is denied.
    func readActiveEnergyBurned(query: NativeHealthDateRangeQuery) throws -> Promise<NativeActiveEnergyBurnedSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let quantityType = try makeHealthKitQuantityType(dataType: "activeEnergyBurned")

        return Promise<NativeActiveEnergyBurnedSamplePage>.async {
            let page = try await self.queryPagedSamples(
                sampleType: quantityType,
                dataType: "activeEnergyBurned",
                query: query,
                authorizationLabel: "active energy burned"
            ) { sample -> NativeActiveEnergyBurnedSample? in
                guard let quantitySample = sample as? HKQuantitySample else {
                    return nil
                }

                return NativeActiveEnergyBurnedSample(
                    identity: quantitySample.nativeHealthSampleIdentity,
                    origin: quantitySample.nativeHealthDataOrigin,
                    startTimeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                    endTimeMs: quantitySample.endDate.timeIntervalSince1970 * 1000,
                    kilocalories: quantitySample.quantity.doubleValue(for: HKUnit.kilocalorie())
                )
            }

            return NativeActiveEnergyBurnedSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    // Note: like readSteps, HealthKit resolves with an empty array when read access is denied
    // (read-permission denial is not detectable). Heart rate is read in beats per minute.
    func readHeartRate(query: NativeHealthDateRangeQuery) throws -> Promise<NativeHeartRateSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        let quantityType = try makeHealthKitQuantityType(dataType: "heartRate")
        let bpmUnit = HKUnit.count().unitDivided(by: HKUnit.minute())

        return Promise<NativeHeartRateSamplePage>.async {
            let page = try await self.queryPagedSamples(
                sampleType: quantityType,
                dataType: "heartRate",
                query: query,
                authorizationLabel: "heart rate"
            ) { sample -> NativeHeartRateSample? in
                guard let quantitySample = sample as? HKQuantitySample else {
                    return nil
                }

                return NativeHeartRateSample(
                    identity: quantitySample.nativeHealthSampleIdentity,
                    origin: quantitySample.nativeHealthDataOrigin,
                    timeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                    bpm: quantitySample.quantity.doubleValue(for: bpmUnit)
                )
            }

            return NativeHeartRateSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    // Note: like readSteps, HealthKit resolves with an empty array when read access is denied.
    func readBodyMass(query: NativeHealthDateRangeQuery) throws -> Promise<NativeBodyMassSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeBodyMassSamplePage>.async {
            let page = try await self.readInstantQuantitySamplePage(dataType: "bodyMass", query: query) { quantitySample, unit in
                NativeBodyMassSample(
                    identity: quantitySample.nativeHealthSampleIdentity,
                    origin: quantitySample.nativeHealthDataOrigin,
                    startTimeMs: quantitySample.startDate.timeIntervalSince1970 * 1000,
                    endTimeMs: quantitySample.endDate.timeIntervalSince1970 * 1000,
                    kilograms: quantitySample.quantity.doubleValue(for: unit)
                )
            }

            return NativeBodyMassSamplePage(samples: page.samples, nextCursor: page.nextCursor)
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
                    max: max,
                    scope: dataType == "distance" ? .walkingrunning : nil
                )
            }
        }
    }

    // Note: HealthKit sleep analysis is category interval data. In-bed and asleep samples can
    // overlap, so this returns raw normalized intervals rather than derived sessions.
    func readSleepSamples(query: NativeHealthDateRangeQuery) throws -> Promise<NativeSleepSamplePage> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        guard let categoryType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
            throw permissionError("Health data type is not available on this device: sleep")
        }

        return Promise<NativeSleepSamplePage>.async {
            let page = try await self.queryPagedSamples(
                sampleType: categoryType,
                dataType: "sleep",
                query: query,
                authorizationLabel: "sleep"
            ) { sample -> NativeSleepSample? in
                guard let categorySample = sample as? HKCategorySample else {
                    return nil
                }

                return categorySample.nativeSleepSample
            }

            return NativeSleepSamplePage(samples: page.samples, nextCursor: page.nextCursor)
        }
    }

    // Note: unlike reads, HealthKit can verify write authorization, so save methods throw a
    // permission error when sharing is not authorized (including when not yet determined).
    func saveSteps(samples: [NativeStepSampleInput]) throws -> Promise<Void> {
        return try saveQuantitySamples(dataType: "steps", label: "steps") { quantityType in
            try makeStepQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveDistance(samples: [NativeDistanceSampleInput]) throws -> Promise<NativeDistanceWriteResult> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeDistanceWriteResult>.async {
            let quantityType = try makeHealthKitQuantityType(dataType: "distance")
            try self.requireWriteAuthorization(for: quantityType, label: "distance")

            for (index, sample) in samples.enumerated() where sample.scope != .walkingrunning {
                throw permissionError(
                    "samples[\(index)].scope must be walkingRunning when saving distance on iOS"
                )
            }

            let healthKitSamples = try makeDistanceQuantitySamples(
                samples: samples,
                quantityType: quantityType
            )
            try await self.saveHealthKitSamples(healthKitSamples)
            return NativeDistanceWriteResult(storedScope: .walkingrunning)
        }
    }

    func saveActiveEnergyBurned(samples: [NativeActiveEnergyBurnedSampleInput]) throws -> Promise<Void> {
        return try saveQuantitySamples(dataType: "activeEnergyBurned", label: "active energy burned") { quantityType in
            try makeActiveEnergyBurnedQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveHeartRate(samples: [NativeHeartRateSampleInput]) throws -> Promise<Void> {
        return try saveQuantitySamples(dataType: "heartRate", label: "heart rate") { quantityType in
            try makeHeartRateQuantitySamples(samples: samples, quantityType: quantityType)
        }
    }

    func saveBodyMass(samples: [NativeBodyMassSampleInput]) throws -> Promise<Void> {
        return try saveQuantitySamples(dataType: "bodyMass", label: "body mass") { quantityType in
            try makeBodyMassQuantitySamples(samples: samples, quantityType: quantityType)
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
        makeSamples: @escaping (HKQuantityType) throws -> [HKQuantitySample]
    ) throws -> Promise<Void> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<Void>.async {
            let quantityType = try makeHealthKitQuantityType(dataType: dataType)
            try self.requireWriteAuthorization(for: quantityType, label: label)
            let samples = try makeSamples(quantityType)
            try await self.saveHealthKitSamples(samples)
        }
    }

    func getPermissionStatuses(permissions: [NativeHealthPermission]) throws -> Promise<NativeHealthPermissionStatusResult> {
        let availability = makeNativeHealthAvailability()
        if availability.status == .unavailable {
            return Promise<NativeHealthPermissionStatusResult>.resolved(
                withResult: NativeHealthPermissionStatusResult(
                    availability: availability,
                    statuses: permissions.map { permission in
                        NativeHealthPermissionStatusEntry(
                            permission: permission,
                            status: .unverifiable
                        )
                    }
                )
            )
        }

        return Promise<NativeHealthPermissionStatusResult>.resolved(
            withResult: NativeHealthPermissionStatusResult(
                availability: availability,
                statuses: try permissions.map(makeHealthKitPermissionStatusEntry)
            )
        )
    }

    func requestAuthorization(permissions: [NativeHealthPermission]) throws -> Promise<NativeHealthAuthorizationResult> {
        let availability = makeNativeHealthAvailability()
        if availability.status == .unavailable {
            return Promise<NativeHealthAuthorizationResult>.resolved(
                withResult: NativeHealthAuthorizationResult(
                    status: .unavailable,
                    availability: availability,
                    statuses: permissions.map { permission in
                        NativeHealthPermissionStatusEntry(
                            permission: permission,
                            status: .unverifiable
                        )
                    }
                )
            )
        }

        let healthKitTypes = try makeHealthKitTypeSets(permissions: permissions)

        return Promise<NativeHealthAuthorizationResult>.async {
            let success = try await self.requestHealthKitAuthorization(healthKitTypes: healthKitTypes)
            guard success else {
                throw permissionError("HealthKit did not complete the authorization request")
            }

            return NativeHealthAuthorizationResult(
                status: .completed,
                availability: availability,
                statuses: try permissions.map(self.makeHealthKitPermissionStatusEntry)
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
    )) async throws -> HKAuthorizationRequestStatus {
        return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<HKAuthorizationRequestStatus, Error>) in
            healthStore.getRequestStatusForAuthorization(
                toShare: healthKitTypes.toShare,
                read: healthKitTypes.toRead
            ) { status, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                continuation.resume(returning: status)
            }
        }
    }

    // HealthKit never discloses read denials, but it can report whether the app has asked at
    // all. Reads reject before the first authorization request (matching Android's behavior as
    // closely as the platform allows); after the user responds, denied reads resolve empty.
    //
    // Internal (not private) so HybridNitroHealth+QuantityReads.swift can reuse it. The set
    // overload exists for blood pressure, whose read authorization spans both member quantity
    // types (correlation types cannot be checked).
    func requireDeterminedReadAuthorization(for objectTypes: Set<HKObjectType>, label: String) async throws {
        let status = try await getAuthorizationRequestStatus(healthKitTypes: (toShare: [], toRead: objectTypes))

        if status == .shouldRequest {
            throw permissionError("Read authorization is not determined for \(label). Request authorization first.")
        }
    }

    func requireDeterminedReadAuthorization(for objectType: HKObjectType, label: String) async throws {
        try await requireDeterminedReadAuthorization(for: [objectType] as Set<HKObjectType>, label: label)
    }

    // Internal (not private) so HybridNitroHealth+Deletes.swift can reuse it.
    func requireWriteAuthorization(for sampleType: HKSampleType, label: String) throws {
        if healthStore.authorizationStatus(for: sampleType) != .sharingAuthorized {
            throw permissionError("Missing permission to write \(label)")
        }
    }

    // Internal so sleep writes can save their envelope and stages in the same atomic call.
    func saveHealthKitSamples(_ samples: [HKSample]) async throws {
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

    // Internal (not private) so HybridNitroHealth+Deletes.swift can return HealthKit's count.
    func deleteHealthKitObjects(of objectType: HKObjectType, predicate: NSPredicate) async throws -> Int {
        return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Int, Error>) in
            healthStore.deleteObjects(of: objectType, predicate: predicate) { success, deletedCount, error in
                if let error = error {
                    if let hkError = error as? HKError, hkError.code == .errorNoData {
                        continuation.resume(returning: 0)
                        return
                    }

                    continuation.resume(throwing: error)
                    return
                }

                guard success else {
                    continuation.resume(
                        throwing: permissionError("HealthKit did not complete the deletion")
                    )
                    return
                }

                continuation.resume(returning: deletedCount)
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

    private func makeHealthKitPermissionStatusEntry(
        permission: NativeHealthPermission
    ) throws -> NativeHealthPermissionStatusEntry {
        let status: HealthPermissionStatus

        switch permission.accessType {
        case "read":
            status = .unverifiable
        case "write":
            // Blood pressure writes save an HKCorrelation whose members need sharing
            // authorization on both quantity types, so its status is the worst-of the two.
            if permission.dataType == "bloodPressure" {
                let quantityTypes = try makeBloodPressureQuantityTypes()
                status = makeWorstOfWriteStatus(
                    healthStore.authorizationStatus(for: quantityTypes.systolic),
                    healthStore.authorizationStatus(for: quantityTypes.diastolic)
                )
            } else {
                let sampleType = try makeHealthKitSampleType(dataType: permission.dataType)
                status = makeWriteStatus(healthStore.authorizationStatus(for: sampleType))
            }
        default:
            throw permissionError("Unsupported health permission access type: \(permission.accessType)")
        }

        return NativeHealthPermissionStatusEntry(permission: permission, status: status)
    }

    private func makeWriteStatus(_ authorizationStatus: HKAuthorizationStatus) -> HealthPermissionStatus {
        switch authorizationStatus {
        case .notDetermined:
            return .notdetermined
        case .sharingDenied:
            return .notgranted
        case .sharingAuthorized:
            return .granted
        @unknown default:
            return .unverifiable
        }
    }

    private func makeWorstOfWriteStatus(
        _ first: HKAuthorizationStatus,
        _ second: HKAuthorizationStatus
    ) -> HealthPermissionStatus {
        let statuses = [makeWriteStatus(first), makeWriteStatus(second)]

        if statuses.contains(.notgranted) {
            return .notgranted
        }
        if statuses.contains(.unverifiable) {
            return .unverifiable
        }
        if statuses.contains(.notdetermined) {
            return .notdetermined
        }
        return .granted
    }

    private func makeHealthKitTypeSets(permissions: [NativeHealthPermission]) throws -> (
        toShare: Set<HKSampleType>,
        toRead: Set<HKObjectType>
    ) {
        var toShare = Set<HKSampleType>()
        var toRead = Set<HKObjectType>()

        for permission in permissions {
            // requestAuthorization rejects correlation types; blood pressure authorizes its
            // two member quantity types instead.
            if permission.dataType == "bloodPressure" {
                let quantityTypes = try makeBloodPressureQuantityTypes()

                switch permission.accessType {
                case "read":
                    toRead.insert(quantityTypes.systolic)
                    toRead.insert(quantityTypes.diastolic)
                case "write":
                    toShare.insert(quantityTypes.systolic)
                    toShare.insert(quantityTypes.diastolic)
                default:
                    throw permissionError("Unsupported health permission access type: \(permission.accessType)")
                }
                continue
            }

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
}
