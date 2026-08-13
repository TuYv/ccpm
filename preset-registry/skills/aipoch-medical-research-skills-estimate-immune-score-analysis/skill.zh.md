---
name: estimate-immune-score-analysis
description: "Use this skill to compute ESTIMATE immune-related microenvironment scores from a bulk expression matrix, generate an ESTIMATE score heatmap, and optionally generate group-wise ESTIMATE score boxplots plus significance tables when a sample group file is supplied. Trigger keywords: ESTIMATE, immune score, stromal score, tumor microenvironment score. NOT for: immune cell deconvolution, single-cell analysis, differential expression, clinical diagnosis."
license: MIT
skill-author: AIPOCH
---
# ESTIMATE 免疫评分分析

## 适用场景

当用户希望执行以下操作时，请使用此技能：

- 根据批量表达矩阵计算 ESTIMATE 衍生的免疫评分和基质评分
- 将表达矩阵转换为 `estimate` 软件包的输入文件和评分输出
- 生成跨样本的 ESTIMATE 评分热图
- 在提供样本分组文件时，比较不同样本组之间的 ESTIMATE 评分
- 创建由 CLI 支持、具有结构化输出记录且可复现的 ESTIMATE 工作流

典型请求模式：

- “对这个表达矩阵运行 ESTIMATE 免疫评分分析”
- “根据我的批量 RNA-seq 数据计算 ImmuneScore 和 StromalScore”
- “生成 ESTIMATE 评分并保存样本级结果表”

## 执行模型

这是一个由 CLI 支持的分析技能。

1. 使用 `SKILL.md` 确认任务是根据批量表达数据生成 ESTIMATE 评分。
2. 使用 `scripts/main.R` 执行实际分析。
3. 提供一个表达矩阵文件，其中第一列为基因，其余列为样本。
4. 可以选择提供样本分组文件，以生成 ESTIMATE 评分箱线图和显著性汇总表。
5. 该工作流始终会根据计算得到的评分表生成 ESTIMATE 评分热图。
6. 仅在需要了解算法细节、进行故障排除或查看基线执行说明时读取参考文件。

## 何时读取外部文件

| 情况 | 要读取的文件 | 目的 |
|-----------|--------------|---------|
| 需要算法细节 | `references/algorithm.md` | 了解 ESTIMATE 评分工作流和结果解读 |
| 需要运行该技能 | `scripts/main.R` | 执行 CLI 入口点 |
| 遇到错误 | `references/troubleshooting.md` | 查找标准错误代码和修复方法 |
| 需要更多 CLI 示例或真实数据基线记录 | `references/cli-guide.md` | 复制命令并查看已记录的执行模板 |
| 需要示例输入文件 | `tests/data/` | 使用随附的演示表达矩阵 |

## 不适用场景

- 免疫细胞比例估算：请改用类似 CIBERSORT 的反卷积工作流
- 生物学分组之间的差异检验：请改用差异分析技能
- 单细胞分析：请使用单细胞专用工作流
- 临床诊断或治疗决策支持：请勿使用此技能

如果请求超出针对批量表达矩阵生成 ESTIMATE 评分的范围，请停止并说明此技能仅涵盖基于 ESTIMATE 的评分计算。

## 输入验证

此技能接受：

- 一个 CSV 或 TSV 格式的批量表达矩阵，其中第一列为基因，其余列为样本
- 一个可选的 CSV 或 TSV 格式样本分组文件，用于生成分组箱线图和执行显著性检验
- 根据批量转录组数据计算 ESTIMATE 衍生的 StromalScore、ImmuneScore、ESTIMATEScore、TumorPurity 及相关可视化的请求

请勿将此工作流用于：

- 单细胞 RNA-seq 或空间转录组学
- 免疫细胞反卷积请求
- 直接临床诊断、治疗建议或患者层面的医疗决策
- 与 ESTIMATE 评分生成无关的任务，例如文献写作、网页抓取或通用绘图

如果用户的请求超出此范围，请勿继续执行工作流。请改为回复：

> `estimate-immune-score-analysis` 旨在基于批量表达矩阵计算 ESTIMATE 肿瘤微环境评分。您的请求似乎超出了此范围。请提供有效的批量表达矩阵，并在需要时提供匹配的样本分组文件，或者使用更适合您任务的技能。

## 用法

```bash
Rscript scripts/main.R \
  --input_file ./expression_matrix.csv \
  --group_file ./group_info.csv \
  --output_dir ./output \
  --gene_id_type GeneSymbol \
  --platform affymetrix \
  --seed 42
```

## 参数

