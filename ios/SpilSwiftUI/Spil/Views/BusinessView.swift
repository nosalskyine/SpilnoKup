import SwiftUI

struct BusinessView: View {
    @EnvironmentObject var api: APIService
    @State private var tab = 0
    @State private var myOrders: [Order] = []
    @State private var sellerOrders: [Order] = []
    @State private var loading = true

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                Picker("", selection: $tab) {
                    Text("Мої товари").tag(0)
                    Text("Мої покупки").tag(1)
                }.pickerStyle(.segmented).padding(.horizontal, 16)

                if loading {
                    ProgressView().padding(40)
                } else if tab == 0 {
                    sellerTab
                } else {
                    buyerTab
                }
            }.padding(.top, 10)
        }
        .background(AppTheme.bg)
        .task { await loadData() }
    }

    var sellerTab: some View {
        VStack(spacing: 10) {
            let paid = sellerOrders.filter { $0.status == "PAID" }
            let done = sellerOrders.filter { $0.status == "COMPLETED" }
            let rev = sellerOrders.reduce(0) { $0 + (Double($1.amount ?? "0") ?? 0) }

            if !sellerOrders.isEmpty {
                HStack(spacing: 8) {
                    statBox("₴\(Int(rev))", "Дохід")
                    statBox("\(paid.count)", "Очікують")
                    statBox("\(done.count)", "Видані")
                }.padding(.horizontal, 16)
            }

            if paid.isEmpty && done.isEmpty {
                VStack(spacing: 10) {
                    Image(systemName: "shippingbox").font(.system(size: 36)).foregroundColor(AppTheme.textMuted)
                    Text("Немає замовлень").foregroundColor(AppTheme.textMuted)
                }.padding(40)
            }

            if !paid.isEmpty {
                Text("Нові замовлення (\(paid.count))").font(.system(size: 13, weight: .heavy)).foregroundColor(.white)
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 16)
                ForEach(paid) { o in orderRow(o, badge: "Оплачено", badgeColor: AppTheme.yellow) }.padding(.horizontal, 16)
            }

            if !done.isEmpty {
                Text("Видані (\(done.count))").font(.system(size: 13, weight: .heavy)).foregroundColor(.white)
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 16)
                ForEach(done) { o in orderRow(o, badge: "Видано", badgeColor: AppTheme.green).opacity(0.5) }.padding(.horizontal, 16)
            }
        }
    }

    var buyerTab: some View {
        VStack(spacing: 10) {
            let paid = myOrders.filter { $0.status == "PAID" }
            let done = myOrders.filter { $0.status == "COMPLETED" }

            if myOrders.isEmpty {
                VStack(spacing: 10) {
                    Image(systemName: "cart").font(.system(size: 36)).foregroundColor(AppTheme.textMuted)
                    Text("Ще нічого не купували").foregroundColor(AppTheme.textMuted)
                }.padding(40)
            }

            if !paid.isEmpty {
                Text("Очікують (\(paid.count))").font(.system(size: 13, weight: .heavy)).foregroundColor(.white)
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 16)
                ForEach(paid) { o in
                    VStack(spacing: 8) {
                        orderRow(o, badge: "Чекає", badgeColor: AppTheme.yellow)
                        Button("Показати QR") { }.font(.system(size: 11, weight: .bold))
                            .frame(maxWidth: .infinity).padding(10)
                            .background(AppTheme.accent).foregroundColor(.black).cornerRadius(8)
                    }.padding(.horizontal, 16)
                }
            }

            if !done.isEmpty {
                Text("Отримані (\(done.count))").font(.system(size: 13, weight: .heavy)).foregroundColor(.white)
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 16)
                ForEach(done) { o in orderRow(o, badge: "Отримано", badgeColor: AppTheme.green).opacity(0.5) }.padding(.horizontal, 16)
            }
        }
    }

    func orderRow(_ o: Order, badge: String, badgeColor: Color) -> some View {
        HStack(spacing: 10) {
            Image(systemName: "shippingbox.fill").foregroundColor(AppTheme.accent)
            VStack(alignment: .leading) {
                Text(o.buyer?.name ?? o.deal?.title ?? "").font(.system(size: 12, weight: .bold)).foregroundColor(.white)
                Text("\(o.deal?.title ?? "") × \(o.quantity ?? 0)").font(.system(size: 10)).foregroundColor(AppTheme.textSec)
            }
            Spacer()
            VStack(alignment: .trailing) {
                Text("₴\(o.amount ?? "0")").font(.system(size: 13, weight: .heavy)).foregroundColor(AppTheme.green)
                Text(badge).font(.system(size: 8, weight: .bold)).foregroundColor(badgeColor)
                    .padding(.horizontal, 6).padding(.vertical, 2)
                    .background(badgeColor.opacity(0.15)).cornerRadius(4)
            }
        }.padding(12).background(AppTheme.card).cornerRadius(10)
    }

    func statBox(_ val: String, _ label: String) -> some View {
        VStack(spacing: 2) {
            Text(val).font(.system(size: 14, weight: .heavy)).foregroundColor(AppTheme.green)
            Text(label).font(.system(size: 8)).foregroundColor(AppTheme.textSec)
        }.frame(maxWidth: .infinity).padding(10).background(AppTheme.card).cornerRadius(10)
    }

    func loadData() async {
        try? await api.fetchMyOrders()
        myOrders = api.myOrders
        sellerOrders = (try? await api.fetchSellerOrders()) ?? []
        loading = false
    }
}
