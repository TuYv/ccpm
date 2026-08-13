---
name: alterlab-biopython
description: Manipulate biological sequences, parse FASTA/GenBank/PDB files, run phylogenetics, and access NCBI/PubMed programmatically via Biopython (Bio.SeqIO, Bio.Entrez, Bio.PDB, Bio.Blast). Use when scripting custom bioinformatics pipelines, batch-processing sequence files, automating BLAST, or fetching records from Entrez — for quick one-off database lookups use gget, for unified multi-service integration use bioservices. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with Biopython installed. NCBI Entrez access needs a contact email; an NCBI API key is optional (raises the rate limit from 3 to 10 req/s)."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# Biopython：使用 Python 进行计算分子生物学

## 概述

Biopython 是一套全面且免费提供的 Python 生物计算工具。它提供序列操作、文件 I/O、数据库访问、结构生物信息学、系统发育学以及许多其他生物信息学任务所需的功能。当前版本为 **Biopython 1.87**，支持 Python 3，并且需要 NumPy。

> **版本说明（1.78+）：** `Bio.Blast.Applications` 中的命令行应用程序封装器（`Ncbiblastn/p/x...Commandline`、`NcbimakeblastdbCommandline`）和 `Bio.Align.Applications` 中的命令行应用程序封装器（`ClustalOmegaCommandline`、`MuscleCommandline`）已在 1.78 中弃用，并且已被**移除**——它们无法再导入。请改用 `subprocess` 调用 BLAST+/比对工具的可执行文件（参见 `references/blast.md` 和 `references/alignment.md`）。`Bio.pairwise2` 已弃用；请使用 `Bio.Align.PairwiseAligner`。

## 何时使用此 Skill

在以下情况下使用此 Skill：

- 处理生物序列（DNA、RNA 或蛋白质）
- 读取、写入或转换生物学文件格式（FASTA、GenBank、FASTQ、PDB、mmCIF 等）
- 通过 Entrez 访问 NCBI 数据库（GenBank、PubMed、Protein、Gene 等）
- 运行 BLAST 搜索或解析 BLAST 结果
- 执行序列比对（双序列比对或多序列比对）
- 分析 PDB 文件中的蛋白质结构
- 创建、操作或可视化系统发育树
- 查找序列基序或分析基序模式
- 计算序列统计数据（GC 含量、分子量、熔解温度等）
- 执行结构生物信息学任务
- 处理群体遗传学数据
- 任何其他计算分子生物学任务

## 核心能力

Biopython 由模块化的子包构成，每个子包分别面向特定的生物信息学领域：

1. **序列处理** - 使用 Bio.Seq 和 Bio.SeqIO 进行序列操作和文件 I/O
2. **比对分析** - 使用 Bio.Align 和 Bio.AlignIO 进行双序列比对和多序列比对
3. **数据库访问** - 使用 Bio.Entrez 以编程方式访问 NCBI 数据库
4. **BLAST 操作** - 使用 Bio.Blast 运行和解析 BLAST 搜索
5. **结构生物信息学** - 使用 Bio.PDB 处理蛋白质三维结构
6. **系统发育学** - 使用 Bio.Phylo 操作和可视化系统发育树
7. **高级功能** - 基序、群体遗传学、序列实用工具等

## 安装和设置

安装 Biopython（需要 Python 3 和 NumPy）。在此计算机上，优先使用 `uv run` 运行脚本：

```bash
# Ad-hoc: run a script with Biopython available, no venv to manage
uv run --with biopython script.py

# Or add it to a project
uv add biopython
```

要访问 NCBI 数据库，请始终设置你的电子邮件地址（NCBI 要求）：

```python
from Bio import Entrez
Entrez.email = "your.email@example.com"

# Optional: API key for higher rate limits (10 req/s instead of 3 req/s)
Entrez.api_key = "your_api_key_here"
```

## 使用此 Skill

