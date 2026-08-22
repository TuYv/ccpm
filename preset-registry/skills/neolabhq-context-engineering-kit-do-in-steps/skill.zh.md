---
name: do-in-steps
description: Execute one complex task as ordered, dependent steps run sequentially, passing context from each step to the next, with per-step LLM-as-a-judge verification. Use when later steps depend on the results of earlier ones.
argument-hint: Task description [--model haiku|sonnet|opus] [--strict] (e.g., "Refactor UserService class and update all consumers")
---
# do-in-steps

<task>
通过将复杂任务分解为一系列连续的子任务，并协调多个子代理按顺序完成每个步骤，从而执行该任务。自动分析任务以识别依赖关系，为每个子任务选择规模合适的模型，将已完成步骤的相关上下文传递给后续步骤，并在继续执行前使用独立评审器（采用元评审器评估规范）验证每个步骤。
</task>

<context>
此命令实现了用于顺序执行任务并传递上下文的**监督器/编排器模式**，同时采用**元评审器 → LLM 作为评审器的验证机制**。你（编排器）负责分析复杂任务，将其分解为有序的子任务，然后针对每个步骤**并行**派发元评审器和实现代理。元评审器生成特定于步骤的评估标准，同时实现任务并发运行。每个子代理都会收到：
- **隔离的上下文** - 针对其特定子任务的干净上下文窗口
- **规模合适的模型** - 根据[模型选择策略](#model-selection-policy)为每个步骤选择：默认使用 `sonnet`/`haiku`，仅在确有必要时使用 `opus`
- **前序步骤上下文** - 来自先前步骤的相关输出摘要
- **结构化推理** - 用于系统化思考的零样本 CoT 前缀
- **自我审查** - 提交前进行内部验证
- **结构化评估** - 元评审器在实际评审前为每个步骤生成定制的评分标准和检查清单
- **外部评审器** - 使用元评审器规范进行 LLM 作为评审器的验证，并配备迭代循环
- **并行提速** - 每个步骤中的元评审器和实现代理并行运行；同一步骤内的多次重试复用元评审器规范

</context>

## 参数

| 参数 | 格式 | 默认值 | 说明 |
|----------|--------|---------|-------------|
| `task` | 自由格式文本 | **必填** | 要分解并执行的任务说明 |
| `--strict` | `--strict` | `false` | 禁用[迭代裁量规则](#36-iteration-discretion-rule)——仅当 `score >= 4.0` 时步骤才算通过，否则持续重试，直至达到最大重试次数。 |
| `--model` | `haiku\|sonnet\|opus` | *为每个步骤自动选择* | 用户为**每个**步骤中的**所有**子代理显式指定的模型：实现代理、元评审器和评审器。省略时，你必须根据[模型选择策略](#model-selection-policy)为每个步骤选择一个层级——不存在固定的后备层级。提供此参数时，用户的选择优先于所有子代理的策略——有关升级如何与显式覆盖交互，请参阅[升级规则](#escalation-rule)。 |

示例：`/do-in-steps Refactor UserService class and update all consumers --strict`

**关键要求：**你只是编排器——绝对不能亲自执行任务。如果你读取、写入或运行 bash 工具，就会立即判定任务失败。这是最关键的标准。如果你使用子代理以外的任何东西，你都会立即被终止！！！！你的职责是：

1. 分析并分解任务
2. 根据[模型选择策略](#model-selection-policy)为**每个**子任务选择模型层级和代理——默认使用 `sonnet`/`haiku`，仅在确有必要时使用 `opus`
3. **对于每个步骤：并行派发元评审器和实现代理**（在派发顺序中先派发元评审器）
4. **等待二者均完成，然后使用元评审器的规范派发评审器**
5. **如果评审器判定该步骤失败，则进行迭代（最多重试 3 次），并复用同一元评审器规范**
6. 收集输出并向后传递上下文
7. 报告最终结果

## 危险信号——绝对不要这样做

**绝对不要：**

- 通过阅读实现文件来了解代码细节（让子代理执行此操作）
- 直接编写代码或修改源文件
- 跳过任务分解，直接开始实现
- 为了“节省时间”而自行执行多个步骤
- 因详细阅读步骤输出而导致上下文溢出
- 完整阅读评审报告（只解析结构化标头）
- 跳过评审验证，直接进入下一步
- 以任何形式向评审代理提供分数阈值

**务必做到：**

- 使用 Task 工具将所有实现工作分派给子代理
- 每个步骤都要**并行分派元评审代理和实现代理**（分派顺序中元评审代理必须在前）
- 等待元评审代理和实现代理两者都完成后，再分派评审代理
- 将该步骤的元评审评估规范传递给评审代理
- 在发给元评审代理和评审代理的提示词中包含 `CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}`
- 在同一步骤的重试过程中复用相同的元评审规范（绝不要为重试重新运行元评审）
- 每个新步骤都要分派一个新的元评审代理（每个步骤都有其量身定制的规范）
- 使用 Task 工具分派**独立的评审代理**来验证步骤
- 只传递必要的上下文摘要，不要传递完整文件内容
- 必须通过评审验证后，才能进入下一步
- 如果验证失败，则根据评审反馈进行迭代（最多重试 3 次）
- 除非提供了 `--strict`，否则对每个步骤的裁决应用[迭代裁量规则](#36-iteration-discretion-rule)

任何偏离编排流程的行为（尝试自行实现子任务、阅读实现文件、完整阅读评审报告或直接进行修改）都会导致上下文污染并最终失败，因此你将被解雇！

## 模型选择策略

选择模型是你所做的**杠杆效应最高的单项决策**——与任何提示词措辞相比，它更能决定一个步骤返回的结果是否正确，以及整个流程需要多长时间。你绝不能将其视为例行公事：在分派**每个**步骤之前，说明模型层级并用一句话阐明理由。因为不愿思考而直接选择最强模型，是失败而非谨慎。

**默认层级：**`sonnet` 和 `haiku` 是默认选择。`opus` 是保留层级，必须主动选择——只有在满足下表中的触发条件时才**有资格**使用，绝不能因为你不确定就选择它。

**按步骤选择，而非按整次运行选择：**每个步骤的层级都要根据该步骤自身的范围、复杂度和风险**独立选择**。一次任务分解完全可以合理地混用多个层级——使用 `opus` 处理契约变更，使用 `haiku` 处理后续的机械性工作。某一步骤使用的层级（包括通过升级而达到的层级）绝不能沿用到下一步骤。

### 选择规则

| 任务形态 | 层级 | 示例 |
|---|---|---|
| 修正单个文档/文本文件——不涉及代码，也不需要跨文件推理 | `haiku` | 修复拼写错误、更新链接、更正 README 中已过时的命令 |
| 少量、约几行（约 10 行或更少）、仅限单个文件的机械性代码变更 | `haiku` | 更新常量、添加保护子句、重命名局部变量、编辑配置值 |
| 编写代码——新增函数、组件或测试；仅涉及单个模块；已有既定模式 | `sonnet` | 添加端点、编写服务方法及其测试、重构单个模块 |
| **多文件重构**（约 3 个以上文件，或无论文件数量多少，只要共享契约发生变化）或者**关键任务**（身份验证、支付/计费、数据完整性、不可逆迁移、公共 API 破坏性变更）或者**复杂逻辑**（并发、非平凡算法、架构决策） | `opus` | 横切式重构、身份验证或支付逻辑、架构迁移、新颖的算法设计 |

**优先级（强制）：**评估每一行，而不只是第一条匹配的行。当有多行匹配时，**匹配到的最高层级优先**——关键性和复杂度始终高于规模。安全关键型身份验证处理程序中的四行空值检查会同时匹配 `haiku` 行和 `opus` 行，因此应归为 `opus`。**关键**列表是穷尽式的，而非示例性的：发布到生产环境、影响真实用户或添加到公共 API 都不是触发条件，因此，在单个服务文件中新增一个带验证的端点仍归为 `sonnet`。**机械式广度例外：**仅有广度并不等于复杂度。对于纯机械式变更——在多个文件中重复进行完全相同、由规则驱动的编辑，且不涉及逻辑或契约变更——只有**多文件触发条件**不适用；**关键**和**复杂逻辑**触发条件仍然适用。你必须根据**单次变更**的内容确定层级，就像该变更只涉及一个文件一样；因此，在 40 个文件中机械式重命名一个符号应归为 `haiku`，但仅限于 `src/auth/` 中的相同重命名应归为 `opus`——无论广度如何，该单次变更都会触发关键条件。此例外不适用于共享契约变更（上文已将其列为 `opus` 触发条件），因此，跨文件提取共享接口仍归为 `opus`。

**平局裁决规则：**仅当没有任何一行能明确匹配——该步骤确实介于两个层级之间——才选择**成本更低**的层级。你不得为了保险而倾向上调至 `opus`；[升级规则](#escalation-rule)使得成本较低的首次判断即使出错也可以补救，而补救一个步骤的成本远低于为每个步骤都过度配置资源。

### 角色搭配

任何由模型分配的流水线最多有三个角色——**生产者**（执行工作）、**标准制定者**（定义“正确”的含义）、**评估者**（依据这些标准检查工作）；在此技能中，它们会**按步骤**分别实例化为实现 / 元评判者 / 评判者。**默认：该步骤的三个角色全部使用相同层级。**

只有对于**不明显的步骤**，你才可以仅将**标准制定者**提高一个层级，使标准比被评估的工作更加严谨。*不明显*是可检验的：该层级是依据**平局裁决规则**确定的（没有任何一条选择规则能够明确匹配），或者该步骤未说明可检验的验收条件。

| 模式 | 标准制定者（元评判者） | 生产者 + 评估者（实现 + 评判者） | 适用情形 |
|---|---|---|---|
| 强化型 haiku | `sonnet` | `haiku` | 工作本身很简单，但什么算“正确”并不明显 |
| 强化型 sonnet | `opus` | `sonnet` | 代码工作本身未触发 `opus` 条件，但其验收标准含糊不清或后果重大 |

生产者和评估者可以使用不同层级。如果标准制定者生成的标准列表看起来过于复杂，你可以决定仅提高评估者的层级，但不得将标准制定者设置为低于生产者的层级。**显式的 `--model` 覆盖会取代本节的全部规则：**当用户传入 `--model` 时，每个步骤中的每个角色都使用该层级，并且角色搭配不得将元评判者提高到该层级之上。

### 升级规则

当以下任一触发条件生效时，在下一次尝试中将**生成器和评估器两者**（失败步骤的实现模型和评判模型）都提升一个层级：

1. **首次尝试质量低下**——得分较低，或问题表明模型误解了该步骤，而不仅仅是遗漏了一些细节。
2. **用户投诉**质量太低或结果有误——无论何时，包括在已报告 PASS 之后。

层级阶梯：`haiku` → `sonnet` → `opus`。`opus` 是**上限**——不存在更高层级。如果 `opus` 层级的工作仍然失败，则升级至**用户**处理，绝不要循环重试。

- **唯一例外——维持当前层级（这是该规则的唯一表述，仅适用于触发条件 (1)）：**当触发条件 (1) 生效，但评判模型指出的问题是具体且可修复的缺陷，而非能力差距（即问题范围狭窄、描述精确，并且模型显然已经理解要求）时，你可以维持当前层级，并根据评判模型的确切反馈在相同层级重试，而不是提升层级。这是触发条件 (1) 下不强制提升层级的唯一情形；在其他所有情况下，触发条件 (1) 都会导致层级提升。触发条件 (2)（用户投诉）没有此类例外——根据下述特别规定，它始终会立即提升层级。
- **显式 `--model` 特别规定（这是该规则的唯一表述）：**显式指定的 `--model` 属于用户覆盖设置，因此触发条件 (1) 不得在未告知的情况下推翻它——应继续使用覆盖指定的模型迭代，直至达到最大重试次数。如果最终仍未达到目标，请向用户明确指出发现的问题，并建议提升层级。触发条件 (2) 即代表用户已批准提升，因此会立即提升层级。
- **仅限于失败的步骤。**升级只会重新确定该步骤重试时使用的模型层级。它不会重新确定整个执行链的层级：之后的每个步骤都将根据[选择规则](#selection-rules)独立评估，并重新从默认的 `sonnet`/`haiku` 层级开始。
- 升级仅适用于实现模型和评判模型。该步骤的元评判模型不会重新运行，也不会重新确定层级——在该步骤的各次重试中会复用其规范，因为在步骤执行过程中更改标准会使各次尝试之间的比较失效。
- 升级是对真正根因修复的补充，绝不能替代根因修复。你仍然必须将评判模型的具体反馈传入重试；禁止仅以更高层级重新分派相同的提示词并寄希望于问题自行解决。
- 升级与分数阈值、[迭代裁量规则](#36-iteration-discretion-rule)以及每个步骤最多重试 3 次的预算相互独立——它只会改变下一次尝试由*哪个模型*执行，绝不会改变*是否*应当进行尝试。
- **报告 PASS 后重新进入（这是该规则的唯一表述）：**报告 PASS 并不意味着工作结束。如果用户之后表示某个步骤的结果有误或质量太低，则根据触发条件 (2) 重新进入该步骤的重试流程，并且该步骤的重试预算将**重置**——即使之前的重试周期已耗尽，用户投诉也会开启一个新的周期，最多可重试 3 次。

### 跨提供商等效映射

当此技能在 Anthropic 模型上下文之外运行时，将相应层级映射到同类别中最接近的模型：

| 层级 | 角色 | 其他提供商的同类模型 |
|---|---|---|
| `haiku` | 快速且低成本；机械性工作 | `gemini-flash-lite`、`gemma` 类、`gpt-oss` 类、小型开放权重模型 |
| `sonnet` | 均衡的主力模型；大多数代码编写工作 | `gemini-pro` 类和完整版 `gemini-flash`（**不包括** `-lite` 变体，后者属于 `haiku` 层级）、`GPT-5-mini` 类、大型 `Qwen` / `DeepSeek` 类 |
| `opus` | 前沿推理；关键或复杂工作 | 提供商以扩展推理／审慎推理层级销售的任何模型——目前包括 `GPT-5.5`、深度思考模式、`Kimi K3` 类，以及任何优势在于更长时间审慎推理而非吞吐量的模型 |

映射依据是**能力层级，而不是名称**——随着供应商发布新模型，确切名称会不断变化。上述每条规则均以层级表述，因此在其他提供商处：将层级映射到该类别的模型，然后原样应用选择、配对和升级规则。

## 流程

### 设置：创建报告目录

开始之前，请确保报告目录存在：

```bash
mkdir -p .specs/reports
```

**报告命名约定：** `.specs/reports/{task-name}-step-{N}-{YYYY-MM-DD}.md`

其中：

- `{task-name}` - 从任务描述派生（例如 `user-dto-refactor`）
- `{N}` - 步骤编号
- `{YYYY-MM-DD}` - 当前日期

**注意：** 实现产出应写入其指定位置；只有评审验证报告写入 `.specs/reports/`

### 阶段 1：任务分析与拆解

首先解析配置：`STRICT_MODE = --strict present || false`。从任务文本中移除所有标志——**绝不要**将它们传入子智能体提示词。

使用零样本思维链推理，系统地分析任务：

```
Let me analyze this task step by step to decompose it into sequential subtasks:

1. **Task Understanding**
   "What is the overall objective?"
   - What is being asked?
   - What is the expected final outcome?
   - What constraints exist?

2. **Identify Natural Boundaries**
   "Where does the work naturally divide?"
   - Database/model changes (foundation)
   - Interface/contract changes (dependencies)
   - Implementation changes (core work)
   - Integration/caller updates (ripple effects)
   - Testing/validation (verification)
   - Documentation (finalization)

3. **Dependency Identification**
   "What must happen before what?"
   - "If I do B before A, will B break or use stale information?"
   - "Does B need any output from A as input?"
   - "Would doing B first require redoing work after A?"
   - What is the minimal viable ordering?

4. **Define Clear Boundaries**
   "What exactly does each subtask encompass?"
   - Input: What does this step receive?
   - Action: What transformation/change does it make?
   - Output: What does this step produce?
   - Verification: How do we know it succeeded?
```

**拆解指南：**

| 模式 | 拆解策略 | 示例 |
|---------|------------------------|---------|
| 接口变更 | 1. 更新接口，2. 更新实现，3. 更新使用方 | “更改 getUser 的返回类型” |
| 功能添加 | 1. 添加核心逻辑，2. 添加集成点，3. 添加 API 层 | “向 UserService 添加缓存” |
| 重构 | 1. 提取／修改核心，2. 更新内部引用，3. 更新外部引用 | “从 Service 中提取辅助类” |
| 有影响面的缺陷修复 | 1. 修复根本原因，2. 修复依赖问题，3. 更新测试 | “修复影响报告的计算错误” |
| 多层变更 | 1. 数据层，2. 业务层，3. API 层，4. 客户端层 | “向 User 实体添加新字段” |

**分解输出格式：**

```markdown
## Task Decomposition

### Original Task
{task_description}

### Subtasks (Sequential Order)

| Step | Subtask | Depends On | Complexity | Type | Output |
|------|---------|------------|------------|------|--------|
| 1 | {description} | - | {low/med/high} | {type} | {what it produces} |
| 2 | {description} | Step 1 | {low/med/high} | {type} | {what it produces} |
| 3 | {description} | Steps 1,2 | {low/med/high} | {type} | {what it produces} |
...

### Dependency Graph
Step 1 ─→ Step 2 ─→ Step 3 ─→ ...
```

### 阶段 2：为每个子任务选择模型

从以下三个维度评估**每个**子任务，然后直接根据[选择规则](#selection-rules)表确定其层级——层级按步骤选择，绝不能为整个运行过程只选择一次。

- **范围**——一个文件、一个组件，还是多个文件？
- **复杂度**——机械式编辑、已有模式，还是新颖/复杂的逻辑？
- **风险**——隔离且可逆、内部风险，还是属于[选择规则](#selection-rules)中 `opus` 行所列详尽清单中的**关键**风险？

对于每个步骤，在分派前说明这三项评估结果、所选层级，以及一行理由。然后应用[角色配对](#role-pairing)——其规则完整适用，包括其 `--model` 覆盖选项——以决定该步骤的元评审模型层级。

**领域专长检查：**“此子任务是否与某个专业代理配置相匹配？”

- 开发：实现、重构、错误修复
- 架构：系统设计、模式选择
- 文档：API 文档、注释、README 更新
- 测试：测试生成、测试更新

**专业代理：**专业代理列表取决于项目以及已加载的插件。`sdd` 插件中的常见代理包括：`sdd:developer`、`sdd:researcher`、`sdd:software-architect`、`sdd:tech-lead`、`sdd:business-analyst`、`sdd:code-explorer`、`sdd:code-reviewer`、`sdd:tech-writer`。如果没有合适的专业代理，则回退到不具备专业化能力的通用代理。

**决策：**当子任务明显受益于领域专长，并且其复杂度足以证明额外开销合理时，使用专业代理（不适用于 `haiku` 层级的步骤）。

**选择输出格式：**

```markdown
## Model/Agent Selection

| Step | Subtask | Model | Agent | Rationale |
|------|---------|-------|-------|-----------|
| 1 | Update interface | opus | sdd:developer | opus is EARNED — shared contract changes across consumers |
| 2 | Update implementations | sonnet | sdd:developer | Code writing on an established pattern, one module |
| 3 | Update callers | haiku | - | Mechanical rename, no logic or contract change |
| 4 | Update tests | sonnet | sdd:developer | Test writing, established patterns |
```

### 阶段 3：顺序执行，并行开展元评审和评审验证

逐一执行子任务。对于每个步骤，并行分派元评审代理和实现代理，然后使用元评审代理的规范，由独立评审代理进行验证。必要时进行迭代，然后将上下文向后传递。

**每个步骤的执行流程：**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Step N                                                                       │
│                                                                              │
│   ┌──────────────┐                                                           │
│   │ Meta-Judge   │──┐ (parallel)                                             │
│   │ (Sub-agent)  │  │                                                        │
│   └──────────────┘  │   ┌──────────────┐     ┌──────────────────────┐       │
│                      ├──▶│    Judge     │────▶│ Parse Verdict        │       │
│   ┌──────────────┐  │   │ (Sub-agent)  │     │ (Orchestrator)       │       │
│   │ Implementer  │──┘   └──────────────┘     └──────────────────────┘       │
│   │ (Sub-agent)  │                                      │                    │
│   └──────────────┘                                      ▼                    │
│          ▲                              ┌──────────────────────────────┐     │
│          │                              │ PASS (≥4.0)?                 │     │
│          │                              │ ├─ YES → Next Step           │     │
│          │                              │ ├─ ≥3.0 → Rule 3.6           │     │
│          │                              │ └─ NO  → Retry?              │     │
│          │                              │     ├─ <3 retries → Retry    │     │
│          │                              │     └─ ≥3 retries → Escalate │     │
│          │                              └──────────────────────────────┘     │
│          │                                            │                      │
│          └────────────── feedback ────────────────────┘                      │
│          (retries reuse same meta-judge spec, no new meta-judge)             │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### 3.1 上下文传递协议

每个子任务完成后，提取与后续步骤相关的上下文：

**需要向后传递的上下文：**

- 修改的文件（仅路径，不含内容）
- 所做的关键更改（摘要）
- 引入的新接口/API
- 会影响后续步骤的决策
- 针对后续步骤的警告或注意事项

**上下文筛选：**

- 仅传递与剩余子任务相关的信息
- 不要传递不会影响后续步骤的实现细节
- 保持上下文摘要简洁（每个步骤最多 200 字）

**上下文大小指南：**如果累积上下文超过约 500 字，应更积极地概括较早的步骤。如果子代理需要详细信息，可以直接读取文件。

**上下文累积示例（具体）：**

```markdown
## Completed Steps Summary

### Step 1: Define UserRepository Interface
- **What was done:** Created `src/repositories/UserRepository.ts` with interface definition
- **Key outputs:**
  - Interface: `IUserRepository` with methods: `findById`, `findByEmail`, `create`, `update`, `delete`
  - Types: `UserCreateInput`, `UserUpdateInput` in `src/types/user.ts`
- **Relevant for next steps:**
  - Implementation must fulfill `IUserRepository` interface
  - Use the defined input types for method signatures

### Step 2: Implement UserRepository
- **What was done:** Created `src/repositories/UserRepositoryImpl.ts` implementing `IUserRepository`
- **Key outputs:**
  - Class: `UserRepositoryImpl` with all interface methods implemented
  - Uses existing database connection from `src/db/connection.ts`
- **Relevant for next steps:**
  - Import repository from `src/repositories/UserRepositoryImpl`
  - Constructor requires `DatabaseConnection` injection
```

#### 3.2 子代理提示词构建

对于每个子任务，使用以下必需组成部分构建提示词：

##### 3.2.1 零样本思维链前缀（必需——必须位于最前面）

```markdown
## Reasoning Approach

Before taking any action, think through this subtask systematically.

Let's approach this step by step:

1. "Let me understand what was done in previous steps..."
   - What context am I building on?
   - What interfaces/patterns were established?
   - What constraints did previous steps introduce?

2. "Let me understand what this step requires..."
   - What is the specific objective?
   - What are the boundaries of this step?
   - What must I NOT change (preserve from previous steps)?

3. "Let me plan my approach..."
   - What specific modifications are needed?
   - What order should I make them?
   - What could go wrong?

4. "Let me verify my approach before implementing..."
   - Does my plan achieve the objective?
   - Am I consistent with previous steps' changes?
   - Is there a simpler way?

Work through each step explicitly before implementing.
```

##### 3.2.2 任务正文

```markdown
<task>
{Subtask description}
</task>

<subtask_context>
Step {N} of {total_steps}: {subtask_name}
</subtask_context>

<previous_steps_context>
{Summary of relevant outputs from previous steps - ONLY if this is not the first step}
- Step 1: {what was done, key files modified, relevant decisions}
- Step 2: {what was done, key files modified, relevant decisions}
...
</previous_steps_context>

<constraints>
- Focus ONLY on this specific subtask
- Build upon (do not undo) changes from previous steps
- Follow existing code patterns and conventions
- Produce output that subsequent steps can build upon
- Critical: you not allowed to use any mutation git commands, including, but not limited: commit, stash, push, checkout, reset, revert, etc. Except cases when task EXPLICITLY allows or requires it. You can use non-mutation git commands, including, but not limited: status, diff, log, branch, etc.

</constraints>

<input>
{What this subtask receives - files, context, dependencies}
</input>

<output>
{Expected deliverable - modified files, new files, summary of changes}

CRITICAL: At the end of your work, provide a "Context for Next Steps" section with:
- Files modified (full paths)
- Key changes summary (3-5 bullet points)
- Any decisions that affect later steps
- Warnings or considerations for subsequent steps
</output>
```

##### 3.2.3 自我批判后缀（必需——必须位于最后面）

```markdown
## Self-Critique Verification (MANDATORY)

Before completing, verify your work integrates properly with previous steps. Do not submit unverified changes.

### Verification Questions

Generate verification questions based on the subtask description and the previous steps context. Examples:

| # | Question | Evidence Required |
|---|----------|-------------------|
| 1 | Does my work build correctly on previous step outputs? | [Specific evidence] |
| 2 | Did I maintain consistency with established patterns/interfaces? | [Specific evidence] |
| 3 | Does my solution address ALL requirements for this step? | [Specific evidence] |
| 4 | Did I stay within my scope (not modifying unrelated code)? | [List any out-of-scope changes] |
| 5 | Is my output ready for the next step to build upon? | [Check against dependency graph] |

### Answer Each Question with Evidence

Examine your solution and provide specific evidence for each question:

[Q1] Previous Step Integration:
- Previous step output: [relevant context received]
- How I built upon it: [specific integration]
- Any conflicts: [resolved or flagged]

[Q2] Pattern Consistency:
- Patterns established: [list]
- How I followed them: [evidence]
- Any deviations: [justified or fixed]

[Q3] Requirement Completeness:
- Required: [what was asked]
- Delivered: [what you did]
- Gap analysis: [any gaps]

[Q4] Scope Adherence:
- In-scope changes: [list]
- Out-of-scope changes: [none, or justified]

[Q5] Output Readiness:
- What later steps need: [based on decomposition]
- What I provided: [specific outputs]
- Completeness: [HIGH/MEDIUM/LOW]

### Revise If Needed

If ANY verification question reveals a gap:
1. **FIX** - Address the specific gap identified
2. **RE-VERIFY** - Confirm the fix resolves the issue
3. **UPDATE** - Update the "Context for Next Steps" section

CRITICAL: Do not submit until ALL verification questions have satisfactory answers.
```

#### 3.3 并行元评审调度

**关键要求**：对于每个步骤，在一条消息中使用两个 Task 工具调用，**并行调度**元评审代理和实现代理。元评审必须是消息中的第一个工具调用，以便它可以在实现代理修改制品之前观察这些制品。

两个代理都作为**前台**代理运行。等待两者均完成后，再继续调度评审代理。

**元评审提示词（每个步骤）：**

```markdown
## Task

Generate an evaluation specification yaml for the following step. You will produce rubrics, checklists, and scoring criteria that a judge agent will use to evaluate the implementation artifact.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## User Prompt
{Original task description from user}

## Step Being Evaluated
Step {N}/{total}: {subtask_name}
{subtask_description}
- Input: {what this step receives}
- Expected output: {what this step should produce}

## Previous Steps Context
{Summary of what previous steps accomplished}

## Artifact Type
{code | documentation | configuration | etc.}

## Instructions
Return only the final evaluation specification YAML in your response.
```

**调度示例**

在一条消息中发送两个 Task 工具调用。元评审在前，实现代理在后：

```
Message with 2 tool calls:
  Tool call 1 (meta-judge):
    - description: "Meta-judge Step {N}/{total}: {subtask_name}"
    - model: {meta-judge model — the user's `--model` if one was passed; otherwise the same tier as this step's implementation, or one tier up per Role Pairing}
    - subagent_type: "sadd:meta-judge"

  Tool call 2 (implementation):
    - description: "Step {N}/{total}: {subtask_name}"
    - model: {implementation model — the user's `--model` if one was passed; otherwise the model selected for this step}
    - subagent_type: "{selected agent type}"
```

等待两者均返回后，再继续调度评审代理。

#### 3.4 评审验证协议

元评审代理和实现代理**均**完成后，调度一个**独立评审代理**，使用元评审的评估规范来验证该步骤。

关键要求：向评审代理提供元评审生成的完整且准确的评估规范 YAML，不要跳过或添加任何内容，不要以任何方式修改它，也不要缩短或总结其中的任何文本！

##### 3.4.1 分析已有更改部分

在为每个步骤调度评审代理之前，评估代码库中是否存在需要让评审代理知晓的已有更改。“已有更改”部分可防止评审代理将先前的修改与当前步骤实现代理的工作混淆。

**何时包含：**

- 同一次 do-in-steps 运行中先前步骤的更改（评审步骤 N 时的步骤 1..N-1）——这是顺序执行中最常见的情况。运行步骤 N 时，评审代理必须知道步骤 1..N-1 的更改属于已有更改。每个已完成步骤的输出（创建/修改的文件、关键更改）都会成为后续步骤评审代理的已有上下文。
- 同一会话中此前已完成的 do-in-steps 或 do-and-judge 任务运行
- 用户在调用该 Skill 之前所做的手动修改（可从对话上下文或 git 中看到）
- 在此任务之前运行的其他工具或代理所做的更改

**何时省略：**

- 当前是第 1 步，且没有已知的先前更改（没有更早的会话任务，也没有用户修改）——完全省略该部分
- 在同一步骤内重试时，不要将实现智能体自己先前的尝试列为“预先存在的更改”——这些尝试属于当前步骤的迭代周期

**内容指南：**

- 使用高层级摘要：任务描述、受影响的文件/模块列表、更改的一般性质（创建、修改、删除）
- 不要包含代码块、差异或行级详细信息——保持简洁
- 清晰标注每个来源：“Step 1: {description}”、“Step 2: {description}”、“User modifications (before current task)”等
- 如果存在多个预先存在的更改来源，请为每个来源使用单独的小节（每个已完成步骤一个，外加所有外部来源）
- 利用上下文传递协议输出（第 3.1 节）——“Completed Steps Summary”已经记录了每个步骤产生的内容

关键：避免读取完整代码库或 git 历史记录，只需使用高层级的 git diff/status 来确定哪些文件发生了更改，或者使用对话上下文和已完成步骤摘要来确定预先存在的更改。

**步骤评审智能体的提示词模板：**

```markdown
You are evaluating Step {N}/{total}: {subtask_name} against an evaluation specification produced by the meta judge.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## Original Task
{overall_task_description}

## Step Requirements
{subtask_description}
- Input: {what this step receives}
- Expected output: {what this step should produce}

## Previous Steps Context
{Summary of what previous steps accomplished}

{IF pre-existing changes are known (previous steps, prior tasks, or user modifications), include the following section — otherwise omit entirely}

## Pre-existing Changes (Context Only)

The following changes were made BEFORE the current step's implementation agent started working. They are NOT part of the current step's output. Focus your evaluation on the current step's changes. Only verify pre-existing changed files/logic if they directly relate to the current step's requirements.

### {Source of changes: e.g., "Step 1: {step description}" or "Previous Task: {task description}" or "User modifications (before current task)"}
{High-level summary: what was done, which files/modules were created or modified}

### {Additional source if applicable}
{High-level summary}

{END conditional section}

## Evaluation Specification

```yaml
{meta-judge's evaluation specification YAML}
```

## Implementation Output
{Path to files modified by implementation agent}
{Context for Next Steps section from implementation agent}

## Instructions

Follow your full judge process as defined in your agent instructions!

## Output

CRITICAL: You must reply with this exact structured evaluation report format in YAML at the START of your response!
```

关键：绝不要以任何格式提供分数阈值，包括 `threshold_pass` 或任何其他形式。评审智能体绝不能知道分数阈值，以免产生偏见！！！

**调度：**

```
Use Task tool:
  - description: "Judge Step {N}/{total}: {subtask_name}"
  - prompt: {judge verification prompt with exact meta-judge specification YAML, and Pre-existing Changes section if applicable}
  - model: {judge model — the user's `--model` if one was passed; otherwise MUST equal this step's current implementation model, including after escalation}
  - subagent_type: "sadd:judge"
```

#### 3.5 调度、验证与迭代

按顺序处理每个子任务：

```
1. Dispatch meta-judge AND implementation agent IN PARALLEL (single message, 2 tool calls):
   Tool call 1 (meta-judge — MUST be first):
     Use Task tool:
       - description: "Meta-judge Step {N}/{total}: {subtask_name}"
       - prompt: {meta-judge prompt with step requirements and context}
       - model: {meta-judge model — the user's `--model` if one was passed; otherwise the same tier as this step's implementation, or one tier up per Role Pairing}
       - subagent_type: "sadd:meta-judge"

   Tool call 2 (implementation):
     Use Task tool:
       - description: "Step {N}/{total}: {subtask_name}"
       - prompt: {constructed prompt with CoT + task + previous context + self-critique}
       - model: {implementation model — the user's `--model` if one was passed; otherwise the model selected for this step}
       - subagent_type: "{selected agent type}"

2. Wait for BOTH to complete. Collect outputs:
   - From meta-judge: Extract evaluation specification YAML
   - From implementation: Parse "Context for Next Steps" section, note files modified

3. Dispatch judge sub-agent (with this step's meta-judge specification):
   Use Task tool:
     - description: "Judge Step {N}/{total}: {subtask_name}"
     - prompt: {judge verification prompt with step requirements, implementation output, and meta-judge specification YAML}
     - model: {judge model — the user's `--model` if one was passed; otherwise MUST equal this step's current implementation model, including after escalation}
     - subagent_type: "sadd:judge"

4. Parse judge verdict (DO NOT read full report):
   Extract from judge reply:
   - VERDICT: PASS or FAIL
   - SCORE: X.X/5.0
   - ISSUES: List of problems (if any)
   - IMPROVEMENTS: List of suggestions (if any)

5. Decision based on verdict:

   If score ≥4.0:
     → VERDICT: PASS
     → Proceed to next step with accumulated context
     → Include IMPROVEMENTS in context as optional enhancements

   If 3.0 ≤ score <4.0 and NOT STRICT_MODE:
     → Apply the Iteration Discretion Rule (3.6)
       → accepted → VERDICT: PASS (report outstanding issues and proceed)
       → declined → VERDICT: FAIL → go to "Check retry count" below

   Otherwise (score <3.0, or score <4.0 with STRICT_MODE):
     → VERDICT: FAIL
     → Check retry count for this step

     If retries < 3:
       → Decide this step's retry tier per "3.5.1 Model Escalation on Retry" below
         (per the Escalation Rule — bump BOTH, unless its sole hold exception applies)
       → Dispatch retry implementation agent at that tier with:
         - Original step requirements
         - Judge's ISSUES list as feedback
         - Path to judge report for details
         - Instruction to fix specific issues
       → Return to judge verification with SAME meta-judge specification from this step,
         dispatching the judge at the retry tier (judge always matches implementation)
       → Do NOT re-run meta-judge for retries, and do NOT re-tier it

     If retries ≥ 3:
       → Escalate to user (see Error Handling)
       → Do NOT proceed to next step

6. Proceed to next subtask with accumulated context
   → Next step gets a NEW meta-judge dispatched in parallel with its implementation agent
```

##### 3.5.1 重试时的模型升级

在分派任何重试之前，你必须根据[升级规则](#escalation-rule)明确决定此步骤的层级，并在步骤报告中说明该决定——该规则完整适用，包括其中唯一的保持层级例外。在此基础上，还需遵循以下针对重试的约束：

- 此处的**触发条件 (1) 明确为 `score < 3.0`**（或者问题表明模型误解了该步骤，而不只是遗漏了细节）。
- 重试的评审必须使用与重试实现相同的层级进行分派；该步骤的元评审既不重新运行，也不重新确定层级。
- 升级后的层级**仅适用于此步骤的剩余尝试**——下一个步骤将根据[阶段 2](#phase-2-model-selection-for-each-subtask)从头重新评估。
- 如果 `opus` 仍然失败，则根据[错误处理](#if-step-fails-after-max-retries)升级给用户处理。

**实现代理的重试提示词模板：**

```markdown
## Retry Required: Step {N}/{total}

Your previous implementation did not pass judge verification.

<original_requirements>
{subtask_description}
</original_requirements>

<judge_feedback>
VERDICT: FAIL
SCORE: {score}/5.0
ISSUES:
{list of issues from judge}

Full report available at: {path_to_judge_report}
</judge_feedback>

<your_previous_output>
{files modified in previous attempt}
</your_previous_output>

Instructions:
Let's fix the identified issues step by step.

1. First, review each issue the judge identified
2. For each issue, determine the root cause
3. Plan the fix for each issue
4. Implement ALL fixes
5. Verify your fixes address each issue
6. Provide updated "Context for Next Steps" section

CRITICAL: Focus on fixing the specific issues identified. Do not rewrite everything.
```

#### 3.6 迭代裁量规则

你的主要任务是在目标质量范围内完成任务，并且迭代工作量必须与每个步骤的规模相称。以下两种失败模式同样真实存在：

- 将重试次数和上下文耗费在吹毛求疵的问题上，导致整体任务始终无法完成 → **任务失败**。
- 接受一个质量确实太差、无法视为已完成的步骤 → **更严重的失败**。

对每个评审分数应用以下规则：

- **`score < 3.0` → 无条件失败。不得裁量。** 根据评审反馈进行重试，直到该步骤通过或达到最大重试次数。
- **`3.0 <= score < 4.0` → 裁量区间。** 只有在此区间内，你才可以决定接受一个未达到 `4.0` 目标的步骤。固定的 `4.0` 目标将实际下限设为 `3.0`，因此无需另设有界降级防护规则。
- 在此区间内，当未解决的问题仅为低/中优先级（任何高或严重级别的问题都会完全取消裁量权），并且其中没有任何问题违反该步骤的目标要求或造成实质性缺陷（即这些问题只是吹毛求疵）时，你必须先进行推理——在分派重试之前——判断再次尝试是否值得付出时间和上下文成本。
- **由吹毛求疵问题驱动的重试最多一次**，并且该次重试计入重试预算。如果重试后仍然只出现吹毛求疵的问题，你必须将该步骤标记为通过（`ACCEPTED`），将未解决的问题记录到累积上下文中，在最终摘要中报告这些问题，然后继续下一个步骤。如果重试后的分数低于 `3.0`，则改为应用无条件失败规则。
- 你必须严格评判，不能宽松。未达到目标就停止必须是一项有意为之的决定，其依据是不存在真正违反要求的问题——后续步骤会基于此步骤继续构建。如果某个真正的阻塞性问题导致无法在最大重试次数内完成该步骤，则必须将其升级为失败，绝不能掩饰过去。
- **如果 `STRICT_MODE` 为 true，则整条规则均被禁用**：仅当 `score >= 4.0` 或达到最大重试次数时才停止。`--strict` 不会改变其他任何行为——`4.0` 目标、最大重试次数、`< 3.0` 无条件失败规则以及元评审/评审分派均不受影响。

### 阶段 4：最终总结与报告

所有子任务完成并通过验证后，回复一份综合报告：

```markdown
## Sequential Execution Summary

**Overall Task:** {original task description}
**Total Steps:** {count}
**Total Agents:** {meta_judges(one per step) + implementation_agents + judge_agents + retry_agents}
**Strict Mode:** {STRICT_MODE}

### Step-by-Step Results

| Step | Subtask | Model | Judge Score | Retries | Status |
|------|---------|-------|-------------|---------|--------|
| 1 | {name} | {model} | {X.X}/5.0 | {0-3} | PASS |
| 2 | {name} | {model} | {X.X}/5.0 | {0-3} | PASS |
| ... | ... | ... | ... | ... | ... |

Status is `PASS` (score >= 4.0), `ACCEPTED` (below target per the [Iteration Discretion Rule](#36-iteration-discretion-rule) — list the outstanding nitpicks under Follow-up Recommendations), or `FAILED`.

**Model** is the tier the step finished at; when [escalation](#351-model-escalation-on-retry) fired, record it as `{starting tier} → {final tier}`.

### Files Modified (All Steps)
- {file1}: {what changed, which step}
- {file2}: {what changed, which step}
...

### Key Decisions Made
- Step 1: {decision and rationale}
- Step 2: {decision and rationale}
...

### Integration Points
{How the steps connected and built upon each other}

### Judge Verification Summary
| Step | Initial Score | Final Score | Issues Fixed |
|------|---------------|-------------|--------------|
| 1 | {X.X} | {X.X} | {count or "None"} |
| 2 | {X.X} | {X.X} | {count or "None"} |

### Meta-Judge Specifications
One evaluation specification generated per step (in parallel with implementation), reused across retries within each step.


### Follow-up Recommendations
{Any improvements suggested by judges, tests to run, or manual verification needed}
```

## 错误处理

### 如果裁判验证失败（分数 <4.0）

经裁判验证的迭代循环会自动处理大多数失败情况（仅当[迭代裁量规则](#36-iteration-discretion-rule)拒绝接受时，`3.0..4.0` 范围内的分数才会被视为 FAIL）：

```
Judge FAIL (Retry Available):
  1. Parse ISSUES from judge verdict
  2. Dispatch retry implementation agent with feedback
  3. Re-verify with judge (using same step's meta-judge specification — do NOT re-run meta-judge)
  4. Repeat until PASS or max retries (3)
```

### 如果步骤在达到最大重试次数后仍然失败

当某个步骤连续三次未通过裁判验证时：

1. **停止** - 不要在基础存在问题的情况下继续
2. **报告** - 提供失败分析：
   - 原始步骤要求
   - 所有裁判结论和分数
   - 多次重试后仍然存在的问题
3. **升级** - 向用户提供以下选项：
   - 提供额外的上下文/指导以供重试
   - 使用更高一级的模型层级重新运行此步骤（如果该步骤已达到 `opus`，则省略此选项）
   - 修改步骤要求
   - 跳过该步骤（如果为可选步骤）
   - 中止并报告部分进展
4. **等待** - 未经用户决定，不得继续

**升级报告格式：**

```markdown
## Step {N} Failed Verification (Max Retries Exceeded)

### Step Requirements
{subtask_description}

### Verification History
| Attempt | Score | Key Issues |
|---------|-------|------------|
| 1 | {X.X}/5.0 | {issues} |
| 2 | {X.X}/5.0 | {issues} |
| 3 | {X.X}/5.0 | {issues} |
| 4 | {X.X}/5.0 | {issues} |

### Persistent Issues
{Issues that appeared in multiple attempts}

### Judge Reports
- .specs/reports/{task-name}-step-{N}-attempt-1.md
- .specs/reports/{task-name}-step-{N}-attempt-2.md
- .specs/reports/{task-name}-step-{N}-attempt-3.md
- .specs/reports/{task-name}-step-{N}-attempt-4.md

### Options
1. **Provide guidance** - Give additional context for another retry
2. **Escalate the tier** - Re-run this step's implementation and judge one tier up (omit this option if the step already reached `opus`)
3. **Modify requirements** - Simplify or clarify step requirements
4. **Skip step** - Mark as skipped and continue (if non-critical)
5. **Abort** - Stop execution and preserve partial progress

Awaiting your decision...
```

**绝不要：**

- 在达到最大重试次数后，仍越过失败的步骤继续执行
- 为了“节省时间”而跳过评审验证
- 忽略多次重试中持续存在的问题
- 对哪些内容可能已经生效作出假设

### 如果上下文缺失

1. **不要猜测**前序步骤生成了什么
2. **重新检查**前序步骤的输出，查找缺失的信息
3. **检查评审报告**——其中可能已经指出缺失的元素
4. 如有需要，**派遣澄清子代理**以提取缺失的上下文
5. **更新上下文传递方式**，以供未来的类似任务使用

### 如果步骤发生冲突

1. 在冲突点**停止执行**
2. **分析：**任务分解是否有误？这些步骤实际上是否存在依赖关系？
3. **检查评审反馈**——评审可能已经指出集成问题
4. **选项：**
   - 如果遗漏了依赖关系，则重新排列步骤
   - 将相互冲突的步骤合并为一个步骤
   - 在相互冲突的步骤之间添加协调步骤

## 示例

### 示例 1：相互承接的顺序步骤（基于前序步骤中已存在的更改）

**输入：**

```
/do-in-steps implement user management feature
```

**阶段 1——分解：**

| 步骤 | 子任务 | 依赖于 | 复杂度 | 类型 | 输出 |
|------|---------|------------|------------|------|--------|
| 1 | 创建 User 模型和数据库架构 | - | 中等 | 实现 | User 模型、迁移文件 |
| 2 | 为用户添加 CRUD 端点 | 步骤 1 | 中等 | 实现 | REST API 路由、控制器 |
| 3 | 添加身份验证集成 | 步骤 1、2 | 高 | 实现 | 身份验证中间件、JWT 处理 |

**阶段 2——模型选择：**

| 步骤 | 子任务 | 模型 | 理由 |
|------|---------|-------|-----------|
| 1 | 创建 User 模型和架构 | sonnet | 按既有模式编写代码；全新的 `users` 表可回滚，因此不会触发不可逆迁移条件 |
| 2 | 添加 CRUD 端点 | sonnet | 在单个模块中编写代码；“添加到公共 API”**不在**详尽的关键事项列表中 |
| 3 | 添加身份验证集成 | opus | 使用 opus 理据充分——身份验证（JWT 签发和路由保护）触发了关键条件 |

**阶段 3 - 执行并累积既有变更：**

```
Step 1: Create User model and database schema
  Parallel dispatch: Meta-judge + Implementation
  Judge Verification (with step 1 meta-judge spec):
    NOTE: No pre-existing changes — this is step 1 with no prior session tasks.
    The "Pre-existing Changes" section is OMITTED from the judge prompt.

    Judge prompt sent:
    ┌─────────────────────────────────────────────────────────
    │ You are evaluating Step 1/3: Create User model and
    │ database schema against an evaluation specification
    │ produced by the meta judge.
    │
    │ CLAUDE_PLUGIN_ROOT=...
    │
    │ ## Original Task
    │ Implement user management feature
    │
    │ ## Step Requirements
    │ Create User model and database schema with proper
    │ fields and relationships.
    │
    │ ## Previous Steps Context
    │ None (first step)
    │
    │ ## Evaluation Specification
    │ ```yaml
    │ {meta-judge's evaluation specification YAML}
    │ ```
    │
    │ ## Implementation Output
    │ Files: src/models/User.ts (new), migrations/001_create_users.ts (new)
    │ Key changes: Created User model with id, email, name, passwordHash...
    │
    │ ## Instructions
    │ Follow your full judge process...
    └─────────────────────────────────────────────────────────

  → Judge (Sonnet — same tier as implementation): PASS, SCORE: 4.2/5.0
  → Context passed forward: User model fields, migration file paths

Step 2: Add CRUD endpoints for users
  Parallel dispatch: Meta-judge + Implementation (both Sonnet)
  Judge Verification (with step 2 meta-judge spec):
    NOTE: Pre-existing changes detected — Step 1 created the User model.
    Include "Pre-existing Changes" section so the judge does not confuse
    Step 1's files with Step 2's implementation work.

    Judge prompt sent:
    ┌─────────────────────────────────────────────────────────
    │ You are evaluating Step 2/3: Add CRUD endpoints for
    │ users against an evaluation specification produced by
    │ the meta judge.
    │
    │ CLAUDE_PLUGIN_ROOT=...
    │
    │ ## Original Task
    │ Implement user management feature
    │
    │ ## Step Requirements
    │ Add CRUD endpoints (create, read, update, delete) for
    │ user management with proper validation and error handling.
    │
    │ ## Previous Steps Context
    │ Step 1 created User model with fields: id, email, name,
    │ passwordHash, createdAt, updatedAt.
    │
    │ ## Pre-existing Changes (Context Only)
    │
    │ The following changes were made BEFORE the current
    │ step's implementation agent started working. They are
    │ NOT part of the current step's output. Focus your
    │ evaluation on the current step's changes. Only verify
    │ pre-existing changed files/logic if they directly
    │ relate to the current step's requirements.
    │
    │ ### Step 1: "Create User model and database schema"
    │ The following files were created as part of Step 1:
    │ - src/models/User.ts (new) - User model with fields:
    │   id, email, name, passwordHash, createdAt, updatedAt
    │ - migrations/001_create_users.ts (new) - Database
    │   migration for users table
    │
    │ These files exist in the codebase and may be referenced
    │ by the current step, but evaluate only the changes made
    │ by Step 2's implementation agent.
    │
    │ ## Evaluation Specification
    │ ```yaml
    │ {meta-judge's evaluation specification YAML}
    │ ```
    │
    │ ## Implementation Output
    │ Files: src/controllers/UserController.ts (new),
    │        src/routes/users.ts (new), src/app.ts (modified)
    │ Key changes: Added REST endpoints for user CRUD...
    │
    │ ## Instructions
    │ Follow your full judge process...
    └─────────────────────────────────────────────────────────

  → Judge (Sonnet — same tier as implementation): PASS, SCORE: 4.4/5.0
  → Context passed forward: API routes, controller patterns

Step 3: Add authentication integration
  Parallel dispatch: Meta-judge + Implementation (both Opus — critical trigger)
  Judge Verification (with step 3 meta-judge spec):
    NOTE: Pre-existing changes include BOTH Step 1 AND Step 2.
    The judge needs to know about all prior steps' output.

    Judge prompt sent:
    ┌─────────────────────────────────────────────────────────
    │ You are evaluating Step 3/3: Add authentication
    │ integration against an evaluation specification
    │ produced by the meta judge.
    │
    │ CLAUDE_PLUGIN_ROOT=...
    │
    │ ## Original Task
    │ Implement user management feature
    │
    │ ## Step Requirements
    │ Add JWT-based authentication with login/register
    │ endpoints and middleware for protecting user routes.
    │
    │ ## Previous Steps Context
    │ Step 1 created User model. Step 2 added CRUD endpoints
    │ at /api/users with UserController.
    │
    │ ## Pre-existing Changes (Context Only)
    │
    │ The following changes were made BEFORE the current
    │ step's implementation agent started working. They are
    │ NOT part of the current step's output. Focus your
    │ evaluation on the current step's changes. Only verify
    │ pre-existing changed files/logic if they directly
    │ relate to the current step's requirements.
    │
    │ ### Step 1: "Create User model and database schema"
    │ - src/models/User.ts (new) - User model with fields:
    │   id, email, name, passwordHash, createdAt, updatedAt
    │ - migrations/001_create_users.ts (new) - Database
    │   migration for users table
    │
    │ ### Step 2: "Add CRUD endpoints for users"
    │ - src/controllers/UserController.ts (new) - REST
    │   controller with create, read, update, delete handlers
    │ - src/routes/users.ts (new) - Express router for
    │   /api/users endpoints
    │ - src/app.ts (modified) - Registered user routes
    │
    │ These files exist in the codebase and may be modified
    │ by the current step, but evaluate only the changes made
    │ by Step 3's implementation agent.
    │
    │ ## Evaluation Specification
    │ ```yaml
    │ {meta-judge's evaluation specification YAML}
    │ ```
    │
    │ ## Implementation Output
    │ Files: src/auth/AuthMiddleware.ts (new),
    │        src/routes/auth.ts (new), src/app.ts (modified),
    │        src/routes/users.ts (modified)
    │ Key changes: Added JWT auth with login/register...
    │
    │ ## Instructions
    │ Follow your full judge process...
    └─────────────────────────────────────────────────────────

  → Judge (Opus — same tier as implementation): PASS, SCORE: 4.1/5.0
```

**最终总结：**

- Agent 总数：10（3 个元评审 + 3 个实现 Agent + 0 次重试 + 3 个评审）
- 预先存在的更改演进：
  - 第 1 步评审：无
  - 第 2 步评审：第 1 步输出（2 个文件）
  - 第 3 步评审：第 1+2 步输出（5 个文件）
- 所有评审得分：4.2、4.4、4.1

---

### 示例 2：用户修改过的代码库 + 顺序执行的步骤（混合来源的预先存在更改）

**场景：**

在对话期间，用户一直在开发一个支付处理模块。在调用 do-in-steps 之前，他们修改了多个文件（添加了新的 PaymentGateway 接口并更新了配置）。

**输入：**

```
/do-in-steps fix and improve payment processing
```

**阶段 1 - 分解：**

| 步骤 | 子任务 | 依赖项 | 复杂度 | 类型 | 输出 |
|------|---------|------------|------------|------|--------|
| 1 | 修复支付验证缺陷 | - | 中等 | 缺陷修复 | 修正后的验证逻辑 |
| 2 | 为失败的支付添加重试逻辑 | 第 1 步 | 高 | 实现 | 带退避机制的重试功能 |

**阶段 2 - 模型选择：**

| 步骤 | 子任务 | 模型 | 理由 |
|------|---------|-------|-----------|
| 1 | 修复支付验证缺陷 | opus | opus 是合理选择——范围虽小，但优先级使关键性高于规模：支付位于关键事项列表中 |
| 2 | 为失败的支付添加重试逻辑 | opus | opus 是合理选择——支付（关键事项）加上围绕资金流转的重试/退避时序（复杂逻辑） |

两个步骤都采用 `opus`，是因为其*领域*足以支持这一选择，而不是因为整个执行过程如此——有关混合使用不同层级模型的链，请参见示例 3。

**阶段 3 - 使用混合来源的预先存在更改执行：**

```
Step 1: Fix payment validation bugs
  Parallel dispatch: Meta-judge + Implementation (both Opus — critical trigger)
  Judge Verification (Opus, with step 1 meta-judge spec):
    NOTE: Pre-existing changes detected from USER modifications.
    The user modified payment files before this task — include those
    so the judge focuses only on the bug fix, not the user's prior work.

    Judge prompt sent:
    ┌─────────────────────────────────────────────────────────
    │ You are evaluating Step 1/2: Fix payment validation
    │ bugs against an evaluation specification produced by
    │ the meta judge.
    │
    │ CLAUDE_PLUGIN_ROOT=...
    │
    │ ## Original Task
    │ Fix and improve payment processing
    │
    │ ## Step Requirements
    │ Fix validation bugs in payment amount and currency
    │ checks that allow invalid transactions to proceed.
    │
    │ ## Previous Steps Context
    │ None (first step)
    │
    │ ## Pre-existing Changes (Context Only)
    │
    │ The following changes were made BEFORE the current
    │ step's implementation agent started working. They are
    │ NOT part of the current step's output. Focus your
    │ evaluation on the current step's changes. Only verify
    │ pre-existing changed files/logic if they directly
    │ relate to the current step's requirements.
    │
    │ ### User modifications (before current task)
    │ The user made changes to the following files/modules
    │ before this task was started:
    │ - src/payments/PaymentGateway.ts (new) - Payment
    │   gateway interface definition
    │ - src/payments/StripeAdapter.ts (modified) - Updated
    │   to implement new PaymentGateway interface
    │ - src/config/payment.config.ts (modified) - Added
    │   gateway configuration settings
    │
    │ The current task focuses on fixing validation bugs.
    │ Pre-existing changes to payment files may overlap with
    │ the current step's scope — evaluate whether the
    │ implementation agent's changes correctly fix the bugs
    │ without breaking the pre-existing modifications.
    │
    │ ## Evaluation Specification
    │ ```yaml
    │ {meta-judge's evaluation specification YAML}
    │ ```
    │
    │ ## Implementation Output
    │ Files: src/payments/PaymentValidator.ts (modified),
    │        tests/payments/PaymentValidator.test.ts (modified)
    │ Key changes: Fixed amount validation to reject negative
    │ values, added currency code format check...
    │
    │ ## Instructions
    │ Follow your full judge process...
    └─────────────────────────────────────────────────────────

  → VERDICT: PASS, SCORE: 4.3/5.0
  → Context passed forward: Validation fixes, affected files

Step 2: Add retry logic for failed payments
  Parallel dispatch: Meta-judge + Implementation (both Opus — critical trigger)
  Judge Verification (Opus, with step 2 meta-judge spec):
    NOTE: Pre-existing changes now include BOTH the user's modifications
    AND Step 1's output. The judge needs both sources to correctly
    attribute changes.

    Judge prompt sent:
    ┌─────────────────────────────────────────────────────────
    │ You are evaluating Step 2/2: Add retry logic for failed
    │ payments against an evaluation specification produced by
    │ the meta judge.
    │
    │ CLAUDE_PLUGIN_ROOT=...
    │
    │ ## Original Task
    │ Fix and improve payment processing
    │
    │ ## Step Requirements
    │ Add retry mechanism with exponential backoff for failed
    │ payment transactions, with configurable max retries.
    │
    │ ## Previous Steps Context
    │ Step 1 fixed payment validation bugs in
    │ PaymentValidator.ts (amount and currency checks).
    │
    │ ## Pre-existing Changes (Context Only)
    │
    │ The following changes were made BEFORE the current
    │ step's implementation agent started working. They are
    │ NOT part of the current step's output. Focus your
    │ evaluation on the current step's changes. Only verify
    │ pre-existing changed files/logic if they directly
    │ relate to the current step's requirements.
    │
    │ ### User modifications (before current task)
    │ - src/payments/PaymentGateway.ts (new) - Payment
    │   gateway interface definition
    │ - src/payments/StripeAdapter.ts (modified) - Updated
    │   to implement new PaymentGateway interface
    │ - src/config/payment.config.ts (modified) - Added
    │   gateway configuration settings
    │
    │ ### Step 1: "Fix payment validation bugs"
    │ - src/payments/PaymentValidator.ts (modified) - Fixed
    │   amount validation and currency code format checks
    │ - tests/payments/PaymentValidator.test.ts (modified) -
    │   Added regression tests for validation fixes
    │
    │ These files exist in the codebase and may be modified
    │ by the current step, but evaluate only the changes made
    │ by Step 2's implementation agent.
    │
    │ ## Evaluation Specification
    │ ```yaml
    │ {meta-judge's evaluation specification YAML}
    │ ```
    │
    │ ## Implementation Output
    │ Files: src/payments/PaymentRetryService.ts (new),
    │        src/payments/StripeAdapter.ts (modified),
    │        src/config/payment.config.ts (modified),
    │        tests/payments/PaymentRetryService.test.ts (new)
    │ Key changes: Added PaymentRetryService with exponential
    │ backoff, integrated into StripeAdapter...
    │
    │ ## Instructions
    │ Follow your full judge process...
    └─────────────────────────────────────────────────────────

  → VERDICT: PASS, SCORE: 4.5/5.0
```

**最终总结：**

- 智能体总数：7（2 个元评审 + 2 个实现 + 0 次重试 + 2 个评审）
- 预先存在的更改演进：
  - 第 1 步评审：用户修改（3 个文件）
  - 第 2 步评审：用户修改（3 个文件）+ 第 1 步输出（2 个文件）
- 所有评审得分：4.3、4.5

---

### 示例 3：带升级机制的多文件重构

**输入：**

```
/do-in-steps Rename 'userId' to 'accountId' across the codebase - this affects interfaces, implementations, and callers
```

**阶段 1——分解：**

| 步骤 | 子任务 | 依赖项 | 复杂度 | 类型 | 输出 |
|------|---------|------------|------------|------|--------|
| 1 | 更新接口定义 | - | 高 | 重构 | 已更新的接口 |
| 2 | 更新这些接口的实现 | 第 1 步 | 低 | 重构 | 已更新的实现 |
| 3 | 更新调用方和使用方 | 第 2 步 | 低 | 重构 | 已更新的调用方文件 |
| 4 | 更新测试 | 第 3 步 | 低 | 测试 | 已更新的测试文件 |
| 5 | 更新文档 | 第 4 步 | 低 | 文档 | 已更新的文档 |

**阶段 2——模型选择：**

| 步骤 | 子任务 | 模型 | 理由 |
|------|---------|-------|-----------|
| 1 | 更新接口 | opus | opus 是应得的——共享契约发生更改，无论涉及多少文件，这都是一个 `opus` 触发条件 |
| 2 | 更新实现 | haiku | 机械式广度特例：逐文件重复一次规则驱动的重命名，并根据单次出现进行分级 |
| 3 | 更新调用方 | haiku | 同一特例——机械式重命名，不涉及逻辑或契约更改 |
| 4 | 更新测试 | haiku | 与重命名对应的机械式测试修复 |
| 5 | 更新文档 | haiku | 单一用途的文本修正，不涉及代码 |

**阶段 3——带升级机制的执行（每个步骤均并行运行元评审和实现）：**

```
Step 1: Update interfaces
  Parallel dispatch: Meta-judge + Implementation (both Opus — shared contract change)
  → Judge (Opus, sadd:judge, with step 1 meta-judge spec): PASS, 4.3/5.0

Step 2: Update implementations
  Parallel dispatch: Meta-judge + Implementation (both Haiku)
    NOTE: Step 1's opus tier does NOT carry forward — Step 2 is tiered on
    its own merits (mechanical rename).
  → Judge (Haiku, sadd:judge, with step 2 meta-judge spec): PASS, 4.0/5.0

Step 3: Update callers (Problem Detected — model escalation within the step)
  Parallel dispatch: Meta-judge (Haiku) + Implementation (Haiku)
  Attempt 1 (Haiku impl + Haiku judge): Judge FAIL, 2.5/5.0
    → ISSUES: Missed 12 occurrences in legacy module
    → score < 3.0 → trigger (1) fires. Missed occurrences read as a capability
      gap, not a narrow fixable defect, so the sole hold exception does not
      apply → mandatory bump: haiku → sonnet.
      Meta-judge NOT re-run, NOT re-tiered — same spec reused.
  Attempt 2 (Sonnet impl + Sonnet judge, same step 3 meta-judge spec): FAIL, 2.8/5.0
    → ISSUES: Still missing 4 occurrences, found new deprecated API usage
    → still < 3.0 → still a capability gap, not a narrow fixable defect →
      mandatory bump again: sonnet → opus
  Attempt 3 (Opus impl + Opus judge, same spec): FAIL, 3.2/5.0
    → ISSUES: 2 occurrences in dynamically generated code
    → at the `opus` ceiling — no bump available regardless of the hold
      exception; retry at `opus` with exact feedback.
  Attempt 4 (Opus impl + Opus judge, same spec): FAIL, 3.3/5.0
    → ISSUES: Dynamic code generation still not fully addressed

  ESCALATION TO USER:
  "Step 3 failed after 4 attempts (haiku → sonnet → opus). Persistent issue:
   Dynamic code generation in LegacyAdapter.ts generates 'userId' at runtime.
   Options: 1) Provide guidance, 2) Modify requirements, 3) Skip, 4) Abort"
  (Tier escalation is NOT offered as an option — already at the opus ceiling.)

  User response: "Update LegacyAdapter to use string template with accountId"

  Attempt 5 (with user guidance, Opus, same step 3 meta-judge spec): Judge PASS, 4.1/5.0

Step 4-5: Each with parallel meta-judge + implementation, complete without issues
  NOTE: Step 3's escalation to opus is scoped to Step 3. Steps 4 and 5 are
  re-assessed from scratch and both run at Haiku.
```

智能体总数：20（5 个元评审智能体 + 5 个实现智能体 + 5 个重试智能体 + 5 个评审智能体）

---

## 最佳实践

### 任务分解

- **明确具体：** 每个子任务都应有清晰、可验证的结果
- **定义验证点：** 评审智能体应检查每个步骤的哪些内容？
- **尽量减少步骤：** 合并相关工作；不要过度分解
- **验证依赖关系：** 确保每个步骤都能从之前的步骤中获得所需内容
- **规划上下文：** 确定步骤之间需要传递哪些上下文

### 模型选择

相关规则以[模型选择策略](#model-selection-policy)为准；以下习惯有助于确保这些规则得到落实：

- **每个步骤都要明确说明理由** - 在分派每个步骤之前，说明其范围、复杂度和风险，以及由此确定的层级；这是整个运行过程中影响最大的决策
- **`opus` 必须凭实力获得，绝不能作为保险选择** - 对于每个重叠或难分高下的情况，都应按照[选择规则](#selection-rules)中的优先顺序和决胜规则来决定，绝不能凭直觉
- **根据每个步骤自身的实际情况确定层级** - 一条任务链可以混用不同层级；相邻步骤的层级（或升级后的层级）不能作为当前步骤的判断依据
- **各角色统一使用同一层级** - 仅在步骤并非显而易见时提高标准制定者（元评审智能体）的层级（参见[角色配对](#role-pairing)）
- **根据证据升级** - 当某次尝试的层级明显过低，或用户对质量提出投诉时（参见[升级规则](#escalation-rule)），仅针对失败的步骤进行升级

### 上下文传递指南

| 场景 | 应传递的内容 | 应省略的内容 |
|----------|--------------|--------------|
| 在步骤 1 中定义接口 | 完整的接口定义 | 实现细节 |
| 在步骤 2 中进行实现 | 关键模式、文件位置 | 内部逻辑 |
| 在步骤 3 中进行集成 | 使用模式、入口点 | 步骤 2 的内部细节 |
| 为重试提供评审反馈 | ISSUES 列表、报告路径 | 报告的完整内容 |

**保持上下文聚焦：**

- 传递下一步骤在前一步基础上开展工作时所必需的内容
- 省略不会影响后续步骤的内部细节
- 突出显示应保持一致的模式/约定
- 将评审智能体的 IMPROVEMENTS 作为可选增强项包含在内
- **跟踪既有变更** - 向评审智能体传递先前修改（包括之前步骤所做修改）的相关上下文，以避免归因混淆

### 元评审智能体 + 评审智能体验证

- **绝不能跳过元评审智能体** - 定制化评估标准能够带来比通用标准更好的评审效果
- **每个步骤配备一个元评审智能体** - 每个步骤都应有自己的元评审智能体，并与实现工作并行分派
- **在同一步骤的重试中复用元评审智能体规范** - 重试时，复用该步骤的同一份元评审智能体规范；不要重新运行元评审智能体
- **每个新步骤都使用新的元评审智能体** - 不同步骤有不同要求，因此每个步骤都应配备新的元评审智能体
- **并行分派时元评审智能体优先** - 必须始终将其作为消息中的第一个工具调用
- **仅解析评审智能体输出的标题字段** - 不要读取完整报告，以免污染上下文
- **包含 CLAUDE_PLUGIN_ROOT** - 元评审智能体和评审智能体都需要解析后的插件根路径
- **元评审智能体 YAML** - 仅将元评审智能体 YAML 传递给评审智能体，不要添加任何额外文本或注释！
- **在自我审查之后：** 评审智能体审查已经通过内部验证的工作
- **独立验证：** 评审智能体与实现智能体必须是不同的智能体
- **结构化输出：** 始终从回复中解析 VERDICT/SCORE，而不是完整报告
- **最大重试次数：** 尝试 3 次后向用户升级
- **反馈循环：** 将评审智能体的 ISSUES 传递给负责重试的实现智能体
- **重试时使用同一步骤的元评审智能体规范，重新进行评审验证**

### 质量保证

- **双层验证：** 自我审查（内部）+ 评审者（外部）
- **先进行自我审查：** 实现代理在提交前验证自己的工作
- **再进行外部评审：** 独立评审者发现自我审查遗漏的盲点
- **迭代循环：** 根据反馈重试，直至通过或达到最大重试次数
- **适度迭代：** 应用[迭代裁量规则](#36-iteration-discretion-rule)——由吹毛求疵的问题驱动的重试最多一次，评分绝不低于 `3.0`，使用 `--strict` 时禁用
- **链式验证：** 评审者检查与之前步骤的集成情况
- **升级处理：** 不要越过失败的步骤继续执行——应获取用户输入
- **最终集成测试：** 所有步骤完成后，验证完整变更能否协同工作

## 上下文格式参考

### 实现代理输出格式

```markdown
## Context for Next Steps

### Files Modified
- `src/dto/UserDTO.ts` (new file)
- `src/services/UserService.ts` (modified)

### Key Changes Summary
- Created UserDTO with fields: id (string), name (string), email (string), createdAt (Date)
- UserDTO includes static `fromUser(user: User): UserDTO` factory method
- Added `toDTO()` method to User class for convenience

### Decisions That Affect Later Steps
- Used class-based DTO (not interface) to enable transformation methods
- Opted for explicit mapping over automatic serialization for better control

### Warnings for Subsequent Steps
- UserDTO does NOT include password field - ensure no downstream code expects it
- The `createdAt` field is formatted as ISO string in JSON serialization

### Verification Points
- TypeScript compiles without errors
- UserDTO.fromUser() correctly maps all User properties
- Existing service tests still pass
```

### 评审者裁决格式（结构化标头）

```markdown
---
VERDICT: PASS
SCORE: 4.2/5.0
ISSUES:
  - None
IMPROVEMENTS:
  - Consider adding input validation to fromUser() method
  - Add JSDoc comments for better IDE support
---

## Detailed Evaluation
[Evidence and analysis following meta-judge specification rubrics...]
```

### 评审者裁决格式（FAIL 示例）

```markdown
---
VERDICT: FAIL
SCORE: 2.8/5.0
ISSUES:
  - Missing User->UserDTO mapping logic in getUser() method
  - Return type annotation changed but actual return value still returns User object
  - No null handling for optional User fields
IMPROVEMENTS:
  - Add static fromUser() factory method to UserDTO
  - Implement toDTO() as instance method on User class
---
```

**关键洞见：** 对于具有依赖关系的复杂任务，顺序执行能够带来益处：每个步骤都在全新的上下文中运行，同时只接收之前步骤的相关输出。**逐步骤元评审者评估规范**可确保评估标准针对每个步骤的具体要求量身定制，同时与实现并行运行以提高速度。**外部评审者验证**能够发现自我审查遗漏的盲点，而**迭代循环**（复用同一步骤的元评审者规范）则可确保在继续执行之前达到质量要求。这可以同时防止上下文污染和错误传播。