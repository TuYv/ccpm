---
name: alterlab-rowan
description: Drives the Rowan cloud quantum-chemistry platform via its Python API for computational chemistry — pKa prediction, geometry optimization, conformer searching, molecular property calculations, protein-ligand docking (AutoDock Vina), and AI protein cofolding (Chai-1, Boltz-1/2), with cloud compute and no local setup. Use when running DFT or semiempirical methods, neural network potentials (AIMNet2), molecular property or protein-ligand binding predictions, or automated computational chemistry pipelines. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: API required
metadata:
    skill-author: AlterLab
    version: "1.1.0"
---
# Rowan：基于云的量子化学平台

## 概述

Rowan 是一个基于云的计算化学平台，通过 Python API 提供对量子化学工作流的编程访问。它支持自动执行复杂的分子模拟，无需本地计算资源，也无需掌握多个量子化学软件包的专业知识。

**主要功能：**
- 分子性质预测（pKa、氧化还原电位、溶解度、ADMET-Tox）
- 几何结构优化和构象搜索
- 使用 AutoDock Vina 进行蛋白质-配体对接
- 使用 Chai-1 和 Boltz 模型进行 AI 驱动的蛋白质共折叠
- 支持 DFT、半经验方法和神经网络势方法
- 自动分配资源的云计算

**选择 Rowan 的理由：**
- 无需本地计算集群
- 通过统一 API 使用数十种计算方法
- 可在 labs.rowansci.com 的 Web 界面中查看结果
- 自动扩缩计算资源

## 安装与身份验证

### 安装

要求 Python >= 3.12。本技能面向 `rowan-python` 3.x（当前主版本；v2 使用不同的结果 API）。

```bash
uv pip install "rowan-python>=3.0"
```

安装 `rowan-python` 时还会安装 `stjames`（分子/结果模型）和 `rdkit`。

### 身份验证

