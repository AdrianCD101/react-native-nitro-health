import Foundation
import HealthKit

final class NitroHealthBackgroundDelivery: NSObject {
    static let shared = NitroHealthBackgroundDelivery()

    private static let configurationKey = "com.nitrohealth.backgroundDelivery.configuration"
    private static let pendingDataTypesKey = "com.nitrohealth.backgroundDelivery.pendingDataTypes"

    private let stateQueue = DispatchQueue(label: "com.nitrohealth.backgroundDelivery.state")
    private let operationQueue = BackgroundDeliveryOperationQueue()
    private var observerQueries: [String: HKObserverQuery] = [:]
    private var listener: (([String], String) -> Void)?
    private var inFlightDelivery: (id: String, notifications: [String: Int])?
    private var isEmissionScheduled = false

    private override init() {
        super.init()
    }

    func registerPersistedObservers() {
        guard HKHealthStore.isHealthDataAvailable() else { return }

        let configuration = stateQueue.sync { loadConfiguration() }
        for (dataType, frequencyRawValue) in configuration {
            do {
                guard let frequency = HKUpdateFrequency(rawValue: frequencyRawValue) else {
                    NSLog("[NitroHealth] Ignoring invalid background delivery frequency for %@", dataType)
                    stateQueue.sync {
                        var updatedConfiguration = loadConfiguration()
                        updatedConfiguration.removeValue(forKey: dataType)
                        saveConfiguration(updatedConfiguration)
                    }
                    continue
                }

                let sampleType = try makeHealthKitSampleType(dataType: dataType)
                _ = registerObserverIfNeeded(dataType: dataType, sampleType: sampleType)

                Task { [weak self] in
                    guard let self else { return }

                    do {
                        try await self.operationQueue.run {
                            let isStillConfigured = self.stateQueue.sync {
                                self.loadConfiguration()[dataType] == frequency.rawValue
                            }
                            guard isStillConfigured else { return }

                            try await healthStore.enableBackgroundDeliveryOrThrow(
                                for: sampleType,
                                frequency: frequency
                            )
                        }
                    } catch {
                        NSLog(
                            "[NitroHealth] Failed to restore background delivery for %@: %@",
                            dataType,
                            error.localizedDescription
                        )
                    }
                }
            } catch {
                // The data type no longer maps to a HealthKit sample type (for
                // example after a library downgrade). Keeping the entry would make
                // disableAll() fail forever and replay unusable notifications.
                NSLog(
                    "[NitroHealth] Removing unrestorable background delivery for %@: %@",
                    dataType,
                    error.localizedDescription
                )
                stateQueue.sync {
                    var updatedConfiguration = loadConfiguration()
                    updatedConfiguration.removeValue(forKey: dataType)
                    saveConfiguration(updatedConfiguration)

                    var pendingNotifications = loadPendingNotifications()
                    pendingNotifications.removeValue(forKey: dataType)
                    savePendingNotifications(pendingNotifications)
                }
            }
        }
    }

    func enable(dataType: String, frequency: HKUpdateFrequency) async throws {
        try await operationQueue.run { [self] in
            let sampleType = try makeHealthKitSampleType(dataType: dataType)
            let previousFrequency = stateQueue.sync { loadConfiguration()[dataType] }
            let registeredObserver = registerObserverIfNeeded(
                dataType: dataType,
                sampleType: sampleType
            )

            stateQueue.sync {
                var configuration = loadConfiguration()
                configuration[dataType] = frequency.rawValue
                saveConfiguration(configuration)
            }

            do {
                try await healthStore.enableBackgroundDeliveryOrThrow(
                    for: sampleType,
                    frequency: frequency
                )
            } catch {
                stateQueue.sync {
                    var configuration = loadConfiguration()
                    configuration[dataType] = previousFrequency
                    saveConfiguration(configuration)
                }

                if registeredObserver && previousFrequency == nil {
                    removeObserver(dataType: dataType, clearPending: true)
                }
                throw error
            }
        }
    }

    func disable(dataType: String) async throws {
        try await operationQueue.run { [self] in
            let sampleType = try makeHealthKitSampleType(dataType: dataType)
            try await healthStore.disableBackgroundDeliveryOrThrow(for: sampleType)
            removeObserver(dataType: dataType, clearPending: true)

            stateQueue.sync {
                var configuration = loadConfiguration()
                configuration.removeValue(forKey: dataType)
                saveConfiguration(configuration)
            }
        }
    }

    func disableAll() async throws {
        try await operationQueue.run { [self] in
            let dataTypes = stateQueue.sync { Array(loadConfiguration().keys).sorted() }

            for dataType in dataTypes {
                // An unknown persisted type has no HealthKit delivery to disable;
                // remove its state instead of letting one stale entry fail the loop.
                if let sampleType = try? makeHealthKitSampleType(dataType: dataType) {
                    try await healthStore.disableBackgroundDeliveryOrThrow(for: sampleType)
                } else {
                    NSLog("[NitroHealth] Removing unknown background delivery type %@", dataType)
                }

                removeObserver(dataType: dataType, clearPending: true)

                stateQueue.sync {
                    var configuration = loadConfiguration()
                    configuration.removeValue(forKey: dataType)
                    saveConfiguration(configuration)
                }
            }
        }
    }

