import SwiftUI

struct AppTheme {
    static let bg = Color.black
    static let card = Color(hex: "#0a0a0f")
    static let cardAlt = Color(hex: "#111118")
    static let border = Color(hex: "#222230")
    static let text = Color.white
    static let textSec = Color(hex: "#a0a0b0")
    static let textMuted = Color(hex: "#555566")
    static let accent = Color(hex: "#4ade80")
    static let green = Color(hex: "#4ade80")
    static let orange = Color(hex: "#fb923c")
    static let yellow = Color(hex: "#facc15")
    static let red = Color(hex: "#ef4444")
    static let blue = Color(hex: "#0088cc")
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6: (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB, red: Double(r)/255, green: Double(g)/255, blue: Double(b)/255, opacity: Double(a)/255)
    }
}
