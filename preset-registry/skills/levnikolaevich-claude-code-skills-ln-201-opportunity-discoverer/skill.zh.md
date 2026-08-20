---
name: ln-201-opportunity-discoverer
description: "Discovers growth opportunities using Traffic-First KILL funnel. Use when searching for next product direction with validated demand."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此 Skill 目录。

# 机会发现器

**类型：** L3 Worker
**类别：** 2XX 规划

采用流量优先的方法，为现有产品寻找下一个增长方向。

## 核心理念

> **反模式：** 想法 → 调研 → 产品 → “流量在哪里？”
> **正确方式：** 流量 → 细分市场 → MVP → 在现有需求下发布

### 90% 的开发者都会犯的错误

大多数人失败是因为他们：
1. 凭空构想一个没有同类产品的点子
2. 问 5 个人“你愿意付费吗？”（请他们吃个热狗，他们就会说愿意）
3. 花一大笔钱开发产品
4. 发布时才说“现在来搭建流量渠道吧”
5. 最后发现：流量并不存在，而且从未存在过

**对于冷流量不愿购买的产品，没有任何营销人员能为它建立有效的漏斗。**

### 流量优先原则

| # | 原则 | 反模式 |
|---|-----------|--------------|
| 1 | **产品出现之前，流量就已存在** | 先开发，再寻找流量 |
| 2 | **不要做调研**——衡量真实的搜索需求 | 询问“你会购买吗？” |
| 3 | **现有需求**——围绕人们正在搜索的内容发布产品 | 创造新品类 |
| 4 | **一个渠道，一个想法**——不要分散精力 | 同时测试 5 个渠道 |
| 5 | **尽早淘汰**——快速失败，不要浪费时间 | 对所有想法一视同仁地评分 |

### 支撑方法论

**Marc Andreessen（pmarca）：**
> “在实践层面验证市场——去获取真正付费的客户，以证明市场确实存在。”

**Sam Altman（YC）：**
> “谁迫切需要这个产品？最佳答案是占据一个小市场中的很大一部分。”
> “通过发布或尝试销售来检验想法——在编写代码之前先获得意向书。”

---

## 目的与范围

- 在创建 Epic 之前发现增长方向
- 通过证据优先的淘汰漏斗筛选想法
- 输出：一个推荐想法 + 一个流量渠道
- 定位：位于 ln-210（Epic Coordinator）之前

## 运行时契约

**必须阅读：** 加载 `references/planning_worker_runtime_contract.md`、`references/coordinator_summary_contract.md`

运行时系列：`planning-worker-runtime`

标识符：
- 发现工作项标识符

阶段：
1. `PHASE_0_CONFIG`
2. `PHASE_1_INPUT_PROCESSING`
3. `PHASE_2_KILL_FUNNEL`
4. `PHASE_3_RANK_SURVIVORS`
5. `PHASE_4_WRITE_DISCOVERY_REPORT`
6. `PHASE_5_WRITE_SUMMARY`
7. `PHASE_6_SELF_CHECK`

摘要契约：
- `summary_kind=opportunity-discovery-worker`
- 独立模式可以返回摘要，而无需持久化产物
- 托管模式将相同的 JSON 写入 `summaryArtifactPath`
- 默认托管产物路径格式：`.hex-skills/runtime-artifacts/runs/{parent_run_id}/opportunity-discovery-worker/ln-201--{identifier}.json`

## 适用场景

**在以下情况下使用此 Skill：**
- 已有产品，正在寻找下一个增长方向
- 有 3–10 个潜在想法/细分市场
- 希望在投入之前验证机会
- 需要选择一个渠道并集中精力

**不要在以下情况下使用：**
- 没有产品背景（从零开始的初创公司）
- 已有经过验证的方向（直接转到 ln-210）
- 正在对现有 Story 进行优先级排序（使用 ln-230）

---

## 输入参数

