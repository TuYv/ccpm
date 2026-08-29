---
name: decision-eval
description: Spawns the decision-scorer agent after architect proposes 2+ variants in an ADR. Produces a weighted scoring table and recommended choice saved to docs/decisions/.
when_to_use: |
  Apply when:
  - architect has written an ADR with 2+ alternatives under ## Alternatives Considered or ## Options
  - architect is about to finalize a multi-variant decision and needs an objective tie-breaker
  - CTO explicitly requests scoring before gate:arch approval
  Do NOT apply when:
  - The change is a bug fix, docs-only, or style/formatting update
  - The ADR has only 1 option (no real alternatives)
  - User says "skip scoring" or "no scoring"
  - project_size is nano (overhead exceeds value)
effort: medium
allowed-tools: Read, Glob, Bash, Agent
paths:
  - "docs/decisions/**"
  - "docs/architecture/**"
  - ".great_cto/PROJECT.md"
---
# 决策评估——对架构替代方案进行自动评分

在架构师提出 2 个或更多方案后、创建 gate:arch 之前调用。

## 调用时机

当以下所有条件均成立时，调用此技能：

1. ADR（`docs/adr/ADR-*.md`）或 ARCH 文档（`docs/architecture/ARCH-*.md`）
   包含一个列出 2 个或更多已命名替代方案的章节（查找
   `## Alternatives Considered`、`## Options`，或以粗体为前缀的选项，例如
   `**Option A:**`）
2. 架构师尚未创建 `gate:arch`
3. 用户未说过 "skip scoring"、"no scoring" 或 "skip decision-eval"
4. PROJECT.md 中的 `project_size` 不是 `nano`

如果任何条件不成立，则静默跳过（甚至不要提及）。

## 调用方式

读取最新的 ADR 或 ARCH 文档，确认存在 2 个或更多方案，然后生成
`decision-scorer` 智能体，并将文件路径作为上下文：

```bash
# Identify target document
TARGET=$(ls -t docs/adr/ADR-*.md 2>/dev/null | head -1)
[ -z "$TARGET" ] && TARGET=$(ls -t docs/architecture/ARCH-*.md 2>/dev/null | head -1)

# Confirm 2+ variants
VARIANT_COUNT=$(grep -cE "^\*\*[A-Za-z]|^### [A-Za-z]|^- \*\*[A-Za-z]" "$TARGET" 2>/dev/null || echo 0)
```

如果 `VARIANT_COUNT >= 2`，则分派该智能体：

```
Agent: decision-scorer
Context: <TARGET file path>
Task: Score the architectural variants in <TARGET> against .great_cto/PROJECT.md criteria.
      Save output to docs/decisions/.
```

## 输出位置

decision-scorer 智能体将结果保存到：
```
docs/decisions/DECISION-<slug>-<YYYYMMDD>.md
```

智能体完成后，读取输出文件并向架构师展示建议：

```
Decision scoring complete:
  Recommended: <variant name> (<score>/5.00)
  Runner-up:   <variant name> (<score>/5.00)
  Full report: docs/decisions/DECISION-<slug>-<YYYYMMDD>.md

Architect: review the scoring rationale before accepting or overriding the recommendation.
```

## 跳过条件

如果出现以下任一情况，则不输出任何内容并继续下一步：
- PROJECT.md 中存在 `project_size: nano`
- 在 ADR/ARCH 文档中找到的方案少于 2 个
- 用户消息包含 "skip scoring"、"skip decision-eval" 或 "no scoring"
- 目标文档是错误修复或仅涉及文档的 ADR（检查标题中是否有 "fix:"、"docs:"、"chore:"）

## 与架构师工作流的集成

此技能位于 `agents/architect.md` 中的第 4 步（编写 ADR）和第 5 步（创建 gate:arch）之间。架构师通过名称调用它：

```
Invoke skill: decision-eval
```

评分完成后，架构师可以：
- 接受建议 → 使用推荐选项继续创建 gate:arch
- 推翻建议 → 在创建 gate:arch 之前，在 ADR 中新增
  `## Scoring Override` 章节并记录理由