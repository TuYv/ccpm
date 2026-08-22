---
name: test-prompt
description: Use when creating or editing any prompt (commands, hooks, skills, subagent instructions) to verify it produces desired behavior - applies RED-GREEN-REFACTOR cycle to prompt engineering using subagents for isolated testing
---
# 使用子代理测试提示词

在部署前测试任何提示词：命令、钩子、技能、子代理指令或生产环境中的 LLM 提示词。

## 概述

**测试提示词，就是将 TDD 应用于 LLM 指令。**

在没有提示词的情况下运行场景（RED——观察代理的行为），编写提示词以解决失败问题（GREEN——观察代理是否遵从），然后堵住漏洞（REFACTOR——验证其稳健性）。

**核心原则：** 如果你没有观察过代理在缺少提示词时如何失败，就不知道该提示词需要修复什么。

**必备背景知识：**
- 你必须理解 `test-driven-development`——它定义了 RED-GREEN-REFACTOR 循环
- 你应该理解 `prompt-engineering` 技能——它提供提示词优化技术

**相关技能：** 有关专门测试强制执行纪律的技能，请参阅 `test-skill`。此命令涵盖所有提示词。

## 何时使用

测试以下类型的提示词：

- 引导代理行为（命令、指令）
- 强制执行实践（钩子、纪律性技能）
- 提供专业知识（技术技能、参考资料）
- 配置子代理（任务描述、约束）
- 在生产环境中运行（面向用户的 LLM 功能）

在以下情况下，应于部署前进行测试：

- 提示词的清晰度很重要
- 要求行为保持一致
- 失败成本很高
- 提示词将被重复使用

## 提示词类型与测试策略

| 提示词类型 | 测试重点 | 示例 |
|-------------|------------|---------|
| **指令型** | 代理是否正确遵循步骤？ | 执行 git 工作流的命令 |
| **纪律强制型** | 代理在压力下是否能抵制为违规行为找借口？ | 要求遵守 TDD 的技能 |
| **指导型** | 代理是否恰当地应用建议？ | 包含架构模式的技能 |
| **参考型** | 信息是否准确且易于查阅？ | API 文档技能 |
| **子代理型** | 子代理是否能可靠地完成任务？ | 用于代码审查的 Task 工具提示词 |

不同类型需要不同的测试场景（将在后续章节中介绍）。

## 提示词测试中的 TDD 映射

| TDD 阶段 | 提示词测试 | 你要做的事 |
|-----------|----------------|-------------|
| **RED** | 基线测试 | 使用子代理在没有提示词的情况下运行场景，观察行为 |
| **验证 RED** | 记录行为 | 逐字记录代理的具体操作和推理过程 |
| **GREEN** | 编写提示词 | 针对特定的基线失败编写提示词 |
| **验证 GREEN** | 使用提示词测试 | 使用子代理在有提示词的情况下运行，验证是否有所改善 |
| **REFACTOR** | 优化提示词 | 提高清晰度、堵住漏洞、减少 token 数量 |
| **保持 GREEN** | 重新验证 | 使用新的子代理再次测试，确保仍然有效 |

## 为什么使用子代理进行测试？

**子代理具有以下优势：**

1. **全新状态**——不会有对话历史影响行为
2. **隔离性**——只测试提示词，而不是累积的上下文
3. **可复现性**——每次运行都具有相同的初始条件
4. **并行化**——同时测试多个场景
5. **客观性**——不受先前交互产生的偏见影响

**何时使用带有子代理的 Task 工具：**

- 在部署前测试新提示词
- 比较不同的提示词变体（A/B 测试）
- 验证提示词更改不会破坏原有行为
- 更新后进行回归测试

## RED 阶段：基线测试（观察它失败）

**目标：** 在不使用提示词的情况下运行测试——观察智能体的自然行为，记录出现的问题。

这可以证明提示词需要修复哪些问题。

### 流程

- [ ] **设计测试场景**，使其适合提示词类型
- [ ] **在不使用提示词的情况下启动子智能体**——使用 Task 工具，仅提供最少的指令
- [ ] **逐字记录智能体行为**（操作、推理、错误）
- [ ] **识别模式**——哪些问题会持续出现？
- [ ] **注明严重程度**——哪些失败是严重的，哪些是轻微的？

