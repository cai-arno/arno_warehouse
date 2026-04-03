# 短视频工厂 - 测试日志

**测试时间：** 2026-04-03 15:46 GMT+8  
**测试人：** 天衡 AI 助手（自动化测试）

---

## 测试结果汇总

```
测试项                          | 状态   | 详情
-------------------------------|--------|----------------------------------
FastAPI 文档 (http://localhost:8000/docs) |  ✅    | HTTP 200，正常加载 Swagger UI
/health 端点                    |  ✅    | HTTP 200
POST /api/v1/auth/send-code     |  ✅    | 正常发送验证码（硬编码 123456）
POST /api/v1/scripts/generate   |  ✅    | 需认证，未认证时返回 401（符合预期）
GET /api/v1/videos              |  ✅    | 需认证，未认证时返回 401（符合预期）
GET /api/v1/analytics/overview  |  ✅    | HTTP 200，无需认证
GET /api/v1/templates           |  ✅    | HTTP 200 - 已修复（B在这里 → 见下方）
GET /api/v1/scripts             |  ✅    | 需认证，未认证时返回 401
前端页面 (http://localhost:3000) |  ✅    | HTTP 200，HTML 正常返回，标题"短视频工厂"
Docker 服务状态                 |  ✅    | frontend/backend/postgres/redis 全部 Up
PostgreSQL 连接                 |  ✅    | 所有容器正常连接 postgres:5432
PostgreSQL Schema               |  ⚠️    | 数据库名为 shortvideo（非 shortvideo_factory）
```

---

## 🛠️ Bug 修复记录（2026-04-03 16:10 GMT+8）

### ✅ Bug 1 已修复: templates.user_id 列不存在

**影响接口：** `GET /api/v1/templates` → 原来返回 500
**修复方式：**
1. 直接在数据库执行：`ALTER TABLE templates ADD COLUMN user_id VARCHAR(12)`
2. 新增 Alembic 迁移：`backend/alembic/versions/004_add_template_user_id.py`（确保可重现）
3. 该迁移同步添加 index + foreign key 与 users 表关联

**验证结果：**
```bash
$ curl http://localhost:8000/api/v1/templates
{"items":[],"total":0}   # HTTP 200 ✅
```

---

### ✅ Bug 2 已修复: users.id 类型不匹配

**影响功能：** `get_current_user()` → 原来报错 `invalid input for query argument $1: 2 (expected str, got int)`
**根因：** `dependencies.py` 中 `session.get(User, int(user_id))` 将字符串 ID（如 `"USRS00000002"`）转成 int
**修复方式：** 移除 `int()` 转换，直接使用字符串 ID

```diff
- user = await session.get(User, int(user_id))
+ user = await session.get(User, user_id)
```

**验证结果：**
```bash
# 登录获取 token
$ curl -X POST "http://localhost:8000/api/v1/auth/login?phone=18180769518&code=123456"
{"access_token":"...","user":{"id":"USRS00000002",...}}  # HTTP 200 ✅

# 用 token 请求 /auth/me
$ curl http://localhost:8000/api/v1/auth/me -H "Authorization: Bearer $TOKEN"
{"id":"USRS00000002","phone":"18180769518","nickname":"用户9518",...}  # HTTP 200 ✅
```

---

## 服务健康状态

| 容器名                | 状态 | 端口映射                    | 健康检查 |
|----------------------|------|---------------------------|---------|
| shortvideo-frontend  | Up   | 0.0.0.0:3000->3000/tcp     | -       |
| shortvideo-backend   | Up   | 0.0.0.0:8000->8000/tcp     | -       |
| shortvideo-postgres  | Up   | 0.0.0.0:5432->5432/tcp     | healthy |
| shortvideo-redis      | Up   | 0.0.0.0:6379->6379/tcp     | healthy |

---

## 数据库信息

- **数据库名：** `shortvideo`（注意：不是 `shortvideo_factory`）
- **表结构：** materials, publish_records, scripts, templates, users, videos
- **测试用户：** USRS00000001（phone: 13800138000）

---

## Git 提交

```
commit ad5e48d
fix: 修复 templates.user_id 列缺失和 users.id 类型不匹配
- Bug 1 (高): templates 表缺少 user_id 列 → 添加迁移 004
- Bug 2 (中): dependencies.py 移除 int() 转换，使用字符串 ID
```

---

## 总结

- **Bug 1 & Bug 2：已全部修复并验证**
- **验证码发送功能：** 正常工作（但验证码为硬编码 123456）
- **后续建议：** 重新部署时需执行 `alembic upgrade head` 应用新迁移
