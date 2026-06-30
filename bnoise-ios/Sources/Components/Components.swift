import SwiftUI

// MARK: - Paper Grain (SVG noise texture overlay)
struct PaperGrain: View {
    var intensity: Double = 0.15

    var body: some View {
        GeometryReader { geo in
            let w = Int(geo.size.width)
            let h = Int(geo.size.height)
            Canvas { context, size in
                for _ in 0..<(w * h / 180) {
                    let x = CGFloat.random(in: 0...size.width)
                    let y = CGFloat.random(in: 0...size.height)
                    let r = CGFloat.random(in: 0.4...1.0)
                    let alpha = Double.random(in: 0...intensity)
                    context.fill(
                        Path(ellipseIn: CGRect(x: x, y: y, width: r, height: r)),
                        with: .color(.black.opacity(alpha))
                    )
                }
            }
            .allowsHitTesting(false)
        }
    }
}

// MARK: - Stamp Label (rotated badge)
struct StampLabel: View {
    let text: String
    var color: Color = .stamp

    var body: some View {
        Text(text)
            .font(.custom("Playfair Display", size: 11).weight(.black))
            .foregroundColor(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 2)
            .overlay(
                RoundedRectangle(cornerRadius: 2)
                    .stroke(color, lineWidth: 1.5)
            )
            .rotationEffect(.degrees(-6))
    }
}

// MARK: - Attend Badge
struct AttendBadge: View {
    let percent: Int

    var body: some View {
        Text("\(percent)%")
            .font(.custom("JetBrains Mono", size: 10).weight(.black))
            .foregroundColor(.bone)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(.ink)
    }
}

// MARK: - Section Header
struct SectionHeader: View {
    let title: String
    var subtitle: String?

    var body: some View {
        HStack(alignment: .lastTextBaseline) {
            HStack(spacing: 4) {
                Text("#")
                    .font(.custom("Playfair Display", size: 28).weight(.black))
                    .foregroundColor(.ink.opacity(0.85))
                Text(title)
                    .font(.custom("Playfair Display", size: 28).weight(.black))
                    .foregroundColor(.ink)
            }
            Spacer()
            if let subtitle {
                Text(subtitle.uppercased())
                    .font(.custom("DM Sans", size: 11).weight(.medium))
                    .tracking(2)
                    .foregroundColor(.ink.opacity(0.55))
            }
        }
    }
}

// MARK: - Dashed Vertical Divider
struct DashedDivider: View {
    var body: some View {
        VStack(spacing: 0) {
            Color.ink.opacity(0.55)
                .frame(width: 1)
                .mask(
                    Rectangle()
                        .frame(height: 1000)
                        .overlay(
                            LinearGradient(
                                stops: [
                                    .init(color: .clear, location: 0),
                                    .init(color: .ink.opacity(0.55), location: 0.01),
                                ],
                                startPoint: .top, endPoint: .bottom
                            )
                        )
                )
        }
        .frame(width: 3)
    }
}

// MARK: - Barcode Strip
struct BarcodeStrip: View {
    var seed: Int = 0x42
    var color: Color = .ink
    var width: CGFloat = 22
    var height: CGFloat = 80

    var body: some View {
        Canvas { context, size in
            var rng = SeededRandomGenerator(seed: seed)
            var x: CGFloat = 0
            while x < size.width {
                let bw = 0.6 + rng.next() * 2.6
                if rng.next() < 0.55 {
                    let rect = CGRect(x: x, y: 0, width: bw, height: size.height)
                    context.fill(Path(rect), with: .color(color))
                }
                x += bw + (0.5 + rng.next() * 1.1)
            }
        }
        .frame(width: width, height: height)
    }
}

struct SeededRandomGenerator {
    var seed: Int

    mutating func next() -> CGFloat {
        seed = (seed * 1664525 + 1013904223) & 0x7FFFFFFF
        return CGFloat(seed) / CGFloat(0x7FFFFFFF)
    }
}

// MARK: - Vibe Rating
struct VibeSlider: View {
    let label: String
    @Binding var value: Int
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            HStack {
                Text(label)
                    .font(.custom("DM Sans", size: 13).weight(.semibold))
                    .foregroundColor(color)
                Spacer()
                Text("\(value)")
                    .font(.custom("JetBrains Mono", size: 15).weight(.black))
                    .foregroundColor(.ink)
                Text(anchorText)
                    .font(.custom("DM Sans", size: 10))
                    .foregroundColor(.ink.opacity(0.55))
            }
            Slider(value: Binding(
                get: { Double(value) },
                set: { value = Int(round($0)) }
            ), in: 1...5, step: 1)
            .tint(color)
        }
    }

    private var anchorText: String {
        switch value {
        case 1: return "灾难级"
        case 2: return "不太行"
        case 3: return "还凑合"
        case 4: return "挺不错"
        case 5: return "掀翻屋顶"
        default: return ""
        }
    }
}

// MARK: - Tab Bar
struct BNTabBar: View {
    @Binding var selectedTab: Tab

    enum Tab: String, CaseIterable {
        case home = "house"
        case discover = "compass"
        case record = "plus.square"
        case profile = "person"

        var label: String {
            switch self {
            case .home: return "首页"
            case .discover: return "发现"
            case .record: return "记录"
            case .profile: return "我"
            }
        }
    }

