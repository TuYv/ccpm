---
name: review-all-gdds
description: "Holistic cross-GDD consistency and game design review. Reads all system GDDs simultaneously and checks for contradictions between them, stale references, ownership conflicts, formula incompatibilities, and game design theory violations (dominant strategies, economic imbalance, cognitive overload, pillar drift). Run after all MVP GDDs are written, before architecture begins."
argument-hint: "[focus: full | consistency | design-theory | since-last-review]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Bash, AskUserQuestion, Task
model: opus
---
# 审查所有 GDD

此 Skill 会同时读取所有系统 GDD，并执行两项互补的审查，这些审查无法通过逐个独立审查 GDD 来完成：

1. **跨 GDD 一致性** — 文档之间的矛盾、过时引用和归属冲突
2. **游戏设计整体性** — 只有在同时审视所有系统时才会显现的问题：支配性策略、失衡的经济系统、认知过载、支柱偏移、相互竞争的进度循环

**这与 `/design-review` 不同**，后者审查单个 GDD 的内部完整性。此 Skill 审查的是所有 GDD 之间的*关系*。

**运行时机：**
- 所有 MVP 层级的 GDD 都已分别获得批准后
- 任何 GDD 在制作中期经过重大修订后
- 在 `/create-architecture` 开始之前（基于不一致 GDD 构建的架构会继承这些不一致）

**参数模式：**

**关注范围：** `$ARGUMENTS[0]`（留空 = `full`）

- **无参数 / `full`**：同时执行一致性检查和设计理论检查
- **`consistency`**：仅执行跨 GDD 一致性检查（速度更快）
- **`design-theory`**：仅执行游戏设计整体性检查
- **`since-last-review`**：仅检查自上次审查报告以来修改过的 GDD（基于 git）

---

## 阶段 1：加载所有内容

### 阶段 1a — L0：摘要扫描（快速、低 token 消耗）

在读取任何完整文档之前，使用 Grep 从所有 GDD 文件中提取 `## Summary` 章节：

```
Grep pattern="## Summary" glob="design/gdd/*.md" output_mode="content" -A 5
```

向用户显示清单：
```
发现 [N] 个 GDD。摘要：
  • combat.md — [摘要文本]
  • inventory.md — [摘要文本]
  ...
```

对于 `since-last-review` 模式：运行 `git log --name-only`，识别自上次审查报告文件写入以来修改过的 GDD。在完整读取任何文档之前，根据摘要向用户显示哪些 GDD 属于本次审查范围。仅对这些 GDD，以及它们的 "Key deps" 中列出的所有 GDD 继续执行 L1。

### 阶段 1b — 预加载注册表（快速建立基准）

在完整读取任何 GDD 之前，检查实体注册表：

```
Read path="design/registry/entities.yaml"
```

如果注册表存在且包含条目，则将其用作**预先构建的冲突基准**：其中包含已知实体、物品、公式和常量，以及它们的权威值和来源 GDD。在阶段 2 中，首先在 GDD 中 grep 已注册的名称——这比在尚不知道要查找什么的情况下先完整读取所有 GDD 更快。

如果注册表为空或不存在：在没有注册表的情况下继续。在报告中注明：
“实体注册表为空——一致性检查仅依赖完整读取 GDD。请在本次审查后运行 `/consistency-check` 以填充注册表。”

### 阶段 1c — L1/L2：加载完整文档

完整读取审查范围内的文档：

1. `design/gdd/game-concept.md` — 游戏愿景、核心循环、MVP 定义
2. `design/gdd/game-pillars.md`（如果存在）— 设计支柱和反支柱
3. `design/gdd/systems-index.md` — 权威系统列表、层级、依赖关系、状态
4. **`design/gdd/` 中审查范围内的每个系统 GDD** — 完整读取（跳过
   game-concept.md 和 systems-index.md——它们已在上面读取）

报告："已加载 [N] 份系统 GDD，涵盖 [M] 个系统。支柱：[list]。反支柱：[list]。"

