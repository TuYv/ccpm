---
name: etetoolkit
description: Analyze, manipulate, compare, annotate, and visualize phylogenetic or other hierarchical trees with ETE 4. Use for Newick/Nexus tree I/O, topology edits and pattern matching, Robinson-Foulds comparisons, gene-tree evolutionary events and reconciliation, NCBI/GTDB taxonomy, SmartView exploration, and publication rendering. Do not use it to infer trees from raw sequences; align sequences and infer a tree first.
license: GPL-3.0-or-later
allowed-tools: Read Write Edit Bash Python
compatibility: Bundled scripts require Python 3.10+ and ete4 4.4.0 (upstream ete4 supports Python >=3.7). Taxonomy setup and SmartView exploration need network access; static SmartView PNG rendering needs ete4[render-sm], and Qt PDF/SVG rendering needs ete4[treeview].
metadata:
  version: "2.0"
  skill-author: K-Dense Inc.
---
# ETE 工具包 4

## 范围

使用 ETE 4 处理现有树：

- 读取 Newick/Nexus，然后检查、注释、转换、定根、修剪并写出
  Newick 树
- 比较拓扑结构并计算系统发育距离
- 使用 `TreePattern` 查找重复的子树拓扑结构
- 使用 `PhyloTree` 分析基因树
- 查询本地 NCBI 或 GTDB 分类数据库
- 使用 SmartView 交互式探索大型树
- 使用 SmartView 渲染 PNG，或使用可选的 Qt treeview 渲染 PNG/PDF/SVG

ETE 不能替代序列比对或系统发育推断软件。对于原始序列，应先使用 MAFFT
或其他比对工具，以及 IQ-TREE 2、FastTree 或其他推断工具；然后将生成的树
加载到 ETE 中。

## 当前目标

此 skill 针对 **ETE 4.4.0**，该版本于 2025 年 9 月 3 日发布，并于
2026 年 7 月 23 日确认是当前的 PyPI 版本。

使用 `https://etetoolkit.github.io/ete/` 获取 ETE 4 文档。尽管 URL 名称如此，
`etetoolkit.org/docs/latest` 页面实际上是旧版 ETE 3 文档。

不要悄悄地将以下示例改回 ETE 3：

- 包和导入：`ete4`，而不是 `ete3`
- 文件输入：传入已打开的文件对象；对 Newick 文本使用字符串，不要依赖
  ETE 4.4.0 中保留的路径字符串启发式判断
- Newick 选择：使用 `parser=`，而不是 `format=`
- 节点元数据：`props`、`add_prop()` 和 `add_props()`
- 迭代：`leaves()`、`descendants()` 及相关方法返回迭代器
- 谓词：`node.is_leaf` 和 `node.is_root` 是属性，而不是方法
- 节点查找：`tree["name"]`，而不是 `tree & "name"`

如需移植旧代码，请加载
[`references/migration-ete3-to-ete4.md`](references/migration-ete3-to-ete4.md)。

## 安装

安装固定版本的基础包：

```bash
uv pip install "ete4==4.4.0"
```

仅添加工作流所需的可视化额外依赖：

```bash
# SmartView static PNG screenshots
uv pip install "ete4[render-sm]==4.4.0"

# Legacy Qt renderer for PNG, PDF, and SVG
uv pip install "ete4[treeview]==4.4.0"
```

确认当前环境：

```bash
uv run --with "ete4==4.4.0" python -c "import ete4; print(ete4.__version__)"
```

无需凭据。NCBI 和 GTDB 工作流会下载公开的分类数据，并且可能占用大量磁盘
空间；首次更新前请参阅
[`references/taxonomy.md`](references/taxonomy.md)。

## 快速开始

