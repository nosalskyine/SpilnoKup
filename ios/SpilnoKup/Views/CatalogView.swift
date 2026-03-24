import SwiftUI

struct CatalogView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    Text("Каталог товарів")
                        .font(.title2)
                        .fontWeight(.bold)
                        .padding(.top, 20)

                    Text("Тут буде каталог товарів для спільних покупок")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .frame(maxWidth: .infinity)
            }
            .navigationTitle("Каталог")
        }
    }
}

struct CatalogView_Previews: PreviewProvider {
    static var previews: some View {
        CatalogView()
    }
}
