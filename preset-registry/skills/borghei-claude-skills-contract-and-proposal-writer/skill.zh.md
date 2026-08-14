---
name: contract-and-proposal-writer
description: >
  Generate business documents — contracts, proposals, SOWs, NDAs, MSAs — with
  jurisdiction-aware clauses for US, EU, UK, and DACH. Use when starting client
  engagements, writing proposals, drafting agreements, or needing GDPR-compliant DPAs.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: business-growth
  domain: legal-documents
  tier: POWERFUL
  updated: 2026-03-09
  frameworks: contract-templates, jurisdiction-compliance, proposal-writing
---
# 合同与提案撰写工具

**级别：** 强大
**类别：** 业务增长
**标签：** 合同、提案、SOW、NDA、MSA、GDPR、法律模板、自由职业

## 概述

生成专业且考虑司法管辖区差异的商业文件：自由职业合同、项目提案、工作说明书、保密协议和主服务协议。以结构化 Markdown 格式输出，并提供转换为 DOCX 和 PDF 的说明。涵盖美国（特拉华州）、欧盟（GDPR）、英国以及 DACH（德国法律）司法管辖区，并为每个地区提供条款库。

**本文档不能替代法律顾问的意见。** 请将这些模板作为可靠的起点。对于金额超过 $50K，或涉及复杂知识产权、股权或监管要求的合作，请交由律师审查。

---

## 核心能力

- 固定价格和按小时计费的开发合同
- 按月付费的咨询顾问协议
- 包含时间计划和预算明细的项目提案
- 包含交付成果矩阵和验收标准的工作说明书（SOW）
- 保密协议（双向和单向）
- 包含 SOW 附件框架的主服务协议（MSA）
- SaaS 合作协议（经销、推荐、白标、集成）
- 适用于欧盟/DACH 的 GDPR 数据处理附录（第 28 条）
- 针对特定司法管辖区的条款库（美国、欧盟、英国、DACH）
- 变更单和范围管理条款

---

## 先澄清需求

起草文件前，请确认以下信息。如有任何信息未知或含糊不清，请询问——不要自行假设：

- [ ] **文件类型**——合同、提案、SOW、NDA 或 MSA（用于选择模板和必需条款）
- [ ] **司法管辖区**——美国特拉华州、欧盟、英国或 DACH（决定知识产权、责任和适用法律条款；DACH 需要 Nutzungsrechte，欧盟需要 DPA）
- [ ] **合作模式 + 金额**——固定价格、按小时计费、顾问服务费或收入分成，以及总金额（决定付款条款和责任上限）
- [ ] **是否涉及个人数据**——欧盟/DACH 合作如涉及个人数据，必须提供符合 GDPR 第 28 条要求的 DPA

停止规则：仅询问对输出影响最大的 2-3 个问题。如果用户说“直接起草即可”，则继续处理，并在文件顶部列出所作假设。

## 工作流程

### 第 1 步：收集需求

起草前收集以下信息：

| 问题 | 重要性 |
|----------|---------------|
| 文件类型？ | 合同、提案、SOW、NDA、MSA |
| 司法管辖区？ | 美国特拉华州、欧盟、英国、DACH |
| 合作模式？ | 固定价格、按小时计费、顾问服务费、收入分成 |
| 合同各方？ | 法定名称、角色、注册地址 |
| 工作范围摘要？ | 用 1-3 句话描述工作内容 |
| 总金额或费率？ | 决定付款条款和责任上限 |
| 时间计划？ | 开始日期、结束日期或期限、里程碑 |
| 特殊要求？ | 知识产权转让、白标、分包商、竞业限制 |
| 是否涉及个人数据？ | 欧盟/DACH 中如涉及个人数据，则必须提供 GDPR DPA |

### 第 2 步：选择模板

| 文件类型 | 合作模式 | 模板 |
|--------------|-----------------|----------|
| 开发合同 | 固定价格 | 模板 A：固定价格开发 |
| 开发合同 | 按小时计费/顾问服务费 | 模板 B：咨询顾问协议 |
| 合作协议 | 收入分成 | 模板 C：SaaS 合作协议 |
| NDA | 双向 | 模板 NDA-M |
| NDA | 单向（披露方/接收方） | 模板 NDA-OW |
| SOW | 任意 | SOW 模板（作为 MSA 附件或独立使用） |
| 提案 | 任意 | 模板 P：项目提案 |

