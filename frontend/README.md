# 底噪 Web 前端

移动端优先的 React 应用，对接 [backend](../backend) API。

## 功能（MVP）

- 登录 / 注册
- **现场**：演出列表、搜索、条目详情、记忆墙、Repo 列表
- **发现**：即将上演、热门、最新共鸣
- **记录**：发 Repo（默认私密、可公开）、上传图片、三维 Vibe
- **我的**：统计、个人时间线
- Repo 详情：点赞、评论

## 启动

**终端 1 — 后端**

```bat
cd backend
npm run start:dev
```

**终端 2 — 前端**

```bat
cd frontend
npm install
npm run dev
```

浏览器打开：**http://localhost:5173**

演示账号：`13800000001` / `demo123456`

## 说明

- 开发环境通过 Vite 代理 `/api` → `http://localhost:3000`，无需配置 CORS。
- 真机调试时在 `.env` 设置 `VITE_API_BASE=http://你的电脑IP:3000/api/v1`。
