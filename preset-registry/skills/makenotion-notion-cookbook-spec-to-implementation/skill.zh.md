---
name: notion-spec-to-implementation
description: Turns product or tech specs into concrete Notion tasks that Claude code can implement. Breaks down spec pages into detailed implementation plans with clear tasks, acceptance criteria, and progress tracking to guide development from requirements to completion.
---
# 从规范到实现

将规范转化为可执行的实施计划，并跟踪进度。获取规范文档、提取需求、拆分任务并管理实施工作流。

## 快速开始

当被要求实施某项规范时：

1. **查找规范**：使用 `Notion:notion-search` 定位规范页面
2. **获取规范**：使用 `Notion:notion-fetch` 读取规范内容
3. **提取需求**：解析并结构化整理规范中的需求
4. **创建计划**：使用 `Notion:notion-create-pages` 创建实施计划
5. **查找任务数据库**：使用 `Notion:notion-search` 定位任务数据库
6. **创建任务**：使用 `Notion:notion-create-pages` 在任务数据库中创建各项任务
7. **跟踪进度**：使用 `Notion:notion-update-page` 记录进度并更新状态

## 实施工作流

### 第 1 步：查找规范

```
1. Search for spec:
   - Use Notion:notion-search with spec name or topic
   - Apply filters if needed (e.g., created_date_range, teamspace_id)
   - Look for spec title or keyword matches
   - If not found or ambiguous, ask user for spec URL/ID

Example searches:
- "User Authentication spec"
- "Payment Integration specification"
- "Mobile App Redesign PRD"
```

### 第 2 步：获取并分析规范

```
1. Fetch spec page:
   - Use Notion:notion-fetch with spec URL/ID from search results
   - Read full content including requirements, design, constraints

2. Parse specification:
   - Identify functional requirements
   - Note non-functional requirements (performance, security, etc.)
   - Extract acceptance criteria
   - Identify dependencies and blockers
```

有关解析模式，请参阅 [reference/spec-parsing.md](reference/spec-parsing.md)。

### 第 3 步：创建实施计划

```
1. Break down into phases/milestones
2. Identify technical approach
3. List required tasks
4. Estimate effort
5. Identify risks

Use implementation plan template (see [reference/standard-implementation-plan.md](reference/standard-implementation-plan.md) or [reference/quick-implementation-plan.md](reference/quick-implementation-plan.md))
```

### 第 4 步：创建实施计划页面

```
Use Notion:notion-create-pages:
- Title: "Implementation Plan: [Feature Name]"
- Content: Structured plan with phases, tasks, timeline
- Link back to original spec
- Add to appropriate location (project page, database)
```

### 第 5 步：查找任务数据库

```
1. Search for task database:
   - Use Notion:notion-search to find "Tasks" or "Task Management" database
   - Look for engineering/project task tracking system
   - If not found or ambiguous, ask user for database location

2. Fetch database schema:
   - Use Notion:notion-fetch with database URL/ID
   - Get property names, types, and options
   - Identify correct data source from <data-source> tags
   - Note required properties for new tasks
```

### 第 6 步：创建实施任务

```
For each task in plan:
1. Create task in task database using Notion:notion-create-pages
2. Use parent: { data_source_id: 'collection://...' }
3. Set properties from schema:
   - Name/Title: Task description
   - Status: To Do
   - Priority: Based on criticality
   - Related Tasks: Link to spec and plan
4. Add implementation details in content
```

任务模式参见 [reference/task-creation.md](reference/task-creation.md)。

### 步骤 7：开始实施

```
1. Update task status to "In Progress"
2. Add initial progress note
3. Document approach and decisions
4. Link relevant resources
```

### 步骤 8：跟踪进度

```
Regular updates:
1. Update task properties (status, progress)
2. Add progress notes with:
   - What's completed
   - Current focus
   - Blockers/issues
3. Update implementation plan with milestone completion
4. Link to related work (PRs, designs, etc.)
```

跟踪模式参见 [reference/progress-tracking.md](reference/progress-tracking.md)。

## 规格分析模式

**功能需求**：用户故事、功能描述、工作流、数据需求、集成点