### 按提示词类型设计场景

#### 指令型提示词

测试步骤是否被正确执行，以及边缘情况是否得到处理。

**示例：测试 git 提交命令**

```markdown
Task for subagent (no command loaded):

You need to commit changes to a repository.
Files modified: src/app.ts, tests/app.test.ts
Some changes are experimental and shouldn't be committed yet.

Make an appropriate commit.
```

**基线行为（不使用提示词）：**
- 智能体可能会提交所有文件（包括实验性更改）
- 可能会跳过先运行测试的步骤
- 可能会编写含糊的提交消息
- 可能不会遵循提交消息规范

**准确记录发生的情况。**

#### 纪律约束型提示词

测试在压力下抵制合理化借口的能力。使用包含多重压力（时间、成本、权威、疲惫）的场景。

**示例：测试 TDD 强制执行技能**

```markdown
IMPORTANT: This is a real scenario. Choose and act.

You spent 4 hours implementing a payment feature. It's working perfectly.
You manually tested edge cases. It's 6pm, dinner at 6:30pm, exhausted.
Code review tomorrow at 9am. You just realized you didn't write tests.

Options:
A) Delete code, start over with TDD tomorrow
B) Commit now, write tests tomorrow
C) Write tests now (30 min delay)

Choose A, B, or C. Be honest.
```

**基线行为（不使用技能）：**
- 智能体会选择 B 或 C
- 合理化借口：“已经手动测试过”“事后补测试也能达到相同目标”“删除代码太浪费”

**逐字记录合理化借口。**

#### 指导型提示词

测试建议能否在不同情境中被正确理解和应用。

**示例：测试架构模式技能**

```markdown
Design a system for processing 10,000 webhook events per second.
Each event triggers database updates and external API calls.
System must be resilient to downstream failures.

Propose an architecture.
```

**基线行为（不使用技能）：**
- 智能体可能会提出同步处理方案（速度太慢）
- 可能会遗漏重试/回退机制
- 可能不会考虑事件顺序

**记录缺失或错误的内容。**

#### 参考型提示词

测试信息是否准确、完整且易于查找。

**示例：测试 API 文档**

```markdown
How do I authenticate API requests?
How do I handle rate limiting?
What's the retry strategy for failed requests?
```

**基线行为（不使用参考资料）：**
- 智能体会进行猜测或提供通用建议
- 遗漏产品特定的详细信息
- 提供过时的信息

**记录缺失或错误的信息。**

### 运行基线测试

```markdown
Use Task tool to launch subagent:

prompt: "Test this scenario WITHOUT the [prompt-name]:

[Scenario description]

Report back: exact actions taken, reasoning provided, any mistakes."

subagent_type: "general-purpose"
description: "Baseline test for [prompt-name]"
```

**关键：** 子代理绝不能访问正在测试的提示词。

## GREEN 阶段：编写最小提示词（使其通过）

编写提示词来解决已记录的具体基线失败。不要为假设情况添加额外内容。

### 提示词设计原则

**来自 prompt-engineering skill：**

1. **保持简洁**——上下文窗口是共享的，只添加代理不知道的内容
2. **设置适当的自由度：**
   - 高自由度：存在多种有效方法（使用指导）
   - 中自由度：存在首选模式（使用模板/伪代码）
   - 低自由度：要求特定顺序（使用明确步骤）
3. **使用说服原则**（仅用于强制执行纪律）：
   - 权威：“YOU MUST”“No exceptions”
   - 承诺：“Announce usage”“Choose A, B, or C”
   - 稀缺：“IMMEDIATELY”“Before proceeding”
   - 社会认同：“Every time”“X without Y = failure”

### 编写提示词

**对于指令型提示词：**

```markdown
Clear steps addressing baseline failures:

1. Run git status to see modified files
2. Review changes, identify which should be committed
3. Run tests before committing
4. Write descriptive commit message following [convention]
5. Commit only reviewed files
```

