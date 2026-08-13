---
name: alterlab-datamol
description: Wraps RDKit in a high-level, pandas-friendly datamol interface with sensible defaults for everyday drug discovery — SMILES/SDF loading into DataFrames, molecule standardization, descriptors, fingerprints, Butina clustering, 3D conformer generation, scaffold analysis, and parallel batch processing, returning native rdkit.Chem.Mol objects. Use when running standard cheminformatics pipelines on molecule tables with minimal boilerplate; for low-level control, custom sanitization, or specialized algorithms prefer alterlab-rdkit. Part of the AlterLab Academic Skills suite.
license: Apache-2.0
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# Datamol 化学信息学 Skill

## 概述

Datamol 是一个 Python 库，在 RDKit 之上提供轻量级、符合 Python 风格的分子化学信息学抽象层。它通过合理的默认设置、高效的并行化和现代化的 I/O 功能，简化复杂的分子操作。所有分子对象均为原生 `rdkit.Chem.Mol` 实例，确保与 RDKit 生态系统完全兼容。

**核心功能**：
- 分子格式转换（SMILES、SELFIES、InChI）
- 结构标准化和净化
- 分子描述符和指纹
- 3D 构象生成与分析
- 聚类和多样性选择
- 骨架和片段分析
- 化学反应应用
- 可视化和对齐
- 支持并行化的批处理
- 通过 fsspec 支持云存储

## 安装和设置

指导用户安装 datamol：

```bash
uv pip install datamol
```

此处的示例已基于 **datamol 0.12.x** 验证（会自动引入 RDKit）。下文中的描述符键名在此版本系列中保持稳定；如果依赖这些键名，请固定版本：`uv pip install 'datamol>=0.12,<0.13'`。

**导入约定**：
```python
import datamol as dm
```

## 核心工作流

下面的每个小节都展示了主要调用模式。完整的 API 签名、参数和补充示例位于各小节所引用的模块参考文件中；完整的多步骤流水线位于 `references/workflow_recipes.md`。

### 1. 基本分子处理

```python
import datamol as dm

# Parse SMILES (returns None on failure)
mol = dm.to_mol("CCO")                        # Ethanol
mols = [dm.to_mol(smi) for smi in ["CCO", "c1ccccc1", "CC(=O)O"]]
if dm.to_mol("invalid_smiles") is None:
    print("Failed to parse SMILES")

# Export to common formats (canonical + isomeric by default)
smiles   = dm.to_smiles(mol)                  # keeps stereochemistry
flat     = dm.to_smiles(mol, isomeric=False)  # drops stereochemistry
inchi    = dm.to_inchi(mol)
inchikey = dm.to_inchikey(mol)
selfies  = dm.to_selfies(mol)

# Standardize user-provided molecules (recommended for datasets)
mol = dm.sanitize_mol(mol)
mol = dm.standardize_mol(mol, disconnect_metals=True, normalize=True, reionize=True)
clean_smiles = dm.standardize_smiles(smiles)
```

完整的转换、净化和标准化 API：请参阅 `references/core_api.md`。

### 2. 读取和写入分子文件

```python
# Read (open_df auto-detects .sdf/.csv/.xlsx/.parquet/.json)
df = dm.read_sdf("compounds.sdf", mol_column='mol')
df = dm.read_csv("data.csv", smiles_column="SMILES", mol_column="mol")
df = dm.open_df("file.sdf")

# Write
dm.to_sdf(mols, "output.sdf")               # or dm.to_sdf(df, "output.sdf", mol_column="mol")
dm.to_smi(mols, "output.smi")
dm.to_xlsx(df, "output.xlsx", mol_columns=["mol"])   # renders molecule images in cells

# Remote paths work everywhere via fsspec (S3, GCS, HTTP)
df = dm.read_sdf("s3://bucket/compounds.sdf")
dm.to_sdf(mols, "s3://bucket/output.sdf")
```

完整的读取器/写入器签名（`read_smi`、`read_excel`、`read_mol2file`、`read_pdbfile`、`save_df`、共享参数）：请参阅 `references/io_module.md`。

### 3. 分子描述符与性质

