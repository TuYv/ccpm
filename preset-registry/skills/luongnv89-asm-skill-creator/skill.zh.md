---
name: skill-creator
description: "Create, improve, evaluate, benchmark skills. Use when authoring a new skill, updating an existing one, running evals, or optimizing a skill's description for triggering. Don't use for invoking skills, writing prose, or scaffolding Python projects."
license: MIT
effort: max
metadata:
  version: 1.16.2
  author: "Luong NGUYEN <luongnv89@gmail.com>"
---
# Skill Creator

用于创建新 skill 并对其进行迭代改进的 skill。代理的上下文预算是主要限制因素，因此此 SKILL.md 会链接到专注于特定主题的参考文件。

核心循环：

1. 确定 skill 应该做什么，以及应该如何实现
2. 编写草稿
3. 针对 claude-with-access-to-the-skill 运行测试提示
4. 与用户一起评估结果（通过 `eval-viewer/generate_review.py` 进行定性审查，以及进行定量评估）
5. 根据反馈和基准测试结果修改 skill
6. 重复上述过程，直到满意为止；扩展测试集并再次进行规模化尝试

确定用户当前处于此循环中的哪个阶段，并从该阶段开始介入。从零开始创建新 skill → 从第 1 步开始。已有草稿 → 跳到第 3 步或第 4 步。用户希望在没有正式评估的情况下进行快速迭代 → 为其提供支持。skill 稳定后，可以选择运行描述优化器来优化触发效果。

## 两种入口路径

该 skill 支持两种不同的工作流。**在执行任何操作之前，先确定用户属于哪一种工作流**——它们的起始步骤不同。

- **路径 A — 从零创建新 skill。** 用户希望记录一个工作流、将一种模式编纂成规范，或构建一项新能力。从下面的**“创建 skill”**开始（捕获意图 → 访谈 → 编写 SKILL.md → 测试 → 评估）。
- **路径 B — 改进已有 skill。** 用户指出一个已经存在的 skill，并希望将其提升到标准、修复、优化，或根据评估反馈进行迭代。**不要从捕获意图开始**——意图已经编码在现有的 SKILL.md 中。从下面的**“改进已有 skill”**开始。

如果请求含糊不清（“你能看看这个 skill 吗？”），假设属于**路径 B**，并在进行新 skill 访谈之前先确认。对 skill 目录或文件调用 `/skill-creator` 时，也使用路径 B。

两条路径都共享以下强制规则：**编辑前同步仓库**、**依赖项预检**、**版本管理**、**YAML Frontmatter 安全性**以及**审查/评估时的 Frontmatter 审计**。无论使用哪条路径，都必须应用这些规则。两条路径最后都要包含**运行统计**代码块。

## 步骤完成报告

完成每个主要步骤后，按照以下格式输出状态报告：

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

根据步骤实际验证的内容调整检查项名称。使用 `√` 表示通过，使用 `×` 表示失败，并使用 `—` 添加简短上下文。`Criteria` 行概述已满足的验收标准数量。`Result` 行给出总体结论。

每个阶段的检查项：

| 阶段          | 检查项                                                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 意图捕获      | `Worth building`、`Goal defined`、`Triggers identified`、`Output format agreed`                                                   |
| Skill 编写    | `SKILL.md written`、`README generated`、`Subagents designed`、`Dependency preflight`、`Predictability pass`、`Adversarial review` |
| 测试          | `Evals created`、`Runs completed`、`Viewer launched`                                                                              |
| 迭代          | `Feedback incorporated`、`Benchmarks improved`、`Description optimized`                                                          |

当技能没有技能依赖，或存在依赖且为每个依赖都提供了 gate 时，`Dependency preflight` 为 `√`；当调用依赖却未提供 gate 时，为 `×`。`Predictability pass` 会逐项检查 _Make it predictable_ 中的 7 项评审标准——每满足一项记 `√`，不满足时记 `×` 并指出差距。`Adversarial review` 在处理完新子代理发现的问题后记为 `√`。

## 运行统计（必需）

每次创建或更新技能的运行，都必须以一个运行统计块结束摘要——它必须是最终 Step Completion Report 之后打印的最后内容。该块只报告本次运行的**成本**，不重复报告运行中已经报告过的内容。

在与技能的第一条命令相同的 shell 中**只捕获一次** `run_started_epoch`——`cmd; ec=$?; date +%s >&2; exit "$ec"`——从 stderr 读取 epoch，以确保 stdout 和退出代码保持不变。在此处设置它，而不是之后再设置：没有这个锚点时，`elapsed` 会打印 `n/a`，并且该块仍然必须在提前停止时打印。

```
  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
  Run stats   elapsed 6m 04s · tokens 128,400 · cost $0.42
              agents 3 · skills 1 · tool calls 47
```

