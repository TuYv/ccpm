---
name: redis-vector-search
description: Redis vector search guidance covering HNSW vs FLAT algorithm choice, vector index configuration (dims, distance metric, datatype), filtered hybrid search combining vector similarity with TAG or NUMERIC filters, and the RAG retrieval pattern with RedisVL. Use when defining a VECTOR field in FT.CREATE, integrating embeddings (OpenAI, Cohere, sentence-transformers), tuning HNSW parameters (M, EF_CONSTRUCTION, EF_RUNTIME), building a retrieval-augmented generation pipeline, or filtering vector results by attribute.
license: MIT
metadata:
  author: Redis, Inc.
  version: "0.1.0"
---
# Redis 向量搜索

关于在 Redis 中存储和搜索嵌入（embeddings）的指南。涵盖索引配置、算法选择、混合过滤，以及使用 RedisVL 的 RAG 检索模式。

## 适用场景

- 在 `FT.CREATE`（原生 RQE）或 RedisVL `IndexSchema` 中定义 `VECTOR` 字段。
- 在 HNSW 与 FLAT 之间做选择，以及调优 HNSW 参数。
- 为向量查询添加类别、日期或租户过滤条件。
- 在 Redis 之上构建检索增强生成（RAG）流水线。

本技能建立在 `redis-query-engine` 技能之上 —— 向量字段位于 RQE 索引内部，并共用同一套 `FT.CREATE` / `FT.SEARCH` 机制。

## 1. 正确配置向量索引

以下三项设置必须与嵌入模型相匹配：

- **`DIM`** —— 模型的输出维度（例如 OpenAI `text-embedding-3-small` 为 1536）。不匹配会产生无声的错误结果。
- **`DISTANCE_METRIC`** —— 归一化文本嵌入（常见情形）用 `COSINE`，未归一化的内积用 `IP`，原始欧氏距离用 `L2`。
- **`TYPE` / `datatype`** —— 通常为 `FLOAT32`。仅当内存开销是硬性约束时才使用 `FLOAT16` 或量化变体。

原生 RQE：

```
FT.CREATE idx:docs ON HASH PREFIX 1 doc:
    SCHEMA
        content TEXT
        embedding VECTOR HNSW 6
            TYPE FLOAT32
            DIM 1536
            DISTANCE_METRIC COSINE
```

RedisVL：

```python
schema = IndexSchema.from_dict({
    "index": {"name": "idx:docs", "prefix": "doc:"},
    "fields": [
        {"name": "content", "type": "text"},
        {"name": "embedding", "type": "vector", "attrs": {
            "dims": 1536, "algorithm": "HNSW",
            "datatype": "FLOAT32", "distance_metric": "COSINE",
        }},
    ]
})
```

有关 redis-py 和 RedisVL 的其他写法，参见 [references/index-creation.md](references/index-creation.md)。

## 2. HNSW 与 FLAT

| 算法 | 速度 | 准确率 | 内存 | 适用场景 |
|---|---|---|---|---|
| **HNSW** | 快（近似） | ~95%+ 召回率（可调） | 较高 | 大型数据集（>1 万个向量）、对延迟敏感 |
| **FLAT** | 慢（精确） | 100% | 较低 | 小型数据集（<1 万个）、对准确率要求高 |

对任何生产规模的工作负载，默认选择 **HNSW**。可调优的手段：

- `M` —— 每个节点的连接数（16–64）。越高 = 召回率越好，内存占用越大。
- `EF_CONSTRUCTION` —— 构建期图质量（100–500）。越高 = 索引质量越好，构建越慢。
- `EF_RUNTIME` —— 查询时候选列表大小。越高 = 召回率越好，查询越慢。

当语料库较小且需要精确结果时使用 **FLAT**（例如对几千条数据做语义去重）。

参见 [references/algorithm-choice.md](references/algorithm-choice.md)。

## 3. 混合搜索 —— 先过滤，后向量

应用属性过滤器（TAG / NUMERIC），让引擎在向量比较*之前*先缩小搜索空间。不要取回宽泛的结果集再在客户端过滤 —— 那样更慢且准确率更低。

```python
from redisvl.query import VectorQuery
from redisvl.query.filter import Num, Tag

filters = (Tag("category") == "technology") & (Num("date") >= 2024)

query = VectorQuery(
    vector=query_embedding,
    vector_field_name="embedding",
    return_fields=["content", "category", "date"],
    num_results=10,
    filter_expression=filters,
)
results = index.query(query)
```

对于**文本 + 向量融合**（BM25 加权文本评分与向量相似度相结合），在 Redis ≥ 8.4 且 redis-py ≥ 7.1 时使用 `HybridQuery`，在较旧版本的 Redis 上则使用 `AggregateHybridQuery`。这种“混合”与上面所说的带过滤的向量搜索是不同的概念。

参见 [references/hybrid-search.md](references/hybrid-search.md)。

## 4. RAG 模式

标准流水线：对用户查询做嵌入 → 在 Redis 中做向量搜索 → 将 top-K 上下文传给 LLM。

```python
# Index documents with embeddings
records = [{"content": doc.content,
            "embedding": embed_model.encode(doc.content).tolist(),
            "source": doc.source}
           for doc in documents]
index.load(records)

# Retrieve relevant context for a user question
q_emb = embed_model.encode(user_question)
results = index.query(VectorQuery(
    vector=q_emb,
    vector_field_name="embedding",
    return_fields=["content", "source"],
    num_results=5,
))

# Generate with retrieved context
context = "\n".join(r["content"] for r in results)
response = llm.generate(f"Context: {context}\n\nQuestion: {user_question}")
```

实用技巧：

- **让度量与模型匹配。** 大多数现代文本嵌入模型与 `COSINE` 配合效果最佳。
- 索引前先**对长文档分块（chunk）** —— 基于 200–500 token 的块做检索通常优于整页索引。
- 使用 `index.load([...])` **批量插入**，而不是每条记录调用一次。
- 在向量搜索之前**用属性预过滤**（租户、时效性、文档类型）。

参见 [references/rag-pattern.md](references/rag-pattern.md)。

## 参考资料

- [Redis：向量](https://redis.io/docs/latest/develop/ai/search-and-query/vectors/)
- [Redis：RAG 快速入门](https://redis.io/docs/latest/develop/get-started/rag/)
- [RedisVL 文档](https://docs.redisvl.com/en/latest/)
