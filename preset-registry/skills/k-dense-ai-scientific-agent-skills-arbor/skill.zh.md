---
name: arbor
description: Autonomously improve a real artifact (code, training recipe, agent harness, data pipeline, prompt) against an objective and an evaluator, using Hypothesis Tree Refinement (HTR) from the Arbor paper. Use this whenever someone wants to iteratively optimize something over many experiments without overfitting — e.g. "get my model's eval score up", "improve this agent/harness", "tune this pipeline", "beat the baseline on this benchmark", "run a search over approaches and keep the best", "do an MLE-bench / Kaggle-style optimization", or any long-horizon "make this artifact better and don't just memorize the dev set" task. Trigger it even when the user doesn't say "Arbor" or "hypothesis tree" but describes repeated experiment-and-evaluate loops, branching exploration of competing ideas, or worries about a dev/test gap. Runs Claude itself as the coordinator with subagent executors in isolated git worktrees; for the standalone `arbor` CLI tool see references/arbor-upstream.md.
allowed-tools: Read Write Edit Bash Agent
license: MIT license
metadata:
  version: "1.1"
  skill-author: K-Dense Inc.
---
# Arbor — 通过假设树细化实现自主优化

## 概述

此技能运行一个**自主优化（AO）**循环：从现有工件和可衡量的目标出发，通过多轮实验与评估进行改进——无需逐步人工监督，也不会对反馈信号过拟合。当瓶颈不在于写出一个好的改动，而在于*组织数十次试验*，让经验得以累积而非消散时，这就是合适的工具。

它实现了 *Arbor*（Jin 等，2026）中的**假设树细化（HTR）**。核心思想是：将研究状态保存在持久化的**假设树**中，而非对话历史中。每个节点绑定一个假设、它产出的提炼洞见，以及指向实现该假设的工件版本的指针。你扮演长期存续的**协调器**，负责维护这棵树并决定搜索方向；短生命周期的**执行器**子代理则在隔离的 git worktree 中各自测试一个假设，并汇报结果。只有当某项改动在搜索从未针对其优化过的*测试*评估器上获得改进时，**留出合并门控**才会接纳该改动。这正是将试错转化为可累积、可审计研究的关键。

使用 `scripts/tree.py` 状态管理器处理所有记录工作（创建节点、写入证据、传播洞见、剪枝、合并门控、Observe 投影）。它会保持状态一致，使你能够将判断力集中在证据*意味着什么*上。

## 何时使用此技能

当任务是**在评估器约束下迭代改进具体工件**时，使用 Arbor：
- 模型训练：修改优化器、架构或训练配方，以降低损失，或用更少步骤达到目标。
- Harness/代理工程：提高代理循环、搜索 harness 或工具使用脚手架的通过率或准确率。
- 数据合成：改进由下游模型行为评判的生成/过滤流水线。
- 基准优化：MLE-bench / Kaggle 风格的“改进提交结果”任务。
- 可自动对输出评分的提示词/系统优化。

其显著特征是：存在**可修改的工件**、一个**目标**、一种对候选方案进行**评分**的方法，并且预计会运行**大量实验**。如果用户只想要一次修复或一次性答案，这就大材小用——直接完成工作即可。如果他们想进行没有评估器的开放式创意构思，请改用 `hypothesis-generation` 或 `scientific-brainstorming`。

## AO 设置——首先明确这一点

在进行任何实验之前，确定任务元组 `(M_0, O, E_dev, E_test)`。正确完成这一点比之后的任何决策都更重要，因此请明确确认：

- **M_0 — 初始材料**：要改进的工件（仓库、脚本、配置、提示词）。确保它处于 git 管理之下，并且当前可以运行。
- **O — 目标**：自然语言目标以及指标的*方向*（最大化准确率？最小化损失/步数？）。
- **E_dev — 开发评估器**：可在搜索期间自由运行、用于为候选方案评分的命令。应当快速且可重复。
- **E_test — 留出测试评估器**：仅在合并门控时使用的*独立*评估器（不同随机种子、不同数据划分或更大规模的运行）。它绝不能被用作搜索预言机——这正是关键所在。

如果用户没有提供一个干净的开发集/测试集划分，**请构建一个，并明确说明这一点**。开发集/测试集分离机制用于捕捉过拟合：一个候选方案在开发集上胜出、但在测试集上没有胜出，这并不是成功，而是说明你正在利用反馈信号。如果没有这种分离，自主搜索必然会过拟合。

