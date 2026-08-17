---
name: auto-research
description: Deep strategic research engine — decomposes questions into parallel research threads, spawns multiple agents, and synthesizes into actionable strategic analysis
roles: [product-manager, engineering-lead, founder, all]
integrations: []
---
# COG 自动研究技能

## 何时调用
- 用户提出需要深入研究的战略问题
- 用户提到“研究”“自动研究”“调查”“战略分析”“深入探讨[主题]”
- 用户希望了解市场力量、竞争动态、技术发展轨迹或战略选项
- 用户需要有真实来源支撑的循证分析，以辅助决策

灵感来自 Karpathy 的 autoresearch——但用于战略思考，而非 ML 训练。

## 智能体模式感知

**检查 `00-inbox/MY-PROFILE.md` frontmatter 中的 `agent_mode`：**
- 如果为 `agent_mode: team`——使用完整的并行智能体执行策略（5-7 个智能体）。此技能可从团队模式中获得极大收益。
- 如果为 `agent_mode: solo`——使用 WebSearch/WebFetch 依次执行 2-3 轮研究，生成较精简的分析，不采用完整的多线程结构。

## 命令：`/auto-research`

## 输入
用户将战略问题或主题作为命令参数提供。示例：
- “如果基础模型趋于商品化，Katalon/Scout 这样的 LLM 包装器公司会发生什么？”
- “随着 AI 能力不断扩展，测试行业的未来将如何发展？”
- “对于我们的 AI 层，应该自研、购买还是合作？”
- “如果 OpenAI 推出一款测试产品，Scout 有哪些战略选项？”

---

## 执行策略

### 阶段 1：问题拆解（编排器——2 分钟）

将用户的战略问题拆解为 5-7 个**研究线程**，这些线程共同提供全面的答案。每个线程都应具备以下特点：
- **独立**——可并行研究
- **具体**——有明确的研究目标
- **互补**——共同覆盖完整的战略格局

**拆解框架：**
1. **市场力量**——哪些宏观趋势推动了这一问题？
2. **历史先例**——这种模式是否曾在其他行业中出现过？
3. **参与者分析**——主要参与者有哪些，他们正在做什么？
4. **技术发展轨迹**——底层技术将走向何方？
5. **客户行为**——最终用户真正想要什么、实际会做什么？
6. **经济模型**——单位经济效益和价值获取动态如何？
7. **新兴技术与架构**——哪些概念、项目或框架仍处于开发或讨论阶段（尚未进入主流），但可能成为基础性技术？研究相关的开源项目、研究论文、GitHub 仓库、Discord/论坛讨论、会议演讲和早期工具。示例：新型智能体架构、新测试范式、实验性框架。这些内容可能尚无完善的文档——深入研究 README、GitHub issue、Twitter/X 帖子串、开发者博客文章和学术预印本。
8. **逆向观点**——反对共识的最有力论点是什么？

并非所有线程都适用于每个问题。选择最相关的 5-7 个。**线程 7（新兴技术）必须始终包含在内**——用户明确希望提前掌握尚未进入主流的概念。

**在启动智能体之前：**
1. 从知识库中读取相关文件，以获取已有上下文：
   - `05-knowledge/` 中已有的框架和思维模型
   - 如果相关，则读取 `04-projects/` 中与项目有关的上下文
   - 最近的思维倾泻记录，以了解用户对该主题已有的思考
2. 向用户说明拆解方案，以便他们在智能体启动前调整方向

### 阶段 2：并行深度研究（同时启动 5-7 个智能体）

**关键要求：在一条消息中启动所有智能体。** 所有智能体均使用 `run_in_background: true`。

每个智能体都会收到一份遵循以下模板的详细提示词：

```
You are a strategic research analyst investigating a specific thread of a larger strategic question.

MAIN QUESTION: [user's original question]
YOUR THREAD: [specific research thread]
EXISTING CONTEXT: [any relevant vault context]

RESEARCH METHODOLOGY:
1. WebSearch for 8-12 high-quality sources (prioritize: research reports, expert analyses, company filings, academic papers, industry publications — NOT listicles or superficial blog posts)
2. For each source found, WebFetch to read the full content and extract key arguments, data points, and frameworks
3. Look for CONFLICTING viewpoints — don't just confirm one narrative
4. Identify specific data points, statistics, and concrete examples
5. Note the credibility and potential bias of each source
6. FOR EMERGING TECH THREADS: Go beyond polished sources. Search GitHub repos (README, issues, discussions), Twitter/X threads from builders, Discord/forum discussions, conference talk summaries, arXiv preprints, and early blog posts. The goal is to surface concepts that are pre-mainstream but technically promising. For each concept found, assess: maturity level, technical approach, relevance to the user's use case, and what it would take to adopt/integrate.

OUTPUT FORMAT (return ALL of this):

## Thread: [thread name]

### Key Findings (3-5 bullet points)
- Finding with source attribution

### Evidence & Data Points
- Specific statistics, market data, examples with sources

### Expert/Notable Perspectives
- Named perspectives from credible voices

### Implications for [user's context]
- What this means specifically for the user's situation

### Confidence Level
- HIGH / MEDIUM / LOW with reasoning

### Sources
- Numbered list of actual URLs consulted
```

**智能体命名约定：** `research-[thread-slug]`（例如 `research-market-forces`、`research-historical-precedent`）

### 阶段 3：综合分析（编排器——所有智能体完成后）

所有智能体返回结果后，将其综合为一份统一的战略分析文档：

#### 文档结构：