**非功能需求**：性能目标、安全要求、可扩展性需求、可用性、合规性

**验收标准**：可测试条件、用户验证点、性能基准、完成定义

详细的解析技巧参见 [reference/spec-parsing.md](reference/spec-parsing.md)。

## 实施计划结构

**计划包括**：概述 → 关联的规格 → 需求摘要 → 技术方案 → 实施阶段（目标、任务清单、预估工作量）→ 依赖项 → 风险与缓解措施 → 时间线 → 成功标准

完整的计划模板参见 [reference/standard-implementation-plan.md](reference/standard-implementation-plan.md)。

## 任务拆分模式

**按组件**：数据库、API 端点、前端组件、集成、测试
**按功能切片**：垂直切片（身份验证流程、数据录入、报告生成）
**按优先级**：P0（必须具备）、P1（重要）、P2（最好具备）

## 进度记录

**每日更新**（进行中的工作）：添加进度说明，包括已完成事项、当前重点、阻塞因素
**里程碑更新**（重大进展）：更新计划复选框、添加里程碑摘要、调整时间线
**状态变更**（任务流转）：更新属性（In Progress → In Review → Done）、添加完成说明、关联交付物

**进度格式**：日期标题 → 已完成 → 进行中 → 后续步骤 → 阻塞因素 → 备注

详细模式参见 [reference/progress-tracking.md](reference/progress-tracking.md)。

## 关联规格与实施

**正向链接**：在规格页面中添加 "Implementation" 部分，并链接到计划和任务
**反向链接**：在计划和任务中通过 "Specification" 部分引用规格
**双向可追溯性**：保持双向关联，以便轻松跟踪

## 实施状态跟踪

**计划状态**：随阶段完成情况更新（✅ Complete、🔄 In Progress %、⏳ Not Started）以及总体百分比
**任务聚合**：按计划 ID 查询任务数据库以生成摘要（已完成、进行中、已阻塞、未开始）

## 处理规格变更

**检测**：获取更新后的规格 → 与计划比较 → 识别新需求 → 评估影响
**传递**：更新计划 → 创建新任务 → 更新受影响的任务 → 添加变更说明 → 通过评论通知
**变更日志**：记录规格演变，包括日期、变更内容和影响

## 常见模式

**功能标志**：后端（置于标志之后）→ 测试 → 前端（受标志控制）→ 内部发布 → 外部发布  
**数据库迁移**：模式设计 → 迁移脚本 → 预发布环境测试 → 生产环境迁移 → 验证  
**API 开发**：API 设计 → 后端实现 → 测试和文档 → 客户端集成 → 部署

## 最佳实践

1. **始终关联规范与实现**：维护双向引用
2. **拆分为小任务**：每个任务应能在 1-2 天内完成
3. **提取明确的验收标准**：明确什么才算“完成”
4. **尽早识别依赖项**：在计划中注明阻塞项
5. **定期更新进度**：为正在进行的工作添加每日记录
6. **跟踪变更**：记录规范更新及其影响
7. **使用检查清单**：可视化进度指示有助于所有人了解情况
8. **关联交付成果**：PR、设计和文档应链接回对应任务

## 高级功能

有关其他实现模式和技巧，请参阅 [reference/](reference/) 中的参考文件。

## 常见问题

**“找不到规范”**：使用 Notion:notion-search 搜索规范名称/主题，尝试更宽泛的关键词，或向用户询问 URL  
**“找到多个规范”**：询问用户要实现哪个规范，或展示可选项  
**“找不到任务数据库”**：搜索“Tasks”或“Task Management”，或向用户询问数据库位置  
**“规范不明确”**：在计划中注明不明确之处，并创建澄清任务  
**“需求存在冲突”**：记录冲突，并创建设计决策任务  
**“范围过大”**：拆分为更小的规范/阶段

## 示例

有关完整工作流，请参阅 [examples/](examples/)：

- [examples/api-feature.md](examples/api-feature.md) - API 功能实现
- [examples/ui-component.md](examples/ui-component.md) - 前端组件
- [examples/database-migration.md](examples/database-migration.md) - 模式变更