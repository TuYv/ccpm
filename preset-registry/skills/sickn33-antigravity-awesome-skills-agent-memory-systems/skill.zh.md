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

记忆是智能体的基石。没有它，每次交互都从零开始。本技能涵盖了智能体记忆的架构：短期（上下文窗口）、长期（向量存储）以及组织它们的认知架构。

核心洞见：记忆不仅是存储——更是检索。一百万条存储的事实，如果你找不到正确的那一条，就毫无意义。分块、嵌入与检索策略决定了你的智能体是记住还是遗忘。

该领域术语分散且不一致。我们使用 CoALA 认知架构框架：语义记忆（facts）、情景记忆（experiences）和程序性记忆（how-to knowledge）。

## 原则

- 记忆质量 = 检索质量，而非存储数量
- 为检索而分块，而非为存储而分块
- 上下文隔离是记忆的敌人
- 用正确的记忆类型处理正确的信息
- 遗忘旧记忆——并非所有内容都应永远保留
- 上线前先测试检索准确率
- 后台记忆形成优于实时形成

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

### Memory_frameworks

- LangMem (LangChain) - 适用：具有持久内存的 LangGraph 智能体 说明：语义、情景、程序性记忆类型
- MemGPT / Letta - 适用：虚拟上下文管理、OS 风格内存 说明：分层记忆层级、自动分页
- Mem0 - 适用：个性化用户记忆层 说明：面向用户偏好和历史记录设计

### Vector_stores

- Pinecone - 适用：托管的企业级规模（数十亿向量） 说明：最佳查询性能、成本最高
- Qdrant - 适用：复杂元数据过滤、开源 说明：基于 Rust、出色的过滤能力
- Weaviate - 适用：混合检索、知识图谱特性 说明：GraphQL 接口，适合关系型应用
- ChromaDB - 适用：原型开发、中小型应用 说明：开发者友好，100K 向量下约 20ms p50
- pgvector - 适用：已在使用 PostgreSQL，设置更简单 说明：适合 <1M 向量，工具链熟悉

### Embedding_models

- OpenAI text-embedding-3-large - 适用：最高质量，3072 维 说明：$0.13/1M tokens
- OpenAI text-embedding-3-small - 适用：性能平衡，1536 维 说明：$0.02/1M tokens，便宜 5 倍
- nomic-embed-text-v1.5 - 适用：开源、本地部署 说明：768 维，质量良好
- all-MiniLM-L6-v2 - 适用：轻量级、快速本地嵌入 说明：384 维，延迟最低

## 模式

### Memory Type Architecture

为不同信息选择正确的记忆类型

**适用时机**：设计智能体记忆系统

# 记忆类型架构（CoALA 框架）：

"""
Three memory types for different purposes:

1. Semantic Memory: Facts and knowledge
   - What you know about the world
   - User preferences, domain knowledge
   - Stored in profiles (structured) or collections (unstructured)

2. Episodic Memory: Experiences and events
   - What happened (timestamped events)
   - Past conversations, task outcomes
   - Used for learning from experience

3. Procedural Memory: How to do things
   - Rules, skills, workflows
   - Often implemented as few-shot examples
   - "How did I solve this before?"
"""

## LangMem Implementation
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

## Memory Retrieval at Runtime
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

### 向量数据库选择模式

为你的使用场景选择正确的向量数据库

**适用时机**：搭建持久化记忆存储

# 向量数据库选择：

"""
Decision matrix:

|            | Pinecone | Qdrant | Weaviate | ChromaDB | pgvector |
|------------|----------|--------|----------|----------|----------|
| Scale      | Billions | 100M+  | 100M+    | 1M       | 1M       |
| Managed    | Yes      | Both   | Both     | Self     | Self     |
| Filtering  | Basic    | Best   | Good     | Basic    | SQL      |
| Hybrid     | No       | Yes    | Best     | No       | Yes      |
| Cost       | High     | Medium | Medium   | Free     | Free     |
| Latency    | 5ms      | 7ms    | 10ms     | 20ms     | 15ms     |
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

### Chunking Strategy Pattern

将文档拆分为可检索的分块

**适用时机**：处理用于记忆存储的文档

# 分块策略:

"""
分块困境：
- 过大：向量缺乏特异性
- 过小：失去上下文

最佳分块大小取决于：
- 文档类型（代码 vs 叙述文本 vs 数据）
- 查询模式（事实型 vs 探索型）
- 嵌入模型（每种模型都有最佳区间）

