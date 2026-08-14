//
//  SampleInputMapping.swift
//  Pods
//
//  Created by Adrian White on 7/19/2026.
//

import Foundation
import HealthKit

func makeHealthKitSyncMetadata(
    syncId: String?,
    syncVersion: Double?
) throws -> [String: Any]? {
    guard let syncMetadata = try normalizeSyncMetadata(
        syncId: syncId,
        syncVersion: syncVersion
    ) else {
        return nil
    }

    return [
        HKMetadataKeySyncIdentifier: syncMetadata.identifier,
        HKMetadataKeySyncVersion: NSNumber(value: syncMetadata.version),
    ]
}

func makeStepQuantitySamples(
    samples: [NativeStepSampleInput],
    quantityType: HKQuantityType
) throws -> [HKQuantitySample] {
    return try samples.map { sample in
        HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: HKUnit.count(), doubleValue: sample.count),
            start: Date(timeIntervalSince1970: sample.startTimeMs / 1000),
            end: Date(timeIntervalSince1970: sample.endTimeMs / 1000),
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion
            )
        )
    }
}

func makeDistanceQuantitySamples(
    samples: [NativeDistanceSampleInput],
    quantityType: HKQuantityType
) throws -> [HKQuantitySample] {
    return try samples.map { sample in
        HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: HKUnit.meter(), doubleValue: sample.distanceMeters),
            start: Date(timeIntervalSince1970: sample.startTimeMs / 1000),
            end: Date(timeIntervalSince1970: sample.endTimeMs / 1000),
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion
            )
        )
    }
}

func makeActiveEnergyBurnedQuantitySamples(
    samples: [NativeActiveEnergyBurnedSampleInput],
    quantityType: HKQuantityType
) throws -> [HKQuantitySample] {
    return try samples.map { sample in
        HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: HKUnit.kilocalorie(), doubleValue: sample.kilocalories),
            start: Date(timeIntervalSince1970: sample.startTimeMs / 1000),
            end: Date(timeIntervalSince1970: sample.endTimeMs / 1000),
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion
            )
        )
    }
}

func makeHydrationQuantitySamples(
    samples: [NativeHydrationSampleInput],
    quantityType: HKQuantityType
) throws -> [HKQuantitySample] {
    return try samples.map { sample in
        HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(
                unit: HKUnit.literUnit(with: .milli),
                doubleValue: sample.milliliters
            ),
            start: Date(timeIntervalSince1970: sample.startTimeMs / 1000),
            end: Date(timeIntervalSince1970: sample.endTimeMs / 1000),
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion
            )
        )
    }
}

func makeFloorsClimbedQuantitySamples(
    samples: [NativeFloorsClimbedSampleInput],
    quantityType: HKQuantityType
) throws -> [HKQuantitySample] {
    return try samples.map { sample in
        HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: HKUnit.count(), doubleValue: sample.floors),
            start: Date(timeIntervalSince1970: sample.startTimeMs / 1000),
            end: Date(timeIntervalSince1970: sample.endTimeMs / 1000),
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion
            )
        )
    }
}

func makeHeartRateQuantitySamples(
    samples: [NativeHeartRateSampleInput],
    quantityType: HKQuantityType
) throws -> [HKQuantitySample] {
    let bpmUnit = HKUnit.count().unitDivided(by: HKUnit.minute())

    return try samples.map { sample in
        let date = Date(timeIntervalSince1970: sample.timeMs / 1000)

        return HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: bpmUnit, doubleValue: sample.bpm),
            start: date,
            end: date,
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion
            )
        )
    }
}

// Sync identity goes on the correlation AND both member samples (with derived member ids)
// so a versioned re-save replaces all three objects in one call; correlation-only identity
// would orphan the previous members as stray systolic/diastolic samples.
func makeBloodPressureCorrelations(
    samples: [NativeBloodPressureSampleInput],
    correlationType: HKCorrelationType,
    quantityTypes: (systolic: HKQuantityType, diastolic: HKQuantityType)
) throws -> [HKCorrelation] {
    return try samples.map { sample in
        let date = Date(timeIntervalSince1970: sample.timeMs / 1000)

        let systolic = HKQuantitySample(
            type: quantityTypes.systolic,
            quantity: HKQuantity(unit: bloodPressureMmHgUnit, doubleValue: sample.systolicMmHg),
            start: date,
            end: date,
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId.map { "\($0)#systolic" },
                syncVersion: sample.syncVersion
            )
        )
        let diastolic = HKQuantitySample(
            type: quantityTypes.diastolic,
            quantity: HKQuantity(unit: bloodPressureMmHgUnit, doubleValue: sample.diastolicMmHg),
            start: date,
            end: date,
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId.map { "\($0)#diastolic" },
                syncVersion: sample.syncVersion
            )
        )

        return HKCorrelation(
            type: correlationType,
            start: date,
            end: date,
            objects: [systolic, diastolic],
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion
            )
        )
    }
}

func makeBodyMassQuantitySamples(
    samples: [NativeBodyMassSampleInput],
    quantityType: HKQuantityType
) throws -> [HKQuantitySample] {
    let kilogramUnit = HKUnit.gramUnit(with: .kilo)

    return try samples.map { sample in
        let date = Date(timeIntervalSince1970: sample.timeMs / 1000)

        return HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: kilogramUnit, doubleValue: sample.kilograms),
            start: date,
            end: date,
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion
            )
        )
    }
}

