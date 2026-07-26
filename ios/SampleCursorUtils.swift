//
//  SampleCursorUtils.swift
//  Pods
//
//  Cursor encoding + keyset pagination for raw sample reads. HealthKit has no
//  native page token (unlike Health Connect), so iOS cursors are self-contained:
//  the boundary sample's start time plus the uuids already returned at exactly
//  that time. HealthKit's ordering of equal start dates is not stable between
//  queries, so ties are skipped by uuid, never by offset.
//
//  Pure Foundation on purpose — this file is listed in Package.swift's SPM test
//  target so `swift test` covers the paging math. Never import HealthKit here.
//

import Foundation

func invalidCursorError(dataType: String, detail: String? = nil) -> NSError {
    let message: String

    if let detail = detail {
        message = "Invalid cursor for \(dataType) read: \(detail)"
    } else {
        message = "Invalid cursor for \(dataType) read"
    }

    return NSError(domain: "NitroHealth", code: 2, userInfo: [NSLocalizedDescriptionKey: message])
}

struct SampleCursor: Codable, Equatable {
    let version: Int
    let platform: String
    let dataType: String
    let ascending: Bool
    /// `timeIntervalSince1970` (seconds) of the last returned sample's start date.
    let startInterval: Double
    /// Uuids of already-returned samples whose start date equals `startInterval`.
    let seenUuids: [String]
}

func encodeSampleCursor(_ cursor: SampleCursor) throws -> String {
    let encoder = JSONEncoder()
    encoder.outputFormatting = [.sortedKeys]
    let data = try encoder.encode(cursor)

    return base64UrlEncodedString(data)
}

func decodeSampleCursor(_ cursor: String, dataType: String, ascending: Bool) throws -> SampleCursor {
    guard let data = base64UrlDecodedData(cursor),
          let decoded = try? JSONDecoder().decode(SampleCursor.self, from: data)
    else {
        throw invalidCursorError(dataType: dataType)
    }

    guard decoded.version == 1, decoded.platform == "ios" else {
        throw invalidCursorError(
            dataType: dataType,
            detail: "the cursor was created on another platform or by a newer library version"
        )
    }

    guard decoded.dataType == dataType else {
        throw invalidCursorError(
            dataType: dataType,
            detail: "the cursor was created by a \(decoded.dataType) read"
        )
    }

    guard decoded.ascending == ascending else {
        throw invalidCursorError(
            dataType: dataType,
            detail: "the cursor was created by a query with a different ascending option"
        )
    }

    return decoded
}

struct CursorPageWindow: Equatable {
    let startInterval: Double
    let endInterval: Double
    let strictStartDate: Bool
}

// The resume window narrows the original query range to samples not yet returned,
// keyed on start date (the sort key). Ascending resumes at the boundary inclusively
// (strict start, remaining ties get skipped by uuid). Descending keeps the original
// overlap semantics at the range start and moves the exclusive end bound to just
// above the boundary: HealthKit dates are Double-backed, so `nextUp` makes the
// non-strict `start < end` bound exactly `start <= boundary`.
func makeCursorPageWindow(
    cursor: SampleCursor,
    queryStartInterval: Double,
    queryEndInterval: Double
) -> CursorPageWindow {
    if cursor.ascending {
        return CursorPageWindow(
            startInterval: cursor.startInterval,
            endInterval: queryEndInterval,
            strictStartDate: true
        )
    }

    return CursorPageWindow(
        startInterval: queryStartInterval,
        endInterval: cursor.startInterval.nextUp,
        strictStartDate: false
    )
}

/// How many samples to fetch for one page: the page itself, plus room for the
/// boundary ties that will be skipped, plus one sentinel to detect another page.
func makeCursorFetchLimit(limit: Int, cursor: SampleCursor?) -> Int {
    return limit + (cursor?.seenUuids.count ?? 0) + 1
}

struct CursorPageItem {
    let uuid: String
    let startInterval: Double
}

struct CursorPage {
    let keptIndices: [Int]
    let nextCursor: SampleCursor?
}

func paginateCursorPage(
    items: [CursorPageItem],
    limit: Int,
    dataType: String,
    ascending: Bool,
    cursor: SampleCursor?
) -> CursorPage {
    let seenUuids = Set(cursor?.seenUuids ?? [])
    let unseenIndices = items.indices.filter { !seenUuids.contains(items[$0].uuid) }
    let keptIndices = Array(unseenIndices.prefix(limit))

    // The caller fetched limit + seenUuids.count + 1 items, so whenever another
    // page exists the window holds at least limit + 1 unseen items.
    guard unseenIndices.count > limit, let lastKeptIndex = keptIndices.last else {
        return CursorPage(keptIndices: keptIndices, nextCursor: nil)
    }

    let boundaryInterval = items[lastKeptIndex].startInterval
    var boundaryUuids = keptIndices
        .filter { items[$0].startInterval == boundaryInterval }
        .map { items[$0].uuid }

    // When an entire page shares one timestamp the boundary doesn't advance;
    // carry the previous cursor's uuids so earlier pages stay excluded.
    if let cursor = cursor, cursor.startInterval == boundaryInterval {
        boundaryUuids.append(contentsOf: cursor.seenUuids)
    }

    return CursorPage(
        keptIndices: keptIndices,
        nextCursor: SampleCursor(
            version: 1,
            platform: "ios",
            dataType: dataType,
            ascending: ascending,
            startInterval: boundaryInterval,
            seenUuids: boundaryUuids
        )
    )
}

private func base64UrlEncodedString(_ data: Data) -> String {
    return data.base64EncodedString()
        .replacingOccurrences(of: "+", with: "-")
        .replacingOccurrences(of: "/", with: "_")
        .replacingOccurrences(of: "=", with: "")
}

private func base64UrlDecodedData(_ string: String) -> Data? {
    var base64 = string
        .replacingOccurrences(of: "-", with: "+")
        .replacingOccurrences(of: "_", with: "/")
    let remainder = base64.count % 4

    if remainder > 0 {
        base64.append(String(repeating: "=", count: 4 - remainder))
    }

    return Data(base64Encoded: base64)
}
