---
name: skill-creator
description: "Create, improve, evaluate, benchmark skills. Use when authoring a new skill, updating an existing one, running evals, or optimizing a skill's description for triggering. Don't use for invoking skills, writing prose, or scaffolding Python projects."
license: MIT
effort: max
metadata:
  version: 1.14.0
  author: "Luong NGUYEN <luongnv89@gmail.com>"
---
# Skill 创建器

用于创建新 skill 并对其进行迭代改进的 skill。代理的上下文预算是首要限制因素，因此该 SKILL.md 会链接到各个专注的参考文件。

核心循环：

1. 确定 skill 应该做什么，以及应该如何实现
2. 编写草稿
3. 针对 `claude-with-access-to-the-skill` 运行测试提示
4. 与用户一起评估结果（通过 `eval-viewer/generate_review.py` 进行定性评审，同时进行定量评估）
5. 根据反馈和基准测试结果修改 skill
6. 重复上述过程，直到满意为止；扩展测试集并再次进行大规模尝试

确定用户目前处于此循环中的哪个阶段，并从那里开始介入。全新创建 skill → 从第 1 步开始。已有草稿 → 跳转到第 3 步或第 4 步。用户希望进行不带正式评估的即兴迭代 → 支持这种方式。skill 稳定后，可选用描述改进器来优化触发条件。

## 两条入口路径

该 skill 支持两种不同的工作流。**在进行任何其他操作之前，先确定用户属于哪一条路径**——两条路径的起始步骤不同。

- **路径 A — 从零开始创建新 skill。** 用户希望记录工作流、将模式编码化，或构建新能力。从下面的**“创建 skill”**开始（捕获意图 → 访谈 → 编写 SKILL.md → 测试 → 评估）。
- **路径 B — 改进现有 skill。** 用户指出了一个已经存在的 skill，希望将其提升到标准水平、修复、优化，或根据评估反馈进行迭代。**不要从捕获意图开始**——意图已经编码在现有的 SKILL.md 中。从下面的**“改进现有 skill”**开始。

如果请求含糊不清（“你能看看这个 skill 吗？”），假定是**路径 B**，并在按照新 skill 的方式进行访谈之前先确认。对某个 skill 目录或文件调用 `/skill-creator` 时，也应采用路径 B。

两条路径都必须遵守以下规则：**编辑前同步仓库**、**依赖项预检**、**版本管理**、**YAML 前置元数据安全**以及**评审/评估时的前置元数据审计**。无论采用哪条路径，都要应用这些规则。两条路径最后都包含**运行统计**代码块。

## 步骤完成报告

完成每个主要步骤后，按以下格式输出状态报告：

```
◆ [Step Name] ([step N of M] — [context])
································································
  [Check 1]:          √ pass
  [Check 2]:          √ pass (note if relevant)
  [Check 3]:          × fail — [reason]
  [Check 4]:          √ pass
  [Criteria]:         √ N/M met
  ____________________________
  Result:             PASS | FAIL | PARTIAL
```

根据步骤实际验证的内容调整检查项名称。通过使用 `√` 表示通过，使用 `×` 表示失败，并使用 `—` 添加简要上下文。`Criteria` 行汇总满足的验收标准数量。`Result` 行给出总体结论。

**意图捕获阶段检查项：**`Worth building`、`Goal defined`、`Triggers identified`、`Output format agreed`

**Skill 编写阶段检查项：**`SKILL.md written`、`README generated`、`Subagents designed`、`Dependency preflight`（当 skill 没有 skill 依赖项，或存在依赖项且为每个依赖项提供了门禁时为 √；当调用了依赖项却没有门禁时为 ×）、`Predictability pass`（_Make it predictable_ 中的 7 项评分标准——全部满足时为 √，存在缺口时为 × 并指出缺口）、`Adversarial review`（已处理新加入的子代理所发现的问题）。

**测试阶段检查项：** `Evals created`、`Runs completed`、`Viewer launched`

**迭代阶段检查项：** `Feedback incorporated`、`Benchmarks improved`、`Description optimized`

## 运行统计（必需）

每次创建或更新 skill 的运行，都会在摘要末尾附加一个运行统计块——它是最终 Step Completion Report 之后打印的最后一项内容。该统计块只报告本次运行的**成本**，不报告运行已经报告过的任何内容。

