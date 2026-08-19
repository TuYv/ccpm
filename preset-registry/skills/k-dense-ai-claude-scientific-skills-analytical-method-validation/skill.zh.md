---
name: analytical-method-validation
description: Plan, execute, and document validation, verification, and transfer of analytical procedures under the governing framework - ICH Q2(R2) and Q14, USP <1220>/<1225>/<1226>, ICH M10 bioanalytical, CLSI EP, or ISO/IEC 17025. Use for HPLC, LC-MS/MS, GC, CE, ICP-MS, dissolution, qNMR, qPCR, NIR, and ligand binding or cell-based assays whenever the question is whether a procedure is fit for its intended purpose. Triggers include "method validation", "analytical method validation", "AMV", "validation protocol", "acceptance criteria", "linearity", "reportable range", "accuracy and precision", "repeatability", "intermediate precision", "recovery", "LOD", "LOQ", "detection limit", "quantitation limit", "specificity", "robustness", "method transfer", "method comparison", "Deming", "Passing-Bablok", "Bland-Altman", "equivalence testing", "OOS investigation", "ICH Q2", "Q2(R2)", "Q14", "USP 1225", "ICH M10", "incurred sample reanalysis", "ISR", "CLSI EP", and any request to show that an assay works.
license: MIT
compatibility: Requires Python 3.11+. Scripts use only the standard library - no numpy, scipy, or network access. Statistical distributions are computed from first principles so results are reproducible in any conforming interpreter.
allowed-tools: Read Write Edit Bash
metadata:
  version: "1.0"
  skill-author: K-Dense Inc.
  last-reviewed: "2026-07-27"
---
# 分析方法验证

## 何时使用

任何涉及分析程序是否适合其预期用途的问题：设计验证研究、评估验证数据、核实药典程序、
将程序转移至另一家实验室或另一台仪器，或在报告中为上述任何事项提供依据。

## 两项规则

**1. 在设计任何内容之前，先确定适用的框架。** 同一种测定在 ICH Q2(R2)、USP <1225>、ICH M10、CLSI EP 和 ISO/IEC 17025 下的验证方式各不相同。它们在所要求的特性、研究设计方式，以及是否提供数值接受标准方面都存在差异。将它们混用，最终得到的方案将无法满足其中任何一个框架。

**2. 在收集数据之前先声明接受标准。** 在看到结果后才选择的标准不是真正的接受标准，事后决定标准属于审计中反复出现的问题。ICH Q2(R2) 几乎不提供数值标准——这些标准必须来自质量标准、分析目标剖面（ICH Q14 第 3 节）或开发数据。ICH M10 是例外：它提供了明确的数值，而且色谱测定与配体结合测定之间的数值不同。

## 范围

此技能用于规划研究、正确计算统计量，以及组织文档。它**不会**判定某个程序是否已验证、放行批次、接受或拒绝一次运行、结案调查，也不能替代分析人员、技术审核人员、质量部门或监管机构。每个脚本都只报告结果；没有任何脚本会得出结论。

## 版权边界

ICH 指南公开发布，并获许可可在致谢的前提下复用，因此本技能直接编码其中的要求。**USP 通则、CLSI EP 文件和 ISO 标准受版权保护且需要付费获取。** 对于这些文件，本技能仅提供名称、范围以及获取授权副本的途径——绝不提供原文，也绝不捏造阈值。不要要求代理检索、转录或重构其内容。如果某个数值很重要，而该数值位于付费文件中，请从授权副本中读取。

## 框架

```bash
cd skills/analytical-method-validation/scripts
python3 plan_validation.py --list-frameworks
```

| Key | Governs | Numeric criteria supplied |
| --- | --- | --- |
| `ich-q2r2` | 原料药和制剂的放行与稳定性检测 | 几乎没有——由你推导 |
| `ich-m10` | 生物分析浓度测定（PK、TK、BE） | 有，并且因模式而异 |
| `usp-1220` | 药典程序生命周期，分为三个阶段 | 需要付费获取 |
| `usp-1225` / `usp-1226` | 药典程序的验证 / 核实 | 需要付费获取 |
| `clsi` | 临床实验室测量程序（EP 系列） | 需要付费获取 |
| `iso-17025` | 认可体系下实验室自建和修改的方法 | 无——“在必要程度上” |

