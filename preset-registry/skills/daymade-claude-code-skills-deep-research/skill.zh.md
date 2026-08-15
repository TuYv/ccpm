---
name: deep-research
description: |
  Generate format-controlled research reports with evidence tracking, citations, source governance, and multi-pass synthesis.
  This skill should be used when users request a research report, literature review, market or industry analysis,
  competitive landscape, policy or technical brief. Triggers: "帮我调研一下", "深度研究", "综述报告", "深入分析",
  "research this topic", "write a report on", "survey the literature on", "competitive analysis of",
  "技术选型分析", "竞品研究", "政策分析", "行业报告".
  V6 adds: source-type governance, AS_OF freshness checks, mandatory counter-review, and citation registry. V6.1 adds: source accessibility (circular verification forbidden, exclusive advantage encouraged).
---
# 深度研究

创建高保真研究报告，严格控制格式，并进行证据映射、来源治理和多轮综合分析。

## 架构：主代理 + 子代理

```
Lead Agent (coordinator — minimizes raw search context)
  |
  P0: Environment + source policy setup
  |
  P1: Research Task Board (roles, queries, parallel groups)
  |
  Dispatch ──→ Subagent A ──→ writes task-a.md ──┐
           ──→ Subagent B ──→ writes task-b.md ──┤ (parallel)
           ──→ Subagent C ──→ writes task-c.md ──┘
  |                                               |
  |     research-notes/  <────────────────────────┘
  |
  P2: Build citation registry with source_type + as_of + authority
  P3: Evidence-mapped outline with counter-claim flags
  P4: Draft from notes (never from raw search results)
  P5: Counter-review (claims, confidence, alternatives)
  P6: Verify (every [n] in registry, traceability check)
  P7: Polish → final report with confidence markers
```

**上下文效率：** 子代理的原始搜索结果保留在各自的上下文中，随后被丢弃。主代理仅查看提炼后的笔记（上下文减少约 60-70%）。

## 模式选择

在开始之前确定研究模式：

| 维度 | 选项 |
|-----------|---------|
| **主题模式** | 企业研究（公司/企业）或通用研究（行业/政策/技术） |
| **深度模式** | 标准（5-6 个任务，3000-8000 字）或轻量（3-4 个任务，2000-4000 字） |

- **企业研究模式**：进行六维数据收集，并采用结构化分析框架（SWOT、风险矩阵、竞争壁垒量化）
- **通用研究模式**：采用包含来源治理的标准 P0-P7 研究流程
- **深度选择**：针对少于 30 字的单一实体/概念采用轻量模式；针对多实体比较或包含“深入”/“comprehensive”的请求采用标准模式

## 来源治理（V6）

### 来源可访问性分类

**关键规则**：必须按可访问性对每个来源进行分类：

| 可访问性 | 定义 | 示例 | 使用规则 |
|--------------|------------|----------|------------|
| `public` | 任何外部研究人员无需身份验证即可访问 | 公开网站、新闻文章、WHOIS（未启用隐私保护）、学术论文 | ✅ 始终允许 |
| `semi-public` | 需要注册或访问权限受限 | LinkedIn 个人资料、Crunchbase 基础版、行业报告（免费层级） | ✅ 允许，但须披露 |
| `exclusive-user-provided` | 用户的付费订阅、私有 API、专有数据库 | Crunchbase Pro、PitchBook、私有数据源、内部数据库 | ✅ **允许**用于第三方研究 |
| `private-user-owned` | 用户在研究自身时使用的自有账户 | 用户为其自有公司使用的注册商账户、用户为其自身财务使用的银行账户 | ❌ **禁止**——循环验证 |

**⚠️ 禁止循环验证**：不得：
- 使用用户的私有数据来“发现”他们已经了解的自身信息
- 通过访问用户的私有账户来研究用户自己的公司
- 将用户的私有知识表述为“研究发现”

**✅ 独家信息优势**：你应该：
- 使用用户的 Crunchbase Pro 研究竞争对手
- 使用用户的专有数据库开展市场研究
- 使用用户的私有 API 进行投资分析
- 利用用户提供的任何独家来源开展第三方研究