    func setListener(_ listener: (([String], String) -> Void)?) {
        stateQueue.sync {
            self.listener = listener
            inFlightDelivery = nil

            if listener == nil {
                isEmissionScheduled = false
            } else {
                scheduleEmissionIfNeeded()
            }
        }
    }

    func acknowledge(deliveryId: String) {
        stateQueue.async {
            guard let delivery = self.inFlightDelivery,
                  delivery.id == deliveryId else {
                return
            }

            var pendingNotifications = self.loadPendingNotifications()
            for (dataType, deliveredVersion) in delivery.notifications {
                if pendingNotifications[dataType] == deliveredVersion {
                    pendingNotifications.removeValue(forKey: dataType)
                }
            }

            self.savePendingNotifications(pendingNotifications)
            self.inFlightDelivery = nil
            self.scheduleEmissionIfNeeded()
        }
    }

    private func registerObserverIfNeeded(
        dataType: String,
        sampleType: HKSampleType
    ) -> Bool {
        return stateQueue.sync {
            guard observerQueries[dataType] == nil else { return false }

            let query = HKObserverQuery(sampleType: sampleType, predicate: nil) {
                [weak self] query, completion, error in
                guard let self else {
                    completion()
                    return
                }

                self.handleObserverCallback(
                    dataType: dataType,
                    query: query,
                    error: error,
                    completion: completion
                )
            }

            observerQueries[dataType] = query
            healthStore.execute(query)
            return true
        }
    }

    private func removeObserver(dataType: String, clearPending: Bool) {
        stateQueue.sync {
            if let query = observerQueries.removeValue(forKey: dataType) {
                healthStore.stop(query)
            }

            if clearPending {
                var pendingNotifications = loadPendingNotifications()
                pendingNotifications.removeValue(forKey: dataType)
                savePendingNotifications(pendingNotifications)
            }
        }
    }

    private func handleObserverCallback(
        dataType: String,
        query: HKObserverQuery,
        error: Error?,
        completion: @escaping HKObserverQueryCompletionHandler
    ) {
        stateQueue.async {
            guard self.observerQueries[dataType] === query else {
                completion()
                return
            }

            if let error {
                NSLog(
                    "[NitroHealth] HealthKit observer reported an error for %@: %@",
                    dataType,
                    error.localizedDescription
                )
            }

            var pendingNotifications = self.loadPendingNotifications()
            let previousVersion = pendingNotifications[dataType] ?? 0
            pendingNotifications[dataType] = previousVersion == Int.max ? 1 : previousVersion + 1
            self.savePendingNotifications(pendingNotifications)
            self.scheduleEmissionIfNeeded()

            completion()
        }
    }

    private func scheduleEmissionIfNeeded() {
        guard listener != nil,
              !isEmissionScheduled,
              inFlightDelivery == nil,
              !loadPendingNotifications().isEmpty else {
            return
        }

        isEmissionScheduled = true
        DispatchQueue.main.async { [weak self] in
            self?.emitPendingNotifications()
        }
    }

    private func emitPendingNotifications() {
        var deliveredNotifications = [String: Int]()
        var deliveryId = ""
        var listener: (([String], String) -> Void)?

        stateQueue.sync {
            isEmissionScheduled = false

            // A listener detach/reattach can queue a second emission block; never
            // start a new delivery while one is awaiting acknowledgement.
            guard inFlightDelivery == nil else { return }

            deliveredNotifications = loadPendingNotifications()
            listener = self.listener

            if listener != nil, !deliveredNotifications.isEmpty {
                deliveryId = UUID().uuidString
                inFlightDelivery = (deliveryId, deliveredNotifications)
            }
        }

        guard let listener, !deliveredNotifications.isEmpty else { return }
        listener(deliveredNotifications.keys.sorted(), deliveryId)
    }

    private func loadConfiguration() -> [String: Int] {
        let stored = UserDefaults.standard.dictionary(forKey: Self.configurationKey) ?? [:]

        return stored.reduce(into: [String: Int]()) { result, entry in
            if let value = entry.value as? NSNumber {
                result[entry.key] = value.intValue
            }
        }
    }

    private func saveConfiguration(_ configuration: [String: Int]) {
        if configuration.isEmpty {
            UserDefaults.standard.removeObject(forKey: Self.configurationKey)
        } else {
            UserDefaults.standard.set(configuration, forKey: Self.configurationKey)
        }
    }

    private func loadPendingNotifications() -> [String: Int] {
        let stored = UserDefaults.standard.dictionary(forKey: Self.pendingDataTypesKey) ?? [:]

        return stored.reduce(into: [String: Int]()) { result, entry in
            if let value = entry.value as? NSNumber {
                result[entry.key] = value.intValue
            }
        }
    }

    private func savePendingNotifications(_ notifications: [String: Int]) {
        if notifications.isEmpty {
            UserDefaults.standard.removeObject(forKey: Self.pendingDataTypesKey)
        } else {
            UserDefaults.standard.set(notifications, forKey: Self.pendingDataTypesKey)
        }
    }
}
