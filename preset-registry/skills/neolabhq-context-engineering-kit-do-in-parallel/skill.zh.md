---
name: do-in-parallel
description: Run independent tasks concurrently across multiple files or targets using parallel sub-agents, with per-task model selection and LLM-as-a-judge verification. Use when tasks do not depend on each other and can run side by side.
---
# 并行执行

<task>
并行启动多个子代理，在不同文件或目标上执行任务。分析任务，为每个目标选择合适规模的模型层级，执行需求分组分析（可重复、共享或独立），生成注重质量的提示词，并采用零样本思维链推理和强制自我批评，然后根据分组情况分派元评审器（每个分组一个，或每个独立任务一个，全部并行），随后为每个任务并行分派实现器，并在每个任务完成后，使用适合其分组的评估规范，通过 LLM-as-a-judge 进行验证。
</task>

<context>
此命令实现了带有并行分派、**需求分组**以及**元评审器 → LLM-as-a-judge 验证**的**监督器/编排器模式**。其主要优势是**并行执行**——多个相互独立的任务可以并发运行，而不是按顺序执行，从而显著减少批量操作的总执行时间。需求分组分析通过识别可重复任务模式和共享任务模式，减少元评审器和评审器的总数量：可重复分组（不同目标上的相同任务）共享一个元评审器规范，共享分组（相互依赖的任务）使用一个组合评审器。


