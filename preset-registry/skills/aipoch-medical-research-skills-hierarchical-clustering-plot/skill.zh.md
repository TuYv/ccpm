---
name: hierarchical-clustering-plot
description: "Use when building a sample-level hierarchical clustering dendrogram from a bulk expression matrix and sample annotation table, especially for QC, batch inspection, or sample similarity assessment. Trigger keywords: hierarchical clustering, dendrogram, sample QC, batch inspection, sample similarity. NOT for: differential expression testing, gene clustering heatmaps, single-cell clustering workflows."
---
# 层次聚类图

## 何时使用

当你需要根据批量表达矩阵和样本注释表生成样本级层次聚类树状图时，请使用此技能。

- 适用场景：样本质控、批次检查、样本相似性评估、检查已注释的样本组是否按预期聚类。
- 触发关键词：层次聚类、树状图、样本质控、批次检查、样本相似性。
- 不适用于：差异表达检验、基因聚类热图、单细胞聚类工作流。

## 何时读取外部文件

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| **需要算法细节** | `references/algorithm.md` | 距离计算、连接规则和聚类假设 |
| **需要运行分析或检查 CLI 入口点行为** | `scripts/main.R` | 执行工作流，并检查参数解析、默认值、必需标志和加载的模块 |
| **需要工作流实现细节** | `scripts/run_analysis.R` | 查看编排顺序、临时工作区处理和输出生成 |
| **需要日志记录或警告行为** | `scripts/logging_utils.R` | 查看标准化的控制台日志格式和内存使用情况消息 |
| **需要文件或参数验证细节** | `scripts/validation_utils.R` | 查看路径检查、输出目录检查和标量验证 |
| **需要超时、临时工作区或会话信息行为** | `scripts/runtime_utils.R` | 查看超时控制、临时文件清理、输出复制和会话信息导出 |
| **需要表达矩阵/分组输入处理方式** | `scripts/input_functions.R` | 查看 CSV 加载、样本匹配和标签提取 |
| **需要聚类逻辑** | `scripts/clustering_functions.R` | 查看距离计算和 `hclust()` 生成 |
| **需要输出写入逻辑** | `scripts/output_utils.R` | 查看 CSV 导出和 PDF 渲染 |
| **遇到错误、警告或意外的聚类模式** | `references/troubleshooting.md` | 常见故障、警告后续处理和解读指南 |
| **需要 CLI 示例或常见参数组合** | `references/cli-guide.md` | 标准运行、变体运行和测试运行的详细命令模式 |
| **需要示例输入文件或具有具体模式的测试数据** | `tests/data/` | 查看表达矩阵和分组输入的示例 CSV 布局 |
| **需要预期输出名称或制品格式** | `## Output Files` 和 `references/cli-guide.md` | 确认工作流写入的文件，并查看文档中的示例预览 |
| **需要运行回归测试** | `tests/run_tests.R` | 执行自动化测试套件 |
| **需要确切的测试断言或边界情况** | `tests/testthat/test-clustering.R` | 查看验证、可复现性和输出检查 |

---

## 用法

```bash
Rscript scripts/main.R \
  --input_file ./expression_matrix.csv \
  --group_file ./sample_groups.csv \
  --output_dir ./output/ \
  --distance_method euclidean \
  --linkage_method complete \
  --label_column batch \
  --timeout_seconds 300 \
  --seed 42
```

---

## 参数

| 短选项 | 长选项 | 类型 | 默认值 | 说明 |
|-------|------|------|---------|-------------|
| `-i` | `--input_file` | character | **必需** | 表达矩阵文件（特征为行，样本为列） |
| `-g` | `--group_file` | character | **必需** | 样本注释文件（第一列为样本 ID，另有一个用于标签的元数据列） |
| `-o` | `--output_dir` | character | `./output/` | 输出目录 |
| `-d` | `--distance_method` | character | `euclidean` | `dist()` 使用的距离度量：euclidean、maximum、manhattan、canberra、binary、minkowski |
| `-m` | `--linkage_method` | character | `complete` | `hclust()` 使用的连接方法：complete、single、average、mcquitty、median、centroid、ward.D、ward.D2 |
| `-l` | `--label_column` | character | 第二列 | 用作树状图标签的列 |
| `-c` | `--label_cex` | numeric | `0.8` | 树状图标签大小，必须为 `> 0` |
| `-t` | `--timeout_seconds` | integer | `300` | 运行时间限制（秒），必须为 `> 0` |
| `-s` | `--seed` | integer | `42` | 用于确保结果可复现的随机种子 |

