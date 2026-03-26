import SwiftUI

struct ContentView: View {
    @StateObject private var state = AppState()
    @State private var selectedTab = 0
    @State private var showCreateDeal = false

    var body: some View {
        Group {
            if state.isLoggedIn {
                mainTabView
            } else {
                WelcomeView()
            }
        }
        .environmentObject(state)
        .preferredColorScheme(.dark)
        .onAppear {
            state.loadUser()
            state.loadTheme()
            if state.deals.isEmpty {
                state.loadDeals()
            }
        }
    }

    var mainTabView: some View {
        ZStack(alignment: .bottom) {
            // Content area
            Group {
                switch selectedTab {
                case 0:
                    MarketView()
                case 1:
                    if state.user != nil {
                        QRHubView()
                    } else {
                        MarketView()
                    }
                case 2:
                    // Handled by sheet
                    MarketView()
                case 3:
                    if state.user != nil {
                        SellerDashboardView()
                    } else {
                        MarketView()
                    }
                case 4:
                    WalletView()
                default:
                    MarketView()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(.bottom, 60)

            // Custom bottom nav bar
            customTabBar
        }
        .ignoresSafeArea(.keyboard, edges: .bottom)
        .sheet(isPresented: $showCreateDeal) {
            CreateDealView()
                .environmentObject(state)
        }
    }

    var customTabBar: some View {
        HStack(spacing: 0) {
            tabBarItem(icon: "house.fill", label: "Головна", index: 0)

            if state.user != nil {
                tabBarItem(icon: "qrcode", label: "QR", index: 1)
            }

            // Center "+" button with accent bg
            createButton

            if state.user != nil {
                tabBarItem(icon: "chart.bar.fill", label: "Бiзнес", index: 3)
            }

            tabBarItem(icon: "wallet.pass.fill", label: "Гаманець", index: 4)
        }
        .frame(height: 60)
        .background(
            state.theme.card
                .opacity(0.95)
                .background(.ultraThinMaterial)
                .ignoresSafeArea(edges: .bottom)
        )
        .overlay(
            Rectangle()
                .fill(state.theme.border)
                .frame(height: 0.5),
            alignment: .top
        )
    }

    func tabBarItem(icon: String, label: String, index: Int) -> some View {
        Button(action: { selectedTab = index }) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                Text(label)
                    .font(.system(size: 10))
            }
            .foregroundColor(selectedTab == index ? state.theme.accent : state.theme.navText)
            .frame(maxWidth: .infinity)
        }
    }

    var createButton: some View {
        Button(action: {
            showCreateDeal = true
        }) {
            VStack(spacing: 4) {
                ZStack {
                    Circle()
                        .fill(state.theme.accent)
                        .frame(width: 40, height: 40)
                    Image(systemName: "plus")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(state.theme.bg)
                }
                Text("+")
                    .font(.system(size: 10))
                    .foregroundColor(state.theme.accent)
            }
            .frame(maxWidth: .infinity)
            .offset(y: -8)
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
