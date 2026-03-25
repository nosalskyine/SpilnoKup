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
                        Text("Створити акаунт")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(state.theme.accent)
                            .cornerRadius(14)
                    }

                    Button(action: { showRegister = true }) {
                        Text("Увійти")
                            .font(.headline)
                            .foregroundColor(state.theme.accent)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(state.theme.card)
                            .cornerRadius(14)
                            .overlay(
                                RoundedRectangle(cornerRadius: 14)
                                    .stroke(state.theme.accent.opacity(0.3), lineWidth: 1)
                            )
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

    var body: some View {
        ZStack {
            state.theme.bg.ignoresSafeArea()

            VStack(spacing: 20) {
                HStack {
                    if step > 0 {
                        Button(action: { step -= 1 }) {
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
                            stepOneView
                        } else if step == 1 {
                            stepTwoView
                        } else {
                            stepThreeView
                        }
                    }
                    .padding()
                }

                Spacer()

                Button(action: nextStep) {
                    Text(step == 2 ? "Підтвердити" : "Далі")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(canProceed ? state.theme.accent : state.theme.cardAlt)
                        .cornerRadius(14)
                }
                .disabled(!canProceed)
                .padding(.horizontal)
                .padding(.bottom, 20)
            }
        }
    }

    var stepOneView: some View {
        VStack(spacing: 14) {
            Text("Реєстрація")
                .font(.title2.bold())
                .foregroundColor(state.theme.text)

            ThemedTextField(placeholder: "Ваше ім'я", text: $name, icon: "👤")
            ThemedTextField(placeholder: "+380...", text: $phone, icon: "📱")
        }
    }

    var stepTwoView: some View {
        VStack(spacing: 14) {
            Text("Ваше місто")
                .font(.title2.bold())
                .foregroundColor(state.theme.text)

            ThemedTextField(placeholder: "Введіть місто", text: $city, icon: "📍")

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

    var stepThreeView: some View {
        VStack(spacing: 14) {
            Text("Підтвердження")
                .font(.title2.bold())
                .foregroundColor(state.theme.text)

            Text("Код надіслано на \(phone)")
                .font(.subheadline)
                .foregroundColor(state.theme.textSec)

            HStack(spacing: 10) {
                ForEach(0..<6, id: \.self) { i in
                    let char = i < code.count ? String(code[code.index(code.startIndex, offsetBy: i)]) : ""
                    Text(char)
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(state.theme.text)
                        .frame(width: 42, height: 50)
                        .background(state.theme.cardAlt)
                        .cornerRadius(12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(char.isEmpty ? state.theme.border : state.theme.accent, lineWidth: 2)
                        )
                }
            }

            TextField("Введіть 6-значний код", text: $code)
                .keyboardType(.numberPad)
                .foregroundColor(state.theme.text)
                .padding(12)
                .background(state.theme.cardAlt)
                .cornerRadius(12)
                .onChange(of: code) { newValue in
                    code = String(newValue.prefix(6).filter { $0.isNumber })
                }
        }
    }

    var canProceed: Bool {
        switch step {
        case 0: return !name.isEmpty && !phone.isEmpty
        case 1: return !city.isEmpty
        case 2: return code.count == 6
        default: return false
        }
    }

    func nextStep() {
        if step < 2 {
            step += 1
        } else {
            state.user = AppUser(name: name, email: "", phone: phone, city: city)
            state.saveUser()
            presentationMode.wrappedValue.dismiss()
        }
    }
}
