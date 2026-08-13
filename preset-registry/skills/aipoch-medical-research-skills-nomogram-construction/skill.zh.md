---
name: nomogram-construction
description: "Use when constructing a prognosis nomogram from survival-related clinical predictors, exporting the nomogram bundle and C-index table, and optionally rendering the final nomogram PDF. NOT for: univariate/multivariable Cox feature screening, calibration curves, ROC analysis, decision-curve analysis, or non-survival outcomes."
license: MIT
skill-author: AIPOCH
---
# 列线图构建

## 何时使用

当你需要执行以下操作时，请使用此技能：
- 使用已筛选的临床预后变量构建预后列线图；
- 使用 C 指数表评估模型的区分度；
- 导出列线图数据包，并生成达到发表质量的列线图 PDF。

典型用户请求：
- “使用年龄、分期和风险评分构建预后列线图。”
- “使用这些经 Cox 回归筛选的预测变量构建列线图并计算 C 指数。”
- “根据生存预测模型生成列线图 PDF。”

## 何时不应使用

请勿将此技能用于：
- 从头开始使用 Cox 回归筛选预后变量；
- ROC 曲线、校准曲线或决策曲线分析；
- 诊断模型、二分类或非生存结局；
- 单细胞、差异表达或通路分析。

## 何时读取外部文件

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| **需要算法详情** | `references/algorithm.md` | 基于 Cox 的列线图工作流程、C 指数和假设 |
| **需要运行分析** | `scripts/main.R` | 执行 `Rscript scripts/main.R --mode build ...` 或 `--mode plot ...` |
| **遇到错误** | `references/troubleshooting.md` | 常见 `SKILL_*` 错误及解决方案 |
| **需要 CLI 示例** | `references/cli-guide.md` | 详细的命令行示例 |
| **需要测试数据** | `tests/data/` | 用于冒烟测试的临床 CSV 示例 |

## 输入验证

此技能接受：

- 包含生存时间、事件指示变量和预先筛选的预后特征的临床 CSV 文件
- 构建基于 Cox 的预后列线图并计算 C 指数的请求
- 根据现有 `.qs` 数据包重新渲染列线图 PDF 的请求（绘图模式）

如果用户的请求不涉及根据生存数据构建列线图——例如，要求使用 Cox 回归筛选特征、生成校准曲线、执行 ROC 分析或分析非生存二分类结局——请勿继续执行此工作流程。请改为回复：

> “nomogram-construction 旨在使用预先筛选的生存预测变量构建预后列线图，并导出包含 C 指数表的列线图数据包。你的请求似乎超出了此范围。请使用 Cox 特征筛选技能进行变量选择，或使用校准曲线/ROC 技能进行模型验证。”

---

## 前置条件

所需 R 软件包：`rms`、`openxlsx`、`qs`、`optparse`。

使用以下命令安装：
```r
install.packages(c("rms", "openxlsx", "qs", "optparse"), repos = "https://cloud.r-project.org")
```

或者运行引导安装程序：
```bash
Rscript scripts/install_dependencies.R
```

> 注意：`--help` 需要加载 `optparse`。如果软件包检查在选项解析之前触发，请先安装 `optparse`，然后再运行 `--help`。

---

## 用法

### 构建列线图数据包

```bash
Rscript scripts/main.R \
  --mode build \
  --data_file ./clinical_data.csv \
  --features age,stage,risk \
  --time_col futime \
  --event_col fustat \
  --years 1,2,3 \
  --output_dir ./output/ \
  --seed 42
```

### 渲染列线图

```bash
Rscript scripts/main.R \
  --mode plot \
  --nomo_data_file ./output/data/Nomogram_list.qs \
  --plot_save ./output/plot/nomogram_plot.pdf
```

---

## 参数

