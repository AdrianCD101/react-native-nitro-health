import XCTest
@testable import NitroHealthHelpers

final class WorkoutActivityTypeMappingTests: XCTestCase {
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

    func testMapsEveryDefinedActivityType() {
        for (rawValue, expected) in expectedMappings {
            XCTAssertEqual(
                makeWorkoutActivityType(rawValue: rawValue),
                expected,
                "rawValue \(rawValue) should map to \(expected)"
            )
        }
    }

    func testFoldsSubVariantsIntoParentActivity() {
        // Skiing variants
        XCTAssertEqual(makeWorkoutActivityType(rawValue: 60), "skiing")
        XCTAssertEqual(makeWorkoutActivityType(rawValue: 61), "skiing")
        // Dance variants (incl. deprecated danceInspiredTraining)
        XCTAssertEqual(makeWorkoutActivityType(rawValue: 15), "dance")
        XCTAssertEqual(makeWorkoutActivityType(rawValue: 77), "dance")
        XCTAssertEqual(makeWorkoutActivityType(rawValue: 78), "dance")
        // Strength-training variants
        XCTAssertEqual(makeWorkoutActivityType(rawValue: 20), "strengthTraining")
        XCTAssertEqual(makeWorkoutActivityType(rawValue: 50), "strengthTraining")
        // Wheelchair paces
        XCTAssertEqual(makeWorkoutActivityType(rawValue: 70), "wheelchair")
        XCTAssertEqual(makeWorkoutActivityType(rawValue: 71), "wheelchair")
        // Stairs into stairClimbing
        XCTAssertEqual(makeWorkoutActivityType(rawValue: 68), "stairClimbing")
    }

    func testUnknownValuesMapToOther() {
        XCTAssertEqual(makeWorkoutActivityType(rawValue: 0), "other")
        XCTAssertEqual(makeWorkoutActivityType(rawValue: 81), "other") // gap in HK raw values
        XCTAssertEqual(makeWorkoutActivityType(rawValue: 99999), "other")
    }
}
