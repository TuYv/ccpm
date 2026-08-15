---
name: expert-panel
description: >-
  Score, evaluate, and iteratively improve any content or strategy using an
  auto-assembled panel of domain experts. Handles copy, sequences, landing pages,
  strategy docs, titles, charts, recruiting evaluations, or anything else that
  needs a quality gate. Recursively iterates until all scores hit 90+ (max 3
  rounds). Use when asked to: "expert panel this", "score this", "rate these
  variants", "quality check this", "panel review", "which version is better",
  "expert score", "evaluate this copy/strategy/page", or when another skill
  needs a quality gate on its output. Also triggers on: "score this landing page",
  "expert panel these email variants", "rate this headline", "panel these charts".
---
## 前置步骤（技能启动时运行）

```bash
# Version check (silent if up to date)
python3 telemetry/version_check.py 2>/dev/null || true

# Telemetry opt-in (first run only, then remembers your choice)
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

> **隐私：** 此技能会将使用情况记录在本地的 `~/.ai-marketing-skills/analytics/` 中。远程遥测仅在用户主动选择加入后启用。绝不会收集任何代码、文件路径或仓库内容。请参阅 `telemetry/README.md`。

---

# 专家评审组

通用评分与迭代改进引擎。根据待评估的内容自动组建合适的专家团队，进行评分并循环改进，直至达到 90 分以上。

---

## 第 1 步：信息收集——了解评分对象

从上下文中收集或推断：

1. **内容/产物**——要评分的对象（粘贴内容、文件路径或 URL）
2. **内容类型**——文案、序列、落地页、策略、标题、图表、候选人评估等
3. **产品背景**——正在销售/推广什么？目标受众是谁？属于什么领域/行业？
4. **变体**——是否有多个版本需要比较？（A/B/C）
5. **来源技能**——此输出是否来自另一个技能？（例如 `cold-outbound-optimizer`）
   如果是，请记下来源，以便在第 6 步中将反馈路由回来源技能。

如果根据对话可以明显判断上下文，则不要询问——直接继续。

---

## 第 2 步：自动组建专家评审组

根据内容类型和领域，组建一个由 **7–10 名专家**构成的评审组。

### 组建规则

1. **从内容类型专家开始。** 查看 `experts/` 目录，寻找与内容类型匹配的预构建评审组。
   如果存在完全匹配的评审组（例如，针对 LinkedIn 帖子的 `experts/linkedin.md`），
   则以其为基础。

2. **添加领域/产品专家。** 根据产品背景，添加 1–3 名了解
   特定行业或领域的专家。示例：
   - 为烘焙店营销评分 → 添加食品与饮料营销专家
   - 为 SaaS 落地页评分 → 添加 SaaS 转化专家
   - 为招聘推广内容评分 → 添加代理招聘专家 + 人才市场专家
   - 为医疗器械文案评分 → 添加医疗合规专家

3. **始终包含以下两名专家：**
   - **AI 写作检测专家**——参阅 `experts/humanizer.md`。权重：1.5x。不可省略。
   - **品牌调性匹配专家**——检查内容是否与已配置的品牌调性以及
     `references/patterns.md`（如存在）中已知的拒绝模式一致。

4. **检查已学习的模式。** 如果 `references/patterns.md` 存在，请读取该文件。如果其中有任何模式
   适用于此内容类型，请向评审组说明。出现已知的不良模式时扣分。

5. **专家人数上限为 10 人。** 如果专家超过 10 人，请合并职责重叠的角色。

### 评审组输出格式
列出每位专家的：姓名、视角/关注重点、检查内容。

---

## 第 3 步：选择评分量表

从 `scoring-rubrics/` 中选择合适的评分量表：

| 内容类型 | 评分量表文件 |
|---|---|
| 博客、社交媒体、电子邮件、新闻通讯、脚本 | `scoring-rubrics/content-quality.md` |
| 策略、建议、分析 | `scoring-rubrics/strategic-quality.md` |
| 落地页、广告、CTA | `scoring-rubrics/conversion-quality.md` |
| 图表、数据可视化、信息图 | `scoring-rubrics/visual-quality.md` |
| 候选人评估 | `scoring-rubrics/evaluation-quality.md` |
| 其他 | 根据最接近的两种评分量表综合制定 |

阅读所选的评分标准文件，了解详细的评判标准和分值分配。

---

## 步骤 4：评分——递归循环，直到达到 90+

**目标：所有专家的综合评分达到 90/100。不可妥协。最多 3 轮。**

### 每轮输出：

```
## Round [N] — Score: [AVG]/100

