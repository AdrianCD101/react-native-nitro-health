import HealthKit

extension HKSample {
    var nativeHealthSampleMetadata: NativeHealthSampleMetadata {
        let identity = makeHealthSampleIdentityValues(uuid: uuid)
        let source = sourceRevision.source
        let origin = makeHealthDataOriginValues(
            sourceBundleIdentifier: source.bundleIdentifier,
            sourceName: source.name
        )
        let device = self.device.flatMap {
            makeHealthDeviceInfoValues(
                manufacturer: $0.manufacturer,
                model: $0.model
            )
        }
        let identityKind: NativeHealthSampleIdentityKind
        switch identity.kind {
        case .record:
            identityKind = .record
        }

        return NativeHealthSampleMetadata(
            identityKind: identityKind,
            identityId: identity.id,
            identityRecordId: identity.recordId,
            originIdentifier: origin.identifier,
            originDisplayName: origin.displayName,
            deviceType: nil,
            deviceManufacturer: device?.manufacturer,
            deviceModel: device?.model,
            recordingMethod: nativeHealthRecordingMethod
        )
    }
}
