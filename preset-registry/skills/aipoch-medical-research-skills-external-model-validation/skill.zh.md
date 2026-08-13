---
name: external-model-validation
description: "Use when validating an existing prognostic risk signature on an external bulk expression cohort with survival outcomes, producing risk scores, Kaplan-Meier curves, risk distribution plots, heatmap, and time-dependent ROC curves. NOT for: model training, feature selection, nomogram construction, calibration analysis, or single-cell data."
license: MIT
skill-author: AIPOCH
---
# 外部模型验证

## 输入验证

此技能接受：一个现有的预后基因签名（包含 `Gene` 和 `Coef` 列的模型系数文件）、一个 CSV 格式的批量表达矩阵（基因为行，样本为列），以及一个包含 `OS` 和 `OS.time` 生存列的临床文件。

如果用户的请求不涉及在外部队列上验证预先存在的预后模型——例如，要求训练新模型、执行特征选择、构建列线图、运行校准曲线、分析单细胞数据，或处理不含生存终点的数据——请勿继续执行该工作流。应改为回复：

> "external-model-validation 旨在外部批量表达队列上，使用生存结局验证现有的预后风险签名。您的请求似乎超出了此范围。请提供固定的模型系数文件，以及包含 OS/OS.time 列的表达数据和临床数据，或者使用更适合模型训练、列线图构建或单细胞分析的工具。"

## 何时读取外部文件

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| **需要运行分析** | `scripts/main.R` | 执行：`Rscript scripts/main.R --exp_file ... --cli_file ... --model_file ...` |
| **需要了解工作流顺序或输出生成步骤** | `scripts/run_analysis.R` | 查看加载、评分、绘图和元数据导出这 4 个步骤的编排 |
| **需要了解风险评分或样本匹配逻辑** | `scripts/functions.R` | 检查核心数据准备和验证逻辑 |
| **需要了解输出写入或元数据导出的详细信息** | `scripts/io.R` | 检查输出目录创建和文件写入辅助函数 |
| **需要了解绘图实现细节** | `scripts/plotting.R` | 检查 Kaplan-Meier 图、风险图、热图和 ROC 图的生成 |
| **需要了解输入验证、日志记录、超时或依赖项逻辑** | `scripts/utils.R` | 查看验证辅助函数、`SKILL_*` 错误处理、日志记录和运行时保障措施 |
| **需要了解统计假设或方法细节** | `references/algorithm.md` | 风险评分公式、分组截断值、生存分析、ROC 和热图假设 |
| **需要故障排除帮助** | `references/troubleshooting.md` | 常见故障、警告和具体修复方法 |
| **需要 CLI 使用示例** | `references/cli-guide.md` | 参数说明、示例和命令模式 |
| **需要了解预期输出或基准运行** | `references/baseline-run.md` | 真实数据基准命令、运行时间、内存检查点和输出清单 |
| **需要测试输入** | `tests/data/` | 用于验证的表达、临床和模型示例文件 |
| **需要刷新保留的示例输出** | `tests/refresh_example_output.R` | 使用捆绑的测试数据和 `--overwrite` 重新构建 `tests/output/` |

---

## 用法

```bash
Rscript scripts/main.R \
  --exp_file ./expression.csv \
  --cli_file ./clinical.csv \
  --model_file ./model.csv \
  --output_dir ./output/ \
  --time_unit month \
  --seed 42
```

---

## 参数

| 短选项 | 长选项 | 类型 | 默认值 | 说明 |
|-------|------|------|---------|-------------|
| `-e` | `--exp_file` | character | **必填** | 表达矩阵 CSV，基因为行，样本为列 |
| `-c` | `--cli_file` | character | **必填** | 临床数据 CSV，样本 ID 为行名，并包含 `OS`、`OS.time` 列 |
| `-m` | `--model_file` | character | **必填** | 模型系数 CSV，包含 `Gene` 和 `Coef` 列 |
| `-o` | `--output_dir` | character | `./output/` | 输出目录 |
|  | `--overwrite` | flag | `FALSE` | 允许写入非空输出目录 |
| `-u` | `--time_unit` | character | `month` | 输入临床文件中的生存时间单位：`day`、`month`、`year` |
|  | `--col_high` | character | `#E64B35` | 高风险样本的颜色 |
|  | `--col_low` | character | `#4DBBD5` | 低风险样本的颜色 |
|  | `--roc_cols` | character | `#E64B35,#00A087,#3C5488` | ROC 曲线的颜色，以逗号分隔 |
|  | `--roc_times` | character | `1,3,5` | ROC 时间点，以逗号分隔，**始终以年为单位**，不受 `--time_unit` 影响。当随访时间以天或月为单位时，仍应以年为单位提供 `--roc_times`（例如，`1,3,5` 表示 1 年、3 年和 5 年）。 |
|  | `--roc_pos` | character | `bottomright` | ROC 图例位置 |
|  | `--km_breaks` | integer | `0` | Kaplan-Meier 图 x 轴刻度间隔，以年为单位；`0` 表示自动选择 |
| `-s` | `--seed` | integer | `42` | 用于确保结果可复现的随机种子 |
|  | `--timeout_seconds` | integer | `3600` | 已用时间的超时限制，以秒为单位 |

