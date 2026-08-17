import HealthKit

extension HKDevice {
    var nativeHealthDeviceInfo: NativeHealthDeviceInfo? {
        guard let values = makeHealthDeviceInfoValues(
            manufacturer: manufacturer,
            model: model
        ) else {
            return nil
        }

        return NativeHealthDeviceInfo(
            type: nil,
            manufacturer: values.manufacturer,
            model: values.model
        )
    }
}