字段固定且顺序固定——绝不重新排序、重命名或添加字段：`elapsed`、`tokens`、`cost`、`agents`、`skills`、`tool calls`。每个字段的格式要求见 `references/run-stats.md`。

- **当宿主未报告 `tokens` 和 `cost` 的数值时，完全省略这两个字段**——不得留下多余的 `·`，不得使用占位符。绝不估算，也绝不根据宿主的 transcript 或日志重新构造。
- `elapsed`、`agents`、`skills` 和 `tool calls` 始终打印。无法确定的值打印字面量 `n/a`；`0` 是已确定的值，在确实为零时应正确打印（未生成子代理的运行应打印 `agents 0`）。
- 缺少某个可选数值时，绝不能因此抑制该块的其余内容。

每条完成创建或更新的路径都必须打印该块——包括 Path A、Subpath B1 和 Subpath B2——其他所有终止结果也一样：提前停止、拒绝继续的 gate，或失败的步骤。只有完全没有产生任何输出的运行不打印该块。

## 与用户沟通

用户的技术熟悉程度差异很大。根据上下文线索调整术语的使用——像“JSON”或“断言”这样的术语，需要有证据表明用户了解它们；不确定时，应简要定义这些术语。

---

## Repo-Mutating Skills 的强制规则

创建或更新任何会修改 git 仓库中​​文件的技能时（代码、文档、配置、提交、发布），必须在该技能的 SKILL.md 中加入以下规则：

- 在靠前位置添加一个 **"Repo Sync Before Edits (mandatory)"** 部分，要求在修改前执行 `branch="$(git rev-parse --abbrev-ref HEAD)"; git fetch origin && git pull --rebase origin "$branch"`。
- 如果工作树不干净：先 stash，再同步，然后 pop。
- 如果缺少 `origin` 或发生冲突：停止并询问用户，然后再继续。

没有这个预同步防护措施，不得交付会修改仓库的技能。

## 调用其他技能的技能的强制规则

对于你编写或改造的每个技能，都必须确认它是否会调用、委托给或读取**另一个技能**。在访谈中提问——Capture Intent 的第 6 个问题是 _Does this skill invoke other skills?_——并对照草稿确认答案：正文中提及 `/another-skill`，或读取 `~/.claude/skills/` 下的内容，即使作者表示没有依赖，也属于依赖。

- **它会** → 你生成的 skill 会包含一个 `## Dependency Preflight (mandatory)` 部分，放置在第一个会产生任何变更的步骤之前。对于每个依赖项，它会列出 skill 名称、安装该依赖项的命令、安装其安装程序本身的命令，以及验证命令；如果缺少依赖项，它会在第一次变更之前停止。
- **它不会** → 不添加任何内容。不添加空的预检部分，也不添加“无依赖项”占位符。

阅读 `references/dependency-preflight.md`，了解可复制的模板和缺少依赖项时的行为。`skill-auto-improver` 也会检查这一规则，因此缺少必需门禁的 skill 之后会再次被报告为问题。

## Frontmatter rules (mandatory)

阅读 `references/frontmatter-rules.md`，了解完整的强制规则：

- **版本管理** — 创建时设置 `metadata.version: 1.0.0`；每次编辑时递增 patch/minor/major 版本。
- **YAML Frontmatter 安全性** — 包含 YAML 特殊字符的任何字符串值都必须使用双引号（完整列表参见参考文档）。
- **审查/评估时的 Frontmatter 审计** — 检查必填字段、名称/目录匹配、允许的顶层键、`metadata.version`、`metadata.author`、YAML 安全性，以及与 `docs/README.md` 的一致性。首先运行 `python scripts/quick_validate.py <skill-path>`；它无需 LLM 推理即可捕获机械性问题。

这些规则适用于每次写入。保存之前务必确认这些规则。

## Creating a skill

### Capture Intent

阅读 `references/intent-interview.md` 并从头到尾执行。它包含：

- **门槛** — 只有当工作流会被重复执行、并且不明显且稳定时，skill 才值得创建。否则建议不要创建；用户可以覆盖此建议。
- **七个访谈问题** — 目的、触发条件、预期输出格式、测试用例、子代理（包括按步骤委派上下文）、skill 依赖项，以及由模型调用还是由用户调用（`/skill-name` 是用户有意运行的编排操作——可能是一条流水线，或者是用户需要先确认的高成本或破坏性操作）。
- **访谈与研究** — 边界情况、示例文件、成功标准、可用的 MCP。
- **起草前的分支映射** — 命名 skill 运行时的不同模式，以便仅在使用该分支时披露分支特定的材料。

先提取对话中已经回答的内容，再向用户提问；由用户补充缺失信息并进行确认。

### Write the SKILL.md

起草之前，浏览 `references/exemplars.md`，并模仿与此 skill 最接近的原型——工作流型、知识型或编排型。然后根据用户访谈，填写：

