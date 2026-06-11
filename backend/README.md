# 底噪 API（Background Noise Backend）

NestJS + Prisma + SQLite，覆盖 **MVP P0** 能力：账号、演出条目、Repo（私密默认/公开）、记忆墙、点赞评论、个人时间线、搜索、发现页、举报（P1 基础）、媒体上传。

**MVP 不含**：POA（Epic E）、私聊、小群。

## 快速开始

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run start:dev
```

- 服务根地址（健康检查）：`http://localhost:3000/api/v1` → 应返回 `{"ok":true,...}`
- 业务接口在子路径，例如 `/api/v1/discover`、`/api/v1/auth/login`

演示账号：`13800000001` / `demo123456`

### Windows 清理构建产物

在 **cmd** 中请用（不要用 PowerShell 专用的 `Remove-Item`）：

```bat
npm run clean
npm run build
```

或 cmd 原生命令：`rmdir /s /q dist`（若存在 dist 目录）

## 主要接口

| 模块 | 方法 | 路径 |
|------|------|------|
| 认证 | POST | `/auth/register` `/auth/login` |
| 认证 | GET | `/auth/me` |
| 用户 | PATCH | `/users/me` `/users/me/privacy` |
| 用户 | GET | `/users/me/stats` `/users/:id` |
| 演出 | GET/POST | `/shows` `/shows/upcoming` `/shows/hot` |
| 演出 | GET | `/shows/:id` `/shows/:id/memory-wall`（记忆墙在 repos 下） |
| Repo | POST/GET/PATCH/DELETE | `/repos` `/repos/:id` |
| Repo | GET | `/shows/:showId/repos?sort=hot\|latest&memoryHook=` |
| Repo | GET | `/shows/:showId/memory-wall` |
| Repo | GET | `/repos/me/timeline` `/repos/me/map` |
| 互动 | POST/DELETE | `/repos/:repoId/like` |
| 互动 | GET/POST | `/repos/:repoId/comments` |
| 媒体 | POST | `/media/upload`（multipart `file`） |
| 搜索 | GET | `/search?q=&type=all\|show\|artist\|venue` |
| 发现 | GET | `/discover` |
| 举报 | POST | `/reports` |

请求头：`Authorization: Bearer <accessToken>`

## 切换 PostgreSQL

`.env` 中设置：

```
DATABASE_URL="postgresql://user:pass@localhost:5432/background_noise"
```

`prisma/schema.prisma` 中 `provider` 改为 `postgresql`，然后 `npx prisma migrate dev`。

## 目录结构

```
src/
  auth/ users/ shows/ repos/ media/
  likes/ comments/ search/ discover/ reports/
  prisma/ common/
```

架构原则见仓库 [docs/ARCHITECTURE-PRINCIPLES.md](../docs/ARCHITECTURE-PRINCIPLES.md)。
