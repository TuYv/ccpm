---
name: claimable-postgres
description: >-
  Provision instant temporary Postgres databases via Claimable Postgres by Neon
  (neon.new) with no login, signup, or credit card. Supports REST API, CLI, and
  SDK. Use when users ask for a quick Postgres environment, a throwaway
  DATABASE_URL for prototyping/tests, or "just give me a DB now". Triggers
  include: "quick postgres", "temporary postgres", "no signup database",
  "no credit card database", "instant DATABASE_URL", "npx neon-new", "neon.new",
  "neon.new API", "claimable postgres API".
metadata:
  parent: neon
---
**首先**：使用父级 `neon` skill 了解 Neon 概览、Neon 入门指南、Neon 开发最佳实践等内容。

如果尚未安装 `neon` skill，请从 https://neon.com/docs/ai/skills/neon/SKILL.md 获取，或使用以下命令安装：

```bash
npx skills add neondatabase/agent-skills --skill neon
```

# 可认领的 Postgres

用于本地开发、演示、原型设计和测试环境的即时 Postgres 数据库。无需账户。除非认领到 Neon 账户，否则数据库将在 72 小时后过期。

## 快速开始

```bash
curl -s -X POST "https://neon.new/api/v1/database" \
  -H "Content-Type: application/json" \
  -d '{"ref": "agent-skills"}'
```

从 JSON 响应中解析 `connection_string` 和 `claim_url`。将 `connection_string` 作为 `DATABASE_URL` 写入项目的 `.env`。

