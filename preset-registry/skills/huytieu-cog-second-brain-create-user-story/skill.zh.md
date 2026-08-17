---
name: create-user-story
description: Create user stories with duplicate checking across any project tracker (Linear, GitHub Issues, Jira)
roles: [product-manager, engineering-lead, founder]
integrations: [linear, github, jira]
---
# COG 创建用户故事 Skill

## 何时调用
- 用户想要创建新的用户故事、功能请求或议题
- 用户说“创建故事”“新建故事”“添加议题”“编写用户故事”“创建工单”
- 用户描述了一个应被跟踪的功能或需求

## Agent 模式感知

**检查 `00-inbox/MY-PROFILE.md` frontmatter 中的 `agent_mode`：**
- 如果是 `agent_mode: team` — 使用并行 Agent，同时在所有活跃的跟踪器中检查重复项，然后创建故事
- 如果是 `agent_mode: solo` — 在主对话中依次检查重复项并创建故事

## 命令：`/create-user-story`

## 前置检查

1. **读取 `00-inbox/MY-INTEGRATIONS.md`**，确定哪些项目跟踪器处于活跃状态：
   - **Linear** — 使用 Linear MCP 工具
   - **GitHub** — 使用 `gh` CLI
   - **Jira** — 使用 `jira` CLI，或通过 WebFetch 使用 Jira API
   - 如果没有活跃的跟踪器，则将故事保存为 `04-projects/[project]/stories/` 中的 markdown 文件，并告知用户

2. **读取 `00-inbox/MY-PROFILE.md`**，获取：
   - 活跃项目（用于确定目标项目/repo/看板）
   - 用户姓名（用于标注故事作者）

3. **询问用户**（如果尚未提供）：
   - 功能或需求是什么？（自由形式描述）
   - 它属于哪个项目？（如果有多个活跃项目）
   - 优先级？（可选 — 默认为中等）

---

## 执行策略

### 阶段 1：理解请求

解析用户输入，提取：
- **功能描述** — 用户希望构建什么
- **目标用户** — 谁将从中受益
- **问题陈述** — 它解决了什么问题
- **项目上下文** — 它属于哪个项目

如果用户提供的描述较为简略，请先提出澄清问题再继续：
- 此功能的目标用户是谁？
- 此功能解决了什么问题？
- 你是否已经设想了任何具体的验收标准？

### 阶段 2：重复项检查

**关键：创建前始终检查重复项。**

#### 团队模式（并行 Agent）

使用 Task 工具并设置 `run_in_background: true`，并行启动重复项检查 Agent：

**Agent：“duplicate-checker-linear”**（如果 Linear 处于活跃状态）
```
Search Linear for potential duplicate issues.
1. Use ToolSearch to load Linear tools
2. Use mcp__claude_ai_Linear_2__list_issues to search for issues with similar keywords
3. Search across all active projects/teams
4. Return any issues that match by title similarity or description overlap

Search terms: [extracted keywords from user's description]
Return: list of potential duplicates with title, status, URL, and similarity assessment
```

**Agent：“duplicate-checker-github”**（如果 GitHub 处于活跃状态）
```
Search GitHub Issues for potential duplicates.
Repository: [CUSTOMIZE: your-org/your-repo]

1. gh search issues "[keywords]" --repo [CUSTOMIZE: your-org/your-repo] --json number,title,state,url,body --limit 20
2. Also search closed issues to check if this was already done:
   gh search issues "[keywords]" --repo [CUSTOMIZE: your-org/your-repo] --state closed --json number,title,state,url --limit 10

Return: list of potential duplicates with title, status, URL, and similarity assessment
```

**代理：“duplicate-checker-jira”**（如果 Jira 处于启用状态）
```
Search Jira for potential duplicate issues.
Project: [CUSTOMIZE: YOUR-PROJECT-KEY]

1. Use WebFetch or jira CLI to search:
   JQL: project = "[CUSTOMIZE: YOUR-PROJECT-KEY]" AND text ~ "[keywords]" ORDER BY created DESC
2. Check both open and recently resolved issues

Return: list of potential duplicates with key, title, status, URL, and similarity assessment
```

