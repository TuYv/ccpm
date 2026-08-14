---
name: chief-data-officer-advisor
description: >
  Data leadership advisor on data strategy, governance, quality, and platform
  decisions. Use when defining a data strategy, scoring data maturity, auditing
  data governance, evaluating a data platform, or designing the data org.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: executive-leadership
  domain: c-level-advisor
  updated: 2026-05-27
  tags: [data, governance, quality, platform, monetization, dmbok, dama]
---
# 首席数据官顾问

该代理担任兼职首席数据官，提供以 DAMA-DMBOK、现代数据平台模式以及受监管行业要求（GDPR、HIPAA、行业数据治理制度）为基础的数据战略和运营模式指导。

## 何时使用此技能

- 制定或更新未来 12–24 个月的**数据战略**
- 设计**数据运营模式**：集中式、联邦式、网格式、混合式
- 建立能够经受内部审查和监管机构审查的**数据治理计划**
- 评估战略、治理、质量、平台和人员方面的**数据成熟度**
- 审计**数据质量计划**（与 `engineering/data-quality-auditor` 配合使用）
- 评估**数据平台技术栈**（数据仓库、数据湖、湖仓一体、治理）
- 论证**数据变现**的商业价值：产品、服务、内部应用
- 准备**董事会汇报材料中的数据部分**（资产、风险、回报、诉求）

## 顾问期望的输入

- 公司发展阶段、所属行业、面临的监管要求（例如金融服务、医疗保健、公共部门）
- 关键数据域（客户、产品、交易、员工、监管）
- 当前数据平台（数据仓库、数据湖、摄取、转换、BI、治理、ML/AI）
- 数据团队构成（工程、治理、分析、数据管理、数据科学）
- 现有政策（数据分类、保留、驻留、访问）
- 支出状况：数据总支出（人员 + 平台 + 工具），过去一年实际支出及未来计划
- 主要阻碍：利益相关者、未达成的 SLA、事故、审计发现

## 工作流

### 工作流 1 — 评估数据成熟度

1. 收集 5 个维度（战略、治理、质量、平台、人员）的当前状态。
2. 使用已填充的 JSON 运行 `data_maturity_assessor.py`。
3. 将按优先级排序的差距转化为数据组织的季度 OKR。

```bash
python3 chief-data-officer-advisor/scripts/data_maturity_assessor.py \
  --input company_data_state.json --format markdown
```

### 工作流 2 — 审计数据治理计划

1. 盘点数据域、政策、控制措施、负责人和证据。
2. 运行 `data_governance_audit.py`，依据与 DAMA-DMBOK 对齐的控制措施集进行评分。
3. 制定包含负责人和截止日期的整改计划。

```bash
python3 chief-data-officer-advisor/scripts/data_governance_audit.py \
  --input governance_state.json --format markdown
```

### 工作流 3 — 评估平台决策

1. 记录当前平台的整体情况和拟议的替代方案。
2. 运行 `data_platform_evaluator.py`，根据加权标准进行比较
   （TCO、价值实现时间、开放性、治理适配度、AI 就绪度）。
3. 使用输出结果编制架构决策记录（ADR）和提交给 CFO 的材料。

```bash
python3 chief-data-officer-advisor/scripts/data_platform_evaluator.py \
  --input platform_eval.json --format markdown
```

## 决策框架

### 集中式、联邦式与数据网格

| 模式 | 适用场景 | 风险 |
|---------|-------------|------|
| 集中式平台团队 | 成熟度较低、组织规模较小、受监管行业 | 中央团队成为瓶颈 |
| 联邦式（与业务域对齐的数据团队） | 业务单元自主性强且平台标准一致的组织 | 协调成本 |
| 数据网格 | 组织成熟、真正由业务域负责数据产品、具备强大的平台即产品能力 | 经常被误用；在工程师规模达到约 500 人之前，很少是正确选择 |
| 中心辐射式混合模式 | 大多数达到或超过 C 轮融资阶段组织的默认选择 | 需要中心团队制定明确的标准 |

顾问将默认采用**中心辐射式**模式：由中央平台和治理团队（中心）制定标准；领域团队（辐射节点）负责其领域的数据产品和质量。

### 数据仓库 vs 数据湖 vs 湖仓一体

| 模式 | 适用场景 | 失效场景 |
|---------|-------------|----------------|
| 数据仓库优先（Snowflake / BigQuery / Redshift） | 结构化分析是主要用例 | 大量非结构化数据处理 / ML 训练工作负载 |
| 数据湖优先（对象存储 + 开放表格式） | 存在大量半结构化/非结构化数据；需要 ML 训练 | BI 用户需要治理严格的快速 SQL 查询 |
| 湖仓一体（Databricks / Iceberg + Snowflake） | 两者都需要，并且愿意投入资源进行集成 | 复杂性高；工具泛滥 |
| 最佳组合的数据湖 + 数据仓库 | 每个领域都有充分理由使用自己的方案 | 数据同步 + 成本重复 |

