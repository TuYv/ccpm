---
name: wiki-retrieve
description: "Hybrid retrieval primitive for the Compound Vault. Replaces the v1.6 static hot→index→drill read order with contextual-prefix + BM25 + cosine-rerank, modeled on Anthropic's Sept 2024 Contextual Retrieval research (35-49-67% retrieval-failure reduction). Opt-in via `bash bin/setup-retrieve.sh`; feature-detected by wiki-query and autoresearch. Triggers on: retrieve, hybrid retrieval, BM25, rerank, contextual retrieval, search the chunks, chunk search, vault search, semantic search, what chunks match, find relevant passages."
allowed-tools: Read Bash
---
# wiki-retrieve：对知识库进行混合检索

v1.6 的查询路径是 `Read(hot.md) → Read(index.md) → Read(3-5 pages) → synthesize`。它可以正常工作，但只要答案位于某个特定段落而不是整篇页面中，页面级粒度就会逊于分块级粒度。v1.7 的 `wiki-retrieve` skill 是分块级升级——可选择启用、受功能门控控制；如果你不运行设置流程，它不会替换任何内容。

**来源**：此 skill 是 claude-obsidian 的原创功能。kepano 上游没有对应实现。该技术源自 [Anthropic 2024 年 9 月的上下文检索研究](https://www.anthropic.com/news/contextual-retrieval)——我们将其实现为 agent-skill 基础设施。

---

## 数据隐私（v1.7.1+）

上下文前缀生成器的第 1 层级（Anthropic API）和第 2 层级（claude CLI 子进程）会将 **wiki 页面正文发送到本机之外**。自 v1.7.1 起，这两个层级均由两层明确的用户同意机制进行门控：

- `scripts/contextual-prefix.py --allow-egress`（默认关闭）。如果没有该标志，无论是否存在 `ANTHROPIC_API_KEY` 或 `claude` 二进制文件，`pick_prefix_tier()` 都会返回 `"synthetic"`。
- `bin/setup-retrieve.sh` 会在运行任何非合成的第 1 阶段之前提示用户；默认操作是中止。

若要完全在本机上运行（第 3 层级合成前缀 + 本地 ollama 重排序），请使用 `bash bin/setup-retrieve.sh --no-llm`。如果你拒绝同意提示或省略 `--allow-egress`，实际行为也与此相同。

此防护机制与 `scripts/tiling-check.py:351` 中的 `--allow-remote-ollama` 一致。从未配置此 skill 的 v1.6 知识库不会出现任何行为变化。

---

## 架构

```
INGEST (one-time, then incremental):

  wiki/<page>.md
       │
       ▼
  scripts/contextual-prefix.py
       │   ├─ chunk on paragraph boundaries (~500 token target, 200 char overlap)
       │   ├─ generate 1-2 sentence prefix per chunk
       │   │     tier 1: ANTHROPIC_API_KEY → Anthropic API (Haiku, prompt-cached
       │   │                                 when body ≥ ~16 KB / Haiku 4.5 floor)
       │   │     tier 2: `claude` on PATH  → claude -p subprocess
       │   │     tier 3: synthetic         → frontmatter title + first paragraph
       │   └─ write .vault-meta/chunks/<address>/chunk-NNN.json
       │
       ▼
  scripts/bm25-index.py build
       └─ inverted index over chunks' contextualized_text → .vault-meta/bm25/index.json

QUERY:

  query string
       │
       ▼
  scripts/retrieve.py "<query>" --top 5
       ├─ bm25-index.py query "<query>" --top 20    (sparse candidate set)
       ├─ rerank.py "<query>" --candidates -        (dense rerank via ollama cosine)
       │     cosine(query_embedding, chunk_embedding)
       │     embeddings cached in .vault-meta/embed-cache.json keyed by body_hash
       └─ dedupe by page-address, return top-N candidates with absolute_path
       │
       ▼
  caller (wiki-query / autoresearch) reads the cited pages and synthesizes
```

---

## 功能门控

其他 skill 在使用此 skill 之前必须先检测它。标准检测方式如下：

```bash
[ -x scripts/retrieve.py ] && [ -d .vault-meta/chunks ] && \
  [ -f .vault-meta/bm25/index.json ] && \
  echo "wiki-retrieve installed" || echo "fallback: legacy hot→index→drill"
```

如果检测失败，调用方必须回退到 v1.6 的读取顺序。此技能绝不会破坏基础插件。

---

## 设置

```bash
bash bin/setup-retrieve.sh
```

该脚本会按顺序执行以下操作：
1. 完整性检查：确认 4 个脚本均存在且可执行。
2. 创建 `.vault-meta/chunks/` 和 `.vault-meta/bm25/`。
3. 探测位于 `http://127.0.0.1:11434` 的 ollama 中是否存在 `nomic-embed-text`（重排序的前置条件）。报告状态，但不执行安装。
4. 报告将使用哪个上下文前缀层级（Anthropic API / claude CLI / 合成）。
5. 运行 `contextual-prefix.py --all`，对每个 wiki 页面进行分块并添加上下文。
6. 运行 `bm25-index.py build`。
7. 使用查询 "wiki" 对 `retrieve.py` 进行冒烟测试。

参数：
- `--check` — 仅执行诊断，不进行配置。
- `--no-llm` — 强制使用第 3 层合成前缀（成本最低，零 LLM 依赖）。
- `--rebuild` — 即使 body_hash 匹配，也重新对每个页面进行分块。

---

## 成本上限

根据 Anthropic 发布的研究，使用 Haiku 和提示缓存生成上下文前缀的成本约为**每 1,000 份文档 12 美元**。对于包含 100 个页面、每页约 3 个分块的知识库，一次性成本约为 3.60 美元，增量更新的成本则低得多（仅重新处理发生变化的页面）。

如果你想在大型知识库上运行之前验证成本：

```bash
bash bin/setup-retrieve.sh --no-llm   # provision with tier-3 synthetic prefix
# inspect retrieval quality manually; if insufficient, re-run without --no-llm
```

`claude-cli` 子进程层级（无需 API 密钥）不产生费用，但速度较慢（每个分块约 3-10 秒，具体取决于 Haiku 的可用性）。

---

## 技能命令（操作步骤）

当通过功能检测发现 wiki-retrieve 时，wiki-query 和 autoresearch 将执行以下命令。其他技能应遵循此模式。

### 标准检索
```bash
python3 scripts/retrieve.py "your question here" --top 5
```
输出：包含 `candidates` 数组的 JSON。每个候选项都包含指向源页面的 `absolute_path`；调用方读取该页面（使用 v1.7 传输选择器）并进行综合。

### 仅使用 BM25（跳过重排序）
```bash
python3 scripts/retrieve.py "query" --top 5 --no-rerank
```
速度更快（无需调用 ollama），但质量较低。

### 解释模式（调试）
```bash
python3 scripts/retrieve.py "query" --top 5 --explain
```
添加一个 `explain` 块，其中包含各阶段的诊断信息（BM25 候选项数量、去重后的大小等）。

### 直接检查 BM25
```bash
python3 scripts/bm25-index.py query "query" --top 10
python3 scripts/bm25-index.py stats
```

### 重排序策略探测
```bash
python3 scripts/rerank.py "query" --peek
```
报告将运行哪种策略（通过 ollama 计算余弦相似度 / 不执行任何操作）。

---

## 与 wiki-query 集成

安装此技能后，`skills/wiki-query/SKILL.md` 的标准模式和深度模式将：

1. 读取 `wiki/hot.md`（始终执行——用于快速获取上下文）。
2. 调用 `python3 scripts/retrieve.py "<query>" --top 5`。
3. 从结果的 `absolute_path` 字段读取候选页面（使用 v1.7 传输选择器——`obsidian-cli read` 或 `Read` 工具）。
4. 进行综合并提供分块级引用。

快速模式保持不变（仅使用 hot.md——绝不会调用检索）。

如果 `retrieve.py` 以代码 10 退出（功能尚未配置），`wiki-query` 将回退到旧版 v1.6 的 `Read(index.md) → Read(N pages)` 顺序。不会出现用户可见的中断。

---

## 索引维护

当 wiki 页面发生变化时，索引不会自动刷新。请在完成实质性的摄取会话后重新运行：

```bash
python3 scripts/contextual-prefix.py --all      # incremental: only re-processes changed pages
python3 scripts/bm25-index.py build             # always full rebuild (cheap; pure Python)
```

未来的 v1.7.x 补丁将添加一个可选启用的 PostToolUse 钩子，在每写入 N 次后触发 contextual-prefix + BM25 重建。对于 v1.7.0，需要手动刷新。

要清除并从头开始：

```bash
rm -rf .vault-meta/chunks/ .vault-meta/bm25/ .vault-meta/embed-cache.json
bash bin/setup-retrieve.sh
```

---

## 未来层级（v1.7.x 路线图）

为保持透明而记录；尚未在 v1.7.0 中实现：

| 阶段 | v1.7.0 | v1.7.x 目标 |
|---|---|---|
| 上下文前缀 | API / claude-cli / synthetic | + 基于 Voyage 嵌入的伪前缀 |
| 稀疏检索 | BM25 | + SPLADE 学习型稀疏检索 |
| 稠密检索 | （无——仅重排） | 与 BM25 融合的独立向量候选集（真正的混合检索） |
| 重排 | nomic 余弦相似度 / 无操作 | + sentence-transformers BGE-base、Cohere Rerank、Voyage Rerank |
| 多保险库 | （单保险库） | 通过 wiki-federate 实现联邦（待办事项 #15） |

---

## 交叉引用

- 传输方式决策树：[`wiki/references/transport-fallback.md`](../../wiki/references/transport-fallback.md)
- 并发策略：[`skills/wiki-ingest/SKILL.md`](../wiki-ingest/SKILL.md) §并发
- DragonScale Memory：[`wiki/concepts/DragonScale Memory.md`](../../wiki/concepts/DragonScale%20Memory.md)
- Anthropic 上下文检索研究：https://www.anthropic.com/news/contextual-retrieval

---

## 如何思考（10 原则映射）

处理此技能时，请应用 10 原则循环。规范框架请参阅 [`skills/think/SKILL.md`](../think/SKILL.md)。

| # | 原则 | 在此处的应用 |
|---|-----------|-------------------|
| 1 | 观察（外部） | 在发出查询之前，读取 BM25 索引状态和嵌入缓存状态。过期缓存会产生错误答案。 |
| 2 | 观察（内部） | 我是否在缓存本应因近期摄取而失效时仍然信任它？对照最近一次摄取检查 mtime。 |
| 3 | 倾听 | 用户的查询实际上在问什么？在匹配之前，将其分解为意图和术语。 |
| 4 | 思考 | 哪种检索策略适合此查询？仅 BM25 / BM25 + 重排 / 上下文前缀 + BM25 + 重排。 |
| 5 | 连接（横向） | 这种混合方式与 v1.6 基线相比如何？top-1 提升 32 个百分点 / 错误减少 41%，这是已发布的差值。 |
| 6 | 连接（系统） | Anthropic API 使用 `--allow-egress` 同意门控；ollama 仅在本地运行；重排缓存在 `.vault-meta/` 下。 |
| 7 | 感受 | 尚未配置时，以代码 10 退出，并显示友好的“请先运行 `bash bin/setup-retrieve.sh`”消息——而不是堆栈跟踪。 |
| 8 | 接受 | 当检索返回空结果时，如实说明。不要编造。不要用低置信度猜测来填充内容。 |
| 9 | 创造 | 生成带有 `--explain` 可追溯信息的候选项排名列表，涵盖每个分数组成部分。 |
| 10 | 成长 | 持续失败的查询 → wiki 中的内容缺口。将这些缺口作为 autoresearch 输入进行跟踪。 |