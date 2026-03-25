import SwiftUI

struct WelcomeView: View {
    @EnvironmentObject var state: AppState
    @State private var showRegister = false

    var body: some View {
        ZStack {
            state.theme.bg.ignoresSafeArea()

            VStack(spacing: 24) {
                Spacer()

                Text("🛒")
                    .font(.system(size: 80))

                Text("Spil")
                    .font(.system(size: 34, weight: .bold))
                    .foregroundColor(state.theme.text)

                Text("Спільні покупки від малого бізнесу України.\nЕкономте до 40% купуючи разом!")
                    .font(.subheadline)
                    .foregroundColor(state.theme.textSec)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)

                Spacer()

                VStack(spacing: 12) {
                    Button(action: { showRegister = true }) {
                        Text("Увійти через Telegram")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Color(hex: "0088cc"))
                            .cornerRadius(14)
                    }

                    Button(action: {
                        state.isGuest = true
                    }) {
                        Text("Гостьовий вхід →")
                            .font(.subheadline)
                            .foregroundColor(state.theme.textSec)
                    }
                    .padding(.top, 4)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 40)
            }
        }
        .sheet(isPresented: $showRegister) {
            RegisterView()
                .environmentObject(state)
        }
    }
}

// MARK: - Register

struct RegisterView: View {
    @EnvironmentObject var state: AppState
    @Environment(\.presentationMode) var presentationMode
    @State private var step = 0
    @State private var name = ""
    @State private var phone = ""
    @State private var city = ""
    @State private var code = ""
    @State private var loading = false
    @State private var error = ""
    @State private var telegramToken = ""

    var body: some View {
        ZStack {
            state.theme.bg.ignoresSafeArea()

            VStack(spacing: 20) {
                HStack {
                    if step > 0 {
                        Button(action: { step -= 1; error = "" }) {
                            HStack(spacing: 4) {
                                Image(systemName: "chevron.left")
                                Text("Назад")
                            }
                            .foregroundColor(state.theme.accent)
                        }
                    }
                    Spacer()
                    Text("Крок \(step + 1) з 3")
                        .font(.caption)
                        .foregroundColor(state.theme.textSec)
                }
                .padding(.horizontal)
                .padding(.top, 20)

                // Progress
                HStack(spacing: 4) {
                    ForEach(0..<3, id: \.self) { i in
                        RoundedRectangle(cornerRadius: 2)
                            .fill(i <= step ? state.theme.accent : state.theme.cardAlt)
                            .frame(height: 4)
                    }
                }
                .padding(.horizontal)

                ScrollView {
                    VStack(spacing: 16) {
                        if step == 0 {
                            stepInfoView
                        } else if step == 1 {
                            stepTelegramView
                        } else {
                            stepCodeView
                        }
                    }
                    .padding()
                }

                Spacer()

                if !error.isEmpty {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(Color(hex: "ef4444"))
                        .padding(.horizontal)
                }

                Button(action: nextStep) {
                    HStack {
                        if loading {
                            ProgressView()
                                .tint(.white)
                        }
                        Text(buttonTitle)
                            .font(.headline)
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(canProceed ? state.theme.accent : state.theme.cardAlt)
                    .cornerRadius(14)
                }
                .disabled(!canProceed || loading)
                .padding(.horizontal)
                .padding(.bottom, 20)
            }
        }
    }

    // MARK: - Step 1: Phone, Name, City

    var stepInfoView: some View {
        VStack(spacing: 14) {
            Text("Вхід / Реєстрація")
                .font(.title2.bold())
                .foregroundColor(state.theme.text)

            ThemedTextField(placeholder: "📱 +380...", text: $phone)
            ThemedTextField(placeholder: "👤 Ваше ім'я", text: $name)

            ThemedTextField(placeholder: "📍 Місто", text: $city)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                ForEach(SampleData.cities, id: \.self) { c in
                    Button(action: { city = c }) {
                        Text(c)
                            .font(.caption)
                            .foregroundColor(city == c ? .white : state.theme.textSec)
                            .padding(.vertical, 8)
                            .frame(maxWidth: .infinity)
                            .background(city == c ? state.theme.accent : state.theme.cardAlt)
                            .cornerRadius(8)
                    }
                }
            }
        }
    }

    // MARK: - Step 2: Open Telegram