```python
from pathlib import Path

from ete4 import Tree

# Use an open file object for files; reserve strings for Newick text.
with Path("tree.nw").open(encoding="utf-8") as handle:
    tree = Tree(handle, parser=1)  # parser 1: internal node names

print(tree.to_str(props=["name", "dist"], compact=True))
print("Leaves:", list(tree.leaf_names()))

# Search and annotate.
focal = tree["species1"]
focal.add_props(host="human", status="focal")

# Keep selected tips while preserving pairwise branch-length distances.
tree.prune(
    ["species1", "species2", "species3"],
    preserve_branch_length=True,
)

# Root and serialize explicitly.
tree.set_midpoint_outgroup()
tree.write(
    outfile="processed.nw",
    parser=1,
    props=["host", "status"],
)
```

请有意选择解析器。解析器不匹配是导致
`NewickError`、内部标签丢失，或支持值被读取为名称的最常见原因。
参见 [`references/api_reference.md`](references/api_reference.md)。

## 核心工作流

### 检查并转换树

```python
from ete4 import Tree

tree = Tree("((A:1,B:1)CladeAB:0.4,C:2)Root;", parser=1)

for node in tree.traverse("preorder"):
    label = node.name if node.name is not None else node.id
    print(label, node.level, node.is_leaf, node.dist)

tree["A"].add_prop("group", "case")
tree["B"].add_prop("group", "control")

mrca = tree.common_ancestor("A", "B")
print(mrca.name)

tree.write(
    outfile="annotated.nhx",
    parser=1,
    props=["group"],
    format_root_node=True,
)
```

节点名称不必唯一。`tree["A"]` 返回第一个匹配项；如果可能存在重复名称，请使用
`list(tree.search_nodes(name="A"))` 并验证匹配数量。

### 比较两种拓扑结构

```python
from ete4 import Tree

tree_a = Tree("((A,B),(C,D));")
tree_b = Tree("((A,C),(B,D));")

(
    rf,
    max_rf,
    common_leaves,
    edges_a,
    edges_b,
    discarded_a,
    discarded_b,
) = tree_a.robinson_foulds(tree_b)

normalized_rf = rf / max_rf if max_rf else 0.0
print(rf, max_rf, normalized_rf, sorted(common_leaves))
```

RF 比较使用共享的叶标签，并要求名称具有实际意义，最好保持唯一。请明确决定在科学上
采用有根比较还是无根比较。

### 检测复制和物种形成事件

```python
from ete4 import PhyloTree

gene_tree = PhyloTree(
    "((Hsa|g1,Ptr|g1),(Hsa|g2,Mmu|g1));",
    sp_naming_function=lambda name: name.split("|", 1)[0],
)

for event in gene_tree.get_descendant_evol_events(sos_thr=0.0):
    relationship = "speciation/orthology" if event.etype == "S" else "duplication/paralogy"
    print(relationship, sorted(event.in_seqs), sorted(event.out_seqs))
```

物种重叠调用是根据所提供的拓扑结构和命名函数得出的推断，并不是独立的直系同源关系证据。
请显式传入命名函数，并使用有根且完全二叉的基因树。对于严格的协调分析，请使用经过整理的物种树，并调用
`gene_tree.reconcile(species_tree)`。

### 查询分类法

```python
from ete4 import NCBITaxa

ncbi = NCBITaxa()
names = ["Homo sapiens", "Pan troglodytes", "Mus musculus"]
name_to_taxids = ncbi.get_name_translator(names)

missing = [name for name in names if name not in name_to_taxids]
if missing:
    raise ValueError(f"Names not resolved by NCBI taxonomy: {missing}")

taxids = [name_to_taxids[name][0] for name in names]
taxonomy_tree = ncbi.get_topology(taxids)
print(taxonomy_tree.to_str(props=["sci_name", "rank"]))
```

ETE 4 还提供面向基因组的 `GTDBTaxa`，用于细菌和古菌分类。不要混用 NCBI 数字 TaxID 和 GTDB 字符串标识符。

### 可视化

交互式 SmartView：

```python
from ete4 import Tree

tree = Tree("((A:1,B:1)90:0.2,C:1);", parser="support")
tree.explore()
```

静态 SmartView 截图：

```python
tree.render_sm("tree.png", w=1200, h=800)
```