    var body: some View {
        HStack(spacing: 0) {
            ForEach(Tab.allCases, id: \.self) { tab in
                Button {
                    selectedTab = tab
                } label: {
                    VStack(spacing: 2) {
                        Image(systemName: tab.rawValue)
                            .font(.system(size: 22, weight: .medium))
                        Text(tab.label)
                            .font(.custom("DM Sans", size: 9))
                    }
                    .foregroundColor(selectedTab == tab ? .ink : .concreteDark)
                    .frame(maxWidth: .infinity)
                    .padding(.top, 6)
                    .padding(.bottom, 4)
                }
            }
        }
        .background(.bone)
        .overlay(alignment: .top) {
            Color.concrete.opacity(0.3)
                .frame(height: 1)
        }
    }
}

// MARK: - Ticket Stub Card
struct TicketStubCard: View {
    let artist: String
    let title: String
    let venue: String
    let dateLine1: String
    let dateLine2: String?
    let attendPercent: Int
    let attendCount: Int
    let posterUrl: String?

    var body: some View {
        let seed = artist.hashValue
        let tilt = Double((seed % 41) - 20) / 100

        VStack(spacing: 0) {
            ZStack {
                // Shadow layer
                Color.ink
                    .clipShape(RoundedRectangle(cornerRadius: 3))
                    .offset(x: 7, y: 7)
                    .shadow(color: .black.opacity(0.45), radius: 10, x: 3, y: 7)

                // Main ticket
                HStack(spacing: 0) {
                    // Barcode
                    BarcodeStrip(seed: seed, width: 22, height: 70)
                        .padding(.horizontal, 6)

                    // Divider
                    DashedDivider()
                        .padding(.vertical, 4)

                    // Info
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(artist)
                                .font(.custom("Playfair Display", size: 18).weight(.black))
                                .lineLimit(1)
                                .foregroundColor(.ink)
                            Spacer()
                            Text(dateLine1)
                                .font(.custom("JetBrains Mono", size: 11).weight(.bold))
                                .foregroundColor(.ink.opacity(0.7))
                        }
                        Text(title)
                            .font(.custom("DM Sans", size: 11))
                            .lineLimit(1)
                            .foregroundColor(.ink.opacity(0.65))
                        HStack(spacing: 4) {
                            Image(systemName: "mappin")
                                .font(.system(size: 9, weight: .heavy))
                                .foregroundColor(.ink.opacity(0.75))
                            Text(venue)
                                .font(.custom("DM Sans", size: 11).weight(.semibold))
                                .lineLimit(1)
                                .foregroundColor(.ink.opacity(0.75))
                        }
                        Spacer()
                        HStack {
                            AttendBadge(percent: attendPercent)
                            Text("已到场 · \(attendCount)人")
                                .font(.custom("DM Sans", size: 9))
                                .foregroundColor(.ink.opacity(0.55))
                            Spacer()
                            if let dateLine2 {
                                Text(dateLine2)
                                    .font(.custom("JetBrains Mono", size: 13).weight(.black))
                                    .foregroundColor(.ink.opacity(0.75))
                            }
                        }
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 12)

                    // Divider
                    DashedDivider()
                        .padding(.vertical, 4)

                    // Photo
                    ZStack {
                        if let posterUrl, let url = URL(string: posterUrl) {
                            AsyncImage(url: url) { phase in
                                if let image = phase.image {
                                    image.resizable().scaledToFill()
                                } else {
                                    placeholderPhoto(seed: seed)
                                }
                            }
                        } else {
                            placeholderPhoto(seed: seed)
                        }
                    }
                    .frame(width: 96, height: 96)
                    .clipped()
                    .padding(8)
                }
                .background(.bone)
                .clipShape(RoundedRectangle(cornerRadius: 3))
                .overlay(PaperGrain())
            }
            .rotationEffect(.degrees(tilt))
        }
    }

    func placeholderPhoto(seed: Int) -> some View {
        let hue = Double((seed % 360 + 360) % 360)
        ZStack {
            LinearGradient(
                colors: [
                    Color(hue: hue, saturation: 0.2, brightness: 0.35),
                    Color(hue: hue, saturation: 0.3, brightness: 0.25),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            Circle()
                .fill(.white.opacity(0.15))
                .frame(width: 36, height: 36)
                .offset(y: -10)
            Ellipse()
                .fill(.white.opacity(0.08))
                .frame(width: 72, height: 24)
                .offset(y: 24)
        }
    }
}

// MARK: - Torn Paper Shape
struct TornPaperModifier: ViewModifier {
    var color: Color = .bone
    var shadow: Bool = false

    func body(content: Content) -> some View {
        content
            .background(color)
            .clipShape(TornPaperClip())
            .overlay(PaperGrain().clipShape(TornPaperClip()))
            .if(shadow) { view in
                view.shadow(color: .black.opacity(0.2), radius: 8, x: 0, y: 4)
            }
    }
}

struct TornPaperClip: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let w = rect.width
        let h = rect.height
        let jitter: CGFloat = 3
        let segments = 12

        path.move(to: CGPoint(x: 0, y: jitter))
        for i in 0..<segments {
            let x = w * CGFloat(i + 1) / CGFloat(segments)
            let y = CGFloat.random(in: 0...jitter)
            path.addLine(to: CGPoint(x: x, y: y))
        }
        path.addLine(to: CGPoint(x: w, y: h - jitter))
        for i in (0..<segments).reversed() {
            let x = w * CGFloat(i) / CGFloat(segments)
            let y = h - CGFloat.random(in: 0...jitter)
            path.addLine(to: CGPoint(x: x, y: y))
        }
        path.closeSubpath()
        return path
    }
}

extension View {
    @ViewBuilder func `if`<Content: View>(_ condition: Bool, transform: (Self) -> Content) -> some View {
        if condition { transform(self) } else { self }
    }
}