有关其他方法（CLI、SDK、Vite 插件），请参阅下方的[选择哪种方法？](#which-method)。

## 选择哪种方法？

- **REST API**：返回结构化 JSON。除 `curl` 外没有运行时依赖。当代理需要可预测的输出和错误处理时，优先使用此方法。
- **CLI**（`npx neon-new@latest --yes`）：使用一条命令配置数据库并写入 `.env`。当 Node.js 可用且用户希望进行简单设置时，此方法很方便。
- **SDK**（`neon-new/sdk`）：用于在 Node.js 中编写脚本或以编程方式配置数据库。
- **Vite 插件**（`vite-plugin-neon-new`）：如果缺少 `DATABASE_URL`，则在执行 `vite dev` 时自动配置数据库。当用户拥有 Vite 项目时使用。
- **浏览器**：用户无法运行 CLI 或调用 API。引导其访问 https://neon.new。

## 自动配置

如果代理需要数据库来完成任务（例如，“为我构建一个使用真实数据库的待办事项应用”），而用户尚未提供连接字符串，则通过 API 配置一个数据库并告知用户。请提供认领 URL，以便用户能够保留该数据库。

## 代理工作流

### API 路径

1. **确认意图：**如果请求含义不明确，请确认用户是否需要一个临时且无需注册的数据库。如果用户明确要求快速或临时数据库，则跳过此步骤。
2. **配置：**向 `https://neon.new/api/v1/database` 发送 POST 请求，并携带 `{"ref": "agent-skills"}`。
3. **解析响应：**从 JSON 响应中提取 `connection_string`、`claim_url` 和 `expires_at`。
4. **写入 .env：**将 `DATABASE_URL=<connection_string>` 写入项目的 `.env`（或用户首选的文件和键）。未经确认，不要覆盖现有键。
5. **填充种子数据（如需要）：**如果用户有种子 SQL 文件，请针对新数据库运行该文件：
   ```bash
   psql "$DATABASE_URL" -f seed.sql
   ```
6. **报告：**涵盖[输出检查清单](#output-checklist)中的每一项。
7. **可选：**提议执行快速连接测试（例如 `SELECT 1`）。

### CLI 路径

1. **检查 .env：**检查目标 `.env` 中是否已有 `DATABASE_URL`（或选定的键）。如果存在，则不要运行。提供删除、`--env` 或 `--key` 选项并获取确认（请参阅[运行前检查](#pre-run-check)）。
2. **确认意图：**如果请求含义不明确，请确认用户是否需要一个临时且无需注册的数据库。如果用户明确要求快速或临时数据库，则跳过此步骤。
3. **收集选项：**除非上下文另有暗示（例如，用户提到自定义环境文件、种子 SQL 或逻辑复制），否则使用默认值。
4. **运行：**使用 `@latest --yes` 加上已确认的选项执行命令。始终使用 `@latest`，以避免使用过时的缓存版本。`--yes` 会跳过可能导致代理停滞的交互式提示。
   ```bash
   npx neon-new@latest --yes --ref agent-skills --env .env.local --seed ./schema.sql
   ```
5. **验证：**确认连接字符串已写入预期文件。
6. **报告：**涵盖[输出检查清单](#output-checklist)中的每一项。
7. **可选：**提议执行快速连接测试（例如 `SELECT 1`）。

### 输出检查清单

始终报告：

- 连接字符串写入的位置（例如 `.env`）
- 使用的变量键（`DATABASE_URL` 或自定义键）
- 认领 URL（来自 `.env` 或 API 响应）
- 未认领的数据库是临时的（72 小时）：数据库现在即可使用，在 72 小时内认领可将其永久保留

## 安全和用户体验注意事项

- 不要覆盖现有的环境变量。先进行检查，然后使用 `--env` 或 `--key`（CLI），或者跳过写入（API），以避免冲突。
- 在运行破坏性的种子 SQL（`DROP`、`TRUNCATE`、批量 `DELETE`）之前先征得同意。
- 对于生产工作负载，建议使用标准的 Neon 预配，而不是可临时认领的数据库。
- 如果用户需要长期持久化，请指示他们立即打开认领 URL。
- 将凭据写入 .env 文件后，检查该文件是否已包含在 .gitignore 中。如果没有，请警告用户。未经确认，不要修改 `.gitignore`。

## REST API

**基础 URL：** `https://neon.new/api/v1`

### 创建数据库

```bash
curl -s -X POST "https://neon.new/api/v1/database" \
  -H "Content-Type: application/json" \
  -d '{"ref": "agent-skills"}'
```

| 参数                         | 必需 | 描述                                                                                                              |
| ---------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------- |
| `ref`                        | 是   | 用于标识数据库预配方的跟踪标签。通过此 Skill 进行预配时，请使用 `"agent-skills"`。                                 |
| `enable_logical_replication` | 否   | 启用逻辑复制（默认值：false，启用后无法禁用）                                                                     |

API 返回的 `connection_string` 是池化连接 URL。如需直接（非池化）连接（例如用于 Prisma 迁移），请从主机名中移除 `-pooler`。CLI 会自动写入池化和直接连接 URL。

**响应：**

```json
{
  "id": "019beb39-37fb-709d-87ac-7ad6198b89f7",
  "status": "UNCLAIMED",
  "neon_project_id": "gentle-scene-06438508",
  "connection_string": "postgresql://...",
  "claim_url": "https://neon.new/claim/019beb39-...",
  "expires_at": "2026-01-26T14:19:14.580Z",
  "created_at": "2026-01-23T14:19:14.580Z",
  "updated_at": "2026-01-23T14:19:14.580Z"
}
```

### 检查状态

```bash
curl -s "https://neon.new/api/v1/database/{id}"
```

返回相同结构的响应。状态转换：`UNCLAIMED` -> `CLAIMING` -> `CLAIMED`。数据库被认领后，`connection_string` 返回 `null`。

### 错误响应

| 条件                   | HTTP | 消息                             |
| ---------------------- | ---- | -------------------------------- |
| 缺少 `ref` 或其为空    | 400  | `Missing referrer`               |
| 无效的数据库 ID        | 400  | `Database not found`             |
| 无效的 JSON 请求体     | 500  | `Failed to create the database.` |

## CLI

```bash
npx neon-new@latest --yes
```

一步完成数据库预配，并将连接字符串写入 `.env`。始终使用 `@latest` 和 `--yes`（跳过可能导致代理停滞的交互式提示）。

### 运行前检查

检查目标 `.env` 中是否已存在 `DATABASE_URL`（或所选键）。如果 CLI 发现该键，则会退出且不进行预配。

如果该键已存在，请向用户提供三个选项：

1. 删除或注释掉现有行，然后重新运行。
2. 使用 `--env` 写入其他文件（例如 `--env .env.local`）。
3. 使用 `--key` 以其他变量名写入。

继续操作前需获得确认。

### 选项

| 选项                    | 别名  | 说明                                                                  | 默认值         |
| ----------------------- | ----- | --------------------------------------------------------------------- | -------------- |
| `--yes`                 | `-y`  | 跳过提示并使用默认值                                                  | `false`        |
| `--env`                 | `-e`  | .env 文件路径                                                         | `./.env`       |
| `--key`                 | `-k`  | 连接字符串环境变量键                                                  | `DATABASE_URL` |
| `--prefix`              | `-p`  | 生成的公共环境变量的前缀                                              | `PUBLIC_`      |
| `--seed`                | `-s`  | 种子 SQL 文件的路径                                                   | 无             |
| `--logical-replication` | `-L`  | 启用逻辑复制                                                          | `false`        |
| `--ref`                 | `-r`  | 引荐来源 ID（通过此 Skill 进行预配时使用 `agent-skills`）             | 无             |

其他包管理器：`yarn dlx neon-new@latest`、`pnpm dlx neon-new@latest`、`bunx neon-new@latest`、`deno run -A neon-new@latest`。

### 输出

CLI 会写入目标 `.env`：

```
DATABASE_URL=postgresql://...              # pooled (use for application queries)
DATABASE_URL_DIRECT=postgresql://...       # direct (use for migrations, e.g. Prisma)
PUBLIC_POSTGRES_CLAIM_URL=https://neon.new/claim/...
```

## SDK

用于脚本和程序化预配流程。

```typescript
import { instantPostgres } from "neon-new";

const { databaseUrl, databaseUrlDirect, claimUrl, claimExpiresAt } =
  await instantPostgres({
    referrer: "agent-skills",
    seed: { type: "sql-script", path: "./init.sql" },
  });
```

返回 `databaseUrl`（池化连接）、`databaseUrlDirect`（直接连接，用于迁移）、`claimUrl` 和 `claimExpiresAt`（Date 对象）。`referrer` 参数为必填项。

## Vite 插件

对于 Vite 项目，如果缺少 `DATABASE_URL`，`vite-plugin-neon-new` 会在执行 `vite dev` 时自动预配数据库。使用 `npm install -D vite-plugin-neon-new` 安装。有关配置，请参阅 [Claimable Postgres 文档](https://neon.com/docs/reference/claimable-postgres#vite-plugin)。

## 认领

认领是可选的。无需认领即可立即使用数据库。如果用户选择认领，可以在浏览器中打开认领 URL，然后登录或创建 Neon 账户以认领该数据库。

- **API/SDK：** 将创建响应中的 `claim_url` 提供给用户。
- **CLI：** `npx neon-new@latest claim` 会从 `.env` 中读取认领 URL，并自动打开浏览器。

用户无法将数据库认领到与 Vercel 关联的组织中；他们必须选择另一个 Neon 组织。

## Neon 基础设施即代码（`neon.ts`）

可认领数据库是特意设计为用后即弃的，并通过上文所述的 `neon.new` 进行配置，因此不受 `neon.ts` 管理。一旦用户将数据库**认领**到 Neon 账户中，它就会成为普通的 Neon 项目——从这时起，Neon 的基础设施即代码文件 `neon.ts` 就是后续管理该项目的方式（完整参考请参阅 `neon` skill）：声明其分支应启用的服务，以编程方式配置每个分支的计算资源，并获得类型安全的环境变量。

```bash
npm i @neon/config
```

```typescript
// neon.ts
import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  auth: true, // Neon Auth, once you outgrow a bare connection string
  dataApi: true, // Data API
  branch: (branch) => (branch.exists ? {} : { ttl: "7d" }), // ephemeral non-default branches
});
```

```bash
neon config apply   # provision the declared services (neon deploy is an alias)
```

如果项目需要分支、多个服务，或需要在版本控制中跟踪的持久化基础设施，建议先认领数据库，然后采用 `neon.ts`，而不是重新配置用后即弃的可认领数据库。

## 默认值和限制

| 参数 | 值        |
| --------- | --------- |
| 提供商  | AWS       |
| 区域    | us-east-2 |
| Postgres 版本 | 17        |

可认领数据库的区域无法更改。未认领数据库的配额更为严格。认领后，限制将重置为免费计划的默认值。

|            | 未认领 | 已认领（免费计划） |
| ---------- | --------- | ------------------- |
| 存储空间    | 100 MB    | 512 MB              |
| 传输量   | 1 GB      | ~5 GB               |
| 分支   | 否        | 是                 |
| 过期时间 | 72 小时  | 无                |