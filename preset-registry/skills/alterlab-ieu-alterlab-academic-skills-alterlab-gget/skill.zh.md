---
name: alterlab-gget
description: "Run fast one-liner queries to 20+ bioinformatics databases from the gget CLI or Python — gene info (Ensembl), BLAST, AlphaFold structures, Enrichr enrichment, and more. Use for quick interactive lookups of genes, sequences, structures, or pathways — for batch processing or advanced BLAST use biopython, for multi-database Python workflows use bioservices. Part of the AlterLab Academic Skills suite."
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Install with `uv pip install gget`; core modules need no API key or account. cosmic needs a COSMIC account; gpt needs an OpenAI key; alphafold/cellxgene/elm/gpt need a one-time `gget setup`."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# gget

## 概述

gget 是一个命令行生物信息学工具和 Python 软件包，可统一访问 20 多个基因组数据库和分析方法。通过一致的接口查询基因信息、进行序列分析，以及获取蛋白质结构、表达数据和疾病关联。所有 gget 模块既可作为命令行工具使用，也可作为 Python 函数使用。

**重要提示**：gget 查询的数据库会持续更新，有时会导致其结构发生变化。gget 模块每两周进行一次自动测试，并在必要时更新以适配新的数据库结构。

## 安装

请在干净的虚拟环境中安装 gget，以避免冲突：

```bash
# Install (or upgrade) into a clean environment
uv pip install --upgrade gget

# In Python/Jupyter
import gget
```

## 快速入门

所有模块的基本用法模式：

```bash
# Command-line
gget <module> [arguments] [options]

# Python
gget.module(arguments, options)
```

大多数模块返回：
- **命令行**：默认返回 JSON，使用 `-csv` 标志则返回 CSV
- **Python**：DataFrame 或字典

各模块通用的标志：
- `-o/--out`：将结果保存到文件
- `-q/--quiet`：不显示进度信息
- `-csv`：返回 CSV 格式（仅限命令行）

## 模块目录

选择一个模块，然后参阅 `references/module_examples.md` 中完整的 CLI + Python
示例，以及 `references/module_reference.md` 中完整的参数表。

| 模块 | 用途 | 查询的数据源 |
|--------|---------|----------------|
| `ref` | 参考基因组下载链接/元数据 | Ensembl |
| `search` | 按名称/描述查找基因 | Ensembl |
| `info` | 基因/转录本元数据（最多约 1000 个 ID） | Ensembl, UniProt, NCBI |
| `seq` | 核苷酸/氨基酸序列（FASTA） | Ensembl |
| `blast` | 针对标准数据库执行 BLAST | NCBI BLAST |
| `blat` | 确定序列的基因组位置 | UCSC BLAT |
| `muscle` | 多序列比对 | Muscle5（本地） |
| `diamond` | 快速本地蛋白质/翻译序列比对 | DIAMOND（本地） |
| `pdb` | 实验测定的蛋白质结构 + 元数据 | RCSB PDB |
| `alphafold` | 预测蛋白质三维结构（需要设置） | AlphaFold2（本地） |
| `elm` | 真核生物线性基序（需要设置） | ELM |
| `archs4` | 相关基因/组织表达 | ARCHS4 |
| `cellxgene` | 单细胞 RNA-seq（需要设置） | CZ CELLxGENE Census |
| `enrichr` | 本体/通路富集 | Enrichr |
| `bgee` | 直系同源基因和表达 | Bgee |
| `opentargets` | 疾病/药物关联 | OpenTargets |
| `cbio` | 癌症基因组学热图 | cBioPortal |
| `cosmic` | 癌症体细胞突变（需要许可证/账户） | COSMIC |
| `mutate` | 生成突变序列 | 本地 |
| `gpt` | 自然语言文本生成（需要设置） | OpenAI API |
| `setup` | 为模块安装第三方依赖项 | 本地 |

**需要设置的模块**（首次使用前运行 `gget setup <module>`）：
`alphafold`（参数约 4GB，需要先执行 `uv pip install openmm`）、`cellxgene`、
`elm`、`gpt`。

## 选择指南

- **快速交互式查询**（基因信息、BLAST、单个结构、单次富集）→
  直接使用 gget；参阅 `references/module_examples.md`。
- **批处理/高级 BLAST** → 使用 **biopython** skill。
- **多数据库 Python 工作流** → 使用 **bioservices** skill。
- **将多个 gget 模块串联成流水线** → 参阅 `references/workflows.md`
  以及现成的 `scripts/`（gene_analysis、batch_sequence_analysis、
  enrichment_pipeline）。

## 最佳实践（要点）

- 使用 `--limit` 限制大型查询；通过 `-o/--out` 保存结果，以确保可复现性。
- 在 cellxgene 中，基因符号**区分大小写**（'PAX7' 与 'Pax7' 不同）。
- 首次使用 alphafold、cellxgene、elm、gpt 前，请运行 `gget setup`。
- 使用 `gget info` 时，一次最多处理约 1000 个 Ensembl ID。
- 数据库结构会发生变化；请及时更新 gget：`uv pip install --upgrade gget`。
- 使用虚拟环境以避免依赖项冲突。

## 输出格式

- **命令行**：默认为 JSON；使用 `-csv` 输出 CSV；FASTA（`seq`、`mutate`）；
  PDB（`pdb`、`alphafold`）；PNG（`cbio plot`）。
- **Python**：默认为 DataFrame/dict；使用 `json=True` 输出 JSON；使用 `save=True` 或
  `out="filename"` 写入文件；`cellxgene` 返回 AnnData。

## 参考资料

- `references/module_examples.md` — 每个模块的完整 CLI + Python 示例
- `references/module_reference.md` — 所有模块的完整参数表
- `references/database_info.md` — 查询的数据库及其更新频率
- `references/workflows.md` — 扩展的多模块工作流示例

如需更多帮助：
- 官方文档：https://pachterlab.github.io/gget/
- GitHub 问题：https://github.com/pachterlab/gget/issues
- 引用：Luebbert, L. & Pachter, L. (2023). Efficient querying of genomic reference databases with gget. Bioinformatics. https://doi.org/10.1093/bioinformatics/btac836