---
name: pol-probe
argument-hint: "[hypothesis to test]"
description: Define a Proof of Life probe to test a risky hypothesis cheaply. Use when you need harsh truth before building real product.
intent: >-
  Define and document a **Proof of Life (PoL) probe**—a lightweight, disposable validation artifact designed to surface harsh truths before expensive development. Use this when you need to eliminate a specific risk or test a narrow hypothesis **without building production-quality software**. PoL probes are reconnaissance missions, not MVPs—they're meant to be deleted, not scaled.
type: component
best_for:
  - "Documenting a lightweight validation artifact before build"
  - "Testing a narrow hypothesis without shipping production software"
  - "Reducing risk before spending engineering time"
scenarios:
  - "Define a Proof of Life probe for a new workflow automation idea"
  - "Help me write a PoL probe for this pricing hypothesis"
  - "Create a low-cost validation probe before we build this feature"
theme: validation-experiments
estimated_time: "15-25 min"
---
## 目的

定义并记录一种**生命迹象验证（PoL）探针**——这是一种轻量级、用后即弃的验证产物，旨在昂贵的开发开始之前揭示残酷真相。当你需要排除某项特定风险，或检验一个范围有限的假设，同时又**不构建生产级软件**时，请使用这种方法。PoL 探针是侦察任务，而不是 MVP——它们注定要被删除，而不是被规模化。

该框架可防止原型作秀（制作昂贵的演示来打动利益相关者，却无法带来任何认知），并迫使你根据实际学习目标选择匹配的验证方法。

## 输入

**最适合提供：** 你需要检验的假设或风险。  
**同样有帮助：** 哪些证据会改变你的看法、可用的时间和资源，以及你已经验证过哪些内容。

调用时一并提供的任何内容——技能名称后的文本、粘贴的上下文转储，或追加的 `ARGUMENTS:` 行——都视为已经给出的答案。使用这些信息，并跳过其已经涵盖的问题；不要重复询问。

**两手空空也没关系。** 在设计探针之前，该技能会先询问假设及其中风险最高的前提。

**调用示例：** `Define a PoL probe: we believe restaurant managers will photograph invoices daily if it auto-updates food costs.`

## 核心概念

### 什么是 PoL 探针？

**生命迹象验证（PoL）探针**是一种经过刻意设计、用后即弃的验证实验，旨在以尽可能低的成本和尽可能快的速度回答一个特定问题。它不是产品，不是 MVP，也不是试点项目——它是一项有针对性的真相探寻任务。

**起源：** 由 Dean Peters（Productside）提出，建立在 Marty Cagan 于 2014 年关于原型类型的研究以及 Jeff Patton 的原则之上：*"检验想法成本最高的方式，就是构建生产级软件。"*

---

### 5 项基本特征

每个 PoL 探针都必须满足以下标准：

| 特征 | 含义 | 重要性 |
|----------------|---------------|----------------|
| **轻量级** | 仅投入最低限度的资源（数小时或数天，而不是数周） | 如果成本很高，即使数据表明应该终止，你也会不愿放弃 |
| **用后即弃** | 明确计划将其删除，而不是规模化 | 防止沉没成本谬误和范围蔓延 |
| **范围有限** | 检验一个特定假设或风险 | 范围宽泛的实验会产生模棱两可的结果 |
| **绝对诚实** | 揭示残酷真相，而不是虚荣指标 | 只会讨好人的数据毫无用处 |
| **微小且聚焦** | 是侦察任务，绝不是 MVP | 覆盖面越小，学习周期越快 |

**反模式：** 如果你的“原型”精致到让人舍不得删除，它就不是 PoL 探针——而是原型作秀。

---

### PoL 探针与 MVP 的对比

| 维度 | PoL 探针 | MVP |
|-----------|-----------|-----|
| **目的** | 通过检验范围有限的假设来降低决策风险 | 证明想法合理，或为路线图方向辩护 |
| **范围** | 单一问题、单一风险 | 可交付的最小产品增量 |
| **生命周期** | 数小时至数天，之后删除 | 数周至数月，之后持续迭代 |
| **受众** | 内部团队 + 小范围用户样本 | 生产环境中的真实客户 |
| **保真度** | 只需提供足以捕捉信号的假象 | 生产级质量（或接近生产级） |
| **结果** | 了解什么*行不通* | 了解什么*行得通*（并将其发布） |

**关键区别：** PoL 探针是 **MVP 之前的侦察手段**。运行探针是为了决定*是否*应该构建 MVP，而不是为了发布产品。

---

### 5 种原型类型

应根据你的假设选择探针类型，而不是根据你对工具的熟悉程度来选择。

| 类型 | 核心问题 | 时间周期 | 工具/方法 | 适用场景 |
|------|---------------|----------|---------------|-------------|
| **1. 可行性检查** | “我们能构建这个吗？” | 1-2 天 | GenAI 提示链、API 测试、数据完整性扫描、用完即删的探索性代码 | 技术风险未知；第三方依赖不明确 |
| **2. 任务聚焦测试** | “用户能否顺畅地完成这项任务？” | 2-5 天 | Optimal Workshop、UsabilityHub、任务流程 | 需要验证关键时刻（字段标签、决策点、流失区域） |
| **3. 叙事型原型** | “这个工作流能否赢得利益相关者的支持？” | 1-3 天 | Loom 演示、Sora/Synthesia 视频、幻灯片式故事板 | 你需要“讲述而非测试”——分享故事并衡量兴趣 |
| **4. 合成数据模拟** | “我们能否在不承担生产环境风险的情况下对其建模？” | 2-4 天 | Synthea（用户模拟）、DataStax LangFlow（提示逻辑测试） | 探索边缘情况；暴露未知的未知 |
| **5. 氛围编码式 PoL 探针** | “这个解决方案能经受住真实用户的检验吗？” | 2-3 天 | ChatGPT Canvas + Replit + Airtable = “Frankensoft” | 你需要收集有关工作流/UX 的用户反馈，但不需要生产级代码 |

