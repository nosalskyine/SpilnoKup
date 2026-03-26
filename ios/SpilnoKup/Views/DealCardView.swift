import SwiftUI

struct DealCardView: View {
    let deal: Deal
    let onTap: () -> Void
    @EnvironmentObject var state: AppState

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 0) {
                // Photo area (80px wide) with initial letter
                photoSection

                // Info section (flex)
                infoSection

                Spacer(minLength: 0)

                // Price section (right)
                priceSection
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

    var photoSection: some View {
        ZStack {
            categoryGradient(for: deal.cat)
            Circle()
                .fill(categorySolidColor(for: deal.cat))
                .frame(width: 42, height: 42)
            Text(String(deal.title.prefix(1)).uppercased())
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(.white)
        }
        .frame(width: 80, height: 70)
        .cornerRadius(10)
        .padding(.leading, 6)
        .padding(.vertical, 6)
    }

    var infoSection: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(deal.title)
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(state.theme.text)
                .lineLimit(1)

            Text("\(deal.seller) . \(deal.city)")
                .font(.system(size: 11))
                .foregroundColor(state.theme.textMuted)

            // Progress bar (3px height)
            DealProgressBar(
                value: deal.pct,
                color: priceColor(for: deal.pct),
                height: 3
            )
            .padding(.top, 2)

            HStack(spacing: 4) {
                Text("\(deal.joined)/\(deal.needed)")
                    .font(.system(size: 9))
                    .foregroundColor(state.theme.textMuted)
                Text(". \(deal.days) дн.")
                    .font(.system(size: 9))
                    .foregroundColor(state.theme.textMuted)

                Spacer()

                // Join button
                Button(action: {
                    if !state.isJoined(deal.id) {
                        state.joinDeal(deal.id)
                    }
                }) {
                    Text(state.isJoined(deal.id) ? "Долучено" : "Долучитись")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(state.theme.bg)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(state.isJoined(deal.id) ? state.theme.green.opacity(0.7) : state.theme.accent)
                        .cornerRadius(6)
                }
            }
            .padding(.top, 1)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 6)
    }

    var priceSection: some View {
        VStack(alignment: .trailing, spacing: 3) {
            // Group price (18px bold)
            Text("\u{20B4}\(deal.group)")
                .font(.system(size: 18, weight: .heavy))
                .foregroundColor(state.theme.green)

            // Retail price (11px strikethrough)
            Text("\u{20B4}\(deal.retail)")
                .font(.system(size: 11))
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
}

// MARK: - Category Solid Color

func categorySolidColor(for cat: DealCategory) -> Color {
    switch cat {
    case .farm: return Color(hex: "1a3020")
    case .honey: return Color(hex: "2a2510")
    case .veggies: return Color(hex: "102a15")
    case .dairy: return Color(hex: "1a2030")
    case .food: return Color(hex: "2a1a10")
    case .bakery: return Color(hex: "2a1a10")
    case .drinks: return Color(hex: "1a1510")
    case .sport: return Color(hex: "102020")
    case .electronics: return Color(hex: "101a2a")
    case .services: return Color(hex: "1a1a20")
    case .clothing: return Color(hex: "201a20")
    case .handmade: return Color(hex: "201a2a")
    case .beauty: return Color(hex: "2a1020")
    case .home: return Color(hex: "1a2020")
    case .cafe: return Color(hex: "1a1510")
    case .other: return Color(hex: "1a1a1a")
    case .all: return Color(hex: "151c2c")
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
