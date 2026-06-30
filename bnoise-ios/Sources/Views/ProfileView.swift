import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var auth: AuthState

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Avatar
                    ZStack {
                        Circle()
                            .fill(.concrete.opacity(0.2))
                            .frame(width: 80, height: 80)
                        Image(systemName: "person.fill")
                            .font(.system(size: 36))
                            .foregroundColor(.concreteDark)
                    }
                    .overlay(
                        StampLabel(text: "乐迷")
                            .offset(y: 30)
                    )

                    if auth.isLoggedIn {
                        Text(auth.user?.nickname ?? "用户")
                            .font(.custom("Playfair Display", size: 22).weight(.black))
                            .foregroundColor(.ink)
                    } else {
                        VStack(spacing: 8) {
                            Text("未登录")
                                .font(.custom("Playfair Display", size: 22).weight(.black))
                                .foregroundColor(.ink)
                            Button("登录 / 注册") {}
                                .buttonStyle(.borderedProminent)
                                .tint(.ink)
                        }
                    }

                    // Stats
                    HStack(spacing: 20) {
                        StatItem(value: "0", label: "记录")
                        StatItem(value: "0", label: "演出")
                        StatItem(value: "0", label: "粉丝")
                        StatItem(value: "0", label: "关注")
                    }
                    .padding()
                    .background(.cardBg)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(.ink.opacity(0.05))
                    )

                    // Badges
                    SectionHeader(title: "成就徽章")
                    HStack(spacing: 12) {
                        BadgePlaceholder(name: "第一排")
                        BadgePlaceholder(name: "十场老炮")
                        BadgePlaceholder(name: "铁粉")
                        Spacer()
                    }

                    Spacer()
                }
                .padding()
                .padding(.bottom, 100)
            }
            .background(.bone)
        }
    }
}

struct StatItem: View {
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.custom("JetBrains Mono", size: 18).weight(.black))
                .foregroundColor(.ink)
            Text(label)
                .font(.custom("DM Sans", size: 11))
                .foregroundColor(.concreteDark)
        }
        .frame(maxWidth: .infinity)
    }
}

struct BadgePlaceholder: View {
    let name: String

    var body: some View {
        VStack(spacing: 4) {
            ZStack {
                Circle()
                    .stroke(.concrete, lineWidth: 1.5)
                    .frame(width: 48, height: 48)
                Image(systemName: "questionmark")
                    .font(.title3)
                    .foregroundColor(.concrete)
            }
            Text(name)
                .font(.custom("DM Sans", size: 9))
                .foregroundColor(.concreteDark)
        }
    }
}
