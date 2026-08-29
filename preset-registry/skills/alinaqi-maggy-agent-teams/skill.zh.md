---
name: agent-teams
description: Claude Code Agent Teams - default team-based development with strict TDD pipeline enforcement
when-to-use: When spawning agent teams for parallel feature development with TDD pipeline
user-invocable: false
effort: high
---
# 智能体团队 Skill


**用途：** 每个使用 Maggy 初始化的项目都由一个协同工作的 AI 智能体团队运行。这是默认工作流，并非可选。团队强制执行严格的 TDD 流水线，任何步骤都不能跳过。

**设置：** 智能体定义应放在 `.claude/agents/` 中，并包含正确的 frontmatter（name、description、model、tools、disallowedTools、maxTurns、effort）。格式请参阅智能体文件。

---

## 核心原则

每项功能都遵循一条由任务依赖关系强制执行且不可变更的流水线：

```
┌─────────────────────────────────────────────────────────────────┐
│  STRICT FEATURE PIPELINE (IMMUTABLE)                            │
│  ──────────────────────────────────────────────────────────────  │
│                                                                  │
│  1. SPEC        Write feature specification                      │
│       ↓         (Feature Agent)                                  │
│  2. REVIEW      Quality Agent reviews spec completeness          │
│       ↓         (Quality Agent)                                  │
│  3. TESTS       Write failing tests for all acceptance criteria  │
│       ↓         (Feature Agent)                                  │
│  4. RED VERIFY  Quality Agent confirms ALL tests FAIL            │
│       ↓         (Quality Agent)                                  │
│  5. IMPLEMENT   Write minimum code to pass tests                 │
│       ↓         (Feature Agent)                                  │
│  6. GREEN VERIFY Quality Agent confirms ALL tests PASS + coverage│
│       ↓         (Quality Agent)                                  │
│  7. VALIDATE    Lint + type check + full test suite              │
│       ↓         (Feature Agent)                                  │
│  8. CODE REVIEW Multi-engine review, block on Critical/High      │
│       ↓         (Code Review Agent)                              │
│  9. SECURITY    OWASP scan, secrets detection, dependency audit  │
│       ↓         (Security Agent)                                 │
│  10. BRANCH+PR  Create feature branch, stage files, create PR    │
│                 (Merger Agent)                                    │
│                                                                  │
│  No step can be skipped. Task dependencies enforce ordering.     │
│  Quality Agent verifies RED/GREEN transitions.                   │
│  Code Review + Security Agents gate the merge path.              │
│  Merger Agent handles branching and PR creation.                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 默认智能体阵容

每个项目都会启动 5 个常驻智能体和 N 个功能智能体：

```
┌─────────────────────────────────────────────────────────────────┐
│  DEFAULT TEAM ROSTER                                             │
│  ──────────────────────────────────────────────────────────────  │
│                                                                  │
│  PERMANENT AGENTS (always present)                               │
│  ─────────────────────────────────                               │
│  Team Lead        Orchestration, task breakdown, assignment      │
│                   Uses delegate mode - NEVER writes code         │
│                                                                  │
│  Quality Agent    TDD verification (RED/GREEN phases)            │
│                   Coverage gates (>= 80%)                        │
│                   Spec completeness review                       │
│                                                                  │
│  Security Agent   OWASP scanning, secrets detection              │
│                   Dependency audit, .env validation               │
│                   Blocks on Critical/High                        │
│                                                                  │
│  Code Review Agent  Multi-engine code review                     │
│                     Claude / Codex / Gemini / All                │
│                     Blocks on Critical/High                      │
│                                                                  │
│  Merger Agent     Creates feature branches                       │
│                   Stages feature-specific files only              │
│                   Creates PRs via gh CLI                          │
│                   NEVER merges - only creates PRs                │
│                                                                  │
│  DYNAMIC AGENTS (one per feature)                                │
│  ────────────────────────────────                                │
│  Feature Agent    Implements one feature end-to-end              │
│  (x N features)   Follows strict pipeline above                  │
│                   Uses Ralph loops for implementation             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Agent | 角色 | 计划模式 | 可以编辑代码 |
|-------|------|-----------|---------------|
| team-lead | 编排、任务拆分、分配 | 否（委派模式） | 否 |
| quality-agent | TDD 验证、覆盖率门槛 | 是 | 否（只读） |
| security-agent | OWASP 扫描、密钥检测 | 是 | 否（只读） |
| review-agent | 多引擎代码审查 | 是 | 否（只读） |
| merger-agent | 分支创建、PR 管理 | 否 | 否（仅限 git） |
| feature-{name} | 功能实现（每个功能一个） | 否 | 是 |

