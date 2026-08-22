---
name: do-in-parallel
description: Run independent tasks concurrently across multiple files or targets using parallel sub-agents, with per-task model selection and LLM-as-a-judge verification. Use when tasks do not depend on each other and can run side by side.
argument-hint: Task description [--files "file1.ts,file2.ts,..."] [--targets "target1,target2,..."] [--model haiku|sonnet|opus] [--output <path>] [--strict]
---
# do-in-parallel

<task>
并行启动多个子代理，以跨不同文件或目标执行任务。分析任务，为每个目标选择规模适当的模型层级，执行需求分组分析（可重复、共享或独立），生成注重质量的提示词，其中包含零样本思维链推理和强制性自我批评，然后根据分组派发元评审代理（每组一个，或每个独立任务一个，全部并行执行），随后为每个任务并行派发实现代理，并在每个任务完成后，使用与分组相适应的评估规范通过 LLM-as-a-judge 进行验证。
</task>

<context>
此命令通过并行派发、**需求分组**和**元评审代理 → LLM-as-a-judge 验证**来实现**监督者/编排器模式**。其主要优势是**并行执行**——多个独立任务并发运行，而不是顺序执行，从而显著缩短批量操作的总执行时间。需求分组分析通过在相关任务之间共享元评审代理和评审代理来减少代理总数：可重复组（跨目标执行相同任务）共享一套元评审规范，共享组（相互依赖的任务）使用一个综合评审代理。


