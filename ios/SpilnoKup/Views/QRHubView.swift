import SwiftUI

struct QRHubView: View {
    @EnvironmentObject var state: AppState
    @State private var showScanner = false
    @State private var showScanConfirm = false
    @State private var scannedOrder: Order? = nil

    var body: some View {
        NavigationStack {
            ZStack {
                state.theme.bg.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        // Scan button
                        Button(action: { showScanner = true }) {
                            HStack {
                                Image(systemName: "qrcode.viewfinder")
                                    .font(.title2)
                                Text("Сканувати QR")
                                    .font(.headline)
                            }
                            .foregroundColor(state.theme.bg)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(state.theme.accent)
                            .cornerRadius(10)
                        }
                        .padding(.horizontal)

                        // Orders list when not scanning
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Замовлення")
                                .font(.title3.bold())
                                .foregroundColor(state.theme.text)
                                .padding(.horizontal)

                            if state.orders.isEmpty {
                                VStack(spacing: 12) {
                                    Image(systemName: "qrcode")
                                        .font(.system(size: 32))
                                        .foregroundColor(state.theme.textMuted)
                                    Text("Замовлень поки немає")
                                        .font(.subheadline)
                                        .foregroundColor(state.theme.textSec)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 30)
                            } else {
                                ForEach(state.orders) { order in
                                    orderCard(order)
                                        .padding(.horizontal)
                                }
                            }
                        }
                    }
                    .padding(.top, 8)
                    .padding(.bottom, 20)
                }
            }
            .navigationTitle("QR Центр")
            .fullScreenCover(isPresented: $showScanner) {
                QRScannerFullScreenView(
                    onScan: { order in
                        scannedOrder = order
                        showScanner = false
                        showScanConfirm = true
                    },
                    onCancel: {
                        showScanner = false
                    }
                )
                .environmentObject(state)
            }
            .alert("Замовлення знайдено!", isPresented: $showScanConfirm) {
                Button("Пiдтвердити видачу") {
                    if let order = scannedOrder,
                       let idx = state.orders.firstIndex(where: { $0.id == order.id }) {
                        state.orders[idx].status = .done
                    }
                }
                Button("Скасувати", role: .cancel) {}
            } message: {
                if let order = scannedOrder {
                    Text("\(order.buyer)\n\(order.item) x \(order.qty) \(order.unit)\n\(order.amount) грн")
                }
            }
        }
    }

    func orderCard(_ order: Order) -> some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(state.theme.accent.opacity(0.2))
                    .frame(width: 44, height: 44)
                Text(orderInitials(order.buyer))
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(state.theme.accent)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(order.buyer)
                    .font(.subheadline.bold())
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
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(state.theme.border, lineWidth: 1)
        )
        .opacity(order.status == .done ? 0.6 : 1)
    }

    func orderInitials(_ name: String) -> String {
        let parts = name.components(separatedBy: " ")
        let first = parts.first?.prefix(1) ?? ""
        let last = parts.count > 1 ? parts[1].prefix(1) : ""
        return "\(first)\(last)".uppercased()
    }
}

// MARK: - Fullscreen QR Scanner View
// Camera view fills entire screen (position fixed, black bg)
// Blue scan frame centered (250x250)
// Back arrow white top-left
// Text at bottom: "Наведіть камеру на QR код"

struct QRScannerFullScreenView: View {
    @EnvironmentObject var state: AppState
    let onScan: (Order) -> Void
    let onCancel: () -> Void

    @State private var scanning = true

    var body: some View {
        ZStack {
            // Black background filling entire screen
            Color.black.ignoresSafeArea()

            VStack(spacing: 0) {
                // Back arrow white top-left
                HStack {
                    Button(action: onCancel) {
                        Image(systemName: "arrow.left")
                            .font(.title2.bold())
                            .foregroundColor(.white)
                            .frame(width: 44, height: 44)
                    }
                    Spacer()
                }
                .padding(.horizontal)
                .padding(.top, 8)

                Spacer()

                // Blue scan frame centered (250x250)
                ZStack {
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color(hex: "3b82f6"), lineWidth: 3)
                        .frame(width: 250, height: 250)

                    // Corner accents in blue
                    VStack {
                        HStack {
                            cornerAccent(rotation: 0)
                            Spacer()
                            cornerAccent(rotation: 90)
                        }
                        Spacer()
                        HStack {
                            cornerAccent(rotation: 270)
                            Spacer()
                            cornerAccent(rotation: 180)
                        }
                    }
                    .frame(width: 250, height: 250)

                    if scanning {
                        Rectangle()
                            .fill(Color(hex: "3b82f6").opacity(0.3))
                            .frame(height: 2)
                            .padding(.horizontal, 30)
                    }

                    Image(systemName: "qrcode.viewfinder")
                        .font(.system(size: 60))
                        .foregroundColor(.white.opacity(0.3))
                }

                Spacer()

                // Text at bottom
                Text("Наведiть камеру на QR код")
                    .font(.subheadline)
                    .foregroundColor(.white.opacity(0.7))
                    .padding(.bottom, 20)

                // Simulate scan button
                Button(action: simulateScan) {
                    HStack {
                        Image(systemName: "qrcode")
                        Text("Симулювати скан")
                    }
                    .font(.headline)
                    .foregroundColor(.black)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color.white)
                    .cornerRadius(10)
                }
                .padding(.horizontal, 40)
                .padding(.bottom, 40)
            }
        }
    }

    func cornerAccent(rotation: Double) -> some View {
        Path { path in
            path.move(to: CGPoint(x: 0, y: 20))
            path.addLine(to: CGPoint(x: 0, y: 0))
            path.addLine(to: CGPoint(x: 20, y: 0))
        }
        .stroke(Color(hex: "3b82f6"), lineWidth: 4)
        .frame(width: 20, height: 20)
        .rotationEffect(.degrees(rotation))
    }

    func simulateScan() {
        if let order = state.orders.first(where: { $0.status == .paid }) {
            onScan(order)
        }
    }
}