如果系统 GDD 少于 2 份，则停止：
> "跨 GDD 审查至少需要 2 份系统 GDD。请先编写更多 GDD，
> 然后重新运行 `/review-all-gdds`。"

---

### 并行执行

阶段 2（一致性）和阶段 3（设计理论）彼此独立——它们读取相同的 GDD 输入，但生成各自独立的报告。应同时将两者生成为并行 Task 智能体，而不是等待阶段 2 完成后再启动阶段 3。收集两者的结果后，再编写合并报告。

**为阶段 2 和阶段 3 生成并行 Task 智能体时，始终传入：**
- 阶段 1 中加载的完整 GDD 文件路径列表（明确的路径，而不只是数量）
- 如果阶段 1b 加载了完整的 TR 注册表内容，则传入该内容（粘贴注册表文本，而不只是文件路径）
- 分配给该智能体所在阶段的具体检查清单项目（阶段 2 获取 2a–2f；阶段 3 获取 3a–3g）
- 来自 `.claude/docs/technical-preferences.md` 和 `docs/engine-reference/[engine]/VERSION.md` 的引擎名称与版本

不要依赖子智能体重新读取这些文件——它拥有自己的上下文窗口，除非在 Task 提示词中明确传入，否则无法访问阶段 1 的结果。

---

## 阶段 2：跨 GDD 一致性

检查每一对及每一组 GDD，以发现矛盾和缺口。

### 2a：依赖关系双向性

对于每份 GDD 的依赖关系部分，检查列出的每项依赖关系是否都是双向的：
- 如果 GDD-A 列出“依赖 GDD-B”，检查 GDD-B 是否将 GDD-A 列为依赖它的对象
- 如果 GDD-A 列出“被 GDD-C 依赖”，检查 GDD-C 是否将 GDD-A 列为依赖项
- 将任何单向依赖关系标记为一致性问题

```
⚠️  Dependency Asymmetry
[system-a].md lists: Depends On → [system-b].md
[system-b].md does NOT list [system-a].md as a dependent
→ One of these documents has a stale dependency section
```

### 2b：规则矛盾

对于任意 GDD 中定义的每条游戏规则、机制或约束，检查其他 GDD 是否针对同一情形定义了相互矛盾的规则：

需要扫描的类别：
- **下限/上限规则**：是否有某份 GDD 为输出定义了最小值？是否有其他 GDD 表示某个不同的系统可以绕过该下限？这些规则相互矛盾。
- **资源归属**：如果两份 GDD 都定义了某个共享资源如何累积或消耗，它们的定义是否一致？
- **状态转换**：如果 GDD-A 描述了角色死亡时会发生什么，GDD-B 对同一事件的描述是否一致？
- **时序**：如果 GDD-A 表示“X 在同一帧发生”，GDD-B 是否假定它是异步发生的？
- **叠加规则**：如果 GDD-A 表示状态效果可以叠加，GDD-B 是否假定它们不能叠加？

```
🔴 Rule Contradiction
[system-a].md: "Minimum [output] after reduction is [floor_value]"
[system-b].md: "[mechanic] bypasses [system-a]'s rules and can reduce [output] to 0"
→ These rules directly contradict. Which GDD is authoritative?
```

### 2c：过时引用

对于每个跨文档引用（GDD-A 提及来自 GDD-B 的机制、数值或系统名称），验证被引用的元素是否仍以相同名称和行为存在于 GDD-B 中：

- 如果 GDD-A 提到“战斗系统中的连击倍率会影响分数”，请检查
  战斗 GDD 是否确实定义了一个以分数为输出的连击倍率
- 如果 GDD-A 引用了“[system].md 中定义的成长曲线”，请检查
  [system].md 是否确实包含该曲线，而不是另一种不同的成长模型
- 如果 GDD-A 先于 GDD-B 编写，并假定了某项机制，而 GDD-B 后来
  采用了不同的设计，请将 GDD-A 标记为包含过时引用