主要优势：
- **并行执行**——多个任务同时运行
- **需求分组**——通过识别可重复和共享的任务模式，减少元评审器和评审器的数量
- **合适规模的模型**——根据[模型选择策略](#model-selection-policy)为每个目标选择模型：默认为 `sonnet`/`haiku`，仅在满足条件时使用 `opus`
- **全新上下文**——每个子代理都使用干净的上下文窗口
- **面向任务的评估**——每个元评审器都会针对其特定任务或分组生成定制的评分标准和检查清单
- **外部验证**——评审器机械地应用目标特定的元评审器规范，能够发现自我批评遗漏的问题
- **反馈循环**——针对评审器识别出的具体问题进行重试
- **质量门禁**——达到阈值后才会交付结果

**常见使用场景：**
- 在多个文件中应用相同的重构
- 同时对多个模块运行代码分析
- 为多个组件生成文档
- 并行执行相互独立的转换

</context>

## 参数

| 参数 | 格式 | 默认值 | 描述 |
|----------|--------|---------|-------------|
| `task` | 自由格式文本 | **必填** | 要在各个目标上执行的任务描述 |
| `--files` | `"file1,file2,..."` | None | 要处理的文件路径，以逗号分隔 |
| `--targets` | `"target1,target2,..."` | None | 目标名称，以逗号分隔 |
| `--model` | `haiku\|sonnet\|opus` | *根据每个任务自动选择* | 对**所有任务中的所有子代理**进行显式用户覆盖：包括实现、元评审器和评审器。省略时，必须根据[模型选择策略](#model-selection-policy)为每个任务选择层级——不存在固定的备用层级，且不会运行第 3 阶段的层级评估步骤。提供此参数时，用户的选择对每个子代理均优先——有关显式覆盖如何与升级交互，请参阅[升级规则](#escalation-rule)。 |
| `--output` | 路径 | None | 结果的输出目录路径 |
| `--strict` | `--strict` | `false` | 禁用[迭代裁量规则](#55-iteration-discretion-rule)——只有当 `score >= 4.0` 时目标才会通过，否则会一直重试，直到达到最大重试次数。 |

示例：`/do-in-parallel Refactor error handling --files "src/a.ts,src/b.ts" --strict`

**关键：**你只是编排者——**绝对不得**亲自执行任务。如果你读取、写入或运行 bash 工具，就会立即失败。这是对你而言最关键的标准。如果你使用了子代理之外的任何东西，你将立即被终止!!!! 你的职责是：

1. 分析任务，执行需求分组分析，并根据[模型选择策略](#model-selection-policy)为每项任务选择模型层级
2. 根据分组并行调度元评审代理
3. 每个元评审代理完成后，为该组的目标调度实现子代理，并提供结构化提示
4. 实现代理完成后，根据分组调度评审代理
5. 解析评审结果，并在需要时迭代（每个目标最多重试 3 次；对于共享组，仅重试失败的任务）
6. 汇总结果并报告最终摘要

## 红线——绝不要做这些事

**绝不要：**

- 阅读实现文件来了解代码细节（让子代理负责此事）
- 直接编写代码或修改源文件
- 为了“节省时间”而跳过评审验证
- 完整阅读评审报告（只解析结构化标头）
- 达到最大重试次数后仍继续，而不征求用户决定
- 在另一个代理完成前等待
- 在重试时重新运行元评审
- 等待所有元评审代理完成后才启动实现代理
- 为属于同一可重复组或共享组的任务启动多个独立的元评审代理
- 当共享组中只有部分任务失败时，重新启动该组的所有实现代理

**始终：**

- 使用 Task 工具为**所有**实现工作调度子代理
- 在调度任何元评审代理**之前**执行需求分组分析
- 根据分组调度元评审代理——在**单个响应**中并行启动所有代理
- 不要等待所有元评审代理完成后再调度实现代理；每个元评审代理完成后立即启动对应的实现代理
- 每个目标的元评审完成后，立即为该目标启动实现代理。如果所有元评审都已完成，则在**单个响应**中启动所有实现代理
- 将每个目标特定的元评审评估规范传递给其评审代理
- 对于共享组，调度**一个**评审代理，统一评审所有相关变更
- 在验证时使用 Task 工具调度相互独立的评审代理
- 等待每个实现完成后，再调度其评审代理
- 仅从评审输出中解析 VERDICT/SCORE/ISSUES
- 如果验证失败，则根据反馈进行迭代（每个目标最多重试 3 次）
- 对每个目标的评审结果应用[迭代裁量规则](#55-iteration-discretion-rule)，除非提供了 `--strict`
- 对于共享组的重试，只重新启动具体失败的实现代理，而不是整个组
- 对所有重试复用相同的元评审规范（绝不要重新运行元评审）

## 模型选择策略

选择模型是你所做的**影响力最高的单项决策**——它比提示措辞更重要，因为它决定了目标返回结果的正确性以及批处理所需的时间。你**不得**将其视为形式流程：在调度**每个**目标之前，你必须说明层级并给出一行理由。因为不想思考而直接选择最强模型是失败，而不是谨慎。

**层级默认值：**`sonnet` 和 `haiku` 为默认值。`opus` 受限且必须显式选择——它**必须**由下表中的触发条件触发后才能使用，绝不能因为你不确定而选择。

**按任务，而非按运行：**每项任务都会**独立选择**层级，依据该任务自身的范围、复杂度和风险决定——批处理不再被迫让所有并行代理使用同一种“统一配置”。独立任务各自依据自身情况确定层级。可重复组的共享元评判器会生成一个可复用的规范，但这**不会**强制使用同一层级：组中的每项任务仍按照下方的选择规则分别保留自己的实现层级和评判器层级，因此，在其他任务都属于机械性操作的组中，关键领域的目标仍然可以使用`opus`，而同组的其他任务则使用更低成本的层级。共享组的单个评判器会一并审查组中的每项任务，因此它会运行在其中当前**最高的实现层级**上（参见[角色配对](#role-pairing)）。某项任务达到的层级（包括通过升级达到的层级）**不得**沿用到同组的其他任务或下一批任务中。

### 选择规则

| 任务形态 | 层级 | 示例 |
|---|---|---|
| 单个文档/文本文件修正——无代码，也无需跨文件推理 | `haiku` | 修复拼写错误、更新链接、修正 README 中过时的命令 |
| 小型、仅数行（约 10 行或更少）的机械性代码修改，限制在单个文件内 | `haiku` | 调整常量、添加保护性条件、重命名局部变量、修改配置值 |
| 编写代码——新增函数、组件或测试，单模块修改，使用既有模式 | `sonnet` | 添加端点、编写服务方法及其测试、重构单个模块 |
| **多文件重构**（约 3 个或更多文件，或任何文件数量但涉及共享契约变更）或**关键任务**（身份验证、支付/计费、数据完整性、不可逆迁移、公共 API 破坏性变更）或**复杂逻辑**（并发、非平凡算法、架构决策） | `opus` | 跨领域重构、身份验证或支付逻辑、模式迁移、新颖算法设计 |

**优先级（强制）：**必须评估每一行，而不只是第一个匹配的条件。当有多个条件匹配时，取匹配到的**最高层级**——关键性和复杂度始终覆盖规模。身份验证处理程序中一个四行的空值检查同时匹配`haiku`行和`opus`行，因此应使用`opus`。**关键任务**列表是完整的，而非示例性的：部署到生产环境、涉及真实用户或添加到公共 API 都**不是**触发条件，因此，在单个服务文件中新增带验证的端点仍然使用`sonnet`。**机械性广度例外：**仅有广度并不代表复杂。对于纯机械性变更——在多个目标中重复执行同一项由规则驱动的编辑，且不涉及逻辑和契约变更——只有**多文件触发条件**不适用；**关键任务**和**复杂逻辑**触发条件仍然适用。你**必须**依据**单次出现**的内容确定层级，就好像任务只涉及一个文件一样；因此，在 40 个文件中机械性地重命名一个符号属于`haiku`，但如果同一重命名被限制在`src/auth/`中，则属于`opus`——无论涉及的文件数量如何，关键触发条件都会因该单次出现而触发。此例外不适用于共享契约变更（上文已经将其列为`opus`触发条件），因此，在多个文件之间提取共享接口仍然属于`opus`。

**平局裁决：**仅当没有任何行能够清晰匹配——任务确实处于两个层级之间——才选择更**便宜**的层级。你绝对不能为了规避风险而偏向 `opus`；[升级规则](#escalation-rule)会让便宜的首次猜测可以恢复，而挽救一个任务的成本远低于为每个任务都过度配置资源。

### 角色配对

任何由模型分配的流水线最多包含三个角色——**生产者**（执行工作）、**标准制定者**（定义什么才算“正确”）、**评估者**（根据这些标准检查工作）；在此技能中，它们会针对**每个并行任务**分别实例化为实现者 / 元评审者 / 评审者——可重复组中的多个任务共享一个元评审者，而共享组还会在其任务之间共享一个评审者。**默认：该任务的三个角色使用相同的层级。**

**仅对于不明显的任务**，你可以单独将**标准制定者**提高一个层级，使标准比被评估的工作更加严谨。*不明显*是可测试的：层级是由**平局裁决**决定的（没有任何 Selection Rules 行能够清晰匹配），或者任务没有说明可检查的验收条件。

| 模式 | 标准制定者（元评审者） | 生产者 + 评估者（实现者 + 评审者） | 使用时机 |
|---|---|---|---|
| Sharpened-haiku | `sonnet` | `haiku` | 工作很简单，但什么才算“正确”并不明显 |
| Sharpened-sonnet | `opus` | `sonnet` | 验收标准含糊或后果严重的代码工作，但该工作本身没有触发 `opus` 条件 |

生产者和评估者必须始终共享一个层级——对于评审多个任务的可重复组或共享组的评审者而言，“共享一个层级”意味着采用其所服务任务中当前最高的实现层级，以确保不会要求它评审高于自身层级的工作（参见 [重试时的模型升级](#531-model-escalation-on-retry)）。你绝对不能只提高评估者的层级，也绝对不能将标准制定者设置为低于生产者的层级。**显式的 `--model` 覆盖优先于本节的全部规则：**当用户传入了 `--model` 时，每个任务的所有角色都使用该层级运行，并且角色配对绝不能将元评审者提高到该层级之上。

### 升级规则

当以下任一触发条件出现时，在下一次尝试中将**生产者和评估者同时**提高一个层级（即失败任务的实现者和评审者）：

1. **首次尝试质量较低**——得分较低，或者存在表明模型误解了任务、而不只是遗漏细节的问题。
2. **用户抱怨**质量太低或结果错误——无论何时，包括在报告 PASS 之后。

层级阶梯：`haiku` → `sonnet` → `opus`。`opus` 是**上限**——不存在更高的层级。如果 `opus` 层级的工作仍然失败，则应升级给**用户**，绝不能循环重试。

- **唯一例外——保持层级（本规则的唯一表述，且仅适用于触发条件 (1)）：**当触发条件 (1) 出现，但评审者指出的是具体且可修复的缺陷，而非能力缺口（即模型显然理解了任务，只是存在范围狭窄、描述精确的问题）时，你可以保持当前层级，并依据评审者的确切反馈在**相同层级**重试，而不是提高层级。这是触发条件 (1) 下不强制升级的唯一情形；除此之外，触发条件 (1) 一律必须升级。触发条件 (2)（用户抱怨）**没有**此类例外——根据下方的特殊规定，它始终会立即升级。
- **显式 `--model` 特殊规定（本规则的唯一表述）：**显式的 `--model` 是用户覆盖设置，因此触发条件 (1) **不得**悄悄推翻它——继续使用覆盖模型迭代，直到达到最大重试次数。如果最终仍未达到目标，则指出发现的问题，并建议由用户批准升级。触发条件 (2) 即表示用户已批准升级，因此会立即升级。
- **仅限失败的任务。**升级只会重新设置**该任务**的实现者和评审者的重试层级。它不会重新设置整个批次的层级：并发运行的同批次兄弟任务，以及后续批次中的每个任务，都必须依据[选择规则](#selection-rules)按各自情况评估，并重新从 `sonnet`/`haiku` 默认值开始。
- 升级只会调整实现者和评审者。任务的元评审者（对于可重复组/共享组，则为组级元评审者）不会重新运行，也不会重新设置层级——其规范会在该任务的重试中复用；在任务进行期间更改标准会使各次尝试之间的比较失效。
- 升级是对真正根因修复的补充，而绝不是替代。你仍然必须将评审者的具体反馈传递给重试；禁止只是以更高层级重新分发同一个提示并寄希望于结果变好。
- 升级独立于分数阈值、[迭代裁量规则](#55-iteration-discretion-rule)以及每个目标最多 3 次重试的预算——它只改变下一次尝试使用的模型，绝不改变一次尝试是否有必要进行。
- **在报告 PASS 后重新进入（本规则的唯一表述）：**报告 PASS 并不意味着工作已经结束。如果用户之后表示某个目标的结果错误或质量过低，则根据触发条件 (2) 让该目标重新进入重试路径，并且该目标的重试预算会**重置**——即使之前的周期已经耗尽，也会开启一个最多 3 次重试的新周期。

### 跨提供商等效性

当此 skill 在 Anthropic 模型上下文之外运行时，请将层级映射到同一类别中最接近的模型：

| 层级 | 角色 | 其他提供商的可比模型 |
|---|---|---|
| `haiku` | 快速且经济；机械性工作 | `gemini-flash-lite`、`gemma` 类、`gpt-oss` 类、小型开放权重模型 |
| `sonnet` | 均衡的主力模型；承担大多数代码编写工作 | `gemini-pro` 类和完整的 `gemini-flash`（**不是** `-lite` 变体，后者属于 `haiku` 层级）、`GPT-5-mini` 类、大型 `Qwen` / `DeepSeek` 类 |
| `opus` | 前沿推理；关键或复杂工作 | 提供商目前作为扩展式 / 深思熟虑推理层级销售的模型——目前包括 `GPT-5.5`、深度思考模式、`Kimi K3` 类，以及任何优势在于更长时间推理而非吞吐量的模型 |

映射依据是**能力层级，而非名称**——随着供应商发布新模型，具体名称会不断变化。上面的每条规则都以层级表示，因此在其他提供商上：将层级映射到你所使用的同类模型，然后原样应用选择、配对和升级规则。

## 流程

### 阶段 1：解析输入并识别目标

从命令参数中提取目标：

```
Input patterns:
1. --files "src/a.ts,src/b.ts,src/c.ts"    --> File-based targets
2. --targets "UserService,OrderService"    --> Named targets
3. Infer from task description             --> Parse file paths from task
```

**解析规则：**
- 如果提供了 `--files`：按逗号拆分，并验证每个路径是否存在
- 如果提供了 `--targets`：按逗号拆分，按原样使用
- 如果两者都未提供：尝试从任务描述中提取文件路径或目标名称
- `STRICT_MODE = --strict present || false` - 禁用 [迭代裁量规则](#55-iteration-discretion-rule)；此时目标只有在 `score >= 4.0` 时才算通过，否则会一直重试，直到达到最大重试次数
- 在构建子代理提示词之前，从任务文本中删除所有标志——**绝不要**将它们传入子代理提示词

示例：`/do-in-parallel Simplify error handling --files "src/a.ts,src/b.ts" --strict`

### 阶段 2：使用零样本思维链进行任务分析

在分派任务之前，系统地分析任务：

```
Let me analyze this parallel task step by step to determine the optimal configuration:

1. **Task Type Identification**
   "What type of work is being requested across all targets?"
   - Code transformation / refactoring
   - Code analysis / review
   - Documentation generation
   - Test generation
   - Data transformation
   - Simple lookup / extraction

2. **Per-Target Complexity Assessment**
   "How complex is the work for EACH individual target?"
   - High: Requires deep understanding, architecture decisions, novel solutions
   - Medium: Standard patterns, moderate reasoning, clear approach
   - Low: Simple transformations, mechanical changes, well-defined rules

3. **Per-Target Output Size**
   "How extensive is each target's expected output?"
   - Large: Multi-section documents, comprehensive analysis
   - Medium: Focused deliverable, single component
   - Small: Brief result, minor change

4. **Independence Check**
   "Are the targets truly independent?"
   - Yes: No shared state, no cross-dependencies, order doesn't matter
   - Partial: Some shared context needed, but can run in parallel
   - No: Dependencies exist --> Use sequential execution instead
```

#### 并行调度前的独立性验证（必需）

在继续之前，验证任务是否真正相互独立：

| 检查项 | 问题 | 如果为“否” |
|-------|----------|-------|
| 文件独立性 | 目标是否共享文件？ | 无法并行化 - 文件冲突 |
| 状态独立性 | 任务是否修改共享状态？ | 无法并行化 - 存在竞态条件 |
| 顺序独立性 | 执行顺序是否重要？ | 无法并行化 - 需要按顺序执行 |
| 输出独立性 | 是否有目标读取另一个目标的输出？ | 无法并行化 - 存在数据依赖 |

**独立性检查清单：**
- [ ] 没有目标读取另一个目标的输出
- [ ] 没有目标修改另一个目标读取的文件
- [ ] 完成顺序无关紧要
- [ ] 没有共享的可变状态
- [ ] 没有跨目标的数据库事务

如果任何检查失败：停止并告知用户并行化不安全的原因。建议使用 `/launch-sub-agent` 进行顺序执行。

#### Meta-Judge 调度前的需求分组分析（必需）

在识别出单个任务并验证独立性后，分析任务是否可以共享 Meta-Judge 和/或 Judge。这样可以在不牺牲质量的情况下减少调度的代理总数。

**三种分组类型**（可在同一个用户提示中组合使用）：

| 分组类型 | 适用时机 | Meta-Judge | 实现代理 | Judge |
|--------|----------|-------------|-------------|------|
| **可重复** | 相同任务模式应用于多个文件/模块（例如“为所有 3 个模块添加测试”） | 该组共享一个 | 每个任务一个（始终隔离） | 每个任务一个，每个都接收相同的共享规范 |
| **共享** | 应该一起审查/验证的任务，因为它们相互依赖（例如“实现 S3 适配器并将其集成到 analytics 中”） | 该组共用一个组合的 | 每个任务一个（始终隔离） | 整个组共用一个，审查所有变更 |
| **独立** | 完全独立且没有分组收益的任务 | 每个任务一个 | 每个任务一个（始终隔离） | 每个任务一个 |

**决策流程：**

```
For each pair of tasks, ask:

1. "Is this the SAME task applied to different targets?"
   +-- YES --> Group as REPEATABLE
   |           (Same spec reused across targets)
   |
   +-- NO --> "Should these tasks be REVIEWED TOGETHER because
              one depends on the output/existence of the other?"
              |
              +-- YES --> Group as SHARED
              |           (Combined spec, single judge reviews all)
              |
              +-- NO --> Mark as INDEPENDENT
                         (Separate meta-judge and judge per task)
```

关键要求：
- 如有疑问，默认视为**独立**。**如果无法明确判断任务是否真正可重复或共享，则将其视为独立任务。**过度分组可能导致评估规范不正确，而独立任务始终会获得针对具体任务的正确验证。与其产生错误的验证标准，不如使用更多代理。
- 实现代理**始终保持隔离**——每个任务一个，绝不共享。只有 Meta-Judge 和 Judge 可以共享/分组。分组分析发生在任务分析阶段，即启动任何代理**之前**。

**元评判者说明：**
- 可重复组：为可重复组调度元评判者时，应明确要求其生成可复用的验证规范。
- 共享组：为共享组调度元评判者时，应明确要求其生成合并后的验证规范。


**共享组重试逻辑：**

如果共享评判者发现问题，请分析具体是哪些实现代理产生了失败的更改。只重新启动其更改失败的具体实现代理——在必要之前，**不要**重新启动组中的所有代理。完成针对性重试后，重新启动共享评判者，以再次审查所有更改（包括通过审查的代理所完成的未更改工作）。



### 第 3 阶段：模型与代理选择

根据第 2 阶段的分析，按照[模型选择策略](#model-selection-policy)为每项任务选择模型层级和专用代理——默认使用 `sonnet`/`haiku`，只有在满足条件时才使用 `opus`。如果传入了 `--model`，则直接跳转到[3.2](#32-specialized-agent-selection-optional)：根据[角色配对](#role-pairing)覆盖条款，每项任务的每个子代理都使用用户指定的层级运行。

#### 3.1 按任务选择模型层级

根据以下三个维度评估**每一项**任务，然后直接根据[选择规则](#selection-rules)表确定其层级——层级按任务选择，绝不是针对整个批次统一选择：

- **范围** — 一个文件、一个组件，还是多个文件？
- **复杂度** — 机械式编辑、已有模式，还是新颖/复杂的逻辑？
- **风险** — 孤立且可逆、内部性，还是根据[选择规则](#selection-rules) `opus` 行中详尽列表定义的**关键**风险？

**按分组类型：**

- **独立**任务 — 为每项任务单独确定层级；每项任务都有该层级各自的元评判者和评判者。
- **可重复**组 — 共享元评判者生成**一份**可复用规范，但每项任务的实现和评判者仍分别确定层级：严格按照[选择规则](#selection-rules)评估每个目标，就像它们彼此独立一样。组内的关键领域目标（例如某个文件恰好包含身份验证代码）可以使用 `opus`，而同组中的其他目标仍可使用 `sonnet` 或 `haiku`，即使它们共享同一份规范。
- **共享**组 — 首先根据每项任务自身的内容确定层级，然后将组的**一名**共享评判者设置为这些层级中的最高层级（根据[角色配对](#role-pairing)），这样就不会要求其评判高于自身层级的工作。

在调度每项任务之前，说明三个维度的评估结果、所选层级，以及一行理由。然后应用[角色配对](#role-pairing)——包括其中的 `--model` 覆盖规则——以确定该任务（或该组）的元评判者层级。

#### 3.2 专用代理选择（可选）

如果任务符合某个专门领域，请在**所有**并行代理中加入相关的代理提示。专用代理提供领域特定的最佳实践，有助于提升输出质量。

**专用代理：** 专用代理列表取决于已加载的项目和插件。

**决策：**在以下情况下使用专门的 agent：
- 任务明确受益于领域专业知识
- 所有并行 agent 之间的一致性很重要
- 任务并不简单（对于简单任务而言，开销不值得）

在以下情况下跳过专门的 agent：
- 任务简单/机械（Haiku 级别）
- 不存在明确的领域匹配
- 通用执行已足够

### 第 3.5 阶段：调度元评审者（按需求类型分组，全部并行）

在调度实现 agent 之前，根据第 2 阶段的需求分组分析结果调度元评审者。元评审者的数量取决于分组方式：每个可重复组一个、每个共享组一个、每个独立任务一个。无论分组类型如何，所有元评审者都会并行启动。每个元评审者都会生成评分标准、检查清单和评分准则。每份规范仅会复用于其关联任务的所有重试。

重要：遵循上下文隔离原则——仅向每个 agent 传递与其特定目标或分组相关的上下文。

#### 3.5.1 按分组类型划分的元评审者提示模板

**独立元评审者提示：**

```markdown
## Task

Generate an evaluation specification yaml for the following task applied to a specific target. You will produce rubrics, checklists, and scoring criteria that a judge agent will use to evaluate the implementation artifact for this specific target.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## User Prompt as Context
{Original user prompt}

## Target
{Specific target for this meta-judge: task description, file path, component name, etc. extracted from User Prompt}

## Context
{Any relevant codebase context, file paths, constraints}

## Artifact Type
{code | documentation | configuration | etc.}

## Instructions
User prompt is provided as context, you should use it only as reference of changes that can occur in the project by other agents. Generate evaluation specification ONLY on the for the your specific target, generated from User Prompt. Your report will be used to verify only this particular task, not the all tasks in the user prompt.
Return only the final evaluation specification YAML in your response.
```

**可重复组元评审者提示（每组一个）：**

```markdown
## Task

Generate a REUSABLE evaluation specification yaml that can be applied to ANY of the following targets performing the same task. You will produce rubrics, checklists, and scoring criteria that individual judge agents will each use independently to evaluate one target's implementation artifact.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## User Prompt as Context
{Original user prompt}

## Task Being Repeated
{The common task description shared by all targets in this group}

## Targets in This Group
{List of all targets: file paths, component names, etc.}

## Context
{Any relevant codebase context, file paths, constraints}

## Artifact Type
{code | documentation | configuration | etc.}

## Instructions
CRITICAL: You are generating a REUSABLE spec that will be applied to EACH target independently by separate judges.
- Use generic language: "target file should align with criteria" instead of "all files should align"
- Do NOT include file-specific requirements (e.g., NOT "file should have only authentication logic") if the same spec will be applied to another target which logically cannot fulfill this criteria (e.g., "cart.ts" or "payments.ts" cannot have authentication logic)
- The spec must be applicable to ANY target in this group without modification
- Each judge will receive this same spec and evaluate only its own target against it
User prompt is provided as context, you should use it only as reference of changes that can occur in the project by other agents.
Return only the final evaluation specification YAML in your response.
```

**共享组元评审提示词（每组一个）：**

```markdown
## Task

Generate a COMBINED evaluation specification yaml that covers ALL of the following related tasks. These tasks are interdependent and will be reviewed TOGETHER by a single judge. You will produce rubrics, checklists, and scoring criteria that account for cross-task dependencies and integration points.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## User Prompt as Context
{Original user prompt}

## Tasks in This Shared Group
{List of all tasks with their targets:
- Task 1: {description} -> {target}
- Task 2: {description} -> {target}
}

## Context
{Any relevant codebase context, file paths, constraints, integration points between tasks}

## Artifact Type
{code | documentation | configuration | etc.}

## Instructions
CRITICAL: You are generating a COMBINED spec for tasks that will be reviewed TOGETHER by ONE judge.
- Include evaluation criteria for EACH individual task
- Include cross-task verification criteria (e.g., "adapter implementation matches the interface consumed by the integration module")
- Organize the spec so the judge can identify which criteria apply to which task's changes
- The judge will review ALL changes from ALL tasks in this group in a single evaluation
User prompt is provided as context, you should use it only as reference of changes that can occur in the project by other agents.
Return only the final evaluation specification YAML in your response.
```

#### 3.5.2 调度模式

**在 SINGLE response 中调度所有元评审（无论分组类型为何）：**

```
Use Task tool (one per group/independent task, all in same message):

[Meta-judge for Repeatable Group: "add tests"]
  - description: "Meta-judge (repeatable): reusable spec for adding tests across 3 modules"
  - prompt: {repeatable group meta-judge prompt}
  - model: {meta-judge model — the user's `--model` if one was passed; otherwise the HIGHEST current implementation tier among the group's tasks, or one tier up per Role Pairing}
  - subagent_type: "sadd:meta-judge"

[Meta-judge for Shared Group: "S3 adapter + integration"]
  - description: "Meta-judge (shared): combined spec for S3 adapter implementation and integration"
  - prompt: {shared group meta-judge prompt}
  - model: {meta-judge model — the user's `--model` if one was passed; otherwise the HIGHEST current implementation tier among the group's tasks, or one tier up per Role Pairing}
  - subagent_type: "sadd:meta-judge"

[Meta-judge for Independent Task: "update CI pipeline"]
  - description: "Meta-judge: update CI pipeline"
  - prompt: {independent meta-judge prompt}
  - model: {meta-judge model — the user's `--model` if one was passed; otherwise this task's implementation tier, or one tier up per Role Pairing}
  - subagent_type: "sadd:meta-judge"

[All meta-judges launched simultaneously]
```

**关键要求：**不要等到所有元评审都完成后再进入第 4 阶段。每个元评审完成后，立即启动实现代理。如果所有元评审均已完成，则在 SINGLE response 中启动所有实现代理。

### 第 4 阶段：构建每个目标的提示词

为每个目标构建相同的提示词结构，仅使用特定于目标的详细信息进行定制：

#### 4.1 零样本思维链前缀（必需 - 必须位于首位）

```markdown
## Reasoning Approach

Let's think step by step.

Before taking any action, think through the problem systematically:

1. "Let me first understand what is being asked for this specific target..."
   - What is the core objective?
   - What are the explicit requirements?
   - What constraints must I respect?

2. "Let me analyze this specific target..."
   - What is the current state?
   - What patterns or conventions exist?
   - What context is relevant?

3. "Let me plan my approach..."
   - What are the concrete steps?
   - What could go wrong?
   - Is there a simpler approach?

Work through each step explicitly before implementing.
```

#### 4.2 任务正文（针对每个目标进行定制）

```markdown
<task>
{Task description from $ARGUMENTS}
</task>

<target>
{Specific target for this agent: file path, component name, etc.}
</target>

<constraints>
- Work ONLY on the specified target
- Do NOT modify other files unless explicitly required
- Follow existing patterns in the target
- {Any additional constraints from context}
- Critical: you not allowed to use any mutation git commands, including, but not limited: commit, stash, push, checkout, reset, revert, etc. Except cases when task EXPLICITLY allows or requires it. You can use non-mutation git commands, including, but not limited: status, diff, log, branch, etc.
</constraints>

<output>
{Expected deliverable location and format}

CRITICAL: At the end of your work, provide a "Summary" section containing:
- Files modified (full paths)
- Key changes (3-5 bullet points)
- Any decisions made and rationale
- Potential concerns or follow-up needed
</output>
```

#### 4.3 自我批评后缀（必需 - 必须位于末尾）

```markdown
## Self-Critique Verification (MANDATORY)

Before completing, verify your work for this target. Do not submit unverified changes.

### 1. Generate Verification Questions

Create questions specific to your task and target. There examples of questions:

| # | Question | Why It Matters |
|---|----------|----------------|
| 1 | Did I achieve the stated objective for this target? | Incomplete work = failed task |
| 2 | Are my changes consistent with patterns in this file/codebase? | Inconsistency creates technical debt |
| 3 | Did I introduce any regressions or break existing functionality? | Breaking changes are unacceptable |
| 4 | Are edge cases and error scenarios handled appropriately? | Edge cases cause production issues |
| 5 | Is my output clear, well-formatted, and ready for review? | Unclear output reduces value |

### 2. Answer Each Question with Evidence

For each question, provide specific evidence from your work:

[Q1] Objective Achievement:
- Required: [what was asked]
- Delivered: [what you did]
- Gap analysis: [any gaps]

[Q2] Pattern Consistency:
- Existing pattern: [observed pattern]
- My implementation: [how I followed it]
- Deviations: [any intentional deviations and why]

[Q3] Regression Check:
- Functions affected: [list]
- Tests that would catch issues: [if known]
- Confidence level: [HIGH/MEDIUM/LOW]

[Q4] Edge Cases:
- Edge case 1: [scenario] - [HANDLED/NOTED]
- Edge case 2: [scenario] - [HANDLED/NOTED]

[Q5] Output Quality:
- Well-organized: [YES/NO]
- Self-documenting: [YES/NO]
- Ready for PR: [YES/NO]

### 3. Fix Issues Before Submitting

If ANY verification reveals a gap:
1. **FIX** - Address the specific issue
2. **RE-VERIFY** - Confirm the fix resolves the issue
3. **DOCUMENT** - Note what was changed and why

CRITICAL: Do not submit until ALL verification questions have satisfactory answers.
```

### 阶段 5：并行实施调度与裁判验证

完成元裁判后，同时启动所有实施子代理，然后根据分组类型使用裁判进行验证。

#### 5.1 执行流程

**独立 / 可重复流程**（每个任务一个裁判）：

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   Phase 3.5: Meta-Judge Dispatch (ALL in parallel)                      │
│                                                                         │
│   Independent:            Repeatable Group:                             │
│   ┌──────────────┐        ┌─────────────────────┐                       │
│   │ Meta-Judge A  │        │ Meta-Judge (shared)  │                       │
│   │ (tier)        │        │ (tier)               │                       │
│   │ → Spec YAML A │        │ → Reusable Spec YAML │                       │
│   └──────┬───────┘        └──────────┬──────────┘                       │
│          │                     ┌─────┴─────┐                            │
│          ▼                     ▼           ▼                            │
│   Phase 5: Implementation (ALL in parallel, one per task)               │
│                                                                         │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐               │
│   │ Implementer A │   │ Implementer B │   │ Implementer C │              │
│   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘               │
│          │                  │                  │                        │
│          ▼                  ▼                  ▼                        │
│   Phase 5.2: Judge per task (after ALL implementors complete)           │
│                                                                         │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐               │
│   │  Judge A      │   │  Judge B      │   │  Judge C      │              │
│   │ +Spec YAML A  │   │ +Reusable Spec│   │ +Reusable Spec│               │
│   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘               │
│          ▼                  ▼                  ▼                        │
│   Parse Verdict (per target) → PASS/FAIL → Retry if needed             │
└─────────────────────────────────────────────────────────────────────────┘
```

**共享流程**（整个分组一个裁判）：

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   Phase 3.5: Meta-Judge for Shared Group                                │
│   ┌──────────────────────┐                                              │
│   │ Meta-Judge (combined) │                                              │
│   │ (tier)                │                                              │
│   │ → Combined Spec YAML  │                                              │
│   └──────────┬───────────┘                                              │
│         ┌────┴────┐                                                     │
│         ▼         ▼                                                     │
│   Phase 5: Implementation (one per task, in parallel)                   │
│   ┌──────────────┐   ┌──────────────┐                                   │
│   │ Implementer X │   │ Implementer Y │                                  │
│   └──────┬───────┘   └──────┬───────┘                                   │
│          │                  │                                           │
│          └────────┬─────────┘                                           │
│                   ▼                                                     │
│   Phase 5.2: ONE Judge for entire group                                 │
│   ┌────────────────────────────────┐                                    │
│   │  Judge (shared)                 │                                    │
│   │ +Combined Spec YAML             │                                    │
│   │ +ALL implementation outputs     │                                    │
│   └──────────────┬─────────────────┘                                    │
│                  ▼                                                      │
│   Parse per-task verdicts → Retry ONLY failing task(s) if needed        │
└─────────────────────────────────────────────────────────────────────────┘
```

**关键：并行调度模式**

在**同一响应中**启动所有实现代理。不要等待一个代理完成后再启动另一个代理：

```markdown
## Dispatching 3 parallel tasks

[Task 1]
Use Task tool:
  description: "Parallel: simplify error handling in src/services/user.ts"
  prompt: [CoT prefix + task body for user.ts + critique suffix]
  model: sonnet

[Task 2]
Use Task tool:
  description: "Parallel: simplify error handling in src/services/order.ts"
  prompt: [CoT prefix + task body for order.ts + critique suffix]
  model: sonnet

[Task 3]
Use Task tool:
  description: "Parallel: simplify error handling in src/services/payment.ts"
  prompt: [CoT prefix + task body for payment.ts + critique suffix]
  model: sonnet

[All 3 tasks launched simultaneously - results collected when all complete]
```

**并行化指南：**
- 在同一批次中启动所有相互独立的任务
- 不要等待一个任务完成后再启动另一个任务
- 不要顺序调用 Task 工具
- Task 工具会自动处理并行化
- 等所有任务完成后再收集结果

**上下文隔离（重要）：**
- 只传递与每个具体目标相关的上下文
- 不要将所有目标的完整列表传递给每个代理
- 让子代理通过读取文件来发现本地模式
- 每个代理都在干净的上下文中工作，避免累积混淆

#### 5.2 Judge 验证协议

在**所有实现代理完成后**，根据 Phase 2 中确定的需求分组来调度评审代理。调度模式取决于分组类型：

| 分组类型 | 评审代理调度方式 | 使用的规范 |
|---------------|---------------|-----------|
| **独立** | 每个任务一个评审代理 | 任务专属的元评审规范 |
| **可重复** | 每个任务一个评审代理 | 该分组元评审中的**同一份**可复用规范 |
| **共享** | 整个分组使用**一个**评审代理 | 该分组元评审中的组合规范 |

关键要求：向评审代理提供**完整且精确的元评审评估规范 YAML**，不得跳过、添加或以任何方式修改其中的内容，不得删减或总结其中的任何文本！对于可重复分组，每个目标的评审代理都必须接收**同一份**可复用规范。对于共享分组，单个评审代理必须接收覆盖所有任务的组合规范。

##### 5.2.1 分析预先存在的或预期中的并行变更部分

在调度每个目标的评审代理之前，评估代码库中是否存在评审代理需要了解的预先存在的或预期中的并行变更。**“预先存在的或预期中的并行变更”**部分用于防止评审代理将先前的修改误认为是当前实现代理所完成的工作。

**包含该部分的情况：**

- 同一会话中先前的 do-in-parallel 运行已经完成（之前批次中的所有目标）
- 用户在调用此 skill 之前手动进行的修改（可从对话上下文或 git 中看到）
- 其他工具或代理在此次并行调度之前运行所产生的变更
- 同一批次中其他并行代理的预期变更（例如，预期其他代理将在仓库中的其他文件中进行修改）

**省略时机：**

- 这是首次运行，且没有已知的既有更改——完全省略此部分
- 在同一目标内重试时，不要将实现代理自己之前的尝试作为“预先存在的更改”包含在内——这些属于当前目标的迭代周期

**内容指南：**

- 使用高层次摘要：任务描述、受影响的文件/模块列表、更改的大致性质（创建、修改、删除）
- 不要包含代码块、差异或逐行细节——保持简洁
- 清楚标注来源：“Previous do-in-parallel: {description}”、“User modifications (before current task)”等
- 如果存在多个更改来源，请为每个来源使用单独的子节

关键要求：避免读取完整代码库或 Git 历史记录，只需使用高层次的 git diff/status 来确定哪些文件发生了更改，或使用对话上下文来确定是否存在任何预先存在的更改。

##### 5.2.2 使用提示词和特定目标的规范 YAML 启动 Judge

**Judge 提示词模板：**

```markdown
You are evaluating an implementation artifact for target {target_name} against an evaluation specification produced by the meta judge.

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## User Prompt
{Original task description from user}

## Target
{Specific target: file path or component name}

{IF pre-existing changes are known, include the following section — otherwise omit entirely}

## Pre-existing or Expected Parallel Changes (Context Only)

The following changes were made before or expected to be done by other parallel agents in the same batch now. They are NOT part of the current implementation agent's output. Focus your evaluation on the current agent's changes to its specific target. Only verify other changed files/logic if they directly relate to the current target's task requirements.

### {Source of changes: e.g., "Previous do-in-parallel: {task description}" or "User modifications (before current task)"}
{High-level summary: what was done, which files/modules were created or modified}

{END conditional section}

## Evaluation Specification

```yaml
{meta-judge's evaluation specification YAML}
```

## Implementation Output
{Summary section from implementation agent}
{Paths to files modified}

## Instructions
User prompt is provided as context, you should use it only as reference of changes that can occur in the project by other agents. Evaluate ONLY on the task from User Prompt. Your job to verify only this particular of the target, not the all tasks in the user prompt.
Follow your full judge process as defined in your agent instructions!

## Output

CRITICAL: You must reply with this exact structured evaluation report format in YAML at the START of your response!
```

关键要求：绝不要以任何形式提供分数阈值，包括 `threshold_pass` 或任何其他不同的形式。Judge 不得知道分数阈值，以免受到偏见影响！！！

##### 5.2.3 共享组 Judge 提示词模板

对于由一个 Judge 统一审查所有相关更改的共享组：

```markdown
你正在根据由元评审器生成的组合评估规范，评估一组相关任务的实现产物。这些任务相互依赖，必须结合起来进行审查。

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## 用户提示
{Original task description from user}

## 此共享组中的任务
{List of all tasks with their targets:
- Task 1: {description} -> {target}
- Task 2: {description} -> {target}
}

{IF pre-existing changes are known, include the "Pre-existing or Expected Parallel Changes (Context Only)" section — otherwise omit entirely}

## 评估规范

```yaml
{meta-judge's COMBINED evaluation specification YAML}
```

## 实现输出
{For each task in the group:}
### 任务：{task description} -> {target}
{Summary section from that task's implementation agent}
{Paths to files modified}

## 指令
用户提示作为上下文提供，你应仅将其作为项目中其他代理可能进行的更改的参考。请结合起来评估此共享组中的所有任务。验证跨任务的集成点（例如，适配器是否匹配集成模块所使用的接口？）。
关键要求：对于每个任务，分别指出其是否 PASSED 或 FAILED，以便只有失败的任务可以重试。
请遵循代理指令中定义的完整评审流程！

## 输出

关键要求：你必须在回复开头使用以下确切的结构化评估报告格式，以 YAML 形式输出！在报告中包含每个任务的裁决。
```

##### 5.2.4 按分组类型分派评审器

**独立且可重复的目标——每个任务一个评审器：**

```
使用 Task 工具：
  - description: "Judge: {target name}"
  - prompt: {judge verification prompt with exact meta-judge specification YAML, and Pre-existing or Expected Parallel Changes section if applicable}
  - model: {judge model — the user's `--model` if one was passed; otherwise MUST equal this task's current implementation tier, including after escalation}
  - subagent_type: "sadd:judge"
```

对于可重复组，每个评审器都会收到该组单个元评审器提供的相同共享可复用规范，但其 **model** 仍然是该任务自身当前的实现层级——即使共享同一个规范，可重复任务的层级也可以不同。评审器提示模板采用 5.2.2 中的原样模板；只有目标和实现输出不同。

**共享组——整个组使用一个评审器：**

```
使用 Task 工具：
  - description: "Judge (shared): {group description}"
  - prompt: {shared group judge prompt from 5.2.3 with combined meta-judge specification YAML and ALL implementation outputs}
  - model: {judge model — the user's `--model` if one was passed; otherwise MUST equal the HIGHEST current implementation tier among this group's tasks, including after any of them escalates}
  - subagent_type: "sadd:judge"
```

**并行启动所有评审器**（独立组、可重复组和共享组评审器均在同一响应中分派）。
```

严重：绝不得以任何格式提供分数阈值，包括 `threshold_pass` 或任何其他形式。评判者绝不能知道分数阈值是多少，以免产生偏见！！！

#### 5.3 解析判定结果并迭代

解析每个目标的评判者输出（不要读取完整报告）：

```
Extract from judge reply:
- VERDICT: PASS or FAIL
- SCORE: X.X/5.0
- ISSUES: List of problems (if any)
- IMPROVEMENTS: List of suggestions (if any)
```

**每个目标的决策逻辑：**

```
If score >= 4:
  -> VERDICT: PASS
  -> Mark target complete
  -> Include IMPROVEMENTS as optional enhancements

If 3.0 <= score < 4 and NOT STRICT_MODE:
  -> Apply the Iteration Discretion Rule (5.5)
     -> accepted -> VERDICT: PASS (mark target complete, report outstanding issues)
     -> declined -> VERDICT: FAIL -> go to "Check retry count" below

Otherwise (score < 3.0, or score < 4 with STRICT_MODE):
  -> VERDICT: FAIL
  -> Check retry count for this target

  If retries < 3:
    -> Decide this target's retry tier per "5.3.1 Model Escalation on Retry" below
       (per the Escalation Rule — bump BOTH implementation and judge, unless its sole hold exception applies)
    -> Dispatch retry implementation agent at that tier with judge feedback
    -> Return to judge verification with same target-specific meta-judge specification,
       dispatching the judge at the retry tier (judge always matches implementation)

  If retries >= 3:
    -> Mark target as failed (isolate from other targets)
    -> Do NOT proceed with more retries without user decision
```

**重要：失败彼此隔离**
- 一个目标失败不会影响其他目标
- 其他并行任务继续独立执行
- 只重试失败的目标

**共享组判定结果解析：**

对于共享组，评判者会在单份报告中给出每个任务的判定结果。分别解析每个任务的判定结果：

```
Extract from shared judge reply:
- Per-task verdicts:
  - Task 1 ({target}): VERDICT: PASS/FAIL, SCORE: X.X/5.0, ISSUES: [...]
  - Task 2 ({target}): VERDICT: PASS/FAIL, SCORE: X.X/5.0, ISSUES: [...]
- OVERALL SCORE: X.X/5.0
- CROSS-TASK ISSUES: List of integration problems (if any)
```

**共享组重试逻辑：**

```
If shared judge finds failures:
  1. Identify which specific task(s) failed from per-task verdicts
  2. Re-launch ONLY the implementation agent(s) for the failed task(s)
     -- Do NOT re-launch agents whose tasks passed
  3. After retry implementation completes, re-launch the shared judge
     to review ALL changes again (passed + retried)
     -- The shared judge still uses the same combined meta-judge spec
  4. Repeat until all tasks pass or max retries reached for any task

CRITICAL: Only the specific failing implementation agent(s) are retried.
Passing tasks are NOT re-implemented. The shared judge always reviews
the complete group together on each evaluation round.
```

##### 5.3.1 重试时的模型升级

在分派任何重试之前，你必须根据完整适用的[升级规则](#escalation-rule)明确决定失败任务的层级，包括其中唯一的保持不变例外，并将该决定记录在结果表中该目标对应的行内。重试专用的补充要求如下：

- **触发条件 (1) 在此处以 `score < 3.0` 为界**（或出现表明模型误解任务、而不仅仅是遗漏细节的问题）。
- **范围：**遵循 [升级规则](#escalation-rule)。
- **独立评审器和可重复组评审器：**重试任务的评审器 MUST 以与重试实现相同的层级进行调度。
- **共享组评审器：**由于同一组中的所有任务都由一个评审器统一评审，其重试层级 MUST 等于该组任务当前实现层级中的**最高层级**——因此，即使未升级的同组任务仍保持原始层级，已升级任务的评审覆盖层级也绝不会低于其自身层级。
- 任务的元评审器（对于可重复/共享组，则为该组的元评审器）既不会重新运行，也不会重新分层；其规范会在每次重试中复用。
- 升级后的层级仅适用于**该任务剩余的尝试次数**——其他所有目标仍保持其在 [Phase 3](#phase-3-model-and-agent-selection) 中分配的层级。
- 如果 `opus` 仍然失败，则按照 [错误处理](#error-handling) 将问题升级给用户。

#### 5.4 带反馈重试（如需要）

**重试提示模板：**

```markdown
## Retry Required for Target: {target_name}

Your previous implementation did not pass judge verification.

## Original Task
{Original task description}

## Target
{Specific target}

## Judge Feedback
VERDICT: FAIL
SCORE: {score}/5.0
ISSUES:
{list of issues from judge}

## Your Previous Changes
{files modified in previous attempt}

## Instructions
Let's fix the identified issues step by step.

1. Review each issue the judge identified
2. For each issue, determine the root cause
3. Plan the fix for each issue
4. Implement ALL fixes
5. Verify your fixes address each issue
6. Provide updated Summary section

CRITICAL: Focus on fixing the specific issues identified. Do not rewrite everything.
```

#### 5.5 迭代裁量规则

你的主要任务是在目标质量范围内**完成**任务，而迭代投入 MUST 与每个目标的规模保持成比例。以下两种失败模式同样真实：

- 在琐碎问题上消耗重试次数和上下文，导致整个批次无法完成 → **任务失败**。
- 接受质量确实过低、无法视为已完成的目标 → **更严重的失败**。

对每个评审分数应用以下规则（对于共享组，则对组内每个任务的评审结论分别应用）：

- **`score < 3.0` → FAIL，无条件执行。**不得裁量。根据评审反馈重试，直到目标通过或达到最大重试次数。
- **`3.0 <= score < 4.0` → 裁量区间。**只有在此区间内，你 MAY 决定接受低于 `4.0` 目标分数的目标。固定的 `4.0` 目标使有效下限为 `3.0`，因此不需要单独的有界降级保护。
- 在此区间内，当剩余问题**仅**为低/中优先级问题时（任何 High 或 Critical 级别的问题都会完全取消裁量权），并且这些问题均不违反目标要求或造成有意义的缺陷（即仅为琐碎问题），你 MUST 先进行判断——在调度重试之前——评估再次尝试是否值得付出的时间和上下文成本。
- **最多进行一次由琐碎问题驱动的重试**，且该次重试计入重试预算。如果重试后仍然只发现琐碎问题，你 MUST 将目标标记为完成（`ACCEPTED`），在最终摘要中报告尚未解决的问题，然后继续处理。如果返回的分数低于 `3.0`，则适用无条件 FAIL 规则。
- 你 MUST 保持批判性，**不得放宽标准**。停止在低于目标分数的位置 MUST 是基于不存在真实的、违反要求的问题而作出的有意决定。阻碍目标在最大重试次数内完成的真实阻塞性问题 MUST 报告为失败目标，绝不能掩盖过去。
- **如果 `STRICT_MODE` 为 true，则整条规则被禁用**：只有在 `score >= 4.0` 或达到最大重试次数时才停止。`--strict` 不会改变其他任何内容——`4.0` 目标分数、最大重试次数限制、`< 3.0` 无条件 FAIL 规则以及元评审器/评审器调度均不受影响。

### 阶段 6：收集并总结结果

所有代理完成后（根据需要进行重试），汇总结果：

```markdown
## Parallel Execution Summary

### Configuration
- **Task:** {task description}
- **Models Used:** {tiers seen across all targets, e.g. "sonnet (3), opus (1), haiku (1)" — or `--model` override if the user passed one; see Results table for per-target detail}
- **Targets:** {count} items
- **Strict Mode:** {STRICT_MODE}

### Results

| Target | Grouping | Model | Judge Score | Retries | Status | Summary |
|--------|----------|-------|-------------|---------|--------|---------|
| {target_1} | {Repeatable/Shared/Independent} | {model} | {X.X}/5.0 | {0-3} | SUCCESS | {brief outcome} |
| {target_2} | {Repeatable/Shared/Independent} | {model} | {X.X}/5.0 | {0-3} | SUCCESS | {brief outcome} |
| {target_3} | {Repeatable/Shared/Independent} | {model} | {X.X}/5.0 | {3} | FAILED | {failure reason} |
| ... | ... | ... | ... | ... | ... | ... |

Status is `SUCCESS` (score >= 4.0), `ACCEPTED` (below target per the [Iteration Discretion Rule](#55-iteration-discretion-rule) — list the outstanding nitpicks in the Verification Summary), or `FAILED`.

**Model** is the tier the target finished at; when [escalation](#531-model-escalation-on-retry) fired, record it as `{starting tier} → {final tier}`.

### Overall Assessment
- **Completed:** {X}/{total}
- **Failed:** {Y}/{total}
- **Total Retries:** {sum of all retries}
- **Common patterns:** {any patterns across results}

### Verification Summary
{Aggregate judge verification results - any common issues?}

### Files Modified
- {list of all modified files}

### Failed Targets (If Any)
{For each failed target after max retries}
- **Target:** {name}
- **Final Score:** {X.X}/5.0
- **Persistent Issues:** {issues that weren't resolved}
- **Options:** Retry with guidance / Skip / Manual fix

### Next Steps
{If any failures, suggest remediation}
```

**失败处理：**
- 清晰报告失败的任务及错误详情
- 成功的任务不受失败影响
- 达到最大重试次数后，隔离失败的目标
- 提供选项：提供指导、跳过或手动修复

## 示例

### 示例 1：需求分组——可重复任务 + 独立任务混合（包含之前批次的已有更改）

**场景：**

一个团队连续运行两个并行执行批次。第一个批次更新 3 个端点文件（`src/api/users.ts`、`src/api/orders.ts`、`src/api/products.ts`）中的 API 文档。第二个批次为 `src` 文件夹中的全部 3 个模块添加测试，并在 GitHub Actions 中添加测试步骤。第二个批次中每个代理的评审者都需要了解第一个批次中的文档更改，以及同一第二批次中其他并行代理预期进行的更改。

**输入（第二个批次——第一个批次已在本次会话的更早阶段完成）：**

```
/do-in-parallel add tests to all 3 modules in src folder and add tests step to github actions
```

**编排器分析：**

```
Phase 2: Task Analysis + Requirement Grouping

1. Task Identification:
   - Task A: "Add tests to src/modules/auth.ts"
   - Task B: "Add tests to src/modules/cart.ts"
   - Task C: "Add tests to src/modules/payments.ts"
   - Task D: "Add tests step to GitHub Actions CI pipeline"

2. Requirement Grouping:
   - Tasks A, B, C: REPEATABLE — same task ("add tests") applied to 3 different modules
     → ONE shared meta-judge producing a reusable spec
   - Task D: INDEPENDENT — different task type (CI configuration)
     → Separate meta-judge

3. Pre-existing and Expected Parallel Changes Assessment:
   - Pre-existing (from prior batch): API documentation updated across
     src/api/users.ts, src/api/orders.ts, src/api/products.ts
   - Expected parallel: Each agent should be aware that other agents in this
     batch are adding tests to other modules and updating GH Actions simultaneously

4. Agent Count:
   - Meta-judges: 2 (1 repeatable for tests + 1 independent for GH Actions)
   - Implementation agents: 4 (one per task, always isolated)
   - Judges: 4 (3 using shared test spec + 1 for GH Actions)
   - Total: 10 agents (vs. 12 without grouping)
```

**阶段 3：模型选择**

| 目标 | 分组 | 层级 | 理由 |
|--------|----------|------|-----------|
| src/modules/auth.ts | 可重复 | opus | opus 是 EARNED ——即使任务本身“只是”添加测试，关键触发条件仍会在 auth 域触发；错误的测试可能掩盖真正的 auth 缺陷 |
| src/modules/cart.ts | 可重复 | sonnet | 在既有模式基础上编写代码（生成测试）；cart.ts 没有关键域触发条件 |
| src/modules/payments.ts | 可重复 | opus | opus 是 EARNED ——关键触发条件会在 payments 域触发 |
| .github/workflows/ci.yml | 独立 | haiku | 遵循现有流水线约定，进行一次小型、机械性的 CI 步骤添加 |

可重复分组中的任务虽然共享同一个元评审器规范，但并不共享同一个层级：auth.ts 和 payments.ts 各自独立触发了关键条件，而 cart.ts 没有触发。共享的元评审器本身运行在 `opus` 层级，这是其服务的三个任务中的最高层级。

**阶段 3.5：元评审器调度（2 个元评审器并行运行）：**

```
[Meta-judge 1: Repeatable group — test generation]
Use Task tool:
  - description: "Meta-judge (repeatable): reusable spec for adding tests across 3 modules"
  - prompt:
    ## Task

    Generate a REUSABLE evaluation specification yaml that can be applied to
    ANY of the following targets performing the same task. You will produce
    rubrics, checklists, and scoring criteria that individual judge agents
    will each use independently to evaluate one target's implementation artifact.

    CLAUDE_PLUGIN_ROOT={CLAUDE_PLUGIN_ROOT}

    ## User Prompt as Context
    add tests to all 3 modules in src folder and add tests step to github actions

    ## Task Being Repeated
    Add comprehensive unit tests to a source module

    ## Targets in This Group
    - src/modules/auth.ts
    - src/modules/cart.ts
    - src/modules/payments.ts

    ## Context
    Project uses Jest for testing. Test files should be co-located as
    *.test.ts files. Existing test patterns available in src/modules/__tests__/.

    ## Artifact Type
    code

    ## Instructions
    CRITICAL: You are generating a REUSABLE spec that will be applied to
    EACH target independently by separate judges.
    - Use generic language: "target file should align with criteria" instead
      of "all files should align"
    - Do NOT include file-specific requirements (e.g., NOT "auth.ts should
      test only authentication logic") since this same spec will be applied
      to different files
    - The spec must be applicable to ANY target in this group without modification
    - Each judge will receive this same spec and evaluate only its own target
      against it
    User prompt is provided as context, you should use it only as reference
    of changes that can occur in the project by other agents.
    Return only the final evaluation specification YAML in your response.
  - model: opus
  - subagent_type: "sadd:meta-judge"

[Meta-judge 2: Independent — GitHub Actions]
Use Task tool:
  - description: "Meta-judge: add tests step to GitHub Actions"
  - prompt:
    ## Task

    Generate an evaluation specification yaml for the following task applied
    to a specific target. You will produce rubrics, checklists, and scoring
    criteria that a judge agent will use to evaluate the implementation
    artifact for this specific target.

    CLAUDE_PLUGIN_ROOT={CLAUDE_PLUGIN_ROOT}

    ## User Prompt as Context
    add tests to all 3 modules in src folder and add tests step to github actions

    ## Target
    Add a test execution step to the GitHub Actions CI pipeline
    (.github/workflows/ci.yml or similar)

    ## Context
    Project uses Jest for testing. The CI pipeline should run tests after
    build step. Existing workflow file may need a new job or step.

    ## Artifact Type
    configuration

    ## Instructions
    User prompt is provided as context, you should use it only as reference
    of changes that can occur in the project by other agents. Generate
    evaluation specification ONLY for adding the tests step to GitHub Actions.
    Your report will be used to verify only this particular task, not the
    all tasks in the user prompt.
    Return only the final evaluation specification YAML in your response.
  - model: haiku
  - subagent_type: "sadd:meta-judge"

[Both meta-judges launched simultaneously]
```

**阶段 5：实现分派（4 个代理并行，在元评审者完成后）：**

```
[Implementation 1: auth module tests]
Use Task tool:
  - description: "Parallel: add tests to src/modules/auth.ts"
  - prompt:
    ## Reasoning Approach
    Let's think step by step.
    Before taking any action, think through the problem systematically:
    1. "Let me first understand what is being asked for this specific target..."
    2. "Let me analyze this specific target..."
    3. "Let me plan my approach..."
    Work through each step explicitly before implementing.

    <task>Add comprehensive unit tests</task>
    <target>src/modules/auth.ts</target>
    <constraints>
    - Work ONLY on the specified target
    - Do NOT modify other files unless explicitly required
    - Follow existing test patterns in the project
    </constraints>
    <output>
    Create test file for the auth module.
    CRITICAL: At the end of your work, provide a "Summary" section containing:
    - Files modified (full paths)
    - Key changes (3-5 bullet points)
    - Any decisions made and rationale
    </output>

    ## Self-Critique Verification (MANDATORY)
    [standard self-critique suffix]
  - model: opus  # opus is EARNED — critical trigger: auth.ts implements authentication logic

[Implementation 2: cart module tests]
Use Task tool:
  - description: "Parallel: add tests to src/modules/cart.ts"
  - prompt:
    ## Reasoning Approach
    Let's think step by step.
    Before taking any action, think through the problem systematically:
    1. "Let me first understand what is being asked for this specific target..."
    2. "Let me analyze this specific target..."
    3. "Let me plan my approach..."
    Work through each step explicitly before implementing.

    <task>Add comprehensive unit tests</task>
    <target>src/modules/cart.ts</target>
    <constraints>
    - Work ONLY on the specified target
    - Do NOT modify other files unless explicitly required
    - Follow existing test patterns in the project
    </constraints>
    <output>
    Create test file for the cart module.
    CRITICAL: At the end of your work, provide a "Summary" section containing:
    - Files modified (full paths)
    - Key changes (3-5 bullet points)
    - Any decisions made and rationale
    </output>

    ## Self-Critique Verification (MANDATORY)
    Before submitting, verify your work:
    1. Re-read the original task and confirm every requirement is addressed
    2. Check that all tests follow existing patterns in the project
    3. Verify no unrelated files were modified
    4. Confirm the Summary section is complete and accurate
  - model: sonnet

[Implementation 3: payments module tests]
Use Task tool:
  - description: "Parallel: add tests to src/modules/payments.ts"
  - prompt: [Same CoT prefix + task body for payments.ts + critique suffix]
  - model: opus  # opus is EARNED — critical trigger: payments.ts is the payments/billing domain

[Implementation 4: GitHub Actions test step]
Use Task tool:
  - description: "Parallel: add tests step to GitHub Actions CI"
  - prompt:
    ## Reasoning Approach
    Let's think step by step.
    Before taking any action, think through the problem systematically:
    1. "Let me first understand what is being asked for this specific target..."
    2. "Let me analyze this specific target..."
    3. "Let me plan my approach..."
    Work through each step explicitly before implementing.

    <task>Add a test execution step to the GitHub Actions CI pipeline</task>
    <target>.github/workflows/ci.yml</target>
    <constraints>
    - Work ONLY on the CI workflow file
    - Add a step that runs the test suite after the build step
    - Do NOT modify other workflow files or steps beyond what is necessary
    - Follow existing workflow patterns and conventions
    </constraints>
    <output>
    Update the CI workflow with a test execution step.
    CRITICAL: At the end of your work, provide a "Summary" section containing:
    - Files modified (full paths)
    - Key changes (3-5 bullet points)
    - Any decisions made and rationale
    </output>

    ## Self-Critique Verification (MANDATORY)
    Before submitting, verify your work:
    1. Re-read the original task and confirm every requirement is addressed
    2. Check that the workflow YAML is valid and well-structured
    3. Verify no unrelated workflow steps were modified
    4. Confirm the Summary section is complete and accurate
  - model: haiku

[All 4 launched simultaneously]
```

**阶段 5.2：评审者调度（4 个评审者并行，在所有实现者完成后）：**

```
[Judge 1: auth module — uses SHARED reusable spec from repeatable meta-judge]
Use Task tool:
  - description: "Judge: src/modules/auth.ts"
  - prompt:
    You are evaluating an implementation artifact for target
    src/modules/auth.ts against an evaluation specification produced
    by the meta judge.

    CLAUDE_PLUGIN_ROOT={CLAUDE_PLUGIN_ROOT}

    ## User Prompt
    add tests to all 3 modules in src folder and add tests step to github actions

    ## Target
    src/modules/auth.ts

    ## Pre-existing and expected parallel changes (Context Only)

    The following changes were made before or expected to be done by
    other parallel agents in the same batch now. They are NOT part of
    the current implementation agent's output. Focus your evaluation
    on the current agent's changes to its specific target. Only verify
    other changed files/logic if they directly relate to the current
    target's task requirements.

    ### Previous do-in-parallel: "Update API documentation for all endpoints"
    The following files were modified as part of a previous parallel batch:
    - src/api/users.ts (modified) - Added JSDoc to public methods,
      updated module header
    - src/api/orders.ts (modified) - Added JSDoc to public methods,
      added @example tags
    - src/api/products.ts (modified) - Added JSDoc to public methods,
      updated type annotations

    ### Expected parallel changes (current batch)
    Other agents in this batch are simultaneously:
    - Adding tests to src/modules/cart.ts and src/modules/payments.ts
      (repeatable group — same task on other modules)
    - Adding a tests step to .github/workflows/ci.yml (independent task)

    ## Evaluation Specification
    ```yaml
    {EXACT reusable spec YAML from repeatable meta-judge — same for all 3 module judges}
    ```

    ## Implementation Output
    {Summary from auth implementation agent}

    ## Instructions
    User prompt is provided as context, you should use it only as reference
    of changes that can occur in the project by other agents. Evaluate ONLY
    the test generation for auth.ts.
    Follow your full judge process as defined in your agent instructions!

    ## Output
    CRITICAL: You must reply with this exact structured evaluation report
    format in YAML at the START of your response!
  - model: opus  # matches auth.ts's own implementation tier, not the group's shared meta-judge tier
  - subagent_type: "sadd:judge"

[Judge 2: cart module — uses SAME shared reusable spec]
Use Task tool:
  - description: "Judge: src/modules/cart.ts"
  - prompt: [Same judge template, same reusable spec YAML, cart implementation output.
    Pre-existing and expected parallel changes section: same prior batch info,
    expected parallel changes list auth.ts, payments.ts, and GH Actions instead]
  - model: sonnet  # matches cart.ts's own implementation tier
  - subagent_type: "sadd:judge"

[Judge 3: payments module — uses SAME shared reusable spec]
Use Task tool:
  - description: "Judge: src/modules/payments.ts"
  - prompt: [Same judge template, same reusable spec YAML, payments implementation output.
    Pre-existing and expected parallel changes section: same prior batch info,
    expected parallel changes list auth.ts, cart.ts, and GH Actions instead]
  - model: opus  # matches payments.ts's own implementation tier
  - subagent_type: "sadd:judge"

[Judge 4: GitHub Actions — uses INDEPENDENT spec from GH Actions meta-judge]
Use Task tool:
  - description: "Judge: GitHub Actions CI"
  - prompt:
    You are evaluating an implementation artifact for target
    .github/workflows/ci.yml against an evaluation specification produced
    by the meta judge.

    CLAUDE_PLUGIN_ROOT={CLAUDE_PLUGIN_ROOT}

    ## User Prompt
    add tests to all 3 modules in src folder and add tests step to github actions

    ## Target
    .github/workflows/ci.yml

    ## Pre-existing and expected parallel changes (Context Only)

    The following changes were made before or expected to be done by
    other parallel agents in the same batch now. They are NOT part of
    the current implementation agent's output. Focus your evaluation
    on the current agent's changes to its specific target. Only verify
    other changed files/logic if they directly relate to the current
    target's task requirements.

    ### Previous do-in-parallel: "Update API documentation for all endpoints"
    The following files were modified as part of a previous parallel batch:
    - src/api/users.ts (modified) - Added JSDoc to public methods,
      updated module header
    - src/api/orders.ts (modified) - Added JSDoc to public methods,
      added @example tags
    - src/api/products.ts (modified) - Added JSDoc to public methods,
      updated type annotations

    ### Expected parallel changes (current batch)
    Other agents in this batch are simultaneously:
    - Adding tests to src/modules/auth.ts, src/modules/cart.ts,
      and src/modules/payments.ts (repeatable group — test generation)

    ## Evaluation Specification
    ```yaml
    {EXACT spec YAML from independent GH Actions meta-judge}
    ```

    ## Implementation Output
    {Summary from GH Actions implementation agent}

    ## Instructions
    User prompt is provided as context, you should use it only as reference
    of changes that can occur in the project by other agents. Evaluate ONLY
    the GitHub Actions test step.
    Follow your full judge process as defined in your agent instructions!

    ## Output
    CRITICAL: You must reply with this exact structured evaluation report
    format in YAML at the START of your response!
  - model: haiku  # matches ci.yml's own implementation tier
  - subagent_type: "sadd:judge"

[All 4 judges launched simultaneously]
```

**结果：**

| 目标 | 分组 | 模型 | 评审得分 | 重试次数 | 状态 |
|--------|----------|-------|-------------|---------|--------|
| src/modules/auth.ts | 可重复 | opus | 4.2/5.0 | 0 | 成功 |
| src/modules/cart.ts | 可重复 | sonnet | 4.0/5.0 | 0 | 成功 |
| src/modules/payments.ts | 可重复 | opus | 4.1/5.0 | 0 | 成功 |
| .github/workflows/ci.yml | 独立 | haiku | 4.3/5.0 | 0 | 成功 |

**总体情况：**4/4 已完成。Agent 总数：10（2 个元评审 + 4 个实现 + 4 个评审）

---

### 示例 2：需求分组——共享 + 可重复组合（包含预先存在的用户修改）

**场景：**

开发者在对话过程中一直在开发一个 Node.js 后端。他们重构了数据库连接层，并手动更新了多个服务模块，包括添加 S3 类接口。随后，他们调用 do-in-parallel 来实现并集成 S3 接口，同时重构 cart 模块。每个 Agent 的评审都需要了解用户之前的修改，以及同一批次中其他并行 Agent 的预期变更。

**输入：**

```
/do-in-parallel I wrote class interface for S3 service in s3.adapter.ts, please do 2 tasks: implement s3 adapter with tests and integrate s3 adapter to analytics module. Also refactor and simplify all files in cart module
```

**编排器分析：**

```
Phase 2: Task Analysis + Requirement Grouping

1. Task Identification:
   - Task A: "Implement S3 adapter with tests in src/adapters/s3.adapter.ts"
   - Task B: "Integrate S3 adapter into src/modules/analytics.module.ts"
   - Task C: "Refactor and simplify src/modules/cart/cart.service.ts"
   - Task D: "Refactor and simplify src/modules/cart/cart.repository.ts"
   - Task E: "Refactor and simplify src/modules/cart/cart.controller.ts"

2. Requirement Grouping:
   - Tasks A, B: SHARED — interdependent (adapter must match interface consumed
     by analytics integration; should be reviewed together)
     → ONE combined meta-judge, ONE shared judge
   - Tasks C, D, E: REPEATABLE — same task ("refactor and simplify") applied
     to 3 different files in cart module
     → ONE reusable meta-judge

3. Pre-existing and Expected Parallel Changes Assessment:
   - Pre-existing (user modifications): Refactored database connection layer
     (src/db/connection.ts, src/db/queries.ts), updated service modules,
     and added S3 class interface in src/adapters/s3.adapter.ts
   - Expected parallel: S3 adapter implementation and analytics integration
     run in parallel (shared group); cart refactoring agents run in parallel
     (repeatable group); both groups run simultaneously

4. Agent Count:
   - Meta-judges: 2 (1 shared for S3 work + 1 repeatable for cart refactoring)
   - Implementation agents: 5 (one per task, always isolated)
   - Judges: 4 (1 shared for S3 group + 3 individual for cart)
   - Total: 11 agents (vs. 15 without grouping)
```

**第 3 阶段：模型选择**

| 目标 | 分组 | 层级 | 理由 |
|-----------|----------|------|-----------|
| src/adapters/s3.adapter.ts | 共享 | opus | 共享契约触发项——其公共接口是 Task B 所集成的契约 |
| src/modules/analytics.module.ts | 共享 | opus | 共享契约触发项——针对配对任务中定义的适配器公共接口进行集成 |
| src/modules/cart/cart.service.ts | 可重复 | sonnet | 重构限定在单个文件内，不改变契约 |
| src/modules/cart/cart.repository.ts | 可重复 | sonnet | 重构限定在单个文件内，不改变契约 |
| src/modules/cart/cart.controller.ts | 可重复 | sonnet | 重构限定在单个文件内，不改变契约 |

共享组使用 `opus`，因为任务 A 和任务 B 共享一个契约——分析集成所使用的 S3 适配器公共接口——而 [Selection Rules](#selection-rules) 将其定义为 `opus` 触发条件：“当共享契约发生变化时，无论文件数量是多少”。可重复组使用 `sonnet`，因为每个 cart 文件都是彼此独立地进行重构，且没有契约变更。共享组的元评审者及其唯一的评审者也都使用 `opus`——Role Pairing 的默认设置是任务的三个角色全部使用相同层级，而共享评审者的层级是其所服务任务当前实现层级中的最高级别（两者都是 `opus`，因为它们一致）。

**阶段 3.5：元评审者调度（2 个元评审者并行）：**

```
[Meta-judge 1: Shared group — S3 adapter + integration]
Use Task tool:
  - description: "Meta-judge (shared): combined spec for S3 adapter and analytics integration"
  - prompt:
    ## Task

    Generate a COMBINED evaluation specification yaml that covers ALL of the
    following related tasks. These tasks are interdependent and will be
    reviewed TOGETHER by a single judge. You will produce rubrics, checklists,
    and scoring criteria that account for cross-task dependencies and
    integration points.

    CLAUDE_PLUGIN_ROOT={CLAUDE_PLUGIN_ROOT}

    ## User Prompt as Context
    I wrote class interface for S3 service in s3.adapter.ts, please do 2 tasks:
    implement s3 adapter with tests and integrate s3 adapter to analytics module.
    Also refactor and simplify all files in cart module

    ## Tasks in This Shared Group
    - Task A: Implement S3 adapter with tests -> src/adapters/s3.adapter.ts
    - Task B: Integrate S3 adapter into analytics module -> src/modules/analytics.module.ts

    ## Context
    The user has already written the class interface in s3.adapter.ts. Task A
    implements the interface methods and adds unit tests. Task B integrates the
    adapter into the analytics module. The adapter's public API from Task A must
    match what Task B consumes.

    ## Artifact Type
    code

    ## Instructions
    CRITICAL: You are generating a COMBINED spec for tasks that will be
    reviewed TOGETHER by ONE judge.
    - Include evaluation criteria for EACH individual task
    - Include cross-task verification criteria (e.g., "S3 adapter's public
      methods match the calls made by the analytics integration")
    - Organize the spec so the judge can identify which criteria apply to
      which task's changes
    - The judge will review ALL changes from ALL tasks in this group in a
      single evaluation
    User prompt is provided as context, you should use it only as reference
    of changes that can occur in the project by other agents.
    Return only the final evaluation specification YAML in your response.
  - model: opus
  - subagent_type: "sadd:meta-judge"

[Meta-judge 2: Repeatable group — cart refactoring]
Use Task tool:
  - description: "Meta-judge (repeatable): reusable spec for refactoring cart module files"
  - prompt:
    ## Task

    Generate a REUSABLE evaluation specification yaml that can be applied to
    ANY of the following targets performing the same task. You will produce
    rubrics, checklists, and scoring criteria that individual judge agents
    will each use independently to evaluate one target's implementation artifact.

    CLAUDE_PLUGIN_ROOT={CLAUDE_PLUGIN_ROOT}

    ## User Prompt as Context
    I wrote class interface for S3 service in s3.adapter.ts, please do 2 tasks:
    implement s3 adapter with tests and integrate s3 adapter to analytics module.
    Also refactor and simplify all files in cart module

    ## Task Being Repeated
    Refactor and simplify a source file in the cart module

    ## Targets in This Group
    - src/modules/cart/cart.service.ts
    - src/modules/cart/cart.repository.ts
    - src/modules/cart/cart.controller.ts

    ## Context
    All three files are in the cart module. Refactoring should simplify logic,
    reduce complexity, improve readability while preserving existing behavior.

    ## Artifact Type
    code

    ## Instructions
    CRITICAL: You are generating a REUSABLE spec that will be applied to
    EACH target independently by separate judges.
    - Use generic language: "target file should align with criteria" instead
      of "all files should align"
    - Do NOT include file-specific requirements since this same spec will be
      applied to different files
    - The spec must be applicable to ANY target in this group without modification
    User prompt is provided as context, you should use it only as reference
    of changes that can occur in the project by other agents.
    Return only the final evaluation specification YAML in your response.
  - model: sonnet
  - subagent_type: "sadd:meta-judge"

[Both meta-judges launched simultaneously]
```

**阶段 5：实现分派（5 个代理并行执行，在元评审代理完成后）：**

```
[Implementation 1: S3 adapter]
Use Task tool:
  - description: "Parallel: implement S3 adapter with tests"
  - prompt:
    ## Reasoning Approach
    Let's think step by step.
    Before taking any action, think through the problem systematically:
    1. "Let me first understand what is being asked for this specific target..."
    2. "Let me analyze this specific target..."
    3. "Let me plan my approach..."
    Work through each step explicitly before implementing.

    <task>Implement S3 adapter with tests based on the existing class interface</task>
    <target>src/adapters/s3.adapter.ts</target>
    <constraints>
    - Work ONLY on the specified target
    - Implement all methods defined in the existing class interface
    - Add comprehensive unit tests
    - Do NOT modify the analytics module
    </constraints>
    <output>
    Implement the S3 adapter and create tests.
    CRITICAL: At the end of your work, provide a "Summary" section containing:
    - Files modified (full paths)
    - Key changes (3-5 bullet points)
    - Any decisions made and rationale
    </output>

    ## Self-Critique Verification (MANDATORY)
    Before submitting, verify your work:
    1. Re-read the original task and confirm every requirement is addressed
    2. Check that the adapter implements all interface methods correctly
    3. Verify no unrelated files were modified
    4. Confirm the Summary section is complete and accurate
  - model: opus

[Implementation 2: Analytics integration]
Use Task tool:
  - description: "Parallel: integrate S3 adapter into analytics module"
  - prompt:
    ## Reasoning Approach
    [standard CoT prefix]

    <task>Integrate S3 adapter into the analytics module</task>
    <target>src/modules/analytics.module.ts</target>
    <constraints>
    - Work ONLY on the specified target
    - Import and use the S3 adapter from src/adapters/s3.adapter.ts
    - Follow existing dependency injection patterns
    - Do NOT modify the S3 adapter itself
    </constraints>
    <output>
    Integrate S3 adapter into analytics module.
    CRITICAL: At the end of your work, provide a "Summary" section.
    </output>

    ## Self-Critique Verification (MANDATORY)
    [standard self-critique suffix]
  - model: opus

[Implementation 3: cart.service.ts refactoring]
Use Task tool:
  - description: "Parallel: refactor src/modules/cart/cart.service.ts"
  - prompt:
    ## Reasoning Approach
    Let's think step by step.
    Before taking any action, think through the problem systematically:
    1. "Let me first understand what is being asked for this specific target..."
    2. "Let me analyze this specific target..."
    3. "Let me plan my approach..."
    Work through each step explicitly before implementing.

    <task>Refactor and simplify the cart service</task>
    <target>src/modules/cart/cart.service.ts</target>
    <constraints>
    - Work ONLY on the specified target
    - Simplify logic, reduce complexity, improve readability
    - Preserve existing behavior — no functional changes
    - Do NOT modify other cart module files
    </constraints>
    <output>
    Refactor the cart service file.
    CRITICAL: At the end of your work, provide a "Summary" section containing:
    - Files modified (full paths)
    - Key changes (3-5 bullet points)
    - Any decisions made and rationale
    </output>

    ## Self-Critique Verification (MANDATORY)
    Before submitting, verify your work:
    1. Re-read the original task and confirm every requirement is addressed
    2. Check that existing behavior is preserved after refactoring
    3. Verify no unrelated files were modified
    4. Confirm the Summary section is complete and accurate
  - model: sonnet

[Implementation 4: cart.repository.ts refactoring]
Use Task tool:
  - description: "Parallel: refactor src/modules/cart/cart.repository.ts"
  - prompt: [Same CoT prefix + refactoring task body for cart.repository.ts + critique suffix]
  - model: sonnet

[Implementation 5: cart.controller.ts refactoring]
Use Task tool:
  - description: "Parallel: refactor src/modules/cart/cart.controller.ts"
  - prompt: [Same CoT prefix + refactoring task body for cart.controller.ts + critique suffix]
  - model: sonnet

[All 5 launched simultaneously]
```

**阶段 5.2：评审者调度（4 个评审者并行，在所有实现者完成之后）：**

```
[Judge 1: SHARED judge for S3 group — reviews both S3 adapter + analytics integration]
Use Task tool:
  - description: "Judge (shared): S3 adapter implementation and analytics integration"
  - prompt:
    You are evaluating implementation artifacts for a group of related tasks
    against a combined evaluation specification produced by the meta judge.
    These tasks are interdependent and must be reviewed together.

    CLAUDE_PLUGIN_ROOT={CLAUDE_PLUGIN_ROOT}

    ## User Prompt
    I wrote class interface for S3 service in s3.adapter.ts, please do 2 tasks:
    implement s3 adapter with tests and integrate s3 adapter to analytics module.
    Also refactor and simplify all files in cart module

    ## Tasks in This Shared Group
    - Task A: Implement S3 adapter with tests -> src/adapters/s3.adapter.ts
    - Task B: Integrate S3 adapter into analytics module -> src/modules/analytics.module.ts

    ## Pre-existing and expected parallel changes (Context Only)

    The following changes were made before or expected to be done by
    other parallel agents in the same batch now. They are NOT part of the
    current implementation agents' output for this shared group.
    Focus your evaluation on the S3 group's changes. Only verify other
    changed files/logic if they directly relate to these tasks.

    ### User modifications (before current task)
    The user made changes to the following files/modules before this
    task was started:
    - src/db/connection.ts (modified) - Refactored database connection
      pooling
    - src/db/queries.ts (modified) - Updated query builder patterns
    - src/adapters/s3.adapter.ts (created) - Added S3 class interface
      (the interface that Task A implements)
    - Several service modules updated to use new DB connection API

    ### Expected parallel changes (current batch)
    Other agents in this batch are simultaneously:
    - Refactoring src/modules/cart/cart.service.ts (repeatable group)
    - Refactoring src/modules/cart/cart.repository.ts (repeatable group)
    - Refactoring src/modules/cart/cart.controller.ts (repeatable group)

    ## Evaluation Specification
    ```yaml
    {EXACT combined spec YAML from shared S3 meta-judge}
    ```

    ## Implementation Outputs
    ### Task: Implement S3 adapter with tests -> src/adapters/s3.adapter.ts
    {Summary from S3 adapter implementation agent}
    Files: src/adapters/s3.adapter.ts (modified), src/adapters/s3.adapter.test.ts (created)

    ### Task: Integrate S3 adapter into analytics -> src/modules/analytics.module.ts
    {Summary from analytics integration agent}
    Files: src/modules/analytics.module.ts (modified)

    ## Instructions
    User prompt is provided as context, you should use it only as reference
    of changes that can occur in the project by other agents. Evaluate ALL
    tasks in this shared group together. Verify cross-task integration points
    (e.g., does the adapter's public API match what the analytics module consumes?).
    CRITICAL: For each task, indicate separately whether it PASSED or FAILED
    so that only failing tasks can be retried.
    Follow your full judge process as defined in your agent instructions!

    ## Output
    CRITICAL: You must reply with this exact structured evaluation report
    format in YAML at the START of your response! Include per-task verdicts.
  - model: opus  # HIGHEST current implementation tier among Task A and Task B (both opus)
  - subagent_type: "sadd:judge"

[Judge 2: cart.service.ts — uses SHARED reusable spec from repeatable meta-judge]
Use Task tool:
  - description: "Judge: src/modules/cart/cart.service.ts"
  - prompt:
    You are evaluating an implementation artifact for target
    src/modules/cart/cart.service.ts against an evaluation specification
    produced by the meta judge.

    CLAUDE_PLUGIN_ROOT={CLAUDE_PLUGIN_ROOT}

    ## User Prompt
    [original user prompt]

    ## Target
    src/modules/cart/cart.service.ts

    ## Pre-existing and expected parallel changes (Context Only)

    The following changes were made before or expected to be done by
    other parallel agents in the same batch now. They are NOT part of the
    current implementation agent's output. Focus your evaluation
    on the current agent's changes to its specific target. Only verify
    other changed files/logic if they directly relate to the current
    target's task requirements.

    ### User modifications (before current task)
    The user made changes to the following files/modules before this
    task was started:
    - src/db/connection.ts (modified) - Refactored database connection
      pooling
    - src/db/queries.ts (modified) - Updated query builder patterns
    - src/adapters/s3.adapter.ts (created) - Added S3 class interface
    - Several service modules updated to use new DB connection API

    ### Expected parallel changes (current batch)
    Other agents in this batch are simultaneously:
    - Implementing S3 adapter in src/adapters/s3.adapter.ts (shared group)
    - Integrating S3 adapter into src/modules/analytics.module.ts (shared group)
    - Refactoring src/modules/cart/cart.repository.ts (repeatable group)
    - Refactoring src/modules/cart/cart.controller.ts (repeatable group)

    ## Evaluation Specification
    ```yaml
    {EXACT reusable spec YAML from repeatable cart meta-judge — same for all 3 cart judges}
    ```

    ## Implementation Output
    {Summary from cart.service.ts implementation agent}

    ## Instructions
    User prompt is provided as context, you should use it only as reference
    of changes that can occur in the project by other agents. Evaluate ONLY
    the refactoring of cart.service.ts.
    Follow your full judge process as defined in your agent instructions!

    ## Output
    CRITICAL: You must reply with this exact structured evaluation report
    format in YAML at the START of your response!
  - model: sonnet  # matches cart.service.ts's own implementation tier
  - subagent_type: "sadd:judge"

[Judge 3: cart.repository.ts — uses SAME shared reusable spec]
Use Task tool:
  - description: "Judge: src/modules/cart/cart.repository.ts"
  - prompt: [Same judge template, same reusable spec YAML, cart.repository implementation output.
    Pre-existing and expected parallel changes section: same user modifications,
    expected parallel changes list S3 group, cart.service.ts, and cart.controller.ts instead]
  - model: sonnet  # matches cart.repository.ts's own implementation tier
  - subagent_type: "sadd:judge"

[Judge 4: cart.controller.ts — uses SAME shared reusable spec]
Use Task tool:
  - description: "Judge: src/modules/cart/cart.controller.ts"
  - prompt: [Same judge template, same reusable spec YAML, cart.controller implementation output.
    Pre-existing and expected parallel changes section: same user modifications,
    expected parallel changes list S3 group, cart.service.ts, and cart.repository.ts instead]
  - model: sonnet  # matches cart.controller.ts's own implementation tier
  - subagent_type: "sadd:judge"

[All 4 judges launched simultaneously]
```

**可重复组重试场景**（如果 `cart.controller.ts` judge 发现问题）——演示 [重试时的模型升级](#531-model-escalation-on-retry)：

```
Judge 4 Verdict (cart.controller.ts):
  FAIL, SCORE: 2.6/5.0
  ISSUES: The refactor introduced a circular import between
  cart.controller.ts and cart.service.ts — the implementation agent
  misunderstood the module's dependency direction, not a narrow,
  fixable nitpick (Escalation trigger 1: low first-attempt quality)

Retry Decision (per Model Escalation on Retry):
  → cart.controller.ts FAILED on a misunderstanding, not a fixable nitpick — bump ONE tier: sonnet -> opus
  → Re-launch ONLY the cart.controller.ts implementation agent, now at opus, with the judge's feedback
  → Re-launch ONLY the cart.controller.ts judge, now at opus, to re-evaluate
  → cart.service.ts and cart.repository.ts are untouched — their sonnet tier, their judges, and their PASS verdicts stand; escalation is scoped to cart.controller.ts alone, never the whole repeatable group
```

**结果：**

| 目标 | 分组 | 模型 | Judge 评分 | 重试次数 | 状态 |
|--------|----------|-------|-------------|---------|--------|
| src/adapters/s3.adapter.ts | 共享 | opus | 4.2/5.0 | 0 | 成功 |
| src/modules/analytics.module.ts | 共享 | opus | 4.4/5.0 | 0 | 成功 |
| src/modules/cart/cart.service.ts | 可重复 | sonnet | 4.0/5.0 | 0 | 成功 |
| src/modules/cart/cart.repository.ts | 可重复 | sonnet | 4.3/5.0 | 0 | 成功 |
| src/modules/cart/cart.controller.ts | 可重复 | sonnet → opus | 4.1/5.0 | 1 | 成功 |

**总体情况：**5/5 已完成。Agent 总数：13（2 个元 judge + 5 个实现 agent + 4 个 judge + 1 个重试实现 agent + 1 个重试 judge）

---

### 示例 3：需求分组——全部独立

**输入：**

```
/do-in-parallel write tests for loan.service.ts, add password recovery feature to auth module and enable caching during dependency loading in github actions.
```

**Orchestrator 分析：**

```
Phase 2: Task Analysis + Requirement Grouping

1. Task Identification:
   - Task A: "Write tests for src/services/loan.service.ts"
   - Task B: "Add password recovery feature to src/modules/auth/"
   - Task C: "Enable caching during dependency loading in .github/workflows/ci.yml"

2. Requirement Grouping:
   - Task A: INDEPENDENT — test generation for a specific service
   - Task B: INDEPENDENT — new feature in auth module (unrelated to tasks A and C)
   - Task C: INDEPENDENT — CI configuration change (unrelated to tasks A and B)
   - No grouping possible: all 3 tasks are different task types on different targets

3. Agent Count:
   - Meta-judges: 3 (one per task — standard flow)
   - Implementation agents: 3 (one per task)
   - Judges: 3 (one per task)
   - Total: 9 agents (no reduction possible)
```

**第 3 阶段：模型选择**

| 目标 | 层级 | 理由 |
|--------|------|-----------|
| src/services/loan.service.ts | sonnet | 基于既有模式编写测试；仅生成测试不会触发关键触发条件 |
| src/modules/auth/ | opus | opus 是通过资格获取的——auth 领域会触发关键条件（密码重置令牌的签发与验证） |
| .github/workflows/ci.yml | haiku | 使用标准 GitHub Action 进行小型、机械性的缓存配置更改；无需编写逻辑 |

**阶段 3.5：元评审调度（3 个元评审并行）：**

```
[Meta-judge 1: Independent — loan service tests]
Use Task tool:
  - description: "Meta-judge: write tests for loan.service.ts"
  - prompt:
    ## Task

    Generate an evaluation specification yaml for the following task applied
    to a specific target. You will produce rubrics, checklists, and scoring
    criteria that a judge agent will use to evaluate the implementation
    artifact for this specific target.

    CLAUDE_PLUGIN_ROOT={CLAUDE_PLUGIN_ROOT}

    ## User Prompt as Context
    write tests for loan.service.ts, add password recovery feature to auth
    module and enable caching during dependency loading in github actions.

    ## Target
    Write comprehensive unit tests for src/services/loan.service.ts

    ## Context
    Project uses Jest. Tests should cover all public methods, edge cases,
    and error scenarios for the loan service.

    ## Artifact Type
    code

    ## Instructions
    User prompt is provided as context, you should use it only as reference
    of changes that can occur in the project by other agents. Generate
    evaluation specification ONLY for the loan service test generation.
    Your report will be used to verify only this particular task, not the
    all tasks in the user prompt.
    Return only the final evaluation specification YAML in your response.
  - model: sonnet
  - subagent_type: "sadd:meta-judge"

[Meta-judge 2: Independent — password recovery feature]
Use Task tool:
  - description: "Meta-judge: add password recovery to auth module"
  - prompt:
    ## Task

    Generate an evaluation specification yaml for the following task applied
    to a specific target. You will produce rubrics, checklists, and scoring
    criteria that a judge agent will use to evaluate the implementation
    artifact for this specific target.

    CLAUDE_PLUGIN_ROOT={CLAUDE_PLUGIN_ROOT}

    ## User Prompt as Context
    write tests for loan.service.ts, add password recovery feature to auth
    module and enable caching during dependency loading in github actions.

    ## Target
    Add password recovery feature to src/modules/auth/ (password reset flow:
    request, token generation, validation, password update)

    ## Context
    Auth module handles authentication. Password recovery requires new
    endpoints, email integration, token management.

    ## Artifact Type
    code

    ## Instructions
    User prompt is provided as context, you should use it only as reference
    of changes that can occur in the project by other agents. Generate
    evaluation specification ONLY for the password recovery feature.
    Your report will be used to verify only this particular task, not the
    all tasks in the user prompt.
    Return only the final evaluation specification YAML in your response.
  - model: opus
  - subagent_type: "sadd:meta-judge"

[Meta-judge 3: Independent — GH Actions caching]
Use Task tool:
  - description: "Meta-judge: enable dependency caching in GitHub Actions"
  - prompt:
    ## Task

    Generate an evaluation specification yaml for the following task applied
    to a specific target. You will produce rubrics, checklists, and scoring
    criteria that a judge agent will use to evaluate the implementation
    artifact for this specific target.

    CLAUDE_PLUGIN_ROOT={CLAUDE_PLUGIN_ROOT}

    ## User Prompt as Context
    write tests for loan.service.ts, add password recovery feature to auth
    module and enable caching during dependency loading in github actions.

    ## Target
    Enable caching during dependency loading in .github/workflows/ci.yml
    (e.g., npm/yarn cache, actions/cache)

    ## Context
    GitHub Actions CI pipeline. Dependency installation step should use
    caching to speed up builds.

    ## Artifact Type
    configuration

    ## Instructions
    User prompt is provided as context, you should use it only as reference
    of changes that can occur in the project by other agents. Generate
    evaluation specification ONLY for enabling dependency caching in GH Actions.
    Your report will be used to verify only this particular task, not the
    all tasks in the user prompt.
    Return only the final evaluation specification YAML in your response.
  - model: haiku
  - subagent_type: "sadd:meta-judge"

[All 3 meta-judges launched simultaneously]
```

**阶段 5：实现分派（3 个代理并行执行，在元评审代理完成后）：**

```
[Implementation 1: loan service tests]
Use Task tool:
  - description: "Parallel: write tests for loan.service.ts"
  - prompt:
    ## Reasoning Approach
    Let's think step by step.
    Before taking any action, think through the problem systematically:
    1. "Let me first understand what is being asked for this specific target..."
    2. "Let me analyze this specific target..."
    3. "Let me plan my approach..."
    Work through each step explicitly before implementing.

    <task>Write comprehensive unit tests for the loan service</task>
    <target>src/services/loan.service.ts</target>
    <constraints>
    - Work ONLY on the specified target
    - Create test file co-located with the service
    - Cover all public methods, edge cases, and error scenarios
    - Follow existing test patterns in the project
    </constraints>
    <output>
    Create test file for the loan service.
    CRITICAL: At the end of your work, provide a "Summary" section containing:
    - Files modified (full paths)
    - Key changes (3-5 bullet points)
    - Any decisions made and rationale
    </output>

    ## Self-Critique Verification (MANDATORY)
    Before submitting, verify your work:
    1. Re-read the original task and confirm every requirement is addressed
    2. Check that all tests follow existing patterns in the project
    3. Verify no unrelated files were modified
    4. Confirm the Summary section is complete and accurate
  - model: sonnet

[Implementation 2: password recovery]
Use Task tool:
  - description: "Parallel: add password recovery feature to auth module"
  - prompt:
    ## Reasoning Approach
    [standard CoT prefix]

    <task>Add password recovery feature to the auth module</task>
    <target>src/modules/auth/</target>
    <constraints>
    - Work ONLY on the auth module
    - Implement password reset request, token generation, validation,
      and password update
    - Follow existing auth module patterns
    - Do NOT modify unrelated modules
    </constraints>
    <output>
    Implement password recovery feature.
    CRITICAL: At the end of your work, provide a "Summary" section.
    </output>

    ## Self-Critique Verification (MANDATORY)
    [standard self-critique suffix]
  - model: opus

[Implementation 3: GH Actions caching]
Use Task tool:
  - description: "Parallel: enable dependency caching in GitHub Actions"
  - prompt:
    ## Reasoning Approach
    [standard CoT prefix]

    <task>Enable caching during dependency loading in CI pipeline</task>
    <target>.github/workflows/ci.yml</target>
    <constraints>
    - Work ONLY on the CI workflow file
    - Add dependency caching (npm/yarn cache or actions/cache)
    - Do NOT modify other workflow steps beyond what is necessary
    </constraints>
    <output>
    Update CI workflow with dependency caching.
    CRITICAL: At the end of your work, provide a "Summary" section.
    </output>

    ## Self-Critique Verification (MANDATORY)
    [standard self-critique suffix]
  - model: haiku

[All 3 launched simultaneously]
```

**阶段 5.2：评审者调度（3 个评审者并行，在所有实现者完成后）：**

```
[Judge 1: loan service tests — independent spec]
Use Task tool:
  - description: "Judge: loan.service.ts tests"
  - prompt:
    You are evaluating an implementation artifact for target
    src/services/loan.service.ts against an evaluation specification
    produced by the meta judge.

    CLAUDE_PLUGIN_ROOT={CLAUDE_PLUGIN_ROOT}

    ## User Prompt
    write tests for loan.service.ts, add password recovery feature to auth
    module and enable caching during dependency loading in github actions.

    ## Target
    src/services/loan.service.ts

    ## Evaluation Specification
    ```yaml
    {EXACT spec YAML from loan service meta-judge}
    ```

    ## Implementation Output
    {Summary from loan service test implementation agent}

    ## Instructions
    User prompt is provided as context, you should use it only as reference
    of changes that can occur in the project by other agents. Evaluate ONLY
    the test generation for loan.service.ts.
    Follow your full judge process as defined in your agent instructions!

    ## Output
    CRITICAL: You must reply with this exact structured evaluation report
    format in YAML at the START of your response!
  - model: sonnet
  - subagent_type: "sadd:judge"

[Judge 2: password recovery — independent spec]
Use Task tool:
  - description: "Judge: auth password recovery"
  - prompt:
    You are evaluating an implementation artifact for target
    src/modules/auth/ against an evaluation specification produced
    by the meta judge.

    CLAUDE_PLUGIN_ROOT={CLAUDE_PLUGIN_ROOT}

    ## User Prompt
    [original user prompt]

    ## Target
    src/modules/auth/ (password recovery feature)

    ## Evaluation Specification
    ```yaml
    {EXACT spec YAML from password recovery meta-judge}
    ```

    ## Implementation Output
    {Summary from password recovery implementation agent}

    ## Instructions
    User prompt is provided as context, you should use it only as reference
    of changes that can occur in the project by other agents. Evaluate ONLY
    the password recovery feature.
    Follow your full judge process as defined in your agent instructions!

    ## Output
    CRITICAL: You must reply with this exact structured evaluation report
    format in YAML at the START of your response!
  - model: opus
  - subagent_type: "sadd:judge"

[Judge 3: GH Actions caching — independent spec]
Use Task tool:
  - description: "Judge: GitHub Actions dependency caching"
  - prompt:
    You are evaluating an implementation artifact for target
    .github/workflows/ci.yml against an evaluation specification produced
    by the meta judge.

    CLAUDE_PLUGIN_ROOT={CLAUDE_PLUGIN_ROOT}

    ## User Prompt
    [original user prompt]

    ## Target
    .github/workflows/ci.yml (dependency caching)

    ## Evaluation Specification
    ```yaml
    {EXACT spec YAML from GH Actions caching meta-judge}
    ```

    ## Implementation Output
    {Summary from GH Actions caching implementation agent}

    ## Instructions
    User prompt is provided as context, you should use it only as reference
    of changes that can occur in the project by other agents. Evaluate ONLY
    the dependency caching in GitHub Actions.
    Follow your full judge process as defined in your agent instructions!

    ## Output
    CRITICAL: You must reply with this exact structured evaluation report
    format in YAML at the START of your response!
  - model: haiku
  - subagent_type: "sadd:judge"

[All 3 judges launched simultaneously]
```

**结果：**

| 目标 | 分组 | 模型 | 评审得分 | 重试次数 | 状态 |
|--------|----------|-------|-------------|---------|--------|
| src/services/loan.service.ts | 独立 | sonnet | 4.1/5.0 | 0 | 成功 |
| src/modules/auth/ | 独立 | opus | 4.3/5.0 | 0 | 成功 |
| .github/workflows/ci.yml | 独立 | haiku | 4.0/5.0 | 0 | 成功 |

**总体情况：**3/3 已完成。代理总数：9（3 个元评审、3 个实现代理 + 3 个评审代理）。对于完全独立的任务，无法进一步减少分组。

## 最佳实践

### 目标选择

- **具体明确：**尽可能列出确切的文件
- **谨慎使用 glob：**在确认前检查展开后的文件列表
- **限制范围：**每批最多 10-15 个目标，以便管理
- **按相似性分组：**相似目标可以从一致的模式中受益

### 模型选择指南

仅供快速参考的示例——[模型选择策略](#model-selection-policy)具有权威性；当某种场景无法整齐地归入以下示例时，请遵循[选择规则](#selection-rules)表格，而不是此列表。

| 场景 | 层级 | 原因 |
|----------|------|--------|
| 安全关键逻辑（身份验证、支付、数据完整性） | `opus` | 关键触发条件——无论任务规模大小都适用 |
| 多文件重构或共享契约变更 | `opus` | 复杂触发条件——跨文件的范围或契约变更 |
| 限定在单个文件内且不改变契约的重构 | `sonnet` | 基于既有模式的单模块变更 |
| 文档生成 | `haiku` | 机械性任务，无需代码或跨文件推理 |
| 每个文件的代码审查或测试生成 | `sonnet` | 能力均衡，且有既有模式可循 |

### 元评审 + 评审验证

- **先进行需求分组**——在分派任何元评审之前，分析任务是否可以按可复用、共享或独立的方式分组，以尽量减少代理总数
- **每个分组或独立任务对应一个元评审**——可复用的分组共享一个可复用规范，共享分组共享一个组合规范，独立任务各自获得专属规范
- **先批量执行元评审**——并行启动所有元评审（无论分组类型），然后再启动实现代理
- **在重试时复用规范**——每个分组/目标的评估规范在重试期间保持不变；只有实现发生变化
- **仅解析评审代理的标题**——不要读取完整报告，以避免上下文污染
- **包含 CLAUDE_PLUGIN_ROOT**——元评审和评审代理都需要已解析的插件根路径
- **目标专属 YAML**——仅将相关的元评审 YAML 传递给其评审代理，不要向其中添加任何其他文本或注释！
- **共享分组重试**——只重新启动具体失败的实现代理，而不是整个分组

### 评审代理选择

根据[角色配对](#role-pairing)，评审层级并不独立于实现层级——默认情况下，两者使用**相同**的层级。不存在由 `opus` 评审 `haiku` 层级任务的场景；锐化（参见角色配对表）只能提升共享的**标准制定者**（元评审）的层级，不能只提升评审代理的层级。

| 实现层级 | 评审层级 | 理由 |
|---------------------|------------|-----------|
| `opus` | `opus` | 生产者和评估者可以共享同一层级 |
| `sonnet` | `sonnet` | 生产者和评估者可以共享同一层级 |
| `haiku` | `haiku` | 生产者和评估者可以共享同一层级 |

**指南：**参见[角色配对](#role-pairing)。

### 上下文隔离

- **最小上下文：**每个子代理只获取其所需的信息
- **不交叉引用：**不要将 Agent B 的目标告知 Agent A
- **让它们自行发现：**子代理通过读取文件来了解模式
- **以文件系统为准：**通过文件系统协调变更
- **跟踪预先存在的变更** - 向每个代理的评审者传递有关先前修改的上下文，以避免混淆预先存在的变更与当前变更的归属

### 质量保证

- **三层验证：**自我批评（内部）+ 针对目标的元评审规范（结构化）+ 评审者（外部）
- **首先进行自我批评：**实现代理在提交前验证自己的工作
- **针对目标的元评审规范：**每个目标都会获得量身定制的评分标准，考虑其独特特征，从而生成更精确的评估标准
- **其次进行外部评审：**独立评审者机械地应用针对目标的元评审规范——捕捉自我批评遗漏的盲点
- **迭代循环：**根据反馈重试，直到通过或达到最大重试次数
- **按比例迭代：**应用[迭代裁量规则](#55-iteration-discretion-rule)——最多进行一次由细枝末节问题驱动的重试，绝不低于 `3.0`，使用 `--strict` 时禁用
- **隔离失败：**一个目标失败不会影响其他目标
- **检查摘要：**检查失败或部分完成的项目
- **之后运行测试：**并行变更可能产生细微的交互影响
- **原子提交：**一个批次中的所有变更 = 一次提交

#### 错误处理

| 失败类型 | 描述 | 恢复操作 |
|--------------|-------------|-----------------|
| **可恢复** | 评审者发现问题，且仍有可用重试次数 | 根据评审者反馈重试（每个目标最多 3 次），但须遵守[迭代裁量规则](#55-iteration-discretion-rule) |
| **方法失败** | 针对该目标采用的方法不正确 | 向用户升级处理并提供选项 |
| **基础问题** | 需求不明确或无法实现 | 向用户升级处理以请求澄清 |
| **超过最大重试次数** | 目标在 3 次重试后仍失败 | 将其标记为失败，继续处理其他目标，并在最后报告 |

**关键规则：**
- 绝 NEVER 在没有用户输入的情况下超过最大重试次数后继续
- 绝 NEVER 在未解决评审者提出的问题时尝试“向前修复”
- 绝 NEVER 跳过评审者验证
- 如果缺少上下文，STOP 并报告（不要猜测）
- 隔离失败——一个目标失败不会阻止其他目标。