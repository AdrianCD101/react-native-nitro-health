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
        let cursor = try query.cursor.map {
            try decodeSampleCursor(
                $0,
                dataType: dataType,
                ascending: query.ascending,
                queryStartTimeMs: query.startTimeMs,
                queryEndTimeMs: query.endTimeMs
            )
        }
        try await requireDeterminedReadAuthorization(
            for: makeReadAuthorizationObjectTypes(dataType: dataType),
            label: authorizationLabel
        )
        let sortDescriptors = [
            NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: query.ascending),
        ]

        let fetched = try await queryHealthKitSamples(
            sampleType: sampleType,
            limit: makeCursorFetchLimit(limit: Int(query.limit), cursor: cursor),
            predicate: makePagedSamplesPredicate(query: query, cursor: cursor),
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
            cursor: cursor
        )

        return (
            samples: page.keptIndices.map { mapped[$0] },
            nextCursor: try page.nextCursor.map { try encodeSampleCursor($0) }
        )
    }

    private func makePagedSamplesPredicate(
        query: NativeHealthDateRangeQuery,
        cursor: SampleCursor?
    ) -> NSPredicate {
        guard let cursor = cursor else {
            return HKQuery.predicateForSamples(
                withStart: Date(timeIntervalSince1970: query.startTimeMs / 1000),
                end: Date(timeIntervalSince1970: query.endTimeMs / 1000),
                options: []
            )
        }

        let window = makeCursorPageWindow(
            cursor: cursor,
            queryStartInterval: query.startTimeMs / 1000,
            queryEndInterval: query.endTimeMs / 1000
        )

        return HKQuery.predicateForSamples(
            withStart: Date(timeIntervalSince1970: window.startInterval),
            end: Date(timeIntervalSince1970: window.endInterval),
            options: window.strictStartDate ? [.strictStartDate] : []
        )
    }
}
