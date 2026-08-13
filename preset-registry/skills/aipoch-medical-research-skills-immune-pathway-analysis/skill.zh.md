---
name: immune-pathway-analysis
description: Run immune pathway GSVA or ssGSEA analysis from a bulk expression matrix, a sample group file, and a local immune Reactome gene-set table, then export differential pathway results and a heatmap for two-group comparison.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# 免疫通路分析

## 何时使用

当目标是基于批量表达数据量化免疫相关通路活性，并比较两个样本组之间的通路富集情况时，请使用此技能。

典型请求：

- “对这些样本运行免疫通路 GSVA。”
- “为免疫 Reactome 通路评分，并比较病例组与对照组。”
- “根据已保存的结果生成免疫通路热图。”
- “使用本地免疫基因集表进行通路评分。”

此技能适用于：

- 批量 RNA-seq 或类似微阵列的表达矩阵
- 预先准备的本地免疫 Reactome 基因集表
- 使用 `limma` 进行双组通路差异分析
- 使用仅追加的溯源文件执行可复现的 CLI 工作流

## 执行模型

这是一个混合型技能。

1. 确认请求属于此 `SKILL.md` 的适用范围。
2. 仅询问缺失的文件路径或组标签。
3. 使用适当的模式运行 `scripts/main.R`。
4. 使用 `--mode analyze` 对通路进行评分并导出表格。
5. 使用 `--mode visualize` 根据已保存的结果对象重新生成热图。
6. 使用 `--mode full` 一次性完成分析和可视化。
7. 仅在需要深入了解算法、排查问题或获取 CLI 详细信息时读取参考文件。
8. 执行后，报告输出目录、评分方法、比较组和主要输出文件。

## 完成格式

成功运行后，分为 3 个简短部分总结结果：

1. 使用的模式和方法，以及比较的组。
2. 输出目录和写入的关键文件。
3. 影响结果解读的重要警告，例如没有通路满足 `fdr_threshold`，以及回退到按 `|t|` 排名。

完成摘要示例：

> 已在 `./output/run_001` 中使用 `gsva` 完成 `Case` 与 `Control` 的免疫通路分析。关键输出：`table/immune_pathway_diff.csv`、`table/immune_pathway_scores.csv`、`data/immune_pathway_result.rds` 和 `plot/immune_pathway_heatmap.pdf`。没有通路满足 `FDR <= 0.05`，因此工作流使用了文档中规定的回退方案，按 `|t|` 排名来导出排名靠前的通路并选取热图子集。

## 何时读取外部文件

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| 需要方法详情或解读指导 | `references/algorithm.md` | 查看 GSVA 逻辑、limma 比较方法和解读指导 |
| 需要可运行的命令或依赖项设置 | `references/cli-guide.md` | 复用 CLI 示例、测试夹具说明和经过验证的基线记录 |
| 需要错误修复方法 | `references/troubleshooting.md` | 查找错误代码、回退行为和常见修复方法 |
| 需要可执行工作流 | `scripts/main.R` | 使用 CLI 入口点 |
| 需要最小化演示输入 | `tests/data/` | 使用随附的示例表达、分组和基因集文件 |

## 何时不应使用

- 免疫细胞比例估算或去卷积
- 不包含通路评分的基因层面差异表达分析
- 单细胞聚类、注释或通信分析
- 临床诊断或治疗方案选择

如果请求超出这些边界，请停止，并说明此技能仅涵盖使用本地免疫基因集表进行的批量免疫通路 GSVA 或 ssGSEA 分析。

## 输入验证

此技能接受：

- CSV 或 TSV 格式的批量表达矩阵
- 在分析模式下，包含恰好两个比较组的样本分组文件
- 长表格式的本地免疫基因集表
- 在可视化模式下，包含 `data/immune_pathway_result.rds` 的现有输出目录

如果用户的请求不涉及基于本地文件的批量免疫通路评分，请勿继续执行工作流。请改为回复：

> “Immune Pathway Analysis 专为使用本地基因集表进行批量免疫通路 GSVA 或 ssGSEA 分析而设计。您的请求似乎超出了此范围。请提供批量表达矩阵、双组样本文件和本地通路表，或者针对去卷积、差异表达或单细胞分析使用更合适的技能。”

如果请求在范围内，但缺少必需的输入，请仅询问缺失的文件路径或组标签，然后再运行 `scripts/main.R`。

