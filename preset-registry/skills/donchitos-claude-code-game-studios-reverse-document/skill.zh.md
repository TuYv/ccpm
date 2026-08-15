---
name: reverse-document
description: "Generate design or architecture documents from existing implementation. Works backwards from code/prototypes to create missing planning docs."
argument-hint: "<type> <path> (e.g., 'design src/gameplay/combat' or 'architecture src/core')"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
model: sonnet
# Read-only diagnostic skill — no specialist agent delegation needed
---
# 逆向文档化

此技能用于分析现有实现（代码、原型、系统），并生成相应的设计或架构文档。适用于以下情况：
- 你在没有先编写设计文档的情况下构建了某项功能
- 你接手了一个没有文档的代码库
- 你制作了一个机制原型，现在需要将其正式文档化
- 你需要记录现有代码背后的“原因”

---

## 工作流程

## 阶段 1：解析参数

**格式**：`/reverse-document <type> <path>`

**类型选项**：
- `design` → 生成游戏设计文档（GDD 章节）
- `architecture` → 生成架构决策记录（ADR）
- `concept` → 根据原型生成概念文档

**路径**：要分析的目录或文件
- `src/gameplay/combat/` → 所有与战斗相关的代码
- `src/core/event-system.cpp` → 特定文件
- `prototypes/stealth-mech/` → 原型目录

**示例**：
```bash
/reverse-document design src/gameplay/magic-system
/reverse-document architecture src/core/entity-component
/reverse-document concept prototypes/vehicle-combat
```

## 阶段 2：分析实现

**阅读并理解代码/原型**：

**对于设计文档（GDD）：**
- 识别机制、规则和公式
- 提取玩法数值（伤害、冷却时间、范围）
- 查找状态机、能力系统和成长机制
- 识别代码中处理的边界情况
- 梳理依赖关系（哪些系统会相互交互？）

**对于架构文档（ADR）：**
- 识别模式（ECS、单例、观察者等）
- 理解技术决策（线程、序列化等）
- 梳理依赖关系和耦合
- 评估性能特征
- 找出约束和权衡

**对于概念文档（原型分析）：**
- 识别核心机制
- 提取涌现式玩法模式
- 记录哪些方面有效，哪些方面无效
- 找出有关技术可行性的见解
- 记录玩家幻想/体验感受

## 阶段 3：提出澄清问题

**不要**只是描述代码。要**询问**设计意图：

**设计问题**：
- “我发现了一个在 [activity] 期间会消耗的 [resource] 系统。这样设计是为了：
  - 控制节奏（防止滥用）？
  - 资源管理（增加策略深度）？
  - 还是其他原因？”
- “[mechanic] 似乎是核心机制。它是核心支柱，还是辅助功能？”
- “[Value] 会随 [factor] 呈指数增长。这是有意为之的设计，还是需要重新平衡？”

**架构问题**：
- “你使用了服务定位器模式。选择它是为了：
  - 可测试性（模拟依赖项）？
  - 解耦（减少硬引用）？
  - 还是从现有代码继承而来？”
- “我发现这里使用手动内存管理，而不是智能指针。这是出于性能要求，还是历史遗留原因？”

**概念问题**：
- “这个原型更强调潜行而不是战斗。这是预期的核心支柱吗？”
- “玩家似乎会利用抓钩来提高速度。这是功能还是缺陷？”

## 阶段 4：展示发现

在起草文档之前，展示你发现的内容：

```
I've analyzed [path]/. Here's what I found:

MECHANICS IMPLEMENTED:
- [mechanic-a] with [property] (e.g. timing windows, cooldowns)
- [mechanic-b] (e.g. interaction between two states)
- [resource] system (depletes on [action], regens on [condition])
- [state] system (builds up, triggers [effect])

FORMULAS DISCOVERED:
- [Output] = [formula using discovered variables]
- [Secondary output] = [formula]

UNCLEAR INTENT AREAS:
1. [Resource] system — pacing or resource management?
2. [Mechanic] — core pillar or supporting feature?
3. [Value] scaling — intentional design or needs tuning?

Before I draft the design doc, could you clarify these points?
```

等待用户澄清意图后再起草文档。

## 阶段 5：使用模板起草文档

根据类型，使用相应的模板：

| 类型 | 模板 | 输出路径 |
|------|----------|-------------|
| `design` | `templates/design-doc-from-implementation.md` | `design/gdd/[system-name].md` |
| `architecture` | `templates/architecture-doc-from-code.md` | `docs/architecture/[decision-name].md` |
| `concept` | `templates/concept-doc-from-prototype.md` | `prototypes/[name]/CONCEPT.md` 或 `design/concepts/[name].md` |

