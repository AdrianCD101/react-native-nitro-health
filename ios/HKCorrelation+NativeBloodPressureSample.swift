//
//  HKCorrelation+NativeBloodPressureSample.swift
//  Pods
//
//  Maps one blood pressure HKCorrelation onto the flat native transport sample. This file
//  is HealthKit-only, so it must NOT be added to Package.swift's pure-Foundation SPM test
//  target; the podspec globs ios/**/*.swift and picks it up automatically.
//

import Foundation
import HealthKit

extension HKCorrelation {
    // A well-formed blood pressure correlation contains exactly one systolic and one
    // diastolic member sample. Anything else is malformed third-party data; throwing keeps
    // the divergence policy (never fabricate values) instead of silently guessing.
    func nativeBloodPressureSample(
        systolicType: HKQuantityType,
        diastolicType: HKQuantityType
    ) throws -> NativeBloodPressureSample {
        let systolicSamples = objects(for: systolicType).compactMap { $0 as? HKQuantitySample }
        let diastolicSamples = objects(for: diastolicType).compactMap { $0 as? HKQuantitySample }

        guard
            systolicSamples.count == 1,
            diastolicSamples.count == 1,
            let systolic = systolicSamples.first,
            let diastolic = diastolicSamples.first
        else {
            throw NSError(
                domain: "NitroHealth",
                code: 4,
                userInfo: [
                    NSLocalizedDescriptionKey: "Unable to map blood pressure correlation \(uuid.uuidString): expected exactly one systolic and one diastolic member sample",
                ]
            )
        }

        return NativeBloodPressureSample(
            identity: nativeHealthSampleIdentity,
            origin: nativeHealthDataOrigin,
            device: nativeHealthDeviceInfo,
            recordingMethod: nativeHealthRecordingMethod,
            timeMs: startDate.timeIntervalSince1970 * 1000,
            systolicMmHg: systolic.quantity.doubleValue(for: bloodPressureMmHgUnit),
            diastolicMmHg: diastolic.quantity.doubleValue(for: bloodPressureMmHgUnit),
            androidBodyPosition: nil,
            androidMeasurementLocation: nil
        )
    }
}