此 Skill 提供了按功能领域组织的综合文档。处理任务时，请查阅相关的参考文档：

### 1. 序列处理（Bio.Seq 与 Bio.SeqIO）

**参考：** `references/sequence_io.md`

适用于：
- 创建和操作生物序列
- 读取和写入序列文件（FASTA、GenBank、FASTQ 等）
- 在不同文件格式之间转换
- 从大型文件中提取序列
- 序列翻译、转录和反向互补
- 使用 SeqRecord 对象

**快速示例：**
```python
from Bio import SeqIO

# Read sequences from FASTA file
for record in SeqIO.parse("sequences.fasta", "fasta"):
    print(f"{record.id}: {len(record.seq)} bp")

# Convert GenBank to FASTA
SeqIO.convert("input.gb", "genbank", "output.fasta", "fasta")
```

### 2. 比对分析（Bio.Align 与 Bio.AlignIO）

**参考：** `references/alignment.md`

适用于：
- 双序列比对（全局和局部）
- 读取和写入多序列比对
- 使用替换矩阵（BLOSUM、PAM）
- 计算比对统计信息
- 自定义比对参数

**快速示例：**
```python
from Bio import Align

# Pairwise alignment
aligner = Align.PairwiseAligner()
aligner.mode = 'global'
alignments = aligner.align("ACCGGT", "ACGGT")
print(alignments[0])
```

### 3. 数据库访问（Bio.Entrez）

**参考：** `references/databases.md`

适用于：
- 搜索 NCBI 数据库（PubMed、GenBank、Protein、Gene 等）
- 下载序列和记录
- 获取出版物信息
- 跨数据库查找相关记录
- 在适当限制请求速率的情况下进行批量下载

**快速示例：**
```python
from Bio import Entrez
Entrez.email = "your.email@example.com"

# Search PubMed
handle = Entrez.esearch(db="pubmed", term="biopython", retmax=10)
results = Entrez.read(handle)
handle.close()
print(f"Found {results['Count']} results")
```

### 4. BLAST 操作（Bio.Blast）

**参考：** `references/blast.md`

适用于：
- 通过 NCBI Web 服务运行 BLAST 搜索
- 运行本地 BLAST 搜索
- 解析 BLAST XML 输出
- 按 E 值或一致性筛选结果
- 提取命中序列

**快速示例：**
```python
from Bio.Blast import NCBIWWW, NCBIXML

# Run BLAST search
result_handle = NCBIWWW.qblast("blastn", "nt", "ATCGATCGATCG")
blast_record = NCBIXML.read(result_handle)

# Display top hits
for alignment in blast_record.alignments[:5]:
    print(f"{alignment.title}: E-value={alignment.hsps[0].expect}")
```

### 5. 结构生物信息学（Bio.PDB）

**参考：** `references/structure.md`

适用于：
- 解析 PDB 和 mmCIF 结构文件
- 遍历蛋白质结构层级（SMCRA：Structure/Model/Chain/Residue/Atom）
- 计算距离、角度和二面角
- 二级结构指派（DSSP）
- 结构叠合与 RMSD 计算
- 从结构中提取序列

**快速示例：**
```python
from Bio.PDB import PDBParser

# Parse structure
parser = PDBParser(QUIET=True)
structure = parser.get_structure("1crn", "1crn.pdb")

# Calculate distance between alpha carbons
chain = structure[0]["A"]
distance = chain[10]["CA"] - chain[20]["CA"]
print(f"Distance: {distance:.2f} Å")
```

### 6. 系统发育学（Bio.Phylo）

**参考：** `references/phylogenetics.md`

适用于：
- 读取和写入系统发育树（Newick、NEXUS、phyloXML）
- 从距离矩阵或比对结果构建树
- 树操作（修剪、重新定根、阶梯化）
- 计算系统发育距离
- 创建共识树
- 可视化树

