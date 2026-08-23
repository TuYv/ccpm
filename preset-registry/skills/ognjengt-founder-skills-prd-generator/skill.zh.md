---
name: prd-generator
description: Generates professional PRD (Product Requirements Document) files optimized for AI coding tools. Takes a rough product idea, asks clarifying questions, and outputs a structured PDF ready to feed into AI coding assistants.
---
# PRD 生成器

## 目的
通过有针对性的提问和结构化输出，将一个粗略的产品创意转化为一份全面、可供 AI 使用的产品需求文档（PDF）。

---

## 执行逻辑

**首先检查 $ARGUMENTS 以确定执行模式：**

### 如果 $ARGUMENTS 为空或未提供：
回复：
"prd-generator 已加载，请描述你的产品创意"

然后等待用户在下一条消息中提供其产品概念。

### 如果 $ARGUMENTS 包含内容：
立即继续执行任务（跳过“已加载”消息）。

---

## 任务执行

### 1. 强制要求：首先读取参考文件
**阻塞性要求——不得跳过此步骤**

在执行任何其他操作之前，使用 Read 工具读取：
- `./references/prd_template.md`

此模板定义了 PRD 必须遵循的确切结构。在读取此文件之前，**不得继续**执行第 2 步。

### 2. 跳过业务背景
**此 Skill 有意不读取 FOUNDER_CONTEXT.md。** PRD 是独立文档，应在其中包含所有必要的背景信息。

### 3. 分析初始输入
从用户的初始描述中提取已有信息：
- 产品名称或暂定名称
- 要解决的核心问题
- 目标用户/受众
- 提到的关键功能
- 技术偏好（如有）
- 限制条件或要求（如有）

### 4. 提出澄清问题
**使用 AskUserQuestion 工具**收集缺失的信息。最多提出 7 个问题，但越少越好——一旦获得足以构建全面 PRD 的信息，就停止提问。

**问题库（按优先级排序）：**

| # | 问题 | 重要性 | 在以下情况下跳过…… |
|---|----------|----------------|------------|
| 1 | 主要用户是谁？他们的角色和技术水平如何？ | 影响所有用户体验决策和功能复杂度 | 已清楚描述用户画像 |
| 2 | 该产品要解决的核心问题是什么？如果用户没有这个产品，会发生什么？ | 定义价值主张和成功指标 | 已明确说明问题 |
| 3 | 发布时必须具备的 3-5 项功能（P0）是什么？ | 防止范围蔓延，聚焦 MVP | 已列出功能并明确优先级 |
| 4 | 存在哪些技术偏好或限制？（语言、框架、托管方式） | 决定技术架构部分 | 已指定技术栈 |
| 5 | 是否需要任何集成？（身份验证提供商、API、第三方服务） | 识别依赖项和集成复杂度 | 未提及外部服务，或用户表示产品独立运行 |
| 6 | 成功的标准是什么？是否有需要跟踪的具体指标？ | 定义目标和成功指标部分 | 已说明指标或目标 |
| 7 | 是否有任何设计偏好或需要遵循的现有品牌指南？ | 影响 UI/UX 要求部分 | 设计可灵活处理或已进行描述 |

**提问策略：**
- 每批使用 AskUserQuestion 提出 2-4 个问题
- 如果第一批回答提供了足够的详细信息，则停止提问
- 总共不得提出超过 7 个问题
- 尽可能将相关问题归为一组

### 5. 生成 PRD
使用 `./references/prd_template.md` 中的模板结构，创建一份完整的 PRD：

1. **填写模板中所有适用的章节**
2. **内容要具体** — 模糊的需求会产生模糊的代码
3. **为每项功能编写验收标准** — 确保其可测试
4. **严格确定优先级** — P0 功能应占全部功能的 30-40%
5. **“面向 AI 的实施说明”章节为必填项** — 这是使其适合 AI 使用的关键

### 6. 保存并转换为 PDF

**步骤 6a：创建输出文件夹**
```bash
mkdir -p ./prd_outputs/[Project Name]/
```
使用包含空格的产品名称，例如 `./prd_outputs/Churn Prevention Tool/`

**步骤 6b：保存 markdown 文件**
将 PRD 内容写入：
```
./prd_outputs/[Project Name]/[project_name]_PRD.md
```
文件名使用 snake_case，例如 `churn_prevention_tool_PRD.md`

**步骤 6c：转换为 PDF**
运行：
```bash
npx md-to-pdf "./prd_outputs/[Project Name]/[project_name]_PRD.md"
```
这会在同一文件夹中创建 `[project_name]_PRD.pdf`。

### 7. 确认输出
告知用户：
- PDF 的保存位置（完整路径）
- markdown 源文件的保存位置
- PRD 所含内容的简要摘要

---

## 编写规则

