---
name: consensus-clustering-analysis
description: "Use when identifying stable sample subtypes from bulk expression matrices with ConsensusClusterPlus, including PAC-based model selection and consensus matrix/CDF visualization. NOT for: differential expression analysis, single-cell clustering workflows, or non-expression tables."
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# 共识聚类分析

## 何时使用

当你需要使用 `ConsensusClusterPlus` 从批量表达矩阵中识别稳定的样本亚型、使用 PAC 比较候选聚类设置，并导出共识矩阵/CDF 可视化结果时，请使用此技能。

请勿将此技能用于差异表达分析、单细胞聚类或非表达类表格数据。

## 何时读取外部文件

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| **需要算法详情** | `references/algorithm.md` | 共识聚类、PAC 评分和预处理假设 |
| **需要运行分析** | `scripts/main.R` | 执行：`Rscript scripts/main.R --input_file ... --group_file ...` |
| **遇到错误** | `references/troubleshooting.md` | 常见错误及解决方案 |
| **需要 CLI 示例** | `references/cli-guide.md` | 包含已验证本地运行结果的详细 CLI 使用示例 |

---

## 用法

```bash
Rscript scripts/main.R \
  --input_file ./expression_matrix.csv \
  --group_file ./groups.csv \
  --disease_group case \
  --max_k 4 \
  --output_dir ./output/ \
  --gene_selection highly_variable \
  --top_n 5000 \
  --reps 1000 \
  --p_item 0.8 \
  --p_feature 1.0 \
  --timeout_seconds 3600 \
  --seed 42
```

---

## 参数

| 短选项 | 长选项 | 类型 | 默认值 | 说明 |
|-------|------|------|---------|-------------|
| `-i` | `--input_file` | character | **必填** | 表达矩阵文件（行为基因，列为样本） |
| `-g` | `--group_file` | character | **必填** | 分组信息文件（样本 ID + 分组列） |
| `-d` | `--disease_group` | character | `case` | 保留用于聚类的分组标签 |
| `-k` | `--max_k` | integer | `4` | 要评估的最大聚类数量 |
| `-o` | `--output_dir` | character | `./output/` | 输出目录 |
| `-m` | `--gene_selection` | character | `highly_variable` | 基因选择模式：`highly_variable` 或 `custom` |
| `-n` | `--top_n` | integer | `5000` | 要保留的高变基因数量 |
| `-l` | `--gene_list` | character | `NULL` | 当 `gene_selection=custom` 时使用的自定义基因列表文件 |
| `-c` | `--center_data` | logical | `TRUE` | 聚类前对每个基因进行中位数中心化 |
| `-r` | `--reps` | integer | `1000` | 共识重采样重复次数 |
|  | `--p_item` | double | `0.8` | 样本重采样比例 |
|  | `--p_feature` | double | `1.0` | 特征重采样比例 |
| `-t` | `--timeout_seconds` | integer | `3600` | 经过时间的超时时限（秒） |
| `-s` | `--seed` | integer | `42` | 用于保证可复现性的随机种子 |

---

## 输入格式

### 表达矩阵 (input_file)

行为基因，列为样本，采用 CSV/TSV/TXT 格式，第一列为基因 ID。

```csv
,Sample01,Sample02,Sample03
TSPAN6,1.8479,1.8318,3.8276
TNMD,0.0349,0.0533,1.3889
```

### 分组文件 (group_file)

包含样本 ID 和分组列的分隔文本文件。

```csv
sample,group
Sample01,case
Sample02,control
Sample03,case
```

### 基因列表 (gene_list)

可选的纯文本文件或单列 CSV 文件，每行包含一个基因符号。

```csv
TNMD
DPM1
SCYL3
```

---

## 输出文件

| 文件 | 说明 |
|------|-------------|
| `Cluster_res.csv` | 每种距离/算法组合的 PAC 汇总，其中使用 `is_best` 标记选定的模型 |
| `genes_for_clustering.csv` | 选定的基因和基因选择模式 |
| `samples_for_clustering.csv` | 按疾病组筛选后保留的样本 |
| `result_<distance>_<algorithm>/` | 特定方法的共识聚类输出和 `PAC_scores.csv` |
| `Consensus Matrix Plot.pdf` | 最优模型的共识矩阵热图 |
| `CDF curve Plot.pdf` | 最优方法的 CDF 曲线 |
| `session_info.txt` | R 会话和软件包版本信息 |

