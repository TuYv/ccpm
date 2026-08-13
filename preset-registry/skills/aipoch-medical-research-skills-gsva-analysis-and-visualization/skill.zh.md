---
name: gsva-analysis-and-visualization
description: "Use this skill to run GSVA or ssGSEA pathway-level differential analysis from a bulk expression matrix and a sample group file, then generate a heatmap from the saved GSVA result object. Trigger keywords: GSVA, ssGSEA, pathway enrichment, KEGG pathway analysis, MSigDB. NOT for: gene-level differential expression, single-cell analysis, methylation analysis, clinical diagnosis."
license: MIT
skill-author: AIPOCH
---
# GSVA 分析与可视化

## 何时使用

当用户需要以下任一功能时，请使用此技能：

- 基于批量表达矩阵和样本分组文件进行通路层面的 GSVA 或 ssGSEA 分析
- 使用 GSVA 和 limma 进行病例组与对照组或处理组与对照组的通路富集比较
- 对批量 RNA-seq 或类微阵列表达数据进行 KEGG 或 MSigDB 通路分析
- 基于现有的 `data/GSVA_list.rda` 结果对象生成热图
- 通过可复现的 CLI 驱动式 GSVA 工作流，保存结果表、`.rda` 对象和 PDF 热图

典型请求模式：

- “对我的批量 RNA-seq 矩阵运行 GSVA，并比较病例组与对照组”
- “使用 ssGSEA 对通路进行评分，并保存通路差异分析结果”
- “根据我保存的 GSVA 结果生成 KEGG 通路热图”
- “对这些已分组的批量样本使用 GSVA 进行通路富集分析”

## 执行模型

这是一个混合型技能。

1. 使用 `SKILL.md` 验证请求是否在适用范围内。
2. 使用 `scripts/main.R` 进行实际执行。
3. 使用 `--mode analyze` 计算通路评分和差异分析结果。
4. 使用 `--mode visualize` 复用现有的 `data/GSVA_list.rda` 并生成热图。在可视化模式下，`GSVA_list.rda` 必须存在于 `output_dir/data/` 中；如果缺失，请先运行 `analyze` 或 `full` 模式（否则将触发 `SKILL_FILE_NOT_FOUND`）。
5. 使用 `--mode full` 一次性完成分析和可视化。
6. 仅在需要算法细节、故障排查或其他 CLI 示例时读取参考文件。

## 何时读取外部文件

| 情况 | 要读取的文件 | 目的 |
|-----------|--------------|---------|
| 需要算法细节 | `references/algorithm.md` | 了解 GSVA、limma 和热图生成逻辑 |
| 需要运行分析或绘图 | `scripts/main.R` | 执行 CLI 入口点 |
| 遇到错误 | `references/troubleshooting.md` | 查找标准错误代码和修复方法 |
| 需要更多 CLI 示例或基准执行记录 | `references/cli-guide.md` | 复制可直接运行的命令并查看已记录的测试运行 |
| 需要示例输入文件 | `tests/data/` | 使用随附的演示矩阵和分组文件 |

## 何时不应使用

- 基因层面的差异表达分析：请改用 `differential-expression-analysis`
- 单细胞 RNA-seq 聚类或通信分析：请使用 `sc-clustering` 或 `cellchat`
- 需要进行免疫浸润评分而非通路富集分析：请使用 `ssgsea-r` 或 `ssgsea_immune`
- 临床诊断、治疗方案选择或患者特异性解读：请勿使用此技能；应要求采用经过验证的临床工作流或由人类专家进行审核

如果请求超出这些边界，请停止并告知用户，此技能仅涵盖批量表达数据的通路层面 GSVA/ssGSEA 分析及下游热图可视化。

## 方法选择指南

请根据数据特征选择 `--method`：

- `gsva`：基于核函数的富集评分，适用于具有中等至较大样本量的连续表达数据（建议每组 ≥ 10 个样本）。
- `ssgsea`：基于排序的富集评分；对异常值不太敏感，更适合噪声较大的数据或较小的样本量。

有关详细的方法学比较，请阅读：`references/algorithm.md`

## 用法

```bash
Rscript scripts/main.R \
  --mode full \
  --input_file tests/data/expr_matrix.csv \
  --group_file tests/data/group.csv \
  --case_group Tumor \
  --control_group Healthy \
  --species "Homo sapiens" \
  --category C2 \
  --subcategory KEGG \
  --output_dir ./output \
  --seed 42
```

## 参数

