//
//  HybridNitroHealth+Deletes.swift
//  Pods
//
//  Sample deletion by record id and by time range. HealthKit only deletes objects
//  this app saved, and deletes are gated on write (sharing) authorization,
//  like saves. The pure uuid parsing lives in SampleUuidParsing.swift
//  (SPM-tested); this file is HealthKit-only, so it must NOT be added to
//  Package.swift's pure-Foundation SPM test target; the podspec globs
//  ios/**/*.swift and picks it up automatically.
//

import Foundation
import HealthKit
import NitroModules

extension HybridNitroHealth {
    func deleteRecordsByIds(
        dataType: String,
        recordIds: [String]
    ) throws -> Promise<NativeHealthDeleteResult> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeHealthDeleteResult>.async {
            let sampleUuids = try makeSampleUuids(recordIds)

            // Blood pressure records are HKCorrelations; deletion is write-gated on both
            // member quantity types and removes the members alongside the correlation.
            if dataType == "bloodPressure" {
                try self.requireBloodPressureWriteAuthorization()
                let deletedCount = try await self.deleteBloodPressureRecords(uuids: sampleUuids)
                return makeNativeHealthDeleteResult(deletedCount: deletedCount)
            }

            let sampleType = try makeHealthKitSampleType(dataType: dataType)
            try self.requireWriteAuthorization(
                for: sampleType,
                label: makeHealthDataTypeLabel(dataType: dataType)
            )

            let deletedCount = try await self.deleteHealthKitObjects(
                of: sampleType,
                predicate: HKQuery.predicateForObjects(with: Set(sampleUuids))
            )
            return makeNativeHealthDeleteResult(deletedCount: deletedCount)
        }
    }

    func deleteRecordsByTimeRange(
        dataType: String,
        query: NativeHealthTimeRangeQuery
    ) throws -> Promise<NativeHealthDeleteResult> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeHealthDeleteResult>.async {
            // options: [] matches the read predicates, so a time-range delete removes exactly
            // the own-app samples a read of the same range returns.
            let predicate = HKQuery.predicateForSamples(
                withStart: Date(timeIntervalSince1970: query.startTimeMs / 1000),
                end: Date(timeIntervalSince1970: query.endTimeMs / 1000),
                options: []
            )

            if dataType == "bloodPressure" {
                try self.requireBloodPressureWriteAuthorization()
                let deletedCount = try await self.deleteBloodPressureRecords(timeRangePredicate: predicate)
                return makeNativeHealthDeleteResult(deletedCount: deletedCount)
            }

            let sampleType = try makeHealthKitSampleType(dataType: dataType)
            try self.requireWriteAuthorization(
                for: sampleType,
                label: makeHealthDataTypeLabel(dataType: dataType)
            )

            let deletedCount = try await self.deleteHealthKitObjects(
                of: sampleType,
                predicate: predicate
            )
            return makeNativeHealthDeleteResult(deletedCount: deletedCount)
        }
    }
}

private func makeNativeHealthDeleteResult(deletedCount: Int) -> NativeHealthDeleteResult {
    let mapping = makeHealthDeleteResultMapping(deletedCount: deletedCount)
    let status: NativeHealthDeleteStatus
    switch mapping.status {
    case .completed:
        status = .completed
    }
    let deletedCountStatus: NativeDeletedCountStatus
    switch mapping.deletedCountStatus {
    case .known:
        deletedCountStatus = .known
    }

    return NativeHealthDeleteResult(
        status: status,
        deletedCountStatus: deletedCountStatus,
        deletedCount: mapping.deletedCount
    )
}

// sleep, workout, and bloodPressure have no quantity descriptor (makeHealthDataTypeDescriptor
// throws for them); their labels mirror the read paths and Android's permissionLabel values. Falls back
// to the raw dataType for unsupported values — makeHealthKitSampleType has already thrown by
// the time labels matter.
func makeHealthDataTypeLabel(dataType: String) -> String {
    switch dataType {
    case "bloodPressure":
        return "blood pressure"
    case "sleep":
        return "sleep"
    case "workout":
        return "workouts"
    default:
        guard let descriptor = try? makeHealthDataTypeDescriptor(dataType: dataType) else {
            return dataType
        }

        return descriptor.label
    }
}