### 第 3 步：生成并填写

填写所有 `[BRACKETED]` 占位符。将缺失信息标记为 `[REQUIRED - description]`。绝不能留空——不完整的合同比没有合同更危险。

### 第 4 步：审查清单

发送任何生成的文档之前：

- [ ] 已填写所有 `[BRACKETED]` 占位符
- [ ] 已选择正确的司法管辖区，且全文保持一致
- [ ] 付款条款与合作模式相符
- [ ] 知识产权条款符合司法管辖区要求
- [ ] 责任上限合理（通常为合同金额的 1 至 3 倍）
- [ ] 终止条款同时包含有因终止和任意终止
- [ ] 如果处理个人数据，则已包含 DPA（欧盟/DACH 地区强制要求）
- [ ] 对于超过 3 个月的合作，已包含不可抗力条款
- [ ] 对于固定价格合同，已定义变更单流程
- [ ] 已为每项交付成果定义验收标准

---

## 条款库

### 付款条款

| 模式 | 标准条款 | 风险说明 |
|-------|---------------|------------|
| 固定价格 | 预付 50%，测试版阶段支付 25%，验收时支付 25% | 最适合范围明确的项目 |
| 按小时计费 | 30 天内付款，按月开具发票 | 需要记录工时 |
| 顾问费 | 按月预付，每月 1 日支付 | 包含超出约定范围后的费率 |
| 里程碑 | 按里程碑开具发票 | 精确定义里程碑 |
| 收益分成 | 月末结算后 30 天内付款，设最低门槛 | 需要审计权 |

**逾期付款：**每月 1.5%（美国标准）；在欧盟/DACH 地区，最高不超过法定上限。

### 知识产权

| 司法管辖区 | 默认知识产权归属 | 关键要求 |
|-------------|---------------------|-----------------|
| 美国（特拉华州） | 职务作品原则 | 必须采用书面形式，且属于 9 类合格作品之一 |
| 欧盟 | 作者保留精神权利 | 需要单独的书面转让 |
| 英国 | 雇主拥有（如果是雇员） | 承包商：需要明确转让 |
| DACH（德国） | 作者永久保留著作权 | 必须明确转让使用权 |

**既有知识产权：**始终排除既有工具、库和框架。对于嵌入交付成果中的既有知识产权，授予客户永久、免版税的使用许可。

**作品集展示权：**开发者保留在作品集中展示相关作品的权利，除非客户在 30 天内以书面形式要求保密。

### 责任

| 风险等级 | 上限 | 适用情形 |
|-----------|-----|-------------|
| 标准 | 已支付费用总额的 1 倍 | 大多数项目 |
| 高风险 | 已支付费用总额的 3 倍 | 关键基础设施、受监管行业 |
| 无上限（双方） | 无上限，双方相互赔偿 | 企业合作伙伴关系 |

**始终排除：**间接、附带和后果性损害（双方均适用）。

### 终止

| 类型 | 通知期限 | 财务处理 |
|------|-------------|-------------------|
| 有因终止 | 14 天补救期 | 支付已完成工作的费用 |
| 任意终止（客户） | 提前 30 天书面通知 | 支付已完成工作的费用 + 剩余合同金额的 10% 至 20% |
| 任意终止（任一方） | 30 至 60 天 | 支付已完成工作的费用 |
| 立即终止（重大违约且未补救） | 通知后 7 天 | 按比例付款 |

### 保密

- 标准期限：终止后 3 年
- 商业秘密：永久（只要相关信息仍属于商业秘密）
- 返还/销毁：所有保密材料应在终止后 30 天内返还或经书面证明已销毁
- 例外情况：已公开知悉、独立开发、从第三方获得、法律要求披露

### 争议解决

| 司法管辖区 | 建议的争议解决机构 | 规则 |
|-------------|-------------------|-------|
| 美国 | 具有约束力的仲裁 | AAA 商事仲裁规则，仲裁地为特拉华州 |
| 欧盟 | ICC 仲裁或当地法院 | ICC 规则，地点为管辖法律所属国家的首都 |
| 英国 | LCIA 仲裁，伦敦 | LCIA 规则，英格兰法律 |
| DACH | DIS 仲裁或州法院 | DIS 规则，德国法律 |

---

