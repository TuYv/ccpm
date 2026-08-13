---
name: deg-screening-analysis
description: Use when screening differentially expressed genes from a bulk expression matrix between two user-specified groups, producing DEG tables, a volcano plot, and a clustered heatmap. Triggers include DEG analysis, volcano plot, clustered heatmap, limma-based two-group comparison, and case-vs-control screening. NOT for single-cell RNA-seq, multi-group contrasts, count-model workflows such as DESeq2/edgeR, or non-expression omics data.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# 差异表达基因筛选分析（火山图与聚类热图）

## 适用场景

当你需要对批量表达矩阵执行可复现的两组 DEG 分析流程，并希望获得以下结果时，请使用此技能：
- 完整的差异表达结果表
- 筛选后的 DEG 表
- 火山图
- 差异最显著基因的聚类热图

典型请求包括：
- 使用 limma 比较病例组与对照组样本
- 从标准化表达矩阵中筛选上调和下调基因
- 根据批量转录组数据生成 DEG 表、火山图和热图

## 不适用范围

请勿将此技能用于：
- 单细胞 RNA-seq 分析流程
- 多组对比或析因设计
- 需要 `DESeq2` 或 `edgeR` 的计数模型分析流程
- 批次校正、协变量调整模型或广义设计矩阵咨询
- 非表达类组学数据

如果请求超出此范围，请停止操作并转交给更合适的分析流程，而不要强行使用此技能处理数据。

## 实际注意事项

- `Diffanalysis.csv` 当前会导出 `name`、`logFC`、`P.value` 和 `P.adj`。
- `--p_type` 同时控制 DEG 筛选语义和火山图显著性语义。
- 仅当排序后至少保留两个热图基因时，才会生成 `plot/heatmap.pdf`。
- 当结果非常稀疏时，应优先将表格和火山图输出作为主要产物。

## 何时读取外部文件

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| 需要算法细节或统计假设 | `references/algorithm.md` | limma 方法、筛选逻辑、火山图/热图选择规则 |
| 需要执行分析流程 | `scripts/main.R` | 获取准确的 CLI 入口和可运行命令 |
| 遇到错误代码或错误的输入格式 | `references/troubleshooting.md` | 将 `SKILL_*` 错误与原因及修复方法相匹配 |
| 需要更多 CLI 示例 | `references/cli-guide.md` | 查看常见用例的完整命令示例 |
| 需要最小可运行示例 | `tests/data/` | 使用随附的测试输入文件进行验证 |

## 用法

```bash
Rscript scripts/main.R \
  --input_file tests/data/oa_exp.csv \
  --group_file tests/data/oa_group.csv \
  --case OA \
  --control control \
  --output_dir ./results
```

## 参数

| 短选项 | 长选项 | 类型 | 默认值 | 必需 | 说明 |
|-------|------|------|---------|----------|-------------|
| `-i` | `--input_file` | character | none | yes | 表达矩阵 CSV。第一列为基因 ID，其余列为样本值。 |
| `-g` | `--group_file` | character | none | yes | 分组注释 CSV。脚本会自动检测样本列和分组列，包括第一列为行名或索引的文件。 |
| `-o` | `--output_dir` | character | `./DEG` | no | 表格、图形和会话元数据的输出目录。 |
| ` ` | `--case` | character | none | yes | 要比较的病例组名称。匹配时不区分大小写，并会去除首尾空白。 |
| ` ` | `--control` | character | none | yes | 要比较的对照组名称。匹配时不区分大小写，并会去除首尾空白。 |
| `-m` | `--diff_method` | character | `limma` | no | 差异表达分析方法。当前实现仅支持 `limma`。 |
| `-p` | `--p_threshold` | numeric | `0.05` | no | DEG 筛选的显著性阈值。 |
| `-f` | `--logfc_threshold` | numeric | `1` | no | DEG 筛选的绝对对数倍数变化阈值。 |
| ` ` | `--top_n` | integer | `5` | no | 热图筛选时考虑的上调和下调基因各自的数量。 |
| ` ` | `--p_type` | character | `p.adj` | no | 用于显著性筛选和火山图显著性着色的 P 值字段。允许值：`p`、`p.adj`。 |
| ` ` | `--run_plots` | logical | `TRUE` | no | 是否生成火山图和聚类热图。 |
| ` ` | `--timeout_seconds` | integer | `3600` | no | 超时前允许的最长运行时间。 |
| `-s` | `--seed` | integer | `42` | no | 为确保可复现性而记录的随机种子。 |

