---
name: context-engineering
description: Understand the components, mechanics, and constraints of context in agent systems. Use when writing, editing, or optimizing commands, skills, or sub-agents prompts.
---
# 上下文工程基础

上下文是语言模型在推理时可用的完整状态。它包括模型生成响应时能够关注的所有内容：系统指令、工具定义、检索到的文档、消息历史记录以及工具输出。理解上下文的基础原理，是有效开展上下文工程的前提。

## 核心概念

上下文由多个不同的组成部分构成，每个部分都有不同的特征和约束。注意力机制形成了有限的预算，制约着上下文的有效使用。渐进式披露通过仅在需要时加载信息来管理这一约束。上下文工程的核心，是筛选出能够实现预期结果的最小高信号 token 集合。

## 详细主题

### 上下文的构成

**系统提示词**
系统提示词用于确立智能体的核心身份、约束和行为准则。它们在会话开始时加载一次，通常会在整个对话期间持续生效。系统提示词应当极其清晰，并使用简单、直接的语言，同时保持适合智能体的抽象层级。

合适的抽象层级需要在两种失败模式之间取得平衡。在一个极端，工程师将复杂而脆弱的逻辑硬编码到提示词中，从而导致系统易受破坏，并带来维护负担。在另一个极端，工程师只提供模糊的高层指导，既无法为预期输出提供具体信号，又错误地假定双方共享相同的上下文。最佳的抽象层级应当取得平衡：既足够具体，能够有效引导行为；又足够灵活，能够提供强有力的启发式指导。

使用 XML 标签或 Markdown 标题将提示词组织为不同的部分，以清晰区分背景信息、指令、工具指导和输出说明。随着模型能力不断增强，具体的格式已不再那么重要，但清晰的结构仍然具有价值。

**工具定义**
工具定义用于规定智能体可以执行的操作。每个工具都包括名称、描述、参数和返回格式。序列化之后，工具定义位于上下文中靠前的位置，通常放在系统提示词之前或之后。

所有工具描述共同引导智能体的行为。质量较差的描述会迫使智能体进行猜测；经过优化的描述则会包含使用情境、示例和默认值。整合原则指出：如果人类工程师无法明确判断在特定情境下应使用哪个工具，就不能指望智能体做得更好。

**检索到的文档**
检索到的文档用于提供特定领域的知识、参考资料或与任务相关的信息。智能体使用检索增强生成，在运行时将相关文档调入上下文，而不是预先加载所有可能用到的信息。

即时加载方法会保留轻量级标识符（文件路径、已存储的查询、网页链接），并利用这些引用将数据动态加载到上下文中。这与人类认知相似：我们通常不会记住完整的信息语料，而是使用外部组织和索引系统，按需检索相关信息。

**消息历史**
消息历史包含用户与代理之间的对话，包括之前的查询、响应和推理。对于长时间运行的任务，消息历史可能不断增长，并占据上下文用量的主要部分。

消息历史充当暂存记忆，代理可在其中跟踪进度、维护任务状态，并在多个轮次之间保留推理过程。有效管理消息历史对于完成长周期任务至关重要。

**工具输出**
工具输出是代理操作的结果：文件内容、搜索结果、命令执行输出、API 响应及类似数据。在典型的代理轨迹中，工具输出占据了大部分 token；研究表明，观察结果（工具输出）可达到上下文总用量的 83.9%。

无论工具输出是否与当前决策相关，都会消耗上下文。这使得观察结果屏蔽、压缩和选择性保留工具结果等策略变得十分必要。

### 上下文窗口与注意力机制

**注意力预算约束**
语言模型通过注意力机制处理 token，该机制会在上下文中的所有 token 之间建立两两关系。对于 n 个 token，会产生 n^2 个必须计算和存储的关系。随着上下文长度增加，模型捕捉这些关系的能力会逐渐捉襟见肘。

模型会从以较短序列为主的训练数据分布中形成注意力模式。这意味着模型处理跨越整个上下文的依赖关系时，经验更少，专门用于此类任务的参数也更少。其结果是存在一个会随着上下文增长而不断消耗的“注意力预算”。

**位置编码与上下文扩展**
位置编码插值通过让模型适应最初训练时使用的较小上下文，使其能够处理更长的序列。然而，这种适配会降低模型对 token 位置的理解能力。模型在较长上下文中仍然具有很强的能力，但与较短上下文中的表现相比，其信息检索和长程推理的精确度会有所下降。

**渐进式披露原则**
渐进式披露通过仅在需要时加载信息来高效管理上下文。启动时，代理只加载技能名称和描述--这些信息足以判断某项技能何时可能相关。只有在针对特定任务激活某项技能时，才会加载其完整内容。

这种方法既能保持代理的高效运行，又能让其按需访问更多上下文。该原则适用于多个层面：技能选择、文档加载，甚至工具结果检索。

### 上下文质量与上下文数量

认为更大的上下文窗口可以解决记忆问题这一假设，已被实证研究证伪。上下文工程意味着寻找尽可能小的高信号 token 集合，以最大限度提高获得预期结果的可能性。

多个因素共同造成了提高上下文效率的压力。处理成本会随着上下文长度不成比例地增长--token 数量翻倍，成本并非仅仅翻倍，而是会在时间和计算资源方面呈指数级增长。即使上下文窗口在技术上支持更多 token，模型性能在超过特定上下文长度后仍会下降。即便使用前缀缓存，长输入的成本依然很高。

指导原则是信息量优先于面面俱到。纳入与当前决策相关的内容，排除无关内容，并设计能够按需访问额外信息的系统。

### 将上下文视为有限资源

必须将上下文视为一种边际收益递减的有限资源。就像人类的工作记忆有限一样，语言模型在解析大量上下文时也会消耗注意力预算。

每引入一个新 token，都会在一定程度上消耗这项预算。因此，需要对可用的 token 进行谨慎筛选。这里的工程问题在于，如何在固有约束下优化效用。

上下文工程是一个迭代过程，每当你决定向模型传递哪些内容时，都会进行筛选。它不是一次性的提示词编写工作，而是一项持续进行的上下文管理实践。

## 实践指南

### 基于文件系统的访问

能够访问文件系统的代理可以自然地使用渐进式披露。将参考资料、文档和数据存储在外部。仅在需要时使用标准文件系统操作加载文件。这种模式可以避免在上下文中塞入可能无关的信息。

