---
name: domain-authority-auditor
description: 'Use when auditing domain authority, trust, or citation credibility; runs 40-item CITE scoring with veto checks (TRUSTED/CAUTIOUS/UNTRUSTED). Not for page-level content quality — use content-quality-auditor; not for backlink profiling alone — use backlink-analyzer. 域名权威/网站可信度'
version: "9.9.12"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/seo-geo-claude-skills"
when_to_use: "Use when auditing domain trust and authority. Runs CITE 40-item scoring with veto checks. Also when the user asks about domain credibility or citation trustworthiness."
argument-hint: "<domain>"
class: auditor
metadata:
  author: aaron-he-zhu
  version: "9.9.12"
  geo-relevance: "medium"
---
# 域名权威性审计器

> 基于 [CITE Domain Rating](https://github.com/aaron-he-zhu/cite-domain-rating)。完整基准参考：[references/cite-domain-rating.md](../../references/cite-domain-rating.md)
此技能依据划分为 4 个维度的 40 项标准化标准评估域名权威性。它会生成一份全面的审计报告，其中包含逐项评分、维度评分、按域名类型计算的加权评分、否决项检查，以及按优先级排序的行动计划。

**姊妹技能**：[content-quality-auditor](../content-quality-auditor/SKILL.md) 在页面层面评估内容（80 项）。此技能评估内容背后的域名（40 项）。二者结合可提供完整的 120 项评估。

> **命名空间说明**：CITE 使用 C01-C10 表示引用项；CORE-EEAT 使用 C01-C10 表示上下文清晰度项。在合并的 120 项评估中，请添加框架名称前缀（例如 CITE-C01 与 CORE-C01）以避免混淆。

## 何时必须触发此技能

当域名可信度或引用可信度受到质疑时，请使用此技能——即使用户没有使用审计术语：

- 用户询问“我的网站有多可信”或“我的域名是否可信”
- 当 backlink-analyzer 发现有害链接比例超过 15% 时，其交接摘要会建议执行此门槛检查
- 在开展 GEO 营销活动之前评估域名权威性
- 将你的域名与竞争对手进行基准比较
- 评估某个域名作为引用来源是否可信
- 执行定期域名健康检查，或在链接建设活动结束后进行检查
- 识别操纵性危险信号（PBN、链接农场、处罚历史）
- 与 content-quality-auditor 交叉参照，以完成完整的 120 项评估

## 此技能的作用

1. **完整的 40 项审计**：将每个 CITE 检查项评为 Pass/Partial/Fail
2. **维度评分**：计算全部 4 个维度的分数（每项 0-100）
3. **加权总分**：应用针对不同域名类型的权重来计算 CITE Score
4. **关键问题检测**：标记会限制最高得分的关键操纵信号
5. **优先级排序**：按影响程度确定最重要的 5 项改进
6. **行动计划**：生成具体、可执行的改进步骤
7. **交叉参照**：可选择与 CORE-EEAT 配合进行综合诊断

## 快速开始

从以下提示之一开始。最后给出引用可信度结论，并使用仓库中[技能契约](../../references/skill-contract.md)规定的格式提供交接摘要。

### 审计你的域名

```
Audit domain authority for [domain]
Run a CITE domain audit on [domain] as a [domain type]
```

### 按域名类型进行审计

```
CITE audit for example.com as an e-commerce site
Score this SaaS domain against the 40-item benchmark: [domain]
```

### 对比审计

```
Compare domain authority: [your domain] vs [competitor 1] vs [competitor 2]
```

### 综合评估

```
Run full 120-item assessment on [domain]: CITE domain audit + CORE-EEAT content audit on [sample pages]
```

## 技能契约

**门槛结论**：**TRUSTED**（无关键问题，分数高于阈值）/ **CAUTIOUS**（发现问题，但均非关键问题）/ **UNTRUSTED**（一项关键可信度问题未通过——请参阅报告中的“Critical Issue to Fix”）。始终使用通俗语言而非项目 ID，在报告顶部醒目地说明结论。

**预期输出**：一份 CITE 审计报告、一个引用可信度结论，以及一份可直接移交至 `memory/audits/domain/` 的简短摘要。

- **读取**：目标域名、辅助权威性信号和对比域名。
- **写入**：一份面向用户的权威性报告，以及一份可存储在 `memory/audits/domain/` 下的可复用摘要。
- **提升**：将否决项和域名风险提升至 `memory/hot-cache.md`（自动保存）。将权威性上下文保存至 `memory/audits/domain/`。结果将作为品牌规范档案的权威性输入，提供给 entity-optimizer。
- **完成条件**：全部 40 个 CITE 项目均已评分或标记为 N/A，并注明来源；给出 TRUSTED/CAUTIOUS/UNTRUSTED 结论；任何否决项（T03/T05/T09）均已明确指出并提供修复方案。
- **主要后续技能**：在信任情况明确后，使用下方的 `Next Best Skill`。

## 数据源

> 有关工具类别占位符，请参阅 [CONNECTORS.md](../../CONNECTORS.md)。

> **注意：**所有集成均为可选。此技能无需任何 API 密钥即可运行——未连接工具时，由用户手动提供数据。

**已连接~~链接数据库~~ + ~~SEO 工具~~ + ~~AI 监控工具~~ + ~~知识图谱~~ + ~~品牌监控工具~~时：**
自动从~~链接数据库~~提取反向链接概况和链接质量指标，从~~SEO 工具~~提取域名权威度分数和关键词排名，从~~AI 监控工具~~提取 AI 引用数据，从~~知识图谱~~提取实体存在情况，并从~~品牌监控工具~~提取品牌提及数据。

**仅使用手动数据时：**
要求用户提供：
1. 要评估的域名
2. 域名类型（如果无法自动检测）：内容发布商、产品与服务、电子商务、社区与 UGC、工具与实用程序，或权威与机构
3. 反向链接数据：引用域名数量、域名权威度、主要链接来源域名
4. 流量估算值（来自任意 SEO 工具或 SimilarWeb）
5. 用于比较的竞争对手域名（可选）

使用所提供的数据执行完整的 40 项审计。在输出中注明因缺少访问权限而无法充分评估的项目（例如 AI 引用数据、知识图谱查询、WHOIS 历史记录）。

## 决策关卡

当需要暂停并询问用户时，始终：(1) 说明具体数值和阈值；(2) 提供带编号的选项及其结果。

**在以下情况下暂停并询问用户：**
- 域名无法解析或无法检测其类型——说明发现的情况，并在评分前确认域名类型
- 未提供反向链接/引用域名数据，且无法推断——提供以下选项：(1) 提供导出数据；(2) 对可观察的 CITE 项目进行评分，并将依赖链接数据的项目标记为 N/A
- 某个 CITE 维度中超过 50% 的项目为 N/A——指出该维度并询问：(1) 提供补充数据；(2) 将该维度标记为数据不足
- 任何否决项（T03、T05 或 T09）被触发——立即标明对应的项目 ID，并询问：(1) 停止审计以立即修复；(2) 继续完整审计并在报告中标记

**静默继续（切勿因此暂停）：**
- 缺少 AI 引用数据（将项目标记为 N/A 并继续）
- 某个维度中的个别项目得分为 Partial
- 总体得分较低（报告本身就是交付成果，无需进行主观判断）

## 说明

当用户请求域名权威性审计时：

### 第 1 步：准备

```markdown
### Audit Setup

**Domain**: [domain]
**Domain Type**: [auto-detected or user-specified]
**Dimension Weights**: [from domain-type weight table below]

#### Domain-Type Weight Table

> Canonical source: `references/cite-domain-rating.md`. This inline copy is for convenience.

| Dim | Default | Content Publisher | Product & Service | E-commerce | Community & UGC | Tool & Utility | Authority & Institutional |
|-----|:-------:|:-:|:-:|:-:|:-:|:-:|:-:|
| C | 35% | **40%** | 25% | 20% | 35% | 25% | **45%** |
| I | 20% | 15% | **30%** | 20% | 10% | **30%** | 20% |
| T | 25% | 20% | 25% | **35%** | 25% | 25% | 20% |
| E | 20% | 25% | 20% | 25% | **30%** | 20% | 15% |

#### Critical Trust Check (Emergency Brake)

| Check | Status | Action |
|-------|--------|--------|
| Link profile matches real traffic | ✅ Pass / ⚠️ CRITICAL | [If CRITICAL: "Audit backlink profile; disavow toxic links"] |
| Backlink profile is unique to this domain | ✅ Pass / ⚠️ CRITICAL | [If CRITICAL: "Flag as manipulation network; investigate link sources"] |
| No Google penalties or deindexing | ✅ Pass / ⚠️ CRITICAL | [If CRITICAL: "Address penalty first; all other optimization is futile"] |
```

如果触发任何关键的信任检查，请使用直白的语言在报告顶部显著标记。CITE 分数上限依据[运行手册 §2](../../references/auditor-runbook.md)确定。

### 第 2 步：C + I 审计（20 项）

根据 [references/cite-domain-rating.md](../../references/cite-domain-rating.md) 中的标准评估每个项目。

为每个项目评分：
- **通过** = 10 分（完全符合标准）
- **部分通过** = 5 分（部分符合标准）
- **未通过** = 0 分（不符合标准）

```markdown
### C — Citation

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| C01 | Referring Domains Volume | Pass/Partial/Fail | [specific observation] |
| C02 | Referring Domains Quality | Pass/Partial/Fail | [specific observation] |
| ... | ... | ... | ... |
| C10 | Link Source Diversity | Pass/Partial/Fail | [specific observation] |

**C Score**: [X]/100

### I — Identity

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| I01 | Knowledge Graph Presence | Pass/Partial/Fail | [specific observation] |
| ... | ... | ... | ... |

**I Score**: [X]/100
```

### 第 3 步：T + E 审计（20 项）

信任度和卓越度维度采用相同的格式。

```markdown
### T — Trust

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| T01 | Link Profile Naturalness | Pass/Partial/Fail | [specific observation] |
| ... | ... | ... | ... |

**T Score**: [X]/100

### E — Eminence

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| E01 | Organic Search Visibility | Pass/Partial/Fail | [specific observation] |
| ... | ... | ... | ... |

**E Score**: [X]/100
```

**注意**：某些项目需要专门的数据（C05-C08 AI 引用数据、I01 知识图谱查询、T04-T05 IP/配置文件分析）。对可观察的项目进行评分；将无法验证的项目标记为“N/A — requires [data source]”，并将其排除在该维度的平均分计算之外。

## 审计员运行手册 — 请先阅读此内容

**在评分之前，`Read ../../references/auditor-runbook.md`.** 这是权威且与框架无关的流程：§1 交接模式、§2 严重失败上限方法 + 决策表 + 确定性取整、§4 产物门禁 7 项检查清单、§5 面向用户的翻译格式，以及不受信任内容的安全边界。它通过相对路径在本地加载（无需网络）— 请勿跳过。本技能正文仅包含以下 **CITE 特有**内容：加权计算示例、领域级防护规则，以及 CITE 否决项 ID 翻译行。

### 交接摘要

输出在
[references/auditor-runbook.md §1](../../references/auditor-runbook.md) 中定义的审计员类交接内容：`status`、`objective`、`key_findings`、`evidence_summary`、`recommended_next_skill`，以及审计员字段 `cap_applied`、`raw_overall_score`（CITE 加权计算公式为 `C×0.35 + I×0.20 + T×0.25 + E×0.20`，向下取整，上限应用前），以及 `final_overall_score`。

## §2 (CITE) · 计算示例 — 加权上限运算

> 按照运行手册的 §2 决策表逐步执行，然后参照下方与之匹配的示例。CITE 评分是
> **4 个维度的加权总分** `C×0.35 + I×0.20 + T×0.25 + E×0.20`
>（参见 [cite-domain-rating.md](../../references/cite-domain-rating.md)），向下取整，上限应用前。
> CITE 有四个维度（C/I/T/E）— 此处不存在 8 维度 /8 平均值。

### 计算示例 1 — 单个否决项，维度原始分高于上限

```
Dimensions:  C=80 I=70 T=85 E=75
Weighted:    80×0.35 + 70×0.20 + 85×0.25 + 75×0.20
           = 28.0 + 14.0 + 21.25 + 15.0 = 78.25 → raw_overall = 78

Veto check: T09 failed (Google manual action / deindex history on record)

After cap:  T dimension 85 → 60 (capped down, raw > 60)
            Overall 78 → 60 (any veto forces overall cap)

Handoff:    cap_applied: true   raw_overall_score: 78   final_overall_score: 60
            key_findings:
              - title: "Google manual action on record"
                severity: veto
                evidence: "Search Console shows an active manual action against the domain"
```

### 计算示例 2 — 单个否决项，维度原始分已低于上限

```
Dimensions:  C=55 I=70 T=58 E=72
Weighted:    55×0.35 + 70×0.20 + 58×0.25 + 72×0.20
           = 19.25 + 14.0 + 14.5 + 14.4 = 62.15 → raw_overall = 62

Veto check: T03 failed (backlink volume far exceeds real traffic — link-farm pattern)

After cap:  T dimension 58 → 58 (unchanged; cap is a ceiling, not a floor)
            Overall 62 → 60 (overall still capped because a veto is present)

Handoff:    cap_applied: true   raw_overall_score: 62   final_overall_score: 60
            key_findings:
              - title: "Backlink volume inconsistent with real traffic"
                severity: veto
                evidence: "1.2M referring-domain links but estimated <800 monthly organic visits"
```

在内部报告中，T 维度仍保持为 58 — 不会提升至 60。上限仅是最高限值。

### 计算示例 3 — 2 个及以上否决项失败（BLOCKED 路径）

```
Dimensions:  C=80 I=70 T=85 E=75  →  raw_overall = 78

Veto check: T05 AND T09 both failed

Resolution: status: BLOCKED — do NOT compute capped scores.
            raw_overall_score retained for record; final_overall_score omitted.

Handoff:    status: BLOCKED   cap_applied: false   raw_overall_score: 78
            open_loops:
              - "2 veto items failed: T05 (manipulation network) and T09 (manual action)"
              - "Multi-veto cap calibration pending; domain requires manual review before re-scoring"
            key_findings:
              - title: "Backlink profile overlaps a known manipulation network"
                severity: veto
              - title: "Google manual action on record"
                severity: veto
```

## §3 (CITE) · 护栏负面信号（域名级信号）

这些信号很容易被过度标记。在符合所述条件时，应将其视为中性或正面信号——
不要自动降低信任度。**条件已明确列出。**

| 信号 | 在以下情况下不视为操纵 | 仅在以下情况下标记 |
|---|---|---|
| 外链突然激增 | 可由真实的产品发布、融资轮次、媒体热点或病毒式传播的帖子解释 | 激增的外链来自无关、低质量或模板化的域名，且没有编辑语境 |
| 外链很少，但品牌强大 | 已建立的线下实体或品牌实体，其链接增长速度本来就较低 | 链接单薄，并且没有品牌搜索需求，也没有编辑提及 |
| 共享托管 / 相同 IP 段 | CDN、共享主机或平台（Cloudflare、Vercel、Shopify）使许多网站集中在同一 IP 上 | 存在明显的 PBN 特征：整个网站集合具有相同的注册人、模板、相互链接和单薄内容 |
| nofollow 占比高 | 链接来自按政策使用 nofollow 的合法新闻、UGC 或社交平台 | nofollow 占比高，同时伴有付费链接或未披露赞助关系的模式 |
| 域名注册时间短 | 真实的新企业自然增长且已披露所有权 | 新域名 + 激进的完全匹配锚文本 + 与流量不相符的链接增长速度 |

如果上下文与中性解读相矛盾，请在发现项的 `evidence` 字段中说明例外情况
（例如，“48 小时内激增 4,000 个链接，且全部来自同一个模板化页脚网络”）。

## §5 (CITE) · 否决项 ID 转换行

请与运行手册中的共享转换行结合使用。以下是 **CITE** 否决项的含义——
绝不能使用 CORE-EEAT 中的含义（相同的 ID 字符串在那里具有不同含义）。

| 内部表述 | 面向用户的表述 |
|---|---|
| "T03 failed" | “外链数量远超真实流量（链接农场模式）” |
| "T05 failed" | “外链画像与另一个域名几乎完全相同（操纵网络）” |
| "T09 failed" | “存在 Google 人工处置或取消索引记录” |

### 第 4 步：评分与报告

计算分数并生成最终报告：

```markdown
## CITE Domain Authority Report

### Overview

- **Domain**: [domain]
- **Domain Type**: [type]
- **Audit Date**: [date]
- **CITE Score**: [score]/100 ([rating])
- **Veto Status**: ✅ No triggers / ⚠️ Critical issue present *(score reflects cap per Runbook §2)*

### Dimension Scores

| Dimension | Score | Rating | Weight | Weighted |
|-----------|-------|--------|--------|----------|
| C — Citation | [X]/100 | [rating] | [X]% | [X] |
| I — Identity | [X]/100 | [rating] | [X]% | [X] |
| T — Trust | [X]/100 | [rating] | [X]% | [X] |
| E — Eminence | [X]/100 | [rating] | [X]% | [X] |
| **CITE Score** | | | | **[X]/100** |

**Score Calculation**: CITE Score = C × [w_C] + I × [w_I] + T × [w_T] + E × [w_E]

**Rating Scale**: 90-100 Excellent | 75-89 Good | 60-74 Medium | 40-59 Low | 0-39 Poor

### Per-Item Scores

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| C01 | Referring Domains Volume | [Pass/Partial/Fail] | [observation] |
| C02 | Referring Domains Quality | [Pass/Partial/Fail] | [observation] |
| ... | ... | ... | ... |
| E10 | Industry Share of Voice | [Pass/Partial/Fail] | [observation] |

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

排序依据：所有层级中的权重 × 丢失分数（影响最高者优先）。这是跨层级的重点摘要；上方按层级细分的内容才是完整情况。

1. **[ID] [名称]** — [具体修改建议]
   - 当前状态：[失败/部分通过] | 潜在收益：[X] 个加权分
   - 操作：[具体步骤]
2. **[ID] [名称]** — [具体修改建议]
   - 当前状态：[失败/部分通过] | 潜在收益：[X] 个加权分
   - 操作：[具体步骤]
3–5. [格式同上]

### 行动计划

#### 快速见效（< 1 周）
- [ ] [行动 1]
- [ ] [行动 2]
#### 中等投入（1-4 周）
- [ ] [行动 3]
- [ ] [行动 4]
#### 战略性工作（1-3 个月）
- [ ] [行动 5]
- [ ] [行动 6]

### 与 CORE-EEAT 交叉参照

要进行完整评估，请将此 CITE 审计与 CORE-EEAT 内容审计结合使用：

| 评估 | 分数 | 评级 |
|-----------|-------|--------|
| CITE（域名） | [X]/100 | [评级] |
| CORE-EEAT（内容） | [在示例页面上运行 content-quality-auditor] | — |

**诊断矩阵**：
- 高 CITE + 高 CORE-EEAT → 保持并扩展
- 高 CITE + 低 CORE-EEAT → 优先提升内容质量
- 低 CITE + 高 CORE-EEAT → 建立域名权威性
- 低 CITE + 低 CORE-EEAT → 先从内容着手，再提升域名

### 建议的后续步骤

- 要建立域名权威性：重点关注上述优先级最高的 5 项
- 要改进内容：在关键页面上使用 `content-quality-auditor`
- 要制定反向链接策略：使用 `backlink-analyzer` 进行详细的链接分析
- 要进行竞争对手基准分析：结合 CITE 分数使用 `competitor-analysis`
- 要跟踪进展：运行 `/aaron-seo-geo:track --report` 查看 CITE 分数趋势
```

### 步骤 4.5：应用评分操作手册

按顺序执行，使用 [references/auditor-runbook.md](../../references/auditor-runbook.md) 中与框架无关的流程，并结合本文件中 CITE 专用的第 2 节完整示例、第 3 节防护规则和第 5 节否决项：

1. **上限执行**（操作手册第 2 节）：逐项检查决策表。确定输入符合哪种场景（0 个否决项、1 个高于上限的否决项、1 个低于上限的否决项，或 2 个及以上否决项）。应用上限规则——请记住，它是上限，而不是下限。在交接内容中设置 `cap_applied`。对于 CITE，单个否决项导致的失败还会在 `open_loops` 中添加一条**操纵警报**记录。
2. **产物门禁自检**（操作手册第 4 节）：执行包含 7 个项目的检查清单。如果任何一项失败，则强制设置 `status: BLOCKED`，并在 `open_loops` 中注明原因。
3. **面向用户的转换**（操作手册第 5 节）：在呈现面向用户的报告之前，转换内部用语。否决项 ID（T03、T05、T09）、原始分数与封顶分数的差值，以及内部字段名不得出现在最终呈现的输出中。交接 YAML 会保留原始值，供下游使用者使用；用户看到的是通俗易懂的发现结果、单一分数以及解释性语句。

### 保存结果

将审计产物写入 `memory/audits/domain/YYYY-MM-DD-<topic>.md`（[skill-contract.md 第 §Write Paths 节](../../references/skill-contract.md)中定义的各角色专属路径；PostToolUse 产物门禁会验证 `memory/audits/` 下的所有内容），并在其 frontmatter 中设置 `class: auditor-output`。将所有否决问题提升至 `memory/hot-cache.md`。之后，`memory-management` 会将这些内容汇总到每月的 `memory/audits/YYYY-MM.md` 中。不要将审计产物保存到不含子目录的 `memory/` 路径中——这样会绕过门禁。

## 验证检查点

### 输入验证
- [ ] 已识别域名且可访问
- [ ] 已确认域名类型（自动检测或用户指定）
- [ ] 反向链接数据可用（至少包括：引荐域名数量、DA（Moz Domain Authority™）/ DR（Ahrefs Domain Rating™））
- [ ] 如果是对比审计，还需指定竞争对手域名

### 输出验证
- [ ] 所有 40 个项目均已评分（或标记为 N/A 并注明原因）
- [ ] 所有 4 个维度的分数均已正确计算
- [ ] 加权 CITE 分数与域名类型的权重配置一致
- [ ] 优先检查所有 3 个否决项，并在触发时进行标记
- [ ] **按严重性等级划分的发现部分在前 5 项之前呈现** — 当 key_findings 包含项目时，至少有一个等级（严重 / 应修复 / 最好修复）不为空；省略空等级的标题
- [ ] 前 5 项改进按加权影响排序，而非任意排列
- [ ] 每条建议都具体且可执行（而非泛泛而谈）
- [ ] 行动计划包含具体步骤和工作量估算
- [ ] 面向用户的输出中不得出现 P0/P1/P2 或 `severity: …` 字面量（按照操作手册第 5 节进行转换）

## 示例

请参阅[示例报告](references/example-report.md)，查看针对 cloudhosting.com 的完整 CITE 审计，其中展示了否决项检查、维度分数、前 5 项改进、行动计划以及与 CORE-EEAT 的交叉参照。

## 成功技巧

1. **从否决项开始** — T03、T05、T09 可能会使整个分数无效
2. **首先识别域名类型** — 不同类型的权重配置差异很大
3. **AI 引用项（C05-C08）对 GEO 最为重要** — 使用与细分领域相关的问题查询 AI 引擎来进行测试
4. **某些项目需要专用工具** — 如果未连接相应工具，知识图谱查询、AI 引用监控和 IP 多样性分析可能需要人工研究
5. **结合 CORE-EEAT 以获得全貌** — 只有域名权威性而没有内容质量（反之亦然），都只能反映整体情况的一半

## 参考资料

- [CITE 域名评级](../../references/cite-domain-rating.md) — 完整的 40 项基准，包含维度定义、评分标准、域名类型权重表和否决项
- [references/example-report.md](references/example-report.md) — 完整的 CITE 审计示例，包含各维度评分、前 5 项改进、行动计划以及与 CORE-EEAT 的交叉参照

## 下一最佳技能

CAUTIOUS + 链接质量：[backlink-analyzer](../../monitor/backlink-analyzer/SKILL.md)。UNTRUSTED：[entity-optimizer](../entity-optimizer/SKILL.md)。TRUSTED：终端。按照 [skill-contract.md](../../references/skill-contract.md) 应用已访问集合规则。