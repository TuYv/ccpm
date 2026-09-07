---
name: edge-signal-aggregator
description: Aggregate and rank signals from multiple edge-finding skills (edge-candidate-agent, theme-detector, sector-analyst, institutional-flow-tracker) into a prioritized conviction dashboard with weighted scoring, deduplication, and contradiction detection.
---
# Edge Signal Aggregator

## 概述

将多个上游边缘发现技能的输出合并为一个加权的信念度仪表盘。该技能应用可配置的信号权重，对重叠主题进行去重，标记各技能之间的矛盾之处，并按综合置信度得分对组合后的边缘创意进行排序。最终结果是一份按优先级排列的边缘创意候选清单，并附带指向各个贡献技能的溯源链接。

## 何时使用

- 在运行多个边缘发现技能之后，希望获得统一的视图
- 需要整合来自 edge-candidate-agent、theme-detector、sector-analyst 和 institutional-flow-tracker 的信号时
- 在基于多个信号来源做出投资组合配置决策之前
- 用于识别不同分析方法之间的矛盾之处
- 需要确定哪些边缘创意值得深入研究时

## 前置条件

- Python 3.9 及以上版本
- 无需 API 密钥（处理来自其他技能的本地 JSON/YAML 文件）
- 依赖项：`pyyaml`（在大多数环境中为标准配置）

## 工作流程

### 步骤 1：收集上游技能输出

收集你想要聚合的上游技能的输出文件：
- 来自 edge-candidate-agent 的 `reports/edge_candidate_*.json`
- 来自 edge-concept-synthesizer 的 `reports/edge_concepts_*.yaml`
- 来自 theme-detector 的 `reports/theme_detector_*.json`
- 来自 sector-analyst 的 `reports/sector_analyst_*.json`
- 来自 institutional-flow-tracker 的 `reports/institutional_flow_*.json`
- 来自 edge-hint-extractor 的 `reports/edge_hints_*.yaml`

### 步骤 2：运行信号聚合

使用上游输出的路径执行聚合脚本：

```bash
python3 skills/edge-signal-aggregator/scripts/aggregate_signals.py \
  --edge-candidates reports/edge_candidate_agent_*.json \
  --edge-concepts reports/edge_concepts_*.yaml \
  --themes reports/theme_detector_*.json \
  --sectors reports/sector_analyst_*.json \
  --institutional reports/institutional_flow_*.json \
  --hints reports/edge_hints_*.yaml \
  --output-dir reports/
```

可选：使用自定义权重配置：

```bash
python3 skills/edge-signal-aggregator/scripts/aggregate_signals.py \
  --edge-candidates reports/edge_candidate_agent_*.json \
  --weights-config skills/edge-signal-aggregator/assets/custom_weights.yaml \
  --output-dir reports/
```

### 步骤 3：审阅聚合后的仪表盘

打开生成的报告进行审阅：
1. **排序后的边缘创意** - 按综合信念度得分排序
2. **信号溯源** - 每个创意由哪些技能贡献
3. **矛盾之处** - 标记出需要人工复核的冲突信号
4. **去重日志** - 已合并的重叠主题

### 步骤 4：基于高信念信号采取行动

按最低信念阈值筛选候选清单：

```bash
python3 skills/edge-signal-aggregator/scripts/aggregate_signals.py \
  --edge-candidates reports/edge_candidate_agent_*.json \
  --min-conviction 0.7 \
  --output-dir reports/
```

## 输出格式

### JSON 报告

