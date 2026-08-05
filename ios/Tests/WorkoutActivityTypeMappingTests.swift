import XCTest
@testable import NitroHealthHelpers

final class WorkoutActivityTypeMappingTests: XCTestCase {
    private let writableActivityTypes = [
        "americanFootball", "australianFootball", "badminton", "baseball", "basketball",
        "boxing", "climbing", "cricket", "crossTraining", "cycling", "dance", "discSports",
        "elliptical", "fencing", "flexibility", "golf", "gymnastics", "handball",
        "highIntensityIntervalTraining", "hiking", "hockey", "martialArts", "mindAndBody",
        "other", "paddleSports", "pilates", "racquetball", "rowing", "rugby", "running",
        "sailing", "skating", "skiing", "snowboarding", "snowSports", "soccer", "softball",
        "squash", "stairClimbing", "strengthTraining", "surfing", "swimming", "tableTennis",
        "tennis", "volleyball", "walking", "waterPolo", "wheelchair", "yoga",
    ]

    // Every defined HKWorkoutActivityType raw value and its normalized mapping.
    private let expectedMappings: [UInt: String] = [
        1: "americanFootball",
        2: "archery",
        3: "australianFootball",
        4: "badminton",
        5: "baseball",
        6: "basketball",
        7: "bowling",
        8: "boxing",
        9: "climbing",
        10: "cricket",
        11: "crossTraining",
        12: "curling",
        13: "cycling",
        14: "dance",
        15: "dance",
        16: "elliptical",
        17: "equestrianSports",
        18: "fencing",
        19: "fishing",
        20: "strengthTraining",
        21: "golf",
        22: "gymnastics",
        23: "handball",
        24: "hiking",
        25: "hockey",
        26: "hunting",
        27: "lacrosse",
        28: "martialArts",
        29: "mindAndBody",
        30: "mixedCardio",
        31: "paddleSports",
        32: "other",
        33: "flexibility",
        34: "racquetball",
        35: "rowing",
        36: "rugby",
        37: "running",
        38: "sailing",
        39: "skating",
        40: "snowSports",
        41: "soccer",
        42: "softball",
        43: "squash",
        44: "stairClimbing",
        45: "surfing",
        46: "swimming",
        47: "tableTennis",
        48: "tennis",
        49: "trackAndField",
        50: "strengthTraining",
        51: "volleyball",
        52: "walking",
        53: "waterFitness",
        54: "waterPolo",
        55: "waterSports",
        56: "wrestling",
        57: "yoga",
        58: "barre",
        59: "coreTraining",
        60: "skiing",
        61: "skiing",
        62: "flexibility",
        63: "highIntensityIntervalTraining",
        64: "jumpRope",
        65: "kickboxing",
        66: "pilates",
        67: "snowboarding",
        68: "stairClimbing",
        69: "stepTraining",
        70: "wheelchair",
        71: "wheelchair",
        72: "taiChi",
        73: "mixedCardio",
        74: "handCycling",
        75: "discSports",
        76: "fitnessGaming",
        77: "dance",
        78: "dance",
        79: "pickleball",
        80: "flexibility",
        82: "swimBikeRun",
        83: "other",
        84: "underwaterDiving",
        3000: "other",
    ]

    func testMapsEveryDefinedActivityTypeAsKnown() {
        for (rawValue, expected) in expectedMappings {
            guard case .known(let type, _, _) = makeHealthKitWorkoutActivityMapping(rawValue: rawValue) else {
                XCTFail("rawValue \(rawValue) should be known")
                continue
            }
            XCTAssertEqual(type, expected, "rawValue \(rawValue) should map to \(expected)")
        }
    }

    func testFoldsSubVariantsIntoParentActivity() {
        // Skiing variants
        assertKnown(rawValue: 60, type: "skiing", portability: .portable, mapping: .broadened)
        assertKnown(rawValue: 61, type: "skiing", portability: .portable, mapping: .broadened)
        // Dance variants (incl. deprecated danceInspiredTraining)
        assertKnown(rawValue: 15, type: "dance", portability: .portable, mapping: .broadened)
        assertKnown(rawValue: 77, type: "dance", portability: .portable, mapping: .broadened)
        assertKnown(rawValue: 78, type: "dance", portability: .portable, mapping: .broadened)
        // Strength-training variants
        assertKnown(rawValue: 20, type: "strengthTraining", portability: .portable, mapping: .broadened)
        assertKnown(rawValue: 50, type: "strengthTraining", portability: .portable, mapping: .broadened)
        // Wheelchair paces
        assertKnown(rawValue: 70, type: "wheelchair", portability: .portable, mapping: .broadened)
        assertKnown(rawValue: 71, type: "wheelchair", portability: .portable, mapping: .broadened)
        // Stairs into stairClimbing
        assertKnown(rawValue: 68, type: "stairClimbing", portability: .portable, mapping: .broadened)
    }

    func testDistinguishesNativeOtherFromUnknownFutureValues() {
        assertKnown(rawValue: 3000, type: "other", portability: .portable, mapping: .exact)
        XCTAssertEqual(makeHealthKitWorkoutActivityMapping(rawValue: 0), .unknown)
        XCTAssertEqual(makeHealthKitWorkoutActivityMapping(rawValue: 81), .unknown)
        XCTAssertEqual(makeHealthKitWorkoutActivityMapping(rawValue: 99999), .unknown)
    }

    func testWritableActivitiesRoundTripThroughCanonicalNativeTypes() throws {
        XCTAssertEqual(writableActivityTypes.count, 49)
        for activityType in writableActivityTypes {
            let rawValue = try healthKitWorkoutActivityRawValue(activityType)
            guard case .known(let type, let portability, _) = makeHealthKitWorkoutActivityMapping(rawValue: rawValue) else {
                XCTFail("\(activityType) should round-trip as known")
                continue
            }
            XCTAssertEqual(type, activityType)
            XCTAssertEqual(portability, .portable)
        }
    }

    func testMarksRecognizedNonWritableActivitiesReadOnly() {
        assertKnown(rawValue: 2, type: "archery", portability: .readOnly, mapping: .exact)
        assertKnown(rawValue: 64, type: "jumpRope", portability: .readOnly, mapping: .exact)
        assertKnown(rawValue: 84, type: "underwaterDiving", portability: .readOnly, mapping: .exact)
    }

    func testRejectsNonPortableWritableActivities() {
        for activityType in ["archery", "calisthenics", "jumpRope", "underwaterDiving"] {
            XCTAssertThrowsError(try healthKitWorkoutActivityRawValue(activityType))
        }
    }

    private func assertKnown(
        rawValue: UInt,
        type: String,
        portability: HealthKitWorkoutActivityMapping.Portability,
        mapping: HealthKitWorkoutActivityMapping.Fidelity
    ) {
        XCTAssertEqual(
            makeHealthKitWorkoutActivityMapping(rawValue: rawValue),
            .known(type: type, portability: portability, mapping: mapping)
        )
    }
}
