---
name: lncrna-regulatory-network-construction-analysis
description: Use this bioinformatics data analysis skill to construct a database-driven lncRNA-mRNA regulatory network from target lncRNA and/or gene lists by projecting shared miRNA evidence from local ceRNA reference tables. It does not infer networks from expression matrices.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# lncRNA 调控网络构建分析

## 何时使用

当用户需要基于本地数据库的网络检索工作流，而不是基于表达数据的推断时，请使用此技能。

典型用例：

- 根据目标基因和内置的 ceRNA 参考表构建 lncRNA-mRNA 网络
- 从候选 lncRNA 列表出发，通过共享 miRNA 检索关联的 mRNA
- 生成可审计的 lncRNA-mRNA 网络表及三元证据表
- 复用已保存的数据库衍生网络对象，重新生成 PDF 图

当用户提出以下请求时，请勿使用此技能：

- 基于表达矩阵的网络推断
- lncRNA 与 mRNA 之间的相关性分析
- 基于表达数据进行因果推断或调控强度估计
- 在线数据库查询或远程 API 检索

## 执行模型

这是一个混合型技能。

1. 阅读 `SKILL.md`，确认请求由数据库驱动。
2. 使用 `scripts/main.R` 执行实际操作。
3. 使用 `--mode analyze` 构建表格和已保存的 `.rda` 对象。
4. 使用 `--mode visualize` 复用已保存的对象并重新绘制 PDF，而无需重建数据库表。
5. 使用 `--mode full` 在一次运行中执行上述两个步骤。
6. 仅在需要更多详细信息时读取参考文件。
7. 执行 `--mode visualize` 之前，确认 `output_dir/data/lncrna_network.rda` 已存在。
8. 在 `visualize` 模式下，已保存的 `.rda` 对象是必需输入；`reference_dir` 缺失或无效不会阻止复用绘图。
9. 执行后，报告模式、输出目录、关键文件，以及保留的网络规模或显示的技能错误代码。

## 何时读取外部文件

| 情况 | 要读取的文件 | 目的 |
|-----------|--------------|---------|
| 需要算法详细信息 | `references/algorithm.md` | 了解共享 miRNA 投影逻辑 |
| 需要故障排除帮助 | `references/troubleshooting.md` | 查看错误代码和修复方法 |
| 需要 CLI 示例或基准记录 | `references/cli-guide.md` | 查看安装方法、示例和已记录的运行情况 |
| 需要可运行的演示输入 | `tests/data/` | 使用内置的目标基因和 lncRNA 列表 |
| 需要实际执行 | `scripts/main.R` | 运行 CLI 工作流 |

## 超出范围时的响应模式

如果请求基于表达数据而非数据库驱动，请勿运行此技能。请简要回复：

> 此技能仅使用目标基因和/或 lncRNA 列表，从本地 ceRNA 参考表中投影 lncRNA-mRNA 关联。它不会根据表达矩阵推断网络，也不会估计因果调控强度。对于基于表达数据的相关性分析或因果推断，请使用其他工作流。

如果无法确定请求是数据库驱动的检索还是基于表达数据的推断，请在运行任何命令之前提出一个简短的澄清问题。

## Agent 响应约定

运行成功时，请报告：

- 所选模式及其符合请求的原因
- `output_dir`
- 已生成或复用的关键输出文件
- `table/network_stats.txt` 中记录的保留网络规模（如可用）
- 简短提醒结果由数据库驱动，而非通过表达数据推断得出

对于失败的运行，请报告：

- 对外显示的 `SKILL_*` 错误代码
- 根据 `references/troubleshooting.md` 判断的最可能原因
- 重新运行工作流时最简短且可执行的下一步操作

## 用法

```bash
Rscript scripts/main.R \
  --mode full \
  --target_genes ./target_genes.txt \
  --target_lncrna ./target_lncrna.txt \
  --mirna_dataset combined \
  --lncrna_strictness High \
  --min_shared_mirna 1 \
  --reference_dir ./references/database \
  --output_dir ./output \
  --seed 42
```

