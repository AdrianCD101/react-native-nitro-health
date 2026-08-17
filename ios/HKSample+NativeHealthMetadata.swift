import HealthKit

extension HKSample {
    var nativeHealthSampleIdentity: NativeHealthSampleIdentity {
        let values = makeHealthSampleIdentityValues(uuid: uuid)
        let kind: NativeHealthSampleIdentityKind
        switch values.kind {
        case .record:
            kind = .record
        }

        return NativeHealthSampleIdentity(
            kind: kind,
            id: values.id,
            recordId: values.recordId
        )
    }

    var nativeHealthDataOrigin: NativeHealthDataOrigin {
        let source = sourceRevision.source
        let values = makeHealthDataOriginValues(
            sourceBundleIdentifier: source.bundleIdentifier,
            sourceName: source.name
        )
        return NativeHealthDataOrigin(
            identifier: values.identifier,
            displayName: values.displayName
        )
    }

    var nativeHealthDeviceInfo: NativeHealthDeviceInfo? {
        return device?.nativeHealthDeviceInfo
    }
}
