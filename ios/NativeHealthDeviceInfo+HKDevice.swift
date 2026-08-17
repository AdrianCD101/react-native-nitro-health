import HealthKit

extension NativeHealthDeviceInfo {
    var healthKitDevice: HKDevice? {
        guard let values = makeHealthDeviceInfoValues(
            manufacturer: manufacturer,
            model: model
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
}