---

## 适用场景

- 你已经拥有一个固定的预后基因特征及其系数。
- 你需要在包含批量表达数据和生存数据的独立队列中检验该模型。
- 你需要用于外部验证的标准输出：风险表、Kaplan-Meier 曲线、风险评分图、生存状态图、表达热图和时间依赖性 ROC。

## 不适用场景

- 请勿使用此技能训练或重新拟合预后模型。
- 请勿将其用于列线图构建、校准曲线、DCA 或诊断分类。
- 请勿将其用于单细胞表达矩阵或不包含生存终点的队列。
- 未经去标识化和本地合规审批，请勿使用可识别患者身份的数据。
- 请勿用于事件数极少的队列（少于 5 个事件可能会导致 Kaplan-Meier 和 ROC 结果不可靠）。

## 研究用途声明

- 此技能仅用于研究和验证工作流程。
- 它不提供诊断、治疗建议或临床决策支持。
- 在人群队列上运行之前，请使用去标识化数据，并遵守 IRB、伦理和数据使用要求。

---

## 输入格式

### 表达矩阵（`exp_file`）

CSV 文件，基因为行，样本为列。第一列必须包含基因标识符。

```csv
"","Sample_1","Sample_2","Sample_3"
"TSPAN6",3.87,4.54,8.12
"TNMD",9.98,5.86,5.38
"DPM1",7.95,6.11,5.41
```

### 临床文件（`cli_file`）

CSV 文件，样本 ID 为行名，并且至少包含 `OS` 和 `OS.time` 列。

```csv
,Age,OS,OS.time
Sample_1,59,0,133.5
Sample_2,60,0,49.13
Sample_3,59,1,22.40
```

- `OS` 必须使用 `0/1` 编码。
- `OS.time` 必须为正数，并且可按照 `--time_unit` 进行解释。

### 模型系数文件（`model_file`）

包含两个必需列的 CSV：`Gene` 和 `Coef`。

```csv
Gene,Coef
TSPAN6,-0.25
TNMD,0.15
DPM1,0.32
```

---

## 输出文件

| 文件 | 描述 |
|------|-------------|
| `data/risk_data.rds` | 序列化的分析数据集，包含生存数据、模型基因表达量、风险评分和风险组 |
| `table/out_varifyRisk.txt` | 所有匹配样本的制表符分隔风险表 |
| `plot/out_varifySurv.pdf` | 带风险表的 Kaplan-Meier 生存曲线 |
| `plot/out_varify.riskScore.pdf` | 排序后的风险评分图 |
| `plot/out_varify.survStat.pdf` | 生存状态图 |
| `plot/out_varify.heatmap.pdf` | 排序后样本中模型基因的热图 |
| `plot/out_varify.ROC.pdf` | 时间依赖性 ROC 曲线 PDF |
| `analysis.log` | 运行时日志，包括内存检查点和处理步骤 |
| `run_parameters.tsv` | 本次运行所使用的确切参数值 |
| `session_info.txt` | R 版本、平台和软件包会话信息 |

---

## 工作流程

### 步骤 1：验证输入
- 检查必需文件和 CSV 扩展名。
- 验证颜色字符串、超时时间、随机种子、KM 间隔设置和时间单位选项。
- 解析 `--roc_times` 和 `--roc_cols`。

### 步骤 2：构建匹配的验证数据集
- 读取表达矩阵、临床数据和模型文件。
- 匹配表达矩阵列名和临床数据行名中共有的样本。
- 检查所有模型基因是否都存在于表达矩阵中。
- 在下游分析之前移除不完整的观测。

### 步骤 3：计算风险评分和分组
- 使用提供的线性预测器计算风险评分。
- 将随访时间转换为年。
- 使用风险评分中位数将患者划分为 `low` 组和 `high` 组。

### 步骤 4：生成验证输出
- 保存完整的风险表和 RDS 对象。
- 生成 Kaplan-Meier 图、风险评分图、生存状态图、热图和时间依赖性 ROC 图。
- 保存会话元数据和确切的运行参数。