### 来源类型标签

每个来源还必须标记以下标签：

| 标签 | 定义 | 示例 |
|-------|------------|----------|
| `official` | 第一手来源、官方文档 | 公司 SEC 申报文件、政府报告、官方博客 |
| `academic` | 经同行评审的研究 | 期刊文章、会议论文、学位论文 |
| `secondary-industry` | 专业分析 | 行业报告、分析师研报、行业出版物 |
| `journalism` | 新闻报道 | 信誉良好的媒体、调查性新闻 |
| `community` | 用户生成内容 | 论坛、评论、社交媒体、问答网站 |
| `other` | 未分类或混合类型 | 聚合网站、未经核实的来源 |

**质量门槛：**
- 标准模式：最终批准的来源集中，官方来源占比 ≥30%
- 轻量模式：官方来源占比 ≥20%
- 单一来源占比上限：≤25%（标准模式），≤30%（轻量模式）
- 唯一域名数量下限：5 个（标准模式），3 个（轻量模式）

## AS_OF 日期策略

在 P0 阶段明确设置 `AS_OF` 日期。对于所有具有时效性的论断：
- 每条引用都须包含来源发布日期
- 如果来源早于相关的有效时限，则降低置信度
- 在来源登记表中标记过时来源（研究超过 3 年；对于快速变化的主题，新闻超过 6 个月）

## P0：环境与策略设置

开始之前检查能力：

| 检查项 | 要求 | 缺失时的影响 |
|-------|-------------|-------------------|
| web_search 可用 | 必需 | 停止——无法继续 |
| web_fetch 可用 | DEEP 任务必需 | 仅限 SCAN 模式 |
| 子代理调度 | 首选 | 降级为顺序执行 |
| 文件系统可写 | 必需 | 仅使用内存笔记 |

设置策略变量：
- `AS_OF`：当天日期（YYYY-MM-DD）——对于时效性主题为必填项
- `MODE`：标准模式（默认）或轻量模式
- `SOURCE_TYPE_POLICY`：强制使用 official/academic/secondary/journalism/community/other 标签
- `COUNTER_REVIEW_PLAN`：要检验的对立解读

报告：`[P0 complete] Subagent: {yes/no}. Mode: {standard/lightweight}. AS_OF: {YYYY-MM-DD}.`

研究特定公司/企业时，请遵循以下专用工作流，以确保覆盖六个维度、采用量化分析框架，并实施三级质量控制。

### 企业工作流概览

```
Enterprise Research Progress:
- [ ] E1: Intake — confirm company entity, research depth, format contract
- [ ] E2: Six-dimension data collection (parallel where possible)
  - [ ] D1: Company fundamentals (entity, founding, funding, ownership)
  - [ ] D2: Business & products (segments, products, revenue structure)
  - [ ] D3: Competitive position (industry rank, competitors, barriers)
  - [ ] D4: Financial & operations (3-year financials, efficiency metrics)
  - [ ] D5: Recent developments (6-month events, strategic signals)
  - [ ] D6: Internal/proprietary sources (or note limitation)
- [ ] E3: Structured analysis frameworks
  - [ ] SWOT analysis (evidence-backed, 4 quadrants × 3-5 entries)
  - [ ] Competitive barrier quantification (7 dimensions, weighted score)
  - [ ] Risk matrix (8 categories, probability × impact)
  - [ ] Comprehensive scorecard (6 dimensions, weighted total)
- [ ] E4: L1/L2/L3 quality checks at each stage transition
- [ ] E5: Draft report using 7-chapter enterprise template
- [ ] E6: Multi-pass drafting + UNION merge (same as general Step 6-7)
- [ ] E7: Present draft for human review and iterate
```

## P1：研究任务看板

将研究问题拆分为 4-6 个调查任务（标准模式）或 3-4 个任务（轻量模式）。

