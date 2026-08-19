---
name: gget
description: "Fast CLI/Python queries to 20+ bioinformatics databases. Use for quick lookups: gene info, BLAST/BLAT, viral sequence downloads, AlphaFold structures, enrichment analysis, OpenTargets, COSMIC, CELLxGENE, and 8cube mouse specificity/expression data. Best for interactive exploration and simple queries. For batch processing or advanced BLAST use biopython; for multi-database Python workflows use bioservices."
license: BSD-2-Clause license
allowed-tools: Read Write Edit Bash
compatibility: Requires Python >=3.8 and gget 0.30.5-compatible APIs. Optional setup modules may install scientific dependencies that lag the newest Python releases; use Python 3.9 or 3.10 if `gget setup cellxgene` or `gget setup alphafold` fails.
metadata:
  version: "1.4"
  skill-author: K-Dense Inc.
---
# gget

## 概述

gget 是一个命令行生物信息学工具和 Python 软件包，通过统一接口提供对 20 多个基因组数据库和分析方法的访问。可查询基因信息、序列分析、蛋白质结构、病毒序列、表达数据、疾病关联，以及小鼠组织/细胞特异性指标。大多数 gget 模块既可作为命令行工具使用，也可作为 Python 函数使用。

**重要提示**：gget 查询的数据库会持续更新，这有时会改变其结构。本文档中的指南针对 gget 0.30.5（截至 2026-06-07，PyPI 当前版本）。如需确保结果可复现，请固定使用 `gget==0.30.5`；如果上游数据库适配器出现故障，请先查看发行说明，然后再更新 gget。

## 安装

请在干净的虚拟环境中安装 gget，以避免冲突：

```bash
# Reproducible install targeting this skill
uv venv .venv
source .venv/bin/activate
uv pip install "gget==0.30.5"

# In Python/Jupyter
import gget
```

## 快速开始

所有模块的基本用法模式：

```bash
# Command-line
gget <module> [arguments] [options]

# Python
gget.module(arguments, options)
```

大多数模块返回：
- **命令行**：JSON（默认），或通过 `-csv` 标志返回 CSV
- **Python**：DataFrame 或字典

各模块通用的标志：
- `-o/--out`：将结果保存到文件
- `-q/--quiet`：抑制进度信息
- `-csv`：返回 CSV 格式（仅限命令行）

Python 参数名称通常与不带前导短横线的长 CLI 选项相同。例如，`--census_version` 对应 `census_version=...`。使用 `gget <module> --help` 查看当前的确切签名。

## 模块类别

gget 在六个类别中提供 23 个模块。每个模块的参数、CLI 和 Python 示例，以及返回值结构，均收录在
[references/module_catalog.md](references/module_catalog.md) 中；更完整的逐参数文档见
[references/module_reference.md](references/module_reference.md)。

| 类别 | 模块 |
| --- | --- |
| 1. 参考信息与基因信息 | `ref`（Ensembl 参考数据下载）、`search`（基因搜索）、`info`（基因/转录本详情）、`seq`（核苷酸和蛋白质序列） |
| 2. 序列分析与比对 | `blast`、`blat`、`muscle`（多序列比对）、`diamond`（本地比对） |
| 3. 结构与蛋白质分析 | `pdb`（结构和元数据）、`alphafold`（结构预测）、`elm`（线性基序） |
| 4. 表达与疾病数据 | `archs4`（相关性、组织表达）、`cellxgene`（单细胞）、`enrichr`（富集分析）、`bgee`（直系同源关系和表达）、`opentargets`（疾病和药物）、`cbio`（癌症基因组学）、`cosmic`（突变） |
| 5. 病毒与小鼠特异性 | `virus`（病毒序列）、`8cube`（小鼠特异性和表达） |
| 6. 其他工具 | `mutate`（突变序列）、`gpt`（文本生成）、`setup`（安装模块依赖） |

