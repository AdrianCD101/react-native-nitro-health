import XCTest
@testable import NitroHealthHelpers

final class StatisticsBucketUtilsTests: XCTestCase {
    func testMakeBucketIntervalComponentsHour() {
        XCTAssertEqual(makeBucketIntervalComponents(bucket: "hour"), DateComponents(hour: 1))
    }

    func testMakeBucketIntervalComponentsDay() {
        XCTAssertEqual(makeBucketIntervalComponents(bucket: "day"), DateComponents(day: 1))
    }

    func testMakeBucketIntervalComponentsWeek() {
        XCTAssertEqual(makeBucketIntervalComponents(bucket: "week"), DateComponents(day: 7))
    }

    func testMakeBucketIntervalComponentsMonth() {
        XCTAssertEqual(makeBucketIntervalComponents(bucket: "month"), DateComponents(month: 1))
    }

    func testMakeBucketIntervalComponentsUnknownReturnsNil() {
        XCTAssertNil(makeBucketIntervalComponents(bucket: "year"))
    }

    func testMakeBucketIntervalComponentsEmptyReturnsNil() {
        XCTAssertNil(makeBucketIntervalComponents(bucket: ""))
    }
}
