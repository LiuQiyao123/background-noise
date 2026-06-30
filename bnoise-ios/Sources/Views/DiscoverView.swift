import SwiftUI

struct DiscoverView: View {
    @State private var feed: DiscoverFeed?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Header
                    Text("发现")
                        .font(.custom("Playfair Display", size: 28).weight(.black))
                        .foregroundColor(.ink)
                    Text("共鸣与推荐")
                        .font(.custom("DM Sans", size: 12))
                        .foregroundColor(.concreteDark)

                    // Blind box
                    if let box = feed?.blindBox {
                        BlindBoxCard(box: box)
                    }

                    // Matches
                    if let matches = feed?.matches, !matches.isEmpty {
                        SectionHeader(title: "与你共鸣")
                        ForEach(matches) { match in
                            MatchRow(match: match)
                        }
                    }

                    // Upcoming
                    SectionHeader(title: "即将上演")
                    if let upcoming = feed?.upcoming.prefix(3) {
                        ForEach(Array(upcoming)) { show in
                            NavigationLink {
                                ShowDetailView(show: show)
                            } label: {
                                TicketStubCard(
                                    artist: show.artistName,
                                    title: show.title,
                                    venue: show.venueName,
                                    dateLine1: show.showDate,
                                    dateLine2: nil,
                                    attendPercent: 85,
                                    attendCount: show.stats?.attendCount ?? 0,
                                    posterUrl: show.coverUrl
                                )
                            }
                        }
                    }

                    // Hot Shows
                    SectionHeader(title: "热门现场")
                    if let hot = feed?.hotShows.prefix(3) {
                        ForEach(Array(hot)) { show in
                            NavigationLink {
                                ShowDetailView(show: show)
                            } label: {
                                TicketStubCard(
                                    artist: show.artistName,
                                    title: show.title,
                                    venue: show.venueName,
                                    dateLine1: show.showDate,
                                    dateLine2: nil,
                                    attendPercent: 85,
                                    attendCount: show.stats?.attendCount ?? 0,
                                    posterUrl: show.coverUrl
                                )
                            }
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.bottom, 100)
            }
            .background(.bone)
            .task { await load() }
        }
    }

    func load() async {
        do {
            feed = try await APIClient.shared.fetch("/discover", auth: false)
        } catch {
            // Preview with mock
        }
    }
}

struct BlindBoxCard: View {
    let box: BlindBox

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("🎸")
                .font(.title)
                .frame(maxWidth: .infinity, alignment: .trailing)
                .opacity(0.3)
            Text("同场盲盒")
                .font(.custom("DM Sans", size: 12).weight(.semibold))
                .tracking(1)
                .foregroundColor(.stamp)
            Text("「\(box.memoryHook)」")
                .font(.custom("Playfair Display", size: 14).italic())
                .foregroundColor(.bone)
            Text("—— 来自 \(box.show.artistName) 的某位在场者")
                .font(.custom("DM Sans", size: 12))
                .foregroundColor(.concreteDark)

            HStack(spacing: 8) {
                Button("我也这么觉得 🤘") {}
                    .buttonStyle(.borderedProminent)
                    .tint(.ink)
                Button("滑走") {}
                    .buttonStyle(.bordered)
                    .tint(.bone.opacity(0.6))
            }
        }
        .padding(20)
        .background(
            LinearGradient(
                colors: [Color(hex: 0x1E1418), Color(hex: 0x14141E)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(.stamp.opacity(0.5))
        )
    }
}

struct MatchRow: View {
    let match: Match

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Text(match.otherUser?.nickname ?? "未知")
                        .font(.custom("DM Sans", size: 14).weight(.semibold))
                        .foregroundColor(.ink)
                    if match.matchLevel >= 3, let score = match.similarityScore {
                        Text("\(Int(score))% 重合")
                            .font(.custom("DM Sans", size: 10))
                            .foregroundColor(.stamp)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(.stamp.opacity(0.1))
                            .clipShape(Capsule())
                    }
                }
                Text("\(match.show?.artistName ?? "") · \(match.show?.venueName ?? "")")
                    .font(.custom("DM Sans", size: 12))
                    .foregroundColor(.concreteDark)
            }
            Spacer()
            Text(match.matchLevel >= 3 ? "🔥" : match.matchLevel >= 2 ? "💡" : "👋")
                .font(.title3)
        }
        .padding(12)
        .background(.cardBg)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(.ink.opacity(0.05))
        )
    }
}
