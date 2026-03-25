import SwiftUI

struct MarketView: View {
    @EnvironmentObject var state: AppState
    @State private var search = ""
    @State private var selectedCat: DealCategory = .all
    @State private var sort: DealSort = .hot
    @State private var showFilters = false
    @State private var selectedDeal: Deal? = nil
    @State private var showCreateDeal = false

    // Filters
    @State private var cityFilter = "all"
    @State private var priceFilter = "all"
    @State private var discFilter = "all"
    @State private var ratingFilter = "all"

    var filteredDeals: [Deal] {
        var result = state.deals

        if selectedCat != .all {
            result = result.filter { $0.cat == selectedCat }
        }
        if !search.isEmpty {
            let q = search.lowercased()
            result = result.filter { $0.title.lowercased().contains(q) || $0.seller.lowercased().contains(q) }
        }
        if cityFilter != "all" {
            result = result.filter { $0.city.contains(cityFilter) }
        }
        if priceFilter != "all" {
            switch priceFilter {
            case "low": result = result.filter { $0.group < 200 }
            case "mid": result = result.filter { $0.group >= 200 && $0.group < 500 }
            case "high": result = result.filter { $0.group >= 500 }
            default: break
            }
        }
        if discFilter != "all" {
            switch discFilter {
            case "big": result = result.filter { $0.disc >= 30 }
            case "med": result = result.filter { $0.disc >= 20 && $0.disc < 30 }
            case "small": result = result.filter { $0.disc < 20 }
            default: break
            }
        }
        if ratingFilter != "all" {
            switch ratingFilter {
            case "top": result = result.filter { $0.rating >= 4.8 }
            case "good": result = result.filter { $0.rating >= 4.5 }
            default: break
            }
        }

        switch sort {
        case .hot: result.sort { $0.pct > $1.pct }
        case .new: result.sort { $0.id > $1.id }
        case .discount: result.sort { $0.disc > $1.disc }
        case .price: result.sort { $0.group < $1.group }
        case .rating: result.sort { $0.rating > $1.rating }
        }

        return result
    }

