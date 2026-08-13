---
name: knn-imputation
description: "Use when filtering genes with high missingness and then imputing missing values in a bulk expression matrix with group-aware KNN through DMwR2, where donor samples are restricted by one annotation column before imputation. For strata with 10 or fewer samples, the script falls back to row-wise direct filling with mean or median. NOT for: single-cell data, multi-column stratification, non-tabular inputs, network access, or interactive workflows."
license: MIT
skill-author: AIPOCH
---
# KNN 插补

## 何时使用

当你需要从批量表达矩阵中移除缺失值比例超过 50% 的基因，然后执行分组感知的 KNN 插补，并通过一个分组列限制供体池时，请使用此技能。

请勿将此技能用于：
- 单细胞数据
- 多列分层
- 非表格输入
- 依赖网络的工作流
- 交互式分析会话

## 何时读取外部文件

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| **需要算法详情** | `references/algorithm.md` | 分组分层 KNN 方法、回退规则和假设 |
| **需要运行分析** | `scripts/main.R` | 执行：`Rscript scripts/main.R --input_file ... --group_file ...` |
| **遇到错误** | `references/troubleshooting.md` | 常见错误和解决方案 |
| **需要 CLI 示例** | `references/cli-guide.md` | 详细的 CLI 使用示例 |
| **需要示例输入固件** | `tests/data/` | 用于本地验证和示例的仓库固件 |

## 输入验证

此技能接受：一个批量表达矩阵 CSV（特征 × 样本），以及一个包含单个分组列、用于 KNN 分层的样本注释 CSV 文件。

如果用户的请求不涉及对批量表达矩阵中的缺失值进行插补——例如，要求对单细胞数据进行插补、使用多列分层或运行依赖网络的工作流——请勿继续执行该工作流。请改为回复：
> “knn-imputation 旨在使用带有 DMwR2 的分组感知 KNN，对批量表达矩阵中的缺失值进行过滤和插补。您的请求似乎超出了此范围。请提供一个包含单个分组列的批量表达矩阵，或使用更适合您任务的工具。”

## 前置条件

DMwR2 **在 CRAN 上不可用**。运行前请从 GitHub 安装：

```r
install.packages("remotes")
remotes::install_github("cran/DMwR2")
```

如果触发 `SKILL_DEPENDENCY_MISSING`，请先使用上述命令安装 DMwR2，然后重试。标准的 `install.packages("DMwR2")` 无法使用。

---

## 用法

```bash
Rscript scripts/main.R \
  --input_file tests/data/sample_expression_matrix.csv \
  --group_file tests/data/sample_groups.csv \
  --output_dir tests/output/basic_run \
  --sample_column sample \
  --group_column group \
  --k 10 \
  --small_strata_fill_method mean \
  --overwrite \
  --timeout_seconds 0 \
  --seed 42
```

如果要重新运行并使用现有的 `output_dir`，请传入 `--overwrite`。否则，请使用新的输出目录。

---

## 参数

| 短选项 | 长选项 | 类型 | 默认值 | 描述 |
|-------|------|------|---------|-------------|
| `-i` | `--input_file` | character | **必填** | 表达矩阵 CSV 文件，特征位于行中，样本位于列中 |
| `-g` | `--group_file` | character | **必填** | 样本注释 CSV 文件 |
| `-o` | `--output_dir` | character | `./output/` | 输出目录 |
| `-c` | `--sample_column` | character | `sample` | 分组文件中的样本 ID 列 |
| `-l` | `--group_column` | character | `group` | 用于定义插补分层的单个分组列 |
| `-k` | `--k` | integer | `10` | 每个分层内使用的最近邻数量 |
| `-m` | `--small_strata_fill_method` | character | `mean` | 样本数不超过 10 的分层所使用的填充方法：`mean` 或 `median` |
|  | `--overwrite` | flag | `FALSE` | 覆盖 `output_dir` 中现有的输出文件 |
| `-t` | `--timeout_seconds` | integer | `0` | 可选的运行超时时间（秒），`0` 表示禁用超时 |
| `-s` | `--seed` | integer | `42` | 用于确保可复现性的随机种子 |

---

## 输入格式

### 表达矩阵（`input_file`）

以特征为行、样本为列的 CSV 格式文件，第一列为特征 ID。

```csv
,Sample01,Sample02,Sample03
TSPAN6,1.84,1.83,3.82
SEMA3F,4.83,4.04,5.28
```

要求：
- 第一列存储特征 ID。
- 其余所有列必须为数值或空值。
- 缺失值必须编码为空单元格或 `NA`。

### 分组文件（`group_file`）

包含一个样本 ID 列和一个分组列的 CSV 文件。

```csv
sample,group
Sample01,case
Sample02,control
Sample03,case
```

要求：
- `sample_column` 必须与表达矩阵中的样本名称完全匹配。
- `group_column` 中指定的列必须存在于分组文件中。
- `sample_column` 和选定的分组列中不得存在缺失值。
- KNN 仅对至少包含 11 个样本的分层运行。
- 包含 10 个或更少样本的分层使用 `--small_strata_fill_method` 按行直接填充。

---

## 输出文件

