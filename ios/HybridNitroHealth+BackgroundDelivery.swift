import HealthKit
import NitroModules

extension HybridNitroHealth {
    func getBackgroundChangesMode() throws -> NativeBackgroundChangesMode {
        return .observer
    }

    func configureBackgroundChanges(
        dataTypes: [String],
        frequency: BackgroundDeliveryFrequency
    ) throws -> Promise<NativeBackgroundChangesResult> {
        guard HKHealthStore.isHealthDataAvailable() else {
            return Promise<NativeBackgroundChangesResult>.resolved(
                withResult: makeBackgroundChangesResult(status: .unavailable)
            )
        }
        return Promise<NativeBackgroundChangesResult>.async {
            try await NitroHealthBackgroundDelivery.shared.configure(
                dataTypes: dataTypes,
                frequency: frequency.healthKitUpdateFrequency
            )
            return makeBackgroundChangesResult(status: .completed)
        }
    }

    func disableBackgroundChanges(dataTypes: [String]?) throws -> Promise<NativeBackgroundChangesResult> {
        guard HKHealthStore.isHealthDataAvailable() else {
            return Promise<NativeBackgroundChangesResult>.resolved(
                withResult: makeBackgroundChangesResult(status: .unavailable)
            )
        }

        return Promise<NativeBackgroundChangesResult>.async {
            if let dataTypes {
                try await NitroHealthBackgroundDelivery.shared.disable(dataTypes: dataTypes)
            } else {
                try await NitroHealthBackgroundDelivery.shared.disableAll()
            }
            return makeBackgroundChangesResult(status: .completed)
        }
    }

    func setOnBackgroundChangeListener(
        listener: (([String], String) -> Void)?
    ) throws -> Bool {
        NitroHealthBackgroundDelivery.shared.setListener(listener)
        return true
    }

    func acknowledgeBackgroundChange(deliveryId: String) throws -> Bool {
        return NitroHealthBackgroundDelivery.shared.acknowledge(deliveryId: deliveryId)
    }
}

private func makeBackgroundChangesResult(
    status: NativeBackgroundChangesResultStatus
) -> NativeBackgroundChangesResult {
    return NativeBackgroundChangesResult(
        status: status,
        mode: .observer,
        backgroundRead: .included
    )
}