有几个模块在首次使用前需要先运行一次 `gget setup`（`alphafold`、`elm`、`cellxgene`），而 `cosmic` 会提示输入 COSMIC 凭据以下载其数据库。

## 常见工作流

多模块工作流——基因表征、结构比较、表达与富集分析、疾病和药物关联、直系同源比较，以及为 kallisto 或比对准备参考文件——位于
[references/common_workflows.md](references/common_workflows.md)，更完整的版本位于
[references/workflows.md](references/workflows.md)。

## 最佳实践

### 数据检索
- 使用 `--limit` 控制大型查询的结果数量
- 使用 `-o/--out` 保存结果，以确保可复现性
- 检查数据库版本/发布版本，确保不同分析之间的一致性
- 在生产脚本中使用 `--quiet` 以减少输出

### 序列分析
- 对于 BLAST/BLAT，先使用默认参数，然后再调整灵敏度
- 使用带有 `--threads` 的 `gget diamond`，以加快本地比对
- 使用 `--diamond_db` 保存 DIAMOND 数据库，以便重复查询
- 对于多序列比对，大型数据集使用 `-s5/--super5`

### 表达与疾病数据
- 在 cellxgene 中，基因符号区分大小写（例如，'PAX7' 与 'Pax7'）
- 首次使用 alphafold、cellxgene、elm、gpt 前运行 `gget setup`
- 对于富集分析，使用数据库快捷方式以提高便利性
- 使用 `-dd` 缓存 cBioPortal 数据，避免重复下载
- 对于 OpenTargets，在编写筛选条件前检查返回的列名；gget 0.30.5 遵循较新的 OpenTargets API schema

### 结构预测
- AlphaFold multimer 预测：使用 `-mr 20` 以获得更高准确度
- 使用 `-r` flag 对最终结构执行 AMBER 松弛
- 在 Python 中使用 `plot=True` 可视化结果
- 运行 AlphaFold 预测前先检查 PDB 数据库

### 病毒数据
- 使用 `gget virus` 请求大范围病毒数据集之前，先使用限制性筛选条件
- 保留 `command_summary.txt` 以及下游结果，以确保可复现性，并支持部分下载后的恢复
- 使用 `--baseline` 和 `--merge-results` 恢复中断的病毒元数据/序列下载

### 错误处理
- 数据库结构会发生变化；当适配器失效时，检查上游发布说明，并显式固定到较新的修复版本
- 固定已知可用的版本以实现可复现环境：`uv pip install "gget==0.30.5"`
- 使用 gget info 时，一次最多处理约 1000 个 Ensembl ID
- 对于大规模分析，为 API 查询实现速率限制
- 使用虚拟环境以避免依赖冲突
- 将 COSMIC 和 OpenAI 凭据保存在命名环境变量中，或通过交互式提示输入；不要将真实凭据写入示例、notebook 或日志

## 输出格式

### 命令行
- 默认：JSON
- CSV：添加 `-csv` flag
- FASTA：gget seq、gget mutate
- PDB：gget pdb、gget alphafold
- PNG：gget cbio plot
- FASTA/CSV/JSONL 文件夹：gget virus

### Python
- 默认：DataFrame 或 dictionary
- JSON：添加 `json=True` parameter
- 保存到文件：添加 `save=True` 或指定 `out="filename"`
- AnnData：gget cellxgene
- DataFrame/JSON：gget 8cube specificity、psi_block、expression

## 资源

此 skill 包含详细模块信息的参考文档：

### references/
- `module_reference.md` - 所有模块的完整参数参考
- `database_info.md` - 所查询数据库及其更新频率的信息
- `workflows.md` - 扩展的工作流示例和使用场景

如需其他帮助：
- 官方文档：https://pachterlab.github.io/gget/
- GitHub issue：https://github.com/pachterlab/gget/issues
- 引用：Luebbert, L. & Pachter, L. (2023). 使用 gget 高效查询基因组参考数据库。Bioinformatics. https://doi.org/10.1093/bioinformatics/btac836