---

## 团队负责人职责

团队负责人是协调者。它**绝不**编写代码。

1. 读取 `_project_specs/features/*.md` 以识别所有功能
2. 将每个功能拆分为包含 10 个任务的依赖链（见下文）
3. 为每个功能启动一个功能代理
4. 将初始任务（编写规格说明）分配给功能代理
5. 持续监控 TaskList，以跟踪进度和阻塞情况
6. 处理被阻塞的任务并重新分配
7. 协调跨功能依赖关系
8. 创建所有 PR 后，向所有代理发送 `shutdown_request`
9. 完成后清理团队

**必须使用委派模式。** 团队负责人仅使用：
- TeamCreate、TaskCreate、TaskUpdate、TaskList、TaskGet
- SendMessage（message、broadcast、shutdown_request）
- Read、Glob、Grep（用于监控）

---

## 功能代理工作流（强制）

每个功能代理都必须严格遵循以下顺序。任务依赖关系会强制执行该顺序——在步骤 N 被标记为已完成并通过验证之前，功能代理不能开始步骤 N+1。

### 步骤 1：编写规格说明
- 创建 `_project_specs/features/{feature-name}.md`
- 包含：描述、验收标准、测试用例表、依赖项
- 遵循 base.md skill 中的原子 TODO 格式
- 将任务标记为已完成 -> 由质量代理审查

### 步骤 2：编写测试（RED 阶段）
- 根据规格说明中的测试用例表编写测试文件
- 测试必须覆盖所有验收标准
- 导入尚不存在的模块（测试将会失败）
- 将任务标记为已完成 -> 由质量代理验证测试已存在且运行失败

### 步骤 3：等待 RED 验证
- 质量代理运行测试，并验证所有新测试均失败
- 如果任何测试在没有实现的情况下通过 -> 重写测试
- 质量代理将验证标记为已完成 -> 解锁实现阶段

### 步骤 4：实现（GREEN 阶段）
- 编写能使所有测试通过的最少量代码
- 遵循 base.md 中的简洁性规则（每个函数 20 行、每个文件 200 行、3 个参数）
- 使用 Ralph 循环（`/ralph-loop`）进行迭代实现
- 实现后运行测试——所有测试都必须通过
- 将任务标记为已完成 -> 由质量代理验证测试通过

### 步骤 5：等待 GREEN 验证
- 质量代理运行完整测试套件并检查覆盖率
- 覆盖率必须 >= 80%
- 如果测试失败或覆盖率不足 -> 修复并重新请求验证
- 质量代理将验证标记为已完成 -> 解锁验证阶段

### 步骤 6：验证
- 运行代码检查器（ESLint / Ruff）
- 运行类型检查器（TypeScript / mypy）
- 运行带覆盖率统计的完整测试套件
- 修复所有问题
- 将任务标记为已完成 -> 解锁代码审查

### 第 7 步：等待代码审查
- 代码审查智能体对已更改的文件运行 `/code-review`
- 如果存在严重或高危问题 -> 修复并重新请求审查
- 代码审查智能体标记为完成 -> 解锁安全扫描

### 第 8 步：等待安全扫描
- 安全智能体运行安全检查
- 如果存在严重或高危问题 -> 修复并重新请求扫描
- 安全智能体标记为完成 -> 解锁合并

### 第 9 步：等待分支 + PR
- 合并智能体创建功能分支、暂存文件并创建 PR
- PR 创建后，该功能即告完成

---

## 任务依赖链模型

对于每个功能“X”，团队负责人都会严格按照以下顺序创建这 10 个任务：

