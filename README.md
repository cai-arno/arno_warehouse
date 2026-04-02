# 短视频工厂系统 (ShortVideo Factory)

> 从"手工作坊"到"自动化工厂" — AI 驱动的新一代短视频生产平台

## 项目状态

🚧 **开发中** — 架构搭建已完成 (Phase 1)

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
│   │   ├── api/           # API 路由
│   │   ├── core/          # 核心配置
│   │   ├── models/        # 数据模型
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # 业务逻辑
│   └── pyproject.toml
│
├── frontend/              # React 前端
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── components/    # 通用组件
│   │   ├── services/      # API 调用
│   │   └── stores/        # 状态管理
│   └── package.json
│
├── infrastructure/        # 基础设施
│   ├── docker/            # Docker 配置
│   └── .github/workflows/ # CI/CD
│
└── docs/                  # 文档
```

## 快速开始

### 1. 启动基础设施 (Docker)

```bash
cd infrastructure/docker
docker-compose up -d postgres redis
```

### 2. 启动后端

```bash
cd backend
cp .env.example .env  # 编辑并填入 API Key
uv sync
uv run uvicorn app.main:app --reload
```

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

## API 文档

启动后端后访问: http://localhost:8000/docs

## 核心功能

- ✅ **脚本生成** — AI 批量生成爆款文案
- 🔄 **视频剪辑** — 模板化自动剪辑 (开发中)
- 🔄 **素材中心** — 素材上传与管理 (开发中)
- 🔄 **多平台发布** — 抖音/快手/视频号 (开发中)
- 📋 **数据看板** — (规划中)

## License

MIT
