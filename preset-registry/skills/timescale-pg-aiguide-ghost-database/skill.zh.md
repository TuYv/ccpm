---
name: ghost-database
description: |
  Use this skill for persistent PostgreSQL storage in agent workflows — spin up databases on demand, test schema migrations safely on forks, and pass databases as assets between agents using Ghost.

  **Trigger when user asks to:**
  - Create a new PostgreSQL database quickly
  - Manage database lifecycle in agent workflows
  - Fork a database to test changes safely
  - Run analytics or heavy queries on a fork without impacting the production database
  - Share a database snapshot so others can spin up their own copy
  - Pass a database as an input or output between agents
  - Create a database for agents
  - Need many databases that are billed only when queried
  - Set up the Ghost MCP server or CLI

  **Note:** If the Ghost MCP server is already installed, use its tools directly — this skill is for environments without the  MCP  or as a reference for what's possible.

  **Keywords:** Ghost, ghost.build, database, create database, fork database, PostgreSQL, managed Postgres, MCP, agent database, connection string
license: Apache-2.0
metadata:
  author: tigerdata
---
# Ghost 数据库管理

Ghost 是一项专为智能体（agent）设计的托管 PostgreSQL 服务。你的账户以 Space（空间）为单位组织，每个 Space 拥有数量不限的按需数据库和分叉（fork），它们共享一个计算小时池（执行查询时按 15 分钟为单位计费）。免费套餐：每月 100 小时，1TB 存储。

当你需要持续运行时，可将任意数据库升级为**专用实例**——单独计费、始终在线的数据库。

附加功能：
- **原生支持 CLI 和 MCP：** 可从终端或任何兼容 MCP 的智能体创建和查询数据库
- **即时分叉：** 几秒内获得完整的数据库副本，便于安全实验
- **可共享的快照：** 通过 URL 共享数据库快照——任何拿到链接的人都可以在自己的 Space 中启动自己的副本
- **MCP 只读模式：** `ghost config set read_only true` 会将所有 MCP 工具锁定为只读——SQL 查询以只读模式执行，破坏性工具（`ghost_delete`、`ghost_password`、`ghost_rename`）则被禁用

网站：https://ghost.build

## 安装

提供多种安装方式。如果不确定，请使用第一种。

### 安装脚本（macOS/Linux/WSL）

```bash
curl -fsSL https://install.ghost.build | sh
```

### 安装脚本（Windows PowerShell）

```powershell
irm https://install.ghost.build/install.ps1 | iex
```

### Debian/Ubuntu

```bash
curl -s https://packagecloud.io/install/repositories/timescale/ghost/script.deb.sh | sudo os=any dist=any bash
sudo apt-get install ghost
```

### Red Hat/Fedora

```bash
curl -s https://packagecloud.io/install/repositories/timescale/ghost/script.rpm.sh | sudo os=rpm_any dist=rpm_any bash
sudo yum install ghost
```

## 快速开始

**CLI**
```bash
ghost login                     # Authenticate with GitHub
ghost create                    # Create a new database (returns an ID, e.g. abc123)
ghost list                      # List all databases with their IDs
ghost connect <name-or-id>              # Get connection string
```

**MCP**
```
ghost_login()                   // Authenticate with GitHub
ghost_create({ name: "my-db" }) // → returns { id: "abc123", ... }
ghost_list()                    // List all databases with their IDs
ghost_connect({ name_or_id: "abc123" }) // Get connection string
```

## 核心工作流

### 创建并查询数据库

**CLI**
```bash
# Create a database (returns an ID like abc123)
ghost create my-app-db

# Run SQL directly
ghost sql abc123 "CREATE TABLE users (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, email TEXT NOT NULL UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now())"

# Query it
ghost sql abc123 "SELECT * FROM users"

# Open interactive psql session
ghost psql abc123
```

**MCP**
```
ghost_create({ name: "my-app-db" })
// → returns { id: "abc123", ... }

ghost_sql({ name_or_id: "abc123", query: "CREATE TABLE users (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, email TEXT NOT NULL UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now())" })

ghost_sql({ name_or_id: "abc123", query: "SELECT * FROM users" })
```

### 通过分叉进行安全实验

