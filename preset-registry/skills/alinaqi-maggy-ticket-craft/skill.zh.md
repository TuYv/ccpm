---
name: ticket-craft
description: Create Jira/Asana/Linear tickets optimized for Claude Code execution - AI-native ticket writing
when-to-use: When creating tickets, breaking down epics, or writing specs for AI agent execution
user-invocable: true
effort: medium
---
# Ticket Craft 技能

*编写 AI 代理可以自主执行的软件工单。*

**目的：** 定义一种工单格式，将软件工程最佳实践（INVEST、Given-When-Then、Definition of Ready）与 Claude Code 特定的上下文要求相结合。使用此技能创建的每个工单都是“Claude Code 就绪”的——这意味着代理可以直接接手并执行，而无需提出澄清问题。

**适用于：** Jira、Asana、Linear、GitHub Issues 或任何工单系统。

---

## 核心原则

```
┌─────────────────────────────────────────────────────────────────┐
│  A TICKET IS A PROMPT                                            │
│  ──────────────────────────────────────────────────────────────  │
│                                                                  │
│  Traditional tickets are written for humans who can:             │
│  - Ask clarifying questions in Slack                             │
│  - Draw on institutional knowledge                               │
│  - Infer intent from vague descriptions                          │
│                                                                  │
│  AI agents cannot do any of this.                                │
│                                                                  │
│  Every ticket must be SELF-CONTAINED:                            │
│  - Explicit file references (not "the auth module")              │
│  - Pattern references (not "follow our conventions")             │
│  - Verification criteria (not "make sure it works")              │
│  - Constraints (not just what to do, but what NOT to do)         │
│  - Test commands (not "run the tests")                           │
│                                                                  │
│  If Claude Code can execute it without asking a question,        │
│  the ticket is ready. If it can't, it's not.                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## INVEST+C 标准

标准 INVEST 加上 **C 代表 Claude-Ready**：

| 标准 | 问题 | 在以下情况下不通过…… |
|-----------|----------|-------------|
| **I** - Independent（独立） | 是否可以无需等待其他工单即可完成？ | 被未记录的依赖项阻塞 |
| **N** - Negotiable（可协商） | 实现方式是否有调整空间？ | 对实现细节规定过多 |
| **V** - Valuable（有价值） | 能否说明谁会受益以及如何受益？ | 没有明确的用户或业务价值 |
| **E** - Estimable（可估算） | 团队是否掌握了足够的信息来评估工作量？ | 过于模糊或规模过大，无法估算 |
| **S** - Small（小型） | 一个人能否在 1-3 天内完成？ | 验收标准超过 5 条 |
| **T** - Testable（可测试） | 能否为其编写通过/失败测试？ | 使用“快速”或“良好的用户体验”等模糊表述 |
| **C** - Claude-Ready（Claude 就绪） | AI 代理能否无需澄清问题即可执行？ | 缺少文件引用、模式、验证方式或约束 |

---

## 工单类型

### 1. 功能工单

```markdown
## [PROJ-XXX] {Verb} {Feature} for {User}

**Type:** Feature
**Priority:** {Critical | High | Medium | Low}
**Points:** {1 | 2 | 3 | 5 | 8}
**Labels:** {frontend, backend, api, database, etc.}
**Epic:** {Parent epic}

---

### User Story
As a {specific persona},
I want to {specific action},
so that {measurable benefit}.

### Background
{1-2 paragraphs on why this matters. Link to product brief, user research,
or business justification. Include any relevant metrics or user feedback.}

### Acceptance Criteria

**AC1: {Happy path scenario}**
Given {precondition},
when {action},
then {expected result}.

**AC2: {Edge case / error scenario}**
Given {precondition},
when {action},
then {expected result}.

**AC3: {Boundary condition}**
Given {precondition},
when {action},
then {expected result}.

### Out of Scope
- {Explicitly state what this ticket does NOT include}
- {Prevents scope creep and keeps ticket small}

---

### Claude Code Context

#### Relevant Files (read these first)
- `src/services/example.ts` - Existing service to extend
- `src/models/example.ts` - Data model definition
- `src/api/routes/example.ts` - Existing endpoint patterns to follow

#### Pattern Reference
Follow the pattern in `src/services/user.ts` for service layer implementation.
Follow the pattern in `src/api/routes/users.ts` for route definition.
Follow the pattern in `tests/services/user.test.ts` for test structure.

#### Database Changes
- {Table to create/modify, columns, types}
- {Migration file location: `supabase/migrations/` or `prisma/migrations/`}
- {RLS policies if using Supabase}

