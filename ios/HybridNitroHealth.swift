//
//  HybridNitroHealth.swift
//  Pods
//
//  Created by Adrian White on 4/27/2026.
//

import Foundation
import HealthKit
import NitroModules
import UIKit

private let healthStore = HKHealthStore()

private func permissionError(_ message: String) -> NSError {
    return NSError(domain: "NitroHealth", code: 1, userInfo: [NSLocalizedDescriptionKey: message])
}

class HybridNitroHealth: HybridNitroHealthSpec {
    func isAvailable() throws -> Bool {
        return try getAvailabilityStatus() == .available
    }

    func getAvailabilityStatus() throws -> HealthAvailabilityStatus {
        return HKHealthStore.isHealthDataAvailable() ? .available : .unavailable
    }

    func openHealthConnectInstall() throws -> Bool {
        return false
    }

    func openHealthSettings() throws -> Promise<Bool> {
        return Promise<Bool>.async {
            return await withCheckedContinuation { (continuation: CheckedContinuation<Bool, Never>) in
                DispatchQueue.main.async {
                    guard let url = URL(string: UIApplication.openSettingsURLString) else {
                        continuation.resume(returning: false)
                        return
                    }

                    UIApplication.shared.open(url) { success in
                        continuation.resume(returning: success)
                    }
                }
            }
        }
    }

    func getRequestStatusForAuthorization(permissions: [NativeHealthPermission]) throws -> Promise<AuthorizationRequestStatus> {
        if !HKHealthStore.isHealthDataAvailable() {
            return Promise<AuthorizationRequestStatus>.resolved(withResult: AuthorizationRequestStatus.unknown)
        }

        let healthKitTypes = try makeHealthKitTypeSets(permissions: permissions)

        return Promise<AuthorizationRequestStatus>.async {
            return try await self.getAuthorizationRequestStatus(healthKitTypes: healthKitTypes)
        }
    }

    func requestAuthorization(permissions: [NativeHealthPermission]) throws -> Promise<NativeHealthAuthorizationResult> {
        if !HKHealthStore.isHealthDataAvailable() {
            return Promise<NativeHealthAuthorizationResult>.resolved(
                withResult: makeAuthorizationResult(
                    permissions: permissions,
                    availabilityStatus: .unavailable,
                    requestStatus: .unknown,
                    deniedPermissions: permissions
                )
            )
        }

        let healthKitTypes = try makeHealthKitTypeSets(permissions: permissions)

        return Promise<NativeHealthAuthorizationResult>.async {
            let success = try await self.requestHealthKitAuthorization(healthKitTypes: healthKitTypes)

            if !success {
                return self.makeAuthorizationResult(
                    permissions: permissions,
                    availabilityStatus: .available,
                    requestStatus: .unknown,
                    deniedPermissions: permissions
                )
            }

            let requestStatus = try await self.getAuthorizationRequestStatus(healthKitTypes: healthKitTypes)
            return try self.makeHealthKitAuthorizationResult(
                permissions: permissions,
                requestStatus: requestStatus
            )
        }
    }

