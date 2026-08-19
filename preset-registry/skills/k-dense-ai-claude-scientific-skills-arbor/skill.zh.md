---
name: arbor
description: Autonomously improve a real artifact (code, training recipe, agent harness, data pipeline, prompt) against an objective and an evaluator, using Hypothesis Tree Refinement (HTR) from the Arbor paper. Use this whenever someone wants to iteratively optimize something over many experiments without overfitting — e.g. "get my model's eval score up", "improve this agent/harness", "tune this pipeline", "beat the baseline on this benchmark", "run a search over approaches and keep the best", "do an MLE-bench / Kaggle-style optimization", or any long-horizon "make this artifact better and don't just memorize the dev set" task. Trigger it even when the user doesn't say "Arbor" or "hypothesis tree" but describes repeated experiment-and-evaluate loops, branching exploration of competing ideas, or worries about a dev/test gap. Runs Claude itself as the coordinator with subagent executors in isolated git worktrees; for the standalone `arbor` CLI tool see references/arbor-upstream.md.
allowed-tools: Read Write Edit Bash Agent
license: MIT license
metadata:
  version: "1.1"
  skill-author: K-Dense Inc.
---
# Arbor — 通过假设树精炼实现自主优化

## 概述

此技能运行一个**自主优化（AO）**循环：从现有成果和可度量的目标出发，通过多轮实验与评估不断改进它——无需人类逐步监督，也不会对反馈信号过拟合。当瓶颈不在于完成一次出色的修改，而在于*组织数十次试验*，让经验不断积累而不是转瞬即逝时，这正是合适的工具。

它实现了来自 *Arbor*（Jin 等，2026）的**假设树精炼（HTR）**。其核心思想是：将研究状态保存在持久化的**假设树**中，而不是对话历史中。每个节点都关联一个假设、由此产生的提炼洞见，以及指向实现该假设的成果版本的指针。你扮演长期存在的**协调器**，负责维护这棵树并决定搜索方向；短生命周期的**执行器**子代理则各自在隔离的 git 工作树中测试一个假设，并汇报结果。只有当一项修改在搜索过程中从未针对其进行优化的*测试*评估器上取得改进时，**留出合并门（held-out merge gate）**才会接纳它。这正是将试错转变为可累积、可审计研究的关键。

使用 `scripts/tree.py` 状态管理器完成所有记录工作（创建节点、写入证据、传播洞见、剪枝、合并门、Observe 投影）。它能保持状态一致，让你可以将精力投入到判断证据*意味着什么*上。

## 何时使用此技能

当任务是**在评估器约束下对具体成果进行迭代改进**时，可以使用 Arbor：
- 模型训练：修改优化器、架构或训练方案，以降低损失，或用更少的步数达到目标。
- Harness/代理工程：提升代理循环、搜索 harness 或工具调用脚手架的通过率或准确率。
- 数据合成：改进生成/过滤流水线，根据下游模型的行为进行评估。
- 基准测试优化：MLE-bench / Kaggle 风格的“改进提交结果”任务。
- 提示词/系统优化：可以对输出进行自动评分的场景。

其判别信号是：存在一个**可以修改的成果**、一个**目标**、一种**对候选方案进行评分的方法**，并且预计会运行**许多实验**。如果用户只想要一次性修复或单次答案，这属于过度设计——直接完成工作即可。如果用户想要没有评估器的开放式构思，则应改用 `hypothesis-generation` 或 `scientific-brainstorming`。

## AO 设置——先明确这些内容

在进行任何实验之前，先确定任务元组 `(M_0, O, E_dev, E_test)`。正确完成这一步比之后的任何决定都更重要，因此务必明确确认：

- **M_0 — 初始材料**：要改进的成果（一个仓库、脚本、配置或提示词）。确保它受 git 管理并且当前可以运行。
- **O — 目标**：自然语言目标以及指标的方向（最大化准确率？最小化损失/步数？）。
- **E_dev — 开发评估器**：可以在搜索期间自由运行、用于对候选方案评分的命令。它应当快速且可重复。
- **E_test — 留出测试评估器**：一个*独立的*评估器（使用不同随机种子、不同数据划分或更大规模的运行），仅用于合并门。它不得被用作搜索的指引——这正是整个方法的核心。

如果用户尚未为你提供明确的开发/测试划分，**请自行构建并说明这一点**。开发/测试分离是捕捉过拟合的机制：某个候选方案在开发集上胜出、却未能在测试集上胜出，并不代表成功，而是表明你正在利用反馈信号。没有它，自主搜索必然会过拟合。