## 特定司法管辖区的要求

### 美国（特拉华州）
- 管辖法律：特拉华州法律（对企业最为友好）
- 适用职务作品原则（《版权法》第 101 条）
- 竞业限制：在范围、期限和地域合理的情况下可执行
- 电子签名：根据《ESIGN 法案》和 UETA 有效

### 欧盟（GDPR）
- 如处理个人数据，则须签订数据处理附录
- 在某些成员国，知识产权转让可能需要单独签署书面契据
- 对于 B2C，消费者保护法可能优先于合同条款
- 对于远程合同（B2C），享有 14 天内撤回的权利

### 英国（脱欧后）
- 受英格兰法律管辖（最常见的选择）
- 知识产权：《1977 年专利法》、《1988 年版权、外观设计和专利法》
- 数据处理适用英国 GDPR（脱欧后的对应法规）
- 电子签名：根据《2000 年电子通信法》有效

### DACH（德国 / 奥地利 / 瑞士）
- 合同受 BGB（德国《民法典》）管辖
- 某些条款须采用 Schriftform（书面形式）（BGB 第 126 条）
- 作者始终保留精神权利（Urheberpersoernlichkeitsrecht）——不得转让
- 必须明确转让 Nutzungsrechte（使用权），并规定其范围和期限
- 竞业限制：最长 2 年，且须支付补偿（HGB 第 74 条）
- 涉及个人数据时，必须遵守 DSGVO（德国对 GDPR 的实施法规）
- Kuendigungsfristen：适用法定通知期，且不得缩短至法定最低期限以下

---

## GDPR 数据处理附录（模板块）

任何涉及个人数据的欧盟/DACH 合作均须包含：

```markdown
## DATA PROCESSING ADDENDUM (Art. 28 GDPR/DSGVO)

Controller: [CLIENT LEGAL NAME]
Processor: [SERVICE PROVIDER LEGAL NAME]

### Processing Scope
Processor processes personal data solely to perform services under the Agreement.

### Categories of Data Subjects
[End users / Employees / Customers of Controller]

### Categories of Personal Data
[Names, email addresses, usage data, IP addresses, payment information]

### Processing Duration
Term of the Agreement. Deletion within [30] days of termination.

### Processor Obligations
1. Process only on Controller's documented instructions
2. Ensure authorized persons committed to confidentiality
3. Implement Art. 32 technical and organizational measures
4. Assist with data subject rights requests within [10] business days
5. Notify Controller of personal data breach within [72] hours
6. No sub-processors without prior written consent
7. Delete or return all personal data upon termination
8. Make available information to demonstrate compliance

### Current Sub-Processors
| Sub-Processor | Location | Purpose |
|--------------|----------|---------|
| [AWS/GCP/Azure] | [Region] | Cloud infrastructure |
| [Stripe] | [US/EU] | Payment processing |

### Cross-Border Transfers
Transfers outside EEA: [ ] Standard Contractual Clauses [ ] Adequacy Decision [ ] BCRs
```

---

## 项目提案模板（模板 P）

```markdown
# PROJECT PROPOSAL

**Prepared for:** [Client Name]
**Prepared by:** [Your Name / Company]
**Date:** [Date]
**Valid until:** [Date + 30 days]

---

## Executive Summary
[2-3 sentences: what you will build, the business problem it solves, and the expected outcome]

## Understanding of Requirements
[Demonstrate you understand the client's problem. Reference their specific situation, not generic boilerplate]

## Proposed Solution
[Technical approach, architecture overview, technology choices with rationale]

## Scope of Work

### In Scope
- [Deliverable 1: specific description]
- [Deliverable 2: specific description]
- [Deliverable 3: specific description]

### Out of Scope
- [Explicitly list what is NOT included -- prevents scope creep]

### Assumptions
- [Client provides X by Y date]
- [Access to Z system will be available]

## Timeline

| Phase | Deliverables | Duration | Dates |
|-------|-------------|----------|-------|
| Discovery | Requirements document, architecture plan | 1 week | [Dates] |
| Development | Core features, API integration | 4 weeks | [Dates] |
| Testing | QA, UAT, bug fixes | 1 week | [Dates] |
| Launch | Deployment, monitoring, handoff | 1 week | [Dates] |

## Investment

| Item | Cost |
|------|------|
| Discovery & Planning | [Amount] |
| Development | [Amount] |
| Testing & QA | [Amount] |
| Project Management | [Amount] |
| **Total** | **[Amount]** |

### Payment Schedule
- 50% upon contract signing
- 25% at beta delivery
- 25% upon final acceptance

## Why Us
[2-3 concrete differentiators. Reference relevant experience, not just claims]

## Next Steps
1. Review and approve this proposal
2. Sign agreement (attached)
3. Kick-off meeting within [5] business days
```

