---
name: skill-creator
description: "Create, improve, evaluate, benchmark skills. Use when authoring a new skill, updating an existing one, running evals, or optimizing a skill's description for triggering. Don't use for invoking skills, writing prose, or scaffolding Python projects."
license: MIT
effort: max
metadata:
  version: 1.15.0
  author: "Luong NGUYEN <luongnv89@gmail.com>"
---
# Skill 创建器

用于创建新 skill 并对其进行迭代改进的 skill。代理的上下文预算是首要限制，因此此 `SKILL.md` 会链接到专门的参考文件。

核心循环：

1. 确定 skill 应该做什么，以及应该如何实现
2. 编写草稿
3. 针对 claude-with-access-to-the-skill 运行测试提示词
4. 与用户一起评估结果（通过 `eval-viewer/generate_review.py` 进行定性审查，并结合定量评估）
5. 根据反馈和基准测试结果修改 skill
6. 重复上述过程，直到满意为止；扩展测试集，并再次进行大规模测试

确定用户目前处于该循环中的哪个阶段，并从那里开始介入。完全从零创建新 skill → 从步骤 1 开始。已有草稿 → 跳转到步骤 3 或 4。用户希望不进行正式评估、通过实际体验迭代 → 支持这种方式。skill 稳定后，可以选择运行 description improver 来优化触发效果。

## 两条入口路径

该 skill 支持两种不同的工作流。**在执行任何操作之前，先确定用户属于哪一条路径**——两条路径的起始步骤不同。

- **路径 A — 从零创建新 skill。** 用户希望记录一套工作流、将某种模式编码化，或构建一项新能力。从下面的 **“创建 skill”** 开始（捕获意图 → 访谈 → 编写 SKILL.md → 测试 → 评估）。
- **路径 B — 改进现有 skill。** 用户指出某个已经存在的 skill，希望将其提升到标准、修复问题、优化，或根据评估反馈进行迭代。**不要从捕获意图开始**——意图已经编码在现有的 SKILL.md 中。从下面的 **“改进现有 skill”** 开始。

如果请求含糊不清（“你能看看这个 skill 吗？”），默认采用 **路径 B**，并在按照新 skill 的方式开始访谈之前进行确认。当通过 `/skill-creator` 作用于某个 skill 目录或文件时，也采用路径 B。

两条路径都必须遵守以下规则：**编辑前同步仓库**、**依赖项预检**、**版本管理**、**YAML frontmatter 安全性**以及**审查/评估时的 frontmatter 审计**。无论采用哪条路径，都要应用这些规则。两条路径最后都要包含 **运行统计**块。

## 步骤完成报告

每完成一个主要步骤后，按照以下格式输出状态报告：

```
◆ [Step Name] ([step N of M] — [context])
··································································
  [Check 1]:          √ pass
  [Check 2]:          √ pass (note if relevant)
  [Check 3]:          × fail — [reason]
  [Check 4]:          √ pass
  [Criteria]:         √ N/M met
  ____________________________
  Result:             PASS | FAIL | PARTIAL
```

根据该步骤实际验证的内容调整检查项名称。通过使用 `√` 表示通过，使用 `×` 表示失败，并使用 `—` 添加简短上下文说明。`Criteria` 行总结满足的验收标准数量。`Result` 行给出总体结论。

**意图捕获阶段检查项：** `Worth building`、`Goal defined`、`Triggers identified`、`Output format agreed`

**Skill 编写阶段检查项：** `SKILL.md written`、`README generated`、`Subagents designed`、`Dependency preflight`（当 skill 没有 skill 依赖，或存在依赖且为每个依赖都提供了门禁时为 √；当调用依赖却没有对应门禁时为 ×）、`Predictability pass`（_Make it predictable_ 中的 7 项评分标准——全部满足时为 √，否则指出缺失项）、`Adversarial review`（已处理新子代理发现的问题）

**测试阶段检查项：**`Evals created`、`Runs completed`、`Viewer launched`

**迭代阶段检查项：**`Feedback incorporated`、`Benchmarks improved`、`Description optimized`

## 运行统计（必需）

每次创建或更新 skill 的运行，都必须以一个运行统计块结束其摘要——这是最终步骤完成报告之后输出的最后内容。它只报告本次运行的**成本**，不报告本次运行已经报告过的任何内容。

在 skill 开始时记录一次 `run_started_epoch`，并且必须与 skill 的第一条命令在同一个 shell 中执行（`cmd; ec=$?; date +%s >&2; exit "$ec"`——从 stderr 中读取 epoch，这样 stdout 和退出代码都能保持不变）。已经记录过开始时间的运行应复用该时间。