初始化运行：

```bash
python scripts/tree.py init \
  --objective "Improve BrowseComp answer accuracy on the search harness" \
  --dev-eval "python eval.py --split dev --n 50" \
  --test-eval "python eval.py --split test --n 300" \
  --material "." --metric-direction max --branching 3 --max-depth 2 --budget 12
```

`--branching` 表示你为每个父节点提出的同级假设数量；`--max-depth 2` 使方向位于第 1 层、具体干预位于第 2 层（论文中的默认设置）；`--budget` 表示协调器循环的次数。先从较小的数值开始（10–20 个循环）——结构化搜索胜过暴力搜索，如果进展仍在继续，可以再延长。

## 协调器循环

你需要重复执行由六个步骤组成的循环。这是 HTR 的核心；不要将其简化为临时编辑。每个循环运行一次 `python scripts/tree.py cycle`，以跟踪预算。

### 1. 观察
每个循环都应从重新确认树的状态开始，而不是依赖你对对话的记忆：

```bash
python scripts/tree.py observe
```

该命令会输出目标、全局洞见、活动前沿（可选择的假设）、包含证据的已执行节点、已剪枝的经验教训（负向约束），以及当前最佳产物。将树视为事实来源，才能在上下文压缩丢弃细节之后，于长时间运行中保持一致性。

### 2. 构思
选择一个有前景的父节点，并在其下提出几个子假设。**根据树中的证据进行条件化**——这正是 Arbor 与随机搜索的区别：
- 已验证的洞见是你可以据此构建的假设。
- 已剪枝的节点是应当避开的死胡同。
- “部分正确”的结果是*提出更精准假设的起点*，而不是放弃该方向的理由。

每个假设都应是一个**关于改变产物将如何影响指标的可证伪主张**，而不是模糊的意图。第 1 层节点是宽泛的方向（“搜索工具已经检索到正确答案，但丢弃了它们”）；第 2 层节点是具体、可执行的干预（“运行 K=5 次独立 rollout，并根据证据档案汇总，而不是采用多数投票”）。

```bash
python scripts/tree.py add-node --parent n0 --hypothesis "Verification, not retrieval, is the bottleneck: candidates are found but discarded"
python scripts/tree.py add-node --parent n4 --hypothesis "Decompose the question into atomic constraints and verify each independently"
```

### 3. 选择
选择接下来要运行哪些待处理叶节点。**选择并非单纯追求最高分**——选择某个假设，可能是因为它有强有力的先验证据，也可能是因为它能够解决其同级节点所暴露的歧义，或者因为它的失败能够澄清一个重要假设。在延迟反馈下进行前沿控制时，有信息量的实验比看起来有希望的实验更受重视。

### 4. 调度
将每个选中的假设作为**在隔离工作树中运行的执行器子代理**（使用 Agent 工具并设置 `isolation: "worktree"`，或让执行器使用 `git worktree add` 创建一个工作树）运行。隔离很重要：并行实验不能相互覆盖，也不能影响当前最佳结果；探索性修改在通过合并门槛之前必须保持隔离。

当兄弟节点彼此独立时，**并行**调度它们（在一条消息中进行多次 Agent 调用）——同一方向内的对比证据正是后续剪枝和抽象得以进行的基础。

为每个执行器提供一份简洁且**绑定假设**的任务说明。完整模板见 `references/executor-brief.md`。使 HTR 生效的契约是：**当指标停滞时，执行器不得更改假设。**它可以修复自身代码并重新运行，但 `h_n` 必须保持不变——否则返回的分数就不再是关于所分配节点的证据，树的语义也会被破坏。执行器必须恰好返回以下四项：
- **dev_score** — dev evaluator 的结果（用于选择）；
- **result** — 对所发生情况的事实性总结；
- **insight** — 提炼出的、可复用的经验（*为什么*该结果支持、削弱或限定了该假设）；
- **branch_ref** — 保存该产物的 git 分支/提交/工作树路径。

调度前将节点标记为 `running`（`tree.py set-status --node n5 --status running`），使 Observe 投影保持准确。

### 5. 反向传播
执行器返回后，将其报告写入节点，然后将该经验**向上抽象**：

