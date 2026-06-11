# 底噪 (Background Noise) — 产品记忆

> 项目路径：H:\DevTools\WNMP\www\background-noise
> 技术栈：NestJS + Prisma + SQLite + React + Vite
> 阶段：MVP P0 已完成，v0.2 社交版已设计

## 产品定位
独立音乐/摇滚/Live House 演出记录与同好社交平台。

## v0.2 社交版功能（已出文档）

### 共同记忆撞上 — 三层匹配引擎

**触发时机**：发布 Repo 后、浏览条目页时

| 层级 | 逻辑 | 输出 |
|------|------|------|
| Lv1 撞演出 | 查同场 Show 下所有 ATTENDED 用户 | 计数 |
| Lv2 撞记忆 | 在 Lv1 基础上筛语义相似的 Repo 或 memoryHook 点赞 | 半匿名卡片（记忆标签，不暴露身份） |
| Lv3 撞 vibe | 三维评分差≤1，审美重合度计算 | 完整用户信息 + 重合度% |

### 同场盲盒（C-05）
- 发现页每日推匿名卡片
- 点击「我也这么觉得」→ 揭晓身份，建立连接
- 零社交压力，共鸣驱动

### AI 能力
- **A-01 多声线扩写**：RecordPage 下方「AI 帮我写」，三种风格（感官轰炸/冷峻纪实/段子手）。失败不可阻塞发布
- **A-02 AI 标签建议**：自由模式下从正文提取关键词，建议 1-3 个记忆标签

### 数据模型变更
- 新增 2 张表
- 修改 4 个字段
- 新增枚举：MatchStatus { PENDING, CONNECTED, DISMISSED }
- API 共 18 个接口变动（10 修改 + 8 新增）
- 前端 7 个页面改动
- 验收标准：27 条检查清单

### 文档位置
H:\DevTools\WNMP\www\background-noise\docs\v0.2-social-memory-features.md