| 参数 | 必填 | 说明 | 默认值 |
|-----------|----------|-------------|---------|
| ideas | 否 | 以逗号分隔的列表 | - |
| context | 否 | 用于生成想法的产品说明 | - |
| strict | 否 | 严格的淘汰阈值 | true |

**输入模式：**
- `ideas="idea1, idea2, idea3"` — 评估创意列表
- `context="SaaS for X"` — 根据产品生成创意
- 两者同时提供 — 生成创意并添加用户创意

---

## KILL 漏斗流程

创意不再经历 4 个彼此独立、需要大量研究的评估阶段。每个创意首先进行一次整合的证据评估。

```
Idea → [Evidence bundle: traffic + demand + competition + revenue]
          ↓
      [Hard kill matrix]
          ↓
     [Interest gate]
          ↓
      [MVP gate]
          ↓
       SURVIVOR
```

### 证据包（单次研究）

**问题：** 是否有足够的外部证据支持进一步评估？

**研究内容：**
```
WebSearch: "[idea] how people find solutions"
WebSearch: "[idea] search volume {current_year}"
WebSearch: "[idea] competitors {current_year}"
WebSearch: "[idea] pricing SaaS"
```

一次性提取四个信号：
- **流量渠道：** 人们会主动去哪里寻找这类解决方案？
- **需求：** 搜索量、趋势方向或强烈的社区痛点信号
- **竞争：** 竞争对手数量和市场类型
- **收入：** 合理的价格区间和付费意愿模式

**流量渠道示例：**

| 渠道 | 信号 | 最适合 |
|---------|--------|----------|
| **搜索/SEO** | 人们会在 Google 搜索“[问题] 解决方案” | 信息产品、工具 |
| **YouTube** | 存在教程类搜索 | 教育、操作指南 |
| **应用市场** | 存在相关类别（ProductHunt、AppStore） | 应用、插件 |
| **社区** | 活跃的 subreddit、论坛 | 垂直产品 |
| **付费广告** | 竞争对手正在投放广告 | 已验证的需求 |
| **外联销售** | ICP 清晰且能够触达 | 高客单价 B2B |

**需求阈值：**

| 搜索量 | 结论 |
|--------|---------|
| >10K/月 | 需求强劲 |
| 1K-10K/月 | 可行的利基市场 |
| <1K/月 | 需求较弱，除非有非常强烈的利基信号作为补偿 |

**竞争阈值：**

| 竞争对手 | 指数 | 市场 | 结论 |
|-------------|-------|-------|---------|
| 0 | 1 | 蓝海 | 如果需求真实，则存在机会 |
| 1-2 | 2 | 新兴 | 最佳切入点 |
| 3-5 | 3 | 增长中 | 需要差异化 |
| 6-10 | 4 | 成熟 | 困难但仍有可能 |
| >10 | 5 | 红海 | 通常值得淘汰 |

**收入阈值：**

| ARPU | 市场类型 | 可行性 |
|------|-------------|-----------|
| >$100/用户/月 | 企业级 | 高利润率 |
| $50-100 | 专业级 | 良好 |
| $20-50 | 专业消费者 | 可行 |
| $5-20 | 消费者 | 需要规模 |
| <$5 | 广告支持 | 通常不值得做 |

### 硬性淘汰矩阵

满足以下任一硬性终止条件时，立即淘汰：
- 无法确定流量渠道
- 需求明显低于可行阈值，且没有可作为补偿的利基信号
- 竞争指数 = 5，且没有明确的切入点
- 对小团队业务而言，预期收入低于 $20/用户

记录淘汰原因，并停止分析该创意。

### 个人兴趣

**问题：** 你会享受构建它的过程吗？

**方法：** AskUserQuestion — 按 1-5 分评分

```
Rate your interest in building [idea]:
1 = Meh, would do for money only
2 = Low interest
3 = Neutral
4 = Interested
5 = Excited, would build for free
```

**为什么这很重要：**
- 兴趣低 = 3 个月内倦怠
- 兴趣高 = 在困难时期仍能保持持久动力
- 你将在这件事上投入 2 年以上