    var stepTelegramView: some View {
        VStack(spacing: 18) {
            Text("Отримайте код")
                .font(.title2.bold())
                .foregroundColor(state.theme.text)

            Text("Натисніть кнопку нижче, відкриється Telegram.\nНатисніть Start — бот надішле код.")
                .font(.subheadline)
                .foregroundColor(state.theme.textSec)
                .multilineTextAlignment(.center)

            Text("✈️")
                .font(.system(size: 60))
                .padding(.vertical, 8)

            Button(action: openTelegram) {
                HStack(spacing: 8) {
                    Image(systemName: "paperplane.fill")
                    Text("Відкрити Telegram")
                }
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color(hex: "0088cc"))
                .cornerRadius(14)
            }

            VStack(spacing: 6) {
                Text("1. Натисніть Start в боті")
                Text("2. Бот надішле 6-значний код")
                Text("3. Введіть код на наступному кроці")
            }
            .font(.caption)
            .foregroundColor(state.theme.textMuted)
        }
    }

    // MARK: - Step 3: Enter Code

    var stepCodeView: some View {
        VStack(spacing: 14) {
            Text("Введіть код")
                .font(.title2.bold())
                .foregroundColor(state.theme.text)

            HStack(spacing: 6) {
                Image(systemName: "paperplane.fill")
                    .foregroundColor(Color(hex: "0088cc"))
                Text("Код надіслано в Telegram")
                    .foregroundColor(state.theme.textSec)
            }
            .font(.subheadline)

            TextField("000000", text: $code)
                .keyboardType(.numberPad)
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(state.theme.text)
                .multilineTextAlignment(.center)
                .padding(16)
                .background(state.theme.cardAlt)
                .cornerRadius(14)
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(code.isEmpty ? state.theme.border : state.theme.accent, lineWidth: 2)
                )
                .onChange(of: code) { newValue in
                    code = String(newValue.prefix(6).filter { $0.isNumber })
                }

            Text("Введіть 6-значний код з Telegram")
                .font(.caption)
                .foregroundColor(state.theme.textMuted)
        }
    }

    // MARK: - Logic

    var buttonTitle: String {
        switch step {
        case 0: return loading ? "Зачекайте..." : "Далі"
        case 1: return "Я отримав код"
        case 2: return loading ? "Перевіряємо..." : "Підтвердити"
        default: return "Далі"
        }
    }

    var canProceed: Bool {
        switch step {
        case 0: return !phone.isEmpty && !name.isEmpty && !city.isEmpty
        case 1: return true
        case 2: return code.count == 6
        default: return false
        }
    }

    func openTelegram() {
        let botUsername = APIService.shared.botUsername

        // Deep link with auth token
        if !telegramToken.isEmpty,
           let url = URL(string: "tg://resolve?domain=\(botUsername)&start=\(telegramToken)"),
           UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url)
            return
        }

        // Fallback to web
        if !telegramToken.isEmpty,
           let url = URL(string: "https://t.me/\(botUsername)?start=\(telegramToken)") {
            UIApplication.shared.open(url)
            return
        }

        // No token yet - just open bot
        if let url = URL(string: "https://t.me/\(botUsername)") {
            UIApplication.shared.open(url)
        }
    }

    func nextStep() {
        error = ""

        if step == 0 {
            // Send OTP and get telegram token
            sendOTP()
            return
        }

        if step == 1 {
            // Call /check to process Telegram updates and send code
            checkTelegram()
            return
        }

        if step == 2 {
            verifyCode()
        }
    }

    func sendOTP() {
        loading = true
        Task {
            do {
                let response = try await APIService.shared.sendOtp(phone: phone)
                await MainActor.run {
                    loading = false
                    if let token = response.telegramToken {
                        telegramToken = token
                    }
                    step = 1
                }
            } catch {
                await MainActor.run {
                    loading = false
                    self.error = error.localizedDescription
                }
            }
        }
    }

    func checkTelegram() {
        loading = true
        Task {
            do {
                let codeSent = try await APIService.shared.checkTelegram(telegramToken: telegramToken)
                await MainActor.run {
                    loading = false
                    step = 2
                }
            } catch {
                await MainActor.run {
                    loading = false
                    step = 2 // Go to code step anyway
                }
            }
        }
    }

    func verifyCode() {
        loading = true
        Task {
            do {
                let response = try await APIService.shared.verifyOtp(
                    phone: phone, otp: code, name: name, city: city
                )
                await MainActor.run {
                    loading = false
                    if let apiUser = response.user {
                        state.user = AppUser(
                            name: apiUser.name ?? name,
                            email: "",
                            phone: phone,
                            city: apiUser.city ?? city
                        )
                    } else {
                        state.user = AppUser(name: name, email: "", phone: phone, city: city)
                    }
                    state.saveUser()
                    presentationMode.wrappedValue.dismiss()
                }
            } catch {
                await MainActor.run {
                    loading = false
                    self.error = error.localizedDescription
                }
            }
        }
    }
}
