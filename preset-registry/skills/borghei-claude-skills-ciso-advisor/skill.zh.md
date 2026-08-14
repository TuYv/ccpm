---
name: ciso-advisor
description: >
  Security leadership for growth-stage companies. Use when building security
  programs, selecting compliance frameworks (SOC 2, ISO 27001, HIPAA, GDPR),
  managing incidents, or assessing vendor risk.
license: MIT + Commons Clause
metadata:
  version: 2.0.0
  author: borghei
  category: c-level
  domain: ciso-leadership
  updated: 2026-03-09
  frameworks:
    - risk-based-security
    - zero-trust-architecture
    - defense-in-depth
    - compliance-sequencing
    - incident-response-leadership
    - vendor-risk-management
  triggers:
    - CISO
    - security strategy
    - risk quantification
    - compliance roadmap
    - SOC 2
    - ISO 27001
    - HIPAA
    - GDPR
    - zero trust
    - incident response
    - board security reporting
    - vendor assessment
    - security budget
    - penetration testing
    - vulnerability management
    - data protection
    - security audit
    - cyber risk
    - security program
    - threat modeling
---
# CISO 顾问

为成长阶段的公司提供基于风险的安全框架。以金额量化风险，按照业务价值最大化原则安排合规顺序，构建纵深防御架构，并将安全从成本中心转变为销售助推器和竞争优势。

## 关键词

CISO、安全战略、风险量化、ALE、SLE、ARO、安全态势、合规路线图、SOC 2、ISO 27001、HIPAA、GDPR、零信任、纵深防御、事件响应、董事会安全报告、供应商评估、安全预算、网络风险、项目成熟度、渗透测试、漏洞管理、数据分类、威胁建模、安全意识、网络钓鱼、MFA、IAM

---

## 风险量化框架

每项安全投资都必须从业务角度论证其合理性。“我们需要更好的安全性”并不是商业论证。“这项未缓解风险的预期年度损失为 $800K”才是。

### 核心公式

```
ALE = SLE x ARO

ALE  = Annual Loss Expectancy (expected cost per year)
SLE  = Single Loss Expectancy (cost if the event occurs once)
ARO  = Annual Rate of Occurrence (probability of occurrence per year)
```

### 风险登记表模板

| 风险 ID | 威胁 | 资产 | SLE | ARO | ALE | 缓解成本 | ROI | 优先级 |
|---------|--------|-------|-----|-----|-----|-----------------|-----|----------|
| R-001 | 数据泄露（客户 PII） | 客户数据库 | $2.5M | 0.15 | $375K | $120K/yr | 3.1x | 严重 |
| R-002 | 勒索软件 | 生产系统 | $1.8M | 0.10 | $180K | $80K/yr | 2.3x | 高 |
| R-003 | 内部人员威胁 | 源代码 | $500K | 0.05 | $25K | $40K/yr | 0.6x | 中 |
| R-004 | DDoS | 面向客户的应用 | $200K | 0.20 | $40K | $30K/yr | 1.3x | 中 |
| R-005 | 第三方数据泄露 | 可访问 PII 的供应商 | $1.2M | 0.08 | $96K | $25K/yr | 3.8x | 高 |

### 风险优先级决策树

```
START: New risk identified
  |
  v
[Calculate ALE]
  |
  +-- ALE > $200K/yr --> CRITICAL: Board-level reporting, immediate mitigation
  |
  +-- ALE $50K-$200K --> HIGH: Quarterly review, funded mitigation plan
  |
  +-- ALE $10K-$50K --> MEDIUM: Annual review, budget if ROI > 1.5x
  |
  +-- ALE < $10K --> LOW: Accept risk, document decision, monitor
```

### SLE 构成明细

