---
name: aeo
description: "Answer Engine Optimization (AEO) skill — optimize content to be cited by AI language models (ChatGPT, Perplexity, Claude, Gemini, Mistral) as authoritative sources. Distinct from SEO — AEO optimizes for citation in LLM-generated responses, not search rankings. Use when planning content for AI-first search audiences, auditing existing content for E-E-A-T signals, tracking which pages get cited by which LLMs, or building a citation-friendly content strategy. Triggers — 'AEO audit', 'optimize for ChatGPT', 'get cited by Perplexity', 'LLM citation strategy', 'answer engine optimization', 'content for AI search', 'E-E-A-T audit'. Output is a markdown audit report (default) or JSON for pipeline integration. Stdlib-only Python tools."
---
# 答案引擎优化（AEO）

**让你的内容被 ChatGPT、Perplexity、Claude、Gemini 和 Mistral 作为权威来源引用。**

AEO 是一种针对内容进行优化的实践，旨在让内容在 LLM 生成的回答中获得**引用**——这与针对搜索排名进行优化的 SEO 不同。此技能可用于审计和优化内容，并跟踪 AEO 表现。

## 与 SEO 的区别

| | SEO | AEO |
|---|---|---|
| **优化目标** | 点击排名 | 被作为权威来源引用 |
| **受众** | 浏览搜索结果的人类用户 | 回答问题的 LLM |
| **成功指标** | 排名第 1-10 位、自然流量 | 在各个 LLM 中的引用次数 |
| **关键信号** | 反向链接、关键词、页面速度 | E-E-A-T、结构化数据、事实密度 |
| **更新频率** | 数周至数月 | 数天至数周（LLM 训练周期） |

二者可以共存——同一内容既可以在 Google 上排名第 1，也可以被 Perplexity 引用。但两者采用的技术不同：SEO 重视关键词密度和反向链接；AEO 重视一手来源信号和结构化事实。

## 何时使用

- 为 AI 优先的受众规划新的内容
- 在 AI Overview 推出之前，审计现有内容中的 E-E-A-T 缺口
- 跟踪哪些页面被哪些 LLM 引用（引用台账）
- 研究 LLM 会为哪些查询引用来源（以及哪些查询会直接依据训练数据作答）
- 将引用率与竞争对手进行基准比较
- 构建与传统 SEO 相协调的长期 AEO 策略

## 何时不应使用

- 仅以点击为目标、不考虑 LLM 引用的 SEO——请改用 `marketing-skill/skills/seo-audit`
- 不包含事实性主张的品牌语调内容——引用需要有可供引用的事实
- LLM 已具有强训练信号的主题内容（例如基础数学）——获得引用的潜在收益很小
- 时效性内容（突发新闻）——LLM 的训练存在滞后，可能要数月后才会产生引用

## 核心能力

### 1. 内容审计与 E-E-A-T 评分

审计器（`aeo_audit.py`）从 4 个维度对内容进行评分：

- **经验**：第一手证据、带日期的示例、案例研究、“We ran X in 2026”之类的陈述
- **专业性**：作者简介、资质、对同行评审来源的引用、技术深度
- **权威性**：来自权威域名的外部反向链接、schema.org 标记、结构化数据
- **可信度**：HTTPS、联系信息、透明的更正机制、事实密度（每 1000 字中的可验证主张数量）

综合评分范围为 0-100，并提供各维度的评分明细。输出：包含具体修正建议的 Markdown 报告。

### 2. 内容优化

优化器（`aeo_optimizer.py`）会生成经过 AEO 改进的版本：

- **结构重写**——针对 LLM 解析优化 H2/H3 层级结构
- **引用密度提升**——添加带来源的 `[1]` 样式引用
- **Schema 注入**——为 FAQ、HowTo、Article schema 生成 JSON-LD
- **事实优先的导语**——将可验证的主张移至前 200 字

三种模式：`conservative`（改动少于 10% 的文字）、`balanced`（改动少于 30%）、`aggressive`（以最大化 AEO 为目标进行重写）。