- **name**：1-64 个字符，使用小写字母/数字/连字符，不得包含连续连字符，并且必须与父目录完全匹配。由 `scripts/quick_validate.py` 强制检查。
- **description**：说明何时触发以及它的作用。描述是主要的触发机制。必须为单行，不能换行。Claude 往往会_触发不足_——让描述稍微“积极”一些，并加入负面触发条件。
- **effort**（可选）：`low | medium | high | xhigh | max`。默认为 `high`。
- **metadata.version**：Semver 字符串（参见 frontmatter 规则）。
- **compatibility**：必需的工具或依赖项（较少使用）。

#### 编写好的描述

阅读 `references/description-guide.md` 获取完整指南：强势表述 + 负面触发词模式（包含一个列出 2–3 个相邻领域的“不要用于……”子句）、每个分支一个触发词，以及三个长度限制。最先触发的规则是：**目标 ≤250 个字符**——Claude Code 的 `/skills` 列表会从尾部开始截断超出该长度的内容，从而截掉负面触发词子句。当负面子句看起来缺失时，`scripts/quick_validate.py` 会发出警告（非致命）。

### 技能编写指南

阅读 `references/writing-guide.md` 获取完整指南。该指南涵盖技能结构（`agents/`、`references/`、`scripts/`、`assets/`、`docs/` 的放置位置）、渐进式披露和 500 行的 SKILL.md 上限、“避免意外”原则、编写和工作流模式、随附脚本的错误消息、步骤完成报告、写作风格、`docs/README.md` 生成（`references/readme-template.md`）、保存到 `evals/evals.json` 的至少 5 个提示词测试用例（`references/schemas.md`），以及预评估 LLM 验证阶段（`references/validation-prompts.md`）。

### 让流程可预测（通过构建即可达到可发布状态）

在这里创建技能的目标是一个**可预测的流程**——智能体每次运行都遵循相同的可靠路径——以及一个无需之后再经过 `skill-auto-improver` 清理就能达到**可发布状态**的技能。阅读 `references/predictability-rubric.md` 获取完整标准及可检查的通过/失败门槛。编写过程中应应用以下机制：

- **要求严格的完成标准。** 每个主要步骤结束时，都要设定智能体可以_检查_而不是凭感觉判断的门槛——该门槛应与命令、文件状态或数量相关。上面的步骤完成报告格式就是实现这一点的载体。强有力的标准能够阻止智能体过早宣布成功。
- **对非通用材料进行渐进式披露。** 任何特定于分支、篇幅较长或并非每次运行都需要的内容，都应放入 `references/`，并通过一行指针引用——这样可以降低上下文负载，并使 SKILL.md 保持在上限以内。与步骤对应的做法是**逐步委派上下文**：可委派步骤应指明其工作者需要的 `references/` 片段，并将该片段作为工作者的 `Input` 传递过去，从而使主智能体无需持有整个目录树（`references/subagent-patterns.md` → _逐步委派上下文_，其中还说明了何时不值得提取该片段）。
- **引导性术语。** 为重复出现的概念命名一次，使用简短且承载意义的术语（“原子提交”“故障软化”“可发布状态”），并重复使用该术语，而不是每次出现时都重新解释。
- **精简检查——完成前执行。** 明确执行一次检查，删去重复内容、过时沉积、无必要的扩张以及无实际作用的指令（“要小心”“运用良好判断”）。这一步最常将技能创建者编写的技能，与仍需要 `skill-auto-improver` 处理的技能区分开来。

完成前，**逐项检查全部 7 个评分标准**（上面的四个机制，以及调用选择、分支映射和可发布状态），并将结果作为技能编写步骤完成报告中的 `Predictability pass` 行输出。这样可以让评分标准检查过程显式可见，而不是悄然完成——出现 `×` 表示发布前需要修复，并不表示流程被阻塞。

`skill-auto-improver` 仍然是用于修复_外部编写_或_旧版_技能的工具，而不是通过此路径创建的技能所必需的第二阶段。

### 对抗性审查（评估前必须执行）

起草上下文无法审查自己的草稿——它会凭记忆填补所有空白，而不是根据页面内容进行审查。完成评分标准检查后，使用草稿技能以及 `references/validation-prompts.md` 的第 1–3 阶段（发现、逻辑检查、边界情况攻击）启动一个**全新的子代理**；该子代理会返回触发遗漏、含义模糊的步骤以及会导致失败的提示。在运行评估前，修复真正的问题；其余问题纳入测试集。如果没有可用的 Agent 工具，请在新会话中自行运行这些阶段（参见 `references/environment-modes.md`）。

## 运行和评估测试用例

阅读 `references/eval-loop.md`，了解完整的 5 步流程（启动运行、起草断言、记录计时、评分/聚合/查看、读取反馈）。其中介绍了带技能 + 基线子代理模式、`eval_metadata.json` 和 `timing.json` 格式、`generate_review.py` 的调用方式，以及如何读取 `feedback.json`。

