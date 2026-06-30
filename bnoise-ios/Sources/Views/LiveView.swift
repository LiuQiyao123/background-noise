import SwiftUI

struct LiveView: View {
    @State private var shows: [Show] = []

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Hero
                    VStack(spacing: 4) {
                        Text("Discover Unique Finds")
                            .font(.custom("Playfair Display", size: 28).weight(.black))
                            .foregroundColor(.ink)
                        Text("Curated products from around the world")
                            .font(.custom("DM Sans", size: 13))
                            .foregroundColor(.concreteDark)
                    }
                    .padding(.top, 20)

                    // New Arrivals
                    SectionHeader(title: "最新演出", subtitle: "NEW")
                        .padding(.horizontal)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(shows.prefix(6)) { show in
                                NavigationLink {
                                    ShowDetailView(show: show)
                                } label: {
                                    ShowCard(show: show)
                                }
                            }
                        }
                        .padding(.horizontal)
                    }

                    // Categories
                    SectionHeader(title: "热门现场", subtitle: "HOT")
                        .padding(.horizontal)

                    LazyVStack(spacing: 12) {
                        ForEach(shows) { show in
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
                            .padding(.horizontal)
                        }
                    }
                }
                .padding(.bottom, 100)
            }
            .background(.bone)
            .task {
                await loadShows()
            }
        }
    }

    func loadShows() async {
        do {
            let result: [Show] = try await APIClient.shared.fetch("/shows", auth: false)
            shows = result
        } catch {
            // Use mock data for preview
            shows = mockShows
        }
    }
}

struct ShowCard: View {
    let show: Show

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            ZStack {
                if let url = show.coverUrl, let imageUrl = URL(string: url) {
                    AsyncImage(url: imageUrl) { phase in
                        if let image = phase.image {
                            image.resizable().scaledToFill()
                        } else {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(.concrete.opacity(0.2))
                        }
                    }
                } else {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(.concrete.opacity(0.2))
                }
            }
            .frame(width: 140, height: 140)
            .clipShape(RoundedRectangle(cornerRadius: 12))

            Text(show.artistName)
                .font(.custom("DM Sans", size: 13).weight(.semibold))
                .foregroundColor(.ink)
                .lineLimit(1)

            Text(show.venueName)
                .font(.custom("DM Sans", size: 11))
                .foregroundColor(.concreteDark)
                .lineLimit(1)
        }
        .frame(width: 140)
    }
}