初始化运行：

```bash
python scripts/tree.py init \
  --objective "Improve BrowseComp answer accuracy on the search harness" \
  --dev-eval "python eval.py --split dev --n 50" \
  --test-eval "python eval.py --split test --n 300" \
  --material "." --metric-direction max --branching 3 --max-depth 2 --budget 12
```

`--branching` 是指你为每个父节点提出的同级假设数量；`--max-depth 2` 将方向保持在深度 1、将具体干预措施保持在深度 2（论文中的默认设置）；`--budget` 是协调器循环的次数。开始时保持较小规模（10–20 个循环）——结构化搜索优于暴力搜索，如果仍在持续取得进展，你可以再扩展。

## 协调器循环

你需要重复执行由六个步骤组成的循环。这是 HTR 的核心；不要将其压缩为临时性的编辑。每个循环运行一次 `python scripts/tree.py cycle`，以跟踪预算。

### 1. 观察
每个循环都应先在树中重新建立依据，而不是依赖你对对话的记忆：

```bash
python scripts/tree.py observe
```

这会输出目标、全局洞见、活跃前沿（可选择的假设）、已执行节点及其证据、已剪枝的经验教训（负面约束），以及当前最佳产物。将树视为事实来源，正是让你在长时间运行中保持一致性的关键——即使上下文压缩已经丢弃了细节。

### 2. 构思
选择一个有前景的父节点，并在其下提出几个子假设。**以树中的证据为条件**——这是 Arbor 与随机搜索的区别：
- 已验证的洞见是你可以据以构建的假设。
- 已剪枝节点是应当避免的死路。
- “部分正确”的结果是*形成更尖锐假设的起点*，而不是放弃该方向的理由。

每个假设都应是关于改变产物将如何影响指标的**可证伪主张**，而不是模糊的意图。深度 1 节点是宽泛方向（“搜索工具丢失了它已经检索到的正确答案”）；深度 2 节点是具体、可执行的干预措施（“运行 K=5 个独立 rollout，并按证据档案聚合，而非采用多数投票”）。

```bash
python scripts/tree.py add-node --parent n0 --hypothesis "Verification, not retrieval, is the bottleneck: candidates are found but discarded"
python scripts/tree.py add-node --parent n4 --hypothesis "Decompose the question into atomic constraints and verify each independently"
```

### 3. 选择
选择接下来要运行哪些待处理的叶节点。**选择并非纯粹的分数最大化**——选择一个假设，可能是因为它具有强有力的先验证据，可能是因为它能够解决其同级节点暴露出的某个歧义，也可能是因为它的失败能够澄清某项重要假设。在反馈延迟的情况下，前沿控制奖励的是信息量大的实验，而不只是看似有前景的实验。

### 4. 调度
将每个选中的假设作为**在隔离工作树中运行的执行器子代理**来执行（使用 Agent 工具并设置 `isolation: "worktree"`，或让执行器通过 `git worktree add` 创建工作树）。隔离至关重要：并行实验不能相互覆盖，也不能覆盖当前最佳方案；探索性改动必须保持隔离，直至通过合并门槛。

当同级节点彼此独立时，**并行**调度它们（在一条消息中发起多个 Agent 调用）——同一方向内的比较性证据，正是后续剪枝与抽象得以实现的基础。

为每个执行器提供一份简洁且**受假设约束**的任务说明。完整模板请参阅 `references/executor-brief.md`。使 HTR 能够运作的约定是：**当指标停滞时，执行器不得更改假设。**它可以修复自己的代码并重新运行，但 `h_n` 是固定的——否则返回的分数不再是关于所分配节点的证据，树的语义也会失效。执行器恰好返回四项内容：
- **dev_score** — 开发集评估器结果（用于选择）；
- **result** — 对实际发生情况的事实性总结；
- **insight** — 提炼出的、可复用的经验（结果*为何*支持、削弱或界定该假设）；
- **branch_ref** — 保存产物的 git 分支/提交/工作树路径。

在调度前将节点标记为 `running`（`tree.py set-status --node n5 --status running`），以确保 Observe 投影保持准确。

### 5. 反向传播
当执行器返回时，将其报告写入节点，然后**向上抽象经验**：

