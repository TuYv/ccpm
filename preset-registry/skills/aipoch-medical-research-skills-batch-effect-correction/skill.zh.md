---
name: batch-effect-correction
description: "Use when correcting batch effects in merged bulk expression matrices with sample-level batch metadata while preserving biological group structure and generating before-and-after QC plots. NOT for: single-cell integration, raw FASTQ processing, differential expression without batch labels, or datasets without biological groups."
license: MIT
skill-author: AIPOCH
---
# 批次效应校正

## 前置条件

首次分析前，请运行以下命令以安装所有必需的 R 包：

```bash
Rscript -e "if (!require('BiocManager', quietly=TRUE)) install.packages('BiocManager'); BiocManager::install(c('sva', 'limma')); install.packages('ggplot2', repos='https://cloud.r-project.org')"
```

> 注意：`sva` 和 `limma` 是 Bioconductor 包，需要使用 `BiocManager` 进行安装。`ggplot2` 是标准的 CRAN 包。

**在安装这些包之前，该技能无法运行。** 在全新或未配置的 R 环境中，请务必先执行前置条件步骤。

---

## 何时读取外部文件

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| **需要算法详情** | `references/algorithm.md` | ComBat 工作流、假设和质量控制逻辑 |
| **需要运行分析** | `scripts/main.R` | 执行：`Rscript scripts/main.R --input_file ... --group_file ...` |
| **遇到错误** | `references/troubleshooting.md` | 常见错误及解决方案 |
| **需要 CLI 示例** | `references/cli-guide.md` | 详细的 CLI 使用示例和基线运行记录 |
| **需要测试数据** | `tests/data/` | 用于测试的示例输入文件 |

---

## 用法

```bash
Rscript scripts/main.R \
  --input_file ./expression_matrix.csv \
  --group_file ./sample_info.csv \
  --output_dir ./output/ \
  --batch_column batch \
  --group_column group \
  --sample_column sample \
  --log_transform auto \
  --timeout_seconds 600 \
  --seed 42
```

---

## 参数

| 短参数 | 长参数 | 类型 | 默认值 | 说明 |
|-------|------|------|---------|-------------|
| `-i` | `--input_file` | character | **必需** | 表达矩阵文件（基因为行，样本为列） |
| `-g` | `--group_file` | character | **必需** | 样本元数据文件（包含样本 ID、分组和批次列） |
| `-o` | `--output_dir` | character | `./output/` | 输出目录 |
| `-b` | `--batch_column` | character | `batch` | 元数据中的批次列名称 |
| `-c` | `--group_column` | character | `group` | 元数据中的生物学分组列名称 |
| `-n` | `--sample_column` | character | `sample` | 元数据中的样本 ID 列名称 |
| `-l` | `--log_transform` | character | `auto` | 对数转换模式：`auto`、`yes`、`no` |
| `-t` | `--timeout_seconds` | integer | `600` | 运行时间限制（秒）；使用 `0` 可禁用 |
| `-s` | `--seed` | integer | `42` | 用于确保可复现性的随机种子 |

---

## 输入格式

### 表达矩阵（input_file）

基因为行、样本为列的 CSV 格式文件，第一列为基因 ID。

```csv
"","Sample01","Sample02","Sample03"
"GeneA",5.12,4.87,6.03
"GeneB",8.44,8.11,7.95
```

要求：
- 基因 ID 必须唯一且非空
- 样本列名称必须唯一且非空
- 表达值必须为有限数值
- 允许存在元数据中没有的额外表达矩阵样本列，这些列将被忽略并触发警告

### 样本元数据（group_file）

包含样本 ID、生物学分组和批次列的 CSV 文件。

```csv
"sample","group","batch"
"Sample01","Control","Batch1"
"Sample02","Case","Batch1"
"Sample03","Case","Batch2"
```

