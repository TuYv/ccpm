---
name: ceo-advisor
description: >
  Executive leadership guidance for strategic decisions, org development, and
  stakeholder management. Use when planning strategy, preparing board
  presentations, managing investors, or making executive decisions.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: c-level
  domain: ceo-leadership
  updated: 2025-10-20
  python-tools: strategy_analyzer.py, financial_scenario_analyzer.py
  frameworks: executive-decision-framework, board-governance, investor-relations
---
# CEO 顾问

面向首席执行官领导力、组织转型和利益相关者管理的战略框架与工具。

## 关键词
CEO、首席执行官、高管领导力、战略规划、董事会治理、投资者关系、董事会会议、董事会演示、财务建模、战略决策、组织文化、公司文化、领导力发展、利益相关者管理、高管战略、危机管理、组织转型、投资者动态、战略举措、公司愿景

## 快速开始

### 战略规划
```bash
python scripts/strategy_analyzer.py
```
分析战略定位并生成可执行的建议。

### 财务情景
```bash
python scripts/financial_scenario_analyzer.py
```
使用风险调整后的预测对不同业务情景进行建模。

### 决策制定
查看 `references/executive_decision_framework.md`，了解结构化决策流程。

### 董事会管理
使用 `references/board_governance_investor_relations.md` 中的模板准备董事会材料。

### 文化建设
实施 `references/leadership_organizational_culture.md` 中的框架以推动转型。

## CEO 的核心职责

### 1. 愿景与战略

#### 确定方向
- **愿景制定**：定义未来 10 年的宏伟愿景
- **使命阐述**：明确目标以及我们存在的原因
- **战略制定**：确定未来 3-5 年的竞争定位
- **价值观定义**：明确核心信念和原则

#### 战略规划周期
```
Q1: Environmental Scan
- Market analysis
- Competitive intelligence
- Technology trends
- Regulatory landscape

Q2: Strategy Development
- Strategic options generation
- Scenario planning
- Resource allocation
- Risk assessment

Q3: Planning & Budgeting
- Annual operating plan
- Budget allocation
- OKR setting
- Initiative prioritization

Q4: Communication & Launch
- Board approval
- Investor communication
- Employee cascade
- Partner alignment
```

### 2. 资本与资源管理

#### 资本配置框架
```python
# Run financial scenario analysis
python scripts/financial_scenario_analyzer.py

# Allocation priorities:
1. Core Operations (40-50%)
2. Growth Investments (25-35%)
3. Innovation/R&D (10-15%)
4. Strategic Reserve (10-15%)
5. Shareholder Returns (varies)
```

#### 融资战略
- **种子轮/A 轮**：专注于产品与市场的契合
- **B 轮/C 轮**：加速增长
- **后期阶段**：拓展市场
- **IPO**：进入公开市场
- **债务融资**：以非稀释性方式支持增长

### 3. 利益相关者领导力

#### 利益相关者优先级矩阵
```
         Influence →
         Low        High
    High ┌─────────┬─────────┐
Interest │ Keep    │ Manage  │
    ↑    │Informed │ Closely │
         ├─────────┼─────────┤
    Low  │Monitor  │  Keep   │
         │         │Satisfied│
         └─────────┴─────────┘

Primary Stakeholders:
- Board of Directors
- Investors
- Employees
- Customers

Secondary Stakeholders:
- Partners
- Community
- Media
- Regulators
```

### 4. 组织领导力

#### 文化建设
摘自 `references/leadership_organizational_culture.md`：

**文化转型时间表**：
- 第 1-2 个月：评估
- 第 2-3 个月：设计
- 第 4-12 个月：实施
- 第 12 个月以后：固化

**关键杠杆**：
- 领导层示范
- 沟通
- 系统一致性
- 认可
- 问责

### 5. 对外代表

#### CEO 沟通日程

**每日**：
- 客户接触
- 团队例行沟通
- 指标审查

