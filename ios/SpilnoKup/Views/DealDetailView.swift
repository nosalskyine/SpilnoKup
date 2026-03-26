import SwiftUI

struct DealDetailView: View {
    let deal: Deal
    @EnvironmentObject var state: AppState
    @Environment(\.dismiss) var dismiss
    @State private var qty: Int = 1
    @State private var isJoining = false
    @State private var joinError: String? = nil

    var total: Int { deal.group * qty }
    var isJoined: Bool { state.isJoined(deal.id) }

    var body: some View {
        ZStack {
            state.theme.bg.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 16) {
                    // Photo / Category gradient header
                    ZStack {
                        categoryGradient(for: deal.cat)
                            .frame(height: 200)
                        // Large initial letter
                        Circle()
                            .fill(categorySolidColor(for: deal.cat))
                            .frame(width: 80, height: 80)
                        Text(String(deal.title.prefix(1)).uppercased())
                            .font(.system(size: 36, weight: .bold))
                            .foregroundColor(.white)
                        if deal.hot {
                            VStack {
                                HStack {
                                    Spacer()
                                    BadgeView(text: "HOT", bg: Color.red.opacity(0.8), fg: .white)
                                        .padding(12)
                                }
                                Spacer()
                            }
                        }
                        VStack {
                            Spacer()
                            HStack {
                                Spacer()
                                BadgeView(text: "-\(deal.disc)%", bg: state.theme.accent, fg: .white, fontSize: 14)
                                    .padding(12)
                            }
                        }
                    }

                    VStack(alignment: .leading, spacing: 16) {
                        // Title
                        Text(deal.title)
                            .font(.title2.bold())
                            .foregroundColor(state.theme.text)

                        // Seller card with initials
                        HStack(spacing: 12) {
                            ZStack {
                                Circle()
                                    .fill(state.theme.accent)
                                    .frame(width: 50, height: 50)
                                Text(sellerInitials)
                                    .font(.headline)
                                    .foregroundColor(.white)
                            }

                            VStack(alignment: .leading, spacing: 4) {
                                Text(deal.seller)
                                    .font(.subheadline.bold())
                                    .foregroundColor(state.theme.text)
                                HStack(spacing: 8) {
                                    HStack(spacing: 2) {
                                        Image(systemName: "mappin")
                                            .font(.system(size: 10))
                                        Text(deal.city)
                                    }
                                    .font(.caption)
                                    .foregroundColor(state.theme.textSec)

                                    HStack(spacing: 2) {
                                        Image(systemName: "star.fill")
                                            .font(.system(size: 10))
                                            .foregroundColor(state.theme.yellow)
                                        Text(String(format: "%.1f", deal.rating))
                                    }
                                    .font(.caption)
                                    .foregroundColor(state.theme.textSec)

                                    Text("\(deal.dealCount) угод")
                                        .font(.caption)
                                        .foregroundColor(state.theme.textMuted)
                                }
                            }
                        }
                        .padding(12)
                        .background(state.theme.card)
                        .cornerRadius(10)

                        // Price section
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Гуртова цiна")
                                    .font(.caption)
                                    .foregroundColor(state.theme.textSec)
                                Text("\(deal.group) грн/\(deal.unit)")
                                    .font(.title.bold())
                                    .foregroundColor(state.theme.accent)
                            }
                            Spacer()
                            VStack(alignment: .trailing, spacing: 4) {
                                Text("Роздрiб")
                                    .font(.caption)
                                    .foregroundColor(state.theme.textSec)
                                Text("\(deal.retail) грн")
                                    .font(.title3)
                                    .foregroundColor(state.theme.textMuted)
                                    .strikethrough()
                            }
                        }
                        .padding(14)
                        .background(state.theme.card)
                        .cornerRadius(10)

                        Text("Економiя: \(deal.savings) грн/\(deal.unit)")
                            .font(.subheadline.bold())
                            .foregroundColor(state.theme.green)

                        // Progress
                        VStack(spacing: 6) {
                            DealProgressBar(value: deal.pct, color: priceColor(for: deal.pct), height: 8)
                            HStack {
                                Text("Учасникiв: \(deal.joined)/\(deal.needed)")
                                    .font(.caption)
                                    .foregroundColor(state.theme.textSec)
                                Spacer()
                                Text("\(deal.pct)%")
                                    .font(.caption.bold())
                                    .foregroundColor(priceColor(for: deal.pct))
                            }
                        }
                        .padding(14)
                        .background(state.theme.card)
                        .cornerRadius(10)

                        // Tags
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 6) {
                                ForEach(deal.tags, id: \.self) { tag in
                                    BadgeView(text: tag, bg: state.theme.greenLight, fg: state.theme.green)
                                }
                            }
                        }

                        // Description
                        Text(deal.desc)
                            .font(.body)
                            .foregroundColor(state.theme.textSec)
                            .padding(14)
                            .background(state.theme.card)
                            .cornerRadius(10)

                        // Deadline
                        HStack(spacing: 6) {
                            Image(systemName: "clock")
                                .foregroundColor(state.theme.orange)
                            Text("Залишилось \(deal.days) дн.")
                                .foregroundColor(state.theme.orange)
                        }
                        .font(.subheadline)

                        // Quantity selector
                        if !isJoined {
                            VStack(spacing: 10) {
                                Text("Кiлькiсть (\(deal.unit))")
                                    .font(.subheadline)
                                    .foregroundColor(state.theme.textSec)

                                HStack(spacing: 16) {
                                    Button(action: { if qty > deal.minQty { qty -= 1 }}) {
                                        Image(systemName: "minus.circle.fill")
                                            .font(.title2)
                                            .foregroundColor(state.theme.accent)
                                    }
                                    Text("\(qty)")
                                        .font(.title2.bold())
                                        .foregroundColor(state.theme.text)
                                        .frame(width: 50)
                                    Button(action: { if qty < deal.maxQty { qty += 1 }}) {
                                        Image(systemName: "plus.circle.fill")
                                            .font(.title2)
                                            .foregroundColor(state.theme.accent)
                                    }
                                }

                                Text("вiд \(deal.minQty) до \(deal.maxQty) \(deal.unit)")
                                    .font(.caption)
                                    .foregroundColor(state.theme.textMuted)
                            }
                            .padding(14)
                            .background(state.theme.card)
                            .cornerRadius(10)
                        }

                        // Error message
                        if let error = joinError {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(Color(hex: "ef4444"))
                                .padding(.horizontal, 4)
                        }

                        // Share
                        Button(action: { shareDeal() }) {
                            HStack {
                                Image(systemName: "square.and.arrow.up")
                                Text("Подiлитись")
                            }
                            .font(.subheadline)
                            .foregroundColor(state.theme.accent)
                            .frame(maxWidth: .infinity)
                            .padding(12)
                            .background(state.theme.card)
                            .cornerRadius(10)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 100)
                }
            }

            // Bottom action
            VStack {
                Spacer()
                Button(action: joinDealAction) {
                    HStack {
                        if isJoining {
                            ProgressView()
                                .tint(.white)
                        }
                        Text(isJoined ? "Ви долучились" : "Долучитись - \(total) грн")
                            .font(.headline)
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(isJoined ? state.theme.green : state.theme.accent)
                    .cornerRadius(10)
                }
                .disabled(isJoined || isJoining)
                .padding(.horizontal)
                .padding(.bottom, 8)
                .background(
                    state.theme.bg.opacity(0.95)
                        .ignoresSafeArea(edges: .bottom)
                )
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { qty = deal.minQty }
    }

    func joinDealAction() {
        guard !isJoined else { return }
        isJoining = true
        joinError = nil

        // Optimistic UI update
        state.joinDeal(deal.id)

        // The API call is handled inside state.joinDeal
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            isJoining = false
        }
    }

    var sellerInitials: String {
        let parts = deal.seller.components(separatedBy: " ")
        let first = parts.first?.prefix(1) ?? ""
        let last = parts.count > 1 ? parts[1].prefix(1) : ""
        return "\(first)\(last)".uppercased()
    }

    func shareDeal() {
        let text = "\(deal.title) -- \(deal.group) грн замiсть \(deal.retail) грн! -\(deal.disc)%"
        let av = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let root = scene.windows.first?.rootViewController {
            root.present(av, animated: true)
        }
    }
}
