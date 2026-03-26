import SwiftUI

class AppState: ObservableObject {
    @Published var deals: [Deal] = []
    @Published var user: AppUser? = nil
    @Published var isGuest: Bool = false
    @Published var joinedDeals: Set<Int> = []
    @Published var themeType: ThemeType = .midnight
    @Published var balance: Int = 0
    @Published var transactions: [Transaction] = []
    @Published var orders: [Order] = []
    @Published var chats: [Chat] = []
    @Published var chatMessages: [Int: [ChatMessage]] = [:]

    // Loading states
    @Published var isLoadingDeals: Bool = false
    @Published var isLoadingWallet: Bool = false
    @Published var isLoadingChats: Bool = false
    @Published var isLoadingOrders: Bool = false
    @Published var apiError: String? = nil

    // Seller data
    @Published var sellerOrders: [Order] = []
    @Published var sellerDeals: [Deal] = []
    @Published var isLoadingSellerData: Bool = false

    // Maps API conversation IDs to local integer IDs
    private var conversationIdMap: [String: Int] = [:]
    private var reverseConversationMap: [Int: String] = [:]
    private var nextChatId: Int = 100

    // Stored API user ID for determining sender in messages
    private var currentUserId: String? {
        if let data = UserDefaults.standard.data(forKey: "spilnokup_api_user"),
           let apiUser = try? JSONDecoder().decode(APIUser.self, from: data) {
            return apiUser.id
        }
        return nil
    }

    var theme: AppTheme { AppTheme.theme(for: themeType) }
    var isLoggedIn: Bool { user != nil || isGuest }
    var availableBalance: Int { Int(Double(balance) * 0.75) }

    // MARK: - Load Deals from API

    func loadDeals() {
        guard !isLoadingDeals else { return }
        isLoadingDeals = true
        apiError = nil

        Task {
            do {
                let apiDeals = try await APIService.shared.fetchDeals()
                let converted = apiDeals.compactMap { self.convertAPIDeal($0) }
                await MainActor.run {
                    if !converted.isEmpty {
                        self.deals = converted
                    } else if self.deals.isEmpty {
                        self.deals = SampleData.deals
                    }
                    self.isLoadingDeals = false
                }
            } catch {
                await MainActor.run {
                    if self.deals.isEmpty {
                        self.deals = SampleData.deals
                    }
                    self.isLoadingDeals = false
                    self.apiError = error.localizedDescription
                }
            }
        }
    }

    // MARK: - Join Deal (create order via API)

    func joinDeal(_ dealId: Int) {
        joinedDeals.insert(dealId)
        if let idx = deals.firstIndex(where: { $0.id == dealId }) {
            deals[idx].joined += 1
        }

        // Find the deal to get its API ID
        if let deal = deals.first(where: { $0.id == dealId }), let apiId = deal.apiId {
            Task {
                do {
                    let _ = try await APIService.shared.createOrder(dealId: apiId, quantity: deal.minQty)
                } catch {
                    // Order creation failed but we already updated locally for responsiveness
                    print("Order creation failed: \(error.localizedDescription)")
                }
            }
        }
    }

    func isJoined(_ dealId: Int) -> Bool {
        joinedDeals.contains(dealId)
    }

    // MARK: - Wallet

    func loadWallet() {
        guard !isLoadingWallet else { return }
        isLoadingWallet = true

        Task {
            do {
                let wallet = try await APIService.shared.fetchWallet()
                await MainActor.run {
                    if let b = wallet.balance {
                        self.balance = Int(b)
                    }
                    if let apiTx = wallet.transactions {
                        self.transactions = apiTx.compactMap { self.convertAPITransaction($0) }
                    }
                    if self.transactions.isEmpty {
                        self.transactions = SampleData.transactions
                    }
                    self.isLoadingWallet = false
                }
            } catch {
                await MainActor.run {
                    if self.balance == 0 {
                        self.balance = SampleData.transactions.reduce(0) { sum, tx in
                            sum + (tx.type == .income ? tx.amount : -tx.amount)
                        }
                    }
                    if self.transactions.isEmpty {
                        self.transactions = SampleData.transactions
                    }
                    self.isLoadingWallet = false
                }
            }
        }
    }

    func topUp(_ amount: Int) {
        balance += amount
        transactions.insert(Transaction(
            id: "T\(transactions.count + 1)",
            type: .income,
            desc: "Поповнення балансу",
            amount: amount,
            date: currentDateTimeString()
        ), at: 0)
    }

