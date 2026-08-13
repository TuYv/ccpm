---
name: sample-group-sankey-plot
description: "Use when generating Sankey or alluvial plots from sample annotation tables where rows are samples and selected columns are categorical stages such as risk group, response status, subtype, or cohort labels. NOT for: gene network flow analysis, continuous-value trajectories, or graph-structured pathway visualization."
license: MIT
skill-author: AIPOCH
---
# 示例分组桑基图

从表格形式的样本注释文件构建可复现的桑基图/冲积图可视化，并导出所选注释、lodes 格式表、图表 PDF 和会话元数据。

## 输入验证

此技能接受：CSV 或 TSV 格式的样本注释表，其中每一行为一个样本，所选列为分类阶段（例如风险组、响应状态、亚型、队列标签）。至少需要 2 个阶段列。

如果用户的请求不涉及根据分类样本注释生成桑基图或冲积流图——例如，要求可视化基因调控网络、绘制连续值轨迹、分析通路流或处理非表格数据——请勿继续执行工作流。请改为回复：

> “sample-group-sankey-plot 旨在根据分类样本注释表生成桑基图/冲积图。您的请求似乎超出了此范围。请提供一份至少包含 2 个分类阶段列的样本注释表，或使用更适合基因网络可视化或通路分析的工具。”

**可读性指南：** 建议每个阶段的唯一值少于 8 个，并且阶段总数少于 5 个。对于更大的输入，请在绘图前筛选或聚合类别，以确保输出清晰易读。

## Agent 响应约定

成功运行后，向调用方报告：

```
Sankey plot generated successfully.
Stages plotted : <comma-separated stage column names>
Samples        : <row count>
Output prefix  : <output_prefix>
Outputs:
  table/selected_annotations.csv
  table/sankey_lodes.csv
  plot/<output_prefix>.pdf
  data/session_info.txt
Readability warnings (if any): <advisory messages or "none">
```

如果脚本以非零状态退出，请原样呈现 SKILL_* 错误代码和消息。不要尝试继续执行或静默重试。

## 何时读取外部文件

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| **需要运行分析** | `scripts/main.R` | 执行：`Rscript scripts/main.R --input_file ... --output_dir ...` |
| **需要算法详情** | `references/algorithm.md` | 冲积图转换逻辑、假设和绘图选择 |
| **遇到错误** | `references/troubleshooting.md` | 常见错误和解决方案 |
| **需要 CLI 示例** | `references/cli-guide.md` | 详细的 CLI 示例 |
| **需要测试数据** | `tests/data/` | 用于冒烟测试和回归检查的样本注释表 |

→ 参考文件 `algorithm.md`、`troubleshooting.md` 和 `cli-guide.md` 位于 `references/` 中。如果缺失，请依照下方的错误处理表来处理常见问题。

---

## 用法

### 环境设置

首次运行前安装所需的 R 包：

```bash
Rscript scripts/install_dependencies.R
```

注意：`install_dependencies.R` 从 CRAN 安装软件包，但不锁定版本。已使用 ggalluvial >= 0.12.5 和 ggplot2 >= 3.4.0 进行测试。对于可复现的 CI 环境，请考虑使用 `remotes::install_version()`。

### 基本命令

```bash
Rscript scripts/main.R \
  --input_file ./annotations.csv \
  --output_dir ./output \
  --columns risk,Responder \
  --seed 42
```

---

## 参数

| 短选项 | 长选项 | 类型 | 默认值 | 说明 |
|-------|------|------|---------|-------------|
| `-i` | `--input_file` | character | **必填** | 输入的 CSV/TSV 注释表 |
| `-o` | `--output_dir` | character | `./output/` | 输出目录 |
| `-c` | `--columns` | character | 所有列 | 要包含在图中的阶段列，以逗号分隔。省略时，文件中的所有列都将用作阶段。 |
| `-p` | `--output_prefix` | character | `sankey_plot` | 生成的输出文件的前缀（仅允许使用字母数字、点、下划线或连字符） |
|  | `--width` | numeric | `7` | 图的宽度，单位为英寸 |
|  | `--height` | numeric | `5` | 图的高度，单位为英寸 |
|  | `--alpha` | numeric | `0.5` | 流的透明度，取值范围为 `0` 到 `1` |
|  | `--label_size` | numeric | `4.5` | 层级标签大小 |
|  | `--missing_label` | character | `Missing` | 空白或 `NA` 层级的替代标签 |
|  | `--title` | character | 空 | 可选的图标题 |
| `-s` | `--seed` | integer | `42` | 为确保可复现性而记录的随机种子 |
|  | `--timeout` | integer | `3600` | 允许的最大运行时间（秒）；使用 `0` 可禁用限制 |

---

## 输入格式

### 注释表（`input_file`）

分隔符文本文件，其中每一行代表一个样本，每个选定的列都是桑基图中显示的一个分类阶段。

```csv
SampleID,risk,Responder,Subtype
S1,High,Yes,Basal
S2,Low,No,LumA
S3,High,Yes,Basal
S4,Low,No,LumB
```

