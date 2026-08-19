---
name: experimental-design
description: Design experiments and studies BEFORE data is collected — choosing a design, randomizing, blocking, and laying out treatment combinations so results are interpretable. Use whenever someone is planning a study, asks how to assign subjects/samples to groups, mentions randomization, blocking, stratification, controls, factorial or fractional-factorial designs, design of experiments (DOE), screening many factors, response-surface optimization, crossover or repeated-measures or split-plot designs, cluster/group randomization, Latin squares, plate layouts, batch/run-order effects, replication vs. pseudoreplication, or sequential/adaptive/group-sequential designs. Trigger even for informal phrasings like "how should I set up this experiment", "how do I avoid confounding", "what's the best way to test these 6 factors", or "assign these mice to conditions". For computing the sample size or power once the design is chosen, use statistical-power; for analyzing data already collected, use statistical-analysis.
allowed-tools: Read Write Edit Bash
compatibility: Requires Python >=3.10. Scripts use numpy, pandas, and pyDOE3 (DOE matrices). Install with uv as shown below.
license: MIT license
metadata:
  version: "1.1"
  skill-author: K-Dense Inc.
---
# 实验设计

## 概述

研究的设计——如何将单位分配到各个条件、哪些因素保持不变、哪些因素发生变化，以及以何种结构进行变化——决定了数据能够回答哪些问题。事后再进行任何分析，都无法挽救一个存在混杂或伪重复的设计。这项技能关注的是数据收集*之前*所做的决策：选择能够隔离目标效应的设计，通过随机化使因果推断成立，通过区组设计消除已知的无关变异，并对多因素实验进行结构化设计，使各项效应能够被估计，而不是彼此纠缠。

几乎所有优秀设计背后的三个理念（Fisher 的原则）：
- **随机化** —— 随机分配处理，使已知和未知的混杂因素在期望意义上达到平衡。这是将比较转化为因果结论的关键。
- **重复** —— 在恰当的层级进行独立重复，从而估计变异性，并避免效应只是单个单位的偶然结果。最常见的致命错误是**伪重复**：将同一单位上的重复测量计为相互独立的重复。
- **区组设计 / 局部控制** —— 将相似的单位（按批次、日期、地点、窝等）分组，并在区组内进行随机化，将这部分无关变异从误差项中移除，而不是任其增加噪声。

这项技能帮助你在不同设计类型之间进行选择，生成实际的随机化方案或 DOE 布局（附带可复现脚本），并避免那些会使数据无法解释的结构性错误。

## 何时使用此技能

- 规划任何比较实验或试验，并决定如何分配单位
- 将受试者/样本随机分配到各组（简单随机、区组、分层或整群随机）
- 通过区组或分层消除无关变异
- 设计多因素实验：全因子或部分因子、筛选设计
- 优化连续因素上的响应（响应面设计）
- 受试者内 / 重复测量、交叉、裂区或拉丁方设计
- 整群或组随机设计（地点、诊所、教室、窝）
- 决定重复的数量和层级，并避免伪重复
- 进行带有期中分析的序贯、组序贯或自适应设计
- 规划板/批次布局并随机化运行顺序，以消除漂移影响

## 安装

```bash
uv pip install "numpy>=1.26" "pandas>=2.0" pyDOE3
```

`pyDOE3` 是 pyDOE/pyDOE2 的维护后继版本，提供全因子、部分因子、Plackett-Burman、中心复合、Box-Behnken 和拉丁超立方生成器。随附的脚本会对其进行封装，以返回采用实际因素单位、带有命名列且运行顺序经过随机化的设计。

---

## 选择设计

从问题和单位的结构出发，而不是从偏好的设计出发。