**Q2(R2) 于 2023 年 11 月取代 Q2(R1)，并重新组织了相关特性。** 范围现在是上位特性（第 3.2 节），其中包含*响应*（线性）和*较低范围限度的验证*（DL/QL）。准确度和精密度属于第 3.3 节，可以针对单一标准组合评估。稳健性被视为开发活动，并与 ICH Q14 交叉引用。多变量程序得到明确说明（2.5 和 3.2.2.3），附录 2 还针对 Q2(R1) 从未涵盖的技术增加了实例，包括定量 ¹H-NMR、NIR、定量 LC/MS、qPCR、生物测定和粒径。采用 Q2(R1) 形式的方案——将线性、范围、准确度、精密度、专属性、LOD、LOQ、稳健性平列为清单——已经过时。另请注意 2023 年 11 月 30 日针对表 5 和表 6–11 发布的勘误。

## 脚本

```bash
cd skills/analytical-method-validation/scripts
```

| 脚本 | 回答的问题 |
| --- | --- |
| `plan_validation.py` | 使用哪种框架、哪些特性、什么研究布局、什么方案？ |
| `check_response.py` | 校准模型在整个范围内是否确实成立？ |
| `check_accuracy_precision.py` | 回收率是多少，以及变异性有多少来自不同日期之间？ |
| `check_detection_limits.py` | 按每种允许的方法计算出的 DL 和 QL 是多少，以及它们是否满足报告阈值？ |
| `check_bioanalytical_run.py` | 对于该模式，此次运行是否符合 ICH M10？ |
| `compare_methods.py` | 在预先声明的裕度下，两种程序是否等效？ |

所有脚本都接受 `--format table|tsv|json`。来源信息、指南引用和注意事项输出到 stderr；
数据输出到 stdout，因此使用 `> out.tsv` 时可以将两者分开。没有发现问题时退出代码为
`0`，发现问题时为 `1`，输入有误时为 `2`——因此其中任何一个都可以用于阻断工作流。

## 工作流

### 1. 确定框架和所需特性

```bash
python3 plan_validation.py --framework ich-q2r2 --attribute assay --technique hplc --range-use assay
```

Q2(R2) 表 1 根据*测量属性*而非技术决定所需内容。对于含量测定：专属性、响应、准确度、
重复性、中间精密度。对于限度检查：仅需专属性和 DL。对于鉴别试验：仅需专属性。可接受的
属性包括 `assay`、`impurity`（定量）、`impurity-limit` 和 `identity`。

可报告范围来自质量标准。Q2(R2) 表 2 给出了示例——含量测定为标示含量的 80–120%，含量
均匀度为 70–130%，杂质为报告阈值至质量标准规定值的 120%。

### 2. 生成方案并填写标准

```bash
python3 plan_validation.py --framework ich-q2r2 --attribute impurity --protocol > protocol.md
```

每个方括号字段都是一项需要在*数据收集之前*作出决定并记录的内容。该方案骨架会刻意拒绝
为 Q2(R2) 工作预先填写验收标准，因为不存在有充分依据的默认值。

### 3. 评估响应

```bash
python3 check_response.py -i calibration.csv --max-back-calc-error 2
```

输入格式为 `level,response`，每次进样占一行；同一水平的重复行代表重复测定，而提供这些
重复测定正是进行线性度检验的必要条件。

以下是真实输出示例，来自一条决定系数检验可以放行的曲线：

```
statistic                           value
distinct levels                     5
slope                               166.6000
intercept                           2495.0000
intercept CI includes 0             no
coefficient of determination (r2)   0.9830
lack-of-fit F                       469.5294
lack-of-fit p                       1.5139e-06
runs test p                         0.0492

level     n  mean_response  mean_back_calculated  relative_error_pct
50.0000   2  10075.0000     45.4982               -9.0036
75.0000   2  15150.0000     75.9604               1.2805
100.0000  2  20050.0000     105.3721              5.3721
125.0000  2  24050.0000     129.3818              3.5054
150.0000  2  26450.0000     143.7875              -4.1417
```