每项任务分配包括：
- **专家角色**：专业人员角色设定（例如，“政策历史学家”“生态系统分析师”）
- **目标**：用一句话描述调查目标
- **查询**：2-3 个预先规划的搜索查询
- **深度**：DEEP（获取 2-3 篇完整文章）或 SCAN（摘要片段即可）
- **输出**：研究笔记文件的路径
- **并行组**：A 组（独立）或 B 组（依赖 A 组）

### 任务拆分规则

1. 每项任务涵盖一个由相应专家负责的、连贯一致的子主题
2. A 组任务必须相互独立，并确保来源多样化
3. 每个并行组最多包含 3 项任务（并发限制）
4. 每项任务都必须标记时效性声明及预期的引用老化风险

### 企业研究集成

在企业研究模式下，任务看板对应六个维度：
- 任务 A：公司基本信息（实体、成立时间、融资、所有权）
- 任务 B：业务与产品（业务板块、产品、收入结构）
- 任务 C：竞争地位（行业排名、竞争对手、壁垒）
- 任务 D：财务与运营（3 年财务数据、效率指标）
- 任务 E：近期动态（过去 6 个月的事件、战略信号）
- 任务 F：内部/专有来源（或文档局限性）

报告：`[P1 complete] {N} tasks in {M} groups. Dispatching Group A.`

---

## 企业研究模式（专用流程）

研究特定公司/企业时，请遵循此专用工作流，以确保覆盖六个维度、采用量化分析框架并实施三级质量控制。

### E1：信息收集

与上述 P0/P1 相同，另外还需：
- 确认所研究的确切法律实体（母公司还是子公司）
- 选择研究深度：快速扫描（3-5 页）/ 标准（10-20 页）/ 深入（20-40 页）
- 确定任何特定的比较对象（基准公司）

## P2：分派与调查

子代理使用 [references/subagent_prompt.md](references/subagent_prompt.md) 执行任务，并按照 [references/research_notes_format.md](references/research_notes_format.md) 输出结果。

### 使用子代理时（Claude Code / Cowork / DeerFlow）

1. 并行分派 A 组任务（最多同时执行 3 项）
2. 每个子代理执行搜索、获取内容并标记来源类型
3. 每个来源行都包含 `Source-Type` 和 `As Of`
4. 等待 A 组完成
5. 分派 B 组任务（可以读取 A 组笔记）

### 子代理输出要求

每个 task-{id}.md 必须包含：
- **来源部分**：实际搜索结果中的 URL，并包含 Source-Type、As Of、Authority (1-10)
- **发现部分**：最多 10 条带来源编号的单句事实
- **深度阅读笔记**（DEEP 任务）：完整阅读 2-3 个来源，并记录关键数据/洞察
- **缺口部分**：搜索过但未找到的内容，以及其他可能的解释

### 不使用子代理时（降级模式）

主代理依次执行各项任务，并分别扮演每位专家。写入笔记后，原始搜索结果将被丢弃。

### 企业研究：六维信息收集

按照 [references/enterprise_research_methodology.md](references/enterprise_research_methodology.md) 执行以下工作：
- 各维度的详细信息收集工作流（查询策略、数据字段、验证）
- 数据源优先级矩阵（P0-P3 排名）
- 交叉验证规则（最少来源数、最大偏差阈值）

**关键原则**：
- 证据驱动：每项结论都必须可追溯至可引用的来源
- 多源验证：关键数据需要 ≥2 个独立来源
- 审慎判断：明确标注推测，避免无依据的断言
- 结构化呈现：通过表格、列表和层级结构呈现复杂信息

完成每个维度后，执行 L1 质量检查（参见 enterprise_quality_checklist.md）。

单项任务状态：`[P2 task-{id} complete] {N} sources, {M} findings.`
全部任务状态：`[P2 complete] {N} tasks done, {M} total sources. Building registry.`

### E3：结构化分析框架

按顺序应用 [references/enterprise_analysis_frameworks.md](references/enterprise_analysis_frameworks.md) 中的框架：
1. **SWOT 分析** — 每个条目均须包含证据 + 来源 + 影响评估
2. **竞争壁垒量化** — 从 7 个维度进行加权评分 → A+/A/B+/B/C+/C 评级
3. **风险矩阵** — 8 个必选类别，概率 × 影响 → 红色/黄色/绿色
4. **综合评分卡** — 6 个维度加权总分 → X/10

