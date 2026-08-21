import Foundation
import XCTest
@testable import NitroHealthHelpers

final class HealthChangesTokenTests: XCTestCase {
    func testEncodeDecodeRoundTripsAnchorPayload() throws {
        let payload = Data([0, 1, 2, 250, 255])
        let token = try encodeHealthChangesToken(dataType: "steps", anchorPayload: payload)

        XCTAssertEqual(try decodeHealthChangesToken(token, dataType: "steps"), payload)
        XCTAssertNil(token.rangeOfCharacter(from: CharacterSet(charactersIn: "+/=")))
    }

    func testDecodeRejectsMalformedToken() {
        XCTAssertThrowsError(try decodeHealthChangesToken("not a token!", dataType: "steps")) { error in
            XCTAssertTrue(error.localizedDescription.contains("Invalid changes token for steps"))
        }
    }

    func testDecodeRejectsWrongDataType() throws {
        let token = try encodeHealthChangesToken(
            dataType: "steps",
            anchorPayload: Data([1])
        )

        XCTAssertThrowsError(try decodeHealthChangesToken(token, dataType: "heartRate")) { error in
            XCTAssertTrue(error.localizedDescription.contains("created for 'steps'"))
        }
    }

    func testDecodeRejectsUnsupportedVersion() {
        let token = encodeEnvelope(
            #"{"dataType":"steps","kind":"changes","payload":"AQ==","platform":"ios","version":2}"#
        )

        XCTAssertThrowsError(try decodeHealthChangesToken(token, dataType: "steps")) { error in
            XCTAssertTrue(error.localizedDescription.contains("unsupported version 2"))
        }
    }

    func testDecodeRejectsForeignPlatform() {
        let token = encodeEnvelope(
            #"{"dataType":"steps","kind":"changes","payload":"AQ==","platform":"android","version":1}"#
        )

        XCTAssertThrowsError(try decodeHealthChangesToken(token, dataType: "steps")) { error in
            XCTAssertTrue(error.localizedDescription.contains("expected 'ios'"))
        }
    }

    func testDecodeRejectsWrongKind() {
        let token = encodeEnvelope(
            #"{"dataType":"steps","kind":"pagination","payload":"AQ==","platform":"ios","version":1}"#
        )

        XCTAssertThrowsError(try decodeHealthChangesToken(token, dataType: "steps")) { error in
            XCTAssertTrue(error.localizedDescription.contains("expected 'changes'"))
        }
    }

    func testDecodeRejectsAndroidEnvelope() {
        let token = Data("v1|android|changes|steps|native-token".utf8)
            .base64EncodedString()
            .replacingOccurrences(of: "=", with: "")

        XCTAssertThrowsError(try decodeHealthChangesToken(token, dataType: "steps")) { error in
            XCTAssertTrue(error.localizedDescription.contains("malformed envelope"))
        }
    }

    func testDecodeRejectsPaginationCursor() throws {
        let cursor = try encodeSampleCursor(SampleCursor(
            version: 1,
            platform: "ios",
            dataType: "steps",
            ascending: true,
            queryStartTimeMs: 1_000,
            queryEndTimeMs: 2_000,
            startInterval: 0,
            seenUuids: [],
            originsOwnApp: nil,
            originIdentifiers: nil
        ))

        XCTAssertThrowsError(try decodeHealthChangesToken(cursor, dataType: "steps")) { error in
            XCTAssertTrue(error.localizedDescription.contains("malformed envelope"))
        }
    }

    private func encodeEnvelope(_ value: String) -> String {
        return Data(value.utf8)
            .base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}