    var body: some View {
        NavigationStack {
            ZStack {
                state.theme.bg.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        headerSection
                        HotSliderView(deals: state.deals.filter { $0.hot }, onSelect: { selectedDeal = $0 })
                        searchSection
                        categorySection
                        sortSection
                        dealsGrid
                    }
                    .padding(.bottom, 20)
                }
            }
            .navigationDestination(item: $selectedDeal) { deal in
                DealDetailView(deal: deal)
            }
            .sheet(isPresented: $showCreateDeal) {
                CreateDealView()
                    .environmentObject(state)
            }
            .sheet(isPresented: $showFilters) {
                filtersSheet
            }
        }
    }

    var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Spil")
                    .font(.title.bold())
                    .foregroundColor(state.theme.text)
                if let user = state.user {
                    Text("\(user.name), вітаємо!")
                        .font(.subheadline)
                        .foregroundColor(state.theme.green)
                } else {
                    Text("Купуй разом — плати менше")
                        .font(.subheadline)
                        .foregroundColor(state.theme.green)
                }
            }
            Spacer()
            Button(action: { showCreateDeal = true }) {
                Image(systemName: "plus.circle.fill")
                    .font(.title2)
                    .foregroundColor(state.theme.accent)
            }
        }
        .padding(.horizontal)
        .padding(.top, 8)
    }

    var searchSection: some View {
        HStack(spacing: 10) {
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(state.theme.textMuted)
                TextField("Пошук товарів...", text: $search)
                    .foregroundColor(state.theme.text)
            }
            .padding(10)
            .background(state.theme.card)
            .cornerRadius(12)

            Button(action: { showFilters = true }) {
                Image(systemName: "slider.horizontal.3")
                    .foregroundColor(state.theme.accent)
                    .padding(10)
                    .background(state.theme.card)
                    .cornerRadius(12)
            }
        }
        .padding(.horizontal)
    }

    var categorySection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(DealCategory.allCases, id: \.self) { cat in
                    Button(action: { selectedCat = cat }) {
                        HStack(spacing: 4) {
                            Text(cat.icon)
                                .font(.caption)
                            Text(cat.label)
                                .font(.caption)
                                .fontWeight(.medium)
                        }
                        .foregroundColor(selectedCat == cat ? .white : state.theme.textSec)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(selectedCat == cat ? state.theme.accent : state.theme.card)
                        .cornerRadius(10)
                    }
                }
            }
            .padding(.horizontal)
        }
    }

    var sortSection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(DealSort.allCases, id: \.self) { s in
                    Button(action: { sort = s }) {
                        Text(s.rawValue)
                            .font(.caption2)
                            .fontWeight(.semibold)
                            .foregroundColor(sort == s ? .white : state.theme.textMuted)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(sort == s ? state.theme.accent.opacity(0.6) : Color.clear)
                            .cornerRadius(8)
                    }
                }
            }
            .padding(.horizontal)
        }
    }

    var dealsGrid: some View {
        LazyVStack(spacing: 12) {
            ForEach(filteredDeals) { deal in
                DealCardView(deal: deal) {
                    selectedDeal = deal
                }
                .padding(.horizontal)
            }
        }
    }

    var filtersSheet: some View {
        ZStack {
            state.theme.bg.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    HStack {
                        Text("Фільтри")
                            .font(.title2.bold())
                            .foregroundColor(state.theme.text)
                        Spacer()
                        Button("Скинути") {
                            cityFilter = "all"; priceFilter = "all"
                            discFilter = "all"; ratingFilter = "all"
                        }
                        .foregroundColor(state.theme.accent)
                    }

                    filterGroup(title: "Місто", selected: $cityFilter, options: [
                        ("all", "Всі")] + SampleData.cities.map { ($0, $0) })

                    filterGroup(title: "Ціна", selected: $priceFilter, options: [
                        ("all","Всі"),("low","до ₴200"),("mid","₴200–500"),("high","₴500+")])

                    filterGroup(title: "Знижка", selected: $discFilter, options: [
                        ("all","Всі"),("big","30%+"),("med","20–30%"),("small","до 20%")])

                    filterGroup(title: "Рейтинг", selected: $ratingFilter, options: [
                        ("all","Всі"),("top","4.8+"),("good","4.5+")])

                    Button(action: { showFilters = false }) {
                        Text("Застосувати")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(state.theme.accent)
                            .cornerRadius(14)
                    }
                }
                .padding()
            }
        }
    }

    func filterGroup(title: String, selected: Binding<String>, options: [(String, String)]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.headline)
                .foregroundColor(state.theme.text)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 80))], spacing: 6) {
                ForEach(options, id: \.0) { opt in
                    Button(action: { selected.wrappedValue = opt.0 }) {
                        Text(opt.1)
                            .font(.caption)
                            .foregroundColor(selected.wrappedValue == opt.0 ? .white : state.theme.textSec)
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

// MARK: - Hot Slider

struct HotSliderView: View {
    let deals: [Deal]
    let onSelect: (Deal) -> Void
    @EnvironmentObject var state: AppState
    @State private var currentIndex = 0

    var body: some View {
        if deals.isEmpty { EmptyView() }
        else {
            VStack(spacing: 8) {
                TabView(selection: $currentIndex) {
                    ForEach(Array(deals.prefix(6).enumerated()), id: \.element.id) { idx, deal in
                        Button(action: { onSelect(deal) }) {
                            hotCard(deal)
                        }
                        .tag(idx)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .frame(height: 140)

                HStack(spacing: 6) {
                    ForEach(0..<min(deals.count, 6), id: \.self) { i in
                        Circle()
                            .fill(i == currentIndex ? state.theme.accent : state.theme.textMuted.opacity(0.4))
                            .frame(width: 6, height: 6)
                    }
                }
            }
            .padding(.horizontal)
        }
    }

    func hotCard(_ deal: Deal) -> some View {
        ZStack(alignment: .bottomLeading) {
            categoryGradient(for: deal.cat)
            VStack {
                Text(deal.avatar)
                    .font(.system(size: 40))
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            VStack(alignment: .leading, spacing: 4) {
                BadgeView(text: "🔥 HOT -\(deal.disc)%", bg: Color.red.opacity(0.8), fg: .white, fontSize: 10)
                Text(deal.title)
                    .font(.subheadline.bold())
                    .foregroundColor(state.theme.text)
                    .lineLimit(1)
                HStack(spacing: 8) {
                    Text("₴\(deal.group)")
                        .font(.headline.bold())
                        .foregroundColor(state.theme.accent)
                    Text("₴\(deal.retail)")
                        .font(.caption)
                        .foregroundColor(state.theme.textMuted)
                        .strikethrough()
                }
            }
            .padding(12)
        }
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(state.theme.border, lineWidth: 1)
        )
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
