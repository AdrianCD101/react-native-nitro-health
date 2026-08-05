import HealthKit
import NitroModules

extension HybridNitroHealth {
    func getAvailability() throws -> NativeHealthAvailability {
        return makeNativeHealthAvailability()
    }

    func performAvailabilityRecovery() throws -> Promise<NativeHealthAvailabilityRecoveryResult> {
        return Promise<NativeHealthAvailabilityRecoveryResult>.resolved(withResult: .norecoveryaction)
    }

    func getCapabilities() throws -> Promise<NativeHealthCapabilities> {
        return Promise<NativeHealthCapabilities>.resolved(
            withResult: NativeHealthCapabilities(
                backgroundChangesMode: .observer,
                backgroundRead: .included,
                historyRead: .included
            )
        )
    }

    func requestAdditionalAccess(access: String) throws -> Promise<NativeHealthAdditionalAccessStatus> {
        guard access == "background-read" || access == "history-read" else {
            throw permissionError(
                "Unsupported additional health access: \(access). Expected background-read or history-read."
            )
        }

        return Promise<NativeHealthAdditionalAccessStatus>.resolved(withResult: .included)
    }

    func managePermissions() throws -> Promise<NativePermissionWorkflowResult> {
        return Promise<NativePermissionWorkflowResult>.resolved(
            withResult: makeManualHealthAppPermissionWorkflowResult()
        )
    }

    func revokeAllPermissions() throws -> Promise<NativePermissionWorkflowResult> {
        return Promise<NativePermissionWorkflowResult>.resolved(
            withResult: makeManualHealthAppPermissionWorkflowResult()
        )
    }
}

func makeNativeHealthAvailability() -> NativeHealthAvailability {
    guard HKHealthStore.isHealthDataAvailable() else {
        return NativeHealthAvailability(
            status: .unavailable,
            reason: .notsupported,
            recovery: nil
        )
    }

    return NativeHealthAvailability(status: .available, reason: nil, recovery: nil)
}

private func makeManualHealthAppPermissionWorkflowResult() -> NativePermissionWorkflowResult {
    let availability = makeNativeHealthAvailability()
    guard availability.status == .available else {
        return NativePermissionWorkflowResult(
            status: .unavailable,
            actionKind: nil,
            destination: nil,
            availability: availability
        )
    }

    return NativePermissionWorkflowResult(
        status: .useractionrequired,
        actionKind: .manual,
        destination: .healthapppermissions,
        availability: nil
    )
}
