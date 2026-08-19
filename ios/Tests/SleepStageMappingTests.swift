import XCTest
@testable import NitroHealthHelpers

final class SleepStageMappingTests: XCTestCase {
    func testMapsEveryPortableWritableStage() throws {
        XCTAssertEqual(try healthKitSleepStageValue("awake"), 2)
        XCTAssertEqual(try healthKitSleepStageValue("asleep"), 1)
        XCTAssertEqual(try healthKitSleepStageValue("asleepCore"), 3)
        XCTAssertEqual(try healthKitSleepStageValue("asleepDeep"), 4)
        XCTAssertEqual(try healthKitSleepStageValue("asleepREM"), 5)
    }

    func testRejectsNonPortableWritableStages() {
        for stage in ["inBed", "awakeInBed", "outOfBed", "unknown"] {
            XCTAssertThrowsError(try healthKitSleepStageValue(stage))
        }
    }

    func testNormalizesEveryHealthKitStageValue() {
        XCTAssertEqual(normalizedSleepStage(value: 1), "asleep")
        XCTAssertEqual(normalizedSleepStage(value: 2), "awake")
        XCTAssertEqual(normalizedSleepStage(value: 3), "asleepCore")
        XCTAssertEqual(normalizedSleepStage(value: 4), "asleepDeep")
        XCTAssertEqual(normalizedSleepStage(value: 5), "asleepREM")
        XCTAssertEqual(normalizedSleepStage(value: 99), "unknown")
    }

    func testMapsInBedToTheSessionEnvelope() {
        XCTAssertEqual(healthKitSleepIntervalMapping(value: 0), .sessionEnvelope)
    }

    func testMapsEveryOtherIntervalToAnIndependentExplicitStage() {
        XCTAssertEqual(healthKitSleepIntervalMapping(value: 1), .stage("asleep"))
        XCTAssertEqual(healthKitSleepIntervalMapping(value: 2), .stage("awake"))
        XCTAssertEqual(healthKitSleepIntervalMapping(value: 3), .stage("asleepCore"))
        XCTAssertEqual(healthKitSleepIntervalMapping(value: 4), .stage("asleepDeep"))
        XCTAssertEqual(healthKitSleepIntervalMapping(value: 5), .stage("asleepREM"))
        XCTAssertEqual(healthKitSleepIntervalMapping(value: 99), .stage("unknown"))
    }
}
