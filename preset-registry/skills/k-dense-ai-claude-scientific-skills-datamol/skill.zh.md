---
name: datamol
description: Pythonic wrapper around RDKit with simplified interface and sensible defaults. Preferred for standard drug discovery including SMILES parsing, standardization, descriptors, fingerprints, clustering, 3D conformers, parallel processing. Returns native rdkit.Chem.Mol objects. For advanced control or custom parameters, use rdkit directly.
license: Apache-2.0 license
allowed-tools: Read Write Edit Bash
compatibility: Requires Python 3.8+ and datamol (uv pip install). RDKit is installed automatically as a datamol dependency (since 0.12.2). Optional s3fs/gcsfs for cloud I/O via fsspec.
metadata:
  version: "1.1"
  skill-author: K-Dense Inc.
---
# Datamol 化学信息学技能

## 概述

Datamol 是一个 Python 库，为基于分子的化学信息学提供了轻量、符合 Python 风格的 RDKit 抽象层。通过合理的默认设置、高效的并行化和现代化的 I/O 功能，简化复杂的分子操作。所有分子对象都是原生的 `rdkit.Chem.Mol` 实例，从而确保与 RDKit 生态系统完全兼容。

**版本说明：** 示例针对 **datamol 0.12.x**（PyPI 稳定版：**0.12.5**，2024 年 6 月）。从 0.10.0 开始，模块默认采用延迟加载（设置 `DATAMOL_DISABLE_LAZY_LOADING=1` 可禁用）。从 0.12.2 开始，RDKit 成为 datamol 在 PyPI 上的直接依赖项。指纹使用 RDKit 的 `rdFingerprintGenerator` API（0.12.5+）。

**主要功能**：
- 分子格式转换（SMILES、SELFIES、InChI）
- 结构标准化和清理
- 分子描述符和指纹
- 3D 构象生成和分析
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

datamol 会自动安装 RDKit。对于远程文件路径（S3、GCS、HTTP），请安装对应的 fsspec 后端：

```bash
uv pip install s3fs   # AWS S3
uv pip install gcsfs  # Google Cloud Storage
```

**导入约定**：
```python
import datamol as dm
```

## 核心工作流

[references/core_workflows.md](references/core_workflows.md) 中记录了十个工作流领域，每个领域都包含可运行的代码示例：

| # | 领域 | 涵盖内容 |
| --- | --- | --- |
| 1 | 基本分子处理 | `to_mol`、批量转换、错误处理、规范化和异构体 SMILES、清理和完整标准化 |
| 2 | 文件读写 | SDF、SMILES、CSV、带渲染结构的 Excel、通用读写器，以及云端或 HTTPS 路径 |
| 3 | 描述符和属性 | 标准描述符集、并行计算、芳香性、立体化学、柔性和筛选 |
| 4 | 指纹和相似性 | ECFP4 及其他类型、成对距离和跨集合距离、最近邻查找（Tanimoto 距离 = 1 − 相似性） |
| 5 | 聚类和多样性 | 相似性聚类、多样性子集选择和聚类中心 |
| 6 | 骨架分析 | Bemis-Murcko 骨架、分组和计数，以及骨架不相交的训练集/测试集划分 |
| 7 | 片段化 | 分子片段化、查找库中的共有片段，以及基于片段的评分 |
| 8 | 3D 构象 | 生成、访问、RMSD 聚类、代表性构象选择和 SASA |
| 9 | 可视化 | 网格、文件、用于发表的 SVG、子结构对齐、原子和键高亮、构象显示 |
| 10 | 化学反应 | 反应 SMARTS、应用于单个分子或整个分子库 |

三个端到端流程——加载/筛选/分析、按骨架系列进行 SAR 分析，以及虚拟筛选——位于 [references/workflow_patterns.md](references/workflow_patterns.md) 中。

## 并行化

Datamol 为许多操作提供内置并行化功能。使用 `n_jobs` 参数：
- `n_jobs=1`：顺序执行（不使用并行化）
- `n_jobs=-1`：使用所有可用的 CPU 核心
- `n_jobs=4`：使用 4 个核心

