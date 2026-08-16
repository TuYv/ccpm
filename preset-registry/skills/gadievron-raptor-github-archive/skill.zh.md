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

**目的**：通过 BigQuery 查询不可变的 GitHub 事件历史记录，为安全调查获取防篡改的取证证据。

## 何时使用此 Skill

- 调查涉及 GitHub 仓库的安全事件
- 构建威胁行为者归因档案
- 核实有关仓库活动的说法（媒体报道、事件报告）
- 使用确定性时间戳重建攻击时间线
- 分析自动化系统遭入侵事件
- 检测供应链侦察活动
- 分析跨仓库行为
- 验证工作流执行方式（合法执行与 API 滥用）
- 基于模式检测异常
- **恢复已删除的内容**：PR、议题、分支、标签乃至整个仓库

在任何与 GitHub 相关的安全调查中，都应将 GitHub Archive 分析作为**第一步**。先从不可变记录入手，再利用其他来源补充信息。

## 核心原则

**始终优先选择 GitHub Archive 作为取证证据，而不是**：
- 本地 git 命令输出（`git log`、`git show`）——提交时间可以回填，提交也可以伪造
- 文章或报告中未经核实的说法——需要独立确认
- GitHub Web 界面的截图——可能被篡改
- 单一来源的证据——始终进行交叉验证

**GitHub Archive 是以下方面的事实依据**：
- 行为者归因（谁执行了操作）
- 时间线重建（事件何时发生）
- 事件验证（实际发生了什么）
- 模式分析（行为指纹识别）
- 跨仓库活动跟踪
- **已删除内容恢复**（议题、PR、标签和提交引用仍保留在归档中）
- **仓库删除取证**（即使仓库被删除或历史记录被重写，提交 SHA 仍会保留）

### 删除后仍会保留的内容

**已删除的议题和 PR**：
- 议题创建事件（`IssuesEvent`）仍保留在归档中
- 议题评论（`IssueCommentEvent`）仍可访问
- PR 的打开、关闭和合并事件（`PullRequestEvent`）会持续保留
- **取证价值**：恢复已删除的社会工程、侦察或协同活动证据

**已删除的标签和分支**：
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
- **局限性**：无法再直接访问代码，但可以在其他位置搜索提交 SHA

## 快速开始

**调查用户是否在 2025 年 6 月打开过 PR：**

```python
from google.cloud import bigquery
from google.oauth2 import service_account

# Initialize client (see Setup section for credentials)
credentials = service_account.Credentials.from_service_account_file(
    'path/to/credentials.json',
    scopes=['https://www.googleapis.com/auth/bigquery']
)
client = bigquery.Client(credentials=credentials, project=credentials.project_id)

# Query for PR events
query = """
SELECT
    created_at,
    repo.name,
    JSON_EXTRACT_SCALAR(payload, '$.pull_request.number') as pr_number,
    JSON_EXTRACT_SCALAR(payload, '$.pull_request.title') as pr_title,
    JSON_EXTRACT_SCALAR(payload, '$.action') as action
FROM `githubarchive.day.202506*`
WHERE
    actor.login = 'suspected-actor'
    AND repo.name = 'target/repository'
    AND type = 'PullRequestEvent'
ORDER BY created_at
"""

results = client.query(query)
for row in results:
    print(f"{row.created_at}: PR #{row.pr_number} - {row.action}")
    print(f"  Title: {row.pr_title}")
```

**预期输出（如果 PR 存在）**：
```
2025-06-15 14:23:11 UTC: PR #123 - opened
  Title: Add new feature
2025-06-20 09:45:22 UTC: PR #123 - closed
  Title: Add new feature
```

**解读**：
- **无结果** → 声明被证伪（未发现 PR 活动）
- **找到结果** → 声明得到验证，继续进行详细分析

## 设置

### 前置条件

