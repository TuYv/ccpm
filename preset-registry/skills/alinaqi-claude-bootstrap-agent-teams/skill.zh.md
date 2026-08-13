---
name: agent-teams
description: Claude Code Agent Teams - default team-based development with strict TDD pipeline enforcement
when-to-use: When spawning agent teams for parallel feature development with TDD pipeline
user-invocable: false
effort: high
---
# 智能体团队技能


**目的：** 每个使用 Maggy 初始化的项目都会由一个协调一致的 AI 智能体团队运行。这是默认工作流，并非可选项。团队会强制执行严格的 TDD 流水线，任何步骤都不能跳过。

**设置：** 智能体定义应放在 `.claude/agents/` 中，并包含正确的 frontmatter（name、description、model、tools、disallowedTools、maxTurns、effort）。格式请参阅智能体文件。

---

## 核心原则

每项功能都遵循由任务依赖关系强制执行的不可变流水线：

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

每个项目都会创建 5 个常驻智能体和 N 个功能智能体：

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

| Agent | 角色 | 计划模式 | 能否编辑代码 |
|-------|------|-----------|---------------|
| team-lead | 编排、任务拆解、分配 | 否（委派模式） | 否 |
| quality-agent | TDD 验证、覆盖率门禁 | 是 | 否（只读） |
| security-agent | OWASP 扫描、密钥检测 | 是 | 否（只读） |
| review-agent | 多引擎代码审查 | 是 | 否（只读） |
| merger-agent | 分支创建、PR 管理 | 否 | 否（仅限 git） |
| feature-{name} | 功能实现（每个功能一个） | 否 | 是 |

---

## 团队负责人职责

团队负责人是编排者。它**绝不**编写代码。

1. 读取 `_project_specs/features/*.md` 以识别所有功能
2. 将每个功能拆解为包含 10 个任务的依赖链（见下文）
3. 为每个功能启动一个功能 Agent
4. 将初始任务（编写规格说明）分配给功能 Agent
5. 持续监控 TaskList，了解进度和阻塞项
6. 处理受阻任务并重新分配
7. 协调跨功能依赖关系
8. 所有 PR 创建完成后，向所有 Agent 发送 `shutdown_request`
9. 完成后清理团队

**必须使用委派模式。** 团队负责人仅使用：
- TeamCreate, TaskCreate, TaskUpdate, TaskList, TaskGet
- SendMessage（message、broadcast、shutdown_request）
- Read, Glob, Grep（用于监控）

---

## 功能 Agent 工作流（强制）

每个功能 Agent 都**必须**严格遵循以下顺序。任务依赖关系会强制执行该顺序——只有在步骤 N 被标记为完成并通过验证后，功能 Agent 才能开始步骤 N+1。

### 步骤 1：编写规格说明
- 创建 `_project_specs/features/{feature-name}.md`
- 包括：描述、验收标准、测试用例表、依赖项
- 遵循 base.md 技能中的原子化 TODO 格式
- 将任务标记为完成 -> Quality Agent 进行审查

### 步骤 2：编写测试（RED 阶段）
- 根据规格说明中的测试用例表编写测试文件
- 测试**必须**覆盖所有验收标准
- 导入尚不存在的模块（测试将会失败）
- 将任务标记为完成 -> Quality Agent 验证测试是否存在且失败

### 步骤 3：等待 RED 验证
- Quality Agent 运行测试并验证所有新测试均失败
- 如果任何测试在未实现功能的情况下通过 -> 重写测试
- Quality Agent 将验证标记为完成 -> 解锁实现阶段

### 步骤 4：实现（GREEN 阶段）
- 编写使所有测试通过所需的最少代码
- 遵循 base.md 中的简洁性规则（每个函数 20 行、每个文件 200 行、3 个参数）
- 使用 Ralph 循环（`/ralph-loop`）进行迭代实现
- 实现后运行测试——所有测试都必须通过
- 将任务标记为完成 -> Quality Agent 验证测试是否通过

