---
name: alterlab-medchem
description: Applies medicinal-chemistry filters with the medchem library — drug-likeness rules (Lipinski, Veber), PAINS filters, structural alerts, and molecular complexity metrics for compound prioritization and library cleanup. Use when filtering or triaging a compound library, flagging PAINS or reactive groups, or assessing drug-likeness of candidate molecules. Part of the AlterLab Academic Skills suite.
license: Apache-2.0
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.1.0"
---
# Medchem

## 概述

Medchem（`datamol-io/medchem`）是一个 Python 库，用于在药物发现工作流中进行分子过滤和优先级排序，涵盖药物化学规则、结构警示（ChEMBL/NIBR/PAINS）、化学基团检测、复杂度指标以及查询 DSL。规则和过滤器是针对特定情境的指导原则，而非绝对真理——应结合领域专业知识使用。

**已基于 `medchem==2.0.5`（RDKit 2026.3.x、Python 3.12）完成验证。** 以下 API 名称均已针对该版本进行核查；早期文档和博客文章描述的是不同的 API 接口。

## 何时使用此 Skill

此 Skill 适用于以下情况：
- 对化合物库应用类药性规则（Lipinski、Veber 等）
- 根据结构警示或 PAINS 模式过滤分子
- 对用于先导化合物优化的化合物进行优先级排序
- 评估化合物质量和药物化学性质
- 检测具有反应活性或存在问题的官能团
- 计算分子复杂度指标

## 安装

```bash
uv pip install medchem    # PyPI; pulls rdkit + datamol
```

有两项功能需要 PyPI 无法提供的额外原生依赖：
- **Lilly 扣分规则**（`lilly_demerit_filter`）会通过 shell 调用已编译的二进制文件——请通过 conda 安装：`mamba install -c conda-forge lilly-medchem-rules`。如果未安装这些依赖，调用时会引发 `ImportError`。
- ChemAxon 规则（`rule_of_chemaxon_druglikeness`）需要已获许可的 ChemAxon 安装。

其余所有功能（RuleFilters、CommonAlerts、NIBR、复杂度、基团、查询）仅通过 PyPI wheel 即可使用。

## 核心功能

> **适用于整个 medchem 的约定。** 过滤器接收 `mols`（由 SMILES 字符串或 RDKit mol 组成的序列），默认使用 `n_jobs=-1`（所有核心），并接受 `progress=True`。`medchem.structural` / `medchem.rules` 过滤器*类*返回一个 **pandas DataFrame**（每个输入 mol 对应一行）；`medchem.functional.*` 辅助函数返回一个 **NumPy 布尔数组**，其中 `True` 表示该分子通过过滤／被保留。请通过 `mc.rules.RuleFilters.list_available_rules()` 和 `mc.structural.CommonAlertsFilters.list_default_available_alerts()` 获取规范的规则和警示名称，而不要自行猜测。

### 1. 药物化学规则 — `medchem.rules`

**单条规则** — `medchem.rules.basic_rules.*` 函数接收一个 mol（SMILES 或 RDKit）并返回普通的 `bool`：

```python
import medchem as mc

smi = "CC(=O)OC1=CC=CC=C1C(=O)O"  # aspirin
mc.rules.basic_rules.rule_of_five(smi)   # -> True
mc.rules.basic_rules.rule_of_veber(smi)  # -> True
mc.rules.basic_rules.rule_of_cns(smi)
```

可用规则（部分；完整列表可通过 `mc.rules.RuleFilters.list_available_rules()` 获取）：`rule_of_five`、`rule_of_five_beyond`、`rule_of_four`、`rule_of_three`、`rule_of_three_extended`、`rule_of_two`、`rule_of_ghose`、`rule_of_veber`、`rule_of_reos`、`rule_of_egan`、`rule_of_pfizer_3_75`、`rule_of_gsk_4_400`、`rule_of_oprea`、`rule_of_xu`、`rule_of_cns`、`rule_of_respiratory`、`rule_of_zinc`、`rule_of_leadlike_soft`、`rule_of_druglike_soft`、`rule_of_generative_design`、`rule_of_chemaxon_druglikeness`（需要 ChemAxon）。

