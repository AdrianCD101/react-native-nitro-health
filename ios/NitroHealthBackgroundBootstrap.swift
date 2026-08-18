// Called by NitroHealthBackgroundBootstrap.m when the application finishes
// launching. Not public API: consumers get observer restoration automatically.
@_cdecl("NitroHealthPrivateRegisterPersistedObservers")
func NitroHealthPrivateRegisterPersistedObservers() {
    NitroHealthBackgroundDelivery.shared.registerPersistedObservers()
}
