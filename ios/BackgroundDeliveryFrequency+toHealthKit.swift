import HealthKit

extension BackgroundDeliveryFrequency {
    var healthKitUpdateFrequency: HKUpdateFrequency {
        switch self {
        case .immediate:
            return .immediate
        case .hourly:
            return .hourly
        case .daily:
            return .daily
        case .weekly:
            return .weekly
        }
    }
}
