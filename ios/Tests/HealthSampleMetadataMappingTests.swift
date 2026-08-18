import Foundation
import XCTest
@testable import NitroHealthHelpers

final class HealthSampleMetadataMappingTests: XCTestCase {
    func testMapsIndependentRecordIdentityFromUuid() throws {
        let uuid = try XCTUnwrap(UUID(uuidString: "3F2B9C1E-7A54-4F0D-9E2A-1C8D5B6E4A30"))

        XCTAssertEqual(
            makeHealthSampleIdentityValues(uuid: uuid),
            HealthSampleIdentityValues(
                kind: .record,
                id: "3F2B9C1E-7A54-4F0D-9E2A-1C8D5B6E4A30",
                recordId: "3F2B9C1E-7A54-4F0D-9E2A-1C8D5B6E4A30"
            )
        )
    }

    func testMapsOriginBundleIdentifierAndDisplayName() {
        XCTAssertEqual(
            makeHealthDataOriginValues(
                sourceBundleIdentifier: "com.example.health",
                sourceName: "Example Health"
            ),
            HealthDataOriginValues(
                identifier: "com.example.health",
                displayName: "Example Health"
            )
        )
    }

    func testMapsAvailableDeviceManufacturerAndModel() {
        XCTAssertEqual(
            makeHealthDeviceInfoValues(
                manufacturer: "Example Medical",
                model: "Monitor 2"
            ),
            HealthDeviceInfoValues(
                manufacturer: "Example Medical",
                model: "Monitor 2"
            )
        )
    }

    func testMapsPartiallyAvailableDeviceInfo() {
        XCTAssertEqual(
            makeHealthDeviceInfoValues(manufacturer: nil, model: "Watch 3"),
            HealthDeviceInfoValues(manufacturer: nil, model: "Watch 3")
        )
        XCTAssertEqual(
            makeHealthDeviceInfoValues(manufacturer: "Example Medical", model: nil),
            HealthDeviceInfoValues(manufacturer: "Example Medical", model: nil)
        )
    }

    func testOmitsDeviceWhenProjectedFieldsAreUnavailable() {
        XCTAssertNil(makeHealthDeviceInfoValues(manufacturer: nil, model: nil))
        XCTAssertNil(makeHealthDeviceInfoValues(manufacturer: "", model: "  \n"))
    }

    func testFormatsUtcOffsetsPortably() {
        XCTAssertEqual(formatUtcOffset(seconds: 0), "+00:00")
        XCTAssertEqual(formatUtcOffset(seconds: 9 * 3600), "+09:00")
        XCTAssertEqual(formatUtcOffset(seconds: -5 * 3600), "-05:00")
        XCTAssertEqual(formatUtcOffset(seconds: 5 * 3600 + 30 * 60), "+05:30")
        XCTAssertEqual(formatUtcOffset(seconds: -(9 * 3600 + 30 * 60)), "-09:30")
    }

    func testResolvesStoredZoneAtSampleStartDateAcrossDaylightSaving() throws {
        // America/New_York springs forward on 2026-03-08: 06:30Z is EST, 07:30Z is EDT.
        let beforeShift = try XCTUnwrap(ISO8601DateFormatter().date(from: "2026-03-08T06:30:00Z"))
        let afterShift = try XCTUnwrap(ISO8601DateFormatter().date(from: "2026-03-08T07:30:00Z"))

        XCTAssertEqual(
            makeHealthSampleZoneValues(
                storedTimeZoneIdentifier: "America/New_York",
                startDate: beforeShift
            ),
            HealthSampleZoneValues(timeZone: "America/New_York", zoneOffset: "-05:00")
        )
        XCTAssertEqual(
            makeHealthSampleZoneValues(
                storedTimeZoneIdentifier: "America/New_York",
                startDate: afterShift
            ),
            HealthSampleZoneValues(timeZone: "America/New_York", zoneOffset: "-04:00")
        )
    }

    func testNeverFabricatesZoneValuesForMissingOrInvalidIdentifiers() {
        let expected = HealthSampleZoneValues(timeZone: nil, zoneOffset: nil)
        XCTAssertEqual(
            makeHealthSampleZoneValues(storedTimeZoneIdentifier: nil, startDate: Date(timeIntervalSince1970: 0)),
            expected
        )
        XCTAssertEqual(
            makeHealthSampleZoneValues(storedTimeZoneIdentifier: "Not/A_Zone", startDate: Date(timeIntervalSince1970: 0)),
            expected
        )
    }
}