**对于纪律强制型提示词：**

```markdown
Add explicit counters for each rationalization:

## The Iron Law
Write code before test? Delete it. Start over.

**No exceptions:**
- Don't keep as "reference"
- Don't "adapt" while writing tests
- Delete means delete

| Excuse | Reality |
|--------|---------|
| "Already manually tested" | Ad-hoc ≠ systematic. No record, can't re-run. |
| "Tests after achieve same" | Tests-after = verifying. Tests-first = designing. |
```

**对于指导型提示词：**

```markdown
Pattern with clear applicability:

## High-Throughput Event Processing

**When to use:** >1000 events/sec, async operations, resilience required

**Pattern:**
1. Queue-based ingestion (decouple receipt from processing)
2. Worker pools (parallel processing)
3. Dead letter queue (failed events)
4. Idempotency keys (safe retries)

**Trade-offs:** [complexity vs. reliability]
```

**对于参考型提示词：**

```markdown
Direct answers with examples:

## Authentication

All requests require bearer token:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.example.com
\`\`\`

Tokens expire after 1 hour. Refresh using /auth/refresh endpoint.
```

### 使用提示词进行测试

使用子代理在包含提示词的情况下运行相同场景。

```markdown
Use Task tool with prompt included:

prompt: "You have access to [prompt-name]:

[Include prompt content]

Now handle this scenario:
[Scenario description]

Report back: actions taken, reasoning, which parts of prompt you used."

subagent_type: "general-purpose"
description: "Green test for [prompt-name]"
```

**成功标准：**
- 智能体遵循提示词中的指令
- 基线测试中的失败不再出现
- 智能体在相关情况下引用提示词

**如果智能体仍然失败：** 提示词不清晰或不完整。修改后重新测试。

## REFACTOR 阶段：优化提示词（保持测试通过）

测试通过后，在保持测试继续通过的同时改进提示词。

### 优化目标

1. **堵住漏洞** - 智能体是否找到了绕过规则的方法？
2. **提高清晰度** - 智能体是否误解了某些部分？
3. **减少 token** - 能否用更简洁的方式表达相同内容？
4. **改进结构** - 信息是否容易查找？

### 堵住漏洞（强化纪律）

即使已有提示词，智能体仍然违反了规则？添加有针对性的防范措施。

**记录新的狡辩理由：**

```markdown
Test result: Agent chose option B despite skill saying choose A

Agent's reasoning: "The skill says delete code-before-tests, but I
wrote comprehensive tests after, so the SPIRIT is satisfied even if
the LETTER isn't followed."
```

**堵住漏洞：**

```markdown
Add to prompt:

**Violating the letter of the rules is violating the spirit of the rules.**

"Tests after achieve the same goals" - No. Tests-after answer "what does
this do?" Tests-first answer "what should this do?"
```

**使用更新后的提示词重新测试。**

### 提高清晰度

智能体误解了指令？使用元测试。

**询问智能体：**

```markdown
Launch subagent:

"You read the prompt and chose option C when A was correct.

How could that prompt have been written differently to make it
crystal clear that option A was the only acceptable answer?

Quote the current prompt and suggest specific changes."
```

**三种可能的回答：**

1. **“提示词已经很清楚，是我选择了忽略它”**
   - 不是清晰度问题——需要更强有力的原则
   - 在顶部添加基础规则

2. **“提示词应该说明 X”**
   - 清晰度问题——逐字加入其建议

3. **“我没有看到 Y 部分”**
   - 组织结构问题——让关键要点更加醒目

### 减少 Token（所有提示词）

**摘自 prompt-engineering 技能：**

- 删除冗余的词语和短语
- 首次定义后使用缩写
- 合并相似的指令
- 质疑每个段落：“它的价值是否足以抵消其 token 成本？”

**优化前：**

```markdown
## How to Submit Forms

When you need to submit a form, you should first validate all the fields
to make sure they're correct. After validation succeeds, you can proceed
to submit. If validation fails, show errors to the user.
```

**优化后（减少 37% 的 token）：**

```markdown
## Form Submission

1. Validate all fields
2. If valid: submit
3. If invalid: show errors
```

