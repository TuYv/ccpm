---
name: ln-311-review-research-worker
description: "Use when an evaluation run needs mandatory official-doc, MCP Ref, Context7, and current best-practice research with a structured research summary."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

**类型：** L3 工作器
**类别：** 3XX 规划

# 审查研究工作器

用于验证、审计和审查流程的结构化研究工作器。

## 必读内容

**必须阅读：** 加载 `references/evaluation_worker_runtime_contract.md`、`references/evaluation_summary_contract.md`、`references/evaluation_research_contract.md`、`references/epistemic_protocol.md`
**必须阅读：** 仅当审查目标明确引用 `H##`、`G##`、基准测试运行 ID 或 researchgraph 文件时，加载 `references/researchgraph_mcp_usage.md`。

## 目的

- 收集官方文档或标准
- 收集 MCP Ref 证据
- 涉及库或框架时收集 Context7 证据
- 收集当前 Web 最佳实践证据
- 输出紧凑的机器可读研究摘要，而非仅包含叙述性文字的笔记

## 运行时

运行时系列：
- `evaluation-worker-runtime`

必需的清单字段：
- `identifier`
- `phase_order`
- `summary_kind=review-research`
- `operation=research`

建议的 `phase_order`：
1. `PHASE_0_CONFIG`
2. `PHASE_1_RESOLVE_STACK`
3. `PHASE_2_OFFICIAL_DOCS`
4. `PHASE_3_MCP_REF`
5. `PHASE_4_CONTEXT7`
6. `PHASE_5_WEB_BEST_PRACTICES`
7. `PHASE_6_ANTI_HALLUCINATION`
8. `PHASE_7_WRITE_SUMMARY`
9. `PHASE_8_SELF_CHECK`

## 工作流

### 阶段 0：配置

1. 加载运行时清单。
2. 确定审查目标、技术栈提示和输出位置。
3. 如果缺少目标上下文，则失败。

### 阶段 1：确定技术栈

1. 检测语言、框架、库和领域。
2. 构建一个范围有限的研究主题列表。
3. 保持较少的主题数量，并以证据为导向。
4. 如果目标明确引用本地 H/G/运行 ID，则执行只读的 researchgraph 预检，以便在开展外部研究之前获取本地上下文。不得使用本地图谱证据取代官方文档、MCP Ref、Context7 或当前 Web 研究通道。

### 阶段 2：官方文档

1. 首先阅读官方文档或标准。
2. 记录来源 URL 以及每个来源支持的确切主题。

### 阶段 3：MCP Ref

1. 针对相同的有限主题查询 MCP Ref。
2. 优先选择一手文档，而非第三方评论。

### 阶段 4：Context7

1. 如果涉及库或框架，则确定 Context7 库 ID。
2. 仅查询目标实际使用的库。
3. 如果不存在相关库，请明确记录这一点。

### 阶段 5：Web 最佳实践

1. 针对最佳实践和近期变更执行当前 Web 研究。
2. 使用当前来源，而非固化的启发式规则。
3. 仅记录会改变结论或增加决策价值的证据。

### 阶段 6：反幻觉验证

1. 根据 `epistemic_protocol.md` B 节，扫描目标制品中涵盖所有触发类别的事实性声明。
2. 对于每项声明，根据阶段 2-5 中收集的研究证据进行核查：
   - 有 MCP Ref/Context7/Web 证据 → 标记为 `VERIFIED`
   - 没有工具证据，但声明合理 → 标记为 `FROM_TRAINING`
   - 与工具证据矛盾 → 标记为 `FLAGGED`（严重）
3. 此步骤基于现有研究进行验证。它不会执行新的搜索。
4. 在摘要元数据中包含验证状态。

### 阶段 7：编写摘要

输出 `summary_kind=review-research`。

载荷必须包括：
- `worker=ln-311`
- `status`
- `operation=research`
- `warnings`

如果可用，优先包含以下字段：
- `findings`
- `metrics.research_sources`
- `metrics.anti_hallucination_status` (VERIFIED | FLAGGED)
- `metrics.flagged_claims_count`
- `artifact_path`
- `report_path`
- `metadata`

### 阶段 8：自检

1. 验证是否已尝试全部四个研究通道。
2. 验证是否已执行反幻觉核验。
3. 验证是否以机器可读形式说明了跳过研究通道的理由。
4. 仅在摘要写入后记录 `pass=true`。

## 完成定义

- [ ] 已记录官方文档证据
- [ ] 已记录 MCP Ref 证据
- [ ] 已记录 Context7 证据，或已说明其不适用的理由
- [ ] 已记录当前 Web 最佳实践证据
- [ ] 已执行反幻觉核验（声明标记为 VERIFIED/FROM_TRAINING/FLAGGED）
- [ ] 已写入 `review-research` 摘要
- [ ] 自检已通过

**版本：** 1.0.0
**最后更新：** 2026-04-10