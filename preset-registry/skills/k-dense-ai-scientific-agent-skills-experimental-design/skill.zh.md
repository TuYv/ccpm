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

研究的设计——单位如何分配到各个条件、哪些因素保持不变、哪些因素发生变化，以及这些变化以何种结构组织——决定了数据能够回答哪些问题。事后再进行任何分析，都无法挽救一个存在混杂或伪重复的设计。本技能关注的是数据收集*之前*所做的决策：选择能够隔离目标效应的设计，通过随机化为因果推断提供依据，通过区组设计去除已知的干扰变异，并构建多因素实验，使各项效应能够被估计，而不是彼此纠缠在一起。

几乎所有优秀设计背后的三个理念（Fisher 的原则）：
- **随机化**——将处理随机分配，使已知和未知的混杂因素在期望意义上达到平衡。这正是将比较转化为因果论断的关键。
- **重复**——在正确的层级进行独立重复，以便估计变异性，确保效应不是单个单位造成的假象。最常见的致命错误是**伪重复**：将同一单位上的重复测量计作独立重复。
- **区组设计 / 局部控制**——将相似的单位（按批次、日期、地点、窝等）分组，并在区组内进行随机化，将这些干扰变异从误差项中移除，而不是任其增加噪声。

本技能帮助你在不同设计类型中进行选择，生成实际的随机化方案或 DOE 布局（附带可复现脚本），并避免那些会使数据无法解释的结构性错误。

## 何时使用本技能

- 规划任何比较实验或试验，并决定如何分配单位
- 将受试者/样本随机分配到各组（简单随机、区组、分层或集群随机）
- 通过区组设计或分层去除干扰变异
- 设计多因素实验：全因子或部分因子、筛选设计
- 优化连续因素上的响应（响应面设计）
- 受试者内 / 重复测量、交叉、裂区或拉丁方设计
- 集群或群组随机设计（地点、诊所、教室、窝等）
- 决定重复的数量和水平，并避免伪重复
- 带有期中分析的序贯、组序贯或自适应设计
- 设计板位/批次布局，并随机化运行顺序以消除漂移影响

## 安装

```bash
uv pip install "numpy>=1.26" "pandas>=2.0" pyDOE3
```

`pyDOE3` 是 pyDOE/pyDOE2 的维护继任者，提供全因子、部分因子、Plackett-Burman、中心复合、Box-Behnken 和拉丁超立方生成器。随附的脚本会对其进行封装，以返回使用实际因素单位表示、带有命名列且运行顺序经过随机化的设计。

---

## 选择设计

从问题和单位的结构出发，而不是从偏好的设计出发。

```
你想了解什么？
│
├─ 比较几个预先定义的条件（A vs B vs C）？
│   ├─ 单位相互独立，可能存在已知的干扰因素（日期、批次、地点）？
│   │     → 完全随机设计（无干扰因素）或随机区组设计。
│   ├─ 每个单位都可以按顺序接受每种条件（且可以进行洗脱）？
│   │     → 交叉 / 重复测量设计（统计效能更高，但需注意携带效应）。
│   └─ 只能将群组而非个体进行随机化（学校、诊所）？
│         → 集群随机设计（在集群层级进行分析；参见伪重复）。
│
├─ 筛选许多因素（5 个以上），找出其中少数真正重要的因素？
│     → 部分因子设计或 Plackett-Burman 筛选设计。
│
├─ 量化少数因素的主效应和交互效应？
│     → 完全 2^k 因子设计。
│
├─ 找到能够使响应达到最优的设置（需要考虑曲率）？
│     → 响应面设计：中心复合设计或 Box-Behnken 设计。
│
└─ 在连续空间中探索仿真/计算机模型？
      → 空间填充设计：拉丁超立方设计。
```

各分支的详细指导：
- **随机化、区组、分层、对照** → `references/randomization_and_blocking.md`
- **析因、部分析因、筛选、响应面、DOE 概念（混杂、分辨率）** → `references/factorial_and_doe.md`
- **交叉、重复测量、裂区、拉丁方、整群、嵌套设计** → `references/design_types.md`
- **序贯、组序贯和自适应设计（期中分析）** → `references/sequential_and_adaptive.md`

---

## 生成设计

两个脚本可以生成可直接使用且可复现的布局。从技能的
`scripts/` 目录运行它们，或将该目录添加到 `sys.path`。所有内容都经过设定种子，因此可以归档并重新生成完全相同的
安排——这是试验注册和良好实验室实践的要求。

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

选择哪一种：对于较大的 n，**simple** 通常足够，但在 n 较小时可能产生不平衡；**block** 可在整个入组过程中保证平衡；**stratified block** 还会平衡一个已知的预后因素；当干预以群体为单位实施时，**cluster** 是必需的。参见 `references/randomization_and_blocking.md`。

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