```
  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
  Run stats   elapsed 6m 04s · tokens 128,400 · cost $0.42
              agents 3 · skills 1 · tool calls 47
```

字段固定且必须按此顺序排列——绝不能重新排序、重命名或添加字段：

| Field        | Value                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `elapsed`    | 墙上时钟时长，格式为 `{H}h {M}m {S}s`；仅省略开头值为零的单位（`6m 04s`、`48s`）                 |
| `tokens`     | **有条件显示**——仅当宿主报告了使用量数值时输出，并使用千位分隔符                                               |
| `cost`       | **有条件显示**——仅当宿主报告了本次运行成本时输出，格式为 `$0.42`                                      |
| `agents`     | 本次运行创建的子代理数量                                                                         |
| `skills`     | 本次运行调用的其他 skill 数量                                                                     |
| `tool calls` | 本次运行进行的工具调用次数                                                                       |

- **当宿主未报告数值时，`tokens` 和 `cost` 必须完全省略**——不能留下多余的 `·`，也不能使用占位符。绝不能根据输出长度、文件大小或步骤数估算这些数值，也绝不能根据宿主的记录或日志重新计算这些数值。
- **`elapsed`、`agents`、`skills` 和 `tool calls` 始终输出。** 无法确定的值输出字面量 `n/a`；`0` 是一个确定的值，在实际为零时应正确输出（未创建子代理的运行应输出 `agents 0`）。
- 缺少某个可选数值时，绝不能抑制运行统计块的其余部分。

每次完成创建或更新的路径都必须输出该运行统计块——包括路径 A、子路径 B1 和子路径 B2——其他所有终止结果也必须输出：提前停止、拒绝继续的门禁，或失败的步骤。只有完全没有产生任何输出的运行可以不输出该块。测量本身不能占据被测量内容中可测量的比例：开始时读取一次 epoch，结束时读取一次，两行输出——绝不能每个步骤都调用计时，也不能进行摘要汇总遍历。

## 与用户沟通

用户的技术熟悉程度差异很大。应根据上下文线索匹配术语的专业程度——像“JSON”或“断言”这样的术语，需要有证据表明用户了解它们；不确定时，应简要定义这些术语。

---

## 会修改仓库的 Skill 的强制规则

创建或更新任何会更改 git 仓库中​​文件的 skill（代码、文档、配置、提交、发布）时，必须在该 skill 的 SKILL.md 中加入以下规则：

- 在靠近顶部的位置添加 **"Repo Sync Before Edits (mandatory)"** 部分，要求在进行修改之前运行 `branch="$(git rev-parse --abbrev-ref HEAD)"; git fetch origin && git pull --rebase origin "$branch"`。
- 如果工作树不干净：先 stash，再同步，然后 pop。
- 如果缺少 `origin` 或发生冲突：停止并在继续之前询问用户。

没有这个预同步防护措施，不得发布会修改仓库的 skill。

## 会调用其他 Skill 的 Skill 的强制规则

对于你编写或改造的每一个 skill，都要确认它是否调用、委托给或读取**另一个 skill**。在访谈（Capture Intent，第 6 个问题）中以问题形式询问，并对照草稿进行确认——无论作者是否表示没有依赖，只要正文中提到了 `/another-skill`，或读取了 `~/.claude/skills/` 下的内容，就属于依赖。

- **如果有** → 你生成的 skill 必须包含 `## Dependency Preflight (mandatory)` 部分，并将其放在第一个会产生任何更改的步骤之前。对于每个依赖项，该部分都要列出 skill 名称、安装它的命令、安装其安装器的命令，以及验证命令；如果未找到依赖项，则在首次修改之前停止。
- **如果没有** → 不添加任何内容。不要添加空的预检部分，也不要添加“无依赖”占位符。

阅读 `references/dependency-preflight.md` 获取可复制的模板以及未找到依赖项时的行为。`skill-auto-improver` 也会审核这一规则，因此缺少必需门禁的 skill 之后会再次作为问题反馈回来。

## Frontmatter 规则（强制）

阅读 `references/frontmatter-rules.md` 获取完整的强制规则：

