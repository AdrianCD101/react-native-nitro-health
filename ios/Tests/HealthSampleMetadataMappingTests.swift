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
}