文件系统本身提供了可供代理导航的结构。文件大小可以表明复杂程度；命名约定可以提示用途；时间戳可以作为相关性的替代指标。文件引用的元数据提供了一种高效优化行为的机制。

### 混合策略

最有效的代理会采用混合策略。预先加载部分上下文以提高速度（例如 CLAUDE.md 文件或项目规则），同时允许根据需要自主探索以获取额外上下文。决策边界取决于任务特征和上下文动态。

对于动态变化较少的内容，预先加载更多上下文是合理的。对于快速变化或高度特定的信息，即时加载可以避免使用过时的上下文。

### 上下文预算管理

设计时应明确考虑上下文预算。了解模型和任务的有效上下文限制。在开发过程中监控上下文使用情况。在适当的阈值实施压缩触发机制。设计系统时，应假设上下文会退化，而不是寄希望于它不会退化。

有效的上下文预算管理不仅需要了解原始 token 数量，还需要了解注意力的分布模式。上下文中间部分获得的注意力少于开头和结尾。应将关键信息放在更容易获得注意力的位置。

## 示例

**示例 1：组织系统提示词**
```markdown
<BACKGROUND_INFORMATION>
You are a Python expert helping a development team.
Current project: Data processing pipeline in Python 3.9+
</BACKGROUND_INFORMATION>

<INSTRUCTIONS>
- Write clean, idiomatic Python code
- Include type hints for function signatures
- Add docstrings for public functions
- Follow PEP 8 style guidelines
</INSTRUCTIONS>

<TOOL_GUIDANCE>
Use bash for shell operations, python for code tasks.
File operations should use pathlib for cross-platform compatibility.
</TOOL_GUIDANCE>

<OUTPUT_DESCRIPTION>
Provide actionable feedback with specific line references.
Explain the reasoning behind suggestions.
</OUTPUT_DESCRIPTION>
```

**示例 2：渐进式文档加载**
```markdown
# Instead of loading all documentation at once:

# Step 1: Load summary
docs/architecture_overview.md     # Lightweight overview

# Step 2: Load specific section as needed
docs/api/endpoints.md             # Only when API work needed
docs/database/schemas.md          # Only when data layer work needed
```

**示例 3：Skill 描述设计**
```markdown
# Bad: Vague description that loads into context but provides little signal
description: Helps with code things

# Good: Specific description that helps model decide when to activate
description: Analyze code quality and suggest refactoring patterns. Use when reviewing pull requests or improving existing code structure.
```

## 指南

1. 将上下文视为一种回报递减的有限资源
2. 将关键信息放在更容易获得注意力的位置（开头和结尾）
3. 使用渐进式披露，将加载推迟到需要时
4. 使用清晰的章节边界组织系统提示词
5. 在开发过程中监控上下文使用情况
6. 在利用率达到 70-80% 时触发压缩
7. 针对上下文退化进行设计，而不是寄希望于避免它
8. 相较于更大但信号较弱的上下文，优先选择更小但信号较强的上下文

# 上下文退化模式

随着上下文长度增加，语言模型会呈现出可预测的退化模式。理解这些模式对于诊断故障和设计具有韧性的系统至关重要。上下文退化不是一种非此即彼的状态，而是一个性能持续下降的过程，并会以若干不同的方式表现出来。

## 核心概念

上下文退化会通过若干不同的模式表现出来。「中间信息丢失」现象会导致上下文中央的信息获得较少的注意力。当错误因反复引用而不断累积时，就会发生上下文污染。当无关信息淹没相关内容时，就会发生上下文干扰。当模型无法确定应该应用哪部分上下文时，就会出现上下文混淆。当累积的信息彼此直接冲突时，就会形成上下文冲突。

这些模式是可预测的，并且可以通过压缩、掩码、分区和隔离等架构模式加以缓解。

## 详细主题

### 「中间信息丢失」现象

最有充分文献记录的退化模式是「中间信息丢失」效应，即模型会呈现 U 形注意力曲线。位于上下文开头和结尾的信息能够可靠地获得注意力，而埋在中间的信息，其回忆准确率会大幅下降。

**实证证据**
研究表明，与将相同信息放在开头或结尾相比，放在上下文中间的相关信息，其回忆准确率会降低 10-40%。这并非模型的故障，而是注意力机制和训练数据分布共同作用的结果。

模型会为第一个词元（通常是 BOS 词元）分配大量注意力，以稳定内部状态。这会形成一个「注意力汇点」，吸收注意力预算。随着上下文增长，有限的预算会被摊得越来越薄，中间的词元无法获得足够的注意力权重，因而难以被可靠检索。

**实际影响**
在设计上下文中的信息位置时，应考虑注意力模式。将关键信息放在上下文的开头或结尾。考虑信息是会被直接查询，还是需要用于支持推理——如果是后者，位置的重要性较低，但整体信号质量更为重要。

对于长文档或长对话，应使用摘要结构，将关键信息呈现在更容易获得注意力的位置。使用明确的章节标题和过渡语句，帮助模型理解和浏览内容结构。

### 上下文污染

当幻觉、错误或不正确信息进入上下文，并因反复引用而不断累积时，就会发生上下文污染。一旦受到污染，上下文就会形成反馈循环，持续强化错误认知。

**污染如何发生**
污染通常通过三种途径进入上下文。第一，工具输出可能包含错误或意外格式，而模型会将其视为事实依据。第二，检索到的文档可能包含不正确或过时的信息，而模型会将这些信息纳入推理过程。第三，模型生成的摘要或中间输出可能引入幻觉，并持续存在于上下文中。

这种累积效应非常严重。如果智能体的目标部分受到污染，它就会制定出需要付出大量努力才能纠正的策略。之后的每个决策都会引用被污染的内容，从而强化错误假设。

**检测与恢复**
需要留意以下症状：在此前能够成功完成的任务上，输出质量下降；智能体调用了错误的工具或参数，导致工具使用出现偏差；以及尽管尝试纠正，幻觉仍持续存在。出现这些症状时，应考虑是否发生了上下文污染。

恢复需要移除或替换被污染的内容。这可能包括将上下文截断至污染发生之前的位置、在上下文中明确指出存在污染并要求重新评估，或者使用干净的上下文重新开始，并且仅保留经过验证的信息。

### 上下文干扰

