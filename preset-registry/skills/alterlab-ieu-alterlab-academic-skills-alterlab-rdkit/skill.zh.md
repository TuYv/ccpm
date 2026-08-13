---
name: alterlab-rdkit
description: Provides the RDKit cheminformatics toolkit for low-level, fine-grained molecular primitives — SMILES/SDF parsing, descriptors (MW, LogP, TPSA), fingerprints, substructure/SMARTS search, 2D/3D coordinate generation, similarity, and reaction handling. Use when custom sanitization, specialized fingerprint or descriptor algorithms, reaction enumeration, or conformer generation demand direct API control; for a high-level pandas-friendly wrapper over RDKit prefer alterlab-datamol, and for turning molecules into ML feature vectors prefer alterlab-molfeat. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# RDKit 化学信息学工具包

## 概述

RDKit 是一个综合性的化学信息学库，提供用于分子分析和操作的 Python API。本技能提供有关分子结构读写、描述符计算、分子指纹生成、子结构搜索、化学反应、2D/3D 坐标生成以及分子可视化的指导。可将本技能用于药物发现、计算化学和化学信息学研究任务。

## 何时使用

当你需要对分子进行精细控制时，请使用本技能，例如自定义净化、专用指纹或描述符、反应枚举、构象生成或以编程方式绘图。对于接口更简单的标准高级工作流，优先使用 **datamol**（RDKit 的封装库）。

## 核心能力

RDKit 提供十二个能力领域。下面分别使用最常见的单个调用对其进行概述；**每个领域完整且可运行的方案均位于 `references/code_recipes.md` 中。**

### 1. 分子输入/输出与创建

读取和写入 SMILES、MOL/SDF、MOL2、PDB 和 InChI 格式的分子。使用 Supplier/Writer 对象进行批处理，包括用于大型文件或 gzip 压缩文件的 `ForwardSDMolSupplier` 和 `MultithreadedSDMolSupplier`。

```python
from rdkit import Chem
mol = Chem.MolFromSmiles('Cc1ccccc1')   # returns Mol or None
smiles = Chem.MolToSmiles(mol)          # canonical SMILES
```

每个 `MolFrom*` 函数在失败时都会返回 `None`——使用前务必检查。分子在导入时会自动进行净化。

### 2. 分子净化与验证

解析过程会执行包含 13 个步骤的净化流程（价态检查、芳香性识别、手性指派）。可通过 `sanitize=False`、`SanitizeMol`、部分 `sanitizeOps` 对其进行控制，并使用 `DetectChemistryProblems` 诊断失败原因。

```python
mol = Chem.MolFromSmiles('C1=CC=CC=C1', sanitize=False)
problems = Chem.DetectChemistryProblems(mol)
```

常见失败模式包括：价态溢出、无效芳香环的凯库勒化错误，以及未指派的自由基。

### 3. 分子分析与属性

遍历原子/化学键、查询环成员关系（`GetRingInfo`、`GetSymmSSSR`）、检查立体化学（`FindMolChiralCenters`、`AssignStereochemistryFrom3D`、`bond.GetStereo`），以及分解结构（`GetMolFrags`、`FragmentOnBonds`、Murcko 骨架）。

```python
for atom in mol.GetAtoms():
    print(atom.GetSymbol(), atom.GetIdx(), atom.GetDegree())
```

### 4. 分子描述符与属性

计算单个描述符（`MolWt`、`MolLogP`、`TPSA`、`NumHDonors`、`NumHAcceptors`、`NumRotatableBonds`），或使用 `CalcMolDescriptors` 一次性计算所有描述符。支持基于 Lipinski 五规则的类药性检查。

```python
from rdkit.Chem import Descriptors
all_descriptors = Descriptors.CalcMolDescriptors(mol)   # dict of every descriptor
```

可用描述符的完整目录记录在 `references/descriptors_reference.md` 中。

### 5. 分子指纹与分子相似性

通过 `rdFingerprintGenerator` 生成 RDKit 拓扑指纹、Morgan 指纹（类似 ECFP）、MACCS 指纹、原子对指纹、拓扑扭转指纹和 Avalon 指纹。使用 Tanimoto/Dice/Cosine（及其批量变体）进行比较，并使用 Butina 进行聚类。