| 短选项 | 长选项 | 类型 | 默认值 | 描述 |
|-------|------|------|---------|-------------|
| `-m` | `--mode` | character | `build` | 执行模式：`build` 或 `plot` |
| `-d` | `--data_file` | character | **构建时必需** | 以样本 ID 作为行名的临床 CSV 文件 |
| `-f` | `--features` | character | **构建时必需** | 以逗号分隔的预后特征 |
| `-t` | `--time_col` | character | `futime` | 生存时间列 |
| `-e` | `--event_col` | character | `fustat` | 事件列，编码为 `1=event`、`0=censored` |
| `-y` | `--years` | character | `1,2,3` | 以年为单位的预测时间点 |
| `-o` | `--output_dir` | character | `./output/` | 构建模式的输出目录 |
|  | `--overwrite` | flag | `FALSE` | 允许写入非空输出目录 |
| `-n` | `--nomo_data_file` | character | **绘图时必需** | `.qs` 格式的列线图数据包 |
| `-p` | `--plot_save` | character | **绘图时必需** | 输出 PDF 路径 |
| `-w` | `--plot_width` | double | `11` | 绘图宽度（英寸） |
| `-H` | `--plot_height` | double | `8` | 绘图高度（英寸） |
| `-F` | `--font_size` | double | `8` | 绘图字体大小 |
| `-l` | `--line_width` | double | `5` | 绘图线宽 |
|  | `--font_family` | character | `sans` | PDF 输出的字体系列 |
| `-s` | `--seed` | integer | `42` | 用于保证可复现性的随机种子 |
| `-T` | `--timeout_seconds` | integer | `0` | 运行时间限制（秒）；`0` 表示禁用超时限制 |

---

## 输入格式

### 临床数据（`data_file`）

CSV 文件，以样本 ID 作为行名，每个特征/终点变量各占一列。

```csv
",age,stage,risk,futime,fustat
SAMPLE_001,65,StageIII,high,365,1
SAMPLE_002,52,StageII,low,730,0
SAMPLE_003,78,StageIV,high,180,1
```

**要求**
- 文件格式必须为 CSV。
- 样本 ID 必须存储在第一列并用作行名。
- 至少需要 3 个预后特征。
- `time_col` 必须包含大于 `0` 的有限数值。
- `event_col` 只能包含 `0` 和 `1`。
- 过滤掉不完整的行后，至少需要 20 个完整样本和至少 10 个事件。

### 列线图数据包（`nomo_data_file`）

绘图模式读取由构建模式生成的 `.qs` 数据包。

必需的数据包对象：
- `nomogram`
- `c_index`
- `model`
- `data`
- `features`
- `time_points`

---

## 输出文件

### 构建模式

| 文件 | 描述 |
|------|-------------|
| `data/Nomogram_list.qs` | 序列化的列线图数据包 |
| `data/analysis_data.rds` | 用于建模的完整案例数据集 |
| `table/nomogram_c_index.xlsx` | 列线图区分度摘要 |
| `session_info.txt` | 会话信息和构建参数 |

### 绘图模式

| 文件 | 描述 |
|------|-------------|
| `plot/nomogram_plot.pdf` | 渲染后的列线图 PDF |
| `plot/session_info.txt` | 绘图会话信息和参数 |

### `nomogram_c_index.xlsx`

| 列 | 描述 |
|--------|-------------|
| `metric` | 报告的指标名称 |
| `value` | 指标值 |

---

## 工作流程

### 第 1 步：验证输入
- 检查文件是否存在以及 CSV 格式是否正确。
- 验证必需的特征、时间和事件列。
- 验证时间/事件值以及最小样本数/事件数。

### 第 2 步：准备建模数据集
- 仅保留请求的特征列和结局列。
- 将字符型预测变量转换为因子。
- 删除模型变量中包含缺失值的行。

### 第 3 步：拟合基于 Cox 的列线图模型
- 拟合 `rms::cph` 生存模型。
- 在请求的时间点构建生存函数。
- 构建列线图对象。

### 第 4 步：评估性能
- 计算模型的 C-index。
- 保存精简的区分度汇总表。

### 第 5 步：保存并绘图
- 保存列线图包和分析数据集。
- 在绘图模式下生成列线图 PDF。

---

## 示例

### 基本构建

```bash
Rscript scripts/main.R \
  --mode build \
  -d clinical_data.csv \
  -f age,stage,risk \
  -o ./output/
```

