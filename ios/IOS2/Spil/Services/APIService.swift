import Foundation

class APIService: ObservableObject {
    static let baseURL = "https://iscup-production-25c2.up.railway.app/api"

    @Published var deals: [Deal] = []
    @Published var myOrders: [Order] = []
    @Published var wallet: Wallet?
    @Published var conversations: [Conversation] = []

    private var token: String? {
        get { UserDefaults.standard.string(forKey: "spil_token") }
        set { UserDefaults.standard.set(newValue, forKey: "spil_token") }
    }

    // MARK: - Generic Request
    private func request<T: Decodable>(_ path: String, method: String = "GET", body: [String: Any]? = nil) async throws -> T {
        var url = URLRequest(url: URL(string: "\(Self.baseURL)\(path)")!)
        url.httpMethod = method
        url.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let t = token { url.setValue("Bearer \(t)", forHTTPHeaderField: "Authorization") }
        if let b = body { url.httpBody = try JSONSerialization.data(withJSONObject: b) }
        let (data, resp) = try await URLSession.shared.data(for: url)
        if let http = resp as? HTTPURLResponse, http.statusCode == 401 {
            throw APIError.unauthorized
        }
        if let http = resp as? HTTPURLResponse, http.statusCode >= 400 {
            if let err = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                throw APIError.server(err.error)
            }
            throw APIError.server("Error \(http.statusCode)")
        }
        return try JSONDecoder().decode(T.self, from: data)
    }

    // MARK: - Auth
    func sendOtp(phone: String) async throws -> OtpResponse {
        return try await request("/auth/send-otp", method: "POST", body: ["phone": phone])
    }

    func verifyOtp(phone: String, otp: String, name: String?, city: String?, mode: String) async throws -> AuthResponse {
        var body: [String: Any] = ["phone": phone, "otp": otp, "mode": mode]
        if let n = name { body["name"] = n }
        if let c = city { body["city"] = c }
        let resp: AuthResponse = try await request("/auth/verify-otp", method: "POST", body: body)
        self.token = resp.accessToken
        UserDefaults.standard.set(resp.refreshToken, forKey: "spil_refresh")
        return resp
    }

    // MARK: - Deals
    func fetchDeals(limit: Int = 50) async throws {
        let resp: DealsResponse = try await request("/deals?limit=\(limit)")
        await MainActor.run { self.deals = resp.deals }
    }

    func fetchDeal(id: String) async throws -> Deal {
        return try await request("/deals/\(id)")
    }

    func createDeal(_ deal: CreateDealRequest) async throws -> Deal {
        return try await request("/deals", method: "POST", body: deal.toDict())
    }

    func deleteDeal(id: String) async throws {
        let _: SuccessResponse = try await request("/deals/\(id)", method: "DELETE")
    }

    // MARK: - Orders
    func createOrder(dealId: String, quantity: Int) async throws -> Order {
        return try await request("/orders", method: "POST", body: ["dealId": dealId, "quantity": quantity])
    }

    func fetchMyOrders() async throws {
        let orders: [Order] = try await request("/orders/my")
        await MainActor.run { self.myOrders = orders }
    }

    func fetchSellerOrders() async throws -> [Order] {
        return try await request("/orders/seller")
    }

    // MARK: - QR
    func generateQR(orderId: String) async throws -> QRResponse {
        return try await request("/qr/generate/\(orderId)", method: "POST")
    }

    func verifyQR(token: String) async throws -> QRVerifyResponse {
        return try await request("/qr/verify", method: "POST", body: ["token": token])
    }

    // MARK: - Wallet
    func fetchWallet() async throws {
        let w: Wallet = try await request("/wallet")
        await MainActor.run { self.wallet = w }
    }

    // MARK: - Chat
    func fetchConversations() async throws {
        let convs: [Conversation] = try await request("/chat/conversations")
        await MainActor.run { self.conversations = convs }
    }

    func fetchMessages(conversationId: String) async throws -> [Message] {
        return try await request("/chat/\(conversationId)/messages")
    }

    func sendMessage(conversationId: String, text: String) async throws -> Message {
        return try await request("/chat/\(conversationId)/messages", method: "POST", body: ["text": text])
    }

    func createConversation(sellerId: String, dealId: String?) async throws -> ConversationCreate {
        var body: [String: Any] = ["sellerId": sellerId]
        if let d = dealId { body["dealId"] = d }
        return try await request("/chat/conversations", method: "POST", body: body)
    }

    // MARK: - Logout
    func logout() {
        token = nil
        UserDefaults.standard.removeObject(forKey: "spil_refresh")
        UserDefaults.standard.removeObject(forKey: "spil_user")
    }
}

enum APIError: LocalizedError {
    case unauthorized, server(String)
    var errorDescription: String? {
        switch self {
        case .unauthorized: return "Сесія закінчилась"
        case .server(let msg): return msg
        }
    }
}