```python
# Single molecule -> ~22 keys. Note datamol's naming (NOT rdkit's):
desc = dm.descriptors.compute_many_descriptors(mol)
#   {'mw': 46.04, 'clogp': -0.0, 'n_lipinski_hbd': 1, 'n_lipinski_hba': 1,
#    'tpsa': 20.23, 'n_rotatable_bonds': 0, 'qed': ..., 'fsp3': ..., 'sas': ..., ...}
# Gotcha: logP is 'clogp'; donors/acceptors are 'n_lipinski_hbd'/'n_lipinski_hba'.
# There is no 'logp', 'hbd', 'hba', or 'n_aromatic_atoms' key in this dict.

# Batch (parallel) -> DataFrame with the same keys
desc_df = dm.descriptors.batch_compute_many_descriptors(mols, n_jobs=-1, progress=True)

# Standalone descriptors not in the dict above
dm.descriptors.n_aromatic_atoms(mol)
dm.descriptors.n_stereo_centers(mol)
dm.descriptors.n_rigid_bonds(mol)

# Drug-likeness filter (Lipinski's Rule of Five) with datamol's exact key names
def is_druglike(mol):
    d = dm.descriptors.compute_many_descriptors(mol)
    return (d['mw'] <= 500 and d['clogp'] <= 5 and
            d['n_lipinski_hbd'] <= 5 and d['n_lipinski_hba'] <= 10)

druglike_mols = [m for m in mols if is_druglike(m)]
```

完整的描述符目录、RDKit 描述符访问方式和 ADME 示例：参见 `references/descriptors_viz.md`。

### 4. 分子指纹与相似性

```python
# Fingerprints (ECFP/Morgan is the default)
fp       = dm.to_fp(mol, fp_type='ecfp', radius=2, n_bits=2048)
fp_maccs = dm.to_fp(mol, fp_type='maccs')
# Also available: 'topological', 'atompair', 'fcfp'

# Similarity as Tanimoto distance (distance = 1 - similarity; lower = more similar)
distance_matrix = dm.pdist(mols, n_jobs=-1)                       # within one set
distances       = dm.cdist(query_mols, library_mols, n_jobs=-1)  # between two sets
from scipy.spatial.distance import squareform
dist_matrix = squareform(dm.pdist(mols))                         # square form
```

指纹类型以及 `pdist` / `cdist` 的详细信息：参见 `references/core_api.md`。

### 5. 聚类与多样性选择

```python
# Butina clustering (cutoff = Tanimoto distance; each cluster is a list of indices)
clusters = dm.cluster_mols(mols, cutoff=0.2, n_jobs=-1)
for i, cluster in enumerate(clusters):
    cluster_mols = [mols[idx] for idx in cluster]

# Diversity / representative selection
diverse   = dm.pick_diverse(mols, npick=100)
centroids = dm.pick_centroids(mols, npick=50)
```

**规模说明**：Butina 会构建完整的距离矩阵——对于约 1,000 个分子没有问题，但不适用于 10,000 个以上的分子。聚类参数：参见 `references/core_api.md`。

### 6. 骨架分析

```python
# Bemis-Murcko scaffold (core ring systems + linkers)
scaffold = dm.to_scaffold_murcko(mol)
scaffold_smiles = dm.to_smiles(scaffold)
```

骨架频率统计、骨架到分子的分组，以及用于机器学习的基于骨架的训练集/测试集划分：参见 `references/workflow_recipes.md`。有关 `fuzzy_scaffolding` 及更多内容：参见 `references/fragments_scaffolds.md`。

### 7. 分子片段化

```python
# BRICS (16 bond types) and RECAP (11 bond types) both return SMILES with
# attachment points like '[1*]CCN'
frags_brics = dm.fragment.brics(mol)
frags_recap = dm.fragment.recap(mol)
```

跨库片段频率分析和片段重叠评分方案：参见 `references/workflow_recipes.md`。MMPA 片段化和方法对比表：参见 `references/fragments_scaffolds.md`。

### 8. 3D 构象生成

```python
# Generate 3D conformers (ETKDGv3 recommended; UFF minimization on by default)
mol_3d = dm.conformers.generate(mol, n_confs=50, rms_cutoff=0.5,
                                minimize_energy=True, method='ETKDGv3')
mol_3d.GetNumConformers()
conf = mol_3d.GetConformer(0)
positions = conf.GetPositions()          # Nx3 array of atom coordinates

# Cluster conformers by RMSD and take representatives
clusters  = dm.conformers.cluster(mol_3d, rms_cutoff=1.0, centroids=False)
centroids = dm.conformers.return_centroids(mol_3d, clusters)

# Solvent accessible surface area
sasa_values = dm.conformers.sasa(mol_3d, n_jobs=-1)
sasa = mol_3d.GetConformer(0).GetDoubleProp('rdkit_free_sasa')
```

嵌入方法、RMSD 矩阵和底层坐标操作：参见 `references/conformers_module.md`。

### 9. 可视化

```python
# Grid image (PNG by default; use_svg=True for publications)
dm.viz.to_image(mols[:20], legends=[dm.to_smiles(m) for m in mols[:20]],
                n_cols=5, mol_size=(300, 300))
dm.viz.to_image(mols, outfile="molecules.png")
dm.viz.to_image(mols, outfile="molecules.svg", use_svg=True)

# Align by MCS for SAR series; highlight atoms/bonds; render conformers
dm.viz.to_image(similar_mols, align=True, legends=activity_labels, n_cols=4)
dm.viz.to_image(mol, highlight_atom=[0, 1, 2, 3], highlight_bond=[0, 1, 2])
dm.viz.conformers(mol_3d, n_confs=10, align_conf=True, n_cols=3)
```