```
⚠️  Stale Reference
inventory.md (written first): "Item weight uses the encumbrance formula
  from movement.md"
movement.md (written later): Defines no encumbrance formula — uses a flat
  carry limit instead
→ inventory.md references a formula that doesn't exist
```

### 2d：数据与调优参数的归属冲突

两个 GDD 不应同时声称拥有同一项数据或调优参数。扫描所有 GDD 中的
Tuning Knobs 章节，并标记重复项：

```
⚠️  Ownership Conflict
[system-a].md Tuning Knobs: "[multiplier_name] — controls [output] scaling"
[system-b].md Tuning Knobs: "[multiplier_name] — scales [output] with [factor]"
→ Two GDDs define multipliers on the same output. Which owns the final value?
  This will produce either a double-application bug or a design conflict.
```

### 2e：公式兼容性

对于公式相互关联的 GDD（一个公式的输出会作为另一个公式的输入），
请检查上游公式的输出范围是否处于下游公式预期的输入范围内：

- 如果 [system-a].md 输出的值介于 [min]–[max] 之间，而 [system-b].md
  的设计接收范围为 [min2]–[max2]，这种不匹配是有意为之吗？
- 如果某个经济系统 GDD 预期的资源获取量处于范围 X，而成长系统 GDD
  生成的资源量处于范围 Y，那么经济系统将变得过于简单或无法参与——
  这是有意为之吗？

将不兼容问题标记为 CONCERNS（需要进行设计判断，但不一定有误）：

```
⚠️  Formula Range Mismatch
[system-a].md: Max [output] = [value_a] (at max [condition])
[system-b].md: Base [input] = [value_b], max [input] = [value_c]
→ Late-[stage] [scenario] can resolve in a single [event].
  Is this intentional? If not, either [system-a]'s ceiling or [system-b]'s ceiling needs adjustment.
```

### 2f：验收标准交叉检查

扫描所有 GDD 中的 Acceptance Criteria 章节，查找相互矛盾之处：

- GDD-A 的标准：“玩家不会被单次攻击击杀”
- GDD-B 的标准：“Boss 攻击造成相当于玩家最大生命值 150% 的伤害”
这两项验收标准无法同时通过。

---

## 阶段 3：游戏设计的整体性

结合游戏设计理论和玩家心理，从整体上审查所有 GDD。这些问题无法通过
单独审查各个 GDD 发现，因为必须同时考察所有系统。

### 3a：成长循环竞争

一款游戏应有一个让玩家感受到它就是游戏“核心目标”的主导成长循环，
并由其他辅助循环为其提供支持。当多个系统以同等地位竞争主要成长驱动力时，
玩家将无法理解这款游戏的核心究竟是什么。

扫描所有 GDD，找出符合以下条件的系统：
- 奖励玩家的主要资源（XP、等级、声望、解锁项）
- 将自身定义为“核心”或“主要”循环
- 与其他具有相同作用的系统相比，具备相当的深度和时间投入要求

```
⚠️  Competing Progression Loops
combat.md: Awards XP, unlocks abilities, is described as "the core loop"
crafting.md: Awards XP, unlocks recipes, is described as "the primary activity"
exploration.md: Awards XP, unlocks map areas, described as "the main driver"
→ Three systems all claim to be the primary progression loop and all award
  the same primary currency. Players will optimise one and ignore the others.
  Consider: one primary loop with the others as support systems.
```

### 3b：玩家注意力预算

统计一次典型游戏过程中，有多少个系统需要玩家同时主动关注。每个需要主动管理的系统都会占用注意力：

- 主动 = 玩家必须在游戏过程中定期针对该系统做出决策
- 被动 = 系统自动运行，玩家能看到结果，但无需对其进行管理

同时存在超过 3-4 个主动系统，会让大多数玩家认知过载。请给出数量；如果并发主动系统超过 4 个，则进行标记：