分析完成后，执行 L2 质量检查。

### E4：质量控制

按照 [references/enterprise_quality_checklist.md](references/enterprise_quality_checklist.md) 执行三级检查：
- **L1（数据）**：来源数量、来源归属、交叉验证、时效性
- **L2（分析）**：SWOT 完整性、风险覆盖范围、壁垒评分、结论支撑
- **L3（文档）**：结构合规性、格式一致性、可读性、附录

### E5：使用企业报告模板起草

使用 enterprise_quality_checklist.md 中的企业报告七章模板：
1. 公司概览
2. 业务与产品结构
3. 市场与竞争地位
4. 财务与运营分析
5. 风险与关注事项
6. 近期动态
7. 综合评估与结论

另加附录：数据源索引、术语表、免责声明。

### E3-E7：企业分析、起草与审阅

- **E3：结构化分析** — 应用 [references/enterprise_analysis_frameworks.md](references/enterprise_analysis_frameworks.md) 中的框架
- **E4：质量控制** — 按照 [references/enterprise_quality_checklist.md](references/enterprise_quality_checklist.md) 执行 L1/L2/L3 检查
- **E5：起草** — 使用企业报告七章模板
- **E6-E7：多轮起草与审阅** — 与下文的 P4-P7 相同

---

## P3：引用注册表 + 来源治理

主代理读取所有任务记录，并构建统一注册表。

### 注册表处理流程

1. 读取每个任务文件的 `## Sources` 部分
2. 合并所有来源，并按 URL 去重
3. 按首次出现的顺序分配连续的 [n] 编号
4. 添加标签：source_type、as_of 日期、权威性评分（1-10）、任务 id
5. **应用质量门槛：**
   - 标准版：≥12 个获批来源、≥5 个不同域名、≥30% 为官方来源
   - 轻量版：≥6 个获批来源、≥3 个不同域名、≥20% 为官方来源
   - 单一来源占比上限：≤25%（标准版）、≤30%（轻量版）
6. **移除低于门槛的来源**，并明确列出这些来源

### 注册表输出格式

```
CITATION REGISTRY

Approved:
[1] Author/Org — Title | URL | Source-Type: official | Accessibility: public | Date: 2026-03-01 | Auth: 8 | task-a
[2] ...

Dropped:
x Source | URL | Source-Type: community | Accessibility: privileged | Auth: 3 | Reason: PRIVILEGED SOURCE - NOT ALLOWED

Stats: {approved}/{total}, {N} domains, official_share {xx}%
Privileged sources rejected: {N}
```

**关键规则：**这些 [n] 是最终编号。P5 只能引用 Approved 列表中的来源。Dropped 来源绝不能再次出现。

**循环验证处理**：研究用户自己的公司/资产时，如果你在用户的私人账户中发现数据（例如，用户的域名注册商显示他们拥有某些域名），你必须：
1. 将其从注册表中剔除（用户已经知道这些信息）
2. 在 Dropped 中将其注明为「CIRCULAR - USER ALREADY KNOWS」
3. 搜索同等的公开来源（例如公开 WHOIS、新闻报道）
4. 仅从外部调查者的视角进行报告

**独家来源处理**：当用户明确提供其付费订阅或私有 API，用于第三方研究时（例如「使用我的 Crunchbase Pro 研究竞争对手」），你应该：
1. 将其作为可访问性为「exclusive-user-provided」的来源接受
2. 将其作为竞争优势加以利用
3. 在注册表中正确引用
4. 如果不存在同等的公开来源，则标记为 [unverified] 或省略该主张

报告：`[P3 complete] {approved}/{total} sources. {N} domains. Official share: {xx}%. Privileged rejected: {N}.`

### 处理信息黑箱

研究没有公开足迹的实体时（如「字节跳动子公司」示例）：

**外部研究人员会发现的情况：**
- WHOIS：隐私保护 → 无所有者信息
- 网络搜索：无新闻、无新闻稿
- 社交媒体：无公司主页
- 企业注册机构：无公开 API 或需要本地访问
- 结果：**完全的信息黑箱**