| 短选项 | 长选项 | 类型 | 默认值 | 说明 |
|-------|------|------|---------|-------------|
| `-m` | `--mode` | 字符型 | `analyze` | 运行模式：`analyze`、`visualize` 或 `full` |
| `-i` | `--input_file` | 字符型 | `analyze`/`full` 模式必需 | 表达矩阵文件（CSV 或 TSV，基因为行，样本为列） |
| `-g` | `--group_file` | 字符型 | `analyze`/`full` 模式必需 | 样本分组文件（CSV 或 TSV，包含样本列和分组列） |
| `-a` | `--case_group` | 字符型 | `analyze`/`full` 模式必需 | 病例组或处理组标签 |
| `-c` | `--control_group` | 字符型 | `analyze`/`full` 模式必需 | 对照组标签 |
| `-o` | `--output_dir` | 字符型 | `./output/` | 输出目录 |
| `-s` | `--species` | 字符型 | `Homo sapiens` | MSigDB 物种 |
| `-C` | `--category` | 字符型 | `C2` | MSigDB 类别 |
| `-S` | `--subcategory` | 字符型 | `KEGG` | MSigDB 子类别 |
|  | `--method` | 字符型 | `gsva` | GSVA 方法：`gsva` 或 `ssgsea`（参见上方的方法选择指南） |
|  | `--kcdf` | 字符型 | `Gaussian` | GSVA 核函数：`Gaussian`、`Poisson` 或 `none` |
|  | `--min_sz` | 整数型 | `2` | 最小基因集大小 |
|  | `--max_sz` | 整数型 | `10000` | 最大基因集大小 |
|  | `--parallel_sz` | 整数型 | `1` | 传递给 GSVA 的并行工作进程数 |
|  | `--mx_diff` | 逻辑型 | `TRUE` | GSVA `mx.diff` 标志 |
|  | `--tau` | 双精度型 | `1` | GSVA `tau` 值 |
|  | `--fdr_threshold` | 双精度型 | `0.05` | 用于选择排名靠前通路的 FDR 阈值 |
|  | `--top_n` | 整数型 | `20` | 导出至排名靠前得分矩阵的通路数量 |
|  | `--seed` | 整数型 | `42` | 随机种子 |
|  | `--timeout_seconds` | 整数型 | `0` | 可选的超时时间（秒）；`0` 表示禁用 |
|  | `--plot_file` | 字符型 | `GSVA_heatmap.pdf` | `plot/` 下的热图文件名（仅限文件名；不得包含路径分隔符） |
|  | `--plot_title` | 字符型 | `GSVA Enrichment Heatmap` | 热图标题 |
|  | `--width` | 双精度型 | `14` | 热图宽度（英寸） |
|  | `--height` | 双精度型 | `8` | 热图高度（英寸） |
|  | `--colors` | 字符型 | `#91bfdb,#ffffbf,#fc8d59` | 以逗号分隔的热图颜色 |
|  | `--scale` | 字符型 | `none` | 热图缩放模式：`none`、`row` 或 `column` |
|  | `--cluster_rows` | 逻辑型 | `TRUE` | 对热图行进行聚类 |
|  | `--cluster_cols` | 逻辑型 | `FALSE` | 对热图列进行聚类 |
|  | `--show_rownames` | 逻辑型 | `TRUE` | 在热图上显示通路名称 |
|  | `--show_colnames` | 逻辑型 | `FALSE` | 在热图上显示样本名称 |
|  | `--fontsize` | 双精度型 | `10` | 热图基础字体大小 |
|  | `--fontsize_row` | 双精度型 | `8` | 行标签字体大小 |
|  | `--fontsize_col` | 双精度型 | `9` | 列标签字体大小 |
|  | `--legend_cex` | 双精度型 | `1` | 图例文本缩放因子 |
|  | `--top_up` | 整数型 | 可选 | 保留用于绘图的上调通路数量 |
|  | `--top_down` | 整数型 | 可选 | 保留用于绘图的下调通路数量 |
|  | `--top_mode` | 字符型 | `both` | 热图子集模式：`both`、`up`、`down` 或 `total` |
|  | `--sort_by` | 字符型 | `FDR` | 通路排序依据：`FDR`、`absLFC` 或 `LFC` |
|  | `--append_stats` | 逻辑型 | `FALSE` | 将 `FDR` 和 `logFC` 追加到热图标签中 |
|  | `--label_max_chars` | 整数型 | `80` | 热图标签的最大长度 |

## 输入格式

### 表达矩阵

- CSV 或 TSV 文件
- 第一列包含基因标识符
- 其余列为样本名称
- 值必须为数值，且不得包含缺失值

示例：

```csv
gene,S1,S2,S3,S4
TP53,8.1,7.9,6.5,6.3
EGFR,5.2,5.0,4.2,4.1
```