---

## 文档转换

```bash
# Markdown to DOCX (basic)
pandoc contract.md -o contract.docx --reference-doc=template.docx

# With numbered sections (legal style)
pandoc contract.md -o contract.docx --number-sections -V fontsize=11pt

# Markdown to PDF (via LaTeX)
pandoc contract.md -o contract.pdf -V geometry:margin=1in -V fontsize=11pt

# Batch convert all contracts
for f in contracts/*.md; do
  pandoc "$f" -o "${f%.md}.docx" --reference-doc=template.docx
done
```

---

## 常见陷阱

| 陷阱 | 后果 | 预防措施 |
|---------|-------------|------------|
| 缺少知识产权转让条款 | 所有权不明确，引发争议 | 始终根据司法管辖区纳入明确的知识产权条款 |
| 验收标准含糊 | 陷入无休止的修改周期 | 将“已验收”定义为在 X 天内以书面形式签字确认 |
| 没有变更单流程 | 固定价格项目的范围蔓延 | 纳入包含定价机制的变更单条款 |
| 司法管辖区不匹配 | 条款无法执行 | 使管辖法律与各方开展业务的所在地相匹配 |
| 缺少责任上限 | 面临无限责任风险 | 始终将责任上限设为合同金额的 1-3 倍 |
| 口头修订 | 修改内容无法执行 | 要求修订以书面形式作出并由双方签署 |
| 处理欧盟数据时没有 DPA | 违反 GDPR，罚款最高可达全球营收的 4% | 处理欧盟个人数据时始终纳入 DPA |
| 缺少不可抗力条款 | 无法防范不可预见的事件 | 合作期限超过 3 个月时纳入该条款 |

---

## 最佳实践

1. 对于金额超过 $10K 的项目，采用里程碑付款而非 net-30 付款方式——这样可以降低双方的现金流风险
2. 固定价格合同中务必包含变更订单条款
3. 对于 DACH 地区：明确包含 Schriftformklausel（书面形式条款）
4. 在长期服务协议中定义响应时间 SLA（例如，紧急事项 4h / 普通事项 24h）
5. 将模板纳入版本控制；随着法律变化，每年进行审查
6. 对于保密协议：务必规定协议终止时返还或销毁保密材料
7. 包含存续条款——明确哪些条款在协议终止后继续有效（保密、知识产权、责任）
8. 对于 EU/DACH 地区：检查是否适用消费者保护法（B2C 合作有额外要求）

---

## 相关技能

| 技能 | 适用场景 |
|-------|----------|
| **ceo-advisor** | 有关合作伙伴关系和商业模式的战略决策 |
| **cfo-advisor** | 财务条款、定价策略、收入确认 |
| **launch-strategy** | 产品发布前后的合同时间安排 |

---

## 工具参考

### 1. contract_clause_checker.py

**用途：** 根据指定司法管辖区和合作类型，验证合同文档（采用结构化 JSON 格式）是否包含必需条款。

```bash
python scripts/contract_clause_checker.py contract.json --jurisdiction us-delaware
python scripts/contract_clause_checker.py contract.json --jurisdiction eu --json
```

| 标志 | 必需 | 说明 |
|------|----------|-------------|
| `contract.json` | 是 | 包含合同条款和元数据的 JSON 文件 |
| `--jurisdiction` | 否 | 用于检查的司法管辖区：us-delaware、eu、uk、dach（默认值：us-delaware） |
| `--type` | 否 | 合同类型：fixed-price、hourly、retainer、nda、msa（默认值：fixed-price） |
| `--json` | 否 | 以 JSON 格式输出结果 |

### 2. proposal_cost_estimator.py

**用途：** 生成包含阶段明细、付款计划和利润率分析的项目成本估算。

```bash
python scripts/proposal_cost_estimator.py --hourly-rate 150 --hours 200 --phases 4
python scripts/proposal_cost_estimator.py --hourly-rate 150 --hours 200 --phases 4 --json
```

