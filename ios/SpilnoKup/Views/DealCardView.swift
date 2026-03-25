import SwiftUI

struct DealCardView: View {
    let deal: Deal
    let onTap: () -> Void
    @EnvironmentObject var state: AppState

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 0) {
                // Photo (left)
                ZStack {
                    categoryGradient(for: deal.cat)
                    Text(deal.avatar)
                        .font(.system(size: 26))
                }
                .frame(width: 72, height: 62)
                .cornerRadius(10)
                .padding(.leading, 6)
                .padding(.vertical, 6)

                // Text (center)
                VStack(alignment: .leading, spacing: 2) {
                    Text(deal.title)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(state.theme.text)
                        .lineLimit(1)

                    Text("\(deal.seller) · \(deal.city)")
                        .font(.system(size: 10))
                        .foregroundColor(state.theme.textMuted)

                    HStack(spacing: 4) {
                        DealProgressBar(
                            value: deal.pct,
                            color: priceColor(for: deal.pct),
                            height: 2
                        )
                        Text("\(deal.joined)/\(deal.needed)")
                            .font(.system(size: 7))
                            .foregroundColor(state.theme.textMuted)
                        Text("\(deal.days)д")
                            .font(.system(size: 7))
                            .foregroundColor(state.theme.textMuted)

                        Button(action: {
                            if !state.isJoined(deal.id) {
                                state.joinDeal(deal.id)
                            }
                        }) {
                            Text(state.isJoined(deal.id) ? "✓" : "+")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 1)
                                .background(state.isJoined(deal.id) ? state.theme.green : state.theme.accent)
                                .cornerRadius(4)
                        }
                    }
                    .padding(.top, 2)
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 6)

                Spacer(minLength: 0)

                // Price & badges (right)
                VStack(alignment: .trailing, spacing: 3) {
                    Text("₴\(deal.group)")
                        .font(.system(size: 16, weight: .heavy))
                        .foregroundColor(state.theme.green)

                    Text("₴\(deal.retail)")
                        .font(.system(size: 10))
                        .foregroundColor(state.theme.textMuted)
                        .strikethrough()

                    HStack(spacing: 3) {
                        if deal.hot {
                            Text("HOT")
                                .font(.system(size: 8, weight: .heavy))
                                .foregroundColor(state.theme.orange)
                                .padding(.horizontal, 5)
                                .padding(.vertical, 2)
                                .background(state.theme.orange.opacity(0.1))
                                .cornerRadius(3)
                        }
                        Text("-\(deal.disc)%")
                            .font(.system(size: 8, weight: .heavy))
                            .foregroundColor(discountBorderColor(for: deal.disc))
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(discountBorderColor(for: deal.disc).opacity(0.1))
                            .cornerRadius(3)
                    }
                }
                .padding(.trailing, 8)
                .padding(.vertical, 6)
            }
            .background(state.theme.card)
            .cornerRadius(10)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(discountBorderColor(for: deal.disc).opacity(0.27), lineWidth: deal.disc >= 20 ? 1 : 0)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(state.theme.border, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Rounded Corner helper

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}
