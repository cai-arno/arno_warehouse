# 短视频工厂系统 (ShortVideo Factory)

> 从"手工作坊"到"自动化工厂" — AI 驱动的新一代短视频生产平台

## 项目状态

🚀 **MVP 开发中** — 核心功能已实现

| 模块 | 状态 |
|------|------|
| AI 脚本生成 | ✅ 完成 |
| 视频渲染引擎 | ✅ 完成 |
| 素材管理 | ✅ 完成 |
| 平台发布 | ✅ 完成 |
| 移动端 App | 🔄 开发中 |
| 数据看板 | 🔄 开发中 |

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite + Ant Design + TailwindCSS |
| 后端 | Python 3.11 + FastAPI + SQLModel + PostgreSQL + Redis |
| 视频处理 | FFmpeg |
| AI | OpenAI / Anthropic API |
| 部署 | Docker + Docker Compose |

## 项目结构

```
shortvideo_factory/
├── backend/               # FastAPI 后端
│   ├── app/
│   │   ├── api/          # API 路由 (scripts/videos/materials/templates/publishing)
│   │   ├── core/         # 核心配置 (config/database)
│   │   ├── models/       # 数据模型 (SQLModel)
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # 业务逻辑 (script_generator/video_renderer/publisher)
│   ├── alembic/          # 数据库迁移
│   └── pyproject.toml
│
├── frontend/              # React 前端
│   ├── src/
│   │   ├── pages/        # 页面 (Home/Scripts/Videos/Materials/Publishing)
│   │   ├── components/   # 通用组件 (Layout)
│   │   ├── services/     # API 调用
│   │   └── stores/       # 状态管理
│   └── package.json
│
├── infrastructure/        # 基础设施
│   ├── docker/            # Docker 配置
│   └── .github/workflows/ # CI/CD
│
└── docs/                  # 文档 (原型/技术方案/开发计划/竞品分析)
```

## 快速开始

### 1. 启动基础设施

```bash
cd infrastructure/docker
docker-compose up -d postgres redis
```

### 2. 数据库迁移

```bash
cd backend
cp .env.example .env  # 编辑并填入 API Key
alembic upgrade head
```

### 3. 启动后端

```bash
uv sync
uv run uvicorn app.main:app --reload
```

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

## 环境变量

后端 `.env` 必需配置：

```env
# AI API（至少配置一个）
OPENAI_API_KEY=sk-xxx          # OpenAI API Key
ANTHROPIC_API_KEY=sk-ant-xxx   # Anthropic API Key

# 数据库
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/shortvideo

# Redis
REDIS_URL=redis://localhost:6379/0
```

## API 文档

启动后端后访问: http://localhost:8000/docs

## 核心流程

```
输入主题 → AI 生成脚本 → 选择模板 → 自动剪辑 → 多平台发布
```

## 开发团队

- ⚖️ 天衡 (AI 助手) — 项目负责人 / 任务分配
- 绘颜 — 前端 UI 专家
- 墨令 — 后端开发专家
- 校符 — 测试专家

## License

MIT
