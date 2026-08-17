import HealthKit

func makeHealthKitSampleType(dataType: String) throws -> HKSampleType {
    if dataType == "workout" {
        return HKObjectType.workoutType()
    }

    // Blood pressure records are stored as HKCorrelations, so anchored change queries and
    // delete predicates target the correlation type. Authorization and observer/background
    // delivery cannot use correlation types; those paths resolve the member quantity types
    // via HealthKitBloodPressureSupport.swift instead.
    if dataType == "bloodPressure" {
        return try makeBloodPressureCorrelationType()
    }

    // Nutrition entries are stored as food HKCorrelations; the same correlation-type
    // constraints as blood pressure apply, resolved via HealthKitNutritionSupport.swift.
    if dataType == "nutrition" {
        return try makeNutritionCorrelationType()
    }

    if dataType == "sleep" {
        guard let categoryType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
            throw permissionError("Health data type is not available on this device: sleep")
        }

        return categoryType
    }

    return try makeHealthKitQuantityType(dataType: dataType)
}