当上下文变得过长，以至于模型过度关注所提供的信息，而忽视其训练过程中获得的知识时，就会出现上下文干扰。无论相关与否，模型都会关注上下文中的所有内容，这会迫使模型使用所提供的信息，即使其内部知识更加准确。

**干扰项效应**
研究表明，即使上下文中只有一份无关文档，也会降低模型在涉及相关文档的任务上的表现。多个干扰项会进一步加剧性能下降。这种效应并非源于绝对意义上的噪声，而是源于注意力分配——无关信息会与相关信息争夺有限的注意力预算。

模型没有“跳过”无关上下文的机制。它们必须关注所提供的所有内容，而即使无关信息显然没有用处，这种义务仍会造成干扰。

**缓解策略**
通过仔细筛选进入上下文的内容来减轻干扰。在加载检索到的文档之前，应用相关性过滤。使用命名空间和组织结构，使无关章节在结构上易于忽略。考虑信息是否确实需要放入上下文，或者是否可以改为通过工具调用来访问。

### 上下文混淆

当无关信息以降低质量的方式影响响应时，就会产生上下文混淆。这与干扰有关，但二者并不相同——混淆关注的是上下文对模型行为的影响，而不是注意力的分配。

如果将某些内容放入上下文中，模型就必须关注它。模型可能会纳入无关信息、使用不恰当的工具定义，或应用来自其他上下文的约束。当上下文包含多种任务类型，或在单个会话中切换任务时，混淆问题尤其严重。

**混淆的迹象**
留意那些回答了查询错误方面的响应、看起来适用于其他任务的工具调用，或混合了多个来源要求的输出。这些迹象表明，模型对于哪些上下文适用于当前情况感到混淆。

**架构层面的解决方案**
架构层面的解决方案包括：明确划分任务，使不同任务使用不同的上下文窗口；在任务上下文之间进行清晰过渡；以及通过状态管理为不同目标隔离上下文。

### 上下文冲突

当累积的信息彼此直接冲突，形成相互矛盾的指导并干扰推理时，就会产生上下文冲突。这与上下文污染不同，后者是某一条信息不正确；而在冲突中，多条正确的信息彼此矛盾。

**冲突的来源**
冲突通常源于多源检索中不同来源的信息相互矛盾、版本冲突中旧信息与当前信息同时出现在上下文中，以及观点冲突中不同观点各自成立但彼此不兼容。

**解决方法**
解决方法包括：明确标记冲突，指出矛盾并请求澄清；建立优先级规则，确定哪个来源具有优先权；以及进行版本过滤，从上下文中排除过时信息。

### 反直觉的发现

研究揭示了几种挑战上下文管理既有假设的反直觉模式。

**打乱的干草堆优于连贯的干草堆**
研究发现，打乱的（不连贯的）干草堆比逻辑连贯的干草堆表现更好。这表明，连贯的上下文可能会产生干扰检索的错误关联，而不连贯的上下文则迫使模型依赖精确匹配。

**单个干扰项也会产生巨大影响**
即使只有一个无关文档，也会显著降低性能。这种影响并不与噪声量成正比，而是呈现阶跃函数特征：只要存在任何干扰项，就会触发性能下降。

**针与问题的相似度相关性**
针与问题对之间的相似度越低，性能随上下文长度增加而下降得越快。需要跨越不相似内容进行推理的任务尤其容易受到影响。

### 更大的上下文何时会造成负面影响

更大的上下文窗口并不会一致地提升性能。在许多情况下，更大的上下文会产生新问题，而这些问题造成的负面影响会超过其带来的益处。

**性能退化曲线**
模型的性能会随上下文长度呈非线性退化。在达到某个阈值前，性能会保持稳定，之后则迅速下降。该阈值因模型和任务复杂度而异。对于许多模型，即使上下文窗口支持大得多的容量，也会在约 8,000-16,000 个 token 时开始出现明显的性能退化。

**成本影响**
处理成本会随上下文长度不成比例地增长。处理 400K token 上下文的成本并非处理 200K 的两倍--其所需时间和计算资源都会呈指数级增长。对于许多应用而言，这使得大上下文处理在经济上不切实际。

**认知负荷隐喻**
即使拥有无限的上下文，要求单个模型在数十个相互独立的任务中保持一致的质量，也会形成认知瓶颈。模型必须不断地在各项任务之间切换上下文、维持比较框架，并确保风格一致性。这不是增加上下文就能解决的问题。

## 实用指南

### 四类策略方法

有四种策略可以应对上下文退化的不同方面：

**写入**：使用暂存区、文件系统或外部存储，将上下文保存在窗口之外。这样既能保持活跃上下文精简，又能保留对信息的访问能力。

**选择**：通过检索、过滤和优先级排序，将相关上下文调入窗口。这种方法通过排除无关信息来减少干扰。

**压缩**：通过摘要、抽象和观察掩蔽，在保留信息的同时减少 token 数量。这可以扩展有效上下文容量。

**隔离**：将上下文拆分到多个子代理或会话中，防止任何单一上下文增长到足以导致性能退化的程度。这是最激进的策略，但通常也是最有效的策略。

### 架构模式

通过具体的架构模式实施这些策略。使用即时上下文加载，仅在需要时检索信息。使用观察掩蔽，将冗长的工具输出替换为紧凑的引用。使用子代理架构，为不同任务隔离上下文。使用压缩，在不断增长的上下文超出限制之前对其进行摘要。

## 示例

**示例 1：在提示设计中检测性能退化**
```markdown
# Signs your command/skill prompt may be too large:

Early signs (context ~50-70% utilized):
- Agent occasionally misses instructions
- Responses become less focused
- Some guidelines ignored

Warning signs (context ~70-85% utilized):
- Inconsistent behavior across runs
- Agent "forgets" earlier instructions
- Quality varies significantly

Critical signs (context >85% utilized):
- Agent ignores key constraints
- Hallucinations increase
- Task completion fails
```

**示例 2：在提示结构中缓解中间信息遗失问题**
```markdown
# Organize prompts with critical info at edges

<CRITICAL_CONSTRAINTS>                    # At start (high attention)
- Never modify production files directly
- Always run tests before committing
- Maximum file size: 500 lines
</CRITICAL_CONSTRAINTS>

<DETAILED_GUIDELINES>                     # Middle (lower attention)
- Code style preferences
- Documentation templates
- Review checklists
- Example patterns
</DETAILED_GUIDELINES>

<KEY_REMINDERS>                           # At end (high attention)
- Run tests: npm test
- Format code: npm run format
- Create PR with description
</KEY_REMINDERS>
```

