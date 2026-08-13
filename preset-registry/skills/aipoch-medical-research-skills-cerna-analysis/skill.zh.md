---
name: cerna-analysis
description: "Use when building a ceRNA regulatory network from a key gene list by combining bundled miRNA-mRNA and miRNA-lncRNA database files, with flat-file CSV exports and PDF visualization in a single output directory. NOT for: differential expression, single-cell analysis, enrichment analysis, or workflows without a key gene list."
license: MIT
skill-author: Codex
---
# ceRNA 分析

## 何时使用

当你需要使用内置的 miRNA-mRNA 和 miRNA-lncRNA 参考表，基于已知的关键基因列表构建 ceRNA 调控网络时，请使用此技能。

适用于：

- 根据单个基因列表构建 ceRNA 网络，并导出扁平化 CSV 和 PDF 输出
- 比较受支持的 miRNA 数据源模式，例如 `combined`、`starbase` 或两两重叠模式
- 使用不同的 lncRNA 严格度、布局或绘图参数，重新运行相同的本地工作流

不适用于：

- 差异表达、单细胞、富集或生存分析
- 不以关键基因列表为起点的工作流
- 只需要 miRNA-mRNA 图，而不保留 lncRNA ceRNA 层的情况

## 输入验证

此技能接受：

- 纯文本文件形式的关键基因列表（每行一个基因符号），或 CLI 中以逗号分隔的字符串
- 数据集模式、lncRNA 严格度、布局、颜色和超时时间的可选参数覆盖

如果用户的请求不涉及根据关键基因列表构建 ceRNA 调控网络，例如要求运行差异表达、富集分析、单细胞工作流或生存分析，请勿继续执行该工作流。应改为回复：

> “ceRNA 分析旨在使用内置的 miRNA-mRNA 和 miRNA-lncRNA 参考数据库，根据关键基因列表构建 ceRNA 调控网络。你的请求似乎超出了此范围。请提供关键基因列表并指定受支持的 miRNA 数据集模式，或者使用更适合差异表达、富集分析或单细胞工作流的技能。”

## 何时读取外部文件

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| **需要算法详情** | `references/algorithm.md` | ceRNA 构建逻辑、数据集组合和过滤规则。包含两两交集网络规模与组合模式对比的完整示例。 |
| **需要运行分析** | `scripts/main.R` | 执行：`Rscript scripts/main.R --key_genes ... --output_dir ...`。注意：使用 `--help` 需要安装 igraph。 |
| **遇到错误** | `references/troubleshooting.md` | 常见错误及解决方案 |
| **需要 CLI 示例** | `references/cli-guide.md` | 包含实测输出的详细本地运行示例 |
| **需要测试数据** | `tests/data/` | 用于测试的关键基因输入样本 |

## 用法

```bash
Rscript scripts/main.R \
  --key_genes tests/data/gene.txt \
  --output_dir ./output/ \
  --mirna_dataset combined \
  --lncrna_strictness High \
  --lncrna_freq_thresh 0 \
  --timeout_seconds 600 \
  --seed 42
```

> **依赖项说明：** `--help` 和所有分析模式都需要安装 `igraph`。请在运行任何命令之前安装 igraph。有关安装指导，请参阅 `references/troubleshooting.md`。

## 参数

### 主要分析：`scripts/main.R`

| 短参数 | 长参数 | 类型 | 默认值 | 说明 |
|-------|------|------|---------|-------------|
| `-i` | `--key_genes` | character | **必填** | 关键基因文件路径或以逗号分隔的基因名称 |
| `-o` | `--output_dir` | character | `./output/` | 输出目录 |
| `-m` | `--mirna_dataset` | character | `combined` | 数据集：`combined`、`starbase`、`mirdb`、`mirtarbase`、`starbase+mirdb`、`starbase+mirtarbase`、`mirdb+mirtarbase` |
| `-l` | `--lncrna_strictness` | character | `High` | lncRNA 相互作用严格度：`Low`、`Median`、`High` |
| `-f` | `--lncrna_freq_thresh` | integer | `0` | 保留 lncRNA 的最低频次 |
| `-r` | `--reference_dir` | character | `file.path(script_dir, "..", "references", "database")` | 数据库目录 |
|  | `--plot_width` | double | `12` | PDF 宽度，单位为英寸 |
|  | `--plot_height` | double | `8` | PDF 高度，单位为英寸 |
|  | `--layout_type` | character | `kk` | 布局：`kk`、`fr`、`nicely`、`circle`、`grid`、`randomly` |
|  | `--mrna_color` | character | `#D16BA5` | mRNA 节点颜色 |
|  | `--lncrna_color` | character | `#008dcd` | lncRNA 节点颜色 |
|  | `--mirna_color` | character | `#00c9a7` | miRNA 节点颜色 |
|  | `--node_size_base` | double | `15` | 节点基础大小 |
|  | `--label_size` | double | `0.8` | 节点标签大小 |
|  | `--show_legend` | logical | `TRUE` | 在 PDF 中显示图例 |
| `-t` | `--timeout_seconds` | integer | `3600` | 已用时间超时限制 |
| `-s` | `--seed` | integer | `42` | 用于确保可复现性的随机种子 |

## 输入格式

### 关键基因（`key_genes`）

纯文本输入，每行一个基因符号；也可以通过 CLI 直接传入以逗号分隔的字符串。

```text
TP53
BRCA1
MYC
```

规则：

