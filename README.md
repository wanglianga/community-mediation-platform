# 社区矛盾纠纷调解平台

面向社区网格员、调解员、当事人和街道司法所的全流程矛盾调解管理系统。

## 原始需求

> 搭建一个给社区网格员、调解员、当事人和街道司法所使用的矛盾调解平台，Vue3 页面展示案件池、调解进度、协议履行和回访提醒，NestJS 保存纠纷材料、会议记录、协议条款和督办结果。网格员登记邻里噪声、停车占位、物业收费、家庭赡养等纠纷线索；调解员安排调解时间、参会人员、诉求和证据材料；当事人确认协议条款、履行节点和补充说明；司法所查看重大纠纷、超期案件和回访结果。系统要把线索受理、分派调解、会议记录、协议签署、履行跟踪、回访督办连成闭环。拒绝参会、协议逾期、重复投诉、情绪升级要分别影响案件状态。
> 增加多方参会协调。纠纷涉及物业、业委会或亲属时，调解员可以追加参会方；系统记录每方诉求、是否到场和缺席原因，关键方缺席时会议不能直接生成最终协议。
> 加入协议履行节点。调解协议可以拆成多个履行事项，例如挪车、补缴费用、维修漏水和道歉；每个节点有责任人、期限和证据照片，逾期后进入督办。

## 项目简介

### 核心业务闭环

```
线索受理 → 分派调解 → 会议记录 → 协议签署 → 履行跟踪 → 回访督办
     ↓          ↓          ↓          ↓          ↓          ↓
  网格员      调解员      调解员      当事人    各方协作    网格员/司法所
```

### 四种角色

| 角色 | 账号 | 权限范围 |
|------|------|----------|
| 社区网格员 | 张网格员 | 线索登记、走访记录、回访执行 |
| 调解员 | 李调解员 | 案件分派、会议安排、协议草拟 |
| 当事人 | 王当事人 | 查看进度、确认协议、履行节点 |
| 街道司法所 | 赵司法所 | 全量案件、重大督办、超期监控 |

> 登录页可直接选择角色体验，无需密码

### 状态影响规则

| 事件 | 触发影响 |
|------|----------|
| 当事人拒绝参会 | 状态 `meeting_refused`，拒会计数 +1，≥2 次情绪升级 |
| 协议履行逾期 | 状态 `fulfillment_overdue`，逾期计数 +1，标记逾期 |
| 重复投诉 | 状态 `repeat_complaint`，重复计数 +1，情绪升级 |
| 情绪升级 | 状态 `escalated`，标记重大纠纷，情绪等级 = 5 |

## 技术栈

### 前端
- Vue 3 + TypeScript + Composition API
- Vite 5 构建工具
- Vue Router 4 路由（12个页面）
- Pinia 状态管理
- TailwindCSS 3 样式系统
- Lucide Vue Next 图标
- dayjs 时间处理
- Axios + Mock 双模式（后端不可用时自动降级）

### 后端
- NestJS 10 + TypeScript
- 模块化架构（Cases / Clues / Meetings / Agreements / Followups / Stats）
- 内存存储 InMemoryStore（启动即用，无需数据库）
- dayjs 时间处理
- CORS 全局开启

### 部署
- Docker Compose 一键编排
- Nginx 承载前端 + 反向代理后端 API

## 启动方式

### 前置要求

- Node.js ≥ 18
- Docker ≥ 20.10
- Docker Compose ≥ 2.0
- pnpm 或 npm（推荐 pnpm）

### 方式一：Docker 一键启动（推荐）

#### 1. 构建并启动（前台）

```bash
docker compose up --build
```

#### 2. 构建并启动（后台）

```bash
docker compose up --build -d
```

启动后访问：
- 前端页面：http://localhost:8080
- 后端 API：http://localhost:3000/api/cases

#### 3. 查看日志

```bash
docker compose logs -f
```

#### 4. 停止并清理

```bash
docker compose down
```

### 方式二：本地开发启动

#### 1. 安装依赖

后端：
```bash
cd backend
npm install
```

前端：
```bash
cd frontend
npm install
```

#### 2. 启动后端（端口 3000）

```bash
cd backend
npm run start:dev
```

