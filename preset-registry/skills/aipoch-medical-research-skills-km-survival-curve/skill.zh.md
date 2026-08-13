---
name: km-survival-curve
description: Use when generating Kaplan-Meier survival curves from tabular survival data containing time, event status, and a precomputed risk group. Supports command-line parameter input, parameter validation, automatic time-unit handling, single-file PDF figure export, and session metadata capture.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# Kaplan-Meier 生存曲线分析

使用此技能对表格数据集运行 Kaplan-Meier 生存分析，并导出单个 PDF 生存曲线图。

## 何时使用此技能

- 你需要根据包含时间、状态和分组列的表格生成 Kaplan-Meier 生存曲线。
- 你需要一个带参数验证的命令行生存分析工作流。
- 你需要将单个 Kaplan-Meier 图作为最终分析结果。

## 主要命令

```bash
Rscript scripts/main.R \
  --input_file <input_file> \
  --output_dir <output_dir> \
  --time_col <time_column> \
  --status_col <status_column> \
  --risk_col <group_column>
```

## 前置条件

- shell 中可以使用 `Rscript`。
- 所需 R 包：`optparse`、`data.table`、`survival`、`survminer`、`ggplot2`。
- 使用 `Rscript -e 'install.packages(c("optparse", "data.table", "survival", "survminer", "ggplot2"), repos="https://cloud.r-project.org")'` 安装缺失的软件包。

## 核心参数

| 参数 | 必需 | 说明 |
|----------|----------|-------------|
| `--input_file` | 是 | CSV 或制表符分隔的 TXT/TSV 格式输入数据文件 |
| `--output_dir` | 否 | 输出目录，默认为 `./KM_Results` |
| `--time_col` | 否 | 生存时间列，默认为 `futime` |
| `--status_col` | 否 | 事件状态列，默认为 `fustat` |
| `--risk_col` | 否 | 风险组列，默认为 `risk_group` |
| `--time_unit` | 否 | 时间单位标签：`year`、`month` 或 `day`，默认为 `year` |
| `--auto_convert_days` | 否 | 当 `time_unit` 为 `year` 或 `month` 时，以启发式方式将较大的时间值从天转换为相应单位，默认为 `true` |
| `--statistics_method` | 否 | `logrank` 或 `wald`，默认为 `logrank` |

## 绘图自定义参数

| 参数 | 默认值 | 说明 |
|----------|---------|-------------|
| `--figure_width` | `10` | 图形宽度（英寸） |
| `--figure_height` | `7` | 图形高度（英寸） |
| `--figure_family` | `sans` | 字体族 |
| `--title_x` | `Time` | X 轴标题。如果保留默认值，脚本将呈现 `Time (<time_unit>)` |
| `--title_y` | `Survival probability` | Y 轴标题 |
| `--title_main` | 空 | 图形标题 |
| `--legend_position` | `top` | `top`、`bottom`、`left`、`right`、`none` |
| `--legend_show` | `true` | 是否显示图例 |
| `--legend_title` | 空 | 图例标题 |
| `--line_type` | `solid` | 生存曲线线型：`solid`、`dashed`、`dotted`、`dotdash`、`longdash`、`twodash` |
| `--line_size` | `1` | 生存曲线线宽 |
| `--line_colors` | `#4DBBD5,#E64B35,#00A087,#3C5488,#F39B7F,#8491B4,#91D1C2,#DC0000` | 以逗号分隔的分组颜色 |
| `--censor_show` | `true` | 是否显示删失标记 |
| `--censor_size` | `7` | 删失标记大小 |
| `--confidence_show` | `true` | 是否显示置信区间 |
| `--confidence_alpha` | `0.2` | 置信带透明度 |
| `--risk_table_show` | `true` | 是否显示风险表 |
| `--risk_table_border` | `true` | 是否显示风险表边框 |
| `--risk_table_panel` | `false` | 是否显示风险表面板背景 |
| `--risk_table_size` | `6` | 风险表字体大小 |
| `--axis_title_size` | `12` | 坐标轴标题字体大小 |
| `--axis_text_size` | `10` | 坐标轴刻度标签字体大小 |
| `--legend_text_size` | `11` | 图例文字字体大小 |

## 输入要求

- 输入文件必须包含所请求的时间、状态和分组列。
- `.txt` 输入文件必须以制表符分隔。
- `time` 必须包含有限的非负数值。
- `status` 必须编码为 `0` 表示删失，`1` 表示事件。
- 风险分组列必须是预先计算的分类分组变量，不能是连续评分列。
- 筛选后，风险分组列必须包含至少 2 个组。
- 覆盖默认调色板时，`--line_colors` 必须为每个保留的组提供至少一种颜色。
- 分析前会移除时间、状态或分组值缺失的行。
- 筛选后必须至少保留 2 条完整观测记录。
- 在拟合模型前，会拒绝近乎唯一或看起来是连续变量的分组列。
- 如果 `--auto_convert_days true` 且 `max(time) > 365`，当 `time_unit` 为 `year` 或 `month` 时，脚本会假定保留的时间值以天为单位，并将其转换为所请求的 `--time_unit`。
- 仅当已知源时间列以天为单位时，才使用 `--auto_convert_days true`。
- 如果源数据已经以年或月为单位，请禁用 `--auto_convert_days`，以避免错误转换。
- `--statistics_method wald` 仅支持恰好保留 2 个组；多组比较请使用 `logrank`。
- 绘图前会拒绝无效的绘图参数，例如不受支持的 `--line_type` 值。