```
┌────────────────────────────────────────────────────────────────┐
│  TASK CHAIN FOR FEATURE "X"                                     │
│                                                                  │
│  Task 1:  X-spec                                                │
│           owner: feature-X                                       │
│           blockedBy: (none)                                      │
│           ↓                                                      │
│  Task 2:  X-spec-review                                         │
│           owner: quality-agent                                   │
│           blockedBy: X-spec                                      │
│           ↓                                                      │
│  Task 3:  X-tests                                               │
│           owner: feature-X                                       │
│           blockedBy: X-spec-review                               │
│           ↓                                                      │
│  Task 4:  X-tests-fail-verify                                   │
│           owner: quality-agent                                   │
│           blockedBy: X-tests                                     │
│           ↓                                                      │
│  Task 5:  X-implement                                           │
│           owner: feature-X                                       │
│           blockedBy: X-tests-fail-verify                         │
│           ↓                                                      │
│  Task 6:  X-tests-pass-verify                                   │
│           owner: quality-agent                                   │
│           blockedBy: X-implement                                 │
│           ↓                                                      │
│  Task 7:  X-validate                                            │
│           owner: feature-X                                       │
│           blockedBy: X-tests-pass-verify                         │
│           ↓                                                      │
│  Task 8:  X-code-review                                         │
│           owner: review-agent                                    │
│           blockedBy: X-validate                                  │
│           ↓                                                      │
│  Task 9:  X-security-scan                                       │
│           owner: security-agent                                  │
│           blockedBy: X-code-review                               │
│           ↓                                                      │
│  Task 10: X-branch-pr                                           │
│           owner: merger-agent                                    │
│           blockedBy: X-security-scan                             │
└────────────────────────────────────────────────────────────────┘
```

### 并行功能执行

多个功能并行运行各自的任务链。共享代理会在任务解除阻塞后立即处理：

```
Feature: auth         Feature: dashboard      Feature: payments
  auth-spec             dash-spec               pay-spec
  auth-spec-review      dash-spec-review        pay-spec-review
  auth-tests            dash-tests              pay-tests
  auth-fail-verify      dash-fail-verify        pay-fail-verify
  auth-implement        dash-implement          pay-implement
  auth-pass-verify      dash-pass-verify        pay-pass-verify
  auth-validate         dash-validate           pay-validate
  auth-code-review      dash-code-review        pay-code-review
  auth-security         dash-security           pay-security
  auth-branch-pr        dash-branch-pr          pay-branch-pr
       |                     |                       |
       v                     v                       v
   [All chains run simultaneously]
   [Quality Agent handles all verify tasks as they unblock]
   [Review Agent handles all review tasks as they unblock]
   [Security Agent handles all scan tasks as they unblock]
   [Merger Agent handles all branch-pr tasks as they unblock]
```

---

## 代理间通信

### 直接消息（用于定向工作）
```
Feature Agent -> Quality Agent:  "Tests written for auth, ready for RED verify"
Quality Agent -> Feature Agent:  "All 7 tests fail as expected. Proceed to implement"
Feature Agent -> Review Agent:   "Implementation complete, ready for code review"
Review Agent  -> Feature Agent:  "2 High issues found: [details]. Fix before proceeding"
Security Agent -> Merger Agent:  "Security scan passed for auth feature"
Merger Agent  -> Team Lead:      "PR #42 created for auth feature"
```

### 任务列表（状态的事实来源）
- 所有代理在完成工作后检查 TaskList
- 质量代理自动认领验证任务
- 审查代理自动认领代码审查任务
- 安全代理自动认领安全扫描任务
- 合并代理自动认领 branch-pr 任务

### 广播（很少使用——仅用于阻塞性问题）
- 团队负责人 -> 所有人：“在 auth 和 dashboard 之间发现阻塞性依赖”
- 安全代理 -> 所有人：“共享依赖项中存在严重漏洞”

---

## 功能代理的生成

团队负责人为每个功能生成一个功能代理：

1. 读取 `_project_specs/features/*.md`
2. 对于每个功能规格，生成一个功能代理：
   - 名称：`feature-{feature-name}`
   - 使用 `.claude/agents/feature.md` 定义
   - 生成提示词中包含功能名称和规格位置
3. 为该功能创建完整的 10 个任务依赖链
4. 将规格编写任务分配给功能代理

### 示例
如果项目有 3 个功能：auth、dashboard、payments
- 生成：`feature-auth`、`feature-dashboard`、`feature-payments`
- 共创建 30 个任务（每个功能 10 个）
- 每个功能代理从其规格任务开始
- 3 个代理全部并行工作

---

## 分支和 PR 策略

**每个功能一个分支。每个功能一个 PR。**

```
Branch naming:  feature/{feature-name}
PR title:       feat({feature-name}): {short description}
PR body:        Generated from spec + test results + review + security results
```

Merger Agent：
1. `git checkout main && git pull origin main`
2. `git checkout -b feature/{feature-name}`
3. 仅暂存针对该功能变更的文件（绝不使用 `git add -A`）
4. 使用包含验证结果的描述性消息提交
5. `git push -u origin feature/{feature-name}`
6. 使用完整模板执行 `gh pr create`，包括：
   - 来自功能规格的摘要
   - 来自质量验证的测试结果
   - 来自审查代理的代码审查摘要
   - 来自安全代理的安全扫描结果
   - 所有流水线步骤均已完成的检查清单