**何时询问：** 仅针对通过外部证据包筛选的想法。

**淘汰条件：** 评分为 1-2——你会在实现 PMF 之前放弃。

**输出：** 评分 1-5

---

### MVP 可行性

**问题：** 你能在 4 周内发布吗？

**评估：**

| 因素 | 问题 | 危险信号 |
|--------|----------|----------|
| 技术 | 已具备相关技能，还是需要学习？ | 新技术栈 |
| 依赖项 | 是否需要外部 API 或合作伙伴？ | 等待他人 |
| 内容 | 是否需要创作大量内容？ | 数月的写作工作 |
| 法规 | 是否存在法律/合规要求？ | 许可证、审批 |
| 团队 | 可以单独完成，还是需要招聘？ | 无法独自启动 |

**时间估算：**

| 周数 | 复杂度 | 结论 |
|-------|------------|---------|
| 1-2 | 单人完成，使用现有技能 | 最佳 |
| 2-4 | 有少量学习成本 | 良好 |
| 4-8 | 涉及一些新技术 | 可接受 |
| >8 | 需要大量基础设施 | **淘汰** |

**何时评估：** 仅针对通过外部证据和兴趣门槛筛选的想法。

**淘汰条件：** MVP 所需时间 >8 周——验证速度太慢。

**输出：** 周数估算 + 阻碍因素

---

## 工作流

### 阶段 1：输入处理（2 分钟）

1. **解析输入：**
   - 如果是 `ideas`：拆分以逗号分隔的列表
   - 如果是 `context`：通过 WebSearch 生成 5-7 个想法
   - 如果两者都有：合并

2. **验证数量：**
   - 最少：3 个想法
   - 最多：10 个想法

3. **创建输出目录：**
   ```bash
   mkdir -p docs/reference/research/
   ```

**输出：** 想法队列（3-10 项）以及 `PHASE_1_INPUT_PROCESSING` 检查点

---

### 阶段 2：淘汰漏斗（逐个想法处理）

**对每个想法进行一次捆绑式证据审查，然后仅对通过审查的想法应用个人筛选条件：**

```
FOR each idea:
    Build evidence bundle:
        traffic + demand + competition + revenue

    Apply hard kill matrix
        IF failed → KILL, log reason, NEXT idea

    Ask Interest
        IF score 1-2 → KILL, log reason, NEXT idea

    Assess MVP-ability
        IF >8 weeks → KILL, log reason, NEXT idea

    → SURVIVOR: add to survivors list
```

**Token 效率：**
- 每次处理一个想法
- 每个想法使用一个研究证据包，而不是分成四个独立的研究阶段
- 尽早淘汰 = 无需询问兴趣，也无需评估 MVP 可行性
- 处理完每个想法后清除上下文

---

### 阶段 3：对通过筛选的想法进行排名（2 分钟）

**如果存在通过筛选的想法：**

1. 计算综合评分：
   ```
   Score = Demand_score + (6 - Competition_index) + Revenue_score + Interest + MVP_score
   ```

2. 按评分降序排列

3. 选出首要推荐

**如果没有任何想法通过筛选：**
- 报告：“所有想法都已被淘汰。重新思考方向。”
- 显示淘汰日志以供复盘

---

### 阶段 4：输出（2 分钟）

**生成：** `docs/reference/research/[YYYY-MM-DD]-discovery.md`

同时输出结构化运行时摘要：
- `schema_version`
- `summary_kind=opportunity-discovery-worker`
- `run_id`
- `identifier`
- `producer_skill=ln-201`
- `produced_at`
- 包含 `input_mode`、`ideas_analyzed`、`generated_ideas`、`survivors_count`、`killed_count`、`top_recommendation`、`report_path`、`warnings` 的 payload

**结构：**

