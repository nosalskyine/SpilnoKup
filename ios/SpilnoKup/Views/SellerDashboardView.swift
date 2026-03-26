import SwiftUI

struct SellerDashboardView: View {
    @EnvironmentObject var state: AppState
    @State private var tab = 0 // 0 = Мої товари, 1 = Мої покупки
    @State private var selectedDeal: Deal? = nil
    @State private var hasAppeared = false

    var revenue: [Int] { [2400, 3100, 1800, 4200, 2900, 3600, 1500] }
    var dayLabels: [String] { ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"] }
    var maxRev: Int { revenue.max() ?? 1 }
    var totalRev: Int {
        let orderTotal = state.orders.reduce(0) { $0 + $1.amount }
        return orderTotal > 0 ? orderTotal : revenue.reduce(0, +)
    }

    var paidOrders: [Order] { state.orders.filter { $0.status == .paid } }
    var doneOrders: [Order] { state.orders.filter { $0.status == .done } }

    var body: some View {
        NavigationStack {
            ZStack {
                state.theme.bg.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        // Two tabs: Мої товари | Мої покупки
                        HStack(spacing: 0) {
                            tabButton("Моi товари", index: 0)
                            tabButton("Моi покупки", index: 1)
                        }
                        .background(state.theme.card)
                        .cornerRadius(10)
                        .padding(.horizontal)

                        if tab == 0 {
                            businessTab
                        } else {
                            myPurchasesTab
                        }
                    }
                    .padding(.top, 8)
                    .padding(.bottom, 20)
                }
            }
            .navigationTitle("Кабiнет")
            .navigationDestination(item: $selectedDeal) { deal in
                DealDetailView(deal: deal)
            }
            .onAppear {
                if !hasAppeared {
                    hasAppeared = true
                    state.loadSellerData()
                    state.loadMyOrders()
                }
            }
        }
    }

    func tabButton(_ title: String, index: Int) -> some View {
        Button(action: { tab = index }) {
            Text(title)
                .font(.subheadline.bold())
                .foregroundColor(tab == index ? state.theme.bg : state.theme.textSec)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(tab == index ? state.theme.accent : Color.clear)
                .cornerRadius(10)
        }
    }

    var businessTab: some View {
        VStack(spacing: 16) {
            // Loading indicator
            if state.isLoadingSellerData {
                HStack(spacing: 8) {
                    ProgressView()
                        .tint(state.theme.accent)
                    Text("Завантаження...")
                        .font(.caption)
                        .foregroundColor(state.theme.textSec)
                }
                .padding(.vertical, 8)
            }

            Group {
                // Seller card with initials
                sellerHeader

                // Stats grid (revenue, awaiting, delivered, active)
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                    statCard("Дохiд", "\(totalRev) грн", state.theme.green)
                    statCard("Очiкує", "\(paidOrders.count)", state.theme.orange)
                    statCard("Видано", "\(doneOrders.count)", state.theme.yellow)
                    statCard("Активнi", "\(state.sellerDeals.count)", state.theme.accent)
                }
                .padding(.horizontal)
            }

            Group {
                // Revenue chart
                revenueChart

                // Seller listings
                if !state.sellerDeals.isEmpty {
                    sectionHeader("Моi угоди")
                    ForEach(state.sellerDeals) { deal in
                        DealCardView(deal: deal) { selectedDeal = deal }
                            .padding(.horizontal)
                    }
                }
            }

            Group {
                // New orders with status badges
                if !paidOrders.isEmpty {
                    sectionHeader("Очiкують видачi")
                    ForEach(paidOrders) { order in
                        orderRow(order)
                    }
                }

                // Completed orders (reduced opacity)
                if !doneOrders.isEmpty {
                    sectionHeader("Завершенi")
                    ForEach(doneOrders) { order in
                        orderRow(order)
                            .opacity(0.6)
                    }
                }

                // Empty state
                if state.orders.isEmpty && !state.isLoadingSellerData {
                    VStack(spacing: 12) {
                        Image(systemName: "briefcase")
                            .font(.system(size: 32))
                            .foregroundColor(state.theme.textMuted)
                        Text("Замовлень поки немає")
                            .font(.subheadline)
                            .foregroundColor(state.theme.textSec)
                    }
                    .padding(.top, 20)
                }
            }
        }
    }

    var sellerHeader: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(state.theme.accent)
                    .frame(width: 56, height: 56)
                Text(sellerInitials)
                    .font(.title3.bold())
                    .foregroundColor(state.theme.bg)
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(state.user?.name ?? SampleData.seller.name)
                    .font(.headline)
                    .foregroundColor(state.theme.text)
                HStack(spacing: 2) {
                    Image(systemName: "star.fill")
                        .font(.system(size: 11))
                        .foregroundColor(state.theme.yellow)
                    Text(String(format: "%.1f", SampleData.seller.rating))
                        .font(.caption)
                        .foregroundColor(state.theme.textSec)
                    Text("- \(state.user?.city ?? SampleData.seller.city)")
                        .font(.caption)
                        .foregroundColor(state.theme.textMuted)
                }
            }
            Spacer()

            Button(action: { state.loadSellerData() }) {
                Image(systemName: "arrow.clockwise")
                    .font(.caption)
                    .foregroundColor(state.theme.accent)
            }
        }
        .padding(14)
        .background(state.theme.card)
        .cornerRadius(10)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(state.theme.border, lineWidth: 1))
        .padding(.horizontal)
    }

    var revenueChart: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Дохiд за тиждень")
                .font(.headline)
                .foregroundColor(state.theme.text)

            HStack(alignment: .bottom, spacing: 8) {
                ForEach(0..<7, id: \.self) { i in
                    VStack(spacing: 4) {
                        Text("\(revenue[i])")
                            .font(.system(size: 8))
                            .foregroundColor(state.theme.textMuted)
                        RoundedRectangle(cornerRadius: 4)
                            .fill(i == Calendar.current.component(.weekday, from: Date()) - 2
                                  ? state.theme.accent : state.theme.accent.opacity(0.4))
                            .frame(height: CGFloat(revenue[i]) / CGFloat(maxRev) * 100)
                        Text(dayLabels[i])
                            .font(.system(size: 10))
                            .foregroundColor(state.theme.textMuted)
                    }
                }
            }
            .frame(height: 140)
        }
        .padding(14)
        .background(state.theme.card)
        .cornerRadius(10)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(state.theme.border, lineWidth: 1))
        .padding(.horizontal)
    }

    var sellerInitials: String {
        let name = state.user?.name ?? SampleData.seller.name
        let parts = name.components(separatedBy: " ")
        let first = parts.first?.prefix(1) ?? ""
        let last = parts.count > 1 ? parts[1].prefix(1) : ""
        return "\(first)\(last)".uppercased()
    }

    var myPurchasesTab: some View {
        VStack(spacing: 12) {
            let myDeals = state.deals.filter { state.isJoined($0.id) }
            if myDeals.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "cart")
                        .font(.system(size: 40))
                        .foregroundColor(state.theme.textMuted)
                    Text("Ви ще не приєдналися до жодноi покупки")
                        .font(.subheadline)
                        .foregroundColor(state.theme.textSec)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 40)
            } else {
                ForEach(myDeals) { deal in
                    DealCardView(deal: deal) { selectedDeal = deal }
                        .padding(.horizontal)
                }
            }
        }
    }

    func statCard(_ title: String, _ value: String, _ color: Color) -> some View {
        VStack(spacing: 6) {
            Text(value)
                .font(.title3.bold())
                .foregroundColor(color)
            Text(title)
                .font(.caption)
                .foregroundColor(state.theme.textSec)
        }
        .frame(maxWidth: .infinity)
        .padding(12)
        .background(state.theme.card)
        .cornerRadius(10)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(state.theme.border, lineWidth: 1))
    }

    func sectionHeader(_ title: String) -> some View {
        HStack {
            Text(title)
                .font(.headline)
                .foregroundColor(state.theme.text)
            Spacer()
        }
        .padding(.horizontal)
    }

    func orderRow(_ order: Order) -> some View {
        HStack(spacing: 10) {
            ZStack {
                Circle()
                    .fill(state.theme.accent.opacity(0.2))
                    .frame(width: 40, height: 40)
                Text(orderInitials(order.buyer))
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(state.theme.accent)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(order.buyer)
                    .font(.subheadline)
                    .foregroundColor(state.theme.text)
                Text("\(order.item) x \(order.qty) \(order.unit)")
                    .font(.caption)
                    .foregroundColor(state.theme.textSec)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                Text("\(order.amount) грн")
                    .font(.subheadline.bold())
                    .foregroundColor(state.theme.green)
                BadgeView(
                    text: order.status.label,
                    bg: order.status == .paid ? state.theme.yellow.opacity(0.2) : state.theme.greenLight,
                    fg: order.status == .paid ? state.theme.yellow : state.theme.green,
                    fontSize: 10
                )
            }
        }
        .padding(12)
        .background(state.theme.card)
        .cornerRadius(10)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(state.theme.border, lineWidth: 1))
        .padding(.horizontal)
    }

    func orderInitials(_ name: String) -> String {
        let parts = name.components(separatedBy: " ")
        let first = parts.first?.prefix(1) ?? ""
        let last = parts.count > 1 ? parts[1].prefix(1) : ""
        return "\(first)\(last)".uppercased()
    }
}