---

## 方法

### 风险评分公式

对于样本 `i`，该技能计算：

```text
riskScore_i = sum(expression_ig * coefficient_g)
```

计算时使用 `model_file` 中列出的所有基因。

### 风险分层

- 按 `riskScore` 对样本排序。
- 使用风险评分中位数作为截断值。
- 评分高于中位数的样本标记为 `high`；其余样本标记为 `low`。

### 生存分析

- 使用 `survival::survfit` 拟合 Kaplan-Meier 曲线。
- 使用 `survminer::ggsurvplot` 中默认的 log-rank p 值展示组间差异。

### 时间依赖性 ROC

- 使用 `timeROC::timeROC` 进行 ROC 分析，随访时间以年为单位。
- 所有 `--roc_times` 值都必须小于观测到的最大随访时间。
- 无论 `--time_unit` 如何设置，`--roc_times` 始终按年解释。

---

## 示例

### 基本用法

```bash
Rscript scripts/main.R \
  -e tests/data/BRCA_data.csv \
  -c tests/data/BRCA_clinic.csv \
  -m tests/data/BRCA_coef.csv \
  -o ./output/
```

### 以天为单位记录的输入随访时间

```bash
Rscript scripts/main.R \
  -e expression.csv \
  -c clinical.csv \
  -m model.csv \
  -o ./output \
  -u day \
  --roc_times 1,2,3
```

注意：`--roc_times 1,2,3` 表示 1 年、2 年和 3 年——即使提供了 `--time_unit day`。该 Skill 会在计算 ROC 之前，在内部将 `OS.time` 从天转换为年。

### 自定义绘图颜色和 ROC 设置

```bash
Rscript scripts/main.R \
  -e expression.csv \
  -c clinical.csv \
  -m model.csv \
  -o ./output \
  --col_high '#B2182B' \
  --col_low '#2166AC' \
  --roc_cols '#B2182B,#4D9221,#2166AC' \
  --roc_pos topleft \
  --km_breaks 2
```

---

## 错误处理

### 常见错误

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| `SKILL_FILE_NOT_FOUND` | 输入路径缺失或错误 | 检查文件路径和权限 |
| `SKILL_MISSING_COLUMNS` | 临床文件或模型文件缺少必需列 | 确保存在 `OS`、`OS.time`、`Gene` 和 `Coef` |
| `SKILL_SAMPLE_MISMATCH` | 表达数据与临床数据之间没有重叠样本 | 确保样本 ID 完全一致 |
| `SKILL_EMPTY_DATA` | 输入文件加载后为空 | 确认 CSV 至少包含一行和一列可用数据 |
| `SKILL_INVALID_DATA` | 存在重复基因、空数据、非数值系数或无效生存值。对于重复基因：使用 `dplyr::distinct()` 去重，或保留平均表达量最高的行（例如 `mat[order(-rowMeans(mat[,-1])),] %>% distinct(Gene, .keep_all=TRUE)`） | 清理输入表并验证格式 |
| `SKILL_ANALYSIS_ERROR` | 风险组无法有效区分，或事件数过少 | 使用有效的特征签名和事件数充足的队列（最少约 5 个） |
| `SKILL_INVALID_PARAMETER` | `--time_unit` 错误、颜色无效或 ROC 时间点不可行 | 更正参数值 |
| `SKILL_DEPENDENCY_MISSING` | 所需的 R 包尚未安装 | 安装缺失的软件包 |
| `SKILL_PKG_VERSION` | 已安装的软件包版本低于最低要求 | 将软件包升级到所需版本 |

**如果错误仍然存在**，请阅读：`references/troubleshooting.md`

---

## 测试

### 使用随附数据进行测试

```bash
# Check CLI
Rscript scripts/main.R --help

# Run with bundled test data in a fresh output directory
Rscript scripts/main.R \
  -e tests/data/BRCA_data.csv \
  -c tests/data/BRCA_clinic.csv \
  -m tests/data/BRCA_coef.csv \
  -o ./output/
```

### 验证命令

```bash
# Run R tests
Rscript tests/testthat.R

# Refresh the retained example output bundle
Rscript tests/refresh_example_output.R

# Inspect the generated risk table
wc -l tests/output/table/out_varifyRisk.txt

# Review the retained example outputs
ls -la tests/output/
```

### 真实数据基线

该代码库在 `references/baseline-run.md` 中保存了有文档记录的真实数据基线摘要。

**如果需要精确的基准测试输出或运行时间预期**，请阅读：`references/baseline-run.md`

→ 目录结构和实现细节：[references/project-structure.md](references/project-structure.md)