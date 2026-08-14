import Foundation
import HealthKit

extension HKQuantitySample {
    func nativeBasalBodyTemperatureSample() throws -> NativeBasalBodyTemperatureSample {
        return NativeBasalBodyTemperatureSample(
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
