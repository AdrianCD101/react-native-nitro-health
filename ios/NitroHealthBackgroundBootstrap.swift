@_cdecl("NitroHealthRegisterPersistedObservers")
public func NitroHealthRegisterPersistedObservers() {
    NitroHealthBackgroundDelivery.shared.registerPersistedObservers()
}
