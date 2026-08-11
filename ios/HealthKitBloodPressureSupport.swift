//
//  HealthKitBloodPressureSupport.swift
//  Pods
//
//  Blood pressure is HealthKit's only correlation-backed data type in this library: one
//  reading is an HKCorrelation wrapping a systolic and a diastolic HKQuantitySample.
//  Correlation types cannot be passed to requestAuthorization or observer queries, so the
//  helpers here resolve the right HealthKit types per workflow. This file is HealthKit-only,
//  so it must NOT be added to Package.swift's pure-Foundation SPM test target; the podspec
//  globs ios/**/*.swift and picks it up automatically.
//

import Foundation
import HealthKit

let bloodPressureMmHgUnit = HKUnit.millimeterOfMercury()

func makeBloodPressureCorrelationType() throws -> HKCorrelationType {
    guard let correlationType = HKObjectType.correlationType(forIdentifier: .bloodPressure) else {
        throw permissionError("Health data type is not available on this device: bloodPressure")
    }

    return correlationType
}

func makeBloodPressureQuantityTypes() throws -> (systolic: HKQuantityType, diastolic: HKQuantityType) {
    guard
        let systolic = HKObjectType.quantityType(forIdentifier: .bloodPressureSystolic),
        let diastolic = HKObjectType.quantityType(forIdentifier: .bloodPressureDiastolic)
    else {
        throw permissionError("Health data type is not available on this device: bloodPressure")
    }

    return (systolic: systolic, diastolic: diastolic)
}

// Read-authorization checks go through getRequestStatusForAuthorization, which rejects
// correlation types; blood pressure resolves to its two member quantity types instead.
func makeReadAuthorizationObjectTypes(dataType: String) throws -> Set<HKObjectType> {
    if dataType == "bloodPressure" {
        let types = try makeBloodPressureQuantityTypes()
        return [types.systolic, types.diastolic]
    }

    return [try makeHealthKitSampleType(dataType: dataType)]
}

// Observer queries and enableBackgroundDelivery reject correlation types. Every blood
// pressure correlation contains a systolic member sample, so observing the systolic
// quantity type is a faithful change trigger for the data type.
func makeBackgroundDeliverySampleType(dataType: String) throws -> HKSampleType {
    if dataType == "bloodPressure" {
        return try makeBloodPressureQuantityTypes().systolic
    }

    return try makeHealthKitSampleType(dataType: dataType)
}
