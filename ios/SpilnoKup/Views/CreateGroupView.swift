import SwiftUI

struct CreateGroupView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    Text("Нова спільна покупка")
                        .font(.title2)
                        .fontWeight(.bold)
                        .padding(.top, 20)

                    Text("Тут можна буде створити нову спільну покупку")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .frame(maxWidth: .infinity)
            }
            .navigationTitle("Створити")
        }
    }
}

struct CreateGroupView_Previews: PreviewProvider {
    static var previews: some View {
        CreateGroupView()
    }
}
