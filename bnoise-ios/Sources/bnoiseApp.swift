import SwiftUI

@main
struct BnoiseApp: App {
    @StateObject private var auth = AuthState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(auth)
        }
    }
}

class AuthState: ObservableObject {
    @Published var user: User? = nil
    @Published var isLoggedIn: Bool = false

    init() {
        if UserDefaults.standard.string(forKey: "bn_token") != nil {
            isLoggedIn = true
        }
    }

    func login(token: String, user: User) {
        UserDefaults.standard.set(token, forKey: "bn_token")
        DispatchQueue.main.async {
            self.user = user
            self.isLoggedIn = true
        }
    }

    func logout() {
        UserDefaults.standard.removeObject(forKey: "bn_token")
        DispatchQueue.main.async {
            self.user = nil
            self.isLoggedIn = false
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var auth: AuthState
    @State private var selectedTab: BNTabBar.Tab = .home
    @State private var showSplash = true

    var body: some View {
        ZStack {
            if showSplash {
                SplashView(onDone: { showSplash = false })
            } else {
                mainView
            }
        }
    }

    var mainView: some View {
        ZStack(alignment: .bottom) {
            VStack(spacing: 0) {
                switch selectedTab {
                case .home:
                    LiveView()
                case .discover:
                    DiscoverView()
                case .record:
                    RecordView()
                case .profile:
                    ProfileView()
                }
            }

            BNTabBar(selectedTab: $selectedTab)
        }
    }
}