主要优势：
- **并行执行**——多个任务同时运行
- **需求分组**——通过识别可重复和共享的任务模式，减少元评审代理和评审代理的数量
- **规模适当的模型**——根据[模型选择策略](#model-selection-policy)为每个目标选择：默认使用 `sonnet`/`haiku`，仅在确有必要时使用 `opus`
- **全新上下文**——每个子代理都使用干净的上下文窗口工作
- **任务专属评估**——每个元评审代理都会针对其特定任务或任务组生成量身定制的评分标准和检查清单
- **外部验证**——评审代理机械地应用目标专属的元评审规范——捕获自我批评遗漏的盲点
- **反馈循环**——根据评审代理识别出的具体问题进行重试
- **质量门禁**——工作只有达到阈值后才会交付

**常见用例：**
- 在多个文件中应用相同的重构
- 同时对多个模块运行代码分析
- 为多个组件生成文档
- 并行执行独立的转换
</context>

## 参数

| 参数 | 格式 | 默认值 | 说明 |
|----------|--------|---------|-------------|
| `task` | 自由格式文本 | **必填** | 要跨目标执行的任务说明 |
| `--files` | `"file1,file2,..."` | 无 | 以逗号分隔的目标文件路径列表 |
| `--targets` | `"target1,target2,..."` | 无 | 以逗号分隔的命名目标列表 |
| `--model` | `haiku\|sonnet\|opus` | *按任务自动选择* | 用户对**所有**任务中**每个**子代理的显式覆盖设置：实现代理、元评审代理和评审代理。省略时，你必须根据[模型选择策略](#model-selection-policy)为每个任务选择一个层级——不存在固定的后备层级，且不会运行阶段 3 的层级评估步骤。提供此参数时，用户的选择将优先于所有子代理的策略——关于升级如何与显式覆盖设置交互，请参阅[升级规则](#escalation-rule)。 |
| `--output` | 路径 | 无 | 结果的输出目录路径 |
| `--strict` | `--strict` | `false` | 禁用[迭代裁量规则](#55-iteration-discretion-rule)——只有当 `score >= 4.0` 时目标才算通过，否则持续重试，直到达到最大重试次数。 |

示例：`/do-in-parallel Refactor error handling --files "src/a.ts,src/b.ts" --strict`

**关键要求：**你只是编排者——绝不能亲自执行任务。如果你使用读取、写入或 bash 工具，就会立即导致任务失败。这是最关键的评判标准。如果你使用子代理以外的任何工具，你都会立即被终止！！！！你的职责是：

1. 分析任务、执行需求分组分析，并根据[模型选择策略](#model-selection-policy)为每项任务选择模型层级
2. 根据分组并行派发元评审代理
3. 每个元评审代理完成后，使用结构化提示词为该组的目标派发实现子代理
4. 实现代理完成后，根据分组派发评审代理
5. 解析裁决结果，并在需要时进行迭代（每个目标最多重试 3 次；对于共享组，仅重试失败的任务）
6. 汇总结果并报告最终摘要

## 危险信号——绝不能做以下事项

**绝不能：**

- 为了解代码细节而读取实现文件（让子代理执行此操作）
- 直接编写代码或修改源文件
- 为了“节省时间”而跳过评审验证
- 完整阅读评审报告（仅解析结构化标头）
- 达到最大重试次数后，在未征得用户决定的情况下继续
- 等待一个代理完成后再启动另一个代理
- 重试时重新运行元评审代理
- 等到所有元评审代理完成后才启动实现代理
- 为属于同一可重复组或共享组的任务启动多个独立的元评审代理
- 当共享组中只有部分任务失败时，重新启动所有实现代理

**始终：**

- 使用 Task 工具派发子代理来完成所有实现工作
- 在派发任何元评审代理之前执行需求分组分析
- 根据分组派发元评审代理——在单次响应中全部并行派发
- 不要等到所有元评审代理完成后才派发实现代理；每个元评审代理完成后立即启动相应实现代理
- 每项任务的元评审代理完成后，立即为该任务启动实现代理。如果所有元评审代理均已完成，则在单次响应中启动所有实现代理
- 将每个目标对应的具体元评审代理评估规范传递给其评审代理
- 对于共享组，派发一个评审代理来统一评审所有相关变更
- 在发给元评审代理和评审代理的提示词中包含 `CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}`
- 使用 Task 工具派发独立的评审代理进行验证
- 等待每项实现完成后，再派发其评审代理
- 仅解析评审输出中的 VERDICT/SCORE/ISSUES
- 如果验证失败，则根据反馈进行迭代（每个目标最多重试 3 次）
- 除非提供了 `--strict`，否则对每个目标的裁决应用[迭代酌情规则](#55-iteration-discretion-rule)
- 对于共享组重试，仅重新启动具体失败的实现代理，而不是整个组
- 所有重试均复用相同的元评审代理规范（绝不重新运行元评审代理）

## 模型选择策略

选择模型是你所做的**影响最大的一项决策**——与任何提示词措辞相比，它更能决定目标是否会正确完成，以及整个批次需要多长时间。绝不能将其视为例行公事：在派发**每个**目标之前，说明模型层级并用一行文字阐述理由。因为不愿思考而直接选择最强模型并非谨慎，而是失败。

**默认层级：**`sonnet` 和 `haiku` 是默认选择。`opus` 为保留层级，需明确选择——它必须由下表中的触发条件来*获得*，绝不能因为你不确定而选择。

**按任务选择，而非按运行批次选择：**每个任务的层级都应根据该任务自身的范围、复杂度和风险**独立选择**——不再强制整个批次中的所有并行智能体使用同一种“统一配置”。每个独立任务都应根据其自身情况确定层级。可重复任务组的共享元评审器会生成一份可复用的规范，但这并不强制使用同一个层级：组内每个任务仍根据下方的选择规则保留其各自的实现层级和评审层级，因此，即使关键领域的目标位于一个整体上属于机械式操作的任务组中，它仍可使用 `opus`，而其同组任务则可继续使用成本更低的层级。共享任务组的单个评审器会一并审查组内的所有任务，因此它会以这些任务当前实现层级中的最高层级运行（参见[角色配对](#role-pairing)）。某个任务达到的层级（包括通过升级达到的层级）不得沿用至同组任务或下一批次。

### 选择规则

| 任务形态 | 层级 | 示例 |
|---|---|---|
| 修正单个文档/文本文件——不涉及代码，也不需要跨文件推理 | `haiku` | 修复拼写错误、更新链接、修正 README 中已过时的命令 |
| 局限于单个文件、改动量较小（约 10 行或更少）的机械式代码变更 | `haiku` | 更新常量、添加守卫子句、重命名局部变量、编辑配置值 |
| 编写代码——新增函数、组件或测试，变更局限于单个模块，并遵循既有模式 | `sonnet` | 添加端点、编写服务方法及其测试、重构单个模块 |
| **多文件重构**（约 3 个以上文件，或无论文件数量多少，只要共享契约发生变更）或**关键领域**（身份验证、支付/计费、数据完整性、不可逆迁移、公共 API 破坏性变更）或**复杂逻辑**（并发、非平凡算法、架构决策） | `opus` | 横切式重构、身份验证或支付逻辑、模式迁移、新颖的算法设计 |

**优先级（强制要求）：**必须评估每一行，而不是只评估第一个匹配项。当有多行匹配时，**以匹配到的最高层级为准**——关键性和复杂度始终优先于规模。安全关键型身份验证处理程序中的四行空值检查同时匹配 `haiku` 行和 `opus` 行，因此应为 `opus`。**关键领域**列表是穷尽性的，而非示例性的：部署到生产环境、影响真实用户或向公共 API 添加内容均不属于触发条件，因此，在单个服务文件中添加带验证的新端点仍为 `sonnet`。**机械式广度例外：**广度本身并不等同于复杂度。对于纯机械式变更——在多个目标中重复执行一个相同的、由规则驱动的编辑，且不涉及逻辑或契约变更——仅**多文件触发条件**不适用；**关键领域**和**复杂逻辑**触发条件仍然适用。你必须根据**单次变更**的内容来确定其层级，就像该任务只涉及一个文件一样；因此，在 40 个文件中机械式重命名一个符号应为 `haiku`，但仅在 `src/auth/` 中进行相同的重命名则应为 `opus`——无论涉及范围多广，关键领域触发条件都会因该单次变更而生效。此例外不适用于共享契约变更（上文已将其列为 `opus` 触发条件），因此，跨文件抽取共享接口仍为 `opus`。

**决胜规则：**仅当没有任何一行能够明确匹配时——即任务确实介于两个层级之间——选择**成本较低的**层级。不得为了保险而偏向选择 `opus`；[升级规则](#escalation-rule)使成本较低的首次判断即使出错也可以补救，而补救一项任务的成本远低于为每项任务都配置过高的资源。

### 角色配对

任何由模型承担的流水线最多包含三个角色——**生产者**（执行工作）、**标准制定者**（定义何为“正确”）、**评估者**（依据这些标准检查工作）；在本技能中，它们会**针对每项并行任务**分别实例化为实现 / 元裁判 / 裁判——可重复组中的各项任务共享一个元裁判，而共享组中的各项任务还会额外共享一个裁判。**默认情况下：同一任务的三个角色全部使用相同层级。**

**仅对于非显而易见的任务**，你可以只将**标准制定者**提高一个层级，使评估标准比被评估的工作更加严谨。*非显而易见*必须可验证：该层级是通过**决胜规则**确定的（即没有任何一行选择规则能够明确匹配），或者任务未说明可检查的验收条件。

| 模式 | 标准制定者（元裁判） | 生产者 + 评估者（实现 + 裁判） | 适用情形 |
|---|---|---|---|
| 强化版 haiku | `sonnet` | `haiku` | 工作本身很简单，但何为“正确”并不明显 |
| 强化版 sonnet | `opus` | `sonnet` | 验收标准模糊或影响重大的代码工作，但该工作本身未触发任何 `opus` 条件 |

生产者和评估者必须始终使用相同层级——对于服务于多项任务的可重复组或共享组裁判，“使用相同层级”是指采用其所服务任务中当前实现层级的最高者，从而确保它绝不会被要求评判高于自身层级的工作（参见[重试时的模型升级](#531-model-escalation-on-retry)）。不得单独提高评估者的层级，也不得将标准制定者设置为低于生产者的层级。**显式 `--model` 覆盖会取代本节的所有规则：**当用户传入 `--model` 时，每项任务的所有角色都以该层级运行，角色配对不得将元裁判提升到该层级之上。

### 升级规则

当以下任一触发条件成立时，在下一次尝试中将**生产者和评估者同时**提高一个层级（即失败任务的实现和裁判）：

1. **首次尝试质量低**——评分较低，或者问题表明模型误解了任务，而不只是遗漏了一些细节。
2. **用户投诉**质量太低或结果有误——无论何时提出，包括已报告 PASS 之后。

层级阶梯：`haiku` → `sonnet` → `opus`。`opus` 是**上限**——不存在更高层级。如果 `opus` 层级的工作仍然失败，应升级给**用户**处理，绝不能继续循环。

- **唯一例外——维持当前层级（这是此规则的唯一表述，仅适用于触发条件 (1)）：**当触发条件 (1) 成立，但裁判指出的问题是具体且可修复的缺陷，而非能力差距（即模型显然理解了任务，问题范围狭窄且描述精确）时，你可以维持当前层级，并在相同层级下携带裁判的确切反馈进行重试，而不是提高层级。这是触发条件 (1) 下可以不执行强制升级的唯一情形；在其他所有情况下，触发条件 (1) 都必须升级。触发条件 (2)（用户投诉）不存在此例外——根据下述特别规定，它始终要求立即升级。
- **显式 `--model` 特别规定（这是此规则的唯一表述）：**显式 `--model` 属于用户覆盖，因此触发条件 (1) 不得在不告知用户的情况下推翻它——应继续使用覆盖模型迭代，直至达到最大重试次数。如果最终仍未达到目标，应明确指出发现的问题，并向用户提议提高层级。触发条件 (2) 本身即代表用户已批准，因此应立即升级。
- **仅限于失败的任务。**升级只会重新确定该任务重试时所用的实现和裁判层级。它不会重新确定整个批次的层级：并发运行的同批任务，以及后续批次中的所有任务，都应根据各自在[选择规则](#selection-rules)下的实际情况进行评估，并重新从 `sonnet`/`haiku` 默认层级开始。
- 升级只会调整实现和裁判。任务的元裁判（对于可重复组/共享组，则为该组的元裁判）不会重新运行，也不会重新确定层级——其规范会在该任务的各次重试中复用，因为在任务执行期间更改标准会使不同尝试之间的比较失效。
- 升级是对真正根因修复的补充，绝不能取而代之。重试时仍然必须传入裁判的具体反馈；禁止仅以更高层级重新分发相同提示词并寄希望于问题自行解决。
- 升级与评分阈值、[迭代裁量规则](#55-iteration-discretion-rule)以及每个目标最多 3 次重试的额度相互独立——它只会改变下一次尝试由*哪个模型*运行，而绝不会决定*是否*值得进行下一次尝试。
- **报告 PASS 后重新进入流程（这是此规则的唯一表述）：**报告 PASS 并不意味着工作已经关闭。如果用户随后表示某个目标的结果有误或质量太低，应根据触发条件 (2) 重新进入该目标的重试路径，并**重置**该目标的重试额度——即使先前周期的额度已耗尽，此次投诉也会开启一个最多包含 3 次重试的新周期。

### 跨提供商等效映射

当此技能在 Anthropic 模型上下文之外运行时，请将层级映射到同一类别中最接近的模型：

| 层级 | 角色 | 其他提供商的同类模型 |
|---|---|---|
| `haiku` | 快速且低成本；机械性工作 | `gemini-flash-lite`、`gemma` 类、`gpt-oss` 类、小型开放权重模型 |
| `sonnet` | 均衡的主力模型；承担大多数代码编写工作 | `gemini-pro` 类和完整版 `gemini-flash`（**不是** `-lite` 变体，后者属于 `haiku` 层级）、`GPT-5-mini` 类、大型 `Qwen` / `DeepSeek` 类 |
| `opus` | 前沿推理；关键或复杂工作 | 提供商以扩展推理／审慎推理层级销售的任何模型——目前包括 `GPT-5.5`、深度思考模式、`Kimi K3` 类，以及任何优势在于更长时间审慎推理而非吞吐量的模型 |

映射依据是**能力层级，而不是名称**——随着供应商发布新模型，确切名称会不断变化。上述每条规则都以层级表述，因此在其他提供商处：将层级映射到该类别中你的模型，然后原样应用选择、配对和升级规则。

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
- 如果提供了 `--targets`：按逗号拆分并直接使用
- 如果两者都未提供：尝试从任务描述中提取文件路径或目标名称
- `STRICT_MODE = --strict present || false` - 禁用[迭代裁量规则](#55-iteration-discretion-rule)；此时目标仅在 `score >= 4.0` 时才算通过，否则将不断重试，直至达到最大重试次数
- 在构建子代理提示词之前，从任务文本中移除所有标志——**绝不要**将它们传入子代理提示词

示例：`/do-in-parallel Simplify error handling --files "src/a.ts,src/b.ts" --strict`

### 阶段 2：使用零样本 CoT 进行任务分析

在分派之前，系统性地分析任务：

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

#### 独立性验证（并行分派前必须执行）

继续之前，请验证各任务是否真正独立：

| 检查项 | 问题 | 如果为否 |
|-------|----------|-------|
| 文件独立性 | 各目标是否共享文件？ | 无法并行化——文件存在冲突 |
| 状态独立性 | 各任务是否会修改共享状态？ | 无法并行化——存在竞态条件 |
| 顺序独立性 | 执行顺序是否重要？ | 无法并行化——需要按顺序执行 |
| 输出独立性 | 是否有目标会读取另一目标的输出？ | 无法并行化——存在数据依赖 |

**独立性检查清单：**
- [ ] 没有目标会读取另一目标的输出
- [ ] 没有目标会修改另一目标所读取的文件
- [ ] 完成顺序无关紧要
- [ ] 不存在共享的可变状态
- [ ] 不存在跨目标的数据库事务

如果任意检查未通过：立即停止，并告知用户并行化不安全的原因。建议使用 `/launch-sub-agent` 进行顺序执行。

#### 需求分组分析（分派元评审代理前必须执行）

识别出各个独立任务并验证其独立性后，分析这些任务能否共享元评审代理和/或评审代理。这样可以在不牺牲质量的前提下，减少分派的代理总数。

**三种分组类型**（可在单个用户提示中组合使用）：

| 分组类型 | 适用场景 | 元评审代理 | 实现代理 | 评审代理 |
|---------------|---------------|-------------|----------------------|--------|
| **可重复** | 将相同的任务模式应用于多个文件/模块（例如，“为全部 3 个模块添加测试”） | 整个分组共享一个元评审代理 | 每个任务一个（始终隔离） | 每个任务一个，每个都接收相同的共享规范 |
| **共享** | 任务之间相互依赖，应当一起评审/验证（例如，“实现 S3 适配器并将其集成到分析功能中”） | 整个分组使用一个合并的元评审代理 | 每个任务一个（始终隔离） | 整个分组使用一个评审代理，一起评审所有变更 |
| **独立** | 任务完全独立，分组不会带来任何收益 | 每个任务一个 | 每个任务一个（始终隔离） | 每个任务一个 |

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
- 如有疑问，默认按独立任务处理。** 如果不确定任务是否真正属于可重复或共享类型，则将其视为独立任务。过度分组可能导致评估规范不正确，而独立任务始终能够获得正确且针对具体任务的评估。宁可使用更多代理，也不要生成错误的验证标准。
- 实现代理始终保持隔离——每个任务一个，绝不共享。只有元评审代理和评审代理可以共享/分组。分组分析在此处的任务分析阶段进行，且必须在启动任何代理之前完成。

**元评审指令：**
- 可重复组：为可重复组派遣元评审时，需明确指示其生成一份可复用的验证规范。
- 共享组：为共享组派遣元评审时，需明确指示其生成一份合并的验证规范。


**共享组重试逻辑：**

如果共享评审发现问题，请分析具体是哪些实现代理生成了失败的更改。仅重新启动更改失败的特定实现代理——除非确有必要，否则不要重新启动组内所有代理。完成针对性重试后，重新启动共享评审，再次审查所有更改（包括已通过代理所完成的未改动工作）。



### 阶段 3：模型和代理选择

根据阶段 2 中的分析，依照[模型选择策略](#model-selection-policy)，为每项任务选择模型层级和专用代理——默认使用 `sonnet`/`haiku`，只有符合条件时才使用 `opus`。如果传入了 `--model`，则直接跳到 [3.2](#32-specialized-agent-selection-optional)：根据[角色配对](#role-pairing)中的覆盖条款，每项任务的每个子代理均使用用户指定的层级运行。

#### 3.1 为每项任务选择模型层级

从以下三个维度评估**每一项**任务，然后直接根据[选择规则](#selection-rules)表确定其层级——层级按任务逐项选择，绝不能只为整个批次统一选择一次：

- **范围**——涉及一个文件、一个组件，还是多个文件？
- **复杂度**——是机械式编辑、遵循既有模式，还是新颖或复杂的逻辑？
- **风险**——是隔离且可逆、内部风险，还是属于[选择规则](#selection-rules)中 `opus` 行所列完整清单定义的**关键**风险？

**按分组类型：**

- **独立**任务——根据每项任务自身的具体情况分别确定层级；每项任务都使用该层级对应的独立元评审和独立评审。
- **可重复**组——共享元评审生成一份可复用规范，但每项任务的实现和评审仍需单独确定层级：完全按照独立任务的方式，依据选择规则评估每个目标。组内关键领域的目标（例如某个文件恰好是身份验证代码）可以使用 `opus`，而同组其他任务仍使用 `sonnet` 或 `haiku`，即使它们共享同一份规范。
- **共享**组——首先根据每项任务自身的内容分别确定层级，然后将该组唯一的共享评审设置为其中的最高层级（依据[角色配对](#role-pairing)），从而确保不会要求它评审层级高于自身的工作。

对于每项任务，在派遣之前说明三个维度的评估结果、所选层级以及一行简要理由。然后应用[角色配对](#role-pairing)——其规则应完整适用，包括 `--model` 覆盖规则——以确定该任务（或该组）的元评审层级。

#### 3.2 专用代理选择（可选）

如果任务属于某个专门领域，请在所有并行代理中加入相关的代理提示词。专用代理能够提供特定领域的最佳实践，从而提升输出质量。

**专用代理：** 专用代理列表取决于项目以及已加载的插件。

**决策：** 在以下情况下使用专业智能体：
- 任务明显受益于领域专业知识
- 所有并行智能体之间的一致性很重要
- 任务并非琐碎任务（对于简单任务而言，额外开销并不划算）

在以下情况下跳过专业智能体：
- 任务简单且机械化（Haiku 级别）
- 不存在明确匹配的领域
- 使用通用智能体执行便已足够

### 阶段 3.5：分派元评审智能体（按需求类型分组，全部并行执行）

在分派实现智能体之前，根据阶段 2 的需求分组分析来分派元评审智能体。元评审智能体的数量取决于分组情况：每个可重复组一个、每个共享组一个，以及每个独立任务一个。无论分组类型如何，所有元评审智能体都将并行启动。每个元评审智能体都会生成评审量规、检查清单和评分标准。每份规范仅可复用于其关联任务的所有重试。

重要：遵循上下文隔离原则——仅向每个智能体传递与其特定目标或组相关的上下文。

#### 3.5.1 按分组类型划分的元评审智能体提示词模板

**独立元评审智能体提示词：**

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

**可重复组元评审智能体提示词（每组一个）：**

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
- Do NOT include file-specific requirements (e.g., NOT "file should have only authentication logic") if the same spec will be applied to another target which logically cannot fulfill this criteria (e.g. "cart.ts" or "payments.ts" cannot have authentication logic)
- The spec must be applicable to ANY target in this group without modification
- Each judge will receive this same spec and evaluate only its own target against it
User prompt is provided as context, you should use it only as reference of changes that can occur in the project by other agents.
Return only the final evaluation specification YAML in your response.
```

**共享组元评审提示词（每组一个）：**

```markdown
## 任务

生成一个综合评估规范 YAML，涵盖以下所有相关任务。这些任务相互依赖，并将由单个评审者一起评审。你将生成评分细则、检查清单和评分标准，并考虑跨任务依赖关系和集成点。

CLAUDE_PLUGIN_ROOT=`${CLAUDE_PLUGIN_ROOT}`

## 作为上下文的用户提示词
{原始用户提示词}

## 此共享组中的任务
{所有任务及其目标的列表：
- 任务 1：{描述} -> {目标}
- 任务 2：{描述} -> {目标}
}

## 上下文
{任何相关的代码库上下文、文件路径、约束、任务之间的集成点}

## 产物类型
{代码 | 文档 | 配置 | 等}

## 指令
关键：你正在为将由一个评审者一起评审的任务生成一份综合规范。
- 为每个单独任务包含评估标准
- 包含跨任务验证标准（例如，“适配器实现与集成模块所使用的接口相匹配”）
- 组织规范，使评审者能够识别哪些标准适用于哪个任务的变更
- 评审者将在一次评估中审查该组所有任务的全部变更
用户提示词作为上下文提供，你应仅将其用作其他代理可能在项目中进行的变更的参考。
响应中仅返回最终评估规范 YAML。
```

#### 3.5.2 分派模式

**在单个响应中分派所有元评审者（无论分组类型如何）：**

```
使用 Task 工具（每个组/独立任务一个，全部放在同一条消息中）：

[可重复组的元评审者：“添加测试”]
  - description: "元评审者（可重复）：用于跨 3 个模块添加测试的可复用规范"
  - prompt: {可重复组元评审提示词}
  - model: {元评审模型——如果用户传入了 `--model`，则使用该模型；否则使用该组任务中当前最高的实现层级，或根据角色配对规则提高一个层级}
  - subagent_type: "sadd:meta-judge"

[共享组的元评审者：“S3 适配器 + 集成”]
  - description: "元评审者（共享）：S3 适配器实现和集成的综合规范"
  - prompt: {共享组元评审提示词}
  - model: {元评审模型——如果用户传入了 `--model`，则使用该模型；否则使用该组任务中当前最高的实现层级，或根据角色配对规则提高一个层级}
  - subagent_type: "sadd:meta-judge"

[独立任务的元评审者：“更新 CI 流水线”]
  - description: "元评审者：更新 CI 流水线"
  - prompt: {独立元评审提示词}
  - model: {元评审模型——如果用户传入了 `--model`，则使用该模型；否则使用此任务的实现层级，或根据角色配对规则提高一个层级}
  - subagent_type: "sadd:meta-judge"

[同时启动所有元评审者]
```

**关键：** 不要等到所有元评审者都完成后才进入阶段 4。每个元评审者一完成，就立即启动实现代理。如果所有元评审者均已完成，则在单个响应中启动所有实现代理。

### 阶段 4：为每个目标构建提示词

为每个目标构建相同的提示词结构，仅根据目标特定的详细信息进行定制：

#### 4.1 零样本思维链前缀（必需——必须位于最前面）

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

#### 4.2 任务正文（针对每个目标定制）

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

#### 4.3 自我审查后缀（必需——必须位于最后）

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

### 阶段 5：并行分派实现任务并由评审验证

元评审完成后，同时启动所有实现子代理，然后根据分组类型由评审进行验证。

#### 5.1 执行流程

**独立 / 可重复流程**（每个任务一名评审）：

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
│   │ +Spec YAML A  │   │ +Reusable Spec│   │ +Reusable Spec│              │
│   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘               │
│          ▼                  ▼                  ▼                        │
│   Parse Verdict (per target) → PASS/FAIL → Retry if needed             │
└─────────────────────────────────────────────────────────────────────────┘
```

**共享流程**（整个组使用一名评审）：

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

在单次响应中启动所有实现代理。不要等待一个代理完成后再启动另一个代理：

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
- 在单个批次（同一响应）中启动所有相互独立的任务
- 不要等待一个任务完成后再启动另一个任务
- 不要按顺序调用 Task 工具
- Task 工具会自动处理并行化
- 所有任务完成后统一收集结果

**上下文隔离（重要）：**
- 仅传递与各个特定目标相关的上下文
- 不要将所有目标的完整列表传递给每个代理
- 让子代理通过读取文件自行发现局部模式
- 每个代理都在干净的上下文中工作，避免累积混乱

#### 5.2 评审代理验证协议

所有实现代理完成后，根据阶段 2 中确定的需求分组来调度评审代理。调度模式因分组类型而异：

| 分组类型 | 评审代理调度 | 使用的规范 |
|---------------|---------------|-----------|
| **独立型** | 每个任务一个评审代理 | 任务特定的元评审规范 |
| **可重复型** | 每个任务一个评审代理 | 使用该组元评审代理提供的同一个共享可复用规范 |
| **共享型** | 整个组使用一个评审代理 | 该组元评审代理提供的组合规范 |

关键：向评审代理提供完全一致的元评审评估规范 YAML，不要跳过或添加任何内容，不要以任何方式修改它，也不要缩短或总结其中的任何文本！对于可重复型分组，每个目标的评审代理都会收到同一个可复用规范。对于共享型分组，单个评审代理会收到涵盖所有任务的组合规范。

##### 5.2.1 分析“预先存在或预期的并行变更”部分

在调度每个目标的评审代理之前，评估代码库中是否存在评审代理需要注意的预先存在或预期的并行变更。“预先存在或预期的并行变更”部分可防止评审代理将先前的修改与当前实现代理的工作混淆。

**应在以下情况中包含：**

- 同一会话中先前完成的 do-in-parallel 运行（先前批次中的所有目标）
- 用户在调用该技能之前手动进行的修改（可从对话上下文或 git 中看到）
- 在此次并行调度之前运行的其他工具或代理所做的变更
- 同一批次中其他并行代理的预期变更（例如，预期其他代理会在并行开发期间修改仓库中的其他文件）

**何时省略：**

- 这是首次运行，且没有已知的既有更改——完全省略此章节
- 在同一目标内重试时，不要将实现代理自己之前的尝试列为“既有更改”——这些更改属于当前目标的迭代周期

**内容指南：**

- 使用高层级摘要：任务描述、受影响的文件/模块列表、更改的大致性质（创建、修改、删除）
- 不要包含代码块、差异或行级细节——保持简洁
- 清楚标注来源："Previous do-in-parallel: {description}"、"User modifications (before current task)" 等
- 如果存在多个更改来源，请为每个来源使用单独的小节

关键要求：避免读取完整代码库或 git 历史记录，只需使用高层级的 git diff/status 来确定哪些文件发生了更改，或者使用对话上下文来确定是否存在任何既有更改。

##### 5.2.2 使用提示词和目标特定的规范 YAML 启动 Judge

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

关键要求：绝不要以任何格式提供分数阈值，包括 `threshold_pass` 或任何其他形式。Judge 绝不能知道分数阈值，以免产生偏见！！！

##### 5.2.3 共享组 Judge 提示词模板

对于由一个 Judge 统一审查所有相关更改的共享组：

```markdown
你正在根据元评审生成的综合评估规范，评估一组相关任务的实现产物。这些任务相互依赖，必须一并评审。

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

## 说明
用户提示仅作为上下文提供，你只能将其用作项目中其他代理可能进行的更改的参考。请一并评估此共享组中的所有任务。验证跨任务集成点（例如，适配器是否与集成模块所使用的接口匹配？）。
关键要求：对于每个任务，请分别指出其是 PASSED 还是 FAILED，以便仅重试失败的任务。
请遵循代理说明中定义的完整评审流程！

## 输出

关键要求：你必须在回复的开头使用以下完全一致的 YAML 结构化评估报告格式！请在报告中包含每个任务的裁定结果。
```

##### 5.2.4 按分组类型分派评审代理

**独立且可重复的目标——每个任务一个评审代理：**

```
Use Task tool:
  - description: "Judge: {target name}"
  - prompt: {judge verification prompt with exact meta-judge specification YAML, and Pre-existing or Expected Parallel Changes section if applicable}
  - model: {judge model — the user's `--model` if one was passed; otherwise MUST equal this task's current implementation tier, including after escalation}
  - subagent_type: "sadd:judge"
```

对于可重复组，每个评审代理都会收到该组唯一元评审所生成的同一份共享可复用规范，但其 **model** 仍为对应任务自身当前的实现层级——即使可重复任务共享同一份规范，它们的层级也可能不同。直接使用 5.2.2 中的评审提示模板；不同评审代理之间只有目标和实现输出不同。

**共享组——整个组仅使用一个评审代理：**

```
Use Task tool:
  - description: "Judge (shared): {group description}"
  - prompt: {shared group judge prompt from 5.2.3 with combined meta-judge specification YAML and ALL implementation outputs}
  - model: {judge model — the user's `--model` if one was passed; otherwise MUST equal the HIGHEST current implementation tier among this group's tasks, including after any of them escalates}
  - subagent_type: "sadd:judge"
```

**并行启动所有评审代理**（独立、可重复和共享评审代理均在同一响应中分派）。

关键：绝不要以任何格式提供分数阈值，包括 `threshold_pass` 或任何其他形式。评审者绝不能知道分数阈值是多少，以免产生偏见！！！

#### 5.3 解析裁决并迭代

解析每个目标的评审输出（不要阅读完整报告）：

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

**重要：失败相互隔离**
- 一个目标失败不会影响其他目标
- 其他并行任务继续独立执行
- 仅重试失败的目标

**共享组裁决解析：**

对于共享组，评审者会在一份报告中给出各任务的裁决。分别解析每个任务的裁决：

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

在分派任何重试任务之前，你必须按照[升级规则](#escalation-rule)明确决定失败任务的层级——该规则完全适用，包括其中唯一的保持层级例外——并将该决定记录在结果表中对应目标的行内。在此基础上，还需遵循以下针对重试的具体规定：

- **触发条件 (1) 在此以 `score < 3.0` 为明确界限**（或者问题表明模型误解了任务，而不只是遗漏了细节）。
- **范围：**遵循[升级规则](#escalation-rule)。
- **独立组和可重复组的裁判：**重试的裁判必须按与重试实现相同的层级派发。
- **共享组裁判：**由于由一个裁判统一审查组内的所有任务，其重试层级必须等于该组各任务当前实现层级中的最高层级——这样，即使未升级的同组任务仍停留在原层级，已升级任务的裁判覆盖层级也绝不会低于其自身层级。
- 任务的元裁判（对于可重复组/共享组，则为该组的元裁判）既不会重新运行，也不会重新分层；每次重试都会复用其规范。
- 升级后的层级仅适用于**此任务剩余的尝试**——其他所有目标均保持其在[阶段 3](#phase-3-model-and-agent-selection) 中分配的层级。
- 如果 `opus` 仍然失败，则按照[错误处理](#error-handling)升级至用户。

#### 5.4 使用反馈重试（如有需要）

**重试提示词模板：**

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

你的主要任务是在目标质量范围内完成任务，并且迭代工作量必须与每个目标的规模相称。以下两种失败模式同样真实存在：

- 将重试次数和上下文浪费在吹毛求疵的问题上，导致整个批次永远无法完成 → **任务失败**。
- 接受一个质量确实过差、无法视为已完成的目标 → **更严重的失败**。

将以下规则应用于每个裁判评分（对于共享组，分别应用于组内各任务的判定）：

- **`score < 3.0` → 无条件失败。不得裁量。**根据裁判反馈重试，直到目标通过或达到最大重试次数。
- **`3.0 <= score < 4.0` → 裁量区间。**只有在此区间内，你才可以决定接受未达到 `4.0` 目标分数的目标。固定的 `4.0` 目标分数使实际下限为 `3.0`，因此无需单独设置有界降分保护机制。
- 在此区间内，只有当未解决的问题全都是低/中优先级问题（存在任何 High 或 Critical 级别的问题都会完全取消裁量空间），并且其中没有任何问题违反目标要求或造成实质性缺陷（即它们只是吹毛求疵的问题）时，你才必须在派发重试**之前**先判断再次尝试是否值得付出相应的时间和上下文成本。
- **由吹毛求疵问题驱动的重试最多只能进行一次**，且会计入重试预算。如果重试后再次发现的仍然只是吹毛求疵的问题，你必须将目标标记为已完成（`ACCEPTED`），在最终总结中报告尚未解决的问题，然后继续处理后续目标。如果返回的分数低于 `3.0`，则改为应用无条件失败规则。
- 你必须严格，而非宽松。未达到目标分数便停止，必须是一个基于不存在真正违反要求的问题而作出的审慎决定。如果某个真正的阻塞性问题导致无法在最大重试次数内完成目标，则必须将其报告为失败目标，绝不能粉饰过去。
- **如果 `STRICT_MODE` 为 true，则整条规则均被禁用**：仅当 `score >= 4.0` 或达到最大重试次数时才停止。`--strict` 不会改变其他任何内容——`4.0` 的目标分数、最大重试次数、`< 3.0` 时的无条件失败，以及元裁判/裁判派发均不受影响。

### 阶段 6：收集并汇总结果

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
- 成功的任务不受失败任务的影响
- 达到最大重试次数后隔离失败的目标
- 建议可选方案：提供指导、跳过或手动修复

## 示例

### 示例 1：需求分组——混合可重复任务与独立任务（包含上一批次的预先存在变更）

**场景：**

某团队依次运行两个 do-in-parallel 批次。第一批次更新 3 个端点文件（`src/api/users.ts`、`src/api/orders.ts`、`src/api/products.ts`）中的 API 文档。第二批次为 src 文件夹中的全部 3 个模块添加测试，并向 GitHub Actions 添加测试步骤。第二批次中每个代理的评审代理都需要了解第一批次的文档变更，以及同一第二批次中其他并行代理预计进行的变更。

**输入（第二批次——第一批次已在本次会话中提前完成）：**

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
| src/modules/auth.ts | 可重复 | opus | opus 是通过条件触发而获得的——即使任务本身“只是”添加测试，关键触发器仍会在身份验证领域触发；错误的测试可能会掩盖真实的身份验证缺陷 |
| src/modules/cart.ts | 可重复 | sonnet | 按照既有模式编写代码（生成测试）；cart.ts 不存在关键领域触发器 |
| src/modules/payments.ts | 可重复 | opus | opus 是通过条件触发而获得的——关键触发器会在支付领域触发 |
| .github/workflows/ci.yml | 独立 | haiku | 遵循现有流水线约定，以机械化方式添加一个小型 CI 步骤 |

尽管可重复组共享同一个元评审规范，但其中的任务并不共享同一层级：auth.ts 和 payments.ts 各自独立命中关键触发器，而 cart.ts 没有。共享元评审本身使用 `opus` 运行，这是它所服务的三个任务中的最高层级。

**阶段 3.5：元评审调度（2 个元评审并行）：**

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

**阶段 5：实现分派（元评审代理完成后，4 个代理并行执行）：**

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

**阶段 5.2：评审器分派（所有实现器完成后，4 个评审器并行执行）：**

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

| 目标 | 分组 | 模型 | 评审分数 | 重试次数 | 状态 |
|--------|----------|-------|-------------|---------|--------|
| src/modules/auth.ts | 可重复 | opus | 4.2/5.0 | 0 | 成功 |
| src/modules/cart.ts | 可重复 | sonnet | 4.0/5.0 | 0 | 成功 |
| src/modules/payments.ts | 可重复 | opus | 4.1/5.0 | 0 | 成功 |
| .github/workflows/ci.yml | 独立 | haiku | 4.3/5.0 | 0 | 成功 |

**总体：** 4/4 已完成。智能体总数：10（2 个元评审智能体 + 4 个实现智能体 + 4 个评审智能体）

---

### 示例 2：需求分组——共享与可重复组合（存在用户预先修改）

**场景：**

一名开发者在对话过程中一直在开发一个 Node.js 后端。他们重构了数据库连接层，并手动更新了多个服务模块，包括添加 S3 类接口。随后，他们调用 do-in-parallel 来实现并集成 S3 接口，同时重构购物车模块。每个智能体的评审智能体都需要了解用户之前的修改，以及同一批次中其他并行智能体预计会进行的更改。

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

**阶段 3：模型选择**

| 目标 | 分组 | 层级 | 理由 |
|--------|----------|------|-----------|
| src/adapters/s3.adapter.ts | 共享 | opus | 共享契约触发条件——其公共接口是任务 B 进行集成时所依赖的契约 |
| src/modules/analytics.module.ts | 共享 | opus | 共享契约触发条件——针对配对任务中定义的适配器公共接口进行集成 |
| src/modules/cart/cart.service.ts | 可重复 | sonnet | 重构仅限于单个文件，不涉及契约变更 |
| src/modules/cart/cart.repository.ts | 可重复 | sonnet | 重构仅限于单个文件，不涉及契约变更 |
| src/modules/cart/cart.controller.ts | 可重复 | sonnet | 重构仅限于单个文件，不涉及契约变更 |

共享组选择 `opus`，因为任务 A 和任务 B 共享同一契约——即分析集成所使用的 S3 适配器公共接口——而[选择规则](#selection-rules)将“共享契约发生变化时，无论文件数量多少”列为触发 `opus` 的条件。可重复组选择 `sonnet`，因为每个购物车文件都是独立重构的，且不涉及契约变更。共享组的元评审器及其唯一的评审器也使用 `opus`——角色配对默认让一个任务的三个角色全部使用相同层级，而共享评审器的层级取其所服务任务中当前实现层级的最高值（两者都是 `opus`，因为它们的层级一致）。

**阶段 3.5：元评审器分派（2 个元评审器并行）：**

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

**阶段 5：实现任务分派（元评审完成后，由 5 个代理并行执行）：**

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

**阶段 5.2：评审调度（所有实现者完成后，并行启动 4 个评审）：**

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
    other parallel agents in the same batch now. They are NOT part of
    the current implementation agents' output for this shared group.
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
    other parallel agents in the same batch now. They are NOT part of
    the current implementation agent's output. Focus your evaluation
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

**可重复组重试场景**（如果 cart.controller.ts 的评审发现问题）——演示[重试时的模型升级](#531-model-escalation-on-retry)：

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

| 目标 | 分组 | 模型 | 评审分数 | 重试次数 | 状态 |
|--------|----------|-------|-------------|---------|--------|
| src/adapters/s3.adapter.ts | 共享 | opus | 4.2/5.0 | 0 | 成功 |
| src/modules/analytics.module.ts | 共享 | opus | 4.4/5.0 | 0 | 成功 |
| src/modules/cart/cart.service.ts | 可重复 | sonnet | 4.0/5.0 | 0 | 成功 |
| src/modules/cart/cart.repository.ts | 可重复 | sonnet | 4.3/5.0 | 0 | 成功 |
| src/modules/cart/cart.controller.ts | 可重复 | sonnet → opus | 4.1/5.0 | 1 | 成功 |

**总体：** 5/5 已完成。智能体总数：13（2 个元评审 + 5 个实现智能体 + 4 个评审 + 1 个重试实现智能体 + 1 个重试评审）

---

### 示例 3：需求分组——全部独立

**输入：**

```
/do-in-parallel write tests for loan.service.ts, add password recovery feature to auth module and enable caching during dependency loading in github actions.
```

**编排器分析：**

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

**阶段 3：模型选择**

| 目标 | 层级 | 理由 |
|--------|------|-----------|
| src/services/loan.service.ts | sonnet | 基于既有模式编写测试；仅生成测试不会触发关键触发条件 |
| src/modules/auth/ | opus | opus 是合理选定的——身份验证领域（密码重置令牌的签发与验证）触发了关键触发条件 |
| .github/workflows/ci.yml | haiku | 使用标准 GitHub Action 进行小型、机械式的缓存配置变更；无需编写逻辑 |

**阶段 3.5：元评审调度（3 个元评审并行执行）：**

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

**阶段 5：实施任务分派（3 个代理并行执行，在元评审完成后）：**

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

**阶段 5.2：评审调度（所有实现代理完成后，并行运行 3 个评审代理）：**

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

| 目标 | 分组 | 模型 | 评审分数 | 重试次数 | 状态 |
|--------|----------|-------|-------------|---------|--------|
| src/services/loan.service.ts | 独立 | sonnet | 4.1/5.0 | 0 | 成功 |
| src/modules/auth/ | 独立 | opus | 4.3/5.0 | 0 | 成功 |
| .github/workflows/ci.yml | 独立 | haiku | 4.0/5.0 | 0 | 成功 |

**总体：** 3/3 已完成。代理总数：9（3 个元评审代理 + 3 个实现代理 + 3 个评审代理）。对于完全独立的任务，无法通过分组减少代理数量。

## 最佳实践

### 目标选择

- **具体明确：** 尽可能列出确切文件
- **谨慎使用 glob：** 确认前检查展开后的列表
- **限制范围：** 为便于管理，每批最多包含 10-15 个目标
- **按相似性分组：** 相似目标可受益于一致的模式

### 模型选择指南

以下仅为快速参考示例——以[模型选择策略](#model-selection-policy)为准；当某个场景无法完全归入以下类别时，请遵循[选择规则](#selection-rules)表，而不是此列表。

| 场景 | 层级 | 原因 |
|----------|------|--------|
| 安全关键逻辑（身份验证、支付、数据完整性） | `opus` | 关键触发条件——无论任务规模大小均满足使用条件 |
| 多文件重构或共享契约变更 | `opus` | 复杂触发条件——涉及多个文件或跨文件的契约变更 |
| 仅限单个文件且不涉及契约变更的重构 | `sonnet` | 基于既有模式的单模块变更 |
| 文档生成 | `haiku` | 机械性任务，不涉及代码或跨文件推理 |
| 按文件进行代码审查或测试生成 | `sonnet` | 能力均衡，且有既定模式可循 |

### 元评审 + 评审验证

- **首先进行需求分组** - 在分派任何元评审代理之前，分析任务是否可按可重复、共享或独立方式分组，以尽量减少代理总数
- **每个组或独立任务对应一个元评审代理** - 可重复组共享一个可复用规范，共享组共享一个组合规范，独立任务则各自使用独立规范
- **首先批量启动元评审代理** - 并行启动所有元评审代理（无论分组类型如何），然后再启动实现代理
- **重试时复用规范** - 每个组/目标的评估规范在重试期间保持不变；仅实现发生变化
- **仅解析评审结果中的标头** - 不要阅读完整报告，以避免上下文污染
- **包含 CLAUDE_PLUGIN_ROOT** - 元评审代理和评审代理都需要解析后的插件根路径
- **特定于目标的 YAML** - 仅将相关的元评审 YAML 传递给对应的评审代理，不要向其中添加任何其他文本或注释！
- **共享组重试** - 仅重新启动具体失败的实现代理，而不是整个组

### 评审模型选择

根据[角色配对](#role-pairing)，评审模型层级并非独立于实现模型层级——默认情况下，两者使用相同层级。不存在由 `opus` 评审 `haiku` 层级任务的场景；强化（参见角色配对表）只能提升双方共享的**标准制定者**（元评审代理），绝不能只提升评审代理。

| 实现层级 | 评审层级 | 理由 |
|---------------------|------------|-----------|
| `opus` | `opus` | 产出者和评估者可以使用相同层级 |
| `sonnet` | `sonnet` | 产出者和评估者可以使用相同层级 |
| `haiku` | `haiku` | 产出者和评估者可以使用相同层级 |

**指南：** 请参阅[角色配对](#role-pairing)。

### 上下文隔离

- **最小化上下文：** 每个子代理只获得其所需的信息
- **禁止交叉引用：** 不要将代理 B 的目标告诉代理 A
- **让它们自行探索：** 子代理通过读取文件来理解模式
- **以文件系统为准：** 通过文件系统协调变更
- **跟踪已有变更** - 将先前修改的上下文传递给每个代理的评审者，以免混淆已有变更与当前变更的归属

### 质量保证

- **三层验证：** 自我评析（内部）+ 特定目标的元评审规范（结构化）+ 评审（外部）
- **先进行自我评析：** 实现代理在提交前验证自己的工作
- **特定目标的元评审规范：** 每个目标都有根据其独特特征量身定制的评分标准，从而生成更精确的评估准则
- **然后进行外部评审：** 独立评审者机械地应用特定目标的元评审规范——发现自我评析遗漏的盲点
- **迭代循环：** 根据反馈重试，直至通过或达到最大重试次数
- **适度迭代：** 应用[迭代酌情规则](#55-iteration-discretion-rule)——由吹毛求疵的问题驱动的重试最多一次，绝不低于 `3.0`，使用 `--strict` 时禁用
- **故障隔离：** 一个目标失败不会影响其他目标
- **检查摘要：** 检查失败或仅部分完成的任务
- **随后运行测试：** 并行变更之间可能存在不易察觉的相互影响
- **原子化提交：** 一个批次中的所有变更 = 一个提交

#### 错误处理

| 失败类型 | 描述 | 恢复操作 |
|--------------|-------------|-----------------|
| **可恢复** | 评审者发现问题，仍可重试 | 根据评审反馈重试（每个目标最多 3 次），但须遵循[迭代酌情规则](#55-iteration-discretion-rule) |
| **方案失败** | 针对此目标的方案有误 | 向用户上报并提供选项 |
| **基础问题** | 需求不明确或无法实现 | 向用户上报并请求澄清 |
| **超过最大重试次数** | 目标在重试 3 次后仍然失败 | 标记为失败，继续处理其他目标，并在最后报告 |

**关键规则：**
- 未经用户确认，达到最大重试次数后绝不继续
- 未解决评审问题，绝不尝试“向前修复”
- 绝不跳过评审验证
- 如果缺少上下文，立即停止并报告（不要猜测）
- 隔离故障——一个目标失败不会阻止其他目标继续进行