- **版本管理** — 创建时设置 `metadata.version: 1.0.0`；每次编辑时递增 patch/minor/major 版本。
- **YAML Frontmatter 安全性** — 任何包含 YAML 特殊字符的字符串值都必须使用双引号（完整列表见参考文档）。
- **评审/评估时的 Frontmatter 审计** — 必须检查必填字段、name/dir 是否匹配、允许的顶层键、`metadata.version`、`metadata.author`、YAML 安全性，以及与 `docs/README.md` 的一致性。先运行 `python scripts/quick_validate.py <skill-path>`；它无需 LLM 推理即可捕获机械性问题。

这些规则适用于每次写入。保存前始终确认这些规则。

## 创建 skill

### Capture Intent

首先了解用户的意图。当前对话中可能已经包含用户希望保存为 skill 的工作流（例如，他们说“把这个变成一个 skill”）。如果是这样，先从对话历史中提取答案——包括所使用的工具、步骤顺序、用户做出的更正，以及观察到的输入/输出格式。让用户补充缺失信息并在继续之前进行确认。

**先进行门禁判断——这是否应该是一个 skill？** 当一个工作流具备以下特征时，才值得创建 skill：**会重复执行**（未来还会再次遇到）、**不明显**（没有它时，有能力的 agent 也可能做错），并且**稳定**（下个月流程不会改变）。如果不满足其中任何一项，建议不要创建它——一次性任务更适合使用普通提示，而每个不必要的 skill 都会污染之后的触发判断。用户可以覆盖此建议；设置这一门禁是为了避免默认“总是创建”。

1. 这项 skill 应该让 Claude 能够做什么？
2. 这项 skill 应在何时触发？（哪些用户表述/上下文）
3. 预期的输出格式是什么？
4. 是否应该设置测试用例来验证 skill 是否正常工作？具有客观可验证输出的 skill（文件转换、数据提取、代码生成、固定工作流步骤）通常适合设置测试用例。具有主观输出的 skill（写作风格、艺术创作）通常不需要。请根据 skill 的类型提出适当的默认建议，但由用户决定。
5. **这项 skill 是否应使用子代理？** 请阅读 `references/subagent-patterns.md` 以获取完整指南。关键信号：
   - 这项 skill 是否会读取许多文件或扫描大型代码库？→ Explorer 子代理
   - 工作的各个部分是否可以并行执行？→ 并行工作者子代理
   - 这项 skill 是否需要独立的质量审查？→ 使用全新子代理进行审查循环
   - 这项 skill 是否会生成需要集中推理的大型产物？→ Executor 子代理
   - 是否有任何单个步骤只需要 `references/` 的**一部分**而非整个目录树？→ 按步骤委派上下文：步骤需命名该部分内容，工作者会将其作为 `Input` 接收（`references/subagent-patterns.md` → _按步骤委派上下文_）
   
   如果符合其中任何一项，请采用以主代理为协调者的架构来设计 skill，使子代理负责繁重工作，并保持主对话的上下文整洁。
6. **这项 skill 是否会调用其他 skill？** 列出它调用的、将某个阶段委派给的或读取的每一项 skill。如果存在任何此类 skill，你编写的 skill 必须为它们提供依赖预检——请参阅上文的 _调用其他 Skill 的 Skill 的强制规则_ 和 `references/dependency-preflight.md`。如果不存在，则无需添加任何内容。
7. **由模型调用还是由用户调用？** 在起草之前决定主要调用方式——这会改变你的写法。**由模型调用**（默认方式）是一套可复用的规范，代理会在情况适合时应用它；应优化描述，使其能够可靠触发。**由用户调用**（`/skill-name`）是用户有意运行的编排流程（例如管道、成本高昂或具有破坏性的操作）；正文应采用“用户已提出此请求，继续执行”的表述。还要在此处权衡上下文负载和认知负载预算。完整的权衡标准请参阅 `references/predictability-rubric.md`。

### 访谈与研究

主动询问有关边界情况、输入/输出格式、示例文件、成功标准和依赖项的问题。在这部分内容敲定之前，先不要编写测试提示词。检查可用的 MCP；如果有可用的 MCP，则通过子代理并行开展研究，否则在线性流程中进行。

**在起草正文之前，先梳理 skill 的分支。** 确定 skill 运行时的不同模式——即需要不同指令的路径（创建与改进、按框架、按环境、试运行与应用）。先了解这些分支后，你就可以在 SKILL.md 开头使用一个简短的选择器，并且只在某个分支实际使用时披露该分支的相关内容，而不是强迫每次运行都读取所有分支。本 skill 顶部的“两条入口路径”代码块本身就是一个分支选择器示例。请参阅 `references/predictability-rubric.md` → _起草前梳理分支_。