**正确响应：**
```
Findings: NO PUBLIC INFORMATION AVAILABLE

Sources checked:
- WHOIS (public): Privacy protected [failed]
- Company registry (public): Access denied/No API [failed]
- News media: No coverage [failed]
- Corporate website: Placeholder only [minimal]

Verdict: UNABLE TO VERIFY COMPANY EXISTENCE from external perspective
Sources found: 0 (or minimal, e.g., only WHOIS showing domain exists)
Confidence: N/A - Insufficient evidence
```

**不要：**
- ❌ 使用用户自己的凭据来「填补空白」
- ❌ 仅根据域名注册就假定公司存在
- ❌ 用推测填补缺失数据
- ❌ 声称已「验证」通过特权方式访问的信息

**要：**
- ✅ 清楚说明外部研究人员能够/无法验证什么
- ✅ 记录所有失败的搜索尝试
- ✅ 将主张标记为 [unverified]，或将其完全省略
- ✅ 如果公开来源不足，则将模式降级为 Lightweight 或停止
- ✅ 建议通过直接联系开展尽职调查

---

## P4：证据映射大纲

主代理读取笔记和注册表以构建大纲。

1. 识别跨任务模式
2. 按主题而非任务顺序设计章节
3. 将每个章节映射到带有来源编号的具体发现
4. 标记需要反向审查的章节
5. 使用 AS_OF 检查标记对时效性敏感的主张

大纲格式：
```
## N. {Section Title}
Sources: [1][3][7] from tasks a, b
Claims: {claim from task-a finding 3}, {claim from task-b finding 1}
Counter-claim candidates: {alternative explanations}
Recency checks: {source dates + AS_OF}
Gaps: {limited official evidence}
```

---

## P5：根据笔记起草

使用 [references/report_template_v6.md](references/report_template_v6.md) 逐节撰写。

**规则：**
- 每项事实性主张都需要引用 [n]
- 数字/百分比必须有来源
- 每节添加**置信度标记**：High/Medium/Low，并说明理由
- 证据冲突时，添加**反向主张句**
- 不得引入新来源
- 对缺乏支持的陈述使用 [unverified]

**防止幻觉：**
- Lead agent 绝不虚构 URL——只能使用 subagent 笔记中的 URL
- Lead agent 绝不捏造数据——如果笔记中没有该数字，则标记为 [unverified]

状态：`[P5 in progress] {N}/{M} sections, ~{words} words.`

---

## P6：反向审查（必需）

针对每项主要结论，执行反向观点检查：

1. **该结论是否可能是错误的？**
2. **哪些高影响力主张依赖单一来源？**
3. **哪些主张缺乏官方/学术支持？**
4. **是否使用了过时来源来支持时效性较强的主张？**
5. **找出 ≥3 个问题**（如果发现 0 个，则重新审查）

### 使用 Counter-Review Team（推荐）

如需进行全面的并行审查，请使用 Counter-Review Team：

```bash
# 1. Prepare inputs
counter-review-inputs/
  ├── draft_report.md
  ├── citation_registry.md
  ├── task-notes/
  └── p0_config.md

# 2. Dispatch to 4 specialist agents in parallel
SendMessage to: claim-validator
SendMessage to: source-diversity-checker
SendMessage to: recency-validator
SendMessage to: contradiction-finder

# 3. Wait for all specialists to complete

# 4. Send to coordinator for synthesis
SendMessage to: counter-review-coordinator
  inputs: [4 specialist reports]

# 5. Receive final P6 Counter-Review Report
```

详细用法请参阅 [references/counter_review_team_guide.md](references/counter_review_team_guide.md)。

### 手动反向审查（备用方案）

如果 Counter-Review Team 不可用，则执行手动检查：
- 验证每项高置信度主张都有 ≥2 个来源
- 检查关键主张是否有官方/学术依据
- 验证时效性较强的主张中的 AS_OF 日期
- 记录相反的解读

### 输出

