---
name: project-stage-detect
description: "Automatically analyze project state, detect stage, identify gaps, and recommend next steps based on existing artifacts. Use when user asks 'where are we in development', 'what stage are we in', 'full project audit'."
argument-hint: "[optional: role filter like 'programmer' or 'designer']"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write
model: haiku
# Read-only diagnostic skill — no specialist agent delegation needed
---
# 项目阶段检测

此技能会扫描你的项目，以确定其当前开发阶段、产物的完整程度以及需要关注的缺口。它在以下情况下尤其有用：
- 从现有项目开始工作
- 熟悉代码库
- 在里程碑前检查还缺少什么
- 了解“我们目前处于什么阶段？”

---

## 工作流程

### 1. 扫描关键目录

分析项目结构和内容：

**设计文档**（`design/`）：
- 统计 `design/gdd/*.md` 中的 GDD 文件数量
- 检查是否存在 game-concept.md、game-pillars.md、systems-index.md
- 如果 systems-index.md 存在，统计系统总数和已完成设计的系统数
- 分析完整性（概述、详细设计、边界情况等）
- 统计 `design/narrative/` 中的叙事文档数量
- 统计 `design/levels/` 中的关卡设计数量

**源代码**（`src/`）：
- 统计源文件数量（不限定语言）
- 识别主要系统（包含 5 个以上文件的目录）
- 检查是否存在 core/、gameplay/、ai/、networking/、ui/ 目录
- 估算代码行数（粗略规模）

**制作产物**（`production/`）：
- 检查是否有进行中的冲刺计划
- 查找里程碑定义
- 查找路线图文档

**原型**（`prototypes/`）：
- 统计原型目录数量
- 检查是否存在 README（已记录文档与未记录文档）
- 评估原型是已归档还是仍在进行

**架构文档**（`docs/architecture/`）：
- 统计 ADR（架构决策记录）数量
- 检查是否有概述/索引文档

**测试**（`tests/`）：
- 统计测试文件数量
- 估算测试覆盖率（粗略启发式判断）

### 2. 对项目阶段进行分类

根据扫描到的产物确定项目阶段。首先检查 `production/stage.txt`——
如果存在，则使用其中的值（由 `/gate-check` 显式覆盖）。否则，
使用以下启发式规则自动检测（从最成熟的阶段开始向前检查）：

| 阶段 | 指标 |
|-------|-----------|
| **概念阶段** | 没有游戏概念文档，处于头脑风暴阶段 |
| **系统设计阶段** | 游戏概念已存在，但系统索引缺失或不完整 |
| **技术搭建阶段** | 系统索引已存在，但引擎尚未配置 |
| **前期制作阶段** | 引擎已配置，`src/` 中的源文件少于 10 个 |
| **制作阶段** | `src/` 中有 10 个以上源文件，正在积极开发 |
| **打磨阶段** | 仅可显式设置（由 `/gate-check` 的制作阶段 → 打磨阶段门禁设置） |
| **发布阶段** | 仅可显式设置（由 `/gate-check` 的打磨阶段 → 发布阶段门禁设置） |

### 3. 协作式缺口识别

**不要**只是列出缺失的文件。相反，应该**提出澄清问题**：

- “我看到有战斗代码（`src/gameplay/combat/`），但没有 `design/gdd/combat-system.md`。这是先做了原型，还是应该补写文档？”
- “你有 15 个 ADR，但没有架构概述。需要我创建一份，以帮助新贡献者吗？”
- “`production/` 中没有冲刺计划。你是否在其他地方（Jira、Trello 等）跟踪工作？”
- “我找到了游戏概念，但没有系统索引。你是否已经将概念拆分为各个独立系统，还是应该运行 `/map-systems`？”
- “原型目录中有 3 个项目没有 README。这些只是实验，还是需要补充文档？”

### 4. 生成阶段报告

使用模板：`.claude/docs/templates/project-stage-report.md`

**报告结构**：
```markdown
# Project Stage Analysis

**Date**: [date]
**Stage**: [Concept/Systems Design/Technical Setup/Pre-Production/Production/Polish/Release]
**Stage Confidence**: [PASS — clearly detected / CONCERNS — ambiguous signals / FAIL — critical gaps block progress]

## Completeness Overview
- Design: [X%] ([N] docs, [gaps])
- Code: [X%] ([N] files, [systems])
- Architecture: [X%] ([N] ADRs, [gaps])
- Production: [X%] ([status])
- Tests: [X%] ([coverage estimate])

## Gaps Identified
1. [Gap description + clarifying question]
2. [Gap description + clarifying question]

## Recommended Next Steps
[Priority-ordered list based on stage and role]
```

### 5. 按角色筛选的建议（可选）

如果用户提供了角色参数（例如 `/project-stage-detect programmer`）：

**程序员**：
- 重点关注架构文档、测试覆盖率和缺失的 ADR
- 代码与文档之间的缺口

**设计师**：
- 重点关注 GDD 的完整性及缺失的设计章节
- 原型文档

**制作人**：
- 重点关注冲刺计划、里程碑跟踪和路线图
- 跨团队协作文档

**通用**（未指定角色）：
- 全面审视所有缺口
- 各领域中优先级最高的事项

### 6. 写入前请求批准

**协作协议**：
```
I've analyzed your project. Here's what I found:

[Show summary]

Gaps identified:
1. [Gap 1 + question]
2. [Gap 2 + question]

Recommended next steps:
- [Priority 1]
- [Priority 2]
- [Priority 3]

May I write the full stage analysis to production/project-stage-report.md?
```

创建文件前，等待用户批准。

---

## 使用示例

```bash
# General project analysis
/project-stage-detect

# Programmer-focused analysis
/project-stage-detect programmer

# Designer-focused analysis
/project-stage-detect designer
```

---

## 后续操作

生成报告后，建议相关的后续步骤：

- **已有概念但没有系统索引？** → 使用 `/map-systems` 将其拆分为多个系统
- **缺少设计文档？** → `/reverse-document design src/[system]`
- **缺少架构文档？** → `/architecture-decision` 或 `/reverse-document architecture`
- **原型需要文档？** → `/reverse-document concept prototypes/[name]`
- **没有冲刺计划？** → `/sprint-plan`
- **即将到达里程碑？** → `/milestone-review`

---

## 协作协议

此技能遵循协作式设计原则：

1. **先提问**：询问缺口，不要自行假设
2. **提供选项**：“我应该创建 X，还是它已在其他地方进行跟踪？”
3. **由用户决定**：等待用户指示
4. **展示草稿**：显示报告摘要
5. **获得批准**：“我可以写入 `production/project-stage-report.md` 吗？”

**绝不**静默写入文件。创建产物前，**始终**展示发现并征求许可。