**每周**：
- 高管团队会议
- 向董事会成员汇报最新情况
- 与关键客户/合作伙伴通话
- 媒体露出机会

**每月**：
- 全员大会
- 董事会报告
- 投资者动态更新
- 行业交流

**每季度**：
- 董事会会议
- 财报电话会议
- 战略审查
- 员工大会

## 高管工作惯例

### CEO 每日日程模板

```
6:00 AM - Personal development (reading, exercise)
7:00 AM - Day planning & priority review
8:00 AM - Metric dashboard review
8:30 AM - Customer/market intelligence
9:00 AM - Strategic work block
10:30 AM - Meetings block
12:00 PM - Lunch (networking/thinking)
1:00 PM - External meetings
3:00 PM - Internal meetings
4:30 PM - Email/communication
5:30 PM - Team walk-around
6:00 PM - Transition/reflection
```

### 每周领导工作节奏

**星期一**：战略与规划
- 高管团队会议
- 指标审查
- 每周规划

**星期二**：外部事务
- 客户会议
- 合作伙伴讨论
- 投资者关系

**星期三**：运营
- 深入分析
- 解决问题
- 流程审查

**星期四**：人才与文化
- 一对一会议
- 人才评审
- 文化建设举措

**星期五**：创新与未来
- 战略项目
- 学习时间
- 提前规划

## CEO 关键决策

### 推进/不推进决策框架

使用 `references/executive_decision_framework.md` 中的框架：

**需要使用框架的重大决策**：
- 并购机会
- 市场扩张
- 重大转型
- 大额投资
- 重组
- 领导层变动

**决策检查清单**：
- [ ] 问题已明确定义
- [ ] 已收集数据/证据
- [ ] 已评估备选方案
- [ ] 已征询利益相关者意见
- [ ] 已评估风险
- [ ] 已制定实施计划
- [ ] 已定义成功指标
- [ ] 已准备沟通方案

### 危机管理

#### 危机领导行动手册

**一级危机**（部门级）
- 监控事态
- 按需提供支持
- 事后复盘

**二级危机**（公司级）
- 启动危机应对团队
- 领导应对工作
- 频繁沟通

**三级危机**（生存级）
- 直接接管
- 董事会介入
- 全员集中应对
- 对外沟通

## 董事会管理

### 成功召开董事会会议

摘自 `references/board_governance_investor_relations.md`：

**准备时间表**：
- T-4 周：制定议程
- T-2 周：准备材料
- T-1 周：分发资料包
- T-0：召开会议

**董事会资料包组成**：
1. CEO 致函（1-2 页）
2. 仪表板（1 页）
3. 财务审查（5 页）
4. 战略进展（10 页）
5. 风险登记册（2 页）
6. 附录

### 管理董事会动态

**建立信任**：
- 定期沟通
- 不制造意外
- 保持透明
- 贯彻落实
- 尊重专业知识

**艰难对话**：
- 充分准备
- 以事实为先
- 主动承担责任
- 提出解决方案
- 寻求共识

## 投资者关系

### 投资者沟通

**财报周期**：
1. 公告前静默期
2. 发布财报
3. 电话会议
4. 后续会议
5. 参加行业会议

**关键信息**：
- 增长轨迹
- 竞争地位
- 财务表现
- 战略进展
- 未来展望

### 卓越融资

**路演材料结构**：
1. 问题（1 页）
2. 解决方案（1-2 页）
3. 市场（1-2 页）
4. 产品（2-3 页）
5. 商业模式（1 页）
6. 市场进入策略（1-2 页）
7. 竞争（1 页）
8. 团队（1 页）
9. 财务数据（2 页）
10. 融资需求（1 页）

## 绩效管理

### 公司记分卡

**财务指标**：
- 收入增长
- 毛利率
- EBITDA
- 现金流
- 现金续航期

**客户指标**：
- 客户获取
- 客户留存
- NPS
- LTV/CAC

**运营指标**：
- 生产力
- 质量
- 效率
- 创新

