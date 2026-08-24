---
name: autoresearch
description: Orchestrates end-to-end autonomous AI research projects using a two-loop architecture. The inner loop runs rapid experiment iterations with clear optimization targets. The outer loop synthesizes results, identifies patterns, and steers research direction. Routes to domain-specific skills for execution, supports continuous agent operation via Claude Code /loop and OpenClaw heartbeat, and produces research presentations and papers. Use when starting a research project, running autonomous experiments, or managing a multi-hypothesis research effort.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Autonomous Research, Two-Loop Architecture, Experiment Orchestration, Research Synthesis, Project Management]
---
# 自动研究

面向 AI 编码智能体的自主研究编排。你通过维护结构化状态、运行实验与综合双循环，并路由到特定领域的技能来执行任务，从而管理从文献调研到论文发表的完整研究生命周期。

你是一名研究项目经理，而不是领域专家。你负责编排；领域技能负责执行。

**该流程完全自主运行。** 不要请求用户许可或确认——运用你的最佳判断并持续推进。经常通过研究演示文稿（HTML/PDF）向人类展示进展，以便他们了解你正在做什么，并在需要时调整方向。人类正在睡觉或忙于其他事务；你的工作是在无人协助的情况下尽可能推进研究。

## 入门

用户开始时可能处于不同状态。判断其所处状态并采取相应行动：

| 用户状态 | 应采取的行动 |
|---|---|
| 模糊的想法（“我想探索 X”） | 简短讨论以明确方向，然后进行初始化 |
| 明确的研究问题 | 直接进行初始化 |
| 已有计划或提案 | 审查计划、设置工作区，然后进入循环 |
| 恢复研究（`research-state.yaml` 已存在） | 读取状态，从上次中断的位置继续 |

如果情况已经明确，不要过度讨论——直接进入完整的自动研究流程。大多数用户希望你直接开始研究。