#### API Contract
```
POST /api/{resource}
Request: { field1: string, field2: number }
Response: { id: string, field1: string, created_at: string }
Error: { error: string, code: number }
```

#### Constraints
- Do NOT modify {specific files or modules}
- Do NOT add new dependencies without approval
- Follow existing error handling in `src/core/exceptions.ts`
- {Any performance budgets: response time < 200ms, bundle size < 50KB}

#### Verification
```bash
# Run specific tests
npm test -- --grep "{feature name}"
``”】【

# Lint 检查
npm run lint

# 类型检查
npm run typecheck

# 完整验证
npm test -- --coverage
```

#### 环境变量
- 已有：{list vars already in .env that are relevant}
- 新增必需：{list any new vars needed}

---

### 依赖项
- 被阻塞于：{PROJ-XXX}（{brief description}）
- 阻塞：{PROJ-YYY}（{brief description}）

### 设计
- 设计稿：{link to Figma/design if applicable}
```

---

### 2. Bug 工单

```markdown
## [BUG-XXX] 修复：{Component} - {Symptom}

**类型：** Bug
**优先级：** {Critical | High | Medium | Low}
**点数：** {1 | 2 | 3 | 5}
**标签：** {regression, ux-bug, data-bug, security-bug}
**严重程度：** {Blocks users | Degrades experience | Cosmetic}

---

### Bug 摘要
{用一句话说明：什么出现了问题，以及哪些用户受到影响。}

### 环境
- 浏览器/操作系统：{e.g., Chrome 120 / macOS 14.2}
- 环境：{Production | Staging | Local}
- 用户类型：{Anonymous | Authenticated | Admin}
- 首次发现时间：{date}

### 复现步骤
1. {Navigate to / perform action}
2. {Perform next action}
3. {Perform next action}
4. **观察：** {incorrect behavior}

### 预期行为
{应该发生什么。}

### 实际行为
{实际发生了什么。包括错误消息、控制台输出、截图。}

### 影响
- 受影响用户：{percentage or count}
- 发生频率：{every time | intermittent | specific conditions}
- 临时解决方案：{exists / none}

---

### Claude Code 上下文

#### 疑似根本原因
{如果已知，说明 Bug 可能位于何处。}
- 文件：`src/components/LoginForm.tsx:87`
- 问题：验证错误时将 `isSubmitting` 状态设置为 `true`，但从未重置

#### 相关文件
- `src/components/LoginForm.tsx` - 存在 Bug 的表单组件
- `tests/components/LoginForm.test.tsx` - 现有测试（此处存在缺口）
- `src/hooks/useAuth.ts` - 表单使用的 Auth hook