| 成本构成 | 说明 | 典型范围 |
|---------------|-------------|---------------|
| 直接成本 | 取证、修复、法律费用 | $100K-$500K |
| 监管罚款 | GDPR：最高可达营收的 4%；HIPAA：每条记录 $100-$50K | 差异很大 |
| 通知成本 | 每位受影响人员 $5-$50 | 随记录数量变化 |
| 业务中断 | 停机期间的收入损失 | 小时数 x 每小时收入 |
| 声誉损害 | 客户流失、品牌影响 | 年营收的 2-5% |
| 法律责任 | 诉讼、和解 | $50K-$5M+ |

---

## 合规路线图

### 按业务价值最大化原则排序

```
Phase 1: Foundation (Months 1-3)
  Basic hygiene: MFA, endpoint protection, access controls, backups
  Cost: $20-50K   Impact: Blocks 80% of common attacks

Phase 2: SOC 2 Type I (Months 3-6)
  Policies, procedures, controls documentation
  Cost: $50-100K  Impact: Unlocks mid-market enterprise sales

Phase 3: SOC 2 Type II (Months 6-12)
  Sustained controls operation + audit
  Cost: $80-150K  Impact: Required by most enterprise buyers

Phase 4: Specialized (Months 12-18)
  ISO 27001, HIPAA, or GDPR based on market requirements
  Cost: $100-250K Impact: Market-specific requirement fulfillment
```

### 合规框架比较

| 框架 | 周期 | 成本 | 最适合 | 客户要求 |
|-----------|----------|------|----------|---------------------|
| SOC 2 Type I | 3-6 个月 | $50-100K | 向美国公司销售产品的 B2B SaaS | 最常见的要求 |
| SOC 2 Type II | 6-12 个月 | $80-150K | 持续开展企业级销售 | 大型交易的必要条件 |
| ISO 27001 | 9-15 个月 | $100-200K | 欧洲市场、全球性公司 | 欧盟企业标准 |
| HIPAA | 6-12 个月 | $80-200K | 处理医疗保健数据 | 医疗保健垂直领域 |
| GDPR | 3-6 个月 | $30-80K | 任何拥有欧盟用户的公司 | 法律要求 |
| PCI DSS | 6-12 个月 | $100-300K | 支付卡处理 | 支付要求 |
| FedRAMP | 12-24 个月 | $500K-2M | 面向美国联邦政府销售 | 政府要求 |

### 框架重叠矩阵

| 控制领域 | SOC 2 | ISO 27001 | HIPAA | GDPR |
|-------------|-------|-----------|-------|------|
| 访问控制 | 是 | 是 | 是 | 是 |
| 加密 | 是 | 是 | 是 | 是 |
| 事件响应 | 是 | 是 | 是 | 是 |
| 风险评估 | 是 | 是 | 是 | 是 |
| 供应商管理 | 是 | 是 | 是 | 是 |
| 数据分类 | 部分 | 是 | 是 | 是 |
| 物理安全 | 是 | 是 | 是 | 部分 |
| 业务连续性 | 是 | 是 | 部分 | 部分 |
| 隐私保护设计 | 否 | 部分 | 部分 | 是 |

**关键洞察**：SOC 2 与 ISO 27001 约有 70% 的控制措施重叠。先实施 SOC 2，再以约 30% 的增量工作量扩展至 ISO 27001。

---

## 安全架构策略

### 零信任成熟度模型

| 级别 | 描述 | 关键控制措施 | 时间表 |
|-------|-------------|-------------|----------|
| 0：临时应对 | 没有正式的安全架构 | -- | 大多数初创公司的当前状态 |
| 1：身份 | 全面实施 MFA、SSO 和基于角色的访问控制 | IAM + MFA + SSO | 第 1-3 个月 |
| 2：网络 | 网络分段、VPN/ZTNA | 微分段、ZTNA | 第 3-6 个月 |
| 3：数据 | 数据分类、静态/传输中加密、DLP | 加密 + 分类 | 第 6-12 个月 |
| 4：监控 | SIEM、日志记录、异常检测 | 集中式日志记录 + 告警 | 第 9-15 个月 |
| 5：自动化 | 自动响应、持续验证 | SOAR + 自动修复 | 第 12-24 个月 |

### 安全架构决策树

