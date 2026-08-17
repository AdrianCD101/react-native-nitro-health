import HealthKit

extension NativeHealthWriteProvenance {
    var healthKitDevice: HKDevice? {
        guard let values = makeHealthDeviceInfoValues(
            manufacturer: deviceManufacturer,
            model: deviceModel
        ) else {
            return nil
        }

        return HKDevice(
            name: nil,
            manufacturer: values.manufacturer,
            model: values.model,
            hardwareVersion: nil,
            firmwareVersion: nil,
            softwareVersion: nil,
            localIdentifier: nil,
            udiDeviceIdentifier: nil
        )
    }

    var healthKitMetadata: [String: Any]? {
        guard let wasUserEntered = recordingMethod?.healthKitWasUserEntered else {
            return nil
        }

        return [HKMetadataKeyWasUserEntered: wasUserEntered]
    }
}
