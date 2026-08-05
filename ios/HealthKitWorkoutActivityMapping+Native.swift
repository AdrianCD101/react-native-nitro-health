extension HealthKitWorkoutActivityMapping {
    var nativeWorkoutActivity: NativeWorkoutActivity {
        switch self {
        case .unknown:
            return NativeWorkoutActivity(
                status: .unknown,
                type: nil,
                portability: nil,
                mapping: nil
            )
        case .known(let type, let portability, let mapping):
            return NativeWorkoutActivity(
                status: .known,
                type: type,
                portability: portability == .portable ? .portable : .readonly,
                mapping: mapping == .exact ? .exact : .broadened
            )
        }
    }
}
