import SwiftUI

// MARK: - Support Chat Message (Codable for UserDefaults)

struct SupportMessage: Identifiable, Codable {
    let id: String
    let fromMe: Bool
    let text: String
    let time: String

    init(fromMe: Bool, text: String, time: String) {
        self.id = UUID().uuidString
        self.fromMe = fromMe
        self.text = text
        self.time = time
    }
}

struct ChatListView: View {
    @EnvironmentObject var state: AppState
    @State private var selectedChat: Chat? = nil
    @State private var showSupportChat = false
    @State private var hasAppeared = false

    var body: some View {
        NavigationStack {
            ZStack {
                state.theme.bg.ignoresSafeArea()

                if state.isLoadingChats && state.chats.isEmpty {
                    VStack(spacing: 12) {
                        ProgressView()
                            .tint(state.theme.accent)
                        Text("Завантаження чатiв...")
                            .font(.subheadline)
                            .foregroundColor(state.theme.textSec)
                    }
                } else {
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            // Support chat at top with custom avatar
                            Button(action: { showSupportChat = true }) {
                                supportChatRow
                            }
                            .buttonStyle(.plain)
                            Divider()
                                .background(state.theme.border)
                                .padding(.leading, 70)

                            // Real conversations list below
                            ForEach(state.chats) { chat in
                                Button(action: { selectedChat = chat }) {
                                    chatRow(chat)
                                }
                                .buttonStyle(.plain)
                                Divider()
                                    .background(state.theme.border)
                                    .padding(.leading, 70)
                            }

                            if state.chats.isEmpty {
                                VStack(spacing: 12) {
                                    Image(systemName: "bubble.left.and.bubble.right")
                                        .font(.system(size: 32))
                                        .foregroundColor(state.theme.textMuted)
                                    Text("Чатiв поки немає")
                                        .font(.subheadline)
                                        .foregroundColor(state.theme.textSec)
                                    Text("Приєднайтесь до угоди, щоб почати спiлкування")
                                        .font(.caption)
                                        .foregroundColor(state.theme.textMuted)
                                        .multilineTextAlignment(.center)
                                }
                                .padding(.top, 40)
                            }
                        }
                        .padding(.top, 8)
                    }
                }
            }
            .navigationTitle("Повiдомлення")
            .sheet(item: $selectedChat) { chat in
                ChatDetailView(chat: chat)
                    .environmentObject(state)
            }
            .sheet(isPresented: $showSupportChat) {
                SupportChatView()
                    .environmentObject(state)
            }
            .onAppear {
                if !hasAppeared {
                    hasAppeared = true
                    state.loadConversations()
                }
            }
        }
    }

    // Support chat row with custom avatar (headphones icon on accent bg)
    var supportChatRow: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(state.theme.accent)
                    .frame(width: 50, height: 50)
                Image(systemName: "headphones")
                    .font(.title2)
                    .foregroundColor(state.theme.bg)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("Пiдтримка")
                        .font(.subheadline.bold())
                        .foregroundColor(state.theme.text)
                    Spacer()
                }
                Text("Задайте будь-яке питання")
                    .font(.caption)
                    .foregroundColor(state.theme.textSec)
                    .lineLimit(1)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
    }

    func chatRow(_ chat: Chat) -> some View {
        HStack(spacing: 12) {
            // Avatar with initials
            ZStack(alignment: .bottomTrailing) {
                ZStack {
                    Circle()
                        .fill(state.theme.accent.opacity(0.2))
                        .frame(width: 50, height: 50)
                    Text(chatInitials(chat.name))
                        .font(.subheadline.bold())
                        .foregroundColor(state.theme.accent)
                }
                if chat.online {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 12, height: 12)
                        .overlay(Circle().stroke(state.theme.bg, lineWidth: 2))
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(chat.name)
                        .font(.subheadline.bold())
                        .foregroundColor(state.theme.text)
                        .lineLimit(1)
                    Spacer()
                    Text(chat.time)
                        .font(.caption2)
                        .foregroundColor(state.theme.textMuted)
                }
                HStack {
                    Text(chat.last)
                        .font(.caption)
                        .foregroundColor(state.theme.textSec)
                        .lineLimit(1)
                    Spacer()
                    if chat.unread > 0 {
                        Text("\(chat.unread)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(state.theme.bg)
                            .frame(width: 20, height: 20)
                            .background(state.theme.accent)
                            .clipShape(Circle())
                    }
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
    }

    func chatInitials(_ name: String) -> String {
        let parts = name.components(separatedBy: " ")
        let first = parts.first?.prefix(1) ?? ""
        let last = parts.count > 1 ? parts[1].prefix(1) : ""
        return "\(first)\(last)".uppercased()
    }
}

extension Chat: Hashable {
    static func == (lhs: Chat, rhs: Chat) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

// MARK: - Support Chat View

struct SupportChatView: View {
    @EnvironmentObject var state: AppState
    @Environment(\.presentationMode) var presentationMode
    @State private var messageText = ""
    @State private var messages: [SupportMessage] = []
    @State private var pollTimer: Timer? = nil
    @State private var lastReplyCount: Int = 0

    private let storageKey = "spilnokup_support_msgs"

    var body: some View {
        NavigationStack {
            ZStack {
                state.theme.bg.ignoresSafeArea()

                VStack(spacing: 0) {
                    ScrollViewReader { proxy in
                        ScrollView {
                            LazyVStack(spacing: 8) {
                                ForEach(messages) { msg in
                                    supportBubble(msg)
                                        .id(msg.id)
                                }
                            }
                            .padding()
                        }
                        .onAppear {
                            loadMessages()
                            scrollToBottom(proxy: proxy)
                            startPollingReplies()
                        }
                        .onDisappear {
                            stopPollingReplies()
                        }
                        .onChange(of: messages.count) { _ in
                            scrollToBottom(proxy: proxy)
                        }
                    }

                    // Input bar at bottom
                    HStack(spacing: 10) {
                        TextField("Повiдомлення...", text: $messageText)
                            .foregroundColor(state.theme.text)
                            .padding(10)
                            .background(state.theme.cardAlt)
                            .cornerRadius(20)

                        Button(action: sendSupportMessage) {
                            Image(systemName: "arrow.up.circle.fill")
                                .font(.title2)
                                .foregroundColor(messageText.isEmpty ? state.theme.textMuted : state.theme.accent)
                        }
                        .disabled(messageText.isEmpty)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(state.theme.card)
                }
            }
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { presentationMode.wrappedValue.dismiss() }) {
                        Image(systemName: "chevron.left")
                            .foregroundColor(state.theme.accent)
                    }
                }
                ToolbarItem(placement: .principal) {
                    HStack(spacing: 8) {
                        ZStack {
                            Circle()
                                .fill(state.theme.accent)
                                .frame(width: 32, height: 32)
                            Image(systemName: "headphones")
                                .font(.system(size: 14))
                                .foregroundColor(state.theme.bg)
                        }
                        VStack(alignment: .leading, spacing: 0) {
                            Text("Пiдтримка")
                                .font(.subheadline.bold())
                                .foregroundColor(state.theme.text)
                            Text("Онлайн")
                                .font(.caption2)
                                .foregroundColor(.green)
                        }
                    }
                }
            }
        }
    }

    // Word-wrap for long messages
    func supportBubble(_ msg: SupportMessage) -> some View {
        HStack {
            if msg.fromMe { Spacer(minLength: 50) }

            VStack(alignment: msg.fromMe ? .trailing : .leading, spacing: 2) {
                Text(msg.text)
                    .font(.subheadline)
                    .foregroundColor(state.theme.text)
                    .lineLimit(nil)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(msg.fromMe ? state.theme.accent.opacity(0.3) : state.theme.cardAlt)
                    .cornerRadius(16)

                Text(msg.time)
                    .font(.system(size: 10))
                    .foregroundColor(state.theme.textMuted)
                    .padding(.horizontal, 4)
            }

            if !msg.fromMe { Spacer(minLength: 50) }
        }
    }

    func scrollToBottom(proxy: ScrollViewProxy) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            if let last = messages.last {
                withAnimation {
                    proxy.scrollTo(last.id, anchor: .bottom)
                }
            }
        }
    }

    func sendSupportMessage() {
        guard !messageText.isEmpty else { return }
        let text = messageText
        let time = currentTime()

        let msg = SupportMessage(fromMe: true, text: text, time: time)
        messages.append(msg)
        messageText = ""
        saveMessages()

        Task {
            do {
                try await APIService.shared.sendSupportMessage(
                    message: text,
                    userName: state.user?.name,
                    userPhone: state.user?.phone
                )
            } catch {
                // Best effort
            }
        }
    }

    func loadMessages() {
        if let data = UserDefaults.standard.data(forKey: storageKey),
           let saved = try? JSONDecoder().decode([SupportMessage].self, from: data) {
            messages = saved
        }
        if messages.isEmpty {
            let welcome = SupportMessage(
                fromMe: false,
                text: "Вiтаємо в чатi пiдтримки СпiльноКуп! Опишiть ваше питання, i ми допоможемо.",
                time: currentTime()
            )
            messages.append(welcome)
            saveMessages()
        }
        lastReplyCount = messages.filter { !$0.fromMe }.count
    }

    func saveMessages() {
        if let data = try? JSONEncoder().encode(messages) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }

    func startPollingReplies() {
        guard let phone = state.user?.phone, !phone.isEmpty else { return }
        pollTimer = Timer.scheduledTimer(withTimeInterval: 10.0, repeats: true) { _ in
            fetchSupportReplies(phone: phone)
        }
        fetchSupportReplies(phone: phone)
    }

    func stopPollingReplies() {
        pollTimer?.invalidate()
        pollTimer = nil
    }

    func fetchSupportReplies(phone: String) {
        Task {
            do {
                let replies = try await APIService.shared.getSupportReplies(phone: phone)
                await MainActor.run {
                    var hasNew = false
                    for reply in replies {
                        let replyText = reply.text ?? reply.message ?? ""
                        if replyText.isEmpty { continue }
                        let alreadyExists = messages.suffix(20).contains(where: {
                            !$0.fromMe && $0.text == replyText
                        })
                        if !alreadyExists {
                            let msg = SupportMessage(fromMe: false, text: replyText, time: currentTime())
                            messages.append(msg)
                            hasNew = true
                        }
                    }
                    if hasNew {
                        saveMessages()
                    }
                }
            } catch {
                // Silently fail
            }
        }
    }

    func currentTime() -> String {
        let f = DateFormatter()
        f.dateFormat = "HH:mm"
        return f.string(from: Date())
    }
}

