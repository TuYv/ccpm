---
name: content-quality-auditor
description: 'Use when auditing content quality, E-E-A-T, or publish readiness; runs 80-item CORE-EEAT scoring with veto checks and a fix plan. Not for structural on-page tags/headers — use on-page-seo-auditor; not for domain/citation trust — use domain-authority-auditor. 内容质量/EEAT评分'
version: "9.9.12"
license: Apache-2.0
allowed-tools: WebFetch
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/seo-geo-claude-skills"
when_to_use: "Use when auditing content quality before publishing. Runs CORE-EEAT 80-item scoring with veto checks. Also when the user asks for E-E-A-T analysis or publish readiness."
argument-hint: "<URL or paste content> [keyword]"
class: auditor
metadata:
  author: aaron-he-zhu
  version: "9.9.12"
  geo-relevance: "high"
---
# 内容质量审计器

> 基于 [CORE-EEAT 内容基准](https://github.com/aaron-he-zhu/core-eeat-content-benchmark)。完整基准参考：[references/core-eeat-benchmark.md](../../references/core-eeat-benchmark.md)

此技能依据划分为 8 个维度的 80 项标准化准则评估内容质量。它会生成一份全面的审计报告，包括逐项评分、维度与体系评分、按内容类型计算的加权总分，以及按优先级排序的行动计划。

## 必须触发此技能的情形

当内容在发布前需要进行质量检查时，请使用此技能——即使用户没有使用审计相关术语：

- 用户询问“这是否可以发布”或“这篇内容质量如何”
- 用户刚刚使用 seo-content-writer 或 content-refresher 完成写作
- **PostToolUse 钩子建议**：内容完成撰写或经过大幅编辑后，由命令支持的钩子可能会建议执行此审计。由钩子触发时，跳过设置问题——直接审计刚刚生成的内容。
- 在发布前审计内容质量
- 评估现有内容中可改进的机会
- 依据 CORE-EEAT 标准对内容进行基准评估
- 将内容质量与竞争对手进行比较
- 同时评估 GEO 就绪度（被 AI 引用的潜力）和 SEO 强度（来源可信度）
- 将定期内容质量检查作为内容维护计划的一部分
- 使用 seo-content-writer 或 geo-content-optimizer 撰写或优化内容之后

## 此技能的作用

1. **完整的 80 项审计**：将每个 CORE-EEAT 检查项评为通过/部分通过/未通过
2. **维度评分**：计算全部 8 个维度的分数（每个维度 0-100 分）
3. **体系评分**：计算 GEO 分数（CORE）和 SEO 分数（EEAT）
4. **加权总分**：应用特定于内容类型的权重来计算最终分数
5. **否决项检测**：标记严重的信任违规问题（T04、C01、R10）
6. **优先级排序**：按影响程度确定最重要的 5 项改进
7. **行动计划**：生成具体且可执行的改进步骤

## 快速开始

从以下提示词之一开始。最后使用 [Skill Contract](../../references/skill-contract.md) 中的仓库格式给出发布结论和交接摘要。

### 审计内容

```
Audit this content against CORE-EEAT: [content text or URL]
```

```
Run a content quality audit on [URL] as a [content type]
```

### 指定内容类型进行审计

```
CORE-EEAT audit for this product review: [content]
```

```
Score this how-to guide against the 80-item benchmark: [content]
```

### 对比审计

```
Audit my content vs competitor: [your content] vs [competitor content]
```

## 技能契约

**门禁结论**：**SHIP**（无严重问题，维度分数高于阈值）/ **FIX**（发现问题，但均不严重）/ **BLOCK**（某项严重信任问题未通过——请参阅报告中的“需要修复的严重问题”）。始终在报告顶部使用通俗语言醒目地说明结论，而不要使用检查项 ID。

**预期输出**：一份 CORE-EEAT 审计报告、一个发布就绪度结论，以及一份可直接用于 `memory/audits/content/` 的简短交接摘要。

- **读取**：目标内容、内容类型和支持证据。
- **写入**：面向用户的审计报告，以及可存储在 `memory/audits/content/` 下的可复用摘要。
- **提升**：将否决项和发布阻断项提升至 `memory/hot-cache.md`（自动保存，无需用户确认）。将最优先的改进事项提升至 `memory/open-loops.md`。
- **完成条件**：全部 80 个 CORE-EEAT 项目均已评分或标记为 N/A，已给出 SHIP/FIX/BLOCK 结论，已设置 `cap_applied`/`raw_overall_score`/`final_overall_score`，并且任何否决项（T04/C01/R10）均已明确指出并附有修复方案。
- **主要后续技能**：结论明确后，使用下方的 `Next Best Skill`。

## 数据源

> 有关工具类别占位符，请参阅 [CONNECTORS.md](../../CONNECTORS.md)。

**已连接~~网页爬虫 + ~~SEO 工具时：**
遵循 [SECURITY.md §抓取边界](../../SECURITY.md)，仅获取用户提供或授权的 URL；然后提取 HTML、schema、链接和竞品内容。

**仅有手动提供的数据时：**
请用户提供：
1. 内容文本、URL 或文件路径
2. 内容类型（如果无法自动检测）：产品评测、操作指南、对比、落地页、博客文章、常见问题页面、替代方案、最佳榜单或用户证言
3. 可选：用于基准比较的竞品内容

使用提供的数据执行完整的 80 项审计。在输出中注明由于缺少访问权限而无法充分评估的项目（例如反向链接数据、schema 标记、站点级信号）。

## 决策关卡

当需要暂停并询问时，始终：(1) 说明具体数值和阈值，(2) 提供带有相应结果的编号选项。

**在以下情况下暂停并询问用户：**
- 内容未达到其类型的最低字数要求（博客/指南：300 词；产品/落地页：150 词；常见问题：少于 3 个条目，且每个条目不少于 50 词）——说明实际字数，并提供以下选项：(1) 扩充至最低要求，(2) 继续审计并标记“数据不足”，(3) 取消
- 无法自动检测内容类型——说明检测到的内容，并在继续前请求确认
- 内容以媒体（视频/图片）为主，文本极少——询问是审计转录文本、替代文本，还是跳过
- 某个维度中超过 50% 的项目为 N/A——指出该维度，并询问：(1) 提供补充数据，(2) 将整个维度标记为“数据不足”
- 触发任何否决项——立即标记该项目 ID，并询问：(1) 停止以立即修复，(2) 继续完整审计并在报告中标记

**静默继续（绝不因此暂停）：**
- 某个维度内的单项 Partial 评分
- 缺少 SEO 工具数据（将项目标记为 N/A 并继续）
- 总体评分较低（报告是交付成果，而不是主观裁决）
- 用户未指定内容类型（自动检测并说明你的假设）

## 说明

当用户请求内容质量审计时：

### 第 1 步：准备

```markdown
### Audit Setup

**Content**: [title or URL]
**Content Type**: [auto-detected or user-specified]
**Dimension Weights**: [loaded from content-type weight table]

#### Critical Trust Check (Emergency Brake)

| Check | Status | Action |
|-------|--------|--------|
| Affiliate links disclosed | ✅ Pass / ⚠️ CRITICAL | [If CRITICAL: "Add disclosure banner at page top immediately"] |
| Title matches page content | ✅ Pass / ⚠️ CRITICAL | [If CRITICAL: "Rewrite title and first paragraph to match"] |
| Data points are consistent | ✅ Pass / ⚠️ CRITICAL | [If CRITICAL: "Verify all data before publishing"] |
```

如果任何否决项被触发，请在报告顶部显著标记，并建议在继续完整审计之前立即采取行动。

### 步骤 2：CORE 审计（40 项）

根据 [references/core-eeat-benchmark.md](../../references/core-eeat-benchmark.md) 中的标准评估每个项目。

为每个项目评分：
- **通过** = 10 分（完全符合标准）
- **部分通过** = 5 分（部分符合标准）
- **未通过** = 0 分（不符合标准）

```markdown
### C — Contextual Clarity

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| C01 | Intent Alignment | Pass/Partial/Fail | [specific observation] |
| C02 | Direct Answer | Pass/Partial/Fail | [specific observation] |
| ... | ... | ... | ... |
| C10 | Semantic Closure | Pass/Partial/Fail | [specific observation] |

**C Score**: [X]/100
```

对 **O**（组织性）、**R**（可引用性）和 **E**（独特性）重复使用相同的表格格式，并对每个维度的全部 10 个项目进行评分。

### 步骤 3：EEAT 审计（40 项）

```markdown
### Exp — Experience

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| Exp01 | First-Person Narrative | Pass/Partial/Fail | [specific observation] |
| ... | ... | ... | ... |

**Exp Score**: [X]/100
```

对 **Ept**（专业知识）、**A**（权威性）和 **T**（可信度）重复使用相同的表格格式，并对每个维度的全部 10 个项目进行评分。

有关完整的 80 项 ID 查找表和站点级项目处理说明，请参阅 [references/item-reference.md](references/item-reference.md)。

## 审计员操作手册——请先阅读此部分

**评分之前，`Read ../../references/auditor-runbook.md`。** 它是权威且不依赖具体框架的
操作流程：§1 交接模式、§2 严重失败分数上限方法 + 决策表 + 确定性取整、
§4 产物门禁 7 项检查清单、§5 面向用户的转换格式，以及不受信任内容的
安全边界。它通过相对路径在本地加载（无需网络）——请勿跳过。本技能正文
仅包含以下 **CORE-EEAT 特有**内容：加权计算示例、内容级防护规则以及 CORE-EEAT 否决 ID 转换行。

### 交接摘要

输出
[references/auditor-runbook.md §1](../../references/auditor-runbook.md) 中定义的审计员类交接内容：`status`、`objective`、
`key_findings`、`evidence_summary`、`recommended_next_skill`，以及审计员字段 `cap_applied`、
`raw_overall_score`（按内容类型加权、向下取整、应用上限之前）和 `final_overall_score`。

## §2（CORE-EEAT）· 计算示例——加权上限运算

> 按照操作手册中的 §2 决策表执行，然后参照下方与之匹配的示例。`raw_overall_score`
> 是**按内容类型加权的总分**（Σ 维度分数 × 
> [core-eeat-benchmark.md §Content-Type Weight Table](../../references/core-eeat-benchmark.md) 中的权重），
> 向下取整，且是在应用上限之前计算。绝不能使用未加权的 /8 平均值。

### 计算示例 1——单个否决项，原始维度分数高于上限（产品评测）

```
Dimensions:  C=75 O=77 R=80 E=75 Exp=78 Ept=77 A=77 T=85
Weights (Product Review): C .10  O .10  R .15  E .20  Exp .20  Ept .05  A .05  T .15
Weighted:    75×.10 + 77×.10 + 80×.15 + 75×.20 + 78×.20 + 77×.05 + 77×.05 + 85×.15
           = 7.5 + 7.7 + 12.0 + 15.0 + 15.6 + 3.85 + 3.85 + 12.75 = 78.25 → raw_overall = 78

Veto check: T04 failed (affiliate links without disclosure)

After cap:  T dimension 85 → 60 (capped down, raw > 60)
            Overall 78 → 60 (any veto forces overall cap)

Handoff:    cap_applied: true   raw_overall_score: 78   final_overall_score: 60
            key_findings:
              - title: "Missing affiliate disclosure"
                severity: veto
                evidence: "No disclosure banner; 3 affiliate links detected in body"
```

### 完整示例 2 — 单个否决项，原始维度分已低于上限（FAQ 页面）

```
Dimensions:  C=55 O=75 R=88 E=80 Exp=80 Ept=75 A=82 T=85
Weights (FAQ Page): C .25  O .25  R .15  E .05  Exp .05  Ept .10  A .05  T .10
Weighted:    55×.25 + 75×.25 + 88×.15 + 80×.05 + 80×.05 + 75×.10 + 82×.05 + 85×.10
           = 13.75 + 18.75 + 13.2 + 4.0 + 4.0 + 7.5 + 4.1 + 8.5 = 73.8 → raw_overall = 73

Veto check: C01 failed (clickbait — title doesn't match content)

After cap:  C dimension 55 → 55 (unchanged; cap is a ceiling, not a floor)
            Overall 73 → 60 (overall still capped because a veto is present)

Handoff:    cap_applied: true   raw_overall_score: 73   final_overall_score: 60
            key_findings:
              - title: "Title promises something the page doesn't deliver"
                severity: veto
                evidence: "Title: '10 Free Tools'; body delivers 3 free tools and 7 paid"
```

在内部报告中，C 维度仍保持为 55——不会提高到 60。请注意，加权总分（73）与未加权的 /8 平均值（77）不同——始终使用加权总分进行评分。

### 完整示例 3 — 2 个及以上否决项未通过（BLOCKED 路径）

```
Dimensions:  C=75 O=77 R=80 E=75 Exp=78 Ept=77 A=77 T=85  (Product Review weights → raw_overall = 78)

Veto check: T04 AND R10 both failed

Resolution: status: BLOCKED — do NOT compute capped scores.
            raw_overall_score retained for record; final_overall_score omitted.

Handoff:    status: BLOCKED   cap_applied: false   raw_overall_score: 78
            open_loops:
              - "2 veto items failed: T04 (affiliate disclosure) and R10 (data inconsistency)"
              - "Multi-veto cap calibration pending; page requires manual review before re-scoring"
            key_findings:
              - title: "Missing affiliate disclosure"
                severity: veto
              - title: "Data points contradict each other"
                severity: veto
```

## §3 (CORE-EEAT) · 护栏反向规则（内容/页面重构）

以下信号在所述条件下属于正向信号。应加分，而不是扣分。**条件均已明确说明——无条件重构会导致假阴性。**

| 信号 | 在何种情况下视为正向信号 | 标记规则示例 |
|---|---|---|
| 标题/正文中的年份标记 | 年份在 `[current_year − 2, current_year]` 范围内 | 2026 年出现“2026”：新鲜度正向信号。2026 年出现“2020”：R 维度问题——不要给予新鲜度加分 |
| 编号列表（“5 个最佳”“Top 10”“3 个步骤”） | 始终 | CTR 正向信号，计入 O 维度结构 |
| 限定词（“Open-Source”“Self-Hosted”“Free”“Local-First”） | 始终 | 缩小意图范围，计入 E 维度独特性 |
| 短缩写（“SEO”“AI”“CRM”“API”） | 始终 | 切勿对这些词元应用长度或停用词过滤器 |
| 首页品牌优先标题（“Acme \| AI Workflow”） | 该页面确实是首页 | 正确模式；不要依据 C01 对其进行标记 |
| 内页关键词优先标题（“AI Workflow for Teams — Acme”） | 该页面不是首页 | 正确模式；不要依据 C01 对其进行标记 |

如果上下文与正向重述相矛盾（例如，一个明确标注为常青内容的页面却带有年份标记），
请在发现项的 `evidence` 字段中说明例外情况。在审计时动态评估 `current_year`。

## §5 (CORE-EEAT) · Veto-ID 转换行

请与运行手册中的共享转换行配合使用。以下是 **CORE-EEAT** 否决项的含义——
切勿使用 CITE 的含义。

| 内部表述 | 面向用户的表述 |
|---|---|
| "T04 failed" | "缺少联盟营销披露" |
| "C01 veto triggered" | "标题与页面实际提供的内容不符" |
| "R10 failure" | "页面上的数据自相矛盾" |

### 第 4 步：评分与报告

计算分数并生成最终报告：

```markdown
## CORE-EEAT Audit Report

### Overview

- **Content**: [title]
- **Content Type**: [type]
- **Audit Date**: [date]
- **Total Score**: [score]/100 ([rating])
- **GEO Score**: [score]/100 | **SEO Score**: [score]/100
- **Veto Status**: ✅ No triggers / ⚠️ [item] triggered

### Dimension Scores

| Dimension | Score | Rating | Weight | Weighted |
|-----------|-------|--------|--------|----------|
| C — Contextual Clarity | [X]/100 | [rating] | [X]% | [X] |
| O — Organization | [X]/100 | [rating] | [X]% | [X] |
| R — Referenceability | [X]/100 | [rating] | [X]% | [X] |
| E — Exclusivity | [X]/100 | [rating] | [X]% | [X] |
| Exp — Experience | [X]/100 | [rating] | [X]% | [X] |
| Ept — Expertise | [X]/100 | [rating] | [X]% | [X] |
| A — Authority | [X]/100 | [rating] | [X]% | [X] |
| T — Trust | [X]/100 | [rating] | [X]% | [X] |
| **Weighted Total** | | | | **[X]/100** |

**Score Calculation**:
- GEO Score = (C + O + R + E) / 4
- SEO Score = (Exp + Ept + A + T) / 4
- Weighted Score = Σ (dimension_score × content_type_weight)

**Rating Scale**: 90-100 Excellent | 75-89 Good | 60-74 Medium | 40-59 Low | 0-39 Poor

### N/A Item Handling

When an item cannot be evaluated (e.g., A01 Backlink Profile requires site-level data not available):

1. Mark the item as "N/A" with reason
2. Exclude N/A items from the dimension score calculation
3. Dimension Score = (sum of scored items) / (number of scored items x 10) x 100
4. If more than 50% of a dimension's items are N/A, flag the dimension as "Insufficient Data" and exclude it from the weighted total
5. Recalculate weighted total using only dimensions with sufficient data, re-normalizing weights to sum to 100%

**Example**: Authority dimension with 8 N/A items and 2 scored items (A05=8, A07=5):
- Dimension score = (8+5) / (2 x 10) x 100 = 65
- But 8/10 items are N/A (>50%), so flag as "Insufficient Data — Authority"
- Exclude A dimension from weighted total; redistribute its weight proportionally to remaining dimensions

### Per-Item Scores

#### CORE — Content Body (40 Items)

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| C01 | Intent Alignment | [Pass/Partial/Fail] | [observation] |
| C02 | Direct Answer | [Pass/Partial/Fail] | [observation] |
| ... | ... | ... | ... |

#### EEAT — Source Credibility (40 Items)

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| Exp01 | First-Person Narrative | [Pass/Partial/Fail] | [observation] |
| ... | ... | ... | ... |

### Findings by Severity Tier

Render BEFORE "Top 5 Priority Improvements". Group every `key_findings` entry by `severity` per [Runbook §5 Severity tier routing](../../references/auditor-runbook.md): `veto` → **Critical issues (must fix)**, `high` → **Should-fix**, `medium`/`low` → **Nice-to-have**. Within each tier sort by `weight × points lost` (highest first). Apply the §5 Never say → Always say translation — no `P0/P1/P2` or `severity:` literals in user output. Omit empty-tier headers.

```markdown
**Critical issues (must fix)**
- [Item Name] — [plain-language observation]

**应修复**
- [项目名称] — [观察结果]

**锦上添花**
- [项目名称] — [观察结果]
```

### 优先级最高的 5 项改进

排序依据：所有层级中的权重 × 损失分数（影响最高者优先）。这是跨层级的重点摘要；上方按层级细分的内容呈现了完整情况。

1. **[ID] [名称]** — [具体修改建议]
   - 当前状态：[失败/部分通过] | 潜在提升：[X] 加权分
   - 操作：[具体步骤]

2. **[ID] [名称]** — [具体修改建议]
   - 当前状态：[失败/部分通过] | 潜在提升：[X] 加权分
   - 操作：[具体步骤]

3–5. [格式同上]

### 行动计划

#### 快速见效（每项少于 30 分钟）
- [ ] [操作 1]
- [ ] [操作 2]

#### 中等工作量（1-2 小时）
- [ ] [操作 3]
- [ ] [操作 4]

#### 战略性任务（需要规划）
- [ ] [操作 5]
- [ ] [操作 6]

### 建议的后续步骤

- 如需全面重写内容：使用 `seo-content-writer` 并施加 CORE-EEAT 约束
- 如需 GEO 优化：使用 `geo-content-optimizer`，针对未通过的 GEO-First 项目进行优化
- 如需刷新内容：使用 `content-refresher`，重点处理薄弱维度
- 如需技术修复：运行 `/aaron-seo-geo:audit --tech`，检查站点级问题
```

### 步骤 4.5：应用评分运行手册

按照以下顺序执行，并结合 [references/auditor-runbook.md](../../references/auditor-runbook.md) 中与框架无关的流程，以及本文件中 CORE-EEAT 特有的第 2 节完整示例、第 3 节护栏规则和第 5 节否决项：

1. **执行上限规则**（运行手册第 2 节）：逐项检查决策表。确定哪种场景与输入相符（0 个否决项、1 个高于上限的否决项、1 个低于上限的否决项或 2 个以上否决项）。应用上限规则——请记住，这是最高限值，而不是最低限值。在交接内容中设置 `cap_applied`。
2. **产物门禁自检**（运行手册第 4 节）：执行包含 7 个项目的检查清单。如果任何项目未通过，则强制设置 `status: BLOCKED`，并在 `open_loops` 中注明原因。
3. **面向用户的转换**（运行手册第 5 节）：在呈现面向用户的报告之前，转换内部用语。呈现的输出中不得出现否决项 ID、原始分数与受限分数的差值以及内部字段名。交接 YAML 会保留原始值，以供下游使用者使用；用户看到的应是通俗易懂的发现、一项分数以及相应的解释性语句。

### 保存结果

将审计产物写入 `memory/audits/content/YYYY-MM-DD-<topic>.md`（这是 [skill-contract.md §Write Paths](../../references/skill-contract.md) 中规定的角色专属路径；PostToolUse 产物门禁会验证 `memory/audits/` 下的所有内容），并在其 frontmatter 中设置 `class: auditor-output`。将所有否决项问题提升至 `memory/hot-cache.md`。之后，`memory-management` 会将这些内容汇总到每月的 `memory/audits/YYYY-MM.md` 中。不要将审计产物保存到未细分的 `memory/` 路径中——这样会绕过门禁。

## 验证检查点

### 输入验证
- [ ] 已确定内容来源（文本、URL 或文件路径）
- [ ] 已确认内容类型（自动检测或由用户指定）
- [ ] 内容足够充实，可以进行有意义的审计（≥300 字）
- [ ] 如果是对比审计，也已提供竞争对手的内容

### 输出验证
- [ ] 所有 80 个项目均已评分（或标记为 N/A 并注明原因）
- [ ] 所有 8 个维度的分数均计算正确
- [ ] 加权总分与内容类型的权重配置一致
- [ ] 已检查否决项，并在触发时进行标记
- [ ] **按严重程度分级的发现部分呈现在前 5 项之前** — 当 key_findings 中有项目时，至少有一个级别（严重 / 应修复 / 最好改进）不为空；省略空级别的标题
- [ ] 前 5 项改进按加权影响排序，而非任意排列
- [ ] 每项建议都具体且可执行（而非泛泛而谈）
- [ ] 行动计划包含具体步骤和工作量估算
- [ ] 用户可见的输出中不得出现 P0/P1/P2 或 `severity: …` 字面量（按操作手册第 §5 节进行转换）

## 示例

请参阅 [项目参考](references/item-reference.md)，其中提供了完整的评分示例，展示了包含全部 10 个项目的 C 维度、优先改进项和加权评分。

## 成功技巧

1. **从否决项开始** — 无论总分如何，T04、C01、R10 都是一票否决项
   > 这些否决项与 CORE-EEAT 基准（第 3 节）一致，该基准将其定义为可以推翻总分的项目。
2. **关注高权重维度** — 不同内容类型会优先考虑不同维度
3. **GEO 优先项目对 AI 可见性最为重要** — 如果目标是获得 AI 引用，请优先处理标记为 GEO 🎯 的项目
4. **某些 EEAT 项目需要站点级数据** — 不要因只能在站点级观察到的因素（反向链接、品牌知名度）而扣减内容分数
5. **使用加权分数，而不仅仅是原始平均分** — 对于产品评测而言，较强的独家性比很强的权威性更重要
6. **改进后重新审核** — 再次运行以验证分数提升并发现回归问题
7. **与 CITE 配合使用以获取域名级背景信息** — 低权威域名上的高内容分数所对应的优先级，与相反情况不同；运行 [域名权威性审核器](../domain-authority-auditor/SKILL.md) 以获取完整的 120 项评估结果

## 参考资料

- [CORE-EEAT 内容基准](../../references/core-eeat-benchmark.md) — 完整的 80 项基准，包含维度定义、评分标准和 GEO 优先项目标记
- [项目参考](references/item-reference.md) — 以紧凑查询表形式列出全部 80 个项目 ID，并包含站点级项目处理说明和评分报告示例

## 下一个最佳 Skill

首选：[内容刷新器](../../optimize/content-refresher/SKILL.md)（FIX 判定）。BLOCK：[SEO 内容撰写器](../../build/seo-content-writer/SKILL.md) 或 [实体优化器](../entity-optimizer/SKILL.md)。SHIP：[排名跟踪器](../../monitor/rank-tracker/SKILL.md)。