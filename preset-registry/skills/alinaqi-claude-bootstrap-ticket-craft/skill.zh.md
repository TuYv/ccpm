---
name: ticket-craft
description: Create Jira/Asana/Linear tickets optimized for Claude Code execution - AI-native ticket writing
when-to-use: When creating tickets, breaking down epics, or writing specs for AI agent execution
user-invocable: true
effort: medium
---
# Ticket Craft 技能

*编写可由 AI 智能体自主执行的软件工单。*

**目的：** 定义一种工单格式，将软件工程最佳实践（INVEST、Given-When-Then、Definition of Ready）与 Claude Code 特有的上下文要求相结合。使用此技能创建的每个工单都是“Claude Code Ready”——这意味着智能体可以接手并执行该工单，而无需提出澄清问题。

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

标准 INVEST 加上代表 **Claude-Ready 的 C**：

| 标准 | 问题 | 以下情况不符合标准…… |
|-----------|----------|-------------|
| **I** - 独立（Independent） | 是否可以在不等待其他工单的情况下完成？ | 被未记录的依赖项阻塞 |
| **N** - 可协商（Negotiable） | 是否有调整实现方式的空间？ | 对实现细节规定得过于具体 |
| **V** - 有价值（Valuable） | 能否清楚说明谁会受益以及如何受益？ | 没有明确的用户价值或业务价值 |
| **E** - 可估算（Estimable） | 团队是否掌握了足够的信息来估算工作量？ | 过于模糊或规模过大，无法估算 |
| **S** - 小型（Small） | 一个人能否在 1 至 3 天内完成？ | 验收标准超过 5 项 |
| **T** - 可测试（Testable） | 能否为其编写通过/失败测试？ | 使用“快速”或“良好的用户体验”等模糊表述 |
| **C** - Claude-Ready | AI 智能体能否在不提出澄清问题的情况下执行？ | 缺少文件引用、模式、验证方式或约束条件 |

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

# Lint check
npm run lint

# Type check
npm run typecheck

# Full validation
npm test -- --coverage
```

#### 环境变量
- 现有：{列出 `.env` 中已有且相关的变量}
- 新增必需变量：{列出所需的所有新变量}

---

### 依赖关系
- 被阻塞于：{PROJ-XXX}（{简要说明}）
- 阻塞：{PROJ-YYY}（{简要说明}）

### 设计
- 设计稿：{Figma/设计链接，如适用}
```

---

### 2. Bug 工单

```markdown
## [BUG-XXX] Fix: {Component} - {Symptom}

**Type:** Bug
**Priority:** {Critical | High | Medium | Low}
**Points:** {1 | 2 | 3 | 5}
**Labels:** {regression, ux-bug, data-bug, security-bug}
**Severity:** {Blocks users | Degrades experience | Cosmetic}

---

### Bug Summary
{One sentence: what is broken and who is affected.}

### Environment
- Browser/OS: {e.g., Chrome 120 / macOS 14.2}
- Environment: {Production | Staging | Local}
- User type: {Anonymous | Authenticated | Admin}
- First observed: {date}

### Steps to Reproduce
1. {Navigate to / perform action}
2. {Perform next action}
3. {Perform next action}
4. **Observe:** {incorrect behavior}

### Expected Behavior
{What should happen instead.}

### Actual Behavior
{What actually happens. Include error messages, console output, screenshots.}

### Impact
- Users affected: {percentage or count}
- Frequency: {every time | intermittent | specific conditions}
- Workaround: {exists / none}

---

### Claude Code Context

#### Suspected Root Cause
{Where the bug likely lives, if known.}
- File: `src/components/LoginForm.tsx:87`
- Issue: `isSubmitting` state set to `true` on validation error but never reset

#### Relevant Files
- `src/components/LoginForm.tsx` - Form component with the bug
- `tests/components/LoginForm.test.tsx` - Existing tests (gap here)
- `src/hooks/useAuth.ts` - Auth hook used by the form

#### Test Gap Analysis
- Existing tests cover: {what's currently tested}
- Missing test: {what test would have caught this bug}

#### Bug Fix Workflow (TDD)
1. Write a failing test that reproduces the bug
2. Verify the test fails (confirms the bug exists)
3. Fix the bug with minimum code change
4. Verify the test passes
5. Run full test suite to check for regressions

#### Verification
```bash
# Run the specific test
npm test -- --grep "LoginForm submit"