一般建议：大多数场景为 256–512 个 token
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

## 语义分块（更高质量）
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

## 结构感知分块（具有层级的文档）
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

## 情境化分块（Anthropic 的方法）
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

## 代码专用分块
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

### 后台记忆构建

以异步方式处理记忆以提升质量

**使用场景**：你希望提高召回率且不降低交互速度

# BACKGROUND MEMORY FORMATION:

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

## 记忆巩固（如同睡眠）
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

忘记旧的、无关的记忆

**使用场景**：记忆规模变大，检索变慢

# MEMORY DECAY:

"""
Not all memories should live forever:
- Old preferences may be outdated
- Task details lose relevance
- Conflicting memories confuse retrieval

Implement intelligent decay based on:
- Recency (when was it created/accessed?)
- Frequency (how often is it retrieved?)
- Importance (is it a core fact or detail?)
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

## 风险点

### 分块会将信息与上下文隔离

严重性：CRITICAL

场景：正在处理用于向量存储的文档

症状：
检索找到分块但单独看不通。智能体
回答时错过整体图景。检索到 “The function returns X”
却不知道它属于哪个函数。出现“this”这样的引用
却不知道“this”指代什么。

为什么会出问题：
当我们为了 AI 处理而分块时，会打断连接，
把完整叙事拆成孤立片段，而这些片段常常
缺失整体图景。一个关于“配置”的分块，
若缺少正在被配置系统的上下文，几乎毫无作用。

建议修复：

### 情境化分块（Anthropic 的方法）
# Add document context to each chunk before embedding
# Reduces retrieval failures by 35%

def contextualize_chunk(chunk, document):
    summary = summarize(document)

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

## 分层切块
# 在多个粒度下存储
chunks_small = split(doc, size=256)
chunks_medium = split(doc, size=512)
chunks_large = split(doc, size=1024)

# 根据查询在适当粒度检索

### 切块大小与查询模式不匹配

Severity: HIGH

Situation: 为记忆存储配置切块

Symptoms:
高质量文档却产生低质量检索。简单问题会遗漏相关信息。复杂问题则得到
片段而非完整答案。

Why this breaks:
最优切块大小取决于查询模式：
- 事实类查询需要小而具体的切块
- 概念类查询需要更大的上下文
- 代码需要按函数级边界切分

最佳切块大小因文档类型和 embedding 模型而异。
默认的1000字符并未针对任何特定场景优化。

Recommended fix:

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

## 按内容类型推荐大小
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

### 语义搜索返回不相关结果

Severity: HIGH

Situation: 检索上下文记忆

Symptoms:
Agent 检索到看似相关但并不有用的记忆。
“Tell me about the user's preferences” 返回的是关于偏好的一般对话，而不是该用户的偏好。
错误内容却有很高的相似度得分。

Why this breaks:
语义相似性并不等于相关性。 “The user
likes Python” 与 “Python is a programming language” 在语义上相似，
但信息类型截然不同。
没有元数据过滤时，检索仅仅是关键词匹配。

Recommended fix:

## 先按元数据过滤
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

## 用 cross-encoder 重排结果
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

# Initial retrieval (recall-oriented)
candidates = index.query(query_embedding, top_k=20)

# Rerank (precision-oriented)
pairs = [(query, c.text) for c in candidates]
scores = reranker.predict(pairs)
reranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)

### 旧记忆覆盖当前信息

Severity: HIGH

Situation: 用户偏好或事实会随时间变化

Symptoms:
Agent 使用了过时的偏好。
6个月前的“用户偏好深色模式”会覆盖最近的“切换到浅色模式”请求。
Agent 仍自信地使用过期数据。

Why this breaks:
向量存储默认没有时间感知。来自一年前的记忆与来自今天的记忆有同样的检索权重。
对偏好和可变事实，近期信息通常应优先覆盖旧信息。

Recommended fix:

## 添加时间衰减
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

## 偏好使用更新而非追加
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

## 明确版本化事实
await memory.upsert(
    id=f"fact-{fact_id}-v{version}",
    content=new_fact,
    metadata={
        "version": version,
        "supersedes": previous_id,
        "valid_from": datetime.now()
    }
)

### 冲突记忆被一起检索

Severity: MEDIUM

Situation: 用户已更改偏好或提供了矛盾信息

Symptoms:
Agent 会在同一上下文中检索到“用户偏好深色模式”和“用户偏好浅色模式”。
回答前后不一致，给人以困惑或健忘的感觉。

Why this breaks:
没有冲突解决机制，旧信息和新信息会同时存在。
语义搜索可能同时返回两者，因为它们都围绕同一主题（偏好）。
Agent 无法判断哪一个是当前信息。

Recommended fix:

## 入库时检测冲突
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

### 检索记忆超过上下文窗口

严重性: 中等

情况: 一次检索到太多记忆

症状:
令牌上限错误。代理会截断重要信息。
系统提示被截断。检索到的记忆与
用户查询争夺空间。

为什么会出现问题:
检索通常返回 top-k 结果。如果 k 太高或
块太大，检索上下文会压倒窗口。
关键内容（系统提示、最近消息）被挤出。

推荐修复:

## 为不同记忆类型预算令牌
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

## 根据块大小动态确定 k
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

### 查询与文档嵌入使用不同模型

严重性: 中等

情况: 升级嵌入模型或混合不同服务商

症状:
检索质量突然下降。未找到相关文档。
返回随机结果。新文档有效，旧文档失效。

为什么会出现问题:
嵌入模型会产生不同的向量空间。用 text-embedding-3
计算的查询向量与用 text-ada-002 计算的文档向量不匹配。
模型混用会导致相似度评分异常。

推荐修复:

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

### 验证检查

### 生产代码中的内存存储

严重性: 错误

生产中重启会丢失内存存储数据

消息: 检测到内存存储。生产环境请使用持久化存储（Postgres、Qdrant、Pinecone）。

### 不带元数据的向量 Upsert

严重性: 警告

向量应带有元数据以便过滤

消息: 向量 Upsert 时未带元数据。添加 user_id、type、timestamp 以便正确过滤。

### 未按用户过滤的查询

严重性: 错误

查询应按用户过滤以防止数据泄露

消息: 向量查询未按用户过滤。始终按 user_id 过滤以防止数据泄露。

### 未经验证的硬编码块大小

严重性: 信息

块大小应经过测试并有依据

消息: 检测到硬编码块大小。请针对你的内容类型测试不同大小并测量检索准确率。

### 无重叠的分块

严重性: 警告

重叠块可避免边界问题

消息: 文本切分未设置重叠。请添加 chunk_overlap（10-20%）以避免边界问题。

### 不带过滤条件的语义搜索

严重性: 警告

纯语义搜索常返回无关结果

消息: 纯语义搜索。添加元数据过滤（user、type、time）以提升相关性。

### 无结果数量限制的检索

严重性: 警告

未受限的检索可能导致上下文溢出

消息: 检索未设置上限。请设置 top_k 以防上下文溢出。

### 未跟踪模型版本的嵌入

严重性: 警告

跟踪嵌入模型以处理迁移

消息: 请在元数据中存储嵌入模型版本，以便处理模型迁移。

### 文档与查询使用不同模型的嵌入

严重性: 错误

文档和查询必须使用同一嵌入模型

消息: 确保索引与查询使用同一嵌入模型。

## 协作

### 委派触发条件

- 用户需要规模化的向量数据库 -> data-engineer（生产向量存储运维）
- 用户需要嵌入模型优化 -> ml-engineer（自定义嵌入、微调）
- 用户需要知识图谱 -> knowledge-engineer（基于图的记忆结构）
- 用户需要 RAG 流水线 -> llm-architect（端到端检索增强生成）
- 用户需要多代理共享记忆 -> multi-agent-orchestration（代理间记忆共享）

## 相关技能

表现良好: `autonomous-agents`, `multi-agent-orchestration`, `llm-architect`, `agent-tool-builder`

## 何时使用
- 用户提到或暗示: agent memory
- 用户提到或暗示: long-term memory
- 用户提到或暗示: memory systems
- 用户提到或暗示: remember across sessions
- 用户提到或暗示: memory retrieval
- 用户提到或暗示: episodic memory
- 用户提到或暗示: semantic memory
- 用户提到或暗示: vector store
- 用户提到或暗示: rag
- 用户提到或暗示: langmem
- 用户提到或暗示: memgpt
- 用户提到或暗示: conversation history

## 限制
- 仅在任务明确符合上述范围时使用此技能。
- 不将输出替代特定环境的验证、测试或专家评审。
- 如所需输入、权限、安全边界或成功标准缺失，请停止并要求澄清。
