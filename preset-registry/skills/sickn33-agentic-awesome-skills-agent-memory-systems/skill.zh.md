---
name: agent-memory-systems
description: "Memory is the cornerstone of intelligent agents. Without it, every
  interaction starts from zero. This skill covers the architecture of agent
  memory: short-term (context window), long-term (vector stores), and the
  cognitive architectures that organize them."
risk: safe
source: vibeship-spawner-skills (Apache 2.0)
date_added: 2026-02-27
---
# 智能体记忆系统

记忆是智能体的基石。没有它，每次交互都会从零开始。本技能涵盖智能体记忆的架构：短期记忆（上下文窗口）、长期记忆（向量存储），以及组织这些记忆的认知架构。

关键洞察：记忆不只是存储——更是检索。如果找不到正确的那一条，存储一百万条事实也毫无意义。分块、嵌入和检索策略决定了你的智能体是“记住”还是“遗忘”。

该领域术语碎片化且不一致。我们采用 CoALA 认知架构框架：语义记忆（事实）、情景记忆（经历）和程序记忆（如何做的知识）。

## 原则

- 记忆质量 = 检索质量，而不是存储数量
- 为了检索而分块，而不是为了存储
- 上下文隔离是记忆的敌人
- 为正确的信息选择正确的记忆类型
- 让旧记忆衰减——并非所有内容都应永久保留
- 上线前测试检索准确率
- 后台形成记忆优于实时形成

## 能力

- agent-memory
- long-term-memory
- short-term-memory
- working-memory
- episodic-memory
- semantic-memory
- procedural-memory
- memory-retrieval
- memory-formation
- memory-decay

## 范围

- vector-database-operations → data-engineer
- rag-pipeline-architecture → llm-architect
- embedding-model-selection → ml-engineer
- knowledge-graph-design → knowledge-engineer

## 工具

### 记忆框架

- LangMem（LangChain）- 何时使用：需要持久记忆的 LangGraph 智能体 注意：语义、情景、程序记忆类型
- MemGPT / Letta - 何时使用：虚拟上下文管理、操作系统式记忆 注意：分层记忆层级、自动分页
- Mem0 - 何时使用：用于个性化的用户记忆层 注意：面向用户偏好和历史记录

### 向量存储

- Pinecone - 何时使用：托管式、企业级规模（数十亿向量） 注意：查询性能最佳、成本最高
- Qdrant - 何时使用：复杂元数据过滤、开源 注意：基于 Rust、过滤能力出色
- Weaviate - 何时使用：混合搜索、知识图谱功能 注意：GraphQL 接口，适合关系数据
- ChromaDB - 何时使用：原型开发、中小型应用 注意：对开发者友好，100K 向量时 p50 约 20ms
- pgvector - 何时使用：已在使用 PostgreSQL、部署更简单 注意：适合少于 1M 向量，工具链熟悉

### 嵌入模型

- OpenAI text-embedding-3-large - 何时使用：质量最佳、3072 维 注意：$0.13/1M tokens
- OpenAI text-embedding-3-small - 何时使用：平衡性好、1536 维 注意：$0.02/1M tokens，便宜 5 倍
- nomic-embed-text-v1.5 - 何时使用：开源、本地部署 注意：768 维，质量良好
- all-MiniLM-L6-v2 - 何时使用：轻量、快速的本地嵌入 注意：384 维，延迟最低

## 模式

### 记忆类型架构

为不同信息选择合适的记忆类型

**何时使用**：设计智能体记忆系统

# 记忆类型架构（CoALA 框架）：

"""
三种记忆类型，对应不同用途：

1. 语义记忆：事实与知识
   - 你对世界的了解
   - 用户偏好、领域知识
   - 存储在档案（结构化）或集合（非结构化）中

2. 情景记忆：经历与事件
   - 发生了什么（带时间戳的事件）
   - 过往对话、任务结果
   - 用于从经验中学习

3. 程序记忆：如何做事
   - 规则、技能、工作流
   - 通常以少样本示例的形式实现
   - “我之前是怎么解决这个问题的？”
"""

