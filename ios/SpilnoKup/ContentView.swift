import SwiftUI

struct ContentView: View {
    @StateObject private var state = AppState()
    @State private var selectedTab = 0

    var isLightTheme: Bool {
        state.themeType == .light || state.themeType == .cream
    }

    var body: some View {
        Group {
            if state.isLoggedIn {
                mainTabView
            } else {
                WelcomeView()
            }
        }
        .environmentObject(state)
        .preferredColorScheme(isLightTheme ? .light : .dark)
        .onAppear {
            state.loadUser()
            state.loadTheme()
        }
    }

    var mainTabView: some View {
        TabView(selection: $selectedTab) {
            MarketView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Маркет")
                }
                .tag(0)

            if state.user != nil {
                QRHubView()
                    .tabItem {
                        Image(systemName: "qrcode")
                        Text("QR")
                    }
                    .tag(1)

                ChatListView()
                    .tabItem {
                        Image(systemName: "message.fill")
                        Text("Чат")
                    }
                    .tag(2)

                SellerDashboardView()
                    .tabItem {
                        Image(systemName: "briefcase.fill")
                        Text("Бізнес")
                    }
                    .tag(3)
            }

            WalletView()
                .tabItem {
                    Image(systemName: "wallet.pass.fill")
                    Text("Гаманець")
                }
                .tag(4)
        }
        .tint(state.theme.accent)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
