//
//  SampleUuidParsing.swift
//  Pods
//
//  Parses JS-provided sample uuid strings into Foundation UUIDs for
//  deleteSamplesByUuids, rejecting malformed values with the failing index.
//  Pure Foundation on purpose — this file is listed in Package.swift's SPM
//  test target so `swift test` covers the parsing. Never import HealthKit
//  here.
//

import Foundation

func invalidSampleUuidError(index: Int, uuid: String) -> NSError {
    return NSError(
        domain: "NitroHealth",
        code: 3,
        userInfo: [NSLocalizedDescriptionKey: "uuids[\(index)]: \"\(uuid)\" is not a valid HealthKit sample uuid"]
    )
}

func makeSampleUuids(_ uuids: [String]) throws -> [UUID] {
    return try uuids.enumerated().map { index, uuid in
        guard let parsed = UUID(uuidString: uuid) else {
            throw invalidSampleUuidError(index: index, uuid: uuid)
        }

        return parsed
    }
}