| 短参数 | 长参数 | 类型 | 默认值 | 说明 |
|-------|------|------|---------|-------------|
| `-i` | `--input_file` | character | 必填 | CSV 或 TSV 格式的表达矩阵文件 |
| `-o` | `--output_dir` | character | `./output` | 输出目录 |
|  | `--group_file` | character | 可选 | 用于 ESTIMATE 评分箱线图和显著性检验的样本分组文件 |
| `-g` | `--gene_id_type` | character | `GeneSymbol` | 基因标识符类型：`GeneSymbol` 或 `EntrezID` |
| `-p` | `--platform` | character | `affymetrix` | ESTIMATE 平台：`affymetrix`、`agilent` 或 `illumina` |
| `-s` | `--seed` | integer | `42` | 随机种子 |
| `-t` | `--timeout_seconds` | integer | `0` | 可选的超时时间（秒）；`0` 表示禁用超时 |
|  | `--input_delimiter` | character | `auto` | 输入分隔符提示：`auto`、`csv` 或 `tsv` |
|  | `--group_delimiter` | character | `auto` | 分组文件分隔符提示：`auto`、`csv` 或 `tsv` |
|  | `--sample_column` | character | `sample` | 分组文件中的样本列名称 |
|  | `--group_column` | character | `group` | 分组文件中的分组列名称 |
|  | `--plot_file` | character | `estimate_scores_boxplot.pdf` | 写入 `plot/` 下的箱线图文件名 |
|  | `--heatmap_file` | character | `estimate_scores_heatmap.pdf` | 写入 `plot/` 下的热图文件名 |

## 输入格式

- CSV 或 TSV 文件
- 第一列包含基因标识符
- 其余列为样本名称
- 表达值必须为数值且不得缺失
- 样本列名称必须唯一；样本列名称重复会引发 `SKILL_INVALID_PARAMETER`

示例：

```csv
gene,S1,S2,S3
TP53,8.1,7.9,6.5
EGFR,5.2,5.0,4.2
```

随附的 `tests/data/expression_matrix.csv` 复制自 `cibersort-immune-infiltration-analysis/tests/data/expression_matrix.csv`，用于演示和验证。

### 可选分组文件

- CSV 或 TSV 文件
- 必须包含一个样本列和一个分组列
- 样本名称必须与 ESTIMATE 评分表中的样本 ID 匹配
- 箱线图比较**仅支持恰好两个分组水平**。如果分组文件中存在两个以上的组，则会引发 `SKILL_INVALID_PARAMETER`。
- 每组必须包含**至少 3 个样本**，才能进行有效的统计检验。样本数不足的组会触发 `SKILL_INVALID_PARAMETER`。
- 如果提供了分组文件，但在核心评分完成后分组比较失败，则命令会在保留核心 ESTIMATE 输出和失败记录后，以 `SKILL_*` 错误退出

示例：

```csv
sample,group
S1,Tumor
S2,Tumor
S3,Healthy
S4,Healthy
```

## 输出文件

| 文件 | 描述 |
|------|-------------|
| `data/expression_input.tsv` | 为 ESTIMATE 准备的制表符分隔表达矩阵 |
| `data/estimate_input.gct` | 由 `estimate::filterCommonGenes()` 创建的 GCT 文件 |
| `data/estimate_score.gct` | `estimate::estimateScore()` 生成的原始 ESTIMATE 评分输出 |
| `table/estimate_scores.tsv` | 重新格式化的样本×评分表 |
| `plot/estimate_scores_heatmap.pdf` | 样本级 ESTIMATE 评分热图 |
| `table/estimate_score_group_stats.csv` | 提供 `--group_file` 时，每项评分的 p 值及中位数评分较高的组 |
| `plot/estimate_scores_boxplot.pdf` | 提供 `--group_file` 时生成的 ESTIMATE 评分箱线图 |
| `session_info.txt` | R 会话和软件包版本信息 |
| `output_manifest.txt` | 仅追加的输出文件清单及描述 |
| `run_record.txt` | 仅追加的运行记录，包含参数、运行时间和输出摘要 |

## 工作流程

### 步骤 1：验证输入

- 确认输入文件存在
- 确认矩阵至少包含一个基因列以及一个或多个样本列
- 确认所有表达量列均为数值类型，且样本名称唯一

### 步骤 2：运行 ESTIMATE

- 使用所选的基因标识符表头，将矩阵转换为制表符分隔文件
- 运行 `estimate::filterCommonGenes()`
- 运行 `estimate::estimateScore()`

### 步骤 3：导出结果