## LangMem 实现
"""
from langmem import MemoryStore
from langgraph.graph import StateGraph

# Initialize memory store
memory = MemoryStore(
    connection_string=os.environ["POSTGRES_URL"]
)

# Semantic memory: user profile
await memory.semantic.upsert(
    namespace="user_profile",
    key=user_id,
    content={
        "name": "Alice",
        "preferences": ["dark mode", "concise responses"],
        "expertise_level": "developer",
    }
)

# Episodic memory: past interaction
await memory.episodic.add(
    namespace="conversations",
    content={
        "timestamp": datetime.now(),
        "summary": "Helped debug authentication issue",
        "outcome": "resolved",
        "key_insights": ["Token expiry was root cause"],
    },
    metadata={"user_id": user_id, "topic": "debugging"}
)

# Procedural memory: learned pattern
await memory.procedural.add(
    namespace="skills",
    content={
        "task_type": "debug_auth",
        "steps": ["Check token expiry", "Verify refresh flow"],
        "example_interaction": few_shot_example,
    }
)
"""

## 运行时记忆检索
"""
async def prepare_context(user_id, query):
    # Get user profile (semantic)
    profile = await memory.semantic.get(
        namespace="user_profile",
        key=user_id
    )

    # Find relevant past experiences (episodic)
    similar_experiences = await memory.episodic.search(
        namespace="conversations",
        query=query,
        filter={"user_id": user_id},
        limit=3
    )

    # Find relevant skills (procedural)
    relevant_skills = await memory.procedural.search(
        namespace="skills",
        query=query,
        limit=2
    )

    return {
        "profile": profile,
        "past_experiences": similar_experiences,
        "relevant_skills": relevant_skills,
    }
"""

### 向量存储选择模式

为你的使用场景选择合适的向量数据库

**何时使用**：设置持久记忆存储

# 向量存储选择：

"""
决策矩阵：

|            | Pinecone | Qdrant | Weaviate | ChromaDB | pgvector |
|------------|----------|--------|----------|----------|----------|
| 规模      | 数十亿 | 1 亿+  | 1 亿+    | 100 万       | 100 万       |
| 托管      | 是      | 两者皆可   | 两者皆可     | 自托管     | 自托管     |
| 过滤      | 基础    | 最佳   | 良好     | 基础    | SQL      |
| 混合      | 否       | 是      | 最佳     | 否       | 是      |
| 成本      | 高       | 中等 | 中等   | 免费     | 免费     |
| 延迟      | 5ms      | 7ms    | 10ms     | 20ms     | 15ms     |
"""

## Pinecone（企业级规模）
"""
from pinecone import Pinecone

pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
index = pc.Index("agent-memory")

# Upsert with metadata
index.upsert(
    vectors=[
        {
            "id": f"memory-{uuid4()}",
            "values": embedding,
            "metadata": {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "type": "episodic",
                "content": memory_text,
            }
        }
    ],
    namespace=namespace
)

# Query with filter
results = index.query(
    vector=query_embedding,
    filter={"user_id": user_id, "type": "episodic"},
    top_k=5,
    include_metadata=True
)
"""

## Qdrant（复杂过滤）
"""
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, Filter, FieldCondition

client = QdrantClient(url="http://localhost:6333")

# Complex filtering with Qdrant
results = client.search(
    collection_name="agent_memory",
    query_vector=query_embedding,
    query_filter=Filter(
        must=[
            FieldCondition(key="user_id", match={"value": user_id}),
            FieldCondition(key="type", match={"value": "semantic"}),
        ],
        should=[
            FieldCondition(key="topic", match={"any": ["auth", "security"]}),
        ]
    ),
    limit=5
)
"""

## ChromaDB（原型开发）
"""
import chromadb

client = chromadb.PersistentClient(path="./memory_db")
collection = client.get_or_create_collection("agent_memory")

# Simple and fast for prototypes
collection.add(
    ids=[str(uuid4())],
    embeddings=[embedding],
    documents=[memory_text],
    metadatas=[{"user_id": user_id, "type": "episodic"}]
)

results = collection.query(
    query_embeddings=[query_embedding],
    n_results=5,
    where={"user_id": user_id}
)
"""

### 分块策略模式

将文档拆分为可检索的块