> 2.0.5 中**没有** `rule_of_drug`、`rule_of_leadlike_strict`、`golden_triangle` 或 `pains_filter` 函数。PAINS 位于警报系统中（`HASALERT("pains")` 或 `CommonAlertsFilters(alerts_set=["PAINS"])`）。对于先导化合物相似性，请使用 `rule_of_leadlike_soft` 或 `rule_of_oprea`。

**多条规则** — `RuleFilters` 返回一个 DataFrame，其中包含 `mol`、`pass_all`、`pass_any` 列，以及每条规则对应的一个布尔列：

```python
import datamol as dm
import medchem as mc

mols = [dm.to_mol(s) for s in smiles_list]
rfilter = mc.rules.RuleFilters(rule_list=["rule_of_five", "rule_of_veber", "rule_of_cns"])
df = rfilter(mols=mols, n_jobs=-1, progress=True)
# df["pass_all"] -> bool per molecule; df["rule_of_five"] -> per-rule bool
clean = [m for m, ok in zip(mols, df["pass_all"]) if ok]
```

**属性区间** — 不存在集成所有功能的 "Constraints(mw_range=...)" 对象（请参阅第 7 节中的说明）。请使用 `mc.rules.in_range`，结合 `mc.rules.list_descriptors()` 中的描述符名称（`mw`、`clogp`、`tpsa`、`n_lipinski_hbd`、`n_lipinski_hba`、`n_rotatable_bonds`、`n_rings`……）构建自定义属性阈值，或者使用查询 DSL（`HASPROP`，第 8 节）。

### 2. 结构警报过滤器 — `medchem.structural`

`medchem.structural` 提供两个过滤器类：`CommonAlertsFilters` 和 `NIBRFilters`。（Lilly 扣分可通过 `medchem.functional` 使用，请参阅第 3 节——其类位于 `medchem.structural.lilly_demerits` 下，并且需要外部二进制文件。）

**常见警报** — 来自 ChEMBL 的精选警报集（Glaxo、Dundee、BMS、**PAINS**、SureChEMBL……）。返回一个 DataFrame，其中包含 `mol`、`pass_filter`（布尔值）、`status`（`ok`/`exclude`）和 `reasons`（匹配的警报名称，以 `;` 连接）：

```python
import medchem as mc

caf = mc.structural.CommonAlertsFilters()                 # all default sets
caf_pains = mc.structural.CommonAlertsFilters(alerts_set=["PAINS"])  # PAINS only
df = caf(mols=mol_list, n_jobs=-1, progress=True)
clean = df[df["pass_filter"]]
# discover sets: mc.structural.CommonAlertsFilters.list_default_available_alerts()
```

**NIBR 过滤器** — Novartis 过滤器集。返回一个 DataFrame，其中包括 `mol`、`pass_filter`、`severity`、`status` 和 `reasons`：

```python
nibr = mc.structural.NIBRFilters()
df = nibr(mols=mol_list, n_jobs=-1)
```

### 3. 函数式 API — `medchem.functional`

单次调用的辅助函数，返回 NumPy 布尔数组（`True` = 保留）。传入 `return_idx=True` 可改为获取通过过滤的分子索引：

```python
import medchem as mc

mc.functional.rules_filter(mol_list, rules=["rule_of_five", "rule_of_veber"], n_jobs=-1)
mc.functional.alert_filter(mol_list, alerts=["pains"], n_jobs=-1)   # alert names are lowercase here
mc.functional.nibr_filter(mol_list, max_severity=10, n_jobs=-1)
mc.functional.complexity_filter(mol_list, complexity_metric="bertz", limit="99", n_jobs=-1)
mc.functional.chemical_group_filter(mol_list, chemical_group=mc.groups.ChemicalGroup(groups=["hinge_binders"]))
```

**Lilly 扣分** — 需要外部 Lilly 二进制文件（请参阅“安装”）；如果缺失，则会引发 `ImportError`。超过 `max_demerits`（默认值为 160）的分子将被拒绝：