`render_sm()` 生成 PNG 截图数据；当交付物必须是矢量 PDF 或 SVG 时，请使用 Qt treeview 渲染器。加载
[`references/visualization.md`](references/visualization.md) 以了解布局、
faces、远程探索和渲染器选择。

## 随附脚本

从此 skill 目录运行。以下命令通过 `uv run --with` 使用固定版本且隔离的 ETE 4
运行时。

### 树操作

```bash
uv run --with "ete4==4.4.0" python scripts/tree_operations.py \
  stats tree.nw --parser 1
uv run --with "ete4==4.4.0" python scripts/tree_operations.py \
  ascii tree.nw --parser 1 --props name,dist
uv run --with "ete4==4.4.0" python scripts/tree_operations.py \
  convert tree.nw output.nw \
  --input-parser 1 --output-parser 1
uv run --with "ete4==4.4.0" python scripts/tree_operations.py \
  reroot tree.nw rooted.nw \
  --parser 1 --midpoint
uv run --with "ete4==4.4.0" python scripts/tree_operations.py \
  prune tree.nw pruned.nw \
  --parser 1 --keep species1 species2 species3
uv run --with "ete4==4.4.0" python scripts/tree_operations.py \
  compare tree_a.nw tree_b.nw
```

对于每行一个分类单元名称的情况，请使用 `--keep-file taxa.txt`，而不是
`--keep ...`。脚本会拒绝有歧义或缺失的请求名称，而不会静默地生成一个不完整的
树。

### 可视化

```bash
# Interactive SmartView
uv run --with "ete4==4.4.0" python scripts/quick_visualize.py \
  tree.nw --parser 1

# SmartView PNG (requires ete4[render-sm])
uv run --with "ete4[render-sm]==4.4.0" python scripts/quick_visualize.py \
  tree.nw tree.png \
  --parser support --mode circular --show-support --color-by-support

# Vector output via Qt treeview (requires ete4[treeview])
uv run --with "ete4[treeview]==4.4.0" python scripts/quick_visualize.py \
  tree.nw tree.svg \
  --parser 1 --engine treeview --title "Species phylogeny"
```

## 质量与解读检查

报告结果前：

1. 确认解析器保留了预期的内部名称、支持度和分支长度。
2. 在按名称查找或进行 RF 比较前，检查是否存在空的和重复的叶名称。
3. 说明该树被视为有根树还是无根树。
4. 仅在保留的成对距离应保持不变时，才在剪枝时保留分支长度。
5. 将任意多分叉解析视为显示或算法上的便利，而不是进化证据。
6. 在可复现分析中记录 ETE 版本、解析器、生根方法、剪枝集合以及分类学数据库快照。
7. 对于大型树，优先使用迭代器；对于重复的后代内容查询，使用
   `get_cached_content()`。

## 参考资料索引

仅加载任务所需的参考资料：

- [`references/api_reference.md`](references/api_reference.md) — ETE 4 核心
  类、解析器、属性、遍历、I/O、拓扑结构和比较
- [`references/workflows.md`](references/workflows.md) — 完整的分析
  模式、验证、协调、批处理和大型树操作
- [`references/visualization.md`](references/visualization.md) — SmartView、
  布局/faces、PNG 截图和 Qt 矢量渲染
- [`references/taxonomy.md`](references/taxonomy.md) — NCBI 和 GTDB 设置、
  翻译、拓扑结构、注释和可复现性
- [`references/migration-ete3-to-ete4.md`](references/migration-ete3-to-ete4.md)
  — API 破坏性变更和迁移检查清单

## 权威上游来源

- 文档：https://etetoolkit.github.io/ete/
- ETE 3 到 ETE 4 的迁移：https://etetoolkit.github.io/ete/3to4.html
- 发布版本：https://github.com/etetoolkit/ete/releases
- PyPI：https://pypi.org/project/ete4/
- 源代码：https://github.com/etetoolkit/ete
- 可视化图库：https://github.com/etetoolkit/ete-gallery