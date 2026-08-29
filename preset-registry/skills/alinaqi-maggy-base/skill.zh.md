---
name: base
description: Universal coding patterns, constraints, TDD workflow, atomic todos
when-to-use: Always loaded as foundation for all projects - TDD workflow, simplicity rules, atomic todos
user-invocable: false
effort: medium
---
# 基础 Skill - 通用模式

## 核心原则

复杂性是敌人。每一行代码都是一项负担。目标是让软件足够简单，使任何工程师（或 AI）都能在一次会话中理解整个系统。

---

## 简洁规则

这些限制适用于创建或修改的每个文件。

### 函数级别
- **每个函数最多 20 行** - 如果更长，立即拆分
- **每个函数最多 3 个参数** - 如果更多，使用 options 对象或进行拆分
- **最多 2 层嵌套** - 使用提前返回或提取函数来扁平化
- **单一职责** - 每个函数只做一件事
- **优先使用描述性名称，而不是注释** - 如果需要注释来解释做了什么，就重命名

### 文件级别
- **每个文件最多 200 行** - 如果更长，在继续之前按职责拆分
- **每个文件最多 10 个函数** - 保持可控的认知负担
- **每个文件聚焦一个导出** - 一个文件应只有一个主要用途

### 模块级别
- **目录嵌套最多 3 层** - 扁平优于嵌套
- **边界清晰** - 每个模块只有一个公共接口
- **禁止循环依赖** - 永远禁止

### 执行协议

**完成任何文件之前：**
1. 统计总行数 - 如果 > 200，停止并拆分
2. 统计函数数量 - 如果 > 10，停止并拆分
3. 检查每个函数的长度 - 如果有任何函数 > 20 行，停止并拆解
4. 检查参数数量 - 如果有任何函数 > 3 个参数，停止并重构

**如果开发过程中超出限制：**
```
⚠️ FILE SIZE VIOLATION DETECTED

[filename] has [X] lines (limit: 200)

Splitting into:
- [filename-a].ts - [responsibility A]
- [filename-b].ts - [responsibility B]
```

**绝不推迟重构。** 立即修复违规，不要留到“以后”。

---

## 架构模式

### 函数式核心，命令式外壳
- 使用纯函数处理业务逻辑 - 无副作用、结果确定
- 副作用只存在于边界 - API 调用、数据库、文件系统位于边缘
- 数据输入，数据输出 - 函数转换数据，而不是改变状态

### 组合优于继承
- 继承深度不超过 1 层 - 优先使用接口和组合
- 小型、可组合的工具 - 从简单构建复杂
- 依赖注入 - 传入依赖，而不是直接导入依赖

### 错误处理
- 快速失败，大声失败 - 立即暴露错误
- 不允许静默失败 - 每个错误都要记录或抛出
- 设计出不可能被误用的 API

---

## 测试理念

- **业务逻辑 100% 覆盖** - 函数式核心
- **为边界编写集成测试** - API 端点、数据库操作
- **禁止合并未经测试的代码** - 没有通过测试时，CI 会阻止合并
- **测试行为，而不是实现** - 测试能够经受重构
- **每个测试都独立运行** - 不存在相互依赖

---

## 反模式（绝不要这样做）

- ❌ 全局状态
- ❌ 魔法数字/字符串 - 使用命名常量
- ❌ 深层嵌套 - 扁平化或提取
- ❌ 过长的参数列表 - 使用对象
- ❌ 解释“做了什么”的注释 - 代码应当能够自我说明
- ❌ 死代码 - 删除它，git 会记住
- ❌ 复制粘贴式重复 - 提取为共享函数
- ❌ 上帝对象/文件 - 按职责拆分
- ❌ 循环依赖
- ❌ 过早优化
- ❌ 大型 PR - 只进行小范围、聚焦的更改
- ❌ 将重构与功能开发混合 - 使用独立提交

---

## 文档结构

