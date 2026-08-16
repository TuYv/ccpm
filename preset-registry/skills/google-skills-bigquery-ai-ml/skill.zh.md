---
name: bigquery-ai-ml
metadata:
  category: AiAndMachineLearning
description: >-
  Leverages BigQuery's built-in machine learning and GenAI capabilities
  for advanced data analytics. Use when you need to write SQL queries
  that perform time-series forecasting, predict values, detect outliers or anomalies, find key drivers,
  perform semantic search or vector search, classify text, calculate similarity,
  summarize content, translate language, evaluate models, filter by semantic conditions,
  or leverage generative AI capabilities in BigQuery. Do not use for general
  BigQuery dataset, table, or job management requests.
---
# BigQuery AI 与 ML

BigQuery 与 Vertex AI 集成，通过 `AI.FORECAST`、`AI.KEY_DRIVERS`、`AI.DETECT_ANOMALIES` 和 `AI.GENERATE` 等内置函数，直接在 SQL 查询中提供强大的机器学习和生成式 AI 能力。

## 参考目录

-   **函数参考**：

    -   **AI.AGG**：[ai_agg.md](references/ai_agg.md) - 多行语义聚合与摘要。
    -   **AI.CLASSIFY**：[ai_classify.md](references/ai_classify.md) - 对文本进行分类。
    -   **AI.DETECT_ANOMALIES**：
        [ai_detect_anomalies.md](references/ai_detect_anomalies.md) - 检测异常。
    -   **AI.EVALUATE**：[ai_evaluate.md](references/ai_evaluate.md) - 评估模型。
    -   **AI.FORECAST**：[ai_forecast.md](references/ai_forecast.md) -
        时间序列预测。
    -   **AI.GENERATE**：[ai_generate.md](references/ai_generate.md) - 使用 LLM 生成文本。
    -   **AI.GENERATE_EMBEDDING**：
        [ai_generate_embedding.md](references/ai_generate_embedding.md) -
        生成嵌入。
    -   **AI.GENERATE_TABLE**：
        [ai_generate_table.md](references/ai_generate_table.md) - 表值
        AI 生成。
    -   **AI.IF**：[ai_if.md](references/ai_if.md) - 评估语义条件。
    -   **AI.KEY_DRIVERS**：[ai_key_drivers.md](references/ai_key_drivers.md) -
        识别关键驱动因素，这是一个 TVF。
    -   **AI.SCORE**：[ai_score.md](references/ai_score.md) - 对数据进行评分。
    -   **AI.SEARCH**：[ai_search.md](references/ai_search.md) - 语义搜索。
    -   **AI.SIMILARITY**：[ai_similarity.md](references/ai_similarity.md) -
        语义相似度。
    -   **远程模型**：[remote_models.md](references/remote_models.md) -
        使用远程模型（Vertex AI）。
    -   **CONTRIBUTION_ANALYSIS**：
        [ml_contribution_analysis.md](references/ml_contribution_analysis.md)
        -   查找贡献因素和变化的关键驱动因素。需要创建
            MODEL 实体。
    -   **VECTOR_SEARCH**：[vector_search.md](references/vector_search.md) -
        向量搜索最佳实践。

## 相关 Skill

-   [BigQuery 基础 Skill](../bigquery-basics)：涵盖 BigQuery 核心概念、资源管理、CLI 和客户端库的 SKILL.md 文件。