```
⚠️  Cognitive Load Risk
Simultaneously active systems during [core loop moment]:
  1. [system-a].md — [decision type] (active)
  2. [system-b].md — [resource management] (active)
  3. [system-c].md — [tracking] (active)
  4. [system-d].md — [item/action use] (active)
  5. [system-e].md — [cooldown/timer management] (active)
  6. [system-f].md — [coordination decisions] (active)
→ 6 simultaneously active systems during the core loop.
  Research suggests 3-4 is the comfortable limit for most players.
  Consider: which of these can be made passive or simplified?
```

### 3c：优势策略检测

优势策略会让其他策略失去意义——玩家一旦发现它，就会只使用这一策略，并觉得游戏的其余部分很无聊。请检查以下情况：

- **资源垄断**：某种策略生成资源的速度显著快于所有其他策略
- **无风险强力策略**：某种策略同时具备高收益和低风险
  （如果存在高风险策略，它们就需要提供与风险成比例的更高收益）
- **没有权衡取舍**：某个选项在所有维度上都优于其他所有选项
- **显而易见的最优路径**：如果某个成长选择“显然正确”，
  那么其他选项就不是真正的选择

```
⚠️  Potential Dominant Strategy
combat.md: Ranged attacks deal 80% of melee damage with no risk
combat.md: Melee attacks deal 100% damage but require close range
→ Unless melee has a significant compensating advantage (AOE, stagger,
  resource regeneration), ranged is dominant — higher safety, only 20% less
  damage. Consider what melee offers that ranged cannot.
```

### 3d：经济循环分析

识别所有 GDD 中的全部资源（金币、XP、制作材料、耐力、
生命值、法力等）。对于每种资源，梳理其**来源**（玩家如何获得）
和**消耗途径**（玩家如何使用）。

标记危险的经济条件：

| 条件 | 表现 | 风险 |
|-----------|------|------|
| **无限来源，无消耗途径** | 资源无限累积 | 游戏后期变得轻而易举 |
| **有消耗途径，无来源** | 资源耗尽至零 | 系统变得不可用 |
| **来源 >> 消耗** | 盈余不断累积 | 资源变得毫无意义 |
| **消耗 >> 来源** | 资源持续稀缺 | 引发挫败感并形成门槛 |
| **正反馈循环** | 资源越多 → 越容易获得更多资源 | 领先者失控，优势滚雪球 |
| **无追赶机制** | 落后会加速扩大差距 | 进入无法挽回的状态 |

```
🔴 Economic Imbalance: Unbounded Positive Feedback
gold economy:
  Sources: monster drops (scales with player power), merchant selling (unlimited)
  Sinks: equipment purchase (one-time), ability upgrades (finite count)
→ After equipment and abilities are purchased, gold has no sink.
  Infinite surplus. Gold becomes meaningless mid-game.
  Add ongoing gold sinks (upkeep, consumables, cosmetics, gambling).
```

### 3e：难度曲线一致性

当多个系统随玩家进度进行缩放时，它们必须以相互兼容的方向和速率进行缩放。缩放曲线不匹配会造成意料之外的难度陡增或让游戏变得过于简单。

对于每个随时间缩放的系统，提取：
- 缩放的对象（敌人生命值、玩家伤害、资源成本、区域大小）
- 缩放方式（线性、指数、阶梯式）
- 缩放时机（等级、时间、区域）

比较所有缩放曲线。标记不匹配之处：

```
⚠️  Difficulty Curve Mismatch
combat.md: Enemy health scales exponentially with area (×2 per area)
progression.md: Player damage scales linearly with level (+10% per level)
→ By area 5, enemies have 32× base health; player deals ~1.5× base damage.
  The gap widens indefinitely. Late areas will become inaccessibly difficult
  unless the curves are reconciled.
```

### 3f：支柱一致性

每个系统都应明确服务于至少一个设计支柱。不服务于任何支柱的系统就是“设计导致的范围蔓延”——它虽然存在于游戏中，却无助于实现游戏的核心目标。

