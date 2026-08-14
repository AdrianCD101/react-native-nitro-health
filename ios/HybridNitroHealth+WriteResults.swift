import HealthKit

extension HybridNitroHealth {
    func storedRecordingMethods(for samples: [HKSample]) async -> [NativeHealthRecordingMethod] {
        let fallback = samples.map(\.nativeHealthRecordingMethod)
        guard let sampleType = samples.first?.sampleType else {
            return fallback
        }

        let syncIdentifiers = Set(samples.compactMap {
            $0.metadata?[HKMetadataKeySyncIdentifier] as? String
        })
        guard !syncIdentifiers.isEmpty else {
            return fallback
        }

        let predicate = NSCompoundPredicate(andPredicateWithSubpredicates: [
            HKQuery.predicateForObjects(from: HKSource.default()),
            HKQuery.predicateForObjects(
                withMetadataKey: HKMetadataKeySyncIdentifier,
                allowedValues: Array(syncIdentifiers)
            ),
        ])

        let storedSamples: [HKSample]
        do {
            storedSamples = try await queryHealthKitSamples(
                sampleType: sampleType,
                limit: HKObjectQueryNoLimit,
                predicate: predicate,
                sortDescriptors: []
            )
        } catch {
            // Write-only authorization cannot read the retained version back.
            return fallback
        }

        var storedBySyncIdentifier = [String: HKSample]()
        for sample in storedSamples {
            guard let syncIdentifier = sample.metadata?[HKMetadataKeySyncIdentifier] as? String else {
                continue
            }

            let version = (sample.metadata?[HKMetadataKeySyncVersion] as? NSNumber)?.int64Value ?? 0
            let storedVersion = storedBySyncIdentifier[syncIdentifier]
                .flatMap { $0.metadata?[HKMetadataKeySyncVersion] as? NSNumber }?
                .int64Value ?? -1
            if version > storedVersion {
                storedBySyncIdentifier[syncIdentifier] = sample
            }
        }

        return samples.map { sample in
            guard
                let syncIdentifier = sample.metadata?[HKMetadataKeySyncIdentifier] as? String,
                let storedSample = storedBySyncIdentifier[syncIdentifier]
            else {
                return sample.nativeHealthRecordingMethod
            }

            return storedSample.nativeHealthRecordingMethod
        }
    }
}