**何时使用**：处理文档以存入记忆

# 分块策略：

"""
分块的两难：
- 过大：向量失去特异性
- 过小：失去上下文

最佳分块大小取决于：
- 文档类型（代码、文本还是数据）
- 查询模式（事实型还是探索型）
- 嵌入模型（每个模型都有最佳区间）

一般建议：大多数用例使用 256-512 个 token
"""

## 固定大小分块（基线）
"""
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,      # Characters
    chunk_overlap=50,    # Overlap prevents cutting sentences
    separators=["\n\n", "\n", ". ", " ", ""]  # Priority order
)

chunks = splitter.split_text(document)
"""

## 语义分块（质量更好）
"""
from langchain_experimental.text_splitter import SemanticChunker
from langchain_openai import OpenAIEmbeddings

# Splits based on semantic similarity
splitter = SemanticChunker(
    embeddings=OpenAIEmbeddings(),
    breakpoint_threshold_type="percentile",
    breakpoint_threshold_amount=95
)

chunks = splitter.split_text(document)
"""

## 结构感知分块（有层级的文档）
"""
from langchain.text_splitter import MarkdownHeaderTextSplitter

# Respect document structure
splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=[
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
    ]
)

chunks = splitter.split_text(markdown_doc)
# Each chunk has header metadata for context
"""

## 上下文分块（Anthropic 的方法）
"""
# Add context to each chunk before embedding
# Reduces retrieval failures by 35%

def add_context_to_chunk(chunk, document_summary):
    context_prompt = f'''
    Document summary: {document_summary}

    The following is a chunk from this document:
    {chunk}
    '''
    return context_prompt

# Embed the contextualized chunk, not raw chunk
for chunk in chunks:
    contextualized = add_context_to_chunk(chunk, summary)
    embedding = embed(contextualized)
    store(chunk, embedding)  # Store original, embed contextualized
"""

## 面向代码的分块
"""
from langchain.text_splitter import Language, RecursiveCharacterTextSplitter

# Language-aware splitting
python_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.PYTHON,
    chunk_size=1000,
    chunk_overlap=200
)

# Respects function/class boundaries
chunks = python_splitter.split_text(python_code)
"""

### 后台记忆形成

异步处理记忆以获得更高质量

**何时使用**：你希望在不拖慢交互的情况下提高召回率

# 后台记忆形成：

"""
Real-time memory extraction slows conversations and adds
complexity to agent tool calls. Background processing after
conversations yields higher quality memories.

Pattern: Subconscious memory formation
"""

## LangGraph 后台处理
"""
from langgraph.graph import StateGraph
from langgraph.checkpoint.postgres import PostgresSaver

async def background_memory_processor(thread_id: str):
    # Run after conversation ends or goes idle
    conversation = await load_conversation(thread_id)

    # Extract insights without time pressure
    insights = await llm.invoke('''
        Analyze this conversation and extract:
        1. Key facts learned about the user
        2. User preferences revealed
        3. Tasks completed or pending
        4. Patterns in user behavior

        Be thorough - this runs in background.

        Conversation:
        {conversation}
    ''')

    # Store to long-term memory
    for insight in insights:
        await memory.semantic.upsert(
            namespace="user_insights",
            key=generate_key(insight),
            content=insight,
            metadata={"source_thread": thread_id}
        )

# Trigger on conversation end or idle timeout
@on_conversation_idle(timeout_minutes=5)
async def process_conversation(thread_id):
    await background_memory_processor(thread_id)
"""

## 记忆巩固（类似睡眠）
"""
# Periodically consolidate and deduplicate memories

async def consolidate_memories(user_id: str):
    # Get all memories for user
    memories = await memory.semantic.list(
        namespace="user_insights",
        filter={"user_id": user_id}
    )

    # Find similar memories (potential duplicates)
    clusters = cluster_by_similarity(memories, threshold=0.9)

    # Merge similar memories
    for cluster in clusters:
        if len(cluster) > 1:
            merged = await llm.invoke(f'''
                Consolidate these related memories into one:
                {cluster}

                Preserve all important information.
            ''')
            await memory.semantic.upsert(
                namespace="user_insights",
                key=generate_key(merged),
                content=merged
            )
            # Delete originals
            for old in cluster:
                await memory.semantic.delete(old.id)
"""