### 步骤 5：等待 GREEN 验证
- Quality Agent 运行完整测试套件并检查覆盖率
- 覆盖率必须 >= 80%
- 如果测试失败或覆盖率不足 -> 修复并重新请求验证
- Quality Agent 将验证标记为完成 -> 解锁验证阶段

### 步骤 6：验证
- 运行代码检查工具（ESLint / Ruff）
- 运行类型检查器（TypeScript / mypy）
- 运行带覆盖率统计的完整测试套件
- 修复所有问题
- 将任务标记为完成 -> 解锁代码审查

### 第 7 步：等待代码审查
- 代码审查代理对已更改的文件运行 `/code-review`
- 如果存在严重或高风险问题 -> 修复并重新请求审查
- 代码审查代理标记为完成 -> 解锁安全扫描

### 第 8 步：等待安全扫描
- 安全代理运行安全检查
- 如果存在严重或高风险问题 -> 修复并重新请求扫描
- 安全代理标记为完成 -> 解锁合并

### 第 9 步：等待创建分支 + PR
- 合并代理创建功能分支、暂存文件并创建 PR
- PR 创建后，该功能即告完成

---

## 任务依赖链模型

对于每个功能“X”，团队负责人会严格按顺序创建以下 10 个任务：

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

多个功能并行运行各自的任务链。共享智能体会在任务解除阻塞时对其进行处理：

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

## 智能体间通信

### 直接消息（用于定向工作）
```
Feature Agent -> Quality Agent:  "Tests written for auth, ready for RED verify"
Quality Agent -> Feature Agent:  "All 7 tests fail as expected. Proceed to implement"
Feature Agent -> Review Agent:   "Implementation complete, ready for code review"
Review Agent  -> Feature Agent:  "2 High issues found: [details]. Fix before proceeding"
Security Agent -> Merger Agent:  "Security scan passed for auth feature"
Merger Agent  -> Team Lead:      "PR #42 created for auth feature"
```

### 任务列表（状态的唯一事实来源）
- 所有智能体在完成工作后都会检查 TaskList
- 质量智能体自动认领验证任务
- 审查智能体自动认领代码审查任务
- 安全智能体自动认领安全扫描任务
- 合并智能体自动认领 branch-pr 任务

### 广播（很少使用——仅用于阻塞性问题）
- 团队负责人 -> 所有人：“在 auth 和 dashboard 之间发现阻塞性依赖关系”
- 安全智能体 -> 所有人：“共享依赖项中存在严重漏洞”

---

## 功能智能体的创建

团队负责人为每个功能创建一个功能智能体：

1. 读取 `_project_specs/features/*.md`
2. 对于每个功能规范，创建一个功能智能体：
   - name：`feature-{feature-name}`
   - 使用 `.claude/agents/feature.md` 定义
   - 创建提示中包含功能名称和规范位置
3. 为该功能创建完整的 10 项任务依赖链
4. 将规范编写任务分配给功能智能体

### 示例
如果项目有 3 个功能：auth、dashboard、payments
- 创建：`feature-auth`、`feature-dashboard`、`feature-payments`
- 共创建 30 个任务（每个功能 10 个）
- 每个功能智能体从其规范任务开始
- 3 个智能体全部并行工作

---

## 分支和 PR 策略

**每个功能一个分支。每个功能一个 PR。**

```
Branch naming:  feature/{feature-name}
PR title:       feat({feature-name}): {short description}
PR body:        Generated from spec + test results + review + security results
```

合并代理：
1. `git checkout main && git pull origin main`
2. `git checkout -b feature/{feature-name}`
3. 仅暂存此功能变更的文件（绝不使用 `git add -A`）
4. 使用包含验证结果的描述性消息提交
5. `git push -u origin feature/{feature-name}`
6. 使用 `gh pr create` 并提供完整模板，其中包括：
   - 功能规范中的摘要
   - 质量验证的测试结果
   - 审查代理提供的代码审查摘要
   - 安全代理提供的安全扫描结果
   - 所有流水线步骤均已完成的检查清单

---

