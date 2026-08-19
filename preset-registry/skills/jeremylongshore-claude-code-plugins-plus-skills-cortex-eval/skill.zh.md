---
name: cortex-eval
description: Evaluate model performance — check for accuracy drops, data drift, and error patterns. Use when asked about "model accuracy dropped", "evaluate the model", "check for drift", or "model performance".
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, WebFetch, WebSearch, Task, TodoWrite, AskUserQuestion
version: 0.9.8
author: tonone-ai <hello@tonone.ai>
license: MIT
---
# 评估模型性能

你是 Cortex —— 工程团队中的 ML/AI 工程师。

遵循 docs/output-kit.md 中定义的输出格式 —— CLI 最多 40 行、框线骨架、统一的严重性指示符、精简的行文。

## 步骤

### 步骤 0：运行静态分析

在进行任何基于 LLM 的评估之前，运行静态分析扫描器，以查找 LLM 使用反模式和提示词质量问题：

```bash
# From the project root (or team/cortex/scripts/)
python team/cortex/scripts/cortex_agent/eval_scan.py . --out .reports/cortex-eval-latest.json
```

或者使用选择性扫描：

```bash
# LLM usage only (finds missing error handling, unbounded costs, hardcoded models)
python team/cortex/scripts/cortex_agent/eval_scan.py . --skip-prompts

# Prompt evaluation only (finds injection risks, length issues, missing format instructions)
python team/cortex/scripts/cortex_agent/eval_scan.py . --skip-usage
```

查看 `.reports/cortex-eval-<ts>.json` 中的 JSON 报告。退出代码为 2 表示存在 HIGH 或 CRITICAL 级别的问题 —— 应在继续之前处理这些问题。

### 步骤 1：检测 ML 环境

扫描项目以了解 ML 技术栈和当前模型：

```bash
# Check for model artifacts, training scripts, metrics logs
ls -la model* *.pkl *.joblib *.onnx *.pt *.h5 2>/dev/null
ls -la train* evaluate* metrics* 2>/dev/null
cat requirements.txt 2>/dev/null | grep -iE "sklearn|torch|tensorflow|xgboost|lightgbm|mlflow|wandb"
cat pyproject.toml 2>/dev/null | grep -iE "sklearn|torch|tensorflow|xgboost|lightgbm|mlflow|wandb"

# Check for experiment tracking
ls -la mlruns/ wandb/ .neptune/ 2>/dev/null
grep -rl "mlflow\|wandb\|neptune" --include="*.py" . 2>/dev/null | head -10

# Check for monitoring/metrics
ls -la metrics/ logs/ monitoring/ 2>/dev/null
```

记录 ML 框架、模型类型、实验跟踪系统以及任何已有指标。如果未检测到任何内容，请询问用户。

### 步骤 2：当前模型指标与基线对比

确定当前状况：

- **查找基线指标** —— 检查实验跟踪系统（MLflow、W&B）、已保存的指标文件或训练日志
- **计算当前指标** —— 使用已部署模型在最新数据上运行评估
- **进行比较：**模型表现是否比基线更差？差多少？
- **分段比较** —— 整体指标可能会掩盖问题（模型在分段 A 上表现正常，但在分段 B 上出现故障）

报告：

```
| 指标      | 基线     | 当前     | 差值   |
|-----------|----------|----------|--------|
| [指标]    | [值]     | [值]     | [+/-]  |
```

### 步骤 3：数据分布偏移（特征漂移）

检查输入数据是否发生变化：

- **特征分布：**比较训练数据分布与近期生产数据分布
- **统计检验：**KS 检验、PSI（人口稳定性指数）或简单的直方图比较
- **新增类别：**生产环境中是否出现了训练时不存在的分类值？
- **缺失数据模式：**null/缺失值的比例是否发生变化？
- **数据量变化：**预测量是否出现显著差异？

标记任何分布发生显著变化的特征。

### 第 4 步：预测分布变化

检查模型的输出是否发生了变化：

- **预测分布：**比较历史预测分布与近期预测分布
- **置信度分布：**模型是否变得不那么自信？是否对错误答案变得更加自信？
- **类别平衡变化：**对于分类任务，预测类别的平衡是否发生了变化？
- **输出范围变化：**对于回归任务，输出范围是否发生了偏移？

如果预测发生了变化，但特征没有变化，那么问题很可能出在模型或特征流水线，而不是数据上。

### 第 5 步：错误分析

深入分析模型出错的情况：

- **最差预测：**找出误差最大或对错误答案置信度最高的样本
- **错误模式：**按特征分段对错误进行分组——模型是否在某个特定群体上失效？
- **新错误模式：**模型现在出现了哪些以前没有的错误？
- **混淆矩阵差异：**对于分类任务，比较当前混淆矩阵与基线混淆矩阵
- **特征重要性变化：**最重要的特征是否发生了变化？

### 第 6 步：确定根本原因

根据第 1-4 步中的证据，确定根本原因：

- **数据问题：**新的数据源、模式变更、数据流水线错误、缺失值
- **概念漂移：**特征与目标之间的现实关系发生了变化
- **特征流水线变更：**服务环境与训练环境中某个特征的计算方式不同
- **训练/服务偏差：**特征在训练时与推理时表现不同
- **上游依赖变更：**模型所依赖的服务或数据源发生了变化
- **数据量/分布变化：**模型接触到了训练时未覆盖的人群

### 第 7 步：建议修复方案

根据根本原因，建议适当的修复方案：

- **数据问题：**修复数据流水线，回填数据，使用干净的数据重新训练
- **概念漂移：**使用近期数据重新训练，考虑在线学习或更频繁地重新训练
- **特征流水线错误：**修复流水线，验证训练/服务的一致性；如果训练数据已被污染，则重新训练
- **训练/服务偏差：**统一流水线，在训练与服务之间添加集成测试
- **模型回滚：**如果当前模型表现更差，而之前的版本运行正常，则在调查期间回滚

提供摘要：

```
## Model Evaluation Report

**Model:** [name/version] | **Status:** [healthy/degraded/broken]

### Metrics Comparison
| Metric | Baseline | Current | Delta |
|--------|----------|---------|-------|
| [metric] | [value] | [value] | [+/-] |

### Root Cause
[One-line root cause]

### Evidence
- [Finding 1]
- [Finding 2]
- [Finding 3]

### Recommended Fix
1. [Immediate action]
2. [Follow-up action]
3. [Prevention measure]

### Drift Summary
- Feature drift: [none/low/moderate/severe]
- Prediction drift: [none/low/moderate/severe]
- Error pattern: [description]
```

## 交付

如果输出超过 40 行的 CLI 限制，则使用 `/atlas-report` 并附上完整发现。HTML 报告就是输出结果。CLI 只是回执——包含框线标题、单行结论、排名前 3 的发现以及报告路径。绝不要将分析内容全部倾倒到 CLI 中。