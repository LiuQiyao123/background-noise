import SwiftUI

struct SplashView: View {
    let onDone: () -> Void
    @State private var loaded = false

    var body: some View {
        ZStack {
            // Background
            Color.ink.ignoresSafeArea()
            RadialGradient(
                colors: [Color(hex: 0x2A1F3F), .ink],
                center: .center,
                startRadius: 0,
                endRadius: 300
            )
            .ignoresSafeArea()
            RadialGradient(
                colors: [Color(hex: 0x7C3AED).opacity(0.12), .clear],
                center: .init(x: 0.3, y: 0.2),
                startRadius: 0,
                endRadius: 200
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // Logo area
                VStack(spacing: 16) {
                    RecordPlayerLogo(size: 80)
                    Text("底噪")
                        .font(.custom("Noto Serif SC", size: 36).weight(.black))
                        .foregroundColor(.bone)
                    Text("Background Noise")
                        .font(.custom("DM Sans", size: 11).weight(.semibold))
                        .tracking(4)
                        .foregroundColor(.concrete)
                }
                .offset(y: loaded ? 0 : 20)
                .opacity(loaded ? 1 : 0)

                Spacer()

                // Tagline
                VStack(spacing: 8) {
                    Text("记录现场，找到同频的人")
                        .font(.title2).bold()
                        .foregroundColor(.bone)
                    Text("为每一场独立音乐和 Live House 演出\n留下你的现场记忆")
                        .font(.body)
                        .foregroundColor(.concrete)
                        .multilineTextAlignment(.center)
                }
                .offset(y: loaded ? 0 : 20)
                .opacity(loaded ? 1 : 0)

                Spacer()

                // Feature cards
                VStack(spacing: 12) {
                    FeatureRow(icon: "🎸", title: "记录现场", desc: "每一场演出都值得被记住")
                    FeatureRow(icon: "🏷️", title: "一句话记忆", desc: "用标签找到同频的人")
                    FeatureRow(icon: "📊", title: "Vibe 评分", desc: "乐队·音响·氛围，三维打分")
                }
                .padding(.horizontal, 40)
                .offset(y: loaded ? 0 : 30)
                .opacity(loaded ? 1 : 0)

                Spacer()

                // Buttons
                VStack(spacing: 12) {
                    Button(action: onDone) {
                        Text("开始记录")
                            .font(.custom("DM Sans", size: 15).weight(.bold))
                            .foregroundColor(.ink)
                            .frame(width: 224, height: 44)
                            .background(.highlight)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }

                    Button(action: onDone) {
                        Text("先逛逛 →")
                            .font(.custom("DM Sans", size: 12))
                            .foregroundColor(.concrete)
                            .underline()
                    }
                }
                .padding(.bottom, 40)
                .offset(y: loaded ? 0 : 30)
                .opacity(loaded ? 1 : 0)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.7)) {
                loaded = true
            }
        }
    }
}

struct FeatureRow: View {
    let icon: String
    let title: String
    let desc: String

    var body: some View {
        HStack(spacing: 16) {
            Text(icon).font(.title2)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.custom("DM Sans", size: 14).weight(.bold))
                    .foregroundColor(.bone)
                Text(desc)
                    .font(.custom("DM Sans", size: 12))
                    .foregroundColor(.concrete)
            }
            Spacer()
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .background(.white.opacity(0.05))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(.white.opacity(0.1))
        )
    }
}

struct RecordPlayerLogo: View {
    let size: CGFloat

    var body: some View {
        ZStack {
            // Disc
            Circle()
                .fill(Color(hex: 0xE85D4C).opacity(0.12))
                .frame(width: size, height: size)
            Circle()
                .stroke(Color(hex: 0xE85D4C).opacity(0.4), lineWidth: 1.5)
                .frame(width: size * 0.8, height: size * 0.8)
            Circle()
                .stroke(Color(hex: 0xE85D4C).opacity(0.25), lineWidth: 0.5)
                .frame(width: size * 0.5, height: size * 0.5)

            // Needle arm
            Path { path in
                path.move(to: CGPoint(x: size * 0.5, y: size * 0.5))
                path.addLine(to: CGPoint(x: size * 0.17, y: size * 0.14))
            }
            .stroke(Color(hex: 0xE85D4C), lineWidth: 2)
            .opacity(0.85)

            // Center dot
            Circle()
                .fill(Color(hex: 0xE85D4C))
                .frame(width: size * 0.1, height: size * 0.1)
            Circle()
                .fill(.white.opacity(0.8))
                .frame(width: size * 0.04, height: size * 0.04)
        }
    }
}

#Preview {
    SplashView(onDone: {})
}