## 用法

```bash
Rscript scripts/main.R \
  --mode full \
  --input_file ./expression_matrix.csv \
  --group_file ./group_info.csv \
  --geneset_file ./immune_genesets.csv \
  --case_group Case \
  --control_group Control \
  --output_dir ./output/run_001 \
  --seed 42
```

## 参数

| 短选项 | 长选项 | 类型 | 默认值 | 说明 |
|-------|------|------|---------|-------------|
| `-m` | `--mode` | character | `analyze` | 运行模式：`analyze`、`visualize` 或 `full` |
| `-i` | `--input_file` | character | `analyze` 或 `full` 模式下必需 | CSV 或 TSV 格式的表达矩阵文件 |
| `-g` | `--group_file` | character | `analyze` 或 `full` 模式下必需 | CSV 或 TSV 格式的样本分组文件 |
|  | `--geneset_file` | character | `analyze` 或 `full` 模式下必需 | 长表格式的本地免疫基因集表 |
|  | `--geneset_column` | character | `gs_name` | 基因集表中的通路列 |
|  | `--gene_column` | character | `gene_symbol` | 基因集表中的基因符号列 |
|  | `--focus_genesets` | character | 可选 | 在热图中优先显示的通路名称，以逗号分隔 |
| `-a` | `--case_group` | character | `analyze` 或 `full` 模式下必需 | 病例组标签 |
| `-c` | `--control_group` | character | `analyze` 或 `full` 模式下必需 | 对照组标签 |
| `-o` | `--output_dir` | character | `./output` | 此技能文件夹内的输出目录 |
|  | `--method` | character | `gsva` | 评分方法：`gsva` 或 `ssgsea` |
|  | `--kcdf` | character | `Gaussian` | GSVA 核：`Gaussian`、`Poisson` 或 `none` |
|  | `--min_sz` | integer | `2` | 最小基因集大小 |
|  | `--max_sz` | integer | `5000` | 最大基因集大小 |
|  | `--parallel_sz` | integer | `1` | 传递给 `GSVA::gsva` 的工作进程数 |
|  | `--mx_diff` | logical | `TRUE` | GSVA `mx.diff` 标志 |
|  | `--tau` | double | `1` | GSVA `tau` 值 |
|  | `--fdr_threshold` | double | `0.05` | 显著性摘要的 FDR 阈值 |
|  | `--top_n` | integer | `20` | 导出到最高评分矩阵的最大通路数 |
|  | `--seed` | integer | `42` | 随机种子 |
|  | `--timeout_seconds` | integer | `0` | 可选的超时时间（秒）；`0` 表示禁用超时 |
|  | `--plot_file` | character | `immune_pathway_heatmap.pdf` | 存储在 `plot/` 下的热图文件名 |
|  | `--plot_title` | character | `Immune Pathway GSVA Heatmap` | 热图标题 |
|  | `--width` | double | `14` | 热图宽度（英寸） |
|  | `--height` | double | `8` | 热图高度（英寸） |
|  | `--colors` | character | `#91bfdb,#ffffbf,#fc8d59` | 以逗号分隔的热图颜色 |
|  | `--scale` | character | `none` | 热图缩放模式：`none`、`row` 或 `column` |
|  | `--cluster_rows` | logical | `TRUE` | 对热图行进行聚类 |
|  | `--cluster_cols` | logical | `FALSE` | 对热图列进行聚类 |
|  | `--show_rownames` | logical | `TRUE` | 在热图上显示通路名称 |
|  | `--show_colnames` | logical | `FALSE` | 在热图上显示样本名称 |
|  | `--fontsize` | double | `10` | 热图基础字体大小 |
|  | `--fontsize_row` | double | `8` | 热图行字体大小 |
|  | `--fontsize_col` | double | `9` | 热图列字体大小 |
|  | `--legend_cex` | double | `1` | 图例文本缩放因子 |
|  | `--top_up` | integer | 可选 | 保留用于绘图的上调通路数量 |
|  | `--top_down` | integer | 可选 | 保留用于绘图的下调通路数量 |
|  | `--top_mode` | character | `both` | 热图子集模式：`both`、`up`、`down` 或 `total` |
|  | `--sort_by` | character | `FDR` | 通路排序方式：`FDR`、`absLFC` 或 `LFC` |
|  | `--append_stats` | logical | `FALSE` | 将 `FDR` 和 `logFC` 附加到热图标签 |
|  | `--label_max_chars` | integer | `90` | 热图标签的最大长度 |