1. **Google Cloud 项目**：
   - 登录 [Google Developer Console](https://console.cloud.google.com/)
   - 创建项目并启用 BigQuery API
   - 创建具有 `BigQuery User` 角色的服务账号
   - 下载 JSON 凭据文件

2. **安装 BigQuery 客户端**：
```bash
pip install google-cloud-bigquery google-auth
```

### 初始化客户端

```python
from google.cloud import bigquery
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    'path/to/credentials.json',
    scopes=['https://www.googleapis.com/auth/bigquery']
)

client = bigquery.Client(
    credentials=credentials,
    project=credentials.project_id
)
```

**免费层级**：Google 每月提供 1 TB 的免费数据处理额度。

## 成本管理与查询优化

### 了解 GitHub Archive 成本

BigQuery 对扫描的数据收取**每 TiB 6.25 美元**的费用（超出 1 TiB 免费层级后）。GitHub Archive 表的规模**很大**——单个月份表可能有 50-100 GB，而按年份使用通配符可能会扫描数 TiB 的数据。**未经优化的查询可能花费 10-100 美元以上**，而同一查询的优化版本可能仅花费 0.10-1.00 美元。

**关键成本原则**：BigQuery 使用列式存储——你需要为所选列中的所有数据付费，而不只是匹配的行。即使使用 LIMIT 10，对一天的数据执行包含 `SELECT *` 的查询也会扫描约 3 GB。

### 查询前务必估算成本

**关键规则**：对 GitHub Archive 生产表执行任何查询前，先运行试算来估算成本。

```python
from google.cloud import bigquery

def estimate_gharchive_cost(query: str) -> dict:
    """Estimate cost before running GitHub Archive query."""
    client = bigquery.Client()

    # Dry run - validates query and returns bytes to scan
    dry_run_config = bigquery.QueryJobConfig(dry_run=True, use_query_cache=False)
    job = client.query(query, job_config=dry_run_config)

    bytes_processed = job.total_bytes_processed
    gb_processed = bytes_processed / (1024**3)
    tib_processed = bytes_processed / (1024**4)
    estimated_cost = tib_processed * 6.25

    return {
        'bytes': bytes_processed,
        'gigabytes': round(gb_processed, 2),
        'tib': round(tib_processed, 4),
        'estimated_cost_usd': round(estimated_cost, 4)
    }

# Example: Always check cost before running
estimate = estimate_gharchive_cost(your_query)
print(f"Cost estimate: {estimate['gigabytes']} GB → ${estimate['estimated_cost_usd']}")

if estimate['estimated_cost_usd'] > 1.0:
    print("⚠️ HIGH COST QUERY - Review optimization before proceeding")
```

**命令行试算**：
```bash
bq query --dry_run --use_legacy_sql=false 'YOUR_QUERY_HERE' 2>&1 | grep "bytes"
```

### 何时应就费用询问用户

如果符合以下任一条件，**请在运行前询问用户**：

1. **预估费用 > $1.00** - 对于费用超过 $1 的查询，始终需要向用户确认
2. **通配符跨度 > 3 个月** - 类似 `githubarchive.day.2025*` 的查询会扫描整年数据（约 400 GB）
3. **没有分区过滤器** - 不带日期/时间过滤器的查询会扫描整个表范围
4. **使用了 SELECT \*** - 选择所有列会显著增加费用
5. **跨仓库搜索** - 不带 `repo.name` 过滤器的查询会扫描所有 GitHub 活动

**用户确认示例**：
```
Query estimate: 120 GB ($0.75)
Scanning: githubarchive.day.202506* (June 2025, 30 days)
Reason: Cross-repository search for actor 'suspected-user'

This exceeds typical query cost ($0.10-0.30). Proceed? [y/n]
```

**以下情况无需询问**：
- 预估费用 < $0.50，且查询范围明确（特定仓库 + 日期范围）
- 用户明确要求进行大范围分析（例如，“扫描整个 2025 年”）

### GitHub Archive 费用优化技巧

#### 1. 仅选择所需的列（费用降低 50-90%）

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

#### 2. 使用具体的日期范围（费用降低 10-100 倍）

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

**策略**：从较窄的日期范围（1-7 天）开始，然后根据需要扩大范围。对于跨多个月的查询，请使用月度表（`githubarchive.month.202506`），而不要使用每日表通配符。

#### 3. 按仓库名称过滤（费用降低 5-50 倍）

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

**规则**：调查特定仓库时，始终包含 `repo.name` 过滤器。

#### 4. 避免将 SELECT * 与通配符一起使用（至关重要）

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

#### 5. 正确使用 LIMIT（不会降低 GHArchive 的费用）

**重要提示**：对于 GitHub Archive 这类非聚簇表，LIMIT **不会**降低 BigQuery 成本。BigQuery 必须先扫描所有匹配的数据，然后才会应用 LIMIT。

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

在生产环境中，对所有 GitHub Archive 查询使用此模板：

```python
def safe_gharchive_query(query: str, max_cost_usd: float = 1.0):
    """Execute GitHub Archive query with cost controls."""
    client = bigquery.Client()

    # Step 1: Dry run estimate
    dry_run_config = bigquery.QueryJobConfig(dry_run=True, use_query_cache=False)
    dry_job = client.query(query, job_config=dry_run_config)

    bytes_processed = dry_job.total_bytes_processed
    gb = bytes_processed / (1024**3)
    estimated_cost = (bytes_processed / (1024**4)) * 6.25

    print(f"📊 Estimate: {gb:.2f} GB → ${estimated_cost:.4f}")

    # Step 2: Check budget
    if estimated_cost > max_cost_usd:
        raise ValueError(
            f"Query exceeds ${max_cost_usd} budget (estimated ${estimated_cost:.2f}). "
            f"Optimize query or increase max_cost_usd parameter."
        )

    # Step 3: Execute with safety limit
    job_config = bigquery.QueryJobConfig(
        maximum_bytes_billed=int(bytes_processed * 1.2)  # 20% buffer
    )

    print(f"✅ Executing query (max ${estimated_cost:.2f})...")
    return client.query(query, job_config=job_config).result()

# Usage
results = safe_gharchive_query("""
    SELECT created_at, repo.name, actor.login
    FROM `githubarchive.day.20250615`
    WHERE repo.name = 'aws/aws-toolkit-vscode'
        AND type = 'PushEvent'
""", max_cost_usd=0.50)
```

### 常见调查模式：成本比较

| 调查类型 | 高成本方法 | 成本 | 优化方法 | 成本 |
|-------------------|-------------------|------|-------------------|------|
| **验证用户是否在 6 月创建了 PR** | `SELECT * FROM githubarchive.day.202506*` | ~$5.00 | `SELECT created_at, repo.name, payload FROM githubarchive.day.202506* WHERE actor.login='user' AND type='PullRequestEvent'` | ~$0.30 |
| **查找某个参与者在 2025 年的所有活动** | `SELECT * FROM githubarchive.day.2025*` | ~$60.00 | `SELECT type, created_at, repo.name FROM githubarchive.month.2025*` | ~$5.00 |
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
- [ ] 在调查特定仓库时添加了 `repo.name` 过滤条件
- [ ] 执行了试运行，并确认费用低于 $1.00（或已获得用户批准）
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
- **每日表**：`githubarchive.day.YYYYMMDD`（例如 `githubarchive.day.20250713`）
- **每月表**：`githubarchive.month.YYYYMM`（例如 `githubarchive.month.202507`）
- **每年表**：`githubarchive.year.YYYY`（例如 `githubarchive.year.2025`）

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

**Payload 字段**：包含特定事件详细信息的 JSON 编码字符串。必须在 SQL 中使用 `JSON_EXTRACT_SCALAR()` 或在 Python 中使用 `json.loads()` 进行解析。

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

**DeleteEvent** - 分支或标签已删除
```sql
-- Payload fields:
JSON_EXTRACT_SCALAR(payload, '$.ref_type')   -- branch or tag
JSON_EXTRACT_SCALAR(payload, '$.ref')        -- Name of deleted ref
```

**ForkEvent** - 仓库已被复刻
```sql
-- Payload fields:
JSON_EXTRACT_SCALAR(payload, '$.forkee.full_name')  -- New fork name
```

#### 自动化与 CI/CD 事件

**WorkflowRunEvent** - GitHub Actions 工作流运行状态变更
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
**CheckSuiteEvent** - 针对提交的检查套件

#### Issue 与讨论事件

**IssuesEvent** - Issue 已打开、关闭或编辑
```sql
-- Payload fields:
JSON_EXTRACT_SCALAR(payload, '$.action')        -- opened, closed, reopened
JSON_EXTRACT_SCALAR(payload, '$.issue.number')
JSON_EXTRACT_SCALAR(payload, '$.issue.title')
JSON_EXTRACT_SCALAR(payload, '$.issue.body')
```

**IssueCommentEvent** - Issue 或拉取请求上的评论
**PullRequestReviewEvent** - 已提交 PR 审查
**PullRequestReviewCommentEvent** - PR 差异上的评论

#### 其他事件

**WatchEvent** - 仓库被加星
**ReleaseEvent** - 发布版本已发布
**MemberEvent** - 协作者已添加/移除
**PublicEvent** - 仓库已设为公开

## 调查模式

### 恢复已删除的 Issue 与 PR 文本

**场景**：Issue 或 PR 已从 GitHub 删除（由作者、维护者或审核人员操作），但你需要恢复原始标题和正文文本，以用于调查、合规或历史参考。

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
- **行为者归属**：`actor.login` 标识内容的创建者
- **时间戳**：`created_at` 中记录了准确的创建时间

**真实示例**：在 Amazon Q 调查中，从 `lkmanka58` 恢复了已删除的议题内容。标题为「aws amazon donkey aaaaaaiii aaaaaaaiii」的议题包含一段激烈抨击，称 Amazon Q「具有欺骗性」且是「照本宣科的骗局」。尽管该议题已从 github.com 删除，但完整的议题正文仍保存在 GitHub Archive 中，为时间线重建提供了背景信息。

### 已删除的 PR

**场景**：媒体声称攻击者在「六月下旬」提交了一个包含恶意代码的 PR，但该 PR 现已删除，无法在 github.com 上找到。

**第 1 步：查询归档**
```python
query = """
SELECT
    type,
    created_at,
    repo.name,
    JSON_EXTRACT_SCALAR(payload, '$.action') as action,
    JSON_EXTRACT_SCALAR(payload, '$.pull_request.number') as pr_number,
    JSON_EXTRACT_SCALAR(payload, '$.pull_request.title') as pr_title
FROM `githubarchive.day.202506*`
WHERE
    actor.login = 'suspected-actor'
    AND repo.name = 'target/repository'
    AND type = 'PullRequestEvent'
ORDER BY created_at
"""

results = client.query(query)
pr_events = list(results)
```

**第 2 步：分析结果**
```python
if not pr_events:
    print("❌ CLAIM DISPROVEN: No PR activity found in June 2025")
else:
    for event in pr_events:
        print(f"✓ VERIFIED: PR #{event.pr_number} {event.action} on {event.created_at}")
        print(f"  Title: {event.pr_title}")
        print(f"  Repo: {event.repo_name}")
```

**证据验证**：
- **断言为真**：归档显示存在 `action='opened'` 的 `PullRequestEvent`
- **断言为假**：未找到任何事件 → 断言被推翻
- **调查结果**：明确验证或驳斥时间线相关断言

**真实示例**：Amazon Q 调查证实，攻击者账户在 2025 年六月下旬没有提交任何 PR，从而推翻了媒体关于攻击者通过已删除 PR 提交恶意代码的说法。

### 已删除仓库取证

**场景**：威胁行为者创建暂存仓库、推送恶意代码，然后删除仓库以掩盖踪迹。

**第 1 步：查找仓库活动**
```python
query = """
SELECT
    type,
    created_at,
    JSON_EXTRACT_SCALAR(payload, '$.ref') as ref,
    JSON_EXTRACT_SCALAR(payload, '$.repository.name') as repo_name,
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
"""

results = client.query(query)
```

**第 2 步：提取提交 SHA**
```python
import json

commits = []
for row in results:
    if row.type == 'PushEvent':
        payload_data = json.loads(row.payload)
        for commit in payload_data.get('commits', []):
            commits.append({
                'sha': commit['sha'],
                'message': commit['message'],
                'timestamp': row.created_at
            })

for c in commits:
    print(f"{c['timestamp']}: {c['sha'][:8]} - {c['message']}")
```

**证据恢复**：
- `CreateEvent` 揭示仓库创建时间戳
- `PushEvent` 记录包含提交 SHA 和元数据
- 提交 SHA 可用于通过其他归档或复刻仓库恢复代码内容
- **调查结果**：完整重建攻击者的暂存基础设施

**真实案例**：`lkmanka58/code_whisperer` 仓库在攻击后被删除，但 GitHub Archive 揭示了其创建于 6 月 13 日，并包含 3 个尝试代入 AWS IAM 角色的提交。

### 已删除标签分析

**场景**：恶意标签被用于交付载荷，随后被删除以隐藏证据。

**第 1 步：搜索标签事件**
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

**真实案例**：Amazon Q 攻击使用 'stability' 标签交付恶意载荷。该标签已被删除，但 GitHub Archive 中的 `CreateEvent` 保留了创建时间戳和操作者，从而证实了 48 小时的暂存窗口。

### 已删除分支重建

**场景**：攻击者创建包含恶意代码的开发分支，推送提交，然后在合并后删除分支或将其删除以掩盖踪迹。

**第 1 步：查找分支生命周期**
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

**第 2 步：从已删除分支中提取所有提交 SHA**
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
- **提交 SHA**：所有提交标识符都永久记录在 `PushEvent` 载荷中
- **提交消息**：完整的提交消息保存在提交数组中
- **作者元数据**：提交作者字段中的姓名和电子邮件地址
- **推送者身份**：执行推送操作的操作者
- **时间顺序**：每次推送操作的精确时间戳
- **分支生命周期**：从创建到删除的完整时间线

**取证价值**：即使分支已被删除，仍可使用提交 SHA 来：
- 在复刻仓库中搜索提交
- 检查提交是否已合并到其他分支
- 搜索外部代码档案（Software Heritage 等）
- 重建完整的攻击开发时间线

### 自动化与直接 API 操作的归因分析

**场景**：可疑提交显示在自动化账户名下。需要确定这些提交是由合法的 GitHub Actions 工作流执行产生，还是攻击者利用失窃令牌直接滥用 API 所产生。

**步骤 1：搜索可疑时间窗口内的工作流事件**
```python
query = """
SELECT
    type,
    created_at,
    actor.login,
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
"""

workflow_events = list(client.query(query))
```

**步骤 2：建立基准模式**
```python
baseline_query = """
SELECT
    type,
    created_at,
    actor.login,
    JSON_EXTRACT_SCALAR(payload, '$.workflow_run.name') as workflow_name
FROM `githubarchive.day.20250713`
WHERE
    repo.name = 'org/repository'
    AND actor.login = 'automation-account'
    AND type = 'WorkflowRunEvent'
ORDER BY created_at
"""

baseline = list(client.query(baseline_query))
print(f"Total workflows for day: {len(baseline)}")
```

**步骤 3：分析结果**
```python
if not workflow_events:
    print("🚨 DIRECT API ATTACK DETECTED")
    print("No WorkflowRunEvent during suspicious commit window")
    print("Commit was NOT from legitimate workflow execution")
else:
    print("✓ Legitimate workflow execution detected")
    for event in workflow_events:
        print(f"{event.created_at}: {event.workflow_name} - {event.conclusion}")
```

**合法工作流的预期结果**：
```
2025-07-13 20:30:15 UTC | WorkflowRunEvent | deploy-automation | requested
2025-07-13 20:30:24 UTC | PushEvent        | aws-toolkit-automation | refs/heads/main
2025-07-13 20:31:08 UTC | WorkflowRunEvent | deploy-automation | completed
```

**直接滥用 API 的预期结果**：
```
2025-07-13 20:30:24 UTC | PushEvent | aws-toolkit-automation | refs/heads/main
[NO WORKFLOW EVENTS IN ±10 MINUTE WINDOW]
```

**调查结论**：缺少 `WorkflowRunEvent` = 使用失窃令牌发起的直接 API 攻击

**真实案例**：Amazon Q 调查需要确定恶意提交 `678851bbe9776228f55e0460e66a6167ac2a1685`（由 `aws-toolkit-automation` 于 2025 年 7 月 13 日 20:30:24 UTC 推送）是来自遭入侵的工作流，还是来自直接滥用 API。GitHub Archive 查询显示，在 20:25 至 20:35 UTC 的时间窗口内，`WorkflowRunEvent` 和 `WorkflowJobEvent` 记录均为零。基准分析显示，同一自动化账户当天运行过 18 个工作流，但全部集中在 20:48 至 21:02 UTC。恶意提交与这些工作流之间的时间间隔，以及恶意提交发生期间工作流事件的完全缺失，证明这是直接 API 攻击，而非工作流遭入侵。

## 故障排查

**权限被拒绝错误**：
- 验证服务账号是否具有 `BigQuery User` 角色
- 检查凭据文件路径是否正确
- 确保已在 Google Cloud 项目中启用 BigQuery API

**查询超出免费层级限制（>1TB）**：
- 使用每日表而非通配符：`githubarchive.day.20250615`
- 添加日期筛选条件：`WHERE created_at >= '2025-06-01' AND created_at < '2025-07-01'`
- 限制列：仅选择所需字段，不要使用 `SELECT *`
- 对范围更广的搜索使用月度表：`githubarchive.month.202506`

**已知事件没有查询结果**：
- 验证日期范围（归档始于 2011 年 2 月 12 日）
- 检查时区（GitHub Archive 使用 UTC）
- 确认 `actor.login` 拼写正确（区分大小写）
- 某些事件最长可能需要 1 小时才会出现（每小时更新）

**载荷提取返回 NULL**：
- 在使用 `JSON_EXTRACT_SCALAR()` 之前，先使用 `JSON_EXTRACT()` 验证 JSON 路径是否存在
- 检查该事件类型是否具有相应的载荷字段（并非所有事件都具有全部字段）
- 检查原始载荷：`SELECT payload FROM ... LIMIT 1`

**查询超时或性能缓慢**：
- 尽可能添加 `repo.name` 筛选条件（可显著减少扫描的数据量）
- 使用具体的日期范围而非通配符
- 对长期分析，考虑使用月度聚合表
- 按日期对查询进行分区并并行运行

### 强制推送恢复（零提交 PushEvent）

**场景**：开发者意外提交了密钥，随后通过强制推送“删除”该提交。该提交仍可在 GitHub 上访问，但需要知道其 SHA 才能找到。

**背景**：当开发者运行 `git reset --hard HEAD~1 && git push --force` 时，Git 会从分支中移除对该提交的引用。但是：
- GitHub 会无限期存储这些“悬空”提交
- GitHub Archive 会在 PushEvent 载荷中记录 `before` SHA
- 强制推送会显示为零提交的 PushEvent（提交数组为空）

**第 1 步：查找所有零提交 PushEvent（整个组织范围）**
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

**第 2 步：搜索特定仓库**
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

**第 3 步：批量恢复查询**
```python
query = """
SELECT
    created_at,
    actor.login,
    repo.name,
    JSON_EXTRACT_SCALAR(payload, '$.before') as deleted_sha,
    JSON_EXTRACT_SCALAR(payload, '$.ref') as branch
FROM `githubarchive.year.2024`
WHERE
    type = 'PushEvent'
    AND JSON_EXTRACT_SCALAR(payload, '$.size') = '0'
    AND repo.name LIKE 'target-org/%'
"""

results = client.query(query)
deleted_commits = []
for row in results:
    deleted_commits.append({
        'timestamp': row.created_at,
        'actor': row.actor_login,
        'repo': row.repo_name,
        'deleted_sha': row.deleted_sha,
        'branch': row.branch
    })

print(f"Found {len(deleted_commits)} force-pushed commits to investigate")
```

**证据恢复**：
- **`before` SHA**：被强制推送“删除”的提交
- **`head` SHA**：分支被重置到的提交
- **`ref`**：被强制推送的分支
- **`actor.login`**：执行强制推送的人
- **提交访问**：使用恢复的 SHA，通过 GitHub API 或 Web UI 访问提交

**取证应用**：
- **密钥扫描**：扫描恢复的提交，查找泄露的凭据、API 密钥和令牌
- **事件时间线**：确定密钥何时被提交，以及何时被“隐藏”
- **归因**：确定谁提交了密钥，以及谁试图掩盖此事
- **合规性**：证明数据暴露的时间窗口，以用于数据泄露通知

**真实案例**：安全研究员 Sharon Brizinov 扫描了 GitHub 上自 2020 年以来的所有零提交 PushEvents，恢复了“已删除”的提交并扫描其中的密钥。该技术发现了价值 2.5 万美元漏洞赏金的凭据，其中包括一个管理员级别的 GitHub PAT，可访问 Istio 的所有仓库（拥有 3.6 万颗星，并被 Google、IBM、Red Hat 使用）。该令牌可能会被用于发动大规模供应链攻击。

**重要说明**：
- 强制推送不会从 GitHub 删除提交——仍可通过 SHA 访问这些提交
- GitHub Archive 会无限期保留 `before` SHA
- 零提交 PushEvents 是历史记录重写的取证指纹
- 该技术可实现对“已删除”提交的 100% 覆盖（相比之下，暴力枚举 4 字符 SHA 前缀无法做到这一点）

## 了解更多

- **GH Archive 文档**：https://www.gharchive.org/
- **GitHub 事件类型架构**：https://docs.github.com/en/rest/using-the-rest-api/github-event-types
- **BigQuery 文档**：https://cloud.google.com/bigquery/docs
- **BigQuery SQL 参考**：https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax
- **强制推送扫描工具**：https://github.com/trufflesecurity/force-push-scanner