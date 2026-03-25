import Foundation

class APIService {
    static let shared = APIService()
    let baseURL = "https://iscup-production-25c2.up.railway.app/api"
    let botUsername = "spilnokupbot"

    private var accessToken: String? {
        get { UserDefaults.standard.string(forKey: "spilnokup_token") }
        set { UserDefaults.standard.set(newValue, forKey: "spilnokup_token") }
    }

    private var refreshToken: String? {
        get { UserDefaults.standard.string(forKey: "spilnokup_refresh") }
        set { UserDefaults.standard.set(newValue, forKey: "spilnokup_refresh") }
    }

    // MARK: - Send OTP

    func sendOtp(phone: String) async throws -> SendOtpResponse {
        let body: [String: Any] = ["phone": phone]
        let data = try await request(path: "/auth/send-otp", method: "POST", body: body)
        return try JSONDecoder().decode(SendOtpResponse.self, from: data)
    }

    // MARK: - Verify OTP

    func verifyOtp(phone: String, otp: String, name: String, city: String) async throws -> VerifyOtpResponse {
        let body: [String: Any] = ["phone": phone, "otp": otp, "name": name, "city": city]
        let data = try await request(path: "/auth/verify-otp", method: "POST", body: body)
        let response = try JSONDecoder().decode(VerifyOtpResponse.self, from: data)

        // Save tokens
        if let token = response.accessToken {
            accessToken = token
        }
        if let refresh = response.refreshToken {
            refreshToken = refresh
        }

        return response
    }

    // MARK: - Telegram Deep Link

    var telegramBotURL: URL? {
        URL(string: "https://t.me/\(botUsername)")
    }

    func telegramStartURL(phone: String) -> URL? {
        let cleanPhone = phone.replacingOccurrences(of: " ", with: "")
        return URL(string: "tg://resolve?domain=\(botUsername)&start=\(cleanPhone)")
    }

    func telegramWebStartURL(phone: String) -> URL? {
        let cleanPhone = phone.replacingOccurrences(of: " ", with: "")
        return URL(string: "https://t.me/\(botUsername)?start=\(cleanPhone)")
    }

    // MARK: - Logout

    func logout() {
        accessToken = nil
        refreshToken = nil
        UserDefaults.standard.removeObject(forKey: "spilnokup_user")
    }

    // MARK: - Network

    private func request(path: String, method: String = "GET", body: [String: Any]? = nil) async throws -> Data {
        guard let url = URL(string: baseURL + path) else {
            throw APIError.invalidURL
        }

        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = accessToken {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            req.httpBody = try JSONSerialization.data(withJSONObject: body)
        }

        let (data, response) = try await URLSession.shared.data(for: req)

        guard let http = response as? HTTPURLResponse else {
            throw APIError.unknown
        }

        if http.statusCode == 401, let refresh = refreshToken {
            // Try refresh
            let refreshed = try await refreshAccessToken(refresh)
            if refreshed {
                req.setValue("Bearer \(accessToken ?? "")", forHTTPHeaderField: "Authorization")
                let (retryData, retryResp) = try await URLSession.shared.data(for: req)
                guard let retryHttp = retryResp as? HTTPURLResponse, retryHttp.statusCode < 400 else {
                    throw APIError.unauthorized
                }
                return retryData
            }
        }

        if http.statusCode >= 400 {
            if let errResp = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                throw APIError.server(errResp.error)
            }
            throw APIError.httpError(http.statusCode)
        }

        return data
    }

    private func refreshAccessToken(_ token: String) async throws -> Bool {
        guard let url = URL(string: baseURL + "/auth/refresh") else { return false }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: ["refreshToken": token])

        let (data, response) = try await URLSession.shared.data(for: req)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else { return false }

        if let resp = try? JSONDecoder().decode(RefreshResponse.self, from: data) {
            accessToken = resp.accessToken
            return true
        }
        return false
    }
}

// MARK: - Models

struct SendOtpResponse: Codable {
    let message: String
    let otp: String?
    let telegram: Bool?
}

struct VerifyOtpResponse: Codable {
    let accessToken: String?
    let refreshToken: String?
    let user: APIUser?
}

struct APIUser: Codable {
    let id: String
    let displayId: String?
    let name: String?
    let city: String?
    let role: String?
    let avatarUrl: String?
    let isVerified: Bool?
}

struct RefreshResponse: Codable {
    let accessToken: String
}

struct ErrorResponse: Codable {
    let error: String
}

enum APIError: Error, LocalizedError {
    case invalidURL
    case unauthorized
    case unknown
    case httpError(Int)
    case server(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Невірний URL"
        case .unauthorized: return "Сесія закінчилась"
        case .unknown: return "Невідома помилка"
        case .httpError(let code): return "Помилка \(code)"
        case .server(let msg): return msg
        }
    }
}