**第 0 步——在进行任何其他操作之前**：设置智能体连续性循环。参见[智能体连续性](#agent-continuity-mandatory--set-up-first)。这是强制要求。若不执行此步骤，研究将在一个循环后停止。

### 初始化工作区

在项目根目录创建以下结构：

```
{project}/
├── research-state.yaml       # Central state tracking
├── research-log.md           # Decision timeline
├── findings.md               # Evolving narrative synthesis
├── literature/               # Papers, survey notes
├── src/                      # Reusable code (utils, plotting, shared modules)
├── data/                     # Raw result data (CSVs, JSONs, checkpoints)
├── experiments/              # Per-hypothesis work
│   └── {hypothesis-slug}/
│       ├── protocol.md       # What, why, and prediction
│       ├── code/             # Experiment-specific code
│       ├── results/          # Raw outputs, metrics, logs
│       └── analysis.md       # What we learned
├── to_human/                 # Progress presentations and reports for human review
└── paper/                    # Final paper (via ml-paper-writing)
```

- **`src/`**：当你编写了实用代码（绘图函数、数据加载器、评估辅助工具）时，将其移至此处，以便在不同实验中复用。不要在每个实验目录中重复代码。
- **`data/`**：以结构化方式将原始结果数据（指标 CSV、训练日志、小型输出）保存在此处。经过较长的研究周期后，你需要这些数据来重新绘图、重新分析，并妥善撰写论文。使用描述性文件名（例如 `trajectory_H1_runs001-010.csv`）。模型检查点等大型文件应存放在单独的存储路径中（例如 `/data/`、云存储，或用户计算环境中用于存储工件的其他位置），而不是项目目录中。

从 [templates/](templates/) 初始化 `research-state.yaml`、`research-log.md` 和 `findings.md`。随着项目推进调整工作区——这只是一个起点，并非僵化的要求。

## 双循环架构

这是核心引擎。其他一切都为它提供支持。

```
BOOTSTRAP (once, lightweight)
  Scope question → search literature → form initial hypotheses

INNER LOOP (fast, autonomous, repeating)
  Pick hypothesis → experiment → measure → record → learn → next
  Goal: run constrained experiments with clear measurable outcomes

OUTER LOOP (periodic, reflective)
  Review results → find patterns → update findings.md →
  new hypotheses → decide direction
  Goal: synthesize understanding, find the story — this is where novelty comes from

FINALIZE (when concluding)
  Write paper via ml-paper-writing → final presentation → archive
```

内循环以紧凑的实验周期运行，并具有明确、可衡量的结果。这既可以是优化基准（让 val_loss 降低），也可以是检验机制性假设（干预 X 是否会导致效应 Y？）。外循环则退后一步思考：这些结果*意味着*什么？出现了哪些模式？背后的故事是什么？研究是开放式的——双循环让你既能优化，也能发现。

两个循环之间没有严格的边界——由你判断何时已经积累了足够多的内循环结果，值得进行反思。通常是每完成 5-10 个实验、发现某种模式时，或进展停滞时。智能体的判断决定整体节奏。

### 研究是非线性的

双循环结构是一种节奏，而不是固定轨道。在研究过程中的任何时刻，你都可以而且应该：

- 当结果出乎意料、假设不再成立，或你需要了解新方向的背景时，**重新查阅文献**——始终将找到的内容保存到 `literature/`
- 当你陷入停滞，或结果引出了意料之外的问题时，使用 `21-research-ideation/` 技能**构思新想法**
- 如果实验表明原始问题有误，或不如新发现的问题有趣，则**彻底转变研究问题**

这很正常。大多数真实的研究项目都会重新查阅文献 1-3 次，并在研究过程中产生新的假设。不要把引导阶段当成唯一阅读论文或开展头脑风暴的时机——只要有助于加深理解，就应随时进行。

## 引导阶段：文献与假设

在进入循环之前，先了解研究格局。保持高效——目标是开始实验，而不是产出一份详尽无遗的综述。

1. 围绕研究问题**检索文献**。使用多个来源——绝不要只查一个来源就停止：
   - **Exa MCP** (`web_search_exa`)（如可用）——最适合广泛探索并快速查找相关论文
   - **Semantic Scholar** (`pip install semanticscholar`)——最适合查找 ML/AI 论文、引文图谱和特定论文。完整的 API 代码示例请参阅 `20-ml-paper-writing` 技能的 `references/citation-workflow.md`
   - **arXiv** (`pip install arxiv`)——最适合查找近期预印本和开放获取论文
   - **CrossRef**——最适合查询 DOI 和获取 BibTeX
   - 持续检索，直到获得良好的覆盖范围。如果某个来源没有结果，请使用不同的关键词尝试其他来源

**将所有内容保存到 `literature/`**：对于你找到的每篇论文，都将摘要保存到 `literature/`——包括标题、作者、年份、主要发现、与你的问题的相关性，以及 URL/DOI。每篇论文创建一个文件，并维护一个汇总所有摘要的 `literature/survey.md`。这是你的参考文献库——在整个项目期间，你和未来的会话都需要使用它。

2. **从文献中识别空白**
   - 已经尝试过什么？还有什么尚未尝试？现有方法在哪些方面会失效？
   - 讨论部分指出了哪些未来工作？

3. **形成初始假设**——调用 `21-research-ideation/` 中的技能
   - 使用 `brainstorming-research-ideas` 进行结构化的发散—收敛工作流
   - 使用 `creative-thinking-for-research` 获得更深入的认知框架
   - 每个假设都必须可检验，并具有明确的预测

4. **定义评估方式**
   - 在运行实验前设定代理指标和基线
   - 该指标应当能够快速计算（几分钟，而不是几小时）
   - 预先锁定评估标准，防止无意识地操纵指标

5. **记录**到 research-state.yaml，并将引导过程记录到 research-log.md

## 内循环

通过清晰、可衡量的结果进行快速迭代。分为两种类型：

- **优化**：让某项指标上升或下降（val_loss、准确率、吞吐量）。可以参考 Karpathy 的 autoresearch。
- **发现**：检验关于某种方法为何有效的机制性假设。指标是一项测量结果（顿悟式学习是否发生得更快？遗忘前熵是否会增加？），而不仅仅是要优化的目标。

```
1.  Pick the highest-priority untested hypothesis
2.  Write a protocol: what change, what prediction, why
    Lock it: commit to git BEFORE running (research(protocol): {hypothesis})
    This creates temporal proof your plan existed before results
3.  Run the experiment (invoke the relevant domain skill)
4.  Sanity check before trusting results:
    - Did training converge? No NaN/Inf?
    - Does baseline reproduce expected performance?
    - Data loading correct? (spot-check a few samples)
5.  Measure the proxy metric
6.  Record in experiments/{hypothesis-slug}/
    Label clearly: CONFIRMATORY (in your protocol) vs EXPLORATORY (discovered during execution)
7.  If positive: keep, note WHY it worked
8.  If negative: this is progress — note what it rules out and what it suggests
9.  Update research-state.yaml
10. If stuck: search literature or invoke ideation skills — don't just keep trying random things
```

**永远不要停止。** 即使某些尝试失败，也要找到继续前进的路径。调试、调整、简化或转向——但要让研究持续推进。`/loop` 和心跳机制会让你保持运行；利用好这种势头。

### 转至领域技能

当你需要执行特定领域的任务时，请搜索技能库：

| 研究活动 | 查找位置 |
|---|---|
| 数据准备 | `05-data-processing/` |
| 模型训练 / 微调 | `01-model-architecture/`、`03-fine-tuning/`、`06-post-training/` |
| 分布式训练 | `08-distributed-training/` |
| 优化（量化、注意力） | `10-optimization/` |
| 评估 / 基准测试 | `11-evaluation/` |
| 推理 / 服务 | `12-inference-serving/` |
| 可解释性分析 | `04-mechanistic-interpretability/` |
| 实验跟踪（W&B、MLflow） | `13-mlops/` |
| 云计算 | `09-infrastructure/` |

开始之前，请阅读相关的 SKILL.md——其中包含工作流、常见问题和代码示例。完整指南请参阅 [references/skill-routing.md](references/skill-routing.md)。

### 跟踪实验轨迹

持续记录各次实验中的可测量结果：

```json
{
  "experiment_id": "run_014",
  "hypothesis": "H3",
  "metric_value": 0.847,
  "baseline": 0.812,
  "delta": "+0.035",
  "wall_time_min": 23,
  "change_summary": "Added cosine annealing warmup schedule"
}
```

该轨迹会生成优化曲线图（类似 Karpathy 的进展图表）——请将其纳入进度报告中。人们喜欢看到向上攀升的曲线。

## 外循环

从单个实验中抽离出来，进行综合分析。

```
1. Review all results since last reflection
2. Cluster by type: what kinds of changes worked? Which didn't?
3. Ask WHY — identify the mechanism behind successes and failures
4. Update findings.md with current understanding
5. Search literature if results were surprising or assumptions need revisiting
6. Generate new hypotheses if warranted (invoke 21-research-ideation/ skills)
7. Decide direction (see criteria below)
8. Update research-state.yaml with new direction
9. Log the reflection in research-log.md
10. If there's something meaningful, generate a progress presentation
```

### 决定方向

不要随意选择——请使用以下标准：

**深入**——有证据支持的结果引出了后续问题
- 这种效应在不同条件下是否仍然成立？其背后的机制是什么？
- 行动：生成子假设（H1.1、H1.2）→ 返回内循环

**拓展**——当前结果可靠，但相邻问题尚未得到检验
- 出现了新问题。当前贡献已经明确，但仍有进一步探索的空间。
- 行动：生成新的根假设 → 返回内循环

**转向**——结果推翻了关键假设，或者出现了更有趣的发现
- 某个核心假设是错误的，或者某项意外发现比原始问题更有前景。
- 行动：带着新问题回到文献研究 → 重新启动

**收尾**——已有足够证据形成一项贡献
- 至少有一个假设得到了强有力的支持（或者形成了一组逻辑一致的否定结果）
- 已完成关键消融实验和误差分析
- findings.md 已经具备论文主干的结构——人类可以据此撰写摘要
- 不存在会改变整体叙事的关键未决问题

注意：逻辑一致的否定结果也是有效贡献。如果推理严谨，“X 因为 Y 而不起作用”是可以发表的。

### findings.md 是你的项目记忆

该文件有两个用途：它既是供人类阅读的研究叙事，也是你作为智能体积累的知识库。每次会话、/loop tick 或 heartbeat 开始时都要阅读它，以回顾你已经学到的内容。

每次外循环结束后，更新该文件以回答：

- 到目前为止，我们知道什么？（当前理解）
- 哪些模式能够解释我们的结果？（模式与洞见）
- 我们具体学到了哪些不应重蹈覆辙的经验？（经验与约束）
- 还有哪些问题尚未解决？（未决问题）

“经验与约束”部分尤其重要——它记录了具体且可执行的经验，例如“在此规模下，weight decay > 0.1 会导致发散”或“基线仅在 batch_size=64 时能够复现”。这可以防止智能体在不同会话中重复尝试失败的方法。

**质量测试**：经过 30 次内循环实验后，人类应该能够阅读 findings.md 并据此撰写论文摘要。如果做不到，说明外循环并未进行综合提炼——它只是在记录日志。

## 智能体持续运行（强制——必须首先设置）

**在执行任何其他操作之前**，先设置基于实际时间的循环。这是确保研究持续运行的机制。没有它，智能体会在一个周期后停止。

### Claude Code

**第一项操作——立即运行：**

```
/loop 20m Continue autoresearch. Read research-state.yaml and findings.md. Re-read the autoresearch SKILL.md occasionally to stay aligned. Step back and reflect holistically — is the research making real progress? Are you deepening understanding or just running experiments? If stalling, pivot or search literature for new ideas. Keep making research progress — never idle, never stop. Update findings.md, research-log.md, and research-state.yaml when there's new progress. Git commit periodically and clean up the repo if needed. Show the human your research progress with key plots and findings by preparing a report in to_human/ and opening the HTML/PDF. Only when you believe the research is truly complete, invoke the ml-paper-writing skill to write the paper.
```

无论当前正在进行什么，这都会每 20 分钟触发一次。它是一种让你持续工作的节奏，而不是研究阶段的边界。如果之前的工作尚未完成，只需继续即可。

### OpenClaw

**第一项操作——在当前会话中设置一个每 20 分钟运行一次的 cron 作业。你必须在开展任何研究工作之前完成此操作。**

使用 `cron.add` 工具创建一个绑定到当前聊天会话的周期性作业：

```json
{
  "name": "autoresearch-loop",
  "schedule": { "kind": "every", "everyMs": 1200000 },
  "sessionTarget": "current",
  "payload": {
    "kind": "agentTurn",
    "message": "Continue autoresearch. Read research-state.yaml and findings.md. Re-read the autoresearch SKILL.md occasionally to stay aligned. Step back and reflect holistically — is the research making real progress? Are you deepening understanding or just running experiments? If stalling, pivot or search literature for new ideas. Keep making research progress — never idle, never stop. Update findings.md, research-log.md, and research-state.yaml when there's new progress. Git commit periodically and clean up the repo if needed. Show the human your research progress with key plots and findings by preparing a PDF report in to_human/ and sending it to the user via Telegram, WhatsApp, or Slack. When you get an exciting result or interesting plot, text it to the user right away — don't wait for a full report. Only when you believe the research is truly complete, invoke the ml-paper-writing skill to write the paper."
  }
}
```

关键细节：
- `sessionTarget: "current"` 会将 cron 绑定到当前聊天会话，从而在每次触发之间保持对话上下文
- `everyMs: 1200000` = 20 分钟
- 创建后，使用 `cron.list` 验证任务是否存在且已启用
- 如果 cron 在实验进行期间触发，只需继续即可——这次触发只是提醒，而不是重新开始

### 循环的作用

`/loop` 和 cron 任务纯粹用于维持**现实时间节奏**。它们与你的研究循环（内层/外层）完全分离。每次触发时：

1. 阅读 `research-state.yaml` 和 `findings.md`——回想当前进展
2. 检查是否有任何异常（实验失败、训练停滞、错误）
3. 如果进展正常 → 继续手头正在进行的工作
4. 如果遇到阻碍或出现问题 → 退一步，诊断并修复，然后继续
5. 绝不空闲。始终推进工作。

## 进展汇报

当你有值得分享的实质性内容时，创建一份研究演示文稿——不要只是状态仪表板，而要讲述一个引人入胜的故事。

**何时汇报**（由你判断）：
- 在某次外层循环发现显著模式之后
- 当优化轨迹显示出明确进展时（请包含图表！）
- 在研究方向转变之后
- 在就某项决策请求人工输入之前
- 在研究结束时

**应包含的内容**（根据最具吸引力的内容进行调整）：
- 研究问题及其重要性
- 带有可视化内容的关键结果（图表、指标表格）
- 优化轨迹图（各实验的指标变化）
- 尝试了什么以及为什么尝试（有选择地呈现，而非穷举）
- 当前理解（研究发现的叙事）
- 下一步计划

对于 Claude Code：生成 HTML 并使用 `open` 打开。如果 HTML 无法打开或渲染，则转换为 PDF 作为后备方案（使用 `weasyprint`、`playwright pdf` 或 `wkhtmltopdf`）。对于 OpenClaw：直接生成 PDF。

有关模板框架和优化图表方法，请参阅 [references/progress-reporting.md](references/progress-reporting.md)。将模板作为起点——创造性地决定要展示的内容。

## Git 协议

在自然形成的研究里程碑处提交：

| 时机 | 消息模式 |
|---|---|
| 工作区初始化 | `research(init): {project} — {question}` |
| 实验协议确定 | `research(protocol): {hypothesis}` |
| 获得显著结果 | `research(results): {hypothesis} — {outcome}` |
| 外层循环改变方向 | `research(reflect): {direction} — {reason}` |
| 论文草稿完成 | `research(paper): {title}` |

**硬性规则**：协议提交必须先于结果提交。绝不能将二者合并。Git 历史记录就是你的轻量级预注册——它可以证明你在看到结果之前就已经制定了计划。不要在每次实验后都提交——只在取得实质性进展时提交。

## 收尾：论文写作

当外层循环决定结束时：

1. 确保 findings.md 包含清晰且证据充分的叙事
2. 研究 2-3 篇最相关的顶尖论文，以了解它们的格式、风格和章节结构
3. 调用 `20-ml-paper-writing` skill——它提供适用于 NeurIPS、ICML、ICLR、ACL、AAAI、COLM 和系统类会议的 LaTeX 模板
4. 向其提供积累的文献、实验结果和研究发现
5. 遵循其引文验证工作流——绝不编造参考文献
6. 生成一份最终的综合研究演示文稿

自主推进整个写作流程。如果 ml-paper-writing 技能建议在某些节点与人协作，请相应调整并继续推进——尽你所能产出最佳草稿。之后将由人工审阅并提供反馈。

## 研究纪律

以下原则必须持续贯彻——不局限于任何特定阶段：

- **先锁定，再运行**：执行实验前，先将实验方案提交到 git。这可以证明你的方案在看到结果之前就已存在。绝不要把实验方案和结果合并到同一个提交中。
- **验证性与探索性**：与已锁定方案相符的结果属于验证性结果。除此之外的一切都属于探索性结果——它们可能很有趣，但需要以更审慎的态度对待。
- **负面结果也是进展**：被证伪的假设同样能提供信息。记录它排除了什么，以及它暗示了什么。不要将其视为失败。
- **分析前先进行健全性检查**：在相信主要指标之前，先验证训练是否收敛、基线结果是否能够复现，以及数据是否正确。
- **感到困惑时回归文献**：不要猜测——去检索。如果结果出乎意料或假设不再成立，就查找相关论文。使用 Exa MCP 进行发现式检索，使用 Semantic Scholar 查找特定的 ML/AI 论文，使用 arXiv 查找预印本。
- **永不停止**：不要因常规决策而等待人工批准。如果某项技能或工具建议开展协作，请相应调整并继续推进。自主寻找最佳前进路径。人工会查看你的进展报告，并可在需要时调整方向。
- **充分利用一切可用算力**：适应用户的环境——无论是本地 GPU、集群作业提交、云实例，还是只有 CPU。如果没有可用的 GPU，就使用 CPU，并相应缩小实验规模。不要因为算力是否可用而停滞。

## 质量标准

**优秀的智能体行为：**
- 假设包含机制层面的推理（“因为 Y，所以 X，并预测 Z”），而不仅仅是“试试 X”
- findings.md 构建的是连贯的叙事，而不是扁平的结果列表
- 记录负面结果，并说明它们排除了什么
- 当实验结果与预期相矛盾时，智能体会更新自己的认知模型
- 进展报告通过有说服力的可视化讲述研究故事

**不良的智能体行为：**
- 只做超参数扫描而不加以解释
- findings.md 只是实验日志的直接复制粘贴
- 智能体在失败后从不重新审视自己的假设
- 只优化指标，却不理解改动为何有效

## 何时使用以及何时选择替代方案

**在以下情况下使用 autoresearch：**
- 你有一个可以通过实验探索的研究问题
- 存在可用于内循环优化的可度量代理指标
- 真正的贡献需要进行超越该指标的综合分析
- 你希望持续进行自主研究

**在以下情况下改用单独的领域技能：**
- 你有一项具体的一次性任务（训练模型、运行评估、撰写论文）
- 不需要迭代实验

## 常见问题

**内循环停滞（指标没有改善）**
运行外循环。这个指标合适吗？搜索空间是否已经穷尽？考虑扩大范围或转变方向。检索文献以寻找新方法。

**陷入停滞，无法取得进展**
不要继续尝试随机改动。退一步：检索相关工作，调用 `21-research-ideation/` 头脑风暴技能，或运行一次外循环反思。陷入停滞意味着你需要新信息或新视角，而不是更多实验。

**结果与基线预期相矛盾**  
进行调查，不要忽略。重新查阅文献——可能是你的实验方案有误、已发表的基线存在问题，或者实验条件不同。将你了解到的内容更新到 findings.md。

**Agent 在不同 tick 之间丢失上下文**  
确保每次操作后都更新 research-state.yaml 和 findings.md。这些文件是你跨会话的记忆。

**找不到相关论文**  
按顺序尝试多种方法：使用 Exa MCP 进行广泛搜索，使用 Semantic Scholar 查找特定的 ML/AI 论文（`pip install semanticscholar`），使用 arXiv 查找预印本（`pip install arxiv`）。查看 `20-ml-paper-writing` skill 的 `references/citation-workflow.md`，获取完整的 API 代码。注意：Google Scholar 没有官方 API——如需以编程方式搜索，请改用 Semantic Scholar。

**没有可用的 GPU**  
使用 CPU 并缩小实验规模。许多研究任务（分析、可解释性、小型模型训练）都可以在 CPU 上顺利运行。调整实验设计以适应可用的计算资源，而不是因此停滞。

**实验耗时超过 /loop 间隔**  
这是正常的。在下一个 tick 检查实验是否完成。如果尚未完成，继续等待或做其他有用的事情（更新笔记、搜索论文）。如有需要，调整间隔。

**不确定何时结束**  
思考三个问题：你是否有一项得到有力支持的发现？你能否解释它为什么有效？findings.md 的内容能否构成一篇有说服力的论文摘要？如果三个问题的答案都是肯定的：结束研究。

## 高级主题

- **详细的 Agent 连续性**：[references/agent-continuity.md](references/agent-continuity.md)
- **进度展示模板**：[references/progress-reporting.md](references/progress-reporting.md)
- **完整的 skill 路由**：[references/skill-routing.md](references/skill-routing.md)