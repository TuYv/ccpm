---
name: moai-domain-research
description: >
  Market and ecosystem research specialist for /moai brain Phase 3. Executes parallel
  WebSearch + Context7 queries, handles tool failures gracefully, and produces structured
  research.md artifacts with cited sources and research limitations.

when_to_use: >
  Use for /moai brain Phase 3 market and ecosystem research: parallel
  WebSearch and Context7 queries, competitive-landscape analysis, source
  citation, and structured research.md artifacts with graceful
  tool-failure handling.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Grep, Glob, WebSearch, WebFetch, mcp__context7__resolve-library-id, mcp__context7__get-library-docs
user-invocable: false
metadata:
  version: "1.0.0"
  category: "domain"
  status: "active"
  updated: "2026-05-04"
  modularized: "false"
  tags: "research, web-search, context7, market-analysis, parallel-tools, brain"
  related-skills: "moai-domain-ideation, moai-foundation-thinking"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000
---
<!-- 验证：阶段 3 在单条消息中并行调用 WebSearch + Context7 -->

# 研究领域专家

脑力工作流阶段 3 的并行研究执行器。同时发起 WebSearch 和 Context7 工具调用（遵循 Anthropic 最佳实践的单消息并行调用模式），妥善处理部分失败，并生成结构化的 `research.md` 产物。

## 快速参考

核心职责：
- 并行执行 WebSearch + Context7（单条消息，多次工具调用）
- 妥善处理工具失败（允许部分结果）
- 生成包含来源引用及明确“研究局限性”章节的 `research.md`
- 保持语言和技术中立

关键保证：
- [硬性要求] 工具调用必须并行发起（在单条 Claude 消息中），不得顺序调用
- [硬性要求] 研究失败不会中止阶段 3——可以接受部分结果
- [硬性要求] research.md 中的每个来源都有引用（URL 或工具引用）
- [硬性要求] 任何工具调用失败或返回空结果时，必须包含“研究局限性”章节

---

## 阶段 3：研究执行

### 输入

- 来自阶段 1、带有用户上下文且经过清晰度评分的想法
- 来自阶段 2 的发散概念图（内存中）
- 可选：现有 `.moai/project/tech.md`，用于获取技术栈上下文（只读）

### 步骤 1：查询设计

发起工具调用前，为每种工具类型设计 2-4 个有针对性的查询：

**WebSearch 查询设计原则**：
- 搜索内容：现有解决方案、市场规模、用户痛点、竞争格局
- 同时包含宽泛查询（"habit tracking apps market"）和针对性查询（"habit tracking for seniors accessibility challenges"）
- 针对阶段 2 发散出的每个主要方向各设置一个查询（使用排名前 3 的方向）
- 除非用户明确限定技术栈，否则避免使用针对特定技术的查询

**Context7 查询设计原则**：
- 搜索内容：解决方案领域中的相关库、框架或平台
- 重点关注生态系统工具（而非特定语言的实现）——例如，查询 "habit tracking SDK"，而不是 "habit tracking React library"
- 先使用 `resolve-library-id`，再对最匹配的结果使用 `get-library-docs`

### 步骤 2：并行工具调用

[硬性要求] 在单条 Claude 消息中发起所有准备好的工具调用。这是 Anthropic 工具使用文档中记载的并行工具调用模式。

模式（伪代码——实际工具语法以 Claude Code 为准）：
```
[Single message containing multiple tool_use blocks]
  WebSearch("habit tracking apps market size")
  WebSearch("senior citizen mobile app accessibility best practices")
  WebSearch("habit formation psychology research")
  mcp__context7__resolve-library-id("habit tracking")
```

与顺序调用相比，单消息并行调用速度快 50-70%，并且是独立工具调用的规范模式。

### 步骤 3：失败处理

工具调用返回后，评估结果：

| 场景 | 行为 |
|----------|----------|
| 所有工具均成功 | 使用完整结果继续 |
| WebSearch 失败，Context7 成功 | 继续——在“研究局限性”中注明 WebSearch 失败 |
| Context7 失败，WebSearch 成功 | 继续——在“研究局限性”中注明 Context7 失败 |
| 两者均失败 | 使用空来源继续——添加醒目的“研究局限性”说明 |
| WebSearch 返回部分结果（部分查询为空） | 使用可用结果——在“研究局限性”中注明缺失的查询 |

[HARD] 在任何工具失败的情况下，都不要中止阶段 3。仅包含 Research Limitations 部分的 `research.md` 也是有效输出。

### 步骤 4：来源处理

对于每个成功的 WebSearch 结果：
1. 提取 URL、标题以及 1-2 句相关性摘要
2. 分类为：market_data、user_research、competitor、technical_ecosystem、case_study
3. 丢弃明显偏离主题的结果（领域错误、问题空间错误）

对于每个 Context7 库结果：
1. 记录库名称、版本和主要能力
2. 提取与该创意相关的关键功能
3. 记录其生态系统（而非特定语言）背景

### 步骤 5：综合分析

处理来源后，将研究发现综合归纳为 3-5 个主题领域：
1. **市场格局**：规模、增长、现有参与者、市场空白
2. **用户需求**：痛点、使用场景、已验证的问题
3. **技术生态系统**：可用工具、标准、构建模块（语言中立）
4. **风险信号**：竞争威胁、监管问题、技术复杂性
5. **机会**：尚未满足的需求、时机因素、差异化角度

