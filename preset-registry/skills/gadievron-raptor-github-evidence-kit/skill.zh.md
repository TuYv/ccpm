---
name: github-evidence-kit
description: Generate, export, load, and verify forensic evidence from GitHub sources. Use when creating verifiable evidence objects from GitHub API, GH Archive, Wayback Machine, local git repositories, or security vendor reports. Handles evidence storage, querying, and re-verification against original sources.
user-invocable: false
version: 2.0
author: mbrg
tags:
  - github
  - forensics
  - osint
  - evidence
  - verification
  - git
---
# GH 证据工具包

**用途**：从 GitHub 相关的公开来源和本地 git 仓库创建、存储并验证取证证据。

## 何时使用此技能

- 根据 GitHub 活动创建可验证的证据对象
- **本地 git 取证**——分析克隆的仓库、悬空提交和 reflog
- 将证据集合导出为 JSON，以便共享或归档
- 加载并重新验证先前收集的证据
- 从 GH Archive 恢复已删除的 GitHub 内容（议题、PR、提交）
- 跟踪 IOC（入侵指标）并验证来源

## 快速开始

```python
from src.collectors import GitHubAPICollector, LocalGitCollector, GHArchiveCollector
from src import EvidenceStore

# Create collectors for different sources
github = GitHubAPICollector()
local = LocalGitCollector("/path/to/repo")
archive = GHArchiveCollector()

# Collect evidence from GitHub API
commit = github.collect_commit("aws", "aws-toolkit-vscode", "678851b...")
pr = github.collect_pull_request("aws", "aws-toolkit-vscode", 7710)

# Collect evidence from local git (first-class forensic source)
local_commit = local.collect_commit("HEAD")
dangling = local.collect_dangling_commits()  # Forensic gold!

# Store and export
store = EvidenceStore()
store.add(commit)
store.add(pr)
store.add(local_commit)
store.add_all(dangling)
store.save("evidence.json")

# Verify all evidence against original sources
is_valid, errors = store.verify_all()
```

## 收集器

### GitHubAPICollector

从实时 GitHub API 收集证据。

```python
from src.collectors import GitHubAPICollector

collector = GitHubAPICollector()
```

| 方法 | 返回值 |
|--------|---------|
| `collect_commit(owner, repo, sha)` | CommitObservation |
| `collect_issue(owner, repo, number)` | IssueObservation |
| `collect_pull_request(owner, repo, number)` | IssueObservation |
| `collect_file(owner, repo, path, ref)` | FileObservation |
| `collect_branch(owner, repo, branch_name)` | BranchObservation |
| `collect_tag(owner, repo, tag_name)` | TagObservation |
| `collect_release(owner, repo, tag_name)` | ReleaseObservation |
| `collect_forks(owner, repo)` | list[ForkObservation] |

### LocalGitCollector（一等取证来源）

从本地 git 仓库收集证据。对于克隆仓库的取证分析至关重要。

```python
from src.collectors import LocalGitCollector

collector = LocalGitCollector("/path/to/cloned/repo")

# Collect a specific commit
commit = collector.collect_commit("HEAD")
commit = collector.collect_commit("abc123")

# Find dangling commits (not reachable from any ref)
# This is forensic gold - reveals force-pushed or deleted commits!
dangling = collector.collect_dangling_commits()
for commit in dangling:
    print(f"Found dangling: {commit.sha[:8]} - {commit.message}")
```

| 方法 | 返回值 |
|--------|---------|
| `collect_commit(sha)` | CommitObservation |
| `collect_dangling_commits()` | list[CommitObservation] |

### GHArchiveCollector

从 GH Archive（BigQuery）收集并恢复证据。需要凭据。

```python
from src.collectors import GHArchiveCollector

collector = GHArchiveCollector()

# Query events by timestamp (YYYYMMDDHHMM format)
events = collector.collect_events(
    timestamp="202507132037",
    repo="aws/aws-toolkit-vscode"
)

# Recover deleted content
deleted_issue = collector.recover_issue("aws/aws-toolkit-vscode", 123, "2025-07-13T20:30:24Z")
deleted_pr = collector.recover_pr("aws/aws-toolkit-vscode", 7710, "2025-07-13T20:30:24Z")
deleted_commit = collector.recover_commit("aws/aws-toolkit-vscode", "678851b", "2025-07-13T20:30:24Z")
force_pushed = collector.recover_force_push("aws/aws-toolkit-vscode", "2025-07-13T20:30:24Z")
```

| 方法 | 返回值 |
|--------|---------|
| `collect_events(timestamp, repo, actor, event_type)` | list[Event] |
| `recover_issue(repo, number, timestamp)` | IssueObservation |
| `recover_pr(repo, number, timestamp)` | IssueObservation |
| `recover_commit(repo, sha, timestamp)` | CommitObservation |
| `recover_force_push(repo, timestamp)` | CommitObservation |

### WaybackCollector

从互联网档案馆的时光机中收集已归档的快照。

```python
from src.collectors import WaybackCollector

collector = WaybackCollector()

# Get all snapshots for a URL
snapshots = collector.collect_snapshots("https://github.com/owner/repo")

# With date filtering
snapshots = collector.collect_snapshots(
    "https://github.com/owner/repo",
    from_date="20250101",
    to_date="20250731"
)

# Fetch actual content of a snapshot
content = collector.collect_snapshot_content(
    "https://github.com/owner/repo",
    "20250713203024"  # YYYYMMDDHHMMSS format
)
```

## 验证

验证与数据收集相互独立。使用 `ConsistencyVerifier` 根据原始来源验证证据。

```python
from src.verifiers import ConsistencyVerifier

verifier = ConsistencyVerifier()

# Verify single evidence
result = verifier.verify(commit)
if not result.is_valid:
    print(f"Errors: {result.errors}")

# Verify multiple
result = verifier.verify_all([commit, pr, issue])
```