对于每个 GDD 系统，对照设计支柱检查其玩家幻想部分。标记任何其所述幻想无法映射到任一支柱的系统：

```
⚠️  Pillar Drift
fishing-system.md: Player Fantasy — "peaceful, meditative activity"
Pillars: "Brutal Combat", "Tense Survival", "Emergent Stories"
→ The fishing system serves none of the three pillars. Either add a pillar
  that covers it, redesign it to serve an existing pillar, or cut it.
```

同时检查反支柱——标记任何实现了反支柱明确声明游戏不会采用之内容的系统：

```
🔴 Anti-Pillar Violation
Anti-Pillar: "We will NOT have linear story progression — player defines their path"
main-quest.md: Defines a 12-chapter linear story with mandatory sequence
→ This system directly violates the defined anti-pillar.
```

### 3g：玩家幻想连贯性

所有系统中的玩家幻想应彼此兼容——它们应共同强化玩家在这款游戏中“是谁”这一一致身份。相互冲突的玩家幻想会造成身份认知混乱。

```
⚠️  Player Fantasy Conflict
combat.md: "You are a ruthless, precise warrior — every kill is earned"
dialogue.md: "You are a charismatic diplomat — violence is always avoidable"
exploration.md: "You are a reckless adventurer — diving in without a plan"
→ Three systems present incompatible identities. Players will feel the game
  doesn't know what it wants them to be. Consider: do these fantasies serve
  the same core identity from different angles, or do they genuinely conflict?
```

---

## 阶段 4：跨系统场景演练

从玩家的视角演练游戏流程，以发现仅在多个系统的交互边界上才会出现的问题——这些问题无法通过对各个 GDD 的静态分析发现。

### 4a：识别关键的多系统时刻

扫描所有 GDD，识别同时激活多个系统的 3–5 个最重要的面向玩家的时刻。重点查找：

- **战斗 + 经济重叠**：击杀会掉落资源的敌人、在战斗期间消耗资源、死亡/重生与经济状态发生交互
- **成长 + 难度重叠**：战斗中途触发升级、能力解锁改变战斗可行性、难度在成长里程碑处调整
- **叙事 + 玩法重叠**：对话选择锁定/解锁机制、故事节点中断资源循环、任务完成触发系统状态变化
- **3 个以上系统的链条**：任何触发系统 A、继而影响系统 B、再触发系统 C 的玩家操作（这些是风险最高的交互路径）

继续之前，用一句话描述列出每个已识别的场景。

### 4b：演练每个场景

对于每个场景，明确地逐步梳理以下序列：

1. **触发条件**——什么玩家操作或游戏事件会启动这一流程？
2. **激活顺序**——哪些系统会激活，其先后顺序是什么？
3. **数据流**——每个系统会输出什么，该输出是否是链条中下一个系统的有效输入？
4. **玩家体验**——玩家在每一步会看到、听到或感受到什么？
5. **失败模式**——是否存在以下任何情况？
   - **竞态条件**：两个系统试图同时修改同一状态
   - **反馈循环**：系统 A 放大系统 B，而系统 B 又反过来放大系统 A，且没有上限或抑制机制
   - **状态转换中断**：某个系统依赖一个可能已被前一个系统改变的状态假设（例如，在可能导致玩家死亡的战斗步骤之后，仍假设“玩家存活”）
   - **信息传达矛盾**：玩家收到来自两个系统针对同一事件的冲突反馈（例如，“成功”音效 + “失败”UI）
   - **叠加的难度突增**：两个系统都在同一个成长节点提升难度，使预期的难度增幅成倍增加
   - **奖励冲突**：两个系统都对同一触发条件给予奖励，导致奖励总和超过预期价值（重复获利）
   - **未定义行为**：GDD 未说明在这种组合状态下会发生什么（两个系统的规则都未涵盖该情况）