```python
keep = mc.functional.lilly_demerit_filter(mol_list, max_demerits=160, n_jobs=-1)  # NumPy bool array
```

### 4. 化学基团检测 — `medchem.groups`

`ChemicalGroup` 用于匹配整理好的基团目录。使用 `mc.groups.list_default_chemical_groups()` 列出有效的目录名称（例如 `hinge_binders`、`electrophilic_warheads_for_kinases`、`common_warhead_covalent_inhibitors`、`privileged_kinase_inhibitor_scaffolds`、`aggregator`）。每个分子的官能团名称（用于查询 DSL 中的 `HASGROUP`）来自 `mc.groups.list_functional_group_names()`。

```python
import medchem as mc

group = mc.groups.ChemicalGroup(groups=["hinge_binders"])
group.has_match(mol)        # bool for one mol
group.get_matches(mol)      # detailed matches
# batch: mc.functional.chemical_group_filter(mols, chemical_group=group)
```

> `phosphate_binders`、`michael_acceptors` 和 `reactive_groups` **不是**默认目录名称。对于反应性/亲电基序，请使用 `electrophilic_warheads_for_kinases` / `common_warhead_covalent_inhibitors`、警示过滤器（第 2 节），或自定义 SMARTS 目录（`mc.catalogs.catalog_from_smarts`）。

### 5. 命名目录 — `medchem.catalogs`

```python
import medchem as mc

mc.catalogs.list_named_catalogs()      # available catalog names
cat = mc.catalogs.NamedCatalogs.pains()  # e.g. a PAINS RDKit FilterCatalog
mc.catalogs.catalog_from_smarts(...)   # build a catalog from custom SMARTS
```

### 6. 分子复杂度 — `medchem.complexity`

`ComplexityFilter` 会标记复杂度超过从参考集（默认为 ZINC）得出的百分位阈值的分子。它会**针对每个分子调用**，并返回一个布尔值（`True` = 在限制范围内 / 保留）。指标包括：`bertz`、`whitlock`（`WhitlockCT`）、`barone`（`BaroneCT`）、`smcm`（`SMCM`）、`twc`（`TWC`）。

```python
import medchem as mc

cflt = mc.complexity.ComplexityFilter(limit="99", complexity_metric="bertz")
keep = [cflt(m) for m in mol_list]
# or batch: mc.functional.complexity_filter(mol_list, complexity_metric="bertz", limit="99")
```

> 不存在 `mc.complexity.calculate_complexity(...)`，而且 `ComplexityFilter` 接受的是 `limit`/`complexity_metric`/`threshold_stats_file`，**不是** `max_complexity`。如需原始分数，请直接使用指标类（`mc.complexity.TWC` 等）。

### 7. 子结构约束 — `medchem.constraints`

`mc.constraints.Constraints(core, constraint_fns, prop_name="query")` 用于对查询核心周围实施**子结构 / R 基团**约束（通过 `has_match` / `validate`）——它**不是**理化性质窗口过滤器。对于 MW/logP/TPSA 窗口，请使用 `RuleFilters` + `in_range`（第 1 节）或查询 DSL 中的 `HASPROP`（第 8 节）。

### 8. 查询 DSL — `medchem.query`

`QueryFilter` 对规则、性质、警示和基团组成的布尔表达式求值。运算符：`AND`、`OR`、`NOT`，以及比较运算符 `< > <= >= == !=`。基本表达式：`MATCHRULE("...")`、`HASPROP("<descriptor>" < value)`、`HASALERT("<lowercase set>")`、`HASGROUP("...")`、`HASSUBSTRUCTURE`/`HASSUPERSTRUCTURE`、`LIKE`。

```python
import medchem as mc

qf = mc.query.QueryFilter('MATCHRULE("rule_of_five") AND HASPROP("mw" < 500) AND NOT HASALERT("pains")')
keep = qf(mol_list, n_jobs=-1)   # NumPy bool array
```

> 语法应使用上面的结构化 DSL——**而不是**像 `"rule_of_five AND NOT common_alerts"` 这样的自由文本。不存在 `mc.query.parse()`；请构造 `mc.query.QueryFilter(query_string)`，并在分子上调用它。`HASALERT` 中的警报名称使用小写（`pains`、`tox`、`nih`……）。