**草稿结构**：
- 记录**现有内容**（机制、模式、实现）
- 说明**其存在的原因**（与用户澄清后的意图）
- 确定**缺失的内容**（未处理的边界情况、设计缺口）
- 标记**后续工作**（平衡性调整、缺失功能）

## 阶段 6：展示草稿并请求批准

**协作协议**：
```
I've drafted the [system-name] design doc based on your code and clarifications.

[Show key sections: Overview, Mechanics, Formulas, Design Intent]

ADDITIONS I MADE:
- Documented [mechanic] as "[intent]" per your clarification
- Added edge cases not in code (e.g., what if [resource] hits 0 mid-[action]?)
- Flagged balance concern: [scaling type] scaling at [boundary condition]

SECTIONS MARKED AS INCOMPLETE:
- "[System] interaction with [other-system]" (not fully implemented yet)
- "[Variant or feature]" (only [subset] implemented so far)

May I write this to design/gdd/[system-name].md?
```

等待批准。用户可能会在写入前要求修改。

## 阶段 7：写入带有元数据的文档

获得批准后，使用特殊标记写入文件：

```markdown
---
status: reverse-documented
source: [path/]
date: [today]
verified-by: [User name]
---

# [System Name] Design

> **Note**: This document was reverse-engineered from the existing implementation.
> It captures current behavior and clarified design intent. Some sections may be
> incomplete where implementation is partial or intent was unclear.

[Rest of document...]
```

## 阶段 8：标记后续工作

写入后，建议后续步骤：

```
✅ Written to design/gdd/combat-system.md

FOLLOW-UP RECOMMENDED:
1. Run /balance-check on combat formulas (exponential scaling concern)
2. Create ADR for stamina system architecture decision
3. Implement missing edge cases:
   - Stamina depletion mid-combo behavior
   - Stagger state during dodge
4. Extend design doc when weapon variety is implemented

Would you like me to tackle any of these now?
```

---

## 模板选择逻辑

| 如果分析的是…… | 使用模板…… | 原因…… |
|----------------|-----------------|------------|
| `src/gameplay/*` | design-doc-from-implementation.md | 游戏玩法机制 → GDD |
| `src/core/*`, `src/ai/*` | architecture-doc-from-code.md | 核心系统 → ADR |
| `prototypes/*` | concept-doc-from-prototype.md | 实验 → 概念文档 |
| `src/networking/*` | architecture-doc-from-code.md | 技术系统 → ADR |
| `src/ui/*` | design-doc-from-implementation.md | UI/UX → 设计规范 |

---

## 示例会话：逆向记录系统文档

```
User: /reverse-document design src/gameplay/[system]

Agent: I'll analyze your [system] implementation to create a design doc.
       [Reads code, discovers mechanics, formulas]

Agent: I've analyzed src/gameplay/[system]/. Here's what I found:
       [Shows mechanics, formulas, unclear areas]

       Before drafting, could you clarify:
       1. [Resource] system intent?
       2. Is [mechanic] a core pillar?
       3. [Value] scaling — intentional or needs tuning?

User: 1. [Resource] is for pacing, prevent [unwanted behavior]
      2. [Mechanic] is core — I want [design intent]
      3. Yeah, exponential is too much, should be linear

Agent: Perfect, that clarifies the vision. Let me draft the design doc.
       [Shows draft with clarified intent]

       May I write this to design/gdd/[system-name].md?

User: Yes, write it.

Agent: ✅ Written to design/gdd/[system-name].md
       ✅ Marked as [REVERSE-DOCUMENTED]
       ✅ Flagged [value] scaling for rebalancing

       Next steps:
       - Update [formula] to [corrected scaling]
       - Run /balance-check to validate [curve]
       - Document [mechanic] as core pillar in game-pillars.md
```

---

## 协作协议

此技能遵循协作式设计原则：

1. **先分析**：阅读代码，理解实现
2. **询问意图**：询问“为什么”，而不只是“是什么”
3. **展示发现**：展示发现结果，突出不明确之处
4. **用户澄清**：区分设计意图与意外结果
5. **起草文档**：基于实际情况和设计意图创建文档
6. **展示草稿**：展示关键章节，说明新增内容
7. **获得批准**：“可以写入 [filepath] 吗？”批准后：结论：**COMPLETE** — 文档已生成。拒绝后：结论：**BLOCKED** — 用户拒绝写入。
8. **标记后续工作**：建议相关工作，但不要自动执行

**绝不要臆测意图。在记录“为什么”之前始终先询问。**