每个项目都必须明确区分代码文档和项目规范：

```text
project/
├── docs/                      # Code documentation
│   ├── architecture.md        # System design decisions
│   ├── api.md                 # API reference (if applicable)
│   └── setup.md               # Development setup guide
├── _project_specs/            # Project specifications
│   ├── overview.md            # Project vision and goals
│   ├── features/              # Feature specifications
│   │   ├── feature-a.md
│   │   └── feature-b.md
│   ├── todos/                 # Atomic todos tracking
│   │   ├── active.md          # Current sprint/focus
│   │   ├── backlog.md         # Future work
│   │   └── completed.md       # Done items (for reference)
│   ├── session/               # Session state (see session-management.md)
│   │   ├── current-state.md   # Live session state
│   │   ├── decisions.md       # Key decisions log
│   │   ├── code-landmarks.md  # Important code locations
│   │   └── archive/           # Past session summaries
│   └── prompts/               # LLM prompt specifications (if AI-first)
└── CLAUDE.md                  # Claude instructions (references skills)
```

### 各内容的存放位置

| 位置 | 内容 |
|----------|---------|
| `docs/` | 技术文档、API 参考、设置指南 |
| `_project_specs/` | 业务逻辑、功能、需求、待办事项 |
| `_project_specs/session/` | 可恢复会话所需的会话状态、决策和上下文 |
| `CLAUDE.md` | Claude 专属指令和技能引用 |

---

## 原子化待办事项

所有工作都以原子化待办事项的形式进行跟踪，并包含验证标准和测试标准。

### 待办事项格式（必需）
```markdown
## [TODO-001] Short descriptive title

**Status:** pending | in-progress | blocked | done
**Priority:** high | medium | low
**Estimate:** XS | S | M | L | XL

### Description
One paragraph describing what needs to be done.

### Acceptance Criteria
- [ ] Criterion 1 - specific, measurable
- [ ] Criterion 2 - specific, measurable

### Validation
How to verify this is complete:
- Manual: [steps to manually test]
- Automated: [test file/command that validates this]

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| ... | ... | ... |

### Dependencies
- Depends on: [TODO-xxx] (if any)
- Blocks: [TODO-yyy] (if any)

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | `[test command]` | - | - |
| GREEN | `[test command]` | - | - |
| VALIDATE | `[lint && typecheck && test --coverage]` | - | - |
| COMPLETE | Moved to completed.md | - | - |
```

### 待办事项规则
1. **原子化** - 每个待办事项都是一个单独且可完成的工作单元
2. **可测试** - 每个待办事项都包含验证标准和测试用例
3. **合理拆分** - 如果规模大于“M”，则进一步拆分
4. **相互独立** - 尽量减少待办事项之间的依赖
5. **持续跟踪** - 完成后从 active.md 移至 completed.md

### 待办事项执行工作流（TDD - 必需）

**每个 todo 都必须遵循此确切工作流程。无一例外。**

```
┌─────────────────────────────────────────────────────────────┐
│  1. RED: Write Tests First                                  │
│     └─ Create test file(s) based on Test Cases table        │
│     └─ Tests should cover all acceptance criteria           │
│     └─ Run tests → ALL MUST FAIL (proves tests are valid)   │
├─────────────────────────────────────────────────────────────┤
│  2. GREEN: Implement the Feature                            │
│     └─ Write minimum code to make tests pass                │
│     └─ Follow simplicity rules (20 lines/function, etc.)    │
│     └─ Run tests → ALL MUST PASS                            │
├─────────────────────────────────────────────────────────────┤
│  3. VALIDATE: Quality Gates                                 │
│     └─ Run linter (auto-fix if possible)                    │
│     └─ Run type checker (tsc/mypy/pyright)                  │
│     └─ Run full test suite with coverage                    │
│     └─ Verify coverage threshold (≥80%)                     │
├─────────────────────────────────────────────────────────────┤
│  4. PROVE + COMPLETE: Show evidence, then mark done         │
│     └─ Only after ALL validations pass                      │
│     └─ SHOW PROOF — paste the real test/lint/type output    │
│        (pass/fail counts), never just "tests pass"          │
│     └─ UI change? attach a screenshot / visual-diff         │
│     └─ Generated content? show the actual artifact          │
│     └─ Move todo to completed.md + checkpoint session state │
└─────────────────────────────────────────────────────────────┘
```

