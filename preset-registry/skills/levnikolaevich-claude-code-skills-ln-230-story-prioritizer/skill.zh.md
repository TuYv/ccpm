---
name: ln-230-story-prioritizer
description: "RICE-scores Stories with market research and generates prioritization table. Use when Stories need business priority ranking for sprint planning."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 用户故事优先级排序器

**类型：** L3 执行器
**类别：** 2XX 规划

结合市场研究，使用 RICE 评分评估用户故事。为 Epic 生成整合后的优先级排序表。

## 目的与范围

- 在 ln-220 创建用户故事后对其进行优先级排序
- 在开展深入研究之前，以较低成本对所有用户故事进行初步评估
- 仅在市场规模和竞争情况会影响优先级判断置信度时开展相关研究
- 计算每个用户故事的 RICE 分数
- 生成优先级排序表（P0/P1/P2/P3）
- 输出：docs/market/[epic-slug]/prioritization.md

## 适用场景

**在以下情况下使用此技能：**
- ln-220 已创建用户故事，需要确定业务优先级
- 在容量有限的情况下规划冲刺（应优先处理哪些用户故事？）
- 利益相关方评审要求基于数据确定优先级
- 在实施前评估功能投资回报率

**请勿在以下情况下使用：**
- Epic 尚无用户故事（请先运行 ln-220）
- 用户故事属于纯技术类工作（基础设施、重构）
- docs/market/ 中已存在优先级排序

---

## 输入参数

| 参数 | 必需 | 描述 | 默认值 |
|-----------|----------|-------------|---------|
| epic | 是 | Epic ID 或 "Epic N" 格式 | - |
| stories | 否 | 要确定优先级的特定用户故事 ID | Epic 中的全部用户故事 |
| depth | 否 | 研究深度（快速/标准/深入） | "standard" |

**depth 选项：**
- `quick` - 每个用户故事 2-3 分钟，每种类型进行 1 次 WebSearch
- `standard` - 每个用户故事 5-7 分钟，每种类型进行 2-3 次 WebSearch
- `deep` - 每个用户故事 8-10 分钟，开展全面研究

---

## 输出结构

```
docs/market/[epic-slug]/
└── prioritization.md    # Consolidated table + RICE details + sources
```

## 运行时契约

**强制阅读：** 加载 `references/planning_worker_runtime_contract.md`、`references/coordinator_summary_contract.md`
**强制阅读：** 当用户故事引用 H/G/run ID，或项目 researchgraph 证据可能改变优先级判断的置信度时，加载 `references/researchgraph_mcp_usage.md`。

运行时系列：`planning-worker-runtime`

标识符：
- `epic-{epicId}`

阶段：
1. `PHASE_0_CONFIG`
2. `PHASE_1_DISCOVERY`
3. `PHASE_2_LOAD_STORY_METADATA`
4. `PHASE_3_ANALYZE_STORIES`
5. `PHASE_4_GENERATE_PRIORITIZATION`
6. `PHASE_5_WRITE_SUMMARY`
7. `PHASE_6_SELF_CHECK`

摘要契约：
- `summary_kind=story-prioritization-worker`
- 载荷包括 `epic_id`、`depth`、`stories_analyzed`、`priority_distribution`、`top_story_ids`、`prioritization_path`、`warnings`
- 托管模式写入调用方提供的 `summaryArtifactPath`
- 默认托管产物路径格式：`.hex-skills/runtime-artifacts/runs/{parent_run_id}/story-prioritization-worker/ln-230--{identifier}.json`

**表格列（来自用户要求）：**

| 优先级 | 客户问题 | 功能 | 解决方案 | 理由 | 影响 | 市场 | 来源 | 竞争情况 |
|----------|------------------|---------|----------|-----------|--------|--------|---------|-------------|
| P0 | 用户痛点 | 用户故事标题 | 技术方案 | 重要性原因 | 业务影响 | $XB | [链接] | 蓝海 1-3 / 红海 4-5 |

---

## 输入

| 输入 | 必需 | 来源 | 说明 |
|-------|----------|--------|-------------|
| `epicId` | 是 | args, kanban, user | 要处理的 Epic |

**解析：** Epic 解析链。
**状态筛选：** 活跃（planned/started）

