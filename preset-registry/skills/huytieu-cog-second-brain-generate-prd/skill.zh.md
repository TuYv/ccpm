---
name: generate-prd
description: Generate product requirements documents with optional publishing to Confluence or other wiki platforms
roles: [product-manager, engineering-lead, founder]
integrations: [confluence, notion, hackmd]
---
# COG 生成 PRD 技能

## 何时调用
- 用户希望创建 PRD、产品规格说明或需求文档
- 用户提到“生成 PRD”“编写 PRD”“产品需求”“规格文档”“功能规格”
- 用户有一个需要在开发前进行正式文档化的功能或项目

## 智能体模式感知

**检查 `00-inbox/MY-PROFILE.md` frontmatter 中的 `agent_mode`：**
- 如果为 `agent_mode: team` — 在起草文档的同时，使用并行智能体从多个来源（现有 PRD、相关议题、竞品研究）收集上下文
- 如果为 `agent_mode: solo` — 在主对话中按顺序收集上下文并起草文档

## 命令：`/generate-prd`

## 执行前检查

1. **读取 `00-inbox/MY-INTEGRATIONS.md`** 以确定发布选项：
   - **Confluence** — 可以将 PRD 发布到团队 Wiki
   - **Notion** — 可以将 PRD 发布到 Notion 工作区
   - **HackMD** — 可以将 PRD 发布为共享 Markdown 文档
   - 如果均未启用，则 PRD 仅保留在知识库中（仍然完全可用）

2. **读取 `00-inbox/MY-PROFILE.md`** 以获取：
   - 活跃项目
   - 用户的姓名和角色（用于填写 PRD 作者字段）

3. **获取当前时间戳：**
   使用 Bash 运行 `date '+%Y-%m-%d %H:%M'`，以填充 frontmatter 中的 `created:` 字段

---

## 执行策略

### 阶段 1：收集需求

向用户询问以下信息（跳过他们已经提供的内容）：

**必需：**
- 功能/产品名称
- 问题陈述 — 我们要解决什么问题？
- 目标用户 — 这是为谁构建的？
- 高层级解决方案 — 我们要构建什么？

**可选（如果未提供，将生成合理的默认内容）：**
- 成功指标 — 我们如何衡量成功？
- 约束条件 — 技术、时间、预算或法规方面的约束
- 依赖项 — 这依赖于什么？
- 相关文档 — 设计、研究、既有成果的链接
- 目标时间线 — 需要在何时发布？

### 阶段 2：收集上下文

#### 团队模式（并行智能体）

使用 Task 工具并设置 `run_in_background: true`，启动用于收集上下文的智能体：

**智能体："existing-prd-scanner"**
```
Scan the vault for existing PRDs and related documents.

1. Glob for PRDs: 04-projects/*/PRDs/*.md
2. Glob for related project files: 04-projects/[project]/**/*.md
3. Read recent PRDs to understand the user's preferred format and level of detail
4. Look for any existing docs related to the feature being specified

Return: relevant existing content, user's PRD style preferences, and any related docs
```

**智能体："issue-context-gatherer"**
```
Gather related issues and feature requests from active trackers.

Check 00-inbox/MY-INTEGRATIONS.md for active trackers, then:

If Linear is active:
1. Use ToolSearch to load Linear tools
2. Search for issues related to [feature keywords]
3. Check current initiatives and projects for context

If GitHub is active:
1. gh search issues "[feature keywords]" --repo [CUSTOMIZE: your-org/your-repo] --json number,title,body,labels --limit 15
2. Check for related discussions or feature requests

Return: related issues, existing feature requests, and any prior discussion context
```

#### 单人模式
按顺序执行相同的上下文收集工作。

### 阶段 3：生成 PRD

使用以下模板创建 PRD：