---

## 工作流程

### 第 1 步：验证输入
- 检查文件是否存在
- 检测分组文件中的样本列和分组列
- 验证表达矩阵与分组文件之间的样本匹配情况

### 第 2 步：准备聚类矩阵
- 按指定的疾病组筛选样本
- 使用 `highly_variable` 或 `custom` 选择基因
- 根据需要对基因进行中位数中心化

### 第 3 步：运行共识聚类
- 评估支持的距离与聚类算法组合
- 计算各候选 K 值的 PAC 分数
- 通过最小 PAC 选择最优模型

### 第 4 步：生成输出
- 保存结果表
- 生成共识矩阵图和 CDF 图
- 记录会话信息以确保可复现性

---

## 方法

### ConsensusClusterPlus
使用重复子采样来评估不同候选 K 值和聚类设置下的聚类稳定性。

### PAC 分数
根据共识值的下三角部分，将模糊聚类比例计算为 `CDF(0.9) - CDF(0.1)`。PAC 越低，表示聚类越稳定。

### 基因选择
- `highly_variable`：按中位数绝对偏差对基因进行排序
- `custom`：使用所提供基因列表与矩阵行名的交集

---

## 示例

### 基本用法
```bash
Rscript scripts/main.R \
  -i expression_matrix.csv \
  -g groups.csv \
  -d case \
  -k 3 \
  -r 20 \
  -o output/example_basic \
  -t 120
```

### 使用自定义基因列表
```bash
Rscript scripts/main.R \
  -i expression_matrix.csv \
  -g groups.csv \
  -d case \
  -m custom \
  -l genes.csv \
  -k 4 \
  -r 20 \
  -o output/example_custom \
  -t 120
```

### 不进行中位数中心化
```bash
Rscript scripts/main.R \
  -i expression_matrix.csv \
  -g groups.csv \
  -d case \
  -c FALSE \
  -k 3 \
  -r 20 \
  -o output/example_rawscale \
  -t 120
```

---

## 错误处理

### 常见错误

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| `SKILL_FILE_NOT_FOUND` | 输入文件不存在 | 检查文件路径和权限 |
| `SKILL_MISSING_COLUMNS` | 分组文件缺少样本列/分组列 | 验证分组文件中的列名 |
| `SKILL_SAMPLE_MISMATCH` | 样本名称不匹配 | 确保分组文件中的样本 ID 与矩阵列名匹配 |
| `SKILL_INVALID_PARAMETER` | CLI 值无效 | 检查允许的选项和数值范围 |
| `SKILL_INVALID_DATA` | 筛选后保留的样本/基因过少 | 降低 `max_k` 或检查输入数据 |
| `SKILL_TIMEOUT` | 运行时间超过配置的超时时间 | 增加 `timeout_seconds` 或减少 `reps` |
| `SKILL_DEPENDENCY_MISSING` | 所需的 R 软件包未安装 | 安装缺失的软件包后重新运行 |

**如果错误仍然存在**，请阅读：`references/troubleshooting.md`

---

## 测试

### 冒烟检查

```bash
# Check help
Rscript scripts/main.R --help

# Run analysis
Rscript scripts/main.R \
  -i tests/data/expression_matrix.csv \
  -g tests/data/groups.csv \
  -d case \
  -k 3 \
  -r 20 \
  -o output/example_basic \
  -t 120
```

### 验证命令

```bash
# Inspect selected model
cat output/example_basic/Cluster_res.csv

# Check output plots exist
ls -la output/example_basic
```

---

## 实现检查清单

- [x] 使用 `optparse` 解析 CLI
- [x] 使用 `set.seed()` 确保可复现性
- [x] 使用 `requireNamespace()` 检查依赖项
- [x] 记录会话信息
- [x] 使用 `data.table::fread()` 读取输入
- [x] `SKILL.md` 中的文件读取说明
- [x] 模块化脚本结构（每个文件少于 150 行）
- [x] 已提供测试数据
- [x] 使用 `SKILL_*` 代码进行错误处理
- [x] 脚本位于 `scripts/` 目录中
- [x] 参考资料位于 `references/` 目录中

---

*最后更新：2026-04-17 | 版本：1.0.0*