### 编写 SKILL.md

起草前，先浏览 `references/exemplars.md`，并模仿与此技能最接近的原型——工作流、知识库或编排器。然后，根据用户访谈内容填写：

- **name**：1-64 个字符，使用小写字母/数字/连字符，不得包含连续连字符，且必须与父目录完全匹配。由 `scripts/quick_validate.py` 强制校验。
- **description**：说明何时触发以及它的作用。这是主要触发机制。单行，不得换行。Claude 往往会出现_触发不足_的情况，因此应让描述略微“积极”一些，并加入负面触发条件。
- **effort**（可选）：`low | medium | high | xhigh | max`。默认为 `high`。
- **metadata.version**：Semver 字符串（参见 frontmatter 规则）。
- **compatibility**：所需的工具或依赖项（较少使用）。

#### 编写好的描述

阅读 `references/description-guide.md` 以了解完整指南：积极触发 + 负面触发条件模式（添加一个“不要用于……”的子句，其中列出 2-3 个相邻领域）、每个分支一个触发条件，以及三个长度限制。最先触发的规则是：**目标长度 ≤250 个字符**——Claude Code 的 `/skills` 列表会从尾部开始截断超出该长度的内容，从而截掉负面触发条件子句。如果负面子句看起来缺失，`scripts/quick_validate.py` 会发出警告（非致命）。

### 技能编写指南

阅读 `references/writing-guide.md` 以了解完整指南。该指南涵盖：

- **技能的构成**——目录布局，以及 `agents/`、`references/`、`scripts/`、`assets/`、`docs/` 的存放位置。
- **渐进式披露**——三级加载、500 行的 SKILL.md 上限，以及何时拆分到 `references/` 中。
- **最小意外原则**——不得包含恶意软件或具有误导性的技能。
- **编写与工作流模式**——祈使语气、输出格式的严格性、示例以及工作流模式表。
- **随附脚本和错误消息**——脚本必须在退出前打印描述性错误，以便代理自行纠正。
- **步骤完成报告**——每个技能都必须在每个主要阶段之后输出一份报告。
- **写作风格**——用解释_原因_的方式代替大量使用 MUST。
- **生成 README.md**——仅生成 `docs/README.md`，并附带 AI 跳过提示；参见 `references/readme-template.md`。
- **测试用例**——最低 5 个提示（≥3 个正常路径、≥1 个边界情况、≥1 个不应触发的情况），保存到 `evals/evals.json`；参见 `references/schemas.md`。
- **预评估 LLM 验证**——强制对抗性审查背后的各个阶段；参见 `references/validation-prompts.md`。

### 让流程可预测（通过设计达到可发布状态）

在此创建技能的目标是实现一个**可预测的流程**——代理每次运行都遵循相同的可靠路径，并且技能无需后续经过 `skill-auto-improver` 清理流程即可达到可发布状态。阅读 `references/predictability-rubric.md` 以了解完整标准及其可检查的通过/失败门槛；以下钩子是你在编写过程中需要应用的内容：

- **严格的完成标准。** 对于分步工作流，在每个主要步骤结束时设置代理可以_检查_而不是凭感觉判断的门槛，并将其与命令、文件状态或数量关联起来。上面的步骤完成报告格式就是实现方式（`√/×` 检查项 + `Result:` 行）。强有力的标准可以阻止代理过早宣布成功；这正是可重复流程与满怀希望的流程之间的区别。
- **对非通用材料进行渐进式披露。** 所有特定分支、篇幅较长或并非每次运行都需要的内容，都应放入 `references/`，并通过一行指针引用（`references/writing-guide.md` 中的机制 → _渐进式披露_），从而降低上下文加载量，并使 SKILL.md 保持在 500 行以内。其步骤级对应方式是**按步骤委派上下文**：可委派的步骤应指定其工作者所需的 `references/` 内容片段，并将该片段作为工作者的 `Input` 传入，这样主代理无需掌握整个目录树。并非每个技能都需要这样做——`references/subagent-patterns.md` → _何时不值得切分片段_ 说明了何时可以跳过。
- **引导性术语。** 为重复出现的概念指定一个简短且承载含义的术语（如“原子提交”“故障弱化”“可发布状态”），并重复使用该术语，而不是每次都重新解释。
- **精简检查——完成前执行。** 明确执行一次检查，删除**重复内容**（同一指令出现在两个位置——保留一个归属位置，并链接到它）、**陈旧沉淀**（遗留的指导、无效引用、过时名称）、**膨胀内容**（超出价值的章节，以及本应改为表格或引导性术语的段落）和**无操作指令**（不会改变代理行为的行，如“务必小心”“使用良好判断”——将其替换为可检查的标准，或删除）。这一步最常决定一个技能是由技能创建器编写的，还是仍需要 `skill-auto-improver`。