**示例 3：子智能体上下文隔离**
```markdown
# Instead of one agent handling everything:

## Coordinator Agent (lean context)
- Understands task decomposition
- Delegates to specialized sub-agents
- Synthesizes results

## Code Review Sub-Agent (isolated context)
- Loaded only with code review guidelines
- Focuses solely on review task
- Returns structured findings

## Test Writer Sub-Agent (isolated context)
- Loaded only with testing patterns
- Focuses solely on test creation
- Returns test files
```

## 指南

1. 在开发过程中监控上下文长度与性能之间的相关性
2. 将关键信息放在上下文的开头或结尾
3. 在性能严重下降之前实施压缩触发机制
4. 在将检索到的文档添加到上下文之前，验证其准确性
5. 使用版本控制，防止过时信息引发冲突
6. 对任务进行分段，防止不同目标之间出现上下文混淆
7. 应针对优雅降级进行设计，而不是假设条件始终完美
8. 使用逐渐增大的上下文进行测试，以找出性能下降的阈值

# 上下文退化模式：多智能体工作流

本节将上下文退化检测与缓解概念转化为适用于 Claude Code 的可执行多智能体工作流。在构建命令、技能或复杂的智能体流水线时，使用这些模式来确保质量和可靠性。

## 幻觉检测工作流

智能体输出中的幻觉可能会污染下游上下文，并使错误在多步骤工作流中传播。此工作流会在幻觉产生叠加影响之前将其检测出来。

### 何时使用

- 在任何智能体完成会产生事实性声明的任务之后
- 在提交由智能体生成的代码或文档之前
- 当输出将用作后续智能体的输入时
- 在审查长时间运行的智能体会话期间

### 多智能体验证模式

**步骤 1：生成输出**

让主智能体正常完成其任务。

**步骤 2：提取声明**

使用以下提示词启动一个验证子智能体：

```markdown
<TASK>
Extract all factual claims from the following output. List each claim on a separate line.
</TASK>

<FOCUS_AREAS>
- File paths and their existence
- Function/class/method names referenced
- Code behavior assertions ("this function returns X")
- External facts about APIs, libraries, or specifications
- Numerical values and metrics
</FOCUS_AREAS>

<OUTPUT_TO_ANALYZE>
{agent_output}
</OUTPUT_TO_ANALYZE>

<OUTPUT_FORMAT>
One claim per line, prefixed with category:
[PATH] /src/auth/login.ts exists
[CODE] validateCredentials() returns a boolean
[FACT] JWT tokens expire after 24 hours by default
[METRIC] The function has O(n) complexity
</OUTPUT_FORMAT>
```

**步骤 3：验证声明**

针对提取出的声明组，启动一个验证智能体：

```markdown
<TASK>
Verify this claim by checking the actual codebase and context.
</TASK>

<CLAIM>
{claim}
</CLAIM>

<VERIFICATION_APPROACH>
- For file paths: Use file tools to check existence
- For code claims: Read the actual code and verify behavior
- For external facts: Cross-reference with documentation or web search
- For metrics: Analyze the code structure
</VERIFICATION_APPROACH>

<RESPONSE_FORMAT>
STATUS: [VERIFIED | FALSE | UNVERIFIABLE]
EVIDENCE: [What you found]
CONFIDENCE: [HIGH | MEDIUM | LOW]
</RESPONSE_FORMAT>
```

**步骤 4：计算投毒风险**

汇总验证结果：

```
total_claims = number of claims extracted
verified_count = claims marked VERIFIED
false_count = claims marked FALSE
unverifiable_count = claims marked UNVERIFIABLE

poisoning_risk = (false_count * 2 + unverifiable_count) / total_claims
```

**步骤 5：决策阈值**

- **风险 < 0.1**：输出可靠，可正常继续
- **风险为 0.1-0.3**：继续之前，手动审查被标记的声明
- **风险 > 0.3**：使用更明确的依据约束指令重新生成输出：

```markdown
<REGENERATION_PROMPT>
Previous output contained {false_count} false claims and {unverifiable_count} unverifiable claims.

Specific issues:
{list of FALSE and UNVERIFIABLE claims with evidence}

Please regenerate your response. For each factual claim:
1. Explicitly verify it using tools before stating it
2. If you cannot verify, state "I cannot verify..." instead of asserting
3. Cite the specific file/line/source for verifiable facts
</REGENERATION_PROMPT>
```

## 中间信息遗失检测工作流

埋藏在长提示词中间的关键信息受到的关注较少。此工作流通过运行多个智能体并依据原始指令验证其输出来检测提示词中哪些部分存在被忽略的风险。

### 何时使用

- 设计具有长提示词的新命令或技能时
- 智能体在多次运行中未能一致遵循指令时
- 将提示词部署到生产环境之前
- 优化提示词期间

### 多次运行验证模式

**步骤 1：识别关键指令**

从提示词中提取智能体必须遵循的所有关键指令：

```markdown
Critical instructions to verify:
1. "Never modify files in /production"
2. "Always run tests before committing"
3. "Use TypeScript strict mode"
4. "Maximum function length: 50 lines"
5. "Include JSDoc for public APIs"
6. "Format output as JSON"
7. "Log all file modifications"
```

**步骤 2：使用相同提示词运行多个智能体**

使用相同的提示词（正在测试的命令、技能或智能体）启动 3-5 个智能体。每个智能体使用完全相同的输入独立运行：

```markdown
<AGENT_RUN_CONFIG>
Number of runs: 5
Prompt: {your_full_prompt_being_tested}
Task: {representative_task_that_exercises_all_instructions}

For each run, save:
- run_id: unique identifier
- agent_output: complete response from agent
- timestamp: when run completed
</AGENT_RUN_CONFIG>
```

**步骤 3：依据原始提示词验证每个输出**

对于每个智能体的输出，启动一个新的验证智能体，检查其是否遵守每条关键指令：