## 参数

| 长参数 | 类型 | 默认值 | 说明 |
|------|------|---------|-------------|
| `--mode` | character | `full` | 运行模式：`analyze`、`visualize` 或 `full` |
| `--target_genes` | character | 空 | 目标基因列表文件或以逗号分隔的基因列表 |
| `--target_lncrna` | character | 空 | 目标 lncRNA 列表文件或以逗号分隔的 lncRNA 列表 |
| `--mirna_dataset` | character | `combined` | miRNA-mRNA 数据集：`combined`、`starbase`、`mirdb`、`mirtarbase`、`starbase+mirdb`、`starbase+mirtarbase` 或 `mirdb+mirtarbase` |
| `--lncrna_strictness` | character | `High` | miRNA-lncRNA 严格程度：`Low`、`Median` 或 `High` |
| `--lncrna_freq_thresh` | integer | `0` | 边聚合后的最小 lncRNA 度阈值 |
| `--min_shared_mirna` | integer | `1` | 保留 lncRNA-mRNA 边所需的最小共享 miRNA 数量 |
| `--reference_dir` | character | `references/database` | 包含捆绑 ceRNA 参考表的本地目录；`analyze` 和 `full` 模式必需 |
| `--output_dir` | character | `tests/output` | Skill 根目录内的输出目录 |
| `--plot_file` | character | `lncrna_mrna_network.pdf` | `plot/` 下的 PDF 文件名 |
| `--plot_title` | character | `lncRNA-mRNA Regulatory Network` | 图标题 |
| `--layout_type` | character | `kk` | 图布局：`kk`、`fr`、`circle` 或 `nicely` |
| `--width` | double | `14` | 图宽度（英寸） |
| `--height` | double | `9` | 图高度（英寸） |
| `--node_size_base` | double | `6` | 节点基础大小 |
| `--node_size_scale` | double | `1.5` | 每增加一个度时的节点大小增量 |
| `--lncrna_color` | character | `#1f77b4` | lncRNA 节点颜色 |
| `--mrna_color` | character | `#d62728` | mRNA 节点颜色 |
| `--seed` | integer | `42` | 随机种子 |
| `--timeout_seconds` | integer | `0` | 可选的超时时间（秒）；`0` 表示禁用 |

## 输入格式

### 目标基因列表

- 纯文本文件或以逗号分隔的列表
- 使用文件时，每行一个基因符号

示例：

```text
TP53
BRCA1
MYC
```

### 目标 lncRNA 列表

- 纯文本文件或以逗号分隔的列表
- 使用文件时，每行一个 lncRNA 符号

示例：

```text
XIST
SNHG16
HNRNPU-AS1
```

必须至少提供 `--target_genes` 或 `--target_lncrna` 其中之一。

## 输出文件

| 文件 | 说明 |
|------|-------------|
| `table/lncrna_mrna_edges.csv` | 包含共享 miRNA 数量和标签的投影 lncRNA-mRNA 网络 |
| `table/lncrna_mirna_mrna_evidence.csv` | 三方证据表，每条证据链对应一行 lncRNA-miRNA-mRNA 记录 |
| `table/lncrna_mrna_nodes.csv` | 包含节点类型和度的节点表 |
| `table/network_stats.txt` | 网络汇总统计信息 |
| `data/lncrna_network.rda` | 可视化模式使用的序列化 R 对象 |
| `plot/lncrna_mrna_network.pdf` | 投影 lncRNA-mRNA 网络 PDF |
| `session_info.txt` | R 会话和软件包版本记录 |
| `output_manifest.txt` | 生成输出的仅追加清单 |
| `run_record.txt` | 包含参数、运行时间和输出摘要的仅追加运行历史记录 |

## 错误处理

