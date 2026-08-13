---
name: alterlab-etetoolkit
description: Manipulate, annotate, and render phylogenetic trees programmatically with the ETE Toolkit (ete3) — parse and edit Newick/NHX, detect duplication/speciation events, infer orthology and paralogy, query NCBI taxonomy, and export PDF/SVG figures. Use when traversing or reformatting tree files, doing phylogenomic comparative analysis, or producing publication tree graphics in Python. Part of the AlterLab Academic Skills suite.
license: GPL-3.0
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# ETE 工具包技能

## 概述

ETE（Environment for Tree Exploration，树探索环境）是一套用于系统发育树和层次树分析的工具包。它可用于操作树、分析进化事件、可视化结果，以及集成生物数据库以开展系统基因组学研究和聚类分析。

## 适用场景

- 解析、遍历树文件或转换其格式（Newick / NHX / PhyloXML / NeXML）
- 对树进行修剪、定根、折叠或解析多分叉
- 检测基因重复/物种形成事件，并从基因树中推断直系同源物/旁系同源物
- 查询 NCBI Taxonomy（taxid/名称转换、谱系、分类树）
- 生成出版级 PDF/SVG/PNG 树图
- 比较树（Robinson-Foulds）或分析聚类树状图

## 核心能力

ETE 提供六大能力领域。每个领域在参考资料中都有详细且可直接使用的代码
（请参阅下方索引）。

1. **树操作** — 跨格式输入/输出、遍历（前序/后序/层序）、拓扑结构
   编辑（修剪、定根、折叠）、距离计算、RF 树比较。
2. **系统发育分析** — 关联比对、物种命名、基因重复/物种形成
   检测（物种重叠或协调分析）、直系同源/旁系同源分析。
3. **NCBI Taxonomy** — 本地缓存数据库、taxid↔名称转换、谱系检索、
   分类树构建、树注释。
4. **可视化** — PNG/PDF/SVG 导出、矩形/环形布局、`NodeStyle`、
   `Face` 对象、布局函数、交互式 GUI。
5. **聚类分析** — `ClusterTree`、数据矩阵关联、轮廓系数/Dunn 指标、
   热图视图。
6. **树比较** — Robinson-Foulds（原始值 + 归一化值）、分区/二分分析、
   批量成对距离矩阵。

## 核心工作流

标准的最小模式——加载、编辑、保存：

```python
from ete3 import Tree

# Load tree from file (format 1 = with internal node names)
tree = Tree("tree.nw", format=1)

# Prune to taxa of interest, preserving branch lengths
tree.prune(["species1", "species2", "species3"], preserve_branch_length=True)

# Midpoint root
tree.set_outgroup(tree.get_midpoint_outgroup())

# Save
tree.write(outfile="rooted_tree.nw")
```

关于类的选择：使用 `Tree`/`TreeNode` 进行通用拓扑操作，使用 `PhyloTree` 处理基因
树和进化分析，使用 `ClusterTree` 处理带数据矩阵的树状图，使用
`NCBITaxa` 进行分类学查询。

## 命令行脚本

- `scripts/tree_operations.py` — 统计、格式转换、重新定根、修剪、ASCII 视图。
  示例：`python scripts/tree_operations.py reroot tree.nw rooted.nw --midpoint`
- `scripts/quick_visualize.py` — 使用环形布局、支持度
  着色和 DPI 控制快速渲染 PDF/PNG。示例：
  `python scripts/quick_visualize.py tree.nw out.pdf --mode c --color-by-support`

## 参考资料索引

需要详细信息时，请加载相关文件：

- **`references/api_reference.md`** — 所有 ETE 类/方法（`Tree`、
  `PhyloTree`、`ClusterTree`、`NCBITaxa`）的完整 API：参数、返回类型、代码示例。
- **`references/workflows.md`** — 按任务划分的工作流模式（树操作、系统发育
  分析、比较、分类学集成、聚类）。
- **`references/visualization.md`** — 完整的可视化指南：`TreeStyle`、`NodeStyle`、
  `Face`、布局函数、高级渲染。
- **`references/use_cases.md`** — 端到端用例详解（系统基因组学流水线、批量
  预处理、出版级图形、自动化多树分析）。
- **`references/setup_and_troubleshooting.md`** — 安装、NCBI Taxonomy 首次运行
  设置及故障排除（导入、Qt 渲染、内存、数据库损坏）。
- **`references/newick_and_best_practices.md`** — Newick/NHX 格式规范（0-100）
  和最佳实践检查清单。