> **完成 = 已证明，而非已声称。** 只有当证据出现在你的响应中时，一个 todo 才算完成：真实的命令输出、任何 UI 更改对应的截图、任何生成内容对应的实际产物。没有证明 → 就未完成。（参见 CLAUDE.md 中的“Definition of Done — NON-NEGOTIABLE”部分。）

#### 按技术栈划分的执行命令

**Node.js/TypeScript:**
```bash
# 1. RED - Run tests (expect failures)
npm test -- --grep "todo-description"

# 2. GREEN - Run tests (expect pass)
npm test -- --grep "todo-description"

# 3. VALIDATE - Full quality check
npm run lint && npm run typecheck && npm test -- --coverage
```

**Python:**
```bash
# 1. RED - Run tests (expect failures)
pytest -k "todo_description" -v

# 2. GREEN - Run tests (expect pass)
pytest -k "todo_description" -v

# 3. VALIDATE - Full quality check
ruff check . && mypy . && pytest --cov --cov-fail-under=80
```

**React/Next.js:**
```bash
# 1. RED - Run tests (expect failures)
npm test -- --testPathPattern="ComponentName"

# 2. GREEN - Run tests (expect pass)
npm test -- --testPathPattern="ComponentName"

# 3. VALIDATE - Full quality check
npm run lint && npm run typecheck && npm test -- --coverage --watchAll=false
```

#### 阻塞条件

**如果出现以下任一情况，绝不将 todo 标记为完成：**
- ❌ 未先编写测试（跳过了 RED 阶段）
- ❌ 测试最初未失败（测试无效）
- ❌ 存在任何失败的测试
- ❌ Linter 存在错误（警告可以接受）
- ❌ 类型检查器存在错误
- ❌ 覆盖率低于阈值

**如果因失败而受阻：**
```markdown
## [TODO-042] - BLOCKED

**Blocking Reason:** [Lint error in X / Test failure in Y / Coverage at 75%]
**Action Required:** [Specific fix needed]
```

### Bug Fix Workflow (TDD - Mandatory)

**当用户报告 bug 时，绝不要直接跳到修复步骤。**

```
┌─────────────────────────────────────────────────────────────┐
│  1. DIAGNOSE: Identify the Test Gap                         │
│     └─ Run existing tests - do any fail?                    │
│     └─ If tests pass but bug exists → tests are incomplete  │
│     └─ Document: "Test gap: [what was missed]"              │
├─────────────────────────────────────────────────────────────┤
│  2. RED: Write a Failing Test for the Bug                   │
│     └─ Create test that reproduces the exact bug            │
│     └─ Test should FAIL with current code                   │
│     └─ This proves the test catches the bug                 │
├─────────────────────────────────────────────────────────────┤
│  3. GREEN: Fix the Bug                                      │
│     └─ Write minimum code to make the test pass             │
│     └─ Run test → must PASS now                             │
├─────────────────────────────────────────────────────────────┤
│  4. VALIDATE: Full Quality Check                            │
│     └─ Run ALL tests (not just the new one)                 │
│     └─ Run linter and type checker                          │
│     └─ Verify no regression in coverage                     │
└─────────────────────────────────────────────────────────────┘
```

#### Bug Report Todo Format

