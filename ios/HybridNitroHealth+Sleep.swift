import HealthKit
import NitroModules

extension HybridNitroHealth {
    func saveSleepSessions(sessions: [NativeSleepSessionInput]) throws -> Promise<NativeHealthWriteResult> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeHealthWriteResult>.async {
            guard let categoryType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
                throw permissionError("Health data type is not available on this device: sleep")
            }

            try self.requireWriteAuthorization(for: categoryType, label: "sleep")
            let mappedSessions = try makeSleepCategorySamples(
                sessions: sessions,
                categoryType: categoryType
            )
            try await self.saveHealthKitSamples(mappedSessions.flatMap { $0.samples })
            return NativeHealthWriteResult(
                storedRecordingMethods: await self.storedRecordingMethods(
                    for: mappedSessions.map(\.envelope)
                )
            )
        }
    }
}
