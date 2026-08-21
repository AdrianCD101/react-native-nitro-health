//
//  HybridNitroHealth+PagedReads.swift
//  Pods
//
//  Cursor-paged query engine for raw sample reads. Decodes the query cursor,
//  narrows the predicate to the resume window, over-fetches by the seen-uuid
//  count plus a has-more sentinel, then trims via paginateCursorPage. The pure
//  paging math lives in SampleCursorUtils.swift (SPM-tested); this file is
//  HealthKit-only, so it must NOT be added to Package.swift's pure-Foundation
//  SPM test target; the podspec globs ios/**/*.swift and picks it up
//  automatically.
//

import Foundation
import HealthKit
import NitroModules

extension HybridNitroHealth {
    // Unmappable samples (unexpected HKSample subclass) are dropped before
    // pagination so skip/limit decisions stay in sync with what is returned; a
    // throwing map lets malformed samples (e.g. a blood pressure correlation
    // missing a member) fail the read instead of being silently coerced.
    func queryPagedSamples<T>(
        sampleType: HKSampleType,
        dataType: String,
        query: NativeHealthDateRangeQuery,
        authorizationLabel: String,
        map: (HKSample) throws -> T?
    ) async throws -> (samples: [T], nextCursor: String?) {
        // The JS mapping layer guarantees exclusivity; both fields arriving means a
        // caller bypassed it, which must fail loudly rather than pick a winner.
        if query.ownAppOnly == true && query.originIdentifiers != nil {
            throw permissionError("ownAppOnly and originIdentifiers are mutually exclusive")
        }

        let cursor = try query.cursor.map {
            try decodeSampleCursor(
                $0,
                dataType: dataType,
                ascending: query.ascending,
                queryStartTimeMs: query.startTimeMs,
                queryEndTimeMs: query.endTimeMs,
                ownAppOnly: query.ownAppOnly,
                originIdentifiers: query.originIdentifiers
            )
        }
        try await requireDeterminedReadAuthorization(
            for: makeReadAuthorizationObjectTypes(dataType: dataType),
            label: authorizationLabel
        )

        // Identifier resolution runs after the authorization gate (sources are only
        // observable once read authorization has been determined). Zero matching
        // sources short-circuits: the predicate would match nothing, and an unknown
        // identifier is defined as empty results, never an error.
        var originPredicate: NSPredicate?
        if query.ownAppOnly == true {
            originPredicate = HKQuery.predicateForObjects(from: [HKSource.default()])
        } else if let identifiers = query.originIdentifiers {
            let sources = try await healthStore.sources(
                matchingBundleIdentifiers: identifiers,
                sampleType: sampleType
            )
            if sources.isEmpty {
                return (samples: [], nextCursor: nil)
            }
            originPredicate = HKQuery.predicateForObjects(from: Set(sources))
        }

        let sortDescriptors = [
            NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: query.ascending),
        ]

        let fetched = try await queryHealthKitSamples(
            sampleType: sampleType,
            limit: makeCursorFetchLimit(limit: Int(query.limit), cursor: cursor),
            predicate: makePagedSamplesPredicate(
                query: query,
                cursor: cursor,
                originPredicate: originPredicate
            ),
            sortDescriptors: sortDescriptors
        )

        var items = [CursorPageItem]()
        var mapped = [T]()

        for sample in fetched {
            guard let value = try map(sample) else {
                continue
            }

            items.append(CursorPageItem(
                uuid: sample.uuid.uuidString,
                startInterval: sample.startDate.timeIntervalSince1970
            ))
            mapped.append(value)
        }

        let page = paginateCursorPage(
            items: items,
            limit: Int(query.limit),
            dataType: dataType,
            ascending: query.ascending,
            queryStartTimeMs: query.startTimeMs,
            queryEndTimeMs: query.endTimeMs,
            cursor: cursor,
            ownAppOnly: query.ownAppOnly,
            originIdentifiers: query.originIdentifiers
        )

        return (
            samples: page.keptIndices.map { mapped[$0] },
            nextCursor: try page.nextCursor.map { try encodeSampleCursor($0) }
        )
    }

    private func makePagedSamplesPredicate(
        query: NativeHealthDateRangeQuery,
        cursor: SampleCursor?,
        originPredicate: NSPredicate?
    ) -> NSPredicate {
        let timePredicate: NSPredicate

        if let cursor = cursor {
            let window = makeCursorPageWindow(
                cursor: cursor,
                queryStartInterval: query.startTimeMs / 1000,
                queryEndInterval: query.endTimeMs / 1000
            )

            timePredicate = HKQuery.predicateForSamples(
                withStart: Date(timeIntervalSince1970: window.startInterval),
                end: Date(timeIntervalSince1970: window.endInterval),
                options: window.strictStartDate ? [.strictStartDate] : []
            )
        } else {
            timePredicate = HKQuery.predicateForSamples(
                withStart: Date(timeIntervalSince1970: query.startTimeMs / 1000),
                end: Date(timeIntervalSince1970: query.endTimeMs / 1000),
                options: []
            )
        }

        guard let originPredicate = originPredicate else {
            return timePredicate
        }

        return NSCompoundPredicate(andPredicateWithSubpredicates: [timePredicate, originPredicate])
    }
}