在 skill 启动时记录一次 `run_started_epoch`，并与 skill 的第一条命令在同一个 shell 中执行（`cmd; ec=$?; date +%s >&2; exit "$ec"` ——从 stderr 中读取 epoch，以保持 stdout 和退出代码不变）。已经记录过开始时间的运行应复用该时间。

```
  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
  Run stats   elapsed 6m 04s · tokens 128,400 · cost $0.42
              agents 3 · skills 1 · tool calls 47
```

字段是固定的，且必须按以下顺序排列——不得重新排序、重命名或添加字段：

| Field        | Value                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `elapsed`    | 墙钟时间时长，格式为 `{H}h {M}m {S}s`；仅省略值为零的前导单位（`6m 04s`、`48s`）     |
| `tokens`     | **有条件显示**——仅当主机报告了使用量时打印，并使用千位分隔符 |
| `cost`       | **有条件显示**——仅当主机报告了运行成本时打印，格式为 `$0.42`                    |
| `agents`     | 本次运行生成的子代理数量                                                                       |
| `skills`     | 本次运行调用的其他 skill 数量                                                                    |
| `tool calls` | 本次运行进行的工具调用次数                                                                   |

- **当主机未报告 `tokens` 和 `cost` 的数值时，必须完全省略这两个字段**——不得留下多余的 `·`，不得使用占位符。绝不要根据输出长度、文件大小或步骤数量估算这些数值，也绝不要从主机会话记录或日志中重新构造这些数值。
- **`elapsed`、`agents`、`skills` 和 `tool calls` 始终打印。**无法确定的值打印字面量 `n/a`；`0` 是一个已确定的值，在实际为零时应正确打印（未生成子代理的运行应打印 `agents 0`）。
- 缺少某个可选数值时，绝不能抑制运行统计块的其余部分。

每条完成创建或更新的路径都必须打印该统计块——包括 Path A、Subpath B1 和 Subpath B2——其他所有终止结果也必须打印：提前停止、拒绝继续的门禁，或失败的步骤。只有完全没有产生任何输出的运行不需要统计块。测量过程本身不能成为被测量内容中可测量的一部分：开始时读取一次 epoch，结束时读取一次 epoch，输出两行内容——绝不能在每个步骤中调用计时，也绝不能进行摘要汇总遍历。

## 与用户沟通

用户的技术熟悉程度差异很大。根据上下文线索匹配术语的专业程度——像“JSON”或“assertion”这样的术语，需要有证据表明用户了解它们；不确定时，应简要定义这些术语。

---

## 会修改仓库的 Skill 的强制规则

创建或更新任何会修改 git 仓库中文件的 skill（代码、文档、配置、提交、发布）时，都必须在该 skill 的 SKILL.md 中包含以下规则：

- 在靠近顶部的位置添加 **"Repo Sync Before Edits (mandatory)"** 部分，要求在修改前运行 `branch="$(git rev-parse --abbrev-ref HEAD)"; git fetch origin && git pull --rebase origin "$branch"`。
- 如果工作树不干净：先 stash、同步，然后 pop。
- 如果缺少 `origin` 或发生冲突：停止并在继续前询问用户。

没有这个预同步防护措施，不要交付会修改仓库的 skill。

## 会调用其他 Skill 的 Skill 的强制规则

对于你编写或改造的每个 skill，都要确定它是否会调用、委托给或读取**另一个 skill**。在访谈（Capture Intent）的第 6 个问题中以问题形式询问，并根据草稿进行确认——即使作者声称没有依赖，只要正文提到 `/another-skill`，或读取 `~/.claude/skills/` 下的内容，就属于依赖。

- **有依赖** → 生成的 skill 必须包含一个 `## Dependency Preflight (mandatory)` 部分，并放在第一个会进行任何修改的步骤之前。对于每个依赖，都要写明安装该依赖的命令、安装其安装程序的命令，以及验证命令；如果未找到依赖，必须在第一次修改前停止。
- **无依赖** → 不添加任何内容。不要添加空的预检部分，也不要添加“无依赖”占位符。

阅读 `references/dependency-preflight.md`，其中包含可复制的模板和未找到依赖时的行为。`skill-auto-improver` 也会审计这一规则，因此缺少所需门禁的 skill 之后会再次被报告为问题。

## Frontmatter 规则（强制）

阅读 `references/frontmatter-rules.md`，了解完整的强制规则：