**黄金法则：***“使用成本最低、但最能揭示残酷真相的原型。如果它没有刺痛感，那很可能只是一场表演。”*

---

### 何时使用 PoL 探针

✅ **在以下情况下使用 PoL 探针：**
- 你有一个具体且可证伪的假设需要测试
- 某项特定风险阻碍了你的下一步决策（技术可行性、用户任务完成情况、利益相关者支持）
- 你需要快速获得残酷真相（几天内，而不是几周内）
- 构建生产级软件还为时过早或会造成浪费
- 你可以在开始之前明确说明“失败”是什么样子

❌ **不要在以下情况下使用 PoL 探针：**
- 你试图给高管留下深刻印象（那是原型表演）
- 你已经知道答案，只是想获得验证（那是确认偏误）
- 你无法明确说明清晰的假设或处置计划
- 学习目标过于宽泛（“客户会喜欢这个吗？”）
- 你用它来逃避做出艰难决策

---

## 应用

使用 `template.md` 获取完整的填写结构。

### PoL 探针模板

使用以下结构记录你的探针：

```markdown
# PoL Probe: [Descriptive Name]

## Hypothesis
[One-sentence statement of what you believe to be true]
Example: "If we reduce the onboarding form to 3 fields, completion rate will exceed 80%."

## Risk Being Eliminated
[What specific risk or unknown are you addressing?]
Example: "We don't know if users will abandon signup due to form length."

## Prototype Type
[Select one of the 5 flavors]
- [ ] Feasibility Check
- [ ] Task-Focused Test
- [ ] Narrative Prototype
- [ ] Synthetic Data Simulation
- [x] Vibe-Coded PoL Probe

## Target Users / Audience
[Who will interact with this probe?]
Example: "10 users from our early access waitlist, non-technical SMB owners."

## Success Criteria (Harsh Truth)
[What truth are you seeking? What would prove you wrong?]
- **Pass:** 8+ users complete signup in under 2 minutes
- **Fail:** <6 users complete, or average time exceeds 5 minutes
- **Learn:** Identify specific drop-off fields

## Tools / Stack
[What will you use to build this?]
Example: "ChatGPT Canvas for form UI, Airtable for data capture, Loom for post-session interviews."

## Timeline
- **Build:** 2 days
- **Test:** 1 day (10 user sessions)
- **Analyze:** 1 day
- **Disposal:** Day 5 (delete all code, keep learnings doc)

## Disposal Plan
[When and how will you delete this?]
Example: "After user sessions complete, archive recordings, delete Frankensoft code, document learnings in Notion."

## Owner
[Who is accountable for running and disposing of this probe?]

## Status
- [ ] Hypothesis defined
- [ ] Probe built
- [ ] Users recruited
- [ ] Testing complete
- [ ] Learnings documented
- [ ] Probe disposed
```

---

### 质量检查清单

在启动 PoL 探针之前，请确认：

- [ ] **轻量：** 能否在 1-3 天内构建完成？
- [ ] **可丢弃：** 是否已确定弃用日期？
- [ ] **范围狭窄：** 是否只测试一个假设？
- [ ] **绝对诚实：** 如果你错了，数据是否会让你感到难受？
- [ ] **小巧且聚焦：** 它是否比 MVP 更小？
- [ ] **可证伪：** 你能否描述“失败”是什么样子？
- [ ] **负责人明确：** 是否由一个人对执行和弃用该探针负责？

如果任何一个答案为“否”，请修改你的探针，或重新考虑是否确实需要探针。

---

## 示例

完整的 PoL 探针示例请参阅 `examples/sample.md`。

迷你示例摘录：

```markdown
**Hypothesis:** Users can distinguish "archive" vs "delete"
**Probe Type:** Task-Focused Test
**Pass:** 80%+ correct interpretation
```

## 常见陷阱

- 开展宽泛的“用户会喜欢这个吗？”实验，而不是测试一个可证伪的假设
- 将 PoL 探针视为 MVP 原型，并拒绝将其弃用
- 使用虚荣指标来回避令人不适的真相
- 在测试开始前跳过预先定义失败阈值的步骤
- 先选择工具，再确定假设

## 参考资料

### 相关技能
- **[pol-probe-advisor](skills/pol-probe-advisor/SKILL.md)**（交互式）— 用于选择应采用哪种原型类型的决策框架
- **[discovery-process](skills/discovery-process/SKILL.md)**（工作流）— 在验证阶段使用 PoL 探针
- **[problem-statement](skills/problem-statement/SKILL.md)**（组件）— 在创建 PoL 探针之前定义问题
- **[epic-hypothesis](skills/epic-hypothesis/SKILL.md)**（组件）— 在使用 PoL 探针进行测试之前构建假设

### 外部框架
- **Jeff Patton** — *User Story Mapping*（精益验证原则）
- **Marty Cagan** — *Inspired*（2014 年原型类型框架）
- **Dean Peters** — [*Vibe First, Validate Fast, Verify Fit*](https://deanpeters.substack.com/p/vibe-first-validate-fast-verify-fit)（Dean Peters 的 Substack，2025 年）

### 提及的工具
- **可行性：** GenAI（ChatGPT、Claude）、API 测试工具
- **任务聚焦型：** Optimal Workshop、UsabilityHub
- **叙事型：** Loom、Sora、Synthesia、Veo3（文本生成视频）
- **合成数据：** Synthea（患者模拟）、DataStax LangFlow
- **氛围编码型：** ChatGPT Canvas、Replit、Airtable、Carrd