#### 测试缺口分析
- 现有测试覆盖：{what's currently tested}
- 缺失测试：{what test would have caught this bug}

#### Bug 修复工作流（TDD）
1. 编写一个能够复现 Bug 的失败测试
2. 确认测试失败（证明 Bug 存在）
3. 以最小代码改动修复 Bug
4. 确认测试通过
5. 运行完整测试套件以检查回归问题

#### 验证
```bash
# Run the specific test
npm test -- --grep "LoginForm submit"

# Run related tests
npm test -- src/components/LoginForm.test.tsx

# Full regression check
npm test
```

#### 约束
- 仅修复 Bug - 不要重构周边代码
- 不要更改组件的公共 API
- 确保所有现有测试继续通过
```

---

### 3. 技术债务工单

```markdown
## [TECH-XXX] 重构：{Area} - {Improvement}

**类型：** Tech Debt
**优先级：** {High | Medium | Low}
**点数：** {3 | 5 | 8}
**标签：** {refactor, performance, maintainability, testing}

---

### 问题陈述
{当前实现存在什么问题，以及为什么这很重要。
包括具体痛点：CI 速度慢、Bug 频发、开发者困惑。}

### 当前状态
- 文件：`{path}`（{N} 行）
- 测试覆盖率：{X}%
- 圈复杂度：{N}
- 相关 Bug：{PROJ-XXX, PROJ-YYY}
- 痛点频率：{how often this causes issues}

### 计划变更
{具体应进行哪些变更，以及为什么采用这种方式。}

### 验收标准
- [ ] {Specific structural change completed}
- [ ] 所有现有测试通过，且不修改测试断言
- [ ] 不更改公共 API（现有调用方不受影响）
- [ ] 测试覆盖率 >= {X}%
- [ ] {Measurable improvement metric}

### 风险评估
- 风险级别：{Low | Medium | High}
- 缓解措施：{run full regression, deploy behind flag, etc.}

### 业务论证
{为什么现在值得处理。例如：“将平均 Bug 修复时间从 4 小时缩短至 1 小时”
或“支持即将推出的功能 PROJ-XXX，该功能要求实现清晰的职责分离。”}

---

### Claude Code 上下文

#### 相关文件
- `{file}` - 要重构的当前实现
- `{test file}` - 现有测试（不得破坏）
- `{dependent file}` - 被重构 API 的调用方

#### 模式参考
新结构应遵循 `{good example file}` 中确立的模式。

#### 约束
- 不要更改公共 API 或导出内容
- 不要修改测试断言（测试应按原样通过）
- 不要引入新的依赖
- 保持向后兼容

#### 验证
```bash
# Existing tests must pass unchanged
npm test
```

# 无类型错误
```npm run typecheck

# Lint clean
npm run lint

# Coverage target
npm test -- --coverage
```
```

---

### 4. Epic Breakdown Ticket

```markdown
## [EPIC-XXX] {Epic Name}

**Type:** Epic
**Priority:** {Critical | High | Medium}
**Target:** {Sprint/milestone}

---

### Objective
{One paragraph: what this epic achieves and why it matters.}

### Success Metrics
- {Measurable outcome 1}
- {Measurable outcome 2}

### User Workflows
{The user journey this epic covers, broken into steps.}
1. {Step 1: Discovery/Entry}
2. {Step 2: Core Action}
3. {Step 3: Completion/Result}

### Ticket Breakdown

| # | Ticket | Type | Points | Dependencies |
|---|--------|------|--------|-------------|
| 1 | {title} | Feature | 3 | None |
| 2 | {title} | Feature | 5 | #1 |
| 3 | {title} | Feature | 3 | None |
| 4 | {title} | Feature | 2 | #2, #3 |
| 5 | {title} | Tech Debt | 3 | None |

### Slicing Strategy
{How the epic was broken down. Reference the technique used.}

### Agent Team Mapping
{If using agent teams, how features map to agents.}
- Feature Agent 1: Tickets #1, #2
- Feature Agent 2: Tickets #3, #4
- Parallel execution: #1 and #3 can run simultaneously
- Sequential: #2 depends on #1, #4 depends on #2 and #3
```

---

## Epic 切分技术

将 Epic 拆分为工单时，请使用以下策略之一：

| 技术 | 适用场景 | 示例 |
|-----------|-------------|---------|
| **按工作流步骤** | 用户旅程清晰 | 浏览 > 播放 > 保存 > 分享 |
| **按数据变体** | 多种数据类型 | 文本帖子、图片、视频 |
| **按用户角色** | 权限不同 | 匿名用户、已认证用户、管理员 |
| **按 CRUD** | 数据操作 | 创建、读取、更新、删除 |
| **先处理正常路径** | 增量交付 | 先实现成功流程，再处理错误 |
| **按边界** | 系统集成 | 前端、API、数据库分别处理 |

### 经验法则
- 每个工单：由一名开发者/代理完成 **1-3 天** 的工作量
- 超过 **5 条验收标准** = 拆分工单
- 超过 **8 个故事点** = 必须拆分
- 每个工单都应当能够 **独立部署**（即使是在功能标记之后）
- 工单排序：**先处理最简单、最基础的工单**

---

## Claude Code 就绪检查清单

在工单准备交由 AI 代理执行之前，请确认：

```
┌─────────────────────────────────────────────────────────────────┐
│  CLAUDE CODE READY CHECKLIST                                     │
│  ──────────────────────────────────────────────────────────────  │
│                                                                  │
│  CONTEXT                                                         │
│  ☐ Relevant files listed with full paths                         │
│  ☐ Pattern reference points to a real file to follow             │
│  ☐ API contract defined (request/response shapes)                │
│  ☐ Database changes specified (tables, columns, migrations)      │
│  ☐ Environment variables listed (existing + new)                 │
│                                                                  │
│  SCOPE                                                           │
│  ☐ Out of Scope section explicitly states what NOT to do         │
│  ☐ Constraints section lists files/modules NOT to modify         │
│  ☐ Ticket covers one logical change (atomic)                     │
│  ☐ Estimable at ≤ 5 story points                                │
│                                                                  │
│  VERIFICATION                                                    │
│  ☐ Test command provided (exact command, not "run tests")        │
│  ☐ Lint command provided                                         │
│  ☐ Typecheck command provided                                    │
│  ☐ Acceptance criteria are Given-When-Then or checkboxed         │
│  ☐ Each criterion is independently pass/fail testable            │
│                                                                  │
│  QUALITY                                                         │
│  ☐ Title is imperative verb + object + context                   │
│  ☐ Title under 80 characters                                     │
│  ☐ Description explains WHY, not just WHAT                       │
│  ☐ 2-5 acceptance criteria (not more)                            │
│  ☐ No vague language ("fast", "good UX", "clean")               │
│                                                                  │
│  If any box is unchecked, the ticket is NOT ready.               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 反模式（绝不要这样做）

### 1. 只有标题的工单
```
Title: Fix login
Description: (empty)
```
**失败原因：** 没有上下文、验收标准或文件引用。Claude Code 会进行猜测，而且很可能猜错。

### 2. 长篇大论
```
Title: Implement new onboarding
Description: (3 pages mixing UI, backend, analytics, email, and future ideas)
```
**失败原因：** 既不小，也不独立。智能体团队无法对此进行并行处理。将其拆分为 5 个以上的工单。

### 3. 模糊的需求
```
Acceptance Criteria:
- Should be fast
- UX should be good
- Should work on mobile
```
**失败原因：** 无法衡量，也无法测试。应替换为：“响应时间 < 200ms”、“通过 WCAG 2.1 AA”、“在 320px 视口下不出现水平滚动。”

### 4. 过度指定解决方案
```
Title: Use Redis to cache user sessions
Description: Install Redis, configure connection pooling, set TTL to 3600...
```
**失败原因：** 规定了具体解决方案，而不是描述问题。应该描述“会话查询耗时 500ms，需要降低到 < 50ms”，并让智能体选择实现方式。

### 5. 缺少文件信息的工单
```
Description: Update the auth module to support OAuth.
```
**对 AI 而言的失败原因：** “auth module”可能对应 20 个文件。Claude Code 需要明确的路径：`src/services/auth.ts`、`src/middleware/auth.ts`、`src/routes/auth.ts`。

### 6. 没有验证步骤的工单
```
Acceptance Criteria:
- OAuth login works
- Users can sign in with Google
```
**失败原因：** 没有测试命令或验证步骤。当 Claude Code 能够自行验证工作成果时，其表现会显著更好。

---

## 好例子与坏例子

### 坏例子：模糊的功能工单
```
Title: Add rate limiting to the API
Description: We need rate limiting on our endpoints.
```

### 好例子：适用于 Claude Code 的功能工单
```
Title: Add sliding window rate limiter to /api/generate endpoint

User Story:
As an API consumer, I want requests to be rate-limited
so that the service remains available under heavy load.

Acceptance Criteria:
AC1: Given an authenticated user making requests,
     when they exceed 10 requests per minute,
     then return 429 with Retry-After header.

AC2: Given a rate-limited user,
     when the window expires,
     then requests succeed again.

AC3: Given an unauthenticated request,
     when it hits /api/generate,
     then return 401 (rate limiting only applies to authed users).

Claude Code Context:
- Pattern: Follow `src/middleware/throttle.ts` for middleware structure
- File: Create `src/middleware/rateLimit.ts`
- Test: Create `tests/middleware/rateLimit.test.ts`
- Route: Modify `src/api/routes/generate.ts` to add middleware
- Constraint: Do NOT modify existing middleware or other endpoints

Verification:
  npm test -- --grep "rate-limit"
  npm run lint
  npm run typecheck
```

---

## 将工单映射到智能体团队

使用 agent-teams 工作流时，工单会直接映射到包含 10 个任务的流水线：

| 工单部分 | 映射至 | 智能体 |
|---------------|---------|-------|
| 标题 + 描述 | 任务 1：`{name}-spec` | 功能智能体 |
| 验收标准 | 任务 3：`{name}-tests` | 功能智能体（根据验收标准编写测试） |
| 模式引用 | 任务 5：`{name}-implement` | 功能智能体（遵循模式） |
| 验证部分 | 任务 6-7：验证 + 校验 | 质量智能体 + 功能智能体 |
| 约束条件 | 全程执行 | 所有智能体 |
| Claude Code 上下文 | 开始时加载 | 功能智能体首先读取 |

### 工单 → Agent Team 流程
```
1. 使用上述模板创建工单
2. 工单成为 _project_specs/features/ 中的功能规范
3. Team Lead 读取规范，创建包含 10 个任务的依赖链
4. Feature Agent 使用工单的 Claude Code Context 开始工作
5. Quality Agent 使用工单的 Acceptance Criteria 进行验证
6. Review Agent 根据工单的 Constraints 进行审查
7. Security Agent 根据工单的范围进行扫描
8. Merger Agent 创建引用工单 ID 的 PR
```

---

## 工单标题约定

| 类型 | 格式 | 示例 |
|------|--------|---------|
| 功能 | `Add {feature} for {user}` | 为收听者添加剧集书签 |
| 增强 | `Improve {what} in {where}` | 改进剧集 feed 中的搜索性能 |
| Bug | `Fix: {Component} - {Symptom}` | 修复：PlayerBar - 切换标签页时音频停止 |
| 技术债务 | `Refactor: {Area} - {Goal}` | 重构：AuthService - 提取令牌管理 |
| 安全 | `Security: {What} in {Where}` | 安全：为评论 API 添加输入清理 |
| 杂务 | `Chore: {What}` | 杂务：将 React 从 18 升级到 19 |

**规则：**
- 以祈使动词开头（Add、Fix、Improve、Refactor、Remove）
- 少于 80 个字符
- 包含受影响的组件/区域
- 具体明确，足以与其他工单区分开

---

## 面向 AI Agent 的故事点

AI agent 的估算方式与人类不同。使用以下校准标准：

| 点数 | 范围 | Agent 用时 | 示例 |
|--------|-------|-----------|---------|
| **1** | 单个文件，修改少于 20 行 | 约 5 分钟 | 修复拼写错误，更新配置值 |
| **2** | 1–2 个文件，处理直接明了 | 约 15 分钟 | 为表单添加字段，更新 API 响应 |
| **3** | 2–4 个文件，路径明确 | 约 30 分钟 | 遵循现有模式添加新的 API 端点 |
| **5** | 4–8 个文件，需要做出一些决策 | 约 1 小时 | 添加包含测试、模型和路由的新功能 |
| **8** | 8 个以上文件，较为复杂 | 约 2 小时 | 与外部服务集成，建立新的数据模型 |
| **13** | 规模过大，需要拆分 | - | 完整的身份验证系统、重大重构 |

**规则：**如果超过 5 点，请考虑拆分。如果是 13 点，则必须拆分。

---

## 与工单系统集成

### Jira
- 使用自定义字段 "Claude Code Context" 存放 AI 专属部分
- 使用标签：`claude-ready`、`needs-context`、`ai-blocked`
- 使用 "blocks/blocked by" 关联依赖链中的工单

### Asana
- 使用自定义字段表示优先级、点数和类型
- 使用子任务表示包含 10 个任务的流水线步骤
- 使用标签：`claude-ready`、`needs-refinement`

### Linear
- 使用内置 Claude Code Context 部分的工单模板
- 使用标签表示工单类型和 claude 就绪状态
- 使用项目将工单归入各个史诗

### GitHub Issues
- 使用工单模板（`.github/ISSUE_TEMPLATE/`）
- 使用标签：`feature`、`bug`、`tech-debt`、`claude-ready`
- 使用里程碑表示史诗

---

## 命令：/create-ticket

当用户要求创建工单时，遵循以下工作流程：

### 步骤 1：收集上下文
询问用户：
1. 类型是什么？（功能 / Bug / 技术债务）
2. 需要完成的工作简述
3. 涉及代码库的哪一部分？

### 第 2 步：自动检测上下文
- 阅读相关文件以了解当前实现
- 从现有代码中识别需要遵循的模式
- 查找现有测试以了解测试约定
- 检查可能受影响的相关文件

### 第 3 步：生成工单
使用上面的适当模板，填写：
- 所有 Claude Code Context 字段（自动检测）
- 验收标准（从描述中得出）
- 验证命令（来自项目的 `CLAUDE.md` 或 `package.json`）
- 约束条件（基于代码库分析）

### 第 4 步：使用检查清单进行验证
针对生成的工单运行 Claude Code Ready Checklist。
标记任何未勾选的项目，提醒用户处理。

### 第 5 步：输出
以模板格式呈现工单，使其可以直接粘贴到 Jira/Asana/Linear 中。

---

## 就绪定义（用于 Sprint）

工单满足以下条件后即可进入 Sprint：

- [ ] 通过 INVEST+C 标准
- [ ] Claude Code Ready Checklist 已完成
- [ ] 依赖项已识别且不存在阻塞
- [ ] 已分配故事点
- [ ] 已附加设计稿/模拟图（如适用）
- [ ] 验收标准已由团队审核

## 完成定义

工单满足以下条件后即视为完成：

- [ ] 所有验收标准均已验证（通过/失败）
- [ ] 测试已编写并通过
- [ ] 代码已审核（不存在 Critical/High 级别问题）
- [ ] 安全扫描已通过
- [ ] Lint 和类型检查均无问题
- [ ] 新增代码的覆盖率 >= 80%
- [ ] PR 已创建，并包含完整的流水线结果
- [ ] 文档已更新（如适用）