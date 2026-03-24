import SwiftUI

struct HomeView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    Text("Ласкаво просимо до СпільноКуп!")
                        .font(.title2)
                        .fontWeight(.bold)
                        .padding(.top, 20)

                    Text("Тут будуть відображатись актуальні спільні покупки")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .frame(maxWidth: .infinity)
            }
            .navigationTitle("Головна")
        }
    }
}

struct HomeView_Previews: PreviewProvider {
    static var previews: some View {
        HomeView()
    }
}
