import SwiftUI

struct MarketView: View {
    @EnvironmentObject var state: AppState
    @State private var search = ""
    @State private var selectedCat: DealCategory = .all
    @State private var sort: DealSort = .hot
    @State private var showFilters = false
    @State private var selectedDeal: Deal? = nil
    @State private var showSupport = false
    @State private var showChat = false
    @State private var hasAppeared = false
    @State private var bannerPage = 0
    @State private var bannerTimer: Timer? = nil

    // Filters
    @State private var cityFilter = "all"
    @State private var priceFilter = "all"
    @State private var discFilter = "all"
    @State private var ratingFilter = "all"

    // Support
    @State private var supportMessage = ""
    @State private var supportSending = false
    @State private var supportSent = false

    var filteredDeals: [Deal] {
        var result = state.deals
        if selectedCat != .all { result = result.filter { $0.cat == selectedCat } }
        if !search.isEmpty {
            let q = search.lowercased()
            result = result.filter { $0.title.lowercased().contains(q) || $0.seller.lowercased().contains(q) }
        }
        if cityFilter != "all" { result = result.filter { $0.city.contains(cityFilter) } }
        if priceFilter == "low" { result = result.filter { $0.group < 200 } }
        else if priceFilter == "mid" { result = result.filter { $0.group >= 200 && $0.group < 500 } }
        else if priceFilter == "high" { result = result.filter { $0.group >= 500 } }
        if discFilter == "big" { result = result.filter { $0.disc >= 30 } }
        else if discFilter == "med" { result = result.filter { $0.disc >= 20 && $0.disc < 30 } }
        else if discFilter == "small" { result = result.filter { $0.disc < 20 } }
        if ratingFilter == "top" { result = result.filter { $0.rating >= 4.8 } }
        else if ratingFilter == "good" { result = result.filter { $0.rating >= 4.5 } }

        switch sort {
        case .hot: result.sort { $0.pct > $1.pct }
        case .new: result.sort { $0.id > $1.id }
        case .discount: result.sort { $0.disc > $1.disc }
        case .price: result.sort { $0.group < $1.group }
        case .rating: result.sort { $0.rating > $1.rating }
        }
        return result
    }

    var hotDeals: [Deal] {
        Array(state.deals.filter { $0.hot }.prefix(6))
    }