# Run related tests
npm test -- src/components/LoginForm.test.tsx

# Full regression check
npm test
```

#### Constraints
- Fix the bug only - do NOT refactor surrounding code
- Do NOT change the component's public API
- Ensure all existing tests continue to pass
```

---

### 3. 技术债工单

```markdown
## [TECH-XXX] Refactor: {Area} - {Improvement}

**Type:** Tech Debt
**Priority:** {High | Medium | Low}
**Points:** {3 | 5 | 8}
**Labels:** {refactor, performance, maintainability, testing}

---

### Problem Statement
{What is wrong with the current implementation and why it matters.
Include concrete pain points: slow CI, frequent bugs, developer confusion.}

### Current State
- File: `{path}` ({N} lines)
- Test coverage: {X}%
- Cyclomatic complexity: {N}
- Related bugs: {PROJ-XXX, PROJ-YYY}
- Pain frequency: {how often this causes issues}

### Proposed Change
{What specifically should change and why this approach.}

### Acceptance Criteria
- [ ] {Specific structural change completed}
- [ ] All existing tests pass without modifying test assertions
- [ ] No public API changes (existing consumers unaffected)
- [ ] Test coverage >= {X}%
- [ ] {Measurable improvement metric}

### Risk Assessment
- Risk level: {Low | Medium | High}
- Mitigation: {run full regression, deploy behind flag, etc.}

### Business Justification
{Why this is worth doing now. E.g., "Reduces average bug fix time from 4h to 1h"
or "Enables upcoming feature PROJ-XXX which requires clean separation."}

---

### Claude Code Context

#### Relevant Files
- `{file}` - Current implementation to refactor
- `{test file}` - Existing tests (must not break)
- `{dependent file}` - Consumer of the API being refactored

#### Pattern Reference
Follow the pattern established in `{good example file}` for the new structure.

#### Constraints
- Do NOT change public APIs or exports
- Do NOT modify test assertions (tests should pass as-is)
- Do NOT introduce new dependencies
- Keep backwards compatibility

#### Verification
```bash
# Existing tests must pass unchanged
npm test

# No type errors
npm run typecheck

# Lint clean
npm run lint

# Coverage target
npm test -- --coverage
```
```

---

### 4. Epic 拆分工单

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

## Epic 切分技巧

将 Epic 拆分为工单时，请使用以下策略之一：

| 技巧 | 适用场景 | 示例 |
|-----------|-------------|---------|
| **按工作流步骤** | 用户旅程清晰 | 浏览 > 播放 > 保存 > 分享 |
| **按数据变体** | 存在多种数据类型 | 文本帖子、图片、视频 |
| **按用户角色** | 权限不同 | 匿名用户、已认证用户、管理员 |
| **按 CRUD** | 数据操作 | 创建、读取、更新、删除 |
| **优先实现成功路径** | 增量交付 | 先实现成功流程，再处理错误 |
| **按边界** | 系统集成 | 分别处理前端、API、数据库 |

### 经验法则
- 每个工单：由一名开发者/智能体完成的工作量应为 **1-3 天**
- 超过 **5 条验收标准** = 拆分工单
- 超过 **8 个故事点** = 必须拆分
- 每个工单都应当能够**独立部署**（即使隐藏在功能开关之后）
- 工单排序：**最简单、最基础的优先**

---

## Claude Code 就绪检查清单

在工单准备好交由 AI 智能体执行之前，请验证：

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

