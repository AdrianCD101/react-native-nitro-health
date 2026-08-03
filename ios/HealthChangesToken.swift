//
//  HealthChangesToken.swift
//  Pods
//
//  Pure-Foundation changes-token envelope. HealthKit anchor archiving lives in
//  HybridNitroHealth+Changes.swift so this codec can be added to the SwiftPM
//  helper target independently later.
//

import Foundation

private struct HealthChangesTokenEnvelope: Codable {
    let version: Int
    let platform: String
    let kind: String
    let dataType: String
    let payload: Data
}

func invalidChangesTokenError(dataType: String, detail: String) -> NSError {
    return NSError(
        domain: "NitroHealth",
        code: 3,
        userInfo: [NSLocalizedDescriptionKey: "Invalid changes token for \(dataType): \(detail)"]
    )
}

func encodeHealthChangesToken(dataType: String, anchorPayload: Data) throws -> String {
    let envelope = HealthChangesTokenEnvelope(
        version: 1,
        platform: "ios",
        kind: "changes",
        dataType: dataType,
        payload: anchorPayload
    )
    let encoder = JSONEncoder()
    encoder.outputFormatting = [.sortedKeys]

    return base64UrlEncodedChangesTokenData(try encoder.encode(envelope))
}

func decodeHealthChangesToken(_ token: String, dataType: String) throws -> Data {
    guard let data = base64UrlDecodedChangesTokenData(token) else {
        throw invalidChangesTokenError(dataType: dataType, detail: "malformed base64url payload")
    }

    let envelope: HealthChangesTokenEnvelope
    do {
        envelope = try JSONDecoder().decode(HealthChangesTokenEnvelope.self, from: data)
    } catch {
        throw invalidChangesTokenError(dataType: dataType, detail: "malformed envelope")
    }

    guard envelope.version == 1 else {
        throw invalidChangesTokenError(
            dataType: dataType,
            detail: "unsupported version \(envelope.version)"
        )
    }

    guard envelope.platform == "ios" else {
        throw invalidChangesTokenError(
            dataType: dataType,
            detail: "the token platform is '\(envelope.platform)', expected 'ios'"
        )
    }

    guard envelope.kind == "changes" else {
        throw invalidChangesTokenError(
            dataType: dataType,
            detail: "the token kind is '\(envelope.kind)', expected 'changes'"
        )
    }

    guard envelope.dataType == dataType else {
        throw invalidChangesTokenError(
            dataType: dataType,
            detail: "the token was created for '\(envelope.dataType)'"
        )
    }

    guard !envelope.payload.isEmpty else {
        throw invalidChangesTokenError(dataType: dataType, detail: "empty anchor payload")
    }

    return envelope.payload
}

private func base64UrlEncodedChangesTokenData(_ data: Data) -> String {
    return data.base64EncodedString()
        .replacingOccurrences(of: "+", with: "-")
        .replacingOccurrences(of: "/", with: "_")
        .replacingOccurrences(of: "=", with: "")
}

private func base64UrlDecodedChangesTokenData(_ string: String) -> Data? {
    let allowedCharacters = CharacterSet(
        charactersIn: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
    )
    guard !string.isEmpty,
          string.unicodeScalars.allSatisfy({ allowedCharacters.contains($0) }),
          string.count % 4 != 1
    else {
        return nil
    }

    var base64 = string
        .replacingOccurrences(of: "-", with: "+")
        .replacingOccurrences(of: "_", with: "/")
    let remainder = base64.count % 4

    if remainder > 0 {
        base64.append(String(repeating: "=", count: 4 - remainder))
    }

    guard let data = Data(base64Encoded: base64),
          base64UrlEncodedChangesTokenData(data) == string
    else {
        return nil
    }

    return data
}