或者使用 `EvidenceStore` 提供的便捷方法：

```python
store = EvidenceStore()
store.add_all([commit, pr, issue])
is_valid, errors = store.verify_all()
```

## EvidenceStore

存储、查询和导出证据集合。

```python
from src import EvidenceStore
from datetime import datetime

store = EvidenceStore()

# Add evidence
store.add(commit)
store.add_all([pr, issue, ioc])

# Query
commits = store.filter(observation_type="commit")
recent = store.filter(after=datetime(2025, 7, 1))
from_github = store.filter(source="github")
from_git = store.filter(source="git")
repo_events = store.filter(repo="aws/aws-toolkit-vscode")

# Export/Import
store.save("evidence.json")
store = EvidenceStore.load("evidence.json")

# Summary
print(store.summary())
# {'total': 5, 'events': {...}, 'observations': {...}, 'by_source': {...}}

# Verify all against sources
is_valid, errors = store.verify_all()
```

## 从 JSON 加载证据

```python
from src import load_evidence_from_json
import json

with open("evidence.json") as f:
    data = json.load(f)

for item in data:
    evidence = load_evidence_from_json(item)
    # Evidence is now a typed Pydantic model
```

## 证据类型

### 事件（来自 GH Archive）

支持全部 12 种 GitHub 事件类型：

| 类型 | 描述 |
|------|-------------|
| PushEvent | 推送的提交 |
| PullRequestEvent | 打开/关闭/合并的 PR |
| IssueEvent | 打开/关闭的议题 |
| IssueCommentEvent | 对议题/PR 的评论 |
| CreateEvent | 创建的分支/标签 |
| DeleteEvent | 删除的分支/标签 |
| ForkEvent | 复刻的仓库 |
| WatchEvent | 加星标的仓库 |
| MemberEvent | 添加/移除的协作者 |
| PublicEvent | 转为公开的仓库 |
| ReleaseEvent | 发布/创建/删除的版本 |
| WorkflowRunEvent | GitHub Actions 运行记录 |

### 观测记录（来自 GitHub API、本地 Git、Wayback、供应商）

| 类型 | 描述 | 来源 |
|------|-------------|---------|
| CommitObservation | 提交元数据和文件 | GitHub、Git、GH Archive |
| IssueObservation | 议题或 PR | GitHub、GH Archive |
| FileObservation | 指定 ref 下的文件内容 | GitHub |
| BranchObservation | 分支 HEAD | GitHub |
| TagObservation | 标签目标 | GitHub |
| ReleaseObservation | 发布版本元数据 | GitHub |
| ForkObservation | 复刻关系 | GitHub |
| SnapshotObservation | Wayback 快照 | Wayback |
| IOC | 失陷指标 | 供应商 |
| ArticleObservation | 安全报告/博客 | 供应商 |

## IOC 类型

```python
from src import EvidenceSource, IOCType
from src.schema import IOC, VerificationInfo
from pydantic import HttpUrl
from datetime import datetime, timezone

# IOCs are created directly as schema objects
ioc = IOC(
    evidence_id="ioc-commit-sha-abc123",
    observed_when=datetime.now(timezone.utc),
    observed_by=EvidenceSource.SECURITY_VENDOR,
    observed_what="Malicious commit SHA found in vendor report",
    verification=VerificationInfo(
        source=EvidenceSource.SECURITY_VENDOR,
        url=HttpUrl("https://vendor.com/report")
    ),
    ioc_type=IOCType.COMMIT_SHA,
    value="678851bbe9776228f55e0460e66a6167ac2a1685",
)
```

可用的 IOC 类型：`COMMIT_SHA`、`FILE_PATH`、`FILE_HASH`、`CODE_SNIPPET`、`EMAIL`、`USERNAME`、`REPOSITORY`、`TAG_NAME`、`BRANCH_NAME`、`WORKFLOW_NAME`、`IP_ADDRESS`、`DOMAIN`、`URL`、`API_KEY`、`SECRET`

## 测试

### 运行单元测试

```bash
cd .claude/skills/oss-forensics/github-evidence-kit
pip install -r requirements.txt
pytest tests/ -v --ignore=tests/test_integration.py
```

### 运行集成测试（可选）

集成测试会访问真实的外部服务（GitHub API、BigQuery、供应商 URL）：

```bash
# All integration tests
pytest tests/test_integration.py -v -m integration

# Skip integration tests in CI
pytest tests/ -v -m "not integration"
```

**注意**：GitHub API 集成测试在未认证时使用每小时 60 次请求的速率限制。BigQuery 测试需要凭据（见下文）。

## GCP BigQuery 凭据（用于 GH Archive）

GH Archive 查询需要 Google Cloud BigQuery 凭据。有两种方式：

### 方式 1：JSON 文件路径

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

### 方式 2：环境变量中的 JSON 内容

适用于 `.env` 文件或 CI 密钥：

```bash
export GOOGLE_APPLICATION_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"..."}'
```

客户端会自动检测内容是 JSON 还是文件路径。

### 设置步骤

1. 创建一个 [Google Cloud 项目](https://console.cloud.google.com/)
2. 启用 BigQuery API
3. 创建一个具有 `BigQuery User` 角色的服务账号
4. 下载 JSON 凭据
5. 设置 `GOOGLE_APPLICATION_CREDENTIALS` 环境变量

**免费额度**：每月包含 1 TB 的 BigQuery 查询额度。

## 要求

```bash
pip install -r requirements.txt
```

- `pydantic` - 模式验证
- `requests` - HTTP 客户端
- `google-cloud-bigquery` - GH Archive 查询（可选）
- `google-auth` - GCP 身份验证（可选）