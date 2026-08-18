import Foundation

func makeZonedIntervalComponents(_ components: DateComponents, timeZone: TimeZone) -> DateComponents {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = timeZone
    var zoned = components
    zoned.calendar = calendar
    zoned.timeZone = timeZone
    return zoned
}

func makeBucketIntervalComponents(bucket: String) -> DateComponents? {
    switch bucket {
    case "hour":
        return DateComponents(hour: 1)
    case "day":
        return DateComponents(day: 1)
    case "week":
        return DateComponents(day: 7)
    case "month":
        return DateComponents(month: 1)
    default:
        return nil
    }
}