```json
{
  "schema_version": "1.0",
  "generated_at": "2026-03-02T07:00:00Z",
  "config": {
    "weights": {
      "edge_candidate_agent": 0.25,
      "edge_concept_synthesizer": 0.20,
      "theme_detector": 0.15,
      "sector_analyst": 0.15,
      "institutional_flow_tracker": 0.15,
      "edge_hint_extractor": 0.10
    },
    "min_conviction": 0.5,
    "dedup_similarity_threshold": 0.8
  },
  "summary": {
    "total_input_signals": 42,
    "unique_signals_after_dedup": 28,
    "contradictions_found": 3,
    "signals_above_threshold": 12
  },
  "ranked_signals": [
    {
      "rank": 1,
      "signal_id": "sig_001",
      "title": "AI Infrastructure Capex Acceleration",
      "composite_score": 0.87,
      "contributing_skills": [
        {
          "skill": "edge_candidate_agent",
          "signal_ref": "ticket_2026-03-01_001",
          "raw_score": 0.92,
          "weighted_contribution": 0.23
        },
        {
          "skill": "theme_detector",
          "signal_ref": "theme_ai_infra",
          "raw_score": 0.85,
          "weighted_contribution": 0.13
        }
      ],
      "tickers": ["NVDA", "AMD", "AVGO"],
      "direction": "LONG",
      "time_horizon": "3-6 months",
      "confidence_breakdown": {
        "multi_skill_agreement": 0.30,
        "signal_strength": 0.35,
        "recency": 0.22
      }
    }
  ],
  "contradictions": [
    {
      "contradiction_id": "contra_001",
      "description": "Conflicting sector view on Energy",
      "skill_a": {
        "skill": "sector_analyst",
        "signal": "Energy sector bearish rotation",
        "direction": "SHORT"
      },
      "skill_b": {
        "skill": "institutional_flow_tracker",
        "signal": "Heavy institutional buying in XLE",
        "direction": "LONG"
      },
      "resolution_hint": "Check timeframe mismatch (short-term vs long-term)"
    }
  ],
  "deduplication_log": [
    {
      "merged_into": "sig_001",
      "duplicates_removed": ["theme_detector:ai_compute", "edge_hints:datacenter_demand"],
      "similarity_score": 0.92
    }
  ]
}
```

### Markdown 报告

Markdown 报告提供了人类可读的仪表盘：

```markdown
# Edge Signal Aggregator Dashboard
**Generated:** 2026-03-02 07:00 UTC

## Summary
- Total Input Signals: 42
- Unique After Dedup: 28
- Contradictions: 3
- High Conviction (>0.7): 12

## Top 10 Edge Ideas by Conviction

### 1. AI Infrastructure Capex Acceleration (Score: 0.87)
- **Tickers:** NVDA, AMD, AVGO
- **Direction:** LONG | **Horizon:** 3-6 months
- **Contributing Skills:**
  - edge-candidate-agent: 0.92 (ticket_2026-03-01_001)
  - theme-detector: 0.85 (theme_ai_infra)
- **Confidence Breakdown:** Agreement 0.30 | Strength 0.35 | Recency 0.22

...

## Contradictions Requiring Review

### Energy Sector Conflict
- **sector-analyst:** Bearish rotation (SHORT)
- **institutional-flow-tracker:** Heavy buying XLE (LONG)
- **Hint:** Check timeframe mismatch

## Deduplication Summary
- 14 signals merged into 8 unique themes
- Average similarity of merged signals: 0.89
```

报告保存到 `reports/` 目录，文件名如下：
- `edge_signal_aggregator_YYYY-MM-DD_HHMMSS.json`
- `edge_signal_aggregator_YYYY-MM-DD_HHMMSS.md`

## 资源

- `scripts/aggregate_signals.py` -- 主聚合脚本，带 CLI 接口
- `references/signal-weighting-framework.md` -- 默认权重和评分方法论的依据说明
- `assets/default_weights.yaml` -- 默认技能权重配置

## 核心原则

1. **溯源追踪** -- 每个聚合后的信号都可回溯到其来源技能和原始引用
2. **矛盾透明** -- 冲突信号会被标记而非隐藏，以便做出知情决策
3. **可配置权重** -- 默认权重反映典型可靠性，但可按用户需求自定义
4. **无损去重** -- 合并后的信号保留对所有原始来源的引用
5. **可操作的输出** -- 排序后的清单为每个创意提供明确的股票代码、方向和时间跨度
