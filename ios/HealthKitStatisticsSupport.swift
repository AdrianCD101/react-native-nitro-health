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

/// HealthKit has no ready-made blood glucose unit; compose mmol/L from the molar mass so the
/// JS surface's `millimolesPerLiter` maps without conversion. Shared by the descriptor, save
/// mapping, and change mapping so all three always agree.
let bloodGlucoseMmolPerLiterUnit = HKUnit.moleUnit(
    with: .milli,
    molarMass: HKUnitMolarMassBloodGlucose
).unitDivided(by: HKUnit.liter())

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
    // Aggregate-only: JS routes only readStatistics and read permissions here. There is no
    // "totalEnergyBurned" case on purpose — it spans two quantity types (active + basal), so
    // it is composed in readStatistics and unknown-string lookups must keep throwing.
    case "basalEnergyBurned":
        return HealthDataTypeDescriptor(
            identifier: .basalEnergyBurned,
            unit: HKUnit.kilocalorie(),
            label: "basal energy burned",
            isCumulative: true
        )
    case "hydration":
        return HealthDataTypeDescriptor(
            identifier: .dietaryWater,
            unit: HKUnit.literUnit(with: .milli),
            label: "hydration",
            isCumulative: true
        )
    case "floorsClimbed":
        return HealthDataTypeDescriptor(
            identifier: .flightsClimbed,
            unit: HKUnit.count(),
            label: "floors climbed",
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
    case "restingHeartRate":
        return HealthDataTypeDescriptor(
            identifier: .restingHeartRate,
            unit: HKUnit.count().unitDivided(by: HKUnit.minute()),
            label: "resting heart rate",
            isCumulative: false
        )
    case "heartRateVariability":
        return HealthDataTypeDescriptor(
            identifier: .heartRateVariabilitySDNN,
            unit: HKUnit.secondUnit(with: .milli),
            label: "heart rate variability",
            isCumulative: false
        )
    case "oxygenSaturation":
        // HealthKit stores this as a fraction (0-1 via HKUnit.percent()); the JS surface uses
        // 0-100. Statistics are unreachable today because JS rejects metrics for this data type
        // (see STATISTICS_METRICS_BY_DATA_TYPE), but if that ever changes, readStatistics must
        // convert this unit's output the same way readOxygenSaturation/save do (*100 / /100).
        return HealthDataTypeDescriptor(identifier: .oxygenSaturation, unit: HKUnit.percent(), label: "oxygen saturation", isCumulative: false)
    case "height":
        return HealthDataTypeDescriptor(identifier: .height, unit: HKUnit.meter(), label: "height", isCumulative: false)
    case "vo2Max":
        return HealthDataTypeDescriptor(
            identifier: .vo2Max,
            unit: HKUnit.literUnit(with: .milli).unitDivided(
                by: HKUnit.gramUnit(with: .kilo).unitMultiplied(by: HKUnit.minute())
            ),
            label: "VO2 max",
            isCumulative: false
        )
    case "bloodGlucose":
        return HealthDataTypeDescriptor(
            identifier: .bloodGlucose,
            unit: bloodGlucoseMmolPerLiterUnit,
            label: "blood glucose",
            isCumulative: false
        )
    case "bodyTemperature":
        return HealthDataTypeDescriptor(
            identifier: .bodyTemperature,
            unit: HKUnit.degreeCelsius(),
            label: "body temperature",
            isCumulative: false
        )
    case "respiratoryRate":
        return HealthDataTypeDescriptor(
            identifier: .respiratoryRate,
            unit: HKUnit.count().unitDivided(by: HKUnit.minute()),
            label: "respiratory rate",
            isCumulative: false
        )
    case "bodyFat":
        // HealthKit stores this as a fraction (0-1 via HKUnit.percent()); the JS surface uses
        // 0-100. Statistics are permanently unreachable cross-platform (Health Connect has no
        // aggregate metrics for BodyFatRecord), but if a statistics path ever existed, it would
        // need the same *100 / /100 conversion that readBodyFat/save apply.
        return HealthDataTypeDescriptor(identifier: .bodyFatPercentage, unit: HKUnit.percent(), label: "body fat", isCumulative: false)
    case "leanBodyMass":
        return HealthDataTypeDescriptor(
            identifier: .leanBodyMass,
            unit: HKUnit.gramUnit(with: .kilo),
            label: "lean body mass",
            isCumulative: false
        )
    case "basalBodyTemperature":
        return HealthDataTypeDescriptor(
            identifier: .basalBodyTemperature,
            unit: HKUnit.degreeCelsius(),
            label: "basal body temperature",
            isCumulative: false
        )
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
