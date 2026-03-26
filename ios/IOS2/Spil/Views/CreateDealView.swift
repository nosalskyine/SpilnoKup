import SwiftUI

struct CreateDealView: View {
    var onDone: () -> Void
    @EnvironmentObject var api: APIService
    @State private var title = ""
    @State private var desc = ""
    @State private var category = "food"
    @State private var retail = ""
    @State private var group = ""
    @State private var unit = "шт"
    @State private var minQty = "1"
    @State private var maxQty = "10"
    @State private var needed = "20"
    @State private var days = "7"
    @State private var city = ""
    @State private var autoConfirm = false
    @State private var saving = false
    @State private var error = ""

    let units = ["шт","кг","л","набір","пачка","лоток","банка","упаковка","сеанс","пара"]
    let categories = [("food","Їжа"),("meat","М'ясо"),("vegetables","Городина"),("dairy","Молочне"),("bakery","Випічка"),("drinks","Напої"),("sport","Спорт"),("electronics","Електроніка"),("services","Послуги"),("clothing","Одяг"),("handmade","Handmade"),("beauty","Краса"),("home","Дім")]

    var canSave: Bool { !title.isEmpty && !group.isEmpty && !retail.isEmpty && !city.isEmpty && !desc.isEmpty }

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                HStack {
                    Button { onDone() } label: { Image(systemName: "arrow.left").foregroundColor(AppTheme.accent) }
                    Text("Нове оголошення").font(.system(size: 20, weight: .heavy)).foregroundColor(.white)
                    Spacer()
                }

                Group {
                    label("Назва", required: true)
                    TextField("", text: $title, prompt: Text("Мед акацієвий 1л").foregroundColor(AppTheme.textMuted))
                        .foregroundColor(.white).modifier(InputStyle())

                    label("Категорія", required: true)
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack { ForEach(categories, id: \.0) { cat in
                            Button(cat.1) { category = cat.0; UIImpactFeedbackGenerator(style: .light).impactOccurred() }
                                .font(.system(size: 11)).padding(.horizontal, 10).padding(.vertical, 6)
                                .background(category == cat.0 ? AppTheme.accent : AppTheme.cardAlt)
                                .foregroundColor(category == cat.0 ? .black : AppTheme.textSec).cornerRadius(8)
                        }}
                    }

                    label("Ціна (₴)", required: true)
                    HStack(spacing: 8) {
                        TextField("", text: $group, prompt: Text("Групова").foregroundColor(AppTheme.textMuted))
                            .keyboardType(.numberPad).foregroundColor(.white).modifier(InputStyle())
                        TextField("", text: $retail, prompt: Text("Роздрібна").foregroundColor(AppTheme.textMuted))
                            .keyboardType(.numberPad).foregroundColor(.white).modifier(InputStyle())
                    }

                    label("Одиниця")
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack { ForEach(units, id: \.self) { u in
                            Button(u) { unit = u } .font(.system(size: 11)).padding(.horizontal, 10).padding(.vertical, 6)
                                .background(unit == u ? AppTheme.accent : AppTheme.cardAlt)
                                .foregroundColor(unit == u ? .black : AppTheme.textSec).cornerRadius(8)
                        }}
                    }

                    HStack(spacing: 8) {
                        VStack(alignment: .leading) { label("Учасників"); TextField("", text: $needed, prompt: Text("20").foregroundColor(AppTheme.textMuted)).keyboardType(.numberPad).foregroundColor(.white).modifier(InputStyle()) }
                        VStack(alignment: .leading) { label("Днів"); TextField("", text: $days, prompt: Text("7").foregroundColor(AppTheme.textMuted)).keyboardType(.numberPad).foregroundColor(.white).modifier(InputStyle()) }
                    }

                    label("Опис", required: true)
                    TextField("", text: $desc, prompt: Text("Опис товару...").foregroundColor(AppTheme.textMuted), axis: .vertical)
                        .lineLimit(3...6).foregroundColor(.white).modifier(InputStyle())

                    label("Місто", required: true)
                    TextField("", text: $city, prompt: Text("Вінниця").foregroundColor(AppTheme.textMuted))
                        .foregroundColor(.white).modifier(InputStyle())

                    Toggle("Автопідтвердження видачі", isOn: $autoConfirm)
                        .foregroundColor(.white).tint(AppTheme.accent)
                }

                if !error.isEmpty { Text(error).font(.caption).foregroundColor(.red) }

                Button(saving ? "Публікуємо..." : "Опублікувати") { publish() }
                    .disabled(!canSave || saving)
                    .frame(maxWidth: .infinity).padding(16)
                    .background(canSave ? LinearGradient(colors: [AppTheme.accent, AppTheme.green], startPoint: .leading, endPoint: .trailing) : LinearGradient(colors: [AppTheme.cardAlt, AppTheme.cardAlt], startPoint: .leading, endPoint: .trailing))
                    .foregroundColor(canSave ? .black : AppTheme.textMuted).fontWeight(.bold)
                    .cornerRadius(14)
            }.padding(16)
        }.background(AppTheme.bg)
    }

    func label(_ text: String, required: Bool = false) -> some View {
        HStack(spacing: 2) {
            Text(text).font(.system(size: 12, weight: .bold)).foregroundColor(.white)
            if required { Text("*").foregroundColor(.red) }
            Spacer()
        }
    }

    func publish() {
        saving = true; error = ""
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        Task {
            do {
                let deadline = Calendar.current.date(byAdding: .day, value: Int(days) ?? 7, to: Date())!
                let req = CreateDealRequest(title: title, description: desc, category: category,
                    retailPrice: Double(retail) ?? 0, groupPrice: Double(group) ?? 0, unit: unit,
                    minQty: Int(minQty) ?? 1, maxQty: Int(maxQty) ?? 10, needed: Int(needed) ?? 20,
                    deadline: ISO8601DateFormatter().string(from: deadline), tags: ["Самовивіз"], city: city, autoConfirm: autoConfirm)
                let _ = try await api.createDeal(req)
                UINotificationFeedbackGenerator().notificationOccurred(.success)
                try? await api.fetchDeals()
                onDone()
            } catch { self.error = error.localizedDescription }
            saving = false
        }
    }
}
