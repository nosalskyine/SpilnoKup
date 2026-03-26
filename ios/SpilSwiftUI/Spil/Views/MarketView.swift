import SwiftUI

struct MarketView: View {
    @EnvironmentObject var api: APIService
    @State private var search = ""
    @State private var selectedDeal: Deal?
    @State private var showSettings = false

    var filtered: [Deal] {
        if search.isEmpty { return api.deals }
        return api.deals.filter { ($0.title + ($0.seller?.name ?? "")).lowercased().contains(search.lowercased()) }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 10) {
                    // Top bar
                    HStack(spacing: 8) {
                        Button { showSettings = true; UIImpactFeedbackGenerator(style: .light).impactOccurred() } label: {
                            Image(systemName: "person.circle").font(.system(size: 20)).foregroundColor(AppTheme.textSec)
                                .frame(width: 36, height: 36).background(AppTheme.card).cornerRadius(10)
                                .overlay(RoundedRectangle(cornerRadius: 10).stroke(AppTheme.border, lineWidth: 1))
                        }

                        HStack {
                            Image(systemName: "magnifyingglass").foregroundColor(AppTheme.textMuted)
                            TextField("", text: $search, prompt: Text("Пошук...").foregroundColor(AppTheme.textMuted))
                                .foregroundColor(.white).font(.system(size: 13))
                        }
                        .padding(10).background(AppTheme.card)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(AppTheme.border, lineWidth: 1))
                        .cornerRadius(12)
                    }
                    .padding(.horizontal, 12)

                    // Slideshow
                    ProductSlideshow()

                    // Deals count
                    HStack {
                        Text("\(filtered.count) оголошень").font(.system(size: 10)).foregroundColor(AppTheme.textMuted)
                        Spacer()
                    }.padding(.horizontal, 16)

                    // Deal cards
                    ForEach(filtered) { deal in
                        DealCardView(deal: deal) { selectedDeal = deal }
                            .padding(.horizontal, 16)
                    }

                    if filtered.isEmpty {
                        Text("Нічого не знайдено")
                            .foregroundColor(AppTheme.textMuted)
                            .padding(60)
                    }
                }
                .padding(.top, 8)
            }
            .background(AppTheme.bg)
            .refreshable { try? await api.fetchDeals() }
            .sheet(item: $selectedDeal) { deal in
                DealDetailView(deal: deal)
            }
            .sheet(isPresented: $showSettings) {
                SettingsView()
            }
        }
    }
}

struct ProductSlideshow: View {
    @State private var idx = 0
    let slides = [
        ("magnifyingglass", "Обирай", "Знайди вигідну пропозицію"),
        ("person.2.fill", "Долучайся", "Приєднуйся до групи"),
        ("dollarsign.circle", "Економ до 40%", "Групова ціна нижче"),
        ("qrcode", "Отримай товар", "QR код для отримання"),
    ]
    let timer = Timer.publish(every: 3, on: .main, in: .common).autoconnect()

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: slides[idx].0)
                .font(.system(size: 22)).foregroundColor(.white)
                .frame(width: 44, height: 44)
                .background(AppTheme.accent).cornerRadius(12)
            VStack(alignment: .leading, spacing: 2) {
                Text(slides[idx].1).font(.system(size: 14, weight: .heavy)).foregroundColor(.white)
                Text(slides[idx].2).font(.system(size: 11)).foregroundColor(AppTheme.textSec)
            }
            Spacer()
            HStack(spacing: 3) {
                ForEach(0..<slides.count, id: \.self) { i in
                    RoundedRectangle(cornerRadius: 2).fill(i == idx ? AppTheme.accent : AppTheme.textMuted.opacity(0.3))
                        .frame(width: i == idx ? 12 : 4, height: 4)
                }
            }
        }
        .padding(14).background(AppTheme.accent.opacity(0.08))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(AppTheme.accent.opacity(0.15), lineWidth: 1))
        .cornerRadius(10).padding(.horizontal, 12)
        .onReceive(timer) { _ in idx = (idx + 1) % slides.count }
    }
}

struct DealCardView: View {
    let deal: Deal
    var onTap: () -> Void

    var body: some View {
        Button(action: { onTap(); UIImpactFeedbackGenerator(style: .light).impactOccurred() }) {
            HStack(spacing: 0) {
                // Photo
                ZStack {
                    RoundedRectangle(cornerRadius: 8).fill(AppTheme.cardAlt)
                    Text(categoryIcon(deal.category ?? ""))
                        .font(.system(size: 24))
                }
                .frame(width: 70, height: 60)
                .padding(8)

                // Info
                VStack(alignment: .leading, spacing: 3) {
                    Text(deal.title).font(.system(size: 14, weight: .bold)).foregroundColor(.white).lineLimit(1)
                    Text("\(deal.seller?.name ?? "") · \(deal.city ?? "")").font(.system(size: 10)).foregroundColor(AppTheme.textMuted)
                    ProgressView(value: deal.progress)
                        .tint(AppTheme.accent.opacity(0.6))
                        .scaleEffect(y: 0.6)
                    HStack(spacing: 4) {
                        Text("\(deal.joined ?? 0)/\(deal.needed ?? 0)").font(.system(size: 9))
                        Text("\(deal.daysLeft)д").font(.system(size: 9))
                    }.foregroundColor(AppTheme.textMuted)
                }

                Spacer()

                // Price
                VStack(alignment: .trailing, spacing: 3) {
                    Text("₴\(Int(deal.group))").font(.system(size: 17, weight: .heavy)).foregroundColor(.white)
                    Text("₴\(Int(deal.retail))").font(.system(size: 10)).foregroundColor(AppTheme.textMuted).strikethrough()
                    Text("-\(deal.discount)%").font(.system(size: 10, weight: .bold))
                        .foregroundColor(AppTheme.accent.opacity(0.8))
                        .padding(.horizontal, 6).padding(.vertical, 2)
                        .background(AppTheme.accent.opacity(0.08)).cornerRadius(4)
                }.padding(.trailing, 10)
            }
            .background(AppTheme.card)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(AppTheme.border.opacity(0.3), lineWidth: 1))
            .cornerRadius(12)
        }.buttonStyle(.plain)
    }

    func categoryIcon(_ cat: String) -> String {
        switch cat {
        case "food","meat": return "🍽"
        case "vegetables": return "🥬"
        case "dairy": return "🥛"
        case "bakery": return "🍞"
        case "drinks": return "☕"
        case "electronics": return "📱"
        case "sport": return "⚽"
        case "services": return "🛠"
        case "beauty": return "💄"
        case "clothing": return "👕"
        case "handmade": return "🧵"
        case "home": return "🏠"
        default: return "📦"
        }
    }
}