**快速示例：**
```python
from Bio import Phylo

# Read and visualize tree
tree = Phylo.read("tree.nwk", "newick")
Phylo.draw_ascii(tree)

# Calculate distance
distance = tree.distance("Species_A", "Species_B")
print(f"Distance: {distance:.3f}")
```

### 7. 高级功能

**参考：** `references/advanced.md`

适用于：
- **序列基序**（Bio.motifs）- 查找和分析基序模式
- **群体遗传学**（Bio.PopGen）- GenePop 文件、Fst 计算、Hardy-Weinberg 检验
- **序列实用工具**（Bio.SeqUtils）- GC 含量、熔解温度、分子量、蛋白质分析
- **限制性酶切分析**（Bio.Restriction）- 查找限制性内切酶位点
- **聚类**（Bio.Cluster）- K-means 和层次聚类
- **基因组图谱**（GenomeDiagram）- 可视化基因组特征

**快速示例：**
```python
from Bio.SeqUtils import gc_fraction, molecular_weight
from Bio.Seq import Seq

seq = Seq("ATCGATCGATCG")
print(f"GC content: {gc_fraction(seq):.2%}")
print(f"Molecular weight: {molecular_weight(seq, seq_type='DNA'):.2f} g/mol")
```

## 通用工作流程指南

### 阅读文档

当用户询问特定的 Biopython 任务时：

1. **根据任务描述确定相关模块**
2. **使用 Read 工具读取适当的参考文件**
3. **提取相关代码模式**，并根据用户的具体需求进行调整
4. 当任务有需要时，**组合使用多个模块**

用于搜索参考文件的示例模式：
```bash
# Find information about specific functions
grep -n "SeqIO.parse" references/sequence_io.md

# Find examples of specific tasks
grep -n "BLAST" references/blast.md

# Find information about specific concepts
grep -n "alignment" references/alignment.md
```

### 编写 Biopython 代码

编写 Biopython 代码时，请遵循以下原则：

1. **显式导入模块**
   ```python
   from Bio import SeqIO, Entrez
   from Bio.Seq import Seq
   ```

2. 使用 NCBI 数据库时，**设置 Entrez 电子邮箱**
   ```python
   Entrez.email = "your.email@example.com"
   ```

3. **使用适当的文件格式** - 检查哪种格式最适合该任务
   ```python
   # Common formats: "fasta", "genbank", "fastq", "clustal", "phylip"
   ```

4. **妥善处理文件** - 使用后关闭句柄，或使用上下文管理器
   ```python
   with open("file.fasta") as handle:
       records = SeqIO.parse(handle, "fasta")
   ```

5. **对大型文件使用迭代器** - 避免将所有内容加载到内存中
   ```python
   for record in SeqIO.parse("large_file.fasta", "fasta"):
       # Process one record at a time
   ```

6. **妥善处理错误** - 网络操作和文件解析可能会失败
   ```python
   try:
       handle = Entrez.efetch(db="nucleotide", id=accession)
   except HTTPError as e:
       print(f"Error: {e}")
   ```

## 常见模式

### 模式 1：从 GenBank 获取序列

```python
from Bio import Entrez, SeqIO

Entrez.email = "your.email@example.com"

# Fetch sequence
handle = Entrez.efetch(db="nucleotide", id="EU490707", rettype="gb", retmode="text")
record = SeqIO.read(handle, "genbank")
handle.close()

print(f"Description: {record.description}")
print(f"Sequence length: {len(record.seq)}")
```

### 模式 2：序列分析流水线

```python
from Bio import SeqIO
from Bio.SeqUtils import gc_fraction

for record in SeqIO.parse("sequences.fasta", "fasta"):
    # Calculate statistics
    gc = gc_fraction(record.seq)
    length = len(record.seq)

    # Find ORFs, translate, etc.
    protein = record.seq.translate()

    print(f"{record.id}: {length} bp, GC={gc:.2%}")
```

### 模式 3：执行 BLAST 并获取排名靠前的命中结果

