import SwiftUI

struct WelcomeView: View {
    @EnvironmentObject var state: AppState
    @State private var showRegister = false
    @State private var showLogin = false

    var body: some View {
        ZStack {
            state.theme.bg.ignoresSafeArea()

            VStack(spacing: 24) {
                Spacer()

                // Logo: accent rounded rect with person.2.fill icon (64x64)
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(state.theme.accent)
                        .frame(width: 64, height: 64)
                    Image(systemName: "person.2.fill")
                        .font(.system(size: 28))
                        .foregroundColor(state.theme.bg)
                }

                VStack(spacing: 8) {
                    Text("СпiльноКуп")
                        .font(.system(size: 26, weight: .heavy))
                        .foregroundColor(state.theme.text)

                    Text("Платформа спiльних покупок\nвiд малого бiзнесу України")
                        .font(.system(size: 14))
                        .foregroundColor(state.theme.textSec)
                        .multilineTextAlignment(.center)
                }

                Spacer()

                VStack(spacing: 10) {
                    // Button 1: "Створити акаунт" (accent bg)
                    Button(action: { showRegister = true }) {
                        Text("Створити акаунт")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(state.theme.bg)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(state.theme.accent)
                            .cornerRadius(10)
                    }

                    // Button 2: "Увійти" (blue #0088cc bg)
                    Button(action: { showLogin = true }) {
                        Text("Увiйти")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Color(hex: "0088cc"))
                            .cornerRadius(10)
                    }

                    // Button 3: "Переглянути як гість" (transparent, border)
                    Button(action: { state.isGuest = true }) {
                        Text("Переглянути як гiсть")
                            .font(.system(size: 13))
                            .foregroundColor(state.theme.textSec)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 13)
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(state.theme.border, lineWidth: 1))
                    }
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 40)
            }
        }
        .sheet(isPresented: $showRegister) {
            RegisterView()
                .environmentObject(state)
        }
        .sheet(isPresented: $showLogin) {
            LoginView()
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
                    .foregroundColor(state.theme.bg)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(canProceed ? state.theme.accent : state.theme.cardAlt)
                    .cornerRadius(10)
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
            Text("Вхiд / Реєстрацiя")
                .font(.title2.bold())
                .foregroundColor(state.theme.text)

            ThemedTextField(placeholder: "+380...", text: $phone, icon: "phone.fill")
            ThemedTextField(placeholder: "Ваше iм'я", text: $name, icon: "person.fill")
            ThemedTextField(placeholder: "Мiсто", text: $city, icon: "mappin.and.ellipse")

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                ForEach(SampleData.cities, id: \.self) { c in
                    Button(action: { city = c }) {
                        Text(c)
                            .font(.caption)
                            .foregroundColor(city == c ? state.theme.bg : state.theme.textSec)
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

            Text("Натиснiть кнопку нижче, вiдкриється Telegram.\nНатиснiть Start -- бот надiшле код.")
                .font(.subheadline)
                .foregroundColor(state.theme.textSec)
                .multilineTextAlignment(.center)

            ZStack {
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(hex: "0088cc"))
                    .frame(width: 80, height: 80)
                Image(systemName: "paperplane.fill")
                    .font(.system(size: 36))
                    .foregroundColor(.white)
            }
            .padding(.vertical, 8)

            Button(action: openTelegram) {
                HStack(spacing: 8) {
                    Image(systemName: "paperplane.fill")
                    Text("Вiдкрити Telegram")
                }
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color(hex: "0088cc"))
                .cornerRadius(10)
            }

            VStack(spacing: 6) {
                Text("1. Натиснiть Start в ботi")
                Text("2. Бот надiшле 6-значний код")
                Text("3. Введiть код на наступному кроцi")
            }
            .font(.caption)
            .foregroundColor(state.theme.textMuted)
        }
    }

    // MARK: - Step 3: Enter Code

    var stepCodeView: some View {
        VStack(spacing: 14) {
            Text("Введiть код")
                .font(.title2.bold())
                .foregroundColor(state.theme.text)

            HStack(spacing: 6) {
                Image(systemName: "paperplane.fill")
                    .foregroundColor(Color(hex: "0088cc"))
                Text("Код надiслано в Telegram")
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
                .cornerRadius(10)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(code.isEmpty ? state.theme.border : state.theme.accent, lineWidth: 2)
                )
                .onChange(of: code) { newValue in
                    code = String(newValue.prefix(6).filter { $0.isNumber })
                }

            Text("Введiть 6-значний код з Telegram")
                .font(.caption)
                .foregroundColor(state.theme.textMuted)
        }
    }

    // MARK: - Logic

    var buttonTitle: String {
        switch step {
        case 0: return loading ? "Зачекайте..." : "Далi"
        case 1: return "Я отримав код"
        case 2: return loading ? "Перевiряємо..." : "Пiдтвердити"
        default: return "Далi"
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
        if !telegramToken.isEmpty,
           let url = URL(string: "tg://resolve?domain=\(botUsername)&start=\(telegramToken)"),
           UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url)
            return
        }
        if !telegramToken.isEmpty,
           let url = URL(string: "https://t.me/\(botUsername)?start=\(telegramToken)") {
            UIApplication.shared.open(url)
            return
        }
        if let url = URL(string: "https://t.me/\(botUsername)") {
            UIApplication.shared.open(url)
        }
    }

    func nextStep() {
        error = ""
        if step == 0 {
            sendOTP()
            return
        }
        if step == 1 {
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
                let _ = try await APIService.shared.checkTelegram(telegramToken: telegramToken)
                await MainActor.run {
                    loading = false
                    step = 2
                }
            } catch {
                await MainActor.run {
                    loading = false
                    step = 2
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
                        state.saveAPIUser(apiUser)
                    } else {
                        state.user = AppUser(name: name, email: "", phone: phone, city: city)
                    }
                    state.saveUser()
                    state.loadDeals()
                    state.loadWallet()
                    state.loadConversations()
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

// MARK: - Login View (phone only)

struct LoginView: View {
    @EnvironmentObject var state: AppState
    @Environment(\.presentationMode) var presentationMode
    @State private var step = 0
    @State private var phone = ""
    @State private var code = ""
    @State private var tgToken = ""
    @State private var loading = false
    @State private var error = ""

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
                }
                .padding(.horizontal)
                .padding(.top, 20)

                ScrollView {
                    VStack(spacing: 16) {
                        if step == 0 {
                            loginStep0
                        } else if step == 1 {
                            loginStep1
                        } else {
                            loginStep2
                        }
                    }
                    .padding()
                }

                Spacer()
                if !error.isEmpty {
                    Text(error).font(.caption).foregroundColor(.red).padding(.horizontal)
                }
                Button(action: nextStep) {
                    HStack {
                        if loading { ProgressView().tint(.white) }
                        Text(step == 0 ? "Далi" : step == 1 ? "Я отримав код" : "Увiйти")
                            .font(.headline)
                    }
                    .foregroundColor(state.theme.bg)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(state.theme.accent)
                    .cornerRadius(10)
                }
                .padding(.horizontal)
                .padding(.bottom, 20)
            }
        }
    }

    var loginStep0: some View {
        VStack(spacing: 14) {
            Text("Вхiд")
                .font(.title2.bold())
                .foregroundColor(state.theme.text)
            Text("Введiть номер телефону")
                .font(.subheadline)
                .foregroundColor(state.theme.textSec)
            ThemedTextField(placeholder: "+380...", text: $phone)
        }
    }

    var loginStep1: some View {
        VStack(spacing: 18) {
            Text("Отримайте код")
                .font(.title2.bold())
                .foregroundColor(state.theme.text)
            Image(systemName: "paperplane.fill")
                .font(.system(size: 40))
                .foregroundColor(state.theme.accent)
                .padding()
            Text("Вiдкрийте Telegram та натиснiть Start")
                .font(.subheadline)
                .foregroundColor(state.theme.textSec)
                .multilineTextAlignment(.center)
            Button(action: openTelegram) {
                Text("Вiдкрити Telegram")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color(hex: "0088cc"))
                    .cornerRadius(10)
            }
        }
    }

    var loginStep2: some View {
        VStack(spacing: 14) {
            Text("Введiть код")
                .font(.title2.bold())
                .foregroundColor(state.theme.text)
            TextField("000000", text: $code)
                .keyboardType(.numberPad)
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(state.theme.text)
                .multilineTextAlignment(.center)
                .padding(16)
                .background(state.theme.cardAlt)
                .cornerRadius(10)
                .onChange(of: code) { v in code = String(v.prefix(6).filter { $0.isNumber }) }
        }
    }

    func openTelegram() {
        let bot = APIService.shared.botUsername
        if !tgToken.isEmpty, let url = URL(string: "tg://resolve?domain=\(bot)&start=\(tgToken)"),
           UIApplication.shared.canOpenURL(url) { UIApplication.shared.open(url); return }
        if !tgToken.isEmpty, let url = URL(string: "https://t.me/\(bot)?start=\(tgToken)") { UIApplication.shared.open(url) }
    }

    func nextStep() {
        error = ""
        if step == 0 {
            guard !phone.isEmpty else { error = "Введiть телефон"; return }
            loading = true
            Task {
                do {
                    let res = try await APIService.shared.sendOtp(phone: phone)
                    await MainActor.run { tgToken = res.telegramToken ?? ""; loading = false; step = 1 }
                } catch { await MainActor.run { loading = false; self.error = error.localizedDescription } }
            }
        } else if step == 1 {
            step = 2
        } else {
            guard code.count == 6 else { error = "Введiть 6-значний код"; return }
            loading = true
            Task {
                do {
                    let res = try await APIService.shared.verifyOtp(phone: phone, otp: code, name: "", city: "")
                    await MainActor.run {
                        loading = false
                        state.user = AppUser(name: res.user?.name ?? "", email: "", phone: phone, city: res.user?.city ?? "")
                        if let apiUser = res.user {
                            state.saveAPIUser(apiUser)
                        }
                        state.saveUser()
                        state.loadDeals()
                        state.loadWallet()
                        state.loadConversations()
                        presentationMode.wrappedValue.dismiss()
                    }
                } catch { await MainActor.run { loading = false; self.error = error.localizedDescription } }
            }
        }
    }
}