```markdown
---
type: strategic-research
domain: [auto-detect from question]
date: YYYY-MM-DD
question: "[original question]"
threads: [list of research threads]
confidence: [overall confidence HIGH/MEDIUM/LOW]
tags:
  - auto-research
  - strategy
  - [topic tags]
status: complete
---

# [Strategic Question as Title]

## Executive Summary
3-5 sentences capturing the core insight. Lead with the answer, not the process.

## The Strategic Landscape
Synthesized view across all research threads. Not a thread-by-thread dump — weave findings together into a coherent narrative.

## Key Forces at Play
The 3-4 most important dynamics shaping this question, with evidence from multiple threads.

## Scenarios
### Scenario A: [Most Likely] — X% confidence
What happens, timeline, implications

### Scenario B: [Optimistic/Alternative]
What happens, timeline, implications

### Scenario C: [Worst Case/Disruption]
What happens, timeline, implications

## Emerging Tech & Architectures to Watch
Concepts, projects, and frameworks that are still in development/discussion but could be foundational. For each:
- **What it is:** One-paragraph explanation
- **Maturity:** Pre-alpha / Alpha / Early adoption / Growing community
- **Technical approach:** How it works architecturally
- **Relevance to our use case:** Why it matters for us specifically
- **Adoption path:** What it would take to integrate/adopt — effort, risks, dependencies
- **Key links:** GitHub repo, paper, discussion thread

## Strategic Options
For each option:
- **Description:** What this means concretely
- **Pros:** With evidence
- **Cons:** With evidence
- **Prerequisites:** What needs to be true
- **Timeline:** When to decide/act
- **Emerging tech leverage:** Which emerging concepts from above could strengthen this option

## Recommended Actions
Prioritized, concrete, time-bound action items. Not vague "consider X" — specific "do X by Y because Z."
Include a separate "Tech Bets" subsection: which emerging projects to start experimenting with now, even if they're not production-ready.

## Contrarian View
The strongest argument against the consensus/recommended path. What could make all of this wrong?

## Confidence & Gaps
- What we're confident about and why
- What we couldn't determine and what additional research would help
- Key assumptions that should be monitored

## Sources
Consolidated, deduplicated list of all sources across threads.
```

### 阶段 4：保存并交付

1. 将完整分析保存至 `05-knowledge/research/YYYY-MM-DD-[slug].md`
2. 如果分析较长（>3000 字），还需在 `05-knowledge/research/YYYY-MM-DD-[slug]-summary.md` 创建一份简短的单页摘要
3. 直接在聊天中向用户展示执行摘要和建议行动

---

## 质量标准

- **不得虚构来源。** 每项论断都必须能够追溯至真实的 WebSearch/WebFetch 结果。
- **时效性很重要。** 优先采用过去 6 个月内的来源。对更早的内容予以标注。
- **保持偏见意识。** 当来源存在明显的商业利益动机时，应予以说明。
- **具体优于笼统。** “测试工具市场规模为 $XX.XB，并正以 YY% 的复合年增长率增长”优于“市场正在增长”。
- **可操作性。** 输出应帮助用户做出决策，而不仅仅是理解某个主题。
- **学术诚实。** 如果研究无法得出明确结论，请如实说明。不要凭空制造虚假的确定性。

## 拆解示例

**问题：**“如果通用 LLM 模型随着时间推移不断改进，像 Katalon 或 Scout 这样的 LLM 封装公司的未来会怎样？”

**研究线索：**
1. **基础模型发展轨迹** — GPT/Claude/Gemini 在代码理解、测试生成和缺陷检测方面的进步有多快？其能力曲线如何？
2. **历史先例：平台商品化** — 当平台将相关功能纳入自身后，那些建立在 AWS、iOS、Salesforce 等平台之上的公司发生了什么？哪些公司存活了下来，原因是什么？
3. **测试行业结构** — 当前市场版图、价值链、利润集中在哪里，以及买家真正愿意为什么付费
4. **封装公司策略** — 当前的 AI 封装公司（Jasper、Copy.ai、Cursor 等）正在如何适应？哪些策略行之有效？
5. **企业购买行为** — 企业购买的是“AI”还是“解决方案”？采购的实际情况如何？
6. **新兴技术与架构** — 哪些尚未成为主流的概念可能重塑这一格局？（例如，新型智能体框架、新的测试范式、计算机操作智能体、浏览器自动化架构）。搜索 GitHub 仓库、arXiv、Twitter/X 开发者帖子、Discord 社区和会议演讲。
7. **防御性分析** — 面向测试领域的 AI 公司具备哪些护城河？数据、工作流、集成、品牌、转换成本？
8. **反向观点：封装公司胜出** — 为什么随着模型商品化，垂直 AI 公司的价值实际上可能会有所提升？

## 运行时长预期
- 阶段 1：约 2 分钟（拆解 + 用户确认）
- 阶段 2：约 5-10 分钟（并行研究，总时长取决于耗时最长的智能体）
- 阶段 3：约 3-5 分钟（综合分析）
- 总计：一次全面的战略分析约需 10-15 分钟

## 错误处理

- 如果某条研究线索返回的结果质量较低，应在综合分析中注明，而不是凭空制造研究深度
- 如果某条研究线索的 WebSearch/WebFetch 失败，请使用替代搜索词重试一次，然后记录该信息缺口
- 用户可在阶段 2 期间中断流程，以调整方向或添加研究线索
- 可以针对相关问题多次运行该 Skill——引用 `05-knowledge/research/` 中此前的研究文件

## 回退行为

此技能需要 WebSearch 和 WebFetch 工具。如果这些工具不可用：
- 回退到仅使用知识库的分析方式，使用现有的 `05-knowledge/` 内容
- 明确说明未进行实时网络研究
- 建议用户在网络工具可用时再次运行此技能