import SwiftUI

struct ShowDetailView: View {
    let show: Show

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Hero
                ZStack(alignment: .bottomLeading) {
                    // Background
                    if let url = show.coverUrl, let imageUrl = URL(string: url) {
                        AsyncImage(url: imageUrl) { phase in
                            if let image = phase.image {
                                image.resizable()
                            } else {
                                ConcreteBackground()
                            }
                        }
                    } else {
                        ConcreteBackground()
                    }

                    LinearGradient(
                        colors: [.clear, .ink.opacity(0.8)],
                        startPoint: .top,
                        endPoint: .bottom
                    )

                    VStack(alignment: .leading, spacing: 4) {
                        StampLabel(text: "LIVE")
                        Text(show.artistName)
                            .font(.custom("Playfair Display", size: 32).weight(.black))
                            .foregroundColor(.bone)
                        Text(show.title)
                            .font(.custom("DM Sans", size: 14))
                            .foregroundColor(.bone.opacity(0.8))
                        HStack {
                            Image(systemName: "mappin")
                                .font(.caption)
                            Text(show.venueName)
                        }
                        .font(.custom("DM Sans", size: 12))
                        .foregroundColor(.concrete)
                    }
                    .padding(20)
                }
                .frame(height: 360)

                // Info cards
                VStack(spacing: 0) {
                    // Stats
                    HStack(spacing: 12) {
                        StatItem(value: "\(show.stats?.publicRepoCount ?? 0)", label: "现场记录")
                        StatItem(value: "\(show.stats?.attendCount ?? 0)", label: "在场人数")
                        StatItem(value: "3.8", label: "综合评分")
                        StatItem(value: "\(show.stats?.avgVibe?.band ?? 0, specifier: "%.1f")", label: "乐队")
                    }
                    .padding()
                    .background(.bone)
                    .modifier(TornPaperModifier(shadow: true))

                    // Vibe distribution
                    VStack(spacing: 8) {
                        SectionHeader(title: "Vibe 气质")
                            .padding(.horizontal)

                        VibeDistributionBar(
                            values: [1: 5, 2: 12, 3: 28, 4: 45, 5: 10],
                            color: .vibeBand,
                            label: "乐队表现",
                            topText: "45% 认为「全程高能」"
                        )
                        VibeDistributionBar(
                            values: [1: 3, 2: 8, 3: 22, 4: 50, 5: 17],
                            color: .vibeSound,
                            label: "音响效果",
                            topText: "50% 认为「身临其境」"
                        )
                        VibeDistributionBar(
                            values: [1: 8, 2: 15, 3: 30, 4: 35, 5: 12],
                            color: .vibeAtmos,
                            label: "现场氛围",
                            topText: "35% 认为「真的燥起来了」"
                        )
                    }
                    .padding(.vertical)
                    .background(.bone)

                    // Memory wall
                    SectionHeader(title: "记忆墙")
                        .padding()

                    Text("还没人到过现场")
                        .font(.custom("DM Sans", size: 13))
                        .foregroundColor(.concreteDark)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 40)

                    // Action
                    Button(action: {}) {
                        HStack {
                            Image(systemName: "plus.circle")
                            Text("我也在场 · 写记录")
                        }
                        .font(.custom("DM Sans", size: 14).weight(.semibold))
                        .foregroundColor(.bone)
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                        .background(.ink)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .padding()
                }
                .offset(y: -20)
            }
        }
        .ignoresSafeArea()
        .background(.bone)
    }
}

struct ConcreteBackground: View {
    var body: some View {
        ZStack {
            Color(hex: 0xBCBAB5)
            // Speckle pattern
            Canvas { context, size in
                for _ in 0..<200 {
                    let x = CGFloat.random(in: 0...size.width)
                    let y = CGFloat.random(in: 0...size.height)
                    let r = CGFloat.random(in: 0.4...1.4)
                    context.fill(
                        Path(ellipseIn: CGRect(x: x, y: y, width: r, height: r)),
                        with: .color(.black.opacity(Double.random(in: 0...0.18)))
                    )
                }
            }
            .allowsHitTesting(false)
        }
    }
}

struct VibeDistributionBar: View {
    let values: [Int: Int]
    let color: Color
    let label: String
    let topText: String

    var body: some View {
        VStack(spacing: 4) {
            HStack {
                Text(label)
                    .font(.custom("DM Sans", size: 12))
                    .foregroundColor(.concreteDark)
                Spacer()
                Text(topText)
                    .font(.custom("DM Sans", size: 12).weight(.semibold))
                    .foregroundColor(color)
            }
            HStack(spacing: 2) {
                ForEach(1...5, id: \.self) { score in
                    let count = values[score] ?? 0
                    let total = values.values.reduce(0, +)
                    let pct = total > 0 ? CGFloat(count) / CGFloat(total) : 0
                    VStack(spacing: 2) {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(color.opacity(0.6 + Double(score) * 0.08))
                            .frame(height: max(4, 60 * pct))
                        Text("\(count)")
                            .font(.custom("DM Sans", size: 9))
                            .foregroundColor(.textDim)
                    }
                }
            }
            .frame(height: 60)
        }
        .padding(10)
        .background(.bgElevated)
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .padding(.horizontal)
    }
}