### 3. 引用跟踪

跟踪器（`citation_tracker.py`）维护一个本地引用台账：

- 手动录入：粘贴在 ChatGPT/Perplexity/Claude/Gemini 输出中发现的引用
- 跟踪具体 URL、LLM、查询及日期
- 计算每个页面的引用次数、引用速度和 LLM 覆盖率
- 导出为 CSV 以便生成报告

存储于 `~/.aeo-data/citations.json`（本地存储，无遥测）。

## 参考资料

- `references/aeo_eeat_canon.md` — E-E-A-T 方法论、行业阈值、反模式
- `references/llm_citation_patterns.md` — 各 LLM 的引用选择启发式规则（Perplexity、ChatGPT、Claude、Gemini、Mistral）
- `references/aeo_vs_seo.md` — 何时应投入 AEO、SEO 或同时投入两者
- `references/bot_access_and_monitoring.md` — AI 爬虫 robots.txt 对照表（前置检查：某个机器人被屏蔽会导致对应平台的效果归零）、Google Search Console AI Overviews 监控、手动测试协议、引用下降诊断（从原 `ai-seo` skill 合并而来）
- `references/extractable_content_patterns.md` — 7 种可直接使用的内容块模板（定义、步骤、表格、FAQ、署名统计数据、专家引言、摘要框），问答引擎能够可靠提取这些内容（从原 `ai-seo` skill 合并而来）

## 工作流程

```
0. Pre-flight: bot access
   Check robots.txt against the crawler matrix in references/bot_access_and_monitoring.md
   → a blocked GPTBot/PerplexityBot/ClaudeBot/Google-Extended is the first fix, always

1. Audit existing content
   $ python3 scripts/aeo_audit.py --url https://example.com/blog/post
   → markdown report with composite score + 4-dimension breakdown

2. Apply optimization recommendations
   $ python3 scripts/aeo_optimizer.py --input post.md --mode balanced --output post-aeo.md
   → optimized variant with citations + schema + structural fixes

3. Publish + monitor
   $ python3 scripts/citation_tracker.py --action add --url https://example.com/blog/post \
       --llm perplexity --query "what is AEO" --date 2026-05-17
   → adds entry to local citations.json ledger

4. Report
   $ python3 scripts/citation_tracker.py --action report --url https://example.com/blog/post
   → per-page citation stats: count, LLMs, queries, velocity
```

## 配置

该 skill 可通过每次运行时的 `--industry` 标志感知行业。支持：`saas`、`healthcare`、`finance`、`legal`、`ecommerce`、`b2b`、`media`、`education`。

行业会影响：
- **权威性信号要求** — 医疗保健/金融需要更严格的来源引用
- **事实核查严谨度** — 法律/医疗保健领域会将无法验证的声明标记为严重问题
- **引用风格** — 学术期刊、行业期刊与博客的惯例

示例：
```bash
python3 scripts/aeo_audit.py --url <url> --industry healthcare
# → stricter E-E-A-T thresholds; flags any health claim without primary citation
```

## 输出格式

### Markdown 审计报告（默认）

```markdown
# AEO Audit Report — [Page Title]

**URL:** https://example.com/blog/post
**Date:** 2026-05-17
**Industry:** saas
**Composite Score:** 72/100 (B+)

## Dimension Breakdown

| Dimension | Score | Verdict |
|---|---|---|
| Experience | 80/100 | Strong — first-person case study present |
| Expertise | 65/100 | Author bio missing credentials |
| Authoritativeness | 75/100 | 4 backlinks from authority domains |
| Trustworthiness | 68/100 | No corrections policy linked |

## Top 3 Fixes

1. Add author bio with credentials (Expertise +15)
2. Link to corrections policy from footer (Trustworthiness +12)
3. Inject FAQ schema for the 5 questions implicit in H2s (Authoritativeness +8)

## All Recommendations
[...]

## Audit Trail
[3-count of analysis steps, sources cited, time taken]
```

### 流水线所用的 JSON

```bash
python3 scripts/aeo_audit.py --url <url> --output json
```

