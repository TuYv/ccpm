---
name: notion-meeting-intelligence
description: Prepares meeting materials by gathering context from Notion, enriching with Claude research, and creating both an internal pre-read and external agenda saved to Notion. Helps you arrive prepared with comprehensive background and structured meeting docs.
---
# 会议情报

通过从 Notion 收集上下文、使用 Claude 研究进行补充，并创建全面的会议材料，帮助你为会议做好准备。既可生成供参会者阅读的内部会前材料，也可生成用于会议本身的对外议程。

## 快速开始

当被要求筹备会议时：

1. **收集 Notion 上下文**：使用 `Notion:notion-search` 查找相关页面
2. **获取详细信息**：使用 `Notion:notion-fetch` 阅读相关内容
3. **通过研究补充信息**：利用 Claude 的知识添加背景信息、行业洞察或最佳实践
4. **创建内部会前材料**：使用 `Notion:notion-create-pages` 创建背景上下文文档（供参会者使用）
5. **创建对外议程**：使用 `Notion:notion-create-pages` 创建会议议程（与所有参与者共享）
6. **关联资源**：将两份文档与相关项目及彼此相互关联

## 会议筹备工作流

### 第 1 步：了解会议上下文

```
Collect meeting details:
- Meeting topic/title
- Attendees (internal team + external participants)
- Meeting purpose (decision, brainstorm, status update, customer demo, etc.)
- Meeting type (internal only vs. external participants)
- Related project/initiative
- Specific topics to cover
```

### 第 2 步：搜索 Notion 上下文

```
Use Notion:notion-search to find:
- Project pages related to meeting topic
- Previous meeting notes
- Specifications or design docs
- Related tasks or issues
- Recent updates or reports
- Customer/partner information (if applicable)

Search strategies:
- Topic-based: "mobile app redesign"
- Project-scoped: search within project teamspace
- Attendee-created: filter by created_by_user_ids
- Recent updates: use created_date_range filters
```

### 第 3 步：获取并分析 Notion 内容

```
For each relevant page:
1. Fetch with Notion:notion-fetch
2. Extract key information:
   - Project status and timeline
   - Recent decisions and updates
   - Open questions or blockers
   - Relevant metrics or data
   - Action items from previous meetings
3. Note gaps in information
```

### 第 4 步：通过 Claude 研究补充信息

```
Beyond Notion context, add value through:

For technical meetings:
- Explain complex concepts for broader audience
- Summarize industry best practices
- Provide competitive context
- Suggest discussion frameworks

For customer meetings:
- Research company background (if public info)
- Industry trends relevant to discussion
- Common pain points in their sector
- Best practices for similar customers

For decision meetings:
- Decision-making frameworks
- Risk analysis patterns
- Trade-off considerations
- Implementation best practices

Note: Use general knowledge only - don't fabricate specific facts
```

### 第 5 步：创建内部会前材料

```
Use Notion:notion-create-pages for internal doc:

Title: "[Meeting Topic] - Pre-Read (Internal)"

Content structure:
- **Meeting Overview**: Date, time, attendees, purpose
- **Background Context**:
  - What this meeting is about (2-3 sentences)
  - Why it matters (business context)
  - Links to related Notion pages
- **Current Status**:
  - Where we are now (from Notion content)
  - Recent updates and progress
  - Key metrics or data
- **Context & Insights** (from Claude research):
  - Industry context or best practices
  - Relevant considerations
  - Potential approaches to discuss
- **Key Discussion Points**:
  - Topics that need airtime
  - Open questions to resolve
  - Decisions required
- **What We Need from This Meeting**:
  - Expected outcomes
  - Decisions to make
  - Next steps to define

Audience: Internal attendees only
Purpose: Give team full context and alignment before meeting
```

### 第 6 步：创建外部议程

```
Use Notion:notion-create-pages for meeting doc:

Title: "[Meeting Topic] - Agenda"

Content structure:
- **Meeting Details**: Date, time, attendees
- **Objective**: Clear meeting goal (1-2 sentences)
- **Agenda Items** (with time allocations):
  1. Topic 1 (10 min)
  2. Topic 2 (20 min)
  3. Topic 3 (15 min)
- **Discussion Topics**:
  - Key items to cover
  - Questions to answer
- **Decisions Needed**:
  - Clear decision points
- **Action Items**:
  - (To be filled during meeting)
- **Related Resources**:
  - Links to relevant pages
  - Link to pre-read document

Audience: All participants (internal + external)
Purpose: Structure the meeting, keep it on track
Tone: Professional, focused, clear
```

完整模板请参阅 [reference/template-selection-guide.md](reference/template-selection-guide.md)。

### 第 7 步：关联文档

```
1. Link pre-read to agenda:
   - Add mention in agenda: "See <mention-page>Pre-Read</mention-page> for background"

2. Link both to project:
   - Update project page with meeting links
   - Add to "Meetings" section

3. Cross-reference:
   - Agenda mentions pre-read for internal attendees
   - Pre-read mentions agenda for meeting structure
```

## 文档类型

### 内部预读材料（供团队使用）

内容更全面，包含内部背景信息：

- 完整的背景和历史
- 内部指标和数据
- 对挑战的坦诚评估
- 战略考量
- 我们需要实现的目标
- 内部讨论要点

**创建时机**：涉及内部团队的重要会议始终需要创建

### 外部议程（供所有参与者使用）

