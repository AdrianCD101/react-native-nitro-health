import HealthKit

private func backgroundDeliveryError(_ message: String) -> NSError {
    return NSError(
        domain: "NitroHealth.BackgroundDelivery",
        code: 1,
        userInfo: [NSLocalizedDescriptionKey: message]
    )
}

extension HKHealthStore {
    func enableBackgroundDeliveryOrThrow(
        for sampleType: HKObjectType,
        frequency: HKUpdateFrequency
    ) async throws {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            enableBackgroundDelivery(for: sampleType, frequency: frequency) { success, error in
                if let error {
                    continuation.resume(throwing: error)
                } else if success {
                    continuation.resume()
                } else {
                    continuation.resume(
                        throwing: backgroundDeliveryError(
                            "HealthKit did not enable background delivery for \(sampleType.identifier)"
                        )
                    )
                }
            }
        }
    }

    func disableBackgroundDeliveryOrThrow(for sampleType: HKObjectType) async throws {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            disableBackgroundDelivery(for: sampleType) { success, error in
                if let error {
                    continuation.resume(throwing: error)
                } else if success {
                    continuation.resume()
                } else {
                    continuation.resume(
                        throwing: backgroundDeliveryError(
                            "HealthKit did not disable background delivery for \(sampleType.identifier)"
                        )
                    )
                }
            }
        }
    }

}
