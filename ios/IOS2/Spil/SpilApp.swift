import SwiftUI

@main
struct SpilApp: App {
    @StateObject private var auth = AuthManager()
    @StateObject private var api = APIService()

    var body: some Scene {
        WindowGroup {
            if auth.isLoggedIn {
                MainTabView()
                    .environmentObject(auth)
                    .environmentObject(api)
                    .preferredColorScheme(.dark)
            } else {
                AuthView()
                    .environmentObject(auth)
                    .environmentObject(api)
                    .preferredColorScheme(.dark)
            }
        }
    }
}
