---
name: "agile-product-owner"
description: Agile product ownership for backlog management and sprint execution. Covers user story writing, acceptance criteria, sprint planning, and velocity tracking. Use when writing user stories, creating acceptance criteria, planning sprints, estimating story points, breaking down epics, or prioritizing the backlog.
not_for: Kanban-only workflows, waterfall project planning, general task management, non-Scrum agile frameworks (SAFe, LeSS) without adaptation
triggers:
  - write user story
  - create acceptance criteria
  - plan sprint
  - estimate story points
  - break down epic
  - prioritize backlog
  - sprint planning
  - backlog grooming
  - sprint retrospective
  - definition of done
  - INVEST criteria
  - Given When Then
  - user story template
  - sprint capacity
  - velocity tracking
---
# 敏捷产品负责人

面向产品负责人的待办事项管理与冲刺执行工具包，包括用户故事生成、验收标准模式、冲刺规划和速率跟踪。

---

## 目录

- [此技能的独特之处](#what-makes-this-skill-different)
- [用户故事生成工作流](#user-story-generation-workflow)
- [验收标准模式](#acceptance-criteria-patterns)
- [史诗拆分工作流](#epic-breakdown-workflow)
- [冲刺规划工作流](#sprint-planning-workflow)
- [待办事项优先级排序](#backlog-prioritization)
- [参考文档](#reference-documentation)
- [工具](#tools)

---

## 此技能的独特之处

- **符合实际情况的容量计算：** 冲刺容量基于速率 × 可用性系数，而非主观期望。
- **根据故事规模调整验收标准：** 将最低验收标准数量与故事点数对应，避免大型事项的规格定义不足。
- **保持一致的加权优先级排序：** 价值 40%、影响 30%、风险 15%、工作量 15%，使各项权衡清晰明确。
- **系统化的史诗拆分技巧：** 五种具体的拆分模式可避免故事规模过大。
- **工作流中内置 INVEST 验证：** 每个故事都包含验证步骤，而不只是提供指导。

## 用户故事生成工作流

根据需求创建符合 INVEST 原则的用户故事：

1. 确定角色（谁将从此功能中受益）
2. 定义所需的操作或能力
3. 清晰说明所交付的收益或价值
4. 使用 Given-When-Then 编写验收标准
5. 使用斐波那契数列估算故事点数
6. 按照 INVEST 标准进行验证
7. 按优先级添加到待办事项列表
8. **验证：** 故事通过所有 INVEST 标准；验收标准可测试

### 用户故事模板

```
As a [persona],
I want to [action/capability],
So that [benefit/value].
```

**示例：**
```
As a marketing manager,
I want to export campaign reports to PDF,
So that I can share results with stakeholders who don't have system access.
```

### 故事类型

| 类型 | 模板 | 示例 |
|------|----------|---------|
| 功能 | 作为 [角色]，我希望 [操作]，以便 [收益] | 作为用户，我希望筛选搜索结果，以便更快地找到所需内容 |
| 改进 | 作为 [角色]，我需要 [能力] 来实现 [目标] | 作为用户，我需要更快的页面加载速度，以便顺畅地完成任务 |
| 缺陷修复 | 作为 [角色]，当 [条件] 时，我期望 [行为] | 作为用户，我期望刷新页面时购物车内容仍然保留 |
| 使能项 | 作为开发者，我需要 [技术任务]，以支持 [能力] | 作为开发者，我需要实现缓存，以支持即时搜索 |

### 角色参考

| 角色 | 典型需求 | 使用场景 |
|---------|--------------|---------|
| 最终用户 | 效率、简单易用、可靠性 | 日常使用功能 |
| 管理员 | 控制、可见性、安全性 | 系统管理 |
| 高级用户 | 自动化、定制、快捷操作 | 专业工作流 |
| 新用户 | 引导、学习、安全保障 | 新手引导 |

---

## 验收标准模式

使用 Given-When-Then 格式编写可测试的验收标准。

### Given-When-Then 模板

```
Given [precondition/context],
When [action/trigger],
Then [expected outcome].
```

**示例：**
```
Given the user is logged in with valid credentials,
When they click the "Export" button,
Then a PDF download starts within 2 seconds.

Given the user has entered an invalid email format,
When they submit the registration form,
Then an inline error message displays "Please enter a valid email address."

Given the shopping cart contains items,
When the user refreshes the browser,
Then the cart contents remain unchanged.
```

### 验收标准检查清单

每个故事都应包含以下类别的标准：

| 类别 | 示例 |
|----------|---------|
| 正常流程 | Given 输入有效，When 提交后，Then 显示成功消息 |
| 验证 | 必填字段为空时应拒绝输入 |
| 错误处理 | API 失败时必须显示用户友好的消息 |
| 性能 | 应在 2 秒内完成操作 |
| 无障碍访问 | 必须能够仅通过键盘进行导航 |

### 按故事规模划分的最低标准数量

| 故事点数 | 最低验收标准数量 |
|--------------|------------------|
| 1-2 | 3-4 条标准 |
| 3-5 | 4-6 条标准 |
| 8 | 5-8 条标准 |
| 13+ | 拆分故事 |

有关完整的模板库，请参阅 `references/user-story-templates.md`。

---

## 史诗拆分工作流

将史诗拆分为可交付的、规模适合单个冲刺的故事：

1. 定义史诗范围和成功标准
2. 确定受该史诗影响的所有用户角色
3. 列出每个用户角色所需的全部能力
4. 将能力归入逻辑合理的故事
5. 验证每个故事的点数均 ≤8
6. 确定故事之间的依赖关系
7. 对故事进行排序，以实现增量交付
8. **验证：** 每个故事都能独立交付价值；所有故事合起来覆盖史诗范围

### 拆分技巧

| 技巧 | 适用场景 | 示例 |
|-----------|-------------|---------|
| 按工作流步骤 | 线性流程 | “结账” → “添加到购物车” + “输入付款信息” + “确认订单” |
| 按用户角色 | 多种用户类型 | “仪表板” → “管理员仪表板” + “用户仪表板” |
| 按数据类型 | 多种输入 | “导入” → “导入 CSV” + “导入 Excel” |
| 按操作 | CRUD 功能 | “管理用户” → “创建” + “编辑” + “删除” |
| 优先实现正常流程 | 降低风险 | “功能” → “基本流程” + “错误处理” + “边界情况” |

### 史诗示例

**史诗：** 用户仪表板

**拆分：**
```
Epic: User Dashboard (34 points total)
├── US-001: View key metrics (5 pts) - End User
├── US-002: Customize layout (5 pts) - Power User
├── US-003: Export data to CSV (3 pts) - End User
├── US-004: Share with team (5 pts) - End User
├── US-005: Set up alerts (5 pts) - Power User
├── US-006: Filter by date range (3 pts) - End User
├── US-007: Admin overview (5 pts) - Admin
└── US-008: Enable caching (3 pts) - Enabler
```

---

## 冲刺规划工作流

规划冲刺容量并选择故事：

1. 计算团队容量（速率 × 可用性）
2. 与利益相关者评审冲刺目标
3. 从已确定优先级的待办列表中选择故事
4. 填充至容量的 80-85%（承诺内容）
5. 添加延伸目标（额外增加 10-15%）
6. 确定依赖关系和风险
7. 将复杂故事拆分为任务
8. **验证：** 承诺的点数 ≤ 容量的 85%；所有故事均有验收标准

### 容量计算

```
Sprint Capacity = Average Velocity × Availability Factor

Example:
Average Velocity: 30 points
Team availability: 90% (one member partially out)
Adjusted Capacity: 27 points

Committed: 23 points (85% of 27)
Stretch: 4 points (15% of 27)
```

### 可用性系数

| 场景 | 系数 |
|----------|--------|
| 完整冲刺，无休假 | 1.0 |
| 一名团队成员有 50% 的时间不在岗 | 0.9 |
| 冲刺期间有节假日 | 0.8 |
| 多名成员不在岗 | 0.7 |

### 冲刺工作量安排模板

```
Sprint Capacity: 27 points
Sprint Goal: [Clear, measurable objective]

COMMITTED (23 points):
[H] US-001: User dashboard (5 pts)
[H] US-002: Export feature (3 pts)
[H] US-003: Search filter (5 pts)
[M] US-004: Settings page (5 pts)
[M] US-005: Help tooltips (3 pts)
[L] US-006: Theme options (2 pts)

STRETCH (4 points):
[L] US-007: Sort options (2 pts)
[L] US-008: Print view (2 pts)
```

有关完整的规划流程，请参阅 `references/sprint-planning-guide.md`。

---

## 待办事项优先级排序

通过评估价值和工作量来确定待办事项的优先级。

### 优先级等级

| 优先级 | 定义 | 冲刺目标 |
|----------|------------|---------------|
| 严重 | 阻碍用户、涉及安全或数据丢失 | 立即处理 |
| 高 | 核心功能、关键用户需求 | 本次冲刺 |
| 中 | 改进、增强 | 未来 2-3 个冲刺 |
| 低 | 锦上添花的功能、次要改进 | 待办事项列表 |

### 优先级排序因素

| 因素 | 权重 | 问题 |
|--------|--------|-----------|
| 业务价值 | 40% | 对收入有何影响？用户是否有需求？是否符合战略方向？ |
| 用户影响 | 30% | 会影响多少用户？使用频率如何？ |
| 风险/依赖项 | 15% | 是否存在技术风险？是否存在外部依赖项？ |
| 工作量 | 15% | 规模如何？复杂度如何？不确定性如何？ |

### INVEST 标准验证

添加到冲刺之前，请验证每个故事：

| 标准 | 问题 | 通过条件 |
|-----------|----------|------------|
| **I**ndependent（独立） | 是否可以在不依赖其他尚未承诺的故事的情况下开发？ | 没有阻塞性依赖项 |
| **N**egotiable（可协商） | 实现方式是否灵活？ | 可以采用多种方法 |
| **V**aluable（有价值） | 是否能带来用户价值或业务价值？ | 在 "so that" 中明确说明收益 |
| **E**stimable（可估算） | 团队能否对此进行估算？ | 理解程度足以确定规模 |
| **S**mall（小） | 能否在一次冲刺中完成？ | ≤8 个故事点 |
| **T**estable（可测试） | 能否验证其已完成？ | 验收标准明确 |

---

## 参考文档

### 用户故事模板

`references/user-story-templates.md` 包含：

- 按类型划分的标准故事格式（功能、改进、缺陷修复、使能项）
- 验收标准模式（Given-When-Then、Should/Must/Can）
- INVEST 标准验证清单
- 故事点估算指南（斐波那契数列）
- 常见的故事反模式及修复方法
- 故事拆分技巧

### 冲刺规划指南

`references/sprint-planning-guide.md` 包含：

- 冲刺规划会议议程
- 容量计算公式
- 待办事项优先级排序框架（WSJF）
- 冲刺仪式指南（站会、评审、回顾）
- 速率跟踪和燃尽模式
- 完成定义清单
- 冲刺指标和目标

---

## 工具

### 用户故事生成器

```bash
# Generate stories from sample epic
python scripts/user_story_generator.py

# Plan sprint with capacity
python scripts/user_story_generator.py sprint 30
```

生成：
- 符合 INVEST 原则的用户故事
- Given-When-Then 格式的验收标准
- 故事点估算（斐波那契数列）
- 优先级分配
- 包含承诺事项和延伸事项的冲刺工作量安排

### 示例输出

```
USER STORY: USR-001
========================================
Title: View Key Metrics
Type: story
Priority: HIGH
Points: 5

Story:
As a End User, I want to view key metrics and KPIs
so that I can save time and work more efficiently

Acceptance Criteria:
  1. Given user has access, When they view key metrics, Then the result is displayed
  2. Should validate input before processing
  3. Must show clear error message when action fails
  4. Should complete within 2 seconds
  5. Must be accessible via keyboard navigation

INVEST Checklist:
  ✓ Independent
  ✓ Negotiable
  ✓ Valuable
  ✓ Estimable
  ✓ Small
  ✓ Testable
```

---

## 冲刺指标

跟踪冲刺健康状况和团队绩效。

### 关键指标

| 指标 | 公式 | 目标 |
|--------|---------|--------|
| 速率 | 已完成点数 / 冲刺 | 稳定在 ±10% |
| 承诺可靠性 | 已完成 / 已承诺 | >85% |
| 范围变更 | 冲刺期间增加或移除的点数 | <10% |
| 结转 | 未完成的点数 | <15% |

### 速率跟踪

```
Sprint 1: 25 points
Sprint 2: 28 points
Sprint 3: 30 points
Sprint 4: 32 points
Sprint 5: 29 points
------------------------
Average Velocity: 28.8 points
Trend: Stable

Planning: Commit to 24-26 points
```

### 完成定义

当满足以下条件时，用户故事即为完成：

- [ ] 代码已完成并通过同行评审
- [ ] 单元测试已编写并通过
- [ ] 验收标准已验证
- [ ] 文档已更新
- [ ] 已部署到预发布环境
- [ ] 已获产品负责人验收
- [ ] 不存在遗留的严重缺陷

## 相关技能

- **Scrum Master** (`project-management/scrum-master/`) — 速率数据和冲刺仪式可补充待办事项管理
- **Product Manager Toolkit** (`product-team/product-manager-toolkit/`) — RICE 优先级排序为待办事项排序提供依据