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

记忆是智能体的基石。没有它，每次交互都从零开始。本技能讲解智能体记忆的架构：短期记忆（上下文窗口）、长期记忆（向量存储）以及用于组织它们的认知架构。

关键洞察：记忆不仅仅是存储，而是检索。即使有一百万条事实，如果找不到正确的一条，也没有任何价值。分块（chunking）、嵌入（embedding）与检索策略决定了你的智能体是在“记住”还是“遗忘”。

该领域术语不统一且各说各话。我们采用 CoALA 认知架构框架：语义记忆（semantic memory）、情景记忆（episodic memory）和程序性记忆（procedural memory）。

## 原则

- 记忆质量 = 检索质量，而非存储数量
- 以检索为目标进行分块，而非为存储而分块
- 上下文隔离是记忆的敌人
- 以合适的记忆类型承载合适信息
- 应衰减旧记忆——不是所有内容都应永久保留
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

### 记忆框架

- LangMem (LangChain) - 使用场景：带持久记忆的 LangGraph 智能体 说明：语义、情景、程序性记忆类型
- MemGPT / Letta - 使用场景：虚拟上下文管理、类操作系统记忆 说明：分层记忆层级、自动分页
- Mem0 - 使用场景：用于个性化的用户记忆层 说明：面向用户偏好和历史记录设计

### 向量数据库

- Pinecone - 使用场景：托管式企业级（十亿量级向量） 说明：查询性能最佳，成本最高
- Qdrant - 使用场景：复杂元数据过滤、开源 说明：基于 Rust，过滤能力优秀
- Weaviate - 使用场景：混合检索、知识图谱功能 说明：GraphQL 接口，适合关系建模
- ChromaDB - 使用场景：原型开发、中小型应用 说明：开发者友好，10 万向量下约 20ms p50
- pgvector - 使用场景：已有 PostgreSQL 环境、更简单的部署 说明：适合低于 100 万向量，工具链熟悉

### 嵌入模型

- OpenAI text-embedding-3-large - 使用场景：最高质量，3072 维 说明：$0.13/1M tokens
- OpenAI text-embedding-3-small - 使用场景：质量/成本平衡，1536 维 说明：$0.02/1M tokens，便宜 5 倍
- nomic-embed-text-v1.5 - 使用场景：开源、本地部署 说明：768 维，质量良好
- all-MiniLM-L6-v2 - 使用场景：轻量、快速本地嵌入 说明：384 维，最低延迟

## 模式

### 记忆类型架构

为不同信息选择合适的记忆类型

**使用场景**：设计智能体记忆系统

# MEMORY TYPE ARCHITECTURE (CoALA Framework):

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

### 向量存储选型模式

为你的使用场景选择合适的向量数据库

**使用场景**：建立持久化记忆存储

# VECTOR STORE SELECTION:

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

### 分块策略模式

将文档拆分为可检索的块

**使用场景**：为记忆存储处理文档

# 切分策略

"""
The chunking dilemma:
- Too large: Vector loses specificity
- Too small: Loses context

Optimal chunk size depends on:
- Document type (code vs prose vs data)
- Query patterns (factual vs exploratory)
- Embedding model (each has sweet spot)

General guidance: 256-512 tokens for most use cases
"""

# 切分策略:

"""
分块困境：
- 过大：向量会失去针对性
- 过小：会丢失上下文

最佳分块大小取决于：
- 文档类型（代码 vs 说明文 vs 数据）
- 查询模式（事实型 vs 探索型）
- 嵌入模型（每种模型都有最佳范围）

一般建议：大多数场景使用 256–512 token
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

## 代码专项分块
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

### 记忆形成的背景机制

异步处理记忆以获得更高质量

**使用时机**：在不降低交互速度的前提下提升召回率

# BACKGROUND MEMORY FORMATION:

"""
Real-time memory extraction slows conversations and adds
complexity to agent tool calls. Background processing after
conversations yields higher quality memories.

