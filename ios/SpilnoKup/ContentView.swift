import SwiftUI

struct ContentView: View {
    @State private var selectedTab: AppTab = .home

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Головна")
                }
                .tag(AppTab.home)

            CatalogView()
                .tabItem {
                    Image(systemName: "square.grid.2x2.fill")
                    Text("Каталог")
                }
                .tag(AppTab.catalog)

            CreateGroupView()
                .tabItem {
                    Image(systemName: "plus.circle.fill")
                    Text("Створити")
                }
                .tag(AppTab.create)

            NotificationsView()
                .tabItem {
                    Image(systemName: "bell.fill")
                    Text("Сповіщення")
                }
                .tag(AppTab.notifications)

            ProfileView()
                .tabItem {
                    Image(systemName: "person.fill")
                    Text("Профіль")
                }
                .tag(AppTab.profile)
        }
        .tint(.orange)
    }
}

enum AppTab: String, CaseIterable {
    case home
    case catalog
    case create
    case notifications
    case profile
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
