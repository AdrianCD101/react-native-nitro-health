//
//  SampleUuidParsing.swift
//  Pods
//
//  Parses JS-provided HealthKit record ids into Foundation UUIDs,
//  rejecting malformed values with the failing index.
//  Pure Foundation on purpose — this file is listed in Package.swift's SPM
//  test target so `swift test` covers the parsing. Never import HealthKit
//  here.
//

import Foundation

func invalidSampleUuidError(index: Int, recordId: String) -> NSError {
    return NSError(
        domain: "NitroHealth",
        code: 3,
        userInfo: [NSLocalizedDescriptionKey: "recordIds[\(index)]: \"\(recordId)\" is not a valid HealthKit record id"]
    )
}

func makeSampleUuids(_ recordIds: [String]) throws -> [UUID] {
    return try recordIds.enumerated().map { index, recordId in
        guard let parsed = UUID(uuidString: recordId) else {
            throw invalidSampleUuidError(index: index, recordId: recordId)
        }

        return parsed
    }
}
