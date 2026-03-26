import SwiftUI
import MapKit

struct DealDetailView: View {
    let deal: Deal
    @EnvironmentObject var api: APIService
    @Environment(\.dismiss) var dismiss
    @State private var qty = 1
    @State private var joining = false
    @State private var error = ""
    @State private var qrToken = ""
    @State private var showQR = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 14) {
                    // Header
                    VStack(spacing: 8) {
                        HStack {
                            if deal.isHot == true {
                                Text("HOT").font(.system(size: 9, weight: .heavy))
                                    .foregroundColor(AppTheme.orange).padding(.horizontal, 6).padding(.vertical, 2)
                                    .background(AppTheme.orange.opacity(0.1)).cornerRadius(4)
                            }
                            Text("-\(deal.discount)%").font(.system(size: 10, weight: .bold))
                                .foregroundColor(AppTheme.accent).padding(.horizontal, 6).padding(.vertical, 2)
                                .background(AppTheme.accent.opacity(0.1)).cornerRadius(4)
                            Spacer()
                        }
                        Text(deal.title).font(.system(size: 22, weight: .heavy)).foregroundColor(.white).frame(maxWidth: .infinity, alignment: .leading)

                        // Seller
                        HStack(spacing: 10) {
                            Circle().fill(AppTheme.accent).frame(width: 40, height: 40)
                                .overlay(Text(String(deal.seller?.name?.prefix(1) ?? "?")).foregroundColor(.white).fontWeight(.bold))
                            VStack(alignment: .leading) {
                                Text(deal.seller?.name ?? "").font(.system(size: 14, weight: .bold)).foregroundColor(.white)
                                Text(deal.city ?? "").font(.system(size: 11)).foregroundColor(AppTheme.textSec)
                            }
                            Spacer()
                        }
                        .padding(12).background(AppTheme.accent.opacity(0.06)).cornerRadius(10)
                    }

                    // Price
                    HStack(spacing: 10) {
                        Text("₴\(Int(deal.group))").font(.system(size: 28, weight: .heavy)).foregroundColor(AppTheme.green)
                        Text("₴\(Int(deal.retail))").font(.system(size: 14)).foregroundColor(AppTheme.textMuted).strikethrough()
                        Text("/ \(deal.unit ?? "шт")").font(.system(size: 12)).foregroundColor(AppTheme.textSec)
                    }.frame(maxWidth: .infinity, alignment: .leading).padding(12).background(AppTheme.card).cornerRadius(10)

                    // Progress
                    VStack(spacing: 6) {
                        HStack {
                            Text("Учасників").font(.system(size: 10)).foregroundColor(AppTheme.textSec)
                            Spacer()
                            Text("\(deal.joined ?? 0)/\(deal.needed ?? 0)").font(.system(size: 13, weight: .bold)).foregroundColor(.white)
                        }
                        ProgressView(value: deal.progress).tint(AppTheme.accent)
                        HStack {
                            Label("\(deal.daysLeft) дн.", systemImage: "clock").font(.system(size: 11)).foregroundColor(AppTheme.textSec)
                            Spacer()
                            Text("\(Int(deal.progress * 100))%").font(.system(size: 11, weight: .bold)).foregroundColor(AppTheme.accent)
                        }
                    }.padding(12).background(AppTheme.card).cornerRadius(10)

                    // Tags
                    if let tags = deal.tags, !tags.isEmpty {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack { ForEach(tags, id: \.self) { tag in
                                Text(tag).font(.system(size: 11)).foregroundColor(AppTheme.textSec)
                                    .padding(.horizontal, 10).padding(.vertical, 4)
                                    .background(AppTheme.cardAlt).cornerRadius(8)
                            }}
                        }
                    }

                    // Description
                    if let desc = deal.description, !desc.isEmpty {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Опис").font(.system(size: 12, weight: .bold)).foregroundColor(.white)
                            Text(desc).font(.system(size: 12)).foregroundColor(AppTheme.textSec).lineSpacing(4)
                        }.frame(maxWidth: .infinity, alignment: .leading).padding(12).background(AppTheme.card).cornerRadius(10)
                    }

                    // Map
                    if let coords = deal.geoCoords {
                        Map(coordinateRegion: .constant(MKCoordinateRegion(
                            center: CLLocationCoordinate2D(latitude: coords.0, longitude: coords.1),
                            span: MKCoordinateSpan(latitudeDelta: 0.005, longitudeDelta: 0.005)
                        )), annotationItems: [MapPin(coordinate: CLLocationCoordinate2D(latitude: coords.0, longitude: coords.1))]) { pin in
                            MapMarker(coordinate: pin.coordinate, tint: .green)
                        }
                        .frame(height: 150).cornerRadius(10)
                    }

                    // Share
                    Button { shareDeal() } label: {
                        Label("Поділитись оголошенням", systemImage: "square.and.arrow.up")
                            .font(.system(size: 13)).foregroundColor(.white)
                            .frame(maxWidth: .infinity).padding(14)
                            .background(AppTheme.accent.opacity(0.1))
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(AppTheme.accent.opacity(0.2), lineWidth: 1))
                            .cornerRadius(12)
                    }

                    // Quantity + Join
                    if !error.isEmpty { Text(error).font(.caption).foregroundColor(.red) }

                    Stepper("Кількість: \(qty) \(deal.unit ?? "")", value: $qty, in: (deal.minQty ?? 1)...(deal.maxQty ?? 10))
                        .foregroundColor(.white).padding(12).background(AppTheme.card).cornerRadius(10)

                    Button(joining ? "Обробка..." : "Долучитись · ₴\(Int(deal.group) * qty)") {
                        joinDeal()
                    }
                    .disabled(joining)
                    .frame(maxWidth: .infinity).padding(16)
                    .background(LinearGradient(colors: [AppTheme.accent, AppTheme.green], startPoint: .leading, endPoint: .trailing))
                    .foregroundColor(.black).fontWeight(.bold).font(.system(size: 16))
                    .cornerRadius(14)
                }
                .padding(16)
            }
            .background(AppTheme.bg)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button { dismiss() } label: { Image(systemName: "xmark").foregroundColor(.white) }
                }
            }
        }
    }

    func joinDeal() {
        joining = true; error = ""
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        Task {
            do {
                let _ = try await api.createOrder(dealId: deal.id, quantity: qty)
                UINotificationFeedbackGenerator().notificationOccurred(.success)
                try? await api.fetchDeals()
                dismiss()
            } catch { self.error = error.localizedDescription }
            joining = false
        }
    }

    func shareDeal() {
        let geo = deal.geoCoords
        let mapLink = geo != nil ? "\nhttps://www.google.com/maps?q=\(geo!.0),\(geo!.1)" : ""
        let text = "\(deal.title) — ₴\(Int(deal.group)) замість ₴\(Int(deal.retail)) (-\(deal.discount)%)\n📍 \(deal.city ?? "")\(mapLink)"
        let av = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        UIApplication.shared.connectedScenes.compactMap { ($0 as? UIWindowScene)?.keyWindow?.rootViewController }.first?.present(av, animated: true)
    }
}

struct MapPin: Identifiable {
    let id = UUID()
    let coordinate: CLLocationCoordinate2D
}