```markdown
# Opportunity Discovery: [Date]

## Summary
- Ideas analyzed: X
- Survivors: Y
- Killed: Z

## TOP RECOMMENDATION

**Idea:** [Name]
**Channel:** [Primary channel]
**Why:** [2-3 sentence rationale]

### Key metrics:
- Demand: [volume]/month
- Competition: [Index] [Ocean type]
- Revenue: $[X]/user
- MVP: [X] weeks

## Survivors Table

| Idea | Channel | Demand | Competition | Revenue | Interest | MVP | Score |
|------|---------|--------|-------------|---------|----------|-----|-------|
| ... | ... | ... | ... | ... | ... | ... | ... |

## KILL Log

| Idea | Killed at | Reason |
|------|-----------|--------|
| ... | ... | ... |

## Next Steps
1. Create Epic with ln-210 for top recommendation
2. Focus on [channel] as primary acquisition
3. Target MVP in [X] weeks
```

---

## 时间限制

| 创意数量 | 预计时间 |
|-------|---------------|
| 3 | 15-20 分钟 |
| 5 | 25-35 分钟 |
| 10 | 50-70 分钟 |

**注意：** KILL 漏斗比完整评分更快——糟糕的创意会被尽早淘汰。

---

## 集成

**在工作流中的位置：**
```
Product exists
     ↓
ln-201 (Opportunity Discovery) ← THIS SKILL
     ↓
ln-210 (Epic Coordinator)
     ↓
ln-220 (Story Coordinator)
```

**依赖项：**
- WebSearch（除兴趣外的所有筛选器）
- AskUserQuestion（兴趣筛选器）
- Write、Bash（输出）

---

## 关键规则

1. **流量优先**——没有流量渠道 = 不进行分析
2. **一次性收集证据**——如果一次调研就能回答流量、需求、竞争和收入问题，就不要运行多个彼此独立的重度调研阶段
3. **立即 KILL**——不要为已淘汰的创意评分
4. **只给出一个推荐**——避免陷入选择困难
5. **不做调查问卷**——只使用真实搜索数据
6. **兴趣很重要**——只针对外部验证可行的创意询问兴趣
7. **MVP 速度**——发布慢 = 学习慢

---

## 使用示例

**提供创意：**
```
ln-201-opportunity-discoverer ideas="AI writing tool, code review bot, translation API"
```

**提供上下文：**
```
ln-201-opportunity-discoverer context="B2B developer tools SaaS"
```

**输出示例：**

```markdown
# Opportunity Discovery: 2026-01-29

## TOP RECOMMENDATION

**Idea:** Code review bot
**Channel:** SEO (developers search "code review tool")
**Why:** Growing demand (15K/mo), emerging market (3 competitors),
$50/user pricing proven, can MVP in 3 weeks with existing skills.

## KILL Log

| Idea | Killed at | Reason |
|------|-----------|--------|
| AI writing | Competition | Red Ocean (25+ competitors) |
| Translation API | Revenue | Commoditized, <$10/user |
```

---

## 完成定义

- [ ] 已根据产品上下文和市场信号进行创意头脑风暴
- [ ] 在做出淘汰决定前，已为每个创意收集证据包
- [ ] 已在兴趣和 MVP 检查前应用硬性淘汰矩阵
- [ ] 已对存活创意进行评分和排名
- [ ] 已在 `docs/reference/research/[YYYY-MM-DD]-discovery.md` 生成发现文档
- [ ] 已确定 TOP RECOMMENDATION，并包含渠道和理由
- [ ] KILL Log 已记录所有被淘汰的创意及原因
- [ ] 已返回结构化的 `opportunity-discovery-worker` 摘要
- [ ] 提供 `summaryArtifactPath` 时，已写入摘要制品

## 参考文件

| 文件 | 用途 |
|------|---------|
| [filter_criteria.md](references/filter_criteria.md) | 所有筛选条件的 KILL 阈值 |
| [channel_analysis.md](references/channel_analysis.md) | 流量渠道识别 |
| [discovery_template.md](references/templates/discovery_template.md) | 输出 Markdown 模板 |

- **必须阅读：** 加载 `references/research_tool_fallback.md`

---

**版本：** 2.0.0
**最后更新：** 2026-01-29