| Expert | Score | Key Feedback |
|--------|-------|--------------|
| [Name] | [0-100] | [One-line rationale] |
| ... | ... | ... |

**Aggregate:** [weighted average — humanizer at 1.5x]
**Top 3 weaknesses:** [ranked]
**Changes made:** [specific edits addressing each weakness]
```

随后附上修订后的内容/成果。

### 规则

- 评分必须绝对诚实。不得为了达到 90 分而虚增分数。
- 人性化专家的评分在综合评分中按 1.5 倍加权。
- 如果综合评分 < 90：找出最主要的 3 个弱点 → 修订 → 进入下一轮。
- 如果综合评分 ≥ 90：定稿并进入输出阶段。
- 3 轮后如果仍 < 90：返回最佳版本及真实评分，并说明阻碍其达到目标的因素。
- 在输出中展示所有轮次——迭代过程本身就是价值的一部分。

### 多版本比较模式

对多个版本（A/B/C）进行评分时：
- 由完整专家组对每个版本单独评分。
- 评分后，按综合评分对各版本进行排名。
- 如果最高分版本 < 90，则仅迭代最佳版本（不要迭代所有版本）。

---

## 步骤 5：输出格式

### 获胜者 + 评分（始终置于顶部）

```
## 🏆 Result: [SCORE]/100 — [PASS ✅ | NEEDS WORK ⚠️]

[Final content/artifact here]

**Iterations:** [N] rounds
**Panel:** [Expert names, comma-separated]
```

如果有多个版本：先展示获胜版本，再展示其他版本的评分。

```
## 🏆 Winner: Variant [X] — [SCORE]/100

[Winning content]

### Runner-up scores
- Variant A: 87/100
- Variant B: 82/100
- Variant C: 91/100 ← Winner
```

### 反馈历史（置于结果下方）

展示所有完整评分轮次。

```
---
<details>
<summary>📊 Scoring History (N rounds)</summary>

[All round tables from Step 4]

</details>
```

---

## 步骤 6：向来源反馈（对其他 Skill 的输出进行评分时）

当被评分的内容来自另一个 Skill 时，生成一份**来源改进简报**：

```
## 🔁 Feedback for [Source Skill]

### What scored low
- [Pattern]: [Specific example from this content]

### Suggested skill improvements
- [Concrete change to the source skill's process/rubric/prompt]

### Patterns to add to source skill
- [Any recurring weakness that should become a rule]
```

此简报可用于更新来源 Skill 的 SKILL.md 或评分标准。

---

## 步骤 7：记忆——从批准和拒绝中学习

在用户批准或拒绝专家组输出后：

### 批准时（评分 ≥ 90，用户接受）
记录有效的做法。除非出现新的正面模式，否则无需采取行动。

### 拒绝时（用户推翻专家组结论或拒绝评分达到 90+ 的内容）
1. 询问原因（或根据上下文推断）。
2. 使用以下格式向 `references/patterns.md` 添加一个新模式：

```markdown
## [Pattern Name]
- **Type:** rejection | preference | override
- **Content types:** [which types this applies to]
- **Rule:** [What to always/never do]
- **Example:** [The specific instance that triggered this]
- **Date:** [YYYY-MM-DD]
- **Point dock:** [-N points when detected]
```

3. 确认：“已添加模式：[一句话摘要]。今后，评审组将因此扣除 [N] 分。”

### 模式执行
每轮评分时，对照 `references/patterns.md` 检查内容。在专家评分开始前执行扣分。这意味着，即使个别专家遗漏了已知的不良模式，也仍会对其进行处罚。

---

## 参考文件

| 文件 | 用途 | 读取时机 |
|---|---|---|
| `experts/humanizer.md` | AI 写作检测量表（24 种模式） | 每次评分时 |
| `experts/[domain].md` | 常见领域的预构建专家评审组 | 领域匹配时 |
| `scoring-rubrics/content-quality.md` | 内容评分量表 | 内容评分时 |
| `scoring-rubrics/strategic-quality.md` | 策略评分量表 | 策略评分时 |
| `scoring-rubrics/conversion-quality.md` | 落地页/广告/CTA 评分量表 | 转化评分时 |
| `scoring-rubrics/visual-quality.md` | 图表/数据可视化/信息图评分量表 | 视觉评分时 |
| `scoring-rubrics/evaluation-quality.md` | 候选人/评估评分量表 | 评估评分时 |
| `references/patterns.md` | 已学习的拒绝模式 | 每次评分时 |
| `references/expert-assembly.md` | 用于自动组建评审组的领域专家示例 | 组建不熟悉领域的评审组时 |