//
//  HealthKitStatisticsSupport.swift
//  Pods
//
//  Single source of truth for the "dataType" domain ("steps", "distance",
//  "activeEnergyBurned", "heartRate", "bodyMass") shared by reads, saves, and
//  readStatistics in HybridNitroHealth.swift. This file is HealthKit-only, so
//  it must NOT be added to Package.swift's pure-Foundation SPM test target;
//  the podspec globs ios/*.swift and picks it up automatically.
//

import HealthKit

struct HealthDataTypeDescriptor {
    let identifier: HKQuantityTypeIdentifier
    let unit: HKUnit
    let label: String
    let isCumulative: Bool
}

func makeHealthDataTypeDescriptor(dataType: String) throws -> HealthDataTypeDescriptor {
    switch dataType {
    case "steps":
        return HealthDataTypeDescriptor(identifier: .stepCount, unit: HKUnit.count(), label: "steps", isCumulative: true)
    case "distance":
        return HealthDataTypeDescriptor(identifier: .distanceWalkingRunning, unit: HKUnit.meter(), label: "distance", isCumulative: true)
    case "activeEnergyBurned":
        return HealthDataTypeDescriptor(
            identifier: .activeEnergyBurned,
            unit: HKUnit.kilocalorie(),
            label: "active energy burned",
            isCumulative: true
        )
    case "heartRate":
        return HealthDataTypeDescriptor(
            identifier: .heartRate,
            unit: HKUnit.count().unitDivided(by: HKUnit.minute()),
            label: "heart rate",
            isCumulative: false
        )
    case "bodyMass":
        return HealthDataTypeDescriptor(identifier: .bodyMass, unit: HKUnit.gramUnit(with: .kilo), label: "body mass", isCumulative: false)
    default:
        throw permissionError("Unsupported health data type: \(dataType)")
    }
}

func makeHealthKitQuantityType(dataType: String) throws -> HKQuantityType {
    let descriptor = try makeHealthDataTypeDescriptor(dataType: dataType)

    guard let quantityType = HKObjectType.quantityType(forIdentifier: descriptor.identifier) else {
        throw permissionError("Health data type is not available on this device: \(dataType)")
    }

    return quantityType
}

// Cumulative types only support 'sum'; discrete types only support 'avg'/'min'/'max'. This
// must run before HKStatisticsCollectionQuery is built: passing mismatched options raises an
// uncatchable NSInvalidArgumentException instead of a catchable Swift error.
func makeStatisticsOptions(dataType: String, isCumulative: Bool, metrics: [String]) throws -> HKStatisticsOptions {
    var options: HKStatisticsOptions = []

    for metric in metrics {
        switch metric {
        case "sum":
            guard isCumulative else {
                throw permissionError("Metric 'sum' is not supported for \(dataType)")
            }
            options.insert(.cumulativeSum)
        case "avg":
            guard !isCumulative else {
                throw permissionError("Metric 'avg' is not supported for \(dataType)")
            }
            options.insert(.discreteAverage)
        case "min":
            guard !isCumulative else {
                throw permissionError("Metric 'min' is not supported for \(dataType)")
            }
            options.insert(.discreteMin)
        case "max":
            guard !isCumulative else {
                throw permissionError("Metric 'max' is not supported for \(dataType)")
            }
            options.insert(.discreteMax)
        default:
            throw permissionError("Unsupported statistics metric: \(metric)")
        }
    }

    return options
}
