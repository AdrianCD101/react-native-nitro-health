import HealthKit
import NitroModules

extension HybridNitroHealth {
    func enableBackgroundDelivery(
        dataType: String,
        frequency: BackgroundDeliveryFrequency
    ) throws -> Promise<Void> {
        guard HKHealthStore.isHealthDataAvailable() else {
            throw permissionError("Health data is not available")
        }

        return Promise<Void>.async {
            try await NitroHealthBackgroundDelivery.shared.enable(
                dataType: dataType,
                frequency: frequency.healthKitUpdateFrequency
            )
        }
    }

    func disableBackgroundDelivery(dataType: String) throws -> Promise<Void> {
        guard HKHealthStore.isHealthDataAvailable() else {
            throw permissionError("Health data is not available")
        }

        return Promise<Void>.async {
            try await NitroHealthBackgroundDelivery.shared.disable(dataType: dataType)
        }
    }

    func disableAllBackgroundDelivery() throws -> Promise<Void> {
        guard HKHealthStore.isHealthDataAvailable() else {
            throw permissionError("Health data is not available")
        }

        return Promise<Void>.async {
            try await NitroHealthBackgroundDelivery.shared.disableAll()
        }
    }

    func setOnChangeNotificationListener(
        listener: (([String], String) -> Void)?
    ) throws {
        NitroHealthBackgroundDelivery.shared.setListener(listener)
    }

    func acknowledgeChangeNotification(deliveryId: String) throws {
        NitroHealthBackgroundDelivery.shared.acknowledge(deliveryId: deliveryId)
    }

    func getBackgroundReadAuthorizationStatus() throws -> Promise<BackgroundReadAuthorizationStatus> {
        return Promise<BackgroundReadAuthorizationStatus>.resolved(withResult: .unavailable)
    }

    func requestBackgroundReadAuthorization() throws -> Promise<BackgroundReadAuthorizationStatus> {
        return Promise<BackgroundReadAuthorizationStatus>.resolved(withResult: .unavailable)
    }
}