默认会将运行顺序随机化，以避免因素与时间变化/漂移（机器预热、试剂老化）发生混杂。有关如何选择
生成元、解读别名结构以及选择分辨率，请参见 `references/factorial_and_doe.md`。

---

## 会毁掉研究的错误

这些问题是结构性的——无法在分析阶段修复，只能在设计阶段避免。

1. **伪重复。** 将同一个单位的重复测量当作相互独立的重复：每只小鼠有 100 个细胞的 3 只小鼠，对于施加于小鼠的任何处理，n = 3（小鼠），而不是 n = 300（细胞）。重复必须处于处理随机化的层级。这个单一错误使大量已发表的实验失效。在正确的层级进行随机化和重复；分析时要尊重嵌套结构（混合模型）。参见 `references/design_types.md`。
2. **受干扰变量混淆。** 如果所有处理样本都在周一运行，而所有对照样本都在周二运行，就会将处理与日期混淆。对所有能够识别出的干扰因素（批次、日期、板、技术人员、仪器、位置）进行跨因素随机化，或按其进行区组。
3. **没有随机化，或随机化不当。** 便利分配（先到先得 → 处理组）会让混淆因素乘虚而入。使用带种子的分配计划并严格执行。
4. **没有适当的对照。** 没有同期对照（以及在适用时的载体/假处理和盲法），就无法将处理效应与时间、安慰剂或操作效应区分开来。
5. **将批次效应误认为生物学效应。** 尤其是在组学研究中，应以随机化/区组化的顺序跨批次处理样本；绝不能让批次与条件相一致。
6. **板上的边缘/位置效应。** 蒸发和热梯度会导致板边缘存在差异。应将样本位置随机化或区组化；不要把所有对照都放在第 1 列。
7. **忽略分数因子设计中的混叠。** 低分辨率的分数因子设计会使主效应与交互作用混淆；在得出某个因子“没有效应”的结论前，应了解其混叠结构。
8. **未考虑曲率就进行优化。** 两水平因子设计无法检测弯曲的响应；你会错过内部最优点。应使用响应面设计。

---

## 工作流程

1. **明确问题、单位和响应。** 随机化的是什么？测量的是什么？真正独立的重复处于哪个层级？这决定了一切。
2. **列出干扰因素**（批次、日期、地点、操作人员、位置）——计划对每个因素进行区组、分层或跨因素随机化。
3. **使用决策树和参考文件选择设计。**
4. **在正确的层级确定重复数**（并针对所选设计从 **statistical-power** skill 获取 n）。
5. **使用 `randomization.py` / `doe_designs.py` 生成布局**，并设置随机种子。
6. **随机化运行/处理顺序以及板/批次位置。**
7. **记录**设计、种子和计划（如有可能则预注册），使分析具有验证性，并使布局可审计。
8. **使分析与设计相匹配**——区组、层、集群和嵌套结构必须出现在模型中（交接给 **statistical-analysis** / **statsmodels**）。

---

## 资源

### 脚本
- `scripts/randomization.py` — 带种子的分配计划：`simple_randomization`、`block_randomization`、`stratified_block_randomization`、`cluster_randomization`、`assign_factorial_runs`、`arm_balance`。
- `scripts/doe_designs.py` — 以实际单位表示的 DOE 矩阵：`full_factorial`、`two_level_factorial`、`fractional_factorial`、`plackett_burman`、`central_composite`、`box_behnken`、`latin_hypercube`。

### 参考资料
- `references/randomization_and_blocking.md` — 随机化方法、区组化、
  分层、对照、盲法、批次/板布局。
- `references/factorial_and_doe.md` — 析因设计和部分析因设计、分辨率
  与混杂、筛选以及响应面方法。
- `references/design_types.md` — 完全随机设计、随机区组设计、交叉设计、
  重复测量设计、裂区设计、拉丁方设计、整群设计和嵌套设计；深入讨论
  伪重复问题。
- `references/sequential_and_adaptive.md` — 组序贯设计、alpha 消耗、
  中期停止以及自适应样本量重新估计。

### 相关技能
- **statistical-power** — 为所选设计确定所需的样本量 / power。
- **statistical-analysis** — 在数据收集后执行并报告分析。
- **statsmodels** / **pymc** — 拟合该设计所要求的模型。

### 关键参考文献
- Fisher, R. A. (1935). *实验设计*。
- Montgomery, D. C. (2019). *实验设计与分析*（第 10 版）。
- Hurlbert, S. H. (1984). 生态学野外实验中的伪重复与实验设计。
  *Ecological Monographs*, 54(2), 187–211。
- Lazic, S. E. (2016). *实验室生物学家的实验设计*。