r² = 0.983，但模型不可用：范围底部的反算误差为 −9.0%，
拟合不足 p = 1.5 × 10⁻⁶，残差符号并非随机。**r² 不是线性的证据**——它会随范围增大而上升，
且对曲率几乎不敏感。相对于纯误差的拟合不足 F 检验以及残差模式才是证据，这也是 Q2(R2) 3.2.2.1 要求分析
各点偏离直线的程度，而不是仅给出相关系数的原因。

对于宽范围曲线，添加 `--weight 1/x2`。当范围顶部三分之一的残差方差超过底部三分之一 10 倍以上时，脚本会标记出异方差性，因为此时不加权拟合会使偏差恰好出现在低端，而报告限值通常就在该处。

### 4. 评估准确度和精密度

```bash
python3 check_accuracy_precision.py -i ap.csv --accuracy-limit 2 --rsd-limit 1.0 --design-check assay
```

输入格式为 `level,measured,group`，其中 `group` 是中间精密度因子——日期、分析人员
或仪器。

```
level  component                       sd      rsd_pct  df      ci90_low_sd  ci90_high_sd
100    repeatability (within group)    0.0707  0.0707   3       0.0438       0.2065
100    between-group                   1.6515  1.6515   2       n/a          n/a
100    intermediate precision (total) 1.6530  1.6530   2.0037  0.9554       7.2821
```

0.07% RSD 的重复性看起来非常出色；但中间精密度为 1.65%，大了二十三倍，
因为变异完全发生在不同日期之间。如果将日内数值作为该程序的精密度进行报告，就会使日常性能低估一个数量级以上。
这就是脚本采用单因素随机效应模型而不是合并数据的原因。

脚本会为你处理两个陷阱：

- **精密度在每个水平内分别估计，绝不跨水平合并。** 将 80/100/120%
  的结果合并为一个标准差，会把范围本身变成表观精密度不足。脚本按水平报告结果，
  同时提供一个以标称值百分比表示的、与水平无关的视图。
- **`--require-ci-within-limit`** 强制要求整个置信区间都处于限值以内，而不仅仅是均值处于限值以内。
  Q2(R2) 3.3.1.4 要求区间与该标准“相容”；在六次重复测定中勉强落入限值以内的均值，
  并不能证明太多。

### 5. 建立 DL 和 QL，并对其进行确认

```bash
python3 check_detection_limits.py --calibration lowcal.csv --blanks blanks.csv \
    --confirm-ql 0.05 --confirm-data ql_check.csv --reporting-threshold 0.05
```

```
approach                                          sigma   slope      DL      QL
sd-and-slope (sigma = residual SD of regression)  7.2816  5033.3490  0.0048  0.0145
sd-and-slope (sigma = SD of y-intercept)          4.3303  5033.3490  0.0028  0.0086
sd-and-slope (sigma = SD of 8 blanks)             3.7702  5033.3490  0.0025  0.0075
```

仅仅由于 σ 的选择不同，同一组数据得出的 QL 估计值就相差 1.9 倍。因此，Q2(R2) 3.2.3.5
要求报告限值**以及用于确定该限值的方法**，并要求使用处于该限值或其附近的样品对估计限值进行确认。
对于杂质检测程序，QL 必须小于或等于报告限值。机械地套用 `3.3σ/slope`、不注明所采用的方法就报告一个数值、
以及从未对其进行确认，是三个彼此独立的缺陷。

### 6. ICH M10 下的生物分析运行

```bash
python3 check_bioanalytical_run.py --modality chromatographic --run run1.csv
python3 check_bioanalytical_run.py --modality lba --isr isr.csv
python3 check_bioanalytical_run.py --modality lba --criteria
```

`--modality` 是必需的，且没有默认值，因为两者的判定标准确实不同：

