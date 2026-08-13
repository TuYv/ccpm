---
name: outcome-roadmap
description: "Transform an output-focused roadmap (feature list) into an outcome-focused one. Rewrites initiatives as outcome statements reflecting user and business impact. Use when a roadmap lists features instead of results, when making a roadmap more strategic, or when communicating what success looks like vs what will be built."
when_to_use: |
  Apply when:
  - CTO provides a feature list and asks "what should we do next quarter"
  - pm agent receives a roadmap full of features, not outcomes
  - stakeholders need to understand why we're building things, not just what
  - a roadmap review reveals it lists outputs (features) but not outcomes (results)
  Guards — do NOT apply when:
  - The input already states outcomes with metrics
  - This is a single-feature PRD (use /prd instead)
effort: low
allowed-tools: Read, Write
paths:
  - "docs/plans/**"
  - "docs/requirements/**"
---
# 成果路线图——从功能到成果

将以功能为中心的路线图转变为以成果为中心的路线图。

**核心原则：** 团队构建功能，但客户和企业关心的是成果。成果路线图传达的是「会发生什么变化」，而不是「要构建什么」。

---

## 转换公式

对路线图中的每项计划应用：

```
Enable [customer segment] to [desired customer outcome] so that [business impact]
```

示例：

| 产出（旧） | 成果（新） |
|---|---|
| 第二季度：构建高级搜索筛选器 | 第二季度：通过直观的发现体验，让客户查找产品的速度提升 50% |
| 第二季度：AI 推荐 | 第二季度：通过个性化推荐，将平均订单金额提高 20% |
| 第三季度：重新设计仪表板 | 第三季度：帮助运营人员监控所有系统，将花在仪表板上的时间减少 80% |
| 第三季度：SSO 集成 | 第三季度：消除企业管理员的身份验证阻碍，从而促成 3 笔以上企业客户交易 |
| 第四季度：移动应用 | 第四季度：让用户能够在移动端完成核心工作流，从而将 7 日留存率从 20% 提高到 35% |

---

## 如何应用

### 第 1 步——阅读现有路线图

如果用户提供了路线图文件，请阅读该文件。如果用户以口头方式描述，请提取计划列表。

对于每项计划，在内部思考：
- 计划了什么功能/项目？
- 我们**为什么**要构建它？它会为客户或企业带来什么变化？
- 哪项指标会得到改善，改善幅度是多少？
- 是否有其他更好的方式可以实现相同成果？

### 第 2 步——将每项计划改写为成果

对于路线图中的每个项目：

1. **识别产出**：计划了什么功能或项目？
2. **发掘成果**：我们为什么要构建它？持续追问「那又怎样？」，直到找到真正的客户价值或商业价值。
3. **改写**：使用上述公式。如有可能，请包含指标。

**「那又怎样？」追问链示例：**
- 「我们要添加搜索筛选器」→ 那又怎样？
- 「用户可以缩小结果范围」→ 那又怎样？
- 「用户可以更快找到想要的内容」→ 那又怎样？
- 「用户能够在放弃之前找到产品，因此转化率会提高」✅ 这就是成果。

### 第 3 步——按战略主题分组（可选）

如果路线图包含 5 个以上项目，请将相关成果归入不同主题：
- **留存**（能够降低流失率的成果）
- **获客**（能够提高转化率的成果）
- **变现**（能够增加每位用户收入的成果）
- **运营效率**（能够减少内部成本或时间的成果）

### 第 4 步——输出格式

```markdown
## Outcome Roadmap — <Product> <Quarter/Year>

### Strategic context
<1–2 sentences on what the team is optimising for this period>

### Q<N> Outcomes

| Initiative | Outcome Statement | Primary Metric | Target |
|------------|------------------|----------------|--------|
| <original feature name> | Enable [segment] to [outcome] so that [business impact] | <metric> | <target> |

### What we're NOT doing this quarter (and why)
- <deprioritised initiative>: <reason — not enough signal / too early / wrong priority>

### Key assumptions
- <assumption this roadmap depends on — if it's wrong, the outcomes change>
```

### 第 5 步 — 验证

在展示之前，请检查：
- 每个成果都包含可衡量的部分（百分比、数字、比率、频率）
- 已对每一项追问“那又怎样？”——不再保留单纯的功能描述
- 至少明确说明一项“不做的事项”——否则范围将不受限制
- 成果与 PROJECT.md 中声明的 OKR 或战略目标保持一致

---

## 反模式

❌ **“我们将构建 X”**——这是产出，而不是成果。

❌ **“改善用户体验”**——不可衡量。改写为：“将完成结账所需的时间从 4 分钟缩短至 90 秒”。

❌ **成果没有指标**——如果无法衡量，就无法知道是否已经实现。

❌ **需要构建特定解决方案才能实现的成果**——“让用户能够通过移动应用访问功能”限定了解决方案。更好的表述是：“让用户能够在任何设备上完成核心工作流”。

---

## 与 pm agent 集成

当 pm agent 收到一份没有 PRD 的功能列表时：
1. 检查该列表看起来是产出（功能名称）还是成果（结果陈述）
2. 如果是产出 → 在分解为任务之前，应用此 skill 进行转换
3. 将成果陈述作为每个任务组的“Why”传入 PLAN doc