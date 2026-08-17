//
//  HKCorrelation+NativeNutritionSample.swift
//  Pods
//
//  Maps one food HKCorrelation onto the flat native transport sample. Unlike blood
//  pressure, third-party food correlations are legitimately heterogeneous — any subset of
//  dietary types, possibly several member samples per type — so tracked nutrients are
//  summed per type and untracked member types (like dietary water) are ignored rather
//  than treated as malformed. This file is HealthKit-only, so it must NOT be added to
//  Package.swift's pure-Foundation SPM test target; the podspec globs ios/**/*.swift and
//  picks it up automatically.
//

import Foundation
import HealthKit

extension HKCorrelation {
    func nativeNutritionSample() throws -> NativeNutritionSample {
        func summedValue(_ descriptor: NutritionNutrientDescriptor) throws -> Double? {
            let quantityType = try makeNutritionQuantityType(descriptor)
            let members = objects(for: quantityType).compactMap { $0 as? HKQuantitySample }
            guard !members.isEmpty else {
                return nil
            }

            return members.reduce(0) { total, member in
                total + member.quantity.doubleValue(for: descriptor.unit)
            }
        }

        let mealType = (metadata?[nutritionMealTypeMetadataKey] as? String)
            .flatMap { NativeNutritionMealType(fromString: $0) }

        return NativeNutritionSample(
            sampleMetadata: nativeHealthSampleMetadata,
            startTimeMs: startDate.timeIntervalSince1970 * 1000,
            endTimeMs: endDate.timeIntervalSince1970 * 1000,
            foodName: metadata?[HKMetadataKeyFoodType] as? String,
            mealType: mealType,
            energyKilocalories: try summedValue(NutritionNutrients.energy),
            proteinGrams: try summedValue(NutritionNutrients.protein),
            totalCarbohydrateGrams: try summedValue(NutritionNutrients.totalCarbohydrate),
            totalFatGrams: try summedValue(NutritionNutrients.totalFat),
            dietaryFiberGrams: try summedValue(NutritionNutrients.dietaryFiber),
            sugarGrams: try summedValue(NutritionNutrients.sugar),
            sodiumMilligrams: try summedValue(NutritionNutrients.sodium)
        )
    }
}
