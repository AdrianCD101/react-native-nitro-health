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

    func testMakeZonedIntervalComponentsStampsZoneAndCalendar() throws {
        let timeZone = try XCTUnwrap(TimeZone(identifier: "America/New_York"))
        let zoned = makeZonedIntervalComponents(DateComponents(day: 1), timeZone: timeZone)

        XCTAssertEqual(zoned.day, 1)
        XCTAssertEqual(zoned.timeZone, timeZone)
        XCTAssertEqual(zoned.calendar?.identifier, .gregorian)
        XCTAssertEqual(zoned.calendar?.timeZone, timeZone)
    }

    func testMakeZonedIntervalComponentsPreservesOriginalUnits() {
        let timeZone = TimeZone(identifier: "UTC")!
        let zoned = makeZonedIntervalComponents(DateComponents(month: 1), timeZone: timeZone)

        XCTAssertEqual(zoned.month, 1)
        XCTAssertNil(zoned.day)
        XCTAssertNil(zoned.hour)
        XCTAssertEqual(zoned.timeZone, timeZone)
    }
}
