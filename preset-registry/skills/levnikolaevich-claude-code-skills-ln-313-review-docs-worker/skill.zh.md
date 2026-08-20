---
name: ln-313-review-docs-worker
description: "Use when an evaluation run needs review-driven documentation updates and a structured documentation summary."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

**类型：** L3 工作器
**类别：** 3XX 规划

# 文档审查工作器

## 必读

**必读：** 加载 `references/evaluation_worker_runtime_contract.md`、`references/evaluation_summary_contract.md`
**必读：** 加载 `../ln-310-multi-agent-validator/references/domain_patterns.md`

## 目的

- 创建缺失的审查必需文档
- 仅使用经过验证的变更更新现有文档
- 将文档工作与合并及修复工作分离

## 模式门控

- `mode=story`：完整文档流水线——领域提取、模式检测、文档生成
- `mode=plan_review`：除非存在文档变更，否则跳过；记录 `docs_skipped_reason`

## 运行时

运行时系列：
- `evaluation-worker-runtime`

必需的清单字段：
- `identifier`
- `phase_order`
- `summary_kind=review-docs`
- `operation=docs`

推荐的 `phase_order`：
1. `PHASE_0_CONFIG`
2. `PHASE_1_EXTRACT_DOMAINS`
3. `PHASE_2_PATTERN_DETECTION`
4. `PHASE_3_GENERATE_DOCS`
5. `PHASE_4_LINK_TO_STORY`
6. `PHASE_5_WRITE_SUMMARY`
7. `PHASE_6_SELF_CHECK`

## 工作流

### 阶段 1：提取领域

1. 从故事标题、技术说明和实施任务中提取技术领域。
2. 构建一个范围受限的文档主题列表。

### 阶段 2：模式检测

1. 从 `domain_patterns.md` 加载模式注册表。
2. 通过关键词检测扫描故事内容，查找匹配的模式。
3. 如果检测到多个模式，则创建所有适用的文档。

### 阶段 3：生成文档

对于每个检测到的模式：
1. 检查预期输出路径中是否已存在文档（glob `docs/{type}s/*{pattern}*.md`）。
2. 如果缺失：从 `references/templates/` 加载模板（`adr_template.md`、`guide_template.md`、`manual_template.md`）。
3. 按照研究方法，使用可用的 MCP 工具研究模式主题。
4. 对于 ADR 模式：在生成前于内部回答 5 个 ADR 问题（背景、决策、后果、替代方案、状态）。
5. 生成文档。规则：生成的文档中不得包含代码，优先使用表格而非散文，目标字数为 300–500 词。
6. 保存至 `docs/{type}s/{naming}.md`。

### 阶段 4：链接到故事

1. 将已创建文档的链接添加到故事的技术说明中。
2. 使用 `docs_checkpoint` 更新运行时状态。

### 阶段 5：编写摘要

发出 `summary_kind=review-docs`。

有效载荷必须包含：
- `worker=ln-313`
- `status`
- `operation=docs`
- `warnings`

如果可用，优先包含以下字段：
- `docs_created`（路径列表）
- `docs_updated`（路径列表）
- `docs_skipped_reason`（适用时）
- `patterns_detected`（匹配模式列表）

### 阶段 6：自检

回退方案：如果没有匹配到模式，但技术方面缺少文档，则按照 `domain_patterns.md` 中的回退策略使用 MCP Ref 回退方案。

## 完成定义

- [ ] 文档目标已确定
- [ ] 已依据 `domain_patterns.md` 执行模式检测
- [ ] 已应用文档变更，或已说明跳过理由
- [ ] 已编写 `review-docs` 摘要
- [ ] 自检通过

**版本：** 1.0.0
**最后更新：** 2026-04-10