- **版本管理** — 创建时设置 `metadata.version: 1.0.0`；每次编辑时递增 patch/minor/major 版本。
- **YAML Frontmatter 安全性** — 任何包含 YAML 特殊字符的字符串值都必须使用双引号（完整列表见参考文档）。
- **评审/评估时的 Frontmatter 审计** — 必须检查必填字段、名称/目录匹配、允许的顶层键、`metadata.version`、`metadata.author`、YAML 安全性，以及与 `docs/README.md` 的一致性。首先运行 `python scripts/quick_validate.py <skill-path>`；该命令无需 LLM 推理即可捕获机械性问题。

这些规则适用于每次写入。保存前始终确认这些规则。

## 创建 Skill

### Capture Intent

先了解用户的意图。当前对话中可能已经包含用户希望保存为 skill 的工作流（例如，用户说“把这个变成一个 skill”）。如果是这样，先从对话历史中提取答案——包括使用的工具、步骤顺序、用户提出的修正，以及观察到的输入/输出格式。然后让用户补充缺失信息并确认。

**先进行门禁判断——这真的应该是一个 skill 吗？** 当一个工作流具有以下特征时，创建 skill 才有意义：**会重复出现**（未来还会用到）、**不明显**（没有它时，即使能力较强的代理也可能出错），以及**稳定**（下个月不会改变）。如果不满足其中任何一项，就建议不要创建它——一次性任务更适合使用普通提示，而每个不必要的 skill 都会污染后续触发。用户可以覆盖这一建议；设置此门禁是为了避免默认“总是创建 skill”。

1. 此 skill 应使 Claude 能够完成什么？
2. 此 skill 应在何时触发？（哪些用户表述/上下文）
3. 预期的输出格式是什么？
4. 是否应设置测试用例来验证此 skill 是否正常工作？具有客观可验证输出的 skill（文件转换、数据提取、代码生成、固定工作流步骤）通常适合设置测试用例。具有主观输出的 skill（写作风格、艺术创作）通常不需要。请根据 skill 类型提出适当的默认建议，但由用户决定。
5. **此 skill 是否应使用子代理？** 请阅读 `references/subagent-patterns.md` 获取完整指南。关键信号：
   - 此 skill 是否会读取许多文件或扫描大型代码库？→ Explorer 子代理
   - 工作的某些部分是否可以并行运行？→ 并行工作子代理
   - 此 skill 是否需要独立的质量审查？→ 使用全新的子代理进行审查循环
   - 此 skill 是否会生成需要集中推理的大型工件？→ Executor 子代理
     如果符合其中任何一项，请采用主代理作为编排器的架构，让子代理处理繁重工作，同时保持主对话上下文清晰。
6. **此 skill 是否会调用其他 skill？** 列出它调用的、委托某个阶段执行的或读取的每一个 skill。如果存在任何此类 skill，你编写的 skill 必须为它们附带依赖预检流程——请参阅上方的 _Mandatory Rule for Skills That Invoke Other Skills_ 和 `references/dependency-preflight.md`。如果不存在，则无需添加任何内容。
7. **由模型调用还是由用户调用？** 在起草之前决定主要调用方式——这会影响你的写法。**由模型调用**（默认方式）是代理在情况符合时应用的可复用规范；应针对可靠触发进行描述优化。**由用户调用**（`/skill-name`）是用户有意运行的编排流程（例如流水线、成本高昂或具有破坏性的操作）；正文应以“用户已提出此请求，可以继续执行”为导向。在此过程中也要权衡上下文负载和认知负载预算。完整的权衡方法请参阅 `references/predictability-rubric.md`。

### 访谈与研究

主动询问有关边界情况、输入/输出格式、示例文件、成功标准和依赖项的问题。在这部分内容明确之前，不要编写测试提示词。检查可用的 MCP；如果有可用的 MCP，则通过子代理并行开展研究，否则直接在线性流程中完成。

**在起草正文之前，先梳理此 skill 的分支。** 确定此 skill 运行时的不同模式——需要不同指令的路径（创建与改进、针对不同框架、针对不同环境、试运行与应用）。预先了解这些分支后，你就可以在 SKILL.md 开头使用简短的选择器，并仅在对应分支中公开该分支所需的材料，而不是强迫每次运行都读取所有分支。本 skill 顶部的 “Two entry paths” 区块本身就是一个分支选择器示例。请参阅 `references/predictability-rubric.md` → _Map branches before drafting_。

