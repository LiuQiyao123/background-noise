import SwiftUI

struct RecordView: View {
    @EnvironmentObject var auth: AuthState
    @State private var shows: [Show] = []
    @State private var selectedShow: Show?
    @State private var bodyText = ""
    @State private var memoryHook = ""
    @State private var template: TemplateKey = .D

    enum TemplateKey: String, CaseIterable {
        case A = "那一刻"
        case B = "比喻"
        case C = "动作定义"
        case D = "自由"
    }

    var body: some View {
        NavigationStack {
            if !auth.isLoggedIn {
                VStack(spacing: 16) {
                    Image(systemName: "plus.circle")
                        .font(.system(size: 40))
                        .foregroundColor(.concreteDark)
                    Text("登录后即可记录演出记忆")
                        .font(.custom("DM Sans", size: 14))
                        .foregroundColor(.concreteDark)
                    Button("登录 / 注册") {
                        // Navigate to login
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.ink)
                }
                .frame(maxHeight: .infinity)
                .background(.bone)
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        // Header
                        Text("记录")
                            .font(.custom("Playfair Display", size: 28).weight(.black))
                            .foregroundColor(.ink)
                        Text("默认私密，可选公开到演出条目")
                            .font(.custom("DM Sans", size: 12))
                            .foregroundColor(.concreteDark)

                        // Show selector
                        SectionHeader(title: "绑定演出")
                        Picker("选择演出", selection: $selectedShow) {
                            Text("选择演出...").tag(nil as Show?)
                            ForEach(shows) { show in
                                Text("\(show.artistName) @ \(show.venueName)")
                                    .tag(show as Show?)
                            }
                        }
                        .pickerStyle(.menu)
                        .padding(12)
                        .background(.cardBg)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(.concrete.opacity(0.4))
                        )

                        // Memory hook
                        SectionHeader(title: "一句话记忆")
                        VStack(spacing: 8) {
                            Picker("模板", selection: $template) {
                                ForEach(TemplateKey.allCases, id: \.self) { t in
                                    Text(t.rawValue).tag(t)
                                }
                            }
                            .pickerStyle(.segmented)

                            if template == .D {
                                TextField("搞一句情话吧", text: $memoryHook)
                                    .textFieldStyle(.roundedBorder)
                                    .font(.custom("DM Sans", size: 14))
                            } else {
                                TemplateInput(template: template, text: $memoryHook)
                            }

                            Text("\(memoryHook.count)/20")
                                .font(.custom("DM Sans", size: 12))
                                .foregroundColor(memoryHook.count >= 20 ? .stamp : .concreteDark)
                                .frame(maxWidth: .infinity, alignment: .trailing)
                        }

                        // Body
                        SectionHeader(title: "详细记录")
                        TextEditor(text: $bodyText)
                            .frame(minHeight: 120)
                            .padding(8)
                            .background(.cardBg)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(.concrete.opacity(0.4))
                            )

                        // Vibe
                        SectionHeader(title: "Vibe Check")
                        VStack(spacing: 12) {
                            VibeSlider(label: "乐队表现", value: .constant(4), color: .vibeBand)
                            VibeSlider(label: "音响效果", value: .constant(4), color: .vibeSound)
                            VibeSlider(label: "现场氛围", value: .constant(4), color: .vibeAtmos)
                        }

                        // Submit
                        Button(action: submit) {
                            Text("保存记录")
                                .font(.custom("DM Sans", size: 15).weight(.bold))
                                .foregroundColor(.bone)
                                .frame(maxWidth: .infinity)
                                .frame(height: 44)
                                .background(.ink)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                    .padding()
                    .padding(.bottom, 100)
                }
                .background(.bone)
                .task { await loadShows() }
            }
        }
    }

    func loadShows() async {
        do {
            shows = try await APIClient.shared.fetch("/shows", auth: false)
        } catch {}
    }

    func submit() {}
}

struct TemplateInput: View {
    let template: RecordView.TemplateKey
    @Binding var text: String

    var body: some View {
        let placeholder: String = {
            switch template {
            case .A: return "____的那一刻，我____"
            case .B: return "这场演出像____"
            case .C: return "我在这场演出____"
            case .D: return ""
            }
        }()
        TextField(placeholder, text: $text)
            .textFieldStyle(.roundedBorder)
            .font(.custom("DM Sans", size: 14))
    }
}
