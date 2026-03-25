import SwiftUI

struct QRHubView: View {
    @EnvironmentObject var state: AppState
    @State private var showScanner = false
    @State private var scannedOrder: Order? = nil

    var body: some View {
        NavigationStack {
            ZStack {
                state.theme.bg.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        // Scan button
                        Button(action: { simulateScan() }) {
                            HStack {
                                Image(systemName: "qrcode.viewfinder")
                                    .font(.title2)
                                Text("Сканувати QR")
                                    .font(.headline)
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(state.theme.accent)
                            .cornerRadius(16)
                        }
                        .padding(.horizontal)

                        // Orders
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Замовлення")
                                .font(.title3.bold())
                                .foregroundColor(state.theme.text)
                                .padding(.horizontal)

                            ForEach(state.orders) { order in
                                orderCard(order)
                                    .padding(.horizontal)
                            }
                        }
                    }
                        // Map
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Карта точок видачі")
                                .font(.system(size: 13, weight: .heavy))
                                .foregroundColor(state.theme.text)
                            VinnytsiaMapView(height: 160, label: "Вінниця, центр")
                        }
                        .padding(.horizontal)
                    }
                    .padding(.top, 8)
                    .padding(.bottom, 20)
                }
            }
            .navigationTitle("QR Центр")
            .alert("Замовлення знайдено!", isPresented: $showScanner) {
                Button("Підтвердити видачу") {
                    if let order = scannedOrder,
                       let idx = state.orders.firstIndex(where: { $0.id == order.id }) {
                        state.orders[idx].status = .done
                    }
                }
                Button("Скасувати", role: .cancel) {}
            } message: {
                if let order = scannedOrder {
                    Text("\(order.buyer)\n\(order.item) × \(order.qty) \(order.unit)\n₴\(order.amount)")
                }
            }
        }
    }

    func orderCard(_ order: Order) -> some View {
        HStack(spacing: 12) {
            Text(order.avatar)
                .font(.title2)
                .frame(width: 44, height: 44)
                .background(state.theme.cardAlt)
                .cornerRadius(22)

            VStack(alignment: .leading, spacing: 4) {
                Text(order.buyer)
                    .font(.subheadline.bold())
                    .foregroundColor(state.theme.text)
                Text("\(order.item) × \(order.qty) \(order.unit)")
                    .font(.caption)
                    .foregroundColor(state.theme.textSec)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text("₴\(order.amount)")
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
        .cornerRadius(14)
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(state.theme.border, lineWidth: 1)
        )
        .opacity(order.status == .done ? 0.6 : 1)
    }

    func simulateScan() {
        if let order = state.orders.first(where: { $0.status == .paid }) {
            scannedOrder = order
            showScanner = true
        }
    }
}