### 核心规则
- 每项功能都必须有可测试的验收标准
- 使用具体数字，而非模糊表述（使用“在 <2s 内加载”，而非“快速加载”）
- P0 功能应占全部功能的 30-40% — 如果所有功能都是 P0，就等于没有优先级
- 数据模型必须包含字段类型和关系
- API 规范必须包含请求/响应示例

### PRD 专用规则
- 执行摘要：最多 3-5 句话
- 问题陈述：必须包括当前状态、痛点和业务影响
- 用户画像：主要用户画像最多 3 个 — 更多会造成混乱
- 技术架构：使用通俗的英语描述数据流 — AI 工具对此的理解优于复杂图表
- 面向 AI 的实施说明章节：此章节为必填项，绝不能跳过

### 格式规则
- 一致地使用 markdown 标题（# 用于标题，## 用于章节，### 用于子章节）
- 对结构化数据（指标、数据模型、API 规范）使用表格
- 对 JSON 示例和技术规范使用代码块
- 对验收标准使用复选框

---

## 输出格式

PRD 遵循 `./references/prd_template.md` 中的结构。以下是一个精简示例：

```markdown
# TaskFlow — Product Requirements Document

**Version:** 1.0
**Date:** 2024-01-15
**Author:** PRD Generator
**Status:** Draft

## Executive Summary
TaskFlow is a task management tool for remote engineering teams...

## Problem Statement
**Current state:** Teams use disconnected tools...
**Pain points:**
1. Context switching between tools
2. No visibility into team workload
3. Async communication gaps

**Impact:** 5+ hours/week lost per engineer...

## Goals & Success Metrics
| Goal | Metric | Target | Measurement |
|------|--------|--------|-------------|
| Reduce context switching | Tool switches/day | < 10 | Analytics |

## User Personas
### Engineering Manager
- **Role:** Manages 5-10 engineers
- **Goals:** Visibility into sprint progress...

## Functional Requirements

### FR-001: Task Creation
**Description:** Users can create tasks with title, description, assignee, and due date.

**User story:** As an engineer, I want to create tasks quickly so that I capture work items without friction.

**Acceptance criteria:**
- [ ] Task creation completes in < 500ms
- [ ] Title field is required, minimum 3 characters
- [ ] Due date defaults to end of current sprint

**Priority:** P0

...

## Implementation Notes for AI

### Build Order
1. Database schema (PostgreSQL)
2. API endpoints (Express.js)
3. Frontend components (React)
4. Auth integration (Clerk)

### Libraries to Use
- Prisma for ORM — type-safe, great DX
- TanStack Query for data fetching — handles caching
- Tailwind CSS for styling — utility-first, fast iteration

### Critical Implementation Details
- All dates stored as UTC, converted to user timezone on display
- Use optimistic updates for task status changes
- Implement soft deletes for all user-generated content
```

---

## 参考资料

**执行任务前必须使用 Read 工具读取此文件（参见步骤 1）：**

| 文件 | 用途 |
|------|---------|
| `./references/prd_template.md` | 包含全部 15 个章节、格式示例和使用说明的完整 PRD 结构 |

**为何重要：** 该模板可确保每份 PRD 均采用一致且全面的结构，以便 AI 编码工具解析和实现。跳过该模板会导致 PRD 不完整，遗漏关键章节。

---

## 质量检查清单（自我验证）

### 执行前检查
- [ ] 我在开始前已阅读 `./references/prd_template.md`
- [ ] 我已将模板结构纳入上下文

### 问题检查
- [ ] 我提出的问题总数不超过 7 个
- [ ] 我仅在确实缺少信息时才提问
- [ ] 问题已分批提出（每次 AskUserQuestion 调用提出 2-4 个问题）

### PRD 内容检查
- [ ] 执行摘要为 3-5 句话
- [ ] 每项功能都有验收标准（复选框）
- [ ] P0 功能约占总数的 30-40%（而非全部）
- [ ] 数据模型包含字段类型
- [ ] API 规范包含请求/响应示例
- [ ] “Implementation Notes for AI”章节内容完整

### 输出检查
- [ ] Markdown 文件已保存至 `./prd_outputs/[Project Name]/`
- [ ] 已通过 `npx md-to-pdf` 生成 PDF
- [ ] 已告知用户文件位置

**如果任何一项检查失败 → 请先修复再完成任务。**

---

## 默认值与假设

除非用户另有指定，否则使用以下设置：

- **文档版本：** 1.0
- **状态：** 草稿
- **作者：** PRD Generator
- **技术栈：** 除非另有指定，否则采用现代 Web 技术栈（React + Node.js + PostgreSQL）
- **托管：** 除非另有指定，否则采用云原生托管（Vercel/Railway/AWS）
- **身份验证：** 除非要构建自定义身份验证，否则使用第三方服务（Clerk/Auth0）
- **优先级分配：** 约 35% P0、约 40% P1、约 25% P2
- **用户画像：** 最多 3 个，除非复杂度要求更多
- **API 风格：** 除非指定 GraphQL，否则使用 REST

在 PRD 输出中记录所做的所有假设。