## 工具配置

**必须阅读：** 加载 `references/environment_state_contract.md`、`references/storage_mode_detection.md`、`references/input_resolution_pattern.md`

提取：`task_provider` = 任务管理 → 提供商

## 调研工具

| 工具 | 用途 | 查询示例 |
|------|---------|---------------|
| **WebSearch** | 市场规模、竞争对手 | "[domain] market size {current_year}" |
| **mcp__Ref** | 行业报告 | "[domain] market analysis report" |
| **hex-research** | 本地假设、目标和基准证据 | `find_hypotheses`、`inspect_goal`、`find_runs`，用于获取明确的假设/目标/运行上下文 |
| **任务提供商** | 加载 Story | 如果是 linear：list_issues / 否则：Glob story.md |
| **Glob** | 检查现有内容 | "docs/market/[epic]/*" |

---

## 工作流

### 阶段 1：发现（2 分钟）

**目标：** 验证输入并准备上下文。

**流程：**

1. **解析 epicId：** 按照指南运行 Epic 解析链。

2. **加载 Epic 详情：**
   - **如果 task_provider == "linear"：** `get_project(query=epicId)`
   - **否则，如果 task_provider == "github"：** `gh issue view {epicId} -R {REPO} --json number,title,body`
   - **否则：** `Read("docs/tasks/epics/epic-{N}-*/epic.md")`
   - 提取：Epic ID、标题、描述

3. **自动发现配置：**
   - 读取 `docs/tasks/kanban_board.md` 以获取 Team ID
   - 将 Epic 标题转换为 slug，用于输出路径

4. **检查现有优先级排序：**
   ```
   Glob: docs/market/[epic-slug]/prioritization.md
   ```
   - 如果存在：询问“更新现有内容还是新建？”
   - 如果新建：继续

5. **创建输出目录：**
   ```bash
   mkdir -p docs/market/[epic-slug]/
   ```

**输出：** Epic 元数据、输出路径、现有内容检查结果

---

### 阶段 2：加载 Story 元数据（3 分钟）

**目标：** 仅使用元数据构建 Story 队列，并为所有 Story 准备粗略的评分输入。

**流程：**

1. **从 Epic 查询 Story：**
   **如果 task_provider == "linear"：**
   ```
   list_issues(project=Epic.id, label="user-story")
   ```
   **否则，如果 task_provider == "github"：**
   ```
   gh api /repos/{O}/{R}/issues/{epic_num}/sub_issues --jq '.[].number'
   → for each: gh issue view {num} -R {REPO} --json number,title,state,labels
   → filter: label "user-story"
   ```
   **否则（文件模式）：**
   ```
   Glob("docs/tasks/epics/epic-{N}-*/stories/*/story.md")
   ```

2. **仅提取元数据：**
   - Story ID、标题、状态
   - 如果有，则提取最少量的 Epic 上下文
   - **不要**加载完整描述

3. **筛选 Story：**
   - 排除：Done、Cancelled、Archived
   - 包含：Backlog、Todo、In Progress

4. **构建处理队列：**
   - 排序方式：先按现有优先级（如果有），再按 ID
   - 数量：要处理的 N 个 Story

**输出：** Story 队列（ID + 标题 + 最少量的上下文），每个 Story 约 50–80 个 token

---

### 阶段 3：两轮用户故事分析

**目标：** 首先以较低成本对所有用户故事进行评分，然后仅对会影响决策的候选项开展深入研究。

**关键要求：** 即使在深入研究期间，也应将最大上下文限制为一次只包含一个完整的用户故事。

如果存在 researchgraph 布局，则仅针对优先级取决于假设状态、目标覆盖情况、基准证据或实现就绪度的用户故事运行本地图检查。本地图证据可以改变 RICE 的置信度和风险；但不能取代市场规模或竞争对手研究。

#### 第一轮：对所有用户故事进行快速筛选

对于每个用户故事，仅加载足以估算以下内容的详细信息：
- 客户问题
- 粗略的解决方案形态
- 可能的覆盖范围
- 可能的影响
- 可能的工作量
- 初始置信度等级

##### 步骤 3.1：加载用户故事描述

**如果 task_provider == "linear"：**
```
// configured tracker provider: getStory(id=storyId)
```