    func withdraw(_ amount: Int) {
        balance -= amount
        transactions.insert(Transaction(
            id: "T\(transactions.count + 1)",
            type: .withdrawal,
            desc: "Виведення на IBAN",
            amount: amount,
            date: currentDateTimeString()
        ), at: 0)

        Task {
            do {
                try await APIService.shared.withdrawFunds(amount: amount)
            } catch {
                print("Withdraw API failed: \(error.localizedDescription)")
            }
        }
    }

    // MARK: - Chats (API-backed)

    func loadConversations() {
        guard !isLoadingChats else { return }
        isLoadingChats = true

        Task {
            do {
                let apiConvs = try await APIService.shared.fetchConversations()
                let converted = apiConvs.compactMap { self.convertAPIConversation($0) }
                await MainActor.run {
                    if !converted.isEmpty {
                        self.chats = converted
                    } else if self.chats.isEmpty {
                        self.chats = SampleData.chats
                        self.chatMessages = SampleData.chatMessages
                    }
                    self.isLoadingChats = false
                }
            } catch {
                await MainActor.run {
                    if self.chats.isEmpty {
                        self.chats = SampleData.chats
                        self.chatMessages = SampleData.chatMessages
                    }
                    self.isLoadingChats = false
                }
            }
        }
    }

    func loadMessages(chatId: Int) {
        guard let apiConvId = reverseConversationMap[chatId] else { return }

        Task {
            do {
                let apiMsgs = try await APIService.shared.fetchMessages(conversationId: apiConvId)
                let converted = apiMsgs.compactMap { self.convertAPIMessage($0) }
                await MainActor.run {
                    if !converted.isEmpty {
                        self.chatMessages[chatId] = converted
                    }
                }
            } catch {
                // Keep existing messages
            }
        }
    }

