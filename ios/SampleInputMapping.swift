//
//  SampleInputMapping.swift
//  Pods
//
//  Created by Adrian White on 7/19/2026.
//

import Foundation
import HealthKit

private func makeHealthKitSyncMetadata(
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
