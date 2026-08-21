import Foundation
import NitroModules

// The app's own identity is constant for the process lifetime, so it is resolved once.
// A missing main-bundle identifier is impossible in a running React Native app; the
// generated property getter is non-throwing, so that state is a fatal internal error
// rather than a JS-reachable failure.
private let ownDataOrigin: NativeHealthDataOrigin = {
    guard let identifier = Bundle.main.bundleIdentifier else {
        fatalError("NitroHealth: the main bundle has no bundle identifier")
    }

    let displayName =
        Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String
        ?? Bundle.main.object(forInfoDictionaryKey: "CFBundleName") as? String

    return NativeHealthDataOrigin(identifier: identifier, displayName: displayName)
}()

extension HybridNitroHealth {
    var ownOrigin: NativeHealthDataOrigin {
        return ownDataOrigin
    }
}