// MARK: - Chat Detail (regular chats) with message bubbles, auto-scroll, word-wrap

struct ChatDetailView: View {
    let chat: Chat
    @EnvironmentObject var state: AppState
    @Environment(\.presentationMode) var presentationMode
    @State private var messageText = ""
    @State private var hasAppeared = false

    var messages: [ChatMessage] {
        state.chatMessages[chat.id] ?? []
    }

    var body: some View {
        NavigationStack {
            ZStack {
                state.theme.bg.ignoresSafeArea()

                VStack(spacing: 0) {
                    ScrollViewReader { proxy in
                        ScrollView {
                            LazyVStack(spacing: 8) {
                                ForEach(messages) { msg in
                                    messageBubble(msg)
                                        .id(msg.id)
                                }
                            }
                            .padding()
                        }
                        .onAppear {
                            if !hasAppeared {
                                hasAppeared = true
                                state.loadMessages(chatId: chat.id)
                            }
                            if let last = messages.last {
                                proxy.scrollTo(last.id, anchor: .bottom)
                            }
                        }
                        .onChange(of: messages.count) { _ in
                            if let last = messages.last {
                                withAnimation {
                                    proxy.scrollTo(last.id, anchor: .bottom)
                                }
                            }
                        }
                    }

                    // Input bar at bottom
                    HStack(spacing: 10) {
                        TextField("Повiдомлення...", text: $messageText)
                            .foregroundColor(state.theme.text)
                            .padding(10)
                            .background(state.theme.cardAlt)
                            .cornerRadius(20)

                        Button(action: send) {
                            Image(systemName: "arrow.up.circle.fill")
                                .font(.title2)
                                .foregroundColor(messageText.isEmpty ? state.theme.textMuted : state.theme.accent)
                        }
                        .disabled(messageText.isEmpty)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(state.theme.card)
                }
            }
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { presentationMode.wrappedValue.dismiss() }) {
                        Image(systemName: "chevron.left")
                            .foregroundColor(state.theme.accent)
                    }
                }
                ToolbarItem(placement: .principal) {
                    HStack(spacing: 8) {
                        ZStack {
                            Circle()
                                .fill(state.theme.accent.opacity(0.2))
                                .frame(width: 32, height: 32)
                            Text(chatInitials(chat.name))
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(state.theme.accent)
                        }
                        VStack(alignment: .leading, spacing: 0) {
                            Text(chat.name)
                                .font(.subheadline.bold())
                                .foregroundColor(state.theme.text)
                                .lineLimit(1)
                            Text(chat.online ? "Онлайн" : "Був(ла) нещодавно")
                                .font(.caption2)
                                .foregroundColor(chat.online ? .green : state.theme.textMuted)
                        }
                    }
                }
            }
        }
    }

    func chatInitials(_ name: String) -> String {
        let parts = name.components(separatedBy: " ")
        let first = parts.first?.prefix(1) ?? ""
        let last = parts.count > 1 ? parts[1].prefix(1) : ""
        return "\(first)\(last)".uppercased()
    }

    // Word-wrap for long messages
    func messageBubble(_ msg: ChatMessage) -> some View {
        HStack {
            if msg.from == .me { Spacer(minLength: 50) }

            VStack(alignment: msg.from == .me ? .trailing : .leading, spacing: 2) {
                Text(msg.text)
                    .font(.subheadline)
                    .foregroundColor(state.theme.text)
                    .lineLimit(nil)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(msg.from == .me ? state.theme.accent.opacity(0.3) : state.theme.cardAlt)
                    .cornerRadius(16)

                Text(msg.time)
                    .font(.system(size: 10))
                    .foregroundColor(state.theme.textMuted)
                    .padding(.horizontal, 4)
            }

            if msg.from == .them { Spacer(minLength: 50) }
        }
    }

    func send() {
        guard !messageText.isEmpty else { return }
        state.sendMessage(chatId: chat.id, text: messageText)
        messageText = ""
    }
}