---

## 输入格式

### 表达矩阵（`input_file`）

特征为行，样本为列，采用 CSV 格式，第一列为特征 ID。

```csv
,Sample01,Sample02,Sample03
TSPAN6,1.847876677,1.831755661,3.827625975
TNMD,0.034919984,0.053250385,1.388850793
```

**要求：**
- 第一列包含唯一的特征 ID。
- 所有样本列都必须为数值类型。
- 样本列名必须唯一且非空。
- 至少需要两个匹配的样本。

### 样本注释（`group_file`）

第一列为样本 ID 的 CSV 文件。除非提供 `--label_column`，否则默认使用第二列作为叶节点标签。

```csv
sample,batch
Sample01,batch1
Sample02,batch2
Sample03,batch1
```

**要求：**
- 样本 ID 必须与表达矩阵的列名完全匹配。
- 所选标签列必须存在，且不能包含空值。
- 除样本 ID 外，该文件必须至少包含一个元数据列。

---

## 输出文件

| 文件 | 说明 |
|------|-------------|
| `hierarchical_clustering_plot.pdf` | 样本树状图 |
| `sample_distance_matrix.csv` | 样本两两距离矩阵 |
| `clustering_order.csv` | 树状图中显示的叶节点顺序 |
| `matched_samples.csv` | 用于绘图的样本与标签对应表 |
| `session_info.txt` | R 会话及软件包版本信息 |

## 工作流程

### 步骤 1：验证输入
**检查文件或参数验证时**，阅读：`scripts/validation_utils.R`

**检查表达矩阵/分组 CSV 处理时**，阅读：`scripts/input_functions.R`

- 检查文件是否存在
- 在解析前拒绝空文件
- 读取表达矩阵和样本注释 CSV 文件
- 验证必需列、ID 唯一性和表达值是否为数值

### 步骤 2：对齐样本
**检查样本匹配逻辑时**，阅读：`scripts/input_functions.R`

- 匹配注释文件与表达矩阵之间的样本 ID
- 按照注释文件中的顺序重新排列矩阵列
- 选择用于绘图的标签列

### 步骤 3：构建层次聚类
**当解读距离或连接方法的行为时**，请阅读：`references/algorithm.md`

**当检查聚类实现时**，请阅读：`scripts/clustering_functions.R`

- 将表达矩阵转置为样本×特征形式
- 使用 `dist()` 计算样本间的成对距离
- 使用 `hclust()` 构建树状图

### 步骤 4：保存输出
**当检查输出暂存和清理行为时**，请阅读：`scripts/run_analysis.R`

**当检查 PDF/CSV 导出行为时**，请阅读：`scripts/output_utils.R`

**当检查超时、会话信息或最终文件复制行为时**，请阅读：`scripts/runtime_utils.R`

- 在临时工作区中暂存输出
- 导出成对距离矩阵
- 导出绘图中的叶节点顺序
- 将树状图渲染为 PDF
- 将最终输出复制到请求的输出目录中

---

## 方法

### 距离矩阵
使用基础 R 的 `dist()`，根据转置后的表达矩阵计算样本距离。

### 层次聚类
使用基础 R 的 `hclust()` 构建聚类树。默认连接方法为 `complete`，与源分析脚本一致。

---

## 示例

### 基本用法
```bash
Rscript scripts/main.R \
  -i tests/data/sample_expression_matrix.csv \
  -g tests/data/sample_groups.csv \
  -o ./output/ \
  -t 300
```

### 使用样本 ID 作为标签
```bash
Rscript scripts/main.R \
  -i tests/data/sample_expression_matrix.csv \
  -g tests/data/sample_groups.csv \
  -o ./output_sample_labels/ \
  -l sample
```

### 使用平均连接法
```bash
Rscript scripts/main.R \
  -i tests/data/sample_expression_matrix.csv \
  -g tests/data/sample_groups.csv \
  -o ./output_average/ \
  -m average
```

---

## 错误处理

### 常见错误