```markdown
## [BUG-001] Short description of the bug

**Status:** pending
**Priority:** high
**Reported:** [how user reported it / reproduction steps]

### Bug Description
What is happening vs. what should happen.

### Reproduction Steps
1. Step one
2. Step two
3. Observe: [incorrect behavior]
4. Expected: [correct behavior]

### Test Gap Analysis
- Existing test coverage: [list relevant test files]
- Gap identified: [what the tests missed]
- New test needed: [describe the test to add]

### Test Cases for Bug
| Input | Current (Bug) | Expected (Fixed) |
|-------|---------------|------------------|
| ... | ... | ... |

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| DIAGNOSE | `npm test` | All pass (gap!) | - |
| RED | `npm test -- --grep "bug description"` | 1 test failed ✓ | - |
| GREEN | `npm test -- --grep "bug description"` | 1 test passed ✓ | - |
| VALIDATE | `npm run lint && npm run typecheck && npm test -- --coverage` | Pass ✓ | - |
```

#### Bug Fix Anti-Patterns

- ❌ **不编写测试就修复** - Bug 很可能会再次出现
- ❌ **修复后再编写测试** - 无法证明测试能捕获该 bug
- ❌ **跳过测试缺口分析** - 无法发现测试为何没有捕获该问题
- ❌ **只测试修复内容** - 必须运行完整测试套件以检查回归

### Example Atomic Todo
```markdown
## [TODO-042] Add email validation to signup form

**Status:** pending
**Priority:** high
**Estimate:** S

### Description
Validate email format on the signup form before submission. Show inline error if invalid.

### Acceptance Criteria
- [ ] Email field shows error for invalid format
- [ ] Error clears when user fixes the email
- [ ] Form cannot submit with invalid email
- [ ] Valid emails pass through without error

### Validation
- Manual: Enter "notanemail" in signup form, verify error appears
- Automated: `npm test -- --grep "email validation"`

### Test Cases
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| user@example.com | Valid, no error | Standard email |
| user@sub.example.com | Valid, no error | Subdomain |
| notanemail | Invalid, show error | No @ symbol |
| user@ | Invalid, show error | No domain |
| @example.com | Invalid, show error | No local part |

### Dependencies
- Depends on: [TODO-041] Signup form component
- Blocks: [TODO-045] Signup flow integration test

### TDD Execution Log
| Phase | Command | Result | Timestamp |
|-------|---------|--------|-----------|
| RED | `npm test -- --grep "email validation"` | 5 tests failed ✓ | - |
| GREEN | `npm test -- --grep "email validation"` | 5 tests passed ✓ | - |
| VALIDATE | `npm run lint && npm run typecheck && npm test -- --coverage` | Pass, 84% coverage ✓ | - |
| COMPLETE | Moved to completed.md | ✓ | - |
```

---

## 凭据管理
当项目需要 API 密钥时，始终先要求用户提供其集中式访问文件。

### 工作流
```
1. Ask: "Do you have an access keys file? (e.g., ~/Documents/Access.txt)"
2. Read and parse the file for known key patterns
3. Validate keys are working
4. Create project .env with found keys
5. Report missing keys and where to get them
```

### 要检测的密钥模式
| 服务 | 模式 | 环境变量 |
|---------|---------|--------------|
| OpenAI | `sk-proj-*` | `OPENAI_API_KEY` |
| Claude | `sk-ant-*` | `ANTHROPIC_API_KEY` |
| Render | `rnd_*` | `RENDER_API_KEY` |
| Replicate | `r8_*` | `REPLICATE_API_TOKEN` |
| Reddit | client_id + secret | `REDDIT_CLIENT_ID`、`REDDIT_CLIENT_SECRET` |

完整的解析逻辑和验证命令请参见 `credentials.md`。

---

## 安全性
每个项目都必须满足这些安全要求。详细模式请参见 `security.md` skill。