在最终报告中包含：
```
## 核心争议 / Key Controversies
- **争议 1:** [主张 A 与反向证据 B 对比] [n][m]
- **争议 2:** ...
```

报告：`[P6 complete] {N} issues found: {critical} critical, {high} high, {medium} medium.`

---

## P7：验证

在最终定稿前进行交叉检查：

1. **Registry 交叉检查：** 将报告中的每个 [n] 与已批准的 registry 逐一核对
2. **抽查 5 项以上主张：** 追溯至 task notes
3. **删除/修正无法追溯的主张**
4. **验证已弃用的来源未被重新引入**
5. **检查关键主张的来源集中度**

报告：`[P7 complete] {N} spot-checks, {M} violations fixed.`

---

## 输出要求

- 与要求的语言和语气保持一致
- 保留 English 技术术语
- 遵循报告规范和格式规则
- 包含参考资料部分或参考文献目录

## 参考文件

### 核心 V6 流程参考资料

| 文件 | 何时加载 |
| --- | --- |
| [source_accessibility_policy.md](references/source_accessibility_policy.md) | **P0（关键）**：来源分类规则——首先阅读 |
| [subagent_prompt.md](references/subagent_prompt.md) | P2：向子代理分派任务 |
| [research_notes_format.md](references/research_notes_format.md) | P2：子代理输出格式 |
| [report_template_v6.md](references/report_template_v6.md) | P5：使用置信度标记和反向审查起草报告 |
| [quality_gates.md](references/quality_gates.md) | 所有阶段：质量阈值和反幻觉检查 |

### 通用研究参考资料

| 文件 | 何时加载 |
| --- | --- |
| [research_report_template.md](references/research_report_template.md) | 构建大纲和草稿结构 |
| [formatting_rules.md](references/formatting_rules.md) | 强制执行章节格式和引用规则 |
| [source_quality_rubric.md](references/source_quality_rubric.md) | 对来源进行评分和优先级分类 |
| [research_plan_checklist.md](references/research_plan_checklist.md) | 制定研究计划和查询集 |
| [completeness_review_checklist.md](references/completeness_review_checklist.md) | 审查覆盖范围、引用和合规性 |

### 企业研究参考资料（处于企业研究模式时加载）

| 文件 | 何时加载 |
| --- | --- |
| [enterprise_research_methodology.md](references/enterprise_research_methodology.md) | 六维数据收集工作流、来源优先级、交叉验证规则 |
| [enterprise_analysis_frameworks.md](references/enterprise_analysis_frameworks.md) | SWOT 模板、竞争壁垒量化、风险矩阵、综合评分 |
| [enterprise_quality_checklist.md](references/enterprise_quality_checklist.md) | L1/L2/L3 质量检查、各维度检查清单、7 章报告模板 |

## 反模式

- 只进行单轮起草，而不并行完成多轮完整起草
- 按章节拆分各轮起草，而不是每轮都起草完整报告
- 忽略格式约定或用户模板
- 提出没有引用或证据表映射的主张
- 混用相互冲突的日期，却不明确指出差异
- 未经验证便复制外部 AI 输出
- 删除中间草稿或原始研究输出
- **主代理读取原始搜索结果**——只能读取子代理笔记
- **编造 URL**——只能使用实际搜索结果中的 URL
- **重新启用已弃用的来源**——在 P3 中弃用的来源不得再次出现
- **时效性主张缺少 AS_OF**——始终包含来源日期
- **跳过反向审查**——强制执行的 P6 必须发现 ≥3 个问题
- **循环验证**——绝不能使用用户的私有数据去“发现”他们已经了解的自身信息
- **忽略独家来源**——当用户为竞争对手研究提供 Crunchbase Pro 等来源时，必须使用

## 下一步：验证并交付

完成研究后，建议进行验证并选择输出方式：

```
Research report complete: [N] sources cited, [M] claims made.

Options:
A) Verify facts — run /fact-checker on the report (Recommended)
B) Create slides — run /daymade-docs:ppt-creator from the findings
C) Export as PDF — run /daymade-docs:pdf-creator for formal delivery
D) No thanks — the report is ready as-is
```