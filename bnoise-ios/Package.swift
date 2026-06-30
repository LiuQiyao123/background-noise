// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "bnoise-ios",
    defaultLocalization: "zh-Hans",
    platforms: [
        .iOS(.v17)
    ],
    dependencies: [],
    targets: [
        .executableTarget(
            name: "bnoise-ios",
            path: "Sources"
        )
    ]
)
