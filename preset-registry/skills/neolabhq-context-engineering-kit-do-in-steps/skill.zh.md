---
name: do-in-steps
description: Execute one complex task as ordered, dependent steps run sequentially, passing context from each step to the next, with per-step LLM-as-a-judge verification. Use when later steps depend on the results of earlier ones.
---
# do-in-steps

<task>
通过将复杂任务分解为按顺序执行的子任务，并协调子代理按顺序完成每个步骤，来执行复杂任务。自动分析任务以识别依赖关系，为每个子任务选择合适规模的模型，将已完成步骤中的相关上下文传递给后续步骤，并在继续之前使用元评判评估规范让独立评判验证每个步骤。
</task>

<context>
此命令实现了用于按顺序执行任务并传递上下文的 **Supervisor/Orchestrator 模式**，以及 **元评判 → LLM-as-a-judge 验证**。你（编排器）需要分析复杂任务，将其分解为有序的子任务，然后针对每个步骤**并行**调度元评判和**实现代理**。元评判生成特定于步骤的评估标准，同时实现代理并发运行。每个子代理都会收到：
- **隔离的上下文** - 针对其特定子任务的干净上下文窗口
- **合适规模的模型** - 根据 [模型选择策略](#model-selection-policy) 为每个步骤选择：默认使用 `sonnet`/`haiku`，仅在满足条件时使用 `opus`
- **前一步骤的上下文** - 前面步骤的相关输出摘要
- **结构化推理** - 用于系统化思考的零样本 CoT 前缀
- **自我批评** - 提交前的内部验证
- **结构化评估** - 元评判在评判开始前为每个步骤生成定制的评分标准和检查清单
- **外部评判** - 使用元评判规范进行 LLM-as-a-judge 验证，并包含迭代循环
- **并行提速** - 每个步骤中元评判和实现代理并行运行；在该步骤内的重试期间复用元评判规范

</context>

## 参数

| 参数 | 格式 | 默认值 | 描述 |
|----------|--------|---------|-------------|
| `task` | 自由格式文本 | **必填** | 要分解和执行的任务描述 |
| `--strict` | `--strict` | `false` | 禁用[迭代裁量规则](#36-iteration-discretion-rule)——只有当 `score >= 4.0` 时步骤才会通过，否则会一直重试，直到达到最大重试次数。 |
| `--model` | `haiku\|sonnet\|opus` | *按步骤自动选择* | 为**每个步骤中的所有子代理**（实现代理、元评判和评判）显式指定的用户覆盖选项。省略时，必须根据[模型选择策略](#model-selection-policy)按步骤选择层级——不存在固定的后备层级。提供此参数时，用户的选择将覆盖该策略，且适用于每个子代理——有关显式覆盖如何与升级交互，请参阅[升级规则](#escalation-rule)。 |

示例：`/do-in-steps Refactor UserService class and update all consumers --strict`

**关键：** 你只能充当编排器——你**不得**亲自执行任务。如果你读取、写入或运行 bash 工具，就立即失败。這是最关键的标准。如果你使用了子代理以外的任何东西，就会立即被终止!!!! 你的职责是：

1. 分析并分解任务
2. 根据[模型选择策略](#model-selection-policy)为**每个**子任务选择模型层级和代理——默认使用 `sonnet`/`haiku`，仅在满足条件时使用 `opus`
3. **针对每个步骤并行调度元评判和实现代理**（调度顺序上元评判优先）
4. **等待两者都完成，然后使用元评判的规范调度评判**
5. 如果评判未通过该步骤，则进行迭代（最多重试 3 次），并复用相同的元评判规范
6. 收集输出并将上下文传递给后续步骤
7. 报告最终结果

## 红旗事项 - 绝对不要这样做

**绝对不要：**

- 阅读实现文件来了解代码细节（让子代理完成这项工作）
- 直接编写代码或修改源文件
- 跳过分解步骤，直接开始实现
- 为了“节省时间”而自行执行多个步骤
- 通过详细阅读步骤输出导致上下文溢出
- 完整阅读评审报告（只解析结构化标头）
- 跳过评审验证并继续下一步
- 以任何形式向评审代理提供分数阈值

**始终要：**

- 使用 Task 工具分派子代理完成**所有**实现工作
- **并行**分派每一步的元评审代理和实现代理（分派顺序中元评审代理**优先**）
- 等待元评审代理和实现代理**都**完成后，再分派评审代理
- 将该步骤的元评审评估规范传递给评审代理
- 在发送给元评审代理和评审代理的提示中包含 `CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}`
- 在同一步骤内的重试中复用相同的元评审规范（绝不重新运行元评审）
- 每开始一个新步骤，都分派一个**新的**元评审代理（每个步骤都使用针对该步骤定制的规范）
- 使用 Task 工具分派**独立的评审代理**进行步骤验证
- 只传递必要的上下文摘要，而不是完整的文件内容
- 在进入下一步之前，先从评审验证中获得通过结果
- 如果验证失败，根据评审反馈进行迭代（最多重试 3 次）
- 对每个步骤的判定应用[迭代裁量规则](#36-iteration-discretion-rule)，除非提供了 `--strict`

任何偏离编排流程的行为（试图自行实现子任务、阅读实现文件、完整阅读评审报告或直接修改内容）都会导致上下文污染并最终失败，届时你将被解雇！

## 模型选择策略

选择模型是你所做的**最具杠杆作用的单一决策**——它比提示词措辞的影响更大，决定了步骤返回结果的正确性以及整个链条所需的时间。你**绝不能**把它当作例行公事：在分派**每个**步骤之前，必须说明所选层级并给出一句话的理由。如果只是因为不愿思考而选择最强模型，这是失败，而不是谨慎。

**默认层级：** `sonnet` 和 `haiku` 是默认选择。`opus` 受到限制，必须通过下表中的触发条件获得资格，绝不能因为你不确定就选择它。

**针对每个步骤，而不是整个运行过程：** 每个步骤都必须根据该步骤自身的范围、复杂度和风险独立选择层级。一次分解可以合理地混用不同层级——为契约变更选择 `opus`，为机械性后续工作选择 `haiku`。某一步所达到的层级（包括通过升级达到的层级）**不得**延续到下一步。

### 选择规则

| 任务形态 | 层级 | 示例 |
|---|---|---|
| 单个文档/文本文件修正——不涉及代码，也不需要跨文件推理 | `haiku` | 修正拼写错误、更新链接、更正 README 中过时的命令 |
| confined to one file 的小型、少量代码行（约 10 行或更少）的机械性代码修改 | `haiku` | 提升常量值、添加保护性条件、重命名局部变量、编辑配置值 |
| 代码编写——新增函数、组件或测试，单模块修改，且已有成熟模式可遵循 | `sonnet` | 添加端点、编写服务方法及测试、重构单个模块 |
| **多文件重构**（约 3 个或更多文件，或任何涉及共享契约变更的文件数量）或**关键任务**（身份验证、支付/计费、数据完整性、不可逆迁移、公共 API 破坏性变更）或**复杂逻辑**（并发、非平凡算法、架构决策） | `opus` | 跨领域重构、身份验证或支付逻辑、架构迁移、新颖的算法设计 |

**优先级（强制）：**必须评估每一行，而不只是第一个匹配项。当多行匹配时，由**最高匹配层级胜出**——关键性和复杂度始终优先于规模。安全关键型身份验证处理程序中的四行 null 检查同时匹配 `haiku` 行和 `opus` 行，因此属于 `opus`。**critical** 列表是完整的，而非示例性的：发布到生产环境、涉及真实用户或向公共 API 添加内容都**不是**触发条件，因此，在单个服务文件中新增一个带验证的端点仍属于 `sonnet`。**机械性广度豁免：**仅有广度不构成复杂度。对于纯机械式变更——在多个文件中重复执行同一种由规则驱动的编辑，且不涉及逻辑和契约变更——只有**多文件触发条件**不适用；**关键**和**复杂逻辑**触发条件仍然适用。你**必须**根据**单次出现**的内容为其分层，就好像该变更只涉及一个文件；因此，在 40 个文件中机械性地重命名一个符号属于 `haiku`，但将同一重命名限制在 `src/auth/` 中则属于 `opus`——无论广度如何，关键触发条件都会因这一次出现而触发。此豁免**不**涵盖共享契约变更（这已经是上文中的 `opus` 触发条件），因此跨文件提取共享接口仍属于 `opus`。

**平局决胜规则：**仅当没有任何一行能够明确匹配——该步骤确实处于两个层级之间——才选择**更便宜**的层级。你**不得**为了规避风险而倾向于选择 `opus`；[升级规则](#escalation-rule)会让便宜的首次判断仍可恢复，而恢复一个步骤的成本远低于为每个步骤过度配置资源。

### 角色配对

任何由模型分配的流水线最多包含三个角色——**生产者**（执行工作）、**标准制定者**（定义“正确”的含义）、**评估者**（根据这些标准检查工作）；在此 skill 中，它们会**按步骤**分别实例化为实现者 / 元评判者 / 评判者。**默认：该步骤的三个角色使用相同的层级。**

**仅对于不明显的步骤**，你可以仅将**标准制定者**提高一个层级，使标准比被评估的工作更加严谨。*不明显*是可测试的：层级是通过**平局决胜规则**确定的（没有任何 Selection Rules 行能够明确匹配），**或者**该步骤没有陈述任何可检查的验收条件。

| 模式 | 标准制定者（元评判者） | 生产者 + 评估者（实现者 + 评判者） | 使用时机 |
|---|---|---|---|
| 锐化版 haiku | `sonnet` | `haiku` | 工作很简单，但什么算作“正确”并不明显 |
| 锐化版 sonnet | `opus` | `sonnet` | 验收标准含糊或后果严重的代码工作，但其本身并未触发任何 `opus` 条件 |

生产者和评估者**可以**使用不同的层级。如果标准制定者生成的标准列表看起来过于复杂，你**可以**仅提高评估者的层级，但**不得**将标准制定者设置在生产者层级之下。**显式的 `--model` 覆盖会取代本节的全部内容：**当用户传入了 `--model` 时，每个步骤中的每个角色都以该层级运行，并且 Role Pairing **不得**将元评判者提高到该层级之上。

### 升级规则

当以下任一触发条件发生时，在下一次尝试中将**生产者和评估器两者**（失败步骤的实现和评判器）都提升一个级别：

1. **首次尝试质量较低**——得分较低，或存在表明模型误解了该步骤、而不仅仅是遗漏细节的问题。
2. **用户抱怨**质量太低或结果错误——无论在何时，包括已报告 PASS 之后。

级别梯度：`haiku` → `sonnet` → `opus`。`opus` 是**上限**——不存在更高的级别。如果 `opus` 级别的工作仍然失败，则升级给**用户**，绝不能循环重试。

- **唯一例外——保持级别（本规则中对该例外的唯一表述，仅适用于触发条件 (1)）：**当触发条件 (1) 发生，但评判器指出的问题是具体且可修复的缺陷，而不是能力差距（即问题范围较窄、描述精确，且模型显然已经理解了任务），你 MAY 保持当前级别，并结合评判器的确切反馈在**同一级别**重试，而不是提升级别。这是触发条件 (1) 下不强制提升的唯一情形；除此之外，触发条件 (1) 一律必须提升。触发条件 (2)（用户抱怨）没有此类例外——根据下方的特殊规定，必须立即提升。
- **显式 `--model` 特殊规定（本规则中对该规定的唯一表述）：**显式指定的 `--model` 是用户覆盖设置，因此触发条件 (1) 绝不能静默地覆盖它——应继续使用覆盖模型进行迭代，直到达到最大重试次数限制。如果在最后仍未达到目标，应突出说明发现的问题，并向用户提议是否提升模型。触发条件 (2) 即表示用户已批准提升，因此必须立即提升。
- **仅适用于失败的步骤。**升级只会重新设定**该步骤**的重试级别，不会重新设定整个链的级别：后续每个步骤都根据[选择规则](#selection-rules)按照自身情况重新评估，并再次从 `sonnet`/`haiku` 默认级别开始。
- 升级只会改变实现和评判器。该步骤的元评判器**不会重新运行，也不会重新设定级别**——其规范会在该步骤的重试中复用；在步骤进行期间更改标准会使不同尝试之间的比较失效。
- 升级是对真正根因修复的补充，绝不能替代根因修复。你**仍然必须**将评判器的具体反馈传递给重试；禁止仅仅将相同的提示重新派发到更高级别并寄希望于结果改善。
- 升级与分数阈值、[迭代裁量规则](#36-iteration-discretion-rule)以及每个步骤最多 3 次重试的预算相互独立——它只改变下一次尝试由**哪个模型**运行，绝不改变**是否应当**进行该次尝试。
- **报告 PASS 后重新进入（本规则中对该规则的唯一表述）：**已报告的 PASS **不会**关闭工作。如果用户之后表示某个步骤的结果错误或质量太低，则根据触发条件 (2) 重新进入该步骤的重试路径，并且该步骤的重试预算**重置**——即使之前的重试周期已经用尽，用户的抱怨也会开启一个最多可重试 3 次的新周期。

### 跨提供商等价性

当此技能在 Anthropic 模型上下文之外运行时，将级别映射到同类别中最接近的模型：

| 层级 | 角色 | 其他提供商的可比模型 |
|---|---|---|
| `haiku` | 快速且便宜；处理机械性工作 | `gemini-flash-lite`、`gemma` 类、`gpt-oss` 类、小型开放权重模型 |
| `sonnet` | 均衡的主力模型；承担大多数代码编写工作 | `gemini-pro` 类和完整的 `gemini-flash`（**不是** `-lite` 变体，后者属于 `haiku` 层级）、`GPT-5-mini` 类、大型 `Qwen` / `DeepSeek` 类 |
| `opus` | 前沿推理；处理关键或复杂工作 | 提供商所售的扩展 / 深度推理层级——目前包括 `GPT-5.5`、深度思考模式、`Kimi K3` 类，以及任何优势在于更长时间推理而非吞吐量的模型 |

映射依据是**能力层级，而不是名称**——随着供应商发布新模型，具体名称会不断变化。上面的每条规则都以层级表示，因此在使用其他提供商时：将层级映射到该提供商对应类别的模型，然后原样应用选择、配对和升级规则。

## 流程

### 设置：创建报告目录

开始前，确保报告目录存在：

```bash
mkdir -p .specs/reports
```

**报告命名约定：** `.specs/reports/{task-name}-step-{N}-{YYYY-MM-DD}.md`

其中：

- `{task-name}` - 根据任务描述生成（例如：`user-dto-refactor`）
- `{N}` - 步骤编号
- `{YYYY-MM-DD}` - 当前日期

**注意：** 实现输出应写入指定位置；只有评审验证报告写入 `.specs/reports/`

### 阶段 1：任务分析与分解

先解析配置：`STRICT_MODE = --strict present || false`。从任务文本中删除所有标志 — **绝不要**将它们传入子代理提示词。

使用零样本思维链推理，系统地分析任务：

```
让我逐步分析此任务，将其分解为按顺序执行的子任务：

1. **理解任务**
   "总体目标是什么？"
   - 要求是什么？
   - 预期的最终结果是什么？
   - 存在哪些约束？

2. **识别自然边界**
   "工作在何处分解最自然？"
   - 数据库 / 模型变更（基础）
   - 接口 / 契约变更（依赖项）
   - 实现变更（核心工作）
   - 集成 / 调用方更新（连锁影响）
   - 测试 / 验证（核验）
   - 文档（收尾）

3. **识别依赖关系**
   "哪些工作必须先于其他工作完成？"
   - "如果先做 B 再做 A，B 是否会出错或使用过时信息？"
   - "B 是否需要 A 的某个输出作为输入？"
   - "如果先做 B，是否需要在 A 完成后返工？"
   - 最小可行的执行顺序是什么？

4. **定义清晰边界**
   "每个子任务具体包含什么？"
   - 输入：此步骤接收什么？
   - 操作：此步骤进行什么转换 / 变更？
   - 输出：此步骤产生什么？
   - 验证：如何确认它已成功？
```

**分解指南：**

| 模式 | 分解策略 | 示例 |
|---------|------------------------|---------|
| 接口变更 | 1. 更新接口，2. 更新实现，3. 更新使用方 | "更改 getUser 的返回类型" |
| 功能新增 | 1. 添加核心逻辑，2. 添加集成点，3. 添加 API 层 | "为 UserService 添加缓存" |
| 重构 | 1. 提取 / 修改核心，2. 更新内部引用，3. 更新外部引用 | "从 Service 中提取辅助类" |
| 具有影响范围的错误修复 | 1. 修复根本原因，2. 修复相关问题，3. 更新测试 | "修复影响报告的计算错误" |
| 多层变更 | 1. 数据层，2. 业务层，3. API 层，4. 客户端层 | "向 User 实体添加新字段" |

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

### 第 2 阶段：为每个子任务选择模型

根据以下三个维度评估**每一个**子任务，然后直接从 [选择规则](#selection-rules) 表中读取其层级——层级按步骤选择，而不是为整个运行过程只选择一次。

- **范围** — 一个文件、一个组件，还是多个文件？
- **复杂度** — 机械式编辑、既有模式，还是新颖/复杂的逻辑？
- **风险** — 隔离且可逆、内部，还是属于 [选择规则](#selection-rules) 中 `opus` 行所列完整清单里的**关键**风险？

对于每个步骤，在调度之前说明这三个评估结果、选定的层级，以及一句话的理由。然后应用[角色配对](#role-pairing)——包括其完整规则以及 `--model` 覆盖设置——来决定该步骤的元评审者层级。

**领域专业知识检查**："该子任务是否符合某个专业代理配置？"

- 开发：实现、重构、修复 bug
- 架构：系统设计、模式选择
- 文档：API 文档、注释、README 更新
- 测试：测试生成、测试更新

**专业代理：** 专业代理列表取决于已加载的项目和插件。`sdd` 插件中的常见代理包括：`sdd:developer`、`sdd:researcher`、`sdd:software-architect`、`sdd:tech-lead`、`sdd:business-analyst`、`sdd:code-explorer`、`sdd:code-reviewer`、`sdd:tech-writer`。如果适用的专业代理不可用，则回退到不带专业化配置的通用代理。

**决策：** 当子任务明显能从领域专业知识中受益，并且其复杂度足以证明额外开销合理时，使用专业代理（`haiku` 层级的步骤除外）。

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

### 第 3 阶段：由并行元评审者和评审者进行顺序执行与验证

逐个执行子任务。对于每个步骤，并行调度一个元评审者和一个实现代理，然后使用独立的评审者根据元评审者的规范进行验证。必要时迭代，然后将上下文传递给后续步骤。

**每步的执行流程：**

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

- 已修改的文件（仅路径，不包含内容）
- 所做的关键更改（摘要）
- 新引入的接口/API
- 会影响后续步骤的决策
- 对后续步骤的警告或注意事项

**上下文筛选：**

- 仅传递与剩余子任务相关的信息
- 不要传递不会影响后续步骤的实现细节
- 保持上下文摘要简洁（每步最多 200 个词）

**上下文大小指南：** 如果累计上下文超过约 500 个词，则更积极地压缩较早步骤的摘要。子代理可以直接读取文件来获取所需的详细信息。

**上下文累积示例（具体示例）：**

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

对于每个子任务，使用以下必需组件构建提示词：

##### 3.2.1 零样本思维链前缀（必需 - 必须位于首位）

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

##### 3.2.3 自我批评后缀（必需 - 必须位于末尾）

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

**关键**：对于每个步骤，必须在一条消息中通过两个 Task 工具调用**并行**调度元评审代理和实现代理。元评审代理**必须**是该消息中的第一个工具调用，以便它能在实现代理修改工件之前观察到这些工件。

两个代理均作为**前台**代理运行。在继续进行评审调度之前，等待**两个代理都完成**。

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

在继续进行评审调度之前，等待**两个代理都返回**。

#### 3.4 评审验证协议

在元评审代理和实现代理**都完成**后，调度一个**独立评审代理**，使用元评审的评估规范验证该步骤。

关键：必须向评审代理提供元评审的**完整评估规范 YAML**，不得跳过或添加任何内容，不得以任何方式修改，不得缩短或总结其中的任何文本！

##### 3.4.1 分析“预先存在的更改”部分

在为每个步骤调度评审代理之前，评估代码库中是否存在评审代理需要了解的预先存在的更改。“预先存在的更改”部分可防止评审代理将之前的修改误认为当前步骤实现代理所做的工作。

**包含该部分的时机：**

- 来自同一次 do-in-steps 运行中**之前步骤**的更改（评审步骤 N 时为步骤 1..N-1）——这在顺序执行中最为常见。当运行步骤 N 时，评审代理**必须**了解步骤 1..N-1 的更改，作为预先存在的更改。每个已完成步骤的输出（创建/修改的文件、关键更改）都会成为后续步骤评审代理的预先存在上下文。
- 同一会话中更早完成的其他 do-in-steps 或 do-and-judge 任务运行
- 用户在调用此技能之前手动进行的修改（可从对话上下文或 git 中看到）
- 在此任务之前由其他工具或代理运行所产生的更改

**省略时机：**

- 这是第 1 步，且没有已知的先前变更（没有更早的会话任务，也没有用户修改）——完全省略此部分
- 在同一任务步骤内重试时，不要将实现代理自己之前的尝试作为“预-existing changes”包含在内——这些内容属于当前步骤的迭代周期

**内容指南：**

- 使用高层次摘要：任务描述、受影响的文件/模块列表、变更的大致性质（创建、修改、删除）
- 不要包含代码块、差异或逐行细节——保持简洁
- 清晰标注每个来源：“Step 1: {description}”、“Step 2: {description}”、“User modifications (before current task)”等
- 如果存在多个预-existing changes 来源，请为每个来源使用单独的小节（每个已完成步骤各一个小节，外加任何外部来源）
- 利用 Context Passing Protocol 的输出（第 3.1 节）——“Completed Steps Summary”已经记录了每个步骤产生的内容

关键要求：避免读取完整代码库或 git 历史记录，只使用高层次的 git diff/status 确定哪些文件发生了变更，或使用对话上下文和已完成步骤摘要确定预-existing changes。

**步骤评审器的提示模板：**

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

关键要求：绝不要以任何形式提供分数阈值，包括 `threshold_pass` 或任何其他不同的形式。评审器绝不能知道分数阈值，以免受到偏见影响！！！

**分派：**

```
Use Task tool:
  - description: "Judge Step {N}/{total}: {subtask_name}"
  - prompt: {judge verification prompt with exact meta-judge specification YAML, and Pre-existing Changes section if applicable}
  - model: {judge model — the user's `--model` if one was passed; otherwise MUST equal this step's current implementation model, including after escalation}
  - subagent_type: "sadd:judge"
```

#### 3.5 分派、验证与迭代

按顺序处理每个子任务：

```
1. 并行分派元评审代理和实现代理（在一条消息中进行 2 次工具调用）：
   工具调用 1（元评审 — 必须先调用）：
     使用 Task 工具：
       - description: "Meta-judge Step {N}/{total}: {subtask_name}"
       - prompt: {包含步骤要求和上下文的元评审提示词}
       - model: {元评审模型 — 如果用户传入了 `--model`，则使用该模型；否则使用与该步骤实现模型相同的层级，或根据角色配对规则高一层级}
       - subagent_type: "sadd:meta-judge"

   工具调用 2（实现）：
     使用 Task 工具：
       - description: "Step {N}/{total}: {subtask_name}"
       - prompt: {包含 CoT + 任务 + 之前上下文 + 自我批评的构造后提示词}
       - model: {实现模型 — 如果用户传入了 `--model`，则使用该模型；否则使用为此步骤选择的模型}
       - subagent_type: "{selected agent type}"

2. 等待两者都完成。收集输出：
   - 从元评审代理提取评估规范 YAML
   - 从实现代理解析“Context for Next Steps”部分，并记录修改的文件

3. 分派评审子代理（使用此步骤的元评审规范）：
   使用 Task 工具：
     - description: "Judge Step {N}/{total}: {subtask_name}"
     - prompt: {包含步骤要求、实现输出和元评审规范 YAML 的评审验证提示词}
     - model: {评审模型 — 如果用户传入了 `--model`，则使用该模型；否则必须与此步骤当前的实现模型相同，包括升级模型之后}
     - subagent_type: "sadd:judge"

4. 解析评审结论（不要阅读完整报告）：
   从评审回复中提取：
   - VERDICT: PASS 或 FAIL
   - SCORE: X.X/5.0
   - ISSUES: 问题列表（如有）
   - IMPROVEMENTS: 改进建议列表（如有）

5. 根据结论作出决策：

   如果分数 ≥4.0：
     → VERDICT: PASS
     → 携带累积上下文继续下一步骤
     → 将 IMPROVEMENTS 作为可选增强项纳入上下文

   如果 3.0 ≤ 分数 <4.0 且不是 STRICT_MODE：
     → 应用迭代酌情处理规则（3.6）
       → 接受 → VERDICT: PASS（报告未解决的问题并继续）
       → 拒绝 → VERDICT: FAIL → 转到下面的“检查重试次数”

   否则（分数 <3.0，或处于 STRICT_MODE 且分数 <4.0）：
     → VERDICT: FAIL
     → 检查重试次数

     如果重试次数 < 3：
       → 根据下面的“3.5.1 重试时的模型升级”确定此步骤的重试层级
         （遵循升级规则 — 同时提升两者，除非唯一的保持例外适用）
       → 在该层级分派重试实现代理，并提供：
         - 原始步骤要求
         - 评审的 ISSUES 列表作为反馈
         - 评审报告的路径，以便查看详细信息
         - 修复具体问题的指示
       → 使用相同的元评审规范返回评审验证，并在重试层级分派评审代理（评审代理始终与实现代理匹配）
       → 不要为重试重新运行元评审，也不要重新确定其层级

     如果重试次数 ≥ 3：
       → 升级给用户（参见错误处理）
       → 不要继续下一步骤

6. 携带累积上下文继续下一个子任务
   → 下一步骤需要在与其实现代理并行时分派新的元评审代理
```

##### 3.5.1 重试时的模型升级

在分派任何重试之前，你 MUST 根据 [升级规则](#escalation-rule) 明确决定此步骤的层级——该规则完整适用，包括其唯一的保持不变例外——并在步骤报告中说明该决定。在此基础上，重试还需遵循以下特定依据：

- **触发条件 (1) 在此处固定为 `score < 3.0`**（或出现表明模型误解了步骤、而不仅仅是遗漏细节的问题）。
- 重试的评审器 MUST 以与重试实现相同的层级进行分派；该步骤的元评审器既不会重新运行，也不会重新分级。
- 升级后的层级仅适用于**此步骤剩余的尝试**——下一步骤将根据 [阶段 2](#phase-2-model-selection-for-each-subtask) 从头重新评估。
- 如果 `opus` 仍然失败，则根据[错误处理](#if-step-fails-after-max-retries)向用户升级。

**实现代理的重试提示模板：**

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

你的主要任务是在目标质量范围内**完成**任务，且迭代投入 MUST 与每个步骤的规模相称。以下两种失败模式同样真实：

- 在细枝末节上耗尽重试次数和上下文，导致整个任务始终无法完成 → **任务失败**。
- 接受一个质量确实过低、不能被视为已完成的步骤 → **更严重的失败**。

对每个评审得分应用以下规则：

- **`score < 3.0` → 无条件 FAIL。不得裁量。** 根据评审反馈进行重试，直到该步骤通过或达到最大重试次数。
- **`3.0 <= score < 4.0` → 裁量区间。** 只有在此区间内，你 MAY 决定接受一个低于 `4.0` 目标的步骤。固定的 `4.0` 目标使有效下限为 `3.0`，因此不需要单独的有界下降保护规则。
- 在该区间内，只有当遗留问题**全部**属于低/中优先级（任何 High 或 Critical 级别的发现都会完全取消裁量权），且这些问题都没有违反该步骤的目标要求或造成有意义的缺陷（即它们只是细枝末节）时，你 MUST 在分派重试之前**先行判断**另一次尝试是否值得付出时间和上下文成本。
- **最多进行一次由细枝末节驱动的重试**，且该次重试计入重试额度。如果这次重试仍然只发现细枝末节问题，你 MUST 将该步骤标记为 PASS（`ACCEPTED`），在累计上下文中继续传递遗留问题，在最终摘要中报告这些问题，然后继续下一步骤。如果返回低于 `3.0` 的得分，则适用无条件 FAIL 规则。
- 你 MUST 保持批判性，**不得宽松处理**。停止在目标分数之前必须是基于不存在真实的、会破坏要求的问题而作出的有意决定——后续步骤将建立在此步骤之上。阻碍在最大重试次数内完成该步骤的真实问题必须升级为失败，绝不能掩盖了事。
- **如果 `STRICT_MODE` 为 true，则整条规则被禁用**：只有在 `score >= 4.0` 或达到最大重试次数时才停止。`--strict` 不会改变其他任何内容——`4.0` 目标、最大重试次数限制、`< 3.0` 无条件 FAIL，以及元评审器/评审器的分派均不受影响。

### 后续建议
{Judge 提出的任何改进建议、需要运行的测试或所需的手动验证}

## 错误处理

### 如果 Judge 验证失败（评分 <4.0）

Judge 验证的迭代循环会自动处理大多数失败情况（只有在[迭代裁量规则](#36-iteration-discretion-rule)拒绝接受 `3.0..4.0` 的评分后，该评分才会被判定为 FAIL）：

```
Judge FAIL (Retry Available):
  1. Parse ISSUES from judge verdict
  2. Dispatch retry implementation agent with feedback
  3. Re-verify with judge (using same step's meta-judge specification — do NOT re-run meta-judge)
  4. Repeat until PASS or max retries (3)
```

### 如果步骤在达到最大重试次数后仍然失败

当某个步骤连续三次未通过 Judge 验证时：

1. **停止**——不要在基础环节已损坏的情况下继续执行
2. **报告**——提供失败分析：
   - 原始步骤要求
   - 所有 Judge 判定结果和评分
   - 各次重试中持续存在的问题
3. **升级**——向用户提供以下选项：
   - 提供额外上下文/指导后重试
   - 在更高的模型层级上重新运行此步骤（如果该步骤已经达到 `opus`，则省略此选项）
   - 修改步骤要求
   - 跳过步骤（如果该步骤是可选的）
   - 中止并报告部分进度
4. **等待**——未经用户决定不得继续执行

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

**绝不：**

- 在步骤达到最大重试次数后继续执行
- 为了“节省时间”而跳过评审验证
- 忽略多次重试中持续存在的问题
- 臆测哪些做法可能奏效

### 如果缺少上下文

1. **不要猜测**之前的步骤产生了什么
2. **重新检查**之前步骤的输出，以查找缺失的信息
3. **检查评审报告**——其中可能记录了缺失的元素
4. 如果需要，**调度澄清子代理**以提取缺失的上下文
5. **更新上下文传递**，以便未来处理类似任务

### 如果步骤之间存在冲突

1. 在冲突点**停止执行**
2. **分析：**分解是否不正确？这些步骤实际上是否存在依赖关系？
3. **检查评审反馈**——评审者可能已标记集成问题
4. **选项：**
   - 如果遗漏了依赖关系，则重新排列步骤
   - 将相互冲突的步骤合并为一个步骤
   - 在相互冲突的步骤之间添加协调步骤

## 示例

### 示例 1：相互构建的顺序步骤（前序步骤已有的更改）

**输入：**

```
/do-in-steps implement user management feature
```

**阶段 1——分解：**

| Step | Subtask | Depends On | Complexity | Type | Output |
|------|---------|------------|------------|------|--------|
| 1 | Create User model and database schema | - | Medium | Implementation | User model, migration files |
| 2 | Add CRUD endpoints for users | Step 1 | Medium | Implementation | REST API routes, controller |
| 3 | Add authentication integration | Steps 1,2 | High | Implementation | Auth middleware, JWT handling |

**阶段 2——模型选择：**

| Step | Subtask | Model | Rationale |
|------|---------|-------|-----------|
| 1 | Create User model and schema | sonnet | Code writing on an established pattern; the greenfield `users` table is reversible, so the irreversible-migration trigger does not fire |
| 2 | Add CRUD endpoints | sonnet | Code writing in one module; "adding to a public API" is NOT on the exhaustive critical list |
| 3 | Add authentication integration | opus | opus is EARNED — the critical trigger fires on auth (JWT issuance and route protection) |

**第 3 阶段——累积已有变更的执行：**

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

- Agent 总数：10（3 个元评审 + 3 个实现 + 0 次重试 + 3 个评审）
- 预先存在的变更进展：
  - 第 1 步评审：无
  - 第 2 步评审：第 1 步输出（2 个文件）
  - 第 3 步评审：第 1+2 步输出（5 个文件）
- 所有评审评分：4.2、4.4、4.1

---

### 示例 2：用户修改过的代码库 + 顺序执行步骤（混合预先存在的变更来源）

**场景：**

用户在对话期间一直在处理一个支付处理模块。在调用 do-in-steps 之前，他们修改了多个文件（新增了一个 PaymentGateway 接口，更新了配置）。

**输入：**

```
/do-in-steps fix and improve payment processing
```

**阶段 1 - 任务分解：**

| 步骤 | 子任务 | 依赖项 | 复杂度 | 类型 | 输出 |
|------|---------|------------|------------|------|--------|
| 1 | 修复支付验证漏洞 | - | 中等 | Bug 修复 | 修正后的验证逻辑 |
| 2 | 为失败的支付添加重试逻辑 | 第 1 步 | 高 | 实现 | 带退避机制的重试机制 |

**阶段 2 - 模型选择：**

| 步骤 | 子任务 | 模型 | 理由 |
|------|---------|-------|-----------|
| 1 | 修复支付验证漏洞 | opus | opus 是 EARNED — 范围虽小，但优先级会使关键性覆盖规模：支付位于关键列表中 |
| 2 | 为失败的支付添加重试逻辑 | opus | opus 是 EARNED — 支付（关键领域）加上围绕资金转移的重试/退避编排（复杂逻辑） |

两个步骤都使用 `opus`，原因在于*领域本身获得了该模型*，而不是因为本次运行获得了该模型 — 关于混合不同层级的链路，请参见示例 3。

**阶段 3 - 使用混合预先存在的变更执行：**

代码块内容保持不变。

**最终总结：**

- Agent 总数：7（2 个元评审 + 2 个实现 + 0 次重试 + 2 个评审）
- 既有变更进展：
  - 第 1 步评审：用户修改（3 个文件）
  - 第 2 步评审：用户修改（3 个文件）+ 第 1 步输出（2 个文件）
- 所有评审得分：4.3、4.5

---

### 示例 3：通过升级机制进行多文件重构

**输入：**

```
/do-in-steps Rename 'userId' to 'accountId' across the codebase - this affects interfaces, implementations, and callers
```

**阶段 1——任务分解：**

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
| 1 | 更新接口 | opus | opus 已获使用资格——共享契约发生变更，无论文件数量多少，这都是 `opus` 的触发条件 |
| 2 | 更新实现 | haiku | 机械化大范围修改豁免：每个文件中重复执行一个基于规则的重命名，按单次出现进行分层 |
| 3 | 更新调用方 | haiku | 同样适用该豁免——机械化重命名，不涉及逻辑或契约变更 |
| 4 | 更新测试 | haiku | 反映该重命名的机械化测试修复 |
| 5 | 更新文档 | haiku | 单一目的的文本修正，不涉及代码 |

**阶段 3——执行与升级（每个步骤都包含并行的元评审和实现）：**

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

总代理数：20（5 个元评审 + 5 个实现代理 + 5 个重试代理 + 5 个评审代理）

---

## 最佳实践

### 任务分解

- **明确具体：** 每个子任务都应有清晰、可验证的结果
- **定义验证点：** 评审代理应检查每个步骤的哪些内容？
- **尽量减少步骤：** 合并相关工作；不要过度拆分
- **验证依赖关系：** 确保每个步骤都具备完成任务所需的前置条件
- **规划上下文：** 确定哪些上下文需要在步骤之间传递

### 模型选择

规则由[模型选择策略](#model-selection-policy)规定；以下习惯有助于贯彻这些规则：

- **逐步骤大声说明理由**——在分派每个步骤之前，说明范围、复杂度和风险，以及由此确定的层级；这是运行过程中影响最大的决策
- **`opus` 只能凭实力获得，绝不能作为保险**——按照[选择规则](#selection-rules)中的优先级和决胜规则解决所有重叠和僵局，绝不能凭直觉决定
- **根据每个步骤自身的情况确定层级**——一个链路可以混合使用不同层级；相邻步骤的层级（或已升级的层级）不能作为该步骤的依据
- **各角色使用同一层级**——只提升标准制定者（元评审）的层级，并且仅针对不明显的步骤（[角色配对](#role-pairing)）
- **根据证据进行升级**——明确过低质量的尝试或用户质量投诉（[升级规则](#escalation-rule)）应针对失败的步骤处理

### 上下文传递指南

| 场景 | 需要传递的内容 | 需要省略的内容 |
|----------|--------------|--------------|
| 步骤 1 中定义接口 | 完整的接口定义 | 实现细节 |
| 步骤 2 中实现功能 | 关键模式、文件位置 | 内部逻辑 |
| 步骤 3 中进行集成 | 使用模式、入口点 | 步骤 2 的内部细节 |
| 重试时传递评审反馈 | ISSUES 列表、报告路径 | 完整的报告内容 |

**保持上下文聚焦：**

- 传递下一步骤构建所需的内容
- 省略不会影响后续步骤的内部细节
- 突出需要保持一致的模式/约定
- 将评审代理提出的 IMPROVEMENTS 作为可选增强项纳入
- **跟踪预先存在的更改**——向评审代理传递之前修改的上下文（包括之前步骤中的修改），以避免归因混淆

### 元评审 + 评审验证

- **绝不要跳过元评审**——量身定制的评估标准比通用标准能产生更好的评审结果
- **每个步骤对应一个元评审**——每个步骤都应在实现代理并行分派时，同时分派其专属的元评审代理
- **在同一个步骤的重试中复用元评审规范**——重试时，复用该步骤原有的元评审规范；不要重新运行元评审
- **每个新步骤都使用新的元评审**——不同步骤有不同要求，因此每个步骤都应使用全新的元评审
- **并行分派时优先调用元评审**——消息中的工具调用始终应以元评审作为第一个工具调用
- **仅解析评审代理的标题**——不要读取完整报告，以避免上下文污染
- **包含 CLAUDE_PLUGIN_ROOT**——元评审代理和评审代理都需要已解析的插件根路径
- **元评审 YAML**——只将元评审 YAML 传递给评审代理，不要向其中添加任何额外文本或注释！
- **自我批评之后：** 评审代理应评审已经通过内部验证的工作
- **独立验证：** 评审代理应与实现代理不同
- **结构化输出：** 始终从回复中解析 VERDICT/SCORE，而不是完整报告
- **最大重试次数：** 在向用户升级之前，最多尝试 3 次
- **反馈闭环：** 将评审代理的 ISSUES 传递给重试实现代理
- **返回评审验证时，使用同一个步骤的元评审规范**

### 质量保证

- **双层验证：** 自我批评（内部）+ 评审者（外部）
- **先进行自我批评：** 实现代理在提交前验证自己的工作
- **后进行外部评审：** 独立评审者发现自我批评遗漏的盲点
- **迭代循环：** 根据反馈重试，直到通过或达到最大重试次数
- **适度迭代：** 应用 [迭代裁量规则](#36-iteration-discretion-rule)——最多进行一次由细枝末节问题驱动的重试，评分绝不低于 `3.0`，使用 `--strict` 时禁用
- **链式验证：** 评审者检查与前序步骤的集成情况
- **升级处理：** 不要在步骤失败后继续推进——获取用户输入
- **最终集成测试：** 所有步骤完成后，验证完整变更能够协同工作

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

**关键洞见：** 具有依赖关系的复杂任务适合采用顺序执行方式：每个步骤都在全新的上下文中运行，同时仅接收前序步骤的相关输出。**针对每个步骤的元评审规范**可确保根据该步骤的要求制定定制化的评估标准，并与实现并行运行以提升速度。**外部评审者验证**能够发现自我批评遗漏的盲点，而**迭代循环**（重复使用同一 `步骤` 的元评审规范）则确保在继续推进前达到质量要求。这样既能防止上下文污染，也能避免错误传播。