随附的 `tests/data/expr_matrix.csv` 来源于公共 GEO 系列 `GSE44076`，经过探针到基因的合并处理，并包含 `Tumor` 与 `Healthy` 的子集。

### 分组文件

- 带有表头行的 CSV 或 TSV 文件
- 一个样本列：`sample`、`sample_name` 或 `sample_id`
- 一个分组列：`group`、`condition`、`cluster` 或 `class`
- 样本名称必须与表达矩阵的列名匹配

示例：

```csv
sample,group
GSM1077746,Tumor
GSM1077747,Tumor
GSM1077598,Healthy
GSM1077599,Healthy
```

## 输出文件

| 文件 | 描述 |
|------|-------------|
| `table/GSVA_diff.csv` | 包含 `logFC`、`P.Value` 和 `adj.P.Val` 的 limma 通路差异分析结果 |
| `table/GSVA_enrichment_results.csv` | 完整的 GSVA 得分矩阵 |
| `table/GSVA_enrichment_results_topN.csv` | 根据 `--top_n` 和 `--fdr_threshold` 选择的高排名通路得分矩阵 |
| `data/GSVA_list.rda` | 保存的 `gsva_result` 对象，用于下游可视化 |
| `plot/GSVA_heatmap.pdf` | 在 `visualize` 或 `full` 模式下生成的热图 PDF |
| `session_info.txt` | R 会话和软件包版本信息 |
| `output_manifest.txt` | 在同一 `output_dir` 中跨多次运行追加记录所生成输出的清单 |
| `run_record.txt` | 在同一 `output_dir` 中跨多次运行追加记录参数、运行时间和输出摘要的运行日志 |

### table/GSVA_diff.csv

| 列 | 类型 | 描述 |
|--------|------|-------------|
| `logFC` | 数值型 | 由 limma 估计的病例组与对照组之间的通路得分差异 |
| `AveExpr` | 数值型 | 所有样本的平均通路得分 |
| `t` | 数值型 | 来自 limma 的调节 t 统计量 |
| `P.Value` | 数值型 | 来自 limma 的原始 p 值 |
| `adj.P.Val` | 数值型 | 经 Benjamini-Hochberg 方法校正的 p 值 |
| `B` | 数值型 | 该通路存在差异富集的对数优势比 |
| `geneset` | 字符型 | GSVA 运行中使用的通路标识符 |

## 工作流程

### 步骤 1：验证输入

- 检查表达矩阵和分组文件是否存在
- 验证支持的列以及样本名称是否匹配
- 验证 CLI 参数范围和特定模式所需的参数

### 步骤 2：运行通路分析

- 加载所请求物种和集合对应的 MSigDB 基因集
- 计算每个样本的 GSVA 或 ssGSEA 得分
- 拟合 limma 模型，以比较病例组与对照组的通路差异

### 步骤 3：生成输出

- 将完整得分矩阵、高排名通路子集和差异分析结果保存到 `table/`
- 将可复用的 `gsva_result` 对象保存到 `data/GSVA_list.rda`
- 在 `visualize` 或 `full` 模式下运行时，在 `plot/` 中生成热图 PDF
- 每次调用时，向 `output_manifest.txt` 和 `run_record.txt` 追加一个新部分，以便在复用同一 `output_dir` 时保留先前的溯源信息

## 示例

### 基本用法

```bash
Rscript scripts/main.R \
  --mode full \
  --input_file ./expression_matrix.csv \
  --group_file ./group_info.csv \
  --case_group treatment \
  --control_group control \
  --output_dir ./output
```

### 使用 ssGSEA 和自定义参数

```bash
Rscript scripts/main.R \
  --mode analyze \
  --input_file ./expression_matrix.csv \
  --group_file ./group_info.csv \
  --case_group treatment \
  --control_group control \
  --method ssgsea \
  --top_n 30 \
  --fdr_threshold 0.1 \
  --output_dir ./ssgsea_output \
  --seed 123
```

### 复用已保存的结果对象

```bash
Rscript scripts/main.R \
  --mode visualize \
  --output_dir ./output \
  --plot_file custom_heatmap.pdf \
  --top_up 10 \
  --top_down 10 \
  --top_mode both
```

关于内置的真实数据基线记录，请阅读：`references/cli-guide.md`

## 错误处理