| | 色谱法 | 配体结合分析 |
| --- | --- | --- |
| 校准容许范围 | ±15%，LLOQ 处为 ±20% | ±20%，LLOQ 和 ULOQ 处为 ±25% |
| 准确度 / 精密度 | ±15% / ≤15% CV（LLOQ 处为 ±20% / ≤20%） | ±20% / ≤20% CV（LLOQ 和 ULOQ 处为 ±25% / ≤25%） |
| A&P 设计 | 4 个 QC 水平，每次运行 5 个重复，至少运行 3 次，覆盖至少 2 天 | 5 个 QC 水平，每次运行 3 个重复，至少运行 6 次，覆盖至少 2 天 |
| 总误差 | 无此判定标准 | ≤30%，LLOQ 和 ULOQ 处为 ≤40% |
| ISR 一致性 | 至少 2/3 的重复结果在 ±20% 内 | 至少 2/3 的重复结果在 ±30% 内 |

将色谱法的 ±15% 数值应用于配体结合分析，或将 LBA 的总误差标准引入色谱法，都是常见错误，而且都是错误的。

运行检查会强制执行一个容易被忽略的分层规则：*所有* QC 中至少 2/3 **并且**每个水平中至少 50% 必须符合要求。如果某个单独水平完全失败，一次运行仍可能通过总体比例判定。

```
finding: QC level high: 0/2 within tolerance (0%); M10 requires at least 50% at each level
```

### 7. 转移与方法比较

```bash
python3 compare_methods.py -i paired.csv --margin 2 --relative --slope-tolerance 0.05
```

```
mean difference (%)                       1.4646
TOST margin                               2.0000
TOST p-value                              1.0528e-13
90% CI (TOST)                             1.44127 to 1.48797
equivalent at stated margin               yes
--- for contrast only ---
paired t-test p (NOT equivalence)         0.0000
OLS slope (biased here)                   1.0396
Deming slope                              1.0398
Passing-Bablok slope                      1.0351
```

这取代了以下两种错误做法：

- **“p > 0.05，没有显著差异，因此两种方法等效。”** 未能检测出差异并不等于有证据证明等效，而在较小的转移数据集中，这种结果几乎是必然的。TOST 检验的是关键假设——真实差异是否处于预先规定的界值以内。这里 t 检验表明差异具有高度显著性，*同时* TOST 表明两种方法在 ±2% 的界值下等效；两者都成立，但只有其中一个回答了所关心的问题。
- **使用普通最小二乘法进行方法比较。** OLS 假设参考值不包含误差，而在比较两种程序时这一假设是不成立的，并且会使斜率向零偏移。Deming 回归（具有明确的误差方差比）和 Passing–Bablok 回归（非参数且能够抵抗离群值）才是适当的回归方法；为便于对比，报告中会将它们与 OLS 并列展示。

该脚本还会标记比例偏倚——当差异随浓度变化趋势时，无论均值偏倚及其一致性界限看起来有多么紧密，单一的均值偏倚及其一致性界限都会产生误导。

## 此技能旨在防止的问题

1. 在 Q2(R2) 取代 ICH Q2(R1) 三年后，仍依据 ICH Q2(R1) 的结构进行验证。
2. 在看到数据后才编写接受标准。
3. 将 r² 作为线性的证据。
4. 将重复性报告为方法的精密度，而不体现日间组分。
5. 只有一个 DL/QL 数值，没有注明所采用的方法，也没有进行确认。
6. 将色谱方法的 M10 标准应用于配体结合分析，或反之。
7. 在方法转移中，将 t 检验的不显著性表述为等效性。

## 参考资料

- `references/framework-selection.md` — 哪个框架适用，以及决定这一点的问题
- `references/ich-q2r2.md` — 结构、表 1 和表 2，以及各特性建议的数据
- `references/ich-m10-bioanalytical.md` — 色谱方法和 LBA 标准的完整并列表述
- `references/compendial-and-clsi.md` — USP、CLSI 和 ISO 的名称、适用范围，以及引用方式
- `references/statistics.md` — 统计方法、采用各方法的原因，以及常见错误
- `references/source-ledger.md` — 此技能中每项声明的来源和研究日期

## 资源

- `assets/validation-protocol-template.md` — 预先声明标准的方案结构
- `assets/validation-report-template.md` — 具有原始数据可追溯性的报告结构