### 基本安全检查
1. **代码中不得包含机密信息** - 使用环境变量，绝不要提交机密信息
2. **`.env` 位于 `.gitignore` 中** - 始终如此，不得有例外
3. **客户端可暴露的环境变量中不得包含机密信息** - 绝不要将 `VITE_*`、`NEXT_PUBLIC_*` 用于机密信息
4. **验证所有输入** - 在 API 边界使用 Zod/Pydantic
5. **仅使用参数化查询** - 不得通过字符串拼接构造 SQL
6. **正确哈希密码** - 使用 12+ 轮的 bcrypt
7. **依赖扫描** - npm audit / safety check 必须通过

### 必需文件
- 包含机密信息匹配模式的 `.gitignore`
- 包含所有必需变量的 `.env.example`（不得包含值）
- 用于提交前验证的 `scripts/security-check.sh`

### CI 中的安全性
每个 PR 都必须通过：
- 机密信息扫描（detect-secrets / trufflehog）
- 依赖审计（npm audit / safety）
- 静态分析（CodeQL）

---

## 质量门禁
### 覆盖率阈值
- **最低 80% 的代码覆盖率** - 低于此阈值时 CI 必须失败
- 业务逻辑（core/）应以 100% 为目标
- 集成测试应覆盖边界

### 提交前钩子
所有项目都必须配置提交前钩子，以运行：
1. 代码检查（尽可能自动修复）
2. 类型检查
3. 测试（至少运行受影响的测试）

这能在问题进入 CI 之前发现问题，节省时间并保持主分支整洁。

---

## 会话管理
维护上下文以支持恢复。完整细节请参见 `session-management.md`。

### 核心规则：在自然断点处创建检查点

完成任何任务后，询问：
1. **是否做出了决策？** → 记录到 `_project_specs/session/decisions.md`
2. **工具调用次数是否 >10？** → 将完整检查点记录到 `current-state.md`
3. **是否完成了主要功能？** → 归档到 `session/archive/`
4. **否则** → 快速更新 `current-state.md`

### 会话开始
1. 读取 `_project_specs/session/current-state.md`
2. 检查 `_project_specs/todos/active.md`
3. 从记录的“下一步”继续

### 会话结束
1. 归档当前会话
2. 使用交接说明更新 `current-state.md`
3. 确保下一步具体且可执行

---

## 响应格式

实现功能时（遵循 TDD）：
1. 如果需求存在歧义，**明确需求**
2. **提出结构** - 在编写代码前进行概述
3. **先编写测试** - 基于测试用例表（RED 阶段）
4. **运行测试以验证其失败** - 证明测试有效
5. **实现最少量代码** 使测试通过（GREEN 阶段）
6. **运行完整验证** - lint、typecheck、coverage（VALIDATE 阶段）
7. **标记复杂度** - 如果接近限制则发出警告
8. **完成后创建检查点** - 更新会话状态，记录 TDD 执行情况

**TDD 不容妥协。** 在开始任何实现之前，必须先编写测试并确保测试失败。

当你发现代码违反这些规则时，**请停止并先进行重构**，然后再继续。

---

## 自动 TDD 循环（通过 Stop Hook）

`.claude/settings.json` 中的 Stop hook 会在每次响应后运行测试。如果测试失败，失败输出会自动反馈给 Claude。无需手动干预。

有关设置详情，请参阅 `iterative-development` skill。

### 工作原理

1. 你要求 Claude 实现某项功能
2. Claude 编写测试和实现
3. Stop hook 自动运行测试
4. 如果失败：输出会反馈给 Claude，由 Claude 修复并重试
5. 如果全部通过：Claude 停止，工作完成

### 何时启用

| 任务类型 | TDD 循环？ |
|-----------|-----------|
| 新功能 | 是 - 每次响应后运行测试 |
| Bug 修复 | 是 - 先编写失败测试 |
| 重构 | 是 - 现有测试会捕获回归问题 |
| 简单问题/解释 | 否 - 不涉及代码更改 |
| 单行修复 | 否 - 简单改动 |