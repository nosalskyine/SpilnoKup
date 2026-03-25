import SwiftUI

// MARK: - Theme

enum ThemeType: String, CaseIterable {
    case light = "light"
    case cream = "cream"
    case ocean = "ocean"
    case dark = "dark"
    case berry = "berry"

    var name: String {
        switch self {
        case .light: return "Світла"
        case .cream: return "Кремова"
        case .ocean: return "Океан"
        case .dark: return "Графіт"
        case .berry: return "Слива"
        }
    }

    var emoji: String {
        switch self {
        case .light: return "☀️"
        case .cream: return "🍦"
        case .ocean: return "🌊"
        case .dark: return "🌑"
        case .berry: return "🫐"
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

    static let ocean = AppTheme(
        bg: Color(hex: "0e1320"),
        card: Color(hex: "151c2c"),
        cardAlt: Color(hex: "1c2438"),
        border: Color(hex: "b8960a").opacity(0.27),
        text: Color(hex: "c8cdd6"),
        textSec: Color(hex: "7888a0"),
        textMuted: Color(hex: "4a5568"),
        accent: Color(hex: "3068b8"),
        green: Color(hex: "3a8fb0"),
        greenLight: Color(hex: "101c2c"),
        greenBorder: Color(hex: "1a3050"),
        orange: Color(hex: "c46a20"),
        yellow: Color(hex: "b8960a"),
        purple: Color(hex: "6870a8"),
        blue: Color(hex: "5078a0"),
        navBg: Color(hex: "0e1320").opacity(0.5),
        navText: Color(hex: "a0a8b8")
    )

    static let dark = AppTheme(
        bg: Color(hex: "111116"),
        card: Color(hex: "1a1a22"),
        cardAlt: Color(hex: "22222c"),
        border: Color(hex: "b8960a").opacity(0.27),
        text: Color(hex: "d4d4d8"),
        textSec: Color(hex: "85858f"),
        textMuted: Color(hex: "555560"),
        accent: Color(hex: "3d8c5c"),
        green: Color(hex: "5a9e74"),
        greenLight: Color(hex: "141f18"),
        greenBorder: Color(hex: "243328"),
        orange: Color(hex: "c46a20"),
        yellow: Color(hex: "b8960a"),
        purple: Color(hex: "7a72a8"),
        blue: Color(hex: "5878a0"),
        navBg: Color(hex: "111116").opacity(0.5),
        navText: Color(hex: "b0b0b8")
    )

    static let berry = AppTheme(
        bg: Color(hex: "14101a"),
        card: Color(hex: "1c1624"),
        cardAlt: Color(hex: "261e30"),
        border: Color(hex: "b8960a").opacity(0.27),
        text: Color(hex: "d0c8d4"),
        textSec: Color(hex: "8878a0"),
        textMuted: Color(hex: "5a4870"),
        accent: Color(hex: "9050b0"),
        green: Color(hex: "a068c0"),
        greenLight: Color(hex: "1a1224"),
        greenBorder: Color(hex: "2e1e40"),
        orange: Color(hex: "c46a20"),
        yellow: Color(hex: "b8960a"),
        purple: Color(hex: "8870a8"),
        blue: Color(hex: "7060a0"),
        navBg: Color(hex: "14101a").opacity(0.5),
        navText: Color(hex: "b0a8b8")
    )

    static let light = AppTheme(
        bg: Color(hex: "f5f5f5"),
        card: Color(hex: "ffffff"),
        cardAlt: Color(hex: "eef0f4"),
        border: Color(hex: "d0d5dd").opacity(0.5),
        text: Color(hex: "1a1a2e"),
        textSec: Color(hex: "6b7280"),
        textMuted: Color(hex: "9ca3af"),
        accent: Color(hex: "3d8c5c"),
        green: Color(hex: "2e7d4f"),
        greenLight: Color(hex: "e6f4ec"),
        greenBorder: Color(hex: "b8dcc8"),
        orange: Color(hex: "c46a20"),
        yellow: Color(hex: "b8960a"),
        purple: Color(hex: "6b5fa8"),
        blue: Color(hex: "4a78b0"),
        navBg: Color(hex: "ffffff").opacity(0.85),
        navText: Color(hex: "6b7280")
    )

    static let cream = AppTheme(
        bg: Color(hex: "faf8f2"),
        card: Color(hex: "ffffff"),
        cardAlt: Color(hex: "f0ece2"),
        border: Color(hex: "d6ceb8").opacity(0.5),
        text: Color(hex: "2c2416"),
        textSec: Color(hex: "8a7e6a"),
        textMuted: Color(hex: "b0a690"),
        accent: Color(hex: "8b6e3e"),
        green: Color(hex: "5a7a4a"),
        greenLight: Color(hex: "f0f4e8"),
        greenBorder: Color(hex: "c8d4b0"),
        orange: Color(hex: "c46a20"),
        yellow: Color(hex: "b8960a"),
        purple: Color(hex: "7a6890"),
        blue: Color(hex: "5a7090"),
        navBg: Color(hex: "faf8f2").opacity(0.85),
        navText: Color(hex: "8a7e6a")
    )

    static func theme(for type: ThemeType) -> AppTheme {
        switch type {
        case .light: return .light
        case .cream: return .cream
        case .ocean: return .ocean
        case .dark: return .dark
        case .berry: return .berry
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