```
Example walkthrough:
Scenario: Player kills elite enemy at level-up threshold during active quest

Trigger: Player lands killing blow on elite enemy
→ combat.md: awards kill XP (100 pts)
→ progression.md: XP total crosses level threshold → triggers level-up
  Output: new level, stat increases, ability unlock popup
→ quest.md: kill-count criterion met → triggers quest completion event
  Output: quest reward XP (500 pts), completion fanfare
→ progression.md (again): quest XP added → triggers SECOND level-up in same frame
  ⚠️  Data flow issue: quest.md awards XP without checking if a level-up
  is already in progress. progression.md has no guard against concurrent
  level-up events. Undefined behavior: does the player level up once or twice?
  Does the ability popup fire twice? Does the second level use the updated or
  pre-update stat baseline?
```

### 4c：标记场景问题

对于演练过程中发现的每个问题，按严重程度分类：

- **阻断问题**：未定义行为、损坏的状态转换或相互矛盾的玩家提示——在此场景中，体验已损坏或不连贯
- **警告**：叠加式峰值、无上限的反馈循环、奖励冲突——体验可以正常运作，但会产生非预期结果
- **信息**：轻微的顺序歧义或提示重叠——值得注意，但不太可能造成玩家可感知的问题

将所有发现添加到输出报告的 **“跨系统场景问题”** 下。
每项发现必须注明：场景名称、涉及的具体系统、问题发生的步骤，以及故障模式的性质。

---

## 阶段 5：输出审查报告

```
## Cross-GDD Review Report
Date: [date]
GDDs Reviewed: [N]
Systems Covered: [list]

---

### Consistency Issues

#### Blocking (must resolve before architecture begins)
🔴 [Issue title]
[What GDDs are involved, what the contradiction is, what needs to change]

#### Warnings (should resolve, but won't block)
⚠️  [Issue title]
[What GDDs are involved, what the concern is]

---

### Game Design Issues

#### Blocking
🔴 [Issue title]
[What the problem is, which GDDs are involved, design recommendation]

#### Warnings
⚠️  [Issue title]
[What the concern is, which GDDs are affected, recommendation]

---

### Cross-System Scenario Issues

Scenarios walked: [N]
[List scenario names]

#### Blockers
🔴 [Scenario name] — [Systems involved]
[Step where failure occurs, nature of the failure mode, what must be resolved]

#### Warnings
⚠️  [Scenario name] — [Systems involved]
[What the unintended outcome is, recommendation]

#### Info
ℹ️  [Scenario name] — [Systems involved]
[Minor ordering ambiguity or note]

---

### GDDs Flagged for Revision

| GDD | Reason | Type | Priority |
|-----|--------|------|----------|
| [system-a].md | Rule contradiction with [system-b].md | Consistency | Blocking |
| [system-c].md | Stale reference to nonexistent mechanic | Consistency | Blocking |
| [system-d].md | No pillar alignment | Design Theory | Warning |

---

### Verdict: [PASS / CONCERNS / FAIL]

PASS: No blocking issues. Warnings present but don't prevent architecture.
CONCERNS: Warnings present that should be resolved but are not blocking.
FAIL: One or more blocking issues must be resolved before architecture begins.

### If FAIL — required actions before re-running:
[Specific list of what must change in which GDD]
```

---

## 阶段 6：编写报告并标记 GDD

使用 `AskUserQuestion` 请求写入权限：
- 提示："我可以将此评审写入 `design/gdd/gdd-cross-review-[date].md` 吗？"
- 选项：`[A] Yes — write the report` / `[B] No — skip`

如果有任何 GDD 被标记为需要修订，请再次使用 `AskUserQuestion`：
- 提示："我是否应该更新系统索引，将这些 GDD 标记为需要修订？（[被标记的 GDD 列表]）"
- 选项：`[A] Yes — update systems index` / `[B] No — leave as-is`
- 如果选择是：将 systems-index.md 中每个被标记 GDD 的 Status 字段更新为 "Needs Revision"。
  （不要在状态值后附加括号说明——其他 Skill 会精确匹配 "Needs Revision"，
  添加括号说明会导致匹配失败。）