| 文件 | 格式 | 描述 |
|------|--------|-------------|
| `imputed_expression_matrix.csv` | CSV | 完整的插补后表达矩阵 |
| `session_info.txt` | TXT | R 会话和软件包版本信息 |

---

## 工作流程

### 第 1 步：验证输入
- 检查文件是否存在。
- 验证表达矩阵与分组文件之间的样本是否匹配。
- 确认请求的分组列是否存在。

### 第 2 步：筛选基因
- 移除在所有样本中缺失值比例至少为 50% 的基因。
- 如果此筛选步骤移除了所有基因，则停止运行。

### 第 3 步：构建分层
- 为 `group_column` 中的每个唯一值构建一个分层。
- 即使分层规模较小也予以保留；仅至少包含 11 个样本的分层运行 KNN。

### 第 4 步：执行插补
- 仅在至少包含 11 个样本的分层内部执行按组分层的 KNN 插补。
- 在每个分层内，跳过该分层中缺失值比例至少为 50% 的任何基因的插补；将这些值保留为 `NA`。
- 对于包含 10 个或更少样本的分层，使用该分层内的逐行均值或中位数填充缺失值。
- 如果小分层中某个仍可插补的基因行全部缺失，则回退到全局逐行均值或中位数。

### 第 5 步：保存结果
- 写入插补后的矩阵。
- 将 `session_info.txt` 保存到输出目录。

---

## 方法

### 缺失值筛选 + 按组分层的 DMwR2 KNN

首先移除缺失值比例至少为 50% 的基因。随后，当分层至少包含 11 个样本时，在根据一个分组列构建的用户定义分层内应用 KNN 插补。

如果所选分组方案将数据划分为每个包含 10 个或更少样本的分层，该命令将回退到在该分层内按行使用均值或中位数直接填充。某个分层内缺失值比例达到至少 50% 的基因会在该分层中被跳过，并保持为 `NA`。如果小分层中的其他行完全缺失但仍低于该阈值，脚本将回退到对应的全局行汇总值。

有关实现细节、假设以及小分层的跳过行为，请阅读 `references/algorithm.md`。

---

## 示例

### 基本用法

```bash
Rscript scripts/main.R \
  -i tests/data/sample_expression_matrix.csv \
  -g tests/data/sample_groups.csv \
  -o tests/output/basic_run
```

### 较小的邻域

```bash
Rscript scripts/main.R \
  -i tests/data/sample_expression_matrix.csv \
  -g tests/data/sample_groups.csv \
  -o tests/output/k5_run \
  -k 5
```

### 小分层回退

```bash
Rscript scripts/main.R \
  -i tests/data/sample_expression_matrix.csv \
  -g tests/data/sample_groups.csv \
  -o tests/output/small_strata_run \
  -l sample \
  -m median \
  --overwrite
```

## 错误处理

### 常见错误

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| `SKILL_FILE_NOT_FOUND` | 输入文件不存在 | 检查文件路径 |
| `SKILL_EMPTY_FILE` | 输入文件存在但为空 | 将其替换为有效的非空 CSV 文件 |
| `SKILL_OUTPUT_EXISTS` | 输出文件已存在 | 使用 `--overwrite` 重新运行，或更改 `--output_dir` |
| `SKILL_SAMPLE_MISMATCH` | 文件之间的样本名称不匹配 | 验证样本名称是否完全匹配 |
| `SKILL_MISSING_COLUMNS` | 请求的分组列不存在 | 将该列添加到分组文件中，或更改 `--group_column` |
| `SKILL_INVALID_PARAMETER` | 提供了多个分组列 | 在 `--group_column` 中仅传入一个分组列 |
| `SKILL_INVALID_DATA` | 矩阵或分组文件结构无效 | 检查输入格式、重复的 ID 和分组完整性 |
| `SKILL_DEPENDENCY_MISSING` | 未安装 DMwR2 | 使用以下命令安装：`Rscript -e "install.packages('remotes'); remotes::install_github('cran/DMwR2')"` — 注意：CRAN 上没有 DMwR2 |
| `SKILL_TIMEOUT` | 超出超时限制 | 增大 `--timeout_seconds` 或减小数据规模 |

**如果错误仍然存在**，请阅读：`references/troubleshooting.md`

---

## 本地验证

### 验证 CLI 入口点

```bash
# Check help
Rscript scripts/main.R --help

# Run with sample data
Rscript scripts/main.R \
  -i tests/data/sample_expression_matrix.csv \
  -g tests/data/sample_groups.csv \
  -o tests/output/basic_run \
  --overwrite

# Run forced small-strata fallback
Rscript scripts/main.R \
  -i tests/data/sample_expression_matrix.csv \
  -g tests/data/sample_groups.csv \
  -o tests/output/small_strata_run \
  -l sample \
  -m median \
  --overwrite
```

### 输出检查

```bash
# Count lines in output
wc -l tests/output/basic_run/imputed_expression_matrix.csv

# Check output files exist
ls -la tests/output/basic_run
```

## 参考文件

| 文件 | 用途 |
|---|---|
| `references/algorithm.md` | 按组分层的 KNN 方法、回退规则和假设 |
| `references/troubleshooting.md` | 常见错误和解决方案 |
| `references/cli-guide.md` | CLI 用法示例 |