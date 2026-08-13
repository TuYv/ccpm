---
name: "business-growth-skills"
description: "Router/index for the 4 business & growth skills bundled in this plugin: customer-success-manager (health scoring, churn risk, expansion), sales-engineer (RFP analysis, competitive matrices, PoC planning), revenue-operations (pipeline, forecast accuracy, GTM efficiency), and contract-and-proposal-writer. Use when a growth/revenue request doesn't obviously match one skill and you need to pick the right one (e.g., 'which accounts are at risk', 'should we bid on this RFP')."
version: 2.9.0
author: Alireza Rezvani
license: MIT
tags:
  - business
  - customer-success
  - sales
  - revenue-operations
  - growth
agents:
  - claude-code
  - codex-cli
  - openclaw
---
# 业务与增长技能 — 路由器

此插件包含 **4 个技能**（此路由器是 `business-growth/skills/` 下的第 5 个文件夹）。每个技能都是自包含的。

## 路由表

匹配请求，然后加载 `business-growth/skills/<skill>/SKILL.md`。如果匹配多行，请先提出一个澄清问题。

| 请求信号 | 技能 | 路径 |
|---|---|---|
| 客户健康评分、流失风险、扩展策略 | customer-success-manager | `skills/customer-success-manager/` |
| RFP/RFI 覆盖、竞争定位、PoC 计划 | sales-engineer | `skills/sales-engineer/` |
| 销售管道覆盖率、预测准确性（MAPE）、GTM 效率 | revenue-operations | `skills/revenue-operations/` |
| 提案、合同、工作说明书、DPA | contract-and-proposal-writer | `skills/contract-and-proposal-writer/` |

## 快速开始

```bash
# Example: route an account-health request
cat business-growth/skills/customer-success-manager/SKILL.md
python3 business-growth/skills/customer-success-manager/scripts/health_score_calculator.py --help
```

## 规则

- 仅路由到一个技能，然后遵循该技能的工作流。此路由器本身不提供任何工具。
- 使用各技能的 Python 评分器计算指标，不要手动估算；交易/合同输出均为草稿，须由法务/商务人员审核。