### 编写 SKILL.md

起草之前，先浏览 `references/exemplars.md`，并仿照与此 skill 最接近的范型——工作流、知识型或编排器。然后，根据用户访谈结果，填写：

- **name**：1-64 个字符，使用小写字母/数字/连字符，不得包含连续连字符，且必须与父目录完全匹配。由 `scripts/quick_validate.py` 强制执行。
- **description**：说明何时触发以及它的作用。主要的触发机制。单行，不得换行。Claude 往往会 _触发不足_ ——应让描述稍微“强势”一些，并包含负面触发条件。
- **effort**（可选）：`low | medium | high | xhigh | max`。默认为 `high`。
- **metadata.version**：Semver 字符串（参见 frontmatter 规则）。
- **compatibility**：所需的工具或依赖项（少见）。

#### 编写良好的描述

阅读 `references/description-guide.md` 获取完整指南：强势触发 + 负面触发模式（包含“不要用于……”条款，并列出 2–3 个相邻领域）、每个分支一个触发条件，以及三个长度限制。最先产生影响的规则是：**目标长度 ≤250 个字符** —— Claude Code 的 `/skills` 列表会从尾部开始截断超出该长度的内容，从而截掉负面触发条款。`scripts/quick_validate.py` 在负面条款看起来缺失时会发出警告（非致命）。

### Skill 编写指南

阅读 `references/writing-guide.md` 获取完整指南。内容包括：

- **Skill 的构成** ——目录布局，以及 `agents/`、`references/`、`scripts/`、`assets/`、`docs/` 的存放位置。
- **渐进式披露** ——三级加载、500 行的 SKILL.md 上限，以及何时拆分到 `references/` 中。
- **避免意外原则** ——不得包含恶意软件或具有误导性的 skill。
- **编写与工作流模式** ——祈使语气、输出格式严格性、示例以及工作流模式表。
- **随附脚本与错误消息** ——脚本必须在退出前打印描述性错误，以便代理自行纠正。
- **步骤完成报告** ——每个 skill 在每个主要阶段之后都要输出一份。
- **写作风格** ——用解释 _原因_ 代替大量使用 MUST。
- **生成 README.md** ——仅生成 `docs/README.md`，并附带 AI 跳过提示；参见 `references/readme-template.md`。
- **测试用例** ——至少 5 个提示词（≥3 个正常路径、≥1 个边界情况、≥1 个不应触发的情况），保存到 `evals/evals.json`；参见 `references/schemas.md`。
- **评估前的 LLM 验证** ——强制性对抗性审查背后的各个阶段；参见 `references/validation-prompts.md`。

### 让它具备可预测性（通过设计达到可发布状态）

在此创建 skill 的目标是实现一个**可预测的流程** ——每次运行时代理都遵循相同的可靠路径 ——并且让 skill 无需之后再经过 `skill-auto-improver` 清理流程即可达到**可发布状态**。阅读 `references/predictability-rubric.md` 获取完整标准及可检查的通过/失败门槛；以下是你在_编写过程中_应用的要点：

- **严格的完成标准。** 对于基于步骤的工作流，在每个主要步骤结束时，都要设置代理可以_检查_而非凭感觉判断的标准，并将其与命令、文件状态或数量绑定。上面的步骤完成报告格式就是实现方式（使用 `√/×` 检查项 + 一行 `Result:`）。强标准可以阻止代理过早宣布成功；这正是可重复流程与一厢情愿的区别。
- **对非通用材料进行渐进式披露。** 任何特定于分支、篇幅较长或并非每次运行都需要的内容，都应放入 `references/`，并通过一行指引进行引用（相关机制见 `references/writing-guide.md` → _Progressive Disclosure_）——这样可以降低上下文加载量，并使 SKILL.md 保持在 500 行以内。
- **首要词。** 为反复出现的概念定义一次简短且具有承载作用的术语（如“原子提交”“软失败”“可发布状态”），并重复使用该术语，而不是每次都重新解释。
- **精简检查——完成前运行。** 明确进行一次检查，以删减**重复内容**（同一条指令出现在两个地方——保留一个归属位置，并链接到它）、**过时沉淀**（遗留指南、无效引用、过时名称）、**内容膨胀**（超出价值的扩展章节，以及本应改为表格或首要词的冗长文字）和**无效指令**（不会改变代理行为的行——例如“要小心”“运用良好判断”——应替换为可检查的标准或删除）。这一步最常将 skill-creator 编写的 skill 与仍需 `skill-auto-improver` 处理的 skill 区分开来。