```markdown
<VERIFICATION_AGENT_PROMPT>
<TASK>
You are a compliance verification agent. Analyze whether the agent output followed each instruction from the original prompt.
</TASK>

<ORIGINAL_PROMPT>
{the_full_prompt_being_tested}
</ORIGINAL_PROMPT>

<CRITICAL_INSTRUCTIONS>
{numbered_list_of_critical_instructions}
</CRITICAL_INSTRUCTIONS>

<AGENT_OUTPUT>
{output_from_run_N}
</AGENT_OUTPUT>

<VERIFICATION_APPROACH>
For each critical instruction:
1. Determine if the instruction was applicable to this task
2. If applicable, check whether the output complies
3. Look for both explicit violations and omissions
4. Note any partial compliance
</VERIFICATION_APPROACH>

<OUTPUT_FORMAT>
RUN_ID: {run_id}

INSTRUCTION_COMPLIANCE:
- Instruction 1: "Never modify files in /production"
  STATUS: [FOLLOWED | VIOLATED | NOT_APPLICABLE]
  EVIDENCE: {quote from output or explanation}

- Instruction 2: "Always run tests before committing"
  STATUS: [FOLLOWED | VIOLATED | NOT_APPLICABLE]
  EVIDENCE: {quote from output or explanation}

[... continue for all instructions ...]

SUMMARY:
- Instructions followed: {count}
- Instructions violated: {count}
- Not applicable: {count}
</OUTPUT_FORMAT>
</VERIFICATION_AGENT_PROMPT>
```

**步骤 4：汇总结果并识别高风险部分**

收集所有运行的验证结果，并识别未被一致遵循的指令：

```markdown
<AGGREGATION_LOGIC>
For each instruction:
  followed_count = number of runs where STATUS == FOLLOWED
  violated_count = number of runs where STATUS == VIOLATED
  applicable_runs = total_runs - (runs where STATUS == NOT_APPLICABLE)

  compliance_rate = followed_count / applicable_runs

  Classification:
  - compliance_rate == 1.0: RELIABLE (always followed)
  - compliance_rate >= 0.8: MOSTLY_RELIABLE (minor inconsistency)
  - compliance_rate >= 0.5: AT_RISK (inconsistent - likely lost-in-middle)
  - compliance_rate < 0.5: FREQUENTLY_IGNORED (severe issue)
  - compliance_rate == 0.0: ALWAYS_IGNORED (critical failure)

AT_RISK instructions are the primary signal for lost-in-middle problems.
These are instructions that work sometimes but not consistently, indicating
they are in attention-weak positions.
</AGGREGATION_LOGIC>

<AGGREGATION_OUTPUT_FORMAT>
INSTRUCTION COMPLIANCE SUMMARY:

| Instruction | Followed | Violated | Compliance Rate | Status |
|-------------|----------|----------|-----------------|--------|
| 1. Never modify /production | 5/5 | 0/5 | 100% | RELIABLE |
| 2. Run tests before commit | 3/5 | 2/5 | 60% | AT_RISK |
| 3. TypeScript strict mode | 4/5 | 1/5 | 80% | MOSTLY_RELIABLE |
| 4. Max function length 50 | 2/5 | 3/5 | 40% | FREQUENTLY_IGNORED |
| 5. Include JSDoc | 5/5 | 0/5 | 100% | RELIABLE |
| 6. Format as JSON | 1/5 | 4/5 | 20% | ALWAYS_IGNORED |
| 7. Log modifications | 3/5 | 2/5 | 60% | AT_RISK |

AT-RISK INSTRUCTIONS (likely in lost-in-middle zone):
- Instruction 2: "Run tests before commit" (60% compliance)
- Instruction 4: "Max function length 50" (40% compliance)
- Instruction 6: "Format as JSON" (20% compliance)
- Instruction 7: "Log modifications" (60% compliance)
</AGGREGATION_OUTPUT_FORMAT>
```

**步骤 5：输出建议**

根据识别出的高风险部分，提供具体的修正指导：

```markdown
<RECOMMENDATIONS_OUTPUT>
LOST-IN-MIDDLE ANALYSIS COMPLETE

At-Risk Instructions Detected: {count}
These instructions are inconsistently followed, indicating they likely
reside in attention-weak positions (middle of prompt).

SPECIFIC RECOMMENDATIONS:

1. MOVE CRITICAL INFORMATION TO ATTENTION-FAVORED POSITIONS
   The following instructions should be relocated to the beginning or end of your prompt:
   - "Run tests before commit" -> Move to <CRITICAL_CONSTRAINTS> at prompt START
   - "Max function length 50" -> Move to <KEY_REMINDERS> at prompt END
   - "Format as JSON" -> Move to <OUTPUT_FORMAT> at prompt END
   - "Log modifications" -> Add to both START and END sections

2. USE EXPLICIT MARKERS TO HIGHLIGHT CRITICAL INFORMATION
   Restructure at-risk instructions with emphasis:

   Before: "Always run tests before committing"
   After:  "**CRITICAL:** You MUST run tests before committing. Never skip this step."

   Before: "Maximum function length: 50 lines"
   After:  "3. [REQUIRED] Maximum function length: 50 lines"

   Use numbered lists, bold markers, or explicit tags like [REQUIRED], [CRITICAL], [MUST].

3. CONSIDER SPLITTING CONTEXT TO REDUCE MIDDLE SECTION
   If your prompt has many instructions, consider:
   - Breaking into focused sub-prompts for different aspects
   - Using sub-agents with specialized, shorter contexts
   - Moving detailed guidance to on-demand sections loaded only when needed

   Current prompt structure creates a large middle section where
   {count} instructions are being lost. Reduce middle section by:
   - Moving 2-3 most critical items to edges
   - Converting remaining middle items to a numbered checklist
   - Adding explicit "verify these items" reminder at end
</RECOMMENDATIONS_OUTPUT>
```

### 完整工作流示例

```markdown
# Example: Testing a Code Review Command

## Original Prompt Being Tested:
"Review the code for: security issues, performance problems,
code style, test coverage, documentation completeness,
error handling, and logging practices."

## Run 5 Agents:
Each agent reviews the same code sample with this prompt.

## Verification Results:
| Instruction | Run 1 | Run 2 | Run 3 | Run 4 | Run 5 | Rate |
|-------------|-------|-------|-------|-------|-------|------|
| Security | Y | Y | Y | Y | Y | 100% |
| Performance | Y | X | Y | X | Y | 60% |
| Code style | X | X | Y | X | X | 20% |
| Test coverage | X | Y | X | X | Y | 40% |
| Documentation | X | X | X | Y | X | 20% |
| Error handling | Y | Y | X | Y | Y | 80% |
| Logging | Y | Y | Y | Y | Y | 100% |

## Analysis:
- RELIABLE: Security, Logging (at edges of list)
- AT_RISK: Performance, Error handling
- FREQUENTLY_IGNORED: Code style, Test coverage, Documentation (middle of list)

## Remediation Applied:
"**CRITICAL REVIEW AREAS:**
1. Security vulnerabilities
2. Test coverage gaps
3. Documentation completeness

Review also: performance, code style, error handling, logging.

**BEFORE COMPLETING:** Verify you addressed items 1-3 above."
```

