import HealthKit
import NitroModules

extension HybridNitroHealth {
    func saveSleepSessions(sessions: [NativeSleepSessionInput]) throws -> Promise<NativeHealthWriteResult> {
        if !HKHealthStore.isHealthDataAvailable() {
            throw permissionError("Health data is not available")
        }

        return Promise<NativeHealthWriteResult>.async {
            guard let categoryType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
                throw permissionError("Health data type is not available on this device: sleep")
            }

            try self.requireWriteAuthorization(for: categoryType, label: "sleep")
            let mappedSessions = try makeSleepCategorySamples(
                sessions: sessions,
                categoryType: categoryType
            )
            try await self.saveHealthKitSamples(mappedSessions.flatMap { $0.samples })
            // A versioned re-save with FEWER stages has no new sample to replace each
            // dropped "#stageN" sample, so stale stages must be removed explicitly or
            // they linger as loose sleep samples visible to other HealthKit consumers.
            try await self.removeStaleSleepStages(sessions: sessions, categoryType: categoryType)
            return NativeHealthWriteResult(
                storedRecordingMethods: await self.storedRecordingMethods(
                    for: mappedSessions.map(\.envelope)
                )
            )
        }
    }

    // Stage suffixes are positional over a variable-length list (unlike nutrition's
    // fixed nutrient descriptors), so dropped suffixes cannot be enumerated from the
    // input. Prior stage samples are found by sync-id prefix instead, scoped to our
    // own source, and removed only when their stored version is strictly lower than
    // the incoming one — matching HealthKit's own replacement semantics.
    private func removeStaleSleepStages(
        sessions: [NativeSleepSessionInput],
        categoryType: HKCategoryType
    ) async throws {
        for session in sessions {
            guard let sync = session.writeMetadata.sync else {
                continue
            }
            let syncPrefix = sleepStageSyncPrefix(sessionSyncId: sync.id)
            let incomingVersion = Int64(sync.version)

            let predicate = NSCompoundPredicate(andPredicateWithSubpredicates: [
                HKQuery.predicateForObjects(from: HKSource.default()),
                HKQuery.predicateForObjects(
                    withMetadataKey: HKMetadataKeySyncIdentifier,
                    operatorType: .beginsWith,
                    value: syncPrefix
                ),
            ])
            let candidates = try await queryHealthKitSamples(
                sampleType: categoryType,
                limit: HKObjectQueryNoLimit,
                predicate: predicate,
                sortDescriptors: []
            )
            let staleUuids = staleSleepStageUuids(
                candidates: candidates.map { candidate in
                    SleepStageSyncCandidate(
                        uuid: candidate.uuid,
                        syncIdentifier: candidate.metadata?[HKMetadataKeySyncIdentifier] as? String,
                        syncVersion: (candidate.metadata?[HKMetadataKeySyncVersion] as? NSNumber)?.int64Value
                    )
                },
                syncPrefix: syncPrefix,
                incomingVersion: incomingVersion
            )

            if !staleUuids.isEmpty {
                _ = try await deleteHealthKitObjects(
                    of: categoryType,
                    predicate: HKQuery.predicateForObjects(with: Set(staleUuids))
                )
            }
        }
    }
}