## 输入格式

### 表达矩阵

- CSV 或 TSV 文件
- 第一列包含基因标识符
- 其余列为样本名称
- 值必须为数值
- 不允许存在缺失值

### 分组文件

- 带表头的 CSV 或 TSV 文件
- 支持的样本列名：`sample`、`sample_name`、`sample_id`、`sampleid`
- 支持的分组列名：`group`、`condition`、`class`、`cluster`
- 样本名称必须与表达矩阵中的列名匹配

### 基因集表

- 长格式的 CSV 或 TSV 文件
- 每行表示一个基因到通路的映射
- 必须包含一个通路列和一个基因列
- 默认列名为 `gs_name` 和 `gene_symbol`
- 可通过 `--geneset_column` 和 `--gene_column` 支持其他模式

## 输出文件

| 文件 | 说明 |
|------|-------------|
| `table/immune_pathway_diff.csv` | 来自 `limma` 的差异通路结果 |
| `table/immune_pathway_scores.csv` | 完整的 GSVA 或 ssGSEA 得分矩阵 |
| `table/immune_pathway_scores_top.csv` | 从差异分析结果中选出的顶部通路得分矩阵 |
| `table/immune_gene_set_summary.csv` | 表解析后各通路的基因数量 |
| `data/immune_pathway_result.rds` | 供可视化模式使用的已保存分析对象 |
| `plot/immune_pathway_heatmap.pdf` | 在 `visualize` 或 `full` 模式下生成的热图 PDF |
| `session_info.txt` | R 会话和软件包版本记录 |
| `output_manifest.txt` | 仅追加的输出清单 |
| `run_record.txt` | 仅追加的运行记录 |

当没有通路通过所选的 `fdr_threshold` 时，工作流会记录警告，并回退到按 `|t|` 对通路进行排序。在这种情况下，仍可填充 `table/immune_pathway_scores_top.csv`，以供后续绘图和审查。

## 错误处理

| 错误代码 | 含义 | 解决方案 |
|------------|---------|----------|
| `SKILL_FILE_NOT_FOUND` | 输入文件或已保存的结果对象不存在 | 检查路径并重新运行 |
| `SKILL_MISSING_COLUMNS` | 分组文件或基因集表缺少必需列 | 重命名列或导出正确的表 |
| `SKILL_EMPTY_DATA` | 矩阵、基因集列表或绘图矩阵为空 | 检查输入内容、基因重叠情况和所选基因集列 |
| `SKILL_INVALID_PARAMETER` | CLI 值缺失、无效或不安全 | 查看参数表并重新运行 |
| `SKILL_SAMPLE_MISMATCH` | 矩阵与分组文件之间的样本未对齐 | 对齐样本名称后重新运行 |
| `SKILL_PACKAGE_NOT_FOUND` | 缺少必需的 R 软件包 | 安装 `references/cli-guide.md` 中列出的软件包 |
| `SKILL_VERSION_INCOMPATIBLE` | 已安装的软件包版本属于已知的不兼容组合 | 按照 `references/cli-guide.md` 中的版本指南操作并重新运行 |

如果错误仍然存在，请阅读 `references/troubleshooting.md`。

## 测试

- 最小可运行文件随附于 `tests/data/` 中。
- 随附的冒烟测试数据集旨在验证执行过程和回退路径。它可能合理地产生零个满足 `FDR <= 0.05` 的通路。
- `tests/data/immune_genesets_minimal.csv` 是一个单元测试固件，不能直接与 `tests/data/expression_matrix.csv` 搭配用作完整工作流演示，除非准备一个包含重叠基因的匹配矩阵。
- 使用 `Rscript tests/run_unit_tests.R` 运行边界检查、辅助函数检查和验证测试，而无需运行完整的 GSVA 工作流。
- 使用 `Rscript tests/run_tests.R` 执行单元检查以及完整的冒烟测试工作流。
- 使用 `Rscript tests/test_skill.R tests/output` 验证预期输出。
- 已验证的测试基线、软件包版本、固件说明和自定义列 CLI 示例记录在 `references/cli-guide.md` 中。