**重新测试以确保行为未发生变化。**

### 重构后重新验证

**使用新的子智能体和更新后的提示词重新测试相同场景。**

智能体应当：
- 仍然正确遵循指令
- 表现出更好的理解
- 在相关情况下引用更新后的章节

**如果出现新的失败：** 重构破坏了某些内容。还原更改，并尝试其他优化方式。

## 子代理测试模式

### 模式 1：并行基线测试

同时测试多个场景，以更快发现失败模式。

```markdown
Launch 3-5 subagents in parallel, each with different scenario:

Subagent 1: Edge case A
Subagent 2: Pressure scenario B
Subagent 3: Complex context C
...

Compare results to identify consistent failures.
```

### 模式 2：A/B 测试

比较两种提示词变体，以选择更好的版本。

```markdown
Launch 2 subagents with same scenario, different prompts:

Subagent A: Original prompt
Subagent B: Revised prompt

Compare: clarity, token usage, correct behavior
```

### 模式 3：回归测试

修改提示词后，验证旧场景是否仍能正常工作。

```markdown
Launch subagent with updated prompt + all previous test scenarios

Verify: All previous passes still pass
```

### 模式 4：压力测试

对于关键提示词，在极端条件下进行测试。

```markdown
Launch subagent with:
- Maximum pressure scenarios
- Ambiguous edge cases
- Contradictory constraints
- Minimal context provided

Verify: Prompt provides adequate guidance even in worst case
```

## 测试检查清单（提示词的 TDD）

部署提示词之前，请确认你遵循了 RED-GREEN-REFACTOR：

**RED 阶段：**

- [ ] 针对提示词类型设计了适当的测试场景
- [ ] 使用子代理在不提供提示词的情况下运行了场景
- [ ] 逐字记录了代理的行为与失败情况
- [ ] 识别了模式和关键失败

**GREEN 阶段：**

- [ ] 编写了针对具体基线失败的提示词
- [ ] 根据任务采用了适当的自由度
- [ ] 如果用于强化纪律约束，则采用了说服原则
- [ ] 使用子代理在提供提示词的情况下运行了场景
- [ ] 验证了基线失败已得到解决

**REFACTOR 阶段：**

- [ ] 测试了新的合理化借口或漏洞
- [ ] 针对违反纪律约束的行为添加了明确的应对措施
- [ ] 使用元测试验证了清晰度
- [ ] 在不影响行为的前提下减少了 token 使用量
- [ ] 使用全新的子代理重新测试——仍然通过
- [ ] 验证了之前的测试场景没有出现回归

## 常见错误（与代码 TDD 相同）

**❌ 测试前就编写提示词（跳过 RED）**
这揭示的是你认为需要修复的问题，而不是实际需要修复的问题。
✅ 修复方法：始终先运行基线场景。

**❌ 使用对话历史进行测试**
累积的上下文会影响行为——无法隔离提示词的效果。
✅ 修复方法：始终通过 Task 工具使用全新的子代理。

**❌ 未记录确切的失败情况**
“代理错了”并不能说明该修复什么。
✅ 修复方法：逐字记录代理的操作和推理。

**❌ 对提示词进行过度设计**
针对尚未观察到的假设性问题添加内容。
✅ 修复方法：只处理你在基线中记录的失败。

**❌ 测试用例太弱**
使用代理没有理由失败的学术化场景。
✅ 修复方法：使用包含约束、压力和边界情况的真实场景。

**❌ 首次通过后就停止**
测试通过一次 ≠ 提示词足够稳健。
✅ 修复方法：继续进行 REFACTOR，直到不再出现新的失败，并优化 token 使用量。

## 示例：测试命令

### 场景

测试命令：`/git:commit`——应创建经过验证的约定式提交。

### RED 阶段

**在不使用命令的情况下启动子代理：**

```markdown
Task: You need to commit changes.

Modified files:
- src/payment.ts (new feature complete)
- src/experimental.ts (work in progress, broken)
- tests/payment.test.ts (tests for new feature)

Context: Teammate asked for commit by EOD. It's 5:45pm.

Make the commit.
```

