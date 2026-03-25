import SwiftUI

struct WalletView: View {
    @EnvironmentObject var state: AppState
    @State private var showEditProfile = false
    @State private var showTopUp = false
    @State private var showWithdraw = false
    @State private var topUpAmount = ""
    @State private var withdrawAmount = ""
    @State private var showSuccess = false
    @State private var successMessage = ""

    var body: some View {
        NavigationStack {
            ZStack {
                state.theme.bg.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        profileCard
                        balanceCard
                        themeSection
                        transactionsSection
                        fopSection
                        logoutButton
                    }
                    .padding(.top, 8)
                    .padding(.bottom, 20)
                }

                if showSuccess {
                    successOverlay
                }
            }
            .navigationTitle("Гаманець")
            .sheet(isPresented: $showEditProfile) {
                editProfileSheet
            }
        }
    }

    // MARK: - Profile Card

    var profileCard: some View {
        HStack(spacing: 14) {
            // Avatar with initials
            ZStack {
                Circle()
                    .fill(state.theme.accent)
                    .frame(width: 56, height: 56)
                Text(initials)
                    .font(.title3.bold())
                    .foregroundColor(.white)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(state.user?.name ?? "Гість")
                    .font(.headline)
                    .foregroundColor(state.theme.text)
                Text(state.user?.email ?? "")
                    .font(.caption)
                    .foregroundColor(state.theme.textSec)
            }

            Spacer()

            if state.user != nil {
                Button(action: { showEditProfile = true }) {
                    Image(systemName: "pencil.circle")
                        .font(.title2)
                        .foregroundColor(state.theme.accent)
                }
            }
        }
        .padding(14)
        .background(state.theme.card)
        .cornerRadius(14)
        .padding(.horizontal)
    }

    var initials: String {
        guard let name = state.user?.name else { return "?" }
        let parts = name.components(separatedBy: " ")
        let first = parts.first?.prefix(1) ?? ""
        let last = parts.count > 1 ? parts[1].prefix(1) : ""
        return "\(first)\(last)".uppercased()
    }

    // MARK: - Balance Card

    var balanceCard: some View {
        VStack(spacing: 14) {
            VStack(spacing: 4) {
                Text("Баланс")
                    .font(.caption)
                    .foregroundColor(state.theme.textSec)
                Text("₴\(formattedBalance)")
                    .font(.system(size: 36, weight: .bold))
                    .foregroundColor(state.theme.green)
                Text("Доступно: ₴\(state.availableBalance)")
                    .font(.caption)
                    .foregroundColor(state.theme.textMuted)
            }

            HStack(spacing: 12) {
                Button(action: { showTopUp = true }) {
                    HStack {
                        Image(systemName: "plus.circle")
                        Text("Поповнити")
                    }
                    .font(.subheadline.bold())
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(state.theme.accent)
                    .cornerRadius(10)
                }

                Button(action: { showWithdraw = true }) {
                    HStack {
                        Image(systemName: "arrow.up.circle")
                        Text("Вивести")
                    }
                    .font(.subheadline.bold())
                    .foregroundColor(state.theme.accent)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(state.theme.card)
                    .cornerRadius(10)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(state.theme.accent.opacity(0.3), lineWidth: 1)
                    )
                }
            }

            // Quick amounts for top up
            if showTopUp {
                VStack(spacing: 8) {
                    HStack(spacing: 8) {
                        ForEach([100, 500, 1000, 5000], id: \.self) { amt in
                            Button(action: { topUpAmount = "\(amt)" }) {
                                Text("₴\(amt)")
                                    .font(.caption.bold())
                                    .foregroundColor(topUpAmount == "\(amt)" ? .white : state.theme.textSec)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 8)
                                    .background(topUpAmount == "\(amt)" ? state.theme.accent : state.theme.cardAlt)
                                    .cornerRadius(8)
                            }
                        }
                    }
                    HStack(spacing: 8) {
                        TextField("Сума", text: $topUpAmount)
                            .keyboardType(.numberPad)
                            .foregroundColor(state.theme.text)
                            .padding(10)
                            .background(state.theme.cardAlt)
                            .cornerRadius(8)
                        Button(action: doTopUp) {
                            Text("OK")
                                .font(.subheadline.bold())
                                .foregroundColor(.white)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 10)
                                .background(state.theme.accent)
                                .cornerRadius(8)
                        }
                    }
                }
            }

            if showWithdraw {
                HStack(spacing: 8) {
                    TextField("Сума", text: $withdrawAmount)
                        .keyboardType(.numberPad)
                        .foregroundColor(state.theme.text)
                        .padding(10)
                        .background(state.theme.cardAlt)
                        .cornerRadius(8)
                    Button(action: doWithdraw) {
                        Text("Вивести")
                            .font(.subheadline.bold())
                            .foregroundColor(.white)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .background(state.theme.accent)
                            .cornerRadius(8)
                    }
                }
            }
        }
        .padding(14)
        .background(state.theme.card)
        .cornerRadius(14)
        .padding(.horizontal)
    }

    var formattedBalance: String {
        let f = NumberFormatter()
        f.numberStyle = .decimal
        f.groupingSeparator = ","
        return f.string(from: NSNumber(value: state.balance)) ?? "\(state.balance)"
    }

    // MARK: - Theme

    var themeSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Тема оформлення")
                .font(.headline)
                .foregroundColor(state.theme.text)

            HStack(spacing: 8) {
                ForEach(ThemeType.allCases, id: \.self) { t in
                    Button(action: {
                        state.themeType = t
                        state.saveTheme()
                    }) {
                        HStack(spacing: 4) {
                            Text(t.emoji)
                            Text(t.name)
                                .font(.caption.bold())
                        }
                        .foregroundColor(state.themeType == t ? .white : state.theme.textSec)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(state.themeType == t ? state.theme.accent : state.theme.cardAlt)
                        .cornerRadius(10)
                    }
                }
            }
        }
        .padding(14)
        .background(state.theme.card)
        .cornerRadius(14)
        .padding(.horizontal)
    }

    // MARK: - Transactions

    var transactionsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Історія")
                .font(.headline)
                .foregroundColor(state.theme.text)

            ForEach(state.transactions) { tx in
                HStack(spacing: 10) {
                    Text(tx.type.icon)
                        .font(.title3)
                        .frame(width: 36, height: 36)
                        .background(state.theme.cardAlt)
                        .cornerRadius(18)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(tx.desc)
                            .font(.caption)
                            .foregroundColor(state.theme.text)
                            .lineLimit(1)
                        Text(tx.date)
                            .font(.system(size: 10))
                            .foregroundColor(state.theme.textMuted)
                    }

                    Spacer()

                    Text("\(tx.type == .withdrawal ? "-" : "+")₴\(tx.amount)")
                        .font(.subheadline.bold())
                        .foregroundColor(tx.type == .withdrawal ? state.theme.orange : state.theme.green)
                }
            }
        }
        .padding(14)
        .background(state.theme.card)
        .cornerRadius(14)
        .padding(.horizontal)
    }

    // MARK: - FOP details

    var fopSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Реквізити ФОП")
                .font(.headline)
                .foregroundColor(state.theme.text)

            fopRow("Назва", SampleData.seller.fop)
            fopRow("ІПН", SampleData.seller.ipn)
            fopRow("IBAN", SampleData.seller.iban)
            fopRow("Банк", SampleData.seller.bank)
        }
        .padding(14)
        .background(state.theme.card)
        .cornerRadius(14)
        .padding(.horizontal)
    }

    var logoutButton: some View {
        Button(action: {
            APIService.shared.logout()
            state.user = nil
            state.isGuest = false
            UserDefaults.standard.removeObject(forKey: "spilnokup_user")
        }) {
            HStack {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                Text("Вийти з акаунту")
            }
            .font(.subheadline.bold())
            .foregroundColor(Color(hex: "ef4444"))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color(hex: "ef4444").opacity(0.1))
            .cornerRadius(14)
        }
        .padding(.horizontal)
    }

    func fopRow(_ title: String, _ value: String) -> some View {
        HStack {
            Text(title)
                .font(.caption)
                .foregroundColor(state.theme.textMuted)
                .frame(width: 50, alignment: .leading)
            Text(value)
                .font(.caption)
                .foregroundColor(state.theme.textSec)
            Spacer()
        }
    }

    // MARK: - Edit Profile Sheet

    var editProfileSheet: some View {
        ZStack {
            state.theme.bg.ignoresSafeArea()
            VStack(spacing: 16) {
                Text("Редагувати профіль")
                    .font(.title2.bold())
                    .foregroundColor(state.theme.text)
                    .padding(.top, 20)

                VStack(spacing: 12) {
                    editField("Ім'я", text: Binding(
                        get: { state.user?.name ?? "" },
                        set: { state.user?.name = $0 }))
                    editField("Email", text: Binding(
                        get: { state.user?.email ?? "" },
                        set: { state.user?.email = $0 }))
                    editField("Телефон", text: Binding(
                        get: { state.user?.phone ?? "" },
                        set: { state.user?.phone = $0 }))
                    editField("Місто", text: Binding(
                        get: { state.user?.city ?? "" },
                        set: { state.user?.city = $0 }))
                }
                .padding(.horizontal)

                Button(action: {
                    state.saveUser()
                    showEditProfile = false
                }) {
                    Text("Зберегти")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(state.theme.accent)
                        .cornerRadius(14)
                }
                .padding(.horizontal)

                Spacer()
            }
        }
    }

    func editField(_ placeholder: String, text: Binding<String>) -> some View {
        TextField(placeholder, text: text)
            .foregroundColor(state.theme.text)
            .padding(12)
            .background(state.theme.cardAlt)
            .cornerRadius(12)
    }

    // MARK: - Actions

    func doTopUp() {
        guard let amt = Int(topUpAmount), amt > 0 else { return }
        state.topUp(amt)
        topUpAmount = ""
        showTopUp = false
        successMessage = "Поповнено ₴\(amt)!"
        showSuccessAnimation()
    }

    func doWithdraw() {
        guard let amt = Int(withdrawAmount), amt > 0, amt <= state.availableBalance else { return }
        state.withdraw(amt)
        withdrawAmount = ""
        showWithdraw = false
        successMessage = "Виведено ₴\(amt)!"
        showSuccessAnimation()
    }

    func showSuccessAnimation() {
        showSuccess = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            showSuccess = false
        }
    }

    var successOverlay: some View {
        VStack(spacing: 12) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 60))
                .foregroundColor(state.theme.green)
            Text(successMessage)
                .font(.title3.bold())
                .foregroundColor(state.theme.text)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(state.theme.bg.opacity(0.9))
        .transition(.opacity)
    }
}