不要使用 `/skill-test` 或任何其他测试技能——`references/eval-loop.md` 中的流程才是此技能所要求的流程。

## 改进现有技能

这是顶部入口路径区块中的**路径 B**。阅读 `references/improving-existing.md`，并根据用户的请求选择子路径——它们的起始步骤并不相同。

- **子路径 B1——改造以符合标准。**“更新此技能以符合标准”“修复此技能”“审查并改进”。这是机械式的一致性调整，而不是行为重新设计：阅读目录，运行 `quick_validate.py`，运行 Frontmatter Audit，根据上述标准检查正文，修复问题或报告问题，递增 `metadata.version`，重新验证。**不要就用途、触发条件或输出格式询问用户**——这些内容已经编码在 SKILL.md 中。无需运行评估。
- **子路径 B2——根据评估反馈进行迭代。**用户已有评估结果或希望运行评估。起始步骤是**评估循环**，而不是访谈：先检查 `evals/misfires.jsonl`，然后检查结果和 `feedback.json`，根据 `references/iteration.md` 进行修订，同时审查 frontmatter，递增版本号，将评估重新运行到新的 `iteration-<N+1>/` 目录中。

## 描述优化

description 字段是决定 Claude 是否调用某项技能的主要机制。创建或改进技能后，主动提出优化 description，以提高触发准确性。

阅读 `references/description-optimization.md`，了解完整的 4 步流程：生成触发评估查询，使用 HTML 模板与用户审查，通过 `run_loop.py` 运行优化循环，应用最佳 description。

### 打包并呈现（仅当 `present_files` 工具可用时）

如果 `present_files` 工具可用（否则跳过），请打包技能并呈现生成的 `.skill` 文件路径，以便用户安装：

```bash
python -m scripts.package_skill <path/to/skill-folder>
```

## 特定环境说明

如果你使用的是 Claude.ai（没有子代理）或 Cowork（有子代理但没有浏览器），某些机制会有所不同。请阅读 `references/environment-modes.md`，了解经过调整的流程。核心循环（起草 → 测试 → 审查 → 改进）在所有环境中都相同——只有执行机制会发生变化。

---

## 参考文件

`agents/` 中存放着专用子代理的指令——启动相应子代理时，请阅读对应文件：

- `agents/grader.md` — 根据输出评估断言
- `agents/comparator.md` — 对两个输出进行盲测 A/B 比较
- `agents/analyzer.md` — 分析某个版本胜出的原因

`references/` 中存放着本 SKILL.md 链接到的材料：

| 文件                          | 内容                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| `frontmatter-rules.md`        | 版本管理、YAML 安全性、Frontmatter 审计（必需）                                           |
| `dependency-preflight.md`     | 何时需要进行预检门禁、门禁名称以及要生成的模板（必需）                                    |
| `predictability-rubric.md`    | 新 skill 必须通过构造满足的 7 项可预测性标准                                               |
| `intent-interview.md`         | 路径 A 开场：是否应该存在的门禁、7 个问题、研究、分支映射                                 |
| `improving-existing.md`       | 路径 B：子路径 B1 的改造流程以及子路径 B2 的评估反馈流程                                   |
| `description-guide.md`        | 强势 + 负向触发描述模式，每个分支一个触发条件，长度预算                                    |
| `exemplars.md`                | 三个带注释的示例 skill（工作流、知识、编排器），供仿照                                      |
| `writing-guide.md`            | 结构、渐进式披露、写作与工作流模式、错误消息、测试用例                                    |
| `schemas.md`                  | `evals.json`、`misfires.jsonl`、`grading.json` 等的 JSON 结构                              |
| `subagent-patterns.md`        | 何时以及如何使用 Agent 工具，包括逐步上下文委派以及何时跳过该工具                          |
| `validation-prompts.md`       | 4 个验证阶段；第 1–3 阶段用于编写强制性的对抗性审查脚本                                   |
| `eval-loop.md`                | 完整的 5 步评估运行 / 评分 / 查看器流程                                                     |
| `iteration.md`                | 根据反馈改进 skill 的原则；盲测比较                                                         |
| `description-optimization.md` | 4 步描述调优工作流                                                                         |
| `environment-modes.md`        | Claude.ai 和 Cowork 专用的调整                                                              |
| `readme-template.md`          | `docs/README.md` 的 AI 跳过提示、模板和规则                                                  |
| `run-stats.md`                | 运行统计字段定义以及开始时间纪元捕获命令                                                     |

---

在任何任务列表中，都要包含“创建 evals JSON 并运行 `eval-viewer/generate_review.py` 供人工审查”——尤其是在 Cowork 中，因为很容易跳过这一步。