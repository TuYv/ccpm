---
name: export-open-issues
description: Audit and export open issues from any project tracker with summary analysis and vault archival
roles: [product-manager, engineering-lead, founder]
integrations: [github, linear, jira]
---
# COG 导出未解决议题技能

## 何时调用
- 用户希望审查未解决议题或待办事项的健康状况
- 用户提到“export issues”“open issues”“backlog audit”“issue report”或“what's open”
- Sprint/周期规划准备——需要清楚了解正在进行的工作
- 利益相关者报告——需要获取当前工作状态的快照

## Agent 模式感知

**检查 `00-inbox/MY-PROFILE.md` frontmatter 中的 `agent_mode`：**
- 如果为 `agent_mode: team`——使用并行 Agent 同时从所有活跃的跟踪系统中收集信息，并生成统一报告
- 如果为 `agent_mode: solo`——依次从主要跟踪系统中收集信息

## 命令：`/export-open-issues`

## 执行前检查

1. **读取 `00-inbox/MY-INTEGRATIONS.md`**，以确定哪些跟踪系统处于活跃状态
2. **读取 `00-inbox/MY-PROFILE.md`**，以获取活跃项目
3. **获取当前时间戳：** 使用 Bash 运行 `date '+%Y-%m-%d %H:%M'`

4. **询问用户**（如果尚未提供）：
   - 哪个项目？（如果有多个活跃项目）
   - 范围：所有未解决议题，还是按标签/里程碑/负责人筛选？
   - 是否包含额外分析？（账龄、优先级分布、负责人工作量）

---

## 执行策略

### 阶段 1：收集未解决议题

#### 团队模式（并行 Agent）

使用 Task 工具并设置 `run_in_background: true` 来启动收集 Agent：

**Agent：“github-issues-collector”**（如果 GitHub 处于活跃状态）
```
Export all open issues from GitHub.
Repository: [CUSTOMIZE: your-org/your-repo]

1. Get all open issues:
   gh issue list --repo [CUSTOMIZE: your-org/your-repo] --state open --json number,title,author,assignees,labels,createdAt,updatedAt,milestone,url --limit 500

2. Get all open PRs (separate from issues):
   gh pr list --repo [CUSTOMIZE: your-org/your-repo] --state open --json number,title,author,labels,createdAt,updatedAt,reviewDecision,url --limit 200

For each issue, calculate:
- Age in days (today - createdAt)
- Days since last update (today - updatedAt)
- Staleness flag: >30 days since last update = stale

Return: full issue list with calculated fields
```

**Agent：“linear-issues-collector”**（如果 Linear 处于活跃状态）
```
Export all open issues from Linear.

1. Use ToolSearch to load Linear tools
2. List all teams: mcp__claude_ai_Linear_2__list_teams
3. For each relevant team, list open issues: mcp__claude_ai_Linear_2__list_issues
4. Get current cycles: mcp__claude_ai_Linear_2__list_cycles
5. Get milestones: mcp__claude_ai_Linear_2__list_milestones

For each issue, collect:
- ID, title, status, priority, assignee, labels, project
- Created date, updated date
- Cycle membership
- Blocked status

Return: full issue list with metadata
```

**Agent：“jira-issues-collector”**（如果 Jira 处于活跃状态）
```
Export all open issues from Jira.
Project: [CUSTOMIZE: YOUR-PROJECT-KEY]

1. Search open issues:
   JQL: project = "[CUSTOMIZE: YOUR-PROJECT-KEY]" AND status NOT IN (Done, Closed, Resolved) ORDER BY priority DESC, created ASC

2. For each issue, collect:
   key, summary, issuetype, status, priority, assignee, reporter, labels, components, fixVersion, created, updated, duedate

Return: full issue list with metadata
```

#### 单独模式
针对主要跟踪器按顺序执行收集。

### 阶段 2：分析和分类

处理收集到的数据以生成：

#### 2.1 汇总统计
```
Total Open Issues: [N]
  - By Priority: Critical [N], High [N], Medium [N], Low [N], None [N]
  - By Type: Feature [N], Bug [N], Task [N], Other [N]
  - By Status: To Do [N], In Progress [N], In Review [N], Blocked [N]
  - By Assignee: [Name] ([N]), [Name] ([N]), Unassigned ([N])
```

#### 2.2 健康状况指标
- **陈旧议题**（超过 30 天未更新）：列出议题及其存在时长
- **未分配议题**：列出议题及其优先级
- **受阻议题**：列出议题及阻塞详情
- **逾期议题**（已超过截止日期）：列出议题及逾期天数
- **最早创建的未关闭议题**：按存在时长列出前 10 个
- **处理中瓶颈**：处于 "In Progress" 状态超过 7 天的议题

#### 2.3 分布图（基于文本）
```
Priority Distribution:
  Critical  ████░░░░░░  12%
  High      ████████░░  38%
  Medium    ██████░░░░  28%
  Low       ████░░░░░░  22%

Age Distribution:
  <7 days   ██████████  45%
  7-30 days ██████░░░░  30%
  30-90 d   ███░░░░░░░  15%
  >90 days  ██░░░░░░░░  10%
```

