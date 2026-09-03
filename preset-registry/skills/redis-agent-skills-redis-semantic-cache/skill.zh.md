---
name: redis-semantic-cache
description: Redis LangCache guidance for semantic caching of LLM responses on Redis Cloud — calling search/set via the SDK or REST API, tuning the similarity threshold, separating caches per task type, and filtering with custom attributes. Use when caching LLM completions or RAG answers to cut API cost and latency, building a cache-aside layer in front of OpenAI / Anthropic / etc., tuning hit rate vs precision, or splitting one app's LLM workloads into multiple LangCache caches.
license: MIT
metadata:
  author: Redis, Inc.
  version: "0.1.0"
---
# Redis 语义缓存

借助 Redis Cloud 的 LangCache 服务为 LLM 响应提供语义缓存。它将提示词存储为嵌入向量；后续语义相似的提示词会直接返回缓存的响应，无需重新调用模型。

> LangCache 目前在 Redis Cloud 上处于**预览**阶段。功能和行为可能发生变化。

## 何时使用

- 为 LLM 调用（OpenAI、Anthropic 等）包裹一层缓存，以降低成本和延迟。
- 缓存 RAG 回答、分类输出，或任何确定性的 LLM 工作负载。
- 调优语义缓存的精确率/命中率权衡。
- 将一个应用的 LLM 工作负载拆分到多个缓存实例。

## 1. cache-aside 流程

LangCache 以标准的 cache-aside 模式置于任何 LLM 调用之前：

1. 将用户的提示词发送到 LangCache 的 `search`。
2. **缓存命中** —— 直接返回已存储的响应。
3. **缓存未命中** —— 调用 LLM，再 `set` 该响应，使后续相似的提示词能够命中。

```python
from langcache import LangCache
import os

lang_cache = LangCache(
    server_url=f"https://{os.getenv('HOST')}",
    cache_id=os.getenv("CACHE_ID"),
    api_key=os.getenv("API_KEY"),
)

result = lang_cache.search(prompt="What is Redis?", similarity_threshold=0.9)
if result:
    response = result[0]["response"]
else:
    response = llm.generate("What is Redis?")
    lang_cache.set(prompt="What is Redis?", response=response)
```

当无法使用 SDK 时，同样可以通过 REST（`POST /v1/caches/{cacheId}/entries/search` 和 `POST /v1/caches/{cacheId}/entries`）执行这些操作。

完整的 SDK + REST 示例以及基于属性的存储，请参见 [references/langcache-usage.md](references/langcache-usage.md)。

## 2. 调优相似度阈值

该阈值控制一条新提示词必须与已缓存提示词接近到什么程度（以嵌入向量的余弦距离衡量）才算命中。阈值越高 = 匹配越严格，误报越少。阈值越低 = 命中越多，返回离题回答的风险也越大。

| 阈值 | 行为 | 适用场景 |
|---|---|---|
| 0.95+ | 要求近乎完全匹配 | 面向客户的回答，错误响应代价高昂 |
| 0.9 | 均衡的默认值 | 大多数工作负载 —— 从这里开始 |
| 0.8 | 宽松的语义匹配 | 内部工具、探索性查询、FAQ 去重 |

```python
# Stricter — fewer false positives
result = lang_cache.search(prompt="What is Redis?", similarity_threshold=0.95)

# Looser — higher hit rate
result = lang_cache.search(prompt="What is Redis?", similarity_threshold=0.8)
```

通过观察实际缓存命中率并抽查返回的回答是否仍然相关来做出调整。

参见 [references/best-practices.md](references/best-practices.md)。

## 3. 按任务类型分离缓存

不同的 LLM 工作负载不应共享同一个缓存 —— “代码问题”提示词在语义上与其他代码问题接近，但与密码重置支持查询毫无关系，二者交叉会返回垃圾结果。

```python
support_cache = LangCache(server_url=..., cache_id="support-cache-id", api_key=...)
code_cache    = LangCache(server_url=..., cache_id="code-cache-id",    api_key=...)
```

在 Redis Cloud 中为每个任务创建不同的 cache ID，并将每次调用路由到正确的缓存。作为更细粒度的替代方案，可以使用**自定义属性**（例如 `{"category": "database"}`）进行存储和搜索，让任务保留在同一个缓存中，但通过属性过滤相互隔离 —— 当相同的提示词格式横跨多个子主题时非常有用。

## 参考资料

- [LangCache 文档](https://redis.io/docs/latest/develop/ai/langcache/)
