import SwiftUI

struct AuthView: View {
    @EnvironmentObject var auth: AuthManager
    @EnvironmentObject var api: APIService
    @State private var mode = "" // "", "register", "login"
    @State private var phone = ""
    @State private var name = ""
    @State private var city = ""
    @State private var otp = ""
    @State private var step = 0
    @State private var tgToken = ""
    @State private var loading = false
    @State private var error = ""

    let cities = ["Київ","Харків","Одеса","Дніпро","Львів","Запоріжжя","Вінниця","Полтава","Черкаси"]

    var body: some View {
        ZStack {
            AppTheme.bg.ignoresSafeArea()

            if mode.isEmpty {
                welcomeView
            } else if mode == "register" {
                registerView
            } else {
                loginView
            }
        }
    }

    var welcomeView: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "person.2.fill")
                .font(.system(size: 40))
                .foregroundColor(AppTheme.accent)
                .padding(20)
                .background(AppTheme.accent.opacity(0.15))
                .clipShape(RoundedRectangle(cornerRadius: 16))

            Text("Spil")
                .font(.system(size: 28, weight: .heavy))
                .foregroundColor(.white)

            Text("Платформа спільних покупок\nвід малого бізнесу України")
                .font(.system(size: 14))
                .foregroundColor(AppTheme.textSec)
                .multilineTextAlignment(.center)

            Spacer()

            Button("Створити акаунт") { mode = "register" }
                .frame(maxWidth: .infinity).padding(14)
                .background(AppTheme.accent)
                .foregroundColor(.black).fontWeight(.bold)
                .cornerRadius(12)

            Button("Увійти") { mode = "login" }
                .frame(maxWidth: .infinity).padding(14)
                .background(AppTheme.blue)
                .foregroundColor(.white).fontWeight(.bold)
                .cornerRadius(12)

            Button("Переглянути як гість") {
                auth.login(user: UserProfile(id: "guest", name: "Гість"))
            }
            .font(.system(size: 13))
            .foregroundColor(AppTheme.textSec)
            .padding(.top, 4)

            Spacer().frame(height: 20)
        }
        .padding(32)
    }

    var registerView: some View {
        VStack(spacing: 16) {
            HStack {
                Button(action: { step > 0 ? (step -= 1) : (mode = "") }) {
                    Image(systemName: "arrow.left").foregroundColor(AppTheme.accent)
                }
                Spacer()
            }.padding(.top)

            if step == 0 {
                Text("Реєстрація").font(.title2.bold()).foregroundColor(.white)
                TextField("", text: $phone, prompt: Text("+380...").foregroundColor(AppTheme.textMuted))
                    .keyboardType(.phonePad).modifier(InputStyle())
                TextField("", text: $name, prompt: Text("Ваше ім'я").foregroundColor(AppTheme.textMuted))
                    .modifier(InputStyle())
                TextField("", text: $city, prompt: Text("Місто").foregroundColor(AppTheme.textMuted))
                    .modifier(InputStyle())
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack { ForEach(cities, id: \.self) { c in
                        Button(c) { city = c; UIImpactFeedbackGenerator(style: .light).impactOccurred() }
                            .font(.system(size: 11)).padding(.horizontal, 10).padding(.vertical, 6)
                            .background(city == c ? AppTheme.accent : AppTheme.cardAlt)
                            .foregroundColor(city == c ? .black : AppTheme.textSec)
                            .cornerRadius(8)
                    }}
                }
                Spacer()
                if !error.isEmpty { Text(error).font(.caption).foregroundColor(.red) }
                Button(loading ? "Зачекайте..." : "Далі") { sendCode(mode: "register") }
                    .disabled(phone.isEmpty || name.isEmpty || city.isEmpty || loading)
                    .modifier(PrimaryButton())
            } else if step == 1 {
                telegramStep
            } else {
                otpStep(buttonText: "Зареєструватись", authMode: "register")
            }
        }.padding(24)
    }

    var loginView: some View {
        VStack(spacing: 16) {
            HStack {
                Button(action: { step > 0 ? (step -= 1) : (mode = "") }) {
                    Image(systemName: "arrow.left").foregroundColor(AppTheme.accent)
                }
                Spacer()
            }.padding(.top)

            if step == 0 {
                Text("Вхід").font(.title2.bold()).foregroundColor(.white)
                TextField("", text: $phone, prompt: Text("+380...").foregroundColor(AppTheme.textMuted))
                    .keyboardType(.phonePad).modifier(InputStyle())
                Spacer()
                if !error.isEmpty { Text(error).font(.caption).foregroundColor(.red) }
                Button(loading ? "Зачекайте..." : "Далі") { sendCode(mode: "login") }
                    .disabled(phone.isEmpty || loading)
                    .modifier(PrimaryButton())
            } else if step == 1 {
                telegramStep
            } else {
                otpStep(buttonText: "Увійти", authMode: "login")
            }
        }.padding(24)
    }

    var telegramStep: some View {
        VStack(spacing: 16) {
            Text("Отримайте код").font(.title2.bold()).foregroundColor(.white)
            Image(systemName: "paperplane.fill")
                .font(.system(size: 50)).foregroundColor(AppTheme.accent)
                .padding(30)
            Text("Натисніть кнопку — відкриється Telegram.\nНатисніть Start — бот надішле код.")
                .font(.system(size: 13)).foregroundColor(AppTheme.textSec)
                .multilineTextAlignment(.center)
            Link(destination: URL(string: "https://t.me/spilnokupbot?start=\(tgToken)")!) {
                Text("Відкрити Telegram")
                    .frame(maxWidth: .infinity).padding(14)
                    .background(AppTheme.blue)
                    .foregroundColor(.white).fontWeight(.bold)
                    .cornerRadius(12)
            }
            Button("Я отримав код") { step = 2; UIImpactFeedbackGenerator(style: .light).impactOccurred() }
                .modifier(PrimaryButton())
        }
    }

    func otpStep(buttonText: String, authMode: String) -> some View {
        VStack(spacing: 16) {
            Text("Введіть код").font(.title2.bold()).foregroundColor(.white)
            HStack {
                Text("✈️").font(.title3)
                Text("Код надіслано в Telegram").font(.caption).foregroundColor(AppTheme.green)
            }.padding(10).background(AppTheme.green.opacity(0.1)).cornerRadius(10)

            TextField("", text: $otp, prompt: Text("6-значний код").foregroundColor(AppTheme.textMuted))
                .keyboardType(.numberPad).modifier(InputStyle())
                .font(.system(size: 24, weight: .bold)).multilineTextAlignment(.center)

            if !error.isEmpty { Text(error).font(.caption).foregroundColor(.red) }

            Button(loading ? "Перевіряємо..." : buttonText) { verify(mode: authMode) }
                .disabled(otp.count < 6 || loading)
                .modifier(PrimaryButton())
        }
    }

    func sendCode(mode: String) {
        loading = true; error = ""
        Task {
            do {
                let resp = try await api.sendOtp(phone: phone)
                tgToken = resp.telegramToken ?? ""
                if let code = resp.otp { otp = code }
                step = 1
            } catch { self.error = error.localizedDescription }
            loading = false
        }
    }

    func verify(mode: String) {
        loading = true; error = ""
        Task {
            do {
                let resp = try await api.verifyOtp(phone: phone, otp: otp, name: name.isEmpty ? nil : name, city: city.isEmpty ? nil : city, mode: mode)
                if let u = resp.user { auth.login(user: u) }
            } catch { self.error = error.localizedDescription }
            loading = false
        }
    }
}

struct InputStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(14).background(AppTheme.card)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(AppTheme.border, lineWidth: 1))
            .cornerRadius(10).foregroundColor(.white)
    }
}

struct PrimaryButton: ViewModifier {
    func body(content: Content) -> some View {
        content
            .frame(maxWidth: .infinity).padding(14)
            .background(AppTheme.accent)
            .foregroundColor(.black).fontWeight(.bold)
            .cornerRadius(12)
    }
}