要求：
- 样本 ID 必须唯一且非空
- 至少需要 2 个生物学分组
- 至少需要 2 个批次
- 每个分组和每个批次必须至少包含 2 个样本
- 元数据可以仅描述表达矩阵中的一部分样本；分析将仅保留与元数据匹配的样本，并对被忽略的表达矩阵列发出警告

---

## 输出文件

| 文件 | 描述 |
|------|-------------|
| `corrected_expression_matrix.csv` | 批次校正后的表达矩阵 |
| `matched_sample_info.csv` | 分析中使用的标准化元数据 |
| `batch_before_boxplot.pdf` | 校正前的样本分布箱线图 |
| `batch_after_boxplot.pdf` | 校正后的样本分布箱线图 |
| `batch_before_pca.pdf` | 校正前的 PCA 散点图，点按批次着色 |
| `batch_after_pca.pdf` | 校正后的 PCA 散点图，点按批次着色 |
| `batch_before_clustering.pdf` | 校正前的层次聚类图 |
| `batch_after_clustering.pdf` | 校正后的层次聚类图 |
| `session_info.txt` | R 会话和软件包版本信息 |

---

## 工作流程

### 步骤 1：验证输入
- 检查文件是否存在以及输入文件是否非空
- 验证元数据列是否存在
- 验证表达值是否为数值且为有限值
- 确认至少有 2 个分组、2 个批次，并且每个分组/批次至少有 2 个样本

### 步骤 2：对齐并准备矩阵
- 对表达矩阵的列重新排序，以匹配元数据中的样本顺序
- 仅保留与元数据匹配的样本；如果表达矩阵包含元数据中不存在的额外样本，则发出警告
- 确定是否需要进行对数转换（`auto`、`yes` 或 `no`）
- 仅在需要时应用 `log2(x + 1)`

### 步骤 3：执行批次校正
- 使用生物学分组信息构建设计矩阵
- 运行 `sva::ComBat()` 以去除批次驱动的变异
- 在校正过程中保留建模的生物学分组结构

### 步骤 4：标准化并导出结果
- 在 ComBat 之后应用 `limma::normalizeBetweenArrays()`
- 写出校正后的矩阵和匹配的元数据
- 保存校正前后的质控图和会话信息

---

## 方法

### ComBat
使用 `sva::ComBat()` 进行经验贝叶斯批次效应校正。当合并后的批量表达数据集包含已知批次标签且至少有两个生物学分组时，推荐使用此方法。

### 对数转换
支持 `auto`、`yes` 和 `no`。仅当矩阵看起来处于类似原始数据的尺度时，`auto` 模式才会应用 `log2(x + 1)`。

### normalizeBetweenArrays
使用 `limma::normalizeBetweenArrays()` 进行校正后标准化，以减少样本之间残留的分布差异。

### 质控可视化
生成校正前后的配对箱线图、带有条件性批次椭圆的 PCA 散点图以及层次聚类图，以评估批次驱动的结构是否有所减弱。

---

## 智能体响应约定

成功运行后，报告：

1. 元数据匹配和任何子集筛选后保留的**样本数量**
2. ComBat 设计矩阵中使用的**批次数量**和**分组数量**
3. 应用的**对数转换**（自动检测、强制启用或跳过）
4. **QC 评估**：说明校正前后的 PCA 图是否显示批次聚类有所减少
5. **产物路径**：`corrected_expression_matrix.csv`、`batch_after_pca.pdf`、`batch_after_clustering.pdf`

---

## 示例

### 基本用法
```bash
Rscript scripts/main.R \
  -i expression_matrix.csv \
  -g sample_info.csv \
  -o ./output
```

### 使用自定义元数据列
```bash
Rscript scripts/main.R \
  -i expression_matrix.csv \
  -g metadata.csv \
  -o ./output \
  -n sample_id \
  -c condition \
  -b platform_batch
```

### 禁用对数转换和超时限制
```bash
Rscript scripts/main.R \
  -i expression_matrix.csv \
  -g sample_info.csv \
  -o ./output \
  -l no \
  -t 0 \
  -s 42
```

