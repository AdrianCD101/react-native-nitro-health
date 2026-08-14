//
//  SampleInputMapping.swift
//  Pods
//
//  Created by Adrian White on 7/19/2026.
//

import Foundation
import HealthKit

func makeHealthKitMetadata(
    syncId: String?,
    syncVersion: Double?,
    recordingMethod: NativeHealthRecordingMethod?
) throws -> [String: Any]? {
    var metadata = [String: Any]()

    if let syncMetadata = try normalizeSyncMetadata(
        syncId: syncId,
        syncVersion: syncVersion
    ) {
        metadata[HKMetadataKeySyncIdentifier] = syncMetadata.identifier
        metadata[HKMetadataKeySyncVersion] = NSNumber(value: syncMetadata.version)
    }

    if let wasUserEntered = recordingMethod?.healthKitWasUserEntered {
        metadata[HKMetadataKeyWasUserEntered] = wasUserEntered
    }

    return metadata.isEmpty ? nil : metadata
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
            metadata: try makeHealthKitMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion,
                recordingMethod: sample.recordingMethod
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
            metadata: try makeHealthKitMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion,
                recordingMethod: sample.recordingMethod
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
            metadata: try makeHealthKitMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion,
                recordingMethod: sample.recordingMethod
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
            metadata: try makeHealthKitMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion,
                recordingMethod: sample.recordingMethod
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
            metadata: try makeHealthKitMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion,
                recordingMethod: sample.recordingMethod
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
            metadata: try makeHealthKitMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion,
                recordingMethod: sample.recordingMethod
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
            metadata: try makeHealthKitMetadata(
                syncId: sample.syncId.map { "\($0)#systolic" },
                syncVersion: sample.syncVersion,
                recordingMethod: sample.recordingMethod
            )
        )
        let diastolic = HKQuantitySample(
            type: quantityTypes.diastolic,
            quantity: HKQuantity(unit: bloodPressureMmHgUnit, doubleValue: sample.diastolicMmHg),
            start: date,
            end: date,
            metadata: try makeHealthKitMetadata(
                syncId: sample.syncId.map { "\($0)#diastolic" },
                syncVersion: sample.syncVersion,
                recordingMethod: sample.recordingMethod
            )
        )

        return HKCorrelation(
            type: correlationType,
            start: date,
            end: date,
            objects: [systolic, diastolic],
            metadata: try makeHealthKitMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion,
                recordingMethod: sample.recordingMethod
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
            metadata: try makeHealthKitMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion,
                recordingMethod: sample.recordingMethod
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
            metadata: try makeHealthKitMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion,
                recordingMethod: sample.recordingMethod
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
            metadata: try sample.healthKitMetadata()
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
            metadata: try makeHealthKitMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion,
                recordingMethod: sample.recordingMethod
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
            metadata: try makeHealthKitMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion,
                recordingMethod: sample.recordingMethod
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
            metadata: try makeHealthKitMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion,
                recordingMethod: sample.recordingMethod
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
            metadata: try sample.healthKitMetadata()
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
            metadata: try makeHealthKitMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion,
                recordingMethod: sample.recordingMethod
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
            metadata: try makeHealthKitMetadata(
                syncId: sample.syncId,
                syncVersion: sample.syncVersion,
                recordingMethod: sample.recordingMethod
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
