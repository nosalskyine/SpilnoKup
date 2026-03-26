import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var auth: AuthManager
    @EnvironmentObject var api: APIService
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 14) {
                    // Profile
                    HStack(spacing: 14) {
                        Circle().fill(LinearGradient(colors: [AppTheme.accent, AppTheme.green], startPoint: .topLeading, endPoint: .bottomTrailing))
                            .frame(width: 52, height: 52)
                            .overlay(Text(String(auth.user?.name?.prefix(2) ?? "?")).font(.system(size: 18, weight: .heavy)).foregroundColor(.white))
                        VStack(alignment: .leading, spacing: 2) {
                            Text(auth.user?.name ?? "Гість").font(.system(size: 16, weight: .heavy)).foregroundColor(.white)
                            if let did = auth.user?.displayId { Text(did).font(.system(size: 11, weight: .bold)).foregroundColor(AppTheme.accent) }
                            Text(auth.user?.city ?? "").font(.system(size: 11)).foregroundColor(AppTheme.textSec)
                        }
                        Spacer()
                    }.padding(16).background(AppTheme.card).cornerRadius(14)

                    // Menu
                    VStack(spacing: 0) {
                        menuItem(icon: "bell.fill", title: "Центр подій", desc: "Сповіщення")
                        menuItem(icon: "creditcard.fill", title: "Транзакції", desc: "Історія платежів")
                        menuItem(icon: "person.2.fill", title: "Реферальна програма", desc: "Запросіть друзів")
                        menuItem(icon: "lock.shield.fill", title: "Безпека", desc: "2FA, сесії, ID")
                        menuItem(icon: "gearshape.fill", title: "Налаштування", desc: "Тема та вигляд")
                        menuItem(icon: "person.3.fill", title: "Спільнота", desc: "Telegram канал")
                    }.background(AppTheme.card).cornerRadius(14)

                    // Logout
                    Button {
                        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                        api.logout()
                        auth.logout()
                        dismiss()
                    } label: {
                        Text("Вийти з акаунта")
                            .font(.system(size: 15, weight: .bold)).foregroundColor(AppTheme.red)
                            .frame(maxWidth: .infinity).padding(16)
                            .background(AppTheme.red.opacity(0.08))
                            .overlay(RoundedRectangle(cornerRadius: 14).stroke(AppTheme.red.opacity(0.2), lineWidth: 1))
                            .cornerRadius(14)
                    }
                }.padding(16)
            }
            .background(AppTheme.bg)
            .navigationTitle("Меню")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button { dismiss() } label: { Image(systemName: "xmark").foregroundColor(.white) }
                }
            }
        }
    }

    func menuItem(icon: String, title: String, desc: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).font(.system(size: 16)).foregroundColor(AppTheme.accent)
                .frame(width: 40, height: 40).background(AppTheme.accent.opacity(0.1)).cornerRadius(10)
            VStack(alignment: .leading, spacing: 1) {
                Text(title).font(.system(size: 14, weight: .semibold)).foregroundColor(.white)
                Text(desc).font(.system(size: 11)).foregroundColor(AppTheme.textSec)
            }
            Spacer()
            Image(systemName: "chevron.right").font(.system(size: 12)).foregroundColor(AppTheme.textMuted)
        }
        .padding(.horizontal, 16).padding(.vertical, 14)
        .overlay(Divider().background(AppTheme.border.opacity(0.3)), alignment: .bottom)
    }
}