| 错误代码 | 含义 | 解决方案 |
|------------|---------|----------|
| `SKILL_FILE_NOT_FOUND` | 缺少必需的列表文件、参考文件或已保存的结果对象 | 检查路径并重新运行 |
| `SKILL_MISSING_COLUMNS` | 缺少必需的数据库列 | 验证参考表格式 |
| `SKILL_EMPTY_DATA` | 未保留任何目标 ID、证据行或最终边 | 扩大目标列表或放宽筛选条件 |
| `SKILL_INVALID_PARAMETER` | CLI 参数缺失、无效或不安全 | 重新检查参数表 |
| `SKILL_SAMPLE_MISMATCH` | 保留用于需要匹配实体的工作流 | 仅使用数据库的工作流中不会出现 |
| `SKILL_PACKAGE_NOT_FOUND` | 缺少必需的 R 包 | 安装 `references/cli-guide.md` 中列出的包 |

## 渐进式披露

1. 从 `--target_genes` 或 `--target_lncrna` 开始。
2. 如果需要更聚焦的子网络，请添加第二个目标列表。
3. 如果需要不同的 miRNA-mRNA 证据来源，请切换 `--mirna_dataset`。
4. 调整 `--lncrna_strictness`、`--lncrna_freq_thresh` 和 `--min_shared_mirna`，以收紧或放宽投影网络。
5. `.rda` 对象存在后，使用 `--mode visualize` 进行复用。

## 结果规模指南

- 仅包含基因或仅包含 lncRNA 的宽泛运行可能会快速扩展，并可能保留数百至数千条边。
- 如果保留的网络过大，不便进行实际审查，请报告边和节点的总数，然后增大 `--min_shared_mirna`、增大 `--lncrna_freq_thresh`，或提供互补的目标列表。
- 在使用更宽泛的目标列表之前，先从随附的演示输入开始。

## 示例

### 基因驱动网络

```bash
Rscript scripts/main.R \
  --mode full \
  --target_genes ./target_genes.txt \
  --reference_dir ./references/database \
  --output_dir ./output
```

### lncRNA 驱动网络

```bash
Rscript scripts/main.R \
  --mode analyze \
  --target_lncrna ./target_lncrna.txt \
  --mirna_dataset starbase \
  --lncrna_strictness Median \
  --output_dir ./lncrna_only_output
```

### 聚焦的二分网络

```bash
Rscript scripts/main.R \
  --mode full \
  --target_genes TP53,BRCA1,MYC \
  --target_lncrna XIST,SNHG16,HNRNPU-AS1 \
  --mirna_dataset combined \
  --lncrna_strictness High \
  --min_shared_mirna 2 \
  --output_dir ./focused_output
```

### 复用可视化

```bash
Rscript scripts/main.R \
  --mode visualize \
  --output_dir ./focused_output \
  --plot_file reused_network.pdf \
  --layout_type fr
```

有关随附的基线和 CLI 说明，请阅读 `references/cli-guide.md`。

## 测试

```bash
Rscript scripts/main.R --help

Rscript tests/run_tests.R

Rscript scripts/main.R \
  --mode full \
  --target_genes tests/data/target_genes.txt \
  --target_lncrna tests/data/target_lncrna.txt \
  --reference_dir references/database \
  --output_dir tests/output \
  --seed 42
```

验证运行后预期保留的输出：

- `tests/output/table/lncrna_mrna_edges.csv`
- `tests/output/table/lncrna_mirna_mrna_evidence.csv`
- `tests/output/table/lncrna_mrna_nodes.csv`
- `tests/output/table/network_stats.txt`
- `tests/output/data/lncrna_network.rda`
- `tests/output/plot/lncrna_mrna_network.pdf`
- `tests/output/session_info.txt`
- `tests/output/output_manifest.txt`
- `tests/output/run_record.txt`

## 范围限制

此技能不会从表达矩阵中推断网络，也不会执行在线查询。

如果用户需要基于表达数据的相关性分析或因果推断，请使用其他工作流。