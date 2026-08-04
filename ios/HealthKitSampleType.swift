import HealthKit

func makeHealthKitSampleType(dataType: String) throws -> HKSampleType {
    if dataType == "workout" {
        return HKObjectType.workoutType()
    }

    if dataType == "sleep" {
        guard let categoryType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
            throw permissionError("Health data type is not available on this device: sleep")
        }

        return categoryType
    }

    return try makeHealthKitQuantityType(dataType: dataType)
}