#### 单人模式（顺序执行）
针对当前启用的跟踪器，依次执行相同的重复项检查。

### 阶段 3：报告重复项（如果找到）

如果发现潜在的重复项，请将其呈现给用户：

```
I found [N] potential duplicate(s):

1. **[TITLE]** ([STATUS]) — [URL]
   Similarity: [High/Medium/Low] — [reason]

2. **[TITLE]** ([STATUS]) — [URL]
   Similarity: [High/Medium/Low] — [reason]

Options:
a) These are different — proceed with creating the new story
b) This is a duplicate of #[N] — skip creation
c) This is related to #[N] — create and link them
```

**等待用户确认后再继续。**

### 阶段 4：格式化用户故事

以标准用户故事格式生成故事：

```markdown
## Title
[Concise, descriptive title]

## User Story
**As a** [type of user],
**I want** [goal/desire],
**So that** [benefit/value].

## Description
[Expanded description of the feature, including context and background]

## Acceptance Criteria

### Scenario 1: [Happy path scenario name]
- **Given** [precondition]
- **When** [action]
- **Then** [expected outcome]

### Scenario 2: [Alternative scenario name]
- **Given** [precondition]
- **When** [action]
- **Then** [expected outcome]

### Scenario 3: [Edge case or error scenario name]
- **Given** [precondition]
- **When** [action]
- **Then** [expected outcome]

## Technical Notes
[Any implementation hints, constraints, or dependencies — if applicable]

## Out of Scope
[What this story explicitly does NOT cover — helps prevent scope creep]
```

**在创建用户故事之前，将格式化后的故事呈现给用户审核。**

### 阶段 5：在跟踪器中创建

用户批准故事内容后：

#### Linear
```
1. Use ToolSearch to load Linear tools
2. Use mcp__claude_ai_Linear_2__get_team to find the target team
3. Use mcp__claude_ai_Linear_2__list_issue_labels to find appropriate labels
4. Use mcp__claude_ai_Linear_2__save_issue to create the issue with:
   - title: [story title]
   - description: [full story in markdown]
   - team: [target team]
   - priority: [user-specified or default medium]
   - labels: [appropriate labels]
```

#### GitHub Issues
```
gh issue create \
  --repo [CUSTOMIZE: your-org/your-repo] \
  --title "[story title]" \
  --body "[full story in markdown]" \
  --label "[appropriate labels]"
```

#### Jira
```
Use WebFetch to POST to Jira REST API or use jira CLI:
- Project: [CUSTOMIZE: YOUR-PROJECT-KEY]
- Issue Type: Story
- Summary: [story title]
- Description: [full story in markdown/Jira wiki format]
- Priority: [user-specified or default Medium]
- Labels: [appropriate labels]
```

#### 仓库回退（无活跃跟踪器）
保存至 `04-projects/[project]/stories/story-YYYY-MM-DD-[slug].md`

### 阶段 6：确认并关联

1. 向用户确认已创建：
   ```
   Story created: **[TITLE]**
   [URL or file path]
   Priority: [priority]
   Labels: [labels]
   ```

2. 如果用户表示此故事与另一个议题相关（阶段 3，选项 c），请在它们之间创建链接/关联。

3. 同时将本地副本保存至 `04-projects/[project]/stories/`，以供仓库参考。

---

## 回退行为

| 场景 | 行为 |
|----------|----------|
| 无活跃跟踪器 | 以 Markdown 格式保存至 `04-projects/[project]/stories/` |
| 跟踪器 API 失败 | 保存到本地，警告用户，并建议使用格式化后的内容手动创建 |
| 重复项检查失败 | 警告用户已跳过重复项检查，并在确认后继续创建 |
| 用户未指定项目 | 列出 MY-PROFILE.md 中的活跃项目，并询问选择哪一个 |
| 用户提供的信息很少 | 提出澄清问题，以构建完整的故事 |

## 错误处理

- **API 速率限制**：等待并重试一次，然后回退到本地保存
- **身份验证失败**：告知用户其集成可能需要重新进行身份验证
- **搜索结果过多**：将重复项检查限制为相关性最高的 10 个匹配项
- **上下文溢出**：汇总重复项结果，而不是显示完整描述