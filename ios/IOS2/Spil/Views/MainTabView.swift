import SwiftUI

struct MainTabView: View {
    @State private var tab = 0
    @EnvironmentObject var api: APIService

    var body: some View {
        ZStack(alignment: .bottom) {
            AppTheme.bg.ignoresSafeArea()

            Group {
                switch tab {
                case 0: MarketView()
                case 1: QRView()
                case 2: CreateDealView { tab = 0 }
                case 3: BusinessView()
                case 4: WalletView()
                default: MarketView()
                }
            }
            .padding(.bottom, 60)

            // Tab Bar
            HStack(spacing: 0) {
                tabButton(icon: "house.fill", label: "Головна", idx: 0)
                tabButton(icon: "qrcode.viewfinder", label: "QR", idx: 1)
                // Center + button
                Button { tab = 2; UIImpactFeedbackGenerator(style: .light).impactOccurred() } label: {
                    ZStack {
                        Circle().fill(AppTheme.accent).frame(width: 42, height: 42)
                        Image(systemName: "plus").font(.system(size: 20, weight: .bold)).foregroundColor(.black)
                    }.offset(y: -8)
                }.frame(maxWidth: .infinity)
                tabButton(icon: "chart.bar.fill", label: "Бізнес", idx: 3)
                tabButton(icon: "wallet.pass.fill", label: "Гаманець", idx: 4)
            }
            .frame(height: 60)
            .background(.ultraThinMaterial)
        }
        .task { try? await api.fetchDeals() }
    }

    func tabButton(icon: String, label: String, idx: Int) -> some View {
        Button {
            tab = idx
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
        } label: {
            VStack(spacing: 2) {
                Image(systemName: icon).font(.system(size: 18))
                Text(label).font(.system(size: 9))
            }
            .foregroundColor(tab == idx ? AppTheme.accent : AppTheme.textMuted)
            .frame(maxWidth: .infinity)
        }
    }
}