**否则，如果 task_provider == "github"：**
```
gh issue view {storyId} -R {REPO} --json number,title,body,state,labels
```

**否则（文件模式）：**
```
Read("docs/tasks/epics/epic-{N}-*/stories/us{NNN}-*/story.md")
```

**从用户故事中提取：**
- **功能：** 用户故事标题
- **客户问题：** 来自“So that [value]”和 Context 部分
- **解决方案：** 来自 Technical Notes（实现方法）
- **理由：** 来自 AC 和 Success Criteria

##### 步骤 3.2：构建粗略的 RICE 估算

使用用户故事和史诗的上下文分配：
- 粗略的 `Reach`
- 粗略的 `Impact`
- 粗略的 `Effort`
- 初始 `Confidence`

标记为以下类别之一：
- `full_research_required`
- `rough_estimate_ok`
- `borderline_needs_review`

**仅在符合以下条件时送入第二轮：**
- 根据粗略评分，候选项看起来属于 P0/P1
- 置信度较低
- 用户故事接近优先级阈值
- 用户故事存在战略或市场敏感型不确定性

#### 第二轮：选择性深入研究

仅对第一轮中选出的用户故事开展完整的外部研究。

##### 步骤 3.3：研究市场规模

**WebSearch 查询（根据研究深度）：**
```
"[customer problem domain] market size TAM {current_year}"
"[feature type] industry market forecast"
```

**mcp__Ref 查询：**
```
"[domain] market analysis Gartner Statista"
```

**提取：**
- 市场规模：$XB（带单位：B=Billion，M=Million）
- 增长率：X% CAGR
- 来源：URL + 日期

**置信度映射：**
- 行业报告（Gartner、Statista）→ 置信度 0.9-1.0
- 新闻文章 → 置信度 0.7-0.8
- 博客/论坛 → 置信度 0.5-0.6

##### 步骤 3.4：研究竞争情况

**WebSearch 查询：**
```
"[feature] competitors alternatives {current_year}"
"[solution approach] market leaders"
```

**统计竞争对手并进行分类：**

| 发现的竞争对手数量 | 竞争指数 | 市场类型 |
|-------------------|-------------------|------------|
| 0 | 1 | 蓝海 |
| 1-2 | 2 | 新兴 |
| 3-5 | 3 | 成长中 |
| 6-10 | 4 | 成熟 |
| >10 | 5 | 红海 |

##### 步骤 3.5：计算最终 RICE 分数

```
RICE = (Reach x Impact x Confidence) / Effort
```

**覆盖范围（1-10）：** 每季度受影响的用户数
| 分数 | 用户数 | 指标 |
|-------|-------|------------|
| 1-2 | <500 | 小众、单一角色 |
| 3-4 | 500-2K | 部门级 |
| 5-6 | 2K-5K | 组织级 |
| 7-8 | 5K-10K | 跨组织 |
| 9-10 | >10K | 平台级 |

**影响力（0.25-3.0）：** 业务价值
| 分数 | 级别 | 指标 |
|-------|-------|------------|
| 0.25 | 极低 | 锦上添花 |
| 0.5 | 低 | 使用体验改进 |
| 1.0 | 中 | 效率提升 |
| 2.0 | 高 | 收入驱动因素 |
| 3.0 | 巨大 | 战略差异化优势 |

**置信度（0.5-1.0）：** 数据质量（来自步骤 3.2）

**数据置信度评估：**

对于每个 RICE 因素，评估数据置信度级别：

| 置信度 | 标准 | 分数调整方式 |
|------------|----------|----------------|
| 高 | 多个权威来源（Gartner、Statista、SEC 文件） | 因素按原值使用 |
| 中 | 1-2 个来源，质量参差不齐（博客 + 报告） | 显示因素 ±25% 的区间 |
| 低 | 无来源，仅有团队估算 | 显示因素 ±50% 的区间 |

**输出：** 在优先级排序表中显示每个因素的置信度，并给出 RICE 区间（乐观/悲观），以明确体现不确定性。