## 错误传播分析工作流

在多智能体链中，早期智能体产生的错误会传播至后续智能体，并被进一步放大。此工作流用于追溯错误的源头。

### 使用场景

- 当中间步骤正确，但最终输出仍包含错误时
- 调试复杂的多智能体工作流时
- 在智能体链中建立错误边界时
- 对失败的智能体任务进行事后分析时

### 错误追溯模式

**步骤 1：捕获智能体链的输出**

记录链中每个智能体的输出：

```markdown
Agent Chain Record:
- Agent 1 (Analyzer): {output_1}
- Agent 2 (Planner): {output_2}
- Agent 3 (Implementer): {output_3}
- Agent 4 (Reviewer): {output_4}
```

**步骤 2：识别错误症状**

启动一个错误识别智能体：

```markdown
<TASK>
Analyze the final output and identify all errors, inconsistencies, or quality issues.
</TASK>

<FINAL_OUTPUT>
{output_from_last_agent}
</FINAL_OUTPUT>

<OUTPUT_FORMAT>
ERROR_ID: E1
DESCRIPTION: Function missing null check
LOCATION: src/utils/parser.ts:45
SEVERITY: HIGH

ERROR_ID: E2
...
</OUTPUT_FORMAT>
```

**步骤 3：反向追溯每个错误**

针对每个已识别的错误，启动一个追溯智能体：

```markdown
<TASK>
Trace this error backward through the agent chain to find its origin.
</TASK>

<ERROR>
{error_description}
</ERROR>

<AGENT_CHAIN_OUTPUTS>
Agent 1 Output: {output_1}
Agent 2 Output: {output_2}
Agent 3 Output: {output_3}
Agent 4 Output: {output_4}
</AGENT_CHAIN_OUTPUTS>

<ANALYSIS_APPROACH>
For each agent output (starting from the last):
1. Does this output contain the error?
2. If yes, was the error present in the input to this agent?
3. If error is in output but not input: This agent INTRODUCED the error
4. If error is in both: This agent PROPAGATED the error
</ANALYSIS_APPROACH>

<OUTPUT_FORMAT>
ERROR: {error_id}
ORIGIN_AGENT: Agent {N}
ORIGIN_TYPE: [INTRODUCED | PROPAGATED_FROM_CONTEXT | PROPAGATED_FROM_TOOL_OUTPUT]
ROOT_CAUSE: {explanation}
CONTEXT_THAT_CAUSED_IT: {relevant context snippet if applicable}
</OUTPUT_FORMAT>
```

**步骤 4：计算传播指标**

```
For each agent in chain:
  errors_introduced = count of errors this agent created
  errors_propagated = count of errors this agent passed through
  errors_caught = count of errors this agent fixed or flagged

propagation_rate = errors_at_end / errors_introduced_total
amplification_factor = errors_at_end / errors_at_start
```

**步骤 5：建立错误边界**

根据分析结果，添加验证检查点：

```markdown
<ERROR_BOUNDARY_TEMPLATE>
After Agent {N} completes:

1. Spawn verification agent to check for common error patterns:
   - {error_pattern_1 that Agent N tends to introduce}
   - {error_pattern_2 that Agent N tends to introduce}

2. If errors detected:
   - Log error for analysis
   - Either: Fix inline and continue
   - Or: Regenerate Agent N output with explicit guidance

3. Only proceed to Agent {N+1} if verification passes
</ERROR_BOUNDARY_TEMPLATE>
```

## 上下文相关性评分工作流

提示词中的各个部分对任务完成的贡献并不相同。此工作流用于识别提示词中会消耗注意力预算却无法增加价值的干扰部分。

### 何时使用

- 优化提示词的长度和内容时
- 决定要在 CLAUDE.md 中包含哪些内容时
- 当提示词显得臃肿，但你不确定该删减哪些内容时
- 调试忽略所提供上下文的智能体时
- 部署新的命令、技能或智能体提示词之前

### 干扰项识别模式

**步骤 1：将提示词拆分成多个部分**

将提示词（命令/技能/智能体）划分为逻辑区段。每个部分都应是一个连贯的单元：

```markdown
<PROMPT_PARTS>
PART_1:
  ID: background
  CONTENT: |
    You are a Python expert helping a development team.
    Current project: Data processing pipeline in Python 3.9+

PART_2:
  ID: code_style_rules
  CONTENT: |
    - Write clean, idiomatic Python code
    - Include type hints for function signatures
    - Add docstrings for public functions
    - Follow PEP 8 style guidelines

PART_3:
  ID: historical_context
  CONTENT: |
    The project was migrated from Python 2.7 in 2019.
    Original team used camelCase naming but we now use snake_case.
    Legacy modules in /legacy folder are frozen.

PART_4:
  ID: output_format
  CONTENT: |
    Provide actionable feedback with specific line references.
    Explain the reasoning behind suggestions.
</PROMPT_PARTS>
```

拆分准则：
- 每个 XML 区段或 Markdown 标题都作为一个部分
- 将概念上不同的指令分别放入各自的部分
- 将相关指令放在一起（不要在一个完整思路的中间拆分）
- 根据提示词长度，目标是拆分成 3-15 个部分

**步骤 2：生成评分智能体**

并行生成多个评分智能体：