输入示例：

```text
id	fustat	futime	risk_score	risk_group	GPR161	RIBC2
TCGA-C5-A1M5	1	5.62191780821918	-1.10702407761445	low	2.82521576230566	5.35318564979635
TCGA-VS-A94W	0	3.40547945205479	-0.671246677921865	high	4.26241812321536	4.00802068790173
```

随附的测试数据集：

- `tests/data/km_sample1.txt`：包含 `risk_group` 的基准 KM 示例
- `tests/data/km_sample2.txt`：用于绘图和统计示例的备选队列
- `tests/data/km_sample3.txt`：用于验证和重复测试的附加队列

## 最简工作流程

1. 确认输入文件存在，并确定时间、状态和分组列。
2. 使用所请求的输出目录和任意可选绘图参数运行 `scripts/main.R`。
3. 检查输出目录中是否存在 `km-plot.pdf`。

如果省略 `--input_file`，脚本将以 `SKILL_MISSING_INPUT` 退出。

## 输出

预期输出：

```text
<output_dir>/
├── km-plot.pdf
└── session_info.txt
```

## 解读指南

- 使用生存图观察各组随时间变化的分离情况。
- 使用图中的 p 值标注、置信区间和风险表解读组间分离情况。

## 时间转换注意事项

- 自动转换是一种便捷的启发式方法，并非单位检测器。
- 脚本仅检查 `max(time) > 365`；它不会根据元数据推断真实的源单位。
- 如果输入时间列已经以年或月表示，请使用 `--auto_convert_days false` 运行。
- 当 `time_unit` 为 `year` 或 `month` 时，请查看控制台日志中的转换警告。

## 可复现性说明

- 对相同输入重复运行时，分析结果应保持一致。
- 由于 PDF 元数据和图形设备输出可能存在差异，导出的 `km-plot.pdf` 在重复运行时可能无法做到字节级完全一致。
- 如果需要字节级稳定的构件，请在此 skill 之外添加确定性的 PDF 后处理步骤。

## 请勿在以下情况使用此 Skill

- 你需要使用此工具确定截断值，或将连续评分划分为不同风险组。
- 你需要进行多变量 Cox 回归、协变量校正，或超出此处已提供的 p 值计算路径的风险比建模。
- 你需要更广泛的生存分析工作流，包括上游特征工程、生物标志物筛选或数据协调。
- 你需要生成多个图表、生成报告，或进行超出生成一张 Kaplan-Meier 图和会话元数据范围的下游解读。

## 按需阅读以下文件

| 需求 | 文件 |
|------|------|
| Kaplan-Meier 方法详情与解读 | `references/algorithm.md` |
| 更多 CLI 示例 | `references/cli-guide.md` |
| 错误诊断 | `references/troubleshooting.md` |
| 主执行入口 | `scripts/main.R` |
| 示例测试数据 | `tests/data/km_sample1.txt`, `tests/data/km_sample2.txt`, `tests/data/km_sample3.txt` |

## 快速示例

基本 Kaplan-Meier 分析：

```bash
Rscript scripts/main.R \
  --input_file tests/data/km_sample1.txt \
  --output_dir tests/output_basic
```

自定义列名：

```bash
Rscript scripts/main.R \
  --input_file tests/data/km_sample1.txt \
  --time_col futime \
  --status_col fustat \
  --risk_col risk_group \
  --output_dir tests/output_custom_columns
```

自定义图表标题：

```bash
Rscript scripts/main.R \
  --input_file tests/data/km_sample2.txt \
  --title_main "Study KM Curve" \
  --output_dir tests/output_title
```

隐藏置信区间和风险表：

```bash
Rscript scripts/main.R \
  --input_file tests/data/km_sample3.txt \
  --confidence_show false \
  --risk_table_show false \
  --output_dir tests/output_simple
```

## 验证

```bash
Rscript scripts/main.R --help
```

```bash
Rscript scripts/main.R \
  --input_file tests/data/km_sample1.txt \
  --output_dir tests/validation_output
```

运行分析后，验证 `tests/validation_output/km-plot.pdf` 是否存在。

## 常见错误

- `SKILL_FILE_NOT_FOUND`：输入文件路径错误或无法访问。
- `SKILL_MISSING_COLUMNS`：缺少所请求的时间、状态或风险组列。
- `SKILL_INVALID_DATA`：输入数据格式错误或不适合进行生存分析。
- `SKILL_INVALID_DATA`：在需要分类分组列的位置提供了连续或值几乎唯一的风险列。
- `SKILL_INVALID_PARAMETER`：参数值无效。
- `SKILL_INVALID_PARAMETER`：`--line_type` 或 `--line_colors` 等绘图选项与保留的分组不兼容。
- `SKILL_INSUFFICIENT_DATA`：筛选后剩余的完整观测值过少。
- `SKILL_DEPENDENCY_MISSING`：缺少 `optparse` 或 `survival` 等必需的 R 包。

如果问题原因不明显，请阅读 `references/troubleshooting.md`。