| 标志 | 必需 | 说明 |
|------|----------|-------------|
| `--hourly-rate` | 是 | 以美元计的小时费率 |
| `--hours` | 是 | 预计总工时 |
| `--phases` | 否 | 项目阶段数量（默认值：3） |
| `--margin` | 否 | 期望利润率百分比（默认值：20） |
| `--currency` | 否 | 货币代码（默认值：USD） |
| `--json` | 否 | 以 JSON 格式输出结果 |

### 3. contract_comparison_analyzer.py

**用途：** 比较两个合同版本，并识别关键条款、付款条件和风险领域的差异。

```bash
python scripts/contract_comparison_analyzer.py contract_v1.json contract_v2.json
python scripts/contract_comparison_analyzer.py contract_v1.json contract_v2.json --json
```

| 标志 | 必需 | 说明 |
|------|----------|-------------|
| `contract_v1.json` | 是 | 包含第一个合同版本的 JSON 文件 |
| `contract_v2.json` | 是 | 包含第二个合同版本的 JSON 文件 |
| `--json` | 否 | 以 JSON 格式输出结果 |

---

## 故障排除

| 问题 | 可能原因 | 解决方案 |
|---------|-------------|----------|
| 最终文档中仍有占位符 | 填写过程过于仓促 | 发送前使用 contract_clause_checker.py 扫描尚未填写的 [BRACKETED] 占位符 |
| 知识产权条款在 EU/DACH 不具可执行性 | 在 EU 语境中使用了美国的职务作品语言 | 对 DACH 改用明确的 Nutzungsrechte 转让；对 EU 使用单独的书面权利转让契据 |
| 客户在签署后对范围提出异议 | 验收标准含糊或缺少变更单流程 | 将“已验收”定义为在 X 个工作日内书面签署确认；包含设有定价机制的变更单条款 |
| 按小时计费的合同出现付款争议 | 没有工时跟踪要求或开票条款不明确 | 在合同中明确工时跟踪工具、开票频率（每月）和付款条款（net-30） |
| GDPR 不合规处罚风险 | 涉及个人数据的 EU/DACH 项目缺少 DPA | 处理 EU 个人数据时始终包含 Art. 28 DPA；使用此技能中的模板块 |
| 合同未通过法律审查 | 司法管辖区不匹配或缺少强制性条款 | 在法律审查前，针对目标司法管辖区运行 contract_clause_checker.py |

---

## 成功标准

- 交付文档前已填写所有 [BRACKETED] 占位符
- 选择了正确的司法管辖区，并在全文中保持一致（通过 contract_clause_checker.py 验证）
- 付款条款与合作模式相匹配，并明确开票周期
- 知识产权条款符合司法管辖区要求（美国使用职务作品条款，DACH 使用 Nutzungsrechte）
- 责任上限设为合同金额的 1-3 倍，并排除间接损害赔偿
- 所有涉及个人数据的 EU/DACH 项目均包含 DPA
- 所有固定价格合同均定义了变更单流程

---

## 范围与限制

- **范围内：** 合同模板、提案生成、条款库、特定司法管辖区合规、文档比较、成本估算
- **范围外：** 法律建议、合同谈判策略、诉讼支持、监管申报
- **非法律顾问：** 这些模板仅作为起点；对于金额超过 $50K 或涉及复杂知识产权、股权或监管要求的项目，请咨询律师进行审查
- **司法管辖区覆盖范围：** US（Delaware）、EU（通用）、UK、DACH（Germany/Austria/Switzerland）；其他司法管辖区可能需要额外的法律审查
- **货币：** 成本估算器默认使用 USD；国际项目应根据当地货币进行调整

---

## 集成点

- **ceo-advisor** -- 有关合作伙伴关系结构和业务模式的战略决策，这些决策会影响合同类型的选择
- **cfo-advisor** -- 为付款计划和利润率目标提供依据的财务条款、收入确认和定价策略
- **customer-success-manager** -- 客户项目的 SOW 和 MSA 结构；续约条款会纳入 CS 工作流
- **pricing-strategy** -- 当提案定价需要相对于竞争对手或市场费率进行战略定位时
- **revenue-operations** -- 合同金额和付款计划会纳入销售管道预测和收入确认