```python
from rdkit.Chem import rdFingerprintGenerator
from rdkit import DataStructs
gen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
sim = DataStructs.TanimotoSimilarity(gen.GetFingerprint(mol1), gen.GetFingerprint(mol2))
```

### 6. 子结构搜索与 SMARTS

使用 `HasSubstructMatch`、`GetSubstructMatch` 和 `GetSubstructMatches` 匹配 SMARTS 查询。请记住，查询中未指定的属性可匹配任何值，而芳香族/带电查询原子无法匹配脂肪族/不带电的目标原子。

```python
query = Chem.MolFromSmarts('C(=O)[OH]')   # carboxylic acid
matches = mol.GetSubstructMatches(query)
```

经过整理的官能团、环、药效团和 PAINS SMARTS 模式库位于 `references/smarts_patterns.md`。

### 7. 化学反应

将转换定义为反应 SMARTS（`reactants >> products`），使用 `RunReactants` 应用转换，并通过差异指纹计算反应相似度。原子映射可在转换过程中保留原子标识。

```python
from rdkit.Chem import AllChem
rxn = AllChem.ReactionFromSmarts('[C:1]=[O:2]>>[C:1][O:2]')
products = rxn.RunReactants((mol,))
```

### 8. 二维和三维坐标生成

生成二维描绘坐标（`Compute2DCoords`、模板对齐），并通过 ETKDG（`EmbedMolecule`、`EmbedMultipleConfs`）生成三维构象，使用 UFF/MMFF 进行优化，并根据 RMSD 对构象进行对齐和比较。

```python
from rdkit.Chem import AllChem
AllChem.EmbedMolecule(mol, randomSeed=42)
AllChem.MMFFOptimizeMolecule(mol)
```

### 9. 分子可视化

将分子渲染为 PIL 图像、文件或网格（`MolToImage`、`MolToFile`、`MolsToGridImage`），高亮显示子结构，通过 `MolDraw2DCairo` 自定义绘图，与 Jupyter 集成，并可视化指纹位。

```python
from rdkit.Chem import Draw
img = Draw.MolsToGridImage([mol1, mol2], molsPerRow=2, subImgSize=(200, 200))
```

### 10. 分子修改

添加/移除氢原子（`AddHs`/`RemoveHs`）、进行 Kekulé 化或重置芳香性、替换子结构（`ReplaceSubstructs`），以及使用 `rdMolStandardize.Uncharger` 中和电荷。

```python
mol_h = Chem.AddHs(mol)   # explicit hydrogens for 3D work or H-dependent properties
```

### 11. 分子哈希与标准化

使用 `rdMolHash.MolHash` 生成规范、骨架和区域异构体哈希，并生成随机化 SMILES 以用于机器学习数据增强。

```python
from rdkit.Chem import rdMolHash
scaffold_hash = rdMolHash.MolHash(mol, rdMolHash.HashFunction.MurckoScaffold)
```

### 12. 药效团与三维特征

从 `BaseFeatures.fdef` 构建特征工厂，并使用 `GetFeaturesForMol` 提取药效团特征（供体、受体、芳香性、疏水性）。

```python
from rdkit.Chem import ChemicalFeatures
features = factory.GetFeaturesForMol(mol)   # each has GetFamily/GetType/GetAtomIds
```

## 常见工作流

可复用的端到端方案。用于相同任务、可直接运行的脚本也位于 `scripts/` 中（见下文）。

### 类药性分析

```python
from rdkit import Chem
from rdkit.Chem import Descriptors

def analyze_druglikeness(smiles):
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return None

    # Calculate Lipinski descriptors
    results = {
        'MW': Descriptors.MolWt(mol),
        'LogP': Descriptors.MolLogP(mol),
        'HBD': Descriptors.NumHDonors(mol),
        'HBA': Descriptors.NumHAcceptors(mol),
        'TPSA': Descriptors.TPSA(mol),
        'RotBonds': Descriptors.NumRotatableBonds(mol)
    }

    # Check Lipinski's Rule of Five
    results['Lipinski'] = (
        results['MW'] <= 500 and
        results['LogP'] <= 5 and
        results['HBD'] <= 5 and
        results['HBA'] <= 10
    )

    return results
```

