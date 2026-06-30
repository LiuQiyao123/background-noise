import Foundation

let mockShows: [Show] = [
    .init(id: 1, artistName: "声音玩具", title: "劳动之余 2025巡演 深圳站", venueName: "B10 Live", city: "深圳",
          showDate: "2025-12-20", coverUrl: nil,
          stats: .init(publicRepoCount: 42, attendCount: 128, avgVibe: .init(band: 4.2, sound: 4.5, atmosphere: 3.8))),
    .init(id: 2, artistName: "法兹", title: "东方101 巡演 广州站", venueName: "MAO Livehouse", city: "广州",
          showDate: "2025-11-15", coverUrl: nil,
          stats: .init(publicRepoCount: 38, attendCount: 95, avgVibe: .init(band: 4.8, sound: 4.2, atmosphere: 4.6))),
    .init(id: 3, artistName: "痛仰乐队", title: "2025 全国巡演 北京站", venueName: "疆进酒", city: "北京",
          showDate: "2025-10-08", coverUrl: nil,
          stats: .init(publicRepoCount: 156, attendCount: 500, avgVibe: .init(band: 4.5, sound: 4.0, atmosphere: 4.8))),
    .init(id: 4, artistName: "惘闻", title: "辛丑｜壬寅 巡演 上海站", venueName: "Modern Sky Lab", city: "上海",
          showDate: "2025-09-22", coverUrl: nil,
          stats: .init(publicRepoCount: 67, attendCount: 210, avgVibe: .init(band: 4.7, sound: 4.9, atmosphere: 4.3))),
    .init(id: 5, artistName: "万能青年旅店", title: "冀西南林路行 巡演", venueName: "VOX Livehouse", city: "武汉",
          showDate: "2025-08-30", coverUrl: nil,
          stats: .init(publicRepoCount: 234, attendCount: 680, avgVibe: .init(band: 4.9, sound: 4.3, atmosphere: 4.7))),
    .init(id: 6, artistName: "重塑雕像的权利", title: "2025 巡演 杭州站", venueName: "酒球会", city: "杭州",
          showDate: "2025-07-14", coverUrl: nil,
          stats: .init(publicRepoCount: 89, attendCount: 320, avgVibe: .init(band: 4.6, sound: 4.8, atmosphere: 4.1))),
]