### 输出格式

将 `research.md` 写入 `.moai/brain/IDEA-NNN/`：

```markdown
# Research: {idea summary}
*Phase 3 — Brain Workflow | Date: {date} | Idea: IDEA-NNN*

## Executive Summary

{2-3 sentences: what was learned and what it implies for the idea}

## Market Landscape

{Findings about existing solutions, market size, competitive dynamics}

Sources:
- [{source title}]({URL}): {1-sentence relevance}
- ...

## User Needs

{Validated user problems, use cases, and success patterns from research}

Sources:
- [{source title}]({URL}): {1-sentence relevance}

## Technical Ecosystem

{Language-neutral overview of available tools, platforms, and standards relevant to the idea}

Sources:
- [{source title/library}]({URL or context7 reference}): {1-sentence relevance}

## Risk Signals

{Competitive threats, known failure patterns, regulatory or technical risks}

## Opportunities

{Gaps in existing solutions, timing factors, differentiation levers}

## Sources Summary

| Source | Type | Relevance |
|--------|------|-----------|
| {title} | {market_data/user_research/competitor/technical_ecosystem/case_study} | {brief note} |
...
Total sources: {N}

## Research Limitations

{Present ONLY if any tool call failed or returned empty. Omit this section if all tools succeeded.}

{Examples:}
- WebSearch was unavailable during this session. Market data may be incomplete.
- Context7 returned no results for "habit tracking". Technical ecosystem section is based on WebSearch only.
- WebSearch query "{query}" returned zero results. Competitive landscape may have gaps.
```

---

## 研究中的技术中立性

[HARD] Technical Ecosystem 部分必须从生态系统层面描述能力和工具，而不是从语言层面描述：

- 正确：“推送通知平台（Firebase、OneSignal、APNS/FCM）同时支持移动端和 Web 端目标”
- 错误：“适用于 React Native 的 Firebase Cloud Messaging SDK 是标准方案”

用户将在 `/moai project` 和 `/moai plan` 期间选择其技术栈。研究应为该选择提供参考，而不是代替用户做出选择。

---

## 并行调用证据

检查会话记录时，阶段 3 的研究必须在单个 assistant 轮次中显示多个 tool_use 块。这是已发出并行调用的可验证证据：

```
Turn N (assistant):
  <tool_use id="a1">WebSearch("query 1")</tool_use>
  <tool_use id="a2">WebSearch("query 2")</tool_use>
  <tool_use id="a3">mcp__context7__resolve-library-id("library")</tool_use>
```

顺序调用（每轮调用一个工具）违反并行工具调用要求，应予以避免。

---

## GLM 后端说明

当会话运行在 GLM 后端（`moai glm` / `moai cg` GLM 窗格）上时，`WebSearch` 和 `WebFetch` 会路由到 z.ai MCP 工具（`mcp__web_search_prime__webSearchPrime` / `mcp__web_reader__webReader`），而不是内置工具——有关强制路由表，请参阅 `.claude/rules/moai/core/glm-web-tooling.md`。

---

## 可配合使用

- `moai-domain-ideation`：研究发现会输入阶段 4 的收敛上下文，从而形成更有依据的精益画布
- `moai-workflow-brain`：通过适当的 IDEA-NNN 目录管理来编排阶段 3 的执行
- `moai-foundation-thinking`：阶段 5 的批判性评估使用研究发现作为证据
- `/deep-research <question>`：内置的深度研究工作流是一条比此技能自身的并行 WebSearch + Context7 更重量级的多来源路径——它会扇出执行 Web 搜索、相互交叉核验来源、对存在争议的论断进行投票，并返回带引用的报告。它需要 WebSearch 工具；一次工作流运行所消耗的 token 明显多于单轮搜索；同时 AskUserQuestion 边界仍然有效——编排器会在启动前收集并完善研究问题，绝不会在运行过程中进行。

---

## 常见的合理化说辞

| 合理化说辞 | 事实 |
|----------------|---------|
| “顺序调用对于避免速率限制更安全” | 并行调用是 Anthropic 推荐的模式。速率限制由 API 层处理，而不是通过串行化工具调用来处理。 |
| “如果 WebSearch 失败，我应该中止，因为研究会不完整” | 部分研究胜于没有研究。研究局限性章节可以清楚地说明缺失之处。 |
| “Context7 库特定于语言，所以我应该按用户的语言进行筛选” | 研究描述的是生态系统——应涵盖所有相关工具，无论其实现语言如何。技术选型推迟到 /moai plan。 |
| “2 条 WebSearch 查询就足够了” | 每个主要角度使用 2-4 条查询。采样不足会遗漏竞争格局中的空白。 |

## 验证

- [ ] 工具调用以并行方式出现（单个 assistant 轮次中包含多个 tool_use 块）
- [ ] 无论工具失败情况如何，均已生成 research.md
- [ ] 所有引用的来源都有 URL 或工具引用
- [ ] 技术生态系统章节不包含特定语言/框架的规定性建议
- [ ] 如果有任何工具调用失败，则包含研究局限性章节
- [ ] research.md 中的执行摘要至少包含 2 个句子