后端启动验证：
```bash
curl http://localhost:3000/api/cases
```

#### 3. 启动前端（端口 5173）

另开终端：
```bash
cd frontend
npm run dev
```

访问地址：http://localhost:5173

> 前端已配置 `/api` 代理到 `http://localhost:3000`

### 方式三：仅前端 Mock 模式（无需后端）

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173，所有 API 请求自动使用内置 Mock 数据，可独立体验完整功能。

## 目录结构

```
.
├── frontend/                    # Vue3 前端
│   ├── src/
│   │   ├── pages/               # 12个页面组件
│   │   ├── layouts/             # 主布局（含角色切换）
│   │   ├── stores/              # Pinia 用户/角色状态
│   │   ├── router/              # 路由配置
│   │   ├── api/                 # Axios 请求封装
│   │   ├── mock/                # Mock 数据 + 降级层
│   │   └── types/               # TS 类型定义（20+ 状态枚举）
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── backend/                     # NestJS 后端
│   ├── src/
│   │   ├── modules/             # 6个业务模块
│   │   │   ├── cases/           # 案件管理（含状态机 + 风险联动）
│   │   │   ├── clues/           # 线索登记
│   │   │   ├── meetings/        # 调解会议
│   │   │   ├── agreements/      # 协议条款 + 履行节点
│   │   │   ├── followups/       # 回访督办
│   │   │   └── stats/           # 统计看板
│   │   └── store/               # InMemoryStore 全局内存存储
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml           # 根目录编排文件
├── Dockerfile                   # 根目录入口（默认构建后端）
├── .dockerignore
└── README.md
```

## API 接口概览

| 模块 | 路由前缀 | 主要接口 |
|------|----------|----------|
| 案件 | `/api/cases` | `GET /` 列表 `GET /stats` 统计 `GET /supervision` 督办 `PUT /:id/status` 更新状态 |
| 线索 | `/api/clues` | `POST /` 登记 `PUT /:id/accept` 受理 `PUT /:id/reject` 驳回 |
| 会议 | `/api/meetings` | `POST /` 创建 `PUT /:id/complete` 完成 `PUT /:id/refuse` 拒会记录 |
| 协议 | `/api/agreements` | `POST /` 草拟 `PUT /:id/sign` 签署 `PUT /:id/reject` 拒绝 |
| 履行 | `/api/agreements/:id/fulfillments` | `GET /` 节点列表 `PUT /nodes/:nodeId` 更新节点 |
| 回访 | `/api/followups` | `POST /` 创建 `PUT /:id/complete` 完成 `GET /upcoming` 待办 |
| 统计 | `/api/stats` | `GET /` 看板统计 |

## 页面列表（12 个）

1. **登录页** — 4 角色卡片式登录，体验不同视角
2. **首页看板** — 统计卡片 + 月度趋势 + 类别分布 + 待办
3. **案件池** — 双视图 + 多维筛选 + 风险标签组
4. **调解进度** — 6 阶段流水线可视化 + 风险筛选
5. **线索登记** — 完整表单 + 4 类纠纷快速模板
6. **线索列表** — 线索受理 / 驳回
7. **调解会议** — 会议 CRUD + 拒会记录触发状态升级
8. **协议签署** — 条款草拟 + 多方签名可视化 + 须知弹窗
9. **履行跟踪** — 环形进度 + 节点状态机 + 逾期侧栏
10. **回访督办** — 4 方式回访 + 5 星评分 + 联动重复投诉
11. **司法所督办** — 重大/逾期/重复/高风险 5 类筛选 + 操作弹窗
12. **案件详情** — 全景视图：当事人 + 协议 + 会议 + 风险评估 + 流转时间线

## 注意事项

1. **数据存储**：后端使用内存存储，进程重启数据会丢失，适合演示使用；如需持久化请替换为 PostgreSQL / MySQL
2. **权限演示**：角色切换位于顶栏右上角，无需登录凭据，适合演示四种视角
3. **API 降级**：前端后端不可用时自动切到 Mock，不会白屏
4. **Docker 验证**：首次构建时 npm ci 较慢属正常，后续构建有缓存
5. **端口占用**：若 8080 或 3000 被占用，请修改 `docker-compose.yml` 的 ports 映射