```
START: New system or feature being designed
  |
  v
[Does it handle sensitive data?]
  |
  +-- YES --> [What classification level?]
  |            |
  |            +-- PII/PHI --> Full security review + threat model
  |            +-- Business-critical --> Standard security review
  |            +-- Internal --> Lightweight checklist
  |
  +-- NO  --> [Is it internet-facing?]
              |
              +-- YES --> Standard security review + pen test
              +-- NO  --> Security checklist only
```

### 纵深防御层级

| 层级 | 控制措施 | 投资优先级 |
|-------|----------|-------------------|
| 身份 | MFA、SSO、RBAC、特权访问管理 | 第 1（投资回报率最高） |
| 端点 | EDR、设备管理、补丁管理 | 第 2 |
| 网络 | 分段、ZTNA、防火墙、IDS/IPS | 第 3 |
| 应用程序 | SAST、DAST、依赖项扫描、WAF | 第 4 |
| 数据 | 加密、DLP、分类、备份 | 第 5 |
| 监控 | SIEM、日志记录、告警、威胁检测 | 第 6 |

---

## 事件响应协议

### 严重性分级

| 严重性 | 定义 | 响应时间 | 通知对象 |
|----------|-----------|---------------|-------------|
| P0：严重 | 正在发生的入侵、数据外泄、勒索软件攻击 | 立即（< 15 分钟） | CEO + 法务部门 + 董事会 |
| P1：高 | 漏洞正被利用、服务中断 | < 1 小时 | CTO + CEO |
| P2：中 | 发现漏洞、可疑活动 | < 4 小时 | CTO + 安全团队 |
| P3：低 | 违反政策、轻微配置错误 | < 24 小时 | 仅安全团队 |

### 事件响应工作流

```
DETECT --> CONTAIN --> ERADICATE --> RECOVER --> LEARN

Phase 1: DETECT (Minutes)
  - Identify the scope and nature of the incident
  - Classify severity (P0-P3)
  - Activate response team based on severity

Phase 2: CONTAIN (Hours)
  - Isolate affected systems
  - Preserve evidence (forensic images)
  - Prevent lateral movement
  - Communicate to stakeholders per severity matrix

Phase 3: ERADICATE (Hours-Days)
  - Remove threat actor/malware
  - Patch vulnerability that enabled the incident
  - Verify eradication is complete

Phase 4: RECOVER (Days)
  - Restore from clean backups
  - Verify system integrity
  - Monitor for re-compromise
  - Return to normal operations

Phase 5: LEARN (Days-Weeks)
  - Root cause analysis (blameless)
  - Timeline reconstruction
  - Control gap identification
  - Remediation plan with owners and deadlines
```

### 监管通知时限

| 法规 | 通知期限 | 通知对象 |
|-----------|----------------------|---------|
| GDPR | 72 小时 | 监管机构 + 受影响的个人 |
| HIPAA | 60 天 | HHS + 受影响的个人（如 > 500 人，还需通知媒体） |
| 美国各州数据泄露法律 | 30-90 天（各州不同） | 州检察长 + 受影响的个人 |
| SEC（上市公司） | 4 个工作日 | SEC + 公开披露 |
| PCI DSS | 立即 | 银行卡品牌 + 收单银行 |

---

## 供应商安全评估

### 供应商分级

| 级别 | 数据访问权限 | 评估级别 | 频率 |
|------|------------|-----------------|-----------|
| 第 1 级：关键 | PII、PHI、财务数据、源代码 | 全面安全评估 + 渗透测试审查 | 每年 |
| 第 2 级：重要 | 业务数据、内部通信 | 安全调查问卷 + SOC 2 审查 | 每年 |
| 第 3 级：标准 | 无敏感数据访问权限 | 自我声明 + 隐私政策审查 | 每两年 |
| 第 4 级：最低 | 无数据访问权限、无系统集成 | 仅合同审查 | 合同续签时 |

### 供应商评估清单（第 1 级）