完成前，**检查全部 7 项评估标准**（`references/predictability-rubric.md`——上述四个钩子，加上调用选择、分支映射和可发布性），并将结果作为技能编写步骤完成报告中的 `Predictability pass` 行输出：每项满足则标记 `√`，存在任何缺口则标记 `×` 并写明缺口。这样可以让评估标准检查过程显式可见，而不是静默进行——`×` 表示发布前需要修复，并不意味着流程阻塞。

`skill-auto-improver` 仍然是用于修复_外部编写_或_旧版_技能的工具——对于通过此路径创建的技能，它不是必需的第二阶段。

### 对抗性审查（评估前必须执行）

起草上下文无法审查自己的草稿——它会凭记忆填补所有缺口，而不是根据页面内容进行审查。在评估标准检查之后，使用草稿技能以及 `references/validation-prompts.md` 的第 1–3 阶段（发现、逻辑 walkthrough、边界情况攻击）生成一个**全新的子代理**；它会返回触发遗漏、含糊步骤和破坏性提示。如果没有可用的 Agent 工具，请在一个全新的会话中自行运行这些阶段（参见 `references/environment-modes.md`）。

## 运行和评估测试用例

阅读 `references/eval-loop.md` 以了解完整的 5 步流程（生成运行、起草断言、捕获计时、评分/汇总/查看、读取反馈）。其中涵盖带技能 + 基线子代理模式、`eval_metadata.json` 和 `timing.json` 的格式、`generate_review.py` 的调用方式，以及读取 `feedback.json`。

不要使用 `/skill-test` 或任何其他测试技能——`references/eval-loop.md` 中的流程才是此技能要求使用的流程。

## 改进现有技能

这是顶部入口路径区块中的**路径 B**。其中有两个不同的子路径——根据用户的请求选择。

### 子路径 B1——使现有技能符合标准

当用户说“将此技能更新为符合标准”“修复此技能”“审查并改进”，或者针对一个已经发布且已有一段时间未更新的技能调用 `/skill-creator` 时，使用此路径。目标是机械式符合标准，而不是重新设计行为。**不要就用途、触发条件或输出格式采访用户**——这些信息已经编码在现有的 SKILL.md 中。

流程：

1. 阅读现有的 SKILL.md 和周边目录。记录当前 frontmatter、正文长度、引用、脚本和版本。略读 `docs/README.md`，了解面向用户的说明。
2. 运行 `python scripts/quick_validate.py <skill-path>`。此命令会验证允许使用的键、名称格式、描述长度、缺失的否定触发条件以及损坏的 YAML。
3. 运行 `references/frontmatter-rules.md` 中描述的**Frontmatter 审计**。覆盖清单中的每一项，而不仅仅是 `quick_validate.py` 报告的问题。
4. 根据本技能中的标准检查正文：
   - SKILL.md 少于 500 行（如果超出，则拆分到 `references/`）。
   - 存在“步骤完成报告”部分。
   - 如果技能会修改 git 仓库，则存在“编辑前同步仓库”部分。
   - 如果技能会调用另一个技能，则存在“依赖项预检”部分；如果不调用其他技能，则不应存在该部分（`references/dependency-preflight.md`）。
   - 捆绑脚本在退出前会打印描述性错误。
   - 适当使用渐进式披露；引用最多嵌套一层。
5. 决定采用修复模式还是仅审查模式。如果修复，则应用编辑并**递增 `metadata.version`**——仅修改 frontmatter 时递增 patch 版本，新增部分时递增 minor 版本，重构时递增 major 版本。如果仅审查，则像之前一样提出修改前/修改后的建议，不要静默编辑。
6. 重新运行 `quick_validate.py` 以确认通过。输出步骤完成报告，并包含 `Frontmatter valid` 检查项。
7. 可选：提供描述优化（见下文）。不要自动运行——它会消耗评估 token。

此子路径**不要求运行 evals**。仅当正文变更足够实质，用户希望进行验证时，才跳转到子路径 B2。

### 子路径 B2 —— 根据 eval 反馈迭代 skill

