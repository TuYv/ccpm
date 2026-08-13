---
name: differential-expression-analysis
description: Use when analyzing bulk RNA-seq or microarray expression data to identify differentially expressed genes between two biological groups (case vs control), with volcano plots and heatmap visualization. NOT for:single-cell RNA-seq, methylation analysis, non-expression data.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# 差异表达分析

## 何时读取外部文件

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| **需要算法详情** | `references/algorithm.md` | 统计方法、公式和假设 |
| **需要运行分析** | `scripts/main.R` | 执行：`Rscript scripts/main.R --input_file ... --group_file ...` |
| **遇到错误** | `references/troubleshooting.md` | 常见错误及解决方案 |
| **需要 CLI 示例** | `references/cli-guide.md` | 详细的 CLI 使用示例 |
| **需要测试数据** | `tests/data/` | 用于测试的示例输入文件 |

---

## 用法

```bash
Rscript scripts/main.R \
  --input_file ./expression_matrix.csv \
  --group_file ./group_info.csv \
  --output_dir ./output/ \
  --diff_method limma \
  --p_threshold 0.05 \
  --logfc_threshold 0.1 \
  --seed 42
```

---

## 参数

| 短参数 | 长参数 | 类型 | 默认值 | 描述 |
|-------|------|------|---------|-------------|
| `-i` | `--input_file` | character | **必填** | 表达矩阵文件（基因为行，样本为列） |
| `-g` | `--group_file` | character | **必填** | 分组信息文件（样本 ID + 分组列） |
| `-o` | `--output_dir` | character | `./output/` | 输出目录 |
| `-m` | `--diff_method` | character | `limma` | 方法：limma、deseq2、edger、t、wilcox |
| `-n` | `--norm_method` | character | `TMM` | edgeR 的归一化方法：TMM、RLE、upperquartile |
| `-p` | `--p_threshold` | numeric | `0.05` | P 值阈值 |
| `-f` | `--logfc_threshold` | numeric | `0.1` | 对数倍数变化阈值 |
| `-s` | `--seed` | integer | `42` | 用于确保可复现性的随机种子 |

---

## 输入格式

### 表达矩阵 (input_file)

基因为行，样本为列，采用 CSV 格式，第一列为基因 ID。

```csv
"","GSM1442228","GSM1442229","GSM1442230"
"0610006L08Rik",3.438,3.237,3.265
"0610007P14Rik",6.734,7.017,6.807
```

### 分组文件 (group_file)

包含样本 ID 和分组列的 CSV 文件。

```csv
"ID","group"
"GSM1442228","Control"
"GSM1442229","Control"
"GSM1442230","DIC"
```

---

## 输出文件

| 文件 | 描述 |
|------|-------------|
| `Diffanalysis.csv` | 完整的差异表达结果，包含 gene_id、logFC、Pvalue、Padj |
| `volcano_plot.pdf` | 带有显著性阈值的火山图 |
| `heatmap.pdf` | 上调和下调程度最高的基因热图 |
| `session_info.txt` | R 会话和软件包版本信息 |
| `temp/rdegs.csv` | 显著差异表达基因 |
| `temp/Diffanalysis_filtered.csv` | 带有分组注释的完整结果 |

---

## 工作流程

### 第 1 步：验证输入
- 检查文件是否存在
- 验证表达矩阵与分组文件之间的样本是否匹配
- 确认每组至少有 2 个样本

### 第 2 步：运行差异表达分析
- 选择方法：limma、DESeq2、edgeR、t 检验或 Wilcoxon 检验
- 计算 logFC 和 p 值
- 应用多重检验校正（Benjamini-Hochberg）

### 步骤 3：筛选结果
- 按 p 值和 logFC 阈值进行筛选
- 将基因分类为上调、下调或不显著

### 步骤 4：生成可视化结果
- 展示显著性与倍数变化关系的火山图
- 差异基因排名前列的热图

---

## 方法

### limma
使用经验贝叶斯调节的微阵列和 RNA-seq 线性模型。推荐用于标准化表达数据（FPKM、TPM）。

### DESeq2
使用方差稳定化的负二项广义线性模型。推荐用于原始计数数据。

### edgeR
采用 TMM 标准化的经验贝叶斯方法。支持稳健的离散度估计。

### t 检验 / Wilcoxon 检验
简单的成对统计检验。t 检验适用于参数数据，Wilcoxon 检验适用于非参数数据。

---

## 示例

### 基本用法（limma）
```bash
Rscript scripts/main.R \
  -i expression_matrix.csv \
  -g group_info.csv \
  -o ./output \
  -m limma
```

### 对计数数据使用 DESeq2
```bash
Rscript scripts/main.R \
  -i count_matrix.csv \
  -g group_info.csv \
  -o ./output \
  -m deseq2
```

### 自定义阈值
```bash
Rscript scripts/main.R \
  -i expression_matrix.csv \
  -g group_info.csv \
  -o ./output \
  -p 0.01 \
  -f 0.5
```

---

## 错误处理

### 常见错误

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| `SKILL_FILE_NOT_FOUND` | 输入文件不存在 | 检查文件路径 |
| `SKILL_SAMPLE_MISMATCH` | 样本名称不匹配 | 验证分组文件是否与表达矩阵的列匹配 |
| `SKILL_INVALID_DATA` | 分组少于 2 个，或每组样本少于 2 个 | 检查分组文件 |
| `SKILL_FILTER_ERROR` | 未发现显著基因 | 放宽阈值或检查数据质量 |
| `SKILL_DEPENDENCY_MISSING` | R 包未安装 | 安装所需的软件包 |

**如果错误仍然存在**，请阅读：`references/troubleshooting.md`

---

## 测试

### 使用样本数据进行测试

```bash
# Check help
Rscript scripts/main.R --help

# Run with sample data
Rscript scripts/main.R \
  -i tests/data/Combined_Datasets_Matrix_mus.csv \
  -g tests/data/Combined_Datasets_mus_Group.csv \
  -o tests/output/
```

### 验证命令

```bash
# Count lines in output
wc -l output/Diffanalysis.csv

# Check volcano plot exists
ls -la output/volcano_plot.pdf
```

---

## 实现检查清单

- [x] 使用 `optparse` 进行 CLI 解析
- [x] 使用 `set.seed()` 确保可复现性
- [x] 使用 `requireNamespace()` 检查依赖项
- [x] 记录会话信息
- [x] 清理临时文件
- [x] SKILL.md 中包含文件读取说明
- [x] 模块化脚本结构（每个文件少于 100 行）
- [x] 提供测试数据
- [x] 使用 SKILL_* 代码进行错误处理
- [x] 脚本位于 `scripts/` 目录中
- [x] 参考资料位于 `references/` 目录中

---

*最后更新：2026-04-01 | 版本：2.0.0*