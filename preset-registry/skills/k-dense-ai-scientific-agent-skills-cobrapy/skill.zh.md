---
name: cobrapy
description: Constraint-based metabolic modeling (COBRA). FBA, FVA, gene knockouts, flux sampling, SBML models, for systems biology and metabolic engineering analysis.
license: GPL-2.0 license
allowed-tools: Read Write Edit Bash
compatibility: Requires Python 3.9+ (cobra 0.30+ dropped 3.8). Install with uv pip install. GLPK (swiglpk) is the default solver; CPLEX/Gurobi optional. load_model fetches from bundled data, BiGG, or BioModels (network required for remote models).
metadata:
  version: "1.1"
  skill-author: K-Dense Inc.
---
# COBRApy - 基于约束的重建与分析

## 概述

COBRApy 是一个用于代谢模型基于约束的重建与分析（COBRA）的 Python 库，是系统生物学研究的重要工具。可用于处理全基因组尺度代谢模型、执行细胞代谢的计算模拟、开展代谢工程分析，以及预测表型行为。

**版本说明：** 示例面向 PyPI 上的 **cobra 0.31.1**（导入 `cobra`）。文档：[cobrapy.readthedocs.io](https://cobrapy.readthedocs.io/en/latest/)。仓库：[opencobra/cobrapy](https://github.com/opencobra/cobrapy)。

## 何时使用此技能

在以下情况下使用此技能：
- 加载、构建或导出全基因组尺度代谢模型（SBML、JSON、YAML）
- 在 COBRA 模型上运行 FBA、pFBA、FVA 或通量采样
- 执行基因或反应敲除筛选及产物包络分析
- 设计或优化生长培养基和交换约束
- 对不可行模型进行缺口填补，或验证模型一致性

## 安装

```bash
uv pip install "cobra==0.31.1"
```

MATLAB 模型 I/O（可选）：

```bash
uv pip install "cobra[array]==0.31.1"
```

COBRApy 使用 [optlang](https://optlang.readthedocs.io/) 作为求解器接口。GLPK 会通过 `swiglpk` 自动安装。对于大型 MILP/QP，cobra 0.29+ 新增了**混合型**求解器（HIGHS/OSQP）；`model.solver = "osqp"` 现在会通过 hybrid 路由，并且在未来版本中可能会在普通 LP 上报错——在可用时优先使用 `model.solver = "hybrid"`。

## 核心功能

COBRApy 提供按若干关键领域组织的全面工具：

### 1. 模型管理

从仓库或文件加载现有模型：
```python
from cobra.io import load_model

# Bundled locally (no network): textbook, iJO1366, salmonella
model = load_model("textbook")      # alias for e_coli_core (95 reactions)
model = load_model("e_coli_core")   # same core E. coli model
model = load_model("iJO1366")       # genome-scale E. coli (bundled)
model = load_model("salmonella")    # Salmonella iYS1720 (bundled)

# Remote (BiGG / BioModels; requires network, cached after first fetch)
model = load_model("iML1515")       # E. coli genome-scale on BiGG

# Load from files
from cobra.io import read_sbml_model, load_json_model, load_yaml_model
model = read_sbml_model("path/to/model.xml")
model = load_json_model("path/to/model.json")
model = load_yaml_model("path/to/model.yml")
```

以多种格式保存模型：
```python
from cobra.io import write_sbml_model, save_json_model, save_yaml_model
write_sbml_model(model, "output.xml")  # Preferred format
save_json_model(model, "output.json")  # For Escher compatibility
save_yaml_model(model, "output.yml")   # Human-readable
```

### 2. 模型结构与组件

访问并检查模型组件：
```python
# Access components
model.reactions      # DictList of all reactions
model.metabolites    # DictList of all metabolites
model.genes          # DictList of all genes

# Get specific items by ID or index
reaction = model.reactions.get_by_id("PFK")
metabolite = model.metabolites[0]

# Inspect properties
print(reaction.reaction)        # Stoichiometric equation
print(reaction.bounds)          # Flux constraints
print(reaction.gene_reaction_rule)  # GPR logic
print(metabolite.formula)       # Chemical formula
print(metabolite.compartment)   # Cellular location
```

### 3. 通量平衡分析（FBA）

执行标准 FBA 模拟：
```python
# Basic optimization
solution = model.optimize()
print(f"Objective value: {solution.objective_value}")
print(f"Status: {solution.status}")

# Access fluxes
print(solution.fluxes["PFK"])
print(solution.fluxes.head())

# Fast optimization (objective value only)
objective_value = model.slim_optimize()

# Change objective
model.objective = "ATPM"
solution = model.optimize()
```

简约 FBA（最小化总通量）：
```python
from cobra.flux_analysis import pfba
solution = pfba(model)
```

几何 FBA（寻找中心解）：
```python
from cobra.flux_analysis import geometric_fba
solution = geometric_fba(model)
```

### 4. 通量可变性分析（FVA）

确定所有反应的通量范围：
```python
from cobra.flux_analysis import flux_variability_analysis

# Standard FVA
fva_result = flux_variability_analysis(model)

# FVA at 90% optimality
fva_result = flux_variability_analysis(model, fraction_of_optimum=0.9)

# Loopless FVA (eliminates thermodynamically infeasible loops)
fva_result = flux_variability_analysis(model, loopless=True)

# FVA for specific reactions
fva_result = flux_variability_analysis(
    model,
    reaction_list=["PFK", "FBA", "PGI"]
)
```

### 5. 基因和反应删除研究

执行敲除分析：
```python
from cobra.flux_analysis import (
    single_gene_deletion,
    single_reaction_deletion,
    double_gene_deletion,
    double_reaction_deletion
)

# Single deletions
gene_results = single_gene_deletion(model)
reaction_results = single_reaction_deletion(model)

# Double deletions (uses multiprocessing)
double_gene_results = double_gene_deletion(
    model,
    processes=4  # Number of CPU cores
)

# Manual knockout using context manager
with model:
    model.genes.get_by_id("b0008").knock_out()
    solution = model.optimize()
    print(f"Growth after knockout: {solution.objective_value}")
# Model automatically reverts after context exit
```

### 6. 生长培养基和最小培养基

管理生长培养基：
```python
# View current medium
print(model.medium)

# Modify medium (must reassign entire dict)
medium = model.medium
medium["EX_glc__D_e"] = 10.0  # Set glucose uptake
medium["EX_o2_e"] = 0.0       # Anaerobic conditions
model.medium = medium

# Calculate minimal media
from cobra.medium import minimal_medium

# Minimize total import flux
min_medium = minimal_medium(model, minimize_components=False)

# Minimize number of components (uses MILP, slower)
min_medium = minimal_medium(
    model,
    minimize_components=True,
    open_exchanges=True
)
```

### 7. 通量采样

对可行通量空间进行采样：
```python
from cobra.sampling import sample

# Sample using OptGP (default, supports parallel processing)
samples = sample(model, n=1000, method="optgp", processes=4)

# Sample using ACHR
samples = sample(model, n=1000, method="achr")

# Validate samples
from cobra.sampling import OptGPSampler
sampler = OptGPSampler(model, processes=4)
sampler.sample(1000)
validation = sampler.validate(sampler.samples)
print(validation.value_counts())  # Should be all 'v' for valid
```

### 8. 生产包络线

计算表型相平面：
```python
from cobra.flux_analysis import production_envelope

# Standard production envelope
envelope = production_envelope(
    model,
    reactions=["EX_glc__D_e", "EX_o2_e"],
    objective="EX_ac_e"  # Acetate production
)

# With carbon yield
envelope = production_envelope(
    model,
    reactions=["EX_glc__D_e", "EX_o2_e"],
    carbon_sources="EX_glc__D_e"
)

# Visualize (use matplotlib or pandas plotting)
import matplotlib.pyplot as plt
envelope.plot(x="EX_glc__D_e", y="EX_o2_e", kind="scatter")
plt.show()
```

### 9. 缺口填补

添加反应以使模型可行：
```python
from cobra.flux_analysis import gapfill

# Provide a universal reaction database (SBML/JSON); not bundled in cobra 0.31+
from cobra.io import read_sbml_model
universal = read_sbml_model("path/to/universal_reactions.xml")

# Perform gapfilling
with model:
    # Remove reactions to create gaps for demonstration
    model.remove_reactions([model.reactions.PGI])

    # Find reactions needed
    solution = gapfill(model, universal)
    print(f"Reactions to add: {solution}")
```

### 10. 模型构建

从头开始构建模型：
```python
from cobra import Model, Reaction, Metabolite

# Create model
model = Model("my_model")

# Create metabolites
atp_c = Metabolite("atp_c", formula="C10H12N5O13P3",
                   name="ATP", compartment="c")
adp_c = Metabolite("adp_c", formula="C10H12N5O10P2",
                   name="ADP", compartment="c")
pi_c = Metabolite("pi_c", formula="HO4P",
                  name="Phosphate", compartment="c")

# Create reaction
reaction = Reaction("ATPASE")
reaction.name = "ATP hydrolysis"
reaction.subsystem = "Energy"
reaction.lower_bound = 0.0
reaction.upper_bound = 1000.0

# Add metabolites with stoichiometry
reaction.add_metabolites({
    atp_c: -1.0,
    adp_c: 1.0,
    pi_c: 1.0
})

# Add gene-reaction rule
reaction.gene_reaction_rule = "(gene1 and gene2) or gene3"

# Add to model
model.add_reactions([reaction])

# Add boundary reactions
model.add_boundary(atp_c, type="exchange")
model.add_boundary(adp_c, type="demand")

# Set objective
model.objective = "ATPASE"
```

## 常见工作流

### 工作流 1：加载模型并预测生长

```python
from cobra.io import load_model

# Load model (textbook = fast tutorial; iJO1366 / iML1515 for genome-scale)
model = load_model("textbook")

# Run FBA
solution = model.optimize()
print(f"Growth rate: {solution.objective_value:.3f} /h")

# Show active pathways
print(solution.fluxes[solution.fluxes.abs() > 1e-6])
```

### 工作流 2：基因敲除筛选

```python
from cobra.io import load_model
from cobra.flux_analysis import single_gene_deletion

# Load model
model = load_model("textbook")
baseline = model.slim_optimize()

# Perform single gene deletions
results = single_gene_deletion(model)

# Find essential genes (growth < threshold)
essential_genes = results[results["growth"] < 0.01]
print(f"Found {len(essential_genes)} essential genes")

# Find genes with minimal impact
neutral_genes = results[results["growth"] > 0.9 * baseline]
```

### 工作流 3：培养基优化

```python
from cobra.io import load_model
from cobra.medium import minimal_medium

# Load model
model = load_model("textbook")

# Calculate minimal medium for 50% of max growth
target_growth = model.slim_optimize() * 0.5
min_medium = minimal_medium(
    model,
    target_growth,
    minimize_components=True
)

print(f"Minimal medium components: {len(min_medium)}")
print(min_medium)
```

### 工作流 4：通量不确定性分析

```python
from cobra.io import load_model
from cobra.flux_analysis import flux_variability_analysis
from cobra.sampling import sample

# Load model
model = load_model("textbook")

# First check flux ranges at optimality
fva = flux_variability_analysis(model, fraction_of_optimum=1.0)

# For reactions with large ranges, sample to understand distribution
samples = sample(model, n=1000)

# Analyze specific reaction
reaction_id = "PFK"
import matplotlib.pyplot as plt
samples[reaction_id].hist(bins=50)
plt.xlabel(f"Flux through {reaction_id}")
plt.ylabel("Frequency")
plt.show()
```

### 工作流 5：临时修改的上下文管理器

使用上下文管理器进行临时修改：
```python
# Model remains unchanged outside context
with model:
    # Temporarily change objective
    model.objective = "ATPM"

    # Temporarily modify bounds
    model.reactions.EX_glc__D_e.lower_bound = -5.0

    # Temporarily knock out genes
    model.genes.b0008.knock_out()

    # Optimize with changes
    solution = model.optimize()
    print(f"Modified growth: {solution.objective_value}")

# All changes automatically reverted
solution = model.optimize()
print(f"Original growth: {solution.objective_value}")
```

## 核心概念

### DictList 对象
模型使用 `DictList` 对象表示反应、代谢物和基因——其行为同时类似于列表和字典：
```python
# Access by index
first_reaction = model.reactions[0]

# Access by ID
pfk = model.reactions.get_by_id("PFK")

# Query methods
atp_reactions = model.reactions.query("atp")
```

### 通量约束
反应边界定义了可行通量范围：
- **不可逆**：`lower_bound = 0, upper_bound > 0`
- **可逆**：`lower_bound < 0, upper_bound > 0`
- 使用 `.bounds` 同时设置两个边界，以避免不一致

### 基因-反应规则（GPR）
将基因与反应关联起来的布尔逻辑：
```python
# AND logic (both required)
reaction.gene_reaction_rule = "gene1 and gene2"

# OR logic (either sufficient)
reaction.gene_reaction_rule = "gene1 or gene2"

# Complex logic
reaction.gene_reaction_rule = "(gene1 and gene2) or (gene3 and gene4)"
```

### 交换反应
表示代谢物输入/输出的特殊反应：
- 按照惯例，以前缀 `EX_` 命名
- 正通量 = 分泌，负通量 = 摄取
- 通过 `model.medium` 字典管理

## 最佳实践

1. **使用上下文管理器**进行临时修改，以避免状态管理问题
2. **在分析前验证模型**，使用 `model.slim_optimize()` 确保模型可行
3. **优化后检查解状态**——`optimal` 表示求解成功
4. **当热力学可行性很重要时，使用无环 FVA**
5. **在 FVA 中适当设置 `fraction_of_optimum`**，以探索次优空间
6. **对计算开销较大的操作进行并行化**（采样、双基因敲除）——在基因组规模模型上从较小的 `n` 和 `processes=1` 开始
7. **优先使用 SBML 格式**进行模型交换和长期存储
8. **仅需要目标值时使用 `slim_optimize()`**，以提升性能
9. **验证通量样本**，确保数值稳定性
10. **在根据工作流示例写入 CSV/PNG 文件前，确认输出路径**

## 故障排除

**不可行解**：检查培养基约束、反应边界和模型一致性  
**优化速度慢**：通过 `model.solver` 尝试不同的求解器（GLPK、CPLEX、Gurobi）  
**无界解**：确认交换反应具有适当的上界  
**导入错误**：确保文件格式正确且 SBML 标识符有效

## 参考资料

如需了解详细的工作流和 API 模式，请参阅：
- `references/workflows.md` - 全面的分步工作流示例
- `references/api_quick_reference.md` - 常用函数签名和模式

官方文档：https://cobrapy.readthedocs.io/en/latest/