**要求：**
- 如果省略 `--columns`，文件必须至少包含 2 列。
- 每个选定的列都必须存在于文件表头中。
- 选定的列会被解释为分类阶段，并转换为字符值。
- 空字符串和 `NA` 值会替换为 `--missing_label`。
- 支持 CSV 和 TSV 输入。
- 建议：每个阶段的唯一值少于 8 个，阶段总数少于 5 个，以确保图表易于阅读。

---

## 输出文件

| 文件 | 说明 |
|------|-------------|
| `table/selected_annotations.csv` | 仅包含绘制的阶段列的筛选后表格 |
| `table/sankey_lodes.csv` | 用于构建桑基图的长格式 lodes 表 |
| `plot/{output_prefix}.pdf` | PDF 格式的桑基图/冲积图；默认文件名为 `sankey_plot.pdf` |
| `data/session_info.txt` | R 会话信息和运行时参数 |

### selected_annotations.csv

| 列 | 类型 | 说明 |
|--------|------|-------------|
| 阶段列 | character | 按原始顺序排列，每个绘制的阶段对应一列 |

### sankey_lodes.csv

| 列 | 类型 | 说明 |
|--------|------|-------------|
| `sample_id` | character | 用作冲积流键的合成行标识符 |
| `x` | character | 阶段名称 |
| `stratum` | character | 阶段的类别标签 |

---

## 工作流程

### 第 1 步：验证输入
- 检查输入文件是否存在且可读。
- 检测输入是 CSV 还是 TSV。
- 验证是否至少有 2 个可用的阶段列。
- 验证用户指定的列是否存在。

### 步骤 2：准备桑基图数据
- 提取所选阶段列的子集。
- 替换缺失或空白的标签。
- 添加行级 `sample_id` 标识符。
- 使用 `ggalluvial::to_lodes_form()` 转换表格。

### 步骤 2a：可读性提示
选择列后，脚本会在以下情况下发出 `log_warn` 提示：
- 选择了超过 5 个阶段：`"More than 5 stages selected; plot may be hard to read. Consider filtering."`
- 某个阶段具有超过 8 个唯一值：`"Stage <name> has <n> unique values; consider aggregating for readability."`

这些仅为提示——脚本会继续运行并生成图表。

### 步骤 3：生成可视化图表
- 使用 `geom_flow()` 和 `geom_stratum()` 构建桑基图/冲积图。
- 渲染层级标签。
- 将图表保存为 PDF。

### 步骤 4：记录输出
- 将所选注释和长格式表分别保存为 CSV 文件。
- 保存 `sessionInfo()` 和运行时参数，以确保可复现性。

---

## 示例

### 复现原始双列图

```bash
Rscript scripts/main.R \
  -i tests/data/sample_annotations.csv \
  -o tests/output \
  -c risk,Responder
```

### 绘制三个注释阶段

```bash
Rscript scripts/main.R \
  -i tests/data/sample_annotations.csv \
  -o tests/output_three_stage \
  -c risk,Responder,Subtype \
  --title "Risk to response transitions"
```

### 自动使用所有列

```bash
Rscript scripts/main.R \
  -i tests/data/minimal_annotations.csv \
  -o tests/output_all_columns
```

---

## 错误处理

### 常见错误

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| `SKILL_FILE_NOT_FOUND` | 输入文件不存在 | 检查 `--input_file` |
| `SKILL_EMPTY_DATA` | 输入文件的行数为零，或可用列少于 2 列 | 提供至少包含 2 个阶段列的非空表格 |
| `SKILL_MISSING_COLUMNS` | 请求的阶段列不存在 | 更正 `--columns` 或修复输入文件的表头 |
| `SKILL_INVALID_PARAMETER` | 宽度、高度、透明度、标签大小或输出前缀无效 | 根据参数表提供有效参数 |
| `SKILL_DEPENDENCY_MISSING` | 所需的 R 软件包不可用 | 运行 `Rscript scripts/install_dependencies.R` |
| `SKILL_IO_ERROR` | 无法创建输出目录或写入该目录 | 检查 `--output_dir` 的权限 |

**如果错误仍然存在**，请阅读：`references/troubleshooting.md`

---

## 测试

### 使用示例数据进行测试

```bash
Rscript scripts/install_dependencies.R

Rscript scripts/main.R --help

Rscript scripts/main.R \
  -i tests/data/sample_annotations.csv \
  -o tests/output \
  -c risk,Responder,Subtype

Rscript tests/test_skill.R

Rscript tests/run_smoke_test.R
```

### 验证命令

```bash
ls -la tests/output/table
ls -la tests/output/plot
ls -la tests/output/data
```

---

## 参考文献

1. Brunson JC (2020) ggalluvial：用于冲积图的分层语法。*Journal of Open Source Software*。doi:10.21105/joss.02017
2. Wickham H (2016) *ggplot2：优雅的数据分析图形学*。Springer。doi:10.1007/978-3-319-24277-4

**有关详细算法**，请阅读：`references/algorithm.md`