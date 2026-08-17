import Foundation
import HealthKit

extension NativeNutritionSampleInput {
    // Correlation-level metadata: provenance/sync plus the food name under HealthKit's
    // standard key and the meal type under the library-owned key.
    func healthKitCorrelationMetadata() throws -> [String: Any]? {
        var metadata = try writeMetadata.healthKitMetadata() ?? [:]

        if let foodName {
            metadata[HKMetadataKeyFoodType] = foodName
        }
        if let mealType {
            metadata[nutritionMealTypeMetadataKey] = mealType.stringValue
        }

        return metadata.isEmpty ? nil : metadata
    }
}