**人才指标**：
- 敬业度
- 留任率
- 多元化
- 发展

### CEO 自我评估

**季度复盘**：
- 哪些方面做得好？
- 哪些方面可以改进？
- 有哪些关键经验？
- 需要对优先事项做出哪些调整？

**年度 360 度评估**：
- 董事会反馈
- 高管团队意见
- 跨级洞察
- 自我评估
- 发展计划

## 继任规划

### CEO 继任时间表

**持续进行**：
- 识别内部候选人
- 培养高潜力人才
- 开展外部对标

**提前 3 年**：
- 制定正式继任计划
- 评估候选人
- 加速人才发展

**提前 1 年**：
- 最终选定人选
- 规划交接
- 制定沟通策略

**交接**：
- 知识转移
- 利益相关者关系交接
- 渐进式过渡

## 个人发展

### CEO 学习计划

**核心能力**：
- 战略思维
- 财务敏锐度
- 领导者风范
- 沟通
- 决策

**发展活动**：
- 高管教练
- 同行交流（YPO/EO）
- 担任董事
- 参与行业活动
- 持续教育

### 工作与生活的融合

**可持续实践**：
- 保障家庭时间
- 坚持锻炼
- 获取心理健康支持
- 规划休假
- 严格落实授权

**精力管理**：
- 了解自己的高效时段
- 预留深度工作时间
- 批量处理同类任务
- 适时休息
- 每日反思

## 工具与资源

### CEO 必备工具

**战略与规划**：
- 战略框架（Porter、BCG、McKinsey）
- 情景规划工具
- OKR 管理系统

**财务管理**：
- 财务建模
- 股权结构表管理
- 投资者 CRM

**沟通**：
- 董事会门户
- 投资者关系平台
- 员工沟通工具

**个人生产力**：
- 日历管理
- 任务管理
- 笔记系统

### 关键资源

**书籍**：
- 《从优秀到卓越》— Jim Collins
- 《创业维艰》— Ben Horowitz
- 《高产出管理》— Andy Grove
- 《精益创业》— Eric Ries

**框架**:
- 待办任务理论
- 蓝海战略
- 平衡计分卡
- OKR

**人脉网络**:
- YPO（青年总裁组织）
- EO（企业家组织）
- 行业协会
- CEO 同行小组

## 成功指标

### CEO 效能指标

✅ **战略成功**
- 愿景清晰并获得认同
- 战略执行进展顺利
- 市场地位不断提升
- 创新储备充足

✅ **财务成功**
- 达成营收增长目标
- 盈利能力不断提升
- 现金状况稳健
- 估值持续增长

✅ **组织成功**
- 文化蓬勃发展
- 人才得到留任
- 敬业度高
- 继任计划就绪

✅ **利益相关者成功**
- 董事会信心充足
- 投资者满意
- 客户 NPS 表现强劲
- 员工认可度高

## 危险信号

⚠️ 持续未能达成目标  
⚠️ 高管离职率高  
⚠️ 与董事会关系紧张  
⚠️ 企业文化恶化  
⚠️ 市场份额下降  
⚠️ 现金消耗增加  
⚠️ 创新陷入停滞  
⚠️ 出现个人倦怠迹象

---

## 工具参考

### strategy_analyzer.py

从 5 个支柱（市场地位、财务健康、卓越运营、组织能力、增长潜力）全面分析战略地位。应用波特五力模型、SWOT 和 BCG 矩阵。

```bash
# Run with demo data
python scripts/strategy_analyzer.py

# Run with custom company data (JSON)
python scripts/strategy_analyzer.py < company_data.json
```

**输入格式**：包含 `market_position`、`financial_health`、`organizational_capability`、`growth_potential`、`competitive_forces` 对象的 JSON。每个对象均包含各因素的评分（0-100）。

**输出**：战略健康度评分（0-100）、支柱层级分析、按优先级排序的战略选项、风险评估以及四阶段路线图。

### financial_scenario_analyzer.py