| 领域 | 关键问题 | 通过/不通过标准 |
|--------|--------------|-------------------|
| 合规性 | 是否通过 SOC 2 Type II 或 ISO 27001？ | 必须至少具备其中一项 |
| 加密 | 静态和传输中的数据是否加密？ | AES-256 + TLS 1.2+ |
| 访问控制 | 是否强制实施 MFA？是否实施 RBAC？ | 两者均为必需 |
| 事件响应 | 是否有成文的 IR 计划？通知时限是多少？ | 必须具备计划 + 24 小时内通知 |
| 业务连续性 | 是否测试过 DR 计划？是否定义 RTO/RPO？ | 必须在 12 个月内进行过测试 |
| 数据处理 | 是否进行数据分类？是否有保留政策？ | 两者均须具备 |
| 分包处理商 | 还有哪些主体处理我们的数据？ | 必须全部披露 |

---

## 安全指标仪表板

### 董事会层面指标（按季度）

| 指标 | 目标 | 危险信号 | 董事会表述 |
|--------|--------|----------|----------------|
| ALE 覆盖率 | > 80% | < 60% | “总风险 $Y 中有 $X 已得到缓解” |
| 平均检测时间（MTTD） | < 24 小时 | > 72 小时 | “我们能在 X 小时内发现威胁” |
| 平均响应时间（MTTR） | < 4 小时 | > 24 小时 | “我们能在 X 小时内遏制威胁” |
| 合规状态 | 全部有效 | 任一失效 | “所有认证均有效”或“X 存在缺口” |
| 未修复的严重漏洞 | 0 | 任一超过 30 天 | “没有未修补的严重漏洞” |

### 运营指标（按月）

| 指标 | 目标 | 行动触发条件 |
|--------|--------|----------------|
| 网络钓鱼点击率 | < 5% | > 10% = 强制重新培训 |
| 在 SLA 内完成严重补丁修复 | 100% | < 95% = 流程审查 |
| 已审查的特权账户 | 每季度 100% | 任一未审查 = 立即审查 |
| 已评估的一级供应商 | 每年 100% | 任一过期 = 需要评估 |
| 安全培训完成率 | > 95% | < 90% = 上报至管理人员 |

---

## 安全预算框架

### 预算占营收/IT 支出的百分比

| 公司阶段 | 安全预算（占营收百分比） | 安全预算（占 IT 支出百分比） |
|---------------|-------------------------------|--------------------------|
| 种子轮/A 轮 | 2-4% | 8-12% |
| B 轮 | 3-5% | 10-15% |
| C 轮及以后 | 4-8% | 12-18% |
| 大型企业 | 5-10% | 15-20% |

### 按类别分配预算

| 类别 | 占安全预算百分比 | 示例 |
|----------|---------------------|----------|
| 人员 | 40-50% | 安全团队薪资、培训 |
| 工具 | 25-35% | SIEM、EDR、IAM、漏洞扫描器 |
| 合规 | 10-15% | 审计机构、认证、法律服务 |
| 测试 | 5-10% | 渗透测试、红队、漏洞赏金 |
| 事件响应 | 5% | 预付顾问服务、保险、取证 |

### 预算合理性评估公式

针对每项安全投资：

```
Investment ROI = (ALE_before - ALE_after) / Investment_cost

If ROI > 1.5x --> Strong business case, approve
If ROI 1.0-1.5x --> Moderate case, consider alternatives
If ROI < 1.0x --> Weak case, re-evaluate or accept the risk
```

---

## 危险信号

- 使用“行业基准”而非风险分析来论证安全预算的合理性 -- 预算将会有误
- 在落实基本安全措施（MFA、补丁管理、备份）之前追求认证 -- 徒有其表的合规打勾
- 没有成文的资产清单 -- 无法保护未知资产
- IR 计划虽然存在但从未测试（没有开展桌面演练） -- 真正需要时计划将失效
- 安全团队向 IT 而非高管层汇报 -- 激励机制错位、预算竞争
- 身份管理 + 终端 + 电子邮件依赖单一供应商 -- 供应商遭入侵 = 全面失陷
- 安全问卷积压 > 30 天 -- 在不知不觉中失去企业客户订单
- 工程团队中没有安全倡导者计划 -- 安全将成为瓶颈
- 渗透测试发现的问题在 90 天后仍未解决 -- 只测试不修复无异于作秀
- 没有数据分类方案 -- 所有数据都被同等对待 = 没有任何数据得到妥善保护

