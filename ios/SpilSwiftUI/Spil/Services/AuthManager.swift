import Foundation

class AuthManager: ObservableObject {
    @Published var isLoggedIn = false
    @Published var user: UserProfile?

    init() {
        if let data = UserDefaults.standard.data(forKey: "spil_user"),
           let u = try? JSONDecoder().decode(UserProfile.self, from: data) {
            self.user = u
            self.isLoggedIn = UserDefaults.standard.string(forKey: "spil_token") != nil
        }
    }

    func login(user: UserProfile) {
        self.user = user
        self.isLoggedIn = true
        if let data = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(data, forKey: "spil_user")
        }
    }

    func logout() {
        self.user = nil
        self.isLoggedIn = false
        UserDefaults.standard.removeObject(forKey: "spil_user")
        UserDefaults.standard.removeObject(forKey: "spil_token")
        UserDefaults.standard.removeObject(forKey: "spil_refresh")
    }
}
