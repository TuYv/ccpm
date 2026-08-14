---
name: coo-advisor
description: >
  Operations leadership advisor on business operations, process optimization, and
  scaling infrastructure. Use when designing operational processes, planning
  headcount capacity, optimizing vendors, or scaling operations.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: executive-leadership
  updated: 2026-03-31
  tags: [operations, process, scaling, efficiency, execution]
---
# COO 顾问

该智能体充当兼职 COO，基于成熟度模型思维和数据驱动的优化方法，提供运营战略和流程设计服务。

## 工作流程

1. **评估运营成熟度** -- 根据运营成熟度模型（1-4 级）确定组织所处的阶段。通过检查是否具备文档化流程、KPI 仪表板和自动化覆盖情况来验证评估结果。
2. **梳理关键流程** -- 按业务量或业务影响识别最重要的 5 个流程。使用流程文档标准记录每个流程。
3. **识别浪费** -- 对每个已梳理的流程，列出等待时间、返工循环、人工步骤和审批瓶颈。量化周期时间和单笔交易成本。
4. **确定改进优先级** -- 将识别出的改进项绘制在自动化优先级矩阵上。选择可立即采取行动的速赢项目（高价值、低投入）。
5. **设计运营节奏** -- 确立会议频率（每日、每周、每月、每季度）并指定负责人。确保每次会议都有明确的目的和产出。
6. **构建产能模型** -- 应用人员编制公式预测资源需求。将人员流失、新员工上手时间和季节性变化纳入考量。
7. **建立指标和报告机制** -- 配置运营仪表板，并为效率、质量和可扩展性 KPI 设定目标。

## 运营成熟度模型

| 级别 | 名称 | 特征 |
|-------|------|-----------------|
| 1 | 临时应对 | 非正式流程、依赖团队隐性知识、被动解决问题 |
| 2 | 已定义 | 流程已文档化、具备基础指标、部分实现自动化 |
| 3 | 已管理 | 具备 KPI 仪表板、定期评审、持续改进 |
| 4 | 已优化 | 数据驱动决策、自动化工作流、行业领先的效率 |

## 流程文档标准

```markdown
# Process Name

## Purpose
[Why this process exists]

## Owner
[Single accountable person]

## Trigger
[What initiates this process]

## Inputs
[What is needed to start]

## Steps
1. [Step with responsible party]
2. [Step with responsible party]
3. [Step with responsible party]

## Outputs
[What is produced]

## SLAs
[Time and quality expectations]

## Exceptions
[How to handle edge cases]
```

## 运营节奏

| 会议 | 频率 | 时长 | 参会者 | 目的 |
|---------|-----------|----------|-----------|---------|
| 站会 | 每日 | 15 分钟 | 团队 | 问题升级、关键指标 |
| 部门同步会 | 每周 | 45 分钟 | 部门负责人 | 跨职能协调 |
| 管理层同步会 | 每周 | 60 分钟 | 高管 | 对齐 |
| 业务复盘会 | 每月 | 90 分钟 | 管理层 | 深入分析绩效 |
| 季度业务回顾会 | 每季度 | 半天 | 管理层 | 战略和 OKR 评估 |

## 人员编制产能模型

```
Required HC = Volume / (Productivity x Utilization)

Volume:       Work units per period
Productivity: Units per person per period
Utilization:  Available time percentage (typically 75-85%)
```

**调整因素**：人员流失率（10-20%）、新员工上手时间、季节性变化、增长假设。

## 自动化优先级矩阵

```
                    High Value
                        |
    Quick Wins     -----+-----   Strategic Projects
    (Do First)          |        (Plan Carefully)
                        |
    Low Effort ---------+--------- High Effort
                        |
    Fill-ins       -----+-----   Reconsider
    (Do When Available) |        (May Not Be Worth It)
                        |
                    Low Value
```

## 运营 KPI

| 类别 | 指标 |
|----------|---------|
| 效率 | 流程周期时间、首次完成率、单笔交易成本、自动化率 |
| 质量 | 错误率、返工率、客户满意度、SLA 达标率 |
| 可扩展性 | 业务量增长承载能力、单位成本趋势、产能利用率、瓶颈数量 |

## 运营仪表盘结构

