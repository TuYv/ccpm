---
name: kanchi-dividend-review-monitor
description: Monitor dividend portfolios with Kanchi-style forced-review triggers (T1-T5) and convert anomalies into OK/WARN/REVIEW states without auto-selling. Use when users ask for 減配検知, 8-Kガバナンス監視, 配当安全性モニタリング, REVIEWキュー自動化, or periodic dividend risk checks.
---
# Kanchi 股息复核监控器

## 概述

检测异常的股息风险信号，并将其路由到人工复核队列。
将自动化视为异常检测，而非自动交易执行。

## 何时使用

当用户需要以下功能时使用本技能：
- 针对股息持仓的每日/每周/每季度异常检测。
- 针对 T1–T5 风险触发的强制复核排队。
- 与投资组合股票代码关联的 8-K/公司治理关键字扫描。
- 在人工决策前输出确定性的 `OK/WARN/REVIEW` 结果。

## 前置条件

提供符合以下规范的归一化输入 JSON：
- `references/input-schema.md`

如果上游数据不可用，至少提供：
- `ticker`
- `instrument_type`
- `dividend.latest_regular`
- `dividend.prior_regular`

## 不可违背的规则

绝不仅凭机器触发就自动卖出。
必须先创建 `WARN` 或 `REVIEW` 证据供人工确认。

## 状态机

- `OK`：无需操作。
- `WARN`：加入下一个检查周期，并暂停可选加仓。
- `REVIEW`：立即创建人工复核工单 + 暂停加仓。

触发阈值和对应操作请使用 `references/trigger-matrix.md`。

### 股息持平时的派息节奏注意事项

当 T6 仅由 `freeze_flag` / 最新常规股息与上期常规股息相等所驱动时，应将其视为用于派息节奏确认的 `WARN`，而非股息恶化的证明。许多按季度派息的公司在年度上调周期之间会连续多个季度重复相同的股息。在报告中，请表述为“确认下一次股息增长节奏 / 核查前暂停可选加仓”，并避免暗示股息削减或投资逻辑失效，除非 T1/T2/T3/T4/T5 证据也支持升级处理。

## 监控节奏

- 每日：
  - T1 股息削减/暂停。
  - T4 SEC 文件关键字扫描（以 8-K 为主）。
- 每周：
  - T3 委托书信用压力检查。
- 每季度：
  - T2 覆盖率恶化与 T5 结构性衰退评分。

## 工作流程

### 1) 归一化输入数据集

在一份 JSON 文档中按股票代码收集以下字段：
- 股息数据点（最新常规股息、上期常规股息、缺失/为零标志）。
- 覆盖率字段（FCF 或 FFO 或 NII、已付股息、比率历史）。
- 资产负债表趋势字段（净债务、利息覆盖、回购/股息）。
- 文件文本片段（尤其是近期的 8-K 或等同的警示文本）。
- 经营趋势字段（营收 CAGR、利润率趋势、指引趋势）。

字段定义和示例载荷请使用 `references/input-schema.md`。

### 2) 运行规则引擎

运行：

```bash
python3 skills/kanchi-dividend-review-monitor/scripts/build_review_queue.py \
  --input /path/to/monitor_input.json \
  --output-dir reports/
```

该脚本基于 T1–T5 将每只股票代码映射为 `OK/WARN/REVIEW`。
输出文件以带日期的文件名保存到指定目录（例如 `review_queue_20260227.json` 和 `.md`）。

### 3) 优先级排序与去重

如果多个触发器同时命中：
- 保留所有发现结果以供审计留痕。
- 仅将最终状态升级到最高严重级别。
- 将触发原因存储为单行证据。

### 4) 生成人工复核工单

对每个 `REVIEW` 股票代码，需包含：
- 触发器 ID 及证据。
- 疑似失效模式。
- 下一步决策所需的人工核查项。

使用 `references/review-ticket-template.md` 的输出格式。

## SEC 文件抓取护栏

在实现实时 SEC 抓取器时：
- 包含合规的 `User-Agent` 字符串（姓名 + 邮箱）。
- 使用缓存和限流。
- 遵守 SEC 公平访问指引。
- 在上游文件片段为空的定期投资组合复核中，使用 SEC `company_tickers.json` 加上 `https://data.sec.gov/submissions/CIK##########.json` 枚举每个持仓的近期 8-K / 8-K/A 文件，然后扫描主要申报文件以查找 T4 关键字族（`Item 4.02`、non-reliance、restatement、material weakness、SEC investigation、subpoena、going concern、auditor resignation、internal control）。记录扫描时间窗口、近期 8-K 数量以及是否发现命中。将“未命中关键字”视为窄范围的 T4 扫描结果，而非完整的治理合规确认。

## 输出契约

始终返回：
1. 包含汇总计数和股票代码级发现结果的队列 JSON。
2. 用于快速分诊的 Markdown 仪表盘。
3. 需要立即处理的 `REVIEW` 工单列表。

## 多技能协作

- 从 `kanchi-dividend-sop` 获取股票代码范围和基线假设。
- 将 `REVIEW` 结果回传给 `kanchi-dividend-sop`，用于重新承保和仓位规模复核。
- 当风险事件意味着账户迁移决策时，与 `kanchi-dividend-us-tax-accounting` 共享账户类型上下文。

## 资源

- `scripts/build_review_queue.py`：面向 T1–T5 的本地规则引擎。
- `scripts/tests/test_build_review_queue.py`：针对 T1–T5 和报告渲染的单元测试。
- `references/trigger-matrix.md`：触发器定义、节奏和操作。
- `references/input-schema.md`：归一化输入模式和示例 JSON。
- `references/review-ticket-template.md`：标准化的人工复核工单版式。