```markdown
<TASK>
Score how relevant this prompt parts is for accomplishing the specified task.
</TASK>

<TASK_DESCRIPTION>
{description of what the agent should accomplish}
Example: "Review a pull request for code quality issues and suggest improvements"
</TASK_DESCRIPTION>

<PROMPT_PARTS>
{contents of all the parts being evaluated}
</PROMPT_PARTS>

<SCORING_CRITERIA>
Score 0-10 based on these criteria:

ESSENTIAL (8-10):
- Part directly enables task completion
- Removing this part would cause task failure
- Part contains critical constraints that prevent errors
- Part defines required output format or structure

HELPFUL (5-7):
- Part improves output quality but is not strictly required
- Part provides useful context that guides better decisions
- Part contains preferences that affect style but not correctness

MARGINAL (2-4):
- Part has tangential relevance to the task
- Part might occasionally be useful but usually is not
- Part provides historical context rarely needed

DISTRACTOR (0-1):
- Part is irrelevant to the task
- Part could confuse the agent about what to focus on
- Part competes for attention without contributing value
</SCORING_CRITERIA>

<OUTPUT_FORMAT>
RELEVANCE_SCORE: [0-10]
JUSTIFICATION: [2-3 sentences explaining the score]
USAGE_LIKELIHOOD: [How often would the agent reference this part during task execution? ALWAYS | OFTEN | SOMETIMES | RARELY | NEVER]
</OUTPUT_FORMAT>
```

**步骤 3：汇总相关性评分**

收集所有评分智能体给出的分数：

```
PART_SCORES = [
  {id: "background", score: 8, usage: "ALWAYS"},
  {id: "code_style_rules", score: 9, usage: "ALWAYS"},
  {id: "historical_context", score: 3, usage: "RARELY"},
  {id: "output_format", score: 7, usage: "OFTEN"}
]
```

计算汇总指标：

```
total_parts = count(PART_SCORES)
high_relevance_parts = count(parts where score >= 5)
distractor_parts = count(parts where score < 5)

context_efficiency = high_relevance_parts / total_parts
average_relevance = sum(scores) / total_parts
```

**步骤 4：识别干扰部分**

应用干扰项阈值（分数 < 5）：

```markdown
DISTRACTOR_ANALYSIS:

Identified Distractors:
1. PART: historical_context
   SCORE: 3/10
   JUSTIFICATION: "Migration history from Python 2.7 is rarely relevant to reviewing current code. The naming convention note is useful but should be in code_style_rules instead."
   RECOMMENDATION: REMOVE or RELOCATE

Summary:
- Total parts: 4
- High-relevance parts (>=5): 3
- Distractor parts (<5): 1
- Context efficiency: 75%
- Average relevance: 6.75

Token Impact:
- Distractor tokens: ~45 (historical_context)
- Potential savings: 45 tokens (11% of prompt)
```

**步骤 5：生成优化建议**

根据干扰项分析，提供可执行的建议：

```markdown
OPTIMIZATION_RECOMMENDATIONS:

1. REMOVE: historical_context
   Reason: Score 3/10, usage RARELY. Migration history does not inform code review decisions.

2. RELOCATE: "we now use snake_case" from historical_context
   Target: code_style_rules section
   Reason: This specific rule is relevant but buried in irrelevant historical context.

3. CONSIDER CONDENSING: background
   Current: 2 sentences
   Could be: 1 sentence ("Python 3.9+ data pipeline expert")
   Savings: ~15 tokens

OPTIMIZED PROMPT STRUCTURE:
- background (condensed): 8 tokens
- code_style_rules (with snake_case added): 52 tokens
- output_format: 28 tokens
- Total: 88 tokens (down from 133 tokens)
- Efficiency improvement: 34% reduction
```

### 干扰项阈值指南

默认阈值 5 在全面性与效率之间取得平衡：

| 阈值 | 使用场景 |
|-----------|----------|
| < 3 | 针对令牌受限上下文的激进裁剪 |
| < 5 | 标准优化（推荐默认值） |
| < 7 | 针对关键提示词的保守裁剪 |

根据以下因素调整阈值：
- **上下文预算压力**：接近限制时降低阈值
- **任务关键程度**：对于生产环境提示词，提高阈值
- **提示词稳定性**：对于实验性提示词，降低阈值

### 评分智能体部署

为提高效率，并行运行评分智能体：

```markdown
# Parallel execution pattern
spawn_parallel([
  scoring_agent(part_1, task_description),
  scoring_agent(part_2, task_description),
  scoring_agent(part_3, task_description),
  ...
])

# Collect and aggregate
scores = await_all(scoring_agents)
analysis = aggregate_scores(scores)
```

对于大型提示词（>10 个部分），将评分代理按每组 5-7 个进行批处理，以控制编排开销。

## 上下文健康监控工作流

长时间运行的代理会话会不断积累上下文，并随时间推移导致性能下降。此工作流用于监控上下文健康状况并触发干预。

### 何时使用

- 在长时间运行的代理会话期间（>20 轮）
- 当代理开始表现出性能下降症状时
- 作为代理编排系统中的定期健康检查
- 在代理工作流中的关键决策点之前

### 健康检查模式

**步骤 1：定期症状检测**

每 N 轮（建议：每 10 轮）启动一个健康检查代理：

```markdown
<TASK>
Analyze the recent conversation history for signs of context degradation.
</TASK>

<RECENT_HISTORY>
{last 10 turns of conversation}
</RECENT_HISTORY>

<SYMPTOM_CHECKLIST>
Check for these degradation symptoms:

LOST_IN_MIDDLE:
- [ ] Agent missing instructions from early in conversation
- [ ] Critical constraints being ignored
- [ ] Agent asking for information already provided

CONTEXT_POISONING:
- [ ] Same error appearing repeatedly
- [ ] Agent referencing incorrect information as fact
- [ ] Hallucinations that persist despite correction

CONTEXT_DISTRACTION:
- [ ] Responses becoming unfocused
- [ ] Agent using irrelevant context inappropriately
- [ ] Quality declining on previously-successful tasks

CONTEXT_CONFUSION:
- [ ] Agent mixing up different task requirements
- [ ] Wrong tool selections for obvious tasks
- [ ] Outputs that blend requirements from different tasks

CONTEXT_CLASH:
- [ ] Agent expressing uncertainty about conflicting information
- [ ] Inconsistent behavior between turns
- [ ] Agent asking for clarification on resolved issues
</SYMPTOM_CHECKLIST>

<OUTPUT_FORMAT>
HEALTH_STATUS: [HEALTHY | DEGRADED | CRITICAL]
SYMPTOMS_DETECTED: [list of checked symptoms]
RECOMMENDED_ACTION: [CONTINUE | COMPACT | RESTART]
SPECIFIC_ISSUES: [detailed description of problems found]
</OUTPUT_FORMAT>
```

**步骤 2：自动干预**

根据健康状态触发适当的干预：