## 工作流模式

### 模式 1：化合物库的初步筛选

筛选大型化合物集合，保留类药候选物，并剔除任何具有结构警报的化合物。

```python
import datamol as dm
import medchem as mc
import pandas as pd

df = pd.read_csv("compounds.csv")
mols = [dm.to_mol(smi) for smi in df["smiles"]]

# Rule filter -> DataFrame with pass_all + per-rule columns
rule_df = mc.rules.RuleFilters(rule_list=["rule_of_five", "rule_of_veber"])(
    mols=mols, n_jobs=-1, progress=True
)

# Structural alerts -> DataFrame with pass_filter (True = clean)
alert_df = mc.structural.CommonAlertsFilters()(mols=mols, n_jobs=-1, progress=True)

df["passes_rules"] = rule_df["pass_all"].to_numpy()
df["no_alerts"] = alert_df["pass_filter"].to_numpy()
df["drug_like"] = df["passes_rules"] & df["no_alerts"]

df[df["drug_like"]].to_csv("filtered_compounds.csv", index=False)
```

### 模式 2：先导化合物优化筛选

叠加更严格的过滤器，仅保留通过每个阶段的分子。`functional.*` 辅助函数均返回对齐的 NumPy 布尔数组，因此对它们取交集非常直接。

```python
import numpy as np
import medchem as mc

f = mc.functional
keep = (
    f.rules_filter(candidate_mols, rules=["rule_of_oprea"], n_jobs=-1)
    & f.nibr_filter(candidate_mols, n_jobs=-1)
    & f.complexity_filter(candidate_mols, complexity_metric="bertz", limit="99", n_jobs=-1)
)
# Add lilly_demerit_filter(...) too if the Lilly binaries are installed.
survivors = [m for m, ok in zip(candidate_mols, keep) if ok]
```

### 模式 3：识别特定化学基团

标记含有目标骨架/基序的分子（使用 `mc.groups.list_default_chemical_groups()` 验证名称）。

```python
import medchem as mc

group = mc.groups.ChemicalGroup(groups=["hinge_binders"])
keep = mc.functional.chemical_group_filter(mol_list, chemical_group=group)
with_group = [m for m, ok in zip(mol_list, keep) if ok]
```

## 最佳实践

1. **上下文很重要**：不要盲目应用过滤器。应了解生物靶点和化学空间。

2. **组合多种过滤器**：结合使用规则、结构警报和领域知识，以做出更好的决策。

3. **使用并行化**：对于大型数据集（>1000 个分子），始终使用 `n_jobs=-1` 进行并行处理。

4. **迭代优化**：从宽泛的过滤器（Ro5）开始，然后根据需要应用更具体的标准（CNS、类先导性）。

5. **记录筛选决策**：跟踪哪些分子被过滤掉以及原因，以确保可复现性。

6. **验证结果**：请记住，已上市药物往往无法通过标准过滤器——应将这些过滤器用作指导原则，而不是绝对规则。

7. **考虑前药**：设计为前药的分子可能会有意违反标准的药物化学规则。

## 资源

### references/api_guide.md
全面的 API 参考文档，涵盖所有药物化学模块，并提供详细的函数签名、参数和返回类型。

### references/rules_catalog.md
完整的可用规则、过滤器和警报目录，包含描述、阈值和文献参考。

### scripts/filter_molecules.py
批量过滤 CLI。支持 CSV/TSV、SDF 和纯 SMILES `.txt` 输入，可配置过滤器组合，并生成汇总报告。

**用法：**
```bash
uv run python scripts/filter_molecules.py input.csv \
    --rules rule_of_five,rule_of_cns --nibr --output filtered.csv
```
各标志均为独立开关（`--nibr`、`--common-alerts`、`--lilly`、`--pains`），而不是 `--alerts <name>`。`--lilly` 需要外部 Lilly 二进制文件。

## 文档

官方文档：https://medchem-docs.datamol.io/
GitHub 仓库：https://github.com/datamol-io/medchem