### 记忆衰减模式

遗忘旧的、无关的记忆

**何时使用**：记忆变得庞大，检索变慢

# 记忆衰减：

"""
并非所有记忆都应永远存在：
- 旧偏好可能已经过时
- 任务细节会失去相关性
- 相互冲突的记忆会让检索变得混乱

根据以下因素实现智能衰减：
- 新近度（何时创建/访问？）
- 频率（被检索的频率有多高？）
- 重要性（是核心事实还是细节？）
"""

## 基于时间的衰减
"""
from datetime import datetime, timedelta

async def decay_old_memories(namespace: str, max_age_days: int):
    cutoff = datetime.now() - timedelta(days=max_age_days)

    old_memories = await memory.episodic.list(
        namespace=namespace,
        filter={"last_accessed": {"$lt": cutoff.isoformat()}}
    )

    for mem in old_memories:
        # Soft delete (mark as archived)
        await memory.episodic.update(
            id=mem.id,
            metadata={"archived": True, "archived_at": datetime.now()}
        )
"""

## 基于效用的衰减（MIRIX 方法）
"""
def calculate_memory_utility(memory):
    '''
    Composite utility score inspired by cognitive science:
    - Recency: When was it last accessed?
    - Frequency: How often is it accessed?
    - Importance: How critical is this information?
    '''
    now = datetime.now()

    # Recency score (exponential decay with 72h half-life)
    hours_since_access = (now - memory.last_accessed).total_seconds() / 3600
    recency_score = 0.5 ** (hours_since_access / 72)

    # Frequency score
    frequency_score = min(memory.access_count / 10, 1.0)

    # Importance (from metadata or heuristic)
    importance = memory.metadata.get("importance", 0.5)

    # Weighted combination
    utility = (
        0.4 * recency_score +
        0.3 * frequency_score +
        0.3 * importance
    )

    return utility

async def prune_low_utility_memories(threshold=0.2):
    all_memories = await memory.list_all()
    for mem in all_memories:
        if calculate_memory_utility(mem) < threshold:
            await memory.archive(mem.id)
"""

## 易错点

### 分块会切断信息与其上下文的联系

严重程度：严重

场景：为向量存储处理文档

症状：
检索能找到分块，但它们单独看没有意义。智能体的回答缺少全局视角。检索到“该函数返回 X”，却不知道是哪个函数。出现对“this”的引用，却不知道“this”指什么。

为什么这会出问题：
当我们为了 AI 处理而分块时，我们是在切断关联，把完整叙事降为孤立片段，而这些片段常常缺少全局视角。一个关于“配置”的分块，如果缺少关于正在配置什么系统的上下文，几乎毫无用处。

推荐修复：

### 上下文分块（Anthropic 的方法）
# Add document context to each chunk before embedding
# Reduces retrieval failures by 35%

def contextualize_chunk(chunk, document):
    summary = summarize(document)

    # LLM generates context for chunk
    context = llm.invoke(f'''
        Document summary: {summary}

Generate a brief context statement for this chunk
        that would help someone understand what it refers to:

        {chunk}
    ''')

    return f"{context}\n\n{chunk}"

# Embed the contextualized version
for chunk in chunks:
    contextualized = contextualize_chunk(chunk, full_doc)
    embedding = embed(contextualized)
    # Store original chunk, embed contextualized
    store(original=chunk, embedding=embedding)

## 分层分块
# Store at multiple granularities
chunks_small = split(doc, size=256)
chunks_medium = split(doc, size=512)
chunks_large = split(doc, size=1024)

# Retrieve at appropriate level based on query

### 分块大小与查询模式不匹配

严重程度：高

场景：为记忆存储配置分块

症状：
高质量文档产生低质量检索结果。简单问题漏掉相关信息。
复杂问题只得到碎片，而不是完整答案。

为什么这会出问题：
最佳分块大小取决于查询模式：
- 事实型查询需要小而具体的分块
- 概念型查询需要更大的上下文
- 代码需要函数级边界

最佳值因文档类型和嵌入模型而异。
默认的 1000 个字符对任何特定场景都不适用。