```markdown
IF HEALTH_STATUS == "DEGRADED" or HEALTH_STATUS == "CRITICAL":
  <RESTART_INTERVENTION>
  1. Extract essential state to preserve and save to a file
  2. Ask user to start a new session with clean context and load the preserved state from the file after the new session is started
  </RESTART_INTERVENTION>
```

## 多代理验证指南

1. 使用目标明确、用途单一的提示词启动验证代理
2. 使用结构化输出格式以便可靠解析
3. 为采取行动或继续执行的决策设定明确阈值
4. 记录所有验证结果，以便调试和优化
5. 在验证开销与错误预防价值之间取得平衡
6. 在自然检查点实施验证，而不是每一轮都进行验证
7. 对常规操作使用轻量级检查，对关键操作使用更严格的检查
8. 将验证设计为可在时间紧迫的场景中跳过

# 上下文优化技术

上下文优化通过策略性压缩、掩码、缓存和分区，扩展有限上下文窗口的有效容量。其目标并非神奇地增大上下文窗口，而是更充分地利用可用容量。有效的优化可以将上下文的有效容量提升至原来的两倍或三倍，而无须使用更大的模型或更长的上下文。

## 核心概念

上下文优化通过四种主要策略扩展有效容量：压缩（在接近限制时总结上下文）、观测掩码（用引用替代冗长的输出）、KV 缓存优化（复用已缓存的计算结果），以及上下文分区（将工作拆分到相互隔离的上下文中）。

关键洞见在于，上下文质量比数量更重要。优化会在减少噪声的同时保留有效信号。其中的技巧在于选择保留哪些内容、舍弃哪些内容，以及何时应用每种技术。

## 详细主题

### 压缩策略

**什么是压缩**
压缩是指在接近限制时总结上下文内容，然后使用该摘要重新初始化一个新的上下文窗口。这会以高保真的方式提炼上下文窗口中的内容，使智能体能够继续工作，同时将性能下降降至最低。

压缩通常是上下文优化中首先采用的手段。其中的技巧在于选择保留哪些内容、舍弃哪些内容。

**实际应用中的压缩**
压缩的工作方式是识别可压缩的部分，生成能够捕捉要点的摘要，并用摘要替换完整内容。压缩优先级如下：

1. **工具输出** - 用关键发现替代冗长输出
2. **较早的对话轮次** - 总结早期交流
3. **检索到的文档** - 如果任务上下文已被捕捉，则进行总结
4. **绝不压缩** - 系统提示词和关键约束

**摘要生成**
有效的摘要会根据内容类型保留不同的要素：

- **工具输出**：保留关键发现、指标和结论。移除冗长的原始输出。
- **对话轮次**：保留关键决策、承诺和上下文变化。移除无关内容和来回讨论。
- **检索到的文档**：保留关键事实和主张。移除支持性证据和详细说明。

### 观测掩码

**观测问题**
在智能体的执行轨迹中，工具输出可能占据 80% 以上的令牌用量。其中很大一部分是已经完成其用途的冗长输出。一旦智能体使用工具输出来作出决策，继续保留完整输出所能提供的价值便会逐渐降低，同时却会消耗大量上下文。

观测掩码会用紧凑的引用替代冗长的工具输出。这些信息在需要时仍然可以访问，但不会持续占用上下文。

**掩码策略选择**
并非所有观测结果都应以相同方式进行掩码：

**绝不掩码：**
- 对当前任务至关重要的观测结果
- 来自最近一轮的观测结果
- 正在用于活跃推理的观测结果

**考虑进行掩蔽：**
- 3 个或更多轮次之前的观察结果
- 可提取关键要点的冗长输出
- 已完成其用途的观察结果

**始终进行掩蔽：**
- 重复的输出
- 样板式页眉/页脚
- 已在对话中总结过的输出

### 上下文分区

**子代理分区**
上下文优化中最激进的形式，是将工作划分给具有隔离上下文的子代理。每个子代理都在一个专注于其子任务的干净上下文中运行，无需携带其他子任务积累的上下文。

这种方法实现了关注点分离——详细的搜索上下文被隔离在子代理中，而协调器则专注于综合与分析。

**何时进行分区**
在以下情况下考虑进行分区：
- 任务可自然分解为相互独立的子任务
- 不同子任务需要不同的专用上下文
- 上下文累积可能导致超出限制
- 不同子任务存在相互冲突的要求

**结果聚合**
按照以下步骤聚合分区子任务的结果：
1. 验证所有分区均已完成
2. 合并相互兼容的结果
3. 如果合并后的结果仍然过大，则进行总结
4. 解决各分区输出之间的冲突


## 实用指南

### 优化决策框架

**何时优化：**
- 随着对话延长，响应质量下降
- 长上下文导致成本增加
- 延迟随对话长度增加

**应用何种优化：**
- 工具输出占主导：观察结果掩蔽
- 检索到的文档占主导：总结或分区
- 消息历史占主导：通过总结进行压缩
- 涉及多个组成部分：组合使用多种策略

### 将优化应用于 Claude Code 提示词

**命令优化**
命令按需加载，因此应重点确保每个命令职责明确且范围集中：
```markdown
# Good: Focused command with clear scope
---
name: review-security
description: Review code for security vulnerabilities
---
# Specific security review instructions only

# Avoid: Overloaded command trying to do everything
---
name: review-all
description: Review code for everything
---
# 50 different review checklists crammed together
```

**技能优化**
技能默认会加载其描述，因此描述必须简洁：
```markdown
# Good: Concise description
description: Analyze code architecture. Use for design reviews.

# Avoid: Verbose description that wastes context budget
description: This skill provides comprehensive analysis of code
architecture including but not limited to class hierarchies,
dependency graphs, coupling metrics, cohesion analysis...
```

**子代理上下文设计**
在创建子代理时，应提供重点明确的上下文：
```markdown
# Coordinator provides minimal handoff:
"Review authentication module for security issues.
Return findings in structured format."

# NOT this verbose handoff:
"I need you to look at the authentication module which is
located in src/auth/ and contains several files including
login.ts, session.ts, tokens.ts... [500 more tokens of context]"
```

## 指南

1. 优化前先进行测量——了解当前状态
2. 尽可能先进行压缩，再进行掩码处理
3. 使用一致的提示词来确保缓存稳定性
4. 在上下文出现问题之前进行分区
5. 持续监控优化效果
6. 在节省 token 与保持质量之间取得平衡
7. 在生产规模下测试优化方案
8. 针对边缘情况实现优雅降级