**工作量（1-10）：** 人月
| 分数 | 时间 | Story 指标 |
|-------|------|------------------|
| 1-2 | <2 周 | 3 个 AC，简单 CRUD |
| 3-4 | 2-4 周 | 4 个 AC，集成 |
| 5-6 | 1-2 个月 | 5 个 AC，复杂逻辑 |
| 7-8 | 2-3 个月 | 外部依赖 |
| 9-10 | 3 个月以上 | 新基础设施 |

##### 步骤 3.6：确定优先级

| 优先级 | RICE 阈值 | 竞争程度覆盖规则 |
|----------|----------------|---------------------|
| P0（关键） | >= 30 | 或 Competition = 1（蓝海垄断） |
| P1（高） | >= 15 | 或 Competition <= 2（新兴市场） |
| P2（中） | >= 5 | - |
| P3（低） | < 5 | Competition = 5（红海）时强制设为 P3 |

##### 步骤 3.7：存储并清理

- 将行追加到内存中的结果表
- 标记该行是 `full-research` 还是 `rough-estimate`
- 从上下文中清除 Story 描述
- 移至队列中的下一个 Story

**每个 Story 的输出：** 包含置信度等级的完整优先级排序表行

---

### 阶段 4：生成优先级排序表（5 分钟）

**目标：** 创建整合后的 Markdown 输出。

**流程：**

1. **对结果排序：**
   - 主要排序依据：优先级（P0 → P3）
   - 次要排序依据：RICE 分数（降序）

2. **生成 Markdown：**
   - 使用 references/templates/prioritization_template.md 中的模板
   - 填写：优先级摘要、主表、RICE 详情、来源
   - 明确显示每个 Story 使用的是完整调研还是粗略估算

3. **保存文件：**
   ```
   Write: docs/market/[epic-slug]/prioritization.md
   ```

**输出：** 已保存 prioritization.md

---

### 阶段 5：摘要与后续步骤（1 分钟）

**目标：** 显示结果和建议。

**输出格式：**
```
## Prioritization Complete

**Epic:** [Epic N - Name]
**Stories analyzed:** X
**Time elapsed:** Y minutes

### Priority Distribution:
- P0 (Critical): X Stories - Implement ASAP
- P1 (High): X Stories - Next sprint
- P2 (Medium): X Stories - Backlog
- P3 (Low): X Stories - Consider deferring

### Top 3 Priorities:
1. [Story Title] - RICE: X, Market: $XB, Competition: Blue/Red

### Saved to:
docs/market/[epic-slug]/prioritization.md

### Next Steps:
1. Review table with stakeholders
2. Run ln-300 for P0/P1 Stories first
3. Consider cutting P3 Stories
```

---

## 时间盒约束

| 深度 | 每个 Story | 总计（10 个 Story） |
|-------|-----------|-------------------|
| 快速 | 2-3 分钟 | 20-30 分钟 |
| 标准 | 5-7 分钟 | 50-70 分钟 |
| 深入 | 8-10 分钟 | 80-100 分钟 |

**时间管理规则：**
- 如果某个 Story 超出时间预算：保留粗略估算，并标记较低置信度
- 如果总耗时超出预算：仅对高潜力或处于临界状态的 Story 进行深入研究
- 尽可能并行执行 WebSearch（市场 + 竞争情况）

---

## Token 效率

**加载模式：**
- 阶段 2：仅加载元数据（每个 Story 约 50 个 Token）
- 阶段 3：逐个加载完整描述（每个 Story 约 3,000-5,000 个 Token）
- 处理完每个 Story 后：清除描述，仅保留结果行（约 100 个 Token）

**内存管理：**
- 顺序处理（不并行）
- 最大上下文：一次仅包含 1 个 Story 描述
- 结果以紧凑的表格行形式累积

---

## 与生态系统集成

**在工作流中的位置：**
```
ln-210 (Scope → Epics)
     ↓
ln-220 (Epic → Stories)
     ↓
ln-230 (RICE per Story → prioritization table) ← THIS SKILL
     ↓
ln-300 (Story → Tasks)
```

**依赖项：**
- WebSearch、mcp__Ref（市场研究）
- 任务提供程序：按照 `references/tracker_provider_contract.md` 使用已配置的跟踪器提供程序（加载 Epic、Story）
- Glob、Write、Bash（文件操作）

**下游用途：**
- Sprint 规划使用 P0/P1 选择 Story
- ln-300 按优先级顺序处理 Story
- 利益相关者在实施前进行审查