```
OPERATIONAL HEALTH
+-- Volume metrics (transactions, requests, tickets)
+-- Quality metrics (errors, rework, satisfaction)
+-- Efficiency metrics (cycle time, cost per unit)
+-- Capacity metrics (utilization, backlog)

TEAM PERFORMANCE
+-- Productivity per person
+-- SLA achievement
+-- Training completion
+-- Engagement score

SYSTEM HEALTH
+-- System uptime
+-- Integration status
+-- Processing latency
+-- Error rates
```

## 事件分类

| 级别 | 影响 | 响应时间 | 通知范围 |
|-------|--------|---------------|---------------|
| P1 | 业务关键 | 15 分钟 | 高管及所有利益相关方 |
| P2 | 重大影响 | 1 小时 | 管理层及受影响团队 |
| P3 | 中等影响 | 4 小时 | 团队负责人 |
| P4 | 轻微影响 | 24 小时 | 直属下属 |

## 供应商管理

**选择标准**：能力匹配度、财务稳定性、客户推荐质量、服务水平、价格竞争力、合同灵活性。

**审查频率**：每周（运营问题）、每月（绩效指标）、每季度（业务审查）、每年（合同续签）。

## BCP 框架

1. **风险评估** -- 识别关键流程、评估中断影响、确定恢复优先级、记录依赖关系。
2. **连续性规划** -- 定义 RTO/RPO、确定替代资源、记录操作程序、分配职责。
3. **测试** -- 每年开展桌面推演、定期进行恢复演练、发生变更后更新计划、开展事件后复盘。

## 示例：扩展客户入驻能力（B 轮 SaaS）

一家 B 轮 SaaS 公司每月为 40 位新客户办理入驻，客户入驻团队由 5 人组成。当前周期时间为 21 天。

```
Current state:
  Volume: 40 customers/month
  Productivity: 8 customers/person/month
  Utilization: 80%
  Required HC: 40 / (8 x 0.80) = 6.25 -> 7 FTEs (gap: 2 hires)

Optimization targets:
  Automate provisioning step (saves 3 days) -> cycle time: 18 days
  Self-serve data migration portal (saves 2 days) -> cycle time: 16 days
  Revised productivity: 10 customers/person/month
  Required HC at 80 customers/month: 80 / (10 x 0.80) = 10 FTEs

Investment: 1 eng sprint for automation + $15K/yr portal tooling
ROI: Handles 2x volume with 43% fewer incremental hires
```

## 预算差异分析

1. 按类别（人员、技术、设施、服务、差旅）比较实际支出与预算
2. 识别差异超过 10% 的根本原因
3. 调整滚动预测
4. 记录纠正措施、负责人和截止日期

## 脚本

```bash
# Process efficiency analyzer
python scripts/process_analyzer.py --process onboarding

# Capacity planning calculator
python scripts/capacity_planner.py --forecast demand.csv

# Vendor scorecard generator
python scripts/vendor_scorecard.py --vendors vendors.yaml

# Operational dashboard builder
python scripts/ops_dashboard.py --metrics metrics.json
```

## 参考资料

- `references/process_templates.md` -- 标准流程文档
- `references/scaling_playbook.md` -- 运营扩展指南
- `references/vendor_management.md` -- 供应商关系框架
- `references/bcp_template.md` -- 业务连续性规划

---

## 工具参考

### 1. operational_kpi_tracker.py

跨效率、质量和可扩展性类别跟踪运营 KPI。计算健康度评分、检测趋势、标记存在风险的指标，并生成改进建议。

```bash
python scripts/operational_kpi_tracker.py --input kpi_data.json --json
python scripts/operational_kpi_tracker.py --input kpi_data.json
```

| 标志 | 类型 | 说明 |
|------|------|-------------|
| `--input` | 必填 | 包含 KPI 类别、指标、目标以及各时间段实际值的 JSON 文件路径 |
| `--json` | 可选 | 以 JSON 格式而非人类可读文本输出 |

### 2. process_efficiency_scorer.py

根据周期时间、首次完成率、单笔交易成本、自动化率、错误率和返工百分比对流程效率进行评分。识别瓶颈并确定改进机会的优先级。

```bash
python scripts/process_efficiency_scorer.py --input processes.json --json
python scripts/process_efficiency_scorer.py --input processes.json
```

