import Foundation

// MARK: - Shows
struct Show: Identifiable, Codable {
    let id: Int
    let artistName: String
    let title: String
    let venueName: String
    let city: String?
    let showDate: String
    let coverUrl: String?
    let stats: ShowStats?
}

struct ShowStats: Codable {
    let publicRepoCount: Int
    let attendCount: Int
    let avgVibe: AvgVibe?
}

struct AvgVibe: Codable {
    let band: Double
    let sound: Double
    let atmosphere: Double
}

// MARK: - Repo (Memory)
struct Repo: Identifiable, Codable {
    let id: Int
    let body: String?
    let memoryHook: String?
    let vibeBand: Int
    let vibeSound: Int
    let vibeAtmosphere: Int
    let visibility: String
    let createdAt: String
    let user: User?
    let show: Show?
    let media: [RepoMedia]?
    let commentCount: Int?
    let likeCount: Int?
}

struct RepoMedia: Codable {
    let url: String
    let type: String?
    let sortOrder: Int
}

// MARK: - User
struct User: Identifiable, Codable {
    let id: Int
    let nickname: String
    let avatarUrl: String?
}

// MARK: - Discover
struct DiscoverFeed: Codable {
    let blindBox: BlindBox?
    let matches: [Match]?
    let upcoming: [Show]
    let hotShows: [Show]
    let recentRepos: [Repo]
}

struct BlindBox: Identifiable, Codable {
    let id: String
    let memoryHook: String
    let show: Show
}

struct Match: Identifiable, Codable {
    let id: String
    let matchLevel: Int
    let similarityScore: Double?
    let otherUser: User?
    let show: Show?
}

// MARK: - Auth
struct AuthResponse: Codable {
    let accessToken: String
    let user: User
}