返回完整的结构化数据，以便与内容管理工作流集成。

## 特定行业的 E-E-A-T 阈值

| 行业 | 最低综合分数 | 关键信号 |
|---|---|---|
| 医疗健康 | 85 | 医学审核者署名、同行评审文献引用、FDA 披露声明 |
| 金融 | 85 | 作者具备 CFA/CPA 资质、“非投资建议”免责声明、注明日期的示例 |
| 法律 | 85 | 披露适用司法管辖区、律师简介、“非法律建议”免责声明 |
| SaaS | 70 | 产品经理署名、包含指标的案例研究、ROI 计算器 |
| 电子商务 | 65 | 汇总产品评价、退货政策、schema.org Product |
| B2B | 70 | 行业分析师引述、客户徽标、ROI 数据 |
| 媒体 | 70 | 编辑政策、事实核查链接、原创报道 |
| 教育 | 75 | 讲师简介、学习成果、适用时的认证信息 |

## 被拒绝的反模式

- **面向 AI 的关键词堆砌** — LLM 已经可以从语义中提取主题；关键词密度不会提高被引用的可能性
- **未经人工审核的纯 AI 生成内容** — 通用的 LLM 输出会被旨在寻找独特信号的 RAG 检索算法降低优先级
- **引用农场／链接轮** — 现代 LLM RAG 会惩罚低权威性的链接网络
- **Schema 垃圾信息** — 虚假或无法验证的 schema.org 声明会被过滤；只应标记真实且可验证的声明
- **以牺牲其他 LLM 为代价针对单个 LLM 优化** — 各主流 LLM 的引用分布高度相关，因为它们共享训练数据来源；应针对共同信号（E-E-A-T）进行优化，而不是采用针对特定 LLM 的取巧手段
- **完全忽略 SEO** — AEO 引用通常来自已经在自然搜索结果中排名靠前的来源；AEO 与 SEO 是互补关系，而非替代关系

## 依赖项

- 所有 3 个脚本都**仅使用标准库** — 无需 `pip install`
- **可选**：使用 `--url` 模式时需要 `requests` + `beautifulsoup4`（否则可通过 `--input` 传入 markdown，以进行基于文件的审计）
- **可选**：`query_research` 模式需要任意 LLM API 密钥（目前仅搭建了框架 — 完整的 LLM 驱动查询研究已列入路线图）

## 存储

所有数据均以本地优先方式存储：
- `~/.aeo-data/citations.json` — 引用记录
- `~/.aeo-data/patterns.json` — 成功模式库
- `~/.aeo-data/audits/<hash>.md` — 已保存的审计报告

无遥测。无云同步。可随时通过 `citation_tracker.py --action export` 导出为 CSV。

## 触发短语

- “AEO 审计”、“AEO 检查”
- “针对 ChatGPT / Perplexity / Claude / Gemini 进行优化”
- “被 [LLM] 引用”
- “LLM 引用策略”
- “答案引擎优化”
- “面向 AI 搜索的内容”
- “E-E-A-T 审计”
- “跟踪 AI 引用”
- “面向 AI 的 schema”

## 相关技能

- `marketing-skill/skills/seo-audit` — 传统的点击导向型 SEO
- `marketing-skill/skills/programmatic-seo` — 大规模模板驱动型 SEO
- `marketing-skill/skills/content-strategy` — 更广泛的内容规划
- `marketing-skill/skills/copywriting` — 表达风格与语气
- `marketing-skill/skills/schema-markup` — 结构化数据实现

---

**版本：** 2.7.3
**来源：** 移植自 [`alirezarezvani/aeo-box`](https://github.com/alirezarezvani/aeo-box)（`answer-engine-optimization/` skill，共 9 个模块、2,464 行代码）。此移植版本依照 claude-skills 约定，将这个由 9 个模块组成的 Python 工具包精简为 3 个基于标准库的 CLI 工具；并原样保留了 E-E-A-T 评分方法、引用跟踪模式和行业感知阈值。
**许可证：** MIT（与上游项目及本仓库一致）。