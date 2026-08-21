//
//  HKHealthStore+SourceResolution.swift
//  Pods
//
//  Resolves origin identifier strings (bundle identifiers) to HKSource objects for
//  origin-filtered reads. HealthKit exposes sources per sample type and only for
//  apps that have actually written that type, so an identifier that matches nothing
//  resolves to an empty array — the caller returns an empty page, mirroring Health
//  Connect's behavior for an unknown package name. Resolution runs once per read,
//  uncached: source lists are tiny and staleness bugs would be silent.
//

import Foundation
import HealthKit

extension HKHealthStore {
    func sources(
        matchingBundleIdentifiers identifiers: [String],
        sampleType: HKSampleType
    ) async throws -> [HKSource] {
        let requested = Set(identifiers)

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKSourceQuery(sampleType: sampleType, samplePredicate: nil) { _, sources, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                let matched = (sources ?? []).filter { requested.contains($0.bundleIdentifier) }
                continuation.resume(returning: Array(matched))
            }

            self.execute(query)
        }
    }
}
