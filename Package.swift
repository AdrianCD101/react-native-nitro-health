// swift-tools-version: 5.9

// Test-only package: lets `swift test` unit test the pure Swift helpers in ios/
// without the React Native / CocoaPods build graph. Consumers never use this —
// the pod compiles the same sources via NitroHealth.podspec. This manifest must
// stay at the repo root: the podspec globs ios/*.swift, so a Package.swift
// inside ios/ would be compiled into the pod and break consumer builds.
import PackageDescription

let package = Package(
    name: "NitroHealthHelpers",
    targets: [
        .target(
            name: "NitroHealthHelpers",
            path: "ios",
            exclude: ["Tests"],
            sources: [
                "DailyBucketUtils.swift",
                "SampleCursorUtils.swift",
                "SampleUuidParsing.swift",
                "StatisticsBucketUtils.swift",
                "WorkoutActivityTypeMapping.swift",
            ]
        ),
        .testTarget(
            name: "NitroHealthHelpersTests",
            dependencies: ["NitroHealthHelpers"],
            path: "ios/Tests"
        ),
    ]
)