## 反面模式（切勿这样做）

### 1. 只有标题的工单
```
Title: Fix login
Description: (empty)
```
**失败原因：** 没有上下文、验收标准和文件引用。Claude Code 只能猜测，而且很可能猜错。

### 2. 长篇大论
```
Title: Implement new onboarding
Description: (3 pages mixing UI, backend, analytics, email, and future ideas)
```
**失败原因：** 任务不够小，也不具备独立性。智能体团队无法并行处理。应将其拆分为 5 个以上的工单。

### 3. 模糊的需求
```
Acceptance Criteria:
- Should be fast
- UX should be good
- Should work on mobile
```
**失败原因：** 无法衡量，也无法测试。应替换为："Response time < 200ms"、"Passes WCAG 2.1 AA"、"No horizontal scroll at 320px viewport."。

### 4. 过度指定解决方案
```
Title: Use Redis to cache user sessions
Description: Install Redis, configure connection pooling, set TTL to 3600...
```
**失败原因：** 指定了具体解决方案，而不是描述问题。应该描述为 "Session lookups take 500ms, need < 50ms"，并让智能体自行选择实现方式。

### 5. 缺少文件信息的工单
```
Description: Update the auth module to support OAuth.
```
**对 AI 而言失败的原因：** "The auth module" 可能涉及 20 个文件。Claude Code 需要明确的路径：`src/services/auth.ts`、`src/middleware/auth.ts`、`src/routes/auth.ts`。

### 6. 无验证方式的工单
```
Acceptance Criteria:
- OAuth login works
- Users can sign in with Google
```
**失败原因：** 没有测试命令，也没有验证步骤。如果 Claude Code 能够验证自己的工作，其表现会显著提升。

---

## 正面与反面示例

### 反面：模糊的功能工单
```
Title: Add rate limiting to the API
Description: We need rate limiting on our endpoints.
```

### 正面：可供 Claude Code 直接处理的功能工单
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

| 工单部分 | 映射到 | 智能体 |
|---------------|---------|-------|
| 标题 + 描述 | 任务 1：`{name}-spec` | 功能智能体 |
| 验收标准 | 任务 3：`{name}-tests` | 功能智能体（根据验收标准编写测试） |
| 模式参考 | 任务 5：`{name}-implement` | 功能智能体（遵循模式） |
| 验证部分 | 任务 6-7：验证 + 确认 | 质量智能体 + 功能智能体 |
| 约束 | 在整个过程中强制执行 | 所有智能体 |
| Claude Code 上下文 | 启动时加载 | 功能智能体首先读取 |

### 工单 → 智能体团队流程
```
1. Create ticket using templates above
2. Ticket becomes the feature spec in _project_specs/features/
3. Team Lead reads spec, creates 10-task dependency chain
4. Feature Agent uses ticket's Claude Code Context to start
5. Quality Agent uses ticket's Acceptance Criteria to verify
6. Review Agent reviews against ticket's Constraints
7. Security Agent scans based on ticket's scope
8. Merger Agent creates PR referencing the ticket ID
```

---

## 工单标题规范

| 类型 | 格式 | 示例 |
|------|--------|---------|
| 功能 | `Add {feature} for {user}` | 为听众添加剧集书签功能 |
| 增强 | `Improve {what} in {where}` | 改善剧集信息流中的搜索性能 |
| 缺陷 | `Fix: {Component} - {Symptom}` | 修复：PlayerBar - 切换标签页时音频停止播放 |
| 技术债务 | `Refactor: {Area} - {Goal}` | 重构：AuthService - 提取令牌管理逻辑 |
| 安全 | `Security: {What} in {Where}` | 安全：为评论 API 添加输入清理 |
| 杂务 | `Chore: {What}` | 杂务：将 React 从 18 升级到 19 |