| 错误 | 原因 | 解决方案 | 了解更多 |
|-------|-------|----------|-----------|
| `SKILL_DEPENDENCY_MISSING` | 未安装必需的 R 包 | 安装缺失的包并重新运行 | `references/troubleshooting.md#skill_dependency_missing` |
| `SKILL_FILE_NOT_FOUND` | 输入文件不存在或无法创建输出目录 | 检查路径和权限 | `references/troubleshooting.md#skill_file_not_found` |
| `SKILL_EMPTY_FILE` | 输入文件为空 | 重新导出 CSV，并确认其中包含数据 | `references/troubleshooting.md#skill_empty_file` |
| `SKILL_EMPTY_DATA` | CSV 解析成功，但不包含数据行 | 确认 CSV 至少包含一行数据 | `references/troubleshooting.md#skill_empty_data` |
| `SKILL_PARSE_ERROR` | CSV 解析失败 | 检查编码、分隔符和 CSV 结构 | `references/troubleshooting.md#skill_parse_error` |
| `SKILL_MISSING_COLUMNS` | 缺少预期的列或表头 | 检查 CSV 表头和元数据列 | `references/troubleshooting.md#skill_missing_columns` |
| `SKILL_INVALID_TYPE` | 表达值或参数的类型错误 | 确保数值字段为数值类型 | `references/troubleshooting.md#skill_invalid_type` |
| `SKILL_SAMPLE_MISMATCH` | 样本 ID 不匹配 | 确保 `group_file` 中的第一列与矩阵列名匹配 | `references/troubleshooting.md#skill_sample_mismatch` |
| `SKILL_INVALID_DATA` | 表达数据或注释数据格式不正确 | 检查重复 ID、缺失标签和数值 | `references/troubleshooting.md#skill_invalid_data` |
| `SKILL_INVALID_PARAMETER` | 不支持的距离、连接方法或标签参数 | 使用文档中列出的参数值之一 | `references/troubleshooting.md#skill_invalid_parameter` |
| `SKILL_TIMEOUT` | 分析超出时间限制 | 增大 `--timeout_seconds` 并重新运行 | `references/troubleshooting.md#skill_timeout` |
| `SKILL_PLOT_ERROR` | 写入 PDF 时绘图设备失败 | 检查输出目录权限并重新运行 | `references/troubleshooting.md#skill_plot_error` |
| `SKILL_WRITE_ERROR` | 无法写入输出文件或中间文件 | 检查输出目录权限和可用磁盘空间 | `references/troubleshooting.md#skill_write_error` |
| `SKILL_WARNING` | 执行期间出现非致命警告 | 检查控制台警告并验证输出质量 | `references/troubleshooting.md#skill_warning` |
| `SKILL_MEMORY_WARNING` | 内存使用量超过警告阈值 | 减小输入规模，或使用更多内存重新运行 | `references/troubleshooting.md#skill_memory_warning` |

**如果错误仍然存在**，请阅读：`references/troubleshooting.md`

---

## 测试

### 使用示例数据测试

```bash
# Check help
Rscript scripts/main.R --help

# Run with sample data
Rscript scripts/main.R \
  -i tests/data/sample_expression_matrix.csv \
  -g tests/data/sample_groups.csv \
  -o ./output/

# Run unit tests (requires testthat and data.table)
Rscript tests/run_tests.R
```

### 验证命令

```bash
# Check main output plot exists
ls -la ./output/hierarchical_clustering_plot.pdf

# Inspect clustering order
wc -l ./output/clustering_order.csv
```

## 实现检查清单

- [x] 使用 `optparse` 解析 CLI
- [x] 使用 `set.seed()` 确保可复现性
- [x] 输入验证（文件是否存在、是否为空、类型、必需列）
- [x] 基于 try-catch 的致命错误处理
- [x] 标准化的 `SKILL_*` 错误分类
- [x] 使用 `setTimeLimit()` 进行超时控制
- [x] 标准化的仅控制台日志记录
- [x] 基于 Base R 的聚类实现
- [x] 使用 `sink()` 记录会话信息
- [x] 使用 `on.exit()` 清理临时工作区
- [x] 使用 `gc()` 报告内存使用情况
- [x] SKILL.md 中的文件读取说明
- [x] 跨 `scripts/` 的模块化脚本结构
- [x] 在 `tests/testthat/` 下添加了测试模板
- [x] 已提供测试数据
- [x] 使用 `SKILL_*` 代码进行错误处理
- [x] 在使用前定义 `get_script_dir()`
- [x] 脚本位于 `scripts/` 目录中
- [x] 参考资料位于 `references/` 目录中

---

*最后更新：2026-04-16 | 版本：1.0.0*