```markdown
---
type: prd
project: [project-name]
feature: [feature-name]
status: draft
author: [user name]
created: [YYYY-MM-DD HH:MM]
last_updated: [YYYY-MM-DD]
version: "1.0"
approvers: [CUSTOMIZE: list of approvers]
tags: ["#prd", "#product", "#[project-name]"]
---

# PRD: [Feature Name]

## Overview

| Field | Value |
|-------|-------|
| **Author** | [Name] |
| **Status** | Draft |
| **Created** | [Date] |
| **Target Release** | [Timeline or TBD] |
| **Priority** | [High/Medium/Low] |

---

## 1. Problem Statement

[Clear description of the problem being solved. Include data or evidence where available.]

### Who is affected?
[Target users and how they're impacted]

### What is the current experience?
[How users currently deal with this problem]

### Why now?
[Why this is important to solve at this time]

---

## 2. Goals & Success Metrics

### Goals
1. [Primary goal]
2. [Secondary goal]
3. [Tertiary goal]

### Success Metrics
| Metric | Current Baseline | Target | Measurement Method |
|--------|-----------------|--------|-------------------|
| [Metric 1] | [Current] | [Target] | [How to measure] |
| [Metric 2] | [Current] | [Target] | [How to measure] |

### Non-Goals
- [What this project explicitly does NOT aim to solve]
- [Scope boundaries]

---

## 3. User Stories

### Primary User: [User Type]

**Story 1:** As a [user type], I want [goal] so that [benefit].

**Story 2:** As a [user type], I want [goal] so that [benefit].

### Secondary User: [User Type] (if applicable)

**Story 3:** As a [user type], I want [goal] so that [benefit].

---

## 4. Proposed Solution

### 4.1 Solution Overview
[High-level description of the proposed solution]

### 4.2 Key Features
1. **[Feature 1]** — [Description]
2. **[Feature 2]** — [Description]
3. **[Feature 3]** — [Description]

### 4.3 User Flow
[Step-by-step description of the primary user flow]

1. User [action]
2. System [response]
3. User [action]
4. System [response]

### 4.4 Edge Cases & Error Handling
| Scenario | Expected Behavior |
|----------|------------------|
| [Edge case 1] | [How the system handles it] |
| [Edge case 2] | [How the system handles it] |

---

## 5. Technical Considerations

### Architecture Impact
[How this fits into the existing system architecture]

### Dependencies
- [Dependency 1] — [Status: available/needs work]
- [Dependency 2] — [Status: available/needs work]

### Technical Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| [Risk 1] | [H/M/L] | [H/M/L] | [Mitigation plan] |

### Performance Requirements
- [Performance requirement 1]
- [Performance requirement 2]

---

## 6. Design & UX

[Link to designs or describe UX requirements]

### Key UX Principles
- [Principle 1]
- [Principle 2]

### Accessibility Requirements
- [Requirement 1]
- [Requirement 2]

---

## 7. Release Strategy

### Rollout Plan
- **Phase 1:** [Description] — [Timeline]
- **Phase 2:** [Description] — [Timeline]

### Feature Flags
- [Feature flag 1] — [Purpose]

### Rollback Plan
[How to roll back if issues arise]

---

## 8. Open Questions

- [ ] [Question 1] — Owner: [Name]
- [ ] [Question 2] — Owner: [Name]
- [ ] [Question 3] — Owner: [Name]

---

## 9. References

- [Link to related PRDs]
- [Link to designs]
- [Link to research]
- [Link to related issues/tickets]

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [Date] | [Author] | Initial draft |
```

### 阶段 4：审核关卡

**向用户展示生成的 PRD：**

```
PRD draft is ready for review.

Sections generated:
1. Problem Statement
2. Goals & Success Metrics
3. User Stories
4. Proposed Solution
5. Technical Considerations
6. Design & UX
7. Release Strategy
8. Open Questions
9. References

Would you like to:
a) Review the full PRD (I'll display it)
b) Save as-is to the vault
c) Make changes to specific sections
d) Publish to [active wiki platform] (requires your approval)
```

**绝不自动发布。始终等待用户明确批准。**

### 阶段 5：保存到仓库

将 PRD 保存至：`04-projects/[project]/PRDs/prd-[feature-slug]-YYYY-MM-DD.md`

如果目录结构不存在，则创建该结构：
```bash
mkdir -p "04-projects/[project]/PRDs"
```

### 阶段 6：发布（可选，需要批准）

**仅当用户明确批准发布时才继续。**

#### Confluence
```
Use WebFetch to publish via Confluence REST API:
- POST /wiki/rest/api/content
- Space: [CUSTOMIZE: YOUR-SPACE-KEY]
- Parent page: [CUSTOMIZE: PRDs-parent-page-id]
- Title: "PRD: [Feature Name]"
- Body: [converted to Confluence storage format]

Note: Convert markdown to Confluence XHTML storage format before publishing.
```

#### Notion
```
1. Use ToolSearch to load Notion tools
2. Use mcp__claude_ai_Notion__notion-create-pages to create the PRD page
3. Place under [CUSTOMIZE: PRDs database or parent page]
```

#### HackMD
```
Use WebFetch to publish via HackMD API:
- POST to create a new note
- Set permissions as configured
```

发布后，使用已发布的 URL 更新仓库副本：
```markdown
published_url: [URL]
published_at: [timestamp]
```

---

## 回退行为

| 场景 | 行为 |
|----------|----------|
| 没有启用的 Wiki 平台 | 仅保存到仓库——PRD 作为本地文档仍然完全可用 |
| 发布 API 失败 | 保存到仓库，并提供格式化后的内容以供手动发布 |
| 用户未指定项目 | 列出 `MY-PROFILE.md` 中的活跃项目并询问用户 |
| 提供的输入很少 | 生成带有 `[TODO]` 标记的 PRD 框架，供用户填写 |
| 发现同一功能已有 PRD | 询问这是更新/修订还是新的 PRD |

## 错误处理

- **上下文溢出**：如果从现有文档中收集了过多上下文，则进行总结，而不是包含完整文本
- **API 失败**：始终先保存到仓库，然后将发布作为单独的步骤尝试
- **大型 PRD**：如果 PRD 超出典型 Wiki 页面的限制，建议将其拆分为多个子页面