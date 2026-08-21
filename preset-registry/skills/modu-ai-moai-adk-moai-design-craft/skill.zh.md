---
name: moai-design-craft
description: >
  Intent-First design craft specialist covering design direction, domain vocabulary,
  design memory, and post-build critique. Use when establishing design intent or
  auditing code against design principles.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Grep, Glob
user-invocable: false
metadata:
  version: "1.2.0"
  category: "domain"
  status: "active"
  updated: "2026-03-30"
  modularized: "true"
  tags: "design, craft, intent-first, design-direction, domain-exploration, design-memory, critique, web-copy, ux-writing, headline, cta"
  related-skills: "moai-domain-uiux, moai-design-tools, moai-domain-frontend"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 4500

# MoAI Extension: Triggers
triggers:
  keywords: ["intent-first", "design craft", "design direction", "design intent", "domain exploration", "design critique", "craft review", "design memory", "design system", "system.md", "design audit", "why before what", "design extract", "interface design", "web copy", "ux writing", "headline", "cta copy", "landing page copy", "anti-ai writing"]
  agents: ["expert-frontend", "team-designer"]
  phases: ["plan", "run", "review"]
---
# 设计工艺专家

将意图优先的设计理念集成到 MoAI 工作流中。确保设计决策源于意图和领域理解，而非视觉冲动。

## 核心理念

**意图优先**：在做出任何视觉或组件决策之前，先明确*为什么*——所处领域、目标用户、交互契约，以及适用的工艺原则。

三种设计工艺操作：

| 操作 | 时机 | 作用 |
|-----------|------|--------------|
| 设计方向 | 在 `/moai plan` 阶段（设计关键词） | 领域探索、意图捕捉、术语对齐 |
| 设计审计 | 在 `/moai review --design` 阶段 | 依据 `.moai/design/system.md` 检查实现 |
| 设计评析 | 在 `/moai review --critique` 阶段 | 构建后的工艺审查：观察、诊断、重建设计决策 |

## 模块索引

- `modules/intent-first.md` — 意图优先流程：领域探索、设计方向、术语体系
- `modules/design-memory.md` — `.moai/design/system.md` 读写协议
- `modules/critique-workflow.md` — 构建后评析：观察 → 诊断 → 重建、硬性规则和拒绝标准
- `modules/web-copy-craft.md` — Web 文案指南：避免 AI 腔写作、标题公式、CTA 模式、正文节奏

## 快速参考

### 设计方向（规划阶段）

当 manager-spec 检测到与设计相关的关键词时，触发设计方向流程：

1. 读取 `.moai/design/system.md`（如果存在），获取已建立的术语体系和意图
2. 探索领域：用户正在做什么？其心智模型是什么？成功会带来怎样的感受？
3. 用 1–3 句话定义设计意图
4. 确定 3–5 个领域术语
5. 将设计方向写入 `.moai/design/system.md`

### 设计审计（审查阶段）

调用 `/moai review --design` 时：

1. 读取 `.moai/design/system.md`，获取当前设计系统规则
2. 根据这些规则扫描 UI 组件
3. 报告违规项，并提供 file:line 引用
4. 建议保留现有结构的最小化修复方案

### 设计评析（审查阶段）

调用 `/moai review --critique` 时：

1. 观察：构建出的界面实际实现了什么？（而不是它原本应该实现什么）
2. 诊断：实现在哪些方面偏离了意图？
3. 决策：修补（轻微偏差）还是重建（根本性错位）

### Web 文案工艺（运行阶段）

当 expert-frontend 或 team-designer 生成网页时，应用文案工艺规则：

1. 使用标题公式：数字锚点、反转、直接提问、共情钩子、宣言
2. 改变句子节奏——绝不连续使用三个结构相同的句子
3. 用具体事实（数字、名称、日期）替换模糊的强化用语
4. 去除 AI 填充式短语（"In today's fast-paced world"、"Unlock the potential"）
5. CTA 按钮：动词优先、以结果为导向、每个视口仅设置一个

## 配合使用效果良好

- `moai-domain-uiux` — 设计令牌、WCAG、无障碍设计（互为补充，不相重叠）
- `moai-design-tools` — Figma/Pencil 工具操作机制（互为补充，不相重叠）
- `moai-domain-frontend` — 组件实现模式

---

版本：1.2.0
最后更新：2026-03-30

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “设计方向只是审美问题，代码的工作方式都一样” | 设计意图会影响用户感知和品牌一致性。缺乏设计方向的代码会产生千篇一律、令人过目即忘的界面。 |
| “我会在实现过程中确定设计词汇” | 在没有设计词汇的情况下命名组件，会产生不一致的名称。应在构建前确立词汇。 |
| “设计记忆没有必要，设计系统就是参考依据” | 设计系统定义要使用什么。设计记忆则记录决策为何做出，以及哪些方案被否决。 |
| “构建后的评审只是一种形式” | 评审会揭示意图与执行之间的偏差。没有评审，这种差距会随着每次迭代不断累积。 |
| “这是内部工具，设计并不重要” | 内部用户与外部用户承受着相同的认知负荷。糟糕的设计会增加培训成本和错误率。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 实现偏离既定设计方向，且没有记录原因
- 组件命名与已确立的设计词汇不一致
- 做出设计决策时未参考设计记忆或先前决策
- 完成重大 UI 实现后未进行构建后评审
- 更改 UI 文案前未参考品牌语调或视觉识别

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 在实现开始前记录设计方向
- [ ] 组件名称符合已确立的设计词汇
- [ ] 已查阅设计记忆中相关的先前决策
- [ ] 已完成构建后评审，对比设计意图与实际执行
- [ ] 在颜色、字体排印和间距选择中参考品牌视觉识别

<!-- moai:evolvable-end -->