    func sendMessage(chatId: Int, text: String) {
        let msg = ChatMessage(from: .me, text: text, time: currentTime())
        if chatMessages[chatId] != nil {
            chatMessages[chatId]?.append(msg)
        } else {
            chatMessages[chatId] = [msg]
        }
        if let idx = chats.firstIndex(where: { $0.id == chatId }) {
            chats[idx].last = text
            chats[idx].time = currentTime()
        }

        // Send via API
        if let apiConvId = reverseConversationMap[chatId] {
            Task {
                do {
                    let _ = try await APIService.shared.sendMessage(conversationId: apiConvId, text: text)
                } catch {
                    print("Send message failed: \(error.localizedDescription)")
                }
            }
        } else {
            // Fallback auto-reply for sample data chats
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in
                let replies = ["Дякуємо за повідомлення!", "Зрозуміло, дякую!", "Добре, чекайте на підтвердження!", "Скоро відповімо!"]
                let reply = ChatMessage(from: .them, text: replies.randomElement()!, time: self?.currentTime() ?? "")
                self?.chatMessages[chatId]?.append(reply)
                if let idx = self?.chats.firstIndex(where: { $0.id == chatId }) {
                    self?.chats[idx].last = reply.text
                    self?.chats[idx].time = reply.time
                    self?.chats[idx].unread += 1
                }
            }
        }
    }

    // MARK: - Seller Data

    func loadSellerData() {
        guard !isLoadingSellerData else { return }
        isLoadingSellerData = true

        Task {
            do {
                async let ordersReq = APIService.shared.fetchSellerOrders()
                async let dealsReq = APIService.shared.fetchSellerDeals()

                let (apiOrders, apiDeals) = try await (ordersReq, dealsReq)

                let convertedOrders = apiOrders.compactMap { self.convertAPIOrder($0) }
                let convertedDeals = apiDeals.compactMap { self.convertAPIDeal($0) }

                await MainActor.run {
                    if !convertedOrders.isEmpty {
                        self.sellerOrders = convertedOrders
                        self.orders = convertedOrders
                    } else if self.orders.isEmpty {
                        self.orders = SampleData.orders
                        self.sellerOrders = SampleData.orders
                    }
                    if !convertedDeals.isEmpty {
                        self.sellerDeals = convertedDeals
                    }
                    self.isLoadingSellerData = false
                }
            } catch {
                await MainActor.run {
                    if self.orders.isEmpty {
                        self.orders = SampleData.orders
                        self.sellerOrders = SampleData.orders
                    }
                    self.isLoadingSellerData = false
                }
            }
        }
    }

    // MARK: - My Orders

    func loadMyOrders() {
        Task {
            do {
                let apiOrders = try await APIService.shared.fetchMyOrders()
                let converted = apiOrders.compactMap { self.convertAPIOrder($0) }
                await MainActor.run {
                    if !converted.isEmpty {
                        // Mark deals as joined based on real orders
                        for order in converted {
                            // Try to find matching deal
                            if let deal = self.deals.first(where: { $0.title == order.item }) {
                                self.joinedDeals.insert(deal.id)
                            }
                        }
                    }
                }
            } catch {
                // Silently fail
            }
        }
    }

    // MARK: - Create Deal via API

    func addDeal(_ deal: Deal) {
        deals.insert(deal, at: 0)

        // Also push to API
        let body: [String: Any] = [
            "title": deal.title,
            "description": deal.desc,
            "category": deal.cat.rawValue,
            "city": deal.city,
            "groupPrice": deal.group,
            "retailPrice": deal.retail,
            "unit": deal.unit,
            "minQuantity": deal.minQty,
            "maxQuantity": deal.maxQty,
            "targetParticipants": deal.needed,
            "daysLeft": deal.days,
            "tags": deal.tags
        ]

        Task {
            do {
                let _ = try await APIService.shared.createDeal(body)
            } catch {
                print("Create deal API failed: \(error.localizedDescription)")
            }
        }
    }

    // MARK: - Conversion Helpers

    private func convertAPIDeal(_ api: APIDeal) -> Deal? {
        let title = api.title ?? "Без назви"
        let catStr = api.category ?? "other"
        let cat = DealCategory(rawValue: catStr) ?? .other

        let sellerName = api.seller?.name ?? api.sellerName ?? "Продавець"
        let sellerAvatarStr = api.seller?.avatarUrl ?? api.sellerAvatar ?? ""
        let sellerRating = api.seller?.rating ?? api.sellerRating ?? 4.5
        let sellerCount = api.seller?.dealCount ?? api.sellerDealCount ?? 0

        let retail = Int(api.retailPrice ?? api.price ?? 0)
        let group = Int(api.groupPrice ?? api.price ?? 0)
        let joinedCount = api.currentParticipants ?? api.joined ?? 0
        let neededCount = api.targetParticipants ?? api.needed ?? 10
        let dLeft = api.daysLeft ?? api.days ?? 7
        let minQ = api.minQuantity ?? api.minQty ?? 1
        let maxQ = api.maxQuantity ?? api.maxQty ?? 10
        let isHot = api.isHot ?? api.hot ?? false

        let resolvedId = api.resolvedId
        let numericId = abs(resolvedId.hashValue) % 1000000

        return Deal(
            id: numericId,
            cat: cat,
            seller: sellerName,
            avatar: sellerAvatarStr,
            city: api.city ?? "",
            rating: sellerRating,
            dealCount: sellerCount,
            title: title,
            unit: api.unit ?? "шт",
            retail: retail > 0 ? retail : group,
            group: group,
            minQty: minQ,
            maxQty: maxQ,
            joined: joinedCount,
            needed: neededCount > 0 ? neededCount : 10,
            days: dLeft,
            desc: api.description ?? "",
            tags: api.tags ?? [],
            hot: isHot,
            apiId: resolvedId
        )
    }

    private func convertAPIOrder(_ api: APIOrder) -> Order? {
        let buyerName = api.buyer?.name ?? api.buyerName ?? "Покупець"
        let buyerAvatar = api.buyer?.avatarUrl ?? api.buyerAvatar ?? ""
        let itemTitle = api.deal?.title ?? api.dealTitle ?? "Товар"
        let unitStr = api.deal?.unit ?? api.dealUnit ?? "шт"
        let qty = api.quantity ?? 1
        let amt = Int(api.totalAmount ?? api.amount ?? 0)

        let statusStr = api.status ?? "paid"
        let status: OrderStatus
        switch statusStr {
        case "done", "completed", "delivered": status = .done
        case "expired", "cancelled": status = .expired
        case "partial": status = .partial
        default: status = .paid
        }

        return Order(
            id: api.resolvedId,
            buyer: buyerName,
            avatar: buyerAvatar,
            item: itemTitle,
            qty: qty,
            unit: unitStr,
            amount: amt,
            status: status
        )
    }

    private func convertAPITransaction(_ api: APITransaction) -> Transaction? {
        let typeStr = api.type ?? "income"
        let txType: TransactionType
        switch typeStr {
        case "withdrawal", "withdraw": txType = .withdrawal
        case "hold": txType = .hold
        default: txType = .income
        }

        let desc = api.description ?? api.desc ?? ""
        let amt = Int(api.amount ?? 0)
        let dateStr = api.date ?? formatAPIDate(api.createdAt) ?? ""

        return Transaction(
            id: api.resolvedId,
            type: txType,
            desc: desc,
            amount: amt,
            date: dateStr
        )
    }

    private func convertAPIConversation(_ api: APIConversation) -> Chat? {
        let convId = api.resolvedId

        // Get or assign a local integer ID for this conversation
        let localId: Int
        if let existing = conversationIdMap[convId] {
            localId = existing
        } else {
            localId = nextChatId
            conversationIdMap[convId] = localId
            reverseConversationMap[localId] = convId
            nextChatId += 1
        }

        // Determine the other participant name
        var otherName = "Чат"
        var otherAvatar = ""
        if let other = api.otherUser {
            otherName = other.name ?? "Чат"
            otherAvatar = other.avatarUrl ?? ""
        } else if let participants = api.participants {
            let userId = currentUserId
            for p in participants {
                let pid = p.id ?? p._id
                if pid != userId {
                    otherName = p.name ?? "Чат"
                    otherAvatar = p.avatarUrl ?? ""
                    break
                }
            }
        }

        if let dealTitle = api.deal?.title {
            otherName = "\(otherName) - \(dealTitle)"
        }

        let lastText = api.lastMessage?.text ?? ""
        let timeStr = formatAPIDate(api.updatedAt ?? api.lastMessage?.createdAt) ?? ""
        let unread = api.unreadCount ?? 0

        return Chat(
            id: localId,
            name: otherName,
            avatar: otherAvatar,
            last: lastText,
            time: timeStr,
            unread: unread,
            online: false
        )
    }

    private func convertAPIMessage(_ api: APIMessage) -> ChatMessage? {
        let text = api.text ?? ""
        if text.isEmpty { return nil }

        let userId = currentUserId
        let senderId = api.senderId ?? api.sender?.id ?? api.sender?._id
        let isMe = senderId != nil && senderId == userId

        let timeStr = formatAPIDate(api.createdAt) ?? ""

        return ChatMessage(
            from: isMe ? .me : .them,
            text: text,
            time: timeStr
        )
    }

    // MARK: - Date Formatting

    private func formatAPIDate(_ dateString: String?) -> String? {
        guard let dateString = dateString else { return nil }

        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        var date = isoFormatter.date(from: dateString)

        if date == nil {
            isoFormatter.formatOptions = [.withInternetDateTime]
            date = isoFormatter.date(from: dateString)
        }

        if date == nil {
            let df = DateFormatter()
            df.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
            date = df.date(from: dateString)
        }

        guard let parsedDate = date else { return dateString.prefix(10).description }

        let df = DateFormatter()
        df.locale = Locale(identifier: "uk_UA")

        if Calendar.current.isDateInToday(parsedDate) {
            df.dateFormat = "HH:mm"
        } else if Calendar.current.isDateInYesterday(parsedDate) {
            return "вчора"
        } else {
            df.dateFormat = "dd.MM HH:mm"
        }

        return df.string(from: parsedDate)
    }

    private func currentDateTimeString() -> String {
        let f = DateFormatter()
        f.dateFormat = "dd.MM ' ' HH:mm"
        return f.string(from: Date())
    }

    func currentTime() -> String {
        let f = DateFormatter()
        f.dateFormat = "HH:mm"
        return f.string(from: Date())
    }

    // MARK: - User Persistence

    func saveUser() {
        if let user = user, let data = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(data, forKey: "spilnokup_user")
        }
    }

    func loadUser() {
        if let data = UserDefaults.standard.data(forKey: "spilnokup_user"),
           let user = try? JSONDecoder().decode(AppUser.self, from: data) {
            self.user = user
        }
    }

    func saveTheme() {
        UserDefaults.standard.set(themeType.rawValue, forKey: "spilnokup_theme")
    }

    func loadTheme() {
        if let raw = UserDefaults.standard.string(forKey: "spilnokup_theme"),
           let t = ThemeType(rawValue: raw) {
            themeType = t
        }
    }

    // Save the API user details for sender matching
    func saveAPIUser(_ apiUser: APIUser) {
        if let data = try? JSONEncoder().encode(apiUser) {
            UserDefaults.standard.set(data, forKey: "spilnokup_api_user")
        }
    }
}