当用户已有 eval 结果（或希望运行 evals），并希望根据 eval 显示的结果修改 skill 时使用此路径。第一步是 **eval 循环**，而不是访谈。

1. 如果存在，先读取 `evals/misfires.jsonl` —— 记录的真实世界失败案例是信号最强的 eval；将它们转换为测试用例（架构见 `references/schemas.md`）。然后，如果已有 eval，读取最新结果和用户的 `feedback.json`；如果没有，则按照上文“运行和评估测试用例”中的说明执行。
2. 阅读 `references/iteration.md`，了解修订的五项原则（泛化、保持精简、解释原因、发现重复工作、考虑子代理）以及迭代循环（应用 → 重新运行 → 审查 → 重复）。
3. 在修订内容的同时运行 **Frontmatter Audit** —— 建立在损坏的 frontmatter 之上的精修正文仍然无法通过验证。
4. 按照版本管理提升 `metadata.version`：新增能力或扩展触发条件时提升次版本号；措辞修复时提升补丁版本号。
5. 将 evals 重新运行到新的 `iteration-<N+1>/` 目录中，以便用户进行比较。

`references/iteration.md` 还记录了可选的盲 A/B 比较系统。

## 描述优化

description 字段是决定 Claude 是否调用某个 skill 的主要机制。创建或改进 skill 后，提供优化 description 的选项，以提高触发准确性。

阅读 `references/description-optimization.md`，了解完整的四步流程：生成触发 eval 查询、使用 HTML 模板与用户审查、使用 `run_loop.py` 运行优化循环、应用最佳 description。

### 打包并呈现（仅当 `present_files` 工具可用时）

如果 `present_files` 工具可用（否则跳过），请打包 skill，并呈现生成的 `.skill` 文件路径，以便用户安装：

```bash
python -m scripts.package_skill <path/to/skill-folder>
```

## 环境特定说明

如果你使用的是 Claude.ai（没有子代理）或 Cowork（有子代理但没有浏览器），部分机制会有所变化。阅读 `references/environment-modes.md` 了解调整后的流程。核心循环（起草 → 测试 → 审查 → 改进）在所有环境中都相同——变化的只是执行机制。

---

## 参考文件

`agents/` 目录包含针对专用子代理的说明。需要启动相关子代理时阅读这些说明。

- `agents/grader.md` — 如何根据输出评估断言
- `agents/comparator.md` — 如何在两个输出之间进行盲 A/B 比较
- `agents/analyzer.md` — 如何分析某个版本胜出的原因

`references/` 目录包含其他文档：

- `references/frontmatter-rules.md` — 版本管理、YAML 安全性和 Frontmatter Audit（必需）。
- `references/dependency-preflight.md` — skill 依赖规则：何时需要预检门禁、必须命名的内容以及要输出的模板（必需）。
- `references/predictability-rubric.md` — 新 skill 必须通过构造满足的可预测性标准：调用选择、分支映射、严格的完成标准、引导词、精简步骤以及可发布就绪（不依赖自动改进器）。
- `references/description-guide.md` — 强势 + 负向触发描述模式，每个分支一个触发条件，长度预算。
- `references/exemplars.md` — 三个带注释的示例 skill（工作流、知识、编排器），可供模仿。
- `references/writing-guide.md` — 结构、渐进式披露、写作和工作流模式、错误消息、测试用例。
- `references/schemas.md` — evals.json、misfires.jsonl、grading.json 等的 JSON 结构。
- `references/subagent-patterns.md` — 何时以及如何设计使用 Agent 工具的 skill。
- `references/validation-prompts.md` — 四个验证阶段；第 1–3 阶段用于编写强制性的对抗性审查脚本。
- `references/eval-loop.md` — 完整的 5 步 eval 运行 / 评分 / 查看器流程。
- `references/iteration.md` — 根据反馈改进 skill 的原则；盲比较。
- `references/description-optimization.md` — 四步 description 调优工作流。
- `references/environment-modes.md` — Claude.ai 和 Cowork 特定的调整方式。
- `references/readme-template.md` — `docs/README.md` 的 AI 跳过提示、模板和规则。

---

在任何任务列表中，都要包含“创建 evals JSON 并运行 `eval-viewer/generate_review.py` 进行人工审查”——尤其是在 Cowork 中，因为很容易跳过这一步。