使用 NPV、IRR、盈亏平衡分析和风险调整后回报，对多个财务情景进行建模。

```bash
# Run with demo scenarios
python scripts/financial_scenario_analyzer.py

# Run with custom base case and scenarios (JSON)
python scripts/financial_scenario_analyzer.py < scenarios.json
```

**输入格式**：包含 `base_case`（revenue、cogs、operating_expenses、cash、burn_rate、valuation）和 `scenarios` 数组（每个元素包含 name、probability、growth_model、growth_rate、changes）的 JSON。

**输出**：基准情景摘要、各情景预测（3 年）、NPV、IRR、盈亏平衡月份、风险调整后的预期价值以及推荐情景。

---

## 故障排除

| 问题 | 可能原因 | 解决方法 |
|---------|-------------|-----|
| 战略分析将所有支柱均评为“Adequate”（50） | 由于未提供数据，使用了默认评分 | 提供实际的支柱数据；默认值会掩盖真正的优势和劣势 |
| 董事会对 CEO 汇报失去信心 | 汇报内容含糊或遗漏关键指标 | 使用三句话高管摘要格式；以数字开篇，而不是叙述 |
| 已有战略计划，但执行陷入停滞 | 缺少 OKR 级联或问责机制 | 将战略与季度重点任务关联；在 L10 会议中每周复盘 |
| 投资者汇报引发的问题多于其解答的问题 | 缺少关键指标或叙事不清晰 | 遵循月度指标包模板；对每项未达标指标都提供差异说明 |
| 危机响应被动且混乱 | 缺少预先定义的严重程度等级或响应手册 | 实施三级危机框架；每季度开展桌面推演 |
| 文化举措无法持续落地 | 缺少强化机制；被视为一次性活动 | 将文化指标纳入绩效评估；CEO 公开示范相关行为 |
| 董事会会议准备总是拖到最后一刻 | 缺少结构化的倒计时时间线 | 实施从 T-14 到 T-0 的准备工作流程；指定 Chief of Staff 为负责人 |

---

## 成功标准

- 战略健康评分逐季度提升（通过 strategy_analyzer.py 跟踪）
- 董事会信心评分保持在 8+/10（非正式季度反馈）
- 在月末结账后 24 小时内发送投资者更新，且数据零差异
- 危机响应时间：一级危机在 24 小时内响应，二级危机在 4 小时内响应，三级危机立即响应
- 高管团队协同一致：90% 以上的管理层能够一致地阐述公司最重要的 3 项优先事项
- 为 CEO 及其所有直接下属制定继任计划，并每年审查
- CEO 时间分配：40% 以上用于战略工作，用于运营救火的时间少于 25%

---

## 范围与限制

**范围内**：战略规划框架、财务情景建模、董事会治理、投资者关系、危机管理、文化建设、CEO 工作惯例与决策框架。

**范围外**：法律建议、监管申报、实际融资执行、框架之外的个人辅导、特定行业的竞争情报、董事会成员招募。

**限制**：战略分析器采用加权评分，简化了复杂的战略现实。财务情景模型采用简化的增长预测——仅用于指示方向，并非精确预测。危机应对手册提供结构化指导，但无法预测具体的危机场景。

---

## 集成点

| 技能 | 集成方式 |
|-------|-------------|
| `cfo-advisor` | 财务情景、融资战略、董事会材料中的财务部分 |
| `board-deck-builder` | 董事会演示文稿中的执行摘要和战略展望部分 |
| `board-meeting` | CEO 主导第一阶段的背景说明和第五阶段的综合审查 |
| `chief-of-staff` | 分派战略问题；综合多位顾问的输出 |
| `company-os` | CEO 设定愿景，为一年期计划和季度重点目标提供依据 |
| `culture-architect` | 文化转型框架；将价值观转化为行为 |
| `founder-coach` | CEO 个人发展与领导力演进 |
| `strategic-alignment` | 验证从愿景到团队级 OKR 的目标级联 |