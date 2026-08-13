---
name: "capa-officer"
description: CAPA system management for medical device QMS. Covers root cause analysis, corrective action planning, effectiveness verification, and CAPA metrics. Use when running CAPA investigations, 5-Why analysis, fishbone diagrams, root cause determination, corrective action tracking, effectiveness verification, or CAPA program optimization.
triggers:
  - CAPA investigation
  - root cause analysis
  - 5 Why analysis
  - fishbone diagram
  - corrective action
  - preventive action
  - effectiveness verification
  - CAPA metrics
  - nonconformance investigation
  - quality issue investigation
  - CAPA tracking
  - audit finding CAPA
---
# CAPA 负责人

质量管理体系中的纠正与预防措施（CAPA）管理，重点关注系统性根本原因分析、措施实施和有效性验证。

---

## 目录

- [CAPA 调查工作流程](#capa-investigation-workflow)
- [根本原因分析](#root-cause-analysis)
- [纠正措施规划](#corrective-action-planning)
- [有效性验证](#effectiveness-verification)
- [CAPA 指标与报告](#capa-metrics-and-reporting)
- [参考文档](#reference-documentation)
- [工具](#tools)

---

## CAPA 调查工作流程

从启动到关闭，系统地开展 CAPA 调查：

1. 使用客观证据记录触发事件
2. 评估重要性并确定是否有必要启动 CAPA
3. 组建具备相关专业知识的调查团队
4. 系统地收集数据和证据
5. 选择并应用适当的 RCA 方法
6. 确定根本原因并提供支持证据
7. 制定纠正措施和预防措施
8. **验证：** 根本原因能够解释所有症状；如果消除该原因，问题将不会再次发生

### CAPA 必要性判定

| 触发类型 | 是否需要 CAPA | 标准 |
|--------------|---------------|----------|
| 客户投诉（安全） | 是 | 任何涉及患者/用户安全的投诉 |
| 客户投诉（质量） | 评估 | 根据严重程度和发生频率确定 |
| 内部审核发现（重大） | 是 | 系统性失效或缺少某项要素 |
| 内部审核发现（轻微） | 建议 | 孤立疏漏或部分实施 |
| 不符合项（重复发生） | 是 | 同一类型的 NC 发生 3 次以上 |
| 不符合项（孤立发生） | 评估 | 根据严重程度和风险确定 |
| 外部审核发现 | 是 | 所有重大和轻微发现 |
| 趋势分析 | 评估 | 根据趋势的显著性确定 |

### 调查团队组成

| CAPA 严重程度 | 必需的团队成员 |
|---------------|----------------------|
| 关键 | CAPA 负责人、流程负责人、QA 经理、主题专家、管理者代表 |
| 重大 | CAPA 负责人、流程负责人、主题专家 |
| 轻微 | CAPA 负责人、流程负责人 |

### 证据收集检查清单

- [ ] 包含具体细节的问题描述（什么、哪里、何时、何人、数量多少）
- [ ] 导致问题发生的事件时间线
- [ ] 相关记录和文档
- [ ] 对相关人员的访谈记录
- [ ] 照片或实物证据（如适用）
- [ ] 相关投诉、NC 或以往的 CAPA
- [ ] 流程参数和规范

---

## 根本原因分析

根据问题特征选择并应用适当的 RCA 方法。

### RCA 方法选择决策树

```
Is the issue safety-critical or involves system reliability?
├── Yes → Use FAULT TREE ANALYSIS
└── No → Is human error the suspected primary cause?
    ├── Yes → Use HUMAN FACTORS ANALYSIS
    └── No → How many potential contributing factors?
        ├── 1-2 factors (linear causation) → Use 5 WHY ANALYSIS
        ├── 3-6 factors (complex, systemic) → Use FISHBONE DIAGRAM
        └── Unknown/proactive assessment → Use FMEA
```

### 5 Why 分析

适用场景：具有线性因果关系的单一原因问题，以及故障点明确的流程偏差。

**模板：**

```
PROBLEM: [Clear, specific statement]

WHY 1: Why did [problem] occur?
BECAUSE: [First-level cause]
EVIDENCE: [Supporting data]

WHY 2: Why did [first-level cause] occur?
BECAUSE: [Second-level cause]
EVIDENCE: [Supporting data]

WHY 3: Why did [second-level cause] occur?
BECAUSE: [Third-level cause]
EVIDENCE: [Supporting data]

WHY 4: Why did [third-level cause] occur?
BECAUSE: [Fourth-level cause]
EVIDENCE: [Supporting data]

WHY 5: Why did [fourth-level cause] occur?
BECAUSE: [Root cause]
EVIDENCE: [Supporting data]
```

**示例——校准逾期：**

```
PROBLEM: pH meter (EQ-042) found 2 months overdue for calibration

WHY 1: Why was calibration overdue?
BECAUSE: Equipment was not on calibration schedule
EVIDENCE: Calibration schedule reviewed, EQ-042 not listed

WHY 2: Why was it not on the schedule?
BECAUSE: Schedule not updated when equipment was purchased
EVIDENCE: Purchase date 2023-06-15, schedule dated 2023-01-01

WHY 3: Why was the schedule not updated?
BECAUSE: No process requires schedule update at equipment purchase
EVIDENCE: SOP-EQ-001 reviewed, no such requirement

WHY 4: Why is there no such requirement?
BECAUSE: Procedure written before equipment tracking was centralized
EVIDENCE: SOP last revised 2019, equipment system implemented 2021

WHY 5: Why has procedure not been updated?
BECAUSE: Periodic review did not assess compatibility with new systems
EVIDENCE: No review against new equipment system documented

ROOT CAUSE: Procedure review process does not assess compatibility
with organizational systems implemented after original procedure creation.
```

### 鱼骨图类别（6M）

| 类别 | 关注领域 | 典型原因 |
|----------|-------------|----------------|
| 人员（Man） | 培训、胜任能力、工作量 | 技能缺口、疲劳、沟通 |
| 机器（Machine） | 校准、维护、使用年限 | 磨损、故障、能力不足 |
| 方法（Method） | 程序、作业指导书 | 步骤不明确、控制措施缺失 |
| 材料（Material） | 规格、供应商、储存 | 不符合规格、降解、污染 |
| 测量（Measurement） | 校准、方法、结果解读 | 仪器误差、方法错误 |
| 环境（Mother Nature） | 温度、湿度、洁净度 | 环境条件超限 |

有关完整的方法详情和模板，请参阅 `references/rca-methodologies.md`。

### 根本原因验证

在继续制定行动计划之前，验证根本原因：

- [ ] 根本原因可通过客观证据验证
- [ ] 如果消除根本原因，问题将不会再次发生
- [ ] 根本原因在组织的控制范围内
- [ ] 根本原因能够解释观察到的所有症状
- [ ] 没有其他重大原因尚未得到处理

---

## 纠正措施规划

制定针对已识别根本原因的有效措施：

1. 确定立即遏制措施
2. 制定针对根本原因的纠正措施
3. 确定适用于类似流程的预防措施
4. 分配职责和资源
5. 制定包含里程碑的时间计划
6. 定义成功标准和验证方法
7. 记录在 CAPA 行动计划中
8. **验证：** 措施直接针对根本原因；成功标准可衡量

### 措施类型

| 类型 | 目的 | 时间范围 | 示例 |
|------|---------|----------|---------|
| 遏制措施 | 阻止即时影响 | 24-72 小时 | 隔离受影响产品 |
| 纠正措施 | 纠正具体发生的问题 | 1-2 周 | 返工或更换受影响物品 |
| 根本纠正措施 | 消除根本原因 | 30-90 天 | 修订程序，增加控制措施 |
| 预防措施 | 防止问题在其他领域发生 | 60-120 天 | 将解决方案扩展到类似流程 |

### 措施计划组成部分

```
ACTION PLAN TEMPLATE

CAPA Number: [CAPA-XXXX]
Root Cause: [Identified root cause]

ACTION 1: [Specific action description]
- Type: [ ] Containment [ ] Correction [ ] Corrective [ ] Preventive
- Responsible: [Name, Title]
- Due Date: [YYYY-MM-DD]
- Resources: [Required resources]
- Success Criteria: [Measurable outcome]
- Verification Method: [How success will be verified]

ACTION 2: [Specific action description]
...

IMPLEMENTATION TIMELINE:
Week 1: [Milestone]
Week 2: [Milestone]
Week 4: [Milestone]
Week 8: [Milestone]

APPROVAL:
CAPA Owner: _____________ Date: _______
Process Owner: _____________ Date: _______
QA Manager: _____________ Date: _______
```

### 措施有效性指标

| 指标 | 目标 | 危险信号 |
|-----------|--------|----------|
| 措施范围 | 完整解决根本原因 | 仅处理表面症状 |
| 具体程度 | 可衡量的交付成果 | 模糊的承诺 |
| 时间安排 | 积极但可实现 | 没有截止日期或不切实际 |
| 资源 | 已确定并分配 | 未明确说明 |
| 可持续性 | 永久性解决方案 | 临时性修复 |

---

## 有效性验证

验证纠正措施是否达到预期结果：

1. 留出充足的实施时间（至少 30-90 天）
2. 收集实施后的数据
3. 与实施前的基准进行比较
4. 根据成功标准进行评估
5. 确认验证期间未再次发生问题
6. 记录验证证据
7. 确定 CAPA 的有效性
8. **确认：**所有标准均已满足且有客观证据支持；未观察到问题再次发生

### 验证时间安排指南

| CAPA 严重程度 | 等待期 | 验证时间范围 |
|---------------|-------------|---------------------|
| 严重 | 30 天 | 实施后 30-90 天 |
| 重大 | 60 天 | 实施后 60-180 天 |
| 轻微 | 90 天 | 实施后 90-365 天 |

### 验证方法

| 方法 | 适用情形 | 所需证据 |
|--------|----------|-------------------|
| 数据趋势分析 | 可量化的问题 | 实施前后对比、趋势图 |
| 流程审计 | 程序合规性问题 | 审计检查表、访谈记录 |
| 记录审查 | 文档问题 | 记录样本、合规率 |
| 测试/检验 | 产品质量问题 | 测试结果、通过/失败数据 |
| 访谈/观察 | 培训问题 | 访谈记录、观察记录 |

### 有效性判定

```
Did recurrence occur during verification period?
├── Yes → CAPA INEFFECTIVE (re-investigate root cause)
└── No → Were all effectiveness criteria met?
    ├── Yes → CAPA EFFECTIVE (proceed to closure)
    └── No → Extent of gap?
        ├── Minor gap → Extend verification or accept with justification
        └── Significant gap → CAPA INEFFECTIVE (revise actions)
```

有关详细程序，请参阅 `references/effectiveness-verification-guide.md`。

---

## CAPA 指标与报告

通过关键指标监控 CAPA 项目的绩效。

### 关键绩效指标

| 指标 | 目标 | 计算方式 |
|--------|--------|-------------|
| CAPA 周期时间 | 平均 <60 天 | （关闭日期 - 开启日期）/ CAPA 数量 |
| 逾期率 | <10% | 逾期 CAPA 数量 / 未关闭 CAPA 总数 |
| 首次有效率 | >90% | 首次验证即有效的数量 / 已验证总数 |
| 复发率 | <5% | 复发问题数量 / 已关闭 CAPA 总数 |
| 调查质量 | 100% 根本原因已验证 | 已验证根本原因数量 / CAPA 总数 |

### 时限分析类别

| 时限区间 | 状态 | 所需措施 |
|------------|--------|-----------------|
| 0-30 天 | 进展正常 | 监控进展 |
| 31-60 天 | 监控 | 审查是否存在延迟 |
| 61-90 天 | 警告 | 上报管理层 |
| >90 天 | 严重 | 需要管理层介入 |

### 管理评审输入

CAPA 月度状态报告包括：
- 按严重程度和状态统计的未关闭 CAPA 数量
- 包含负责人的逾期 CAPA 清单
- 周期时间趋势
- 有效率趋势
- 来源分析（投诉、审计、NC）
- 改进建议

---

## 参考文档

### 根本原因分析方法

`references/rca-methodologies.md` 包含：

- 方法选择决策树
- 5 Why 分析模板和示例
- 鱼骨图类别和模板
- 用于安全关键问题的故障树分析
- 用于人员相关原因的人因分析
- 用于主动风险评估的 FMEA
- 混合方法指南

### 有效性验证指南

`references/effectiveness-verification-guide.md` 包含：

- 验证规划要求
- 验证方法选择
- 有效性标准定义（SMART）
- 按严重程度划分的关闭要求
- 无效 CAPA 处理流程
- 文档模板

---

## 工具

### CAPA 跟踪器

```bash
# Generate CAPA status report
python scripts/capa_tracker.py --capas capas.json

# Interactive mode for manual entry
python scripts/capa_tracker.py --interactive

# JSON output for integration
python scripts/capa_tracker.py --capas capas.json --output json

# Generate sample data file
python scripts/capa_tracker.py --sample > sample_capas.json
```

计算并报告：
- 汇总指标（未关闭、已关闭、逾期、周期时间、有效性）
- 状态分布
- 严重程度和来源分析
- 按时限区间划分的时限报告
- 逾期 CAPA 清单
- 可执行的建议

### CAPA 输入示例

```json
{
  "capas": [
    {
      "capa_number": "CAPA-2024-001",
      "title": "Calibration overdue for pH meter",
      "description": "pH meter EQ-042 found 2 months overdue",
      "source": "AUDIT",
      "severity": "MAJOR",
      "status": "VERIFICATION",
      "open_date": "2024-06-15",
      "target_date": "2024-08-15",
      "owner": "J. Smith",
      "root_cause": "Procedure review gap",
      "corrective_action": "Updated SOP-EQ-001"
    }
  ]
}
```

---

## 法规要求

### ISO 13485:2016 第 8.5 条

| 子条款 | 要求 | 关键活动 |
|------------|-------------|----------------|
| 8.5.2 纠正措施 | 消除不合格的原因 | 不合格审查、原因确定、措施评估、实施、有效性审查 |
| 8.5.3 预防措施 | 消除潜在不合格的原因 | 趋势分析、原因确定、措施评估、实施、有效性审查 |

### QMSR 下的 FDA CAPA 法规依据 — ISO 13485 §8.5.2/8.5.3（原 QSR 820.100，历史规定）

> **⚠️ 状态 — QMSR 过渡（2026-02-02 生效）：** FDA 的质量管理体系法规（QMSR）最终规则（89 FR 7496）修订了 21 CFR Part 820，**以引用方式纳入 ISO 13485:2016**，并移除了原 QSR 的分节结构。CAPA 条款编号 **820.100 已不再存在于 CFR 中**——下文仅将其作为熟悉的索引予以保留。目前 FDA 关于 CAPA 的法规依据是 **ISO 13485:2016 §8.5.2（纠正措施）和 §8.5.3（预防措施）**（见上方条款表），并包括保留在 **21 CFR 820.35** 中有关投诉处理的补充要求。在当前合规文档中，应引用 ISO 13485 条款，而不是 820.100。

ISO 13485 §8.5.2/§8.5.3 要求的 CAPA 要素（原 QSR 820.100，历史规定）：
- 实施纠正和预防措施的程序
- 分析质量数据来源（投诉、不合格、审核、服务记录）
- 调查不合格的原因
- 确定纠正问题并防止其再次发生所需的措施
- 验证措施有效且不会对器械产生不利影响
- 提交相关信息以供管理评审

### FDA 483 常见观察项

| 观察项 | 根本原因模式 |
|-------------|-------------------|
| 未针对重复发生的问题启动 CAPA | 未执行趋势分析 |
| 根本原因分析流于表面 | 调查培训不足 |
| 未验证有效性 | 缺少验证程序 |
| 措施未解决根本原因 | 仅处理症状，而非消除原因 |

> **决策规范：** 此技能中的工具用于规范调查流程并跟踪 CAPA 状态——它们不对 CAPA 关闭或合规性作出认证。CAPA 有效性结论和关闭决定必须由您作出，并由指定的 CAPA 负责人和质量职能部门审核及签署批准；法规分类问题（例如报告义务、21 CFR 803 MDR、21 CFR 806 下的召回）应提交法规事务部门处理。