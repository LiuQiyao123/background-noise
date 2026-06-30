import SwiftUI

/// 底噪 Design System — ported from chopinshown/bnoise iOS
/// Colors: ink/bone/concrete/stamp/highlight
/// Typography: DM Sans (body), Playfair Display (heading)
extension Color {
    // MARK: Core palette
    static let ink            = Color(hex: 0x121212)
    static let bone           = Color(hex: 0xF5EDE0)
    static let boneDark       = Color(hex: 0xE0D6C2)
    static let concrete       = Color(hex: 0xBCBAB5)
    static let concreteDark   = Color(hex: 0x8C8A84)
    static let danger         = Color(hex: 0xD42E2E)
    static let stamp          = Color(hex: 0x9E2121)
    static let highlight      = Color(hex: 0xF2C82E)
    static let warm           = Color(hex: 0xE67E22)

    // MARK: Vibe ratings
    static let vibeAtmos = Color(hex: 0xE85D4C)
    static let vibeBand  = Color(hex: 0x7C3AED)
    static let vibeSound = Color(hex: 0x3498DB)

    // MARK: Surfaces
    static let cardBg      = Color.white
    static let bgElevated  = Color(hex: 0xFAF6EF)
    static let textMuted   = Color(hex: 0x6B6762)
    static let textDim     = Color(hex: 0xA09C96)
    static let textDisabled = Color(hex: 0xC8C4BE)
}

extension Color {
    init(hex: UInt32) {
        self.init(
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255
        )
    }
}

// MARK: Typography
struct BNFonts {
    static let body = Font.custom("DM Sans", size: 14)
    static let bodySmall = Font.custom("DM Sans", size: 12)
    static let caption = Font.custom("DM Sans", size: 11)
    static let micro = Font.custom("DM Sans", size: 10)

    static let heading = Font.custom("Playfair Display", size: 28).weight(.black)
    static let headingSmall = Font.custom("Playfair Display", size: 24).weight(.black)
    static let title = Font.custom("Playfair Display", size: 20).weight(.bold)
    static let titleSmall = Font.custom("Playfair Display", size: 18).weight(.bold)

    static let mono = Font.custom("JetBrains Mono", size: 11).weight(.bold)
    static let monoSmall = Font.custom("JetBrains Mono", size: 9).weight(.black)

    static let heavySerif = Font.custom("Playfair Display", size: 18).weight(.black)
    static let artistName = Font.custom("Playfair Display", size: 22).weight(.black)
}
