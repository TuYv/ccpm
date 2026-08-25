---
name: develop-adr
description: Creates an Architecture Decision Record following the Nygard format to document significant technical decisions, their context, and consequences. Use when making technical choices that affect system architecture, technology selection, or development patterns.
license: Apache-2.0
metadata:
  phase: develop
  version: "3.0.0"
  updated: 2026-08-21
  category: specification
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 架构决策记录（ADR）

架构决策记录用于记录重要的技术决策，以及该决策的背景和后果。ADR 记录架构选择背后的“原因”，以便未来的团队成员理解其中的考量——尤其是在他们质疑为什么要以某种特定方式实施时，这一点非常重要。此技能遵循 Michael Nygard 的轻量级 ADR 格式。

## 适用场景

- 做出会影响系统架构的重要技术决策
- 在技术选项（框架、数据库、服务）之间进行选择
- 建立未来开发应遵循的模式
- 记录约束条件或非显而易见方案背后的理由
- 保存有关过去决策的组织知识

## 不适用场景

- 该决策属于产品或 UX 设计选择，而非架构或技术选择 -> 使用 `develop-design-rationale`
- 你仍在探索某种方案是否可行 -> 为探索设定时间限制，并先使用 `develop-spike-summary` 记录探索结果
- 你需要向利益相关者推介一个解决方案 -> 使用 `develop-solution-brief`；ADR 用于记录决策，而不是推销方案
- 实际上没有做出任何决策（现状保持不变）：没有决策的 ADR 只会制造噪音；等到确实做出决策后再记录

## 说明

当被要求创建 ADR 时，请遵循以下步骤：

1. **分配编号和标题**  
   ADR 按顺序编号（ADR-001、ADR-002 等），以便于引用。标题应是描述该决策的简短名词短语，例如“使用 PostgreSQL 存储订单数据”或“采用 React 作为前端框架”。

2. **设置状态**  
   新 ADR 的状态为“Proposed”。经过团队评审后，状态变为“Accepted”“Deprecated”或“Superseded by ADR-XXX”。状态变更应予以跟踪。

3. **描述背景**  
   解释促成该决策的情况。你要解决什么问题？有哪些影响因素（技术约束、团队专业能力、时间安排、成本）？这一部分应帮助当时不在场的读者理解为什么需要做出该决策。

4. **陈述决策**  
   清晰地阐明你们做出的决定。使用主动语态：“我们将使用……”而不是“经决定……”。具体说明该决策包含和不包含哪些内容。

5. **记录后果**  
   列出该决策带来的结果——包括积极、消极和中性的结果。优秀的 ADR 会如实说明权衡。哪些事情会变得更容易？哪些会变得更困难？这会产生哪些新的约束或选项？

6. **记录模型选择带来的后果** *(仅当决策选择了模型或使系统绑定到某个模型时)*
   否则完全跳过此步骤；它是 Consequences 下的一个子节，而不是第七个标题。模型选择与普通依赖项选择有一个对 ADR 而言至关重要的不同之处：你评估的对象将会被替换，而且通常会在该决策的生命周期内被替换。因此，应记录撤销该选择的代价，而不仅仅是记录最终胜出的选项。说明你是在构建、购买还是调用通用模型，以及是什么因素排除了另外两种方式；说明现在有哪些内容与该选择耦合（提示词、评估集、输出 schema、延迟预算）；说明你接受的运行成本，以及在多大规模下该成本将不再可接受；说明考虑到这些耦合后实际的逆转成本；并记录什么样的观测结果会促使你重新审视该 ADR，这是一项触发条件，而不是评审日期。

## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。一份完整的 ADR 应填写模板中的每个部分：状态；上下文；决策；后果；考虑过的替代方案；以及参考资料。

## 质量检查清单

完成前，请验证：

- [ ] 标题是简短、描述性的名词短语
- [ ] 已明确标注状态（提议/已接受/已弃用/已取代）
- [ ] 上下文说明了为什么需要做出此决策
- [ ] 使用主动语态清晰地陈述决策
- [ ] 后果同时包含积极和消极的结果
- [ ] ADR 无需依赖其他文档即可独立成立
- [ ] 如果决策选择或承诺采用某个模型：已记录耦合程度、运营成本、反转成本，以及会促使重新审视该决策的观察结果

## 示例

请参阅 `references/EXAMPLE.md` 中已完成的示例。