推荐修复：

## 测试不同大小
from sklearn.metrics import recall_score

def evaluate_chunk_size(documents, test_queries, chunk_size):
    chunks = split_documents(documents, size=chunk_size)
    index = build_index(chunks)

    correct_retrievals = 0
    for query, expected_chunk in test_queries:
        results = index.search(query, k=5)
        if expected_chunk in results:
            correct_retrievals += 1

    return correct_retrievals / len(test_queries)

# Test multiple sizes
for size in [256, 512, 768, 1024]:
    recall = evaluate_chunk_size(docs, test_queries, size)
    print(f"Size {size}: Recall@5 = {recall:.2%}")

## 按内容类型划分的大小建议
CHUNK_SIZES = {
    "documentation": 512,   # Complete concepts
    "code": 1000,          # Function-level
    "conversation": 256,   # Turn-level
    "articles": 768,       # Paragraph-level
}

## 使用重叠防止边界问题
splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=50,  # 10% overlap
)

### 语义搜索返回无关结果

严重程度：高

场景：查询记忆以获取上下文

症状：
智能体检索到看似相关但没有用的记忆。
“告诉我用户的偏好”返回的是关于一般偏好的对话，
而不是这个用户的偏好。错误内容却得到高相似度得分。

为什么这会出问题：
语义相似性并不等于相关性。“用户喜欢 Python”
和“Python 是一种编程语言”在语义上相似，但信息类型截然不同。
没有元数据过滤时，检索只是词语匹配。

推荐修复：

## 始终先按元数据过滤
# Don't rely on semantic similarity alone

# Bad: Only semantic search
results = index.query(
    vector=query_embedding,
    top_k=5
)

# Good: Filter then search
results = index.query(
    vector=query_embedding,
    filter={
        "user_id": current_user.id,
        "type": "preference",
        "created_after": cutoff_date,
    },
    top_k=5
)

## 使用混合搜索（语义 + 关键词）
from qdrant_client import QdrantClient

client = QdrantClient(...)

# Hybrid search with fusion
results = client.search(
    collection_name="memories",
    query_vector=semantic_embedding,
    query_text=query,  # Also keyword match
    fusion={"method": "rrf"},  # Reciprocal Rank Fusion
)

## 使用交叉编码器重排序结果
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

# Initial retrieval (recall-oriented)
candidates = index.query(query_embedding, top_k=20)

# Rerank (precision-oriented)
pairs = [(query, c.text) for c in candidates]
scores = reranker.predict(pairs)
reranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)

### 旧记忆覆盖当前信息

严重程度：高

场景：用户偏好或事实随时间变化

症状：
智能体使用过时的偏好。6 个月前的“用户偏好深色模式”
覆盖了最近的“切换到浅色模式”请求。
智能体自信地使用陈旧数据。

为什么这会出问题：
向量存储默认没有时间感知能力。一年前的记忆
和今天的记忆具有相同的检索权重。
对于偏好和可变事实，新信息通常应覆盖旧信息。

推荐修复：

## 添加时间评分
from datetime import datetime, timedelta

def time_decay_score(memory, half_life_days=30):
    age = (datetime.now() - memory.created_at).days
    decay = 0.5 ** (age / half_life_days)
    return decay

def retrieve_with_recency(query, user_id):
    # Get candidates
    candidates = index.query(
        vector=embed(query),
        filter={"user_id": user_id},
        top_k=20
    )

    # Apply time decay
    for candidate in candidates:
        time_score = time_decay_score(candidate)
        candidate.final_score = candidate.similarity * 0.7 + time_score * 0.3

    # Re-sort by final score
    return sorted(candidates, key=lambda x: x.final_score, reverse=True)[:5]

## 对偏好执行更新而不是追加
async def update_preference(user_id, category, value):
    # Delete old preference
    await memory.delete(
        filter={"user_id": user_id, "type": "preference", "category": category}
    )

    # Store new preference
    await memory.upsert(
        id=f"pref-{user_id}-{category}",
        content={"category": category, "value": value},
        metadata={"updated_at": datetime.now()}
    )