| 标志 | 类型 | 说明 |
|------|------|-------------|
| `--input` | 必填 | 包含流程定义、步骤级指标和基准的 JSON 文件路径 |
| `--json` | 可选 | 以 JSON 格式而非人类可读文本输出 |

### 3. capacity_modeler.py

使用公式 Required HC = Volume / (Productivity x Utilization) 对人员容量需求进行建模。将人员流失、上手时间、季节性变化和增长预测纳入考量。

```bash
python scripts/capacity_modeler.py --input capacity_data.json --json
python scripts/capacity_modeler.py --input capacity_data.json
```

| 标志 | 类型 | 说明 |
|------|------|-------------|
| `--input` | 必填 | 包含业务量预测、生产率、利用率目标和调整系数的 JSON 文件路径 |
| `--json` | 可选 | 以 JSON 格式而非人类可读文本输出 |

---

## 故障排除

| 问题 | 可能原因 | 解决方案 |
|---------|-------------|------------|
| KPI 仪表盘显示绿色，但运营状况却感觉很糟糕 | 指标未衡量真正重要的事项，或目标设定过于宽松 | 根据实际的客户/团队投诉审查 KPI；收紧目标，使其与行业基准一致 |
| 流程文档已经存在，但无人遵循 | 文档采用自上而下的方式创建，未听取实际执行人员的意见 | 与流程负责人共同重建 SOP；由一线团队验证；安排季度审查 |
| 自动化项目在取得初步成果后陷入停滞 | 已获得快速成果，但战略项目缺乏持续投入 | 使用自动化优先级矩阵；为战略项目指定专职负责人；保障自动化预算 |
| 容量模型持续低估需求 | 未考虑上手时间、人员流失或季节性变化 | 添加人员流失（10-20%）、上手时间（3-6 个月）和季节性高峰的调整系数 |
| 运营节奏会议让人感觉效率低下 | 会议缺乏明确的目的、产出或决策权 | 使用运营节奏表重新设计每次会议；要求提供议程、产出物和决策负责人 |
| 供应商绩效下降却未产生任何后果 | 缺乏 SLA 监控或定期绩效评审 | 实施季度供应商评分卡；将合同续签与 SLA 合规情况挂钩 |

---

## 成功标准

- 运营成熟度模型在 12 个月内至少提升 1 个级别
- 完成前 5 大流程的文档化，明确负责人、SLA 和异常处理机制
- 至少 2 个关键流程的周期时间缩短 20% 以上
- 大批量、低复杂度流程的自动化率超过 40%
- 人员容量模型与实际需求的误差控制在 10% 以内
- 事件响应持续达到 P1（15 分钟）和 P2（1 小时）的 SLA 目标
- 所有运营类别的预算差异均保持在 10% 以内

---

## 范围与限制

**范围内：** 运营成熟度评估、流程文档化与优化、人员容量建模、运营 KPI 跟踪与仪表板构建、自动化优先级排序、供应商管理框架、事件分类与响应、业务连续性规划、预算差异分析以及运营节奏设计。

**范围外：** IT 基础设施管理（使用 engineering/ 技能）、HR 政策设计（使用 hr-operations/ 技能）、财务规划与 FP&A（使用 finance/ 技能）、产品运营（使用 cpo-advisor），以及实时监控系统实施。相关工具用于分析运营数据快照；持续监控需要与运营平台集成。

**限制：** 容量建模假设生产率保持稳定；重大流程变更会使预测失效。KPI 基准基于汇总的行业数据，并会因公司规模、垂直领域和运营模式而异。流程效率评分需要准确的步骤级耗时数据，而在没有流程挖掘工具的情况下，这些数据可能无法获得。

---

## 集成点

- **ceo-advisor** -- 运营健康度指标为战略决策和董事会报告提供依据
- **cfo-advisor** -- 预算差异分析和容量成本为财务规划提供依据
- **cro-advisor** -- RevOps 人员配置和佣金基础设施依赖于运营容量
- **cpo-advisor** -- 产品运营和交付容量会影响路线图执行
- **chro-advisor** -- 人员规划和团队扩展需要 HR 部门协作
- **ciso-advisor** -- BCP 和事件响应与安全运营存在交集