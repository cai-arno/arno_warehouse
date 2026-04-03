# Docker 重启注意事项

## 启动顺序

### 1. 正常启动
```bash
cd ~/Projects/shortvideo_factory/infrastructure/docker
docker-compose up -d
```

### 2. 如果有旧容器冲突，先清理
```bash
# 查看当前容器状态
docker-compose ps -a

# 停止并移除所有容器
docker-compose down

# 如果还有残留容器，手动删除
docker rm -f shortvideo-backend shortvideo-frontend shortvideo-postgres shortvideo-redis

# 重新启动
docker-compose up -d
```

### 3. 完全重建（代码有更新时）
```bash
docker-compose up -d --build
```

## 常见问题

### 问题1：容器名称冲突
```
ERROR: Conflict. The container name "/shortvideo-backend" is already in use
```
**解决：** `docker rm -f shortvideo-backend`

### 问题2：Dockerfile 路径错误
```
unable to prepare context: unable to evaluate symlinks in Dockerfile path
```
**原因：** `docker-compose.yml` 中 `context` 和 `dockerfile` 路径配置错误

**正确配置参考：**
```yaml
services:
  backend:
    build:
      context: ../..                    # 项目根目录
      dockerfile: infrastructure/docker/Dockerfile.backend
  frontend:
    build:
      context: ../..                    # 项目根目录
      dockerfile: infrastructure/docker/Dockerfile.frontend
```

**Dockerfile 中 COPY 路径要点：**
- context 是项目根目录时，`COPY backend/pyproject.toml .` ✅
- context 是 `backend/` 目录时，`COPY pyproject.toml .` ✅

### 问题3：COPY 路径超出 build context
```
COPY failed: forbidden path outside the build context
```
**原因：** Dockerfile 中使用了 `COPY ../xxx` 访问 context 外部的文件

**解决：** 确保所有 COPY 的源路径都在 context 目录内

## 数据持久化

| 数据类型 | 存储位置 | 说明 |
|---------|---------|------|
| PostgreSQL | docker volume `postgres_data` | 不会丢失 |
| Redis | docker volume `redis_data` | 不会丢失 |
| 代码 | 本地 `backend/`、`frontend/` 目录 | 更新后需 `--build` |

## 重启后检查

```bash
# 检查所有服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend

# 测试 API
curl http://localhost:8000/docs
```

## 服务地址

- 前端：http://localhost:3000
- 后端 API：http://localhost:8000
- PostgreSQL：localhost:5432
- Redis：localhost:6379

---

*最后更新：2026-04-03*