```bash
python scripts/tree.py set-evidence --node n5 --dev-score 70.0 \
  --result "K=5 dossier aggregation recovers answers in minority rollouts" \
  --insight "Correct answers often appear in a minority of rollouts; aggregation beats majority vote" \
  --branch-ref "wt/n5"

python scripts/tree.py propagate --node n5 \
  --insight "Candidate coverage, not verification, limits this direction" --to-root
```

这一步使树不止是一份日志。叶节点层面的观察（“数据接口不匹配”）应当成为方向层面的约束；如果它具有普适性，还应成为塑造未来构思的全局先验。**经验传播是驱动 HTR 大部分收益的组件**——在论文的 MLE-Bench Lite 消融实验中，*没有*经验反馈的树，其得分甚至低于完全没有树的扁平实验队列（任何奖牌比例为 54.5% 对 63.6%，而完整系统为 81.8%）。仅有层级结构并不足够：重要的是语义记忆。因此，请认真思考抽象过程；不要只是逐字将叶节点经验向上传递。

### 6. 决策
根据新证据决定下一步：继续扩展某个方向、剪除被证伪的子树，或尝试合并某个候选方案。

- **剪枝**无效路径，并记录*原因*——该原因会成为负向约束：
  ```bash
  python scripts/tree.py prune --node n7 --reason "search-augmented judge overfits dev questions; no test transfer"
  ```
- **合并门槛**——仅当候选方案在 `E_test` 上有所提升时，才将其提升为新的最佳方案。在一个*全新*工作树中运行测试评估器（而非开发集工作树，以避免泄漏），然后：
  ```bash
  python scripts/tree.py merge --node n5 --test-score 67.67 --branch-ref "wt/n5"
  ```
  如果门槛拒绝它，这同样具有信息价值：一个开发集分数高、测试集分数低的候选方案，表明该方向可能是在利用开发集信号，而非产生可迁移的改进。记录这一经验；不要仍然悄悄将其提升。

重复此过程，直到预算耗尽、前沿节点全部探索完毕，或进展已明显停滞。

## 完成本轮运行

停止时，生成一份简短报告（参见 `references/report-template.md`），涵盖：
- 最终的最佳制品、其测试得分，以及相对于 `M_0` 的增量；
- 树（`python scripts/tree.py status`），作为所有尝试的审计轨迹；
- 主要假设的变化——任务理解如何在运行过程中不断深入（早期节点测试广泛的机制；后期节点发现这些机制的局限；祖先节点的洞见将这些内容压缩为最终设计背后的约束）；
- 已合并与已探索：许多节点提升了开发集表现，但通过测试门槛的节点要少得多——如实报告这一差距，不要夸大开发集上的胜利。

始终将 `M_best` 保留为一个真实可运行的制品，并放在一个命名分支上，同时告知用户如何检出该分支。

## 让这一方法奏效的原则（而非死板的规则）

这些原则来自论文中的分析；理解其背后的*原因*比机械地遵循它们更重要。

- **树才是记忆；对话不是。** 在较长的运行过程中，你的上下文会被压缩。每个周期都要重新观察（Re-Observe），让决策建立在持久的证据之上，而不是有损的摘要之上。
- **进行结构化搜索，而不是更多采样。** Arbor 的收益来自预算的*组织方式*——维护相互竞争的假设、比较兄弟节点、传承经验——而不是投入更多 token。不要漫无目的地扩展分支；每个实验都应基于树中已有的信息来设计。
- **开发集负责引导，测试集负责准入。** 可以充分利用开发集反馈来引导探索，但未经测试集确认，绝不能将开发集上的胜出方案纳入最终制品。开发集与测试集之间的不一致本身就是值得解读的信号。
- **执行器受假设约束。** 本地工程上的灵活性（编辑、调试、重新运行）没有问题；但不能为了追逐更好的数值而悄悄改变假设——这会破坏证据的意义。
- **失败是约束，而不是噪声。** 被证伪的假设会告诉你解决方案必须避开什么。带有理由的剪枝比剪枝后遗忘更有价值。

## 参考文件

- `references/htr-methodology.md` — 对 HTR、节点结构、六个步骤以及论文实证经验（消融实验、迁移、成本）的深入解释。在需要了解某项设计选择背后的原理时阅读。
- `references/executor-brief.md` — 交给每个执行器子代理的任务说明模板。
- `references/report-template.md` — 最终报告的结构。
- `references/arbor-upstream.md` — 如何安装和运行 RUC-NLPIR/Arbor 提供的独立 `arbor` CLI，而不是在本地原生编排它，以及何时优先选择这两种方式中的某一种。