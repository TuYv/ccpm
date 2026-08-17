---
name: generate-release-notes
description: Generate categorized release notes from any source (GitHub, Linear, Jira, or manual input) with optional publishing
roles: [product-manager, engineering-lead, founder]
integrations: [github, linear, jira, confluence, notion, hackmd]
---
# COG 生成发布说明 Skill

## 何时调用
- 用户希望为某个版本、Sprint 或周期创建发布说明
- 用户提到“发布说明”“变更日志”“发布了什么”“撰写发布说明”
- 新版本或里程碑已经完成
- Sprint/周期结束时的文档记录

## Agent 模式感知

**检查 `00-inbox/MY-PROFILE.md` frontmatter 中的 `agent_mode`：**
- 如果为 `agent_mode: team` — 使用并行 Agent，同时从所有活跃数据源收集数据
- 如果为 `agent_mode: solo` — 从主要跟踪系统按顺序收集数据

## 命令：`/generate-release-notes`

## 执行前检查

1. **读取 `00-inbox/MY-INTEGRATIONS.md`**，确定数据源和发布选项
2. **读取 `00-inbox/MY-PROFILE.md`**，获取活跃项目
3. **获取当前时间戳：**使用 Bash 运行 `date '+%Y-%m-%d %H:%M'`

4. **询问用户**（如果尚未提供）：
   - 这是针对哪个版本/发布/周期？
   - 日期范围是什么？（或者：哪个里程碑/周期/Sprint？）
   - 哪个项目？（如果有多个活跃项目）
   - 受众：内部团队、客户，还是两者？

---

## 执行策略

### 阶段 1：收集发布数据

#### 团队模式（并行 Agent）

使用 Task 工具并设置 `run_in_background: true`，启动数据收集 Agent：

**Agent："github-release-collector"**（如果 GitHub 处于活跃状态）
```
Collect all merged PRs and release data for the specified version/period.
Repository: [CUSTOMIZE: your-org/your-repo]
Period: [START_DATE] to [END_DATE]

1. Get merged PRs in the period:
   gh pr list --repo [CUSTOMIZE: your-org/your-repo] --state merged --search "merged:[START_DATE]..[END_DATE]" --json number,title,author,labels,body,mergedAt --limit 200

2. Check for existing GitHub release (if version tag exists):
   gh release view [VERSION_TAG] --repo [CUSTOMIZE: your-org/your-repo] --json name,body,tagName,createdAt 2>/dev/null

3. Get commits between tags (if applicable):
   gh api repos/[CUSTOMIZE: your-org/your-repo]/compare/[PREV_TAG]...[CURRENT_TAG] --jq '.commits[] | {sha: .sha[:7], message: .commit.message, author: .author.login}'

Categorize each PR by its labels or title prefix:
- "feat"/"feature"/"enhancement" labels → Enhancements
- "fix"/"bug"/"bugfix" labels → Bug Fixes
- "tech"/"refactor"/"chore"/"infrastructure" labels → Technical Improvements
- "docs"/"documentation" labels → Documentation
- "security" labels → Security
- "breaking"/"breaking-change" labels → Breaking Changes
- "deprecation" labels → Deprecations

Return: categorized list of changes with PR numbers, titles, authors, and descriptions
```

**Agent："linear-release-collector"**（如果 Linear 处于活跃状态）
```
Collect completed issues for the specified cycle/period.

1. Use ToolSearch to load Linear tools
2. List cycles: mcp__claude_ai_Linear_2__list_cycles
3. Find the target cycle or filter by date range
4. List all completed issues in the cycle/period: mcp__claude_ai_Linear_2__list_issues
5. For each issue, get details including labels and project

Categorize by label or issue type:
- Feature/Enhancement labels → Enhancements
- Bug labels → Bug Fixes
- Technical/Infrastructure labels → Technical Improvements
- Documentation labels → Documentation

Return: categorized list of changes with issue IDs, titles, assignees, and descriptions
```

**代理：“jira-release-collector”**（如果 Jira 处于启用状态）
```
Collect issues for the specified version/sprint.
Project: [CUSTOMIZE: YOUR-PROJECT-KEY]

1. Search by fixVersion:
   JQL: project = "[CUSTOMIZE: YOUR-PROJECT-KEY]" AND fixVersion = "[VERSION]" AND status = Done ORDER BY issuetype, priority DESC

   OR search by sprint:
   JQL: project = "[CUSTOMIZE: YOUR-PROJECT-KEY]" AND sprint = "[SPRINT_NAME]" AND status = Done ORDER BY issuetype, priority DESC

2. For each issue, collect: key, summary, issuetype, priority, assignee, labels, description

Categorize by issue type:
- Story/Feature → Enhancements
- Bug → Bug Fixes
- Task/Technical Task → Technical Improvements
- Documentation → Documentation

Return: categorized list with issue keys, titles, assignees, types, and descriptions
```

#### 单独模式
按顺序执行主要跟踪器的信息收集。

#### 手动输入回退方案
如果没有处于启用状态的跟踪器，或用户倾向于手动输入：
```
No project tracker detected. You can provide release items manually.

Please list the changes in this release. I'll categorize them for you.
Format: one change per line, optionally prefix with [feature], [fix], [tech], [docs], [security], [breaking]
```

### 阶段 2：分类和整理

将收集的条目整理到标准类别中：

