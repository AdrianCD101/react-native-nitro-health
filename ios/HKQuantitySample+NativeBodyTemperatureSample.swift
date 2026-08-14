import Foundation
import HealthKit

extension HKQuantitySample {
    func nativeBodyTemperatureSample() throws -> NativeBodyTemperatureSample {
        return NativeBodyTemperatureSample(
            identity: nativeHealthSampleIdentity,
            origin: nativeHealthDataOrigin,
            recordingMethod: nativeHealthRecordingMethod,
            timeMs: startDate.timeIntervalSince1970 * 1000,
            celsius: quantity.doubleValue(for: HKUnit.degreeCelsius()),
            androidMeasurementLocation: nil,
            iosSensorLocation: try nativeBodyTemperatureSensorLocation(metadata: metadata)
        )
    }
}