---

## 质量门禁

### 工作流强制执行（通过任务依赖）
- 任务依赖使跳过步骤在**结构上不可能**
- 在质量代理完成“tests-fail-verify”之前，功能代理无法看到“implement”
- 这是主要的强制执行机制

### 跨代理验证（信任但验证）
- 质量代理独立运行测试（不信任功能代理的报告）
- 安全代理独立执行扫描（不信任审查代理）
- Merger Agent 在创建分支之前验证所有前置任务均已完成

### 阻断规则
- 质量代理：如果测试未失败（RED）、未通过（GREEN）或覆盖率低于 80%，则阻断
- 代码审查代理：存在 Critical 或 High 严重性问题时阻断
- 安全代理：发现 Critical 或 High 严重性问题时阻断
- Merger Agent：如果任何前置任务未完成，则拒绝创建分支

---

## 与现有技能的集成

| 现有技能 | Agent Teams 的使用方式 |
|----------------|------------------------|
| base.md | TDD 工作流、原子化待办事项、简化规则——所有代理都遵循 |
| code-review.md | 审查代理根据此技能执行 `/code-review` |
| security.md | 安全代理遵循此技能中的 OWASP 模式 |
| session-management.md | 每个代理维护自己的会话状态 |
| iterative-development.md | 功能代理使用 Stop hook TDD 循环进行实现 |
| project-tooling.md | Merger Agent 使用 `gh` CLI 管理分支和 PR |
| team-coordination.md | 由 agent-teams 取代，用于自动化协调 |
| **icpg.md** | **团队负责人创建 ReasonNodes。功能代理查询约束/风险。质量代理检查漂移。PreToolUse hook 注入上下文。Stop hook 自动记录符号。** |
| code-graph.md | 功能代理结合 iCPG 使用图进行符号查找，以获取意图上下文 |

---

## 环境设置

### 必需设置
```json
// settings.json or environment
{
  "env": {
    "agent teams (via .claude/agents/ definitions)": "1"
  }
}
```

### 项目结构（由 /initialize-project 创建）
```
.claude/
  agents/            # Agent definitions (from agent-teams skill)
    team-lead.md
    quality.md
    security.md
    code-review.md
    merger.md
    feature.md
  skills/
    agent-teams/     # This skill
      SKILL.md
      agents/        # Agent definition templates
    base/
    code-review/
    security/
    ...
```

---

## 生成团队

### 自动方式（通过 /initialize-project）
项目设置完成后，阶段 6 会请求功能并自动生成团队。

### 手动方式（通过 /spawn-team）
对于现有项目：运行 `/spawn-team`，根据现有功能规格生成团队。

---

## 容器隔离（Polyphony）

当 Docker/OrbStack 可用时，功能代理默认在 Polyphony 容器中运行。团队负责人和共享代理（质量、安全、审查、合并）仍在本机运行——它们只负责读取和协调。

### Polyphony 带来的变化

| 方面 | 不使用 Polyphony | 使用 Polyphony |
|--------|-------------------|----------------|
| 功能代理 | 共享文件系统 | 独立容器 + git 分支 |
| 文件冲突 | 团队负责人必须串行处理 | 不可能发生（隔离的克隆） |
| 测试执行 | 共享环境，可能相互干扰 | 每个容器独立执行 |
| 分支策略 | 合并代理创建分支 | 每个容器都有自己的分支 |

### 工作原理

1. `/spawn-team` 检测 Docker + polyphony CLI
2. 对于每个功能，运行 `polyphony spawn "$FEATURE" --type feature`
3. Polyphony 创建一个拥有独立 git 克隆和分支的容器
4. Agent CLI 在容器内启动
5. 完成后，更改位于专用分支上，可用于创建 PR

### 回退方式

如果 Docker 不可用，`/spawn-team` 会回退到原生 Agent 工具（共享文件系统）。系统会打印以下提示：
> “在未进行容器隔离的情况下运行（未找到 Docker）。代理共享工作区。”

---

## 限制

- **实验性功能** - 代理团队需要实验性环境变量
- **不支持嵌套团队** - 队友无法生成子团队
- **每个会话只能有一个团队** - 开始新团队前请先清理
- **不支持会话恢复** - 如果会话终止，请重新运行 `/spawn-team`（任务会保留）
- **文件冲突** - 共享文件的功能必须由团队负责人串行处理（使用 Polyphony 容器时除外）
- **Token 成本** - 每个代理都是独立的 Claude 实例（5 + N 个实例）