在完成之前，**逐项检查全部 7 个评审项**（`references/predictability-rubric.md` —— 上述四个钩子，加上调用选择、分支映射和可发布性），并将结果作为 Skill Writing Step Completion Report 中的 `Predictability pass` 行输出：每满足一项输出一个 `√`，每存在一个缺口则输出一个 `×` 并命名该缺口。这样可以让评审标准检查过程显式可见，而不是悄无声息地完成——`×` 表示发布前需要修复，但不是阻塞项。

`skill-auto-improver` 仍然是用于修复 _外部编写_ 或 _遗留_ skill 的工具——对于通过此路径创建的 skill，它不是必需的第二阶段。

### 对抗性评审（评测前必须执行）

起草上下文无法评审自己的草稿——它会凭记忆填补每个缺口，而不是根据页面内容进行检查。在完成评审标准检查后，使用草稿 skill 以及 `references/validation-prompts.md` 的第 1–3 阶段（发现、逻辑遍历、边界情况攻击）启动一个**全新的子代理**；它会返回触发遗漏、含义不明确的步骤以及会导致失败的提示词。如果没有可用的 Agent 工具，则在新的会话中自行运行这些阶段（参见 `references/environment-modes.md`）。

## 运行和评估测试用例

阅读 `references/eval-loop.md` 以了解完整的 5 步流程（启动运行、起草断言、捕获计时信息、评分/聚合/查看、读取反馈）。其中涵盖带 skill + 基线子代理模式、`eval_metadata.json` 和 `timing.json` 格式、`generate_review.py` 的调用方式，以及读取 `feedback.json`。

不要使用 `/skill-test` 或任何其他测试 skill——`references/eval-loop.md` 中的流程才是此 skill 所要求的流程。

## 改进现有 skill

这是顶部入口路径部分中的 **Path B**。其中有两个不同的子路径——根据用户的请求选择合适的路径。

### Subpath B1 — 将现有 skill 改造为符合标准

当用户说“将此 skill 更新为符合标准”“修复此 skill”“评审并改进”，或者在一个已发布且已有一段时间未修改的 skill 上调用 `/skill-creator` 时，使用此路径。目标是机械式符合规范，而不是重新设计行为。**不要向用户询问用途、触发条件或输出格式**——这些内容已经编码在现有的 SKILL.md 中。

流程：

1. 读取现有的 SKILL.md 和周边目录。记录当前 frontmatter、正文长度、引用、脚本和版本。浏览 `docs/README.md` 中面向用户的说明。
2. 运行 `python scripts/quick_validate.py <skill-path>`。该命令会验证允许使用的键、名称格式、描述长度、缺失的否定触发条件以及损坏的 YAML。
3. 运行 `references/frontmatter-rules.md` 中描述的 **Frontmatter 审计**。覆盖检查清单中的每一项，而不仅仅是 `quick_validate.py` 标记出的内容。
4. 根据此 skill 中的标准检查正文：
   - SKILL.md 少于 500 行（如果超出，则拆分到 `references/`）。
   - 存在 Step Completion Reports 部分。
   - 如果 skill 会修改 git 仓库，则存在 “Repo Sync Before Edits” 部分。
   - 如果 skill 会调用另一个 skill，则存在 “Dependency Preflight” 部分；如果不会调用任何 skill，则不应存在该部分（`references/dependency-preflight.md`）。
   - 随附脚本在退出前会打印描述性错误。
   - 适当使用渐进式披露；引用深度为一层。
5. 决定采用修复模式还是仅评审模式。如果进行修复，则**递增 `metadata.version`**——仅修改 frontmatter 时递增 patch 版本，新增部分时递增 minor 版本，重构时递增 major 版本。如果仅进行评审，则像之前一样将发现的问题作为修改前/修改后建议呈现，不要暗中编辑。
6. 重新运行 `quick_validate.py` 以确认通过验证。输出 Step Completion Report，并包含 `Frontmatter valid` 检查项。
7. 可选：提供描述优化（见下文）。不要自动运行——它会消耗评测 token。

此子路径**不要求**运行 evals。只有当正文变更足够实质性，用户希望进行验证时，才跳转到子路径 B2。