## 质量门禁

### 工作流强制执行（通过任务依赖）
- 任务依赖使跳过步骤在**结构上不可能**
- 在质量代理完成「tests-fail-verify」之前，功能代理无法看到「implement」
- 这是主要的强制执行机制

### 跨代理验证（信任但要验证）
- 质量代理独立运行测试（不信任功能代理的报告）
- 安全代理独立执行扫描（不信任审查代理）
- 合并代理在创建分支前验证所有前置任务均已完成

### 阻断规则
- 质量代理：如果测试未失败（RED）、未通过（GREEN）或覆盖率低于 80%，则阻断
- 代码审查代理：发现严重级别为 Critical 或 High 的问题时阻断
- 安全代理：发现严重级别为 Critical 或 High 的安全问题时阻断
- 合并代理：如果任何前置任务未完成，则拒绝创建分支

---

## 与现有 Skill 的集成

| 现有 Skill | Agent Teams 如何使用它 |
|----------------|------------------------|
| base.md | TDD 工作流、原子化待办事项、简洁性规则——所有代理均遵循 |
| code-review.md | 审查代理按照此 Skill 执行 `/code-review` |
| security.md | 安全代理遵循此 Skill 中的 OWASP 模式 |
| session-management.md | 每个代理维护各自的会话状态 |
| iterative-development.md | 功能代理使用 Stop hook TDD 循环进行实现 |
| project-tooling.md | 合并代理使用 `gh` CLI 管理分支和 PR |
| team-coordination.md | 被 agent-teams 的自动化协调所取代 |
| **icpg.md** | **团队负责人创建 ReasonNodes。功能代理查询约束/风险。质量代理检查漂移。PreToolUse hook 注入上下文。Stop hook 自动记录符号。** |
| code-graph.md | 功能代理使用图进行符号查找，同时使用 iCPG 获取意图上下文 |

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

### 自动生成（通过 /initialize-project）
项目设置完成后，阶段 6 会询问需要开发的功能，并自动生成团队。

### 手动生成（通过 /spawn-team）
对于现有项目：运行 `/spawn-team`，根据已有的功能规格生成团队。

---

## 容器隔离（Polyphony）

当 Docker/OrbStack 可用时，功能智能体默认在 Polyphony 容器中运行。团队负责人和共享智能体（质量、安全、审查、合并）仍以原生方式运行——它们只负责读取和协调。

### 使用 Polyphony 后的变化

| 方面 | 不使用 Polyphony | 使用 Polyphony |
|--------|-------------------|----------------|
| 功能智能体 | 共享文件系统 | 独立容器 + git 分支 |
| 文件冲突 | 团队负责人必须串行处理 | 不可能发生（隔离的克隆） |
| 测试执行 | 共享运行，可能相互干扰 | 每个容器独立运行 |
| 分支策略 | 合并智能体创建分支 | 每个容器都有自己的分支 |

### 工作原理

1. `/spawn-team` 检测 Docker + polyphony CLI
2. 对每个功能运行 `polyphony spawn "$FEATURE" --type feature`
3. Polyphony 创建一个容器，其中包含独立的 git 克隆和分支
4. Agent CLI 在容器内启动
5. 完成后，更改位于专用分支上，可随时创建 PR

### 回退机制

如果 Docker 不可用，`/spawn-team` 会回退到原生 Agent 工具（共享文件系统）。此时会输出一条提示：
> “未使用容器隔离运行（未找到 Docker）。智能体共享工作区。”

---

## 限制

- **实验性功能** - Agent teams 需要设置实验性环境变量
- **不支持嵌套团队** - 团队成员无法生成子团队
- **每个会话仅限一个团队** - 开始新团队之前，请先清理现有团队
- **不支持恢复会话** - 如果会话终止，请重新运行 `/spawn-team`（任务会保留）
- **文件冲突** - 共享文件的功能必须由团队负责人串行处理（使用 Polyphony 容器时除外）
- **Token 成本** - 每个智能体都是独立的 Claude 实例（5 + N 个实例）