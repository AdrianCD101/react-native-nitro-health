//
//  SampleInputMapping.swift
//  Pods
//
//  Created by Adrian White on 7/19/2026.
//

import Foundation
import HealthKit

func makeStepQuantitySamples(
    samples: [NativeStepSampleInput],
    quantityType: HKQuantityType
) -> [HKQuantitySample] {
    return samples.map { sample in
        HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: HKUnit.count(), doubleValue: sample.count),
            start: Date(timeIntervalSince1970: sample.startTimeMs / 1000),
            end: Date(timeIntervalSince1970: sample.endTimeMs / 1000)
        )
    }
}

func makeDistanceQuantitySamples(
    samples: [NativeDistanceSampleInput],
    quantityType: HKQuantityType
) -> [HKQuantitySample] {
    return samples.map { sample in
        HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: HKUnit.meter(), doubleValue: sample.distanceMeters),
            start: Date(timeIntervalSince1970: sample.startTimeMs / 1000),
            end: Date(timeIntervalSince1970: sample.endTimeMs / 1000)
        )
    }
}

func makeActiveEnergyBurnedQuantitySamples(
    samples: [NativeActiveEnergyBurnedSampleInput],
    quantityType: HKQuantityType
) -> [HKQuantitySample] {
    return samples.map { sample in
        HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: HKUnit.kilocalorie(), doubleValue: sample.kilocalories),
            start: Date(timeIntervalSince1970: sample.startTimeMs / 1000),
            end: Date(timeIntervalSince1970: sample.endTimeMs / 1000)
        )
    }
}

func makeHeartRateQuantitySamples(
    samples: [NativeHeartRateSampleInput],
    quantityType: HKQuantityType
) -> [HKQuantitySample] {
    let bpmUnit = HKUnit.count().unitDivided(by: HKUnit.minute())

    return samples.map { sample in
        let date = Date(timeIntervalSince1970: sample.timeMs / 1000)

        return HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: bpmUnit, doubleValue: sample.bpm),
            start: date,
            end: date
        )
    }
}

func makeBodyMassQuantitySamples(
    samples: [NativeBodyMassSampleInput],
    quantityType: HKQuantityType
) -> [HKQuantitySample] {
    let kilogramUnit = HKUnit.gramUnit(with: .kilo)

    return samples.map { sample in
        let date = Date(timeIntervalSince1970: sample.timeMs / 1000)

        return HKQuantitySample(
            type: quantityType,
            quantity: HKQuantity(unit: kilogramUnit, doubleValue: sample.kilograms),
            start: date,
            end: date
        )
    }
}