func makeRestingHeartRateQuantitySamples(
    samples: [NativeRestingHeartRateSampleInput],
    quantityType: HKQuantityType
) throws -> [HKQuantitySample] {
    let bpmUnit = HKUnit.count().unitDivided(by: HKUnit.minute())

    return try samples.map { sample in
        let date = Date(timeIntervalSince1970: sample.timeMs / 1000)

        return HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: bpmUnit, doubleValue: sample.bpm),
            start: date,
            end: date,
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion
            )
        )
    }
}

func makeBloodGlucoseQuantitySamples(
    samples: [NativeBloodGlucoseSampleInput],
    quantityType: HKQuantityType
) throws -> [HKQuantitySample] {
    return try samples.map { sample in
        let date = Date(timeIntervalSince1970: sample.timeMs / 1000)

        return HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: bloodGlucoseMmolPerLiterUnit, doubleValue: sample.millimolesPerLiter),
            start: date,
            end: date,
            metadata: try sample.healthKitMetadata()
        )
    }
}

func makeBodyTemperatureQuantitySamples(
    samples: [NativeBodyTemperatureSampleInput],
    quantityType: HKQuantityType
) throws -> [HKQuantitySample] {
    return try samples.map { sample in
        let date = Date(timeIntervalSince1970: sample.timeMs / 1000)

        return HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: HKUnit.degreeCelsius(), doubleValue: sample.celsius),
            start: date,
            end: date,
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion
            )
        )
    }
}

func makeRespiratoryRateQuantitySamples(
    samples: [NativeRespiratoryRateSampleInput],
    quantityType: HKQuantityType
) throws -> [HKQuantitySample] {
    let breathsPerMinuteUnit = HKUnit.count().unitDivided(by: HKUnit.minute())

    return try samples.map { sample in
        let date = Date(timeIntervalSince1970: sample.timeMs / 1000)

        return HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: breathsPerMinuteUnit, doubleValue: sample.breathsPerMinute),
            start: date,
            end: date,
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion
            )
        )
    }
}

func makeBodyFatQuantitySamples(
    samples: [NativeBodyFatSampleInput],
    quantityType: HKQuantityType
) throws -> [HKQuantitySample] {
    return try samples.map { sample in
        let date = Date(timeIntervalSince1970: sample.timeMs / 1000)

        return HKQuantitySample(
            type: quantityType,
            // HealthKit stores body fat as a fraction (0-1); the JS surface uses
            // percentage (0-100), so convert here (inverse of the *100 in readBodyFat).
            quantity: HKQuantity(unit: HKUnit.percent(), doubleValue: sample.percentage / 100),
            start: date,
            end: date,
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion
            )
        )
    }
}

func makeLeanBodyMassQuantitySamples(
    samples: [NativeLeanBodyMassSampleInput],
    quantityType: HKQuantityType
) throws -> [HKQuantitySample] {
    let kilogramUnit = HKUnit.gramUnit(with: .kilo)

    return try samples.map { sample in
        let date = Date(timeIntervalSince1970: sample.timeMs / 1000)

        return HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: kilogramUnit, doubleValue: sample.kilograms),
            start: date,
            end: date,
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion
            )
        )
    }
}

func makeBasalBodyTemperatureQuantitySamples(
    samples: [NativeBasalBodyTemperatureSampleInput],
    quantityType: HKQuantityType
) throws -> [HKQuantitySample] {
    return try samples.map { sample in
        let date = Date(timeIntervalSince1970: sample.timeMs / 1000)

        return HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: HKUnit.degreeCelsius(), doubleValue: sample.celsius),
            start: date,
            end: date,
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion
            )
        )
    }
}

func makeOxygenSaturationQuantitySamples(
    samples: [NativeOxygenSaturationSampleInput],
    quantityType: HKQuantityType
) throws -> [HKQuantitySample] {
    return try samples.map { sample in
        let date = Date(timeIntervalSince1970: sample.timeMs / 1000)

        return HKQuantitySample(
            type: quantityType,
            // HealthKit stores oxygen saturation as a fraction (0-1); the JS surface uses
            // percentage (0-100), so convert here (inverse of the *100 in readOxygenSaturation).
            quantity: HKQuantity(unit: HKUnit.percent(), doubleValue: sample.percentage / 100),
            start: date,
            end: date,
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion
            )
        )
    }
}

func makeHeightQuantitySamples(
    samples: [NativeHeightSampleInput],
    quantityType: HKQuantityType
) throws -> [HKQuantitySample] {
    return try samples.map { sample in
        let date = Date(timeIntervalSince1970: sample.timeMs / 1000)

        return HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: HKUnit.meter(), doubleValue: sample.meters),
            start: date,
            end: date,
            metadata: try makeHealthKitSyncMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion
            )
        )
    }
}

func makeVo2MaxQuantitySamples(
    samples: [NativeVo2MaxSampleInput],
    quantityType: HKQuantityType
) throws -> [HKQuantitySample] {
    let vo2MaxUnit = HKUnit.literUnit(with: .milli).unitDivided(
        by: HKUnit.gramUnit(with: .kilo).unitMultiplied(by: HKUnit.minute())
    )

    return try samples.map { sample in
        let date = Date(timeIntervalSince1970: sample.timeMs / 1000)

        return HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(
                unit: vo2MaxUnit,
                doubleValue: sample.millilitersPerKilogramPerMinute
            ),
            start: date,
            end: date,
            metadata: try sample.healthKitMetadata()
        )
    }
}
