---
name: finance-ops
description: "AI-powered financial analysis suite. Generates executive CFO briefings from QuickBooks exports (P&L, Balance Sheet, General Ledger, Cash Flow, etc.) with anomaly detection, burn rate, runway analysis, and scenario modeling. Also estimates codebase development costs with organizational overhead and AI ROI analysis. Triggers on: 'CFO briefing', 'financial analysis', 'cost briefing', 'expense review', 'runway analysis', 'burn rate', 'cost estimate', 'how much would this cost to build', 'development cost', 'Claude ROI'."
---
## 前置脚本（技能启动时运行）

```bash
# Version check (silent if up to date)
python3 telemetry/version_check.py 2>/dev/null || true

# Telemetry opt-in (first run only, then remembers your choice)
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

> **隐私：** 此技能会在本地将使用情况记录到 `~/.ai-marketing-skills/analytics/`。远程遥测仅在选择加入后启用。绝不会收集代码、文件路径或仓库内容。请参阅 `telemetry/README.md`。

---

# AI 财务运营

两个工具：CFO 简报生成器和代码库成本估算器。

---

## 工具 1：CFO 简报生成器

根据 QuickBooks 导出文件生成高管财务摘要。

### 工作流程

#### 1. 导入文件

将 QuickBooks 导出文件（CSV、XLSX、XLS）放入工作目录。支持的报表类型如下（可使用任意子集——仅有损益表也足够）：

- **损益汇总表** — 收入、销售成本、费用、净利润（最重要）
- **按客户划分的损益表** — 按客户细分收入
- **损益明细表** — 交易级明细（XLSX）
- **资产负债表** — 资产、负债、所有者权益
- **总账** — 所有账户交易
- **按供应商划分的费用** — 供应商级费用明细
- **按供应商划分的交易列表** — 供应商交易明细
- **账单付款** — 应付账款付款历史
- **现金流量表** — 经营、投资和融资现金流（XLSX）
- **账户列表** — 会计科目表

#### 2. 运行分析

```bash
python3 scripts/cfo-analyzer.py --input ./data/uploads/ [--period YYYY-MM]
```

选项：
- `--input DIR` — 包含 QB 导出文件的目录
- `--period YYYY-MM` — 覆盖期间标签（默认：从文件中自动检测）
- `--history DIR` — 用于环比比较的历史记录目录（默认：`./data/history/`）
- `--no-history` — 跳过保存到历史记录

该脚本会：
1. 通过扫描表头自动检测文件类型
2. 将每个文件解析为结构化数据
3. 计算所有 KPI（定义和健康范围请参阅 `references/metrics-guide.md`）
4. 从历史记录中加载上一期间的数据以进行环比比较
5. 将当前期间的数据保存到历史记录
6. 将格式化的高管摘要输出到标准输出

#### 3. 情景建模（可选）

运行 CFO 分析后，对基准、乐观和悲观情景进行建模：

```bash
python3 scripts/scenario-modeler.py --input ./data/financial-latest.json
```

这会针对以下情景生成 12 个月的预测：
- **基准情景** — 当前趋势持续
- **乐观情景** — 实现增长目标（新产品收入 + 新客户）
- **悲观情景** — 失去主要客户

#### 4. 交付摘要

该脚本会输出带有表情符号状态指示器（🟢🟡🔴）的格式化简报，适用于 Slack、电子邮件或任何消息传递界面。

### 文件格式详情

有关预期的 CSV/XLSX 列格式和检测启发式方法，请参阅 `references/quickbooks-formats.md`。

### 指标阈值

有关健康范围、红/黄/绿阈值和基准背景信息，请参阅 `references/metrics-guide.md`。请根据你的企业规模和类型调整阈值。

---

## 工具 2：代码库成本估算器

估算代码库的完整开发成本。

### 工作流程

#### 第 1 步：分析代码库

阅读整个代码库。统计各语言/类型的代码总行数，并评估架构复杂度、高级功能、测试覆盖率和文档质量。

#### 第 2 步：计算开发工时

应用 `references/rates.md` 中的生产率。计算每种代码类型的基础工时，然后应用架构、调试、评审、文档、集成和学习曲线方面的开销乘数。

#### 第 3 步：调研市场费率

使用 Web 搜索查找相关专业领域当前的小时费率。针对项目的技术栈构建包含低位数 / 中位数 / 高位数的费率表。

#### 第 4 步：计算组织开销

使用 `references/org-overhead.md` 中的效率系数，将原始开发工时转换为日历时间。展示不同公司类型（从个人开发者到大型企业）的估算结果。

#### 第 5 步：计算完整团队成本

应用 `references/team-cost.md` 中的辅助角色比例和团队乘数。展示按角色划分的明细，以及涵盖所有公司阶段的汇总。

#### 第 6 步：生成成本估算

使用 `references/output-template.md` 中的模板输出完整估算。包括所有部分：代码库指标、开发工时、日历时间、市场费率、工程成本、完整团队成本、总计摘要和假设。

#### 第 7 步：AI 投资回报率分析（可选）

如果代码库是在 AI 辅助下构建的，则使用 `references/claude-roi.md` 计算每 AI 小时创造的价值。通过 Git 历史记录聚类确定有效工时，计算相对于人类开发者的速度倍数，并计算成本节省和投资回报率。

### 核心原则

- 以专业方式呈现，适合利益相关者阅读
- 包含置信度（低/中/高）和关键假设
- 突出显示推高成本的最高复杂度领域
- 始终展示范围（低/平均/高），绝不只给出单一数字
- 搜索当前年份的市场费率，不要使用过时数据