```bash
python scripts/tree.py set-evidence --node n5 --dev-score 70.0 \
  --result "K=5 dossier aggregation recovers answers in minority rollouts" \
  --insight "Correct answers often appear in a minority of rollouts; aggregation beats majority vote" \
  --branch-ref "wt/n5"

python scripts/tree.py propagate --node n5 \
  --insight "Candidate coverage, not verification, limits this direction" --to-root
```

这一步使树不再只是日志。叶节点层面的观察（“数据接口不匹配”）应转化为方向层面的约束；如果具有普遍性，还应成为塑造后续构思的全局先验。**经验传播是 HTR 获得大部分收益的组件**——在论文的 MLE-Bench Lite 消融实验中，*没有经验反馈*的树甚至比完全没有树的扁平实验队列得分还低（任意奖牌率为 54.5% 对 63.6%，而完整系统为 81.8%）。仅有层级结构是不够的：真正重要的是语义记忆。因此要认真思考如何进行抽象；不要只是把叶节点经验原样向上复制。

### 6. 决策
根据新证据决定下一步：继续扩展某个方向、剪除已被证伪的子树，或尝试合并某个候选方案。

- **剪枝**无效方向，并记录*原因*——该原因会成为一条负约束：
  ```bash
  python scripts/tree.py prune --node n7 --reason "search-augmented judge overfits dev questions; no test transfer"
  ```
- **合并门槛**——仅当候选方案在 `E_test` 上有所提升时，才将其提升为新的最佳方案。在一个*全新的*工作树中运行测试评估器（不要使用 dev 工作树，以避免信息泄漏），然后执行：
  ```bash
  python scripts/tree.py merge --node n5 --test-score 67.67 --branch-ref "wt/n5"
  ```
  如果门槛拒绝了该候选方案，这同样具有信息价值：高 dev / 低 test 的候选方案表明，该方向可能是在利用 dev 信号，而不是产生可迁移的改进。记录这一经验；不要悄悄地强行将其提升。

重复执行，直到预算用尽、前沿耗尽，或进展明显停滞。

## 完成本轮运行

停止时，生成一份简短报告（参见 `references/report-template.md`），涵盖：
- 最终最佳产物、其测试分数，以及相对于 `M_0` 的增量；
- 树（`python scripts/tree.py status`），作为已尝试内容的审计轨迹；
- 主要假设的变化——任务理解如何在运行过程中不断深入（早期节点测试广泛的机制；后期节点发现这些机制的局限；祖先节点的洞见将这些内容压缩为最终设计背后的约束）；
- 已合并与已探索：许多节点改进了开发集，但通过测试门槛的节点要少得多——应如实报告这一差距，而不是夸大开发集上的收益。

始终将 `M_best` 保留为一个位于已命名分支上的真实、可运行产物，并告知用户如何检出该分支。

## 让这一方法奏效的原则（并非死板的规则）

这些原则源自论文中的分析；理解其“为什么”比机械遵循更重要。

- **树才是记忆；对话不是。** 在较长的运行过程中，你的上下文会被压缩。每个周期都要重新观察，以便让决策建立在持久证据之上，而不是有损的摘要之上。
- **进行结构化搜索，而不是增加采样。** Arbor 的收益来自预算的*组织方式*——维护相互竞争的假设、比较兄弟节点、向前传递经验——而不是消耗更多 token。不要漫无目的地扩展分支；每个实验都应以树中已有的认知为依据。
- **开发集用于引导，测试集用于接纳。** 可以自由使用开发集反馈来引导探索，但未经测试集确认，绝不能让开发集上的胜出方案进入最终产物。开发集与测试集之间的不一致本身就是值得解读的信号。
- **执行器受假设约束。** 局部工程上的灵活性（编辑、调试、重新运行）没有问题；但不能为了追逐更高的数字而悄悄改变假设——这会破坏证据的意义。
- **失败是约束，而不是噪声。** 被证伪的假设会告诉你解决方案必须避开什么。带有理由地剪枝，比剪枝后遗忘更有价值。

## 参考文件

- `references/htr-methodology.md` — 对 HTR、节点结构、六个步骤以及论文实证结论（消融实验、迁移、成本）的更深入说明。在需要了解某项设计选择背后的理由时阅读。
- `references/executor-brief.md` — 交给每个执行器子代理的 brief 模板。
- `references/report-template.md` — 最终报告的结构。
- `references/arbor-upstream.md` — 如何安装并运行 RUC-NLPIR/Arbor 提供的独立 `arbor` CLI，而不是原生编排它，以及何时优先选择其中一种方式。