结构化 worker 输出：
- 即使在独立模式下，也返回优先级摘要信封
- 提供 `summaryArtifactPath` 时，写入相同的 JSON 产物

---

## 关键规则

1. **先分诊** - 在深入研究之前，对所有 Story 进行低成本评分
2. **为所有深入研究数据标注来源** - 每个市场数据都需要注明来源和日期
3. **优先使用近期数据** - 优先使用过去 2 年的数据，如数据更早则发出警告
4. **在研究深度需要时交叉验证** - 对市场敏感型 Story 使用 2 个或更多来源
5. **严格限制时间** - 当深入研究不会改变决策时，保留粗略估算
6. **置信度等级** - 标记为高/中/低，并注明分数是粗略估算还是完整研究结果
7. **禁止推测** - 仅使用有来源的主张，并用 "[No data]" 标注数据缺口
8. **一次处理一个 Story** - Token 效率至关重要
9. **保留语言** - 如果用户使用俄语提问，则使用俄语回答

---

## 完成定义

- [ ] 已通过配置的跟踪器提供程序验证 Epic
- [ ] 已通过元数据优先队列加载所有 Story
- [ ] 已完成所有 Story 的 Pass A 粗略分诊
- [ ] 深入研究仅限于高潜力或低置信度的 Story
- [ ] 已计算每个 Story 的 RICE 分数
- [ ] 已分配竞争指数（1-5）
- [ ] 已分配优先级（P0/P1/P2/P3）
- [ ] 输出中可见置信度等级和研究深度
- [ ] 表格已按优先级 + RICE 排序
- [ ] 文件已保存至 docs/market/[epic-slug]/prioritization.md
- [ ] 提供包含最高优先级项和后续步骤的摘要
- [ ] 已返回结构化的 `story-prioritization-worker` 摘要
- [ ] 提供 `summaryArtifactPath` 时已写入摘要产物
- [ ] 总耗时在预算范围内

---

## 使用示例

**基本用法：**
```
ln-230-story-prioritizer epic="Epic 7"
```

**带参数：**
```
ln-230-story-prioritizer epic="Epic 7: Translation API" depth="deep"
```

**指定用户故事：**
```
ln-230-story-prioritizer epic="Epic 7" stories="US001,US002,US003"
```

**输出示例（docs/market/translation-api/prioritization.md）：**

| 优先级 | 客户问题 | 功能 | 解决方案 | 理由 | 影响 | 市场 | 来源 | 竞争情况 |
|----------|------------------|---------|----------|-----------|--------|--------|---------|-------------|
| P0 | “重复翻译会消耗 GPU 资源” | 翻译记忆库 | Redis 缓存，5ms 查询 | GPU 成本降低 70-90% | 高 | $2B+ | [M&M](link) | 3 |
| P0 | “无法翻译 PDF” | PDF 支持 | PDF 解析 + 版式处理 | 企业客户的阻碍因素 | 高 | $10B+ | [Eden](link) | 5 |
| P1 | “需要视频字幕” | SRT/VTT 支持 | 保留时间轴 | 蓝海机会 | 中 | $5.7B | [GMI](link) | 2 |

---

## 阶段 6：元分析

可选参考：仅当用户要求进行运行后元分析或采用协议格式的运行复盘时，才加载 `references/meta_analysis_protocol.md`。

技能类型：`planning-worker`。如有请求，请在所有阶段完成后运行。使用 `planning-worker` 格式输出到聊天中。

## 参考文件

- **必须阅读：**加载 `references/environment_state_contract.md`
- **必须阅读：**加载 `references/storage_mode_detection.md`
- **必须阅读：**加载 `references/research_tool_fallback.md`

| 文件 | 用途 |
|------|---------|
| [prioritization_template.md](references/templates/prioritization_template.md) | 输出 Markdown 模板 |
| [rice_scoring_guide.md](references/rice_scoring_guide.md) | RICE 因子量表和示例 |
| [research_queries.md](references/research_queries.md) | 按领域分类的 WebSearch 查询模板 |
| [competition_index.md](references/competition_index.md) | 蓝海/红海分类规则 |

---

**版本：**2.0.0
**最后更新：**2026-04-05