```
What are you trying to learn?
│
├─ Compare a few predefined conditions (A vs B vs C)?
│   ├─ Units independent, possibly with a known nuisance factor (day, batch, site)?
│   │     → Completely randomized (no nuisance) or RANDOMIZED BLOCK design.
│   ├─ Each unit can receive every condition in sequence (washout possible)?
│   │     → CROSSOVER / repeated-measures design (more power, watch carry-over).
│   └─ You can only randomize groups, not individuals (schools, clinics)?
│         → CLUSTER-randomized design (analyze at the cluster level; see pseudoreplication).
│
├─ Screen MANY factors (5+) to find the few that matter?
│     → FRACTIONAL FACTORIAL or PLACKETT-BURMAN screening design.
│
├─ Quantify main effects AND interactions among a handful of factors?
│     → FULL 2^k FACTORIAL design.
│
├─ Find the settings that OPTIMIZE a response (curvature matters)?
│     → RESPONSE-SURFACE design: central composite or Box-Behnken.
│
└─ Explore a simulation/computer model over a continuous space?
      → SPACE-FILLING design: Latin hypercube.
```

各分支的详细指导：
- **随机化、区组、分层、对照** → `references/randomization_and_blocking.md`
- **析因、部分析因、筛选、响应面、DOE 概念（混杂、分辨率）** → `references/factorial_and_doe.md`
- **交叉、重复测量、裂区、拉丁方、整群、嵌套设计** → `references/design_types.md`
- **序贯、组序贯和自适应设计（期中分析）** → `references/sequential_and_adaptive.md`

---

## 生成设计

两个脚本可以生成可直接使用且可复现的布局。请从 skill 的
`scripts/` 目录运行它们，或将该目录添加到 `sys.path`。所有内容都经过设定种子，
因此可以归档并重新生成完全相同的安排——这是试验注册和良好实验室规范的要求。

### 随机化 / 分配安排 — `scripts/randomization.py`

```python
from randomization import (
    simple_randomization, block_randomization,
    stratified_block_randomization, cluster_randomization,
    assign_factorial_runs, arm_balance,
)

# Permuted blocks keep the arms balanced throughout enrollment (use for n < ~100
# or sequential intake — simple randomization can drift out of balance with small n)
sched = block_randomization(n=60, arms=["treatment", "control"], seed=42)

# Balance a prognostic variable across arms by randomizing within each stratum
sched = stratified_block_randomization({"siteA": 30, "siteB": 30},
                                       arms=["drug", "placebo"], ratio=(2, 1), seed=42)

# Randomize whole clusters, not individuals (the cluster is the unit)
sched = cluster_randomization(["clinic1", "clinic2", "clinic3", "clinic4"], seed=42)

arm_balance(sched)            # sanity-check the counts per arm
sched.to_csv("allocation_schedule.csv", index=False)
```

如何选择：对于较大的 n，**简单随机化**即可，但在 n 较小时可能导致不平衡；**区组随机化**
可确保整个入组过程中保持平衡；**分层区组随机化**还可进一步平衡已知的预后因素；当干预
以群组层面实施时，**整群随机化**是必需的。请参阅 `references/randomization_and_blocking.md`。

### DOE 矩阵 — `scripts/doe_designs.py`

```python
from doe_designs import (
    full_factorial, two_level_factorial, fractional_factorial,
    plackett_burman, central_composite, box_behnken, latin_hypercube,
)

# Factors as real-world (low, high) ranges -> design comes back in real units
factors = {"temp_C": (20, 60), "conc_mM": (1, 10), "pH": (6, 8)}

# Full 2^3: all main effects + all interactions (8 runs), run order randomized
design = two_level_factorial(factors, seed=42)

# Screen 7 factors cheaply (main effects only)
many = {f"factor_{i}": (0, 1) for i in range(7)}
design = plackett_burman(many, seed=42)

# Optimize over 2 factors with curvature (response-surface)
design = central_composite({"temp_C": (20, 60), "conc_mM": (1, 10)}, seed=42)

design.to_csv("experimental_runs.csv", index=False)
```

默认情况下会将运行顺序随机化，以避免因素与时间变化/漂移混杂
（机器预热、试剂老化）。关于如何选择生成元、解读别名结构以及选择分辨率，请参阅
`references/factorial_and_doe.md`。

---

## 会毁掉研究的错误

这些问题是结构性的——无法在分析阶段修复，只能在设计阶段避免。

