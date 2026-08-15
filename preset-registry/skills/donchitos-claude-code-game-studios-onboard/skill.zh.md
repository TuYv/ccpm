---
name: onboard
description: "Generates a contextual onboarding document for a new contributor or agent joining the project. Summarizes project state, architecture, conventions, and current priorities relevant to the specified role or area."
argument-hint: "[role|area]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write
model: haiku
---
## 阶段 1：加载项目上下文

阅读 CLAUDE.md，了解项目概况和规范。

如果指定了特定角色，请阅读 `.claude/agents/` 中相关的智能体定义。

---

## 阶段 2：扫描相关领域

- 程序员：扫描 `src/`，了解架构、模式和关键文件
- 设计师：扫描 `design/`，了解现有设计文档
- 叙事人员：扫描 `design/narrative/`，了解世界观构建和故事文档
- QA：扫描 `tests/`，了解现有测试覆盖情况
- 制作人员：扫描 `production/`，了解当前冲刺和里程碑

阅读近期变更（如果可用，则查看 git log），了解当前的推进态势。

---

## 阶段 3：生成入职文档

```markdown
# Onboarding: [Role/Area]

## Project Summary
[2-3 sentence summary of what this game is and its current state]

## Your Role
[What this role does on this project, key responsibilities, who you report to]

## Project Architecture
[Relevant architectural overview for this role]

### Key Directories
| Directory | Contents | Your Interaction |
|-----------|----------|-----------------|

### Key Files
| File | Purpose | Read Priority |
|------|---------|--------------|

## Current Standards and Conventions
[Summary of conventions relevant to this role from CLAUDE.md and agent definition]

## Current State of Your Area
[What has been built, what is in progress, what is planned next]

## Current Sprint Context
[What the team is working on now and what is expected of this role]

## Key Dependencies
[What other roles/systems this role interacts with most]

## Common Pitfalls
[Things that trip up new contributors in this area]

## First Tasks
[Suggested first tasks to get oriented and productive]

1. [Read these documents first]
2. [Review this code/content]
3. [Start with this small task]

## Questions to Ask
[Questions the new contributor should ask to get fully oriented]
```

---

## 阶段 4：保存文档

向用户展示入职文档。

询问：“我可以将其写入 `production/onboarding/onboard-[role]-[date].md` 吗？”

如果用户同意，则写入文件，并在需要时创建目录。

---

## 阶段 5：后续步骤

结论：**已完成** — 入职文档已生成。

- 在新贡献者首次参与项目之前，与其分享入职文档。
- 运行 `/sprint-status`，向新贡献者展示当前进度。
- 如果贡献者需要关于下一步工作内容的指导，请运行 `/help`。