在 [labs.rowansci.com/account/api-keys](https://labs.rowansci.com/account/api-keys) 生成 API 密钥。

**方式 1：直接赋值**
```python
import rowan
rowan.api_key = "your_api_key_here"
```

**方式 2：环境变量（推荐）**
```bash
export ROWAN_API_KEY="your_api_key_here"
```

导入模块时，会自动从 `ROWAN_API_KEY` 读取 API 密钥。

### 验证设置

```python
import rowan

# Check authentication
user = rowan.whoami()
print(f"Logged in as: {user.username}")
print(f"Credits available: {user.credits}")
```

## 结果模式（请先阅读此部分）

每个 `submit_*_workflow` 都会返回一个 `Workflow`。请勿手动读取 `workflow.data[...]`，也不要调用已弃用的 `wait_for_result()`。v3 的惯用方式只需一次调用：

```python
workflow = rowan.submit_pka_workflow("c1ccccc1O", name="phenol pKa")
result = workflow.result()        # blocks until done, returns a typed WorkflowResult
print(result.strongest_acid)      # typed attribute access, not a dict key
```

要点：
- `workflow.result(wait=True, poll_interval=5)` 会阻塞、获取结果，并在工作流失败或停止时引发 `rowan.WorkflowError`。使用 `wait=False` 可在不阻塞的情况下获取当前已经就绪的内容。
- `workflow.status` 是**整数**枚举 `stjames.Status`（`QUEUED=0, RUNNING=1, COMPLETED_OK=2, FAILED=3, STOPPED=4`），而不是字符串。应使用 `workflow.done()` / `workflow.is_finished()`，而不是与 `"completed"` 进行比较。
- `submit_*` 函数接受 SMILES 字符串、`stjames.Molecule` 或 RDKit `Mol`，可直接将其作为 `initial_molecule` 传入——通常无需先构建分子。`stjames.Molecule.from_smiles(smiles)` 只接受 SMILES（不接受 `charge=`/`multiplicity=` 关键字参数）。

## 核心工作流

### 1. pKa 预测

预测微观 pKa / 酸解离常数：

```python
import rowan

# initial_molecule accepts a SMILES string directly
workflow = rowan.submit_pka_workflow(
    "c1ccccc1O",  # Phenol
    name="phenol pKa calculation",
    pka_range=(2, 12),                  # default
    method="aimnet2_wagen2024",         # default NNP-based pKa model
)

result = workflow.result()
print(f"Strongest acid pKa: {result.strongest_acid}")
print(f"Strongest base pKa: {result.strongest_base}")
```

对于宏观 pKa、微观状态布居随 pH 的变化、等电点以及 logD/溶解度随 pH 的变化，请使用 `rowan.submit_macropka_workflow(...)`，并读取 `result.pka_values`、`result.microstates`、`result.isoelectric_point`。

### 2. 构象搜索

生成构象集合并对其进行排序：

```python
import rowan

workflow = rowan.submit_conformer_search_workflow(
    "CCCC",  # Butane
    name="butane conformer search",
    final_method="aimnet2_wb97md3",     # NNP; default
)

result = workflow.result()
print(f"Found {result.num_conformers} conformers")
for energy in result.get_energies():   # relative energies, kcal/mol
    print(f"  ΔE = {energy:.2f} kcal/mol")
lowest = result.get_conformer(0)       # stjames.Molecule of the lowest-energy conformer
```

### 3. 几何结构优化

`submit_basic_calculation_workflow` 由任务驱动：请传入 `tasks`（例如 `["optimize"]`、`["energy"]`、`["optimize", "frequencies"]`），而不是 `workflow_type` 字符串。

```python
import rowan

workflow = rowan.submit_basic_calculation_workflow(
    "CC(=O)O",  # Acetic acid
    tasks=["optimize"],
    preset="organic_nnp",     # quick NNP preset; or set method=/basis_set= explicitly
    name="acetic acid optimization",
)

result = workflow.result()
print(f"Final energy: {result.energy} Hartree")
optimized_mol = result.molecule   # stjames.Molecule with optimized coordinates
```

### 4. 蛋白质-配体对接

将小分子对接至蛋白质靶标。口袋的格式为 `[[center_x, center_y, center_z], [size_x, size_y, size_z]]`，单位为埃——它是由两个三维向量组成的列表，而不是字典。

```python
import rowan

# Create protein from a PDB ID (fetched from RCSB)
protein = rowan.create_protein_from_pdb_id(name="EGFR kinase", code="1M17")
protein.sanitize()   # strip waters/ions, fix residues

pocket = [[10.0, 20.0, 30.0],    # center (Å)
          [20.0, 20.0, 20.0]]    # box size (Å)

workflow = rowan.submit_docking_workflow(
    protein=protein,             # Protein object or its .uuid
    pocket=pocket,
    initial_molecule="Cc1ccc(NC(=O)c2ccc(CN3CCN(C)CC3)cc2)cc1",
    scoring_function="vinardo",  # or "vina"
    name="EGFR docking",
)

result = workflow.result()
best = result.scores[0]          # DockingScore, sorted best-first
print(f"Best docking score: {best.score} kcal/mol")
best_pose = result.best_pose     # stjames.Molecule of the top pose
```

### 5. 蛋白质共折叠（AI 结构预测）

使用 AI 模型预测蛋白质-配体复合物结构：

```python
import rowan

protein_seq = "MENFQKVEKIGEGTYGVVYKARNKLTGEVVALKKIRLDTETEGVPSTAIREISLLKELNHPNIVKLLDVIHTENKLYLVFEFLHQDLKKFMDASALTGIPLPLIKSYLFQLLQGLAFCHSHRVLHRDLKPQNLLINTEGAIKLADFGLARAFGVPVRTYTHEVVTLWYRAPEILLGCKYYSTAVDIWSLGCIFAEMVTRRALFPGDSEIDQLFRIFRTLGTPDEVVWPGVTSMPDYKPSFPKWARQDFSKVVPPLDEDGRSLLSQMLHYDPNKRISAKAALAHPFFQDVTKPVPHLRL"
ligand = "CCC(C)CN=C1NCC2(CCCOC2)CN1"

workflow = rowan.submit_protein_cofolding_workflow(
    initial_protein_sequences=[protein_seq],
    initial_smiles_list=[ligand],
    name="kinase-ligand cofolding",
    model="chai_1r",   # or "boltz_1", "boltz_2", "openfold_3"
)

result = workflow.result()
top = result.predictions[0]            # first CofoldingResult sample
print(f"pTM: {top.scores.ptm}")        # predicted TM score (0-1)
print(f"interface pTM: {top.scores.iptm}")
```

> 注意：共折叠模型字符串为 `chai_1r`、`boltz_1`、`boltz_2`、`openfold_3`（不存在 `boltz_1x`）。置信度位于 `result.scores` / 每个预测结果的 `.scores` 中，具体为 `.ptm` 和 `.iptm`。

## 工作流管理

### 列出和查询工作流

```python
# List recent workflows (page is 0-indexed; default size=10)
workflows = rowan.list_workflows(size=10)
for wf in workflows:
    print(f"{wf.name}: {wf.status.name}")   # status is an int enum

# Filter by type / name substring / folder
pka_runs = rowan.list_workflows(workflow_type="pka", name_contains="phenol")
folder_runs = rowan.list_workflows(parent_uuid=folder.uuid)

# Retrieve specific workflow
workflow = rowan.retrieve_workflow("workflow-uuid")
```

### 批量操作

```python
# Submit many workflows of one type at once
workflows = rowan.batch_submit_workflow(
    workflow_type="pka",
    initial_smileses=["CCO", "CC(=O)O", "c1ccccc1O"],
)

# Non-blocking status poll (returns a list of {uuid, status, ...} dicts)
statuses = rowan.batch_poll_status([wf.uuid for wf in workflows])
```

### 文件夹组织

```python
# Create folder for project
folder = rowan.create_folder(name="Drug Discovery Project")

# Submit workflow to folder
workflow = rowan.submit_pka_workflow(
    "CCO",
    name="compound pKa",
    folder=folder,          # or folder_uuid=folder.uuid
)

# List workflows in folder
folder_workflows = rowan.list_workflows(parent_uuid=folder.uuid)
```

## 计算方法

Rowan 支持多个理论水平：

**神经网络势：**
- AIMNet2 (ωB97M-D3) - 快速且准确
- Egret - Rowan 的专有模型

**半经验方法：**
- GFN1-xTB, GFN2-xTB - 适用于大型分子的快速计算

**DFT：**
- B3LYP, PBE, ωB97X 变体
- 提供多种基组

系统会根据工作流类型自动选择方法，也可以在工作流参数中显式指定方法。

## 参考文档

有关详细的 API 文档，请参阅以下参考文件：

- **`references/api_reference.md`**：工作流类、提交函数、检索方法、结果模式
- **`references/workflow_types.md`**：完整的工作流类型及其参数集合——pKa、对接、共折叠等
- **`references/molecule_handling.md`**：stjames.Molecule 类——从 SMILES、XYZ、RDKit 创建分子
- **`references/proteins_and_organization.md`**：蛋白质上传、文件夹管理、项目组织
- **`references/results_interpretation.md`**：理解工作流输出、置信度分数和验证

## 常见模式

### 模式 1：性质预测流水线

先提交所有任务，然后收集结果——提交操作是非阻塞的，`result()` 会阻塞。

```python
import rowan

smiles_list = ["CCO", "c1ccccc1O", "CC(=O)O"]

# Submit all pKa calculations (SMILES strings are accepted directly)
workflows = [rowan.submit_pka_workflow(smi, name=f"pKa: {smi}") for smi in smiles_list]

# Collect results
for wf in workflows:
    result = wf.result()
    print(f"{wf.name}: pKa = {result.strongest_acid}")
```

### 模式 2：虚拟筛选

针对单个靶点筛选化合物库时，优先使用专用的批量对接工作流，而不是 Python 循环。

```python
import rowan

protein = rowan.upload_protein(name="Drug Target", file_path="target.pdb")
protein.sanitize()

pocket = [[x, y, z], [20.0, 20.0, 20.0]]   # center, size (Å)

workflow = rowan.submit_batch_docking_workflow(
    smiles_list=compound_library,
    protein=protein,
    pocket=pocket,
    name="library screen",
)
result = workflow.result()
```

### 模式 3：基于构象的分析

```python
import rowan

conf_wf = rowan.submit_conformer_search_workflow(
    "C1CCCCC1",  # any SMILES
    name="conformer search",
)
result = conf_wf.result()

energies = result.get_energies()   # relative energies, kcal/mol, ascending
print(f"Found {result.num_conformers} conformers")
print(f"Energy range: {energies[0]:.2f} to {energies[-1]:.2f} kcal/mol")
```

## 最佳实践

1. **通过环境变量设置 API 密钥**，以提高安全性和便利性
2. **使用文件夹**组织相关工作流
3. **使用 `workflow.result()`**——它会在一次调用中完成等待、获取结果，并在失败时抛出异常
4. 对大量相似任务**使用批量函数**（`batch_submit_workflow`、`submit_batch_docking_workflow`）
5. 在任何提交中使用 `max_credits=` **设置支出上限**，并检查 `rowan.whoami().credits`

## 错误处理

如果工作流失败或已停止，`workflow.result()` 会抛出 `rowan.WorkflowError`，因此请将其封装起来：

```python
import rowan

workflow = rowan.submit_pka_workflow("c1ccccc1O", name="calculation", max_credits=10)

try:
    result = workflow.result()       # blocks until done; raises on failure
    print(result.strongest_acid)
except rowan.WorkflowError as e:
    # workflow failed/stopped — inspect workflow.logfile for details
    print(f"Workflow failed: {e}")
    print(workflow.logfile)
```

`workflow.status` 是 int 枚举 `stjames.Status`；可使用 `workflow.done()` 进行非阻塞式完成状态检查。

## 其他资源

- **Web 界面**：https://labs.rowansci.com
- **文档**：https://docs.rowansci.com
- **教程**：https://docs.rowansci.com/tutorials