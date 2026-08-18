---
name: github-archive
description: Investigate GitHub security incidents using tamper-proof GitHub Archive data via BigQuery. Use when verifying repository activity claims, recovering deleted PRs/branches/tags/repos, attributing actions to actors, or reconstructing attack timelines. Provides immutable forensic evidence of all public GitHub events since 2011.
user-invocable: false
version: 1.0
author: mbrg
tags:
  - github
  - gharchive
  - security
  - osint
  - forensics
  - git
---
# GitHub Archive

**用途**：通过 BigQuery 查询不可篡改的 GitHub 事件历史记录，为安全调查获取防篡改的取证证据。

## 何时使用此 Skill

- 调查涉及 GitHub 仓库的安全事件
- 构建威胁行为者归因画像
- 验证有关仓库活动的说法（媒体报道、事件报告）
- 使用确定的时间戳重建攻击时间线
- 分析自动化系统遭入侵的情况
- 检测供应链侦察活动
- 跨仓库行为分析
- 验证工作流执行情况（合法执行与 API 滥用）
- 基于模式的异常检测
- **恢复已删除的内容**：PR、议题、分支、标签、整个仓库

在任何与 GitHub 相关的安全调查中，GitHub Archive 分析都应是你的**第一步**。首先从不可篡改的记录入手，然后使用其他来源补充信息。

## 核心原则

**始终优先使用 GitHub Archive 作为取证证据，而不是**：
- 本地 git 命令输出（`git log`、`git show`）——提交时间可能被回溯修改，提交也可能被伪造
- 文章或报告中未经核实的说法——需要独立确认
- GitHub Web 界面截图——可能被篡改
- 单一来源的证据——始终进行交叉验证

**GitHub Archive 是以下方面的事实依据**：
- 行为者归因（谁执行了操作）
- 时间线重建（事件何时发生）
- 事件验证（实际发生了什么）
- 模式分析（行为指纹识别）
- 跨仓库活动追踪
- **已删除内容恢复**（议题、PR、标签和提交引用仍保留在归档中）
- **仓库删除取证**（即使仓库被删除或历史记录被重写，提交 SHA 仍会保留）

### 删除后仍会保留的内容

**已删除的议题与 PR**：
- 议题创建事件（`IssuesEvent`）仍保留在归档中
- 议题评论（`IssueCommentEvent`）仍可访问
- PR 打开、关闭和合并事件（`PullRequestEvent`）会持续保留
- **取证价值**：恢复已删除的社会工程、侦察或协同行动证据

**已删除的标签与分支**：
- 标签或分支创建的 `CreateEvent` 记录会持续保留
- `DeleteEvent` 记录会记载删除发生的时间
- **取证价值**：重建攻击暂存基础设施（例如，用于投递恶意载荷的标签）

**已删除的仓库**：
- 针对该仓库的所有 `PushEvent` 记录仍可查询
- 提交 SHA 会永久记录在归档中
- 派生关系（`ForkEvent`）在删除后仍会保留
- **取证价值**：即使威胁行为者删除了证据，仍可访问提交元数据

**已删除的用户账户**：
- 所有活动事件仍归属于已删除的用户名
- 仍可重建时间线
- **局限性**：无法再直接访问代码，但可在其他位置搜索提交 SHA

## 快速入门

所有查询均通过带类型约束的包装器 `libexec/raptor-bq-query` 执行：
输入一条只读语句（仅限 SELECT/WITH——拒绝 DML/DDL 和
多语句输入），输出一个 JSON 封装对象。请先将
SQL 写入文件，然后调用该包装器。

**调查用户是否在 2025 年 6 月创建过 PR：**

编写 `query.sql`：

```sql
SELECT
    created_at,
    repo.name AS repo_name,
    actor.login AS actor_login,
    JSON_EXTRACT_SCALAR(payload, '$.pull_request.number') as pr_number,
    JSON_EXTRACT_SCALAR(payload, '$.pull_request.title') as pr_title,
    JSON_EXTRACT_SCALAR(payload, '$.action') as action
FROM `githubarchive.day.202506*`
WHERE
    actor.login = 'suspected-actor'
    AND repo.name = 'target/repository'
    AND type = 'PullRequestEvent'
ORDER BY created_at
```

然后运行：

```bash
libexec/raptor-bq-query --query-file query.sql --output rows.json
```

`rows.json` 包含封装对象：`{"rows": [...], "row_count": N,
"job": {"job_id": ..., "total_bytes_processed": ...,
"total_bytes_billed": ..., "cache_hit": ...}, "dry_run": false}`。
如果不使用 `--output`，封装对象会输出到标准输出。

**预期输出（如果 PR 存在）**：
```
2025-06-15 14:23:11 UTC: PR #123 - opened
  Title: Add new feature
2025-06-20 09:45:22 UTC: PR #123 - closed
  Title: Add new feature
```

**解读**：
- **没有结果** → 断言被推翻（未发现 PR 活动）
- **找到结果** → 断言得到验证，继续进行详细分析

## 设置

### 前置条件