分叉会在几秒内创建数据库的完整副本——模式相同、数据相同。你可以用分叉来测试迁移、试验模式变更，或者让智能体自由探索而不危及你的工作数据库。你还可以将专用实例分叉为按需实例——这样无需为常驻计算付费即可针对生产副本进行测试。

如需了解使用分叉的完整迁移测试工作流——包括迁移前/后的验证查询和回滚规划——请参阅 `postgres-database-migration` 技能。

**CLI**
```bash
# Fork a database (returns the fork's ID, e.g. def456)
ghost fork abc123 my-app-db-experiment

# Test changes on the fork
ghost sql my-app-db-experiment "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'"

# If it worked: apply to original
ghost sql abc123 "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'"

# If it failed: delete the fork, original is untouched
ghost delete my-app-db-experiment --confirm
```

**MCP**
```
ghost_fork({ name_or_id: "abc123", name: "my-app-db-experiment" })
// → returns { id: "def456", ... }

ghost_sql({ name_or_id: "def456", query: "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'" })

// If it worked: apply to original
ghost_sql({ name_or_id: "abc123", query: "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'" })

// If it failed: delete the fork, original is untouched
ghost_delete({ name_or_id: "def456" })
```

### 自动暂停与恢复

数据库在闲置 30 天后会自动暂停，以节省计算小时。存储会保留。再次需要时，可恢复已暂停的数据库：

**CLI**
```bash
ghost resume abc123 --wait
```

**MCP**
```
ghost_resume({ name_or_id: "abc123" })
```

### 查看模式

**CLI**
```bash
ghost schema abc123
```

**MCP**
```
ghost_schema({ name_or_id: "abc123" })
```

返回针对 LLM 优化的模式表示，涵盖所有表、列、索引和约束。

### 共享数据库

共享会创建一个快照，任何人都可以用它启动自己的副本——无需访问你的 Space。适用于共享示例数据集、bug 复现或入门数据库。

智能体还可以把共享作为一种以资产形式传递数据库的方式：智能体可以通过共享将数据库作为输出产出（把 URL 交给接收者，供其启动自己的副本），也可以接受共享令牌（share token）作为输入，从一个预先填充好数据的数据库开始。

**CLI**
```bash
# Share a database (returns a share URL)
ghost share abc123

# Share with an expiry
ghost share abc123 --expires 24h

# Recipient creates their own database from the share token
ghost create --from-share <token>

# Manage shares
ghost share list abc123
ghost share revoke <token>
```

**MCP**
```
ghost_share({ name_or_id: "abc123" })
// → returns { share_token: "...", url: "..." }

ghost_share({ name_or_id: "abc123", expires: "24h" })

// Recipient creates their own database from the share token
ghost_create({ from_share: "<token>" })

// Manage shares
ghost_share_list()
ghost_share_revoke({ share_token: "<token>" })
```

## CLI 命令参考

如需完整的命令与标志列表，请运行：

```bash
ghost --help
ghost <command> --help   # e.g. ghost create --help
```

## MCP 集成

Ghost MCP 服务器让智能体能够完全掌控数据库的生命周期——无需人工介入即可创建、分叉、查询、检查、恢复和删除数据库。

### 安装 MCP 服务器

```bash
ghost mcp install 
```

支持：Claude Code、Cursor、Windsurf、Codex、Gemini、VS Code、Kiro。

### MCP 只读模式

若要为智能体提供安全的只读访问，请在启动 MCP 服务器之前启用只读模式：

```bash
ghost config set read_only true
```

这会将所有 MCP 工具锁定为只读：`ghost_sql` 以只读模式执行查询，而破坏性工具（`ghost_delete`、`ghost_password`、`ghost_rename`）则被完全禁用。


## 何时使用 Ghost

**适用场景：**
- 为智能体工作流提供持久化的 Postgres 存储
- 为每个智能体、甚至每次智能体执行分配专属数据库
- 随心创建和丢弃数据库，无需为成本焦虑
- 通过数据库分叉进行安全实验和迁移测试
- 硬性支出上限，计费可预测（计算小时按 15 分钟为单位计费）

**不适用场景：**
- 你需要 Web 控制面板（Ghost 仅支持 CLI/MCP）
- 你需要非 Postgres 数据库
