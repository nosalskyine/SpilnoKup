import SwiftUI

struct NotificationsView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    Text("Сповіщення")
                        .font(.title2)
                        .fontWeight(.bold)
                        .padding(.top, 20)

                    Text("Тут будуть ваші сповіщення про спільні покупки")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .frame(maxWidth: .infinity)
            }
            .navigationTitle("Сповіщення")
        }
    }
}

struct NotificationsView_Previews: PreviewProvider {
    static var previews: some View {
        NotificationsView()
    }
}
