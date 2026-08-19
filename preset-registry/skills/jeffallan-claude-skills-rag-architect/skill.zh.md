---
name: rag-architect
description: Designs and implements production-grade RAG systems by chunking documents, generating embeddings, configuring vector stores, building hybrid search pipelines, applying reranking, and evaluating retrieval quality. Use when building RAG systems, vector databases, or knowledge-grounded AI applications requiring semantic search, document retrieval, context augmentation, similarity search, or embedding-based indexing.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: data-ml
  triggers: RAG, retrieval-augmented generation, vector search, embeddings, semantic search, vector database, document retrieval, knowledge base, context retrieval, similarity search
  role: architect
  scope: system-design
  output-format: architecture
  related-skills: python-pro, database-optimizer, monitoring-expert, api-designer
---
# RAG 架构师

## 核心工作流

1. **需求分析** — 明确检索需求、延迟约束、准确率要求和规模
2. **向量存储设计** — 选择数据库、设计模式、索引策略和分片方案
3. **分块策略** — 文档切分、重叠、语义边界和元数据增强
4. **检索管道** — 嵌入模型选择、查询转换、混合搜索和重排序
5. **评估与迭代** — 指标跟踪、检索调试和持续优化

每个步骤在进入下一步前都要验证（参见下方检查点）。

## 参考指南

根据上下文加载详细指导：

| 主题 | 参考资料 | 加载时机 |
|-------|-----------|-----------|
| 向量数据库 | `references/vector-databases.md` | 比较 Pinecone、Weaviate、Chroma、pgvector、Qdrant 时 |
| 嵌入模型 | `references/embedding-models.md` | 选择嵌入模型、微调、维度权衡时 |
| 分块策略 | `references/chunking-strategies.md` | 文档切分、重叠、语义分块时 |
| 检索优化 | `references/retrieval-optimization.md` | 混合搜索、重排序、查询扩展、过滤时 |
| RAG 评估 | `references/rag-evaluation.md` | 指标、评估框架、检索调试时 |

## 实现示例

### 1. 文档分块

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Evaluate chunk_size on your domain data — never use 512 blindly
splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=100,
    separators=["\n\n", "\n", ". ", " "],
)

chunks = splitter.create_documents(
    texts=[doc.page_content for doc in raw_docs],
    metadatas=[{"source": doc.metadata["source"], "timestamp": doc.metadata.get("timestamp")} for doc in raw_docs],
)
```

**检查点：** `assert all(c.metadata.get("source") for c in chunks), "Missing source metadata"`

### 2. 生成嵌入并建立索引

```python
from openai import OpenAI
import qdrant_client
from qdrant_client.models import VectorParams, Distance, PointStruct

client = OpenAI()
qdrant = qdrant_client.QdrantClient("localhost", port=6333)

# Create collection
qdrant.recreate_collection(
    collection_name="knowledge_base",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
)

def embed_chunks(chunks: list[str], model: str = "text-embedding-3-small") -> list[list[float]]:
    response = client.embeddings.create(input=chunks, model=model)
    return [r.embedding for r in response.data]

# Idempotent upsert with deduplication via deterministic IDs
import hashlib, uuid

points = []
for i, chunk in enumerate(chunks):
    doc_id = str(uuid.UUID(hashlib.md5(chunk.page_content.encode()).hexdigest()))
    embedding = embed_chunks([chunk.page_content])[0]
    points.append(PointStruct(id=doc_id, vector=embedding, payload=chunk.metadata))

qdrant.upsert(collection_name="knowledge_base", points=points)
```

**检查点：** `assert qdrant.count("knowledge_base").count == len(set(p.id for p in points)), "Deduplication failed"`

### 3. 混合搜索（向量 + BM25）

```python
from qdrant_client.models import Filter, FieldCondition, MatchValue, SparseVector
from rank_bm25 import BM25Okapi

def hybrid_search(query: str, tenant_id: str, top_k: int = 20) -> list:
    # Dense retrieval
    query_embedding = embed_chunks([query])[0]
    tenant_filter = Filter(must=[FieldCondition(key="tenant_id", match=MatchValue(value=tenant_id))])
    dense_results = qdrant.search(
        collection_name="knowledge_base",
        query_vector=query_embedding,
        query_filter=tenant_filter,
        limit=top_k,
    )

    # Sparse retrieval (BM25)
    corpus = [r.payload.get("text", "") for r in dense_results]
    bm25 = BM25Okapi([doc.split() for doc in corpus])
    bm25_scores = bm25.get_scores(query.split())

    # Reciprocal Rank Fusion
    ranked = sorted(
        zip(dense_results, bm25_scores),
        key=lambda x: 0.6 * x[0].score + 0.4 * x[1],
        reverse=True,
    )
    return [r for r, _ in ranked[:top_k]]
```

**检查点：** `assert len(hybrid_search("test query", tenant_id="demo")) > 0, "Hybrid search returned no results"`

### 4. 对 Top-K 结果进行重排序

从环境变量或密钥管理器加载提供商 API 密钥；绝不要将其提交到源代码中。

```python
import os

import cohere

co = cohere.Client(os.environ["COHERE_API_KEY"])

def rerank(query: str, results: list, top_n: int = 5) -> list:
    docs = [r.payload.get("text", "") for r in results]
    reranked = co.rerank(query=query, documents=docs, top_n=top_n, model="rerank-english-v3.0")
    return [results[r.index] for r in reranked.results]
```

### 5. 检索评估

```python
# Run precision@k and recall@k against a labeled evaluation set
# python evaluate.py --metrics precision@10 recall@10 mrr --collection knowledge_base

from ragas import evaluate
from ragas.metrics import context_precision, context_recall, faithfulness, answer_relevancy
from datasets import Dataset

eval_dataset = Dataset.from_dict({
    "question": questions,
    "contexts": retrieved_contexts,
    "answer": generated_answers,
    "ground_truth": ground_truth_answers,
})

results = evaluate(eval_dataset, metrics=[context_precision, context_recall, faithfulness, answer_relevancy])
print(results)
```

**检查点：** 在进入 LLM 集成之前，目标应达到 `context_precision >= 0.7` 和 `context_recall >= 0.6`。

## 约束

### 必须执行
- 在确定使用前，针对你的领域数据评估多个嵌入模型
- 为生产系统实现混合搜索（向量 + 关键词）
- 为多租户或特定领域检索添加元数据过滤器
- 衡量检索指标（precision@k、recall@k、MRR、NDCG）
- 在将上下文传递给 LLM 前，对 top-k 结果使用重排序
- 实现具备去重功能的幂等数据摄取（确定性 ID）
- 持续监控检索延迟和质量
- 对嵌入进行版本管理，并规划模型迁移

### 严禁执行
- 未在你的领域数据上进行评估，就使用默认分块大小（512）
- 跳过元数据扩充（来源、时间戳、章节）
- 只关注 LLM 输出质量，而忽略检索质量指标
- 不经预处理或清洗就存储原始文档
- 对复杂的多领域检索仅使用余弦相似度
- 未在接近生产环境的数据量上测试就部署
- 忘记处理边缘情况（空结果、格式错误的文档）
- 将嵌入模型与应用程序代码紧密耦合

## 输出模板

设计 RAG 架构时，请交付：
1. 系统架构图（摄取 + 检索管道）
2. 向量数据库选型及权衡分析
3. 分块策略，包含示例和依据
4. 检索管道设计（查询 → 结果流）
5. 评估计划，包含指标、基准测试和通过/失败阈值

[文档](https://jeffallan.github.io/claude-skills/skills/data-ml/rag-architect/)