```python
from Bio.Blast import NCBIWWW, NCBIXML
from Bio import Entrez, SeqIO

Entrez.email = "your.email@example.com"

# Run BLAST
result_handle = NCBIWWW.qblast("blastn", "nt", sequence)
blast_record = NCBIXML.read(result_handle)

# Get top hit accessions
accessions = [aln.accession for aln in blast_record.alignments[:5]]

# Fetch sequences
for acc in accessions:
    handle = Entrez.efetch(db="nucleotide", id=acc, rettype="fasta", retmode="text")
    record = SeqIO.read(handle, "fasta")
    handle.close()
    print(f">{record.description}")
```

### 模式 4：根据序列构建系统发育树

```python
from Bio import AlignIO, Phylo
from Bio.Phylo.TreeConstruction import DistanceCalculator, DistanceTreeConstructor

# Read alignment
alignment = AlignIO.read("alignment.fasta", "fasta")

# Calculate distances
calculator = DistanceCalculator("identity")
dm = calculator.get_distance(alignment)

# Build tree
constructor = DistanceTreeConstructor()
tree = constructor.nj(dm)

# Visualize
Phylo.draw_ascii(tree)
```

## 最佳实践

1. 编写代码前，**始终阅读相关的参考文档**
2. **使用 grep 搜索参考文件**，查找特定函数或示例
3. 解析前**验证文件格式**
4. **妥善处理缺失数据** - 并非所有记录都包含全部字段
5. **缓存下载的数据** - 不要重复下载相同的序列
6. **遵守 NCBI 速率限制** - 使用 API 密钥并设置适当的延迟
7. 处理大型文件前，**先使用小型数据集进行测试**
8. **及时更新 Biopython**，以获取最新功能和错误修复
9. 翻译时**使用适当的遗传密码表**
10. **记录分析参数**，以确保可复现性

## 常见问题排查

### 问题："No handlers could be found for logger 'Bio.Entrez'"
**解决方案：** 这只是一个警告。设置 Entrez.email 即可消除该警告。

### 问题：NCBI 返回 "HTTP Error 400"
**解决方案：** 检查 ID/登录号是否有效且格式正确。

### 问题：解析文件时出现 "ValueError: EOF"
**解决方案：** 验证文件格式是否与指定的格式字符串匹配。

### 问题：比对失败并提示 "sequences are not the same length"
**解决方案：** 在使用 AlignIO 或 MultipleSeqAlignment 前，确保序列已经过比对。

### 问题：BLAST 搜索速度慢
**解决方案：** 对大规模搜索使用本地 BLAST，或缓存结果。

### 问题：PDB 解析器警告
**解决方案：** 使用 `PDBParser(QUIET=True)` 抑制警告，或检查结构质量。

## 其他资源

- **官方文档**：https://biopython.org/docs/latest/
- **教程**：https://biopython.org/docs/latest/Tutorial/
- **Cookbook**：https://biopython.org/docs/latest/Tutorial/（高级示例）
- **GitHub**：https://github.com/biopython/biopython
- **邮件列表**：biopython@biopython.org

## 快速参考

要在参考文件中查找信息，请使用以下搜索模式：

```bash
# Search for specific functions
grep -n "function_name" references/*.md

# Find examples of specific tasks
grep -n "example" references/sequence_io.md

# Find all occurrences of a module
grep -n "Bio.Seq" references/*.md
```

## 总结

Biopython 为计算分子生物学提供了全面的工具。使用此技能时：

1. **确定任务领域**（序列、比对、数据库、BLAST、结构、系统发育或高级功能）
2. **查阅 `references/` 目录中相应的参考文件**
3. **根据具体用例调整代码示例**
4. **在复杂工作流中按需组合多个模块**
5. **遵循文件处理、错误检查和数据管理的最佳实践**

模块化参考文档确保为 Biopython 的每项主要功能提供详细且可搜索的信息。