    var body: some View {
        NavigationStack {
            ZStack {
                state.theme.bg.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 12) {
                        topBar

                        // Loading indicator
                        if state.isLoadingDeals && state.deals.isEmpty {
                            VStack(spacing: 12) {
                                ProgressView()
                                    .tint(state.theme.accent)
                                Text("Завантаження...")
                                    .font(.subheadline)
                                    .foregroundColor(state.theme.textSec)
                            }
                            .padding(.vertical, 40)
                        } else {
                            Group {
                                bannerSlideshow
                                hotSlider
                                categoryPills
                                sortRow
                            }

                            Group {
                                // Pull to refresh hint
                                if state.isLoadingDeals {
                                    HStack(spacing: 8) {
                                        ProgressView()
                                            .tint(state.theme.accent)
                                        Text("Оновлення...")
                                            .font(.caption)
                                            .foregroundColor(state.theme.textSec)
                                    }
                                    .padding(.vertical, 4)
                                }

                                dealsList

                                // Refresh button at bottom
                                Button(action: { state.loadDeals() }) {
                                    HStack(spacing: 6) {
                                        Image(systemName: "arrow.clockwise")
                                        Text("Оновити")
                                    }
                                    .font(.subheadline)
                                    .foregroundColor(state.theme.accent)
                                    .padding(.vertical, 10)
                                    .frame(maxWidth: .infinity)
                                    .background(state.theme.card)
                                    .cornerRadius(10)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 10)
                                            .stroke(state.theme.border, lineWidth: 1)
                                    )
                                }
                                .padding(.horizontal, 12)
                            }
                        }
                    }
                    .padding(.bottom, 20)
                }
            }
            .navigationBarHidden(true)
            .navigationDestination(item: $selectedDeal) { deal in
                DealDetailView(deal: deal)
            }
            .sheet(isPresented: $showFilters) { filtersSheet }
            .sheet(isPresented: $showSupport) { supportSheet }
            .sheet(isPresented: $showChat) {
                ChatListView().environmentObject(state)
            }
            .onAppear {
                if !hasAppeared {
                    hasAppeared = true
                    state.loadDeals()
                    startBannerTimer()
                }
            }
            .onDisappear {
                bannerTimer?.invalidate()
            }
        }
    }

    // MARK: - Top Bar (profile | qr | search | support | chat)

    var topBar: some View {
        HStack(spacing: 8) {
            // Profile icon
            Button(action: {}) {
                Image(systemName: "person.circle")
                    .font(.system(size: 20))
                    .foregroundColor(state.theme.textSec)
                    .frame(width: 36, height: 36)
                    .background(state.theme.card)
                    .cornerRadius(10)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(state.theme.border, lineWidth: 1)
                    )
            }

            // QR scanner icon
            Button(action: {}) {
                Image(systemName: "qrcode.viewfinder")
                    .font(.system(size: 18))
                    .foregroundColor(state.theme.textSec)
                    .frame(width: 36, height: 36)
                    .background(state.theme.card)
                    .cornerRadius(10)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(state.theme.border, lineWidth: 1)
                    )
            }

            // Search field
            HStack(spacing: 6) {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 14))
                    .foregroundColor(state.theme.textMuted)
                TextField("Пошук...", text: $search)
                    .font(.system(size: 14))
                    .foregroundColor(state.theme.text)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
            .background(state.theme.card)
            .cornerRadius(10)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(state.theme.border, lineWidth: 1)
            )

            // Support (headphones) icon
            Button(action: { showSupport = true }) {
                Image(systemName: "headphones")
                    .font(.system(size: 18))
                    .foregroundColor(state.theme.textSec)
                    .frame(width: 36, height: 36)
                    .background(state.theme.card)
                    .cornerRadius(10)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(state.theme.border, lineWidth: 1)
                    )
            }

            // Chat icon with unread badge
            Button(action: { showChat = true }) {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: "message")
                        .font(.system(size: 18))
                        .foregroundColor(state.theme.textSec)
                        .frame(width: 36, height: 36)
                        .background(state.theme.card)
                        .cornerRadius(10)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(state.theme.border, lineWidth: 1)
                        )

                    if totalUnread > 0 {
                        Text("\(totalUnread)")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(.white)
                            .frame(width: 16, height: 16)
                            .background(Color(hex: "ef4444"))
                            .clipShape(Circle())
                            .offset(x: 4, y: -4)
                    }
                }
            }
        }
        .padding(.horizontal, 12)
        .padding(.top, 8)
    }

    var totalUnread: Int {
        state.chats.reduce(0) { $0 + $1.unread }
    }

    // MARK: - Banner Slideshow

    var bannerSlideshow: some View {
        VStack(spacing: 8) {
            if !hotDeals.isEmpty {
                TabView(selection: $bannerPage) {
                    ForEach(Array(hotDeals.prefix(4).enumerated()), id: \.offset) { index, deal in
                        Button(action: { selectedDeal = deal }) {
                            bannerCard(deal)
                        }
                        .buttonStyle(.plain)
                        .tag(index)
                    }
                }
                .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
                .frame(height: 130)
                .padding(.horizontal, 12)

                // Dot indicators
                HStack(spacing: 6) {
                    ForEach(0..<min(hotDeals.count, 4), id: \.self) { i in
                        Circle()
                            .fill(i == bannerPage ? state.theme.accent : state.theme.textMuted.opacity(0.4))
                            .frame(width: 6, height: 6)
                    }
                }
            }
        }
    }

    func bannerCard(_ deal: Deal) -> some View {
        HStack(spacing: 14) {
            ZStack {
                categoryGradient(for: deal.cat)
                    .frame(width: 90, height: 90)
                    .cornerRadius(10)
                Circle()
                    .fill(categorySolidColor(for: deal.cat))
                    .frame(width: 48, height: 48)
                Text(String(deal.title.prefix(1)).uppercased())
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.white)
            }

            VStack(alignment: .leading, spacing: 6) {
                Text(deal.title)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(state.theme.text)
                    .lineLimit(2)
                Text("\(deal.seller) - \(deal.city)")
                    .font(.system(size: 11))
                    .foregroundColor(state.theme.textSec)
                HStack(spacing: 8) {
                    Text("\(deal.group) грн")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(state.theme.accent)
                    Text("\(deal.retail) грн")
                        .font(.system(size: 12))
                        .foregroundColor(state.theme.textMuted)
                        .strikethrough()
                    Text("-\(deal.disc)%")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(Color(hex: "ef4444"))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color(hex: "ef4444").opacity(0.15))
                        .cornerRadius(4)
                }
            }
            Spacer()
        }
        .padding(14)
        .background(state.theme.card)
        .cornerRadius(10)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(state.theme.border, lineWidth: 1))
    }

    func startBannerTimer() {
        bannerTimer = Timer.scheduledTimer(withTimeInterval: 4.0, repeats: true) { _ in
            let maxPage = min(hotDeals.count, 4) - 1
            if maxPage > 0 {
                withAnimation {
                    bannerPage = (bannerPage + 1) % (maxPage + 1)
                }
            }
        }
    }

    // MARK: - Hot Slider ("Топ дня")

    var hotSlider: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Топ дня")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(state.theme.text)
                Spacer()
            }
            .padding(.horizontal, 12)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(hotDeals) { deal in
                        Button(action: { selectedDeal = deal }) {
                            hotCard(deal)
                        }
                    }
                }
                .padding(.horizontal, 12)
            }
        }
    }

    func hotCard(_ deal: Deal) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            // Photo area
            ZStack {
                categoryGradient(for: deal.cat)
                    .frame(width: 200, height: 80)
                    .overlay(
                        Circle()
                            .fill(categorySolidColor(for: deal.cat))
                            .frame(width: 36, height: 36)
                            .overlay(Text(String(deal.title.prefix(1)).uppercased()).font(.system(size: 16, weight: .bold)).foregroundColor(.white))
                    )
                    .cornerRadius(8)
            }

            Text(deal.title)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(state.theme.text)
                .lineLimit(1)

            HStack(spacing: 4) {
                Text(deal.seller)
                    .font(.system(size: 10))
                    .foregroundColor(state.theme.textMuted)
                Text(".")
                    .foregroundColor(state.theme.textMuted)
                Text(deal.city)
                    .font(.system(size: 10))
                    .foregroundColor(state.theme.textMuted)
            }

            HStack {
                Text("\(deal.joined)/\(deal.needed)")
                    .font(.system(size: 9))
                    .foregroundColor(state.theme.textMuted)
                Text(". \(deal.days) дн.")
                    .font(.system(size: 9))
                    .foregroundColor(state.theme.textMuted)
                Spacer()
                Text("-\(deal.disc)%")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(deal.disc >= 30 ? Color(hex: "ef4444") : Color(hex: "22c55e"))
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background((deal.disc >= 30 ? Color(hex: "ef4444") : Color(hex: "22c55e")).opacity(0.15))
                    .cornerRadius(4)
            }
        }
        .frame(width: 200)
        .padding(10)
        .background(state.theme.card)
        .cornerRadius(10)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(state.theme.border, lineWidth: 1))
    }

    // MARK: - Categories

    var categoryPills: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(DealCategory.allCases, id: \.self) { cat in
                    Button(action: { selectedCat = cat }) {
                        Text(cat.label)
                            .font(.system(size: 13, weight: selectedCat == cat ? .semibold : .regular))
                            .foregroundColor(selectedCat == cat ? state.theme.bg : state.theme.text)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 7)
                            .background(selectedCat == cat ? state.theme.accent : Color.clear)
                            .cornerRadius(18)
                            .overlay(
                                RoundedRectangle(cornerRadius: 18)
                                    .stroke(selectedCat == cat ? state.theme.accent : state.theme.border, lineWidth: 1)
                            )
                    }
                }
            }
            .padding(.horizontal, 12)
        }
    }

    // MARK: - Sort Row

    var sortRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(DealSort.allCases, id: \.self) { s in
                    Button(action: { sort = s }) {
                        Text(s.rawValue)
                            .font(.system(size: 12, weight: sort == s ? .bold : .regular))
                            .foregroundColor(sort == s ? state.theme.accent : state.theme.textMuted)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(sort == s ? state.theme.accent.opacity(0.12) : Color.clear)
                            .cornerRadius(6)
                    }
                }

                Spacer()

                Button(action: { showFilters = true }) {
                    Image(systemName: "line.3.horizontal.decrease")
                        .font(.system(size: 14))
                        .foregroundColor(state.theme.textMuted)
                }
            }
            .padding(.horizontal, 12)
        }
    }

    // MARK: - Deals List

    var dealsList: some View {
        LazyVStack(spacing: 10) {
            ForEach(filteredDeals) { deal in
                DealCardView(deal: deal) { selectedDeal = deal }
                    .padding(.horizontal, 12)
            }

            if filteredDeals.isEmpty && !state.isLoadingDeals {
                VStack(spacing: 12) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 32))
                        .foregroundColor(state.theme.textMuted)
                    Text("Нiчого не знайдено")
                        .font(.subheadline)
                        .foregroundColor(state.theme.textSec)
                }
                .padding(.vertical, 30)
            }
        }
    }

    // MARK: - Support Sheet

    var supportSheet: some View {
        ZStack {
            state.theme.bg.ignoresSafeArea()
            VStack(spacing: 16) {
                HStack {
                    Text("Служба пiдтримки")
                        .font(.title3.bold())
                        .foregroundColor(state.theme.text)
                    Spacer()
                    Button(action: { showSupport = false }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title2)
                            .foregroundColor(state.theme.textMuted)
                    }
                }
                .padding(.top, 20)

                Text("Опишiть проблему або запитання")
                    .font(.subheadline)
                    .foregroundColor(state.theme.textSec)

                TextField("Ваше повiдомлення...", text: $supportMessage)
                    .foregroundColor(state.theme.text)
                    .padding(12)
                    .background(state.theme.cardAlt)
                    .cornerRadius(10)

                if supportSent {
                    HStack(spacing: 6) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(state.theme.green)
                        Text("Надiслано! Вiдповiдь у Чат > Пiдтримка")
                            .font(.caption)
                            .foregroundColor(state.theme.green)
                    }
                }

                Button(action: sendSupportMessage) {
                    HStack {
                        if supportSending { ProgressView().tint(state.theme.bg) }
                        Text("Надiслати")
                            .font(.headline)
                    }
                    .foregroundColor(state.theme.bg)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(supportMessage.isEmpty ? state.theme.cardAlt : state.theme.accent)
                    .cornerRadius(10)
                }
                .disabled(supportMessage.isEmpty || supportSending)

                Spacer()
            }
            .padding(.horizontal)
        }
    }

    func sendSupportMessage() {
        guard !supportMessage.isEmpty else { return }
        supportSending = true
        let msg = supportMessage
        Task {
            do {
                try await APIService.shared.sendSupportMessage(
                    message: msg,
                    userName: state.user?.name,
                    userPhone: state.user?.phone
                )
            } catch {}
            await MainActor.run {
                supportSending = false
                supportSent = true
                supportMessage = ""
                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                    supportSent = false
                    showSupport = false
                }
            }
        }
    }

    // MARK: - Filters Sheet

    var filtersSheet: some View {
        ZStack {
            state.theme.bg.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    HStack {
                        Text("Фiльтри")
                            .font(.title2.bold())
                            .foregroundColor(state.theme.text)
                        Spacer()
                        Button("Скинути") {
                            cityFilter = "all"; priceFilter = "all"
                            discFilter = "all"; ratingFilter = "all"
                        }
                        .foregroundColor(state.theme.accent)
                    }

                    filterGroup(title: "Мiсто", selected: $cityFilter, options: [("all", "Всi")] + SampleData.cities.map { ($0, $0) })
                    filterGroup(title: "Цiна", selected: $priceFilter, options: [("all","Всi"),("low","до 200"),("mid","200-500"),("high","500+")])
                    filterGroup(title: "Знижка", selected: $discFilter, options: [("all","Всi"),("big","30%+"),("med","20-30%"),("small","до 20%")])
                    filterGroup(title: "Рейтинг", selected: $ratingFilter, options: [("all","Всi"),("top","4.8+"),("good","4.5+")])

                    Button(action: { showFilters = false }) {
                        Text("Застосувати")
                            .font(.headline)
                            .foregroundColor(state.theme.bg)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(state.theme.accent)
                            .cornerRadius(10)
                    }
                }
                .padding()
            }
        }
    }

    func filterGroup(title: String, selected: Binding<String>, options: [(String, String)]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.headline).foregroundColor(state.theme.text)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 80))], spacing: 6) {
                ForEach(options, id: \.0) { opt in
                    Button(action: { selected.wrappedValue = opt.0 }) {
                        Text(opt.1)
                            .font(.caption)
                            .foregroundColor(selected.wrappedValue == opt.0 ? state.theme.bg : state.theme.textSec)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 7)
                            .frame(maxWidth: .infinity)
                            .background(selected.wrappedValue == opt.0 ? state.theme.accent : state.theme.cardAlt)
                            .cornerRadius(8)
                    }
                }
            }
        }
    }
}

// MARK: - NavigationDestination for optional

extension View {
    func navigationDestination<D: Hashable, C: View>(item: Binding<D?>, @ViewBuilder destination: @escaping (D) -> C) -> some View {
        self.navigationDestination(isPresented: Binding(
            get: { item.wrappedValue != nil },
            set: { if !$0 { item.wrappedValue = nil } }
        )) {
            if let value = item.wrappedValue {
                destination(value)
            }
        }
    }
}

extension Deal: Hashable {
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}
