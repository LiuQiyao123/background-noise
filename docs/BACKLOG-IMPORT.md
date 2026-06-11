# 功能清单导入 Notion / Jira

数据源：

| 文件 | 用途 |
|------|------|
| [feature-backlog.csv](./feature-backlog.csv) | 通用；列：`epic`, `id`, `title`, `priority`, `depends_on` |
| [feature-backlog-jira.csv](./feature-backlog-jira.csv) | Jira 推荐；多 `summary`、`issue_type` 列 |

MVP 范围以 [MVP-AND-SOCIAL-DECISIONS.md](./MVP-AND-SOCIAL-DECISIONS.md) 为准：**P0 = MVP**，**不含 Epic E（POA）**。

---

## Notion

1. 新建页面 → **Table – Full page**（或 Board）。
2. 表头 **`···`** → **Merge with CSV** / **Import** → 选择 `feature-backlog.csv`。
3. 列映射建议：

   | CSV 列 | Notion 属性 |
   |--------|-------------|
   | `id` | Title 或 Text（ID） |
   | `title` | Text（若 Title 用 id，可把 title 放副标题） |
   | `epic` | Select（A–J） |
   | `priority` | Select（P0 / P1 / P2 / P3） |
   | `depends_on` | Text（二期再建 Relation） |

4. **MVP 视图**：筛选 `priority` = `P0`；再确认列表中 **无 E1–E6、无 G4/G5**。
5. **按 Epic 分组**：Group by `epic`。
6. **依赖**：CSV 无法直接生成依赖边。关键链见 [FEATURE-BACKLOG.md](./FEATURE-BACKLOG.md) 中的 mermaid；`depends_on` 多值用逗号分隔，重要项可手动建 **Relation → Depends on**。

### Notion 可选：合并标题

导入后新增 Formula 属性 `display`：

```
prop("id") + " " + prop("title")
```

再将 `display` 设为 Title 显示列。

---

## Jira Cloud

### 方式 A：CSV 导入（推荐用 jira 专用文件）

1. **项目设置** → **⋯** → **Import**（或站点 **Settings → External imports → CSV**）。
2. 选择目标项目。
3. 上传 **`feature-backlog-jira.csv`**。
4. 字段映射：

   | CSV 列 | Jira 字段 |
   |--------|-----------|
   | `summary` | Summary |
   | `issue_type` | Issue Type（需项目已启用 Story） |
   | `priority` | Priority（先在项目中创建 P0–P3，或映射到 Highest/High/Medium/Low） |
   | `epic` | Component 或自定义字段 **Epic** / Epic Link |
   | `title` | Description |
   | `depends_on` | 通常 **不映射**（见下方补链） |

5. 导入完成后，对 `depends_on` 非空行批量建 **Issue Link → blocks**（由依赖方指向被依赖方，按团队习惯统一即可）。

### 方式 B：通用 CSV

使用 `feature-backlog.csv`，将 **Summary** 映射为 `id` + 空格 + `title`（或导入前自行拼列）。

### Jira 优先级映射示例

若项目无 P0–P3 自定义优先级，导入映射建议：

| CSV | Jira 默认 |
|-----|-----------|
| P0 | Highest |
| P1 | High |
| P2 | Medium |
| P3 | Low |

### 导入后 JQL

```jql
priority = P0 ORDER BY epic, key
```

（若用默认优先级名，改为 `priority = Highest`。）

### Sprint 规划

- 第一个 Sprint 只拉 **P0**；核对 **零条** `epic = E` 且 **零条** `id in (G4, G5)`。
- POA（E1–E6）应在 **P2** backlog，不进 MVP Sprint。

---

## 导入后校验清单

- [ ] P0 条数与 [FEATURE-BACKLOG.md](./FEATURE-BACKLOG.md) 中 P0 表一致
- [ ] 无 E1–E6 为 P0
- [ ] G1、G2 为 P0；G4、G5 非 P0
- [ ] C5 描述为「热门/最新」，无「已验证」文案
- [ ] `C4 → G1 → G2` 依赖在工具中可追踪（Link 或文档）

---

## 更新清单后重新导入

1. 修改 `feature-backlog.csv`（及必要时重新生成 `feature-backlog-jira.csv`）。
2. Notion：**Merge with CSV** 会追加或更新行（注意去重 `id`）。
3. Jira：对已存在 issue 用 **CSV 更新导入** 或手动改 Priority；大批量变更建议脚本 + REST API。