---

## 与高管团队协作

| 当…… | CISO 与……协作 | 以…… |
|---------|-------------------|-------|
| 企业销售受阻 | CRO（`cro-advisor`） | 完成安全调查问卷，推动交易继续进行 |
| 推出新产品功能 | CTO + CPO（`cto-advisor`、`cpo-advisor`） | 进行威胁建模和安全审查 |
| 制定合规预算 | CFO（`cfo-advisor`） | 根据量化的风险敞口确定项目规模 |
| 签订供应商合同 | COO（`coo-advisor`） | 制定安全 SLA 和审计权条款 |
| 开展并购尽职调查 | CEO + CFO | 评估目标公司的安全状况 |
| 发生安全事件 | CEO + 法务 | 协调响应并履行监管通知义务 |
| 向董事会汇报 | CEO（`ceo-advisor`） | 将风险转化为业务语言 |
| 招聘安全团队 | CHRO（`chro-advisor`） | 确定薪酬、职级和招聘方案 |

---

## 主动触发条件

- 超过 12 个月未进行安全审计 -- 在客户或监管机构提出要求之前安排审计
- 企业交易要求 SOC 2，但尚未获得认证 -- 亟需制定合规路线图
- 计划拓展新市场 -- 检查数据驻留、隐私要求和当地法规
- 关键系统没有访问日志 -- 存在合规缺口和取证盲区
- 尚未评估能够访问敏感数据的供应商 -- 需要开展供应商风险评估
- 依赖项中披露了严重漏洞 -- 在 24 小时内完成补丁评估
- 员工离职时没有访问权限撤销 SOP -- 存在需要立即处理的安全缺口

---

## 输出成果

| 请求 | 交付物 |
|---------|-------------|
| “评估我们的安全状况” | 包含量化 ALE 的风险登记册，按业务影响确定优先级 |
| “我们需要 SOC 2” | 合规路线图：时间表、成本、工作量、快速见效项和供应商选择 |
| “准备安全审计” | 针对目标框架的差距分析 + 包含负责人的整改计划 |
| “我们发生了安全事件” | IR 协调计划 + 沟通模板 + 监管时间表 |
| “董事会报告中的安全部分” | 风险状况摘要、合规状态、事件报告和预算申请 |
| “评估供应商安全性” | 包含风险评分和合同建议的供应商分级评估 |
| “论证安全预算的合理性” | 基于风险的预算提案，包含每项投资的 ROI |

---

## 工具参考

### security_posture_scorer.py

对 NIST CSF 2.0 的各项职能（治理、识别、保护、检测、响应、恢复）以及 CISA 零信任成熟度模型的各个支柱（身份、设备、网络、应用程序、数据）进行安全状况评分。生成可直接用于董事会汇报的安全健康状况报告。

```bash
# Run with demo data (realistic Series B company)
python scripts/security_posture_scorer.py

# From JSON with control assessments (0-4 maturity per control)
python scripts/security_posture_scorer.py --input controls.json

# JSON output
python scripts/security_posture_scorer.py --json
```

### risk_register_manager.py

管理网络风险登记册，支持 ALE（SLE x ARO）计算、缓解措施 ROI 以及可直接用于董事会汇报的风险报告。

```bash
# Run with demo risk register
python scripts/risk_register_manager.py

# From JSON risk register
python scripts/risk_register_manager.py --input risks.json

# Sort by ROI (best investments first)
python scripts/risk_register_manager.py --sort-by roi

# JSON output
python scripts/risk_register_manager.py --json
```

### compliance_tracker.py

跟踪 SOC 2 Type I/II、ISO 27001、HIPAA 和 GDPR 的实施进度。计算差距分析、框架重叠情况和工作量估算。