### 子路径 B2 — 根据 eval 反馈迭代 skill

当用户已有 eval 结果（或希望运行 evals），并希望根据 eval 所显示的问题修改 skill 时，使用此流程。第一步是 **eval 循环**，而不是访谈。

1. 如果存在，先读取 `evals/misfires.jsonl`——记录的真实世界失败案例是信号最强的 eval；将其转换为测试用例（架构见 `references/schemas.md`）。然后，如果已有 evals，读取最新结果和用户的 `feedback.json`；如果没有，则按照上文“运行和评估测试用例”中的说明执行。
2. 阅读 `references/iteration.md`，了解修订的五项原则（泛化、保持精简、解释原因、发现重复工作、考虑子代理）以及迭代循环（应用 → 重新运行 → 审查 → 重复）。
3. 在修订正文的同时运行 **Frontmatter 审计**——建立在损坏的 frontmatter 之上的完善正文仍然无法通过验证。
4. 根据版本管理提升 `metadata.version`——新增功能或扩展触发条件时提升次版本号；修正文案时提升补丁版本号。
5. 将 evals 重新运行到新的 `iteration-<N+1>/` 目录中，让用户进行比较。

`references/iteration.md` 还记录了可选的盲 A/B 比较系统。

## 描述优化

description 字段是决定 Claude 是否调用 skill 的主要机制。创建或改进 skill 后，主动提出优化 description，以提高触发准确性。

阅读 `references/description-optimization.md`，了解完整的 4 步流程：生成触发 eval 查询，与用户通过 HTML 模板进行审查，使用 `run_loop.py` 运行优化循环，应用最佳 description。

### 打包并呈现（仅当 `present_files` 工具可用时）

如果 `present_files` 工具可用（否则跳过），打包 skill，并呈现生成的 `.skill` 文件路径，以便用户安装：

```bash
python -m scripts.package_skill <path/to/skill-folder>
```

## 环境特定说明

如果你在 Claude.ai（无子代理）或 Cowork（有子代理但无浏览器）中，某些机制会有所变化。阅读 `references/environment-modes.md`，了解经过调整的流程。核心循环（起草 → 测试 → 审查 → 改进）在所有环境中都相同——变化的只是执行机制。

---

## 参考文件

`agents/` 目录包含专用子代理的说明。需要生成相关子代理时阅读它们。

- `agents/grader.md` — 如何根据输出评估断言
- `agents/comparator.md` — 如何对两个输出进行盲 A/B 比较
- `agents/analyzer.md` — 如何分析某个版本胜出的原因

`references/` 目录包含其他文档：

- `references/frontmatter-rules.md` — 版本管理、YAML 安全性和 Frontmatter 审计（强制）。
- `references/dependency-preflight.md` — skill 依赖规则：何时需要预检门、预检门必须指明什么，以及要输出的模板（强制）。
- `references/predictability-rubric.md` — 新 skill 必须通过设计满足的可预测性标准：调用选择、分支映射、严格的完成标准、引导词、精简步骤，以及可发布状态（不依赖自动改进器）。
- `references/description-guide.md` — 强势 + 负向触发的 description 模式，每个分支一个触发条件，长度预算。
- `references/exemplars.md` — 三个带注释的示例 skill（工作流、知识库、编排器），供模仿。
- `references/writing-guide.md` — 结构、渐进式披露、写作和工作流模式、错误消息、测试用例。
- `references/schemas.md` — evals.json、misfires.jsonl、grading.json 等的 JSON 结构。
- `references/subagent-patterns.md` — 何时以及如何设计使用 Agent 工具的 skill，包括按步骤委派上下文（某个步骤声明其 `references/` 片段；工作者将其作为 `Input` 接收），以及何时不值得采用该片段。
- `references/validation-prompts.md` — 4 个验证阶段；第 1–3 阶段会编写强制性的对抗性审查脚本。
- `references/eval-loop.md` — 完整的 5 步 eval 运行 / 评分 / 查看器流程。
- `references/iteration.md` — 根据反馈改进 skill 的原则；盲比较。
- `references/description-optimization.md` — 4 步 description 调优工作流。
- `references/environment-modes.md` — Claude.ai 和 Cowork 的适配方式。
- `references/readme-template.md` — `docs/README.md` 的 AI 跳过通知、模板和规则。

---

在任何任务列表中，都要包含“创建 evals JSON 并运行 `eval-viewer/generate_review.py` 供人工审核”——尤其是在 Cowork 中，因为很容易跳过这一步。