### 相似性筛选

```python
from rdkit import Chem
from rdkit.Chem import rdFingerprintGenerator
from rdkit import DataStructs

def similarity_screen(query_smiles, database_smiles, threshold=0.7):
    mfpgen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
    query_mol = Chem.MolFromSmiles(query_smiles)
    query_fp = mfpgen.GetFingerprint(query_mol)

    hits = []
    for idx, smiles in enumerate(database_smiles):
        mol = Chem.MolFromSmiles(smiles)
        if mol:
            fp = mfpgen.GetFingerprint(mol)
            sim = DataStructs.TanimotoSimilarity(query_fp, fp)
            if sim >= threshold:
                hits.append((idx, smiles, sim))

    return sorted(hits, key=lambda x: x[2], reverse=True)
```

### 子结构过滤

```python
from rdkit import Chem

def filter_by_substructure(smiles_list, pattern_smarts):
    query = Chem.MolFromSmarts(pattern_smarts)

    hits = []
    for smiles in smiles_list:
        mol = Chem.MolFromSmiles(smiles)
        if mol and mol.HasSubstructMatch(query):
            hits.append(smiles)

    return hits
```

## 最佳实践

### 错误处理

解析分子时，始终检查是否为 `None`：

```python
mol = Chem.MolFromSmiles(smiles)
if mol is None:
    print(f"Failed to parse: {smiles}")
    continue
```

### 性能优化

使用 Pickle 序列化分子以便快速重新加载，而不是重新解析；并对指纹和相似性计算使用批量操作：

```python
import pickle
with open('molecules.pkl', 'wb') as f:
    pickle.dump(mols, f)   # load side is much faster than reparsing SMILES/SDF

mfpgen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
fps = [mfpgen.GetFingerprint(mol) for mol in mols]
similarities = DataStructs.BulkTanimotoSimilarity(fps[0], fps[1:])
```

### 线程安全

对于分子 I/O、坐标生成、指纹和描述符计算、子结构搜索、反应以及绘图，RDKit 操作通常是线程安全的。**非线程安全：**并发访问 MolSuppliers——不要在线程之间共享 supplier 对象。

### 内存管理

对于大型数据集，应使用流式处理，而不是一次性将所有内容加载到内存中：

```python
# Avoid loading the entire file into memory
with open('large.sdf') as f:
    suppl = Chem.ForwardSDMolSupplier(f)
    for mol in suppl:
        # Process one molecule at a time
        pass

# Parallel processing
suppl = Chem.MultithreadedSDMolSupplier('large.sdf', numWriterThreads=4)
```

## 常见陷阱

1. **忘记检查 None：**解析后始终验证分子
2. **清理失败：**使用 `DetectChemistryProblems()` 进行调试
3. **缺少氢原子：**计算依赖氢原子的性质时使用 `AddHs()`
4. **2D 与 3D：**在可视化或 3D 分析之前生成适当的坐标
5. **SMARTS 匹配规则：**请记住，未指定的属性可以匹配任何值
6. **MolSuppliers 的线程安全性：**不要在线程之间共享 supplier 对象

## 资源

### references/

- `code_recipes.md` — 上述十二个功能领域的完整可运行代码
- `api_reference.md` — 按功能组织的 RDKit 模块、函数和类的完整列表
- `descriptors_reference.md` — 可用分子描述符及其说明的完整列表
- `smarts_patterns.md` — 官能团和结构特征的常用 SMARTS 模式

当需要具体的 API 细节、参数信息或模式示例时，请加载这些参考资料。

### scripts/

常见 RDKit 工作流的示例脚本：

- `molecular_properties.py` — 计算全面的分子属性和描述符
- `similarity_search.py` — 执行基于指纹的相似性筛选
- `substructure_filter.py` — 按子结构模式筛选分子

这些脚本可以直接执行，也可以用作自定义工作流的模板。

AlterLab Academic Skills 套件的一部分。