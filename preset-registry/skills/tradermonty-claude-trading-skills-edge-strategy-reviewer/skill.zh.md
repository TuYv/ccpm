---
name: edge-strategy-reviewer
description: >
  Critically review strategy drafts from edge-strategy-designer for edge
  plausibility, overfitting risk, sample size adequacy, and execution realism.
  Use when strategy_drafts/*.yaml exists and needs quality gate before pipeline
  export. Outputs PASS/REVISE/REJECT verdicts with confidence scores.
---
# Edge 策略审查器

对 `edge-strategy-designer` 生成的策略草稿进行确定性质量把关。

## 何时使用

- 在 `edge-strategy-designer` 生成 `strategy_drafts/*.yaml` 之后
- 在通过流水线将草稿导出到 `edge-candidate-agent` 之前
- 在手动验证某份策略草稿是否具备优势合理性时

## 前置条件

- 策略草稿 YAML 文件（`edge-strategy-designer` 的输出）
- Python 3.10+ 并装有 PyYAML

## 工作流程

1. 从 `--drafts-dir` 或单个 `--draft` 文件加载草稿 YAML 文件
2. 依据 8 项标准（C1-C8）对每份草稿进行加权评分
3. 计算置信度得分（所有标准的加权平均值）
4. 判定结论：PASS / REVISE / REJECT
5. 评估导出资格（PASS + export_ready_v1 + 可导出家族）
6. 写入审查输出（YAML 或 JSON）以及可选的 markdown 摘要

## 审查标准

| # | 标准 | 权重 | 关键检查项 |
|---|-----------|--------|------------|
| C1 | 优势合理性 | 20 | 论点质量、领域术语、机制关键词（连续打分 50-95） |
| C2 | 过拟合风险 | 20 | 5 档过滤条件数量评分（90/80/60/40/10）、阈值过于精确的扣分 |
| C3 | 样本充分性 | 15 | 基于预估年度机会数进行连续打分（10-95） |
| C4 | 市场状态依赖 | 10 | 跨市场状态验证 |
| C5 | 出场校准 | 10 | 止损、盈亏比 |
| C6 | 风险集中度 | 10 | 仓位规模限制 |
| C7 | 执行现实性 | 10 | 成交量过滤、导出一致性 |
| C8 | 失效信号质量 | 5 | 信号数量与具体性 |

## 判定逻辑

- C1 或 C2 severity=fail → 立即 REJECT
- confidence >= 70 且无 fail 级别的发现 → PASS
- confidence < 35 → REJECT
- 其他情况 → REVISE（附修改说明）

## 运行脚本

```bash
# Review all drafts in a directory
python3 skills/edge-strategy-reviewer/scripts/review_strategy_drafts.py \
  --drafts-dir reports/edge_strategy_drafts/ \
  --output-dir reports/

# Single draft review
python3 skills/edge-strategy-reviewer/scripts/review_strategy_drafts.py \
  --draft reports/edge_strategy_drafts/draft_xxx.yaml \
  --output-dir reports/

# JSON output with markdown summary
python3 skills/edge-strategy-reviewer/scripts/review_strategy_drafts.py \
  --drafts-dir reports/edge_strategy_drafts/ \
  --output-dir reports/ \
  --format json \
  --markdown-summary

# Strict export mode: export-eligible drafts with any warn → REVISE
python3 skills/edge-strategy-reviewer/scripts/review_strategy_drafts.py \
  --drafts-dir reports/edge_strategy_drafts/ \
  --output-dir reports/ \
  --strict-export
```

## 输出格式

主要输出：`review.yaml`（或 `review.json`）

```yaml
generated_at_utc: "2026-02-28T12:00:00+00:00"
source:
  drafts_dir: "/path/to/strategy_drafts"
  draft_count: 4
summary:
  total: 4
  PASS: 1
  REVISE: 2
  REJECT: 1
  export_eligible: 1
reviews:
  - draft_id: "draft_xxx_core"
    verdict: "PASS"
    confidence_score: 80
    export_eligible: true
    findings: [...]
    revision_instructions: []
```

## 参考资源

- `references/review_criteria.md` — C1-C8 的详细评分细则
- `references/overfitting_checklist.md` — 过拟合检测启发式规则