完整的 `to_image` / `conformers` / `circle_grid` 参数和最佳实践：参见 `references/descriptors_viz.md`。

### 10. 化学反应

```python
from rdkit.Chem import rdChemReactions

# Build a reaction from SMARTS, then apply it to a reactant tuple
rxn = rdChemReactions.ReactionFromSmarts('[C:1](=[O:2])[OH:3]>>[C:1](=[O:2])[Cl:3]')
product = dm.reactions.apply_reaction(rxn, (dm.to_mol("CC(=O)O"),), sanitize=True)
product_smiles = dm.to_smiles(product)
```

批量应用反应、常用反应模板（酰胺化、Suzuki 偶联、酯化），以及示例用的 `datamol.data` 数据集：参见 `references/reactions_data.md`。

## 并行化

Datamol 为许多操作内置了并行化支持。使用 `n_jobs` 参数：
- `n_jobs=1`：顺序执行（不并行）
- `n_jobs=-1`：使用所有可用的 CPU 核心
- `n_jobs=4`：使用 4 个核心

**支持并行化的函数**：
- `dm.read_sdf(..., n_jobs=-1)`
- `dm.descriptors.batch_compute_many_descriptors(..., n_jobs=-1)`
- `dm.cluster_mols(..., n_jobs=-1)`
- `dm.pdist(..., n_jobs=-1)`
- `dm.conformers.sasa(..., n_jobs=-1)`

**进度条**：许多批处理操作支持 `progress=True` 参数。

## 常用工作流和模式

完整且可直接复制使用的工作管线——数据加载 → 过滤 → 分析、构效关系（SAR）分析和虚拟筛选——以及机器学习特征生成和稳健的错误处理包装器，已从本文件中移出，以保持其精简。参见 `references/workflow_recipes.md`。

## 参考文档

有关详细的 API 文档，请参阅以下参考文件：

- **`references/core_api.md`**：核心命名空间函数（转换、标准化、指纹、聚类）
- **`references/io_module.md`**：文件 I/O 操作（读取/写入 SDF、CSV、Excel、远程文件）
- **`references/conformers_module.md`**：3D 构象生成、聚类、SASA 计算
- **`references/descriptors_viz.md`**：分子描述符和可视化函数
- **`references/fragments_scaffolds.md`**：骨架提取、BRICS/RECAP 片段化
- **`references/reactions_data.md`**：化学反应和示例数据集
- **`references/workflow_recipes.md`**：端到端流水线、SAR/筛选方案、ML 集成、错误处理

## 最佳实践

1. **始终对来自外部来源的分子进行标准化**：
   ```python
   mol = dm.standardize_mol(mol, disconnect_metals=True, normalize=True, reionize=True)
   ```

2. **在解析分子后检查 None 值**：
   ```python
   mol = dm.to_mol(smiles)
   if mol is None:
       # Handle invalid SMILES
   ```

3. **对大型数据集使用并行处理**：
   ```python
   result = dm.operation(..., n_jobs=-1, progress=True)
   ```

4. **利用 fsspec 访问云存储**：
   ```python
   df = dm.read_sdf("s3://bucket/compounds.sdf")
   ```

5. **使用适当的指纹进行相似性比较**：
   - ECFP (Morgan)：通用，适用于结构相似性
   - MACCS：速度快，特征空间较小
   - 原子对：考虑原子对及其距离

6. **考虑规模限制**：
   - Butina 聚类：约 1,000 个分子（完整距离矩阵）
   - 对于更大的数据集：使用多样性选择或层次化方法

7. **用于 ML 的骨架划分**：确保按照骨架正确分离训练集和测试集

8. **可视化 SAR 系列时对齐分子**

## 故障排除

**问题**：分子解析失败
- **解决方案**：先使用 `dm.standardize_smiles()`，或尝试 `dm.fix_mol()`

**问题**：聚类时出现内存错误
- **解决方案**：对于大型数据集，使用 `dm.pick_diverse()` 代替完整聚类

**问题**：构象生成速度慢
- **解决方案**：减小 `n_confs` 或增大 `rms_cutoff`，以生成更少的构象

**问题**：远程文件访问失败
- **解决方案**：确保已安装 fsspec 和相应的云服务提供商库（s3fs、gcsfs 等）

## 其他资源

- **Datamol 文档**：https://docs.datamol.io/
- **RDKit 文档**：https://www.rdkit.org/docs/
- **GitHub 仓库**：https://github.com/datamol-io/datamol

AlterLab Academic Skills 套件的一部分。