### 自定义预测时间范围

```bash
Rscript scripts/main.R \
  --mode build \
  -d clinical_data.csv \
  -f age,stage,risk,treatment \
  -y 1,3,5 \
  -o ./output/
```

### 绘制现有包

```bash
Rscript scripts/main.R \
  --mode plot \
  -n ./output/data/Nomogram_list.qs \
  -p ./output/plot/nomogram_plot.pdf \
  -w 12 -H 9 -F 10
```

---

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| `SKILL_FILE_NOT_FOUND` | 输入文件不存在 | 验证文件路径 |
| `SKILL_EMPTY_DATA` | 输入文件为空，或不包含可用的行和列 | 使用有效的行和列重新导出输入文件 |
| `SKILL_MISSING_COLUMNS` | 临床数据中缺少必需的列 | 检查列名和拼写 |
| `SKILL_INVALID_DATA` | 时间/事件编码无效、包格式错误或 CSV/QS 文件不可读 | 检查输入值和文件完整性 |
| `SKILL_INSUFFICIENT_DATA` | 特征、完整样本或事件数量过少 | 提供更多有效的预测变量或样本 |
| `SKILL_ANALYSIS_ERROR` | `cph()` 拟合、列线图构建或输出写入失败 | 检查数据质量、因子水平和事件分布 |
| `SKILL_INVALID_PARAMETER` | 缺少必需的 CLI 值、模式无效、年份无效或存在覆盖冲突 | 检查命令行参数 |
| `SKILL_PACKAGE_NOT_FOUND` | 未安装必需的 R 包 | 使用以下命令安装：`Rscript -e "install.packages(c('rms', 'openxlsx', 'qs'), repos='https://cloud.r-project.org')"` |
| `SKILL_TIMEOUT` | 超过了配置的超时时间 | 增大 `--timeout_seconds` 或减少工作负载 |

**如果错误仍然存在**，请阅读：`references/troubleshooting.md`

---

## 测试

### 使用随附数据进行冒烟测试

```bash
Rscript scripts/main.R --help

Rscript scripts/main.R \
  --mode build \
  -d tests/data/yuhou_cli_data.csv \
  -f age,gender,risk \
  -o tests/expected_output/ \
  --overwrite

Rscript scripts/main.R \
  --mode plot \
  -n tests/expected_output/data/Nomogram_list.qs \
  -p tests/expected_output/plot/nomogram_plot.pdf
```

### 自动化冒烟测试脚本

```bash
Rscript tests/run_smoke_test.R
```

可选的 shell 封装脚本：

```bash
bash tests/run_smoke_test.sh
```

### 预期输出

```text
tests/expected_output/
|-- data/analysis_data.rds
|-- data/Nomogram_list.qs
|-- plot/nomogram_plot.pdf
|-- plot/session_info.txt
|-- session_info.txt
`-- table/nomogram_c_index.xlsx
```

历史开发产物可能仍存在于 `tests/output/` 中，但标准化验证使用 `tests/expected_output/`。

---

## 参考文献

1. Harrell FE (2015). *回归建模策略*。
2. Iasonos A et al. (2008). 如何构建和解读癌症预后列线图。*临床肿瘤学杂志*。
3. Balachandran VP et al. (2015). 肿瘤学中的列线图：不止表面所见。*柳叶刀·肿瘤学*。

**有关算法的详细说明**，请阅读：`references/algorithm.md`

---

## 实现检查清单

- [x] 使用 `optparse` 解析 CLI
- [x] 使用 `set.seed()` 确保可复现性
- [x] 使用 `requireNamespace()` 检查依赖项
- [x] 记录会话信息
- [x] 将超时参数公开为 CLI 选项
- [x] `SKILL.md` 中包含文件读取说明
- [x] `scripts/` 中采用模块化脚本结构
- [x] `tests/data/` 中提供测试数据
- [x] 使用 `SKILL_*` 代码进行错误处理
- [x] `references/` 中记录参考资料

---

*最后更新：2026-04-27 | 版本：2.1.0*