简洁、专业、重点突出：

- 明确的目标
- 带时间安排的结构化议程
- 讨论主题
- 决策事项
- 专业的语气

**创建时机**：每次会议

### 按会议目的划分的议程类型

**决策会议**：会议详情 → 目标 → 选项（优点/缺点）→ 建议 → 讨论 → 决策 → 行动事项

**状态更新**：会议详情 → 项目状态 → 进展 → 后续工作 → 阻碍因素 → 讨论 → 行动事项

**客户/外部会议**：会议详情 → 目标 → 议程事项（含时间安排）→ 讨论主题 → 后续步骤

**头脑风暴**：会议详情 → 目标 → 限制条件 → 想法 → 讨论 → 后续步骤

完整模板请参阅 [reference/template-selection-guide.md](reference/template-selection-guide.md)。

## 研究扩充模式

除 Notion 内容之外，还可利用 Claude 的能力增加价值：

**技术背景**：解释技术、架构或方法。提供行业标准实践。比较常见解决方案。建议评估标准。

**业务背景**：影响主题的行业趋势。竞争格局洞察。该领域的常见挑战。投资回报率考量。

**决策支持**：决策框架（例如 RICE、成本效益分析）。风险评估模式。权衡分析方法。成功标准建议。

**客户背景**（用于外部会议）：特定行业的挑战。常见痛点。类似公司的最佳实践。价值主张的表述方式。

**流程指导**：会议引导技巧。讨论框架。复盘模式。头脑风暴结构。

注意：运用通用知识和分析能力。不要编造具体事实。明确区分 Notion 中的事实与 Claude 提供的见解。

## 会议背景信息来源

**项目页面**：状态、目标、团队、时间表（最重要）
**以往的会议记录**：历史讨论、行动项、决策（定期会议）
**任务/问题数据库**：当前状态、阻碍因素、已完成/即将开展的工作（项目会议）
**规范/设计**：需求、决策、方案、待解决问题（技术会议）
**报告/仪表板**：指标、KPI、绩效数据、趋势（高管会议）

## 将会议关联到项目

**正向链接**：将会议添加到项目页面的“会议”部分
**反向链接**：在议程中加入“相关项目”部分，并提及项目
**维护双向**链接，以便轻松导航

## 系列会议管理

**定期会议**：创建系列会议的父页面，其中包含日程安排、会议记录列表、固定议程和行动项跟踪器。将各次会议链接到父页面。

**会议数据库**：对于组织，使用包含以下属性的数据库：会议标题、日期、类型（决策/状态/头脑风暴）、项目、参会者、状态（已安排/已完成）

## 会后行动

更新议程，加入：

**决策**：列出每项决策及其理由和负责人
**行动项**：带有负责人和截止日期的复选框列表（可考虑在数据库中创建任务）
**关键成果**：主要成果的项目符号列表

## 会议准备时机

**提前一天**（次日会议）：收集背景信息 → 创建议程 → 与参会者共享 → 留出审阅时间
**提前一小时**（临时准备）：快速了解背景 → 简短的会前材料 → 基本议程 → 仅保留必要内容
**提前一周**（重要会议）：全面调研 → 详细的会前材料 → 结构化议程 → 会前审阅

## 最佳实践

1. **同时创建两份文档**：为重要会议准备内部会前材料和外部议程
2. **区分信息来源**：标明哪些内容来自 Notion，哪些来自 Claude 的调研
3. **从搜索开始**：先在 Notion 中广泛搜索，再逐步缩小范围
4. **保持会前材料简洁**：即使包含调研内容，也最多控制在 2-3 页
5. **确保外部文档专业**：议程应精心编排且重点明确
6. **有针对性地补充内容**：Claude 的调研应提供真正的价值，而不是空洞内容
7. **关联文档**：会前材料中提及议程，议程中提及会前材料
8. **纳入指标**：来自 Notion 的数据有助于让讨论立足于事实
9. **面向适当对象共享**：向内部团队共享会前材料，向所有参会者共享议程
10. **尽早共享**：为参会者留出审阅时间（重要会议至少提前 24 小时）
11. **会后更新**：在议程中记录决策和行动项

## 高级功能

**会议模板**：有关完整的模板库，请参阅 [reference/template-selection-guide.md](reference/template-selection-guide.md)

## 常见问题

**“背景信息过多”**：拆分为会前材料（内部使用、内容全面）和议程（外部使用、重点明确）
**“找不到相关页面”**：扩大搜索范围、尝试不同的关键词，或向用户询问页面 URL
**“会议目的不明确”**：在继续之前，请用户明确说明
**“没有近期更新”**：在会前材料中注明这一点，并重点关注历史背景和战略考量
**“外部会议——没有内部背景信息”**：创建仅包含议程的更简单结构，省略内部会前材料或将其保持在最低限度
**“Claude 的调研过于宽泛”**：聚焦于与实际会议主题相关的具体见解，而不是泛泛而谈

## 示例

请参阅 [examples/](examples/) 获取完整工作流：

- [examples/project-decision.md](examples/project-decision.md) - 包含会前预读材料的决策会议准备
- [examples/sprint-planning.md](examples/sprint-planning.md) - 冲刺规划会议
- [examples/executive-review.md](examples/executive-review.md) - 高管评审准备
- [examples/customer-meeting.md](examples/customer-meeting.md) - 与客户的外部会议（会前预读材料 + 议程）