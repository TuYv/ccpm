---
name: edge-pipeline-orchestrator
description: Orchestrate the full edge research pipeline from candidate detection through strategy design, review, revision, and export. Use when coordinating multi-stage edge research workflows end-to-end.
---
# Edge 管线编排器

将所有边缘研究阶段协调为一次自动化的完整管线运行。

## 何时使用

- 运行完整的 edge 管线，从 tickets（或 OHLCV）一直到导出策略
- 从 drafts 阶段恢复部分完成的管线
- 通过反馈循环对现有策略草案进行评审与修订
- 试运行（dry-run）管线，在不导出的情况下预览结果

## 工作流程

1. 从 CLI 参数加载管线配置
2. 若提供了 --from-ohlcv，则运行 auto_detect 阶段（从原始 OHLCV 数据生成 tickets）
3. 运行 hints 阶段，从市场摘要与异常中提取 edge hints
4. 运行 concepts 阶段，从 tickets 和 hints 中合成抽象的 edge concepts
5. 运行 drafts 阶段，基于 concepts 设计策略草案
6. 运行评审-修订反馈循环：
   - 评审所有草案（最多 2 次迭代）
   - 累积 PASS 判定结果；累积 REJECT 判定结果
   - REVISE 判定结果会触发 apply_revisions 并重新评审
   - 达到最大迭代次数后仍为 REVISE 的结果将被降级为 research_probe
7. 导出符合条件的草案（PASS + export_ready_v1 + 可导出的 entry_family）
8. 写入 pipeline_run_manifest.json，其中包含完整执行轨迹

## CLI 用法

```bash
# Full pipeline from tickets
python3 scripts/orchestrate_edge_pipeline.py \
  --tickets-dir path/to/tickets/ \
  --output-dir reports/edge_pipeline/

# Full pipeline from OHLCV
python3 scripts/orchestrate_edge_pipeline.py \
  --from-ohlcv path/to/ohlcv.csv \
  --output-dir reports/edge_pipeline/

# Resume from drafts stage
python3 scripts/orchestrate_edge_pipeline.py \
  --resume-from drafts \
  --drafts-dir path/to/drafts/ \
  --output-dir reports/edge_pipeline/

# Review-only mode
python3 scripts/orchestrate_edge_pipeline.py \
  --review-only \
  --drafts-dir path/to/drafts/ \
  --output-dir reports/edge_pipeline/

# Dry run (no export)
python3 scripts/orchestrate_edge_pipeline.py \
  --tickets-dir path/to/tickets/ \
  --output-dir reports/edge_pipeline/ \
  --dry-run
```

## 输出

所有产出物均写入 `--output-dir`：

```
output-dir/
├── pipeline_run_manifest.json
├── tickets/          (from auto_detect)
├── hints/hints.yaml  (from hints)
├── concepts/edge_concepts.yaml
├── drafts/*.yaml
├── exportable_tickets/*.yaml
├── reviews_iter_0/*.yaml
├── reviews_iter_1/*.yaml  (if needed)
└── strategies/<candidate_id>/
    ├── strategy.yaml
    └── metadata.json
```

## Claude Code 中的 LLM 增强工作流

完全在 Claude Code 内运行 LLM 增强管线：

1. 运行 auto_detect 以生成 `market_summary.json` + `anomalies.json`
2. Claude Code 分析数据并生成 edge hints
3. 将 hints 保存到一个 YAML 文件：

```yaml
- title: Sector rotation into industrials
  observation: Tech underperforming while industrials show relative strength
  symbols: [CAT, DE, GE]
  regime_bias: Neutral
  mechanism_tag: flow
  preferred_entry_family: pivot_breakout
  hypothesis_type: sector_x_stock
```

4. 使用 `--llm-ideas-file` 和 `--promote-hints` 运行编排器：

```bash
python3 scripts/orchestrate_edge_pipeline.py \
  --tickets-dir path/to/tickets/ \
  --llm-ideas-file llm_hints.yaml \
  --promote-hints \
  --as-of 2026-02-28 \
  --max-synthetic-ratio 1.5 \
  --strict-export \
  --output-dir reports/edge_pipeline/
```

### 可选标志

- `--as-of YYYY-MM-DD` — 传递给 hints 阶段用于日期过滤
- `--strict-export` — 含有任何 warn 发现的可导出草案将得到 REVISE 而非 PASS
- `--max-synthetic-ratio N` — 将合成 tickets 上限设为 N × 真实 tickets 数量（下限：3）
- `--overlap-threshold F` — 用于概念去重的条件重叠阈值（默认值：0.75）
- `--no-dedup` — 禁用概念去重

注意：`--llm-ideas-file` 和 `--promote-hints` 仅在完整管线运行期间生效。
`--resume-from drafts` 和 `--review-only` 会跳过 hints/concepts 阶段，因此这些标志会被忽略。

## 资源

- `references/pipeline_flow.md` — 管线各阶段、数据契约与架构
- `references/revision_loop_rules.md` — 评审-修订反馈循环的规则与启发式方法