## 为事实显式建立版本
await memory.upsert(
    id=f"fact-{fact_id}-v{version}",
    content=new_fact,
    metadata={
        "version": version,
        "supersedes": previous_id,
        "valid_from": datetime.now()
    }
)

### 同时检索到相互矛盾的记忆

严重程度：中

场景：用户更改了偏好或提供了冲突信息

症状：
智能体在同一个上下文中检索到“用户偏好深色模式”
和“用户偏好浅色模式”。给出不一致的回答。
在用户看来显得困惑或健忘。

为什么这会出问题：
没有冲突解决机制时，新旧信息会并存。
语义搜索可能同时返回两者，因为它们都关于
同一个主题（偏好）。智能体无法知道哪一个是当前的。

推荐修复：

## 在存储时检测冲突
async def store_with_conflict_check(memory, user_id):
    # Find potentially conflicting memories
    similar = await index.query(
        vector=embed(memory.content),
        filter={"user_id": user_id, "type": memory.type},
        threshold=0.9,  # Very similar
        top_k=5
    )

    for existing in similar:
        if is_contradictory(memory.content, existing.content):
            # Ask for resolution
            resolution = await resolve_conflict(memory, existing)
            if resolution == "replace":
                await index.delete(existing.id)
            elif resolution == "version":
                await mark_superseded(existing.id, memory.id)

    await index.upsert(memory)

## 冲突检测启发式
def is_contradictory(new_content, old_content):
    # Use LLM to detect contradiction
    result = llm.invoke(f'''
        Do these two statements contradict each other?

        Statement 1: {old_content}
        Statement 2: {new_content}

        Respond with just YES or NO.
    ''')
    return result.strip().upper() == "YES"

## 定期合并
async def consolidate_memories(user_id):
    all_memories = await index.list(filter={"user_id": user_id})
    clusters = cluster_by_topic(all_memories)

    for cluster in clusters:
        if has_conflicts(cluster):
            resolved = await llm.invoke(f'''
                These memories may conflict. Create one consolidated
                memory that represents the current truth:
                {cluster}
            ''')
            await replace_cluster(cluster, resolved)

### 检索到的记忆超出上下文窗口

严重程度：中等

情况：一次检索过多记忆

症状：
Token 限制错误。Agent 截断重要信息。
系统提示词被截断。检索到的记忆与用户查询争夺空间。

原因：
检索通常返回 top-k 结果。如果 k 过高或分块过大，检索到的上下文就会淹没窗口。关键信息（系统提示词、最近消息）会被挤出。

推荐修复：

## 为不同记忆类型预算 token
TOKEN_BUDGET = {
    "system_prompt": 500,
    "user_profile": 200,
    "recent_messages": 2000,
    "retrieved_memories": 1000,
    "current_query": 500,
    "buffer": 300,  # Safety margin
}

def budget_aware_retrieval(query, context_limit=4000):
    remaining = context_limit - TOKEN_BUDGET["system_prompt"] - TOKEN_BUDGET["buffer"]

    # Prioritize recent messages
    recent = get_recent_messages(limit=TOKEN_BUDGET["recent_messages"])
    remaining -= count_tokens(recent)

    # Then user profile
    profile = get_user_profile(limit=TOKEN_BUDGET["user_profile"])
    remaining -= count_tokens(profile)

    # Finally retrieved memories with remaining budget
    memories = retrieve_memories(query, max_tokens=remaining)

    return build_context(profile, recent, memories)

## 基于分块大小动态设置 k
def retrieve_with_budget(query, max_tokens=1000):
    avg_chunk_tokens = 150  # From your data
    max_k = max_tokens // avg_chunk_tokens

    results = index.query(query, top_k=max_k)

    # Trim if still over budget
    total_tokens = 0
    filtered = []
    for result in results:
        tokens = count_tokens(result.text)
        if total_tokens + tokens <= max_tokens:
            filtered.append(result)
            total_tokens += tokens
        else:
            break

    return filtered

### 查询和文档嵌入来自不同模型

严重程度：中等

情况：升级嵌入模型或混用提供商

症状：
检索质量突然下降。找不到相关文档。
返回随机结果。新文档可用，旧文档失败。