- 忽略空行
- 忽略以 `#` 开头的行
- 移除重复基因
- 至少需要一个有效基因

### 数据库目录（`reference_dir`）

内置数据库目录为 `references/database/`。所需文件取决于所选的 `mirna_dataset` 以及所选的 lncRNA 严格度文件。

- `combined`：`miRNA_mRNA.csv`
- `starbase`：`starbase_miRNA_mRNA.csv`
- `mirdb`：`miRDB_miRNA_mRNA.csv`
- `mirtarbase`：`miRTarbase_miRNA_mRNA.csv`
- `starbase+mirdb`：`starbase_miRNA_mRNA.csv` 和 `miRDB_miRNA_mRNA.csv`
- `starbase+mirtarbase`：`starbase_miRNA_mRNA.csv` 和 `miRTarbase_miRNA_mRNA.csv`
- `mirdb+mirtarbase`：`miRDB_miRNA_mRNA.csv` 和 `miRTarbase_miRNA_mRNA.csv`
- lncRNA 文件：`starbase_miRNA_lncRNA_High.csv`、`starbase_miRNA_lncRNA_Median.csv` 或 `starbase_miRNA_lncRNA_Low.csv` 之一

## 输出文件

| 文件 | 描述 |
|------|-------------|
| `ceRNA_network_edges.csv` | 包含 `node1,node2` 列的边表 |
| `ceRNA_network_nodes.csv` | 包含 `node,type,degree` 列的节点表 |
| `ceRNA_network.pdf` | ceRNA 网络可视化 |
| `session_info.txt` | R 会话详情和已加载的软件包版本 |

## 工作流程

### 步骤 1：验证输入
- 检查关键基因输入是否存在，或解析以逗号分隔的基因
- 验证参数选项、数值限制、超时时间和颜色
- 验证数据库目录和所需文件

### 步骤 2：加载相互作用数据
- 加载所选的 miRNA-mRNA 数据集
- 根据严格度级别加载所选的 miRNA-lncRNA 数据集
- 根据请求重新计算两两交集

### 步骤 3：筛选网络
- 保留与所提供关键基因关联的 miRNA-mRNA 对
- 保留与已保留 miRNA 相连的 miRNA-lncRNA 对
- 应用 lncRNA 频率阈值
- 如果筛选后没有剩余的 lncRNA 相互作用，则以 `SKILL_INVALID_DATA` 停止，因为 ceRNA 层已崩溃

### 步骤 4：构建输出
- 构建边表和节点表
- 将 CSV、PDF 和会话信息保存在输出目录根目录中

## 方法

### `combined`
使用内置的、预先计算好的三个 miRNA-mRNA 资源交集，以获得置信度更高的相互作用。

### 两两交集
`starbase+mirdb`、`starbase+mirtarbase` 和 `mirdb+mirtarbase` 会重新计算两个内置数据库之间的交集。与 `combined` 模式相比，两两交集通常会减少 20–40% 的边，因为仅保留同时存在于两个所选数据库中的相互作用。当你需要置信度更高的边，并且可以接受网络覆盖率降低时，请使用两两交集模式。

### lncRNA 严格度
`High`、`Median` 和 `Low` 为 miRNA-lncRNA 相互作用选择不同的内置 starBase 证据级别。

## 示例

### 基础组合分析

```bash
Rscript scripts/main.R \
  -i ./key_genes.txt \
  -o ./output \
  -m combined
```

### 单数据库分析

```bash
Rscript scripts/main.R \
  -i ./key_genes.txt \
  -o ./output_starbase \
  -m starbase \
  -l Median \
  -f 1
```

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| `SKILL_FILE_NOT_FOUND` | 输入文件或数据库文件缺失 | 检查文件路径或内置数据库目录 |
| `SKILL_EMPTY_FILE` | 必需文件存在，但没有内容 | 替换或重新生成该文件 |
| `SKILL_EMPTY_DATA` | 必需的参考表中没有可用的数据行 | 检查输入内容，并根据需要重新生成该文件 |
| `SKILL_MISSING_COLUMNS` | 输入表缺少必需的列 | 检查预期的数据结构 |
| `SKILL_INVALID_PARAMETER` | 提供了无效的 CLI 值 | 使用文档中列出的参数值之一 |
| `SKILL_INVALID_DATA` | 输入数据无法构建有效的 ceRNA 网络，或者 lncRNA 过滤完全移除了 ceRNA 层 | 检查关键基因和数据库文件，然后降低 `--lncrna_freq_thresh`，或选择其他数据集/严格程度 |
| `SKILL_DEPENDENCY_MISSING` | 未安装必需的软件包（所有模式均需要 igraph，包括 `--help`） | 在运行任何命令之前安装缺失的软件包 |
| `SKILL_TIMEOUT` | 运行时间超过了超时限制 | 增大 `--timeout_seconds` |
| `SKILL_RUNTIME_ERROR` | 发生了意外的运行时故障 | 检查控制台错误消息后重新运行 |

**如果错误仍然存在**，请阅读：`references/troubleshooting.md`

## 测试

### 使用示例数据进行测试

```bash
# Run with sample data (igraph must be installed first)
Rscript scripts/main.R \
  -i tests/data/gene.txt \
  -o tests/output/
```

### 验证命令

```bash
# Inspect edge output
wc -l tests/output/ceRNA_network_edges.csv

# Check plot exists
ls -la tests/output/ceRNA_network.pdf
```