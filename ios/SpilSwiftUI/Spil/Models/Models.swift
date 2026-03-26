import Foundation

struct UserProfile: Codable, Identifiable {
    let id: String
    var displayId: String?
    var name: String?
    var city: String?
    var role: String?
    var avatarUrl: String?
    var isVerified: Bool?
}

struct Deal: Codable, Identifiable {
    let id: String
    var sellerId: String?
    var title: String
    var description: String?
    var category: String?
    var retailPrice: String?
    var groupPrice: String?
    var unit: String?
    var minQty: Int?
    var maxQty: Int?
    var needed: Int?
    var joined: Int?
    var deadline: String?
    var status: String?
    var images: [String]?
    var tags: [String]?
    var isHot: Bool?
    var city: String?
    var views: Int?
    var seller: DealSeller?

    var retail: Double { Double(retailPrice ?? "0") ?? 0 }
    var group: Double { Double(groupPrice ?? "0") ?? 0 }
    var discount: Int { retail > 0 ? Int(((retail - group) / retail) * 100) : 0 }
    var progress: Double { Double(joined ?? 0) / max(Double(needed ?? 1), 1) }
    var daysLeft: Int {
        guard let d = deadline else { return 0 }
        let fmt = ISO8601DateFormatter()
        fmt.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = fmt.date(from: d) else { return 0 }
        return max(0, Calendar.current.dateComponents([.day], from: Date(), to: date).day ?? 0)
    }
    var geoCoords: (Double, Double)? {
        guard let img = images?.first, img.hasPrefix("geo:") else { return nil }
        let parts = img.replacingOccurrences(of: "geo:", with: "").split(separator: ",")
        guard parts.count == 2, let lat = Double(parts[0]), let lng = Double(parts[1]) else { return nil }
        return (lat, lng)
    }
}

struct DealSeller: Codable {
    var name: String?
    var city: String?
    var avatarUrl: String?
}

struct Order: Codable, Identifiable {
    let id: String
    var dealId: String?
    var buyerId: String?
    var quantity: Int?
    var amount: String?
    var status: String?
    var deal: Deal?
    var buyer: DealSeller?
    var qrToken: QRToken?
}

struct QRToken: Codable {
    var token: String
    var expiresAt: String?
    var isUsed: Bool?
}

struct Wallet: Codable {
    var id: String?
    var availableBalance: String?
    var heldBalance: String?
    var totalEarned: String?
    var transactions: [Transaction]?
}

struct Transaction: Codable, Identifiable {
    let id: String
    var type: String?
    var amount: String?
    var description: String?
    var createdAt: String?
}

struct Conversation: Codable, Identifiable {
    let id: String
    var other: DealSeller?
    var deal: ConvDeal?
    var lastMessage: Message?
    var unread: Int?
}

struct ConvDeal: Codable {
    var id: String?
    var title: String?
}

struct Message: Codable, Identifiable {
    let id: String
    var conversationId: String?
    var senderId: String?
    var text: String?
    var createdAt: String?
    var sender: DealSeller?
}

// MARK: - Responses
struct DealsResponse: Codable {
    var deals: [Deal]
    var total: Int?
}

struct OtpResponse: Codable {
    var message: String?
    var otp: String?
    var telegramToken: String?
    var telegram: Bool?
}

struct AuthResponse: Codable {
    var accessToken: String?
    var refreshToken: String?
    var user: UserProfile?
}

struct QRResponse: Codable {
    var token: String
    var expiresAt: String?
    var orderId: String?
}

struct QRVerifyResponse: Codable {
    var success: Bool?
    var order: QROrderInfo?
}

struct QROrderInfo: Codable {
    var id: String?
    var buyer: String?
    var item: String?
    var quantity: Int?
    var amount: Double?
    var unit: String?
}

struct ConversationCreate: Codable {
    var id: String
}

struct ErrorResponse: Codable { var error: String }
struct SuccessResponse: Codable { var success: Bool? }

struct CreateDealRequest {
    var title: String; var description: String; var category: String
    var retailPrice: Double; var groupPrice: Double; var unit: String
    var minQty: Int; var maxQty: Int; var needed: Int
    var deadline: String; var tags: [String]; var city: String
    var autoConfirm: Bool

    func toDict() -> [String: Any] {
        ["title": title, "description": description, "category": category,
         "retailPrice": retailPrice, "groupPrice": groupPrice, "unit": unit,
         "minQty": minQty, "maxQty": maxQty, "needed": needed,
         "deadline": deadline, "tags": tags, "city": city, "autoConfirm": autoConfirm,
         "images": []]
    }
}
