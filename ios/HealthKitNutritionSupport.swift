//
//  HealthKitNutritionSupport.swift
//  Pods
//
//  Nutrition is correlation-backed like blood pressure: one entry is a food HKCorrelation
//  wrapping one dietary HKQuantitySample per present nutrient. Correlation types cannot be
//  passed to requestAuthorization or observer queries, so the helpers here resolve the
//  right HealthKit types per workflow. This file is HealthKit-only, so it must NOT be
//  added to Package.swift's pure-Foundation SPM test target; the podspec globs
//  ios/**/*.swift and picks it up automatically.
//

import Foundation
import HealthKit

// HealthKit has no standard meal-type metadata key, so entries retain it under this
// library-owned key: round-tripped by this library, semantically opaque to other apps.
let nutritionMealTypeMetadataKey = "com.nitrohealth.meal_type"

struct NutritionNutrientDescriptor {
    let identifier: HKQuantityTypeIdentifier
    let unit: HKUnit
    // Distinguishes member sync identifiers so a versioned re-save replaces every member.
    let syncIdentifierSuffix: String
    let inputValue: KeyPath<NativeNutritionSampleInput, Double?>
}

enum NutritionNutrients {
    static let energy = NutritionNutrientDescriptor(
        identifier: .dietaryEnergyConsumed,
        unit: .kilocalorie(),
        syncIdentifierSuffix: "#energyKilocalories",
        inputValue: \.energyKilocalories
    )
    static let protein = NutritionNutrientDescriptor(
        identifier: .dietaryProtein,
        unit: .gram(),
        syncIdentifierSuffix: "#proteinGrams",
        inputValue: \.proteinGrams
    )
    static let totalCarbohydrate = NutritionNutrientDescriptor(
        identifier: .dietaryCarbohydrates,
        unit: .gram(),
        syncIdentifierSuffix: "#totalCarbohydrateGrams",
        inputValue: \.totalCarbohydrateGrams
    )
    static let totalFat = NutritionNutrientDescriptor(
        identifier: .dietaryFatTotal,
        unit: .gram(),
        syncIdentifierSuffix: "#totalFatGrams",
        inputValue: \.totalFatGrams
    )
    static let dietaryFiber = NutritionNutrientDescriptor(
        identifier: .dietaryFiber,
        unit: .gram(),
        syncIdentifierSuffix: "#dietaryFiberGrams",
        inputValue: \.dietaryFiberGrams
    )
    static let sugar = NutritionNutrientDescriptor(
        identifier: .dietarySugar,
        unit: .gram(),
        syncIdentifierSuffix: "#sugarGrams",
        inputValue: \.sugarGrams
    )
    static let sodium = NutritionNutrientDescriptor(
        identifier: .dietarySodium,
        unit: .gramUnit(with: .milli),
        syncIdentifierSuffix: "#sodiumMilligrams",
        inputValue: \.sodiumMilligrams
    )

    // dietaryWater is deliberately absent: hydration owns water on both platforms.
    static let all: [NutritionNutrientDescriptor] = [
        energy, protein, totalCarbohydrate, totalFat, dietaryFiber, sugar, sodium,
    ]
}

func makeNutritionCorrelationType() throws -> HKCorrelationType {
    guard let correlationType = HKObjectType.correlationType(forIdentifier: .food) else {
        throw permissionError("Health data type is not available on this device: nutrition")
    }

    return correlationType
}

func makeNutritionQuantityType(_ descriptor: NutritionNutrientDescriptor) throws -> HKQuantityType {
    guard let quantityType = HKObjectType.quantityType(forIdentifier: descriptor.identifier) else {
        throw permissionError("Health data type is not available on this device: nutrition")
    }

    return quantityType
}

func makeNutritionQuantityTypes() throws -> [HKQuantityType] {
    return try NutritionNutrients.all.map(makeNutritionQuantityType)
}