### 会话状态更新

写入报告后（如果获得批准，也要更新系统索引），静默追加以下内容到 `production/session-state/active.md`：

    ## Session Extract — /review-all-gdds [date]
    - Verdict: [PASS / CONCERNS / FAIL]
    - GDDs reviewed: [N]
    - Flagged for revision: [comma-separated list, or "None"]
    - Blocking issues: [N — brief one-line descriptions, or "None"]
    - Recommended next: [the Phase 7 handoff action, condensed to one line]
    - Report: design/gdd/gdd-cross-review-[date].md   ← only if user approved the write
    - Report: (not written — user declined at [date])  ← only if user declined the write

根据用户对阶段 6 中写入权限控件的响应，使用相应的行。

如果 `active.md` 不存在，则创建该文件，并将此块作为初始内容。
在对话中确认："会话状态已更新。"

---

## 阶段 7：交接

完成所有文件写入后，使用 `AskUserQuestion` 显示结束控件。

在构建选项之前，检查项目状态：
- 是否有任何属于简单编辑的 Warning 级别条目（标有 "30-second edit"、"brief addition" 或类似描述）？→ 提供内联快速修复选项
- 是否有任何 GDD 出现在 "Flagged for Revision" 表中？→ 为每个 GDD 提供 /design-review 选项
- 读取 systems-index.md，找出下一个 Status: Not Started 的系统 → 提供 /design-system 选项
- 结论是否为 PASS 或 CONCERNS？→ 提供 /gate-check 或 /create-architecture

动态构建选项列表——仅包含适用的选项：

**选项池：**
- `[_] Apply quick fix: [W-XX description] in [gdd-name].md — [effort estimate]`（每个简单编辑类警告对应一个选项；仅适用于 Warning 级别，不适用于 Blocking）
- `[_] Run /design-review [flagged-gdd-path] — address flagged warnings`（如果存在被标记的 GDD，则每个 GDD 对应一个选项）
- `[_] Run /design-system [next-system] — next in design order`（始终包含，并注明实际系统名称）
- `[_] Run /create-architecture — begin architecture (verdict is PASS/CONCERNS)`（如果结论不是 FAIL，则包含）
- `[_] Run /gate-check — validate Systems Design phase gate`（如果结论是 PASS，则包含）
- `[_] Stop here`

仅为实际包含的选项依次分配字母 A、B、C……。将最能推进流水线的选项标记为 `(recommended)`。

绝不要以纯文本结束此 Skill。始终使用此控件收尾。

---

## 错误恢复协议

如果任何已启动的代理返回 BLOCKED、报错或未能完成：

1. **立即说明**：在继续之前报告“[AgentName]: BLOCKED — [reason]”
2. **评估依赖关系**：如果后续阶段需要被阻塞代理的输出，则在没有用户输入的情况下，不要越过该阶段继续执行
3. **通过 AskUserQuestion 提供选项**，包含以下三个选择：
   - 跳过此代理，并在最终报告中注明缺失内容
   - 缩小范围后重试（减少 GDD 数量、仅聚焦单个系统）
   - 在此停止并优先解决阻塞问题
4. **始终生成部分报告**——输出所有已完成的内容，避免工作成果丢失

---

## 协作协议

1. **静默阅读**——在展示任何内容之前加载所有 GDD
2. **展示全部内容**——在请求采取任何行动之前，完整呈现一致性与设计理论分析
3. **区分阻塞性问题与建议性问题**——并非每个问题都需要阻塞架构设计；应明确指出哪些问题会造成阻塞
4. **不要做出设计决策**——标记矛盾和可选方案，但绝不要单方面决定哪个 GDD 是“正确的”
5. **写入前先询问**——在撰写报告或更新系统索引之前先获得确认
6. **具体明确**——每个问题都必须引用所涉及的确切 GDD、章节和文本；不要给出含糊的警告