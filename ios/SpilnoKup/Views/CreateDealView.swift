import SwiftUI

struct CreateDealView: View {
    @EnvironmentObject var state: AppState
    @Environment(\.presentationMode) var presentationMode
    @State private var title = ""
    @State private var groupPrice = ""
    @State private var retailPrice = ""
    @State private var category: DealCategory = .farm
    @State private var unit = "кг"
    @State private var needed = ""
    @State private var minQty = "1"
    @State private var maxQty = "10"
    @State private var days = "7"
    @State private var city = ""
    @State private var desc = ""
    @State private var tags = ""
    @State private var isPublishing = false
    @State private var publishError: String? = nil

    var canPublish: Bool {
        !title.isEmpty && !groupPrice.isEmpty && !retailPrice.isEmpty && !city.isEmpty && !desc.isEmpty
    }

    var body: some View {
        NavigationStack {
            ZStack {
                state.theme.bg.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        Group {
                        // Photo placeholder
                        ZStack {
                            RoundedRectangle(cornerRadius: 10)
                                .strokeBorder(state.theme.textMuted, style: StrokeStyle(lineWidth: 2, dash: [8]))
                                .frame(height: 120)
                            VStack(spacing: 8) {
                                Image(systemName: "camera.fill")
                                    .font(.title)
                                    .foregroundColor(state.theme.textMuted)
                                Text("Додати фото")
                                    .font(.caption)
                                    .foregroundColor(state.theme.textMuted)
                            }
                        }

                        Group {
                            ThemedTextField(placeholder: "Назва товару", text: $title, icon: "shippingbox.fill")

                            HStack(spacing: 12) {
                                ThemedTextField(placeholder: "Гурт", text: $groupPrice, icon: "banknote.fill")
                                ThemedTextField(placeholder: "Роздрiб", text: $retailPrice, icon: "tag.fill")
                            }
                        }

                        // Category
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Категорiя")
                                .font(.subheadline)
                                .foregroundColor(state.theme.textSec)
                            LazyVGrid(columns: [GridItem(.adaptive(minimum: 90))], spacing: 6) {
                                ForEach(DealCategory.allCases.filter { $0 != .all }, id: \.self) { cat in
                                    Button(action: { category = cat }) {
                                        Text(cat.label)
                                            .font(.caption2)
                                            .foregroundColor(category == cat ? state.theme.bg : state.theme.textSec)
                                            .padding(.horizontal, 8)
                                            .padding(.vertical, 6)
                                            .frame(maxWidth: .infinity)
                                            .background(category == cat ? state.theme.accent : state.theme.cardAlt)
                                            .cornerRadius(8)
                                    }
                                }
                            }
                        }

                        } // end first Group
                        Group {
                        HStack(spacing: 12) {
                            ThemedTextField(placeholder: "Одиниця", text: $unit, icon: "scalemass.fill")
                            ThemedTextField(placeholder: "Учасникiв", text: $needed, icon: "person.2.fill")
                        }

                        HStack(spacing: 12) {
                            ThemedTextField(placeholder: "Мiн.", text: $minQty)
                            ThemedTextField(placeholder: "Макс.", text: $maxQty)
                            ThemedTextField(placeholder: "Днiв", text: $days, icon: "calendar")
                        }

                        ThemedTextField(placeholder: "Мiсто", text: $city, icon: "mappin.and.ellipse")

                        // City quick select
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 6) {
                                ForEach(SampleData.cities.prefix(5), id: \.self) { c in
                                    Button(action: { city = c }) {
                                        Text(c)
                                            .font(.caption2)
                                            .foregroundColor(city == c ? state.theme.bg : state.theme.textMuted)
                                            .padding(.horizontal, 8)
                                            .padding(.vertical, 4)
                                            .background(city == c ? state.theme.accent : state.theme.cardAlt)
                                            .cornerRadius(6)
                                    }
                                }
                            }
                        }

                        VStack(alignment: .leading, spacing: 6) {
                            Text("Опис")
                                .font(.subheadline)
                                .foregroundColor(state.theme.textSec)
                            TextEditor(text: $desc)
                                .foregroundColor(state.theme.text)
                                .frame(height: 80)
                                .padding(8)
                                .background(state.theme.cardAlt)
                                .cornerRadius(10)
                                .scrollContentBackground(.hidden)
                        }

                        ThemedTextField(placeholder: "Теги (через кому)", text: $tags, icon: "tag.fill")

                        // Error message
                        if let error = publishError {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(Color(hex: "ef4444"))
                        }

                        Button(action: publish) {
                            HStack {
                                if isPublishing {
                                    ProgressView()
                                        .tint(state.theme.bg)
                                }
                                Text("Опублiкувати")
                                    .font(.headline)
                            }
                            .foregroundColor(state.theme.bg)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(canPublish && !isPublishing ? state.theme.accent : state.theme.cardAlt)
                            .cornerRadius(10)
                        }
                        .disabled(!canPublish || isPublishing)
                        } // end second Group
                    }
                    .padding()
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle("Нова угода")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Скасувати") { presentationMode.wrappedValue.dismiss() }
                        .foregroundColor(state.theme.accent)
                }
            }
        }
    }

    func publish() {
        isPublishing = true
        publishError = nil

        let deal = Deal(
            id: Int(Date().timeIntervalSince1970),
            cat: category,
            seller: state.user?.name ?? "Продавець",
            avatar: category.icon,
            city: city,
            rating: 5.0,
            dealCount: 0,
            title: title,
            unit: unit,
            retail: Int(retailPrice) ?? 0,
            group: Int(groupPrice) ?? 0,
            minQty: Int(minQty) ?? 1,
            maxQty: Int(maxQty) ?? 10,
            joined: 0,
            needed: Int(needed) ?? 10,
            days: Int(days) ?? 7,
            desc: desc,
            tags: tags.components(separatedBy: ",").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty },
            hot: false
        )

        // addDeal will both add locally and push to API
        state.addDeal(deal)

        isPublishing = false
        presentationMode.wrappedValue.dismiss()
    }
}
