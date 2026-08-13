---
name: pre-mortem
description: Imagine the project has already shipped and failed catastrophically — work backwards from the failure to identify the most likely causes BEFORE building. Forces concrete risk identification, not vague "what could go wrong" lists.
when_to_use: |
  Apply BEFORE implementation begins:
  - architect, after writing ARCH but before gate:plan
  - pm, while breaking work into tasks (Pre-mortem section in PLAN-*.md)
  - security-officer, when threat-modeling
  - any time the feature is irreversible or high-blast-radius
effort: medium
allowed-tools: Read, Write
paths:
  - "docs/plans/**"
  - "docs/architecture/**"
  - "docs/threat-models/**"
---
# 事前验尸——在动手构建之前先设想它如何失败

为一个尚未发生的项目进行复盘。揭示“列出所有风险”类提示词所遗漏的真实
风险。

起源于 Gary Klein 在 MIT Sloan 的研究，如今已成为 AWS
及其他运维成熟型组织的标准做法。

## 事前验尸的 5 个步骤

### 第 1 步：想象你身处 6 个月后的未来

项目已经上线。它遭遇了明确且公开的失败。Reddit 上出现了一个
讨论帖。CEO 正在追问哪里出了问题。

### 第 2 步：写下事后复盘的新闻标题

一句话。具体。明确。示例：

- ❌ 差：“我们遇到了一些质量问题。”
- ✅ 好：“2026-09-12，Stripe webhook 处理程序使用原始请求体哈希进行去重，因此当 Stripe 因网络短暂中断而重试投递时，3 万名客户被重复扣款。”

这个标题会迫使你明确、具体地指出失败模式。

### 第 3 步：列出导致这一具体失败发生的每一个原因

头脑风暴出 10-15 个原因。要具体。每一项都应提及：
- 一个真实的组件／文件
- 一种真实的失败模式（竞态条件、schema 不匹配、凭据过期）
- 一个真实的人为因素（值班人员没有看到告警、runbook 已过时）

拒绝“测试不充分”之类的含糊说法。将其替换为“我们
没有针对去重键冲突场景编写基于属性的测试。”

### 第 4 步：按可能性 × 严重性排序

对每个原因进行评分：
- **可能性：** 1-5（1=十年一遇，5=每月发生）
- **严重性：** 1-5（1=外观问题，5=数据丢失／违反监管规定）
- **风险分数：** 可能性 × 严重性

按风险分数排名前 3 的原因 → 这些是你应最高优先处理的缓解事项。

### 第 4b 步：对风险进行分类——真老虎／纸老虎／房间里的大象

评分后，将每项风险归入以下三种类型之一：

**🐯 真老虎**——你个人认为确实可能导致项目失败的真实问题
- 基于证据、过往经验或清晰的逻辑
- 应该让你夜不能寐
- 需要采取具体行动
- 按紧迫性对每只真老虎进行分类：
  - **阻止发布**：必须在上线前解决（核心功能损坏、监管阻碍、数据完整性风险）
  - **快速跟进**：必须在上线后 30 天内解决（性能问题、次要功能）
  - **持续跟踪**：上线后进行监控，如果成为问题再修复（边界情况、锦上添花的事项）

**📄 纸老虎**——其他人可能会提出、但你并不认为是真实风险的担忧
- 表面上听起来合理，但实际不太可能发生或被夸大
- 不值得投入大量资源
- 值得记录下来，以统一利益相关者的认知并避免反复争论
- 对每一项说明你为什么不认为它是真实风险

**🐘 房间里的大象**——团队知道但没有公开讨论的事情
- 令人不安的担忧：技术债务、团队关系紧张、不切实际的时间表、没有人喜欢的设计
- 尚不确定——你不确定它是否是问题，但也没有人在调查
- 值得在上线前明确揭示——沉默的大象会在上线后变成真老虎

### 第 5 步：针对排名前 3 的每个原因，在计划中写入一道防护措施

每道防护措施都是对计划的一项具体变更：
- 一项本可以发现该问题的测试
- 一个熔断器／功能开关
- 一条 runbook 条目
- 一项带有明确 SLO 的监控告警

如果排名前三的原因无法在时间/预算范围内缓解，请向用户升级说明：
“本计划接受 X 风险，且不采取任何缓解措施。”

## 模板 — 添加到 PLAN-*.md

```markdown
## Pre-mortem

Six months from now, this project failed. Headline:

> <one-sentence failure headline>

### Top reasons (likelihood × severity)

| Cause | L | S | Risk | Mitigation in plan |
|---|---|---|---|---|
| <specific cause> | 4 | 5 | 20 | <Task #N: write idempotency test> |
| ... | | | | |

### 🐯 Tigers (real risks — require action)

| Tiger | Classification | Mitigation | Owner | Due |
|-------|---------------|-----------|-------|-----|
| <risk> | Launch-Blocking | <concrete action> | <team/person> | <date> |
| <risk> | Fast-Follow | <concrete action> | <team/person> | <date> |
| <risk> | Track | <monitoring approach> | <owner> | post-launch |

### 📄 Paper Tigers (overblown — document to align stakeholders)

- **<concern>**: Not a real risk because <reason>. If <condition> changes, revisit.

### 🐘 Elephants (unspoken — needs open discussion)

- **<concern>**: Nobody is talking about this. Suggested conversation: "<how to raise it>".

### Accepted risks (no mitigation)

- <risk> — accepted because <budget/scope reason>. Owner: <name>.
```

## 按原型划分的常见失败模式

快速入门 — 各原型最常见的预演失败原因：

| 原型 | 常见失败 |
|---|---|
| 金融科技 / 电商 | 幂等键冲突；重试风暴期间重复扣款 |
| 医疗保健 | 通过调试日志泄露 PHI；未与供应商签署 BAA |
| Web3 | 预言机数据过时；利用联合曲线实施闪电贷攻击 |
| MLOps | 训练/服务偏差；模型漂移未被发现 |
| IoT 嵌入式 | OTA 导致某个地区的设备变砖，且没有恢复路径 |
| 数据平台 | 迟到数据覆盖正确值 |
| AI 系统 / 智能体产品 | 提示词注入导致其他用户的数据被外泄 |
| 企业级 SaaS | RLS 缺口导致跨租户数据泄露 |
| CLI 工具 | 破坏性标志没有确认机制（等同于 rm -rf） |
| 库 | 次版本号升级中引入破坏性变更 |

## 预演中的反模式

❌ **风险含糊。** “性能可能会成为问题。”请具体说明：哪个操作、在多大负载下、SLO 是什么。

❌ **宇宙级风险。** “AWS 可能会宕机。”没错，但这不具备可操作性。应关注你能够缓解的事项。

❌ **防御性清单。** 为了显得考虑周全而列出已经缓解的风险。只列出当前计划尚未解决的风险。

❌ **跳过标题。** 没有标题，团队就不会相信失败场景是真实的。

## 何时跳过

- **nano project_size** — 预演只会带来额外开销。
- **具有完整测试覆盖的纯重构** — 防护机制已经存在。
- **仅需一行即可复现的错误修复** — 风险边界非常明确。