原因：
嵌入模型会产生不同的向量空间。使用 text-embedding-3 嵌入的查询无法匹配使用 text-ada-002 嵌入的文档。混用模型会产生无效的相似度分数。

推荐修复：

## 在元数据中跟踪嵌入模型
await index.upsert(
    id=doc_id,
    vector=embedding,
    metadata={
        "embedding_model": "text-embedding-3-small",
        "embedding_version": "2024-01",
        "content": content
    }
)

## 检索时按模型版本过滤
results = index.query(
    vector=query_embedding,
    filter={"embedding_model": current_model},
    top_k=10
)

## 模型升级的迁移策略
async def migrate_embeddings(old_model, new_model):
    # Get all documents with old model
    old_docs = await index.list(filter={"embedding_model": old_model})

    for doc in old_docs:
        # Re-embed with new model
        new_embedding = await embed(doc.content, model=new_model)

        # Update in place
        await index.update(
            id=doc.id,
            vector=new_embedding,
            metadata={"embedding_model": new_model}
        )

## 迁移期间使用独立集合
# Old collection: production queries
# New collection: re-embedding in progress
# Switch over when complete

## 验证检查

### 生产代码中的内存存储

严重程度：错误

内存存储在重启后会丢失数据

消息：检测到内存存储。生产环境请使用持久化存储（Postgres、Qdrant、Pinecone）。

### 无元数据的向量 upsert

严重程度：警告

向量应带有用于过滤的元数据

消息：向量 upsert 缺少元数据。请添加 user_id、type、timestamp 以便正确过滤。

### 未按用户过滤的查询

严重程度：错误

查询应按用户过滤以防止数据泄露

消息：向量查询未按用户过滤。请始终按 user_id 过滤以防止数据泄露。

### 未经论证的硬编码分块大小

严重程度：信息

分块大小应经过测试和论证

消息：硬编码分块大小。请针对你的内容类型测试不同大小，并衡量检索准确率。

### 无重叠的分块

严重程度：警告

分块重叠可防止边界问题

消息：文本切分没有重叠。请添加 chunk_overlap（10-20%）以防止边界问题。

### 无过滤器的语义搜索

严重程度：警告

纯语义搜索常返回无关结果

消息：纯语义搜索。请添加元数据过滤器（user、type、time）以提升相关性。

### 无结果数量限制的检索

严重程度：警告

无上限检索可能导致上下文溢出

消息：检索没有限制。请设置 top_k 以防止上下文溢出。

### 未跟踪模型版本的嵌入

严重程度：警告

跟踪嵌入模型以处理迁移

消息：在元数据中存储嵌入模型版本，以处理模型迁移。

### 文档和查询使用不同嵌入模型

严重程度：错误

文档和查询必须使用相同嵌入模型

消息：确保索引和查询使用相同嵌入模型。

## 协作

### 委派触发条件

- 用户需要大规模向量数据库 -> data-engineer（生产向量存储运维）
- 用户需要嵌入模型优化 -> ml-engineer（自定义嵌入、微调）
- 用户需要知识图谱 -> knowledge-engineer（基于图的记忆结构）
- 用户需要 RAG 管道 -> llm-architect（端到端检索增强生成）
- 用户需要多智能体共享记忆 -> multi-agent-orchestration（智能体之间的记忆共享）

## 相关技能

与以下技能配合良好：`autonomous-agents`、`multi-agent-orchestration`、`llm-architect`、`agent-tool-builder`

## 何时使用
- 用户提到或暗示：智能体记忆
- 用户提到或暗示：长期记忆
- 用户提到或暗示：记忆系统
- 用户提到或暗示：跨会话记忆
- 用户提到或暗示：记忆检索
- 用户提到或暗示：情景记忆
- 用户提到或暗示：语义记忆
- 用户提到或暗示：向量存储
- 用户提到或暗示：rag
- 用户提到或暗示：langmem
- 用户提到或暗示：memgpt
- 用户提到或暗示：对话历史

## 局限性
- 仅当任务明确符合上述范围时才使用此技能。
- 不要将输出视为环境特定验证、测试或专家评审的替代品。
- 如果缺少所需输入、权限、安全边界或成功标准，请停下并请求澄清。