1. **Google Cloud 项目**：
   - 登录 [Google Developer Console](https://console.cloud.google.com/)
   - 创建项目并启用 BigQuery API
   - 创建具有 `BigQuery User` 角色的服务账号
   - 下载 JSON 凭据文件

2. **安装 BigQuery 客户端**（封装器在底层使用）：
```bash
pip install google-cloud-bigquery google-auth
```

### 凭据

将 `GOOGLE_APPLICATION_CREDENTIALS` 设置为服务账号密钥文件的
路径（或内联 JSON 本身）。将服务账号的权限范围限制为只读的
`BigQuery User` 角色——使此接口保持只读的是这一凭据边界，而不是
封装器的语句验证。

### 出站网络策略

默认情况下，封装器会在网络固定的沙箱中运行 BigQuery 客户端：
仅可访问以下主机：
`{bigquery.googleapis.com, oauth2.googleapis.com, www.googleapis.com}`
以及密钥文件中声明的 `token_uri` 主机。运维人员可以通过
`~/.config/raptor/bq-proxy-hosts.json`
（`{"hosts": [...]}`）替换允许列表，而 `--no-sandbox` 会回退到主机的
环境网络（使用 gcloud ADC / 元数据服务器凭据时需要此选项，因为在沙箱内
无法访问它们）。

**免费额度**：Google 每月免费提供 1 TB 的数据处理量。

## 成本管理与查询优化

### 了解 GitHub Archive 成本

BigQuery 对扫描的数据按 **每 TiB 6.25 美元**收费（超出 1 TiB 免费额度后）。GitHub Archive 表**非常庞大**——单个月份表可能达到 50–100 GB，而年度通配符可能会扫描数 TiB 的数据。**未经优化的查询可能花费 10–100 多美元**，而同一查询的优化版本仅花费 0.10–1.00 美元。

**关键成本原则**：BigQuery 使用列式存储——你需要为所选列中的所有数据付费，而不仅仅是匹配的行。即使使用 LIMIT 10，在一天的数据上执行包含 `SELECT *` 的查询也会扫描约 3 GB。

### 查询前务必估算成本

**关键规则**：在对 GitHub Archive 生产表执行任何查询之前，先运行一次试运行以估算成本。

```bash
libexec/raptor-bq-query --query-file query.sql --dry-run
```

输出：

```json
{"dry_run": true, "total_bytes_processed": 128849018880, "gigabytes_processed": 120.0, "estimated_cost_usd": 0.7324}
```

如果 `estimated_cost_usd` 超过 $1.00，请在继续之前查看下方的优化技巧（并参阅下一节中需要询问用户的阈值）。

### 何时需要就成本询问用户

如果满足以下任一条件，**请在运行前询问用户**：

1. **估算成本 > $1.00** - 对于超过 $1 的查询，始终需要向用户确认
2. **通配符跨度 > 3 个月** - 类似 `githubarchive.day.2025*` 的查询会扫描全年数据（约 400 GB）
3. **没有分区过滤器** - 没有日期/时间过滤器的查询会扫描整个表范围
4. **使用了 SELECT *** - 选择所有列会显著增加成本
5. **跨仓库搜索** - 没有 `repo.name` 过滤器的查询会扫描所有 GitHub 活动

**用户确认示例**：
```
Query estimate: 120 GB ($0.75)
Scanning: githubarchive.day.202506* (June 2025, 30 days)
Reason: Cross-repository search for actor 'suspected-user'

This exceeds typical query cost ($0.10-0.30). Proceed? [y/n]
```

以下情况**无需询问**：
- 估算成本 < $0.50，并且查询范围明确（特定仓库 + 日期范围）
- 用户明确要求进行广泛分析（例如，“扫描整个 2025 年”）

### GitHub Archive 成本优化技巧

#### 1. 仅选择所需列（成本降低 50-90%）

```sql
-- ❌ EXPENSIVE: Scans ALL columns (~3 GB per day)
SELECT * FROM `githubarchive.day.20250615`
WHERE actor.login = 'target-user'

-- ✅ OPTIMIZED: Scans only needed columns (~0.3 GB per day)
SELECT
    type,
    created_at,
    repo.name,
    actor.login,
    JSON_EXTRACT_SCALAR(payload, '$.action') as action
FROM `githubarchive.day.20250615`
WHERE actor.login = 'target-user'
```

**切勿在生产查询中使用 `SELECT *`。** 始终明确指定所需的列。

#### 2. 使用具体的日期范围（成本降低 10-100 倍）

```sql
-- ❌ EXPENSIVE: Scans entire year (~400 GB)
SELECT ... FROM `githubarchive.day.2025*`
WHERE actor.login = 'target-user'

-- ✅ OPTIMIZED: Scans specific month (~40 GB)
SELECT ... FROM `githubarchive.day.202506*`
WHERE actor.login = 'target-user'

-- ✅ BEST: Scans single day (~3 GB)
SELECT ... FROM `githubarchive.day.20250615`
WHERE actor.login = 'target-user'
```

**策略**：从较窄的日期范围（1-7 天）开始，然后根据需要扩大范围。对于跨多个月的查询，请使用月表（`githubarchive.month.202506`），而不是每日通配符。

#### 3. 按仓库名称过滤（成本降低 5-50 倍）

```sql
-- ❌ EXPENSIVE: Scans all GitHub activity
SELECT ... FROM `githubarchive.day.202506*`
WHERE actor.login = 'target-user'

-- ✅ OPTIMIZED: Filter by repo (BigQuery can prune data blocks)
SELECT ... FROM `githubarchive.day.202506*`
WHERE
    repo.name = 'target-org/target-repo'
    AND actor.login = 'target-user'
```

**规则**：调查特定仓库时，始终包含 `repo.name` 过滤条件。

#### 4. 避免将 SELECT * 与通配符一起使用（关键）

```sql
-- ❌ CATASTROPHIC: Can scan 1+ TiB ($6.25+)
SELECT * FROM `githubarchive.day.2025*`
WHERE type = 'PushEvent'

-- ✅ OPTIMIZED: Scans ~50 GB ($0.31)
SELECT
    created_at,
    actor.login,
    repo.name,
    JSON_EXTRACT_SCALAR(payload, '$.ref') as branch
FROM `githubarchive.day.2025*`
WHERE type = 'PushEvent'
```

#### 5. 正确使用 LIMIT（不会降低 GHArchive 的成本）

**重要**：对于 GitHub Archive 这类非聚簇表，LIMIT **不会**降低 BigQuery 成本。BigQuery 必须先扫描所有匹配的数据，然后才能应用 LIMIT。

```sql
-- ❌ MISCONCEPTION: Still scans full dataset
SELECT * FROM `githubarchive.day.20250615`
LIMIT 100  -- Cost: ~3 GB scanned

-- ✅ CORRECT: Use WHERE filters and column selection
SELECT type, created_at, actor.login
FROM `githubarchive.day.20250615`
WHERE repo.name = 'target/repo'  -- Cost: ~0.2 GB scanned
LIMIT 100
```

### 安全查询执行模板

在生产环境中执行所有 GitHub Archive 查询时，请使用以下流程：

```bash
# Step 1: dry-run estimate (validates the query, scans nothing)
libexec/raptor-bq-query --query-file query.sql --dry-run

# Step 2: check the printed estimated_cost_usd against your budget
#         (ask the user per the thresholds above if it's high)

# Step 3: execute with a bytes-billed safety cap — the job FAILS
#         rather than bills more than this
libexec/raptor-bq-query --query-file query.sql --max-bytes-billed 100000000000 --output rows.json
```

该封装程序始终会应用 `maximum_bytes_billed` 上限——默认值为 200 GB（约 $1.14）；请将其收紧至试运行估算值再加约 20% 的余量，或针对有意进行的大范围扫描显式提高该上限。

### 常见调查模式：成本比较

| 调查类型 | 高成本方法 | 成本 | 优化方法 | 成本 |
|-------------------|-------------------|------|-------------------|------|
| **验证用户是否在六月创建了 PR** | `SELECT * FROM githubarchive.day.202506*` | ~$5.00 | `SELECT created_at, repo.name, payload FROM githubarchive.day.202506* WHERE actor.login='user' AND type='PullRequestEvent'` | ~$0.30 |
| **查找某行为主体在 2025 年的所有活动** | `SELECT * FROM githubarchive.day.2025*` | ~$60.00 | `SELECT type, created_at, repo.name FROM githubarchive.month.2025*` | ~$5.00 |
| **恢复已删除的 PR 内容** | `SELECT * FROM githubarchive.day.20250615` | ~$0.20 | `SELECT created_at, payload FROM githubarchive.day.20250615 WHERE repo.name='target/repo' AND type='PullRequestEvent'` | ~$0.02 |
| **跨仓库行为分析** | `SELECT * FROM githubarchive.day.202506*` | ~$5.00 | 从 `githubarchive.month.202506` 开始，确定具体仓库，然后查询每日表 | ~$0.50 |

### 开发查询与生产查询

**调查/开发期间**：
1. 从单日查询开始测试模式：`githubarchive.day.20250615`
2. 验证查询是否返回预期结果
3. 仅在验证后扩展到日期范围：`githubarchive.day.202506*`

**生产环境检查清单**：
- [ ] 使用了具体的列名（未使用 `SELECT *`）
- [ ] 包含了尽可能窄的日期范围
- [ ] 如果正在调查特定仓库，添加了 `repo.name` 过滤条件
- [ ] 执行了试运行并确认费用低于 $1.00（或已获得用户批准）
- [ ] 在查询配置中设置了 `maximum_bytes_billed`

### 费用监控

使用以下查询跟踪你的 BigQuery 支出：

```sql
-- View GitHub Archive query costs (last 7 days)
SELECT
    DATE(creation_time) as query_date,
    COUNT(*) as queries,
    ROUND(SUM(total_bytes_billed) / (1024*1024*1024), 2) as total_gb,
    ROUND(SUM(total_bytes_billed) / (1024*1024*1024*1024) * 6.25, 2) as cost_usd
FROM `region-us`.INFORMATION_SCHEMA.JOBS_BY_PROJECT
WHERE
    creation_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
    AND job_type = 'QUERY'
    AND REGEXP_CONTAINS(query, r'githubarchive\.')
GROUP BY query_date
ORDER BY query_date DESC
```

## 架构参考

### 表组织方式

**数据集**：`githubarchive`

**表模式**：
- **每日表**：`githubarchive.day.YYYYMMDD`（例如，`githubarchive.day.20250713`）
- **每月表**：`githubarchive.month.YYYYMM`（例如，`githubarchive.month.202507`）
- **每年表**：`githubarchive.year.YYYY`（例如，`githubarchive.year.2025`）

**通配符模式**：
- 2025 年 6 月的所有日期：`githubarchive.day.202506*`
- 2025 年的所有月份：`githubarchive.month.2025*`
- 2025 年的所有数据：`githubarchive.year.2025*`

**数据可用范围**：2011 年 2 月 12 日至今（每小时更新）

### 架构结构

**顶层字段**：
```sql
type              -- Event type (PushEvent, IssuesEvent, etc.)
created_at        -- Timestamp when event occurred (UTC)
actor.login       -- GitHub username who performed the action
actor.id          -- GitHub user ID
repo.name         -- Repository name (org/repo format)
repo.id           -- Repository ID
org.login         -- Organization login (if applicable)
org.id            -- Organization ID
payload           -- JSON string with event-specific data
```

**Payload 字段**：包含事件特定详细信息的 JSON 编码字符串。必须在 SQL 中使用 `JSON_EXTRACT_SCALAR()` 或在 Python 中使用 `json.loads()` 进行解析。

### 事件类型参考

#### 仓库事件

**PushEvent** - 将提交推送到仓库
```sql
-- Payload fields:
JSON_EXTRACT_SCALAR(payload, '$.ref')        -- Branch (refs/heads/master)
JSON_EXTRACT_SCALAR(payload, '$.before')     -- SHA before push
JSON_EXTRACT_SCALAR(payload, '$.after')      -- SHA after push
JSON_EXTRACT_SCALAR(payload, '$.size')       -- Number of commits
-- payload.commits[] contains array of commit objects with sha, message, author
```

**PullRequestEvent** - 拉取请求已打开、关闭或合并
```sql
-- Payload fields:
JSON_EXTRACT_SCALAR(payload, '$.action')              -- opened, closed, merged
JSON_EXTRACT_SCALAR(payload, '$.pull_request.number')
JSON_EXTRACT_SCALAR(payload, '$.pull_request.title')
JSON_EXTRACT_SCALAR(payload, '$.pull_request.merged') -- true/false
```

**CreateEvent** - 创建分支或标签
```sql
-- Payload fields:
JSON_EXTRACT_SCALAR(payload, '$.ref_type')   -- branch, tag, repository
JSON_EXTRACT_SCALAR(payload, '$.ref')        -- Name of branch/tag
```

**DeleteEvent** - 分支或标签被删除
```sql
-- Payload fields:
JSON_EXTRACT_SCALAR(payload, '$.ref_type')   -- branch or tag
JSON_EXTRACT_SCALAR(payload, '$.ref')        -- Name of deleted ref
```

**ForkEvent** - 仓库被复刻
```sql
-- Payload fields:
JSON_EXTRACT_SCALAR(payload, '$.forkee.full_name')  -- New fork name
```

#### 自动化与 CI/CD 事件

**WorkflowRunEvent** - GitHub Actions 工作流运行状态发生变化
```sql
-- Payload fields:
JSON_EXTRACT_SCALAR(payload, '$.action')               -- requested, completed
JSON_EXTRACT_SCALAR(payload, '$.workflow_run.name')
JSON_EXTRACT_SCALAR(payload, '$.workflow_run.path')    -- .github/workflows/file.yml
JSON_EXTRACT_SCALAR(payload, '$.workflow_run.status')  -- queued, in_progress, completed
JSON_EXTRACT_SCALAR(payload, '$.workflow_run.conclusion') -- success, failure, cancelled
JSON_EXTRACT_SCALAR(payload, '$.workflow_run.head_sha')
JSON_EXTRACT_SCALAR(payload, '$.workflow_run.head_branch')
```

**WorkflowJobEvent** - 工作流中的单个作业
**CheckRunEvent** - 检查运行状态（CI 系统）
**CheckSuiteEvent** - 提交的检查套件

#### Issue 与讨论事件

**IssuesEvent** - Issue 被打开、关闭或编辑
```sql
-- Payload fields:
JSON_EXTRACT_SCALAR(payload, '$.action')        -- opened, closed, reopened
JSON_EXTRACT_SCALAR(payload, '$.issue.number')
JSON_EXTRACT_SCALAR(payload, '$.issue.title')
JSON_EXTRACT_SCALAR(payload, '$.issue.body')
```

**IssueCommentEvent** - Issue 或拉取请求上的评论
**PullRequestReviewEvent** - 已提交的 PR 审查
**PullRequestReviewCommentEvent** - PR 差异上的评论

#### 其他事件

**WatchEvent** - 仓库被加星
**ReleaseEvent** - 发布版本
**MemberEvent** - 添加或移除协作者
**PublicEvent** - 仓库设为公开

## 调查模式

### 恢复已删除的 Issue 与 PR 文本

**场景**：Issue 或 PR 已从 GitHub 中删除（由作者、维护者或审核人员操作），但你需要恢复原始标题和正文文本，以用于调查、合规或历史参考。

**第 1 步：恢复已删除的 Issue 内容**
```sql
SELECT
    created_at,
    actor.login,
    JSON_EXTRACT_SCALAR(payload, '$.action') as action,
    JSON_EXTRACT_SCALAR(payload, '$.issue.number') as issue_number,
    JSON_EXTRACT_SCALAR(payload, '$.issue.title') as title,
    JSON_EXTRACT_SCALAR(payload, '$.issue.body') as body
FROM `githubarchive.day.20250713`
WHERE
    repo.name = 'aws/aws-toolkit-vscode'
    AND actor.login = 'lkmanka58'
    AND type = 'IssuesEvent'
ORDER BY created_at
```

**第 2 步：恢复已删除的 PR 描述**
```sql
SELECT
    created_at,
    actor.login,
    JSON_EXTRACT_SCALAR(payload, '$.action') as action,
    JSON_EXTRACT_SCALAR(payload, '$.pull_request.number') as pr_number,
    JSON_EXTRACT_SCALAR(payload, '$.pull_request.title') as title,
    JSON_EXTRACT_SCALAR(payload, '$.pull_request.body') as body,
    JSON_EXTRACT_SCALAR(payload, '$.pull_request.merged') as merged
FROM `githubarchive.day.202506*`
WHERE
    repo.name = 'target/repository'
    AND actor.login = 'target-user'
    AND type = 'PullRequestEvent'
ORDER BY created_at
```

**证据恢复**：
- **议题/PR 标题**：完整的标题文本保存在 `$.issue.title` 或 `$.pull_request.title` 中
- **议题/PR 正文**：完整的正文文本保存在 `$.issue.body` 或 `$.pull_request.body` 中
- **评论**：`IssueCommentEvent` 会将评论文本保存在 `$.comment.body` 中
- **操作人归属**：`actor.login` 标识内容创建者
- **时间戳**：`created_at` 中记录了精确的创建时间

**真实示例**：Amazon Q 调查恢复了 `lkmanka58` 已删除的议题内容。该议题标题为「aws amazon donkey aaaaaaiii aaaaaaaiii」，其中包含一段激烈抨击，称 Amazon Q「具有欺骗性」且是「照本宣科的骗局」。尽管该议题已从 github.com 删除，但 GitHub Archive 中仍保留了完整的议题正文，为时间线重建提供了背景信息。

### 已删除的 PR

**场景**：媒体声称攻击者在「6 月下旬」提交了一个包含恶意代码的 PR，但该 PR 现已删除，无法在 github.com 上找到。

**步骤 1：查询归档**——编写 SQL，然后通过封装工具运行：

```sql
SELECT
    type,
    created_at,
    repo.name AS repo_name,
    JSON_EXTRACT_SCALAR(payload, '$.action') as action,
    JSON_EXTRACT_SCALAR(payload, '$.pull_request.number') as pr_number,
    JSON_EXTRACT_SCALAR(payload, '$.pull_request.title') as pr_title
FROM `githubarchive.day.202506*`
WHERE
    actor.login = 'suspected-actor'
    AND repo.name = 'target/repository'
    AND type = 'PullRequestEvent'
ORDER BY created_at
```

```bash
libexec/raptor-bq-query --query-file q-deleted-prs.sql --output rows.json
```

**步骤 2：分析结果**——读取 `rows.json`：
- `"row_count": 0` → 声明被证伪：未发现 2025 年 6 月的 PR 活动
- 存在结果行 → 已验证：每一行中的 `pr_number` / `action` /
  `created_at` / `pr_title` 都记录了该 PR 的生命周期

**证据验证**：
- **声明为真**：归档显示存在 `action='opened'` 的 `PullRequestEvent`
- **声明为假**：未发现任何事件 → 声明被证伪
- **调查结果**：明确验证或驳斥时间线声明

**真实示例**：Amazon Q 调查证实，攻击者的账户在 2025 年 6 月下旬没有提交任何 PR，从而驳斥了媒体关于其通过已删除 PR 提交恶意代码的说法。

### 已删除仓库取证

**场景**：威胁行为者创建暂存仓库、推送恶意代码，然后删除仓库以掩盖踪迹。

**步骤 1：查找仓库活动**
```sql
SELECT
    type,
    created_at,
    JSON_EXTRACT_SCALAR(payload, '$.ref') as ref,
    repo.name AS repo_name,
    payload
FROM `githubarchive.day.2025*`
WHERE
    actor.login = 'threat-actor'
    AND type IN ('CreateEvent', 'PushEvent')
    AND (
        JSON_EXTRACT_SCALAR(payload, '$.repository.name') = 'staging-repo'
        OR repo.name LIKE 'threat-actor/staging-repo'
    )
ORDER BY created_at
```

```bash
libexec/raptor-bq-query --query-file q-staging-repo.sql --output rows.json
```

**步骤 2：提取提交 SHA**——直接在 SQL 中展开，而不是进行后处理，以便 SHA 直接写入输出结果行：

```sql
SELECT
    created_at,
    JSON_EXTRACT_SCALAR(commit, '$.sha') as commit_sha,
    JSON_EXTRACT_SCALAR(commit, '$.message') as commit_message
FROM `githubarchive.day.2025*`,
UNNEST(JSON_EXTRACT_ARRAY(payload, '$.commits')) as commit
WHERE
    actor.login = 'threat-actor'
    AND type = 'PushEvent'
    AND repo.name LIKE 'threat-actor/staging-repo'
ORDER BY created_at
```

**证据恢复**：
- `CreateEvent` 揭示仓库的创建时间戳
- `PushEvent` 记录包含提交 SHA 和元数据
- 提交 SHA 可用于通过其他归档或复刻仓库恢复代码内容
- **调查结果**：完整重建攻击者的暂存基础设施

**真实案例**：`lkmanka58/code_whisperer` 仓库在攻击后被删除，但 GitHub Archive 揭示了该仓库创建于 6 月 13 日，其中包含 3 个尝试代入 AWS IAM 角色的提交。

### 已删除标签分析

**场景**：恶意标签用于交付有效载荷，之后被删除以隐藏证据。

**步骤 1：搜索标签事件**
```sql
SELECT
    type,
    created_at,
    actor.login,
    JSON_EXTRACT_SCALAR(payload, '$.ref') as tag_name,
    JSON_EXTRACT_SCALAR(payload, '$.ref_type') as ref_type
FROM `githubarchive.day.20250713`
WHERE
    repo.name = 'target/repository'
    AND type IN ('CreateEvent', 'DeleteEvent')
    AND JSON_EXTRACT_SCALAR(payload, '$.ref_type') = 'tag'
ORDER BY created_at
```

**时间线重建**：
```
2025-07-13 19:41:44 UTC | CreateEvent | aws-toolkit-automation | tag 'stability'
2025-07-13 20:30:24 UTC | PushEvent   | aws-toolkit-automation | commit references tag
2025-07-14 08:15:33 UTC | DeleteEvent | aws-toolkit-automation | tag 'stability' deleted
```

**分析**：标签从创建到删除之间的 48 小时时间窗口揭示了攻击基础设施的暂存期。

**真实案例**：Amazon Q 攻击使用 'stability' 标签交付恶意有效载荷。该标签后来被删除，但 GitHub Archive 中的 `CreateEvent` 保留了创建时间戳和操作者信息，证实存在 48 小时的暂存窗口。

### 已删除分支重建

**场景**：攻击者创建包含恶意代码的开发分支并推送提交，随后在合并后删除分支，或通过删除分支来掩盖踪迹。

**步骤 1：查找分支生命周期**
```sql
SELECT
    type,
    created_at,
    actor.login,
    JSON_EXTRACT_SCALAR(payload, '$.ref') as branch_name,
    JSON_EXTRACT_SCALAR(payload, '$.ref_type') as ref_type
FROM `githubarchive.day.2025*`
WHERE
    repo.name = 'target/repository'
    AND type IN ('CreateEvent', 'DeleteEvent')
    AND JSON_EXTRACT_SCALAR(payload, '$.ref_type') = 'branch'
ORDER BY created_at
```

**步骤 2：提取已删除分支中的所有提交 SHA**
```sql
SELECT
    created_at,
    actor.login as pusher,
    JSON_EXTRACT_SCALAR(payload, '$.ref') as branch_ref,
    JSON_EXTRACT_SCALAR(commit, '$.sha') as commit_sha,
    JSON_EXTRACT_SCALAR(commit, '$.message') as commit_message,
    JSON_EXTRACT_SCALAR(commit, '$.author.name') as author_name,
    JSON_EXTRACT_SCALAR(commit, '$.author.email') as author_email
FROM `githubarchive.day.2025*`,
UNNEST(JSON_EXTRACT_ARRAY(payload, '$.commits')) as commit
WHERE
    repo.name = 'target/repository'
    AND type = 'PushEvent'
    AND JSON_EXTRACT_SCALAR(payload, '$.ref') = 'refs/heads/deleted-branch-name'
ORDER BY created_at
```

**证据恢复**：
- **提交 SHA**：所有提交标识符都永久记录在 `PushEvent` 有效载荷中
- **提交消息**：完整的提交消息保留在提交数组中
- **作者元数据**：提交作者字段中的姓名和电子邮件地址
- **推送者身份**：执行推送操作的操作者
- **时间顺序**：每次推送操作的精确时间戳
- **分支生命周期**：从创建到删除的完整时间线

**取证价值**：即使分支被删除，仍可使用提交 SHA 来：
- 在派生仓库中搜索提交
- 检查提交是否已合并到其他分支
- 搜索外部代码归档（Software Heritage 等）
- 重建完整的攻击开发时间线

### 自动化操作与直接 API 操作的归因分析

**场景**：可疑提交显示由自动化账户创建。需要确定这些提交是来自合法的 GitHub Actions 工作流执行，还是使用已泄露令牌直接滥用 API 所致。

**步骤 1：搜索可疑时间窗口内的工作流事件**
```sql
SELECT
    type,
    created_at,
    actor.login AS actor_login,
    JSON_EXTRACT_SCALAR(payload, '$.workflow_run.name') as workflow_name,
    JSON_EXTRACT_SCALAR(payload, '$.workflow_run.head_sha') as commit_sha,
    JSON_EXTRACT_SCALAR(payload, '$.workflow_run.conclusion') as conclusion
FROM `githubarchive.day.20250713`
WHERE
    repo.name = 'org/repository'
    AND type IN ('WorkflowRunEvent', 'WorkflowJobEvent')
    AND created_at >= '2025-07-13T20:25:00Z'
    AND created_at <= '2025-07-13T20:35:00Z'
ORDER BY created_at
```

```bash
libexec/raptor-bq-query --query-file q-workflow-window.sql --output workflow-window.json
```

**步骤 2：建立基线模式**
```sql
SELECT
    type,
    created_at,
    actor.login AS actor_login,
    JSON_EXTRACT_SCALAR(payload, '$.workflow_run.name') as workflow_name
FROM `githubarchive.day.20250713`
WHERE
    repo.name = 'org/repository'
    AND actor.login = 'automation-account'
    AND type = 'WorkflowRunEvent'
ORDER BY created_at
```

```bash
libexec/raptor-bq-query --query-file q-workflow-baseline.sql --output workflow-baseline.json
```

**步骤 3：分析结果**
- `workflow-window.json` 中的 `"row_count": 0` → 直接 API 攻击：
  可疑提交时间窗口内没有 WorkflowRunEvent，因此该提交
  并非来自合法的工作流执行
- 存在行 → 合法的工作流执行；每一行的
  `workflow_name` / `conclusion` / `created_at` 都记录了该次运行
- 与基线文件的行数和时间聚集情况进行比较

**合法工作流的预期结果**：
```
2025-07-13 20:30:15 UTC | WorkflowRunEvent | deploy-automation | requested
2025-07-13 20:30:24 UTC | PushEvent        | aws-toolkit-automation | refs/heads/main
2025-07-13 20:31:08 UTC | WorkflowRunEvent | deploy-automation | completed
```

**直接滥用 API 时的预期结果**：
```
2025-07-13 20:30:24 UTC | PushEvent | aws-toolkit-automation | refs/heads/main
[NO WORKFLOW EVENTS IN ±10 MINUTE WINDOW]
```

**调查结论**：缺少 `WorkflowRunEvent` = 使用被盗令牌实施的直接 API 攻击

**真实示例**：在 Amazon Q 调查中，需要确定恶意提交 `678851bbe9776228f55e0460e66a6167ac2a1685`（由 `aws-toolkit-automation` 于 2025 年 7 月 13 日 20:30:24 UTC 推送）是来自遭入侵的工作流，还是直接滥用 API。GitHub Archive 查询显示，在 20:25-20:35 UTC 时间窗口内，`WorkflowRunEvent` 或 `WorkflowJobEvent` 记录数量为零。基线分析显示，同一自动化账户当天执行了 18 个工作流，并且全部集中在 20:48-21:02 UTC。恶意提交与这些工作流之间的时间间隔，以及恶意提交发生期间完全没有工作流事件，证明这是直接 API 攻击，而非工作流遭入侵。

## 故障排除

**包装器错误**（`raptor-bq-query` 会在 stderr 上输出一行结构化 JSON：
`{"error": "<kind>", "message": ..., "exit_code": N}`）：
- 退出码 3 `validation` — 查询被拒绝（不是 SELECT/WITH，或包含
  多条语句）；该包装器按设计为只读
- 退出码 5 `dependency` — `pip install google-cloud-bigquery google-auth`
- 退出码 6 `credentials` — 设置 `GOOGLE_APPLICATION_CREDENTIALS`；在
  沙箱（默认）模式下无法使用 gcloud ADC，请使用密钥文件
- 退出码 7 `query` — BigQuery API 错误，包括触发
  `--max-bytes-billed` 上限；执行试运行并重新调整上限
- 退出码 8 `timeout` — 增大 `--timeout` 或缩小查询范围
- 退出码 9 `sandbox` — 无法启动沙箱；可使用 `--no-sandbox` 作为后备方案，
  但运行环境不受固定约束
- 如果沙箱内部返回的 `403 Forbidden` 中包含某个主机名，表示
  出站流量允许列表拒绝了该主机 — 请检查
  `~/.config/raptor/bq-proxy-hosts.json`

**权限被拒绝错误**：
- 验证服务账号是否拥有 `BigQuery User` 角色
- 检查凭据文件路径是否正确
- 确保已在 Google Cloud 项目中启用 BigQuery API

**查询超出免费层级（>1TB）**：
- 使用每日表而不是通配符：`githubarchive.day.20250615`
- 添加日期筛选条件：`WHERE created_at >= '2025-06-01' AND created_at < '2025-07-01'`
- 限制列：仅选择所需字段，不要使用 `SELECT *`
- 对范围更广的搜索使用月度表：`githubarchive.month.202506`

**已知事件没有查询结果**：
- 验证日期范围（归档始于 2011 年 2 月 12 日）
- 检查时区（GitHub Archive 使用 UTC）
- 确认 `actor.login` 拼写正确（区分大小写）
- 某些事件可能需要最多 1 小时才会出现（每小时更新）

**提取载荷时返回 NULL**：
- 在使用 `JSON_EXTRACT_SCALAR()` 之前，先使用 `JSON_EXTRACT()` 验证 JSON 路径是否存在
- 检查该事件类型是否包含相应载荷字段（并非所有事件都拥有全部字段）
- 检查原始载荷：`SELECT payload FROM ... LIMIT 1`

**查询超时或性能缓慢**：
- 尽可能添加 `repo.name` 筛选条件（可显著减少扫描的数据量）
- 使用具体日期范围而不是通配符
- 对长期分析，考虑使用月度聚合表
- 按日期对查询进行分区并并行运行

### 强制推送恢复（零提交 PushEvent）

**场景**：开发者意外提交了机密信息，随后通过强制推送来“删除”该提交。该提交在 GitHub 上仍然可以访问，但要找到它，必须知道其 SHA。

**背景**：当开发者运行 `git reset --hard HEAD~1 && git push --force` 时，Git 会从分支中移除对该提交的引用。不过：
- GitHub 会无限期存储这些“悬空”提交
- GitHub Archive 会在 PushEvent 载荷中记录 `before` SHA
- 强制推送会显示为零提交的 PushEvent（提交数组为空）

**步骤 1：查找所有零提交 PushEvent（整个组织范围）**
```sql
SELECT
    created_at,
    actor.login,
    repo.name,
    JSON_EXTRACT_SCALAR(payload, '$.before') as deleted_commit_sha,
    JSON_EXTRACT_SCALAR(payload, '$.head') as current_head,
    JSON_EXTRACT_SCALAR(payload, '$.ref') as branch
FROM `githubarchive.day.2025*`
WHERE
    repo.name LIKE 'target-org/%'
    AND type = 'PushEvent'
    AND JSON_EXTRACT_SCALAR(payload, '$.size') = '0'
ORDER BY created_at DESC
```

**步骤 2：搜索特定仓库**
```sql
SELECT
    created_at,
    actor.login,
    JSON_EXTRACT_SCALAR(payload, '$.before') as deleted_commit_sha,
    JSON_EXTRACT_SCALAR(payload, '$.head') as after_sha,
    JSON_EXTRACT_SCALAR(payload, '$.ref') as branch
FROM `githubarchive.day.202506*`
WHERE
    repo.name = 'org/repository'
    AND type = 'PushEvent'
    AND JSON_EXTRACT_SCALAR(payload, '$.size') = '0'
ORDER BY created_at
```

**步骤 3：批量恢复查询**
```sql
SELECT
    created_at,
    actor.login AS actor_login,
    repo.name AS repo_name,
    JSON_EXTRACT_SCALAR(payload, '$.before') as deleted_sha,
    JSON_EXTRACT_SCALAR(payload, '$.ref') as branch
FROM `githubarchive.year.2024`
WHERE
    type = 'PushEvent'
    AND JSON_EXTRACT_SCALAR(payload, '$.size') = '0'
    AND repo.name LIKE 'target-org/%'
```

```bash
libexec/raptor-bq-query --query-file q-force-pushes.sql --dry-run
libexec/raptor-bq-query --query-file q-force-pushes.sql --output force-pushes.json
```

信封中的 `row_count` 是需要调查的强制推送提交数量；每一行都包含可恢复的 `deleted_sha`。（年份表非常大——务必先执行试运行。）

**证据恢复**：
- **`before` SHA**：被强制推送“删除”的提交
- **`head` SHA**：分支被重置到的提交
- **`ref`**：哪个分支被强制推送
- **`actor.login`**：谁执行了强制推送
- **提交访问**：使用恢复的 SHA，通过 GitHub API 或 Web UI 访问提交

**取证应用**：
- **密钥扫描**：扫描恢复的提交，查找泄露的凭据、API 密钥和令牌
- **事件时间线**：确定密钥何时被提交，以及何时被“隐藏”
- **归因**：确定谁提交了密钥，以及谁试图掩盖此事
- **合规性**：证明数据暴露时间窗口，以用于数据泄露通知

**真实案例**：安全研究员 Sharon Brizinov 扫描了自 2020 年以来 GitHub 上所有零提交的 PushEvent，恢复被“删除”的提交并扫描其中的密钥。这项技术发现了价值 2.5 万美元漏洞赏金的凭据，其中包括一个管理员级别的 GitHub PAT，可访问 Istio 的所有仓库（拥有 3.6 万颗星，并被 Google、IBM 和 Red Hat 使用）。该令牌可能被用于发动大规模供应链攻击。

**重要说明**：
- 强制推送不会从 GitHub 删除提交——仍然可以通过 SHA 访问它们
- GitHub Archive 会无限期保留 `before` SHA
- 零提交 PushEvent 是历史记录重写的取证指纹
- 此技术能够 100% 覆盖被“删除”的提交（相比之下，暴力破解 4 字符 SHA 前缀无法做到这一点）

## 了解更多

- **GH Archive 文档**：https://www.gharchive.org/
- **GitHub 事件类型架构**：https://docs.github.com/en/rest/using-the-rest-api/github-event-types
- **BigQuery 文档**：https://cloud.google.com/bigquery/docs
- **BigQuery SQL 参考**：https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax
- **强制推送扫描工具**：https://github.com/trufflesecurity/force-push-scanner