Pattern: Subconscious memory formation
"""

# 实时记忆提取会降低对话速度，并增加
# 智能体工具调用的复杂度。对话结束后的
# 后台处理可以产出更高质量的记忆。

模式：潜意识记忆形成

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

## 记忆整合（如同睡眠）
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

忘记过时或无关的记忆

**使用时机**：记忆规模膨胀，检索变慢

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

# 并非所有记忆都应永久保留：
- 旧偏好可能已过时
- 任务细节会失去时效性
- 冲突的记忆会干扰检索

根据以下因素实现智能衰减：
- 时效性（何时创建/访问）
- 频率（被检索频次）
- 重要性（是核心事实还是细节）
 
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

## 鲜明问题

### 分块会将信息与上下文分离

严重程度：关键

场景：为向量存储处理文档

症状：
检索到的分块单独看不通。智能体回答缺乏全局图景。
检索到“该函数返回 X”却不知道是哪个函数。引用“this”时也不知道“this”指代什么。

为什么会这样：
当我们为 AI 处理而分块时，会切断上下文连接，
将完整叙事拆成孤立片段，结果往往
缺失整体语境。一个关于“该配置”的分块在缺少
正在配置哪个系统的上下文时几乎没有价值。

建议修复：

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

## 分层切分
# 存储多个粒度
chunks_small = split(doc, size=256)
chunks_medium = split(doc, size=512)
chunks_large = split(doc, size=1024)

# 根据查询选择合适粒度进行检索

### 查询模式与块大小不匹配

Severity: 高

Situation: 配置用于记忆存储的分块策略

Symptoms:
高质量文档却产生低质量检索。简单问题会遗漏相关信息。
复杂问题会得到碎片而非完整答案。

Why this breaks:
最优块大小取决于查询模式：
- 事实型查询需要小而具体的块
- 概念型查询需要更大的上下文
- 代码需要按函数级边界切分

最佳范围因文档类型和嵌入模型而异。
默认的 1000 字符适用于任何场景的说法并不成立。

Recommended fix:

## 测试不同块大小
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

# 测试多个大小
for size in [256, 512, 768, 1024]:
    recall = evaluate_chunk_size(docs, test_queries, size)
    print(f"Size {size}: Recall@5 = {recall:.2%}")

## 按内容类型给出建议大小
CHUNK_SIZES = {
    "documentation": 512,   # Complete concepts
    "code": 1000,          # Function-level
    "conversation": 256,   # Turn-level
    "articles": 768,       # Paragraph-level
}

## 使用重叠避免边界问题
splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=50,  # 10% overlap
)

### 语义检索返回不相关结果

Severity: 高

Situation: 为上下文检索记忆

Symptoms:
Agent 检索到看似相关但并不有用的记忆。
“告诉我用户偏好”返回的是关于“偏好”的一般对话，而不是该用户的内容。
错误内容可能获得很高的相似度分数。

Why this breaks:
语义相似并不等同于相关性。“用户喜欢 Python”和“Python 是一种编程语言”在语义上相似，
但属于完全不同类型的信息。
若不进行元数据过滤，检索就会退化为关键词匹配。

Recommended fix:

## 始终先按元数据过滤
# 不要仅依赖语义相似度

# 错误示例：仅语义检索
results = index.query(
    vector=query_embedding,
    top_k=5
)

# 正确示例：先过滤再检索
results = index.query(
    vector=query_embedding,
    filter={
        "user_id": current_user.id,
        "type": "preference",
        "created_after": cutoff_date,
    },
    top_k=5
)

## 使用混合检索（语义 + 关键词）
from qdrant_client import QdrantClient

client = QdrantClient(...)

# 使用融合的混合检索
results = client.search(
    collection_name="memories",
    query_vector=semantic_embedding,
    query_text=query,  # 同时做关键词匹配
    fusion={"method": "rrf"},  # Reciprocal Rank Fusion
)

## 使用 cross-encoder 重排结果
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

# 初始检索（强调召回）
candidates = index.query(query_embedding, top_k=20)

# 重排（强调精度）
pairs = [(query, c.text) for c in candidates]
scores = reranker.predict(pairs)
reranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)

### 旧记忆覆盖当前信息

Severity: 高

Situation: 用户偏好或事实会随时间变化

Symptoms:
Agent 使用过时的偏好信息。来自 6 个月前的“用户偏好深色模式”会覆盖
最近“切换到浅色模式”的请求。Agent 会自信地使用陈旧数据。

Why this breaks:
向量存储默认没有时间意识。一年前的记忆与今天的记忆具有同等检索权重。
对于偏好和可变事实，较新的信息通常应覆盖旧信息。

Recommended fix:

## 添加时间衰减评分
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

    # 应用时间衰减
    for candidate in candidates:
        time_score = time_decay_score(candidate)
        candidate.final_score = candidate.similarity * 0.7 + time_score * 0.3

    # 按最终得分重排
    return sorted(candidates, key=lambda x: x.final_score, reverse=True)[:5]

## 以更新替代追加偏好
async def update_preference(user_id, category, value):
    # 删除旧偏好
    await memory.delete(
        filter={"user_id": user_id, "type": "preference", "category": category}
    )

    # 存储新偏好
    await memory.upsert(
        id=f"pref-{user_id}-{category}",
        content={"category": category, "value": value},
        metadata={"updated_at": datetime.now()}
    )

## 为事实记录显式版本
await memory.upsert(
    id=f"fact-{fact_id}-v{version}",
    content=new_fact,
    metadata={
        "version": version,
        "supersedes": previous_id,
        "valid_from": datetime.now()
    }
)

### 检索到相互矛盾的记忆

Severity: 中

Situation: 用户变更了偏好或提供了冲突信息

Symptoms:
Agent 在同一上下文中同时检索到“用户偏好深色模式”和“用户偏好浅色模式”。
给出的回答前后不一致，表现得困惑或健忘。

Why this breaks:
若没有冲突解决，旧信息和新信息会并存。
语义检索可能同时返回两者，因为它们都围绕同一主题（偏好）。Agent 无法判断哪一个是最新的。

Recommended fix:

## 在入库时检测冲突
async def store_with_conflict_check(memory, user_id):
    # 查找潜在冲突记忆
    similar = await index.query(
        vector=embed(memory.content),
        filter={"user_id": user_id, "type": memory.type},
        threshold=0.9,  # Very similar
        top_k=5
    )

    for existing in similar:
        if is_contradictory(memory.content, existing.content):
            # 请求解决冲突
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

已收到。先按新会话流程确认：  
请先告诉我本次要启用的 skill / plugin 组（或直接选“仅默认不加载插件”）。  
确认后我再按你的要求开始逐句中文翻译。