1. **伪重复。** 将同一个单位的重复测量视为独立重复：每只小鼠有 100 个细胞的 3 只小鼠，对于任何施加于小鼠的处理，n = 3（小鼠），而不是 n = 300（细胞）。重复必须处于处理随机化的层级。这一错误使大量已发表的实验失效。在正确的层级进行随机化和重复；分析时要保留嵌套结构（混合模型）。参见 `references/design_types.md`。
2. **受到干扰变量的混杂。** 如果所有处理样本都在周一运行，而所有对照样本都在周二运行，就会将处理与日期混杂。对所有能够识别的干扰因素（批次、日期、板、技术人员、仪器、位置）进行跨组随机化，或按其进行区组。
3. **没有随机化或随机化失效。** 便利分配（先到先得 → 处理组）会让混杂因素悄悄混入。使用带种子的日程表，并严格执行。
4. **没有适当的对照。** 如果没有同期对照（并且在相关情况下没有载体/假处理和盲法），就无法将处理效应与时间、安慰剂或操作效应区分开来。
5. **将批次效应误认为生物学效应。** 尤其是在组学研究中，应以随机化/区组化的顺序跨批次处理样本；绝不能让批次与条件完全对应。
6. **板上的边缘/位置效应。** 蒸发和温度梯度会导致板边缘存在差异。对样本位置进行随机化或区组；不要把所有对照都放在第 1 列。
7. **忽略部分因子设计中的混叠。** 低分辨率的部分因子设计会将主效应与交互作用混杂；在得出某个因子“没有影响”的结论之前，必须了解其混叠结构。
8. **在没有考虑曲率的情况下进行优化。** 两水平因子设计无法检测弯曲的响应；你会错过内部最优点。应使用响应面设计。

---

## 工作流程

1. **明确问题、单位和响应变量。** 什么被随机化？测量什么？真正的独立重复处于哪个层级？这决定了一切。
2. **列出干扰因素**（批次、日期、地点、操作员、位置）——计划对每一个因素进行区组、分层，或跨其进行随机化。
3. **使用决策树和参考文件选择设计。**
4. **在正确的层级决定重复数**（并针对所选设计，从 **statistical-power** skill 获取 n）。
5. **使用 `randomization.py` / `doe_designs.py` 生成布局，并设置随机种子。**
6. **随机化运行/处理顺序以及板/批次位置。**
7. **记录**设计、种子和日程表（如有可能则预注册），使分析具有验证性，并使布局可审计。
8. **使分析与设计相匹配**——区组、分层、聚类和嵌套结构必须出现在模型中（交接给 **statistical-analysis** / **statsmodels**）。

---

## 资源

### 脚本
- `scripts/randomization.py` — 带种子的分配日程：`simple_randomization`、`block_randomization`、`stratified_block_randomization`、`cluster_randomization`、`assign_factorial_runs`、`arm_balance`。
- `scripts/doe_designs.py` — 以实际单位表示的 DOE 矩阵：`full_factorial`、`two_level_factorial`、`fractional_factorial`、`plackett_burman`、`central_composite`、`box_behnken`、`latin_hypercube`。

### 参考资料
- `references/randomization_and_blocking.md` — 随机化方法、区组、分层、对照、盲法、批次/板布局。
- `references/factorial_and_doe.md` — 析因设计和部分因子设计、分辨率与混杂、筛选，以及响应面方法。
- `references/design_types.md` — 完全随机设计、随机区组设计、交叉设计、重复测量设计、裂区设计、拉丁方设计、整群设计和嵌套设计；深入讨论伪重复问题。
- `references/sequential_and_adaptive.md` — 分组序贯设计、alpha spending、中期停止，以及自适应样本量重新估计。

### 相关技能
- **statistical-power** — 为所选设计确定所需的样本量/效能。
- **statistical-analysis** — 在数据收集后执行并报告分析。
- **statsmodels** / **pymc** — 拟合该设计所要求的模型。

### 关键参考文献
- Fisher, R. A. (1935). *The Design of Experiments*.
- Montgomery, D. C. (2019). *Design and Analysis of Experiments* (10th ed.).
- Hurlbert, S. H. (1984). Pseudoreplication and the design of ecological field
  experiments. *Ecological Monographs*, 54(2), 187–211.
- Lazic, S. E. (2016). *Experimental Design for Laboratory Biologists*.