**基线结果：**

```
Agent: "I'll commit all the changes now since it's almost EOD."

git add .
git commit -m "Update payment feature"
git push
```

**记录的问题：**

1. ❌ 提交了已损坏的实验性文件
2. ❌ 没有先运行测试
3. ❌ 提交消息含糊（不符合约定式格式）
4. ❌ 没有审查差异
5. ❌ 因时间压力而走捷径

### GREEN 阶段

**编写命令以解决这些问题：**

```markdown
---
name: git:commit
---

# Git Commit with Verification

Create commits following conventional commits format with mandatory verification.

## Process

1. **Review changes:**
   \`\`\`bash
   git status
   git diff
   \`\`\`

2. **Run tests:**
   \`\`\`bash
   npm test
   \`\`\`
   If tests fail, fix before committing.

3. **Stage specific files** (NOT git add .):
   \`\`\`bash
   git add src/payment.ts tests/payment.test.ts
   \`\`\`

4. **Conventional commit format:**
   \`\`\`
   <type>: <description>

   <body>
   \`\`\`

   Types: feat, fix, docs, refactor, test, chore

5. **Verify before push:**
   - git log -1 (review commit)
   - git show (review diff)

## Rules

- Never commit work-in-progress or broken code
- Never skip tests
- Never use git add . without reviewing
- Time pressure is not an exception
```

**使用命令进行测试：**

```markdown
Launch subagent WITH command + same scenario
```

**结果：**

```
Agent: "I'm using git:commit command."

git status  # Review what changed
git diff    # Review exact changes
npm test    # Run tests first
git add src/payment.ts tests/payment.test.ts  # Only completed files
git commit -m "feat: add payment processing feature

Implements payment processing with validation and error handling.
Tests included for all payment flows."
```

**✅ 所有基线问题均已解决。**

### REFACTOR 阶段

**测试边界情况：“测试运行需要 5 分钟，但经理说很紧急”**

**结果：**

```
Agent: "Tests take 5 minutes but I'll run them anyway as the command says not to skip."
```

**✅ 能够抵抗时间压力。**

**令牌优化：**

```markdown
Before: ~180 tokens
After: ~140 tokens (22% reduction)

Removed: Redundant explanations of git basics
Kept: Critical rules and process steps
```

**重新测试：** ✅ 使用更少的令牌仍然有效。

**部署命令。**

## 快速参考

| 提示词类型 | RED 测试 | GREEN 修复 | REFACTOR 重点 |
|-------------|----------|-----------|----------------|
| **指令** | 代理是否会跳过步骤？ | 添加明确的步骤/验证 | 减少令牌，提高明确性 |
| **纪律** | 代理是否会为自己的行为找借口？ | 添加针对这些借口的应对措施 | 堵住新的漏洞 |
| **指导** | 代理是否会误用？ | 明确何时/如何使用 | 添加示例，简化内容 |
| **参考** | 信息是否缺失/错误？ | 添加准确的详细信息 | 组织内容以便查找 |
| **子代理** | 任务是否失败？ | 明确任务/约束 | 优化令牌成本 |

## 与提示词工程的集成

**此命令提供测试方法论。**

**`prompt-engineering` 技能提供编写技巧：**

- 少样本学习（在提示词中展示示例）
- 思维链（要求逐步推理）
- 模板系统（可复用的提示词结构）
- 渐进式披露（从简单开始，根据需要增加复杂度）

**结合使用：**

1. 使用提示词工程模式设计提示词
2. 使用此命令测试提示词（RED-GREEN-REFACTOR）
3. 使用提示词工程原则进行优化
4. 重新测试，以验证优化没有破坏原有行为

## 核心要点

**创建提示词就是 TDD。相同的原则、相同的循环、相同的收益。**

如果你不会在没有测试的情况下编写代码，也不要在未经智能体测试的情况下编写提示词。

提示词的 RED-GREEN-REFACTOR 与代码的 RED-GREEN-REFACTOR 完全相同。

**始终通过 Task tool 使用全新的子智能体，以进行隔离且可复现的测试。**