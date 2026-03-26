import SwiftUI

// MARK: - Theme

enum ThemeType: String, CaseIterable {
    case midnight = "midnight"
    case cosmos = "cosmos"
    case emerald = "emerald"
    case noir = "noir"

    var name: String {
        switch self {
        case .midnight: return "Midnight"
        case .cosmos: return "Cosmos"
        case .emerald: return "Emerald"
        case .noir: return "Noir"
        }
    }

    var sfSymbol: String {
        switch self {
        case .midnight: return "moon.stars.fill"
        case .cosmos: return "sparkles"
        case .emerald: return "leaf.fill"
        case .noir: return "circle.lefthalf.filled"
        }
    }
}

struct AppTheme {
    let bg: Color
    let card: Color
    let cardAlt: Color
    let border: Color
    let text: Color
    let textSec: Color
    let textMuted: Color
    let accent: Color
    let green: Color
    let greenLight: Color
    let greenBorder: Color
    let orange: Color
    let yellow: Color
    let purple: Color
    let blue: Color
    let navBg: Color
    let navText: Color

    // Midnight (default): bg #000000, card #0a0a0f, accent #4ade80 (green)
    static let midnight = AppTheme(
        bg: Color(hex: "000000"),
        card: Color(hex: "0a0a0f"),
        cardAlt: Color(hex: "111118"),
        border: Color(hex: "1a1a24").opacity(0.8),
        text: Color(hex: "e4e4e8"),
        textSec: Color(hex: "8888a0"),
        textMuted: Color(hex: "555568"),
        accent: Color(hex: "4ade80"),
        green: Color(hex: "4ade80"),
        greenLight: Color(hex: "0a1a10"),
        greenBorder: Color(hex: "1a3020"),
        orange: Color(hex: "f97316"),
        yellow: Color(hex: "facc15"),
        purple: Color(hex: "a78bfa"),
        blue: Color(hex: "60a5fa"),
        navBg: Color(hex: "000000").opacity(0.85),
        navText: Color(hex: "888898")
    )

    // Cosmos: bg #000008, card #08081a, accent #6366f1 (indigo)
    static let cosmos = AppTheme(
        bg: Color(hex: "000008"),
        card: Color(hex: "08081a"),
        cardAlt: Color(hex: "101024"),
        border: Color(hex: "1a1a30").opacity(0.8),
        text: Color(hex: "e0e0f0"),
        textSec: Color(hex: "8080a8"),
        textMuted: Color(hex: "505070"),
        accent: Color(hex: "6366f1"),
        green: Color(hex: "6366f1"),
        greenLight: Color(hex: "0a0a20"),
        greenBorder: Color(hex: "1a1a40"),
        orange: Color(hex: "f97316"),
        yellow: Color(hex: "facc15"),
        purple: Color(hex: "a78bfa"),
        blue: Color(hex: "818cf8"),
        navBg: Color(hex: "000008").opacity(0.85),
        navText: Color(hex: "8080a0")
    )

    // Emerald: bg #000000, card #061008, accent #10b981
    static let emerald = AppTheme(
        bg: Color(hex: "000000"),
        card: Color(hex: "061008"),
        cardAlt: Color(hex: "0c1a10"),
        border: Color(hex: "122818").opacity(0.8),
        text: Color(hex: "d8e8dc"),
        textSec: Color(hex: "78a088"),
        textMuted: Color(hex: "4a6850"),
        accent: Color(hex: "10b981"),
        green: Color(hex: "10b981"),
        greenLight: Color(hex: "081810"),
        greenBorder: Color(hex: "103820"),
        orange: Color(hex: "f97316"),
        yellow: Color(hex: "facc15"),
        purple: Color(hex: "a78bfa"),
        blue: Color(hex: "34d399"),
        navBg: Color(hex: "000000").opacity(0.85),
        navText: Color(hex: "78a088")
    )

    // Noir: bg #000000, card #0c0c0c, accent #ffffff (white)
    static let noir = AppTheme(
        bg: Color(hex: "000000"),
        card: Color(hex: "0c0c0c"),
        cardAlt: Color(hex: "161616"),
        border: Color(hex: "222222").opacity(0.8),
        text: Color(hex: "e8e8e8"),
        textSec: Color(hex: "999999"),
        textMuted: Color(hex: "666666"),
        accent: Color(hex: "ffffff"),
        green: Color(hex: "ffffff"),
        greenLight: Color(hex: "141414"),
        greenBorder: Color(hex: "282828"),
        orange: Color(hex: "f97316"),
        yellow: Color(hex: "facc15"),
        purple: Color(hex: "a78bfa"),
        blue: Color(hex: "d4d4d4"),
        navBg: Color(hex: "000000").opacity(0.85),
        navText: Color(hex: "888888")
    )

    static func theme(for type: ThemeType) -> AppTheme {
        switch type {
        case .midnight: return .midnight
        case .cosmos: return .cosmos
        case .emerald: return .emerald
        case .noir: return .noir
        }
    }
}

// MARK: - Color hex

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r, g, b: Double
        switch hex.count {
        case 6:
            r = Double((int >> 16) & 0xFF) / 255
            g = Double((int >> 8) & 0xFF) / 255
            b = Double(int & 0xFF) / 255
        default:
            r = 0; g = 0; b = 0
        }
        self.init(red: r, green: g, blue: b)
    }
}