- 将原始 GCT 输出保存在 `data/` 下
- 将评分矩阵重新格式化为 `table/estimate_scores.tsv`
- 创建 `plot/estimate_scores_heatmap.pdf`
- 如果提供了 `--group_file`，则创建 `plot/estimate_scores_boxplot.pdf`
- 如果提供了 `--group_file`，则创建 `table/estimate_score_group_stats.csv`
- 如果核心评分完成后的分组比较失败，则保留核心输出，将失败详情追加到 `output_manifest.txt` 和 `run_record.txt`，并以一条 `SKILL_*` 消息退出
- 保存 `session_info.txt`
- 将运行部分追加到 `output_manifest.txt` 和 `run_record.txt`

## 示例

### 基本用法

```bash
Rscript scripts/main.R \
  --input_file ./expression_matrix.csv \
  --output_dir ./output
```

### 分组比较

```bash
Rscript scripts/main.R \
  --input_file ./expression_matrix.csv \
  --group_file ./group_info.csv \
  --output_dir ./grouped_output
```

### TSV 输入

```bash
Rscript scripts/main.R \
  --input_file ./expression_matrix.tsv \
  --input_delimiter tsv \
  --output_dir ./tsv_output \
  --gene_id_type GeneSymbol
```

### 其他平台

```bash
Rscript scripts/main.R \
  --input_file ./expression_matrix.csv \
  --output_dir ./illumina_output \
  --platform illumina \
  --seed 123
```

有关真实数据基线执行记录，请阅读：`references/cli-guide.md`

## 错误处理

| 错误代码 | 含义 | 解决方案 |
|------------|---------|----------|
| `SKILL_FILE_NOT_FOUND` | 输入文件缺失，或预期的中间文件未创建 | 检查文件路径并重新运行 |
| `SKILL_MISSING_COLUMNS` | 基因标识符列包含缺失值 | 修复第一列并重新运行 |
| `SKILL_EMPTY_DATA` | 矩阵或 ESTIMATE 输出为空 | 验证输入内容和标识符兼容性 |
| `SKILL_INVALID_PARAMETER` | CLI 参数不受支持；矩阵包含无效值；检测到重复的样本列名；提供了两个以上的组级别；或某个组包含的样本少于 3 个 | 检查参数和输入值 |
| `SKILL_SAMPLE_MISMATCH` | 分组文件中的样本名称与 ESTIMATE 评分表没有重叠 | 对齐样本 ID 后重新运行 |
| `SKILL_PACKAGE_NOT_FOUND` | 未安装所需的 R 软件包 | 安装 `references/cli-guide.md` 中列出的缺失软件包 |

如果错误仍然存在，请阅读：`references/troubleshooting.md`

对于 `SKILL_SAMPLE_MISMATCH` 等可选分组比较失败，请结合 `output_manifest.txt` 和 `run_record.txt` 检查保留下来的核心输出，以确定分组步骤失败前已完成的内容。

## 测试

```bash
Rscript scripts/main.R --help

Rscript tests/run_tests.R

Rscript scripts/main.R \
  --input_file tests/data/expression_matrix.csv \
  --group_file tests/data/group_info.csv \
  --output_dir tests/output \
  --gene_id_type GeneSymbol \
  --platform affymetrix \
  --seed 42
```

预期输出：

- `tests/output/data/expression_input.tsv`
- `tests/output/data/estimate_input.gct`
- `tests/output/data/estimate_score.gct`
- `tests/output/table/estimate_scores.tsv`
- `tests/output/plot/estimate_scores_heatmap.pdf`
- `tests/output/table/estimate_score_group_stats.csv`
- `tests/output/plot/estimate_scores_boxplot.pdf`
- `tests/output/session_info.txt`
- `tests/output/output_manifest.txt`
- `tests/output/run_record.txt`

可选的后续检查：

```bash
Rscript tests/test_skill.R tests/output
```

## 参考文献

1. Yoshihara K, Shahmoradgoli M, Martinez E, et al. (2013) 根据表达数据推断肿瘤纯度以及基质细胞和免疫细胞混合情况。*Nature Communications*. doi:10.1038/ncomms3612

有关算法的详细说明，请阅读：`references/algorithm.md`

## 实现检查清单

- [x] 使用 `optparse` 解析 CLI
- [x] 使用 `set.seed()` 确保可复现性
- [x] 仅使用公开的 CRAN/Bioconductor 软件包
- [x] 脚本参数已在 `SKILL.md` 中记录
- [x] `get_script_dir()` 在任何调用之前定义
- [x] `SKILL.md` 中包含文件读取说明
- [x] `tests/data/` 中提供了测试数据
- [x] 已使用 `SKILL_*` 消息实现错误处理
- [x] 已在 `references/cli-guide.md` 中完成基线记录
- [x] 容器执行后已生成 `skill-auditor` 输出