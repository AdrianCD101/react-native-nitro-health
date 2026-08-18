import Foundation

// Nitro stringifies thrown Swift errors with String(describing:), which ignores
// LocalizedError — CustomStringConvertible is what makes the message reach JS.
enum TimeZoneMappingError: LocalizedError, CustomStringConvertible {
    case invalidIdentifier(String, prefix: String)

    var description: String {
        switch self {
        case .invalidIdentifier(let identifier, let prefix):
            return "\(prefix): timeZone is not a valid IANA time-zone identifier: \(identifier)"
        }
    }

    var errorDescription: String? {
        return description
    }
}

func resolveIanaTimeZone(_ identifier: String?, errorPrefix: String) throws -> TimeZone {
    guard let identifier else {
        return .current
    }

    let isKnownIdentifier = identifier == "UTC" || TimeZone.knownTimeZoneIdentifiers.contains(identifier)
    guard isKnownIdentifier, let timeZone = TimeZone(identifier: identifier) else {
        throw TimeZoneMappingError.invalidIdentifier(identifier, prefix: errorPrefix)
    }

    return timeZone
}
