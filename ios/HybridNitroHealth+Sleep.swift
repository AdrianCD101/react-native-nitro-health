import HealthKit
import NitroModules

extension HybridNitroHealth {
    func saveSleepSessions(sessions: [NativeSleepSessionInput]) throws -> Promise<Void> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<Void>.async {
            guard let categoryType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
                throw permissionError("Health data type is not available on this device: sleep")
            }

            try self.requireWriteAuthorization(for: categoryType, label: "sleep")
            let samples = try makeSleepCategorySamples(
                sessions: sessions,
                categoryType: categoryType
            )
            try await self.saveHealthKitSamples(samples)
        }
    }
}
