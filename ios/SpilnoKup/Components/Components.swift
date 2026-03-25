import SwiftUI
import MapKit

// MARK: - Badge

struct BadgeView: View {
    let text: String
    var bg: Color = Color(hex: "101c2c")
    var fg: Color = Color(hex: "3a8fb0")
    var fontSize: CGFloat = 11

    var body: some View {
        Text(text)
            .font(.system(size: fontSize, weight: .semibold))
            .foregroundColor(fg)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(bg)
            .cornerRadius(6)
    }
}

// MARK: - Progress Bar

struct DealProgressBar: View {
    let value: Int
    var color: Color = Color(hex: "3068b8")
    var height: CGFloat = 5

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: height / 2)
                    .fill(Color.white.opacity(0.08))
                    .frame(height: height)
                RoundedRectangle(cornerRadius: height / 2)
                    .fill(color)
                    .frame(width: geo.size.width * CGFloat(value) / 100, height: height)
                    .animation(.easeOut(duration: 0.4), value: value)
            }
        }
        .frame(height: height)
    }
}

// MARK: - Icon Container

struct IconContainer: View {
    let emoji: String
    var size: CGFloat = 36

    var body: some View {
        Text(emoji)
            .font(.system(size: size * 0.55))
            .frame(width: size, height: size)
            .background(Color.white.opacity(0.06))
            .cornerRadius(size * 0.3)
            .overlay(
                RoundedRectangle(cornerRadius: size * 0.3)
                    .stroke(Color.white.opacity(0.1), lineWidth: 1)
            )
    }
}

// MARK: - Themed TextField

struct ThemedTextField: View {
    let placeholder: String
    @Binding var text: String
    var icon: String? = nil
    var isSecure: Bool = false

    @EnvironmentObject var state: AppState

    var body: some View {
        HStack(spacing: 10) {
            if let icon = icon {
                Text(icon)
                    .font(.system(size: 16))
            }
            if isSecure {
                SecureField(placeholder, text: $text)
                    .foregroundColor(state.theme.text)
            } else {
                TextField(placeholder, text: $text)
                    .foregroundColor(state.theme.text)
            }
        }
        .padding(12)
        .background(state.theme.cardAlt)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(state.theme.border, lineWidth: 1)
        )
    }
}

// MARK: - Vinnytsia Map

struct VinnytsiaMapView: View {
    var height: CGFloat = 200
    var showShops: Bool = true
    var label: String? = nil

    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 49.2328, longitude: 28.4687),
        span: MKCoordinateSpan(latitudeDelta: 0.024, longitudeDelta: 0.04)
    )

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            Map(coordinateRegion: $region, annotationItems: showShops ? shopAnnotations : []) { shop in
                MapAnnotation(coordinate: shop.coordinate) {
                    Circle()
                        .fill(Color(hex: "3068b8"))
                        .frame(width: 10, height: 10)
                        .overlay(Circle().stroke(Color.white, lineWidth: 2))
                        .shadow(radius: 2)
                }
            }
            .frame(height: height)
            .cornerRadius(12)
            .allowsHitTesting(false)

            if let label = label {
                Text(label)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 3)
                    .background(Color.black.opacity(0.6))
                    .cornerRadius(6)
                    .padding(6)
            }
        }
    }

    var shopAnnotations: [ShopAnnotation] {
        SampleData.shops.map { ShopAnnotation(name: $0.name, coordinate: CLLocationCoordinate2D(latitude: $0.lat, longitude: $0.lng)) }
    }
}

struct ShopAnnotation: Identifiable {
    let id = UUID()
    let name: String
    let coordinate: CLLocationCoordinate2D
}

// MARK: - Price Color

func priceColor(for pct: Int) -> Color {
    if pct >= 90 { return Color(hex: "c46a20") }
    if pct >= 60 { return Color(hex: "b8960a") }
    return Color(hex: "3068b8")
}

func discountBorderColor(for disc: Int) -> Color {
    if disc > 30 { return Color(hex: "ef4444") }
    if disc >= 20 { return Color(hex: "22c55e") }
    return Color.clear
}

// MARK: - Category Color

func categoryGradient(for cat: DealCategory) -> LinearGradient {
    let colors: [Color]
    switch cat {
    case .farm: colors = [Color(hex: "1a3020"), Color(hex: "0d1a10")]
    case .honey: colors = [Color(hex: "2a2510"), Color(hex: "1a1508")]
    case .veggies: colors = [Color(hex: "102a15"), Color(hex: "081a0c")]
    case .dairy: colors = [Color(hex: "1a2030"), Color(hex: "101828")]
    case .food: colors = [Color(hex: "2a1a10"), Color(hex: "1a1008")]
    case .bakery: colors = [Color(hex: "2a1a10"), Color(hex: "1a1008")]
    case .drinks: colors = [Color(hex: "1a1510"), Color(hex: "100d08")]
    case .sport: colors = [Color(hex: "102020"), Color(hex: "081418")]
    case .electronics: colors = [Color(hex: "101a2a"), Color(hex: "080e1a")]
    case .services: colors = [Color(hex: "1a1a20"), Color(hex: "101018")]
    case .clothing: colors = [Color(hex: "201a20"), Color(hex: "141018")]
    case .handmade: colors = [Color(hex: "201a2a"), Color(hex: "14101a")]
    case .beauty: colors = [Color(hex: "2a1020"), Color(hex: "1a0810")]
    case .home: colors = [Color(hex: "1a2020"), Color(hex: "101414")]
    case .cafe: colors = [Color(hex: "1a1510"), Color(hex: "100d08")]
    case .other: colors = [Color(hex: "1a1a1a"), Color(hex: "101010")]
    case .all: colors = [Color(hex: "151c2c"), Color(hex: "0e1320")]
    }
    return LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing)
}