**规则：**
- 以祈使动词开头（Add、Fix、Improve、Refactor、Remove）
- 少于 80 个字符
- 包含受影响的组件/区域
- 描述应足够具体，能够与其他工单区分开来

---

## AI 智能体的故事点

AI 智能体与人类的估算方式不同。请使用以下校准标准：

| 点数 | 范围 | 智能体耗时 | 示例 |
|--------|-------|-----------|---------|
| **1** | 单个文件，修改少于 20 行 | 约 5 分钟 | 修复拼写错误、更新配置值 |
| **2** | 1-2 个文件，简单直接 | 约 15 分钟 | 向表单添加字段、更新 API 响应 |
| **3** | 2-4 个文件，路径清晰 | 约 30 分钟 | 按照现有模式新增 API 端点 |
| **5** | 4-8 个文件，需要进行一些决策 | 约 1 小时 | 包含测试、模型和路由的新功能 |
| **8** | 8 个以上文件，复杂 | 约 2 小时 | 与外部服务集成、新增数据模型 |
| **13** | 规模过大，必须拆分 | - | 完整的身份验证系统、大规模重构 |

**规则：**如果超过 5 点，请考虑拆分。如果为 13 点，则必须拆分。

---

## 与工单系统集成

### Jira
- 对 AI 专用部分使用自定义字段 "Claude Code Context"
- 使用标签：`claude-ready`、`needs-context`、`ai-blocked`
- 使用 "blocks/blocked by" 关联工单，以表示依赖链

### Asana
- 对优先级、点数、类型使用自定义字段
- 对 10 个任务的流水线步骤使用子任务
- 使用标签：`claude-ready`、`needs-refinement`

### Linear
- 使用内置 Claude Code Context 部分的议题模板
- 使用标签标记工单类型以及是否已为 Claude 准备就绪
- 使用项目将工单分组为史诗

### GitHub Issues
- 使用议题模板（`.github/ISSUE_TEMPLATE/`）
- 使用标签：`feature`、`bug`、`tech-debt`、`claude-ready`
- 使用里程碑表示史诗

---

## 命令：/create-ticket

当用户要求创建工单时，请遵循以下工作流程：

### 步骤 1：收集上下文
询问用户：
1. 什么类型？（功能 / 缺陷 / 技术债务）
2. 简要描述需要完成的工作
3. 涉及代码库的哪个部分？

### 步骤 2：自动检测上下文
- 阅读相关文件，了解当前实现
- 从现有代码中识别应遵循的模式
- 查找现有测试，了解测试惯例
- 检查可能受到影响的相关文件

### 步骤 3：生成工单
使用上方适当的模板，并填写：
- 所有 Claude Code 上下文字段（自动检测）
- 验收标准（根据描述推导）
- 验证命令（来自项目的 CLAUDE.md 或 package.json）
- 约束条件（基于代码库分析）

### 步骤 4：使用检查清单进行验证
对生成的工单执行 Claude Code 就绪检查清单。
标记所有未勾选的项目，以便用户处理。

### 步骤 5：输出
以模板格式呈现工单，使其可直接粘贴到 Jira/Asana/Linear 中。

---

## 就绪定义（针对 Sprint）

工单满足以下条件时可以进入 Sprint：

- [ ] 通过 INVEST+C 标准
- [ ] Claude Code 就绪检查清单已完成
- [ ] 依赖项已识别且无阻塞
- [ ] 已分配故事点
- [ ] 已附加设计稿/模型图（如适用）
- [ ] 验收标准已由团队评审

## 完成定义

工单满足以下条件时视为完成：

- [ ] 所有验收标准均已验证（通过/失败）
- [ ] 测试已编写并通过
- [ ] 代码已评审（无严重/高风险问题）
- [ ] 安全扫描已通过
- [ ] Lint 和类型检查均无问题
- [ ] 新代码的覆盖率 >= 80%
- [ ] 已创建 PR，并附有完整的流水线结果
- [ ] 文档已更新（如适用）