1. **破坏性变更**（如果存在，始终置于首位）
2. **新功能与增强**
3. **错误修复**
4. **技术改进**
5. **安全更新**
6. **文档**
7. **弃用**
8. **已知问题**（如果仍有）

在每个类别中，按以下顺序排列：
1. 优先级（从高到低）
2. 用户影响（影响最大者优先）

### 阶段 3：生成发布说明

#### 面向客户/外部受众：

```markdown
---
type: release-notes
project: [project-name]
version: [version]
date: [YYYY-MM-DD]
created: [YYYY-MM-DD HH:MM]
audience: external
tags: ["#release-notes", "#[project-name]", "#v[version]"]
items_count: [total count]
categories:
  enhancements: [count]
  bug_fixes: [count]
  technical: [count]
  security: [count]
  breaking_changes: [count]
---

# Release Notes — [Project Name] [Version]

**Release Date:** [Date]

## What's New

[2-3 sentence executive summary of the most important changes in this release]

---

### Breaking Changes

> **Action Required:** The following changes may require updates to your workflow.

- **[Change title]** — [User-friendly description of what changed and what to do]

---

### New Features & Enhancements

- **[Feature title]** — [User-friendly description focused on the benefit to users]
- **[Feature title]** — [User-friendly description]

### Bug Fixes

- **[Fix title]** — [What was broken and how it's fixed, in user terms]
- **[Fix title]** — [Description]

### Security Updates

- **[Update title]** — [Description without exposing vulnerability details]

### Deprecations

- **[Deprecated feature]** — [What's being deprecated, timeline, and migration path]

---

### Known Issues

- [Known issue description] — [Workaround if available]

---

*For questions or feedback, [CUSTOMIZE: contact info or link]*
```

#### 面向内部/团队受众：

```markdown
---
type: release-notes
project: [project-name]
version: [version]
date: [YYYY-MM-DD]
created: [YYYY-MM-DD HH:MM]
audience: internal
tags: ["#release-notes", "#[project-name]", "#v[version]"]
source_tracker: [github/linear/jira/manual]
---

# Release Notes — [Project Name] [Version] (Internal)

**Release Date:** [Date]
**Cycle/Sprint:** [Name if applicable]

## Summary
[Executive summary with key stats: N features, N fixes, N tech improvements]

---

### Breaking Changes
- **[Title]** ([PR/Issue #link]) — [Technical description] — @[author]

### New Features & Enhancements
- **[Title]** ([PR/Issue #link]) — [Description] — @[author]

### Bug Fixes
- **[Title]** ([PR/Issue #link]) — [Description] — @[author]

### Technical Improvements
- **[Title]** ([PR/Issue #link]) — [Description] — @[author]

### Documentation
- **[Title]** ([PR/Issue #link]) — [Description] — @[author]

---

### Stats
- **Total items:** [N]
- **Contributors:** [list of contributors]
- **PRs merged:** [N]
- **Issues resolved:** [N]

---

### Known Issues & Follow-ups
- [ ] [Issue description] — Owner: [name]
```

### 阶段 4：审核关卡

向用户展示生成的发布说明：

```
Release notes draft is ready for [Project] [Version].

Summary:
- [N] New Features & Enhancements
- [N] Bug Fixes
- [N] Technical Improvements
- [N] other items

Audience: [external/internal]

Would you like to:
a) Review the full release notes
b) Save as-is to the vault
c) Make changes
d) Publish to [active platform] (requires your approval)
```

**绝不自动发布。始终等待用户明确批准。**

### 阶段 5：保存到知识库

保存至：`04-projects/[project]/release-notes/release-[version]-YYYY-MM-DD.md`

```bash
mkdir -p "04-projects/[project]/release-notes"
```

### 阶段 6：发布（可选，需要批准）

**仅当用户明确批准时才继续。**

#### GitHub 发布
```
gh release create [VERSION_TAG] \
  --repo [CUSTOMIZE: your-org/your-repo] \
  --title "[Project] [Version]" \
  --notes-file [path-to-release-notes]
```

#### Confluence
```
Use WebFetch to publish via Confluence REST API:
- Space: [CUSTOMIZE: YOUR-SPACE-KEY]
- Parent page: [CUSTOMIZE: Release-Notes-parent-page-id]
- Title: "Release Notes — [Project] [Version]"
```

#### Notion
```
1. Use ToolSearch to load Notion tools
2. Use mcp__claude_ai_Notion__notion-create-pages
```

#### HackMD
```
Use WebFetch to publish via HackMD API
```

发布后，使用已发布的 URL 更新知识库副本。

---

## 回退行为

| 场景 | 行为 |
|----------|----------|
| 没有启用的跟踪器 | 接受手动输入，或扫描指定日期范围内的 git 日志以查找提交 |
| 跟踪器 API 失败 | 回退到 git 日志分析：`git log --oneline [PREV_TAG]..[CURRENT_TAG]` |
| 未指定版本标签 | 改用日期范围，或列出最近完成的工作 |
| 混合来源 | 合并来自多个跟踪器的条目并去重 |
| 没有发布平台 | 仅保存到知识库 |
| 发布规模非常大 | 拆分为“亮点”部分和完整变更日志 |

## 错误处理

- **条目过多**：如果条目数 >100，则自动总结次要变更，仅详细列出重要变更
- **缺少 PR 描述**：使用 PR 标题和提交消息作为后备信息
- **跟踪器之间存在重复条目**：通过匹配标题/描述进行去重
- **上下文溢出**：对数据收集进行分页，并按批次总结