### 阶段 3：生成报告

```markdown
---
type: open-issues-audit
project: [project-name]
date: [YYYY-MM-DD]
created: [YYYY-MM-DD HH:MM]
source: [github/linear/jira/multi]
tags: ["#issues-audit", "#[project-name]", "#backlog"]
summary:
  total_open: [N]
  critical: [N]
  high: [N]
  stale: [N]
  unassigned: [N]
  blocked: [N]
  oldest_days: [N]
---

# Open Issues Audit — [Project Name]

**Date:** [YYYY-MM-DD]
**Source:** [Tracker(s) used]
**Total Open Issues:** [N]

---

## Executive Summary

[2-3 sentences: overall backlog health, biggest concerns, and recommended actions]

---

## Summary Statistics

| Category | Count | % of Total |
|----------|-------|-----------|
| **By Priority** | | |
| Critical | [N] | [%] |
| High | [N] | [%] |
| Medium | [N] | [%] |
| Low | [N] | [%] |
| No Priority | [N] | [%] |
| **By Status** | | |
| To Do | [N] | [%] |
| In Progress | [N] | [%] |
| In Review | [N] | [%] |
| Blocked | [N] | [%] |
| **By Type** | | |
| Feature/Story | [N] | [%] |
| Bug | [N] | [%] |
| Task | [N] | [%] |
| Other | [N] | [%] |

---

## Assignee Load

| Assignee | Open Issues | Critical/High | In Progress | Oldest Issue (days) |
|----------|-------------|---------------|-------------|-------------------|
| [Name] | [N] | [N] | [N] | [N] |
| [Name] | [N] | [N] | [N] | [N] |
| Unassigned | [N] | [N] | — | [N] |

---

## Health Alerts

### Stale Issues (>30 days without update)
| # | Title | Assignee | Priority | Age (days) | Last Updated |
|---|-------|----------|----------|-----------|-------------|
| [#] | [Title] | [Name] | [Priority] | [N] | [Date] |

### Blocked Issues
| # | Title | Assignee | Blocked By | Days Blocked |
|---|-------|----------|-----------|-------------|
| [#] | [Title] | [Name] | [Reason] | [N] |

### Unassigned High-Priority Issues
| # | Title | Priority | Age (days) | Labels |
|---|-------|----------|-----------|--------|
| [#] | [Title] | [Priority] | [N] | [Labels] |

### Overdue Issues
| # | Title | Assignee | Due Date | Days Overdue |
|---|-------|----------|----------|-------------|
| [#] | [Title] | [Name] | [Date] | [N] |

---

## Full Issue List

### Critical Priority
| # | Title | Status | Assignee | Age | Labels | URL |
|---|-------|--------|----------|-----|--------|-----|
| [#] | [Title] | [Status] | [Name] | [N]d | [Labels] | [URL] |

### High Priority
[Same table format]

### Medium Priority
[Same table format]

### Low Priority
[Same table format]

---

## Recommendations

1. **[Recommendation 1]** — [Specific action with rationale]
2. **[Recommendation 2]** — [Specific action with rationale]
3. **[Recommendation 3]** — [Specific action with rationale]

---

*Generated by COG Open Issues Audit | [Date]*
```

### 阶段 4：保存到仓库

保存到：`04-projects/[project]/audits/open-issues-YYYY-MM-DD.md`

```bash
mkdir -p "04-projects/[project]/audits"
```

### 阶段 5：展示结果

向用户展示：
1. 执行摘要
2. 关键健康状况警报（长期未更新、被阻塞、未分配）
3. 主要建议
4. 文件位置

询问他们是否需要：
- 完整的详细视图
- 导出为 CSV（在 Markdown 文件旁生成一个简单的 CSV 文件）
- 分享到特定频道或 Wiki

---

## CSV 导出（可选）

如果用户请求 CSV，则在 Markdown 文件旁生成：

```
#,Title,Type,Status,Priority,Assignee,Labels,Created,Updated,Age(days),URL
[data rows]
```

保存到：`04-projects/[project]/audits/open-issues-YYYY-MM-DD.csv`

---

## 回退行为

| 场景 | 行为 |
|----------|----------|
| 没有已启用的跟踪器 | 告知用户需要集成项目跟踪器；提出帮助设置一个 |
| 跟踪器 API 失败 | 重试一次，然后报告部分结果并附上错误说明 |
| 议题过多（>500） | 分页收集，提醒用户，并提出可按标签、里程碑或负责人筛选 |
| 启用了多个跟踪器 | 从所有跟踪器收集数据并生成统一报告，同时注明每个条目的来源 |
| 未发现开放议题 | 报告待办事项列表状态良好（这是个好消息！） |

## 错误处理

- **速率限制**：对请求进行分页，并在需要时添加延迟
- **大型载荷**：如果议题数量超过 200，则进行汇总，而不是列出所有条目
- **缺失字段**：标记为 "N/A"，而不是执行失败
- **上下文溢出**：分批处理，并对每一批进行汇总