    private func requestHealthKitAuthorization(healthKitTypes: (
        toShare: Set<HKSampleType>,
        toRead: Set<HKObjectType>
    )) async throws -> Bool {
        return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Bool, Error>) in
            healthStore.requestAuthorization(
                toShare: healthKitTypes.toShare,
                read: healthKitTypes.toRead
            ) { success, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                continuation.resume(returning: success)
            }
        }
    }

    private func getAuthorizationRequestStatus(healthKitTypes: (
        toShare: Set<HKSampleType>,
        toRead: Set<HKObjectType>
    )) async throws -> AuthorizationRequestStatus {
        return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<AuthorizationRequestStatus, Error>) in
            healthStore.getRequestStatusForAuthorization(
                toShare: healthKitTypes.toShare,
                read: healthKitTypes.toRead
            ) { status, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                switch status {
                case .unknown:
                    continuation.resume(returning: AuthorizationRequestStatus.unknown)
                case .shouldRequest:
                    continuation.resume(returning: AuthorizationRequestStatus.shouldrequest)
                case .unnecessary:
                    continuation.resume(returning: AuthorizationRequestStatus.unnecessary)
                @unknown default:
                    continuation.resume(returning: AuthorizationRequestStatus.unknown)
                }
            }
        }
    }

    private func makeHealthKitAuthorizationResult(
        permissions: [NativeHealthPermission],
        requestStatus: AuthorizationRequestStatus
    ) throws -> NativeHealthAuthorizationResult {
        var grantedPermissions = [NativeHealthPermission]()
        var deniedPermissions = [NativeHealthPermission]()
        var unverifiablePermissions = [NativeHealthPermission]()

        for permission in permissions {
            switch permission.accessType {
            case "read":
                unverifiablePermissions.append(permission)
            case "write":
                let quantityType = try makeHealthKitQuantityType(dataType: permission.dataType)
                if healthStore.authorizationStatus(for: quantityType) == .sharingAuthorized {
                    grantedPermissions.append(permission)
                } else {
                    deniedPermissions.append(permission)
                }
            default:
                throw permissionError("Unsupported health permission access type: \(permission.accessType)")
            }
        }

        return makeAuthorizationResult(
            permissions: permissions,
            availabilityStatus: .available,
            requestStatus: requestStatus,
            grantedPermissions: grantedPermissions,
            deniedPermissions: deniedPermissions,
            unverifiablePermissions: unverifiablePermissions
        )
    }

    private func makeAuthorizationResult(
        permissions: [NativeHealthPermission],
        availabilityStatus: HealthAvailabilityStatus,
        requestStatus: AuthorizationRequestStatus,
        grantedPermissions: [NativeHealthPermission] = [],
        deniedPermissions: [NativeHealthPermission] = [],
        unverifiablePermissions: [NativeHealthPermission] = []
    ) -> NativeHealthAuthorizationResult {
        let status: HealthAuthorizationStatus

        if availabilityStatus != .available {
            status = .unavailable
        } else if !unverifiablePermissions.isEmpty && deniedPermissions.isEmpty {
            status = .completed
        } else if deniedPermissions.isEmpty {
            status = .granted
        } else if !grantedPermissions.isEmpty || !unverifiablePermissions.isEmpty {
            status = .partial
        } else {
            status = .denied
        }

        return NativeHealthAuthorizationResult(
            status: status,
            availabilityStatus: availabilityStatus,
            requestStatus: requestStatus,
            grantedPermissions: grantedPermissions,
            deniedPermissions: deniedPermissions,
            unverifiablePermissions: unverifiablePermissions
        )
    }

    private func makeHealthKitTypeSets(permissions: [NativeHealthPermission]) throws -> (
        toShare: Set<HKSampleType>,
        toRead: Set<HKObjectType>
    ) {
        var toShare = Set<HKSampleType>()
        var toRead = Set<HKObjectType>()

        for permission in permissions {
            let quantityType = try makeHealthKitQuantityType(dataType: permission.dataType)

            switch permission.accessType {
            case "read":
                toRead.insert(quantityType)
            case "write":
                toShare.insert(quantityType)
            default:
                throw permissionError("Unsupported health permission access type: \(permission.accessType)")
            }
        }

        return (toShare, toRead)
    }

    private func makeHealthKitQuantityType(dataType: String) throws -> HKQuantityType {
        let identifier: HKQuantityTypeIdentifier
        switch dataType {
        case "steps":
            identifier = .stepCount
        case "heartRate":
            identifier = .heartRate
        default:
            throw permissionError("Unsupported health data type: \(dataType)")
        }

        guard let quantityType = HKObjectType.quantityType(forIdentifier: identifier) else {
            throw permissionError("Health data type is not available on this device: \(dataType)")
        }

        return quantityType
    }
}
