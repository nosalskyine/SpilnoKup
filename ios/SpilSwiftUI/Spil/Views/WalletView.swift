import SwiftUI

struct WalletView: View {
    @EnvironmentObject var api: APIService
    @EnvironmentObject var auth: AuthManager

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                // Profile
                HStack(spacing: 14) {
                    Circle().fill(LinearGradient(colors: [AppTheme.accent, AppTheme.green], startPoint: .topLeading, endPoint: .bottomTrailing))
                        .frame(width: 56, height: 56)
                        .overlay(Text(String(auth.user?.name?.prefix(2) ?? "?")).font(.system(size: 20, weight: .heavy)).foregroundColor(.white))
                    VStack(alignment: .leading, spacing: 2) {
                        Text(auth.user?.name ?? "Гість").font(.system(size: 16, weight: .heavy)).foregroundColor(.white)
                        if let did = auth.user?.displayId { Text("ID: \(did)").font(.system(size: 10, weight: .bold)).foregroundColor(AppTheme.accent) }
                        Text(auth.user?.city ?? "").font(.system(size: 11)).foregroundColor(AppTheme.textSec)
                    }
                    Spacer()
                }.padding(16)

                // Balance
                VStack(spacing: 6) {
                    Text("Баланс").font(.system(size: 11)).foregroundColor(AppTheme.green)
                    Text("₴\(Int(Double(api.wallet?.availableBalance ?? "0") ?? 0))").font(.system(size: 32, weight: .heavy)).foregroundColor(.white)
                    if let held = api.wallet?.heldBalance, (Double(held) ?? 0) > 0 {
                        Text("Заморожено: ₴\(Int(Double(held) ?? 0))").font(.system(size: 11)).foregroundColor(AppTheme.yellow)
                    }
                }
                .frame(maxWidth: .infinity).padding(20)
                .background(LinearGradient(colors: [AppTheme.green.opacity(0.08), AppTheme.green.opacity(0.02)], startPoint: .topLeading, endPoint: .bottomTrailing))
                .cornerRadius(14).padding(.horizontal, 16)

                // Transactions
                Text("Транзакції").font(.system(size: 14, weight: .heavy)).foregroundColor(.white)
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 16)

                if let txs = api.wallet?.transactions, !txs.isEmpty {
                    ForEach(txs) { tx in
                        let isIncome = tx.type == "PAYMENT_RELEASE"
                        HStack(spacing: 10) {
                            Image(systemName: isIncome ? "arrow.down.circle.fill" : "arrow.up.circle.fill")
                                .foregroundColor(isIncome ? AppTheme.green : AppTheme.orange)
                            VStack(alignment: .leading) {
                                Text(tx.description ?? tx.type ?? "").font(.system(size: 12, weight: .bold)).foregroundColor(.white).lineLimit(1)
                                Text(formatDate(tx.createdAt)).font(.system(size: 10)).foregroundColor(AppTheme.textSec)
                            }
                            Spacer()
                            Text("\(isIncome ? "+" : "−")₴\(Int(Double(tx.amount ?? "0") ?? 0))")
                                .font(.system(size: 14, weight: .heavy))
                                .foregroundColor(isIncome ? AppTheme.green : AppTheme.orange)
                        }.padding(12).background(AppTheme.card).cornerRadius(10).padding(.horizontal, 16)
                    }
                } else {
                    Text("Поки немає транзакцій").font(.system(size: 12)).foregroundColor(AppTheme.textMuted).padding(20)
                }
            }.padding(.top, 10)
        }
        .background(AppTheme.bg)
        .task { try? await api.fetchWallet() }
    }

    func formatDate(_ iso: String?) -> String {
        guard let s = iso else { return "" }
        let fmt = ISO8601DateFormatter(); fmt.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let d = fmt.date(from: s) else { return "" }
        let df = DateFormatter(); df.dateFormat = "dd.MM · HH:mm"
        return df.string(from: d)
    }
}