**支持并行化的函数**：
- `dm.read_sdf(..., n_jobs=-1)`
- `dm.descriptors.batch_compute_many_descriptors(..., n_jobs=-1)`
- `dm.cluster_mols(..., n_jobs=-1)`
- `dm.pdist(..., n_jobs=-1)`
- `dm.conformers.sasa(..., n_jobs=-1)`

**进度条**：许多批量操作支持 `progress=True` 参数。

## 参考文档

如需详细的 API 文档，请查阅以下参考文件：

- **`references/core_api.md`**：核心命名空间函数（转换、标准化、指纹、聚类）
- **`references/io_module.md`**：文件 I/O 操作（读取/写入 SDF、CSV、Excel、远程文件）
- **`references/conformers_module.md`**：3D 构象生成、聚类、SASA 计算
- **`references/descriptors_viz.md`**：分子描述符和可视化函数
- **`references/fragments_scaffolds.md`**：骨架提取、BRICS/RECAP 碎片化
- **`references/reactions_data.md`**：化学反应和玩具数据集

## 最佳实践

1. **始终标准化**来自外部来源的分子：
   ```python
   mol = dm.standardize_mol(mol, disconnect_metals=True, normalize=True, reionize=True)
   ```

2. 在解析分子后**检查 None 值**：
   ```python
   mol = dm.to_mol(smiles)
   if mol is None:
       # Handle invalid SMILES
   ```

3. 对大型数据集**使用并行处理**：
   ```python
   result = dm.operation(..., n_jobs=-1, progress=True)
   ```

4. **仅在被要求时使用云端 I/O** — 确认远程写入路径；按需安装 `s3fs`/`gcsfs`：
   ```python
   df = dm.read_sdf("s3://bucket/compounds.sdf")
   ```

5. 为相似性计算**使用合适的指纹**：
   - ECFP (Morgan)：通用用途，结构相似性
   - MACCS：速度快，特征空间较小
   - Atom pairs：考虑原子对及其距离

6. **考虑规模限制**：
   - Butina 聚类：约 1,000 个分子（完整距离矩阵）
   - 对于更大的数据集：使用多样性选择或层次方法

7. 用于 ML 的**骨架拆分**：确保按骨架正确划分训练集/测试集

8. 在可视化 SAR 系列时**对齐分子**

## 错误处理

```python
# Safe molecule creation
def safe_to_mol(smiles):
    try:
        mol = dm.to_mol(smiles)
        if mol is not None:
            mol = dm.standardize_mol(mol)
        return mol
    except Exception as e:
        print(f"Failed to process {smiles}: {e}")
        return None

# Safe batch processing
valid_mols = []
for smiles in smiles_list:
    mol = safe_to_mol(smiles)
    if mol is not None:
        valid_mols.append(mol)
```

## 与机器学习集成

Datamol 将 `scipy` 和 `scikit-learn` 作为依赖项提供。将它们作为普通 PyPI 包正常导入即可——它们不是此技能中捆绑的脚本。

```python
import numpy as np

# Feature generation
X = np.array([dm.to_fp(mol) for mol in mols])

# Or descriptors
desc_df = dm.descriptors.batch_compute_many_descriptors(mols, n_jobs=-1)
X = desc_df.values

# Train model (scikit-learn PyPI package)
from sklearn.ensemble import RandomForestRegressor  # third-party library
model = RandomForestRegressor()
model.fit(X, y_target)

# Predict
predictions = model.predict(X_test)
```

## 故障排除

**问题**：分子解析失败
- **解决方案**：先使用 `dm.standardize_smiles()`，或尝试 `dm.fix_mol()`

**问题**：聚类时出现内存错误
- **解决方案**：对于大型数据集，使用 `dm.pick_diverse()` 代替完整聚类

**问题**：构象生成速度慢
- **解决方案**：减少 `n_confs` 或增加 `rms_cutoff`，以生成更少的构象

**问题**：远程文件访问失败
- **解决方案**：安装匹配的 fsspec 后端（`uv pip install s3fs` 或 `gcsfs`），并验证仅设置了该后端所需的提供商凭证（参见上文的远程文件支持）

## 其他资源

- **Datamol 文档**：https://docs.datamol.io/
- **RDKit 文档**：https://www.rdkit.org/docs/
- **GitHub 仓库**：https://github.com/datamol-io/datamol