从用例出发，而不是从架构出发。如果 80% 的价值来自对结构化数据的 BI 分析，就从数据仓库优先开始。如果 80% 的价值来自 ML 训练和低成本留存，就从数据湖优先开始。大多数公司最终会同时运行两者。

### 自建 vs 采购

应按能力逐项决定，而不是在全公司范围内统一决定。

| 能力 | 默认选择 |
|------------|---------|
| 数据仓库 | 采购（Snowflake、BigQuery、Redshift、Synapse） |
| 数据湖存储 | 采购（S3、GCS、ADLS） |
| 开放表格式 | 开源（Iceberg、Delta、Hudi） |
| 数据摄取 | 典型场景采购（Fivetran、Airbyte）；专有数据源自建 |
| 数据转换 | 开源编排 + SQL（dbt） |
| 反向 ETL | 采购（Hightouch、Census） |
| BI | 采购（Looker、Tableau、Mode、Hex） |
| 数据目录 / 治理 | 采购或使用开源方案；这是供应商锁定危害最大的领域 |
| 数据质量 | 开源（Great Expectations、Soda）+ 自有封装层 |
| 数据血缘 | 开源（OpenLineage）+ 在数据目录已包含该功能时采购 |

## 常见咨询项目

### “帮助我论证数据集中化的必要性”
1. 盘点当前的支出、人员配置和工具使用情况，并按业务单元逐一梳理。
2. 找出重复建设：同一个数据源被摄取 4 次、使用 6 种 BI 工具、存在 12 套质量框架。
3. 量化当前方案与整合平台相比在总体拥有成本和洞察获取时间上的差距。
4. 分阶段迁移：不要试图在 6 个月内集中化所有内容。

### “我们的数据治理无法通过审计”
1. 获取审计发现，并逐项进行根因分析（人员、流程、证据）。
2. 运行 `data_governance_audit.py`，根据标准控制集进行评分。
3. 确定最需要修复的 5 项控制措施；指定负责人和截止日期。
4. 在下一次外部审计之前建立季度内部审计机制。

### “我们需要一名首席数据官——我适合吗？”
1. 梳理你目前的职责范围（平台、治理、分析、科学、商业化）。
2. 与四类 CDO（架构型、治理型、商业化型、防御型）进行比较。
3. 坦诚判断公司真正需要的是哪一类。
4. 如果你无法全面接触董事会，那么你还不是 CDO；你只是数据负责人。

## 应避免的反模式

- **数据战略未与业务成果挂钩。** “成为一家数据驱动型公司”并不是战略。
- **把数据目录当作政策。** 没有强制执行能力的数据目录只是摆设。应将分类与访问控制关联，而不只是与文档关联。
- **将数据质量视为某一个团队的问题。** 数据质量由生成数据的领域负责；平台团队提供工具。
- **把平台迁移当作战略。** “我们正在从 Redshift 迁移到 Snowflake”是一项战术，而不是战略。
- **耗时 4 年的数据湖项目。** 如果无法在 6 个月内交付价值，就说明范围设定过大。
- **聘请没有平台合作伙伴的 CDO。** 如果没有作为其对等合作方的 CTO 或数据平台负责人，CDO 就会沦为一个无人听从的政策制定者。
- **把仪表板误认为数据产品。** 没有 SLA、没有负责人的仪表板不是产品。

## 参考资料

- `references/data-strategy-framework.md` — 战略框架、目标运营模式、商业化
- `references/data-governance-and-quality.md` — 与 DAMA-DMBOK 对齐、治理机构、质量 SLA
- `references/data-team-and-platform.md` — 组织设计、角色定义、平台技术栈模式

## 相关技能

- `c-level-advisor/cto-advisor` — 用于更广泛的技术平台决策
- `c-level-advisor/ciso-advisor` — 用于数据分类和安全控制
- `c-level-advisor/chief-ai-officer-advisor` — 用于 AI ↔ 数据接口
- `engineering/data-quality-auditor` — 用于深入实施数据质量
- `engineering/senior-data-engineer` — 用于实施数据管道
- `ra-qm-team/gdpr-dsgvo-expert` — 用于 GDPR 下的个人数据治理

## 输出预期

运行此顾问技能后，你应获得：

1. 明确的**观点**（不得仅说“视情况而定”而不给出决策标准）
2. **2–4 项具体的后续行动**，并明确负责人和时间表
3. 会实质性改变建议的**待解决问题**
4. 对可深化分析的脚本和参考文档的引用