| 错误代码 | 含义 | 解决方案 |
|------------|---------|----------|
| `SKILL_FILE_NOT_FOUND` | 输入文件或已保存的结果文件缺失；在 visualize 模式下，`GSVA_list.rda` 必须存在于 `output_dir/data/` 中——请先运行 analyze 或 full 模式 | 检查路径，并使用正确的文件重新运行 |
| `SKILL_MISSING_COLUMNS` | 分组文件缺少有效的样本列或分组列 | 将列重命名为支持的名称 |
| `SKILL_SAMPLE_MISMATCH` | 文件之间的样本名称不匹配 | 在运行该技能前对齐样本名称 |
| `SKILL_EMPTY_DATA` | 输入矩阵、基因集查询结果或绘图矩阵为空 | 检查输入矩阵和 MSigDB 设置 |
| `SKILL_INVALID_PARAMETER` | CLI 参数缺失或超出有效范围 | 查看参数表并重新运行 |
| `SKILL_PACKAGE_NOT_FOUND` | 所需的 R 包尚未安装 | 安装 `references/cli-guide.md` 中列出的缺失软件包 |

如果错误仍然存在，请阅读：`references/troubleshooting.md`

## 输入验证

此技能接受：

- CSV 或 TSV 格式的批量表达矩阵文件，其中基因为行、样本为列
- 包含一个受支持的样本列和一个受支持的分组列的样本分组文件
- 用于通路层级 GSVA 或 ssGSEA 分析的有效病例组/对照组比较
- 用于可视化已保存的 `GSVA_list.rda` 的可选热图自定义参数

隐私和数据处理说明：

- 如果你的矩阵或分组文件可关联到患者或受保护的记录，请在使用前对其进行匿名化处理
- 此工作流会将结果表、已保存的 R 对象、图表和会话元数据写入本地 `output_dir`
- 在使用敏感材料前，请检查本地输出保留规范

如果用户的请求不涉及批量表达通路富集分析或 GSVA 热图生成——例如，请求进行单细胞分析、基因层级差异表达检验、甲基化分析或临床诊断——请勿继续执行此工作流。应改为回复：

> “gsva-analysis-and-visualization 专为批量表达通路层级 GSVA/ssGSEA 分析以及已保存结果的热图可视化而设计。你的请求似乎超出了此范围。请提供批量表达矩阵和样本分组文件以进行 GSVA/ssGSEA 分析，或使用更适合你任务的技能。”

## 测试

```bash
Rscript scripts/main.R --help

Rscript tests/run_tests.R

Rscript scripts/main.R \
  --mode full \
  --input_file tests/data/expr_matrix.csv \
  --group_file tests/data/group.csv \
  --case_group Tumor \
  --control_group Healthy \
  --species "Homo sapiens" \
  --category C2 \
  --subcategory KEGG \
  --output_dir tests/output \
  --seed 42
```

预期输出：

- `tests/output/table/GSVA_diff.csv`
- `tests/output/table/GSVA_enrichment_results.csv`
- `tests/output/table/GSVA_enrichment_results_topN.csv`
- `tests/output/data/GSVA_list.rda`
- `tests/output/plot/GSVA_heatmap.pdf`
- `tests/output/session_info.txt`
- `tests/output/output_manifest.txt`
- `tests/output/run_record.txt`

可选的后续检查：

```bash
Rscript tests/test_skill.R tests/output
```

`tests/run_tests.R` 会执行完整的演示工作流，验证预期的输出文件，然后在同一个 `output_dir` 中重新运行 `visualize`，以确认 `output_manifest.txt` 和 `run_record.txt` 保留了两次运行的记录部分。

## 参考文献

1. Hanzelmann S, Castelo R, Guinney J. (2013) GSVA：用于微阵列和 RNA-seq 数据的基因集变异分析。*BMC Bioinformatics*. doi:10.1186/1471-2105-14-7
2. Ritchie ME, Phipson B, Wu D, et al. (2015) limma 为 RNA 测序和微阵列研究中的差异表达分析提供强大支持。*Nucleic Acids Research*. doi:10.1093/nar/gkv007
3. Liberzon A, Birger C, Thorvaldsdottir H, et al. (2015) 分子特征数据库的 Hallmark 基因集集合。*Cell Systems*. doi:10.1016/j.cels.2015.12.004

有关详细的算法说明，请阅读：`references/algorithm.md`

## 实现检查清单

- [x] 使用 `optparse` 解析 CLI
- [x] 使用 `set.seed()` 确保可复现性
- [x] 仅使用 CRAN/Bioconductor 软件包
- [x] 文档中的参数与脚本一致
- [x] 在任何调用之前定义 `get_script_dir()`
- [x] `SKILL.md` 中包含文件读取说明
- [x] `tests/data/` 中提供了测试数据
- [x] 使用 `SKILL_*` 消息实现错误处理
- [x] `Rscript scripts/main.R --help` 可正常运行