```bash
# Track SOC 2 readiness (default)
python scripts/compliance_tracker.py

# Track multiple frameworks
python scripts/compliance_tracker.py --frameworks soc2_type1 iso27001 gdpr

# List available frameworks
python scripts/compliance_tracker.py --list-frameworks

# From JSON
python scripts/compliance_tracker.py --input compliance.json

# JSON output
python scripts/compliance_tracker.py --json
```

---

## 故障排除

| 问题 | 可能原因 | 解决方法 |
|---------|-------------|-----|
| 使用“行业基准”而非风险数据来论证安全预算的合理性 | 尚未建立风险量化框架 | 实施基于 ALE 的风险登记册；根据量化后的风险降低程度论证每一笔支出的合理性 |
| 在落实基本安全措施（MFA、备份）之前就推进 SOC 2 | 只重形式、不重实质的勾选式合规 | 首先完成第一阶段的基础建设：MFA、端点保护、备份；然后再推进认证 |
| 渗透测试发现的问题在 90 天后仍未解决 | 只测试而不修复是在作秀 | 设定 SLA：严重问题 7 天、高危问题 30 天、中危问题 90 天；在风险登记册中跟踪 |
| 安全团队向 IT 而非高管层汇报 | 激励机制不一致且存在预算竞争 | CISO 应向 CEO 或 COO 汇报；安全预算应与 IT 预算分离 |
| 企业交易因安全问卷而受阻 | 尚未取得 SOC 2，或安全问卷回复积压超过 30 天 | 优先推进 SOC 2 Type I；创建问卷回复库；指定专人负责 |
| 零信任计划停滞在身份层 | 试图同时实施所有支柱 | 遵循成熟度模型：先实施身份（第 1-3 个月），然后实施网络，最后实施数据 |

---

## 成功标准

- 在 NIST CSF 评估中，安全态势评分高于 70/100（每年通过 security_posture_scorer.py 衡量）
- ALE 覆盖率高于 80%——已为量化的风险敞口提供缓解措施资金（在风险登记册中跟踪）
- 所有严重级别的平均检测时间（MTTD）均低于 24 小时
- P0/P1 事件的平均响应时间（MTTR）低于 4 小时
- 严重漏洞的未解决时间均不超过 7 天（每周衡量）
- SOC 2 Type II 认证保持有效，且控制措施零例外
- 每季度模拟活动中的网络钓鱼点击率低于 5%

---

## 范围与限制

**范围内**：风险量化（ALE/SLE/ARO）、合规路线图规划、零信任成熟度评估、NIST CSF 2.0 评分、事件响应协议、供应商安全评估、安全预算合理性论证、董事会层面的安全报告。

**范围外**：渗透测试执行、恶意软件分析、SOC 运营、防火墙配置、代码审查、取证调查执行、安全工具采购。

**限制**：安全态势评分器使用自我评估的成熟度等级，可能会夸大实际能力。风险登记册中的 ALE 计算是基于行业数据得出的估算值——实际损失可能存在显著差异。合规跟踪器衡量的是控制措施的实施情况，而非控制措施的有效性。零信任评分采用二元标准（已实施/未实施），这会过度简化部分实施的情况。

---

## 集成点

| Skill | 集成 |
|-------|-------------|
| `cto-advisor` | 安全架构审查；针对新功能进行威胁建模 |
| `cfo-advisor` | 根据量化风险确定安全预算规模；合规成本 |
| `ceo-advisor` | 董事会安全报告；向利益相关者通报事件 |
| `coo-advisor` | 供应商安全 SLA；合同中的审计权条款 |
| `cro-advisor` | 安全问卷回复；将 SOC 2 作为销售助推器 |
| `chro-advisor` | 安全团队招聘；安全意识培训计划 |
| `board-deck-builder` | 董事会演示文稿中的风险/安全部分，包括安全态势评分和合规状态 |
| `ra-qm-team` | 扩展合规框架（ISO 13485、MDR、FDA、GDPR、NIS2、DORA） |