---

## 错误处理

### 常见错误

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| `SKILL_FILE_NOT_FOUND` | 输入文件不存在 | 检查文件路径 |
| `SKILL_EMPTY_FILE` | 输入文件存在，但不包含任何数据 | 重新创建或重新导出该文件 |
| `SKILL_MISSING_COLUMNS` | 元数据文件缺少样本、分组或批次列 | 检查表头名称或传入自定义列名 |
| `SKILL_SAMPLE_MISMATCH` | 元数据中的样本 ID 与表达矩阵的列不匹配 | 核对两个文件中的样本名称 |
| `SKILL_INVALID_DATA` | 数据集未通过最低设计要求检查（批次少于 2 个、分组少于 2 个，或每个批次/分组的样本少于 2 个） | 检查分组数量、批次数量和 ID 有效性 |
| `SKILL_INVALID_TYPE` | 表达值不是数值或为非有限值 | 运行前清理矩阵值 |
| `SKILL_TIMEOUT` | 运行时间超过配置的时间限制 | 增大 `--timeout_seconds`，或将其设置为 `0` |
| `SKILL_DEPENDENCY_MISSING` | 未安装所需的 R 包 | 使用以下命令安装：`Rscript -e "BiocManager::install(c('sva','limma')); install.packages('ggplot2')"` |
| `SKILL_RUNTIME_ERROR` | 发生运行时 I/O 或文件系统错误 | 检查读写权限和环境 |

**如果错误仍然存在**，请阅读：`references/troubleshooting.md`

**故障排除说明：** 在尚未安装软件包的环境中，`SKILL_DEPENDENCY_MISSING` 会在文件验证或 `--help` 之前触发。请先安装依赖项，然后重新运行，以显示与文件相关的错误或访问 `--help`。

---

## 输入验证

此技能接受：
1. 批量 RNA-seq 或微阵列表达矩阵（CSV，基因为行，样本为列）
2. 样本元数据文件（CSV），其中包含样本 ID、生物学分组和批次列；要求至少有 2 个批次和 2 个生物学分组

如果用户的请求不涉及对合并后的批量表达矩阵进行批次效应校正——例如，要求整合单细胞 RNA-seq 数据、处理原始 FASTQ 文件、在没有批次标签的情况下执行差异表达分析，或分析只有一个批次的数据集——请勿继续执行该工作流。请改为回复：

> “批次效应校正旨在使用 ComBat 去除合并的大批量表达矩阵中由批次驱动的变异，同时保留生物学分组结构。您的请求似乎超出了此范围。请提供包含样本级批次元数据的多批次表达矩阵，或使用更适合单细胞整合、差异表达或原始测序数据处理的工具。”

---

## 测试

### 使用示例数据测试

```bash
# Check help (requires packages installed)
Rscript scripts/main.R --help

# Run with bundled test data
Rscript scripts/main.R \
  -i tests/data/expression_matrix_merged.csv \
  -g tests/data/sample_info.csv \
  -o tests/output/
```

### 验证命令

```bash
# Check corrected matrix exists
ls -la tests/output/corrected_expression_matrix.csv

# Check matched metadata exists
ls -la tests/output/matched_sample_info.csv

# Check PCA output exists
ls -la tests/output/batch_after_pca.pdf
```

---

## 实现检查清单

- [x] 使用 `optparse` 解析 CLI
- [x] 使用 `set.seed()` 确保可复现性
- [x] 使用 `requireNamespace()` 检查依赖项
- [x] 记录会话信息
- [x] 通过 `setTimeLimit()` 支持时间限制
- [x] SKILL.md 中包含文件读取说明
- [x] `scripts/` 中采用模块化脚本结构
- [x] 提供测试数据
- [x] 使用 `SKILL_*` 代码处理错误
- [x] 在校正前后生成 QC 图
- [x] 参考资料位于 `references/` 目录中

---

*最后更新：2026-04-27 | 版本：1.1.0*