## 输出文件

| 文件 | 格式 | 说明 |
|------|--------|-------------|
| `session_info.txt` | txt | 本次运行中使用的 R 会话元数据和软件包版本。 |
| `data/DEG_list.rda` | rda | 序列化的 R 对象，包含方法、分组、阈值、完整差异分析表和筛选后的 DEG 表。 |
| `table/Diffanalysis.csv` | csv | 完整的差异表达结果表，包含 `name`、`logFC`、`P.value` 和 `P.adj` 列。 |
| `table/DEG.csv` | csv | 仅包含显著 DEG 的表，其中包含筛选后的基因及其 `group` 标签 `up` 或 `down`。 |
| `plot/volcano_plot.pdf` | pdf | 使用 `--p_type` 所选 p 值模式绘制的差异基因火山图。 |
| `plot/heatmap.pdf` | pdf | 启用绘图且至少有两个可用于热图的基因时，为选定的差异最显著基因生成的聚类热图。 |

## 工作流程

### 第 1 步：验证输入
- 检查输入文件是否存在
- 加载表达矩阵并确保其非空
- 自动检测分组文件中的样本列和分组列
- 验证样本 ID 是否正确重叠
- 验证实验组和对照组是否存在，并且每个选定分组至少有两个样本

### 第 2 步：运行差异表达分析
- 拟合双组 limma 线性模型
- 构建对比 `case - control`
- 计算经验贝叶斯调节统计量
- 导出完整的差异分析结果表

### 第 3 步：筛选差异表达基因
- 应用 `p_threshold` 和 `logfc_threshold`
- 根据 `--p_type` 使用 `P.value` 或 `P.adj`
- 将基因标记为 `up`、`down` 或 `no`
- 导出 DEG 表和序列化结果对象

### 第 4 步：生成火山图和聚类热图
- 直接根据完整的差异分析表生成 `plot/volcano_plot.pdf`
- 选择排名靠前的上调和下调基因作为热图输入
- 仅当至少有两个可用于热图的基因时生成 `plot/heatmap.pdf`

## 错误处理

| 错误代码 | 含义 | 常见解决方法 |
|------------|---------|-------------|
| `SKILL_FILE_NOT_FOUND` | 输入文件路径不存在 | 验证文件路径后重新运行 |
| `SKILL_PACKAGE_NOT_FOUND` | 缺少必需的 R 软件包 | 安装缺失的软件包后重新运行 |
| `SKILL_MISSING_COLUMNS` | 输入文件不包含必要的列 | 检查 CSV 结构和列的位置 |
| `SKILL_EMPTY_DATA` | 输入文件为空，或 limma 未返回可分析的行 | 验证输入内容，或确认矩阵包含足够的有效值 |
| `SKILL_INVALID_PARAMETER` | 参数值或分组选择无效 | 检查阈值、`--case`、`--control` 和 `--p_type` |
| `SKILL_SAMPLE_MISMATCH` | 表达矩阵样本与分组文件样本不匹配 | 对齐两个输入文件中的样本 ID |
| `SKILL_TIMEOUT` | 运行时间超过允许的时限 | 增大 `--timeout_seconds` 或简化运行任务 |

如需分步解决方法，请阅读 `references/troubleshooting.md`。

## 测试

```bash
Rscript tests/run_tests.R
```

最小化 CLI 冒烟测试：

```bash
Rscript scripts/main.R \
  --input_file tests/data/oa_exp.csv \
  --group_file tests/data/oa_group.csv \
  --case OA \
  --control control \
  --output_dir ./tests_output
```

预期输出：
- `tests_output/table/Diffanalysis.csv`
- `tests_output/table/DEG.csv`
- `tests_output/plot/volcano_plot.pdf`
- `tests_output/session_info.txt`

仅当保留了足够多的显著基因用于绘制热图时，才会生成 `tests_output/plot/heatmap.pdf`。
当选中的热图基因少于两个时，将跳过热图生成并发出警告，而不会导致运行失败。
当没有基因通过当前阈值时，`tests_output/table/DEG.csv` 可能为空。

*技能名称：deg-screening-analysis*